var append_torrent = function (piratebay_box, torrent, short_names) {

    var tpb_link = document.createElement('a');
    tpb_link.innerHTML = '[&raquo;]';
    tpb_link.setAttribute('href', torrent.link);
    tpb_link.setAttribute('target', '_blank');
    tpb_link.setAttribute('title', 'Show on ThePirateBay');

    var separator = document.createElement('span');
    separator.textContent = ' ';

    var magnet_link = document.createElement('a');
    magnet_link.setAttribute('href', torrent.magnet);
    magnet_link.setAttribute('title', 'Size: ' + torrent.size + ', Seeders: ' + torrent.seeders + ', Leechers: ' + torrent.leechers);
    magnet_link.setAttribute('data-title', 'Size: ' + torrent.size + ', Seeders: ' + torrent.seeders + ', Leechers: ' + torrent.leechers);

    var torrent_name = torrent.name;
    if (short_names && torrent_name.length > 40) { // IMDb
        torrent_name = torrent_name.substring(0, 40) + '...';
        magnet_link.setAttribute('title', magnet_link.getAttribute('title') + ', Torrent: ' + torrent.name);
    }
    magnet_link.textContent = torrent_name;

    piratebay_box.appendChild(tpb_link);
    piratebay_box.appendChild(separator);
    piratebay_box.appendChild(magnet_link);

    var has_subtitles = document.createElement('span');
    has_subtitles.setAttribute('id', 'has_subtitles_' + torrent.id);
    has_subtitles.setAttribute('style', 'display:none;');

    piratebay_box.appendChild(has_subtitles);
    piratebay_box.appendChild(document.createElement('br'));

};

var check_for_subtitles = function (filelist, tpb_id) {

    var has_subtitles = document.getElementById('has_subtitles_' + tpb_id);
    has_subtitles.setAttribute('style', 'color:#aaaaaa; display:inline;');

    for (var i = 0; i < filelist.length; i++) {
        try {
            var subtitles_type = filelist[i].match(/\.(srt|sub)/)[1];
            has_subtitles.textContent = ' (' + subtitles_type + ')';
        }
        catch (exception) { /* console.log('EXCEPTION: ' + exception); */ }
    }
};