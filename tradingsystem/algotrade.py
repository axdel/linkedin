from common.slack import slack_message
from common.utils import get_logger, sleep, first, Weekday

from market.services import markettz_add, markettz_open
from stock.services import StockOptionService
from trading.plays import OptionsPlays
from trading.services import TradeService, PositionNotFilled, PositionPartiallyFilled
from trading.strategies.base import BaseStrategy, StrategyError
from trading.utils import nearest_trading_weekday

logger = get_logger(__name__)

MAIN_POSITION = 'main'
MAIN_POSITION_CLOSE = 'main_close'

SCALP_PERCENT = 25

STAGE_INIT = 0
STAGE_INITIAL_MOVEMENT = 1
STAGE_TREND_SWITCH = 2
STAGE_PRICE_ACTION = 3
STAGE_OPEN_POSITION = 4
STAGE_SCALP = 5
STAGE_END = 6


class IMTSStrategy(BaseStrategy):

    #
    # data = {"initial_movement_percent": 1, "min_price_action_percent": 0.2}
    #

    def stages_runtimes(self, rundate):
        return [
            # stage_0: market open -10m
            markettz_add(markettz_open(rundate), minutes=-10),
            # stage_1: market open +5s
            markettz_add(markettz_open(rundate), seconds=5),
            # stage_2: now
            None,
            # stage_3: now
            None,
            # stage_4: now
            None,
            # stage_5: now
            None
        ]

    def stage_0(self, trade):  # STAGE_INIT
        '''
        '''
        next_friday = nearest_trading_weekday(Weekday.FRIDAY, nearest=2)
        trade.stock = StockOptionService.update_options(trade.stock)
        if trade.stock.options_expiration_dates[1] != next_friday:
            raise StrategyError(f'{next_friday} expiration date is not available')
        trade.data['expiration_date'] = trade.stock.options_expiration_dates[1]
        return trade, STAGE_INITIAL_MOVEMENT

    def stage_1(self, trade):  # STAGE_INITIAL_MOVEMENT
        '''
        '''
        while self.market_is_not_closing_in_minutes(60):
            if self.movement_reached(trade, trade.data['initial_movement_percent']):
                return trade, STAGE_TREND_SWITCH
            logger.info('---')
            sleep(3)
        return trade, STAGE_END

    def stage_2(self, trade):  # STAGE_TREND_SWITCH
        '''
        '''
        while self.market_is_not_closing_in_minutes(60):
            if self.trend_switched(trade):
                return trade, STAGE_PRICE_ACTION
            logger.info('---')
            sleep(3)

    def stage_3(self, trade):  # STAGE_PRICE_ACTION
        '''
        '''
        while self.market_is_not_closing_in_minutes(60):
            if self.movement_reached(trade, trade.data['min_price_action_percent'], in_trend_direction=True):
                return trade, STAGE_OPEN_POSITION
            logger.info('---')
            sleep(3)
        return trade, STAGE_END

    def stage_4(self, trade):  # STAGE_OPEN_POSITION
        '''
        '''
        computed_position = first(OptionsPlays.compute_positions(
            trade.stock,
            trade.data['expiration_date'],
            trade.budget,
            open_price=True
        )[trade.data['trend_direction']])
        try:
            TradeService.open_position(trade, computed_position, MAIN_POSITION, wait_until_filled=30)
            TradeService.close_position(trade, MAIN_POSITION, MAIN_POSITION_CLOSE, scalp_percent=SCALP_PERCENT)
            return trade, STAGE_SCALP
        except PositionPartiallyFilled:
            pass
        except PositionNotFilled:
            return trade, STAGE_END

    def stage_5(self, trade):  # STAGE_SCALP
        '''
        '''
        while self.market_is_not_closing_in_minutes(15):
            if self.position_filled(trade, MAIN_POSITION_CLOSE):
                return trade, STAGE_END
            # TODO: STOP-LOSS !!!
            logger.info('---')
            sleep(10)
        slack_message(f'{trade} - CLOSE THIS SHIT?!, P/L: ${trade.pnl}')
        return trade, STAGE_END

    # TODO: STAGE_CLOSE close if in any profit?

    def stage_6(self, trade):  # STAGE_END
        logger.info('%s: End', self.stage_log)
        return trade, None