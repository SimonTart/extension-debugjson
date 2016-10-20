function(url) {
    this.url = url;
    this.query = getQueryParams;
}

function getQueryParams(url) {
    var querys = {};
    if (/?/g.test(url)) {
        url.split("?")[1].split("&").forEach(function(query) {
            var querySplit = query.split("=");
            querys[querySplit[0]] = querySplit[1];
        });
    } else {
        return undefined;
    }
}

function getHash(url) {
    if (/#/g.test(url)) {
        return url.split("#");
    } else {
        return undefined;
    }
}

function getProtocol(url) {

}