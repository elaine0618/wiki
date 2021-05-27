/*
(c) 2013-2014 GameMix Inc.  All rights reserved.
*/
(function() {
    var requestAnimFrame = window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1e3 / 60)
        }
    }();
    var cancelAnimFrame = window.cancelAnimFrame = function() {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function() {
            window.clearTimeout.apply(window, arguments)
        }
    }();
    navigator.vibrate = function() {
        return navigator.vibrate || navigator.mozVibrate || navigator.webkitVibrate || navigator.oVibrate || navigator.msVibrate || (navigator.notification ? function(l) {
            navigator.notification.vibrate(l)
        } : null) || new Function
    }();
    var console = function() {
        return window.console || {
            log: new Function,
            debug: new Function,
            warn: new Function,
            error: new Function,
            clear: new Function
        }
    }();
    var DOM = {
        get: function(el) {
            r = el == document || el == window || el instanceof HTMLElement ? el : document.getElementById(el);
            if (r == null) {
                console.log(el)
            }
            return r
        },
        attr: function(el, attr, value) {
            if (value) {
                this.get(el).setAttribute(attr, value)
            } else {
                return this.get(el).getAttribute(attr)
            }
        },
        on: function(el, evt, handler) {
            var split = evt.split(" ");
            for (var i in split) {
                this.get(el).addEventListener(split[i], handler, false)
            }
        },
        un: function(el, evt, handler) {
            var split = evt.split(" ");
            for (var i in split) {
                this.get(el).removeEventListener(split[i], handler, false)
            }
        },
        show: function(el) {
            this.get(el).style.display = "block"
        },
        hide: function(el) {
            this.get(el).style.display = "none"
        },
        offset: function(el) {
            el = this.get(el);
            return {
                x: el.clientLeft + window.scrollLeft,
                y: el.clientTop + window.scrollTop
            };
            var pos = {
                x: 0,
                y: 0
            };
            do {
                pos.x += el.offsetLeft || 0;
                pos.y += el.offsetTop || 0
            } while ((el = el.parentNode) !== null);
            return pos
        },
        query: function(query) {
            if (!document.querySelectorAll) return null;
            var q = document.querySelectorAll(query);
            return q
        },
        queryOne: function(query) {
            if (!document.querySelector) return null;
            var q = document.querySelector(query);
            return q
        },
        create: function(type) {
            return document.createElement(type)
        },
        positionRelativeTo: function(element, clientX, clientY) {
            var offset = DOM.offset(element);
            return {
                x: clientX - offset.x,
                y: clientY - offset.y
            }
        },
        fitScreen: function(element, ratio) {
            var clientRatio = window.innerWidth / window.innerHeight;
            var width, height;
            if (clientRatio <= ratio) {
                width = window.innerWidth;
                height = width / ratio
            } else {
                height = window.innerHeight;
                width = height * ratio
            }
            element = DOM.get(element);
            element.style.width = width + "px";
            element.style.height = height + "px";
            return {
                width: width,
                height: height
            }
        },
        saveCanvas: function(element) {
            var src = this.get(element);
            var can = this.create("canvas");
            can.width = src.width;
            can.height = src.height;
            var c = can.getContext("2d");
            c.drawImage(src, 0, 0);
            return can
        },
        fadeIn: function(element, duration, callback) {
            element = this.get(element);
            duration = duration || 1e3;
            this.show(element);
            element.style.opacity = 0;
            Util.interpolate(element.style, {
                opacity: 1
            }, duration, callback)
        },
        fadeOut: function(element, duration, callback) {
            element = this.get(element);
            duration = duration || 1e3;
            this.show(element);
            element.style.opacity = 1;
            Util.interpolate(element.style, {
                opacity: 0
            }, duration, function() {
                DOM.hide(element);
                if (callback) callback()
            })
        },
        notify: function(htmlMessage, duration, container) {
            container = container ? this.get(container) : document.body;
            this.notification = this.notification || function() {
                var block = DOM.create("div");
                container.appendChild(block);
                DOM.applyStyle(block, {
                    zIndex: 999999,
                    position: "absolute",
                    bottom: "10px",
                    width: "100%",
                    textAlign: "center"
                });
                var message = DOM.create("span");
                block.appendChild(message);
                DOM.applyStyle(message, {
                    backgroundColor: "rgba(0,0,0,0.7)",
                    border: "1px solid white",
                    borderRadius: "3px",
                    margin: "auto",
                    color: "white",
                    padding: "2px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                    width: "50%",
                    fontSize: "0.7em",
                    boxShadow: "0px 0px 2px black"
                });
                return {
                    block: block,
                    message: message,
                    queue: [],
                    add: function(message, duration) {
                        this.queue.push({
                            message: message,
                            duration: duration
                        });
                        if (this.queue.length == 1) {
                            this.applyOne()
                        }
                    },
                    applyOne: function() {
                        var notif = this.queue[0];
                        this.message.innerHTML = notif.message;
                        DOM.fadeIn(this.block, 500);
                        setTimeout(function() {
                            DOM.fadeOut(DOM.notification.block, 500, function() {
                                DOM.notification.queue.shift();
                                if (DOM.notification.queue.length > 0) {
                                    DOM.notification.applyOne()
                                }
                            })
                        }, notif.duration + 500)
                    }
                }
            }();
            duration = duration || 3e3;
            this.notification.add(htmlMessage, duration)
        },
        applyStyle: function(element, style) {
            element = this.get(element);
            for (var i in style) {
                element.style[i] = style[i]
            }
        },
        populate: function(elements) {
            var res = {};
            for (var i in elements) {
                res[i] = DOM.get(elements[i]);
                if (!res[i]) console.log("Element #" + elements[i] + " not found")
            }
            return res
        }
    };
    var Util = {
        preload: function(images, callbackProgress, callbackEnd, callbackError) {
            var loadOne = function() {
                if (remaining.length == 0) {
                    end(loaded)
                } else {
                    var img = new Image;
                    img.onerror = function() {
                        console.log("Couldn't load " + src);
                        error(src)
                    };
                    img.onload = function() {
                        if (this.complete) {
                            progress(this, 1 - remaining.length / nbImages);
                            setTimeout(loadOne, document.location.search.indexOf("fakelag") >= 0 ? 1e3 : 1)
                        }
                    };
                    var src = remaining.pop();
                    img.src = src;
                    loaded[src] = img
                }
            };
            var remaining = images.slice(0);
            var end = callbackEnd || new Function;
            var progress = callbackProgress || new Function;
            var error = callbackError || new Function;
            var nbImages = remaining.length;
            var loaded = {};
            setTimeout(loadOne, 1)
        },
        rand: function(min, max) {
            return Math.random() * (max - min) + min
        },
        randomPick: function() {
            var i = parseInt(Util.rand(0, arguments.length));
            return arguments[i]
        },
        limit: function(n, min, max) {
            if (n < min) return min;
            else if (n > max) return max;
            else return n
        },
        sign: function(n) {
            if (n > 0) return 1;
            else if (n == 0) return 0;
            else return -1
        },
        cookie: {
            set: function(name, value, ttl) {
                if (ttl == undefined) ttl = 1e3 * 3600 * 24 * 365;
                document.cookie = name + "=;path=/;expires=Thu, 01-Jan-1970 00:00:01 GMT";
                var expires = new Date;
                expires.setTime(expires.getTime() + ttl);
                document.cookie = [name + "=" + value + "; ", "expires=" + expires.toGMTString() + "; ", "path=/"].join("")
            },
            get: function(name) {
                var cookie = document.cookie.split("; ");
                for (var i in cookie) {
                    var spl = cookie[i].split("=");
                    if (spl.length == 2 && spl[0] == name) {
                        return spl[1]
                    }
                }
                return undefined
            }
        },
        storage: window.localStorage ? {
            getItem: function(item) {
                try {
                    return window.localStorage.getItem(item)
                } catch (e) {
                    return null
                }
            },
            setItem: function(item, value) {
                try {
                    window.localStorage.setItem(item, value)
                } catch (e) {
                    console.log("Local storage issue: " + e)
                }
            }
        } : {
            getItem: function(item) {
                return Util.cookie.get(item)
            },
            setItem: function(item, value) {
                Util.cookie.set(item, value)
            }
        },
        merge: function(template, object) {
            if (!object) {
                return template
            }
            for (var i in template) {
                if (!(i in object)) {
                    object[i] = template[i]
                } else {
                    if (typeof template[i] == "object" && !(object[i] instanceof Array)) {
                        object[i] = arguments.callee.call(this, template[i], object[i])
                    }
                }
            }
            return object
        },
        copyObject: function(obj) {
            var res = {};
            for (var i in obj) {
                res[i] = obj[i]
            }
            return res
        },
        isTouchScreen: function() {
            var bool = "orientation" in window || "orientation" in window.screen || "mozOrientation" in window.screen || "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch || "ontouchstart" in document.documentElement;
            if (bool) {
                bool = bool && Detect.isMobile()
            }
            return bool || window.location.search.indexOf("touch") >= 0
        },
        distance: function(x1, y1, x2, y2) {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
        },
        arrayUnique: function(a) {
            for (var i = 0; i < a.length; i++) {
                var j = i + 1;
                while (a[j]) {
                    if (a[i] == a[j]) {
                        a.splice(j, 1)
                    } else {
                        j++
                    }
                }
            }
        },
        analyzeParameters: function() {
            var res = {};
            var tmp;
            var params = window.location.search.substr(1).split("&");
            for (var i = 0; i < params.length; i++) {
                tmp = params[i].split("=");
                res[tmp[0]] = tmp[1]
            }
            return res
        },
        interpolate: function(obj, props, duration, callback) {
            var before = {};
            for (var i in props) {
                before[i] = parseFloat(obj[i])
            }
            var tStart = Date.now();
            (function() {
                var now = Date.now();
                var prct = Math.min(1, (now - tStart) / duration);
                for (var i in props) {
                    obj[i] = prct * (props[i] - before[i]) + before[i]
                }
                if (prct < 1) {
                    requestAnimFrame(arguments.callee)
                } else {
                    if (callback) {
                        callback.call(obj)
                    }
                }
            })()
        },
        addZeros: function(n, length) {
            var res = n.toString();
            while (res.length < length) res = "0" + res;
            return res
        },
        formatDate: function(format, date, options) {
            date = date || new Date;
            options = Util.merge({
                months: ["January", "February", "March", "April", "May", "June", "August", "September", "October", "November", "December"]
            }, options);
            var res = "";
            var formatNext = false;
            for (var i = 0; i < format.length; i++) {
                if (format.charAt(i) == "%") {
                    formatNext = true
                } else if (formatNext) {
                    formatNext = false;
                    switch (format.charAt(i)) {
                        case "%":
                            res += "%";
                            break;
                        case "M":
                            res += options.months[date.getMonth()];
                            break;
                        case "d":
                            res += date.getDate();
                            break;
                        case "Y":
                            res += date.getFullYear();
                            break;
                        case "m":
                            res += date.getMonth();
                            break
                    }
                } else {
                    res += format.charAt(i)
                }
            }
            return res
        },
        keyOf: function(object, element) {
            for (var i in object) {
                if (object[i] == element) {
                    return i
                }
            }
            return null
        }
    };
    var Ajax = {
        send: function(url, method, params, success, fail) {
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest
            } else if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP")
                } catch (e) {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP")
                }
            } else {
                console.log("AJAX not supported by your browser.");
                return false
            }
            success = success || new Function;
            fail = fail || new Function;
            method = method.toUpperCase();
            params = params || {};
            var paramsArray = [];
            for (var i in params) {
                paramsArray.push(i + "=" + params[i])
            }
            var paramsString = paramsArray.join("&");
            if (method == "GET") {
                url += "?" + paramsString
            }
            xhr.open(method, url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) return;
                if (xhr.status < 200 || xhr.status >= 300) {
                    fail(xhr.status, xhr.responseText)
                } else {
                    success(xhr.status, xhr.responseText)
                }
            };
            if (method == "POST") {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(paramsString)
            } else {
                xhr.send(null)
            }
        }
    };
    var ArrayManager = {
        elements: [],
        arrays: [],
        remove: function(array, element) {
            this.arrays.push(array);
            this.elements.push(element)
        },
        flush: function() {
            var ind;
            for (var i in this.arrays) {
                ind = this.arrays[i].indexOf(this.elements[i]);
                if (ind >= 0) {
                    this.arrays[i].splice(ind, 1)
                }
            }
            this.arrays = [];
            this.elements = []
        },
        init: function() {
            this.arrays = [];
            this.elements = []
        }
    };
    var Encoder = {
        buildString: function(tab) {
            var s = "",
                content;
            for (var i in tab) {
                content = tab[i].toString();
                content = content.replace(/=/g, " ");
                content = content.replace(/\|/g, " ");
                s += i + "=" + content + "|"
            }
            return s
        },
        encode: function(hash) {
            var str = Encoder.buildString(hash);
            var key = ~~Util.rand(1, 255);
            var encodedString = Encoder.encodeString(str, key);
            return encodeURIComponent(encodedString)
        },
        encodeString: function(s, cle) {
            var enc = "",
                c;
            for (var i = 0; i < s.length; i++) {
                c = s.charCodeAt(i);
                enc += String.fromCharCode((c + cle) % 256)
            }
            enc = String.fromCharCode(cle) + enc;
            return enc
        }
    };
    var Detect = {
        agent: navigator.userAgent.toLowerCase(),
        isMobile: function() {
            return this.isAndroid() || this.isFirefoxOS() || this.isWindowsMobile() || this.isIOS()
        },
        isAndroid: function() {
            return this.agent.indexOf("android") >= 0
        },
        isFirefoxOS: function() {
            return !this.isAndroid() && this.agent.indexOf("firefox") >= 0 && this.agent.indexOf("mobile") >= 0
        },
        isIOS: function() {
            return this.agent.indexOf("ios") >= 0 || this.agent.indexOf("ipod") >= 0 || this.agent.indexOf("ipad") >= 0 || this.agent.indexOf("iphone") >= 0
        },
        isWindowsMobile: function() {
            return this.agent.indexOf("windows") >= 0 && this.agent.indexOf("mobile") >= 0 || this.agent.indexOf("iemobile") >= 0
        },
        isTizen: function() {
            return this.agent.indexOf("tizen") >= 0
        }
    };
    var resourceManager = {
        processImages: function(images) {
            var canvas = DOM.create("canvas");
            var c = canvas.getContext("2d");
            resources.folder = resources.folder || "";
            R.image = R.image || {};
            if (resources.image) {
                for (var i in resources.image) {
                    R.image[i] = images[resources.folder + resources.image[i]]
                }
            }
            R.pattern = R.pattern || {};
            if (resources.pattern) {
                for (var i in resources.pattern) {
                    R.pattern[i] = c.createPattern(images[resources.folder + resources.pattern[i]], "repeat")
                }
            }
            R.sprite = R.sprite || {};
            if (resources.sprite) {
                for (var i in resources.sprite) {
                    R.sprite[i] = this.createSprite(images[resources.folder + resources.sprite[i].sheet], resources.sprite[i]);
                    if (resources.sprite[i].pattern) {
                        R.pattern[i] = c.createPattern(R.sprite[i], "repeat")
                    }
                }
            }
            R.animation = R.animation || {};
            if (resources.animation) {
                for (var i in resources.animation) {
                    R.animation[i] = [];
                    for (var j = 0; j < resources.animation[i].length; j++) {
                        if (R.sprite[resources.animation[i][j]]) {
                            R.animation[i].push(R.sprite[resources.animation[i][j]])
                        } else {
                            console.log("Error for animation " + i + ': sprite "' + resources.animation[i][j] + '" not found')
                        }
                    }
                }
            }
            R.raw = R.raw || {};
            if (resources.raw) {
                for (var i in resources.raw) {
                    R.raw[i] = resources.raw[i] instanceof Function ? resources.raw[i]() : resources.raw[i]
                }
            }
            R.string = R.string || {};
            if (resources.string) {
                var lang = this.getLanguage(resources.string);
                if (!resources.string[lang]) {
                    var pp = function(obj) {
                        if (typeof obj == "string") {
                            return
                        } else {
                            var o = {};
                            for (var i in obj) {
                                if (typeof obj[i] == "string") {
                                    o[i] = "{" + i + "}"
                                } else {
                                    o[i] = pp(obj[i])
                                }
                            }
                            return o
                        }
                    };
                    resources.string[lang] = pp(resources.string.en)
                }
                for (var i in resources.string[lang]) {
                    R.string[i] = resources.string[lang][i]
                }
                for (var i in R.string) {
                    if (i.charAt(0) == "$") {
                        try {
                            DOM.get(i.substring(1)).innerHTML = R.string[i]
                        } catch (e) {
                            console.log("DOM element " + i + " does not exist")
                        }
                    }
                }
            }
            resources = null;
            resourceManager = null
        },
        createSprite: function(image, details) {
            var canvas = DOM.create("canvas");
            var c = canvas.getContext("2d");
            canvas.width = details.width;
            canvas.height = details.height;
            c.drawImage(image, details.x, details.y, details.width, details.height, 0, 0, details.width, details.height);
            return canvas
        },
        getNecessaryImages: function() {
            var res = [];
            for (var i in resources.image) {
                res.push(resources.folder + resources.image[i])
            }
            for (var i in resources.pattern) {
                res.push(resources.folder + resources.pattern[i])
            }
            for (var i in resources.sprite) {
                res.push(resources.folder + resources.sprite[i].sheet)
            }
            Util.arrayUnique(res);
            return res
        },
        getLanguage: function(languages) {
            var lang = null;
            var browser_language = null;
            var params = Util.analyzeParameters();
            if (params.lang) {
                return params.lang
            }
            if (navigator && navigator.userAgent && (browser_language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
                browser_language = browser_language[1]
            }
            if (!browser_language && navigator) {
                if (navigator.language) {
                    browser_language = navigator.language
                } else if (navigator.browserLanguage) {
                    browser_language = navigator.browserLanguage
                } else if (navigator.systemLanguage) {
                    browser_language = navigator.systemLanguage
                } else if (navigator.userLanguage) {
                    browser_language = navigator.userLanguage
                }
                browser_language = browser_language.substr(0, 2)
            }
            for (var i in languages) {
                if (browser_language.indexOf(i) >= 0) {
                    lang = i;
                    break
                } else if (!lang) {
                    lang = i
                }
            }
            return lang
        }
    };
    var cycleManager = {
        init: function(cycle, fpsMin) {
            this.pause = false;
            this.oncycle = cycle;
            var hidden, visibilityChange;
            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange"
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange"
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange"
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange"
            }
            this.focus = true;
            if (!hidden) {
                DOM.on(window, "focus", function() {
                    cycleManager.focus = true
                });
                DOM.on(window, "blur", function() {
                    cycleManager.focus = false
                })
            } else {
                DOM.on(document, visibilityChange, function() {
                    cycleManager.focus = !document[hidden]
                })
            }
            this.lastCycle = Date.now();
            this.fpsMin = fpsMin || 10;
            this.framesUntilNextStat = 0;
            this.lastStat = 0;
            this.fakeLag = document.location.search.indexOf("fakelag") >= 0;
            this.fps = 0;
            this.requestId = null;
            this.init = null;
            this.resume();
        },
        stop: function() {
            this.pause = true;
            cancelAnimFrame(this.requestId)
        },
        resume: function() {
            this.pause = false;
            cancelAnimFrame(this.requestId);
            (function() {
                cycleManager.cycle();
                cycleManager.requestId = requestAnimFrame(arguments.callee)
            })()
        },
        cycle: function() {
            var now = Date.now();
            var elapsed = Math.min((now - this.lastCycle) / 1e3, 1 / this.fpsMin);
            this.lastCycle = now;
            if (!this.pause) {
                this.oncycle(elapsed);
                this.framesUntilNextStat--;
                if (this.framesUntilNextStat <= 0) {
                    this.framesUntilNextStat = 60;
                    this.fps = ~~(60 * 1e3 / (Date.now() - this.lastStat + elapsed));
                    this.lastStat = Date.now()
                }
            }
        }
    };
    var resizer = {
        init: function(width, height, element, desktop) {
            this.enabled = Util.isTouchScreen() || desktop;
            this.targetWidth = width;
            this.targetHeight = height;
            this.element = element;
            this.dimensions = {
                width: width,
                height: height
            };
            this.scale = 1;
            if (Util.isTouchScreen() || desktop) {
                DOM.on(window, "resize orientationchange", function() {
                    resizer.resize()
                });
                this.resize();
                this.toResize = null
            }
            this.init = null
        },
        resize: function() {
            if (!this.toResize && this.enabled) {
                this.toResize = setTimeout(function() {
                    if (!resizer.enabled) return;
                    window.scrollTo(0, 1);
                    resizer.toResize = null;
                    resizer.dimensions = DOM.fitScreen(resizer.element, resizer.targetWidth / resizer.targetHeight);
                    resizer.scale = resizer.dimensions.height / resizer.targetHeight
                }, 1e3)
            }
        }
    };
    if (window.cordova) {
        document.addEventListener("deviceready", function() {
            cordova.exec(null, null, "SplashScreen", "hide", []);
            DOM.notify('More HTML5 games available at <a style="color:white" href="' + GameParams.moregamesurl + '">' + GameParams.moregamesurl + "</a>", 3e3)
        }, false)
    }
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable")
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)))
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP;
            return fBound
        }
    }
   
    Number.prototype.mod = function(n) {
        return (this % n + n) % n
    };
    window.noop = new Function;

    function extend(subClass, superClass) {
        if (!subClass.extends || !subClass.extends[superClass]) {
            for (var i in superClass.prototype) {
                if (!subClass.prototype[i]) {
                    subClass.prototype[i] = superClass.prototype[i]
                }
            }
            subClass.extends = subClass.extends || {};
            subClass.extends[superClass] = true
        }
    }

    function extendPrototype(superClasses, proto) {
        superClasses = superClasses instanceof Array ? superClasses : [superClasses];
        var subProto = {};
        for (var i in superClasses) {
            for (var j in superClasses[i].prototype) {
                subProto[j] = superClasses[i].prototype[j]
            }
        }
        if (proto) {
            for (var i in proto) {
                subProto[i] = proto[i]
            }
        }
        return subProto
    }

    function quickImplementation(object, prototype) {
        for (var i in prototype) {
            object[i] = prototype[i]
        }
        return object
    }
    Math.linearTween = function(t, b, c, d) {
        return c * t / d + b
    };
    Math.easeInQuad = function(t, b, c, d) {
        return c * (t /= d) * t + b
    };
    Math.easeOutQuad = function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b
    };
    Math.easeInOutQuad = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * (--t * (t - 2) - 1) + b
    };
    Math.easeInCubic = function(t, b, c, d) {
        return c * (t /= d) * t * t + b
    };
    Math.easeOutCubic = function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b
    };
    Math.easeInOutCubic = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b
    };
    Math.easeInQuart = function(t, b, c, d) {
        return c * (t /= d) * t * t * t + b
    };
    Math.easeOutQuart = function(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
    };
    Math.easeInOutQuart = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b
    };
    Math.easeInQuint = function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b
    };
    Math.easeOutQuint = function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b
    };
    Math.easeInOutQuint = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
    };
    Math.easeInSine = function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
    };
    Math.easeOutSine = function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b
    };
    Math.easeInOutSine = function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
    };
    Math.easeInExpo = function(t, b, c, d) {
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b
    };
    Math.easeOutExpo = function(t, b, c, d) {
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b
    };
    Math.easeInOutExpo = function(t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b
    };
    Math.easeInCirc = function(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
    };
    Math.easeOutCirc = function(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
    };
    Math.easeInOutCirc = function(t, b, c, d) {
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
    };
    Math.easeInElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b
    };
    Math.easeOutElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d) == 1) return b + c;
        if (!p) p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b
    };
    Math.easeInOutElastic = function(t, b, c, d, a, p) {
        if (t == 0) return b;
        if ((t /= d / 2) == 2) return b + c;
        if (!p) p = d * .3 * 1.5;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4
        } else var s = p / (2 * Math.PI) * Math.asin(c / a); if (t < 1) return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b
    };
    Math.easeInBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b
    };
    Math.easeOutBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    };
    Math.easeInOutBack = function(t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
        return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b
    };
    Math.easeInBounce = function(t, b, c, d) {
        return c - Math.easeOutBounce(d - t, 0, c, d) + b
    };
    Math.easeOutBounce = function(t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * 7.5625 * t * t + b
        } else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b
        } else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b
        } else {
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b
        }
    };
    Math.easeInOutBounce = function(t, b, c, d) {
        if (t < d / 2) return Math.easeInBounce(t * 2, 0, c, d) * .5 + b;
        return Math.easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b
    };

    function Resizer(options) {
        this.delay = options.delay || 0;
        this.element = options.element || null;
        this.baseWidth = options.baseWidth;
        this.baseHeight = options.baseHeight;
        this.onResize = options.onResize;
        this.enabled = true;
        this.scale = 1;
        this.resizeTimeout = null
    }
    Resizer.prototype = {
        needsResize: function(maxWidth, maxHeight) {
            clearTimeout(this.resizeTimeout);
            if (this.enabled) {
                this.maxWidth = maxWidth;
                this.maxHeight = maxHeight;
                this.resizeTimeout = setTimeout(this.resize.bind(this), this.delay)
            }
        },
        resize: function() {
            this.resizeTimeout = null;
            var dimensions = this.getFittingDimensions(this.maxWidth, this.maxHeight);
            this.element.style.width = dimensions.width + "px";
            this.element.style.height = dimensions.height + "px";
            if (this.onResize) {
                this.onResize.call(this)
            }
        },
        scaleX: function() {
            var rect = this.element.getBoundingClientRect();
            return rect.width / this.baseWidth || 1
        },
        scaleY: function() {
            var rect = this.element.getBoundingClientRect();
            return rect.height / this.baseHeight || 1
        },
        getFittingDimensions: function(maxWidth, maxHeight) {
            var availableRatio = maxWidth / maxHeight;
            var baseRatio = this.baseWidth / this.baseHeight;
            var ratioDifference = Math.abs(availableRatio - baseRatio);
            var width, height;
            if (ratioDifference <= .17) {
                width = maxWidth;
                height = maxHeight
            } else if (availableRatio <= baseRatio) {
                width = maxWidth;
                height = width / baseRatio
            } else {
                height = maxHeight;
                width = height * baseRatio
            }
            return {
                width: width,
                height: height
            }
        }
    };

    function ResourceLoader(settings) {
        this.settings = settings;
        this.appCache = window.applicationCache;
        this.finished = false;
        this.message = null
    }
    ResourceLoader.prototype.load = function(end, canvas) {
        this.endCallback = end;
        this.canvasOutput = canvas;
        if (!this.appCache || this.appCache.status === this.appCache.UNCACHED) {
            this.loadResources()
        } else {
            this.loadCache()
        }
    };
    ResourceLoader.prototype.loadCache = function() {
        console.log("cache");
        this.message = "Updating...";
        this.appCache.addEventListener("checking", this.checkingCache.bind(this), false);
        this.appCache.addEventListener("noupdate", this.loadResources.bind(this), false);
        this.appCache.addEventListener("obsolete", this.loadResources.bind(this), false);
        this.appCache.addEventListener("error", this.loadResources.bind(this), false);
        this.appCache.addEventListener("cached", this.loadResources.bind(this), false);
        this.appCache.addEventListener("downloading", this.updatingCache.bind(this), false);
        this.appCache.addEventListener("progress", this.updatingCacheProgress.bind(this), false);
        this.appCache.addEventListener("updateready", this.updatingCacheReady.bind(this), false);
        if (this.appCache.status === this.appCache.IDLE) {
            try {
                this.appCache.update()
            } catch (e) {
                this.loadResources()
            }
        }
    };
    ResourceLoader.prototype.checkingCache = function() {
        if (!this.finished) {
            this.showProgress(this.canvasOutput, 0)
        }
    };
    ResourceLoader.prototype.updatingCache = function(e) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, 0)
        }
    };
    ResourceLoader.prototype.updatingCacheProgress = function(e) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, e.loaded / e.total || 0)
        }
    };
    ResourceLoader.prototype.updatingCacheReady = function(e) {
        if (!this.finished) {
            this.finished = true;
            try {
                this.appCache.swapCache()
            } catch (e) {}
            location.reload()
        }
    };
    ResourceLoader.prototype.loadResources = function() {
        this.message = "Loading assets. Please wait...";
        this.R = {};
        this.processLanguage(this.R);
        var images = this.getNecessaryImages();
        var loader = this;
        Util.preload(images, this.resourcesProgress.bind(this), this.resourcesLoaded.bind(this), this.resourcesError.bind(this))
    };
    ResourceLoader.prototype.resourcesError = function(imageSrc) {
        alert("Could not load " + imageSrc + ".\nUnable to launch.")
    };
    ResourceLoader.prototype.resourcesProgress = function(img, progress) {
        if (this.canvasOutput && !this.finished) {
            this.showProgress(this.canvasOutput, progress)
        }
    };
    ResourceLoader.prototype.resourcesLoaded = function(loadedImages) {
        if (!this.finished) {
            this.finished = true;
            this.processImages(loadedImages, this.R);
            this.endCallback(this.R)
        }
    };
    ResourceLoader.prototype.showProgress = function(canvas, progress) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "10px Arial";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.message, canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillRect(0, canvas.height / 2 - 5, canvas.width, 10);
        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height / 2 - 5, progress * canvas.width, 10);
        ctx.fillStyle = "black";
        ctx.textAlign = "right";
        ctx.fillText(~~(progress * 100) + "%", progress * canvas.width - 2, canvas.height / 2)
    };
    ResourceLoader.prototype.createSprite = function(image, details) {
        var canvas = document.createElement("canvas");
        var c = canvas.getContext("2d");
        canvas.width = details.width;
        canvas.height = details.height;
        c.drawImage(image, details.x, details.y, details.width, details.height, 0, 0, details.width, details.height);
        return canvas
    };
    ResourceLoader.prototype.getNecessaryImages = function() {
        var res = [];
        for (var i in this.settings.image) {
            res.push(this.settings.folder + this.settings.image[i])
        }
        for (var i in this.settings.pattern) {
            res.push(this.settings.folder + this.settings.pattern[i])
        }
        for (var i in this.settings.sprite) {
            res.push(this.settings.folder + this.settings.sprite[i].sheet)
        }
        Util.arrayUnique(res);
        return res
    };
    ResourceLoader.prototype.getLanguage = function(languages) {
        var lang = null;
        var browser_language = null;
        var params = Util.analyzeParameters();
        if (params.lang) {
            return params.lang
        }
        if (navigator && navigator.userAgent && (browser_language = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            browser_language = browser_language[1]
        }
        if (!browser_language && navigator) {
            if (navigator.language) {
                browser_language = navigator.language
            } else if (navigator.browserLanguage) {
                browser_language = navigator.browserLanguage
            } else if (navigator.systemLanguage) {
                browser_language = navigator.systemLanguage
            } else if (navigator.userLanguage) {
                browser_language = navigator.userLanguage
            }
            browser_language = browser_language.substr(0, 2)
        }
        for (var i in languages) {
            if (browser_language.indexOf(i) >= 0) {
                lang = i;
                break
            } else if (!lang) {
                lang = i
            }
        }
        return lang
    };
    ResourceLoader.prototype.processImages = function(images, R) {
        var canvas = DOM.create("canvas");
        var c = canvas.getContext("2d");
        this.settings.folder = this.settings.folder || "";
        R.image = R.image || {};
        if (this.settings.image) {
            for (var i in this.settings.image) {
                R.image[i] = images[this.settings.folder + this.settings.image[i]]
            }
        }
        R.pattern = R.pattern || {};
        if (this.settings.pattern) {
            for (var i in this.settings.pattern) {
                R.pattern[i] = c.createPattern(images[this.settings.folder + this.settings.pattern[i]], "repeat");
                R.pattern[i].width = images[this.settings.folder + this.settings.pattern[i]].width;
                R.pattern[i].height = images[this.settings.folder + this.settings.pattern[i]].height
            }
        }
        R.sprite = R.sprite || {};
        if (this.settings.sprite) {
            for (var i in this.settings.sprite) {
                R.sprite[i] = this.createSprite(images[this.settings.folder + this.settings.sprite[i].sheet], this.settings.sprite[i]);
                if (this.settings.sprite[i].pattern) {
                    R.pattern[i] = c.createPattern(R.sprite[i], "repeat");
                    R.pattern[i].width = R.sprite[i].width;
                    R.pattern[i].height = R.sprite[i].height
                }
            }
        }
        R.animation = R.animation || {};
        if (this.settings.animation) {
            for (var i in this.settings.animation) {
                R.animation[i] = [];
                for (var j = 0; j < this.settings.animation[i].length; j++) {
                    if (R.sprite[this.settings.animation[i][j]]) {
                        R.animation[i].push(R.sprite[this.settings.animation[i][j]])
                    } else {
                        console.log("Error for animation " + i + ': sprite "' + this.settings.animation[i][j] + '" not found')
                    }
                }
            }
        }
        R.raw = R.raw || {};
        if (this.settings.raw) {
            for (var i in this.settings.raw) {
                R.raw[i] = this.settings.raw[i] instanceof Function ? this.settings.raw[i]() : this.settings.raw[i]
            }
        }
    };
    ResourceLoader.prototype.processLanguage = function(R) {
        R.string = R.string || {};
        if (this.settings.string) {
            this.language = this.getLanguage(this.settings.string);
            if (!this.settings.string[this.language]) {
                var pp = function(obj) {
                    if (typeof obj == "string") {
                        return
                    } else {
                        var o = {};
                        for (var i in obj) {
                            if (typeof obj[i] == "string") {
                                o[i] = "{" + i + "}"
                            } else {
                                o[i] = pp(obj[i])
                            }
                        }
                        return o
                    }
                };
                this.settings.string[this.language] = pp(this.settings.string.en)
            }
            for (var i in this.settings.string[this.language]) {
                R.string[i] = this.settings.string[this.language][i]
            }
            for (var i in R.string) {
                if (i.charAt(0) == "$") {
                    try {
                        DOM.get(i.substring(1)).innerHTML = R.string[i]
                    } catch (e) {
                        console.log("DOM element " + i + " does not exist")
                    }
                }
            }
        }
    };

    function DisplayableObject() {
        this.parent = null;
        this.x = this.y = 0;
        this.rotation = 0;
        this.scaleX = this.scaleY = 1;
        this.alpha = 1;
        this.visible = true
    }
    DisplayableObject.prototype = {
        applyTransforms: function(c) {
            if (this.x != 0 || this.y != 0) c.translate(~~this.x, ~~this.y);
            if (this.scaleX != 1 || this.scaleY != 1) c.scale(this.scaleX, this.scaleY);
            if (this.rotation != 0) c.rotate(this.rotation);
            if (this.alpha != 1) c.globalAlpha *= this.alpha
        },
        doRender: function(c) {
            if (this.visible && this.alpha > .01 && this.scaleX != 0 && this.scaleY != 0) {
                c.save();
                this.applyTransforms(c);
                this.render(c);
                c.restore()
            }
        },
        render: function(c) {
            throw new Error("Rendering undefined")
        },
        remove: function() {
            if (this.parent) {
                this.parent.removeChild(this)
            }
        },
        leaves: function() {
            return 1
        }
    };

    function DisplayableContainer() {
        DisplayableObject.call(this);
        this.children = []
    }
    DisplayableContainer.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            var i = -1;
            while (this.children[++i]) {
                this.children[i].doRender(c)
            }
        },
        addChild: function(child) {
            if (child.parent) {
                child.parent.removeChild(child)
            }
            this.children.push(child);
            child.parent = this;
            child.parentIndex = this.children.length - 1
        },
        removeChild: function(child) {
            if (!isNaN(child.parentIndex)) {
                this.children.splice(child.parentIndex, 1);
                for (var i = child.parentIndex; i < this.children.length; i++) {
                    this.children[i].parentIndex--
                }
                child.parent = null;
                child.parentIndex = null
            }
        },
        clear: function() {
            for (var i in this.children) {
                this.children[i].parent = null;
                this.children[i].parentIndex = null
            }
            this.children = []
        },
        leaves: function() {
            var total = 0;
            for (var i in this.children) {
                total += this.children[i].leaves()
            }
            return total
        }
    });

    function DisplayableImage() {
        DisplayableObject.call(this);
        this.image = null;
        this.anchorX = this.anchorY = 0
    }
    DisplayableImage.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            c.drawImage(this.image, this.anchorX, this.anchorY)
        }
    });

    function DisplayableShape(drawFunction) {
        DisplayableObject.call(this);
        this.drawFunction = drawFunction
    }
    DisplayableShape.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            this.drawFunction(c)
        }
    });

    function DisplayableTextField() {
        DisplayableObject.call(this);
        this.text = null;
        this.font = "12pt Arial";
        this.textAlign = "left";
        this.textBaseline = "top";
        this.color = "#000";
        this.shadowColor = null;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.outlineColor = null;
        this.outlineWidth = 0
    }
    DisplayableTextField.prototype = extendPrototype(DisplayableObject, {
        render: function(c) {
            if (this.text != null && this.text.length > 0) {
                c.font = this.font;
                c.textAlign = this.textAlign;
                c.textBaseline = this.textBaseline;
                if (this.shadowColor) {
                    c.fillStyle = this.shadowColor;
                    c.fillText(this.text, this.shadowOffsetX, this.shadowOffsetY)
                }
                c.fillStyle = this.color;
                c.fillText(this.text, 0, 0);
                if (this.outlineColor) {
                    c.strokeStyle = this.outlineColor;
                    c.lineWidth = this.outlineWidth;
                    c.strokeText(this.text, 0, 0)
                }
            }
        }
    });

    function DisplayableRectangle() {
        DisplayableContainer.call(this);
        this.color = "#000";
        this.width = 0;
        this.height = 0
    }
    DisplayableRectangle.prototype = extendPrototype(DisplayableContainer, {
        render: function(c) {
            c.fillStyle = this.color;
            c.fillRect(0, 0, this.width, this.height);
            DisplayableContainer.prototype.render.call(this, c)
        }
    });

    function AnimatedView(settings) {
        DisplayableContainer.call(this);
        settings = settings || {};
        this.frames = settings.frames;
        this.frame = new DisplayableImage;
        this.addChild(this.frame);
        this.curFrame = -1;
        this.animated = false;
        this.applyNextFrame()
    }
    AnimatedView.prototype = extendPrototype(DisplayableContainer, {
        animate: function() {
            if (!this.animated) {
                this.animated = true;
                this.applyNextFrame()
            }
        },
        stop: function() {
            if (this.animated) {
                this.animated = false;
                this.currentDelay.cancel()
            }
        },
        applyNextFrame: function() {
            this.setFrame(this.curFrame + 1);
            if (this.animated) {
                this.currentDelay = new Delay({
                    duration: this.nextFrame,
                    onFinish: this.applyNextFrame.bind(this)
                });
                TweenPool.add(this.currentDelay)
            }
        },
        setFrame: function(n) {
            if (!isNaN(n)) {
                this.curFrame = n % this.frames.length
            } else {
                for (var i = 0; i < this.frames.length; i++) {
                    if (this.frames[i].label == n) {
                        this.curFrame = i;
                        break
                    }
                }
            }
            this.frame.image = this.frames[this.curFrame].image;
            this.frame.anchorX = this.frames[this.curFrame].anchorX || 0;
            this.frame.anchorY = this.frames[this.curFrame].anchorY || 0;
            this.nextFrame = this.frames[this.curFrame].duration || 1
        }
    });

    function MultilineTextField() {
        DisplayableTextField.call(this);
        this.maxWidth = 100;
        this.lineHeight = 20
    }
    MultilineTextField.prototype = extendPrototype(DisplayableTextField, {
        render: function(c) {
            c.font = this.font;
            c.textAlign = this.textAlign;
            c.textBaseline = "top";
            if (this.text != this.previouslyComputedText) {
                var lines = this.text.toString().split("\n");
                this.finalLines = [];
                var curLineWidth, words, metrics;
                for (var i = 0; i < lines.length; i++) {
                    words = lines[i].split(" ");
                    for (var j = 0; j < words.length; j++) {
                        metrics = c.measureText(words[j] + " ");
                        if (j == 0 || metrics.width + curLineWidth > this.maxWidth) {
                            this.finalLines.push("");
                            curLineWidth = 0
                        }
                        curLineWidth += metrics.width;
                        this.finalLines[this.finalLines.length - 1] += words[j] + " "
                    }
                }
                this.previousComputedText = this.text
            }
            var totalHeight = this.finalLines.length * this.lineHeight;
            var y, step;
            if (this.baseline == "top") {
                y = 0;
                step = this.lineHeight
            } else if (this.baseline == "bottom") {
                y = totalHeight;
                step = -this.lineHeight
            } else {
                y = -totalHeight / 2;
                step = this.lineHeight
            }
            for (var i = 0; i < this.finalLines.length; i++, y += step) {
                if (this.shadowColor) {
                    c.fillStyle = this.shadowColor;
                    c.fillText(this.finalLines[i], this.shadowOffsetX, this.shadowOffsetY + y)
                }
                c.fillStyle = this.color;
                c.fillText(this.finalLines[i], 0, y)
            }
        }
    });

    function Tween(object, property, from, to, duration, delay, onFinish) {
        this.object = object;
        this.delayLeft = delay || 0;
        this.duration = duration;
        this.elapsed = 0;
        this.property = property;
        this.from = from;
        this.to = to;
        this.onFinish = onFinish;
        this.cancelled = false;
        object[property] = from
    }
    Tween.prototype = {
        cycle: function(e) {
            if (this.delayLeft > 0) {
                this.delayLeft -= e;
                this.object[this.property] = this.from
            }
            if (this.delayLeft <= 0) {
                this.elapsed += e;
                if (this.elapsed >= this.duration) {
                    this.finish()
                } else {
                    this.progress()
                }
            }
        },
        finish: function() {
            this.object[this.property] = this.to;
            if (this.onFinish) {
                this.onFinish.call(this)
            }
        },
        cancel: function() {
            this.cancelled = true
        },
        isFinished: function() {
            return this.elapsed >= this.duration || this.cancelled
        },
        progress: function() {
            var prct = this.duration > 0 ? this.elapsed / this.duration : 1;
            this.object[this.property] = prct * (this.to - this.from) + this.from
        }
    };

    function Interpolation(settings) {
        this.object = settings.object;
        this.property = settings.property;
        this.delay = settings.delay || 0;
        this.duration = settings.duration || 1;
        this.from = settings.from;
        this.to = settings.to;
        this.easing = settings.easing || Math.linearTween;
        this.easingParameter = settings.easingParameter || null;
        this.onFinish = settings.onFinish || noop;
        this.applyFunction = settings.applyFunction || function(easing, duration, from, to, elapsed, easingParam) {
            return easing(elapsed, from, to - from, duration, easingParam)
        };
        this.delayLeft = this.delay;
        this.elapsed = 0;
        this.cancelled = false
    }
    Interpolation.prototype = {
        cycle: function(e) {
            if (this.delayLeft > 0) {
                this.delayLeft -= e;
                this.object[this.property] = this.from
            }
            if (this.delayLeft <= 0) {
                this.elapsed += e;
                if (this.elapsed >= this.duration) {
                    this.finish()
                } else {
                    this.progress()
                }
            }
        },
        finish: function() {
            this.object[this.property] = this.to;
            this.onFinish.call(this)
        },
        cancel: function() {
            this.cancelled = true
        },
        isFinished: function() {
            return this.elapsed >= this.duration || this.cancelled
        },
        progress: function() {
            this.object[this.property] = this.applyFunction(this.easing, this.duration, this.from, this.to, this.elapsed, this.easingParameter)
        },
        invert: function() {
            this.elapsed = 0;
            var from = this.from;
            this.from = this.to;
            this.to = from
        }
    };
    var TweenPool = {
        tweens: [],
        speedFactor: 1,
        cycle: function(e) {
            var i = 0;
            while (this.tweens[i]) {
                this.tweens[i].cycle(e * this.speedFactor);
                if (!this.tweens[i].isFinished()) {
                    i++
                } else {
                    this.tweens.splice(i, 1)
                }
            }
        },
        remove: function(tw) {
            var index = this.tweens.indexOf(tw);
            if (index >= 0) {
                this.tweens.splice(index, 1)
            }
        },
        add: function(tw) {
            this.tweens.push(tw)
        },
        clear: function() {
            this.tweens = []
        }
    };

    function Delay(settings) {
        this.duration = settings.duration || 1;
        this.onFinish = settings.onFinish || noop;
        this.elapsed = 0
    }
    Delay.prototype = {
        cycle: function(e) {
            this.elapsed += e;
            if (this.elapsed >= this.duration) {
                this.finish()
            }
        },
        finish: function() {
            this.onFinish.call(this)
        },
        cancel: function() {
            this.cancelled = true
        },
        isFinished: function() {
            return this.elapsed >= this.duration || this.cancelled
        },
        repeat: function() {
            this.elapsed = 0
        }
    };

    function Area(settings) {
        settings = settings || {};
        this.x = settings.x || 0;
        this.y = settings.y || 0;
        this.width = settings.width || 0;
        this.height = settings.height || 0;
        this.cursor = settings.cursor || "pointer";
        this.onactionperformed = settings.actionPerformed || noop;
        this.onactionstart = settings.actionStart || noop;
        this.onactioncancel = settings.actionCancel || noop;
        this.onactionmove = settings.actionMove || noop;
        this.enabled = true
    }
    Area.prototype = {
        contains: function(x, y) {
            return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
        },
        actionPerformed: function(x, y) {
            this.onactionperformed(x, y)
        },
        actionStart: function(x, y) {
            this.onactionstart(x, y)
        },
        actionCancel: function(x, y) {
            this.onactioncancel(x, y)
        },
        actionMove: function(x, y) {
            this.onactionmove(x, y)
        }
    };

    function Screen(game) {
        this.game = game;
        this.areas = [];
        this.currentActionArea = null;
        this.view = null
    }
    Screen.prototype = {
        getId: function() {
            return "unnamed"
        },
        cycle: function(elapsed) {},
        touchStart: function(x, y) {
            for (var i in this.areas) {
                if (this.areas[i].enabled && this.areas[i].contains(x, y)) {
                    this.currentActionArea = this.areas[i];
                    this.currentActionArea.actionStart(x, y);
                    break
                }
            }
        },
        touchMove: function(x, y) {
            if (this.currentActionArea) {
                if (!this.currentActionArea.contains(x, y)) {
                    this.currentActionArea.actionCancel(x, y);
                    this.currentActionArea = null
                } else {
                    this.currentActionArea.actionMove(x, y)
                }
            }
        },
        touchEnd: function(x, y) {
            if (this.currentActionArea && this.currentActionArea.contains(x, y)) {
                this.currentActionArea.actionPerformed(x, y)
            }
            this.currentActionArea = null
        },
        keyDown: function(keyCode) {},
        keyUp: function(keyCode) {},
        mouseWheel: function(delta) {},
        orientationChange: function(alpha, beta, gamma) {},
        create: function() {},
        destroy: function() {},
        addArea: function(area) {
            this.areas.push(area)
        },
        areaContains: function(x, y) {
            for (var i in this.areas) {
                if (this.areas[i].enabled && this.areas[i].contains(x, y)) {
                    return this.areas[i]
                }
            }
            return null
        }
    };
    var P = {
        width: 640,
        height: 920,
        cocoon: !!window.isCocoon,
        amazon: location.search.indexOf("amazon") >= 0,
        crazyGames: window.location.href.indexOf("crazygames") !== -1,
        inAppGames: window.location.href.indexOf("inappgames") !== -1 || window.location.href.indexOf("utm_source=ubersocialios") !== -1 && window.location.href.indexOf("utm_medium=inapp") !== -1,
        playphone: location.search.indexOf("playphone") >= 0,
        playphoneAPI: "./PSGN.js?app_id=6388",
        pxPerPt: 20,
        highscoreKey: "remvst-was-here-again",
        historyKey: "remvst-is-bored",
        showFrameRate: location.search.indexOf("fps") >= 0
    };
    window.addToHomeConfig = {
        touchIcon: true,
        autostart: false
    };

	//图片配置
    var resources = {
        folder: "img/",
        image: {
            bg: "bg.png",
            logo: "logo.png",
            ahh1: "ahh1.png",
            ahh2: "ahh2.png",
            ahh3: "ahh3.png",
            jumpsaga: "jumpsaga.png",
            button_plus: "button-plus.png"
        },
        sprite: {
            pencil: {
                sheet: "spritesheet.png",
                x: 0,
                y: 0,
                width: 198,
                height: 23
            },
            pencil_broken: {
                sheet: "spritesheet.png",
                x: 0,
                y: 23,
                width: 198,
                height: 67
            },
            platform_pins: {
                sheet: "spritesheet.png",
                x: 98,
                y: 563,
                width: 142,
                height: 65
            },
            eraser: {
                sheet: "spritesheet.png",
                x: 0,
                y: 90,
                width: 141,
                height: 41
            },
            cloud: {
                sheet: "spritesheet.png",
                x: 0,
                y: 131,
                width: 111,
                height: 57
            },
            end_character: {
                sheet: "spritesheet.png",
                x: 0,
                y: 275,
                width: 60,
                height: 106
            },
            end_cloud: {
                sheet: "spritesheet.png",
                x: 60,
                y: 288,
                width: 142,
                height: 73
            },
            spring_big: {
                sheet: "spritesheet.png",
                x: 141,
                y: 131,
                width: 57,
                height: 109
            },
            spring_small: {
                sheet: "spritesheet.png",
                x: 141,
                y: 240,
                width: 57,
                height: 48
            },
            star: {
                sheet: "spritesheet.png",
                x: 124,
                y: 466,
                width: 56,
                height: 55
            },
            crown: {
                sheet: "spritesheet.png",
                x: 0,
                y: 538,
                width: 98,
                height: 100
            },
            line: {
                sheet: "spritesheet.png",
                x: 124,
                y: 463,
                width: 65,
                height: 3
            },
            button_retry: {
                sheet: "spritesheet.png",
                x: 0,
                y: 381,
                width: 102,
                height: 82
            },
            button_leaderboard: {
                sheet: "spritesheet.png",
                x: 0,
                y: 463,
                width: 124,
                height: 75
            },
            character_jump: {
                sheet: "spritesheet.png",
                x: 0,
                y: 188,
                width: 64,
                height: 88
            },
            character_fall: {
                sheet: "spritesheet.png",
                x: 64,
                y: 188,
                width: 64,
                height: 88
            },
            button_play_1: {
                sheet: "play-spritesheet.png",
                x: 0,
                y: 0,
                width: 415,
                height: 138
            },
            button_play_2: {
                sheet: "play-spritesheet.png",
                x: 415,
                y: 0,
                width: 415,
                height: 138
            },
            button_play_3: {
                sheet: "play-spritesheet.png",
                x: 830,
                y: 0,
                width: 415,
                height: 138
            },
            rocket_idle: {
                sheet: "spritesheet.png",
                x: 202,
                y: 0,
                width: 110,
                height: 129
            },
            rocket_fire_1: {
                sheet: "spritesheet.png",
                x: 202,
                y: 129,
                width: 110,
                height: 217
            },
            rocket_fire_2: {
                sheet: "spritesheet.png",
                x: 202,
                y: 346,
                width: 110,
                height: 217
            }
        },
        pattern: {}
    };
    var R = {};
    DOM.on(window, "load", function() {
        DOM.un(window, "load", arguments.callee);
        Tracker.beginStage("loading");
        can = DOM.get("gamecanvas");
        can.width = P.width;
        can.height = P.height;
        var dpr = window.devicePixelRatio || 1;
        if (dpr < 2) {
            can.width /= 2;
            can.height /= 2
        }
        ctx = can.getContext("2d");
        if (!Util.isTouchScreen()) {
            var link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", "css/desktop.css");
            document.head.appendChild(link)
        }
        if (P.playphone) {
            var script = document.createElement("script");
            script.src = P.playphoneAPI;
            script.onload = function() {
                $pp.PSGN.Ui.icon("topleft")
            };
            document.head.appendChild(script)
        }
        window.resizer = new Resizer({
            element: DOM.get("viewport"),
            delay: 50,
            baseWidth: P.width,
            baseHeight: P.height,
            onResize: function() {
                window.scrollTo(0, 1)
            }
        });
        var getDimensionsAndResize = function() {
            if (!P.cocoon) {
                var w = window.innerWidth;
                var h = window.innerHeight;
                if (!Util.isTouchScreen()) {
                    w *= .85;
                    h *= .85
                }
                this.resizer.needsResize(w, h)
            }
        };
        DOM.on(window, "resize orientationchange", getDimensionsAndResize);
        getDimensionsAndResize();
        var loader = new ResourceLoader(resources);
        loader.load(function(res) {
            R = res;
            if (dpr < 2) {
                ctx.scale(.5, .5)
            }
            if (Util.isTouchScreen()) {
                window.scrollTo(0, 1)
            }
            new Game(resizer)
        }, can)
    });

	//游戏初始化
    function Game() {
        Game.instance = this;
        window.G = this;
        this.curScreen = null;
        this.curOverlay = null;
        this.hasAccelerometer = false;
        this.lastCycleDate = Date.now();
        this.highscore = parseFloat(Util.storage.getItem(P.highscoreKey)) || 0;
        this.scoreHistory = [];
        var s = Util.storage.getItem(P.historyKey);
        if (s) this.scoreHistory = JSON.parse(s);
        this.highscore = parseInt(Util.storage.getItem(P.highscoreKey)) || 0;
        this.doubleClickRetry = false;
        this.attempts = 0;
        this.menu();
		//音频配置
        this.soundManager = new SoundManager({
            sounds: [{
                id: "jump",
                urls: ["sound/jump.ogg", "sound/jump.mp3", "sound/jump.wav"],
                volume: .5
            }, {
                id: "coin",
                urls: ["sound/coin.ogg", "sound/coin.mp3", "sound/coin.wav"],
                volume: .5
            }, {
                id: "death",
                urls: ["sound/death.ogg", "sound/death.mp3", "sound/death.wav"],
                volume: .5
            }, {
                id: "break",
                urls: ["sound/penbreak.ogg", "sound/penbreak.mp3", "sound/penbreak.wav"],
                volume: .5
            }, {
                id: "rocket",
                urls: ["sound/rocket.ogg", "sound/rocket.mp3", "sound/rocket.wav"],
                volume: .5
            }, {
                id: "spring",
                urls: ["sound/spring.ogg", "sound/spring.mp3", "sound/spring.wav"],
                volume: .5
            }]
        });
        cycleManager.init(this.cycle.bind(this));
        DOM.on(document.body, "touchstart mousedown", this.handleDownEvent.bind(this));
        DOM.on(document.body, "touchmove mousemove", this.handleMoveEvent.bind(this));
        DOM.on(document.body, "touchend mouseup touchcancel", this.handleUpEvent.bind(this));
        DOM.on(document.body, "keydown", this.handleKeyDownEvent.bind(this));
        DOM.on(document.body, "keyup", this.handleKeyUpEvent.bind(this));
        DOM.on(document.body, "mousewheel DOMMouseScroll", this.handleWheelEvent.bind(this));
        DOM.on(window, "deviceorientation", this.handleOrientationChange.bind(this));
    }
    Game.prototype = {
        setScreen: function(screen) {
            this.setOverlay(null);
            if (this.curScreen) {
                this.curScreen.destroy()
            }
            this.curScreen = screen;
            this.curScreen.create();
            this.stage = this.curScreen.view;
            Tracker.beginStage("screen-" + screen.getId())
        },
        setOverlay: function(overlay) {
            if (this.curOverlay) {
                this.curOverlay.destroy();
                this.curOverlay = null
            }
            if (overlay) {
                this.curOverlay = overlay;
                this.curOverlay.create();
                this.stage.addChild(this.curOverlay.view);
                Tracker.beginStage("overlay-" + overlay.getId())
            }
        },
        cycle: function(elapsed) {
            this.lastCycleDate = Date.now();
            var before = Date.now();
            TweenPool.cycle(elapsed);
            this.curScreen.cycle(elapsed);
            var between = Date.now();
            this.stage.doRender(ctx);
            var after = Date.now();
            if (P.showFrameRate) {
                ctx.font = "20pt Arial";
                ctx.textAlign = "left";
                ctx.fillStyle = "#000";
                ctx.fillText("FPS: " + cycleManager.fps, 10, 20);
                ctx.fillText("Total: " + (after - before), 10, 40);
                ctx.fillText("Cycle: " + (between - before), 10, 60);
                ctx.fillText("Render: " + (after - between), 10, 80);
                ctx.fillText("Theoretical: " + Math.round(1e3 / Math.max(1, after - before)), 10, 100);
                ctx.fillText("Size: " + this.stage.leaves(), 10, 120)
            }
        },
        getPosition: function(e) {
            if (e.touches) e = e.touches[0];
            var canRect = can.getBoundingClientRect();
            return {
                x: (e.clientX - canRect.left) / window.resizer.scaleX(),
                y: (e.clientY - canRect.top) / window.resizer.scaleY()
            }
        },
        handleDownEvent: function(e) {
            if (Date.now() - this.lastCycleDate >= 1e3) {
                cycleManager.stop();
                cycleManager.resume()
            }
            var evtType = e.type.indexOf("touch") >= 0 ? "touch" : "mouse";
            this.inputType = this.inputType || evtType;
            if (evtType != this.inputType) return;
            if (this.down) return;
            this.down = true;
            this.lastEvent = this.getPosition(e);
            (this.curOverlay || this.curScreen).touchStart(this.lastEvent.x, this.lastEvent.y);
            if (evtType == "touch") {}
        },
        handleMoveEvent: function(e) {
            this.lastEvent = this.getPosition(e);
            if (this.down) {
                e.preventDefault();
                (this.curOverlay || this.curScreen).touchMove(this.lastEvent.x, this.lastEvent.y)
            }
            var area = (this.curOverlay || this.curScreen).areaContains(this.lastEvent.x, this.lastEvent.y);
            if (!area) {
                can.style.cursor = "default"
            } else {
                can.style.cursor = area.cursor
            } if (this.inputType == "touch") {
                e.preventDefault()
            }
        },
        handleUpEvent: function(e) {
            if (this.down) {
                (this.curOverlay || this.curScreen).touchEnd(this.lastEvent.x, this.lastEvent.y);
                this.down = false;
                this.lastEvent = null
            }
            window.scrollTo(0, 1)
        },
        handleKeyDownEvent: function(e) {
            (this.curOverlay || this.curScreen).keyDown(e.keyCode)
        },
        handleKeyUpEvent: function(e) {
            (this.curOverlay || this.curScreen).keyUp(e.keyCode)
        },
        handleWheelEvent: function(e) {
            var delta = Util.limit(e.wheelDelta || -e.detail, -1, 1);
            (this.curOverlay || this.curScreen).mouseWheel(delta)
        },
        handleOrientationChange: function(e) {
            this.hasAccelerometer = true;
            (this.curOverlay || this.curScreen).orientationChange(e.alpha, e.beta, e.gamma)
        },
        menu: function() {
            if (window.crossPromo) {
                crossPromo.show()
            }
            this.setScreen(new MainMenuScreen(this))
        },
        newAttempt: function() {
            if (window.crossPromo) {
                crossPromo.hide()
            }
            this.attempts++;
            this.setScreen(new GameplayScreen(this));
            if (!P.cocoon && Detect.isIOS()) {
                this.soundManager.play("jump")
            }
        },
		//结束界面
        end: function(score) {
            this.doubleClickRetry = P.inAppGames && this.attempts % this.adInterval == 0;
            if (window.crossPromo) {
                crossPromo.show()
            }
            var score = this.curScreen.score;
            this.highscore = Math.max(score, this.highscore);
			//存储最高分
            Util.storage.setItem(P.highscoreKey, this.highscore);
            var i = 0;
            while (i < this.scoreHistory.length && score > this.scoreHistory[i].score) {
                i++
            }
            this.scoreHistory.splice(i, 0, {
                score: score,
                date: Date.now()
            });
            if (this.scoreHistory.length > 20) {
                this.scoreHistory.shift()
            }
            Util.storage.setItem(P.historyKey, JSON.stringify(this.scoreHistory));
            this.setScreen(new EndScreen(this, this.curScreen.score));
            var fifties = ~~(score / 50);
            var tier = fifties * 50;
            Tracker.event("result", "tier-" + tier + "-" + (tier + 50))
        },

		//主界面右下图标
        openSaga: function() {
			location.href="../index.html";
        }
    };

    function Button(settings) {
        DisplayableContainer.call(this);
        Area.call(this, 0, 0, 0, 0);
        this.enabled = true;
        this.pressed = false;
        this.setup(settings)
    }
    Button.prototype = extendPrototype([DisplayableContainer, Area], {
        setup: function(settings) {
            this.action = settings.action || this.action || noop;
            if ("enabled" in settings) {
                this.enabled = settings.enabled
            }
            this.bgColor = settings.bgColor || "#ffffff";
            this.borderColor = settings.lineColor || "#000";
            this.borderRadius = isNaN(settings.borderRadius) ? 10 : settings.borderRadius;
            this.textColor = settings.textColor || "#000";
            this.textFont = settings.textFont || "Arial";
            this.fontSize = settings.fontSize || 20;
            this.outlineColor = settings.outlineColor || "#000";
            this.outlineWidth = settings.outlineWidth || 0;
            this.id = settings.id || undefined;
            this.setContent(settings.content);
            this.width = settings.width || this.width || 404;
            this.height = settings.height || this.height || 125
        },
        setContent: function(arg0) {
            this.text = this.image = null;
            if (arg0.length) {
                this.type = "button";
                this.text = arg0;
                this.id = this.text
            } else if (arg0.width) {
                this.type = "image";
                this.image = arg0;
                this.width = this.width || arg0.width;
                this.height = this.height || arg0.height
            } else {
                this.type = "object";
                this.addChild(arg0)
            }
        },
        render: function(c) {
            c.globalAlpha *= this.pressed ? .5 : 1;
            c.font = this.fontSize + "pt " + this.textFont;
            c.textAlign = "center";
            c.textBaseline = "middle";
            if (this.type == "text") {
                c.fillStyle = this.textColor;
                c.fillText(this.text, this.width / 2, this.height / 2)
            } else if (this.type == "image") {
                c.drawImage(this.image, 0, 0, this.image.width, this.image.height, (this.width - this.image.width) / 2, (this.height - this.image.height) / 2, this.image.width, this.image.height)
            }
            if (this.outlineWidth > 0) {
                c.lineWidth = this.outlineWidth;
                c.strokeStyle = this.outlineColor;
                c.strokeText(this.text, this.width / 2, this.height / 2 + 3)
            }
            DisplayableContainer.prototype.render.call(this, c)
        },
        actionPerformed: function(x, y) {
            this.pressed = false;
            if (this.enabled) {
                this.action();
                if (this.id) {
                    Tracker.event("button-click", "button-" + this.id)
                }
            }
        },
        actionStart: function(x, y) {
            this.pressed = true
        },
        actionCancel: function(x, y) {
            this.pressed = false
        }
    });

    function MainMenuScreen(game) {
        Screen.call(this, game)
    }
    MainMenuScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "mainmenu"
        },
        create: function() {
            this.view = new DisplayableContainer;
            this.background = new DisplayableImage;
            this.background.image = R.image.bg;
            this.view.addChild(this.background);
            this.logo = new DisplayableImage;
            this.logo.image = R.image.logo;
            this.view.addChild(this.logo);
            var playImage = new AnimatedView({
                frames: [{
                    image: R.sprite.button_play_1,
                    duration: .3
                }, {
                    image: R.sprite.button_play_2,
                    duration: .3
                }, {
                    image: R.sprite.button_play_3,
                    duration: .3
                }]
            });
            playImage.animate();
            this.playButton = new Button({
                id: "play",
                content: playImage,
                action: this.play.bind(this),
                width: R.sprite.button_play_1.width,
                height: R.sprite.button_play_1.height
            });
            this.playButton.x = (P.width - this.playButton.width) / 2;
            this.playButton.y = 600;
            this.view.addChild(this.playButton);
            this.addArea(this.playButton);
            if (!P.cocoon) {
                this.sagaButton = new Button({
                    id: "saga",
                    content: R.image.jumpsaga,
                    action: this.saga.bind(this)
                });
                this.sagaButton.x = P.width - this.sagaButton.width - 20;
                this.sagaButton.y = P.height - this.sagaButton.height - 20;
                this.view.addChild(this.sagaButton);
                this.addArea(this.sagaButton)
            }
        },
        play: function() {
            this.game.newAttempt()
        },
        saga: function() {
            this.game.openSaga()
        }
    });

    function EndScreen(game, score) {
        Screen.call(this, game);
        this.score = score
    }
    EndScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "end"
        },
        create: function() {
            this.view = new DisplayableContainer;
            this.background = new DisplayableImage;
            this.background.image = R.image.bg;
            this.view.addChild(this.background);
            this.title = new DisplayableTextField;
            this.view.addChild(this.title);
            with(this.title) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#612a9b";
                text = "Score:";
                font = "60pt Microsoft YaHei";
                x = P.width / 2;
                y = 100
            }
            this.scoreTf = new DisplayableTextField;
            this.view.addChild(this.scoreTf);
            with(this.scoreTf) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#af5454";
                text = this.score + "pts";
                font = "80pt Microsoft YaHei";
                x = P.width / 2;
                y = 300
            }
            this.cloud = new DisplayableImage;
            with(this.cloud) {
                image = R.sprite.end_cloud;
                x = P.width / 2;
                y = 600;
                anchorX = -image.width / 2
            }
            this.view.addChild(this.cloud);
            var cloudArea = new Area({
                x: P.width / 2 - 50,
                y: this.cloud.y - 50,
                width: 100,
                height: 200,
                actionPerformed: this.retry.bind(this)
            });
            this.addArea(cloudArea);
            this.character = new DisplayableImage;
            with(this.character) {
                image = R.sprite.end_character;
                x = P.width / 2;
                y = this.cloud.y - 80;
                anchorX = -image.width / 2
            }
            this.view.addChild(this.character);
            if (this.score >= this.game.highscore) {
                var crown = new DisplayableImage;
                crown.image = R.sprite.crown;
                crown.x = 370;
                crown.y = 150;
                this.view.addChild(crown);
                this.title.text = "New!"
            } else {
                var highscoreTf = new DisplayableTextField;
                this.view.addChild(highscoreTf);
                with(highscoreTf) {
                    textAlign = "center";
                    textBaseline = "middle";
                    color = "#612a9b";
                    text = "Best: " + this.game.highscore;
                    font = "30pt Microsoft YaHei";
                    x = P.width / 2;
                    y = 450
                }
            }
			//结束界面按钮
            var me = this;
            var buttons = [];
            buttons.push(new Button({
                id: "retry",
                content: R.sprite.button_retry,
                action: this.retry.bind(this)
            }));
            if (!P.cocoon && !P.inAppGames) {
                buttons.push(new Button({
                    id: "menu",
                    content: R.sprite.button_leaderboard,
                    action: this.leaderboard.bind(this)
                }))
            }

			buttons.push(new Button({
				id: "plus",
				content: R.image.button_plus,
				action: this.saga.bind(this)
			}))

            var buttonWidth = 160;
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].x = (i + .5 - buttons.length / 2) * buttonWidth + P.width / 2 - buttons[i].width / 2;
                buttons[i].y = P.height - 200;
                this.view.addChild(buttons[i]);
                this.addArea(buttons[i])
            }
            this.initialAnimation = new Tween(this.character, "y", P.height, this.character.y, 2, 0);
            TweenPool.add(this.initialAnimation)
        },
        retry: function() {
            if (P.inAppGames && this.game.doubleClickRetry) {
                this.game.doubleClickRetry = false;
            } else {
                var me = this;
                setTimeout(function() {
                    me.game.newAttempt()
                }, 1e3);
                this.cloud.visible = false;
                this.initialAnimation.cancel();
                this.character.image = R.sprite.character_fall;
                TweenPool.add(new Interpolation({
                    object: this.character,
                    property: "y",
                    from: this.character.y,
                    to: P.height,
                    duration: .5,
                    easing: Math.easeInCubic
                }))
            }
        },
		//123按钮 回到主页
        leaderboard: function() {
			location.href="../index.html";
        },
		//叉叉按钮 删除历史记录
        saga: function() {
			this.scoreHistory = [];
			this.highscore = 0;
			Util.storage.setItem(P.historyKey, JSON.stringify(this.scoreHistory));
			Util.storage.setItem(P.highscoreKey, this.highscore);
			alert('scoreHistory is deleted');
			location.reload();
        }
    });

    function GameplayScreen(game) {
        Screen.call(this, game)
    }
    GameplayScreen.prototype = extendPrototype(Screen, {
        getId: function() {
            return "gameplay"
        },
        create: function() {
            this.view = new DisplayableContainer;
            this.camera = new Camera(this);
            this.background = new DisplayableImage;
            this.background.image = R.image.bg;
            this.view.addChild(this.background);
            this.contentView = new DisplayableContainer;
            this.view.addChild(this.contentView);
            this.elementsContainer = new ElementsContainer(this.camera);
            this.contentView.addChild(this.elementsContainer);
            this.character = new GameplayCharacter(this);
            this.character.x = P.width / 2;
            this.character.y = -100;
            this.contentView.addChild(this.character);
            this.elements = [];
            this.areasSpawned = 0;
            this.minAreaY = 0;
            this.createNewArea();
            this.controller = new HybridController(this);
            this.minCharacterY = 0;
            this.bonusValues = 0;
            this.scoreTf = new DisplayableTextField;
            this.view.addChild(this.scoreTf);
			//游戏时分数文字
            with(this.scoreTf) {
                x = P.width / 2;
                y = 60;
                textAlign = "center";
                textBaseline = "middle";
                color = "#4684d0";
                font = "60pt Microsoft YaHei";
                shadowColor = "#fff";
                shadowOffsetX = 2;
                shadowOffsetY = 2
            }
            if (this.game.attempts <= 2) {
                this.tutorialTf = new MultilineTextField;
                this.view.addChild(this.tutorialTf);
				//开始游戏提示文字
                with(this.tutorialTf) {
                    x = P.width / 2;
                    y = 250;
                    textAlign = "center";
                    textBaseline = "middle";
                    color = "#000";
                    font = "30pt Microsoft YaHei";
                    text = Util.isTouchScreen() ? this.game.hasAccelerometer ? "Tilt the screen to move" : "Touch left and right to move" : "Use arrow keys to move";
                    maxWidth = P.width;
                    lineHeight = 90
                }
                TweenPool.add(new Interpolation({
                    object: this.tutorialTf,
                    property: "y",
                    from: -200,
                    to: this.tutorialTf.y,
                    duration: .5,
                    easing: Math.easeOutBack,
                    delay: .5,
                    onFinish: function() {
                        TweenPool.add(new Interpolation({
                            object: this.object,
                            property: "y",
                            from: this.object.y,
                            to: -200,
                            duration: .5,
                            easing: Math.easeInBack,
                            delay: 2,
                            onFinish: function() {
                                this.object.remove()
                            }
                        }))
                    }
                }))
            }
            this.createNewArea();
            this.createNewArea();
            this.animateElements();
            this.character.block();
            var me = this;
            setTimeout(function() {
                me.character.unblock()
            }, 1200);
            this.addHistory()
        },
        cycle: function(e) {
            var tmpY = this.character.y;
            this.character.cycle(e);
            this.controller.cycle(e);
            this.camera.cycle(e);
            var i = -1;
            while (this.elements[++i]) {
                this.elements[i].cycle(e)
            }
            this.contentView.x = -this.camera.x;
            this.contentView.y = -this.camera.y;
            if (this.camera.y <= this.minAreaY) {
                this.createNewArea()
            }
            if (this.character.y >= this.camera.y + P.height) {
                this.gameOver()
            }
            if (this.elements[0] && this.elements[0].y > this.camera.y + P.height) {
                var p = this.elements.shift();
                TweenPool.add(new Tween(p, "alpha", 1, 0, .2, 0, function() {
                    this.object.remove()
                }))
            }
            if (!this.ended) {
                this.minCharacterY = Math.min(this.minCharacterY, this.character.y);
                this.realScore = -this.minCharacterY / P.pxPerPt + this.bonusValues;
                this.score = ~~this.realScore;
                this.scoreTf.text = "Score: " + this.score
            }
        },
        createNewArea: function(spawnerType) {
            var maxY = this.minAreaY;
            if (!spawnerType) {
                var spawnerPool = [];
                if (this.areasSpawned == 0) {
                    spawnerPool.push(FloorAreaSpawner)
                } else {
                    spawnerPool.push(BasicAreaSpawner);
                    if (this.areasSpawned > 3) {
                        spawnerPool.push(BreakingPathAreaSpawner);
                        spawnerPool.push(RocketAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner)
                    }
                    if (this.areasSpawned > 6) {
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(BasicAreaSpawner);
                        spawnerPool.push(TeleportingAreaSpawner);
                        spawnerPool.push(SpringPathAreaSpawner);
                        spawnerPool.push(MovingPlatformsAreaSpawner);
                        spawnerPool.push(StairsetAreaSpawner);
                        spawnerPool.push(RocketAreaSpawner);
                        spawnerPool.push(MovingSpringAreaSpawner);
                        spawnerPool.push(MovingBreakingPlatformsAreaSpawner);
                        spawnerPool.push(AccordionAreaSpawner);
                        spawnerPool.push(BigStepAreaSpawner)
                    }
                }
                spawnerType = Util.randomPick.apply(null, spawnerPool)
            }
            var spawner = new spawnerType(this);
            var platforms = spawner.createArea(maxY);
            platforms.sort(function(a, b) {
                return b.y - a.y
            });
            this.minAreaY = platforms[platforms.length - 1].y - 40;
            var i = -1;
            while (platforms[++i]) {
                this.add(platforms[i]);
                if (Math.random() < 1 / 25 && this.areasSpawned > 2) {
                    var star = new Star(this);
                    star.x = platforms[i].x;
                    star.y = platforms[i].y - 100;
                    this.add(star)
                }
            }
            this.areasSpawned++
        },
        add: function(p) {
            p.x = ~~p.x;
            p.y = ~~p.y;
            var i = -1;
            while (this.elements[++i] && p.y < this.elements[i].y);
            this.elements.splice(i, 0, p);
            this.elementsContainer.addChild(p)
        },
        touchStart: function(x, y) {
            this.controller.touchStart(x, y)
        },
        touchEnd: function(x, y) {
            this.controller.touchEnd(x, y)
        },
        touchMove: function(x, y) {
            this.controller.touchMove(x, y)
        },
        keyDown: function(keyCode) {
            this.controller.keyDown(keyCode)
        },
        keyUp: function(keyCode) {
            this.controller.keyUp(keyCode)
        },
        orientationChange: function(alpha, beta, gamma) {
            this.controller.orientationChange(alpha, beta, gamma)
        },
        gameOver: function() {
            if (!this.ended) {
                this.ended = true;
                this.scoreTf.visible = false;
                this.character.dead = true;
                this.camera.fall();
                setTimeout(this.game.end.bind(this.game), 2500);
                var ahh1 = new DisplayableImage;
                ahh1.image = R.image.ahh1;
                ahh1.x = (P.width - ahh1.image.width) / 2;
                ahh1.y = 100;
                this.view.addChild(ahh1);
                var ahh2 = new DisplayableImage;
                ahh2.image = R.image.ahh2;
                ahh2.x = (P.width - ahh2.image.width) / 2 + 20;
                ahh2.y = 300;
                this.view.addChild(ahh2);
                var ahh3 = new DisplayableImage;
                ahh3.image = R.image.ahh3;
                ahh3.x = (P.width - ahh3.image.width) / 2 + 60;
                ahh3.y = 500;
                this.view.addChild(ahh3);
                ahh1.visible = ahh2.visible = ahh3.visible = false;
                var show = function() {
                    this.visible = true
                };
                setTimeout(show.bind(ahh1), 700);
                setTimeout(show.bind(ahh2), 1100);
                setTimeout(show.bind(ahh3), 1500);
                this.game.soundManager.play("death")
            }
        },
        animateElements: function() {
            var i = -1,
                prop;
            while (this.elements[++i]) {
                prop = Util.randomPick("x", "y");
                TweenPool.add(new Interpolation({
                    object: this.elements[i],
                    property: prop,
                    from: this.elements[i][prop] + Util.rand(-400, 400),
                    to: this.elements[i][prop],
                    duration: .5 + Math.random() * .5,
                    easing: Math.easeOutBack
                }))
            }
        },
        addHistory: function() {
            var h = this.game.scoreHistory;
            for (var i = 0; i < h.length; i++) {
                this.add(new ScoreIndicator(h[i]))
            }
        }
    });

    function ElementsContainer(camera) {
        DisplayableContainer.call(this);
        this.camera = camera
    }
    ElementsContainer.prototype = extendPrototype(DisplayableContainer, {
        render: function(c) {
            var i = -1,
                ch, rendered = 0;
            while (ch = this.children[++i]) {
                if (ch.y > this.camera.y) {
                    ch.doRender(c);
                    rendered++
                }
            }
        }
    });

    function GameplayCharacter(screen) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.vY = 0;
        this.prevX = this.x;
        this.prevY = this.y;
        this.view = new DisplayableImage;
        this.view.image = R.sprite.character_fall;
        this.view.anchorX = -this.view.image.width / 2;
        this.view.anchorY = -this.view.image.height;
        this.addChild(this.view);
        this.rocketView = new AnimatedView({
            frames: [{
                image: R.sprite.rocket_fire_1,
                duration: .2,
                anchorX: -R.sprite.rocket_fire_1.width / 2,
                anchorY: -129
            }, {
                image: R.sprite.rocket_fire_2,
                duration: .2,
                anchorX: -R.sprite.rocket_fire_2.width / 2,
                anchorY: -129
            }]
        });
        this.rocketView.visible = false;
        this.addChild(this.rocketView);
        this.dead = false;
        this.mode = "normal"
    }
    GameplayCharacter.prototype = extendPrototype(DisplayableContainer, {
        cycle: function(e) {
            if (this.mode === "normal") {
                this.scaleX = Util.sign(this.x - this.prevX) || 1;
                this.prevX = this.x;
                this.prevY = this.y;
                this.vY += e * 1200;
                this.y += this.vY * e;
                this.view.image = this.vY > 0 ? R.sprite.character_fall : R.sprite.character_jump
            }
        },
        jump: function(ratio) {
            if (this.vY >= 0 && this.mode === "normal") {
                this.vY = -800 * (ratio || 1)
            }
        },
        steppedOnPin: function() {
            if (this.mode === "normal") {
                var tf = new DisplayableTextField;
                this.parent.addChild(tf);
                with(tf) {
                    x = this.x;
                    y = this.y;
                    textBaseline = "middle";
                    textAlign = "center";
                    font = "40pt Microsoft YaHei";
                    color = "#8e3432";
                    text = "Ouch!"
                }
                TweenPool.add(new Tween(tf, "y", this.y, this.y - 200, .3));
                TweenPool.add(new Tween(tf, "scaleX", 0, 1, .3));
                TweenPool.add(new Tween(tf, "scaleY", 0, 1, .3));
                this.dead = true;
                this.vY = 0;
                this.jump(.5);
                return;
                var me = this;
                TweenPool.add(new Interpolation({
                    object: this,
                    property: "y",
                    from: this.y,
                    to: this.y - 100,
                    duration: .2,
                    easing: Math.easeOutQuart,
                    onFinish: function() {
                        setTimeout(function() {
                            me.unblock()
                        }, 10)
                    }
                }))
            }
        },
        readjustPosition: function() {
            this.x = (this.x + P.width) % P.width
        },
        setX: function(x) {
            if (this.mode === "normal" || this.mode === "rocket") {
                this.x = x;
                this.readjustPosition()
            }
        },
        block: function() {
            this.mode = "blocked"
        },
        unblock: function() {
            this.mode = "normal"
        },
        startRocket: function() {
            if (this.mode === "normal") {
                this.mode = "blocked";
                var me = this;
                setTimeout(function() {
                    me.mode = "rocket"
                }, 500);
                this.rocketView.visible = true;
                this.rocketView.animate();
                this.view.visible = false;
                var targetY = this.y - 10 * P.width;
                TweenPool.add(new Interpolation({
                    object: this,
                    property: "y",
                    from: this.y,
                    to: targetY,
                    duration: 4,
                    easing: Math.easeInCubic,
                    onFinish: this.endRocket.bind(this)
                }));
                var spawner = new FloorAreaSpawner(this.screen);
                var platforms = spawner.createArea(targetY);
                for (var i in platforms) {
                    this.screen.add(platforms[i], true)
                }
                var spawner = new BasicAreaSpawner(this.screen);
                var platforms = spawner.createArea(targetY);
                for (var i in platforms) {
                    this.screen.add(platforms[i], true)
                }
                this.vY = 0;
                this.scaleX = 1;
                this.screen.game.soundManager.play("rocket")
            }
        },
        endRocket: function() {
            if (this.mode === "rocket") {
                this.mode = "normal";
                this.rocketView.visible = false;
                this.rocketView.stop();
                this.view.visible = true;
                this.vY = 0;
                this.jump();
                var rocketView = new DisplayableImage;
                rocketView.image = R.sprite.rocket_idle;
                rocketView.anchorX = -rocketView.image.width / 2;
                rocketView.anchorY = -rocketView.image.height;
                rocketView.x = this.x;
                rocketView.y = this.y;
                this.screen.contentView.addChild(rocketView);
                TweenPool.add(new Tween(rocketView, "y", rocketView.y, rocketView.y - 2 * P.height, 1, 0, function() {
                    this.object.remove()
                }))
            }
        }
    });

    function Camera(screen) {
        this.screen = screen;
        this.baseX = 0;
        this.baseY = -P.height * .9;
        this.shakeTime = 0;
        this.mode = "track"
    }
    Camera.prototype = {
        cycle: function(e) {
            if (this.mode == "track") {
                this.baseX = 0;
                this.baseY = Math.min(this.screen.character.y - P.height / 2 - 150, this.baseY)
            } else if (this.mode == "fall") {
                this.baseY += 2e3 * e
            }
            this.x = ~~this.baseX;
            this.y = ~~this.baseY;
            this.shakeTime -= e;
            if (this.shakeTime > 0) {
                this.x += Util.rand(-10, 10);
                this.y += Util.rand(-10, 10)
            }
        },
        shake: function(t) {
            this.shakeTime = t
        },
        fall: function() {
            this.mode = "fall"
        }
    };

    function ScoreIndicator(scoreData) {
        DisplayableContainer.call(this);
        this.y = -scoreData.score * P.pxPerPt;
        var l = new DisplayableImage;
        l.image = R.sprite.line;
        l.x = P.width - l.image.width;
        this.addChild(l);
        var d = new Date(scoreData.date);
        var t = new DisplayableTextField;
        this.addChild(t);
        with(t) {
            x = P.width - 5;
            y = l.y - 1;
            font = "20pt Microsoft YaHei";
            textBaseline = "bottom";
            text = d.getUTCMonth() + "/" + d.getUTCDate() + "/" + d.getUTCFullYear();
            color = "#8e3432";
            textAlign = "right"
        }
        var dt = Date.now() - scoreData.date,
            txt;
        if (dt > 3 * 24 * 3600 * 1e3) {
            txt = d.getUTCMonth() + "/" + d.getUTCDate() + "/" + d.getUTCFullYear()
        } else if (dt > 24 * 3600 * 1e3) {
            txt = Math.floor(dt / (24 * 3600 * 1e3)) + " days ago"
        } else if (dt > 3600 * 1e3) {
            txt = Math.floor(dt / (3600 * 1e3)) + " hours ago"
        } else if (dt > 60 * 1e3) {
            txt = Math.floor(dt / (60 * 1e3)) + " minutes ago"
        } else {
            txt = "just now"
        }
        t.text = txt
    }
    ScoreIndicator.prototype = extendPrototype(DisplayableContainer, {
        cycle: function(e) {}
    });

    function Star(screen) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.radius = 50;
        this.enabled = true;
        this.vX = this.vY = 0;
        this.image = new DisplayableImage;
        this.image.image = R.sprite.star;
        this.image.anchorX = -this.image.image.width / 2;
        this.image.anchorY = -this.image.image.height / 2;
        this.addChild(this.image)
    }
    Star.prototype = extendPrototype(DisplayableContainer, {
        pickup: function(character) {
            this.enabled = false;
            this.image.remove();
            var bonus = 50;
            this.screen.bonusValues += bonus;
            var tf = new DisplayableTextField;
            this.addChild(tf);
            with(tf) {
                textAlign = "center";
                textBaseline = "middle";
                color = "#fffc2a";
                font = "20pt Microsoft YaHei";
                text = "+" + bonus;
                shadowColor = "#ffc700";
                shadowOffsetX = 2;
                shadowOffsetY = 2
            }
            TweenPool.add(new Tween(tf, "scaleX", 1, 2, 1));
            TweenPool.add(new Tween(tf, "scaleY", 1, 2, 1));
            TweenPool.add(new Tween(tf, "alpha", 1, 0, 1, 0, function() {
                this.object.remove()
            }));
            this.screen.game.soundManager.play("coin");
            Tracker.event("gameplay", "pickup-star")
        },
        shouldCharacterPickup: function(character) {
            return this.enabled && Math.abs(character.x - this.x) <= this.radius && Math.abs(character.y - this.y) <= this.radius
        },
        cycle: function(e) {
            window.obj = this;
            if (this.shouldCharacterPickup(this.screen.character)) {
                this.pickup(this.screen.character)
            }
            if (this.vX != 0) {
                this.x += this.vX * e;
                if (this.x > this.maxX) {
                    this.x = this.maxX;
                    this.vX = -Math.abs(this.vX)
                } else if (this.x < this.minX) {
                    this.x = this.minX;
                    this.vX = Math.abs(this.vX)
                }
            }
            if (this.vY != 0) {
                this.y += this.vY * e;
                if (this.y > this.maxY) {
                    this.y = this.maxY;
                    this.vY = -Math.abs(this.vY)
                } else if (this.y < this.minY) {
                    this.y = this.minY;
                    this.vY = Math.abs(this.vY)
                }
            }
        }
    });

    function Platform(screen) {
        DisplayableContainer.call(this);
        this.screen = screen;
        this.radius = 40;
        var me = this;
        this.enabled = true;
        this.vX = 0;
        this.minX = 40;
        this.maxX = P.width - 40;
        this.vY = 0;
        this.minY = this.maxY = 0;
        this.landSound = null
    }
    Platform.prototype = extendPrototype(DisplayableContainer, {
        characterLanded: function(character) {
            this.screen.game.soundManager.play(this.landSound)
        },
        shouldCharacterLand: function(character) {
            return this.enabled && !character.dead && character.vY > 0 && Util.sign(character.y - this.y) != Util.sign(character.prevY - this.y) && Math.abs(this.x - character.x) < this.radius
        },
        cycle: function(e) {
            if (this.shouldCharacterLand(this.screen.character)) {
                this.characterLanded(this.screen.character)
            }
            if (this.vX != 0) {
                this.x += this.vX * e;
                if (this.x > this.maxX) {
                    this.x = this.maxX;
                    this.vX = -Math.abs(this.vX)
                } else if (this.x < this.minX) {
                    this.x = this.minX;
                    this.vX = Math.abs(this.vX)
                }
            }
            if (this.vY != 0) {
                this.y += this.vY * e;
                if (this.y > this.maxY) {
                    this.y = this.maxY;
                    this.vY = -Math.abs(this.vY)
                } else if (this.y < this.minY) {
                    this.y = this.minY;
                    this.vY = Math.abs(this.vY)
                }
            }
        }
    });

    function BasicPlatform(screen) {
        Platform.call(this, screen);
        this.radius = 70;
        var view = new DisplayableImage;
        view.image = R.sprite.eraser;
        view.anchorX = -view.image.width / 2;
        view.anchorY = -view.image.height / 2;
        this.addChild(view);
        this.landSound = "jump"
    }
    BasicPlatform.prototype = extendPrototype(Platform, {
        characterLanded: function(character) {
            character.y = this.y - 1;
            character.prevY = this.y - 1;
            character.jump();
            TweenPool.add(new Tween(this, "scaleX", 1.2, 1, .2));
            Platform.prototype.characterLanded.call(this, character)
        }
    });

    function BreakingPlatform(screen) {
        Platform.call(this, screen);
        this.radius = 80;
        var view = new DisplayableImage;
        view.image = R.sprite.pencil;
        view.anchorX = -view.image.width / 2;
        view.anchorY = -view.image.height / 2;
        this.addChild(view);
        this.landSound = "break"
    }
    BreakingPlatform.prototype = extendPrototype(Platform, {
        characterLanded: function(character) {
            Platform.prototype.characterLanded.call(this, character);
            this.enabled = false;
            character.y = this.y - 1;
            character.prevY = this.y - 1;
            character.jump();
            this.clear();
            var view = new DisplayableImage;
            view.image = R.sprite.pencil_broken;
            view.anchorX = -view.image.width / 2;
            view.anchorY = -view.image.height / 2;
            this.addChild(view);
            TweenPool.add(new Tween(view, "y", 0, 200, .7, 0, function() {
                this.object.remove()
            }))
        }
    });

    function TeleportingPlatform(screen) {
        Platform.call(this, screen);
        this.radius = 80;
        var view = new DisplayableImage;
        view.image = R.sprite.cloud;
        view.anchorX = -view.image.width / 2;
        view.anchorY = -view.image.height / 2;
        this.addChild(view);
        this.landSound = "jump"
    }
    TeleportingPlatform.prototype = extendPrototype(Platform, {
        characterLanded: function(character) {
            character.y = this.y - 1;
            character.prevY = this.y - 1;
            character.jump();
            this.clear();
            this.enabled = false;
            var p = new TeleportingPlatform(this.screen);
            p.x = Util.limit(this.x + Util.rand(-200, 200), p.radius, P.width - p.radius);
            p.y = this.y - Util.rand(80, 120);
            this.screen.add(p);
            Platform.prototype.characterLanded.call(this, character)
        }
    });

    function SpringPlatform(screen) {
        BasicPlatform.call(this, screen);
        this.spring = new DisplayableImage;
        this.spring.image = R.sprite.spring_small;
        this.spring.anchorX = -this.spring.image.width / 2;
        this.spring.anchorY = -this.spring.image.height;
        this.addChild(this.spring);
        this.landSound = "spring"
    }
    SpringPlatform.prototype = extendPrototype(BasicPlatform, {
        characterLanded: function(character) {
            character.y = this.y - 1;
            character.prevY = this.y - 1;
            character.jump(2);
            this.spring.image = R.sprite.spring_big;
            this.spring.anchorX = -this.spring.image.width / 2;
            this.spring.anchorY = -this.spring.image.height;
            BasicPlatform.prototype.characterLanded.call(this, character)
        }
    });

    function RocketPlatform(screen) {
        BasicPlatform.call(this, screen);
        this.rocket = new DisplayableImage;
        this.rocket.image = R.sprite.rocket_idle;
        this.rocket.anchorX = -this.rocket.image.width / 2;
        this.rocket.anchorY = -this.rocket.image.height;
        this.addChild(this.rocket)
    }
    RocketPlatform.prototype = extendPrototype(BasicPlatform, {
        cycle: function(e) {
            BasicPlatform.prototype.cycle.call(this, e);
            if (this.rocket && this.screen.character.mode === "normal" && Math.abs(this.x - this.screen.character.x) < this.radius && this.y > this.screen.character.y && this.y - this.screen.character.y < this.radius) {
                this.rocket.remove();
                this.rocket = null;
                this.screen.character.x = this.x;
                this.screen.character.y = this.y - 1;
                this.screen.character.startRocket();
                Tracker.event("gameplay", "pickup-rocket")
            }
        }
    });

    function PinPlatform(screen) {
        Platform.call(this, screen);
        this.radius = 70;
        var view = new DisplayableImage;
        view.image = R.sprite.platform_pins;
        view.anchorX = -view.image.width / 2;
        view.anchorY = -view.image.height / 2;
        this.addChild(view)
    }
    PinPlatform.prototype = extendPrototype(Platform, {
        characterLanded: function(character) {
            Platform.prototype.characterLanded.call(this, character);
            character.steppedOnPin()
        }
    });

    function AreaSpawner(screen) {
        this.screen = screen
    }
    AreaSpawner.prototype = {
        createArea: function(maxY) {
            return []
        }
    };

    function BasicAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    BasicAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                if (Math.random() < .15) {
                    p = new SpringPlatform(this.screen)
                } else {
                    p = new BasicPlatform(this.screen)
                }
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                platforms.push(p)
            }
            var density = Math.max(2, 6 - this.screen.areasSpawned / 5);
            for (var i = 0; i < density; i++) {
                if (Math.random() < .2 && this.screen.areasSpawned >= 3) {
                    if (Math.random() < .5) {
                        p = new BreakingPlatform(this.screen)
                    } else {
                        p = new PinPlatform(this.screen)
                    }
                } else {
                    p = new BasicPlatform(this.screen)
                }
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = ~~Util.rand(minY, maxY);
                platforms.push(p)
            }
            return platforms
        }
    });

    function FloorAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    FloorAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var platforms = [],
                cols = 5,
                p;
            for (var i = 0; i < cols; i++) {
                p = new BasicPlatform(this.screen);
                p.x = P.width * (i + 1) / (cols + 1);
                p.y = maxY;
                platforms.push(p)
            }
            return platforms
        }
    });

    function BreakingPathAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    BreakingPathAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                p = new BreakingPlatform(this.screen);
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                platforms.push(p)
            }
            return platforms
        }
    });

    function TeleportingAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    TeleportingAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height / 2;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            for (var i = 0; i < 3; i++) {
                p = new TeleportingPlatform(this.screen);
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = maxY + 10;
                platforms.push(p)
            }
            p = new BasicPlatform(this.screen);
            p.x = ~~Util.rand(p.radius, P.width - p.radius);
            p.y = minY;
            platforms.push(p);
            return platforms
        }
    });

    function SpringPathAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    SpringPathAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height * 4;
            var minHeightDiff = 200;
            var maxHeightDiff = 300;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                p = new SpringPlatform(this.screen);
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                platforms.push(p)
            }
            return platforms
        }
    });

    function MovingPlatformsAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    MovingPlatformsAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                if (Math.random() < .15) {
                    p = new SpringPlatform(this.screen)
                } else {
                    p = new BasicPlatform(this.screen)
                }
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                p.vX = Util.randomPick(-100, 100);
                platforms.push(p)
            }
            return platforms
        }
    });

    function MovingBreakingPlatformsAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    MovingBreakingPlatformsAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                p = new BreakingPlatform(this.screen);
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                p.vX = Util.randomPick(-100, 100);
                platforms.push(p)
            }
            return platforms
        }
    });

    function ElevatorAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    ElevatorAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            var cols = 4,
                rows = 2;
            for (var c = 0; c < cols; c++) {
                for (var r = 0; r < rows; r++) {
                    p = new BasicPlatform(this.screen);
                    p.minY = minY + (maxY - minY) * r / rows;
                    p.maxY = minY + (maxY - minY) * (r + 1) / rows;
                    p.x = P.width * (c + 1) / (cols + 1);
                    p.y = Util.rand(p.minY, p.maxY);
                    p.vY = Util.randomPick(-100, 100);
                    platforms.push(p)
                }
                p = new BasicPlatform(this.screen);
                p.x = P.width * (c + 1) / (cols + 1);
                p.y = minY + (maxY - minY) * r / rows;
                platforms.push(p)
            }
            return platforms
        }
    });

    function StairsetAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    StairsetAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height * 2;
            var minHeightDiff = 100;
            var maxHeightDiff = 200;
            var p, platforms = [];
            var nextX = Util.rand(40, P.width - 40),
                direction = Util.randomPick(-1, 1),
                difference = 200;
            for (var y = maxY; y >= minY; y -= 200) {
                if (Math.random() < .2) {
                    p = new BreakingPlatform(this.screen)
                } else {
                    p = new BasicPlatform(this.screen)
                }
                p.x = nextX;
                p.y = y;
                platforms.push(p);
                nextX += direction * difference;
                if (nextX > P.width - p.radius) {
                    nextX = P.width - p.radius;
                    direction *= -1
                } else if (nextX < p.radius) {
                    nextX = p.radius;
                    direction *= -1
                }
            }
            return platforms
        }
    });

    function RocketAreaSpawner(screen) {
        BasicAreaSpawner.call(this, screen)
    }
    RocketAreaSpawner.prototype = extendPrototype(BasicAreaSpawner, {
        createArea: function(maxY) {
            var platforms = BasicAreaSpawner.prototype.createArea.call(this, maxY);
            var p = new RocketPlatform(this.screen);
            p.x = Util.rand(p.radius, P.width - p.radius);
            p.y = maxY;
            platforms.push(p);
            return platforms
        }
    });

    function MovingSpringAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    MovingSpringAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height * 4;
            var minHeightDiff = 200;
            var maxHeightDiff = 300;
            var p, platforms = [];
            for (var y = maxY; y >= minY; y -= Util.rand(minHeightDiff, maxHeightDiff)) {
                p = new SpringPlatform(this.screen);
                p.x = ~~Util.rand(p.radius, P.width - p.radius);
                p.y = y;
                p.vX = Util.randomPick(-100, 100);
                platforms.push(p)
            }
            return platforms
        }
    });

    function AccordionAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    AccordionAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height * 3;
            var heightDiff = 50;
            var p, platforms = [];
            var nextX = Util.rand(40, P.width - 40),
                direction = Util.randomPick(-1, 1),
                difference = 50;
            for (var y = maxY; y >= minY; y -= heightDiff) {
                p = new BasicPlatform(this.screen);
                p.x = nextX;
                p.y = y;
                p.vX = 200;
                platforms.push(p);
                nextX += direction * difference;
                if (nextX > P.width - p.radius) {
                    nextX = P.width - p.radius;
                    direction *= -1
                } else if (nextX < p.radius) {
                    nextX = p.radius;
                    direction *= -1
                }
            }
            return platforms
        }
    });

    function BigStepAreaSpawner(screen) {
        AreaSpawner.call(this, screen)
    }
    BigStepAreaSpawner.prototype = extendPrototype(AreaSpawner, {
        createArea: function(maxY) {
            var minY = maxY - P.height * 3;
            var heightDiff = 50;
            var p, platforms = [],
                platformsPerStep = 10;
            var nextX = Util.rand(40, P.width - 40),
                direction = Util.randomPick(-1, 1),
                difference = 150;
            for (var y = maxY; y >= minY; y -= heightDiff) {
                p = new BasicPlatform(this.screen);
                p.x = nextX;
                p.y = y;
                p.vX = 200;
                platforms.push(p);
                if (platforms.length % platformsPerStep == 0) {
                    nextX += direction * difference;
                    if (nextX > P.width - p.radius) {
                        nextX = P.width - p.radius;
                        direction *= -1
                    } else if (nextX < p.radius) {
                        nextX = p.radius;
                        direction *= -1
                    }
                }
            }
            return platforms
        }
    });

    function Controller(screen) {
        this.screen = screen
    }
    Controller.prototype = {
        touchStart: function(x, y) {},
        touchMove: function(x, y) {},
        touchEnd: function(x, y) {},
        keyDown: function(keyCode) {},
        keyUp: function(keyCode) {},
        orientationChange: function() {}
    };

    function KeyboardController(screen) {
        Controller.call(this, screen);
        this.keyStates = {};
        this.currentSpeed = 0
    }
    KeyboardController.prototype = extendPrototype(Controller, {
        keyDown: function(keyCode) {
            this.keyStates[keyCode] = true
        },
        keyUp: function(keyCode) {
            this.keyStates[keyCode] = false
        },
        cycle: function(e) {
            var dirX = 0;
            if (this.keyStates[37] || this.keyStates[65] || this.keyStates[81]) {
                dirX = -1
            } else if (this.keyStates[39] || this.keyStates[68]) {
                dirX = 1
            }
            var acc;
            if (dirX == 0) {
                dirX = -Util.sign(this.currentSpeed);
                acc = Math.min(3e3, Math.abs(this.currentSpeed))
            } else {
                acc = 1200
            }
            this.currentSpeed += dirX * acc * e;
            this.screen.character.setX(this.screen.character.x + this.currentSpeed * e)
        }
    });

    function OrientationController(screen) {
        Controller.call(this, screen);
        this.currentGamma = 0;
        this.currentSpeed = 0
    }
    OrientationController.prototype = extendPrototype(Controller, {
        orientationChange: function(alpha, beta, gamma) {
            this.currentGamma = gamma
        },
        cycle: function(e) {
            var dirX = Util.sign(this.currentGamma);
            var acc;
            if (dirX == 0) {
                dirX = -Util.sign(this.currentSpeed);
                acc = Math.min(3e3, Math.abs(this.currentSpeed))
            } else {
                acc = 1200
            }
            this.currentSpeed = this.currentGamma / 45 * 1200;
            this.screen.character.setX(this.screen.character.x + this.currentSpeed * e)
        }
    });

    function TouchController(screen) {
        Controller.call(this, screen);
        this.direction = 0;
        this.currentSpeed = 0
    }
    TouchController.prototype = extendPrototype(Controller, {
        touchStart: function(x, y) {
            this.direction = x < P.width / 2 ? -1 : 1
        },
        touchMove: function(x, y) {
            this.direction = x < P.width / 2 ? -1 : 1
        },
        touchEnd: function(x, y) {
            this.direction = 0
        },
        cycle: function(e) {
            var acc, dir;
            if (this.direction === 0) {
                dir = -Util.sign(this.currentSpeed);
                acc = Math.min(3e3, Math.abs(this.currentSpeed))
            } else {
                dir = this.direction;
                acc = 1200
            }
            this.currentSpeed += dir * acc * e;
            this.screen.character.setX(this.screen.character.x + this.currentSpeed * e)
        }
    });

    function HybridController(screen) {
        Controller.call(this, screen);
        this.orientation = new OrientationController(screen);
        this.keyboard = new KeyboardController(screen);
        this.touch = new TouchController(screen)
    }
    HybridController.prototype = extendPrototype(Controller, {
        orientationChange: function(alpha, beta, gamma) {
            this.orientation.orientationChange(alpha, beta, gamma)
        },
        keyDown: function(k) {
            this.keyboard.keyDown(k)
        },
        keyUp: function(k) {
            this.keyboard.keyUp(k)
        },
        touchStart: function(x, y) {
            if (!this.screen.game.hasAccelerometer) {
                this.touch.touchStart(x, y)
            }
        },
        touchEnd: function(x, y) {
            if (!this.screen.game.hasAccelerometer) {
                this.touch.touchEnd(x, y)
            }
        },
        touchMove: function(x, y) {
            if (!this.screen.game.hasAccelerometer) {
                this.touch.touchMove(x, y)
            }
        },
        cycle: function(e) {
            this.orientation.cycle(e);
            this.keyboard.cycle(e);
            if (!this.screen.game.hasAccelerometer) {
                this.touch.cycle(e)
            }
        }
    });
    var Tracker = {
        suffix: function() {
            if ("standalone" in window.navigator && navigator.standalone) {
                return "-homescreen"
            } else if (window.cordova || P.cocoon) {
                return "-native"
            } else if (P.amazon) {
                return "-amazon"
            } else if (P.playphone) {
                return "-playphone"
            } else {
                return "-web"
            }
        },
        event: function(eventCategory, eventLabel, eventValue) {
            if (window.cordova && window.gaPlugin) {
                gaPlugin.trackEvent(function() {
                    console.log("Sent event data")
                }, function(e) {
                    console.log("Error while sending event data: " + e)
                }, "gameevent", eventCategory + this.suffix(), eventLabel + this.suffix(), eventValue || 0)
            } else if (window.ga) {
                ga("send", "event", "gameevent", eventCategory + this.suffix(), eventLabel + this.suffix(), eventValue || 0)
            }
        },
        beginStage: function(stageLabel) {
            var page = "/stage-" + stageLabel + this.suffix();
            if (window.cordova && window.gaPlugin) {
                gaPlugin.trackPage(function() {
                    console.log("Sent page view")
                }, function(e) {
                    console.log("Error while sending page view: " + e)
                }, page)
            } else if (window.ga) {
                ga("send", "pageview", page)
            }
        }
    };

    (function() {
        var cache = {};
        var ctx = null,
            usingWebAudio = true,
            noAudio = false;
        try {
            if (typeof AudioContext !== "undefined") {
                ctx = new AudioContext
            } else if (typeof webkitAudioContext !== "undefined") {
                ctx = new webkitAudioContext
            } else {
                usingWebAudio = false
            }
        } catch (e) {
            usingWebAudio = false
        }
        if (!usingWebAudio) {
            if (typeof Audio !== "undefined") {
                try {
                    new Audio
                } catch (e) {
                    noAudio = true
                }
            } else {
                noAudio = true
            }
        }
        if (usingWebAudio) {
            var masterGain = typeof ctx.createGain === "undefined" ? ctx.createGainNode() : ctx.createGain();
            masterGain.gain.value = 1;
            masterGain.connect(ctx.destination)
        }
        var HowlerGlobal = function() {
            this._volume = 1;
            this._muted = false;
            this.usingWebAudio = usingWebAudio;
            this.noAudio = noAudio;
            this._howls = []
        };
        HowlerGlobal.prototype = {
            volume: function(vol) {
                var self = this;
                vol = parseFloat(vol);
                if (vol >= 0 && vol <= 1) {
                    self._volume = vol;
                    if (usingWebAudio) {
                        masterGain.gain.value = vol
                    }
                    for (var key in self._howls) {
                        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                            for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                                self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume
                            }
                        }
                    }
                    return self
                }
                return usingWebAudio ? masterGain.gain.value : self._volume
            },
            mute: function() {
                this._setMuted(true);
                return this
            },
            unmute: function() {
                this._setMuted(false);
                return this
            },
            _setMuted: function(muted) {
                var self = this;
                self._muted = muted;
                if (usingWebAudio) {
                    masterGain.gain.value = muted ? 0 : self._volume
                }
                for (var key in self._howls) {
                    if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
                        for (var i = 0; i < self._howls[key]._audioNode.length; i++) {
                            self._howls[key]._audioNode[i].muted = muted
                        }
                    }
                }
            }
        };
        var Howler = new HowlerGlobal;
        var audioTest = null;
        if (!noAudio) {
            audioTest = new Audio;
            var codecs = {
                mp3: !!audioTest.canPlayType("audio/mpeg;").replace(/^no$/, ""),
                opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
                ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
                aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
                m4a: !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                mp4: !!(audioTest.canPlayType("audio/x-mp4;") || audioTest.canPlayType("audio/mp4;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")
            }
        }
        var Howl = function(o) {
            var self = this;
            self._autoplay = o.autoplay || false;
            self._buffer = o.buffer || false;
            self._duration = o.duration || 0;
            self._format = o.format || null;
            self._loop = o.loop || false;
            self._loaded = false;
            self._sprite = o.sprite || {};
            self._src = o.src || "";
            self._pos3d = o.pos3d || [0, 0, -.5];
            self._volume = o.volume !== undefined ? o.volume : 1;
            self._urls = o.urls || [];
            self._rate = o.rate || 1;
            self._model = o.model || null;
            self._onload = [o.onload || function() {}];
            self._onloaderror = [o.onloaderror || function() {}];
            self._onend = [o.onend || function() {}];
            self._onpause = [o.onpause || function() {}];
            self._onplay = [o.onplay || function() {}];
            self._onendTimer = [];
            self._webAudio = usingWebAudio && !self._buffer;
            self._audioNode = [];
            if (self._webAudio) {
                self._setupAudioNode()
            }
            Howler._howls.push(self);
            self.load()
        };
        Howl.prototype = {
            load: function() {
                var self = this,
                    url = null;
                if (noAudio) {
                    self.on("loaderror");
                    return
                }
                for (var i = 0; i < self._urls.length; i++) {
                    var ext, urlItem;
                    if (self._format) {
                        ext = self._format
                    } else {
                        urlItem = self._urls[i].toLowerCase().split("?")[0];
                        ext = urlItem.match(/.+\.([^?]+)(\?|$)/);
                        ext = ext && ext.length >= 2 ? ext : urlItem.match(/data\:audio\/([^?]+);/);
                        if (ext) {
                            ext = ext[1]
                        } else {
                            self.on("loaderror");
                            return
                        }
                    } if (codecs[ext]) {
                        url = self._urls[i];
                        break
                    }
                }
                if (!url) {
                    self.on("loaderror");
                    return
                }
                self._src = url;
                if (self._webAudio) {
                    loadBuffer(self, url)
                } else {
                    var newNode = new Audio;
                    newNode.addEventListener("error", function() {
                        if (newNode.error && newNode.error.code === 4) {
                            HowlerGlobal.noAudio = true
                        }
                        self.on("loaderror", {
                            type: newNode.error ? newNode.error.code : 0
                        })
                    }, false);
                    self._audioNode.push(newNode);
                    newNode.src = url;
                    newNode._pos = 0;
                    newNode.preload = "auto";
                    newNode.volume = Howler._muted ? 0 : self._volume * Howler.volume();
                    cache[url] = self;
                    var listener = function() {
                        self._duration = Math.ceil(newNode.duration * 10) / 10;
                        if (Object.getOwnPropertyNames(self._sprite).length === 0) {
                            self._sprite = {
                                _default: [0, self._duration * 1e3]
                            }
                        }
                        if (!self._loaded) {
                            self._loaded = true;
                            self.on("load")
                        }
                        if (self._autoplay) {
                            self.play()
                        }
                        newNode.removeEventListener("canplaythrough", listener, false)
                    };
                    newNode.addEventListener("canplaythrough", listener, false);
                    newNode.load()
                }
                return self
            },
            urls: function(urls) {
                var self = this;
                if (urls) {
                    self.stop();
                    self._urls = typeof urls === "string" ? [urls] : urls;
                    self._loaded = false;
                    self.load();
                    return self
                } else {
                    return self._urls
                }
            },
            play: function(sprite, callback) {
                var self = this;
                if (typeof sprite === "function") {
                    callback = sprite
                }
                if (!sprite || typeof sprite === "function") {
                    sprite = "_default"
                }
                if (!self._loaded) {
                    self.on("load", function() {
                        self.play(sprite, callback)
                    });
                    return self
                }
                if (!self._sprite[sprite]) {
                    if (typeof callback === "function") callback();
                    return self
                }
                self._inactiveNode(function(node) {
                    node._sprite = sprite;
                    var pos = node._pos > 0 ? node._pos : self._sprite[sprite][0] / 1e3;
                    var duration = 0;
                    if (self._webAudio) {
                        duration = self._sprite[sprite][1] / 1e3 - node._pos;
                        if (node._pos > 0) {
                            pos = self._sprite[sprite][0] / 1e3 + pos
                        }
                    } else {
                        duration = self._sprite[sprite][1] / 1e3 - (pos - self._sprite[sprite][0] / 1e3)
                    }
                    var loop = !!(self._loop || self._sprite[sprite][2]);
                    var soundId = typeof callback === "string" ? callback : Math.round(Date.now() * Math.random()) + "",
                        timerId;
                    (function() {
                        var data = {
                            id: soundId,
                            sprite: sprite,
                            loop: loop
                        };
                        timerId = setTimeout(function() {
                            if (!self._webAudio && loop) {
                                self.stop(data.id).play(sprite, data.id)
                            }
                            if (self._webAudio && !loop) {
                                self._nodeById(data.id).paused = true;
                                self._nodeById(data.id)._pos = 0
                            }
                            if (!self._webAudio && !loop) {
                                self.stop(data.id)
                            }
                            self.on("end", soundId)
                        }, duration * 1e3);
                        self._onendTimer.push({
                            timer: timerId,
                            id: data.id
                        })
                    })();
                    if (self._webAudio) {
                        var loopStart = self._sprite[sprite][0] / 1e3,
                            loopEnd = self._sprite[sprite][1] / 1e3;
                        node.id = soundId;
                        node.paused = false;
                        refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
                        self._playStart = ctx.currentTime;
                        node.gain.value = self._volume;
                        if (typeof node.bufferSource.start === "undefined") {
                            node.bufferSource.noteGrainOn(0, pos, duration)
                        } else {
                            node.bufferSource.start(0, pos, duration)
                        }
                    } else {
                        if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
                            node.readyState = 4;
                            node.id = soundId;
                            node.currentTime = pos;
                            node.muted = Howler._muted || node.muted;
                            node.volume = self._volume * Howler.volume();
                            setTimeout(function() {
                                node.play()
                            }, 0)
                        } else {
                            self._clearEndTimer(soundId);
                            (function() {
                                var sound = self,
                                    playSprite = sprite,
                                    fn = callback,
                                    newNode = node;
                                var listener = function() {
                                    sound.play(playSprite, fn);
                                    newNode.removeEventListener("canplaythrough", listener, false)
                                };
                                newNode.addEventListener("canplaythrough", listener, false)
                            })();
                            return self
                        }
                    }
                    self.on("play");
                    if (typeof callback === "function") callback(soundId);
                    return self
                });
                return self
            },
            pause: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.pause(id)
                    });
                    return self
                }
                self._clearEndTimer(id);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    activeNode._pos = self.pos(null, id);
                    if (self._webAudio) {
                        if (!activeNode.bufferSource || activeNode.paused) {
                            return self
                        }
                        activeNode.paused = true;
                        if (typeof activeNode.bufferSource.stop === "undefined") {
                            activeNode.bufferSource.noteOff(0)
                        } else {
                            activeNode.bufferSource.stop(0)
                        }
                    } else {
                        activeNode.pause()
                    }
                }
                self.on("pause");
                return self
            },
            stop: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.stop(id)
                    });
                    return self
                }
                self._clearEndTimer(id);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    activeNode._pos = 0;
                    if (self._webAudio) {
                        if (!activeNode.bufferSource || activeNode.paused) {
                            return self
                        }
                        activeNode.paused = true;
                        if (typeof activeNode.bufferSource.stop === "undefined") {
                            activeNode.bufferSource.noteOff(0)
                        } else {
                            activeNode.bufferSource.stop(0)
                        }
                    } else if (!isNaN(activeNode.duration)) {
                        activeNode.pause();
                        activeNode.currentTime = 0
                    }
                }
                return self
            },
            mute: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.mute(id)
                    });
                    return self
                }
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (self._webAudio) {
                        activeNode.gain.value = 0
                    } else {
                        activeNode.muted = true
                    }
                }
                return self
            },
            unmute: function(id) {
                var self = this;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.unmute(id)
                    });
                    return self
                }
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (self._webAudio) {
                        activeNode.gain.value = self._volume
                    } else {
                        activeNode.muted = false
                    }
                }
                return self
            },
            volume: function(vol, id) {
                var self = this;
                vol = parseFloat(vol);
                if (vol >= 0 && vol <= 1) {
                    self._volume = vol;
                    if (!self._loaded) {
                        self.on("play", function() {
                            self.volume(vol, id)
                        });
                        return self
                    }
                    var activeNode = id ? self._nodeById(id) : self._activeNode();
                    if (activeNode) {
                        if (self._webAudio) {
                            activeNode.gain.value = vol
                        } else {
                            activeNode.volume = vol * Howler.volume()
                        }
                    }
                    return self
                } else {
                    return self._volume
                }
            },
            loop: function(loop) {
                var self = this;
                if (typeof loop === "boolean") {
                    self._loop = loop;
                    return self
                } else {
                    return self._loop
                }
            },
            sprite: function(sprite) {
                var self = this;
                if (typeof sprite === "object") {
                    self._sprite = sprite;
                    return self
                } else {
                    return self._sprite
                }
            },
            pos: function(pos, id) {
                var self = this;
                if (!self._loaded) {
                    self.on("load", function() {
                        self.pos(pos)
                    });
                    return typeof pos === "number" ? self : self._pos || 0
                }
                pos = parseFloat(pos);
                var activeNode = id ? self._nodeById(id) : self._activeNode();
                if (activeNode) {
                    if (pos >= 0) {
                        self.pause(id);
                        activeNode._pos = pos;
                        self.play(activeNode._sprite, id);
                        return self
                    } else {
                        return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime
                    }
                } else if (pos >= 0) {
                    return self
                } else {
                    for (var i = 0; i < self._audioNode.length; i++) {
                        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                            return self._webAudio ? self._audioNode[i]._pos : self._audioNode[i].currentTime
                        }
                    }
                }
            },
            pos3d: function(x, y, z, id) {
                var self = this;
                y = typeof y === "undefined" || !y ? 0 : y;
                z = typeof z === "undefined" || !z ? -.5 : z;
                if (!self._loaded) {
                    self.on("play", function() {
                        self.pos3d(x, y, z, id)
                    });
                    return self
                }
                if (x >= 0 || x < 0) {
                    if (self._webAudio) {
                        var activeNode = id ? self._nodeById(id) : self._activeNode();
                        if (activeNode) {
                            self._pos3d = [x, y, z];
                            activeNode.panner.setPosition(x, y, z);
                            activeNode.panner.panningModel = self._model || "HRTF"
                        }
                    }
                } else {
                    return self._pos3d
                }
                return self
            },
            fade: function(from, to, len, callback, id) {
                var self = this,
                    diff = Math.abs(from - to),
                    dir = from > to ? "down" : "up",
                    steps = diff / .01,
                    stepTime = len / steps;
                if (!self._loaded) {
                    self.on("load", function() {
                        self.fade(from, to, len, callback, id)
                    });
                    return self
                }
                self.volume(from, id);
                for (var i = 1; i <= steps; i++) {
                    (function() {
                        var change = self._volume + (dir === "up" ? .01 : -.01) * i,
                            vol = Math.round(1e3 * change) / 1e3,
                            toVol = to;
                        setTimeout(function() {
                            self.volume(vol, id);
                            if (vol === toVol) {
                                if (callback) callback()
                            }
                        }, stepTime * i)
                    })()
                }
            },
            fadeIn: function(to, len, callback) {
                return this.volume(0).play().fade(0, to, len, callback)
            },
            fadeOut: function(to, len, callback, id) {
                var self = this;
                return self.fade(self._volume, to, len, function() {
                    if (callback) callback();
                    self.pause(id);
                    self.on("end")
                }, id)
            },
            _nodeById: function(id) {
                var self = this,
                    node = self._audioNode[0];
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].id === id) {
                        node = self._audioNode[i];
                        break
                    }
                }
                return node
            },
            _activeNode: function() {
                var self = this,
                    node = null;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (!self._audioNode[i].paused) {
                        node = self._audioNode[i];
                        break
                    }
                }
                self._drainPool();
                return node
            },
            _inactiveNode: function(callback) {
                var self = this,
                    node = null;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
                        callback(self._audioNode[i]);
                        node = true;
                        break
                    }
                }
                self._drainPool();
                if (node) {
                    return
                }
                var newNode;
                if (self._webAudio) {
                    newNode = self._setupAudioNode();
                    callback(newNode)
                } else {
                    self.load();
                    newNode = self._audioNode[self._audioNode.length - 1];
                    var listenerEvent = navigator.isCocoonJS ? "canplaythrough" : "loadedmetadata";
                    var listener = function() {
                        newNode.removeEventListener(listenerEvent, listener, false);
                        callback(newNode)
                    };
                    newNode.addEventListener(listenerEvent, listener, false)
                }
            },
            _drainPool: function() {
                var self = this,
                    inactive = 0,
                    i;
                for (i = 0; i < self._audioNode.length; i++) {
                    if (self._audioNode[i].paused) {
                        inactive++
                    }
                }
                for (i = self._audioNode.length - 1; i >= 0; i--) {
                    if (inactive <= 5) {
                        break
                    }
                    if (self._audioNode[i].paused) {
                        if (self._webAudio) {
                            self._audioNode[i].disconnect(0)
                        }
                        inactive--;
                        self._audioNode.splice(i, 1)
                    }
                }
            },
            _clearEndTimer: function(soundId) {
                var self = this,
                    index = 0;
                for (var i = 0; i < self._onendTimer.length; i++) {
                    if (self._onendTimer[i].id === soundId) {
                        index = i;
                        break
                    }
                }
                var timer = self._onendTimer[index];
                if (timer) {
                    clearTimeout(timer.timer);
                    self._onendTimer.splice(index, 1)
                }
            },
            _setupAudioNode: function() {
                var self = this,
                    node = self._audioNode,
                    index = self._audioNode.length;
                node[index] = typeof ctx.createGain === "undefined" ? ctx.createGainNode() : ctx.createGain();
                node[index].gain.value = self._volume;
                node[index].paused = true;
                node[index]._pos = 0;
                node[index].readyState = 4;
                node[index].connect(masterGain);
                node[index].panner = ctx.createPanner();
                node[index].panner.panningModel = self._model || "equalpower";
                node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
                node[index].panner.connect(node[index]);
                return node[index]
            },
            on: function(event, fn) {
                var self = this,
                    events = self["_on" + event];
                if (typeof fn === "function") {
                    events.push(fn)
                } else {
                    for (var i = 0; i < events.length; i++) {
                        if (fn) {
                            events[i].call(self, fn)
                        } else {
                            events[i].call(self)
                        }
                    }
                }
                return self
            },
            off: function(event, fn) {
                var self = this,
                    events = self["_on" + event],
                    fnString = fn.toString();
                for (var i = 0; i < events.length; i++) {
                    if (fnString === events[i].toString()) {
                        events.splice(i, 1);
                        break
                    }
                }
                return self
            },
            unload: function() {
                var self = this;
                var nodes = self._audioNode;
                for (var i = 0; i < self._audioNode.length; i++) {
                    if (!nodes[i].paused) {
                        self.stop(nodes[i].id)
                    }
                    if (!self._webAudio) {
                        nodes[i].src = ""
                    } else {
                        nodes[i].disconnect(0)
                    }
                }
                for (i = 0; i < self._onendTimer.length; i++) {
                    clearTimeout(self._onendTimer[i].timer)
                }
                var index = Howler._howls.indexOf(self);
                if (index !== null && index >= 0) {
                    Howler._howls.splice(index, 1)
                }
                delete cache[self._src];
                self = null
            }
        };
        if (usingWebAudio) {
            var loadBuffer = function(obj, url) {
                if (url in cache) {
                    obj._duration = cache[url].duration;
                    loadSound(obj)
                } else {
                    var xhr = new XMLHttpRequest;
                    xhr.open("GET", url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = function() {
                        ctx.decodeAudioData(xhr.response, function(buffer) {
                            if (buffer) {
                                cache[url] = buffer;
                                loadSound(obj, buffer)
                            }
                        }, function(err) {
                            obj.on("loaderror")
                        })
                    };
                    xhr.onerror = function() {
                        if (obj._webAudio) {
                            obj._buffer = true;
                            obj._webAudio = false;
                            obj._audioNode = [];
                            delete obj._gainNode;
                            obj.load()
                        }
                    };
                    try {
                        xhr.send()
                    } catch (e) {
                        xhr.onerror()
                    }
                }
            };
            var loadSound = function(obj, buffer) {
                obj._duration = buffer ? buffer.duration : obj._duration;
                if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
                    obj._sprite = {
                        _default: [0, obj._duration * 1e3]
                    }
                }
                if (!obj._loaded) {
                    obj._loaded = true;
                    obj.on("load")
                }
                if (obj._autoplay) {
                    obj.play()
                }
            };
            var refreshBuffer = function(obj, loop, id) {
                var node = obj._nodeById(id);
                node.bufferSource = ctx.createBufferSource();
                node.bufferSource.buffer = cache[obj._src];
                node.bufferSource.connect(node.panner);
                node.bufferSource.loop = loop[0];
                if (loop[0]) {
                    node.bufferSource.loopStart = loop[1];
                    node.bufferSource.loopEnd = loop[1] + loop[2]
                }
                node.bufferSource.playbackRate.value = obj._rate
            }
        }
        if (typeof define === "function" && define.amd) {
            define(function() {
                return {
                    Howler: Howler,
                    Howl: Howl
                }
            })
        }
        if (typeof exports !== "undefined") {
            exports.Howler = Howler;
            exports.Howl = Howl
        }
        if (typeof window !== "undefined") {
            window.Howler = Howler;
            window.Howl = Howl
        }
    })();

    function SoundManager(settings) {
        this.soundMap = {};
        this.loadSettings(settings)
    }
    SoundManager.prototype = {
        loadSettings: function(settings) {
            this.volume = isNaN(settings.volume) ? 1 : settings.volume;
            for (var i in settings.sounds) {
                this.soundMap[settings.sounds[i].id] = this.prepareSound(settings.sounds[i])
            }
        },
        prepareSound: function(settings) {
            return new Howl({
                urls: settings.urls,
                volume: (settings.volume || 1) * this.volume,
                loop: !!settings.loop,
                preload: true
            })
        },
        play: function(id) {
            if (this.soundMap[id]) {
                var soundObject = this.soundMap[id];
                this.soundMap[id].play(function(id) {
                    soundObject.instanceId = id
                })
            }
        },
        stop: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].stop(this.soundMap[id].instanceId)
            }
        },
        pause: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].pause(this.soundMap[id].instanceId)
            }
        },
        fadeOut: function(id) {
            if (this.soundMap[id]) {
                this.soundMap[id].fadeOut(this.soundMap[id].instanceId)
            }
        }
    }
})();