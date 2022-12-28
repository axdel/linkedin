var synopsi_title_identify = function (title_name, title_type, callback) {

    var title_properties = ['id', 'url', 'name', 'plot', 'trailer', 'cover_medium'];

    var api_call = 'https://api.synopsi.tv/1.0/title/identify/?file_name=' + title_name + '&title_property[]=' + title_properties.join(',');

    if (title_type.match(/movie/)) api_call += '&type=movie';

    http_request(
        HTTP_METHOD.GET, api_call, true, RESPONSE_TYPE.STRING,
        function (response) {
            callback(JSON.parse(response.responseText));
        },
        function (response) {
            console.log(response);
        }
    );
};