var jinni_id = null;

try {
    jinni_id = window.location.href.match(/\/(movies|tv)\/(.*?)\//)[2];
}
catch (exception) { /* console.log('EXCEPTION: ' + exception); */ }

if (jinni_id) {

    var title_name = document.evaluate(
        '//h1[@id="contentTitle_heading"]/span[1]',
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
            piratebay_box.setAttribute('style', 'padding-left:12px; padding-top:5px; background:url(\'' + chrome.extension.getURL('piratebay_jinni.png') + '\') no-repeat right bottom; font-size:13px; clear:both;');

            var raiting = document.getElementById('raiting');
            raiting.appendChild(piratebay_box);

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