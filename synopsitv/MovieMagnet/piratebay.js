var torrents_search = function (query, callback) {

    var torrents_count = 30;

    var url = 'http://thepiratebay.org/browse/201/0/7/0';

    switch (query) {
        case 'tpb-movies':
            url = 'http://thepiratebay.org/browse/201/0/7/0';
        break;

        case 'tpb-movies-hd':
            url = 'http://thepiratebay.org/browse/207/0/7/0';
        break;

        case 'tpb-tvshows':
            url = 'http://thepiratebay.org/browse/205/0/7/0';
        break;

        case 'tpb-tvshows-hd':
            url = 'http://thepiratebay.org/browse/208/0/7/0';
        break;

        default:
            torrents_count = 5;

            query = query.replace(/[^a-zA-Z0-9\s\.\-]/g, '');
            query = query.replace(/^The\s/i, '');

            url = 'http://thepiratebay.org/search/' + encodeURI(query) + '/0/7/200';
        break;
    }

    console.log('LOOKING FOR TORRENTS: ' + query);

    http_request(
        HTTP_METHOD.GET, url, true, RESPONSE_TYPE.DOCUMENT,
        function (response) {

            var piratebay = response.responseXML;

            console.log('RESPONSE XML (DEBUG):');
            console.log(piratebay);

            if (!piratebay || piratebay.getElementById('main-content')
                .textContent.replace(/\s/g, '').length == 0) {
                console.log('SEARCH RESULT LENGTH = 0');
                return;
            }

            var torrents = [];
            for (var i = 0; i < torrents_count; i++) {
                try {
                    torrents[i] = {
                        id: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[2]/div/a[1]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().getAttribute('href').match(/\/torrent\/(\d+)?\//)[1],
                        name: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[2]/div/a[1]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().textContent,
                        type: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[1]/center/a[2]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().textContent.replace(/\s+/g, '').toLowerCase(),
                        link: 'http://thepiratebay.org' + piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[2]/div/a[1]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().getAttribute('href'),
                        magnet: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[2]/a[1]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().getAttribute('href'),
                        size: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[2]/font[1]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().textContent.match(/Size\s(.+?)\,/)[1],
                        seeders: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[3]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().textContent,
                        leechers: piratebay.evaluate(
                            '//*[@id="searchResult"]/tbody/tr[' + (i+1) + ']/td[4]',
                            piratebay,
                            null,
                            XPathResult.ANY_TYPE,
                            null
                        ).iterateNext().textContent,
                    };

                    var clean_name = torrents[i].name;

                    // roman numerals
                    clean_name = clean_name.replace(/\sII\s/g, ' 2 ');
                    clean_name = clean_name.replace(/\sIII\s/g, ' 3 ');

                    // 480/720/1080p
                    clean_name = clean_name.replace(/\s\d{3,4}p/, '');

                    try {
                        clean_name = clean_name.match(/^(.*?).\d{4}/)[1]; // year
                    } catch (exception) {}
                    try {
                        clean_name = clean_name.match(/^(.*?)[^a-z][A-Z]{2,}/)[1]; // TS, CAM
                    } catch (exception) {}
                    try {
                        clean_name = clean_name.match(/^(.*?)\sR\d/)[1]; // Rn
                    } catch (exception) {}

                    // episodes
                    try {
                        var sxxexx = clean_name.match(/^.*?(S\d{2,}E\d{2,})/)[1];
                        try {
                            clean_name = clean_name.match(/^(.*?).S\d{2,}/)[1];
                        } catch (exception) {}
                        clean_name = clean_name + ' ' + sxxexx;
                    } catch (exception) {}

                    clean_name = clean_name.replace(/([a-z])(\.)(\w)/g, '$1 $3');
                    torrents[i].clean_name = clean_name;

                } catch (exception) { break; }
            }

            console.log('TORRENTS:');
            console.log(torrents);

            callback(torrents);
        },
        function (response) {
            return;
        }
    );
};

var torrent_filelist = function (tpb_id, callback) {

    http_request(
        HTTP_METHOD.GET,
        'http://thepiratebay.ac/ajax_details_filelist.php?id=' + tpb_id, false,
        RESPONSE_TYPE.STRING,
        function (response) {

            var filelist = response.responseText;
            filelist = filelist.match(/<tr><td align="left">(.*?)<\/td>/g);

            callback(filelist);
        },
        function (response) {
            return;
        }
    );
};