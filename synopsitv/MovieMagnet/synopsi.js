var custom_style = document.createElement('style');
custom_style.innerHTML = '' +
'.tpb_recco {display:block; height:60px; background:url(\'' + chrome.extension.getURL('piratebay_lists.png') + '\') no-repeat -2px 0px; background-color:#fff; border:1px solid #ddd; border-radius:5px; margin:-1px 0 0 2px; position:relative;}' +
'.tpb_recco table {width:100%; height:100%;}' +
'.tpb_recco td {font-size:15px; text-align:center; vertical-align:middle;}' +
'.ribbon_big {z-index: 100; position: relative; width: 180px; background: rgba(0,0,0,0.75); color: #fff; font-size: 12px; font-weight: bold; text-align: left; left: 5px; top: 5px; -webkit-backface-visibility: hidden;}' +
'.ribbon_small {position: relative; top: -25px; margin-bottom: -25px; width: 90px; height: 22px; background: rgba(0,0,0,0.75); color: #fff; font-size: 12px; font-weight: bold; text-align: center; padding-top: 3px; z-index: 100;}' +
'.ribbon_small a {color: #fff !important;}';

var head = document.getElementsByTagName('head')[0];
head.appendChild(custom_style);

var render_torrent_item = function (torrent) {

    var html = '';

    html += '<li><div class="coverlistitem">' +
            '<div class="covercard">' +
            '<p class="front coverimg">' +
            '<span class="altcover"><span>' + torrent.clean_name + '</span></span>' +
            '<img id="cover_' + torrent.id + '" width="180" height="267" src="" />' +
            '<div class="ribbon_big"><div style="padding:10px;">' + torrent.clean_name + '</div></div>' +
            '</p>' +
            '<div class="back overlaybig">' +
            '<table><tbody>' +
            '<tr><td>' +
            '<h2><a href="' + torrent.magnet + '">' + torrent.clean_name + '</a></h2>' +
            '<br />detail on: ' +
            '<a href="' + torrent.link + '" target="_blank">piratebay</a>&nbsp;' +
            '<a id="url_' + torrent.id + '"></a>' +
            '<br /><span id="has_subtitles_' + torrent.id + '">(no subtitles)</span>' +
            '</td></tr>' +
            '<tr><td>' +
            '<strong>Size:</strong> ' + torrent.size + '<br />' +
            '<strong>Seeders:</strong> ' + torrent.seeders + '<br />' +
            '<strong>Leechers:</strong> ' + torrent.leechers + '<br />' +
            '</td></tr>' +
            '<tr><td><p style="width:230px; word-wrap:break-word;">' + torrent.name + '<p></td></tr>' +
            '</tbody></table>' +
            '</div>' +
            '</div>' +
            '<p class="coverinfo">' + torrent.size + '</p>' +
            '</div></li>';

    return html;
};

var render_tpb_recco = function () {

    var html = '';

    html += '<h3 class="tpb_recco">' +
            '<table><tr>' +
            '<td style="border-right:1px solid #ddd; border-bottom:1px solid #ddd;">' +
            '<a style="text-align:right; padding-right:13px;" href="#" onclick="window.location.assign(\'/recco/movies/#tpb-movies\'); if (window.location.href.match(/\\\/movies\\\//)) window.location.reload(true); return false;">Movies</a>' +
            '</td><td style="border-bottom:1px solid #ddd;">' +
            '<a href="#" onclick="window.location.assign(\'/recco/movies/#tpb-movies-hd\'); if (window.location.href.match(/\\\/movies\\\//)) window.location.reload(true); return false;">HD</a>' +
            '</td>' +
            '</tr><tr>' +
            '<td style="border-right:1px solid #ddd;">' +
            '<a style="text-align:right; padding-right:13px;" href="#" onclick="window.location.assign(\'/recco/movies/#tpb-tvshows\'); if (window.location.href.match(/\\\/movies\\\//)) window.location.reload(true); return false;">TV Shows</a>' +
            '</td><td>' +
            '<a href="#" onclick="window.location.assign(\'/recco/movies/#tpb-tvshows-hd\'); if (window.location.href.match(/\\\/movies\\\//)) window.location.reload(true); return false;">HD</a>' +
            '</td>' +
            '</tr></table>' +
            '</h3></a>';

    return html;
};

