var csfd_id = null;

try {
    csfd_id = window.location.href.match(/film\/(\d+?)\-/)[1];
}
catch (exception) { /* console.log('EXCEPTION: ' + exception); */ }

if (csfd_id) {

    var title_name = document.evaluate(
        '//ul[@class="names"]/li[1]/h3',
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );
    title_name = title_name.iterateNext().textContent;

    var port = chrome.extension.connect();

    port.postMessage({message: 'get_torrents', title_name: title_name});

    var piratebay_box = document.createElement('div');
    piratebay_box.setAttribute('id', 'piratebay_box');
    piratebay_box.setAttribute('style', 'padding:10px 0px 0px 0px;background: url(\'' + chrome.extension.getURL('piratebay_csfd.png') + '\') no-repeat right bottom;');

    var origin = document.getElementsByClassName('origin')[0];
    origin.appendChild(piratebay_box);

    port.onMessage.addListener(function (message) {

        if (message.torrents) {

            var torrents = message.torrents;
            var piratebay_box = document.getElementById('piratebay_box');

            for (var i = 0; i < torrents.length; i++) {
                append_torrent(piratebay_box, torrents[i], false);
                port.postMessage({message: 'get_torrent_filelist', tpb_id: torrents[i].id});
            }
        }

        if (message.filelist) {
            check_for_subtitles(message.filelist, message.tpb_id);
        }
    });
}