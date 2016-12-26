var CONTEXTMENUS_ID = "debugjson";
var EXTENSION_NAME = "debugjson";
var PARAMETERS = ["debug=xxx", "format=debugjson"];

chrome.runtime.onInstalled.addListener(function() {
    //add debugjons to contextMenus
    chrome.contextMenus.create({
        id: CONTEXTMENUS_ID,
        title: "debugjson",
        contexts: ["page"]
    });
});

function getParameters(callback) {
    chrome.storage.local.get("parameters", function(obj) {
        var parameters = obj.parameters || [];
        callback(parameters);
    });
}
//debug json in current window
function debugThisWindow(tab) {
    getParameters(function(parameters) {
        chrome.tabs.update(tab.id, {
            url: urlUtils.getDebugUrl(tab.url, parameters)
        });
    });
}

//debug json in new window
function debugNewWindow(tab) {
    getParameters(function(parameters) {
        chrome.tabs.create({
            index: tab.index + 1,
            url: urlUtils.getDebugUrl(tab.url, parameters),
            active: true
        });
    });
}

var urlUtils = {
    getDebugUrl: function(url, parameters) {
        if (this.isHasAllParameters(url, parameters)) {
            return this.removeUrlParameters(url, parameters);
        } else {
            return this.addUrlParameters(url, parameters);
        }
    },
    isHasAllParameters: function(url, parameters) {
        return parameters.every(function(parameter) {
            return url.indexOf(parameter) !== -1;
        });
    },
    addUrlParameters: function(url, parameters) {
        var me = this;
        return parameters.reduce(function(preUrl, parameter, index, arr) {
            return me.addUrlParameter(preUrl, parameter);
        }, url);
    },
    addUrlParameter: function(url, parameter) {
        //handle case https://www.baidu.com/ to https://www.baidu.com
        url = url.replace(/^https?:\/\/(?:\w+\.)?\w+\.\w+(\/)$/g, function(match, $1, offset, url) {
            return url.slice(0, url.length - 1);
        });
        // is has parameter
        if (new RegExp(/\?[^#]*/.source + parameter, "g").test(url)) {
            return url;
        }

        //add "?" before "#"
        if (url.indexOf("?") === -1) {
            var poundIndex = url.indexOf("#");
            if (poundIndex === -1) {
                url += "?";
            } else {
                url = url.split("")
                url.splice(poundIndex, 0, "?");
                url = url.join("");
            }
        }

        // add parameter
        return url.replace(/\?([^#]*)(#?)/g, function(match, $1, $2, offset, url) {
            if ($1 === "") {
                return "?" + $1 + parameter + $2;
            } else {
                return "?" + $1 + "&" + parameter + $2;
            }
        });
    },
    removeUrlParameters: function(url, parameters) {
        var me = this;
        url = parameters.reduce(function(preUrl, parameter) {
            return me.removeUrlParameter(preUrl, parameter);
        }, url);
        if (/\?([^#]*)/g.exec(url)[1] === "") {
            return url.replace("?", "");
        } else {
            return url;
        }
    },
    removeUrlParameter: function(url, parameter) {
        var regExp = new RegExp("&?" + parameter, "g");
        return url.replace(regExp, "");
    }
}


function openDebugPage(tab) {
    var url = tab.url;
    var parameters = PARAMETERS;
    if (Object.prototype.toString.call(url) !== "[object String]") {
        throw "URL must be a string";
    }

    chrome.tabs.create({
        url: addURLParamters(url, parameters),
        index: tab.index + 1,
        active: true
    });
}

//add parameters
function addURLParamters(url, parameters) {
    if (url.indexOf("?") === -1) {
        url += "?";
        url += parameters.join("&");
    } else {
        url += "&" + parameters.join("&");
    }
    return url;
}


//add listener when debujoson clicked in contextMenus
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    debugNewWindow(tab);
});

//add listener to debugjson shortcuts
chrome.commands.onCommand.addListener(function(command) {
    var callback = function() {}
        //judge type
    if (command === "thisdebug") {
        callback = debugThisWindow;
    } else if (command === "newdebug") {
        callback = debugNewWindow;
    } else {
        return;
    }

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        if (tabs[0]) {
            callback(tabs[0]);
        }
    });
});
