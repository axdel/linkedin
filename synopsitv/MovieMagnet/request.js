var HTTP_METHOD = {GET: 'GET', POST: 'POST'};
var RESPONSE_TYPE = {STRING: '', DOCUMENT: 'document'}

var http_request = function (method, url, async, response_type, success, error) {

    var xhr = new XMLHttpRequest();

    xhr.responseType = response_type;

    xhr.onreadystatechange = function () {

        if (xhr.readyState != 4) { return; }

        if (xhr.status != 200) {
            error(xhr);
        } else {
            success(xhr);
        }
    };

    switch (method) {
        case HTTP_METHOD.GET:
            xhr.open(HTTP_METHOD.GET, url, async);
        break;

        case HTTP_METHOD.POST:
            xhr.open(HTTP_METHOD.POST, url, async);
        break;
    }

    xhr.setRequestHeader('Accept', 'text/plain');
    xhr.setRequestHeader('Accept-Language', 'en-EN');

    xhr.send();
};