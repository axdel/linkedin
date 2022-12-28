var letterboxd_id = null;

try {
    letterboxd_id = window.location.href.match(/\/film\/(.*?)\//)[1];
}
catch (exception) { /* console.log('EXCEPTION: ' + exception); */ }

if (letterboxd_id) {

    var title_name = document.evaluate(
        '//h1[@class="film-title prettify"]',
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
            piratebay_box.setAttribute('style', 'padding:15px 0px; background:url(\'' + chrome.extension.getURL('piratebay_letterboxd.png') + '\') no-repeat right bottom; font-size:13px;');

            var featured_film_header = document.getElementById('featured-film-header');
            featured_film_header.setAttribute('style', 'margin:-3px 0 15px !important;');
            featured_film_header.appendChild(piratebay_box);

            var torrents = message.torrents;

            for (var i = 0; i < torrents.length; i++) {
                append_torrent(piratebay_box, torrents[i]);
                port.postMessage({message: 'get_torrent_filelist', tpb_id: torrents[i].id});
            }
        }

        if (message.filelist) {
            check_for_subtitles(message.filelist, message.tpb_id);
        }
    });
}