chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (message) {

        console.log('MESSAGE RECIEVED: ' + message);
        console.log(message);
        console.log('----------------------------');

        if (message.message == 'get_torrent') {
            torrents_search(message.title_name, function (torrents) {
                var torrent = null;
                if (torrents.length > 0)
                    torrent = torrents[0];
                port.postMessage({torrent: torrent, id: message.id});
            });
        }

        if (message.message == 'get_torrents') {
            torrents_search(message.title_name, function (torrents) {
                port.postMessage({torrents: torrents});
            });
        }

        if (message.message == 'get_torrent_filelist') {
            torrent_filelist(message.tpb_id, function (filelist) {
                port.postMessage({filelist: filelist, tpb_id: message.tpb_id});
            });
        }

        if (message.message == 'synopsi_title_identify') {
            synopsi_title_identify(message.title_name, message.title_type, function (data) {
                var title = data.relevant_results[0];

                for (var i = 0; i < data.relevant_results.length; i++) {
                    if (message.title_name.toLowerCase() == data.relevant_results[i].name.toLowerCase()) {
                        title = data.relevant_results[i];
                        break;
                    }
                }

                port.postMessage({title: title, tpb_id: message.tpb_id});
            });
        }

        return true;
    });
});