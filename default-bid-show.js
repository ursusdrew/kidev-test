(function (currentWindow) {
    var window;
    try {
        window = setWindow()
    } catch (e) {
        window = currentWindow.parent
    }
    var document = window.document;
    var FE = window.FEPublisher || (window.FEPublisher = {}), ns = FE.pubfiles || (FE.pubfiles = {}), LIB = {};
    var $, util, tests = {};
    var BUILD_DATETIME = "20160428141543";
    var SCRIPT_ID = "439798/default";
    ns.loaded || (ns.loaded = {});
    (function () {
        util = LIB.Util = {};
        util.extend = function (dst) {
            dst = dst || {};
            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];
                if (!obj) {
                    continue
                }
                for (var key in obj) {
                    if (typeof obj[key] == "object") {
                        util.extend(dst[key], obj[key])
                    } else {
                        dst[key] = obj[key]
                    }
                }
            }
            return dst
        };
        util.getURLParams = function () {
            var params = {};
            try {
                var s = window.location.search.substring(1);
                var a = s.split("&");
                for (var i = 0; i < a.length; i++) {
                    if (!a[i]) {
                        continue
                    }
                    var b = a[i].split("=");
                    params[b[0]] = b[1] ? decodeURIComponent(b[1]) : ""
                }
            } catch (e) {
            }
            return params
        };
        util.getScriptParams = function (re, sep) {
            if (!sep) {
                sep = "&"
            }
            var scripts = currentWindow.document.getElementsByTagName("script");
            var matches;
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].getAttribute("data-fe-processed") == "true")continue;
                if (!(matches = scripts[i].src.match(re)))continue;
                scripts[i].setAttribute("data-fe-processed", "true");
                var params = {};
                var str;
                if (matches.length == 3) {
                    sep = matches[1];
                    str = matches[2]
                } else {
                    str = matches[1]
                }
                var a = str.split(sep);
                for (var j = 0; j < a.length; j++) {
                    if (a[j] == "")continue;
                    var b = a[j].split("=");
                    params[b[0]] = b[1] ? decodeURIComponent(b[1]) : ""
                }
                return params
            }
            return null
        };
        util.jsonp = function (params) {
            var callbackName = "fe_jsonp_" + util.random(), win = params.window || window, el;
            var url = params.url;
            url += (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + callbackName;
            if (params.data) {
                for (var key in params.data) {
                    var p = params.data[key], type = Object.prototype.toString.call(p);
                    switch (type) {
                        case"[object Array]":
                            for (var i = 0; i < p.length; i++) {
                                url += "&" + key + "=" + encodeURIComponent(p[i])
                            }
                            break;
                        case"[object Object]":
                            var prefix = !params.flatten ? key + "." : "";
                            for (var k in p) {
                                url += "&" + prefix + k + "=" + encodeURIComponent(p[k])
                            }
                            break;
                        case"[object Boolean]":
                            url += "&" + key + "=" + p.toString();
                            break;
                        default:
                            url += "&" + key + "=" + encodeURIComponent(p)
                    }
                }
            }
            win[callbackName] = function (json) {
                if (el) {
                    el.parentNode.removeChild(el)
                }
                delete win[callbackName];
                if (params.callback) {
                    params.callback(json)
                }
            };
            el = util.loadJS(url, win.document, params.async)
        };
        util.loadJS = function (url, doc, async) {
            if (!doc) {
                doc = document
            }
            if (!async && doc.readyState == "loading") {
                doc.write("<scr" + 'ipt src="' + url + '"></scr' + "ipt>")
            } else {
                var el = doc.createElement("script");
                el.setAttribute("type", "text/javascript");
                el.setAttribute("src", url);
                var hd = doc.getElementsByTagName("head")[0];
                if (hd) {
                    hd.appendChild(el);
                    return el
                }
            }
        };
        util.runJS = function (code, window) {
            if (window.document.readyState == "loading") {
                window.document.write(code)
            } else {
                var re = /^\s*<script[^>]+src\s*=\s*("|')(.+)\1[^>]*>/i;
                var matches = code.match(re);
                if (matches) {
                    util.loadJS(matches[2], window.document, true)
                } else {
                    eval(code.replace(/^\s*<script[^>]*>|<\/script>\s*$/gi, ""))
                }
            }
        };
        util.loadCSS = function (url, doc) {
            if (!doc) {
                doc = document
            }
            var el = doc.createElement("link");
            el.setAttribute("type", "text/css");
            el.setAttribute("rel", "stylesheet");
            el.setAttribute("href", url);
            var hd = doc.getElementsByTagName("head")[0];
            if (hd) {
                hd.appendChild(el)
            }
        };
        util.getFrameDoc = function (el, doc) {
            if (!doc) {
                doc = document
            }
            if (typeof el == "string") {
                el = doc.getElementById(el)
            }
            try {
                if (el) {
                    if (el.contentDocument) {
                        return el.contentDocument
                    } else if (el.contentWindow) {
                        return el.contentWindow.document
                    } else {
                        return el.document
                    }
                }
            } catch (e) {
            }
            return null
        };
        util.getPageKeywords = function (prefix) {
            if (prefix == undefined) {
                prefix = "meta-"
            }
            var keywords = [];
            var metas = document.getElementsByTagName("meta");
            for (var i = 0; i < metas.length; i++) {
                if (metas[i].name && metas[i].name.toLowerCase() == "keywords") {
                    if (metas[i].content) {
                        var kws = metas[i].content.split(",");
                        for (var j = 0; j < kws.length; j++) {
                            var kw = kws[j].toLowerCase().replace(/[^a-z0-9]/g, "");
                            if (kw.length > 1) {
                                keywords.push(prefix + kw)
                            }
                        }
                    }
                }
            }
            return keywords
        };
        util.getURLPathKeywords = function (depth) {
            var keywords = [];
            var path = window.location.pathname.split("/"), keyword = "url", i = 1, d = 0;
            while (d < depth && i < path.length) {
                keyword += "-" + path[i];
                keywords.push(keyword);
                i++;
                d++
            }
            return keywords
        };
        util.ensureBooleans = function (obj, keys) {
            var key;
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if (typeof obj[key] != "undefined") {
                    obj[key] = String(obj[key]).toLowerCase() == "true" ? true : false
                }
            }
        };
        util.ensureIntegers = function (obj, keys) {
            var key;
            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                if (typeof obj[key] != "undefined") {
                    obj[key] = parseInt(obj[key])
                }
            }
        };
        util.random = function () {
            return Math.floor(Math.random() * 1e17)
        };
        util.extendCSV = function (csv, value) {
            if (!csv) {
                csv = ""
            }
            return csv + (csv.length ? "," : "") + value
        };
        util.setCookie = function (name, value, expires, path, domain, secure) {
            if (expires) {
                var now = new Date;
                now.setTime(now.getTime() + expires * 1e3);
                expires = now
            }
            var cookie = name + "=" + escape(value) + (expires ? "; expires=" + expires.toGMTString() : "") + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (secure ? "; secure" : "");
            document.cookie = cookie
        };
        util.getCookie = function (name) {
            var dc = document.cookie;
            var prefix = name + "=";
            var begin = dc.indexOf("; " + prefix);
            if (begin == -1) {
                begin = dc.indexOf(prefix);
                if (begin != 0)return null
            } else {
                begin += 2
            }
            var end = document.cookie.indexOf(";", begin);
            if (end == -1) {
                end = dc.length
            }
            return unescape(dc.substring(begin + prefix.length, end))
        };
        util.delCookie = function (name, path, domain) {
            if (this.getCookie(name)) {
                document.cookie = name + "=" + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT"
            }
        };
        util.loadURL = function (url) {
            var img = new Image;
            img.src = url
        };
        util.semvercmp = function (a, b) {
            var pa = a.split(".");
            var pb = b.split(".");
            for (var i = 0; i < 3; i++) {
                var na = parseInt(pa[i]);
                var nb = parseInt(pb[i]);
                if (na > nb)return 1;
                if (nb > na)return -1;
                if (!isNaN(na) && isNaN(nb))return 1;
                if (isNaN(na) && !isNaN(nb))return -1
            }
            return 0
        }
    })();
    (function () {
        var fnTest = /xyz/.test(function () {
            var xyz
        }) ? /\b_super\b/ : /.*/, initializing = false;
        LIB.BaseClass = function () {
        };
        LIB.BaseClass.extend = function (prop) {
            var _super = this.prototype;
            initializing = true;
            var prototype = new this;
            initializing = false;
            for (var name in prop) {
                if (typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name])) {
                    prototype[name] = function (name, fn) {
                        return function () {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret
                        }
                    }(name, prop[name])
                } else {
                    prototype[name] = prop[name]
                }
            }
            function NewClass() {
                if (!initializing && this.construct) {
                    this.construct.apply(this, arguments)
                }
            }

            NewClass.prototype = prototype;
            NewClass.constructor = NewClass;
            NewClass.extend = arguments.callee;
            return NewClass
        }
    })();
    (function () {
        LIB.EventDispatcher = LIB.BaseClass.extend({
            construct: function () {
                this.listeners = {}
            }, addEventListener: function (name, fn, thisObj) {
                if (!this.listeners[name]) {
                    this.listeners[name] = []
                }
                this.listeners[name].push({fn: fn, thisObj: thisObj})
            }, removeEventListener: function (name, fn, thisObj) {
                if (!arguments.length) {
                    this.listeners = {};
                    return
                }
                if (!this.listeners[name]) {
                    return
                }
                if (!fn) {
                    this.listeners[name] = []
                } else {
                    var l = this.listeners[name];
                    for (var i = l.length - 1; i >= 0; i--) {
                        if (l[i].fn === fn && l[i].thisObj === thisObj) {
                            l.splice(i, 1)
                        }
                    }
                }
            }, dispatchEvent: function (name, data, target) {
                var l = [].concat(this.listeners[name] || []);
                l = l.concat(this.listeners["*"] || []);
                if (!l.length) {
                    return
                }
                var e = {name: name, data: data, target: target || this};
                var fn;
                for (var i = 0; i < l.length; i++) {
                    if (l[i].thisObj && typeof l[i].fn == "string") {
                        fn = l[i].thisObj[l[i].fn]
                    } else {
                        fn = l[i].fn
                    }
                    if (typeof fn == "function") {
                        if (fn.apply(l[i].thisObj, [e]) === false) {
                            return false
                        }
                    }
                }
            }, forwardEvent: function (e) {
                return this.dispatchEvent(e.name, e.data)
            }
        })
    })();
    (function () {
        var servePassbackCalled = false;
        LIB.Integration = LIB.EventDispatcher.extend({
            construct: function () {
                this._super();
                this.id = this.id || SCRIPT_ID;
                this.meta = {};
                this.params = {};
                this.testParams = {};
                this.failedTests = {};
                this.flaggedTests = [];
                this.custom = {};
                this.async = true
            }, init: function () {
                this.dispatchEvent("init");
                this._updateParams();
                this.dispatchEvent("parametersSet");
                if (this._runIntegrationTests() == false) {
                    this._servePassback()
                }
                var _self = this;
                this._makeAdCall(function (response) {
                  console.log("mac");
                    if (!this.invalid && response) {
                        _self._loadBase(function () {
                            $ = window.FE.$;
                            _self.base = new window.FE.Base(_self.params);
                            _self.base.addEventListener("*", function (e) {
                                _self.dispatchEvent(e.name, e.data, e.target)
                            });
                            _self.base.init()
                        })
                    } else {
                        _self._servePassback()
                    }
                })
            }, on: function (name, fn) {
                this.addEventListener(name, fn, this)
            }, off: function (name, fn) {
                this.removeEventListener(name, fn, this)
            }, once: function (name, fn) {
                var f = function (e) {
                    this.removeEventListener(name, f, this);
                    fn.call(this, e)
                };
                this.addEventListener(name, f, this)
            }, _runIntegrationTests: function () {
                var ok = true;
                var result;
                for (var test in tests) {
                    if (this.testParams[test] === false) {
                        continue
                    }
                    try {
                        result = tests[test].apply(null, this.testParams[test] || [])
                    } catch (e) {
                        result = false
                    }
                    if (result !== true) {
                        ok = false;
                        this.invalid = true;
                        if (typeof this.params.srv_Invalid == "undefined") {
                            this.params.srv_Invalid = true
                        }
                        this.failedTests[test] = result;
                        this.telemetry.recordFailedTest(test, result)
                    }
                }
                return ok
            }, _servePassback: function () {
                if (servePassbackCalled) {
                    return
                }
                servePassbackCalled = true;
                var tag;
                if (this.params.passback) {
                    tag = this.params.passback
                } else if (typeof window.FEPassback == "function") {
                    tag = window.FEPassback()
                }
                if (tag) {
                    tag = tag.replace(/<\\script>/gi, "</script>");
                    var win = this.params.servePassbackInParent ? window : currentWindow;
                    var doc = win.document;
                    if (this.params.servePassbackInIframe) {
                        setTimeout(function () {
                            var iframe = win.document.createElement("iframe");
                            iframe.style.display = "none";
                            var bd = win.document.getElementsByTagName("body")[0];
                            if (bd) {
                                bd.appendChild(iframe)
                            }
                            var iframeDoc = util.getFrameDoc(iframe, win.document);
                            if (iframeDoc) {
                                var html = "<!doctype html><html><body>" + tag + "</body></html>";
                                iframeDoc.open();
                                iframeDoc.write(html);
                                iframeDoc.close()
                            }
                        }, 0)
                    } else {
                        util.runJS(tag, win)
                    }
                }
            }, _makeAdCall: function (callback) {
                return callback({});
                var data = {};
                if (this.params.plr_DirectAdCall) {
                    if (this.params.plr_AdvertID) {
                        data.method = "GetCampaignInformationFromAdvertID";
                        data.vintAdvertID = this.params.plr_AdvertID
                    } else if (this.params.plr_CreativeID) {
                        data.method = "GetCampaignInformationFromCreativeID";
                        data.vintCreativeID = this.params.plr_CreativeID
                    }
                } else {
                    data.method = "GetCampaignInformationFromUserData";
                    var params = [];
                    for (var k in this.params) {
                        if (k.match(/^srv_/i)) {
                            params.push(k + "=" + this.params[k])
                        }
                    }
                    data.vstrCampaignData = params.join("&")
                }
                util.extend(data, util.getISAPCookies());
                var url;
                if (this.params.plr_UAT) {
                    url = "//staging.inskinad.com/ISAPAdServer/AdS.aspx"
                } else {
                    url = "//www.inskinad.com/ISAPAdServer/AdS.aspx"
                }
                util.jsonp({
                    window: currentWindow, url: url, async: this.async, data: data, callback: function (response) {
                        if (response) {
                            util.setISAPCookies(response)
                        }
                        if (callback) {
                            callback(response)
                        }
                    }
                });
                this.telemetry.recordAdCall()
            }, _loadBase: function (callback) {
                var light = false;
                if (!this.params.plr_UseFullVersion) {
                    if (typeof jQuery != "undefined") {
                        var v = jQuery.fn.jquery;
                        if (util.semvercmp(v, "1.4") >= 0 && util.semvercmp(v, "1.7.2") <= 0) {
                            light = true
                        }
                    }
                }
                var url = [this.params.BASE_URL + "/base", light ? "-lite" : "-full", ".js?_=" + BUILD_DATETIME].join("");
                util.loadJS(url, null, true);
                var interval = setInterval(function () {
                    if (typeof window.FE != "undefined" && typeof window.FE.Base != "undefined") {
                        clearInterval(interval);
                        callback()
                    }
                }, 5)
            }, _updateParams: function () {
                var adtagParams = this._getAdTagParams();
                var urlParams = util.getURLParams();
                for (var k in urlParams) {
                    if (k != "BASE_URL" && k != "DEBUG" && !k.match(/^(srv|plr)_/)) {
                        delete urlParams[k]
                    }
                }
                this.params = util.extend({
                    BASE_URL: "//inskin.hs.llnwd.net/cdn/isfe/4.1",
                    srv_ResWidth: screen.width,
                    srv_ResHeight: screen.height,
                    plr_InSkinID: "myInSkin_" + util.random()
                }, adtagParams, this.params, urlParams);
                util.ensureBooleans(this.params, ["srv_Invalid", "plr_DirectAdCall", "plr_UAT", "plr_UseFullVersion"]);
                util.ensureIntegers(this.params, ["plr_URLKeywords"]);
                if (!this.params.srv_Keywords) {
                    var kw = util.getPageKeywords().join(",");
                    this.params.srv_Keywords = kw
                }
                if (this.params.plr_URLKeywords) {
                    var kw = util.getURLPathKeywords(this.params.plr_URLKeywords).join(",");
                    this._addKeywords(kw)
                }
            }, _getAdTagParams: function () {
                var adtagParams = util.getScriptParams(new RegExp(this.id.replace("/", "\\/") + "\\.js\\?autoload([^A-Za-z0-9]+)(.*)$"));
                if (adtagParams && adtagParams.id) {
                    var p = currentWindow[adtagParams.id] || window[adtagParams.id];
                    if (p) {
                        util.extend(adtagParams, p)
                    }
                    delete adtagParams.id;
                    this.v2AdTag = true
                }
                return adtagParams
            }, _addKeywords: function () {
                var kw = Array.prototype.join.call(arguments, ",");
                this.params.srv_Keywords = util.extendCSV(this.params.srv_Keywords, kw)
            }
        })
    })();
    var integration = new LIB.Integration;
    var tag = function () {
        var tags = document.getElementsByTagName("script");
        var src = tags[tags.length - 1].src;
        return src.match(/mfa_tag_\d+/g)
    }();
    integration.params = {
        BASE_URL: "//ursusdrew.github.io/kidev-test/cdn/base/bid-show",
        serverApi: "Native",
        tag: tag[0],
        contentWidth: 950
    };
    integration.on("ready", function () {
        window.base = this.base
    });
    if (ns.loaded[integration.id]) {
        return
    }
    ns.loaded[integration.id] = integration;
    integration.init()
})(window);
