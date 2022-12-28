var imdb_id = null;

try {
    imdb_id = window.location.href.match(/tt(\d{7})/)[1];
}
catch (exception) { /* console.log('EXCEPTION: ' + exception); */ }

if (imdb_id) {

    var title_name = document.evaluate(
        '//*[@id="overview-top"]/h1/span[1]',
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    title_name = title_name.iterateNext().textContent;

    var port = chrome.extension.connect();

    port.postMessage({message: 'get_torrents', title_name: title_name});

    port.onMessage.addListener(function (message) {

        if (message.torrents) {

            var piratebay_box = document.createElement('div');
            piratebay_box.setAttribute('id', 'piratebay_box');
            piratebay_box.setAttribute('style', 'width:400px;word-wrap:break-word;border-width:1px 0px 0px 0px;border-style:solid;border-color:#e8e8e8;padding:15px 0px 0px 0px;background: url(\'' + chrome.extension.getURL('piratebay_imdb.png') + '\') no-repeat right bottom;');

            var overview_top = document.getElementById('overview-top');
            for (var i = 0; i < overview_top.children.length; i++) {
                if (overview_top.children[i].getAttribute('class') &&
                    overview_top.children[i].getAttribute('class') === 'star-box giga-star') {
                    overview_top.insertBefore(piratebay_box, overview_top.children[i]);
                }
            }

            var torrents = message.torrents;

            for (var i = 0; i < torrents.length; i++) {
                append_torrent(piratebay_box, torrents[i], true);
                port.postMessage({message: 'get_torrent_filelist', tpb_id: torrents[i].id});
            }

            piratebay_box.appendChild(document.createElement('br'));
        }

        if (message.filelist) {
            check_for_subtitles(message.filelist, message.tpb_id);
        }
    });
}