var title_name = null;
var title_type = null;

// movie
if (window.location.href.match(/movies\/(\d+)\/(.+?)\-?(\d*)\/$/)) {

    var url_parts = window.location.href.match(/movies\/(\d+)\/(.+?)\-?(\d*)\/$/);

    title_name = document.evaluate(
        '//*[@id="content"]/div[1]/h1/span[1]',
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    title_name = title_name.iterateNext().textContent + ' ' + url_parts[3];
    title_type = 'movie';
}

// tv-show
if (window.location.href.match(/tv-shows\/(\d+)\/(.+?)\/$/)) {

     title_name = document.evaluate(
        '//*[@id="content"]/div[1]/h1/span[1]',
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    title_name = title_name.iterateNext().textContent;
    title_type = 'tv-show';
}

// episode
if (window.location.href.match(/tv\-shows\/(\d+)\/(.+?)\/s(\d+)\/e(\d+)\-.+$/)) {

    var url_parts = window.location.href.match(/tv\-shows\/(\d+)\/(.+?)\/s(\d+)\/e(\d+)\-.+$/);
    var season_number = (parseInt(url_parts[3]) < 10) ? '0' + url_parts[3] : url_parts[3];
    var episode_number = (parseInt(url_parts[4]) < 10) ? '0' + url_parts[4] : url_parts[4];

    title_name = document.evaluate(
        '//*[@id="content"]/div[1]/ul/li[3]/a/span/span[1]',
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    title_name = title_name.iterateNext().textContent + ' s' + season_number + 'e' + episode_number;
    title_type = 'episode';
}

if (title_name) {

    var port = chrome.extension.connect();

    port.postMessage({message: 'get_torrents', title_name: title_name});

    port.onMessage.addListener(function (message) {

        if (message.torrents) {

            var piratebay_box = document.createElement('div');
            piratebay_box.setAttribute('id', 'piratebay_box');
            piratebay_box.setAttribute('class', 'box');
            piratebay_box.setAttribute('style', 'background:url(\'' + chrome.extension.getURL('piratebay_synopsi.png') + '\') no-repeat right top; padding-top:0px; padding-bottom:0px;');

            var box = document.getElementsByClassName('titleinfo')[0].parentElement;
            box.parentElement.insertBefore(piratebay_box, box.nextElementSibling.nextElementSibling);

            var torrents = message.torrents;
            var piratebay_box = document.getElementById('piratebay_box');

            for (var i = 0; i < torrents.length; i++) {
                append_torrent(piratebay_box, torrents[i], false);
                port.postMessage({message: 'get_torrent_filelist', tpb_id: torrents[i].id});
            }

            piratebay_box.appendChild(document.createElement('br'));
        }

        if (message.filelist) {
            check_for_subtitles(message.filelist, message.tpb_id);
        }
    });
}

// title pages
if (window.location.href.match(/\/recco\//)) {

    var lists = document.getElementsByClassName('lists')[0];

    var tpb_recco = document.createElement('li');
    tpb_recco.setAttribute('style', 'padding:0px !important');
    tpb_recco.innerHTML = render_tpb_recco();

    lists.appendChild(tpb_recco);
}

// tvshow tracking
if (window.location.href.match(/\/recco\/tv\-shows\//) &&
    window.location.hash == '') {

    var episodereco = document.evaluate(
        '//section[@id="content"]/div[1]/ul/li/a',
        document, null, XPathResult.ANY_TYPE, null
    )

    var episodes_lineup = document.evaluate(
        '//ul[@id="episodes_lineup"]/li/a',
        document, null, XPathResult.ANY_TYPE, null
    )

    var episodes = [];
    while (episode = episodereco.iterateNext())
        episodes.push(episode);

    while (episode = episodes_lineup.iterateNext())
        episodes.push(episode);

    for (var i = 0; i < episodes.length; i++) {

        var tvshow = episodes[i].children[1].textContent;
        var sxxexx = episodes[i].children[2].textContent;

        var tvshow_id = (tvshow.replace(' ', '_') + '_' + sxxexx).toLowerCase();

        var small_ribbon = document.createElement('div');

        small_ribbon.setAttribute('id', tvshow_id);
        small_ribbon.setAttribute('class', 'ribbon_small');
        small_ribbon.setAttribute('style', 'display:none;');
        episodes[i].firstElementChild.appendChild(small_ribbon);

        var port = chrome.extension.connect();
        port.postMessage({message: 'get_torrent', title_name: tvshow + ' ' + sxxexx, id: tvshow_id});

        port.onMessage.addListener(function (message) {
            if (message.torrent) {

                var torrent = message.torrent;
                var tvshow_id = message.id;

                var small_ribbon = document.getElementById(tvshow_id);
                small_ribbon.innerHTML = '<a href="' + torrent.magnet + '">magnet</a>';
                small_ribbon.setAttribute('style', 'display:block;');
            }
        });
    }
}

// movies/tvshows recco
if (window.location.href.match(/\/recco\/(movies|tv\-shows)\//) &&
    window.location.hash.match(/tpb/)) {

    custom_style = document.createElement('style');
    custom_style.innerHTML = '' +
    '#content .coverlist .overlaybig {' +
    'position: absolute; background: #ddd; overflow: hidden; margin: -77px -43px;' +
    'opacity: 0; filter: alpha(opacity=20); border-radius: 5px; z-index: 5; display: none;}';

    var head = document.getElementsByTagName('head')[0];
    head.appendChild(custom_style);

    var tpb_type = window.location.hash.replace('#', '');

    var loadmore = document.getElementsByClassName('loadmore')[1];
    loadmore.parentElement.removeChild(loadmore);
    delete loadmore;

    var page_title = document.getElementsByClassName('box coveredtitle')[0];
    page_title.children[0].textContent = 'The Pirate Bay ';

    var port = chrome.extension.connect();

    switch (tpb_type) {
        case 'tpb-movies':
            page_title.children[0].textContent += 'Movies';
            port.postMessage({message: 'get_torrents', title_name: tpb_type});
        break;

        case 'tpb-movies-hd':
            page_title.children[0].textContent += 'Movies HD';
            port.postMessage({message: 'get_torrents', title_name: tpb_type});
        break;

        case 'tpb-tvshows':
            page_title.children[0].textContent += 'TV Shows';
            port.postMessage({message: 'get_torrents', title_name: tpb_type});
        break;

        case 'tpb-tvshows-hd':
            page_title.children[0].textContent += 'TV Shows HD';
            port.postMessage({message: 'get_torrents', title_name: tpb_type});
        break;
    }

    var recommendations = document.getElementById('recommendations');
    recommendations.removeChild(recommendations.children[0]);

    var coverlist = document.createElement('ul');
    coverlist.setAttribute('id', 'coverlist');
    coverlist.setAttribute('class', 'coverlist loopbox');
    recommendations.appendChild(coverlist);

    port.onMessage.addListener(function (message) {

        if (message.torrents) {

            var torrents = message.torrents;
            var coverlist = document.getElementById('coverlist');

            for (var i = 0; i < torrents.length; i++) {
                coverlist.innerHTML += render_torrent_item(torrents[i]);
                port.postMessage({message: 'get_torrent_filelist', tpb_id: torrents[i].id});
                port.postMessage({message: 'synopsi_title_identify', title_name: torrents[i].name, title_type: torrents[i].type, tpb_id: torrents[i].id});
            }
        }

        if (message.filelist) {
            check_for_subtitles(message.filelist, message.tpb_id);
        }

        if (message.title) {

            var title = message.title;

            var cover = document.getElementById('cover_' + message.tpb_id);
            var url = document.getElementById('url_' + message.tpb_id);

            if (!title.cover_medium.match(/gif/)) {

                cover.setAttribute('src', title.cover_medium);

                url.setAttribute('href', 'http://www.synopsi.tv' + title.url);
                url.innerHTML = 'synopsi.tv';
            }
        }
    });
}