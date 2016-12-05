(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FE"] = factory();
	else
		root["FE"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../typings/tsd.d.ts" />
	"use strict";
	var base_1 = __webpack_require__(1);
	exports.Base = base_1.default;
	var easyXDM = __webpack_require__(11);
	exports.easyXDM = easyXDM;
	var $ = __webpack_require__(7);
	exports.$ = $;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var event_dispatcher_1 = __webpack_require__(2);
	var ads_1 = __webpack_require__(3);
	var log_1 = __webpack_require__(12);
	var serverApis = __webpack_require__(13);
	var util_1 = __webpack_require__(6);
	var $ = __webpack_require__(7);
	var meteorReactive = __webpack_require__(8);
	/**
	 * The main class (FE.Base)
	 */
	var Base = (function (_super) {
	    __extends(Base, _super);
	    function Base(cfg) {
	        if (cfg === void 0) { cfg = null; }
	        _super.call(this);
	        this.reactiveDict = meteorReactive.ReactiveDict;
	        // set configuration:
	        this.set(cfg);
	        // initialise logging:
	        log_1.default.level(this.get("DEBUG"));
	    }
	    /**
	     * Initialise: wait for document.body to become available and load an ad.
	     */
	    Base.prototype.init = function () {
	        var _this = this;
	        // wait until document.body is available:
	        if (!document.body) {
	            setTimeout(function () { return _this.init(); }, 25);
	            return;
	        }
	        // don't call this function more than once:
	        if (this._swInitCalled) {
	            return;
	        }
	        this._swInitCalled = true;
	        // we are ready for business:
	        this._ready = true;
	        this.dispatchEvent("ready");
	        // when autopilot is enabled, we make an initial ad call or load an ad if
	        // one was passed to us:
	        if (this.get("autopilot")) {
	            // in case we were provided an ad call response, serve the ad within it:
	            var adCallResponse = this.get("adCallResponse");
	            if (adCallResponse) {
	                this.serve(adCallResponse);
	            }
	            else {
	                // otherwise make an ad call
	                this.makeAdCall();
	            }
	        }
	    };
	    /**
	     * Make an ad call. Returns promise which will be resolved when the ad call is
	     * complete.
	     */
	    Base.prototype.makeAdCall = function () {
	        var serverApi = this.get("serverApi");
	        // Dirty hotfix to skip second request
	        if (!serverApi) {
	            return;
	        }
	        // create the instance, if it"s not already there:
	        if (!this._serverApis) {
	            this._serverApis = {};
	        }
	        if (!this._serverApis[serverApi]) {
	            this._serverApis[serverApi] = new serverApis[serverApi](this);
	        }
	        this._serverApis[serverApi].makeAdCall(window[this.get("tag")]);
	    };
	    /**
	     * Serve an ad.
	     */
	    Base.prototype.serve = function (response) {
	        var _this = this;
	        if (!response) {
	            return;
	        }
	        var ad = null;
	        switch (response.ad.type) {
	            case "skin":
	                ad = new ads_1.default.Skin(this, response);
	                break;
	        }
	        if (ad) {
	            this._ad = ad;
	            ad.addEventListener("*", function (e) {
	                _this.dispatchEvent("AD_" + e.name, e.data, e.target);
	            });
	            ad.serve();
	        }
	    };
	    /**
	     * Unload the current ad, if any
	     */
	    Base.prototype.unload = function () {
	        if (this._ad) {
	            this._ad.removeEventListener("*");
	            this._ad.unload();
	            this._ad = null;
	        }
	    };
	    /**
	     * Open an overlay
	     */
	    Base.prototype.openOverlay = function (cfg) {
	        var _this = this;
	        // only allow one overlay at a time:
	        if (this._overlay) {
	            return;
	        }
	        this._overlay = new ads_1.default.Overlay(this, cfg);
	        this._overlay.addEventListener("*", function (e) {
	            _this.forwardEvent(e);
	            switch (e.name) {
	                case "CLOSED":
	                    _this._overlay = null;
	                    break;
	            }
	        });
	        this._overlay.serve();
	    };
	    /**
	     * Close the active overlay
	     */
	    Base.prototype.closeOverlay = function () {
	        if (this._overlay) {
	            this._overlay.unload();
	            this._overlay = null;
	        }
	    };
	    /**
	     * Set configuration options
	     */
	    Base.prototype.set = function (kv) {
	        var _kv = {};
	        if (!this._cfg) {
	            this._cfg = new this.reactiveDict();
	            $.extend(_kv, 
	            // default configuration
	            {
	                // debug level:
	                DEBUG: 0,
	                // static URL to get an ad (instead of going through an ad server)
	                adCallResponseUrl: "",
	                // static ad call result
	                adCallResult: null,
	                // what ad server interface/API should we use
	                adServerType: "",
	                // autopilot mode - if enabled, we will make an ad call on init, or
	                // automatically serve the ad after an ad call; if disabled, all steps
	                // need to be manually initiated
	                autopilot: true,
	            }, 
	            // passed configuration
	            kv, 
	            // configuration passed in the URL
	            util_1.default.getUrlParams(null, true));
	        }
	        else {
	            $.extend(_kv, kv);
	        }
	        // make sure parameters are of the correct type:
	        util_1.default.cast(_kv, "boolean", []);
	        util_1.default.cast(_kv, "integer", ["DEBUG"]);
	        for (var k in _kv) {
	            if (_kv.hasOwnProperty(k)) {
	                this._cfg.set(k, _kv[k]);
	            }
	        }
	    };
	    /**
	     * Get configuration options
	     *
	     * @param args
	     * @returns {any}
	     */
	    Base.prototype.get = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        if (args.length) {
	            // get specific configuration keys:
	            if (args.length === 1) {
	                return this._cfg.get(args[0]);
	            }
	            else {
	                var kv = {};
	                for (var i = 0; i < args.length; i++) {
	                    kv[args[i]] = this._cfg.get(args[i]);
	                }
	                return kv;
	            }
	        }
	        else {
	            // get all keys
	            return this._cfg.all();
	        }
	    };
	    return Base;
	}(event_dispatcher_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Base;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * A class that can send out events.
	 */
	var EventDispatcher = (function () {
	    function EventDispatcher() {
	        /**
	         * List of registered listeners
	         */
	        this.listeners = {};
	    }
	    /**
	     * Add listener
	     */
	    EventDispatcher.prototype.addEventListener = function (name, fn, thisObj) {
	        if (thisObj === void 0) { thisObj = null; }
	        if (!this.listeners[name]) {
	            this.listeners[name] = [];
	        }
	        this.listeners[name].push({ fn: fn, thisObj: thisObj });
	    };
	    /**
	     * Remove listener
	     */
	    EventDispatcher.prototype.removeEventListener = function (name, fn, thisObj) {
	        if (fn === void 0) { fn = null; }
	        if (thisObj === void 0) { thisObj = null; }
	        if (!arguments.length) {
	            this.listeners = {};
	            return;
	        }
	        if (!this.listeners[name]) {
	            return;
	        }
	        if (!fn) {
	            this.listeners[name] = [];
	        }
	        else {
	            var l = this.listeners[name];
	            for (var i = l.length - 1; i >= 0; i--) {
	                if (l[i].fn === fn && l[i].thisObj === thisObj) {
	                    l.splice(i, 1);
	                }
	            }
	        }
	    };
	    /**
	     * Dispatch event.
	     */
	    EventDispatcher.prototype.dispatchEvent = function (name, data, target) {
	        if (data === void 0) { data = null; }
	        if (target === void 0) { target = null; }
	        var l = [].concat(this.listeners[name] || []);
	        l = l.concat(this.listeners["*"] || []);
	        if (!l.length) {
	            return;
	        }
	        var e = { data: data, name: name, target: target || this };
	        var fn;
	        for (var i = 0; i < l.length; i++) {
	            if (l[i].thisObj && typeof (l[i].fn) === "string") {
	                fn = l[i].thisObj[l[i].fn];
	            }
	            else {
	                fn = l[i].fn;
	            }
	            if (typeof (fn) === "function") {
	                if (fn.apply(l[i].thisObj, [e]) === false) {
	                    return false;
	                }
	            }
	        }
	    };
	    /**
	     * Forward event
	     */
	    EventDispatcher.prototype.forwardEvent = function (e) {
	        return this.dispatchEvent(e.name, e.data, e.target);
	    };
	    return EventDispatcher;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = EventDispatcher;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var overlay_1 = __webpack_require__(4);
	var skin_1 = __webpack_require__(9);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = {
	    Overlay: overlay_1.default,
	    Skin: skin_1.default,
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var ad_1 = __webpack_require__(5);
	var $ = __webpack_require__(7);
	/**
	 * Overlay
	 */
	var Overlay = (function (_super) {
	    __extends(Overlay, _super);
	    function Overlay() {
	        _super.apply(this, arguments);
	    }
	    Overlay.prototype.serve = function () {
	        var _this = this;
	        this._backdrop().then(function () {
	            // if configured, close when clicking on the backdrop:
	            if (_this.get("closeOnBackdropClick")) {
	                _this._$backdrop.click(function () {
	                    this.unload();
	                });
	            }
	            // if configured, close when pressing escape:
	            if (_this.get("closeOnEscape")) {
	                $(document).on("keyup.fe", function (e) {
	                    if (e.keyCode === 27) {
	                        _this.unload();
	                    }
	                });
	            }
	        });
	    };
	    Overlay.prototype.unload = function () {
	        this.listeners = {};
	        $(document).off("keyup.fe");
	        this._$backdrop.remove();
	        this.dispatchEvent("CLOSED");
	    };
	    /**
	     * Create a backdrop (which may be transparent). Returns promise resolved when
	     * the backdrop is fully displayed.
	     */
	    Overlay.prototype._backdrop = function () {
	        var deferred = $.Deferred(), transparent = this.get("transparentBackdrop");
	        this._$backdrop = $("<div></div>").css({
	            "background-color": transparent ? "transparent" : "#000",
	            bottom: 0,
	            left: 0,
	            opacity: 0.1,
	            position: "fixed",
	            right: 0,
	            top: 0,
	            "z-index": 20,
	        }).animate({
	            opacity: transparent ? 1 : 0.8,
	        }, transparent ? 0 : 750, function () {
	            deferred.resolve();
	        }).appendTo("body");
	        return deferred.promise();
	    };
	    return Overlay;
	}(ad_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Overlay;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var event_dispatcher_1 = __webpack_require__(2);
	var util_1 = __webpack_require__(6);
	var $ = __webpack_require__(7);
	var meteorReactive = __webpack_require__(8);
	/**
	 * The base class for all ads
	 */
	var Ad = (function (_super) {
	    __extends(Ad, _super);
	    function Ad(base, cfg) {
	        _super.call(this);
	        this.meteorReactive = meteorReactive;
	        this.base = base;
	        this.set(cfg);
	    }
	    Ad.prototype.unload = function () {
	        if (this._trackers) {
	            for (var k in this._trackers) {
	                if (this._trackers.hasOwnProperty(k)) {
	                    this._trackers[k].stop();
	                    delete this._trackers[k];
	                }
	            }
	        }
	    };
	    /**
	     * Run a dependency aware function, which will rerun itself whenever one of
	     * its dependencies change.
	     */
	    Ad.prototype._autorun = function (fn, name) {
	        var _this = this;
	        if (name === void 0) { name = null; }
	        if (!name) {
	            name = "autorun_" + Math.floor(Math.random() * 10e16);
	        }
	        if (!this._trackers) {
	            this._trackers = {};
	        }
	        this._trackers[name] = this.meteorReactive.Tracker.autorun(function () {
	            fn.apply(_this, []);
	        });
	    };
	    /**
	     * Set configuration options.
	     */
	    Ad.prototype.set = function (kv) {
	        var _kv = {};
	        if (!this._cfg) {
	            this._cfg = new this.meteorReactive.ReactiveDict();
	            $.extend(true, _kv, 
	            // default configuration for this ad type:
	            this._defaults(), 
	            // passed configuration:
	            kv);
	            // apply integration configuration (only known keys):
	            var p = this.base.get();
	            for (var k in p) {
	                if (_kv[k] === undefined) {
	                    delete p[k];
	                }
	            }
	            $.extend(true, _kv, p);
	        }
	        else {
	            $.extend(true, _kv, kv);
	        }
	        // make sure parameters are of the correct type:
	        util_1.default.cast(_kv, "boolean", this._booleans());
	        util_1.default.cast(_kv, "integer", this._integers());
	        for (var k in _kv) {
	            if (_kv.hasOwnProperty(k)) {
	                this._cfg.set(k, _kv[k]);
	            }
	        }
	    };
	    /**
	     * Get configuration options
	     */
	    Ad.prototype.get = function () {
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
	        if (args.length) {
	            // get specific configuration keys:
	            if (args.length === 1) {
	                return this._cfg.get(args[0]);
	            }
	            else {
	                var kv = {};
	                for (var i = 0; i < args.length; i++) {
	                    kv[args[i]] = this._cfg.get(args[i]);
	                }
	                return kv;
	            }
	        }
	        else {
	            // get all keys
	            return this._cfg.all();
	        }
	    };
	    /**
	     * Default configuration (overload in child class).
	     */
	    Ad.prototype._defaults = function () {
	        return {};
	    };
	    /**
	     * Define boolean fields in configuration (overload in child class).
	     */
	    Ad.prototype._booleans = function () {
	        return [];
	    };
	    /**
	     * Define integer fields in configuration (overload in child class).
	     */
	    Ad.prototype._integers = function () {
	        return [];
	    };
	    return Ad;
	}(event_dispatcher_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Ad;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var Util = (function () {
	    function Util() {
	    }
	    /**
	     * Get all or certain URL parameters. If strict is true, we only get parameters
	     * that start with 'fe_' (and we remove fe_ from their name) or DEBUG.
	     *
	     * @param names
	     * @param strict
	     * @returns {{}}
	     */
	    Util.getUrlParams = function (names, strict) {
	        // create a lookup table for requested URL parameters:
	        var lookup = null;
	        if (names) {
	            lookup = {};
	            for (var i = 0; i < names.length; i++) {
	                lookup[names[i]] = true;
	            }
	        }
	        var params = Object.create(null);
	        var query = window.location.search.substring(1), pairs = query.split("&");
	        for (var i = 0; i < pairs.length; i++) {
	            if (!pairs[i]) {
	                continue;
	            }
	            var kv = pairs[i].split("=");
	            if (strict && kv[0] !== "DEBUG" && !kv[0].match(/^fe_/i)) {
	                continue;
	            }
	            kv[0] = kv[0].replace(/^fe_/i, "");
	            // we're looking for certain parameters only and this is not one of them:
	            if (lookup && !lookup[kv[0]]) {
	                continue;
	            }
	            params[kv[0]] = (kv[1] ? decodeURIComponent(kv[1]) : "");
	        }
	        return params;
	    };
	    /**
	     * Cast given keys of obj to a certain type.
	     *
	     * @param obj
	     * @param type
	     * @param keys
	     */
	    Util.cast = function (obj, type, keys) {
	        if (keys === void 0) { keys = null; }
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            if (typeof (obj[key]) !== "undefined") {
	                switch (type) {
	                    case "boolean":
	                        obj[key] = (String(obj[key]).toLowerCase() === "true" ? true : false);
	                        break;
	                    case "integer":
	                        obj[key] = parseInt(obj[key], 10);
	                        break;
	                }
	            }
	        }
	    };
	    return Util;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Util;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.4
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-05-20T17:23Z
	 */
	
	(function( global, factory ) {
	
		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}
	
	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {
	
	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];
	
	var document = window.document;
	
	var slice = arr.slice;
	
	var concat = arr.concat;
	
	var push = arr.push;
	
	var indexOf = arr.indexOf;
	
	var class2type = {};
	
	var toString = class2type.toString;
	
	var hasOwn = class2type.hasOwnProperty;
	
	var support = {};
	
	
	
	var
		version = "2.2.4",
	
		// Define a local copy of jQuery
		jQuery = function( selector, context ) {
	
			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},
	
		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
	
		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,
	
		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};
	
	jQuery.fn = jQuery.prototype = {
	
		// The current version of jQuery being used
		jquery: version,
	
		constructor: jQuery,
	
		// Start with an empty selector
		selector: "",
	
		// The default length of a jQuery object is 0
		length: 0,
	
		toArray: function() {
			return slice.call( this );
		},
	
		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?
	
				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :
	
				// Return all the elements in a clean array
				slice.call( this );
		},
	
		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {
	
			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );
	
			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;
	
			// Return the newly-formed element set
			return ret;
		},
	
		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},
	
		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},
	
		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},
	
		first: function() {
			return this.eq( 0 );
		},
	
		last: function() {
			return this.eq( -1 );
		},
	
		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},
	
		end: function() {
			return this.prevObject || this.constructor();
		},
	
		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};
	
	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
	
			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}
	
		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}
	
		for ( ; i < length; i++ ) {
	
			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {
	
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {
	
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];
	
						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	
	jQuery.extend( {
	
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),
	
		// Assume jQuery is ready without the ready module
		isReady: true,
	
		error: function( msg ) {
			throw new Error( msg );
		},
	
		noop: function() {},
	
		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},
	
		isArray: Array.isArray,
	
		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},
	
		isNumeric: function( obj ) {
	
			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},
	
		isPlainObject: function( obj ) {
			var key;
	
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}
	
			// Not own constructor property must be Object
			if ( obj.constructor &&
					!hasOwn.call( obj, "constructor" ) &&
					!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
				return false;
			}
	
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own
			for ( key in obj ) {}
	
			return key === undefined || hasOwn.call( obj, key );
		},
	
		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},
	
		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}
	
			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},
	
		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;
	
			code = jQuery.trim( code );
	
			if ( code ) {
	
				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {
	
					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval
	
					indirect( code );
				}
			}
		},
	
		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},
	
		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},
	
		each: function( obj, callback ) {
			var length, i = 0;
	
			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}
	
			return obj;
		},
	
		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},
	
		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];
	
			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}
	
			return ret;
		},
	
		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},
	
		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;
	
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
	
			first.length = i;
	
			return first;
		},
	
		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;
	
			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}
	
			return matches;
		},
	
		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];
	
			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
	
			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );
	
					if ( value != null ) {
						ret.push( value );
					}
				}
			}
	
			// Flatten any nested arrays
			return concat.apply( [], ret );
		},
	
		// A global GUID counter for objects
		guid: 1,
	
		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;
	
			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}
	
			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}
	
			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};
	
			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;
	
			return proxy;
		},
	
		now: Date.now,
	
		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );
	
	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */
	
	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );
	
	function isArrayLike( obj ) {
	
		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );
	
		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}
	
		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {
	
	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,
	
		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,
	
		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},
	
		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,
	
		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},
	
		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
	
		// Regular expressions
	
		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",
	
		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
	
		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",
	
		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",
	
		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),
	
		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),
	
		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),
	
		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),
	
		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},
	
		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,
	
		rnative = /^[^{]+\{\s*\[native \w/,
	
		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
	
		rsibling = /[+~]/,
		rescape = /'|\\/g,
	
		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},
	
		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};
	
	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?
	
			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :
	
			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}
	
	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,
	
			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;
	
		results = results || [];
	
		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {
	
			return results;
		}
	
		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {
	
			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;
	
			if ( documentIsHTML ) {
	
				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
	
					// ID selector
					if ( (m = match[1]) ) {
	
						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {
	
								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}
	
						// Element context
						} else {
	
							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {
	
								results.push( elem );
								return results;
							}
						}
	
					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;
	
					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {
	
						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}
	
				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
	
					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;
	
					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {
	
						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}
	
						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );
	
						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}
	
					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}
	
		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}
	
	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];
	
		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}
	
	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}
	
	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");
	
		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}
	
	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;
	
		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}
	
	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );
	
		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}
	
		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}
	
		return a ? 1 : -1;
	}
	
	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}
	
	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;
	
				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}
	
	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}
	
	// Expose support vars for convenience
	support = Sizzle.support = {};
	
	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};
	
	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;
	
		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}
	
		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );
	
		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );
	
			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}
	
		/* Attributes
		---------------------------------------------------------------------- */
	
		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});
	
		/* getElement(s)By*
		---------------------------------------------------------------------- */
	
		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});
	
		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );
	
		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});
	
		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];
	
			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}
	
		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );
	
				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :
	
			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );
	
				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}
	
					return tmp;
				}
				return results;
			};
	
		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};
	
		/* QSA/matchesSelector
		---------------------------------------------------------------------- */
	
		// QSA and matchesSelector support
	
		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];
	
		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];
	
		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";
	
				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}
	
				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}
	
				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}
	
				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}
	
				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});
	
			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );
	
				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}
	
				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}
	
				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}
	
		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {
	
			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );
	
				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}
	
		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );
	
		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );
	
		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};
	
		/* Sorting
		---------------------------------------------------------------------- */
	
		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {
	
			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}
	
			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :
	
				// Otherwise we know they are disconnected
				1;
	
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {
	
				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}
	
				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}
	
			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}
	
			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];
	
			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
	
			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}
	
			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}
	
			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}
	
			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :
	
				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};
	
		return document;
	};
	
	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};
	
	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );
	
		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {
	
			try {
				var ret = matches.call( elem, expr );
	
				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}
	
		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};
	
	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};
	
	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}
	
		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;
	
		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};
	
	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};
	
	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;
	
		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );
	
		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}
	
		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;
	
		return results;
	};
	
	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;
	
		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes
	
		return ret;
	};
	
	Expr = Sizzle.selectors = {
	
		// Can be adjusted by the user
		cacheLength: 50,
	
		createPseudo: markFunction,
	
		match: matchExpr,
	
		attrHandle: {},
	
		find: {},
	
		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},
	
		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );
	
				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
	
				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}
	
				return match.slice( 0, 4 );
			},
	
			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();
	
				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}
	
					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
	
				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}
	
				return match;
			},
	
			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];
	
				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}
	
				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";
	
				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
	
					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}
	
				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},
	
		filter: {
	
			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},
	
			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];
	
				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},
	
			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );
	
					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}
	
					result += "";
	
					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},
	
			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";
	
				return first === 1 && last === 0 ?
	
					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :
	
					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;
	
						if ( parent ) {
	
							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {
	
											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}
	
							start = [ forward ? parent.firstChild : parent.lastChild ];
	
							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {
	
								// Seek `elem` from a previously-cached index
	
								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});
	
								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});
	
								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];
	
								while ( (node = ++nodeIndex && node && node[ dir ] ||
	
									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {
	
									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}
	
							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});
	
									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});
	
									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}
	
								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {
	
										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {
	
											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});
	
												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});
	
												uniqueCache[ type ] = [ dirruns, diff ];
											}
	
											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}
	
							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},
	
			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );
	
				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}
	
				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}
	
				return fn;
			}
		},
	
		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );
	
				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;
	
						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),
	
			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),
	
			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),
	
			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {
	
							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),
	
			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},
	
			"root": function( elem ) {
				return elem === docElem;
			},
	
			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},
	
			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},
	
			"disabled": function( elem ) {
				return elem.disabled === true;
			},
	
			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},
	
			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}
	
				return elem.selected === true;
			},
	
			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},
	
			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},
	
			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},
	
			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},
	
			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},
	
			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&
	
					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},
	
			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),
	
			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),
	
			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),
	
			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),
	
			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};
	
	Expr.pseudos["nth"] = Expr.pseudos["eq"];
	
	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}
	
	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();
	
	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];
	
		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}
	
		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;
	
		while ( soFar ) {
	
			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}
	
			matched = false;
	
			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}
	
			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}
	
			if ( !matched ) {
				break;
			}
		}
	
		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};
	
	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}
	
	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;
	
		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :
	
			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];
	
				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});
	
							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});
	
							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {
	
								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;
	
								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}
	
	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}
	
	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}
	
	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;
	
		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}
	
		return newUnmatched;
	}
	
	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,
	
				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),
	
				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,
	
				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?
	
						// ...intermediate processing is necessary
						[] :
	
						// ...otherwise use results directly
						results :
					matcherIn;
	
			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}
	
			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );
	
				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}
	
			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}
	
					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {
	
							seed[temp] = !(results[temp] = elem);
						}
					}
				}
	
			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}
	
	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,
	
			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];
	
		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );
	
				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}
	
		return elementMatcher( matchers );
	}
	
	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;
	
				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}
	
				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}
	
					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}
	
						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}
	
				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;
	
				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}
	
					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}
	
						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}
	
					// Add matches to results
					push.apply( results, setMatched );
	
					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {
	
						Sizzle.uniqueSort( results );
					}
				}
	
				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}
	
				return unmatched;
			};
	
		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}
	
	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];
	
		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}
	
			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	
			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};
	
	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );
	
		results = results || [];
	
		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {
	
			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {
	
				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
	
				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}
	
				selector = selector.slice( tokens.shift().value.length );
			}
	
			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];
	
				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {
	
						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}
	
						break;
					}
				}
			}
		}
	
		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};
	
	// One-time assignments
	
	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;
	
	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;
	
	// Initialize against the default document
	setDocument();
	
	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});
	
	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}
	
	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}
	
	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}
	
	return Sizzle;
	
	})( window );
	
	
	
	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;
	
	
	
	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;
	
		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};
	
	
	var siblings = function( n, elem ) {
		var matched = [];
	
		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}
	
		return matched;
	};
	
	
	var rneedsContext = jQuery.expr.match.needsContext;
	
	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );
	
	
	
	var risSimple = /^.[^:#\[\.,]*$/;
	
	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );
	
		}
	
		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );
	
		}
	
		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}
	
			qualifier = jQuery.filter( qualifier, elements );
		}
	
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}
	
	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];
	
		if ( not ) {
			expr = ":not(" + expr + ")";
		}
	
		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};
	
	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;
	
			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}
	
			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}
	
			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,
	
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );
	
	
	// Initialize a jQuery object
	
	
	// A central reference to the root jQuery(document)
	var rootjQuery,
	
		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
	
		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;
	
			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}
	
			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;
	
			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {
	
					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];
	
				} else {
					match = rquickExpr.exec( selector );
				}
	
				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {
	
					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;
	
						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );
	
						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {
	
								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );
	
								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}
	
						return this;
	
					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );
	
						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {
	
							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}
	
						this.context = document;
						this.selector = selector;
						return this;
					}
	
				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );
	
				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}
	
			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;
	
			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :
	
					// Execute immediately if ready is not present
					selector( jQuery );
			}
	
			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}
	
			return jQuery.makeArray( selector, this );
		};
	
	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;
	
	// Initialize central reference
	rootjQuery = jQuery( document );
	
	
	var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	
		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};
	
	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;
	
			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},
	
		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;
	
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {
	
					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :
	
						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {
	
						matched.push( cur );
						break;
					}
				}
			}
	
			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},
	
		// Determine the position of an element within the set
		index: function( elem ) {
	
			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}
	
			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}
	
			// Locate the position of the desired element
			return indexOf.call( this,
	
				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},
	
		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},
	
		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );
	
	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}
	
	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );
	
			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}
	
			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}
	
			if ( this.length > 1 ) {
	
				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}
	
				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}
	
			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );
	
	
	
	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}
	
	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {
	
		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );
	
		var // Flag to know if list is currently firing
			firing,
	
			// Last fire value for non-forgettable lists
			memory,
	
			// Flag to know if list was already fired
			fired,
	
			// Flag to prevent firing
			locked,
	
			// Actual callback list
			list = [],
	
			// Queue of execution data for repeatable lists
			queue = [],
	
			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,
	
			// Fire callbacks
			fire = function() {
	
				// Enforce single-firing
				locked = options.once;
	
				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {
	
						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {
	
							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}
	
				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}
	
				firing = false;
	
				// Clean up if we're done firing for good
				if ( locked ) {
	
					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];
	
					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},
	
			// Actual Callbacks object
			self = {
	
				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {
	
						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}
	
						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {
	
									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );
	
						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
	
							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},
	
				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},
	
				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},
	
				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},
	
				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},
	
				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},
	
				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},
	
				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};
	
		return self;
	};
	
	
	jQuery.extend( {
	
		Deferred: function( func ) {
			var tuples = [
	
					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
	
								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},
	
					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};
	
			// Keep pipe for back-compat
			promise.pipe = promise.then;
	
			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];
	
				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;
	
				// Handle state
				if ( stateString ) {
					list.add( function() {
	
						// state = [ resolved | rejected ]
						state = stateString;
	
					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}
	
				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );
	
			// Make the deferred a promise
			promise.promise( deferred );
	
			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}
	
			// All done!
			return deferred;
		},
	
		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,
	
				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,
	
				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),
	
				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},
	
				progressValues, progressContexts, resolveContexts;
	
			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}
	
			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}
	
			return deferred.promise();
		}
	} );
	
	
	// The deferred used on DOM ready
	var readyList;
	
	jQuery.fn.ready = function( fn ) {
	
		// Add the callback
		jQuery.ready.promise().done( fn );
	
		return this;
	};
	
	jQuery.extend( {
	
		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,
	
		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,
	
		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},
	
		// Handle when the DOM is ready
		ready: function( wait ) {
	
			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}
	
			// Remember that the DOM is ready
			jQuery.isReady = true;
	
			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}
	
			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );
	
			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );
	
	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}
	
	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {
	
			readyList = jQuery.Deferred();
	
			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
	
				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );
	
			} else {
	
				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );
	
				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};
	
	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();
	
	
	
	
	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;
	
		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}
	
		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;
	
			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}
	
			if ( bulk ) {
	
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;
	
				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}
	
			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}
	
		return chainable ?
			elems :
	
			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {
	
		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};
	
	
	
	
	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}
	
	Data.uid = 1;
	
	Data.prototype = {
	
		register: function( owner, initial ) {
			var value = initial || {};
	
			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;
	
			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {
	
			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}
	
			// Check if the owner object already has a cache
			var value = owner[ this.expando ];
	
			// If not, create one
			if ( !value ) {
				value = {};
	
				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {
	
					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;
	
					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}
	
			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );
	
			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;
	
			// Handle: [ owner, { properties } ] args
			} else {
	
				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;
	
			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {
	
				stored = this.get( owner, key );
	
				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}
	
			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );
	
			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];
	
			if ( cache === undefined ) {
				return;
			}
	
			if ( key === undefined ) {
				this.register( owner );
	
			} else {
	
				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {
	
					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );
	
					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {
	
						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}
	
				i = name.length;
	
				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}
	
			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {
	
				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();
	
	var dataUser = new Data();
	
	
	
	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
	
	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;
	
	function dataAttr( elem, key, data ) {
		var name;
	
		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );
	
			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :
	
						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}
	
				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}
	
	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},
	
		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},
	
		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},
	
		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},
	
		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );
	
	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;
	
			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );
	
					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {
	
							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}
	
				return data;
			}
	
			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}
	
			return access( this, function( value ) {
				var data, camelKey;
	
				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {
	
					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||
	
						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );
	
					if ( data !== undefined ) {
						return data;
					}
	
					camelKey = jQuery.camelCase( key );
	
					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}
	
					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}
	
					// We tried really hard, but the data doesn't exist.
					return;
				}
	
				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {
	
					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );
	
					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );
	
					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},
	
		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );
	
	
	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;
	
			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );
	
				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},
	
		dequeue: function( elem, type ) {
			type = type || "fx";
	
			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};
	
			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}
	
			if ( fn ) {
	
				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}
	
				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}
	
			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},
	
		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );
	
	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;
	
			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}
	
			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}
	
			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );
	
					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );
	
					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},
	
		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};
	
			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";
	
			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
	
	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
	
	
	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
	
	var isHidden = function( elem, el ) {
	
			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};
	
	
	
	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),
	
			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );
	
		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {
	
			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];
	
			// Make sure we update the tween properties later on
			valueParts = valueParts || [];
	
			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;
	
			do {
	
				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";
	
				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );
	
			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}
	
		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;
	
			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );
	
	var rtagName = ( /<([\w:-]+)/ );
	
	var rscriptType = ( /^$|\/(?:java|ecma)script/i );
	
	
	
	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {
	
		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
	
		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	
		_default: [ 0, "", "" ]
	};
	
	// Support: IE9
	wrapMap.optgroup = wrapMap.option;
	
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	
	function getAll( context, tag ) {
	
		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];
	
		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}
	
	
	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}
	
	
	var rhtml = /<|&#?\w+;/;
	
	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;
	
		for ( ; i < l; i++ ) {
			elem = elems[ i ];
	
			if ( elem || elem === 0 ) {
	
				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );
	
				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );
	
				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );
	
					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];
	
					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}
	
					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );
	
					// Remember the top-level container
					tmp = fragment.firstChild;
	
					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}
	
		// Remove wrapper from fragment
		fragment.textContent = "";
	
		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {
	
			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}
	
			contains = jQuery.contains( elem.ownerDocument, elem );
	
			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );
	
			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}
	
			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}
	
		return fragment;
	}
	
	
	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );
	
		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );
	
		div.appendChild( input );
	
		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;
	
		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();
	
	
	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
	
	function returnTrue() {
		return true;
	}
	
	function returnFalse() {
		return false;
	}
	
	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}
	
	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;
	
		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
	
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
	
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}
	
		if ( data == null && fn == null ) {
	
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
	
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
	
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}
	
		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
	
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
	
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}
	
	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {
	
		global: {},
	
		add: function( elem, types, handler, data, selector ) {
	
			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );
	
			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}
	
			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}
	
			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}
	
			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {
	
					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}
	
			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}
	
				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};
	
				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;
	
				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};
	
				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );
	
				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;
	
					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
	
						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}
	
				if ( special.add ) {
					special.add.call( elem, handleObj );
	
					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}
	
				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}
	
				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}
	
		},
	
		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {
	
			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );
	
			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}
	
			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();
	
				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}
	
				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );
	
				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];
	
					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );
	
						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}
	
				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
	
						jQuery.removeEvent( elem, type, elemData.handle );
					}
	
					delete events[ type ];
				}
			}
	
			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},
	
		dispatch: function( event ) {
	
			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );
	
			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};
	
			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;
	
			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}
	
			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );
	
			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;
	
				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {
	
					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {
	
						event.handleObj = handleObj;
						event.data = handleObj.data;
	
						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );
	
						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}
	
			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}
	
			return event.result;
		},
	
		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;
	
			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {
	
				for ( ; cur !== this; cur = cur.parentNode || this ) {
	
					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];
	
							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";
	
							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}
	
			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}
	
			return handlerQueue;
		},
	
		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),
	
		fixHooks: {},
	
		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
	
		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;
	
				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	
					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		},
	
		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}
	
			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];
	
			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
	
			event = new jQuery.Event( originalEvent );
	
			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}
	
			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}
	
			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}
	
			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},
	
		special: {
			load: {
	
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
	
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
	
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},
	
				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},
	
			beforeunload: {
				postDispatch: function( event ) {
	
					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};
	
	jQuery.removeEvent = function( elem, type, handle ) {
	
		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};
	
	jQuery.Event = function( src, props ) {
	
		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}
	
		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
	
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&
	
					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;
	
		// Event type
		} else {
			this.type = src;
		}
	
		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}
	
		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};
	
	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
		isSimulated: false,
	
		preventDefault: function() {
			var e = this.originalEvent;
	
			this.isDefaultPrevented = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;
	
			this.isPropagationStopped = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;
	
			this.isImmediatePropagationStopped = returnTrue;
	
			if ( e && !this.isSimulated ) {
				e.stopImmediatePropagation();
			}
	
			this.stopPropagation();
		}
	};
	
	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,
	
			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;
	
				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );
	
	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {
	
				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {
	
				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {
	
				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );
	
	
	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
	
		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,
	
		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;
	
	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?
	
			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}
	
	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );
	
		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}
	
		return elem;
	}
	
	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
	
		if ( dest.nodeType !== 1 ) {
			return;
		}
	
		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;
	
			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};
	
				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}
	
		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );
	
			dataUser.set( dest, udataCur );
		}
	}
	
	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();
	
		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;
	
		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}
	
	function domManip( collection, args, callback, ignored ) {
	
		// Flatten any nested arrays
		args = concat.apply( [], args );
	
		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );
	
		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}
	
		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;
	
			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}
	
			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;
	
				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;
	
					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );
	
						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
	
							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}
	
					callback.call( collection[ i ], node, i );
				}
	
				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;
	
					// Reenable scripts
					jQuery.map( scripts, restoreScript );
	
					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {
	
							if ( node.src ) {
	
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}
	
		return collection;
	}
	
	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;
	
		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}
	
			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}
	
		return elem;
	}
	
	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},
	
		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );
	
			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {
	
				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );
	
				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}
	
			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );
	
					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}
	
			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}
	
			// Return the cloned set
			return clone;
		},
	
		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;
	
			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );
	
								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {
	
						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );
	
	jQuery.fn.extend( {
	
		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,
	
		detach: function( selector ) {
			return remove( this, selector, true );
		},
	
		remove: function( selector ) {
			return remove( this, selector );
		},
	
		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},
	
		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},
	
		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},
	
		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},
	
		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},
	
		empty: function() {
			var elem,
				i = 0;
	
			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {
	
					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );
	
					// Remove any remaining nodes
					elem.textContent = "";
				}
			}
	
			return this;
		},
	
		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
	
			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},
	
		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;
	
				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}
	
				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {
	
					value = jQuery.htmlPrefilter( value );
	
					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};
	
							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}
	
						elem = 0;
	
					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}
	
				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},
	
		replaceWith: function() {
			var ignored = [];
	
			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;
	
				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}
	
			// Force callback invocation
			}, ignored );
		}
	} );
	
	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;
	
			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );
	
				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}
	
			return this.pushStack( ret );
		};
	} );
	
	
	var iframe,
		elemdisplay = {
	
			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};
	
	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */
	
	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
	
			display = jQuery.css( elem[ 0 ], "display" );
	
		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();
	
		return display;
	}
	
	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];
	
		if ( !display ) {
			display = actualDisplay( nodeName, doc );
	
			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {
	
				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );
	
				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;
	
				// Support: IE
				doc.write();
				doc.close();
	
				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}
	
			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}
	
		return display;
	}
	var rmargin = ( /^margin/ );
	
	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );
	
	var getStyles = function( elem ) {
	
			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;
	
			if ( !view || !view.opener ) {
				view = window;
			}
	
			return view.getComputedStyle( elem );
		};
	
	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};
	
		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}
	
		ret = callback.apply( elem, args || [] );
	
		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	
		return ret;
	};
	
	
	var documentElement = document.documentElement;
	
	
	
	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );
	
		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}
	
		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";
	
		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );
	
		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =
	
				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );
	
			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";
	
			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";
	
			documentElement.removeChild( container );
		}
	
		jQuery.extend( support, {
			pixelPosition: function() {
	
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {
	
				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {
	
				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {
	
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );
	
				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
	
					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );
	
				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );
	
				documentElement.removeChild( container );
				div.removeChild( marginDiv );
	
				return ret;
			}
		} );
	} )();
	
	
	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;
	
		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;
	
		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}
	
		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
	
			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {
	
				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;
	
				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;
	
				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}
	
		return ret !== undefined ?
	
			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}
	
	
	function addGetHookIf( conditionFn, hookFn ) {
	
		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {
	
					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}
	
				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}
	
	
	var
	
		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	
		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},
	
		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;
	
	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {
	
		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}
	
		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;
	
		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}
	
	function setPositiveNumber( elem, value, subtract ) {
	
		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?
	
			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}
	
	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?
	
			// If we already have the right measurement, avoid augmentation
			4 :
	
			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,
	
			val = 0;
	
		for ( ; i < 4; i += 2 ) {
	
			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}
	
			if ( isBorderBox ) {
	
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}
	
				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {
	
				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
	
				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}
	
		return val;
	}
	
	function getWidthOrHeight( elem, name, extra ) {
	
		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";
	
		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {
	
			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}
	
			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}
	
			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );
	
			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}
	
		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}
	
	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;
	
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
	
			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {
	
				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}
	
				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );
	
				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}
	
		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}
	
		return elements;
	}
	
	jQuery.extend( {
	
		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {
	
						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},
	
		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},
	
		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},
	
		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {
	
			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}
	
			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;
	
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;
	
				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );
	
					// Fixes bug #9237
					type = "number";
				}
	
				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}
	
				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}
	
				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}
	
				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {
	
					style[ name ] = value;
				}
	
			} else {
	
				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {
	
					return ret;
				}
	
				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},
	
		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );
	
			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );
	
			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];
	
			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}
	
			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}
	
			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}
	
			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );
	
	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {
	
					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},
	
			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);
	
				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {
	
					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}
	
				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );
	
	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);
	
	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);
	
	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},
	
					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];
	
				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}
	
				return expanded;
			}
		};
	
		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );
	
	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;
	
				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;
	
					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}
	
					return map;
				}
	
				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}
	
			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );
	
	
	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;
	
	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];
	
			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];
	
			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;
	
			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}
	
			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};
	
	Tween.prototype.init.prototype = Tween.prototype;
	
	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;
	
				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}
	
				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );
	
				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {
	
				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};
	
	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};
	
	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};
	
	jQuery.fx = Tween.prototype.init;
	
	// Back Compat <1.8 extension point
	jQuery.fx.step = {};
	
	
	
	
	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;
	
	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}
	
	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };
	
		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}
	
		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}
	
		return attrs;
	}
	
	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {
	
				// We're done with this property
				return tween;
			}
		}
	}
	
	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );
	
		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;
	
			anim.always( function() {
	
				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}
	
		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
	
			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];
	
			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );
	
			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;
	
			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}
	
		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	
		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {
	
					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
	
			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}
	
		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}
	
			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;
	
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
	
				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}
	
		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}
	
	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;
	
		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}
	
			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}
	
			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];
	
				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}
	
	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {
	
				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
	
					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;
	
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}
	
				deferred.notifyWith( elem, [ animation, percent, remaining ] );
	
				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,
	
						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}
	
					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;
	
		propFilter( props, animation.opts.specialEasing );
	
		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}
	
		jQuery.map( props, createTween, animation );
	
		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}
	
		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);
	
		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}
	
	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},
	
		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}
	
			var prop,
				index = 0,
				length = props.length;
	
			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},
	
		prefilters: [ defaultPrefilter ],
	
		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );
	
	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};
	
		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
	
		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}
	
		// Queueing
		opt.old = opt.complete;
	
		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
	
			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};
	
		return opt;
	};
	
	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {
	
			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()
	
				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {
	
					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );
	
					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;
	
			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};
	
			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}
	
			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );
	
				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}
	
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {
	
						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}
	
				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;
	
				// Enable finishing flag on private data
				data.finish = true;
	
				// Empty the queue first
				jQuery.queue( this, type, [] );
	
				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}
	
				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}
	
				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}
	
				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );
	
	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );
	
	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );
	
	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;
	
		fxNow = jQuery.now();
	
		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
	
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}
	
		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};
	
	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};
	
	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};
	
	jQuery.fx.stop = function() {
		window.clearInterval( timerId );
	
		timerId = null;
	};
	
	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,
	
		// Default speed
		_default: 400
	};
	
	
	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";
	
		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};
	
	
	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );
	
		input.type = "checkbox";
	
		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";
	
		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;
	
		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;
	
		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();
	
	
	var boolHook,
		attrHandle = jQuery.expr.attrHandle;
	
	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},
	
		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );
	
	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}
	
			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}
	
			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}
	
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				elem.setAttribute( name, value + "" );
				return value;
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			ret = jQuery.find.attr( elem, name );
	
			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},
	
		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},
	
		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );
	
			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;
	
					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {
	
						// Set corresponding property to false
						elem[ propName ] = false;
					}
	
					elem.removeAttribute( name );
				}
			}
		}
	} );
	
	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {
	
				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;
	
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {
	
				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );
	
	
	
	
	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;
	
	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},
	
		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );
	
	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;
	
			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}
	
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
	
				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}
	
			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}
	
				return ( elem[ name ] = value );
			}
	
			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}
	
			return elem[ name ];
		},
	
		propHooks: {
			tabIndex: {
				get: function( elem ) {
	
					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );
	
					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},
	
		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );
	
	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;
	
					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}
	
	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );
	
	
	
	
	var rclass = /[\t\r\n\f]/g;
	
	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}
	
	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}
	
			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}
	
			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];
	
				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
	
					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );
	
					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
	
							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}
	
						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}
	
			return this;
		},
	
		toggleClass: function( value, stateVal ) {
			var type = typeof value;
	
			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}
	
			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}
	
			return this.each( function() {
				var className, i, self, classNames;
	
				if ( type === "string" ) {
	
					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];
	
					while ( ( className = classNames[ i++ ] ) ) {
	
						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}
	
				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {
	
						// Store className if set
						dataPriv.set( this, "__className__", className );
					}
	
					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},
	
		hasClass: function( selector ) {
			var className, elem,
				i = 0;
	
			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}
	
			return false;
		}
	} );
	
	
	
	
	var rreturn = /\r/g,
		rspaces = /[\x20\t\r\n\f]+/g;
	
	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];
	
			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];
	
					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}
	
					ret = elem.value;
	
					return typeof ret === "string" ?
	
						// Handle most common string cases
						ret.replace( rreturn, "" ) :
	
						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}
	
				return;
			}
	
			isFunction = jQuery.isFunction( value );
	
			return this.each( function( i ) {
				var val;
	
				if ( this.nodeType !== 1 ) {
					return;
				}
	
				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}
	
				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";
	
				} else if ( typeof val === "number" ) {
					val += "";
	
				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}
	
				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];
	
				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );
	
	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {
	
					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :
	
						// Support: IE10-11+
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;
	
					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];
	
						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&
	
								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {
	
							// Get the specific value for the option
							value = jQuery( option ).val();
	
							// We don't need an array for one selects
							if ( one ) {
								return value;
							}
	
							// Multi-Selects return an array
							values.push( value );
						}
					}
	
					return values;
				},
	
				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;
	
					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}
	
					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );
	
	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );
	
	
	
	
	// Return jQuery for attributes-only inclusion
	
	
	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;
	
	jQuery.extend( jQuery.event, {
	
		trigger: function( event, data, elem, onlyHandlers ) {
	
			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];
	
			cur = tmp = elem = elem || document;
	
			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}
	
			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}
	
			if ( type.indexOf( "." ) > -1 ) {
	
				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;
	
			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );
	
			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;
	
			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}
	
			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );
	
			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
	
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
	
				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}
	
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}
	
			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
	
				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;
	
				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}
	
				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;
	
			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {
	
				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {
	
					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {
	
						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];
	
						if ( tmp ) {
							elem[ ontype ] = null;
						}
	
						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;
	
						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}
	
			return event.result;
		},
	
		// Piggyback on a donor event to simulate a different one
		// Used only for `focus(in | out)` events
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true
				}
			);
	
			jQuery.event.trigger( e, null, elem );
		}
	
	} );
	
	jQuery.fn.extend( {
	
		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );
	
	
	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {
	
		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );
	
	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );
	
	
	
	
	support.focusin = "onfocusin" in window;
	
	
	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {
	
			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};
	
			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );
	
					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;
	
					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );
	
					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;
	
	var nonce = jQuery.now();
	
	var rquery = ( /\?/ );
	
	
	
	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};
	
	
	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
	
		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}
	
		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};
	
	
	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	
		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,
	
		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},
	
		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},
	
		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),
	
		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;
	
	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {
	
		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {
	
			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}
	
			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];
	
			if ( jQuery.isFunction( func ) ) {
	
				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {
	
					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );
	
					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}
	
	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {
	
		var inspected = {},
			seekingTransport = ( structure === transports );
	
		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {
	
					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}
	
		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}
	
	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};
	
		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}
	
		return target;
	}
	
	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {
	
		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;
	
		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}
	
		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}
	
		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {
	
			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}
	
			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}
	
		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}
	
	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},
	
			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();
	
		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}
	
		current = dataTypes.shift();
	
		// Convert to each sequential dataType
		while ( current ) {
	
			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}
	
			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}
	
			prev = current;
			current = dataTypes.shift();
	
			if ( current ) {
	
			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {
	
					current = prev;
	
				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {
	
					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];
	
					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {
	
							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {
	
								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {
	
									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];
	
									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}
	
					// Apply converter (if not an equivalence)
					if ( conv !== true ) {
	
						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}
	
		return { state: "success", data: response };
	}
	
	jQuery.extend( {
	
		// Counter for holding the number of active queries
		active: 0,
	
		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},
	
		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/
	
			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},
	
			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},
	
			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},
	
			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {
	
				// Convert anything to text
				"* text": String,
	
				// Text to html (true = no transformation)
				"text html": true,
	
				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,
	
				// Parse text as xml
				"text xml": jQuery.parseXML
			},
	
			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},
	
		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?
	
				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :
	
				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},
	
		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),
	
		// Main method
		ajax: function( url, options ) {
	
			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}
	
			// Force options to be an object
			options = options || {};
	
			var transport,
	
				// URL without anti-cache param
				cacheURL,
	
				// Response headers
				responseHeadersString,
				responseHeaders,
	
				// timeout handle
				timeoutTimer,
	
				// Url cleanup var
				urlAnchor,
	
				// To know if global events are to be dispatched
				fireGlobals,
	
				// Loop variable
				i,
	
				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),
	
				// Callbacks context
				callbackContext = s.context || s,
	
				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,
	
				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),
	
				// Status-dependent callbacks
				statusCode = s.statusCode || {},
	
				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},
	
				// The jqXHR state
				state = 0,
	
				// Default abort message
				strAbort = "canceled",
	
				// Fake xhr
				jqXHR = {
					readyState: 0,
	
					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},
	
					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},
	
					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},
	
					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},
	
					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {
	
									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {
	
								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},
	
					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};
	
			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;
	
			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );
	
			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;
	
			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];
	
			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );
	
				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;
	
					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {
	
					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}
	
			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}
	
			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );
	
			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}
	
			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;
	
			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}
	
			// Uppercase the type
			s.type = s.type.toUpperCase();
	
			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );
	
			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;
	
			// More options handling for requests with no content
			if ( !s.hasContent ) {
	
				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
	
					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}
	
				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?
	
						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :
	
						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}
	
			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}
	
			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}
	
			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);
	
			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}
	
			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
	
				// Abort if not done already and return
				return jqXHR.abort();
			}
	
			// Aborting is no longer a cancellation
			strAbort = "abort";
	
			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}
	
			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );
	
			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;
	
				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}
	
				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}
	
				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}
	
				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {
	
					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );
	
					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}
	
			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;
	
				// Called once
				if ( state === 2 ) {
					return;
				}
	
				// State is "done" now
				state = 2;
	
				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}
	
				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;
	
				// Cache response headers
				responseHeadersString = headers || "";
	
				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;
	
				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;
	
				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}
	
				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );
	
				// If successful, handle type chaining
				if ( isSuccess ) {
	
					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}
	
					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";
	
					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";
	
					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {
	
					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}
	
				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";
	
				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}
	
				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;
	
				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}
	
				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );
	
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
	
					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}
	
			return jqXHR;
		},
	
		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},
	
		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );
	
	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {
	
			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}
	
			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );
	
	
	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,
	
			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};
	
	
	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;
	
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}
	
			if ( this[ 0 ] ) {
	
				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
	
				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}
	
				wrap.map( function() {
					var elem = this;
	
					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}
	
					return elem;
				} ).append( this );
			}
	
			return this;
		},
	
		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}
	
			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();
	
				if ( contents.length ) {
					contents.wrapAll( html );
	
				} else {
					self.append( html );
				}
			} );
		},
	
		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );
	
			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},
	
		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );
	
	
	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {
	
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};
	
	
	
	
	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;
	
	function buildParams( prefix, obj, traditional, add ) {
		var name;
	
		if ( jQuery.isArray( obj ) ) {
	
			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {
	
					// Treat each array item as a scalar.
					add( prefix, v );
	
				} else {
	
					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );
	
		} else if ( !traditional && jQuery.type( obj ) === "object" ) {
	
			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}
	
		} else {
	
			// Serialize scalar item.
			add( prefix, obj );
		}
	}
	
	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {
	
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};
	
		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}
	
		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
	
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );
	
		} else {
	
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}
	
		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};
	
	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {
	
				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;
	
				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();
	
				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );
	
	
	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};
	
	var xhrSuccessStatus = {
	
			// File protocol always yields status code 0, assume 200
			0: 200,
	
			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();
	
	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;
	
	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;
	
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();
	
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);
	
					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}
	
					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}
	
					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}
	
					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}
	
					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;
	
								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {
	
									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(
	
											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,
	
										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};
	
					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );
	
					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {
	
							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {
	
								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}
	
					// Create the abort callback
					callback = callback( "abort" );
	
					try {
	
						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {
	
						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},
	
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );
	
	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );
	
	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {
	
		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);
	
					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );
	
	
	
	
	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;
	
	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );
	
	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {
	
		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);
	
		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {
	
			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;
	
			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}
	
			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};
	
			// Force json dataType
			s.dataTypes[ 0 ] = "json";
	
			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};
	
			// Clean-up function (fires after converters)
			jqXHR.always( function() {
	
				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );
	
				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}
	
				// Save back as free
				if ( s[ callbackName ] ) {
	
					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;
	
					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}
	
				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}
	
				responseContainer = overwritten = undefined;
			} );
	
			// Delegate to script
			return "script";
		}
	} );
	
	
	
	
	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;
	
		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];
	
		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}
	
		parsed = buildFragment( [ data ], context, scripts );
	
		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}
	
		return jQuery.merge( [], parsed.childNodes );
	};
	
	
	// Keep a copy of the old load method
	var _load = jQuery.fn.load;
	
	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}
	
		var selector, type, response,
			self = this,
			off = url.indexOf( " " );
	
		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}
	
		// If it's a function
		if ( jQuery.isFunction( params ) ) {
	
			// We assume that it's the callback
			callback = params;
			params = undefined;
	
		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}
	
		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,
	
				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {
	
				// Save response for use in complete callback
				response = arguments;
	
				self.html( selector ?
	
					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :
	
					// Otherwise use the full result
					responseText );
	
			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}
	
		return this;
	};
	
	
	
	
	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );
	
	
	
	
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};
	
	
	
	
	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}
	
	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};
	
			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}
	
			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;
	
			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;
	
			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}
	
			if ( jQuery.isFunction( options ) ) {
	
				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}
	
			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}
	
			if ( "using" in options ) {
				options.using.call( elem, props );
	
			} else {
				curElem.css( props );
			}
		}
	};
	
	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}
	
			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;
	
			if ( !doc ) {
				return;
			}
	
			docElem = doc.documentElement;
	
			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}
	
			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},
	
		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}
	
			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };
	
			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {
	
				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();
	
			} else {
	
				// Get *real* offsetParent
				offsetParent = this.offsetParent();
	
				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}
	
				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}
	
			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},
	
		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;
	
				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}
	
				return offsetParent || documentElement;
			} );
		}
	} );
	
	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;
	
		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );
	
				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}
	
				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);
	
				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );
	
	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );
	
					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );
	
	
	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {
	
			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );
	
				return access( this, function( elem, type, value ) {
					var doc;
	
					if ( jQuery.isWindow( elem ) ) {
	
						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}
	
					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;
	
						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}
	
					return value === undefined ?
	
						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :
	
						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );
	
	
	jQuery.fn.extend( {
	
		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},
	
		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {
	
			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );
	
	jQuery.fn.andSelf = jQuery.fn.addBack;
	
	
	
	
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	
	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
	
	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	
	
	
	var
	
		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,
	
		// Map over the $ in case of overwrite
		_$ = window.$;
	
	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}
	
		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}
	
		return jQuery;
	};
	
	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}
	
	return jQuery;
	}));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {(function (root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  else if (typeof module === 'object' && module.exports) {
	    module.exports = factory();
	  }
	  else {
	    root.MeteorReactive = factory();
	  }
	}(this, function () {
	  return (function() {
	    var _, Base64, EJSON, EJSONTest, Meteor, Package, Tracker, ReactiveDict,
	        ReactiveVar;
	/**
	 * @license
	 * lodash 3.10.1 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern include="all,any,each,extend,has,isArguments,isArray,isEmpty,isNaN,map,size,noConflict" iife=";(function(){var define, module, exports, global, window, self; 	%output%}).call(this);_" -d -o build/lodash.custom.js`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	;(function(){var define, module, exports, global, window, self; 	
	  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
	  var undefined;
	
	  /** Used as the semantic version number. */
	  var VERSION = '3.10.1';
	
	  /** Used as the `TypeError` message for "Functions" methods. */
	  var FUNC_ERROR_TEXT = 'Expected a function';
	
	  /** `Object#toString` result references. */
	  var argsTag = '[object Arguments]',
	      arrayTag = '[object Array]',
	      boolTag = '[object Boolean]',
	      dateTag = '[object Date]',
	      errorTag = '[object Error]',
	      funcTag = '[object Function]',
	      mapTag = '[object Map]',
	      numberTag = '[object Number]',
	      objectTag = '[object Object]',
	      regexpTag = '[object RegExp]',
	      setTag = '[object Set]',
	      stringTag = '[object String]',
	      weakMapTag = '[object WeakMap]';
	
	  var arrayBufferTag = '[object ArrayBuffer]',
	      float32Tag = '[object Float32Array]',
	      float64Tag = '[object Float64Array]',
	      int8Tag = '[object Int8Array]',
	      int16Tag = '[object Int16Array]',
	      int32Tag = '[object Int32Array]',
	      uint8Tag = '[object Uint8Array]',
	      uint8ClampedTag = '[object Uint8ClampedArray]',
	      uint16Tag = '[object Uint16Array]',
	      uint32Tag = '[object Uint32Array]';
	
	  /** Used to match property names within property paths. */
	  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
	      reIsPlainProp = /^\w*$/,
	      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
	
	  /** Used to match backslashes in property paths. */
	  var reEscapeChar = /\\(\\)?/g;
	
	  /** Used to match `RegExp` flags from their coerced string values. */
	  var reFlags = /\w*$/;
	
	  /** Used to detect host constructors (Safari > 5). */
	  var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	  /** Used to detect unsigned integer values. */
	  var reIsUint = /^\d+$/;
	
	  /** Used to identify `toStringTag` values of typed arrays. */
	  var typedArrayTags = {};
	  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	  typedArrayTags[uint32Tag] = true;
	  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	
	  /** Used to identify `toStringTag` values supported by `_.clone`. */
	  var cloneableTags = {};
	  cloneableTags[argsTag] = cloneableTags[arrayTag] =
	  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	  cloneableTags[dateTag] = cloneableTags[float32Tag] =
	  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	  cloneableTags[numberTag] = cloneableTags[objectTag] =
	  cloneableTags[regexpTag] = cloneableTags[stringTag] =
	  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	  cloneableTags[errorTag] = cloneableTags[funcTag] =
	  cloneableTags[mapTag] = cloneableTags[setTag] =
	  cloneableTags[weakMapTag] = false;
	
	  /** Used to determine if values are of the language type `Object`. */
	  var objectTypes = {
	    'function': true,
	    'object': true
	  };
	
	  /** Detect free variable `exports`. */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	
	  /** Detect free variable `module`. */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
	
	  /** Detect free variable `global` from Node.js. */
	  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;
	
	  /** Detect free variable `self`. */
	  var freeSelf = objectTypes[typeof self] && self && self.Object && self;
	
	  /** Detect free variable `window`. */
	  var freeWindow = objectTypes[typeof window] && window && window.Object && window;
	
	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
	
	  /**
	   * Used as a reference to the global object.
	   *
	   * The `this` value is used if it's the global object to avoid Greasemonkey's
	   * restricted `window` object, otherwise the `window` object is used.
	   */
	  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Converts `value` to a string if it's not one. An empty string is returned
	   * for `null` or `undefined` values.
	   *
	   * @private
	   * @param {*} value The value to process.
	   * @returns {string} Returns the string.
	   */
	  function baseToString(value) {
	    return value == null ? '' : (value + '');
	  }
	
	  /**
	   * Checks if `value` is object-like.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	   */
	  function isObjectLike(value) {
	    return !!value && typeof value == 'object';
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /** Used for native method references. */
	  var objectProto = Object.prototype;
	
	  /** Used to resolve the decompiled source of functions. */
	  var fnToString = Function.prototype.toString;
	
	  /** Used to check objects for own properties. */
	  var hasOwnProperty = objectProto.hasOwnProperty;
	
	  /**
	   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	   * of values.
	   */
	  var objToString = objectProto.toString;
	
	  /** Used to restore the original `_` reference in `_.noConflict`. */
	  var oldDash = root._;
	
	  /** Used to detect if a method is native. */
	  var reIsNative = RegExp('^' +
	    fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	  );
	
	  /** Native method references. */
	  var ArrayBuffer = root.ArrayBuffer,
	      propertyIsEnumerable = objectProto.propertyIsEnumerable,
	      Uint8Array = root.Uint8Array;
	
	  /* Native method references for those with the same name as other `lodash` methods. */
	  var nativeIsArray = getNative(Array, 'isArray'),
	      nativeKeys = getNative(Object, 'keys'),
	      nativeMax = Math.max;
	
	  /**
	   * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	   * of an array-like value.
	   */
	  var MAX_SAFE_INTEGER = 9007199254740991;
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Creates a `lodash` object which wraps `value` to enable implicit chaining.
	   * Methods that operate on and return arrays, collections, and functions can
	   * be chained together. Methods that retrieve a single value or may return a
	   * primitive value will automatically end the chain returning the unwrapped
	   * value. Explicit chaining may be enabled using `_.chain`. The execution of
	   * chained methods is lazy, that is, execution is deferred until `_#value`
	   * is implicitly or explicitly called.
	   *
	   * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
	   * fusion is an optimization strategy which merge iteratee calls; this can help
	   * to avoid the creation of intermediate data structures and greatly reduce the
	   * number of iteratee executions.
	   *
	   * Chaining is supported in custom builds as long as the `_#value` method is
	   * directly or indirectly included in the build.
	   *
	   * In addition to lodash methods, wrappers have `Array` and `String` methods.
	   *
	   * The wrapper `Array` methods are:
	   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
	   * `splice`, and `unshift`
	   *
	   * The wrapper `String` methods are:
	   * `replace` and `split`
	   *
	   * The wrapper methods that support shortcut fusion are:
	   * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
	   * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
	   * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
	   * and `where`
	   *
	   * The chainable wrapper methods are:
	   * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
	   * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
	   * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
	   * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
	   * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
	   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	   * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
	   * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
	   * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
	   * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
	   * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
	   * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
	   * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
	   * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
	   * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
	   * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
	   *
	   * The wrapper methods that are **not** chainable by default are:
	   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
	   * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
	   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
	   * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
	   * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	   * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
	   * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
	   * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
	   * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
	   * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
	   * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
	   * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
	   * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
	   * `unescape`, `uniqueId`, `value`, and `words`
	   *
	   * The wrapper method `sample` will return a wrapped value when `n` is provided,
	   * otherwise an unwrapped value is returned.
	   *
	   * @name _
	   * @constructor
	   * @category Chain
	   * @param {*} value The value to wrap in a `lodash` instance.
	   * @returns {Object} Returns the new `lodash` wrapper instance.
	   * @example
	   *
	   * var wrapped = _([1, 2, 3]);
	   *
	   * // returns an unwrapped value
	   * wrapped.reduce(function(total, n) {
	   *   return total + n;
	   * });
	   * // => 6
	   *
	   * // returns a wrapped value
	   * var squares = wrapped.map(function(n) {
	   *   return n * n;
	   * });
	   *
	   * _.isArray(squares);
	   * // => false
	   *
	   * _.isArray(squares.value());
	   * // => true
	   */
	  function lodash() {
	    // No operation performed.
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Copies the values of `source` to `array`.
	   *
	   * @private
	   * @param {Array} source The array to copy values from.
	   * @param {Array} [array=[]] The array to copy values to.
	   * @returns {Array} Returns `array`.
	   */
	  function arrayCopy(source, array) {
	    var index = -1,
	        length = source.length;
	
	    array || (array = Array(length));
	    while (++index < length) {
	      array[index] = source[index];
	    }
	    return array;
	  }
	
	  /**
	   * A specialized version of `_.forEach` for arrays without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns `array`.
	   */
	  function arrayEach(array, iteratee) {
	    var index = -1,
	        length = array.length;
	
	    while (++index < length) {
	      if (iteratee(array[index], index, array) === false) {
	        break;
	      }
	    }
	    return array;
	  }
	
	  /**
	   * A specialized version of `_.every` for arrays without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if all elements pass the predicate check,
	   *  else `false`.
	   */
	  function arrayEvery(array, predicate) {
	    var index = -1,
	        length = array.length;
	
	    while (++index < length) {
	      if (!predicate(array[index], index, array)) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  /**
	   * A specialized version of `_.map` for arrays without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns the new mapped array.
	   */
	  function arrayMap(array, iteratee) {
	    var index = -1,
	        length = array.length,
	        result = Array(length);
	
	    while (++index < length) {
	      result[index] = iteratee(array[index], index, array);
	    }
	    return result;
	  }
	
	  /**
	   * A specialized version of `_.some` for arrays without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if any element passes the predicate check,
	   *  else `false`.
	   */
	  function arraySome(array, predicate) {
	    var index = -1,
	        length = array.length;
	
	    while (++index < length) {
	      if (predicate(array[index], index, array)) {
	        return true;
	      }
	    }
	    return false;
	  }
	
	  /**
	   * A specialized version of `_.assign` for customizing assigned values without
	   * support for argument juggling, multiple sources, and `this` binding `customizer`
	   * functions.
	   *
	   * @private
	   * @param {Object} object The destination object.
	   * @param {Object} source The source object.
	   * @param {Function} customizer The function to customize assigned values.
	   * @returns {Object} Returns `object`.
	   */
	  function assignWith(object, source, customizer) {
	    var index = -1,
	        props = keys(source),
	        length = props.length;
	
	    while (++index < length) {
	      var key = props[index],
	          value = object[key],
	          result = customizer(value, source[key], key, object, source);
	
	      if ((result === result ? (result !== value) : (value === value)) ||
	          (value === undefined && !(key in object))) {
	        object[key] = result;
	      }
	    }
	    return object;
	  }
	
	  /**
	   * The base implementation of `_.assign` without support for argument juggling,
	   * multiple sources, and `customizer` functions.
	   *
	   * @private
	   * @param {Object} object The destination object.
	   * @param {Object} source The source object.
	   * @returns {Object} Returns `object`.
	   */
	  function baseAssign(object, source) {
	    return source == null
	      ? object
	      : baseCopy(source, keys(source), object);
	  }
	
	  /**
	   * Copies properties of `source` to `object`.
	   *
	   * @private
	   * @param {Object} source The object to copy properties from.
	   * @param {Array} props The property names to copy.
	   * @param {Object} [object={}] The object to copy properties to.
	   * @returns {Object} Returns `object`.
	   */
	  function baseCopy(source, props, object) {
	    object || (object = {});
	
	    var index = -1,
	        length = props.length;
	
	    while (++index < length) {
	      var key = props[index];
	      object[key] = source[key];
	    }
	    return object;
	  }
	
	  /**
	   * The base implementation of `_.callback` which supports specifying the
	   * number of arguments to provide to `func`.
	   *
	   * @private
	   * @param {*} [func=_.identity] The value to convert to a callback.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param {number} [argCount] The number of arguments to provide to `func`.
	   * @returns {Function} Returns the callback.
	   */
	  function baseCallback(func, thisArg, argCount) {
	    var type = typeof func;
	    if (type == 'function') {
	      return thisArg === undefined
	        ? func
	        : bindCallback(func, thisArg, argCount);
	    }
	    if (func == null) {
	      return identity;
	    }
	    if (type == 'object') {
	      return baseMatches(func);
	    }
	    return thisArg === undefined
	      ? property(func)
	      : baseMatchesProperty(func, thisArg);
	  }
	
	  /**
	   * The base implementation of `_.clone` without support for argument juggling
	   * and `this` binding `customizer` functions.
	   *
	   * @private
	   * @param {*} value The value to clone.
	   * @param {boolean} [isDeep] Specify a deep clone.
	   * @param {Function} [customizer] The function to customize cloning values.
	   * @param {string} [key] The key of `value`.
	   * @param {Object} [object] The object `value` belongs to.
	   * @param {Array} [stackA=[]] Tracks traversed source objects.
	   * @param {Array} [stackB=[]] Associates clones with source counterparts.
	   * @returns {*} Returns the cloned value.
	   */
	  function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	    var result;
	    if (customizer) {
	      result = object ? customizer(value, key, object) : customizer(value);
	    }
	    if (result !== undefined) {
	      return result;
	    }
	    if (!isObject(value)) {
	      return value;
	    }
	    var isArr = isArray(value);
	    if (isArr) {
	      result = initCloneArray(value);
	      if (!isDeep) {
	        return arrayCopy(value, result);
	      }
	    } else {
	      var tag = objToString.call(value),
	          isFunc = tag == funcTag;
	
	      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	        result = initCloneObject(isFunc ? {} : value);
	        if (!isDeep) {
	          return baseAssign(result, value);
	        }
	      } else {
	        return cloneableTags[tag]
	          ? initCloneByTag(value, tag, isDeep)
	          : (object ? value : {});
	      }
	    }
	    // Check for circular references and return its corresponding clone.
	    stackA || (stackA = []);
	    stackB || (stackB = []);
	
	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == value) {
	        return stackB[length];
	      }
	    }
	    // Add the source value to the stack of traversed objects and associate it with its clone.
	    stackA.push(value);
	    stackB.push(result);
	
	    // Recursively populate clone (susceptible to call stack limits).
	    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	      result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	    });
	    return result;
	  }
	
	  /**
	   * The base implementation of `_.forEach` without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array|Object|string} Returns `collection`.
	   */
	  var baseEach = createBaseEach(baseForOwn);
	
	  /**
	   * The base implementation of `_.every` without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if all elements pass the predicate check,
	   *  else `false`
	   */
	  function baseEvery(collection, predicate) {
	    var result = true;
	    baseEach(collection, function(value, index, collection) {
	      result = !!predicate(value, index, collection);
	      return result;
	    });
	    return result;
	  }
	
	  /**
	   * The base implementation of `baseForIn` and `baseForOwn` which iterates
	   * over `object` properties returned by `keysFunc` invoking `iteratee` for
	   * each property. Iteratee functions may exit iteration early by explicitly
	   * returning `false`.
	   *
	   * @private
	   * @param {Object} object The object to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @param {Function} keysFunc The function to get the keys of `object`.
	   * @returns {Object} Returns `object`.
	   */
	  var baseFor = createBaseFor();
	
	  /**
	   * The base implementation of `_.forOwn` without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Object} object The object to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Object} Returns `object`.
	   */
	  function baseForOwn(object, iteratee) {
	    return baseFor(object, iteratee, keys);
	  }
	
	  /**
	   * The base implementation of `get` without support for string paths
	   * and default values.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @param {Array} path The path of the property to get.
	   * @param {string} [pathKey] The key representation of path.
	   * @returns {*} Returns the resolved value.
	   */
	  function baseGet(object, path, pathKey) {
	    if (object == null) {
	      return;
	    }
	    if (pathKey !== undefined && pathKey in toObject(object)) {
	      path = [pathKey];
	    }
	    var index = 0,
	        length = path.length;
	
	    while (object != null && index < length) {
	      object = object[path[index++]];
	    }
	    return (index && index == length) ? object : undefined;
	  }
	
	  /**
	   * The base implementation of `_.isEqual` without support for `this` binding
	   * `customizer` functions.
	   *
	   * @private
	   * @param {*} value The value to compare.
	   * @param {*} other The other value to compare.
	   * @param {Function} [customizer] The function to customize comparing values.
	   * @param {boolean} [isLoose] Specify performing partial comparisons.
	   * @param {Array} [stackA] Tracks traversed `value` objects.
	   * @param {Array} [stackB] Tracks traversed `other` objects.
	   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	   */
	  function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
	    if (value === other) {
	      return true;
	    }
	    if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	      return value !== value && other !== other;
	    }
	    return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
	  }
	
	  /**
	   * A specialized version of `baseIsEqual` for arrays and objects which performs
	   * deep comparisons and tracks traversed objects enabling objects with circular
	   * references to be compared.
	   *
	   * @private
	   * @param {Object} object The object to compare.
	   * @param {Object} other The other object to compare.
	   * @param {Function} equalFunc The function to determine equivalents of values.
	   * @param {Function} [customizer] The function to customize comparing objects.
	   * @param {boolean} [isLoose] Specify performing partial comparisons.
	   * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	   * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	   */
	  function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	    var objIsArr = isArray(object),
	        othIsArr = isArray(other),
	        objTag = arrayTag,
	        othTag = arrayTag;
	
	    if (!objIsArr) {
	      objTag = objToString.call(object);
	      if (objTag == argsTag) {
	        objTag = objectTag;
	      } else if (objTag != objectTag) {
	        objIsArr = isTypedArray(object);
	      }
	    }
	    if (!othIsArr) {
	      othTag = objToString.call(other);
	      if (othTag == argsTag) {
	        othTag = objectTag;
	      } else if (othTag != objectTag) {
	        othIsArr = isTypedArray(other);
	      }
	    }
	    var objIsObj = objTag == objectTag,
	        othIsObj = othTag == objectTag,
	        isSameTag = objTag == othTag;
	
	    if (isSameTag && !(objIsArr || objIsObj)) {
	      return equalByTag(object, other, objTag);
	    }
	    if (!isLoose) {
	      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	      if (objIsWrapped || othIsWrapped) {
	        return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
	      }
	    }
	    if (!isSameTag) {
	      return false;
	    }
	    // Assume cyclic values are equal.
	    // For more information on detecting circular references see https://es5.github.io/#JO.
	    stackA || (stackA = []);
	    stackB || (stackB = []);
	
	    var length = stackA.length;
	    while (length--) {
	      if (stackA[length] == object) {
	        return stackB[length] == other;
	      }
	    }
	    // Add `object` and `other` to the stack of traversed objects.
	    stackA.push(object);
	    stackB.push(other);
	
	    var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
	
	    stackA.pop();
	    stackB.pop();
	
	    return result;
	  }
	
	  /**
	   * The base implementation of `_.isMatch` without support for callback
	   * shorthands and `this` binding.
	   *
	   * @private
	   * @param {Object} object The object to inspect.
	   * @param {Array} matchData The propery names, values, and compare flags to match.
	   * @param {Function} [customizer] The function to customize comparing objects.
	   * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	   */
	  function baseIsMatch(object, matchData, customizer) {
	    var index = matchData.length,
	        length = index,
	        noCustomizer = !customizer;
	
	    if (object == null) {
	      return !length;
	    }
	    object = toObject(object);
	    while (index--) {
	      var data = matchData[index];
	      if ((noCustomizer && data[2])
	            ? data[1] !== object[data[0]]
	            : !(data[0] in object)
	          ) {
	        return false;
	      }
	    }
	    while (++index < length) {
	      data = matchData[index];
	      var key = data[0],
	          objValue = object[key],
	          srcValue = data[1];
	
	      if (noCustomizer && data[2]) {
	        if (objValue === undefined && !(key in object)) {
	          return false;
	        }
	      } else {
	        var result = customizer ? customizer(objValue, srcValue, key) : undefined;
	        if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
	          return false;
	        }
	      }
	    }
	    return true;
	  }
	
	  /**
	   * The base implementation of `_.map` without support for callback shorthands
	   * and `this` binding.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} iteratee The function invoked per iteration.
	   * @returns {Array} Returns the new mapped array.
	   */
	  function baseMap(collection, iteratee) {
	    var index = -1,
	        result = isArrayLike(collection) ? Array(collection.length) : [];
	
	    baseEach(collection, function(value, key, collection) {
	      result[++index] = iteratee(value, key, collection);
	    });
	    return result;
	  }
	
	  /**
	   * The base implementation of `_.matches` which does not clone `source`.
	   *
	   * @private
	   * @param {Object} source The object of property values to match.
	   * @returns {Function} Returns the new function.
	   */
	  function baseMatches(source) {
	    var matchData = getMatchData(source);
	    if (matchData.length == 1 && matchData[0][2]) {
	      var key = matchData[0][0],
	          value = matchData[0][1];
	
	      return function(object) {
	        if (object == null) {
	          return false;
	        }
	        return object[key] === value && (value !== undefined || (key in toObject(object)));
	      };
	    }
	    return function(object) {
	      return baseIsMatch(object, matchData);
	    };
	  }
	
	  /**
	   * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
	   *
	   * @private
	   * @param {string} path The path of the property to get.
	   * @param {*} srcValue The value to compare.
	   * @returns {Function} Returns the new function.
	   */
	  function baseMatchesProperty(path, srcValue) {
	    var isArr = isArray(path),
	        isCommon = isKey(path) && isStrictComparable(srcValue),
	        pathKey = (path + '');
	
	    path = toPath(path);
	    return function(object) {
	      if (object == null) {
	        return false;
	      }
	      var key = pathKey;
	      object = toObject(object);
	      if ((isArr || !isCommon) && !(key in object)) {
	        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	        if (object == null) {
	          return false;
	        }
	        key = last(path);
	        object = toObject(object);
	      }
	      return object[key] === srcValue
	        ? (srcValue !== undefined || (key in object))
	        : baseIsEqual(srcValue, object[key], undefined, true);
	    };
	  }
	
	  /**
	   * The base implementation of `_.property` without support for deep paths.
	   *
	   * @private
	   * @param {string} key The key of the property to get.
	   * @returns {Function} Returns the new function.
	   */
	  function baseProperty(key) {
	    return function(object) {
	      return object == null ? undefined : object[key];
	    };
	  }
	
	  /**
	   * A specialized version of `baseProperty` which supports deep paths.
	   *
	   * @private
	   * @param {Array|string} path The path of the property to get.
	   * @returns {Function} Returns the new function.
	   */
	  function basePropertyDeep(path) {
	    var pathKey = (path + '');
	    path = toPath(path);
	    return function(object) {
	      return baseGet(object, path, pathKey);
	    };
	  }
	
	  /**
	   * The base implementation of `_.slice` without an iteratee call guard.
	   *
	   * @private
	   * @param {Array} array The array to slice.
	   * @param {number} [start=0] The start position.
	   * @param {number} [end=array.length] The end position.
	   * @returns {Array} Returns the slice of `array`.
	   */
	  function baseSlice(array, start, end) {
	    var index = -1,
	        length = array.length;
	
	    start = start == null ? 0 : (+start || 0);
	    if (start < 0) {
	      start = -start > length ? 0 : (length + start);
	    }
	    end = (end === undefined || end > length) ? length : (+end || 0);
	    if (end < 0) {
	      end += length;
	    }
	    length = start > end ? 0 : ((end - start) >>> 0);
	    start >>>= 0;
	
	    var result = Array(length);
	    while (++index < length) {
	      result[index] = array[index + start];
	    }
	    return result;
	  }
	
	  /**
	   * The base implementation of `_.some` without support for callback shorthands
	   * and `this` binding.
	   *
	   * @private
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} predicate The function invoked per iteration.
	   * @returns {boolean} Returns `true` if any element passes the predicate check,
	   *  else `false`.
	   */
	  function baseSome(collection, predicate) {
	    var result;
	
	    baseEach(collection, function(value, index, collection) {
	      result = predicate(value, index, collection);
	      return !result;
	    });
	    return !!result;
	  }
	
	  /**
	   * A specialized version of `baseCallback` which only supports `this` binding
	   * and specifying the number of arguments to provide to `func`.
	   *
	   * @private
	   * @param {Function} func The function to bind.
	   * @param {*} thisArg The `this` binding of `func`.
	   * @param {number} [argCount] The number of arguments to provide to `func`.
	   * @returns {Function} Returns the callback.
	   */
	  function bindCallback(func, thisArg, argCount) {
	    if (typeof func != 'function') {
	      return identity;
	    }
	    if (thisArg === undefined) {
	      return func;
	    }
	    switch (argCount) {
	      case 1: return function(value) {
	        return func.call(thisArg, value);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(thisArg, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(thisArg, accumulator, value, index, collection);
	      };
	      case 5: return function(value, other, key, object, source) {
	        return func.call(thisArg, value, other, key, object, source);
	      };
	    }
	    return function() {
	      return func.apply(thisArg, arguments);
	    };
	  }
	
	  /**
	   * Creates a clone of the given array buffer.
	   *
	   * @private
	   * @param {ArrayBuffer} buffer The array buffer to clone.
	   * @returns {ArrayBuffer} Returns the cloned array buffer.
	   */
	  function bufferClone(buffer) {
	    var result = new ArrayBuffer(buffer.byteLength),
	        view = new Uint8Array(result);
	
	    view.set(new Uint8Array(buffer));
	    return result;
	  }
	
	  /**
	   * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	   *
	   * @private
	   * @param {Function} assigner The function to assign values.
	   * @returns {Function} Returns the new assigner function.
	   */
	  function createAssigner(assigner) {
	    return restParam(function(object, sources) {
	      var index = -1,
	          length = object == null ? 0 : sources.length,
	          customizer = length > 2 ? sources[length - 2] : undefined,
	          guard = length > 2 ? sources[2] : undefined,
	          thisArg = length > 1 ? sources[length - 1] : undefined;
	
	      if (typeof customizer == 'function') {
	        customizer = bindCallback(customizer, thisArg, 5);
	        length -= 2;
	      } else {
	        customizer = typeof thisArg == 'function' ? thisArg : undefined;
	        length -= (customizer ? 1 : 0);
	      }
	      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	        customizer = length < 3 ? undefined : customizer;
	        length = 1;
	      }
	      while (++index < length) {
	        var source = sources[index];
	        if (source) {
	          assigner(object, source, customizer);
	        }
	      }
	      return object;
	    });
	  }
	
	  /**
	   * Creates a `baseEach` or `baseEachRight` function.
	   *
	   * @private
	   * @param {Function} eachFunc The function to iterate over a collection.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {Function} Returns the new base function.
	   */
	  function createBaseEach(eachFunc, fromRight) {
	    return function(collection, iteratee) {
	      var length = collection ? getLength(collection) : 0;
	      if (!isLength(length)) {
	        return eachFunc(collection, iteratee);
	      }
	      var index = fromRight ? length : -1,
	          iterable = toObject(collection);
	
	      while ((fromRight ? index-- : ++index < length)) {
	        if (iteratee(iterable[index], index, iterable) === false) {
	          break;
	        }
	      }
	      return collection;
	    };
	  }
	
	  /**
	   * Creates a base function for `_.forIn` or `_.forInRight`.
	   *
	   * @private
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {Function} Returns the new base function.
	   */
	  function createBaseFor(fromRight) {
	    return function(object, iteratee, keysFunc) {
	      var iterable = toObject(object),
	          props = keysFunc(object),
	          length = props.length,
	          index = fromRight ? length : -1;
	
	      while ((fromRight ? index-- : ++index < length)) {
	        var key = props[index];
	        if (iteratee(iterable[key], key, iterable) === false) {
	          break;
	        }
	      }
	      return object;
	    };
	  }
	
	  /**
	   * Creates a function for `_.forEach` or `_.forEachRight`.
	   *
	   * @private
	   * @param {Function} arrayFunc The function to iterate over an array.
	   * @param {Function} eachFunc The function to iterate over a collection.
	   * @returns {Function} Returns the new each function.
	   */
	  function createForEach(arrayFunc, eachFunc) {
	    return function(collection, iteratee, thisArg) {
	      return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	        ? arrayFunc(collection, iteratee)
	        : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	    };
	  }
	
	  /**
	   * A specialized version of `baseIsEqualDeep` for arrays with support for
	   * partial deep comparisons.
	   *
	   * @private
	   * @param {Array} array The array to compare.
	   * @param {Array} other The other array to compare.
	   * @param {Function} equalFunc The function to determine equivalents of values.
	   * @param {Function} [customizer] The function to customize comparing arrays.
	   * @param {boolean} [isLoose] Specify performing partial comparisons.
	   * @param {Array} [stackA] Tracks traversed `value` objects.
	   * @param {Array} [stackB] Tracks traversed `other` objects.
	   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	   */
	  function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
	    var index = -1,
	        arrLength = array.length,
	        othLength = other.length;
	
	    if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
	      return false;
	    }
	    // Ignore non-index properties.
	    while (++index < arrLength) {
	      var arrValue = array[index],
	          othValue = other[index],
	          result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
	
	      if (result !== undefined) {
	        if (result) {
	          continue;
	        }
	        return false;
	      }
	      // Recursively compare arrays (susceptible to call stack limits).
	      if (isLoose) {
	        if (!arraySome(other, function(othValue) {
	              return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
	            })) {
	          return false;
	        }
	      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  /**
	   * A specialized version of `baseIsEqualDeep` for comparing objects of
	   * the same `toStringTag`.
	   *
	   * **Note:** This function only supports comparing values with tags of
	   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	   *
	   * @private
	   * @param {Object} object The object to compare.
	   * @param {Object} other The other object to compare.
	   * @param {string} tag The `toStringTag` of the objects to compare.
	   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	   */
	  function equalByTag(object, other, tag) {
	    switch (tag) {
	      case boolTag:
	      case dateTag:
	        // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	        return +object == +other;
	
	      case errorTag:
	        return object.name == other.name && object.message == other.message;
	
	      case numberTag:
	        // Treat `NaN` vs. `NaN` as equal.
	        return (object != +object)
	          ? other != +other
	          : object == +other;
	
	      case regexpTag:
	      case stringTag:
	        // Coerce regexes to strings and treat strings primitives and string
	        // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	        return object == (other + '');
	    }
	    return false;
	  }
	
	  /**
	   * A specialized version of `baseIsEqualDeep` for objects with support for
	   * partial deep comparisons.
	   *
	   * @private
	   * @param {Object} object The object to compare.
	   * @param {Object} other The other object to compare.
	   * @param {Function} equalFunc The function to determine equivalents of values.
	   * @param {Function} [customizer] The function to customize comparing values.
	   * @param {boolean} [isLoose] Specify performing partial comparisons.
	   * @param {Array} [stackA] Tracks traversed `value` objects.
	   * @param {Array} [stackB] Tracks traversed `other` objects.
	   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	   */
	  function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	    var objProps = keys(object),
	        objLength = objProps.length,
	        othProps = keys(other),
	        othLength = othProps.length;
	
	    if (objLength != othLength && !isLoose) {
	      return false;
	    }
	    var index = objLength;
	    while (index--) {
	      var key = objProps[index];
	      if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
	        return false;
	      }
	    }
	    var skipCtor = isLoose;
	    while (++index < objLength) {
	      key = objProps[index];
	      var objValue = object[key],
	          othValue = other[key],
	          result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
	
	      // Recursively compare objects (susceptible to call stack limits).
	      if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
	        return false;
	      }
	      skipCtor || (skipCtor = key == 'constructor');
	    }
	    if (!skipCtor) {
	      var objCtor = object.constructor,
	          othCtor = other.constructor;
	
	      // Non `Object` object instances with different constructors are not equal.
	      if (objCtor != othCtor &&
	          ('constructor' in object && 'constructor' in other) &&
	          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	        return false;
	      }
	    }
	    return true;
	  }
	
	  /**
	   * Gets the appropriate "callback" function. If the `_.callback` method is
	   * customized this function returns the custom method, otherwise it returns
	   * the `baseCallback` function. If arguments are provided the chosen function
	   * is invoked with them and its result is returned.
	   *
	   * @private
	   * @returns {Function} Returns the chosen function or its result.
	   */
	  function getCallback(func, thisArg, argCount) {
	    var result = lodash.callback || callback;
	    result = result === callback ? baseCallback : result;
	    return argCount ? result(func, thisArg, argCount) : result;
	  }
	
	  /**
	   * Gets the "length" property value of `object`.
	   *
	   * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	   * that affects Safari on at least iOS 8.1-8.3 ARM64.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @returns {*} Returns the "length" value.
	   */
	  var getLength = baseProperty('length');
	
	  /**
	   * Gets the propery names, values, and compare flags of `object`.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @returns {Array} Returns the match data of `object`.
	   */
	  function getMatchData(object) {
	    var result = pairs(object),
	        length = result.length;
	
	    while (length--) {
	      result[length][2] = isStrictComparable(result[length][1]);
	    }
	    return result;
	  }
	
	  /**
	   * Gets the native function at `key` of `object`.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @param {string} key The key of the method to get.
	   * @returns {*} Returns the function if it's native, else `undefined`.
	   */
	  function getNative(object, key) {
	    var value = object == null ? undefined : object[key];
	    return isNative(value) ? value : undefined;
	  }
	
	  /**
	   * Initializes an array clone.
	   *
	   * @private
	   * @param {Array} array The array to clone.
	   * @returns {Array} Returns the initialized clone.
	   */
	  function initCloneArray(array) {
	    var length = array.length,
	        result = new array.constructor(length);
	
	    // Add array properties assigned by `RegExp#exec`.
	    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	      result.index = array.index;
	      result.input = array.input;
	    }
	    return result;
	  }
	
	  /**
	   * Initializes an object clone.
	   *
	   * @private
	   * @param {Object} object The object to clone.
	   * @returns {Object} Returns the initialized clone.
	   */
	  function initCloneObject(object) {
	    var Ctor = object.constructor;
	    if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	      Ctor = Object;
	    }
	    return new Ctor;
	  }
	
	  /**
	   * Initializes an object clone based on its `toStringTag`.
	   *
	   * **Note:** This function only supports cloning values with tags of
	   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	   *
	   * @private
	   * @param {Object} object The object to clone.
	   * @param {string} tag The `toStringTag` of the object to clone.
	   * @param {boolean} [isDeep] Specify a deep clone.
	   * @returns {Object} Returns the initialized clone.
	   */
	  function initCloneByTag(object, tag, isDeep) {
	    var Ctor = object.constructor;
	    switch (tag) {
	      case arrayBufferTag:
	        return bufferClone(object);
	
	      case boolTag:
	      case dateTag:
	        return new Ctor(+object);
	
	      case float32Tag: case float64Tag:
	      case int8Tag: case int16Tag: case int32Tag:
	      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	        var buffer = object.buffer;
	        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
	
	      case numberTag:
	      case stringTag:
	        return new Ctor(object);
	
	      case regexpTag:
	        var result = new Ctor(object.source, reFlags.exec(object));
	        result.lastIndex = object.lastIndex;
	    }
	    return result;
	  }
	
	  /**
	   * Checks if `value` is array-like.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	   */
	  function isArrayLike(value) {
	    return value != null && isLength(getLength(value));
	  }
	
	  /**
	   * Checks if `value` is a valid array-like index.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	   */
	  function isIndex(value, length) {
	    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	    length = length == null ? MAX_SAFE_INTEGER : length;
	    return value > -1 && value % 1 == 0 && value < length;
	  }
	
	  /**
	   * Checks if the provided arguments are from an iteratee call.
	   *
	   * @private
	   * @param {*} value The potential iteratee value argument.
	   * @param {*} index The potential iteratee index or key argument.
	   * @param {*} object The potential iteratee object argument.
	   * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	   */
	  function isIterateeCall(value, index, object) {
	    if (!isObject(object)) {
	      return false;
	    }
	    var type = typeof index;
	    if (type == 'number'
	        ? (isArrayLike(object) && isIndex(index, object.length))
	        : (type == 'string' && index in object)) {
	      var other = object[index];
	      return value === value ? (value === other) : (other !== other);
	    }
	    return false;
	  }
	
	  /**
	   * Checks if `value` is a property name and not a property path.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @param {Object} [object] The object to query keys on.
	   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	   */
	  function isKey(value, object) {
	    var type = typeof value;
	    if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
	      return true;
	    }
	    if (isArray(value)) {
	      return false;
	    }
	    var result = !reIsDeepProp.test(value);
	    return result || (object != null && value in toObject(object));
	  }
	
	  /**
	   * Checks if `value` is a valid array-like length.
	   *
	   * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	   */
	  function isLength(value) {
	    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	  }
	
	  /**
	   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` if suitable for strict
	   *  equality comparisons, else `false`.
	   */
	  function isStrictComparable(value) {
	    return value === value && !isObject(value);
	  }
	
	  /**
	   * A fallback implementation of `Object.keys` which creates an array of the
	   * own enumerable property names of `object`.
	   *
	   * @private
	   * @param {Object} object The object to query.
	   * @returns {Array} Returns the array of property names.
	   */
	  function shimKeys(object) {
	    var props = keysIn(object),
	        propsLength = props.length,
	        length = propsLength && object.length;
	
	    var allowIndexes = !!length && isLength(length) &&
	      (isArray(object) || isArguments(object));
	
	    var index = -1,
	        result = [];
	
	    while (++index < propsLength) {
	      var key = props[index];
	      if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	        result.push(key);
	      }
	    }
	    return result;
	  }
	
	  /**
	   * Converts `value` to an object if it's not one.
	   *
	   * @private
	   * @param {*} value The value to process.
	   * @returns {Object} Returns the object.
	   */
	  function toObject(value) {
	    return isObject(value) ? value : Object(value);
	  }
	
	  /**
	   * Converts `value` to property path array if it's not one.
	   *
	   * @private
	   * @param {*} value The value to process.
	   * @returns {Array} Returns the property path array.
	   */
	  function toPath(value) {
	    if (isArray(value)) {
	      return value;
	    }
	    var result = [];
	    baseToString(value).replace(rePropName, function(match, number, quote, string) {
	      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	    });
	    return result;
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Gets the last element of `array`.
	   *
	   * @static
	   * @memberOf _
	   * @category Array
	   * @param {Array} array The array to query.
	   * @returns {*} Returns the last element of `array`.
	   * @example
	   *
	   * _.last([1, 2, 3]);
	   * // => 3
	   */
	  function last(array) {
	    var length = array ? array.length : 0;
	    return length ? array[length - 1] : undefined;
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Checks if `predicate` returns truthy for **all** elements of `collection`.
	   * The predicate is bound to `thisArg` and invoked with three arguments:
	   * (value, index|key, collection).
	   *
	   * If a property name is provided for `predicate` the created `_.property`
	   * style callback returns the property value of the given element.
	   *
	   * If a value is also provided for `thisArg` the created `_.matchesProperty`
	   * style callback returns `true` for elements that have a matching property
	   * value, else `false`.
	   *
	   * If an object is provided for `predicate` the created `_.matches` style
	   * callback returns `true` for elements that have the properties of the given
	   * object, else `false`.
	   *
	   * @static
	   * @memberOf _
	   * @alias all
	   * @category Collection
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function|Object|string} [predicate=_.identity] The function invoked
	   *  per iteration.
	   * @param {*} [thisArg] The `this` binding of `predicate`.
	   * @returns {boolean} Returns `true` if all elements pass the predicate check,
	   *  else `false`.
	   * @example
	   *
	   * _.every([true, 1, null, 'yes'], Boolean);
	   * // => false
	   *
	   * var users = [
	   *   { 'user': 'barney', 'active': false },
	   *   { 'user': 'fred',   'active': false }
	   * ];
	   *
	   * // using the `_.matches` callback shorthand
	   * _.every(users, { 'user': 'barney', 'active': false });
	   * // => false
	   *
	   * // using the `_.matchesProperty` callback shorthand
	   * _.every(users, 'active', false);
	   * // => true
	   *
	   * // using the `_.property` callback shorthand
	   * _.every(users, 'active');
	   * // => false
	   */
	  function every(collection, predicate, thisArg) {
	    var func = isArray(collection) ? arrayEvery : baseEvery;
	    if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
	      predicate = undefined;
	    }
	    if (typeof predicate != 'function' || thisArg !== undefined) {
	      predicate = getCallback(predicate, thisArg, 3);
	    }
	    return func(collection, predicate);
	  }
	
	  /**
	   * Iterates over elements of `collection` invoking `iteratee` for each element.
	   * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	   * (value, index|key, collection). Iteratee functions may exit iteration early
	   * by explicitly returning `false`.
	   *
	   * **Note:** As with other "Collections" methods, objects with a "length" property
	   * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	   * may be used for object iteration.
	   *
	   * @static
	   * @memberOf _
	   * @alias each
	   * @category Collection
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	   * @param {*} [thisArg] The `this` binding of `iteratee`.
	   * @returns {Array|Object|string} Returns `collection`.
	   * @example
	   *
	   * _([1, 2]).forEach(function(n) {
	   *   console.log(n);
	   * }).value();
	   * // => logs each value from left to right and returns the array
	   *
	   * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	   *   console.log(n, key);
	   * });
	   * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	   */
	  var forEach = createForEach(arrayEach, baseEach);
	
	  /**
	   * Creates an array of values by running each element in `collection` through
	   * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	   * arguments: (value, index|key, collection).
	   *
	   * If a property name is provided for `iteratee` the created `_.property`
	   * style callback returns the property value of the given element.
	   *
	   * If a value is also provided for `thisArg` the created `_.matchesProperty`
	   * style callback returns `true` for elements that have a matching property
	   * value, else `false`.
	   *
	   * If an object is provided for `iteratee` the created `_.matches` style
	   * callback returns `true` for elements that have the properties of the given
	   * object, else `false`.
	   *
	   * Many lodash methods are guarded to work as iteratees for methods like
	   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	   *
	   * The guarded methods are:
	   * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
	   * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
	   * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
	   * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
	   * `sum`, `uniq`, and `words`
	   *
	   * @static
	   * @memberOf _
	   * @alias collect
	   * @category Collection
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	   *  per iteration.
	   * @param {*} [thisArg] The `this` binding of `iteratee`.
	   * @returns {Array} Returns the new mapped array.
	   * @example
	   *
	   * function timesThree(n) {
	   *   return n * 3;
	   * }
	   *
	   * _.map([1, 2], timesThree);
	   * // => [3, 6]
	   *
	   * _.map({ 'a': 1, 'b': 2 }, timesThree);
	   * // => [3, 6] (iteration order is not guaranteed)
	   *
	   * var users = [
	   *   { 'user': 'barney' },
	   *   { 'user': 'fred' }
	   * ];
	   *
	   * // using the `_.property` callback shorthand
	   * _.map(users, 'user');
	   * // => ['barney', 'fred']
	   */
	  function map(collection, iteratee, thisArg) {
	    var func = isArray(collection) ? arrayMap : baseMap;
	    iteratee = getCallback(iteratee, thisArg, 3);
	    return func(collection, iteratee);
	  }
	
	  /**
	   * Gets the size of `collection` by returning its length for array-like
	   * values or the number of own enumerable properties for objects.
	   *
	   * @static
	   * @memberOf _
	   * @category Collection
	   * @param {Array|Object|string} collection The collection to inspect.
	   * @returns {number} Returns the size of `collection`.
	   * @example
	   *
	   * _.size([1, 2, 3]);
	   * // => 3
	   *
	   * _.size({ 'a': 1, 'b': 2 });
	   * // => 2
	   *
	   * _.size('pebbles');
	   * // => 7
	   */
	  function size(collection) {
	    var length = collection ? getLength(collection) : 0;
	    return isLength(length) ? length : keys(collection).length;
	  }
	
	  /**
	   * Checks if `predicate` returns truthy for **any** element of `collection`.
	   * The function returns as soon as it finds a passing value and does not iterate
	   * over the entire collection. The predicate is bound to `thisArg` and invoked
	   * with three arguments: (value, index|key, collection).
	   *
	   * If a property name is provided for `predicate` the created `_.property`
	   * style callback returns the property value of the given element.
	   *
	   * If a value is also provided for `thisArg` the created `_.matchesProperty`
	   * style callback returns `true` for elements that have a matching property
	   * value, else `false`.
	   *
	   * If an object is provided for `predicate` the created `_.matches` style
	   * callback returns `true` for elements that have the properties of the given
	   * object, else `false`.
	   *
	   * @static
	   * @memberOf _
	   * @alias any
	   * @category Collection
	   * @param {Array|Object|string} collection The collection to iterate over.
	   * @param {Function|Object|string} [predicate=_.identity] The function invoked
	   *  per iteration.
	   * @param {*} [thisArg] The `this` binding of `predicate`.
	   * @returns {boolean} Returns `true` if any element passes the predicate check,
	   *  else `false`.
	   * @example
	   *
	   * _.some([null, 0, 'yes', false], Boolean);
	   * // => true
	   *
	   * var users = [
	   *   { 'user': 'barney', 'active': true },
	   *   { 'user': 'fred',   'active': false }
	   * ];
	   *
	   * // using the `_.matches` callback shorthand
	   * _.some(users, { 'user': 'barney', 'active': false });
	   * // => false
	   *
	   * // using the `_.matchesProperty` callback shorthand
	   * _.some(users, 'active', false);
	   * // => true
	   *
	   * // using the `_.property` callback shorthand
	   * _.some(users, 'active');
	   * // => true
	   */
	  function some(collection, predicate, thisArg) {
	    var func = isArray(collection) ? arraySome : baseSome;
	    if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
	      predicate = undefined;
	    }
	    if (typeof predicate != 'function' || thisArg !== undefined) {
	      predicate = getCallback(predicate, thisArg, 3);
	    }
	    return func(collection, predicate);
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Creates a function that invokes `func` with the `this` binding of the
	   * created function and arguments from `start` and beyond provided as an array.
	   *
	   * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	   *
	   * @static
	   * @memberOf _
	   * @category Function
	   * @param {Function} func The function to apply a rest parameter to.
	   * @param {number} [start=func.length-1] The start position of the rest parameter.
	   * @returns {Function} Returns the new function.
	   * @example
	   *
	   * var say = _.restParam(function(what, names) {
	   *   return what + ' ' + _.initial(names).join(', ') +
	   *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	   * });
	   *
	   * say('hello', 'fred', 'barney', 'pebbles');
	   * // => 'hello fred, barney, & pebbles'
	   */
	  function restParam(func, start) {
	    if (typeof func != 'function') {
	      throw new TypeError(FUNC_ERROR_TEXT);
	    }
	    start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	    return function() {
	      var args = arguments,
	          index = -1,
	          length = nativeMax(args.length - start, 0),
	          rest = Array(length);
	
	      while (++index < length) {
	        rest[index] = args[start + index];
	      }
	      switch (start) {
	        case 0: return func.call(this, rest);
	        case 1: return func.call(this, args[0], rest);
	        case 2: return func.call(this, args[0], args[1], rest);
	      }
	      var otherArgs = Array(start + 1);
	      index = -1;
	      while (++index < start) {
	        otherArgs[index] = args[index];
	      }
	      otherArgs[start] = rest;
	      return func.apply(this, otherArgs);
	    };
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Checks if `value` is classified as an `arguments` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isArguments(function() { return arguments; }());
	   * // => true
	   *
	   * _.isArguments([1, 2, 3]);
	   * // => false
	   */
	  function isArguments(value) {
	    return isObjectLike(value) && isArrayLike(value) &&
	      hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	  }
	
	  /**
	   * Checks if `value` is classified as an `Array` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isArray([1, 2, 3]);
	   * // => true
	   *
	   * _.isArray(function() { return arguments; }());
	   * // => false
	   */
	  var isArray = nativeIsArray || function(value) {
	    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	  };
	
	  /**
	   * Checks if `value` is empty. A value is considered empty unless it's an
	   * `arguments` object, array, string, or jQuery-like collection with a length
	   * greater than `0` or an object with own enumerable properties.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {Array|Object|string} value The value to inspect.
	   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	   * @example
	   *
	   * _.isEmpty(null);
	   * // => true
	   *
	   * _.isEmpty(true);
	   * // => true
	   *
	   * _.isEmpty(1);
	   * // => true
	   *
	   * _.isEmpty([1, 2, 3]);
	   * // => false
	   *
	   * _.isEmpty({ 'a': 1 });
	   * // => false
	   */
	  function isEmpty(value) {
	    if (value == null) {
	      return true;
	    }
	    if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
	        (isObjectLike(value) && isFunction(value.splice)))) {
	      return !value.length;
	    }
	    return !keys(value).length;
	  }
	
	  /**
	   * Checks if `value` is classified as a `Function` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isFunction(_);
	   * // => true
	   *
	   * _.isFunction(/abc/);
	   * // => false
	   */
	  function isFunction(value) {
	    // The use of `Object#toString` avoids issues with the `typeof` operator
	    // in older versions of Chrome and Safari which return 'function' for regexes
	    // and Safari 8 which returns 'object' for typed array constructors.
	    return isObject(value) && objToString.call(value) == funcTag;
	  }
	
	  /**
	   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	   * @example
	   *
	   * _.isObject({});
	   * // => true
	   *
	   * _.isObject([1, 2, 3]);
	   * // => true
	   *
	   * _.isObject(1);
	   * // => false
	   */
	  function isObject(value) {
	    // Avoid a V8 JIT bug in Chrome 19-20.
	    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	    var type = typeof value;
	    return !!value && (type == 'object' || type == 'function');
	  }
	
	  /**
	   * Checks if `value` is `NaN`.
	   *
	   * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
	   * which returns `true` for `undefined` and other non-numeric values.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	   * @example
	   *
	   * _.isNaN(NaN);
	   * // => true
	   *
	   * _.isNaN(new Number(NaN));
	   * // => true
	   *
	   * isNaN(undefined);
	   * // => true
	   *
	   * _.isNaN(undefined);
	   * // => false
	   */
	  function isNaN(value) {
	    // An `NaN` primitive is the only value that is not equal to itself.
	    // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
	    return isNumber(value) && value != +value;
	  }
	
	  /**
	   * Checks if `value` is a native function.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	   * @example
	   *
	   * _.isNative(Array.prototype.push);
	   * // => true
	   *
	   * _.isNative(_);
	   * // => false
	   */
	  function isNative(value) {
	    if (value == null) {
	      return false;
	    }
	    if (isFunction(value)) {
	      return reIsNative.test(fnToString.call(value));
	    }
	    return isObjectLike(value) && reIsHostCtor.test(value);
	  }
	
	  /**
	   * Checks if `value` is classified as a `Number` primitive or object.
	   *
	   * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	   * as numbers, use the `_.isFinite` method.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isNumber(8.4);
	   * // => true
	   *
	   * _.isNumber(NaN);
	   * // => true
	   *
	   * _.isNumber('8.4');
	   * // => false
	   */
	  function isNumber(value) {
	    return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
	  }
	
	  /**
	   * Checks if `value` is classified as a `String` primitive or object.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isString('abc');
	   * // => true
	   *
	   * _.isString(1);
	   * // => false
	   */
	  function isString(value) {
	    return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
	  }
	
	  /**
	   * Checks if `value` is classified as a typed array.
	   *
	   * @static
	   * @memberOf _
	   * @category Lang
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   * @example
	   *
	   * _.isTypedArray(new Uint8Array);
	   * // => true
	   *
	   * _.isTypedArray([]);
	   * // => false
	   */
	  function isTypedArray(value) {
	    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Assigns own enumerable properties of source object(s) to the destination
	   * object. Subsequent sources overwrite property assignments of previous sources.
	   * If `customizer` is provided it's invoked to produce the assigned values.
	   * The `customizer` is bound to `thisArg` and invoked with five arguments:
	   * (objectValue, sourceValue, key, object, source).
	   *
	   * **Note:** This method mutates `object` and is based on
	   * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
	   *
	   * @static
	   * @memberOf _
	   * @alias extend
	   * @category Object
	   * @param {Object} object The destination object.
	   * @param {...Object} [sources] The source objects.
	   * @param {Function} [customizer] The function to customize assigned values.
	   * @param {*} [thisArg] The `this` binding of `customizer`.
	   * @returns {Object} Returns `object`.
	   * @example
	   *
	   * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	   * // => { 'user': 'fred', 'age': 40 }
	   *
	   * // using a customizer callback
	   * var defaults = _.partialRight(_.assign, function(value, other) {
	   *   return _.isUndefined(value) ? other : value;
	   * });
	   *
	   * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	   * // => { 'user': 'barney', 'age': 36 }
	   */
	  var assign = createAssigner(function(object, source, customizer) {
	    return customizer
	      ? assignWith(object, source, customizer)
	      : baseAssign(object, source);
	  });
	
	  /**
	   * Checks if `path` is a direct property.
	   *
	   * @static
	   * @memberOf _
	   * @category Object
	   * @param {Object} object The object to query.
	   * @param {Array|string} path The path to check.
	   * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
	   * @example
	   *
	   * var object = { 'a': { 'b': { 'c': 3 } } };
	   *
	   * _.has(object, 'a');
	   * // => true
	   *
	   * _.has(object, 'a.b.c');
	   * // => true
	   *
	   * _.has(object, ['a', 'b', 'c']);
	   * // => true
	   */
	  function has(object, path) {
	    if (object == null) {
	      return false;
	    }
	    var result = hasOwnProperty.call(object, path);
	    if (!result && !isKey(path)) {
	      path = toPath(path);
	      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	      if (object == null) {
	        return false;
	      }
	      path = last(path);
	      result = hasOwnProperty.call(object, path);
	    }
	    return result || (isLength(object.length) && isIndex(path, object.length) &&
	      (isArray(object) || isArguments(object)));
	  }
	
	  /**
	   * Creates an array of the own enumerable property names of `object`.
	   *
	   * **Note:** Non-object values are coerced to objects. See the
	   * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	   * for more details.
	   *
	   * @static
	   * @memberOf _
	   * @category Object
	   * @param {Object} object The object to query.
	   * @returns {Array} Returns the array of property names.
	   * @example
	   *
	   * function Foo() {
	   *   this.a = 1;
	   *   this.b = 2;
	   * }
	   *
	   * Foo.prototype.c = 3;
	   *
	   * _.keys(new Foo);
	   * // => ['a', 'b'] (iteration order is not guaranteed)
	   *
	   * _.keys('hi');
	   * // => ['0', '1']
	   */
	  var keys = !nativeKeys ? shimKeys : function(object) {
	    var Ctor = object == null ? undefined : object.constructor;
	    if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	        (typeof object != 'function' && isArrayLike(object))) {
	      return shimKeys(object);
	    }
	    return isObject(object) ? nativeKeys(object) : [];
	  };
	
	  /**
	   * Creates an array of the own and inherited enumerable property names of `object`.
	   *
	   * **Note:** Non-object values are coerced to objects.
	   *
	   * @static
	   * @memberOf _
	   * @category Object
	   * @param {Object} object The object to query.
	   * @returns {Array} Returns the array of property names.
	   * @example
	   *
	   * function Foo() {
	   *   this.a = 1;
	   *   this.b = 2;
	   * }
	   *
	   * Foo.prototype.c = 3;
	   *
	   * _.keysIn(new Foo);
	   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	   */
	  function keysIn(object) {
	    if (object == null) {
	      return [];
	    }
	    if (!isObject(object)) {
	      object = Object(object);
	    }
	    var length = object.length;
	    length = (length && isLength(length) &&
	      (isArray(object) || isArguments(object)) && length) || 0;
	
	    var Ctor = object.constructor,
	        index = -1,
	        isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	        result = Array(length),
	        skipIndexes = length > 0;
	
	    while (++index < length) {
	      result[index] = (index + '');
	    }
	    for (var key in object) {
	      if (!(skipIndexes && isIndex(key, length)) &&
	          !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	        result.push(key);
	      }
	    }
	    return result;
	  }
	
	  /**
	   * Creates a two dimensional array of the key-value pairs for `object`,
	   * e.g. `[[key1, value1], [key2, value2]]`.
	   *
	   * @static
	   * @memberOf _
	   * @category Object
	   * @param {Object} object The object to query.
	   * @returns {Array} Returns the new array of key-value pairs.
	   * @example
	   *
	   * _.pairs({ 'barney': 36, 'fred': 40 });
	   * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	   */
	  function pairs(object) {
	    object = toObject(object);
	
	    var index = -1,
	        props = keys(object),
	        length = props.length,
	        result = Array(length);
	
	    while (++index < length) {
	      var key = props[index];
	      result[index] = [key, object[key]];
	    }
	    return result;
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * Creates a function that invokes `func` with the `this` binding of `thisArg`
	   * and arguments of the created function. If `func` is a property name the
	   * created callback returns the property value for a given element. If `func`
	   * is an object the created callback returns `true` for elements that contain
	   * the equivalent object properties, otherwise it returns `false`.
	   *
	   * @static
	   * @memberOf _
	   * @alias iteratee
	   * @category Utility
	   * @param {*} [func=_.identity] The value to convert to a callback.
	   * @param {*} [thisArg] The `this` binding of `func`.
	   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	   * @returns {Function} Returns the callback.
	   * @example
	   *
	   * var users = [
	   *   { 'user': 'barney', 'age': 36 },
	   *   { 'user': 'fred',   'age': 40 }
	   * ];
	   *
	   * // wrap to create custom callback shorthands
	   * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
	   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
	   *   if (!match) {
	   *     return callback(func, thisArg);
	   *   }
	   *   return function(object) {
	   *     return match[2] == 'gt'
	   *       ? object[match[1]] > match[3]
	   *       : object[match[1]] < match[3];
	   *   };
	   * });
	   *
	   * _.filter(users, 'age__gt36');
	   * // => [{ 'user': 'fred', 'age': 40 }]
	   */
	  function callback(func, thisArg, guard) {
	    if (guard && isIterateeCall(func, thisArg, guard)) {
	      thisArg = undefined;
	    }
	    return isObjectLike(func)
	      ? matches(func)
	      : baseCallback(func, thisArg);
	  }
	
	  /**
	   * This method returns the first argument provided to it.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @param {*} value Any value.
	   * @returns {*} Returns `value`.
	   * @example
	   *
	   * var object = { 'user': 'fred' };
	   *
	   * _.identity(object) === object;
	   * // => true
	   */
	  function identity(value) {
	    return value;
	  }
	
	  /**
	   * Creates a function that performs a deep comparison between a given object
	   * and `source`, returning `true` if the given object has equivalent property
	   * values, else `false`.
	   *
	   * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	   * numbers, `Object` objects, regexes, and strings. Objects are compared by
	   * their own, not inherited, enumerable properties. For comparing a single
	   * own or inherited property value see `_.matchesProperty`.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @param {Object} source The object of property values to match.
	   * @returns {Function} Returns the new function.
	   * @example
	   *
	   * var users = [
	   *   { 'user': 'barney', 'age': 36, 'active': true },
	   *   { 'user': 'fred',   'age': 40, 'active': false }
	   * ];
	   *
	   * _.filter(users, _.matches({ 'age': 40, 'active': false }));
	   * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
	   */
	  function matches(source) {
	    return baseMatches(baseClone(source, true));
	  }
	
	  /**
	   * Reverts the `_` variable to its previous value and returns a reference to
	   * the `lodash` function.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @returns {Function} Returns the `lodash` function.
	   * @example
	   *
	   * var lodash = _.noConflict();
	   */
	  function noConflict() {
	    root._ = oldDash;
	    return this;
	  }
	
	  /**
	   * Creates a function that returns the property value at `path` on a
	   * given object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @param {Array|string} path The path of the property to get.
	   * @returns {Function} Returns the new function.
	   * @example
	   *
	   * var objects = [
	   *   { 'a': { 'b': { 'c': 2 } } },
	   *   { 'a': { 'b': { 'c': 1 } } }
	   * ];
	   *
	   * _.map(objects, _.property('a.b.c'));
	   * // => [2, 1]
	   *
	   * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	   * // => [1, 2]
	   */
	  function property(path) {
	    return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	  }
	
	  /*------------------------------------------------------------------------*/
	
	  // Add functions that return wrapped values when chaining.
	  lodash.assign = assign;
	  lodash.callback = callback;
	  lodash.forEach = forEach;
	  lodash.keys = keys;
	  lodash.keysIn = keysIn;
	  lodash.map = map;
	  lodash.matches = matches;
	  lodash.pairs = pairs;
	  lodash.property = property;
	  lodash.restParam = restParam;
	
	  // Add aliases.
	  lodash.collect = map;
	  lodash.each = forEach;
	  lodash.extend = assign;
	  lodash.iteratee = callback;
	
	  /*------------------------------------------------------------------------*/
	
	  // Add functions that return unwrapped values when chaining.
	  lodash.every = every;
	  lodash.has = has;
	  lodash.identity = identity;
	  lodash.isArguments = isArguments;
	  lodash.isArray = isArray;
	  lodash.isEmpty = isEmpty;
	  lodash.isFunction = isFunction;
	  lodash.isNaN = isNaN;
	  lodash.isNative = isNative;
	  lodash.isNumber = isNumber;
	  lodash.isObject = isObject;
	  lodash.isString = isString;
	  lodash.isTypedArray = isTypedArray;
	  lodash.last = last;
	  lodash.noConflict = noConflict;
	  lodash.size = size;
	  lodash.some = some;
	
	  // Add aliases.
	  lodash.all = every;
	  lodash.any = some;
	
	  /*------------------------------------------------------------------------*/
	
	  /**
	   * The semantic version number.
	   *
	   * @static
	   * @memberOf _
	   * @type string
	   */
	  lodash.VERSION = VERSION;
	
	  /*--------------------------------------------------------------------------*/
	
	  // Some AMD build optimizers like r.js check for condition patterns like the following:
	  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
	    // Expose lodash to the global object when an AMD loader is present to avoid
	    // errors in cases where lodash is loaded by a script tag and not intended
	    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
	    // more details.
	    root._ = lodash;
	
	    // Define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module.
	    define(function() {
	      return lodash;
	    });
	  }
	  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
	  else if (freeExports && freeModule) {
	    // Export for Node.js or RingoJS.
	    if (moduleExports) {
	      (freeModule.exports = lodash)._ = lodash;
	    }
	    // Export for Rhino with CommonJS support.
	    else {
	      freeExports._ = lodash;
	    }
	  }
	  else {
	    // Export for a browser or Rhino.
	    root._ = lodash;
	  }
	}).call(this);_=this._.noConflict();
	Meteor = {isClient: true, _noYieldsAllowed: function(f) {return f();}};
	Package = {};
	/** start of build/meteor/packages/meteor/debug.js **/
	(function() {
	var suppress = 0;
	
	// replacement for console.log. This is a temporary API. We should
	// provide a real logging API soon (possibly just a polyfill for
	// console?)
	//
	// NOTE: this is used on the server to print the warning about
	// having autopublish enabled when you probably meant to turn it
	// off. it's not really the proper use of something called
	// _debug. the intent is for this message to go to the terminal and
	// be very visible. if you change _debug to go someplace else, etc,
	// please fix the autopublish code to do something reasonable.
	//
	Meteor._debug = function (/* arguments */) {
	  if (suppress) {
	    suppress--;
	    return;
	  }
	  if (typeof console !== 'undefined' &&
	      typeof console.log !== 'undefined') {
	    if (arguments.length == 0) { // IE Companion breaks otherwise
	      // IE10 PP4 requires at least one argument
	      console.log('');
	    } else {
	      // IE doesn't have console.log.apply, it's not a real Object.
	      // http://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
	      // http://patik.com/blog/complete-cross-browser-console-log/
	      if (typeof console.log.apply === "function") {
	        // Most browsers
	
	        // Chrome and Safari only hyperlink URLs to source files in first argument of
	        // console.log, so try to call it with one argument if possible.
	        // Approach taken here: If all arguments are strings, join them on space.
	        // See https://github.com/meteor/meteor/pull/732#issuecomment-13975991
	        var allArgumentsOfTypeString = true;
	        for (var i = 0; i < arguments.length; i++)
	          if (typeof arguments[i] !== "string")
	            allArgumentsOfTypeString = false;
	
	        if (allArgumentsOfTypeString)
	          console.log.apply(console, [Array.prototype.join.call(arguments, " ")]);
	        else
	          console.log.apply(console, arguments);
	
	      } else if (typeof Function.prototype.bind === "function") {
	        // IE9
	        var log = Function.prototype.bind.call(console.log, console);
	        log.apply(console, arguments);
	      } else {
	        // IE8
	        Function.prototype.call.call(console.log, console, Array.prototype.slice.call(arguments));
	      }
	    }
	  }
	};
	
	// Suppress the next 'count' Meteor._debug messsages. Use this to
	// stop tests from spamming the console.
	//
	Meteor._suppress_log = function (count) {
	  suppress += count;
	};
	
	Meteor._suppressed_log_expected = function () {
	  return suppress !== 0;
	};
	
	}).call(this);
	/** end of build/meteor/packages/meteor/debug.js **/
	/** start of build/meteor/packages/meteor/setimmediate.js **/
	(function() {
	// Chooses one of three setImmediate implementations:
	//
	// * Native setImmediate (IE 10, Node 0.9+)
	//
	// * postMessage (many browsers)
	//
	// * setTimeout  (fallback)
	//
	// The postMessage implementation is based on
	// https://github.com/NobleJS/setImmediate/tree/1.0.1
	//
	// Don't use `nextTick` for Node since it runs its callbacks before
	// I/O, which is stricter than we're looking for.
	//
	// Not installed as a polyfill, as our public API is `Meteor.defer`.
	// Since we're not trying to be a polyfill, we have some
	// simplifications:
	//
	// If one invocation of a setImmediate callback pauses itself by a
	// call to alert/prompt/showModelDialog, the NobleJS polyfill
	// implementation ensured that no setImmedate callback would run until
	// the first invocation completed.  While correct per the spec, what it
	// would mean for us in practice is that any reactive updates relying
	// on Meteor.defer would be hung in the main window until the modal
	// dialog was dismissed.  Thus we only ensure that a setImmediate
	// function is called in a later event loop.
	//
	// We don't need to support using a string to be eval'ed for the
	// callback, arguments to the function, or clearImmediate.
	
	"use strict";
	
	var global = this;
	
	
	// IE 10, Node >= 9.1
	
	function useSetImmediate() {
	  if (! global.setImmediate)
	    return null;
	  else {
	    var setImmediate = function (fn) {
	      global.setImmediate(fn);
	    };
	    setImmediate.implementation = 'setImmediate';
	    return setImmediate;
	  }
	}
	
	
	// Android 2.3.6, Chrome 26, Firefox 20, IE 8-9, iOS 5.1.1 Safari
	
	function usePostMessage() {
	  // The test against `importScripts` prevents this implementation
	  // from being installed inside a web worker, where
	  // `global.postMessage` means something completely different and
	  // can't be used for this purpose.
	
	  if (!global.postMessage || global.importScripts) {
	    return null;
	  }
	
	  // Avoid synchronous post message implementations.
	
	  var postMessageIsAsynchronous = true;
	  var oldOnMessage = global.onmessage;
	  global.onmessage = function () {
	      postMessageIsAsynchronous = false;
	  };
	  global.postMessage("", "*");
	  global.onmessage = oldOnMessage;
	
	  if (! postMessageIsAsynchronous)
	    return null;
	
	  var funcIndex = 0;
	  var funcs = {};
	
	  // Installs an event handler on `global` for the `message` event: see
	  // * https://developer.mozilla.org/en/DOM/window.postMessage
	  // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	  // XXX use Random.id() here?
	  var MESSAGE_PREFIX = "Meteor._setImmediate." + Math.random() + '.';
	
	  function isStringAndStartsWith(string, putativeStart) {
	    return (typeof string === "string" &&
	            string.substring(0, putativeStart.length) === putativeStart);
	  }
	
	  function onGlobalMessage(event) {
	    // This will catch all incoming messages (even from other
	    // windows!), so we need to try reasonably hard to avoid letting
	    // anyone else trick us into firing off. We test the origin is
	    // still this window, and that a (randomly generated)
	    // unpredictable identifying prefix is present.
	    if (event.source === global &&
	        isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
	      var index = event.data.substring(MESSAGE_PREFIX.length);
	      try {
	        if (funcs[index])
	          funcs[index]();
	      }
	      finally {
	        delete funcs[index];
	      }
	    }
	  }
	
	  if (global.addEventListener) {
	    global.addEventListener("message", onGlobalMessage, false);
	  } else {
	    global.attachEvent("onmessage", onGlobalMessage);
	  }
	
	  var setImmediate = function (fn) {
	    // Make `global` post a message to itself with the handle and
	    // identifying prefix, thus asynchronously invoking our
	    // onGlobalMessage listener above.
	    ++funcIndex;
	    funcs[funcIndex] = fn;
	    global.postMessage(MESSAGE_PREFIX + funcIndex, "*");
	  };
	  setImmediate.implementation = 'postMessage';
	  return setImmediate;
	}
	
	
	function useTimeout() {
	  var setImmediate = function (fn) {
	    global.setTimeout(fn, 0);
	  };
	  setImmediate.implementation = 'setTimeout';
	  return setImmediate;
	}
	
	
	Meteor._setImmediate =
	  useSetImmediate() ||
	  usePostMessage() ||
	  useTimeout();
	}).call(this);
	/** end of build/meteor/packages/meteor/setimmediate.js **/
	/** start of build/meteor/packages/base64/base64.js **/
	(function() {
	// Base 64 encoding
	
	var BASE_64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	
	var BASE_64_VALS = {};
	
	for (var i = 0; i < BASE_64_CHARS.length; i++) {
	  BASE_64_VALS[BASE_64_CHARS.charAt(i)] = i;
	};
	
	Base64 = {};
	
	Base64.encode = function (array) {
	
	  if (typeof array === "string") {
	    var str = array;
	    array = Base64.newBinary(str.length);
	    for (var i = 0; i < str.length; i++) {
	      var ch = str.charCodeAt(i);
	      if (ch > 0xFF) {
	        throw new Error(
	          "Not ascii. Base64.encode can only take ascii strings.");
	      }
	      array[i] = ch;
	    }
	  }
	
	  var answer = [];
	  var a = null;
	  var b = null;
	  var c = null;
	  var d = null;
	  for (var i = 0; i < array.length; i++) {
	    switch (i % 3) {
	    case 0:
	      a = (array[i] >> 2) & 0x3F;
	      b = (array[i] & 0x03) << 4;
	      break;
	    case 1:
	      b = b | (array[i] >> 4) & 0xF;
	      c = (array[i] & 0xF) << 2;
	      break;
	    case 2:
	      c = c | (array[i] >> 6) & 0x03;
	      d = array[i] & 0x3F;
	      answer.push(getChar(a));
	      answer.push(getChar(b));
	      answer.push(getChar(c));
	      answer.push(getChar(d));
	      a = null;
	      b = null;
	      c = null;
	      d = null;
	      break;
	    }
	  }
	  if (a != null) {
	    answer.push(getChar(a));
	    answer.push(getChar(b));
	    if (c == null)
	      answer.push('=');
	    else
	      answer.push(getChar(c));
	    if (d == null)
	      answer.push('=');
	  }
	  return answer.join("");
	};
	
	var getChar = function (val) {
	  return BASE_64_CHARS.charAt(val);
	};
	
	var getVal = function (ch) {
	  if (ch === '=') {
	    return -1;
	  }
	  return BASE_64_VALS[ch];
	};
	
	// XXX This is a weird place for this to live, but it's used both by
	// this package and 'ejson', and we can't put it in 'ejson' without
	// introducing a circular dependency. It should probably be in its own
	// package or as a helper in a package that both 'base64' and 'ejson'
	// use.
	Base64.newBinary = function (len) {
	  if (typeof Uint8Array === 'undefined' || typeof ArrayBuffer === 'undefined') {
	    var ret = [];
	    for (var i = 0; i < len; i++) {
	      ret.push(0);
	    }
	    ret.$Uint8ArrayPolyfill = true;
	    return ret;
	  }
	  return new Uint8Array(new ArrayBuffer(len));
	};
	
	Base64.decode = function (str) {
	  var len = Math.floor((str.length*3)/4);
	  if (str.charAt(str.length - 1) == '=') {
	    len--;
	    if (str.charAt(str.length - 2) == '=')
	      len--;
	  }
	  var arr = Base64.newBinary(len);
	
	  var one = null;
	  var two = null;
	  var three = null;
	
	  var j = 0;
	
	  for (var i = 0; i < str.length; i++) {
	    var c = str.charAt(i);
	    var v = getVal(c);
	    switch (i % 4) {
	    case 0:
	      if (v < 0)
	        throw new Error('invalid base64 string');
	      one = v << 2;
	      break;
	    case 1:
	      if (v < 0)
	        throw new Error('invalid base64 string');
	      one = one | (v >> 4);
	      arr[j++] = one;
	      two = (v & 0x0F) << 4;
	      break;
	    case 2:
	      if (v >= 0) {
	        two = two | (v >> 2);
	        arr[j++] = two;
	        three = (v & 0x03) << 6;
	      }
	      break;
	    case 3:
	      if (v >= 0) {
	        arr[j++] = three | v;
	      }
	      break;
	    }
	  }
	  return arr;
	};
	}).call(this);
	/** end of build/meteor/packages/base64/base64.js **/
	/** start of build/meteor/packages/ejson/ejson.js **/
	(function() {
	/**
	 * @namespace
	 * @summary Namespace for EJSON functions
	 */
	EJSON = {};
	EJSONTest = {};
	
	
	
	// Custom type interface definition
	/**
	 * @class CustomType
	 * @instanceName customType
	 * @memberOf EJSON
	 * @summary The interface that a class must satisfy to be able to become an
	 * EJSON custom type via EJSON.addType.
	 */
	
	/**
	 * @function typeName
	 * @memberOf EJSON.CustomType
	 * @summary Return the tag used to identify this type.  This must match the tag used to register this type with [`EJSON.addType`](#ejson_add_type).
	 * @locus Anywhere
	 * @instance
	 */
	
	/**
	 * @function toJSONValue
	 * @memberOf EJSON.CustomType
	 * @summary Serialize this instance into a JSON-compatible value.
	 * @locus Anywhere
	 * @instance
	 */
	
	/**
	 * @function clone
	 * @memberOf EJSON.CustomType
	 * @summary Return a value `r` such that `this.equals(r)` is true, and modifications to `r` do not affect `this` and vice versa.
	 * @locus Anywhere
	 * @instance
	 */
	
	/**
	 * @function equals
	 * @memberOf EJSON.CustomType
	 * @summary Return `true` if `other` has a value equal to `this`; `false` otherwise.
	 * @locus Anywhere
	 * @param {Object} other Another object to compare this to.
	 * @instance
	 */
	
	
	var customTypes = {};
	// Add a custom type, using a method of your choice to get to and
	// from a basic JSON-able representation.  The factory argument
	// is a function of JSON-able --> your object
	// The type you add must have:
	// - A toJSONValue() method, so that Meteor can serialize it
	// - a typeName() method, to show how to look it up in our type table.
	// It is okay if these methods are monkey-patched on.
	// EJSON.clone will use toJSONValue and the given factory to produce
	// a clone, but you may specify a method clone() that will be
	// used instead.
	// Similarly, EJSON.equals will use toJSONValue to make comparisons,
	// but you may provide a method equals() instead.
	/**
	 * @summary Add a custom datatype to EJSON.
	 * @locus Anywhere
	 * @param {String} name A tag for your custom type; must be unique among custom data types defined in your project, and must match the result of your type's `typeName` method.
	 * @param {Function} factory A function that deserializes a JSON-compatible value into an instance of your type.  This should match the serialization performed by your type's `toJSONValue` method.
	 */
	EJSON.addType = function (name, factory) {
	  if (_.has(customTypes, name))
	    throw new Error("Type " + name + " already present");
	  customTypes[name] = factory;
	};
	
	var isInfOrNan = function (obj) {
	  return _.isNaN(obj) || obj === Infinity || obj === -Infinity;
	};
	
	var builtinConverters = [
	  { // Date
	    matchJSONValue: function (obj) {
	      return _.has(obj, '$date') && _.size(obj) === 1;
	    },
	    matchObject: function (obj) {
	      return obj instanceof Date;
	    },
	    toJSONValue: function (obj) {
	      return {$date: obj.getTime()};
	    },
	    fromJSONValue: function (obj) {
	      return new Date(obj.$date);
	    }
	  },
	  { // NaN, Inf, -Inf. (These are the only objects with typeof !== 'object'
	    // which we match.)
	    matchJSONValue: function (obj) {
	      return _.has(obj, '$InfNaN') && _.size(obj) === 1;
	    },
	    matchObject: isInfOrNan,
	    toJSONValue: function (obj) {
	      var sign;
	      if (_.isNaN(obj))
	        sign = 0;
	      else if (obj === Infinity)
	        sign = 1;
	      else
	        sign = -1;
	      return {$InfNaN: sign};
	    },
	    fromJSONValue: function (obj) {
	      return obj.$InfNaN/0;
	    }
	  },
	  { // Binary
	    matchJSONValue: function (obj) {
	      return _.has(obj, '$binary') && _.size(obj) === 1;
	    },
	    matchObject: function (obj) {
	      return typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array
	        || (obj && _.has(obj, '$Uint8ArrayPolyfill'));
	    },
	    toJSONValue: function (obj) {
	      return {$binary: Base64.encode(obj)};
	    },
	    fromJSONValue: function (obj) {
	      return Base64.decode(obj.$binary);
	    }
	  },
	  { // Escaping one level
	    matchJSONValue: function (obj) {
	      return _.has(obj, '$escape') && _.size(obj) === 1;
	    },
	    matchObject: function (obj) {
	      if (_.isEmpty(obj) || _.size(obj) > 2) {
	        return false;
	      }
	      return _.any(builtinConverters, function (converter) {
	        return converter.matchJSONValue(obj);
	      });
	    },
	    toJSONValue: function (obj) {
	      var newObj = {};
	      _.each(obj, function (value, key) {
	        newObj[key] = EJSON.toJSONValue(value);
	      });
	      return {$escape: newObj};
	    },
	    fromJSONValue: function (obj) {
	      var newObj = {};
	      _.each(obj.$escape, function (value, key) {
	        newObj[key] = EJSON.fromJSONValue(value);
	      });
	      return newObj;
	    }
	  },
	  { // Custom
	    matchJSONValue: function (obj) {
	      return _.has(obj, '$type') && _.has(obj, '$value') && _.size(obj) === 2;
	    },
	    matchObject: function (obj) {
	      return EJSON._isCustomType(obj);
	    },
	    toJSONValue: function (obj) {
	      var jsonValue = Meteor._noYieldsAllowed(function () {
	        return obj.toJSONValue();
	      });
	      return {$type: obj.typeName(), $value: jsonValue};
	    },
	    fromJSONValue: function (obj) {
	      var typeName = obj.$type;
	      if (!_.has(customTypes, typeName))
	        throw new Error("Custom EJSON type " + typeName + " is not defined");
	      var converter = customTypes[typeName];
	      return Meteor._noYieldsAllowed(function () {
	        return converter(obj.$value);
	      });
	    }
	  }
	];
	
	EJSON._isCustomType = function (obj) {
	  return obj &&
	    typeof obj.toJSONValue === 'function' &&
	    typeof obj.typeName === 'function' &&
	    _.has(customTypes, obj.typeName());
	};
	
	EJSON._getTypes = function () {
	  return customTypes;
	};
	
	EJSON._getConverters = function () {
	  return builtinConverters;
	};
	
	// for both arrays and objects, in-place modification.
	var adjustTypesToJSONValue =
	EJSON._adjustTypesToJSONValue = function (obj) {
	  // Is it an atom that we need to adjust?
	  if (obj === null)
	    return null;
	  var maybeChanged = toJSONValueHelper(obj);
	  if (maybeChanged !== undefined)
	    return maybeChanged;
	
	  // Other atoms are unchanged.
	  if (typeof obj !== 'object')
	    return obj;
	
	  // Iterate over array or object structure.
	  _.each(obj, function (value, key) {
	    if (typeof value !== 'object' && value !== undefined &&
	        !isInfOrNan(value))
	      return; // continue
	
	    var changed = toJSONValueHelper(value);
	    if (changed) {
	      obj[key] = changed;
	      return; // on to the next key
	    }
	    // if we get here, value is an object but not adjustable
	    // at this level.  recurse.
	    adjustTypesToJSONValue(value);
	  });
	  return obj;
	};
	
	// Either return the JSON-compatible version of the argument, or undefined (if
	// the item isn't itself replaceable, but maybe some fields in it are)
	var toJSONValueHelper = function (item) {
	  for (var i = 0; i < builtinConverters.length; i++) {
	    var converter = builtinConverters[i];
	    if (converter.matchObject(item)) {
	      return converter.toJSONValue(item);
	    }
	  }
	  return undefined;
	};
	
	/**
	 * @summary Serialize an EJSON-compatible value into its plain JSON representation.
	 * @locus Anywhere
	 * @param {EJSON} val A value to serialize to plain JSON.
	 */
	EJSON.toJSONValue = function (item) {
	  var changed = toJSONValueHelper(item);
	  if (changed !== undefined)
	    return changed;
	  if (typeof item === 'object') {
	    item = EJSON.clone(item);
	    adjustTypesToJSONValue(item);
	  }
	  return item;
	};
	
	// for both arrays and objects. Tries its best to just
	// use the object you hand it, but may return something
	// different if the object you hand it itself needs changing.
	//
	var adjustTypesFromJSONValue =
	EJSON._adjustTypesFromJSONValue = function (obj) {
	  if (obj === null)
	    return null;
	  var maybeChanged = fromJSONValueHelper(obj);
	  if (maybeChanged !== obj)
	    return maybeChanged;
	
	  // Other atoms are unchanged.
	  if (typeof obj !== 'object')
	    return obj;
	
	  _.each(obj, function (value, key) {
	    if (typeof value === 'object') {
	      var changed = fromJSONValueHelper(value);
	      if (value !== changed) {
	        obj[key] = changed;
	        return;
	      }
	      // if we get here, value is an object but not adjustable
	      // at this level.  recurse.
	      adjustTypesFromJSONValue(value);
	    }
	  });
	  return obj;
	};
	
	// Either return the argument changed to have the non-json
	// rep of itself (the Object version) or the argument itself.
	
	// DOES NOT RECURSE.  For actually getting the fully-changed value, use
	// EJSON.fromJSONValue
	var fromJSONValueHelper = function (value) {
	  if (typeof value === 'object' && value !== null) {
	    if (_.size(value) <= 2
	        && _.all(value, function (v, k) {
	          return typeof k === 'string' && k.substr(0, 1) === '$';
	        })) {
	      for (var i = 0; i < builtinConverters.length; i++) {
	        var converter = builtinConverters[i];
	        if (converter.matchJSONValue(value)) {
	          return converter.fromJSONValue(value);
	        }
	      }
	    }
	  }
	  return value;
	};
	
	/**
	 * @summary Deserialize an EJSON value from its plain JSON representation.
	 * @locus Anywhere
	 * @param {JSONCompatible} val A value to deserialize into EJSON.
	 */
	EJSON.fromJSONValue = function (item) {
	  var changed = fromJSONValueHelper(item);
	  if (changed === item && typeof item === 'object') {
	    item = EJSON.clone(item);
	    adjustTypesFromJSONValue(item);
	    return item;
	  } else {
	    return changed;
	  }
	};
	
	/**
	 * @summary Serialize a value to a string.
	
	For EJSON values, the serialization fully represents the value. For non-EJSON values, serializes the same way as `JSON.stringify`.
	 * @locus Anywhere
	 * @param {EJSON} val A value to stringify.
	 * @param {Object} [options]
	 * @param {Boolean | Integer | String} options.indent Indents objects and arrays for easy readability.  When `true`, indents by 2 spaces; when an integer, indents by that number of spaces; and when a string, uses the string as the indentation pattern.
	 * @param {Boolean} options.canonical When `true`, stringifies keys in an object in sorted order.
	 */
	EJSON.stringify = function (item, options) {
	  var json = EJSON.toJSONValue(item);
	  if (options && (options.canonical || options.indent)) {
	    return EJSON._canonicalStringify(json, options);
	  } else {
	    return JSON.stringify(json);
	  }
	};
	
	/**
	 * @summary Parse a string into an EJSON value. Throws an error if the string is not valid EJSON.
	 * @locus Anywhere
	 * @param {String} str A string to parse into an EJSON value.
	 */
	EJSON.parse = function (item) {
	  if (typeof item !== 'string')
	    throw new Error("EJSON.parse argument should be a string");
	  return EJSON.fromJSONValue(JSON.parse(item));
	};
	
	/**
	 * @summary Returns true if `x` is a buffer of binary data, as returned from [`EJSON.newBinary`](#ejson_new_binary).
	 * @param {Object} x The variable to check.
	 * @locus Anywhere
	 */
	EJSON.isBinary = function (obj) {
	  return !!((typeof Uint8Array !== 'undefined' && obj instanceof Uint8Array) ||
	    (obj && obj.$Uint8ArrayPolyfill));
	};
	
	/**
	 * @summary Return true if `a` and `b` are equal to each other.  Return false otherwise.  Uses the `equals` method on `a` if present, otherwise performs a deep comparison.
	 * @locus Anywhere
	 * @param {EJSON} a
	 * @param {EJSON} b
	 * @param {Object} [options]
	 * @param {Boolean} options.keyOrderSensitive Compare in key sensitive order, if supported by the JavaScript implementation.  For example, `{a: 1, b: 2}` is equal to `{b: 2, a: 1}` only when `keyOrderSensitive` is `false`.  The default is `false`.
	 */
	EJSON.equals = function (a, b, options) {
	  var i;
	  var keyOrderSensitive = !!(options && options.keyOrderSensitive);
	  if (a === b)
	    return true;
	  if (_.isNaN(a) && _.isNaN(b))
	    return true; // This differs from the IEEE spec for NaN equality, b/c we don't want
	                 // anything ever with a NaN to be poisoned from becoming equal to anything.
	  if (!a || !b) // if either one is falsy, they'd have to be === to be equal
	    return false;
	  if (!(typeof a === 'object' && typeof b === 'object'))
	    return false;
	  if (a instanceof Date && b instanceof Date)
	    return a.valueOf() === b.valueOf();
	  if (EJSON.isBinary(a) && EJSON.isBinary(b)) {
	    if (a.length !== b.length)
	      return false;
	    for (i = 0; i < a.length; i++) {
	      if (a[i] !== b[i])
	        return false;
	    }
	    return true;
	  }
	  if (typeof (a.equals) === 'function')
	    return a.equals(b, options);
	  if (typeof (b.equals) === 'function')
	    return b.equals(a, options);
	  if (a instanceof Array) {
	    if (!(b instanceof Array))
	      return false;
	    if (a.length !== b.length)
	      return false;
	    for (i = 0; i < a.length; i++) {
	      if (!EJSON.equals(a[i], b[i], options))
	        return false;
	    }
	    return true;
	  }
	  // fallback for custom types that don't implement their own equals
	  switch (EJSON._isCustomType(a) + EJSON._isCustomType(b)) {
	    case 1: return false;
	    case 2: return EJSON.equals(EJSON.toJSONValue(a), EJSON.toJSONValue(b));
	  }
	  // fall back to structural equality of objects
	  var ret;
	  if (keyOrderSensitive) {
	    var bKeys = [];
	    _.each(b, function (val, x) {
	        bKeys.push(x);
	    });
	    i = 0;
	    ret = _.all(a, function (val, x) {
	      if (i >= bKeys.length) {
	        return false;
	      }
	      if (x !== bKeys[i]) {
	        return false;
	      }
	      if (!EJSON.equals(val, b[bKeys[i]], options)) {
	        return false;
	      }
	      i++;
	      return true;
	    });
	    return ret && i === bKeys.length;
	  } else {
	    i = 0;
	    ret = _.all(a, function (val, key) {
	      if (!_.has(b, key)) {
	        return false;
	      }
	      if (!EJSON.equals(val, b[key], options)) {
	        return false;
	      }
	      i++;
	      return true;
	    });
	    return ret && _.size(b) === i;
	  }
	};
	
	/**
	 * @summary Return a deep copy of `val`.
	 * @locus Anywhere
	 * @param {EJSON} val A value to copy.
	 */
	EJSON.clone = function (v) {
	  var ret;
	  if (typeof v !== "object")
	    return v;
	  if (v === null)
	    return null; // null has typeof "object"
	  if (v instanceof Date)
	    return new Date(v.getTime());
	  // RegExps are not really EJSON elements (eg we don't define a serialization
	  // for them), but they're immutable anyway, so we can support them in clone.
	  if (v instanceof RegExp)
	    return v;
	  if (EJSON.isBinary(v)) {
	    ret = EJSON.newBinary(v.length);
	    for (var i = 0; i < v.length; i++) {
	      ret[i] = v[i];
	    }
	    return ret;
	  }
	  // XXX: Use something better than underscore's isArray
	  if (_.isArray(v) || _.isArguments(v)) {
	    // For some reason, _.map doesn't work in this context on Opera (weird test
	    // failures).
	    ret = [];
	    for (i = 0; i < v.length; i++)
	      ret[i] = EJSON.clone(v[i]);
	    return ret;
	  }
	  // handle general user-defined typed Objects if they have a clone method
	  if (typeof v.clone === 'function') {
	    return v.clone();
	  }
	  // handle other custom types
	  if (EJSON._isCustomType(v)) {
	    return EJSON.fromJSONValue(EJSON.clone(EJSON.toJSONValue(v)), true);
	  }
	  // handle other objects
	  ret = {};
	  _.each(v, function (value, key) {
	    ret[key] = EJSON.clone(value);
	  });
	  return ret;
	};
	
	/**
	 * @summary Allocate a new buffer of binary data that EJSON can serialize.
	 * @locus Anywhere
	 * @param {Number} size The number of bytes of binary data to allocate.
	 */
	// EJSON.newBinary is the public documented API for this functionality,
	// but the implementation is in the 'base64' package to avoid
	// introducing a circular dependency. (If the implementation were here,
	// then 'base64' would have to use EJSON.newBinary, and 'ejson' would
	// also have to use 'base64'.)
	EJSON.newBinary = Base64.newBinary;
	}).call(this);
	/** end of build/meteor/packages/ejson/ejson.js **/
	/** start of build/meteor/packages/tracker/tracker.js **/
	(function() {
	/////////////////////////////////////////////////////
	// Package docs at http://docs.meteor.com/#tracker //
	/////////////////////////////////////////////////////
	
	/**
	 * @namespace Tracker
	 * @summary The namespace for Tracker-related methods.
	 */
	Tracker = {};
	
	// http://docs.meteor.com/#tracker_active
	
	/**
	 * @summary True if there is a current computation, meaning that dependencies on reactive data sources will be tracked and potentially cause the current computation to be rerun.
	 * @locus Client
	 * @type {Boolean}
	 */
	Tracker.active = false;
	
	// http://docs.meteor.com/#tracker_currentcomputation
	
	/**
	 * @summary The current computation, or `null` if there isn't one.  The current computation is the [`Tracker.Computation`](#tracker_computation) object created by the innermost active call to `Tracker.autorun`, and it's the computation that gains dependencies when reactive data sources are accessed.
	 * @locus Client
	 * @type {Tracker.Computation}
	 */
	Tracker.currentComputation = null;
	
	// References to all computations created within the Tracker by id.
	// Keeping these references on an underscore property gives more control to
	// tooling and packages extending Tracker without increasing the API surface.
	// These can used to monkey-patch computations, their functions, use
	// computation ids for tracking, etc.
	Tracker._computations = {};
	
	var setCurrentComputation = function (c) {
	  Tracker.currentComputation = c;
	  Tracker.active = !! c;
	};
	
	var _debugFunc = function () {
	  // We want this code to work without Meteor, and also without
	  // "console" (which is technically non-standard and may be missing
	  // on some browser we come across, like it was on IE 7).
	  //
	  // Lazy evaluation because `Meteor` does not exist right away.(??)
	  return (typeof Meteor !== "undefined" ? Meteor._debug :
	          ((typeof console !== "undefined") && console.error ?
	           function () { console.error.apply(console, arguments); } :
	           function () {}));
	};
	
	var _maybeSuppressMoreLogs = function (messagesLength) {
	  // Sometimes when running tests, we intentionally suppress logs on expected
	  // printed errors. Since the current implementation of _throwOrLog can log
	  // multiple separate log messages, suppress all of them if at least one suppress
	  // is expected as we still want them to count as one.
	  if (typeof Meteor !== "undefined") {
	    if (Meteor._suppressed_log_expected()) {
	      Meteor._suppress_log(messagesLength - 1);
	    }
	  }
	};
	
	var _throwOrLog = function (from, e) {
	  if (throwFirstError) {
	    throw e;
	  } else {
	    var printArgs = ["Exception from Tracker " + from + " function:"];
	    if (e.stack && e.message && e.name) {
	      var idx = e.stack.indexOf(e.message);
	      if (idx < 0 || idx > e.name.length + 2) { // check for "Error: "
	        // message is not part of the stack
	        var message = e.name + ": " + e.message;
	        printArgs.push(message);
	      }
	    }
	    printArgs.push(e.stack);
	    _maybeSuppressMoreLogs(printArgs.length);
	
	    for (var i = 0; i < printArgs.length; i++) {
	      _debugFunc()(printArgs[i]);
	    }
	  }
	};
	
	// Takes a function `f`, and wraps it in a `Meteor._noYieldsAllowed`
	// block if we are running on the server. On the client, returns the
	// original function (since `Meteor._noYieldsAllowed` is a
	// no-op). This has the benefit of not adding an unnecessary stack
	// frame on the client.
	var withNoYieldsAllowed = function (f) {
	  if ((typeof Meteor === 'undefined') || Meteor.isClient) {
	    return f;
	  } else {
	    return function () {
	      var args = arguments;
	      Meteor._noYieldsAllowed(function () {
	        f.apply(null, args);
	      });
	    };
	  }
	};
	
	var nextId = 1;
	// computations whose callbacks we should call at flush time
	var pendingComputations = [];
	// `true` if a Tracker.flush is scheduled, or if we are in Tracker.flush now
	var willFlush = false;
	// `true` if we are in Tracker.flush now
	var inFlush = false;
	// `true` if we are computing a computation now, either first time
	// or recompute.  This matches Tracker.active unless we are inside
	// Tracker.nonreactive, which nullfies currentComputation even though
	// an enclosing computation may still be running.
	var inCompute = false;
	// `true` if the `_throwFirstError` option was passed in to the call
	// to Tracker.flush that we are in. When set, throw rather than log the
	// first error encountered while flushing. Before throwing the error,
	// finish flushing (from a finally block), logging any subsequent
	// errors.
	var throwFirstError = false;
	
	var afterFlushCallbacks = [];
	
	var requireFlush = function () {
	  if (! willFlush) {
	    // We want this code to work without Meteor, see debugFunc above
	    if (typeof Meteor !== "undefined")
	      Meteor._setImmediate(Tracker._runFlush);
	    else
	      setTimeout(Tracker._runFlush, 0);
	    willFlush = true;
	  }
	};
	
	// Tracker.Computation constructor is visible but private
	// (throws an error if you try to call it)
	var constructingComputation = false;
	
	//
	// http://docs.meteor.com/#tracker_computation
	
	/**
	 * @summary A Computation object represents code that is repeatedly rerun
	 * in response to
	 * reactive data changes. Computations don't have return values; they just
	 * perform actions, such as rerendering a template on the screen. Computations
	 * are created using Tracker.autorun. Use stop to prevent further rerunning of a
	 * computation.
	 * @instancename computation
	 */
	Tracker.Computation = function (f, parent, onError) {
	  if (! constructingComputation)
	    throw new Error(
	      "Tracker.Computation constructor is private; use Tracker.autorun");
	  constructingComputation = false;
	
	  var self = this;
	
	  // http://docs.meteor.com/#computation_stopped
	
	  /**
	   * @summary True if this computation has been stopped.
	   * @locus Client
	   * @memberOf Tracker.Computation
	   * @instance
	   * @name  stopped
	   */
	  self.stopped = false;
	
	  // http://docs.meteor.com/#computation_invalidated
	
	  /**
	   * @summary True if this computation has been invalidated (and not yet rerun), or if it has been stopped.
	   * @locus Client
	   * @memberOf Tracker.Computation
	   * @instance
	   * @name  invalidated
	   * @type {Boolean}
	   */
	  self.invalidated = false;
	
	  // http://docs.meteor.com/#computation_firstrun
	
	  /**
	   * @summary True during the initial run of the computation at the time `Tracker.autorun` is called, and false on subsequent reruns and at other times.
	   * @locus Client
	   * @memberOf Tracker.Computation
	   * @instance
	   * @name  firstRun
	   * @type {Boolean}
	   */
	  self.firstRun = true;
	
	  self._id = nextId++;
	  self._onInvalidateCallbacks = [];
	  self._onStopCallbacks = [];
	  // the plan is at some point to use the parent relation
	  // to constrain the order that computations are processed
	  self._parent = parent;
	  self._func = f;
	  self._onError = onError;
	  self._recomputing = false;
	
	  // Register the computation within the global Tracker.
	  Tracker._computations[self._id] = self;
	
	  var errored = true;
	  try {
	    self._compute();
	    errored = false;
	  } finally {
	    self.firstRun = false;
	    if (errored)
	      self.stop();
	  }
	};
	
	// http://docs.meteor.com/#computation_oninvalidate
	
	/**
	 * @summary Registers `callback` to run when this computation is next invalidated, or runs it immediately if the computation is already invalidated.  The callback is run exactly once and not upon future invalidations unless `onInvalidate` is called again after the computation becomes valid again.
	 * @locus Client
	 * @param {Function} callback Function to be called on invalidation. Receives one argument, the computation that was invalidated.
	 */
	Tracker.Computation.prototype.onInvalidate = function (f) {
	  var self = this;
	
	  if (typeof f !== 'function')
	    throw new Error("onInvalidate requires a function");
	
	  if (self.invalidated) {
	    Tracker.nonreactive(function () {
	      withNoYieldsAllowed(f)(self);
	    });
	  } else {
	    self._onInvalidateCallbacks.push(f);
	  }
	};
	
	/**
	 * @summary Registers `callback` to run when this computation is stopped, or runs it immediately if the computation is already stopped.  The callback is run after any `onInvalidate` callbacks.
	 * @locus Client
	 * @param {Function} callback Function to be called on stop. Receives one argument, the computation that was stopped.
	 */
	Tracker.Computation.prototype.onStop = function (f) {
	  var self = this;
	
	  if (typeof f !== 'function')
	    throw new Error("onStop requires a function");
	
	  if (self.stopped) {
	    Tracker.nonreactive(function () {
	      withNoYieldsAllowed(f)(self);
	    });
	  } else {
	    self._onStopCallbacks.push(f);
	  }
	};
	
	// http://docs.meteor.com/#computation_invalidate
	
	/**
	 * @summary Invalidates this computation so that it will be rerun.
	 * @locus Client
	 */
	Tracker.Computation.prototype.invalidate = function () {
	  var self = this;
	  if (! self.invalidated) {
	    // if we're currently in _recompute(), don't enqueue
	    // ourselves, since we'll rerun immediately anyway.
	    if (! self._recomputing && ! self.stopped) {
	      requireFlush();
	      pendingComputations.push(this);
	    }
	
	    self.invalidated = true;
	
	    // callbacks can't add callbacks, because
	    // self.invalidated === true.
	    for(var i = 0, f; f = self._onInvalidateCallbacks[i]; i++) {
	      Tracker.nonreactive(function () {
	        withNoYieldsAllowed(f)(self);
	      });
	    }
	    self._onInvalidateCallbacks = [];
	  }
	};
	
	// http://docs.meteor.com/#computation_stop
	
	/**
	 * @summary Prevents this computation from rerunning.
	 * @locus Client
	 */
	Tracker.Computation.prototype.stop = function () {
	  var self = this;
	
	  if (! self.stopped) {
	    self.stopped = true;
	    self.invalidate();
	    // Unregister from global Tracker.
	    delete Tracker._computations[self._id];
	    for(var i = 0, f; f = self._onStopCallbacks[i]; i++) {
	      Tracker.nonreactive(function () {
	        withNoYieldsAllowed(f)(self);
	      });
	    }
	    self._onStopCallbacks = [];
	  }
	};
	
	Tracker.Computation.prototype._compute = function () {
	  var self = this;
	  self.invalidated = false;
	
	  var previous = Tracker.currentComputation;
	  setCurrentComputation(self);
	  var previousInCompute = inCompute;
	  inCompute = true;
	  try {
	    withNoYieldsAllowed(self._func)(self);
	  } finally {
	    setCurrentComputation(previous);
	    inCompute = previousInCompute;
	  }
	};
	
	Tracker.Computation.prototype._needsRecompute = function () {
	  var self = this;
	  return self.invalidated && ! self.stopped;
	};
	
	Tracker.Computation.prototype._recompute = function () {
	  var self = this;
	
	  self._recomputing = true;
	  try {
	    if (self._needsRecompute()) {
	      try {
	        self._compute();
	      } catch (e) {
	        if (self._onError) {
	          self._onError(e);
	        } else {
	          _throwOrLog("recompute", e);
	        }
	      }
	    }
	  } finally {
	    self._recomputing = false;
	  }
	};
	
	//
	// http://docs.meteor.com/#tracker_dependency
	
	/**
	 * @summary A Dependency represents an atomic unit of reactive data that a
	 * computation might depend on. Reactive data sources such as Session or
	 * Minimongo internally create different Dependency objects for different
	 * pieces of data, each of which may be depended on by multiple computations.
	 * When the data changes, the computations are invalidated.
	 * @class
	 * @instanceName dependency
	 */
	Tracker.Dependency = function () {
	  this._dependentsById = {};
	};
	
	// http://docs.meteor.com/#dependency_depend
	//
	// Adds `computation` to this set if it is not already
	// present.  Returns true if `computation` is a new member of the set.
	// If no argument, defaults to currentComputation, or does nothing
	// if there is no currentComputation.
	
	/**
	 * @summary Declares that the current computation (or `fromComputation` if given) depends on `dependency`.  The computation will be invalidated the next time `dependency` changes.
	
	If there is no current computation and `depend()` is called with no arguments, it does nothing and returns false.
	
	Returns true if the computation is a new dependent of `dependency` rather than an existing one.
	 * @locus Client
	 * @param {Tracker.Computation} [fromComputation] An optional computation declared to depend on `dependency` instead of the current computation.
	 * @returns {Boolean}
	 */
	Tracker.Dependency.prototype.depend = function (computation) {
	  if (! computation) {
	    if (! Tracker.active)
	      return false;
	
	    computation = Tracker.currentComputation;
	  }
	  var self = this;
	  var id = computation._id;
	  if (! (id in self._dependentsById)) {
	    self._dependentsById[id] = computation;
	    computation.onInvalidate(function () {
	      delete self._dependentsById[id];
	    });
	    return true;
	  }
	  return false;
	};
	
	// http://docs.meteor.com/#dependency_changed
	
	/**
	 * @summary Invalidate all dependent computations immediately and remove them as dependents.
	 * @locus Client
	 */
	Tracker.Dependency.prototype.changed = function () {
	  var self = this;
	  for (var id in self._dependentsById)
	    self._dependentsById[id].invalidate();
	};
	
	// http://docs.meteor.com/#dependency_hasdependents
	
	/**
	 * @summary True if this Dependency has one or more dependent Computations, which would be invalidated if this Dependency were to change.
	 * @locus Client
	 * @returns {Boolean}
	 */
	Tracker.Dependency.prototype.hasDependents = function () {
	  var self = this;
	  for(var id in self._dependentsById)
	    return true;
	  return false;
	};
	
	// http://docs.meteor.com/#tracker_flush
	
	/**
	 * @summary Process all reactive updates immediately and ensure that all invalidated computations are rerun.
	 * @locus Client
	 */
	Tracker.flush = function (options) {
	  Tracker._runFlush({ finishSynchronously: true,
	                      throwFirstError: options && options._throwFirstError });
	};
	
	// Run all pending computations and afterFlush callbacks.  If we were not called
	// directly via Tracker.flush, this may return before they're all done to allow
	// the event loop to run a little before continuing.
	Tracker._runFlush = function (options) {
	  // XXX What part of the comment below is still true? (We no longer
	  // have Spark)
	  //
	  // Nested flush could plausibly happen if, say, a flush causes
	  // DOM mutation, which causes a "blur" event, which runs an
	  // app event handler that calls Tracker.flush.  At the moment
	  // Spark blocks event handlers during DOM mutation anyway,
	  // because the LiveRange tree isn't valid.  And we don't have
	  // any useful notion of a nested flush.
	  //
	  // https://app.asana.com/0/159908330244/385138233856
	  if (inFlush)
	    throw new Error("Can't call Tracker.flush while flushing");
	
	  if (inCompute)
	    throw new Error("Can't flush inside Tracker.autorun");
	
	  options = options || {};
	
	  inFlush = true;
	  willFlush = true;
	  throwFirstError = !! options.throwFirstError;
	
	  var recomputedCount = 0;
	  var finishedTry = false;
	  try {
	    while (pendingComputations.length ||
	           afterFlushCallbacks.length) {
	
	      // recompute all pending computations
	      while (pendingComputations.length) {
	        var comp = pendingComputations.shift();
	        comp._recompute();
	        if (comp._needsRecompute()) {
	          pendingComputations.unshift(comp);
	        }
	
	        if (! options.finishSynchronously && ++recomputedCount > 1000) {
	          finishedTry = true;
	          return;
	        }
	      }
	
	      if (afterFlushCallbacks.length) {
	        // call one afterFlush callback, which may
	        // invalidate more computations
	        var func = afterFlushCallbacks.shift();
	        try {
	          func();
	        } catch (e) {
	          _throwOrLog("afterFlush", e);
	        }
	      }
	    }
	    finishedTry = true;
	  } finally {
	    if (! finishedTry) {
	      // we're erroring due to throwFirstError being true.
	      inFlush = false; // needed before calling `Tracker.flush()` again
	      // finish flushing
	      Tracker._runFlush({
	        finishSynchronously: options.finishSynchronously,
	        throwFirstError: false
	      });
	    }
	    willFlush = false;
	    inFlush = false;
	    if (pendingComputations.length || afterFlushCallbacks.length) {
	      // We're yielding because we ran a bunch of computations and we aren't
	      // required to finish synchronously, so we'd like to give the event loop a
	      // chance. We should flush again soon.
	      if (options.finishSynchronously) {
	        throw new Error("still have more to do?");  // shouldn't happen
	      }
	      setTimeout(requireFlush, 10);
	    }
	  }
	};
	
	// http://docs.meteor.com/#tracker_autorun
	//
	// Run f(). Record its dependencies. Rerun it whenever the
	// dependencies change.
	//
	// Returns a new Computation, which is also passed to f.
	//
	// Links the computation to the current computation
	// so that it is stopped if the current computation is invalidated.
	
	/**
	 * @callback Tracker.ComputationFunction
	 * @param {Tracker.Computation}
	 */
	/**
	 * @summary Run a function now and rerun it later whenever its dependencies
	 * change. Returns a Computation object that can be used to stop or observe the
	 * rerunning.
	 * @locus Client
	 * @param {Tracker.ComputationFunction} runFunc The function to run. It receives
	 * one argument: the Computation object that will be returned.
	 * @param {Object} [options]
	 * @param {Function} options.onError Optional. The function to run when an error
	 * happens in the Computation. The only argument it recieves is the Error
	 * thrown. Defaults to the error being logged to the console.
	 * @returns {Tracker.Computation}
	 */
	Tracker.autorun = function (f, options) {
	  if (typeof f !== 'function')
	    throw new Error('Tracker.autorun requires a function argument');
	
	  options = options || {};
	
	  constructingComputation = true;
	  var c = new Tracker.Computation(
	    f, Tracker.currentComputation, options.onError);
	
	  if (Tracker.active)
	    Tracker.onInvalidate(function () {
	      c.stop();
	    });
	
	  return c;
	};
	
	// http://docs.meteor.com/#tracker_nonreactive
	//
	// Run `f` with no current computation, returning the return value
	// of `f`.  Used to turn off reactivity for the duration of `f`,
	// so that reactive data sources accessed by `f` will not result in any
	// computations being invalidated.
	
	/**
	 * @summary Run a function without tracking dependencies.
	 * @locus Client
	 * @param {Function} func A function to call immediately.
	 */
	Tracker.nonreactive = function (f) {
	  var previous = Tracker.currentComputation;
	  setCurrentComputation(null);
	  try {
	    return f();
	  } finally {
	    setCurrentComputation(previous);
	  }
	};
	
	// http://docs.meteor.com/#tracker_oninvalidate
	
	/**
	 * @summary Registers a new [`onInvalidate`](#computation_oninvalidate) callback on the current computation (which must exist), to be called immediately when the current computation is invalidated or stopped.
	 * @locus Client
	 * @param {Function} callback A callback function that will be invoked as `func(c)`, where `c` is the computation on which the callback is registered.
	 */
	Tracker.onInvalidate = function (f) {
	  if (! Tracker.active)
	    throw new Error("Tracker.onInvalidate requires a currentComputation");
	
	  Tracker.currentComputation.onInvalidate(f);
	};
	
	// http://docs.meteor.com/#tracker_afterflush
	
	/**
	 * @summary Schedules a function to be called during the next flush, or later in the current flush if one is in progress, after all invalidated computations have been rerun.  The function will be run once and not on subsequent flushes unless `afterFlush` is called again.
	 * @locus Client
	 * @param {Function} callback A function to call at flush time.
	 */
	Tracker.afterFlush = function (f) {
	  afterFlushCallbacks.push(f);
	  requireFlush();
	};
	}).call(this);
	/** end of build/meteor/packages/tracker/tracker.js **/
	/** start of build/meteor/packages/reactive-dict/reactive-dict.js **/
	(function() {
	// XXX come up with a serialization method which canonicalizes object key
	// order, which would allow us to use objects as values for equals.
	var stringify = function (value) {
	  if (value === undefined)
	    return 'undefined';
	  return EJSON.stringify(value);
	};
	var parse = function (serialized) {
	  if (serialized === undefined || serialized === 'undefined')
	    return undefined;
	  return EJSON.parse(serialized);
	};
	
	var changed = function (v) {
	  v && v.changed();
	};
	
	// XXX COMPAT WITH 0.9.1 : accept migrationData instead of dictName
	ReactiveDict = function (dictName) {
	  // this.keys: key -> value
	  if (dictName) {
	    if (typeof dictName === 'string') {
	      // the normal case, argument is a string name.
	      // _registerDictForMigrate will throw an error on duplicate name.
	      ReactiveDict._registerDictForMigrate(dictName, this);
	      this.keys = ReactiveDict._loadMigratedDict(dictName) || {};
	      this.name = dictName;
	    } else if (typeof dictName === 'object') {
	      // back-compat case: dictName is actually migrationData
	      this.keys = dictName;
	    } else {
	      throw new Error("Invalid ReactiveDict argument: " + dictName);
	    }
	  } else {
	    // no name given; no migration will be performed
	    this.keys = {};
	  }
	
	  this.allDeps = new Tracker.Dependency;
	  this.keyDeps = {}; // key -> Dependency
	  this.keyValueDeps = {}; // key -> Dependency
	};
	
	_.extend(ReactiveDict.prototype, {
	  // set() began as a key/value method, but we are now overloading it
	  // to take an object of key/value pairs, similar to backbone
	  // http://backbonejs.org/#Model-set
	
	  set: function (keyOrObject, value) {
	    var self = this;
	
	    if ((typeof keyOrObject === 'object') && (value === undefined)) {
	      // Called as `dict.set({...})`
	      self._setObject(keyOrObject);
	      return;
	    }
	    // the input isn't an object, so it must be a key
	    // and we resume with the rest of the function
	    var key = keyOrObject;
	
	    value = stringify(value);
	
	    var keyExisted = _.has(self.keys, key);
	    var oldSerializedValue = keyExisted ? self.keys[key] : 'undefined';
	    var isNewValue = (value !== oldSerializedValue);
	
	    self.keys[key] = value;
	
	    if (isNewValue || !keyExisted) {
	      self.allDeps.changed();
	    }
	
	    if (isNewValue) {
	      changed(self.keyDeps[key]);
	      if (self.keyValueDeps[key]) {
	        changed(self.keyValueDeps[key][oldSerializedValue]);
	        changed(self.keyValueDeps[key][value]);
	      }
	    }
	  },
	
	  setDefault: function (key, value) {
	    var self = this;
	    if (! _.has(self.keys, key)) {
	      self.set(key, value);
	    }
	  },
	
	  get: function (key) {
	    var self = this;
	    self._ensureKey(key);
	    self.keyDeps[key].depend();
	    return parse(self.keys[key]);
	  },
	
	  equals: function (key, value) {
	    var self = this;
	
	    // Mongo.ObjectID is in the 'mongo' package
	    var ObjectID = null;
	    if (Package.mongo) {
	      ObjectID = Package.mongo.Mongo.ObjectID;
	    }
	
	    // We don't allow objects (or arrays that might include objects) for
	    // .equals, because JSON.stringify doesn't canonicalize object key
	    // order. (We can make equals have the right return value by parsing the
	    // current value and using EJSON.equals, but we won't have a canonical
	    // element of keyValueDeps[key] to store the dependency.) You can still use
	    // "EJSON.equals(reactiveDict.get(key), value)".
	    //
	    // XXX we could allow arrays as long as we recursively check that there
	    // are no objects
	    if (typeof value !== 'string' &&
	        typeof value !== 'number' &&
	        typeof value !== 'boolean' &&
	        typeof value !== 'undefined' &&
	        !(value instanceof Date) &&
	        !(ObjectID && value instanceof ObjectID) &&
	        value !== null) {
	      throw new Error("ReactiveDict.equals: value must be scalar");
	    }
	    var serializedValue = stringify(value);
	
	    if (Tracker.active) {
	      self._ensureKey(key);
	
	      if (! _.has(self.keyValueDeps[key], serializedValue))
	        self.keyValueDeps[key][serializedValue] = new Tracker.Dependency;
	
	      var isNew = self.keyValueDeps[key][serializedValue].depend();
	      if (isNew) {
	        Tracker.onInvalidate(function () {
	          // clean up [key][serializedValue] if it's now empty, so we don't
	          // use O(n) memory for n = values seen ever
	          if (! self.keyValueDeps[key][serializedValue].hasDependents())
	            delete self.keyValueDeps[key][serializedValue];
	        });
	      }
	    }
	
	    var oldValue = undefined;
	    if (_.has(self.keys, key)) oldValue = parse(self.keys[key]);
	    return EJSON.equals(oldValue, value);
	  },
	
	  all: function() {
	    this.allDeps.depend();
	    var ret = {};
	    _.each(this.keys, function(value, key) {
	      ret[key] = parse(value);
	    });
	    return ret;
	  },
	
	  clear: function() {
	    var self = this;
	
	    var oldKeys = self.keys;
	    self.keys = {};
	
	    self.allDeps.changed();
	
	    _.each(oldKeys, function(value, key) {
	      changed(self.keyDeps[key]);
	      if (self.keyValueDeps[key]) {
	        changed(self.keyValueDeps[key][value]);
	        changed(self.keyValueDeps[key]['undefined']);
	      }
	    });
	
	  },
	
	  delete: function(key) {
	    var self = this;
	    var didRemove = false;
	
	    if (_.has(self.keys, key)) {
	      var oldValue = self.keys[key];
	      delete self.keys[key];
	      changed(self.keyDeps[key]);
	      if (self.keyValueDeps[key]) {
	        changed(self.keyValueDeps[key][oldValue]);
	        changed(self.keyValueDeps[key]['undefined']);
	      }
	      self.allDeps.changed();
	      didRemove = true;
	    }
	
	    return didRemove;
	  },
	
	  _setObject: function (object) {
	    var self = this;
	
	    _.each(object, function (value, key){
	      self.set(key, value);
	    });
	  },
	
	  _ensureKey: function (key) {
	    var self = this;
	    if (!(key in self.keyDeps)) {
	      self.keyDeps[key] = new Tracker.Dependency;
	      self.keyValueDeps[key] = {};
	    }
	  },
	
	  // Get a JSON value that can be passed to the constructor to
	  // create a new ReactiveDict with the same contents as this one
	  _getMigrationData: function () {
	    // XXX sanitize and make sure it's JSONible?
	    return this.keys;
	  }
	});
	}).call(this);
	/** end of build/meteor/packages/reactive-dict/reactive-dict.js **/
	/** start of build/meteor/packages/reactive-var/reactive-var.js **/
	(function() {
	/*
	 * ## [new] ReactiveVar(initialValue, [equalsFunc])
	 *
	 * A ReactiveVar holds a single value that can be get and set,
	 * such that calling `set` will invalidate any Computations that
	 * called `get`, according to the usual contract for reactive
	 * data sources.
	 *
	 * A ReactiveVar is much like a Session variable -- compare `foo.get()`
	 * to `Session.get("foo")` -- but it doesn't have a global name and isn't
	 * automatically migrated across hot code pushes.  Also, while Session
	 * variables can only hold JSON or EJSON, ReactiveVars can hold any value.
	 *
	 * An important property of ReactiveVars, which is sometimes the reason
	 * to use one, is that setting the value to the same value as before has
	 * no effect, meaning ReactiveVars can be used to absorb extra
	 * invalidations that wouldn't serve a purpose.  However, by default,
	 * ReactiveVars are extremely conservative about what changes they
	 * absorb.  Calling `set` with an object argument will *always* trigger
	 * invalidations, because even if the new value is `===` the old value,
	 * the object may have been mutated.  You can change the default behavior
	 * by passing a function of two arguments, `oldValue` and `newValue`,
	 * to the constructor as `equalsFunc`.
	 *
	 * This class is extremely basic right now, but the idea is to evolve
	 * it into the ReactiveVar of Geoff's Lickable Forms proposal.
	 */
	
	/**
	 * @class 
	 * @instanceName reactiveVar
	 * @summary Constructor for a ReactiveVar, which represents a single reactive variable.
	 * @locus Client
	 * @param {Any} initialValue The initial value to set.  `equalsFunc` is ignored when setting the initial value.
	 * @param {Function} [equalsFunc] Optional.  A function of two arguments, called on the old value and the new value whenever the ReactiveVar is set.  If it returns true, no set is performed.  If omitted, the default `equalsFunc` returns true if its arguments are `===` and are of type number, boolean, string, undefined, or null.
	 */
	ReactiveVar = function (initialValue, equalsFunc) {
	  if (! (this instanceof ReactiveVar))
	    // called without `new`
	    return new ReactiveVar(initialValue, equalsFunc);
	
	  this.curValue = initialValue;
	  this.equalsFunc = equalsFunc;
	  this.dep = new Tracker.Dependency;
	};
	
	ReactiveVar._isEqual = function (oldValue, newValue) {
	  var a = oldValue, b = newValue;
	  // Two values are "equal" here if they are `===` and are
	  // number, boolean, string, undefined, or null.
	  if (a !== b)
	    return false;
	  else
	    return ((!a) || (typeof a === 'number') || (typeof a === 'boolean') ||
	            (typeof a === 'string'));
	};
	
	/**
	 * @summary Returns the current value of the ReactiveVar, establishing a reactive dependency.
	 * @locus Client
	 */
	ReactiveVar.prototype.get = function () {
	  if (Tracker.active)
	    this.dep.depend();
	
	  return this.curValue;
	};
	
	/**
	 * @summary Sets the current value of the ReactiveVar, invalidating the Computations that called `get` if `newValue` is different from the old value.
	 * @locus Client
	 * @param {Any} newValue
	 */
	ReactiveVar.prototype.set = function (newValue) {
	  var oldValue = this.curValue;
	
	  if ((this.equalsFunc || ReactiveVar._isEqual)(oldValue, newValue))
	    // value is same as last time
	    return;
	
	  this.curValue = newValue;
	  this.dep.changed();
	};
	
	ReactiveVar.prototype.toString = function () {
	  return 'ReactiveVar{' + this.get() + '}';
	};
	
	ReactiveVar.prototype._numListeners = function() {
	  // Tests want to know.
	  // Accesses a private field of Tracker.Dependency.
	  var count = 0;
	  for (var id in this.dep._dependentsById)
	    count++;
	  return count;
	};
	}).call(this);
	/** end of build/meteor/packages/reactive-var/reactive-var.js **/
	    return {
	      ReactiveVar: ReactiveVar,
	      ReactiveDict: ReactiveDict,
	      Tracker: Tracker
	    };
	  }).call(global);
	}));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var ad_1 = __webpack_require__(5);
	var iframe_1 = __webpack_require__(10);
	var $ = __webpack_require__(7);
	// there are a few places in code where we need to iterate over all panels, so
	// we define them here:
	var panels = ["ft", "fr", "fb", "fl"];
	/**
	 * Skin ad (4 panels)
	 */
	var Skin = (function (_super) {
	    __extends(Skin, _super);
	    function Skin(base, response) {
	        _super.call(this, base, response.ad);
	        this.response = response;
	    }
	    Skin.prototype.serve = function () {
	        var _this = this;
	        // cache $(window):
	        this._$win = $(window);
	        // handle scrolling:
	        this._$win.on("scroll.fe", function () {
	            _this.set({
	                scrollLeft: _this._$win.scrollLeft(),
	                scrollTop: _this._$win.scrollTop(),
	            });
	        }).scroll();
	        // handle window resizes:
	        this._$win.on("resize.fe", function () {
	            _this.set({
	                windowWidth: _this._$win.width(),
	            });
	        }).resize();
	        // determine content height:
	        this._autorun(this._updateContentHeight);
	        // create the (reactive) frame, which updates with configuration:
	        if (!(this._body() && this._anchor() && this._wrap())) {
	            return false;
	        }
	        // load all panels:
	        var iframe;
	        for (var i = 0; i < panels.length; i++) {
	            iframe = this[panels[i]] = new iframe_1.default({
	                $container: this["_$" + panels[i]],
	                name: panels[i],
	                url: this.get([panels[i] + "Url"]),
	            });
	            iframe.addEventListener("*", function (e) {
	                switch (e.name) {
	                    case "INIT_COMPLETE":
	                        _this._onPanelInitComplete(e);
	                        break;
	                    default:
	                        _this.dispatchEvent(e.name, e.data);
	                }
	            });
	            iframe.load({
	                id: panels[i],
	            });
	        }
	    };
	    Skin.prototype.unload = function () {
	        this.listeners = {};
	        this._$win.off("scroll.fe");
	        if (this._$anchor) {
	            this._$anchor.remove();
	            delete this._$anchor;
	            delete this._$ft;
	            delete this._$fr;
	            delete this._$fb;
	            delete this._$fl;
	        }
	        this.dispatchEvent("UNLOADED");
	    };
	    /**
	     * The creative is ready (i.e.: all panels have loaded).
	     */
	    Skin.prototype._onReady = function () {
	        // show it:
	        this.set({ visible: true });
	        for (var i = 0; i < panels.length; i++) {
	            this[panels[i]].callFunction("doStart");
	        }
	        // send scroll data to all panels:
	        this._autorun(function () {
	            if (this.get("sendScrollData")) {
	                var scrollTop = this.get("scrollTop"), offset = void 0;
	                for (var i = 0; i < panels.length; i++) {
	                    offset = this["_$" + panels[i]].offset();
	                    this[panels[i]].callFunction("set", {
	                        pageScrollTop: scrollTop,
	                        scrollTop: scrollTop >= offset.top ? scrollTop - offset.top : 0,
	                    });
	                }
	            }
	        });
	        this.dispatchEvent("SERVED");
	    };
	    /**
	     * Manage the styles on document.body, used to make room for the skin when
	     * content is fluid.
	     */
	    Skin.prototype._body = function () {
	        this._autorun(function () {
	            var $body = $("body");
	            // original body margins:
	            if (!this._bodyMargin) {
	                this._bodyMargin = {
	                    "margin-left": parseInt($body.css("margin-left"), 10) || 0,
	                    "margin-right": parseInt($body.css("margin-right"), 10) || 0,
	                };
	            }
	            var contentWidth = this.get("contentWidth");
	            if (contentWidth) {
	                // content is fixed in size:
	                var contentAlignment = this.get("contentAlignment");
	                switch (contentAlignment) {
	                    case "center":
	                    case "centre":
	                        $body.css({
	                            "margin-left": this._bodyMargin["margin-left"] + "px",
	                            "margin-right": this._bodyMargin["margin-right"] + "px",
	                        });
	                        break;
	                    case "left":
	                        var l = this.get("flSize") + this.get("flGutter");
	                        $body.css({
	                            "margin-left": Math.max(l, this._bodyMargin["margin-left"]) + "px",
	                            "margin-right": this._bodyMargin["margin-right"] + "px",
	                        });
	                        break;
	                }
	            }
	            else {
	                // content is fluid, so make room for side frames using body margin:
	                var l = this.get("flSize") + this.get("flGutter"), r = this.get("frSize") + this.get("frGutter");
	                $body.css($.extend({}, {
	                    "margin-left": Math.max(l, this._bodyMargin["margin-left"]) + "px",
	                    "margin-right": Math.max(r, this._bodyMargin["margin-right"]) + "px",
	                }));
	            }
	        });
	        return true;
	    };
	    /**
	     * Create and manage the anchor element.
	     */
	    Skin.prototype._anchor = function () {
	        this._$anchor = $("<div></div>").css({
	            "z-index": 10,
	        }).prependTo("body");
	        this._autorun(function () {
	            var css = {
	                height: this.get("ftSize") + "px",
	                "margin-bottom": this.get("ftGutter") + "px",
	            };
	            if (this.get("visible")) {
	                css.position = "relative";
	                css.left = "initial";
	            }
	            else {
	                css.position = "absolute";
	                css.left = "-10000px";
	            }
	            var contentWidth = this.get("contentWidth");
	            if (contentWidth) {
	                css.width = contentWidth + "px";
	            }
	            else {
	                css.width = "auto";
	            }
	            var contentAlignment = this.get("contentAlignment");
	            switch (contentAlignment) {
	                case "centre":
	                case "center":
	                    css["margin-left"] = "auto";
	                    css["margin-right"] = "auto";
	                    break;
	                case "left":
	                    css["margin-left"] = 0;
	                    css["margin-right"] = 0;
	                    break;
	            }
	            this._$anchor.css(css);
	        });
	        return true;
	    };
	    /**
	     * Create and manage the frame.
	     */
	    Skin.prototype._wrap = function () {
	        for (var i = 0; i < panels.length; i++) {
	            var panel = panels[i];
	            this["_$" + panel] = $("<div></div>").css({
	                overflow: "hidden",
	            }).appendTo(this._$anchor);
	            this._autorun(this["_" + panel + "Update"]);
	        }
	        return true;
	    };
	    /**
	     * Update functions for each panel.
	     */
	    Skin.prototype._ftUpdate = function () {
	        var soT = this.get("soT"), fl = soT ? 0 : this.get("flSize") + this.get("flGutter"), fr = soT ? 0 : this.get("frSize") + this.get("frGutter"), anchorOffset = this._$anchor.offset(), panelOverlap = soT ? this.get("panelOverlap") : 0, 
	        // visible = this.get("visible"),
	        // contentWidth = this.get("contentWidth"),
	        // contentAlignment = this.get("contentAlignment"),
	        css, r, l, w;
	        // frame width:
	        w = this._$anchor.width() + fl + fr + 2 * panelOverlap;
	        // expand frame to cover all available space, if needed:
	        if (!soT && this.get("ftExpand")) {
	            // let windowWidth = this.get("windowWidth");
	            // left side:
	            fl = Math.max(fl, anchorOffset.left);
	            // right side:
	            var x = anchorOffset.left + this._$anchor.width() + this.get("frGutter"), available = this.get("windowWidth") - x;
	            fr = Math.max(fr, available);
	            w = Math.max(w, this._$anchor.width() + fl + fr);
	        }
	        // in case we might need to be fixed:
	        if (this.get("ftFixed")) {
	            var initialTop = anchorOffset.top;
	            // determine where we should position relative to top edge of the window
	            // when we are fixed:
	            var fixedOffset = this.get("ftFixedOffset");
	            if (isNaN(fixedOffset)) {
	                fixedOffset = initialTop;
	            }
	            // threshold to switch to fixed positioning:
	            var threshold = initialTop - fixedOffset;
	            if (this.get("scrollTop") >= threshold) {
	                l = anchorOffset.left - fl - panelOverlap;
	                css = {
	                    left: l + "px",
	                    position: "fixed",
	                    right: "auto",
	                    top: fixedOffset + "px",
	                    width: w + "px",
	                };
	            }
	        }
	        // we're not fixed:
	        if (!css) {
	            r = -(fr + panelOverlap);
	            l = -(fl + panelOverlap);
	            css = {
	                left: l + "px",
	                position: "absolute",
	                right: r + "px",
	                top: 0,
	                width: "auto",
	            };
	        }
	        $.extend(css, {
	            height: this.get("ftSize") + "px",
	            "z-index": (soT ? 1 : 3),
	        });
	        this._$ft.css(css);
	    };
	    Skin.prototype._frUpdate = function () {
	        var soT = this.get("soT"), soB = this.get("soB"), anchorOffset = this._$anchor.offset(), panelOverlapT = !soT ? this.get("panelOverlap") : 0, panelOverlapB = !soB ? this.get("panelOverlap") : 0, 
	        // visible = this.get("visible"),
	        // contentWidth = this.get("contentWidth"),
	        // contentAlignment = this.get("contentAlignment"),
	        css, t, r, l, h, w;
	        // frame height:
	        h = this.get("contentHeight");
	        h += (soT ? this.get("ftSize") : 0) + (soB ? this.get("fbSize") : 0);
	        h += panelOverlapT + panelOverlapB;
	        // frame width:
	        w = this.get("frSize");
	        // expand frame to cover all available space, if needed:
	        if (this.get("frExpand")) {
	            var x = anchorOffset.left + this._$anchor.width() + this.get("frGutter"), available = this.get("windowWidth") - x;
	            w = Math.max(w, available);
	        }
	        // in case we might need to be fixed:
	        if (this.get("frFixed")) {
	            var initialTop = anchorOffset.top + (soT ? 0 : this.get("ftSize"));
	            // determine where we should position relative to top edge of the window
	            // when we are fixed:
	            var fixedOffset = this.get("frFixedOffset");
	            if (isNaN(fixedOffset)) {
	                fixedOffset = initialTop;
	            }
	            // threshold to switch to fixed positioning:
	            var threshold = initialTop - fixedOffset + panelOverlapT;
	            if (this.get("scrollTop") >= threshold) {
	                l = anchorOffset.left + this._$anchor.width() + this.get("frGutter");
	                css = {
	                    left: l + "px",
	                    position: "fixed",
	                    right: "auto",
	                    top: (fixedOffset - panelOverlapT) + "px",
	                };
	            }
	        }
	        // we're not fixed:
	        if (!css) {
	            t = (soT ? 0 : this.get("ftSize")) - panelOverlapT;
	            r = -(w + this.get("frGutter"));
	            css = {
	                left: "auto",
	                position: "absolute",
	                right: r + "px",
	                top: t + "px",
	            };
	        }
	        $.extend(css, {
	            height: h + "px",
	            width: w + "px",
	            "z-index": 2,
	        });
	        this._$fr.css(css);
	    };
	    Skin.prototype._fbUpdate = function () {
	        var soB = this.get("soB"), fl = soB ? 0 : this.get("flSize") + this.get("flGutter"), fr = soB ? 0 : this.get("frSize") + this.get("frGutter"), anchorOffset = this._$anchor.offset(), ftSize = this.get("ftSize"), ftGutter = this.get("ftGutter"), fbGutter = this.get("fbGutter"), contentHeight = this.get("contentHeight"), panelOverlap = soB ? this.get("panelOverlap") : 0, 
	        // visible = this.get("visible"),
	        // contentWidth = this.get("contentWidth"),
	        // contentAlignment = this.get("contentAlignment"),
	        css, t, r, l;
	        // expand frame to cover all available space, if needed:
	        if (!soB && this.get("fbExpand")) {
	            // left side:
	            fl = Math.max(fl, anchorOffset.left);
	            // right side:
	            var x = anchorOffset.left + this._$anchor.width() + this.get("frGutter"), available = this.get("windowWidth") - x;
	            fr = Math.max(fr, available);
	        }
	        t = ftSize + ftGutter + contentHeight + fbGutter;
	        r = -(fr + panelOverlap);
	        l = -(fl + panelOverlap);
	        css = {
	            height: this.get("fbSize") + "px",
	            left: l + "px",
	            position: "absolute",
	            right: r + "px",
	            top: t + "px",
	            "z-index": (soB ? 1 : 3),
	        };
	        this._$fb.css(css);
	    };
	    Skin.prototype._flUpdate = function () {
	        var soT = this.get("soT"), soB = this.get("soB"), anchorOffset = this._$anchor.offset(), panelOverlapT = !soT ? this.get("panelOverlap") : 0, panelOverlapB = !soB ? this.get("panelOverlap") : 0, 
	        // visible = this.get("visible"),
	        // contentWidth = this.get("contentWidth"),
	        // contentAlignment = this.get("contentAlignment"),
	        css, t, l, h, w;
	        // frame height:
	        h = this.get("contentHeight");
	        h += (soT ? this.get("ftSize") : 0) + (soB ? this.get("fbSize") : 0);
	        h += panelOverlapT + panelOverlapB;
	        // frame width:
	        w = this.get("flSize");
	        // expand frame to cover all available space, if needed:
	        if (this.get("flExpand")) {
	            // although we don"t use this value, we need it to create a dependency:
	            this.get("windowWidth");
	            w = Math.max(w, anchorOffset.left);
	        }
	        // in case we might need to be fixed:
	        if (this.get("flFixed")) {
	            var initialTop = anchorOffset.top + (soT ? 0 : this.get("ftSize"));
	            // determine where we should position relative to top edge of the window
	            // when we are fixed:
	            var fixedOffset = this.get("flFixedOffset");
	            if (isNaN(fixedOffset)) {
	                fixedOffset = initialTop;
	            }
	            // threshold to switch to fixed positioning:
	            var threshold = initialTop - fixedOffset + panelOverlapT;
	            if (this.get("scrollTop") >= threshold) {
	                l = anchorOffset.left - (w + this.get("flGutter"));
	                css = {
	                    left: l + "px",
	                    position: "fixed",
	                    top: (fixedOffset - panelOverlapT) + "px",
	                };
	            }
	        }
	        // we're not fixed:
	        if (!css) {
	            t = (soT ? 0 : this.get("ftSize")) - panelOverlapT;
	            l = -(w + this.get("flGutter"));
	            css = {
	                left: l + "px",
	                position: "absolute",
	                top: t + "px",
	            };
	        }
	        $.extend(css, {
	            height: h + "px",
	            width: w + "px",
	            "z-index": 2,
	        });
	        this._$fl.css(css);
	    };
	    /**
	     * Update content height.
	     */
	    Skin.prototype._updateContentHeight = function () {
	        this.set({
	            contentHeight: Math.max(0, this._getPageHeight() + this.get("contentHeightAdjustment")),
	        });
	    };
	    /**
	     * Calculate page height.
	     */
	    Skin.prototype._getPageHeight = function () {
	        // check if we have a hardcoded value in integration parameters:
	        var h = this.get("contentHeightFixed");
	        if (h) {
	            return h;
	        }
	        // calculate based on the configured method:
	        switch (this.get("contentHeightComputeVersion")) {
	            case 2:
	                return this._getPageHeightV2();
	            default:
	                return this._getPageHeightV1();
	        }
	    };
	    /**
	     * Calculate page height by taking the max between body height and the top
	     * offset of a marker element we insert as the last child on the body.
	     */
	    Skin.prototype._getPageHeightV1 = function () {
	        var $body = $("body");
	        // body height:
	        var bodyH = $body.height();
	        // place a marker element and get its offset position:
	        var $marker = $("<div></div>").css({
	            "width": "1px",
	            "height": "1px",
	        }).appendTo($body);
	        var marker_offset = $marker.offset();
	        // remove marker:
	        $marker.remove();
	        // account for body top margin/border/padding:
	        var bodyM = parseInt($body.css("margin-top"), 10) || 0;
	        var bodyB = parseInt($body.css("border-top"), 10) || 0;
	        var bodyP = parseInt($body.css("padding-top"), 10) || 0;
	        // height:
	        var h = Math.max(bodyH, marker_offset.top - (bodyM + bodyB + bodyP));
	        // substract our contribution to this height:
	        if (this._$anchor) {
	            h -= this.get("ftSize") + this.get("ftGutter");
	        }
	        return Math.round(h);
	    };
	    /**
	     * Calculate page height by looking at the whole document height and
	     * substracting our contribution to that height (this method doesn't support
	     * pages that decrease in size).
	     */
	    Skin.prototype._getPageHeightV2 = function () {
	        var $body = $("body");
	        // document height
	        var h = $(document).height();
	        // account for body top margin/border/padding
	        var bodyM = parseInt($body.css("margin-top"), 10) || 0;
	        var bodyB = parseInt($body.css("border-top"), 10) || 0;
	        var bodyP = parseInt($body.css("padding-top"), 10) || 0;
	        h -= (bodyM + bodyB + bodyP);
	        // substract our contribution to this height
	        if (this._$anchor) {
	            h -= (this.get("ftSize") + this.get("ftGutter")
	                +
	                    this.get("fbSize") + this.get("ftGutter"));
	        }
	        return Math.round(h);
	    };
	    /**
	     * Default configuration.
	     */
	    Skin.prototype._defaults = function () {
	        return {
	            contentAlignment: "center",
	            contentHeight: 0,
	            contentHeightAdjustment: 0,
	            contentHeightComputeVersion: 1,
	            contentHeightFixed: 0,
	            contentWidth: 0,
	            flFixedOffset: null,
	            frFixedOffset: null,
	            ftFixedOffset: null,
	            // the amount by which we overlap panels to mitigate seams at common
	            // edges:
	            panelOverlap: 1,
	            // internal state:
	            scrollLeft: 0,
	            scrollTop: 0,
	            windowWidth: 0,
	        };
	    };
	    /**
	     * List the keys in configuration which need to be either booleans or
	     * integers.
	     */
	    Skin.prototype._booleans = function () {
	        return ["ftFixed", "ftExpand", "frFixed", "frExpand", "fbExpand", "flFixed", "flExpand"];
	    };
	    Skin.prototype._integers = function () {
	        return ["contentHeight", "contentWidth", "ftFixedOffset", "frFixedOffset", "flFixedOffset"];
	    };
	    /**
	     * Handle INIT_COMPLETE events from the panels.
	     */
	    Skin.prototype._onPanelInitComplete = function (e) {
	        this["_" + e.target.cfg.name + "Loaded"] = true;
	        // once all panels have loaded, show the creative:
	        if (this._ftLoaded && this._frLoaded && this._fbLoaded && this._flLoaded) {
	            this._onReady();
	        }
	    };
	    return Skin;
	}(ad_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Skin;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var event_dispatcher_1 = __webpack_require__(2);
	var easyxdm = __webpack_require__(11);
	/**
	 * An iframe loaded via easyXDM in a $container
	 */
	var IFrame = (function (_super) {
	    __extends(IFrame, _super);
	    function IFrame(cfg) {
	        _super.call(this);
	        this.cfg = cfg;
	    }
	    /**
	     * Load the iframe and initialise it, passing initData.
	     */
	    IFrame.prototype.load = function (initData) {
	        var self = this;
	        // Load the iframe through easyXDM
	        this.rpc = new easyxdm.Rpc({
	            container: this.cfg.$container[0],
	            props: {
	                scrolling: "no",
	                style: {
	                    height: "100%",
	                    width: "100%",
	                },
	            },
	            remote: this.cfg.url,
	            onReady: function () {
	                self.callFunction("init", initData);
	            },
	        }, {
	            local: {
	                // Handle function calls from the iframe
	                callFunction: function (target, fn) {
	                    var data = {
	                        args: [],
	                        fn: fn,
	                        onError: arguments[arguments.length - 1],
	                        onSuccess: arguments[arguments.length - 2],
	                        target: target,
	                    };
	                    if (arguments.length > 4) {
	                        data.args = Array.prototype.slice.call(arguments, 2, -2);
	                    }
	                    self.dispatchEvent("FUNCTION_CALL", data);
	                },
	                // Forward events received from the iframe
	                sendEvent: function (name, data) {
	                    self.dispatchEvent(name, data);
	                },
	            },
	            remote: {
	                callFunction: true,
	            },
	        });
	    };
	    /**
	     * Call a function on the iframe
	     *
	     * @param name
	     * @param data
	     */
	    IFrame.prototype.callFunction = function (name, data) {
	        if (data === void 0) { data = null; }
	        if (this.rpc) {
	            this.rpc.callFunction.apply(this.rpc, arguments);
	        }
	    };
	    return IFrame;
	}(event_dispatcher_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = IFrame;


/***/ },
/* 11 */
/***/ function(module, exports) {

	(function (window, document, location, setTimeout, decodeURIComponent, encodeURIComponent) {
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	var global = this;
	var channelId = Math.floor(Math.random() * 10000); // randomize the initial id in case of multiple closures loaded 
	var emptyFn = Function.prototype;
	var reURI = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // returns groups for protocol (2), domain (3) and port (4) 
	var reParent = /[\-\w]+\/\.\.\//; // matches a foo/../ expression 
	var reDoubleSlash = /([^:])\/\//g; // matches // anywhere but in the protocol
	var namespace = ""; // stores namespace under which easyXDM object is stored on the page (empty if object is global)
	var easyXDM = {};
	var _easyXDM = window.easyXDM; // map over global easyXDM in case of overwrite
	var IFRAME_PREFIX = "easyXDM_";
	var HAS_NAME_PROPERTY_BUG;
	var useHash = false; // whether to use the hash over the query
	var flashVersion; // will be set if using flash
	var HAS_FLASH_THROTTLED_BUG;
	
	
	// http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
	function isHostMethod(object, property){
	    var t = typeof object[property];
	    return t == 'function' ||
	    (!!(t == 'object' && object[property])) ||
	    t == 'unknown';
	}
	
	function isHostObject(object, property){
	    return !!(typeof(object[property]) == 'object' && object[property]);
	}
	
	// end
	
	// http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	function isArray(o){
	    return Object.prototype.toString.call(o) === '[object Array]';
	}
	
	// end
	function hasFlash(){
	    var name = "Shockwave Flash", mimeType = "application/x-shockwave-flash";
	    
	    if (!undef(navigator.plugins) && typeof navigator.plugins[name] == "object") {
	        // adapted from the swfobject code
	        var description = navigator.plugins[name].description;
	        if (description && !undef(navigator.mimeTypes) && navigator.mimeTypes[mimeType] && navigator.mimeTypes[mimeType].enabledPlugin) {
	            flashVersion = description.match(/\d+/g);
	        }
	    }
	    if (!flashVersion) {
	        var flash;
	        try {
	            flash = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
	            flashVersion = Array.prototype.slice.call(flash.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
	            flash = null;
	        } 
	        catch (notSupportedException) {
	        }
	    }
	    if (!flashVersion) {
	        return false;
	    }
	    var major = parseInt(flashVersion[0], 10), minor = parseInt(flashVersion[1], 10);
	    HAS_FLASH_THROTTLED_BUG = major > 9 && minor > 0;
	    return true;
	}
	
	/*
	 * Cross Browser implementation for adding and removing event listeners.
	 */
	var on, un;
	if (isHostMethod(window, "addEventListener")) {
	    on = function(target, type, listener){
	        target.addEventListener(type, listener, false);
	    };
	    un = function(target, type, listener){
	        target.removeEventListener(type, listener, false);
	    };
	}
	else if (isHostMethod(window, "attachEvent")) {
	    on = function(object, sEvent, fpNotify){
	        object.attachEvent("on" + sEvent, fpNotify);
	    };
	    un = function(object, sEvent, fpNotify){
	        object.detachEvent("on" + sEvent, fpNotify);
	    };
	}
	else {
	    throw new Error("Browser not supported");
	}
	
	/*
	 * Cross Browser implementation of DOMContentLoaded.
	 */
	var domIsReady = false, domReadyQueue = [], readyState;
	if ("readyState" in document) {
	    // If browser is WebKit-powered, check for both 'loaded' (legacy browsers) and
	    // 'interactive' (HTML5 specs, recent WebKit builds) states.
	    // https://bugs.webkit.org/show_bug.cgi?id=45119
	    readyState = document.readyState;
	    domIsReady = readyState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (readyState == "loaded" || readyState == "interactive"));
	}
	else {
	    // If readyState is not supported in the browser, then in order to be able to fire whenReady functions apropriately
	    // when added dynamically _after_ DOM load, we have to deduce wether the DOM is ready or not.
	    // We only need a body to add elements to, so the existence of document.body is enough for us.
	    domIsReady = !!document.body;
	}
	
	function dom_onReady(){
	    if (domIsReady) {
	        return;
	    }
	    domIsReady = true;
	    for (var i = 0; i < domReadyQueue.length; i++) {
	        domReadyQueue[i]();
	    }
	    domReadyQueue.length = 0;
	}
	
	
	if (!domIsReady) {
	    if (isHostMethod(window, "addEventListener")) {
	        on(document, "DOMContentLoaded", dom_onReady);
	    }
	    else {
	        on(document, "readystatechange", function(){
	            if (document.readyState == "complete") {
	                dom_onReady();
	            }
	        });
	        if (document.documentElement.doScroll && window === top) {
	            var doScrollCheck = function(){
	                if (domIsReady) {
	                    return;
	                }
	                // http://javascript.nwbox.com/IEContentLoaded/
	                try {
	                    document.documentElement.doScroll("left");
	                } 
	                catch (e) {
	                    setTimeout(doScrollCheck, 1);
	                    return;
	                }
	                dom_onReady();
	            };
	            doScrollCheck();
	        }
	    }
	    
	    // A fallback to window.onload, that will always work
	    on(window, "load", dom_onReady);
	}
	/**
	 * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
	 * If functions are added after this event then they will be executed immediately.
	 * @param {function} fn The function to add
	 * @param {Object} scope An optional scope for the function to be called with.
	 */
	function whenReady(fn, scope){
	    if (domIsReady) {
	        fn.call(scope);
	        return;
	    }
	    domReadyQueue.push(function(){
	        fn.call(scope);
	    });
	}
	
	/**
	 * Returns an instance of easyXDM from the parent window with
	 * respect to the namespace.
	 *
	 * @return An instance of easyXDM (in the parent window)
	 */
	function getParentObject(){
	    var obj = parent;
	    if (namespace !== "") {
	        for (var i = 0, ii = namespace.split("."); i < ii.length; i++) {
	            obj = obj[ii[i]];
	        }
	    }
	    return obj.easyXDM;
	}
	
	/**
	 * Removes easyXDM variable from the global scope. It also returns control
	 * of the easyXDM variable to whatever code used it before.
	 *
	 * @param {String} ns A string representation of an object that will hold
	 *                    an instance of easyXDM.
	 * @return An instance of easyXDM
	 */
	function noConflict(ns){
	    
	    window.easyXDM = _easyXDM;
	    namespace = ns;
	    if (namespace) {
	        IFRAME_PREFIX = "easyXDM_" + namespace.replace(".", "_") + "_";
	    }
	    return easyXDM;
	}
	
	/*
	 * Methods for working with URLs
	 */
	/**
	 * Get the domain name from a url.
	 * @param {String} url The url to extract the domain from.
	 * @return The domain part of the url.
	 * @type {String}
	 */
	function getDomainName(url){
	    return url.match(reURI)[3];
	}
	
	/**
	 * Get the port for a given URL, or "" if none
	 * @param {String} url The url to extract the port from.
	 * @return The port part of the url.
	 * @type {String}
	 */
	function getPort(url){
	    return url.match(reURI)[4] || "";
	}
	
	/**
	 * Returns  a string containing the schema, domain and if present the port
	 * @param {String} url The url to extract the location from
	 * @return {String} The location part of the url
	 */
	function getLocation(url){
	    var m = url.toLowerCase().match(reURI);
	    var proto = m[2], domain = m[3], port = m[4] || "";
	    if ((proto == "http:" && port == ":80") || (proto == "https:" && port == ":443")) {
	        port = "";
	    }
	    return proto + "//" + domain + port;
	}
	
	/**
	 * Resolves a relative url into an absolute one.
	 * @param {String} url The path to resolve.
	 * @return {String} The resolved url.
	 */
	function resolveUrl(url){
	    
	    // replace all // except the one in proto with /
	    url = url.replace(reDoubleSlash, "$1/");
	    
	    // If the url is a valid url we do nothing
	    if (!url.match(/^(http||https):\/\//)) {
	        // If this is a relative path
	        var path = (url.substring(0, 1) === "/") ? "" : location.pathname;
	        if (path.substring(path.length - 1) !== "/") {
	            path = path.substring(0, path.lastIndexOf("/") + 1);
	        }
	        
	        url = location.protocol + "//" + location.host + path + url;
	    }
	    
	    // reduce all 'xyz/../' to just '' 
	    while (reParent.test(url)) {
	        url = url.replace(reParent, "");
	    }
	    
	    return url;
	}
	
	/**
	 * Appends the parameters to the given url.<br/>
	 * The base url can contain existing query parameters.
	 * @param {String} url The base url.
	 * @param {Object} parameters The parameters to add.
	 * @return {String} A new valid url with the parameters appended.
	 */
	function appendQueryParameters(url, parameters){
	    
	    var hash = "", indexOf = url.indexOf("#");
	    if (indexOf !== -1) {
	        hash = url.substring(indexOf);
	        url = url.substring(0, indexOf);
	    }
	    var q = [];
	    for (var key in parameters) {
	        if (parameters.hasOwnProperty(key)) {
	            q.push(key + "=" + encodeURIComponent(parameters[key]));
	        }
	    }
	    return url + (useHash ? "#" : (url.indexOf("?") == -1 ? "?" : "&")) + q.join("&") + hash;
	}
	
	
	// build the query object either from location.query, if it contains the xdm_e argument, or from location.hash
	var query = (function(input){
	    input = input.substring(1).split("&");
	    var data = {}, pair, i = input.length;
	    while (i--) {
	        pair = input[i].split("=");
	        data[pair[0]] = decodeURIComponent(pair[1]);
	    }
	    return data;
	}(/xdm_e=/.test(location.search) ? location.search : location.hash));
	
	/*
	 * Helper methods
	 */
	/**
	 * Helper for checking if a variable/property is undefined
	 * @param {Object} v The variable to test
	 * @return {Boolean} True if the passed variable is undefined
	 */
	function undef(v){
	    return typeof v === "undefined";
	}
	
	/**
	 * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
	 * @return {JSON} A valid JSON conforming object, or null if not found.
	 */
	var getJSON = function(){
	    var cached = {};
	    var obj = {
	        a: [1, 2, 3]
	    }, json = "{\"a\":[1,2,3]}";
	    
	    if (typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify(obj).replace((/\s/g), "") === json) {
	        // this is a working JSON instance
	        return JSON;
	    }
	    if (Object.toJSON) {
	        if (Object.toJSON(obj).replace((/\s/g), "") === json) {
	            // this is a working stringify method
	            cached.stringify = Object.toJSON;
	        }
	    }
	    
	    if (typeof String.prototype.evalJSON === "function") {
	        obj = json.evalJSON();
	        if (obj.a && obj.a.length === 3 && obj.a[2] === 3) {
	            // this is a working parse method           
	            cached.parse = function(str){
	                return str.evalJSON();
	            };
	        }
	    }
	    
	    if (cached.stringify && cached.parse) {
	        // Only memoize the result if we have valid instance
	        getJSON = function(){
	            return cached;
	        };
	        return cached;
	    }
	    return null;
	};
	
	/**
	 * Applies properties from the source object to the target object.<br/>
	 * @param {Object} target The target of the properties.
	 * @param {Object} source The source of the properties.
	 * @param {Boolean} noOverwrite Set to True to only set non-existing properties.
	 */
	function apply(destination, source, noOverwrite){
	    var member;
	    for (var prop in source) {
	        if (source.hasOwnProperty(prop)) {
	            if (prop in destination) {
	                member = source[prop];
	                if (typeof member === "object") {
	                    apply(destination[prop], member, noOverwrite);
	                }
	                else if (!noOverwrite) {
	                    destination[prop] = source[prop];
	                }
	            }
	            else {
	                destination[prop] = source[prop];
	            }
	        }
	    }
	    return destination;
	}
	
	// This tests for the bug in IE where setting the [name] property using javascript causes the value to be redirected into [submitName].
	function testForNamePropertyBug(){
	    var form = document.body.appendChild(document.createElement("form")), input = form.appendChild(document.createElement("input"));
	    input.name = IFRAME_PREFIX + "TEST" + channelId; // append channelId in order to avoid caching issues
	    HAS_NAME_PROPERTY_BUG = input !== form.elements[input.name];
	    document.body.removeChild(form);
	}
	
	/**
	 * Creates a frame and appends it to the DOM.
	 * @param config {object} This object can have the following properties
	 * <ul>
	 * <li> {object} prop The properties that should be set on the frame. This should include the 'src' property.</li>
	 * <li> {object} attr The attributes that should be set on the frame.</li>
	 * <li> {DOMElement} container Its parent element (Optional).</li>
	 * <li> {function} onLoad A method that should be called with the frames contentWindow as argument when the frame is fully loaded. (Optional)</li>
	 * </ul>
	 * @return The frames DOMElement
	 * @type DOMElement
	 */
	function createFrame(config){
	    if (undef(HAS_NAME_PROPERTY_BUG)) {
	        testForNamePropertyBug();
	    }
	    var frame;
	    // This is to work around the problems in IE6/7 with setting the name property. 
	    // Internally this is set as 'submitName' instead when using 'iframe.name = ...'
	    // This is not required by easyXDM itself, but is to facilitate other use cases 
	    if (HAS_NAME_PROPERTY_BUG) {
	        frame = document.createElement("<iframe name=\"" + config.props.name + "\"/>");
	    }
	    else {
	        frame = document.createElement("IFRAME");
	        frame.name = config.props.name;
	    }
	    
	    frame.id = frame.name = config.props.name;
	    delete config.props.name;
	    
	    if (typeof config.container == "string") {
	        config.container = document.getElementById(config.container);
	    }
	    
	    if (!config.container) {
	        // This needs to be hidden like this, simply setting display:none and the like will cause failures in some browsers.
	        apply(frame.style, {
	            position: "absolute",
	            top: "-2000px",
	            // Avoid potential horizontal scrollbar
	            left: "0px"
	        });
	        config.container = document.body;
	    }
	    
	    // HACK: IE cannot have the src attribute set when the frame is appended
	    //       into the container, so we set it to "javascript:false" as a
	    //       placeholder for now.  If we left the src undefined, it would
	    //       instead default to "about:blank", which causes SSL mixed-content
	    //       warnings in IE6 when on an SSL parent page.
	    var src = config.props.src;
	    config.props.src = "javascript:false";
	    
	    // transfer properties to the frame
	    apply(frame, config.props);
	    
	    frame.border = frame.frameBorder = 0;
	    frame.allowTransparency = true;
	    config.container.appendChild(frame);
	    
	    if (config.onLoad) {
	        on(frame, "load", config.onLoad);
	    }
	    
	    // set the frame URL to the proper value (we previously set it to
	    // "javascript:false" to work around the IE issue mentioned above)
	    if(config.usePost) {
	        var form = config.container.appendChild(document.createElement('form')), input;
	        form.target = frame.name;
	        form.action = src;
	        form.method = 'POST';
	        if (typeof(config.usePost) === 'object') {
	            for (var i in config.usePost) {
	                if (config.usePost.hasOwnProperty(i)) {
	                    if (HAS_NAME_PROPERTY_BUG) {
	                        input = document.createElement('<input name="' + i + '"/>');
	                    } else {
	                        input = document.createElement("INPUT");
	                        input.name = i;
	                    }
	                    input.value = config.usePost[i];
	                    form.appendChild(input);
	                }
	            }
	        }
	        form.submit();
	        form.parentNode.removeChild(form);
	    } else {
	        frame.src = src;
	    }
	    config.props.src = src;
	    
	    return frame;
	}
	
	/**
	 * Check whether a domain is allowed using an Access Control List.
	 * The ACL can contain * and ? as wildcards, or can be regular expressions.
	 * If regular expressions they need to begin with ^ and end with $.
	 * @param {Array/String} acl The list of allowed domains
	 * @param {String} domain The domain to test.
	 * @return {Boolean} True if the domain is allowed, false if not.
	 */
	function checkAcl(acl, domain){
	    // normalize into an array
	    if (typeof acl == "string") {
	        acl = [acl];
	    }
	    var re, i = acl.length;
	    while (i--) {
	        re = acl[i];
	        re = new RegExp(re.substr(0, 1) == "^" ? re : ("^" + re.replace(/(\*)/g, ".$1").replace(/\?/g, ".") + "$"));
	        if (re.test(domain)) {
	            return true;
	        }
	    }
	    return false;
	}
	
	/*
	 * Functions related to stacks
	 */
	/**
	 * Prepares an array of stack-elements suitable for the current configuration
	 * @param {Object} config The Transports configuration. See easyXDM.Socket for more.
	 * @return {Array} An array of stack-elements with the TransportElement at index 0.
	 */
	function prepareTransportStack(config){
	    var protocol = config.protocol, stackEls;
	    config.isHost = config.isHost || undef(query.xdm_p);
	    useHash = config.hash || false;
	    
	    if (!config.props) {
	        config.props = {};
	    }
	    if (!config.isHost) {
	        config.channel = query.xdm_c.replace(/["'<>\\]/g, "");
	        config.secret = query.xdm_s;
	        config.remote = query.xdm_e.replace(/["'<>\\]/g, "");
	        ;
	        protocol = query.xdm_p;
	        if (config.acl && !checkAcl(config.acl, config.remote)) {
	            throw new Error("Access denied for " + config.remote);
	        }
	    }
	    else {
	        config.remote = resolveUrl(config.remote);
	        config.channel = config.channel || "default" + channelId++;
	        config.secret = Math.random().toString(16).substring(2);
	        if (undef(protocol)) {
	            if (getLocation(location.href) == getLocation(config.remote)) {
	                /*
	                 * Both documents has the same origin, lets use direct access.
	                 */
	                protocol = "4";
	            }
	            else if (isHostMethod(window, "postMessage") || isHostMethod(document, "postMessage")) {
	                /*
	                 * This is supported in IE8+, Firefox 3+, Opera 9+, Chrome 2+ and Safari 4+
	                 */
	                protocol = "1";
	            }
	            else if (config.swf && isHostMethod(window, "ActiveXObject") && hasFlash()) {
	                /*
	                 * The Flash transport superseedes the NixTransport as the NixTransport has been blocked by MS
	                 */
	                protocol = "6";
	            }
	            else if (navigator.product === "Gecko" && "frameElement" in window && navigator.userAgent.indexOf('WebKit') == -1) {
	                /*
	                 * This is supported in Gecko (Firefox 1+)
	                 */
	                protocol = "5";
	            }
	            else if (config.remoteHelper) {
	                /*
	                 * This is supported in all browsers that retains the value of window.name when
	                 * navigating from one domain to another, and where parent.frames[foo] can be used
	                 * to get access to a frame from the same domain
	                 */
	                protocol = "2";
	            }
	            else {
	                /*
	                 * This is supported in all browsers where [window].location is writable for all
	                 * The resize event will be used if resize is supported and the iframe is not put
	                 * into a container, else polling will be used.
	                 */
	                protocol = "0";
	            }
	        }
	    }
	    config.protocol = protocol; // for conditional branching
	    switch (protocol) {
	        case "0":// 0 = HashTransport
	            apply(config, {
	                interval: 100,
	                delay: 2000,
	                useResize: true,
	                useParent: false,
	                usePolling: false
	            }, true);
	            if (config.isHost) {
	                if (!config.local) {
	                    // If no local is set then we need to find an image hosted on the current domain
	                    var domain = location.protocol + "//" + location.host, images = document.body.getElementsByTagName("img"), image;
	                    var i = images.length;
	                    while (i--) {
	                        image = images[i];
	                        if (image.src.substring(0, domain.length) === domain) {
	                            config.local = image.src;
	                            break;
	                        }
	                    }
	                    if (!config.local) {
	                        // If no local was set, and we are unable to find a suitable file, then we resort to using the current window 
	                        config.local = window;
	                    }
	                }
	                
	                var parameters = {
	                    xdm_c: config.channel,
	                    xdm_p: 0
	                };
	                
	                if (config.local === window) {
	                    // We are using the current window to listen to
	                    config.usePolling = true;
	                    config.useParent = true;
	                    config.local = location.protocol + "//" + location.host + location.pathname + location.search;
	                    parameters.xdm_e = config.local;
	                    parameters.xdm_pa = 1; // use parent
	                }
	                else {
	                    parameters.xdm_e = resolveUrl(config.local);
	                }
	                
	                if (config.container) {
	                    config.useResize = false;
	                    parameters.xdm_po = 1; // use polling
	                }
	                config.remote = appendQueryParameters(config.remote, parameters);
	            }
	            else {
	                apply(config, {
	                    channel: query.xdm_c,
	                    remote: query.xdm_e,
	                    useParent: !undef(query.xdm_pa),
	                    usePolling: !undef(query.xdm_po),
	                    useResize: config.useParent ? false : config.useResize
	                });
	            }
	            stackEls = [new easyXDM.stack.HashTransport(config), new easyXDM.stack.ReliableBehavior({}), new easyXDM.stack.QueueBehavior({
	                encode: true,
	                maxLength: 4000 - config.remote.length
	            }), new easyXDM.stack.VerifyBehavior({
	                initiate: config.isHost
	            })];
	            break;
	        case "1":
	            stackEls = [new easyXDM.stack.PostMessageTransport(config)];
	            break;
	        case "2":
	            if (config.isHost) {
	                config.remoteHelper = resolveUrl(config.remoteHelper);
	            }
	            stackEls = [new easyXDM.stack.NameTransport(config), new easyXDM.stack.QueueBehavior(), new easyXDM.stack.VerifyBehavior({
	                initiate: config.isHost
	            })];
	            break;
	        case "3":
	            stackEls = [new easyXDM.stack.NixTransport(config)];
	            break;
	        case "4":
	            stackEls = [new easyXDM.stack.SameOriginTransport(config)];
	            break;
	        case "5":
	            stackEls = [new easyXDM.stack.FrameElementTransport(config)];
	            break;
	        case "6":
	            if (!flashVersion) {
	                hasFlash();
	            }
	            stackEls = [new easyXDM.stack.FlashTransport(config)];
	            break;
	    }
	    // this behavior is responsible for buffering outgoing messages, and for performing lazy initialization
	    stackEls.push(new easyXDM.stack.QueueBehavior({
	        lazy: config.lazy,
	        remove: true
	    }));
	    return stackEls;
	}
	
	/**
	 * Chains all the separate stack elements into a single usable stack.<br/>
	 * If an element is missing a necessary method then it will have a pass-through method applied.
	 * @param {Array} stackElements An array of stack elements to be linked.
	 * @return {easyXDM.stack.StackElement} The last element in the chain.
	 */
	function chainStack(stackElements){
	    var stackEl, defaults = {
	        incoming: function(message, origin){
	            this.up.incoming(message, origin);
	        },
	        outgoing: function(message, recipient){
	            this.down.outgoing(message, recipient);
	        },
	        callback: function(success){
	            this.up.callback(success);
	        },
	        init: function(){
	            this.down.init();
	        },
	        destroy: function(){
	            this.down.destroy();
	        }
	    };
	    for (var i = 0, len = stackElements.length; i < len; i++) {
	        stackEl = stackElements[i];
	        apply(stackEl, defaults, true);
	        if (i !== 0) {
	            stackEl.down = stackElements[i - 1];
	        }
	        if (i !== len - 1) {
	            stackEl.up = stackElements[i + 1];
	        }
	    }
	    return stackEl;
	}
	
	/**
	 * This will remove a stackelement from its stack while leaving the stack functional.
	 * @param {Object} element The elment to remove from the stack.
	 */
	function removeFromStack(element){
	    element.up.down = element.down;
	    element.down.up = element.up;
	    element.up = element.down = null;
	}
	
	/*
	 * Export the main object and any other methods applicable
	 */
	/** 
	 * @class easyXDM
	 * A javascript library providing cross-browser, cross-domain messaging/RPC.
	 * @version 2.4.19
	 * @singleton
	 */
	apply(easyXDM, {
	    /**
	     * The version of the library
	     * @type {string}
	     */
	    version: "2.4.19",
	    /**
	     * This is a map containing all the query parameters passed to the document.
	     * All the values has been decoded using decodeURIComponent.
	     * @type {object}
	     */
	    query: query,
	    /**
	     * @private
	     */
	    stack: {},
	    /**
	     * Applies properties from the source object to the target object.<br/>
	     * @param {object} target The target of the properties.
	     * @param {object} source The source of the properties.
	     * @param {boolean} noOverwrite Set to True to only set non-existing properties.
	     */
	    apply: apply,
	    
	    /**
	     * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
	     * @return {JSON} A valid JSON conforming object, or null if not found.
	     */
	    getJSONObject: getJSON,
	    /**
	     * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
	     * If functions are added after this event then they will be executed immediately.
	     * @param {function} fn The function to add
	     * @param {object} scope An optional scope for the function to be called with.
	     */
	    whenReady: whenReady,
	    /**
	     * Removes easyXDM variable from the global scope. It also returns control
	     * of the easyXDM variable to whatever code used it before.
	     *
	     * @param {String} ns A string representation of an object that will hold
	     *                    an instance of easyXDM.
	     * @return An instance of easyXDM
	     */
	    noConflict: noConflict
	});
	
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global console, _FirebugCommandLine,  easyXDM, window, escape, unescape, isHostObject, undef, _trace, domIsReady, emptyFn, namespace */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, isHostObject, isHostMethod, un, on, createFrame, debug */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/** 
	 * @class easyXDM.DomHelper
	 * Contains methods for dealing with the DOM
	 * @singleton
	 */
	easyXDM.DomHelper = {
	    /**
	     * Provides a consistent interface for adding eventhandlers
	     * @param {Object} target The target to add the event to
	     * @param {String} type The name of the event
	     * @param {Function} listener The listener
	     */
	    on: on,
	    /**
	     * Provides a consistent interface for removing eventhandlers
	     * @param {Object} target The target to remove the event from
	     * @param {String} type The name of the event
	     * @param {Function} listener The listener
	     */
	    un: un,
	    /**
	     * Checks for the presence of the JSON object.
	     * If it is not present it will use the supplied path to load the JSON2 library.
	     * This should be called in the documents head right after the easyXDM script tag.
	     * http://json.org/json2.js
	     * @param {String} path A valid path to json2.js
	     */
	    requiresJSON: function(path){
	        if (!isHostObject(window, "JSON")) {
	            // we need to encode the < in order to avoid an illegal token error
	            // when the script is inlined in a document.
	            document.write('<' + 'script type="text/javascript" src="' + path + '"><' + '/script>');
	        }
	    }
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, debug */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	(function(){
	    // The map containing the stored functions
	    var _map = {};
	    
	    /**
	     * @class easyXDM.Fn
	     * This contains methods related to function handling, such as storing callbacks.
	     * @singleton
	     * @namespace easyXDM
	     */
	    easyXDM.Fn = {
	        /**
	         * Stores a function using the given name for reference
	         * @param {String} name The name that the function should be referred by
	         * @param {Function} fn The function to store
	         * @namespace easyXDM.fn
	         */
	        set: function(name, fn){
	            _map[name] = fn;
	        },
	        /**
	         * Retrieves the function referred to by the given name
	         * @param {String} name The name of the function to retrieve
	         * @param {Boolean} del If the function should be deleted after retrieval
	         * @return {Function} The stored function
	         * @namespace easyXDM.fn
	         */
	        get: function(name, del){
	            if (!_map.hasOwnProperty(name)) {
	                return;
	            }
	            var fn = _map[name];
	            
	            if (del) {
	                delete _map[name];
	            }
	            return fn;
	        }
	    };
	    
	}());
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, chainStack, prepareTransportStack, getLocation, debug */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.Socket
	 * This class creates a transport channel between two domains that is usable for sending and receiving string-based messages.<br/>
	 * The channel is reliable, supports queueing, and ensures that the message originates from the expected domain.<br/>
	 * Internally different stacks will be used depending on the browsers features and the available parameters.
	 * <h2>How to set up</h2>
	 * Setting up the provider:
	 * <pre><code>
	 * var socket = new easyXDM.Socket({
	 * &nbsp; local: "name.html",
	 * &nbsp; onReady: function(){
	 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
	 * &nbsp; &nbsp; socket.postMessage("foo-message");
	 * &nbsp; },
	 * &nbsp; onMessage: function(message, origin) {
	 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
	 * &nbsp; }
	 * });
	 * </code></pre>
	 * Setting up the consumer:
	 * <pre><code>
	 * var socket = new easyXDM.Socket({
	 * &nbsp; remote: "http:&#47;&#47;remotedomain/page.html",
	 * &nbsp; remoteHelper: "http:&#47;&#47;remotedomain/name.html",
	 * &nbsp; onReady: function(){
	 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
	 * &nbsp; &nbsp; socket.postMessage("foo-message");
	 * &nbsp; },
	 * &nbsp; onMessage: function(message, origin) {
	 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
	 * &nbsp; }
	 * });
	 * </code></pre>
	 * If you are unable to upload the <code>name.html</code> file to the consumers domain then remove the <code>remoteHelper</code> property
	 * and easyXDM will fall back to using the HashTransport instead of the NameTransport when not able to use any of the primary transports.
	 * @namespace easyXDM
	 * @constructor
	 * @cfg {String/Window} local The url to the local name.html document, a local static file, or a reference to the local window.
	 * @cfg {Boolean} lazy (Consumer only) Set this to true if you want easyXDM to defer creating the transport until really needed. 
	 * @cfg {String} remote (Consumer only) The url to the providers document.
	 * @cfg {String} remoteHelper (Consumer only) The url to the remote name.html file. This is to support NameTransport as a fallback. Optional.
	 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.  Optional, defaults to 2000.
	 * @cfg {Number} interval The interval used when polling for messages. Optional, defaults to 300.
	 * @cfg {String} channel (Consumer only) The name of the channel to use. Can be used to set consistent iframe names. Must be unique. Optional.
	 * @cfg {Function} onMessage The method that should handle incoming messages.<br/> This method should accept two arguments, the message as a string, and the origin as a string. Optional.
	 * @cfg {Function} onReady A method that should be called when the transport is ready. Optional.
	 * @cfg {DOMElement|String} container (Consumer only) The element, or the id of the element that the primary iframe should be inserted into. If not set then the iframe will be positioned off-screen. Optional.
	 * @cfg {Array/String} acl (Provider only) Here you can specify which '[protocol]://[domain]' patterns that should be allowed to act as the consumer towards this provider.<br/>
	 * This can contain the wildcards ? and *.  Examples are 'http://example.com', '*.foo.com' and '*dom?.com'. If you want to use reqular expressions then you pattern needs to start with ^ and end with $.
	 * If none of the patterns match an Error will be thrown.  
	 * @cfg {Object} props (Consumer only) Additional properties that should be applied to the iframe. This can also contain nested objects e.g: <code>{style:{width:"100px", height:"100px"}}</code>. 
	 * Properties such as 'name' and 'src' will be overrided. Optional.
	 */
	easyXDM.Socket = function(config){
	    
	    // create the stack
	    var stack = chainStack(prepareTransportStack(config).concat([{
	        incoming: function(message, origin){
	            config.onMessage(message, origin);
	        },
	        callback: function(success){
	            if (config.onReady) {
	                config.onReady(success);
	            }
	        }
	    }])), recipient = getLocation(config.remote);
	    
	    // set the origin
	    this.origin = getLocation(config.remote);
		
	    /**
	     * Initiates the destruction of the stack.
	     */
	    this.destroy = function(){
	        stack.destroy();
	    };
	    
	    /**
	     * Posts a message to the remote end of the channel
	     * @param {String} message The message to send
	     */
	    this.postMessage = function(message){
	        stack.outgoing(message, recipient);
	    };
	    
	    stack.init();
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, undef,, chainStack, prepareTransportStack, debug, getLocation */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/** 
	 * @class easyXDM.Rpc
	 * Creates a proxy object that can be used to call methods implemented on the remote end of the channel, and also to provide the implementation
	 * of methods to be called from the remote end.<br/>
	 * The instantiated object will have methods matching those specified in <code>config.remote</code>.<br/>
	 * This requires the JSON object present in the document, either natively, using json.org's json2 or as a wrapper around library spesific methods.
	 * <h2>How to set up</h2>
	 * <pre><code>
	 * var rpc = new easyXDM.Rpc({
	 * &nbsp; &#47;&#47; this configuration is equal to that used by the Socket.
	 * &nbsp; remote: "http:&#47;&#47;remotedomain/...",
	 * &nbsp; onReady: function(){
	 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the proxy
	 * &nbsp; &nbsp; rpc.foo(...
	 * &nbsp; }
	 * },{
	 * &nbsp; local: {..},
	 * &nbsp; remote: {..}
	 * });
	 * </code></pre>
	 * 
	 * <h2>Exposing functions (procedures)</h2>
	 * <pre><code>
	 * var rpc = new easyXDM.Rpc({
	 * &nbsp; ...
	 * },{
	 * &nbsp; local: {
	 * &nbsp; &nbsp; nameOfMethod: {
	 * &nbsp; &nbsp; &nbsp; method: function(arg1, arg2, success, error){
	 * &nbsp; &nbsp; &nbsp; &nbsp; ...
	 * &nbsp; &nbsp; &nbsp; }
	 * &nbsp; &nbsp; },
	 * &nbsp; &nbsp; &#47;&#47; with shorthand notation 
	 * &nbsp; &nbsp; nameOfAnotherMethod:  function(arg1, arg2, success, error){
	 * &nbsp; &nbsp; }
	 * &nbsp; },
	 * &nbsp; remote: {...}
	 * });
	 * </code></pre>
	
	 * The function referenced by  [method] will receive the passed arguments followed by the callback functions <code>success</code> and <code>error</code>.<br/>
	 * To send a successfull result back you can use
	 *     <pre><code>
	 *     return foo;
	 *     </pre></code>
	 * or
	 *     <pre><code>
	 *     success(foo);
	 *     </pre></code>
	 *  To return an error you can use
	 *     <pre><code>
	 *     throw new Error("foo error");
	 *     </code></pre>
	 * or
	 *     <pre><code>
	 *     error("foo error");
	 *     </code></pre>
	 *
	 * <h2>Defining remotely exposed methods (procedures/notifications)</h2>
	 * The definition of the remote end is quite similar:
	 * <pre><code>
	 * var rpc = new easyXDM.Rpc({
	 * &nbsp; ...
	 * },{
	 * &nbsp; local: {...},
	 * &nbsp; remote: {
	 * &nbsp; &nbsp; nameOfMethod: {}
	 * &nbsp; }
	 * });
	 * </code></pre>
	 * To call a remote method use
	 * <pre><code>
	 * rpc.nameOfMethod("arg1", "arg2", function(value) {
	 * &nbsp; alert("success: " + value);
	 * }, function(message) {
	 * &nbsp; alert("error: " + message + );
	 * });
	 * </code></pre>
	 * Both the <code>success</code> and <code>errror</code> callbacks are optional.<br/>
	 * When called with no callback a JSON-RPC 2.0 notification will be executed.
	 * Be aware that you will not be notified of any errors with this method.
	 * <br/>
	 * <h2>Specifying a custom serializer</h2>
	 * If you do not want to use the JSON2 library for non-native JSON support, but instead capabilities provided by some other library
	 * then you can specify a custom serializer using <code>serializer: foo</code>
	 * <pre><code>
	 * var rpc = new easyXDM.Rpc({
	 * &nbsp; ...
	 * },{
	 * &nbsp; local: {...},
	 * &nbsp; remote: {...},
	 * &nbsp; serializer : {
	 * &nbsp; &nbsp; parse: function(string){ ... },
	 * &nbsp; &nbsp; stringify: function(object) {...}
	 * &nbsp; }
	 * });
	 * </code></pre>
	 * If <code>serializer</code> is set then the class will not attempt to use the native implementation.
	 * @namespace easyXDM
	 * @constructor
	 * @param {Object} config The underlying transports configuration. See easyXDM.Socket for available parameters.
	 * @param {Object} jsonRpcConfig The description of the interface to implement.
	 */
	easyXDM.Rpc = function(config, jsonRpcConfig){
	    
	    // expand shorthand notation
	    if (jsonRpcConfig.local) {
	        for (var method in jsonRpcConfig.local) {
	            if (jsonRpcConfig.local.hasOwnProperty(method)) {
	                var member = jsonRpcConfig.local[method];
	                if (typeof member === "function") {
	                    jsonRpcConfig.local[method] = {
	                        method: member
	                    };
	                }
	            }
	        }
	    }
		
	    // create the stack
	    var stack = chainStack(prepareTransportStack(config).concat([new easyXDM.stack.RpcBehavior(this, jsonRpcConfig), {
	        callback: function(success){
	            if (config.onReady) {
	                config.onReady(success);
	            }
	        }
	    }]));
		
	    // set the origin 
	    this.origin = getLocation(config.remote);
		
	    
	    /**
	     * Initiates the destruction of the stack.
	     */
	    this.destroy = function(){
	        stack.destroy();
	    };
	    
	    stack.init();
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, getParentObject, IFRAME_PREFIX*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.SameOriginTransport
	 * SameOriginTransport is a transport class that can be used when both domains have the same origin.<br/>
	 * This can be useful for testing and for when the main application supports both internal and external sources.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String} remote The remote document to communicate with.
	 */
	easyXDM.stack.SameOriginTransport = function(config){
	    var pub, frame, send, targetOrigin;
	    
	    return (pub = {
	        outgoing: function(message, domain, fn){
	            send(message);
	            if (fn) {
	                fn();
	            }
	        },
	        destroy: function(){
	            if (frame) {
	                frame.parentNode.removeChild(frame);
	                frame = null;
	            }
	        },
	        onDOMReady: function(){
	            targetOrigin = getLocation(config.remote);
	            
	            if (config.isHost) {
	                // set up the iframe
	                apply(config.props, {
	                    src: appendQueryParameters(config.remote, {
	                        xdm_e: location.protocol + "//" + location.host + location.pathname,
	                        xdm_c: config.channel,
	                        xdm_p: 4 // 4 = SameOriginTransport
	                    }),
	                    name: IFRAME_PREFIX + config.channel + "_provider"
	                });
	                frame = createFrame(config);
	                easyXDM.Fn.set(config.channel, function(sendFn){
	                    send = sendFn;
	                    setTimeout(function(){
	                        pub.up.callback(true);
	                    }, 0);
	                    return function(msg){
	                        pub.up.incoming(msg, targetOrigin);
	                    };
	                });
	            }
	            else {
	                send = getParentObject().Fn.get(config.channel, true)(function(msg){
	                    pub.up.incoming(msg, targetOrigin);
	                });
	                setTimeout(function(){
	                    pub.up.callback(true);
	                }, 0);
	            }
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global global, easyXDM, window, getLocation, appendQueryParameters, createFrame, debug, apply, whenReady, IFRAME_PREFIX, namespace, resolveUrl, getDomainName, HAS_FLASH_THROTTLED_BUG, getPort, query*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.FlashTransport
	 * FlashTransport is a transport class that uses an SWF with LocalConnection to pass messages back and forth.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String} remote The remote domain to communicate with.
	 * @cfg {String} secret the pre-shared secret used to secure the communication.
	 * @cfg {String} swf The path to the swf file
	 * @cfg {Boolean} swfNoThrottle Set this to true if you want to take steps to avoid beeing throttled when hidden.
	 * @cfg {String || DOMElement} swfContainer Set this if you want to control where the swf is placed
	 */
	easyXDM.stack.FlashTransport = function(config){
	    var pub, // the public interface
	 frame, send, targetOrigin, swf, swfContainer;
	    
	    function onMessage(message, origin){
	        setTimeout(function(){
	            pub.up.incoming(message, targetOrigin);
	        }, 0);
	    }
	    
	    /**
	     * This method adds the SWF to the DOM and prepares the initialization of the channel
	     */
	    function addSwf(domain){
	        // the differentiating query argument is needed in Flash9 to avoid a caching issue where LocalConnection would throw an error.
	        var url = config.swf + "?host=" + config.isHost;
	        var id = "easyXDM_swf_" + Math.floor(Math.random() * 10000);
	        
	        // prepare the init function that will fire once the swf is ready
	        easyXDM.Fn.set("flash_loaded" + domain.replace(/[\-.]/g, "_"), function(){
	            easyXDM.stack.FlashTransport[domain].swf = swf = swfContainer.firstChild;
	            var queue = easyXDM.stack.FlashTransport[domain].queue;
	            for (var i = 0; i < queue.length; i++) {
	                queue[i]();
	            }
	            queue.length = 0;
	        });
	        
	        if (config.swfContainer) {
	            swfContainer = (typeof config.swfContainer == "string") ? document.getElementById(config.swfContainer) : config.swfContainer;
	        }
	        else {
	            // create the container that will hold the swf
	            swfContainer = document.createElement('div');
	            
	            // http://bugs.adobe.com/jira/browse/FP-4796
	            // http://tech.groups.yahoo.com/group/flexcoders/message/162365
	            // https://groups.google.com/forum/#!topic/easyxdm/mJZJhWagoLc
	            apply(swfContainer.style, HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle ? {
	                height: "20px",
	                width: "20px",
	                position: "fixed",
	                right: 0,
	                top: 0
	            } : {
	                height: "1px",
	                width: "1px",
	                position: "absolute",
	                overflow: "hidden",
	                right: 0,
	                top: 0
	            });
	            document.body.appendChild(swfContainer);
	        }
	        
	        // create the object/embed
	        var flashVars = "callback=flash_loaded" + encodeURIComponent(domain.replace(/[\-.]/g, "_"))
	            + "&proto=" + global.location.protocol
	            + "&domain=" + encodeURIComponent(getDomainName(global.location.href))
	            + "&port=" + encodeURIComponent(getPort(global.location.href))
	            + "&ns=" + encodeURIComponent(namespace);
	        swfContainer.innerHTML = "<object height='20' width='20' type='application/x-shockwave-flash' id='" + id + "' data='" + url + "'>" +
	        "<param name='allowScriptAccess' value='always'></param>" +
	        "<param name='wmode' value='transparent'>" +
	        "<param name='movie' value='" +
	        url +
	        "'></param>" +
	        "<param name='flashvars' value='" +
	        flashVars +
	        "'></param>" +
	        "<embed type='application/x-shockwave-flash' FlashVars='" +
	        flashVars +
	        "' allowScriptAccess='always' wmode='transparent' src='" +
	        url +
	        "' height='1' width='1'></embed>" +
	        "</object>";
	    }
	    
	    return (pub = {
	        outgoing: function(message, domain, fn){
	            swf.postMessage(config.channel, message.toString());
	            if (fn) {
	                fn();
	            }
	        },
	        destroy: function(){
	            try {
	                swf.destroyChannel(config.channel);
	            } 
	            catch (e) {
	            }
	            swf = null;
	            if (frame) {
	                frame.parentNode.removeChild(frame);
	                frame = null;
	            }
	        },
	        onDOMReady: function(){
	            
	            targetOrigin = config.remote;
	            
	            // Prepare the code that will be run after the swf has been intialized
	            easyXDM.Fn.set("flash_" + config.channel + "_init", function(){
	                setTimeout(function(){
	                    pub.up.callback(true);
	                });
	            });
	            
	            // set up the omMessage handler
	            easyXDM.Fn.set("flash_" + config.channel + "_onMessage", onMessage);
	            
	            config.swf = resolveUrl(config.swf); // reports have been made of requests gone rogue when using relative paths
	            var swfdomain = getDomainName(config.swf);
	            var fn = function(){
	                // set init to true in case the fn was called was invoked from a separate instance
	                easyXDM.stack.FlashTransport[swfdomain].init = true;
	                swf = easyXDM.stack.FlashTransport[swfdomain].swf;
	                // create the channel
	                swf.createChannel(config.channel, config.secret, getLocation(config.remote), config.isHost);
	                
	                if (config.isHost) {
	                    // if Flash is going to be throttled and we want to avoid this
	                    if (HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle) {
	                        apply(config.props, {
	                            position: "fixed",
	                            right: 0,
	                            top: 0,
	                            height: "20px",
	                            width: "20px"
	                        });
	                    }
	                    // set up the iframe
	                    apply(config.props, {
	                        src: appendQueryParameters(config.remote, {
	                            xdm_e: getLocation(location.href),
	                            xdm_c: config.channel,
	                            xdm_p: 6, // 6 = FlashTransport
	                            xdm_s: config.secret
	                        }),
	                        name: IFRAME_PREFIX + config.channel + "_provider"
	                    });
	                    frame = createFrame(config);
	                }
	            };
	            
	            if (easyXDM.stack.FlashTransport[swfdomain] && easyXDM.stack.FlashTransport[swfdomain].init) {
	                // if the swf is in place and we are the consumer
	                fn();
	            }
	            else {
	                // if the swf does not yet exist
	                if (!easyXDM.stack.FlashTransport[swfdomain]) {
	                    // add the queue to hold the init fn's
	                    easyXDM.stack.FlashTransport[swfdomain] = {
	                        queue: [fn]
	                    };
	                    addSwf(swfdomain);
	                }
	                else {
	                    easyXDM.stack.FlashTransport[swfdomain].queue.push(fn);
	                }
	            }
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.PostMessageTransport
	 * PostMessageTransport is a transport class that uses HTML5 postMessage for communication.<br/>
	 * <a href="http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx">http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx</a><br/>
	 * <a href="https://developer.mozilla.org/en/DOM/window.postMessage">https://developer.mozilla.org/en/DOM/window.postMessage</a>
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String} remote The remote domain to communicate with.
	 */
	easyXDM.stack.PostMessageTransport = function(config){
	    var pub, // the public interface
	 frame, // the remote frame, if any
	 callerWindow, // the window that we will call with
	 targetOrigin; // the domain to communicate with
	    /**
	     * Resolves the origin from the event object
	     * @private
	     * @param {Object} event The messageevent
	     * @return {String} The scheme, host and port of the origin
	     */
	    function _getOrigin(event){
	        if (event.origin) {
	            // This is the HTML5 property
	            return getLocation(event.origin);
	        }
	        if (event.uri) {
	            // From earlier implementations 
	            return getLocation(event.uri);
	        }
	        if (event.domain) {
	            // This is the last option and will fail if the 
	            // origin is not using the same schema as we are
	            return location.protocol + "//" + event.domain;
	        }
	        throw "Unable to retrieve the origin of the event";
	    }
	    
	    /**
	     * This is the main implementation for the onMessage event.<br/>
	     * It checks the validity of the origin and passes the message on if appropriate.
	     * @private
	     * @param {Object} event The messageevent
	     */
	    function _window_onMessage(event){
	        var origin = _getOrigin(event);
	        if (origin == targetOrigin && event.data.substring(0, config.channel.length + 1) == config.channel + " ") {
	            pub.up.incoming(event.data.substring(config.channel.length + 1), origin);
	        }
	    }
	    
	    return (pub = {
	        outgoing: function(message, domain, fn){
	            callerWindow.postMessage(config.channel + " " + message, domain || targetOrigin);
	            if (fn) {
	                fn();
	            }
	        },
	        destroy: function(){
	            un(window, "message", _window_onMessage);
	            if (frame) {
	                callerWindow = null;
	                frame.parentNode.removeChild(frame);
	                frame = null;
	            }
	        },
	        onDOMReady: function(){
	            targetOrigin = getLocation(config.remote);
	            if (config.isHost) {
	                // add the event handler for listening
	                var waitForReady = function(event){  
	                    if (event.data == config.channel + "-ready") {
	                        // replace the eventlistener
	                        callerWindow = ("postMessage" in frame.contentWindow) ? frame.contentWindow : frame.contentWindow.document;
	                        un(window, "message", waitForReady);
	                        on(window, "message", _window_onMessage);
	                        setTimeout(function(){
	                            pub.up.callback(true);
	                        }, 0);
	                    }
	                };
	                on(window, "message", waitForReady);
	                
	                // set up the iframe
	                apply(config.props, {
	                    src: appendQueryParameters(config.remote, {
	                        xdm_e: getLocation(location.href),
	                        xdm_c: config.channel,
	                        xdm_p: 1 // 1 = PostMessage
	                    }),
	                    name: IFRAME_PREFIX + config.channel + "_provider"
	                });
	                frame = createFrame(config);
	            }
	            else {
	                // add the event handler for listening
	                on(window, "message", _window_onMessage);
	                callerWindow = ("postMessage" in window.parent) ? window.parent : window.parent.document;
	                callerWindow.postMessage(config.channel + "-ready", targetOrigin);
	                
	                setTimeout(function(){
	                    pub.up.callback(true);
	                }, 0);
	            }
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, apply, query, whenReady, IFRAME_PREFIX*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.FrameElementTransport
	 * FrameElementTransport is a transport class that can be used with Gecko-browser as these allow passing variables using the frameElement property.<br/>
	 * Security is maintained as Gecho uses Lexical Authorization to determine under which scope a function is running.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String} remote The remote document to communicate with.
	 */
	easyXDM.stack.FrameElementTransport = function(config){
	    var pub, frame, send, targetOrigin;
	    
	    return (pub = {
	        outgoing: function(message, domain, fn){
	            send.call(this, message);
	            if (fn) {
	                fn();
	            }
	        },
	        destroy: function(){
	            if (frame) {
	                frame.parentNode.removeChild(frame);
	                frame = null;
	            }
	        },
	        onDOMReady: function(){
	            targetOrigin = getLocation(config.remote);
	            
	            if (config.isHost) {
	                // set up the iframe
	                apply(config.props, {
	                    src: appendQueryParameters(config.remote, {
	                        xdm_e: getLocation(location.href),
	                        xdm_c: config.channel,
	                        xdm_p: 5 // 5 = FrameElementTransport
	                    }),
	                    name: IFRAME_PREFIX + config.channel + "_provider"
	                });
	                frame = createFrame(config);
	                frame.fn = function(sendFn){
	                    delete frame.fn;
	                    send = sendFn;
	                    setTimeout(function(){
	                        pub.up.callback(true);
	                    }, 0);
	                    // remove the function so that it cannot be used to overwrite the send function later on
	                    return function(msg){
	                        pub.up.incoming(msg, targetOrigin);
	                    };
	                };
	            }
	            else {
	                // This is to mitigate origin-spoofing
	                if (document.referrer && getLocation(document.referrer) != query.xdm_e) {
	                    window.top.location = query.xdm_e;
	                }
	                send = window.frameElement.fn(function(msg){
	                    pub.up.incoming(msg, targetOrigin);
	                });
	                pub.up.callback(true);
	            }
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, undef, getLocation, appendQueryParameters, resolveUrl, createFrame, debug, un, apply, whenReady, IFRAME_PREFIX*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.NameTransport
	 * NameTransport uses the window.name property to relay data.
	 * The <code>local</code> parameter needs to be set on both the consumer and provider,<br/>
	 * and the <code>remoteHelper</code> parameter needs to be set on the consumer.
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String} remoteHelper The url to the remote instance of hash.html - this is only needed for the host.
	 * @namespace easyXDM.stack
	 */
	easyXDM.stack.NameTransport = function(config){
	    
	    var pub; // the public interface
	    var isHost, callerWindow, remoteWindow, readyCount, callback, remoteOrigin, remoteUrl;
	    
	    function _sendMessage(message){
	        var url = config.remoteHelper + (isHost ? "#_3" : "#_2") + config.channel;
	        callerWindow.contentWindow.sendMessage(message, url);
	    }
	    
	    function _onReady(){
	        if (isHost) {
	            if (++readyCount === 2 || !isHost) {
	                pub.up.callback(true);
	            }
	        }
	        else {
	            _sendMessage("ready");
	            pub.up.callback(true);
	        }
	    }
	    
	    function _onMessage(message){
	        pub.up.incoming(message, remoteOrigin);
	    }
	    
	    function _onLoad(){
	        if (callback) {
	            setTimeout(function(){
	                callback(true);
	            }, 0);
	        }
	    }
	    
	    return (pub = {
	        outgoing: function(message, domain, fn){
	            callback = fn;
	            _sendMessage(message);
	        },
	        destroy: function(){
	            callerWindow.parentNode.removeChild(callerWindow);
	            callerWindow = null;
	            if (isHost) {
	                remoteWindow.parentNode.removeChild(remoteWindow);
	                remoteWindow = null;
	            }
	        },
	        onDOMReady: function(){
	            isHost = config.isHost;
	            readyCount = 0;
	            remoteOrigin = getLocation(config.remote);
	            config.local = resolveUrl(config.local);
	            
	            if (isHost) {
	                // Register the callback
	                easyXDM.Fn.set(config.channel, function(message){
	                    if (isHost && message === "ready") {
	                        // Replace the handler
	                        easyXDM.Fn.set(config.channel, _onMessage);
	                        _onReady();
	                    }
	                });
	                
	                // Set up the frame that points to the remote instance
	                remoteUrl = appendQueryParameters(config.remote, {
	                    xdm_e: config.local,
	                    xdm_c: config.channel,
	                    xdm_p: 2
	                });
	                apply(config.props, {
	                    src: remoteUrl + '#' + config.channel,
	                    name: IFRAME_PREFIX + config.channel + "_provider"
	                });
	                remoteWindow = createFrame(config);
	            }
	            else {
	                config.remoteHelper = config.remote;
	                easyXDM.Fn.set(config.channel, _onMessage);
	            }
	            
	            // Set up the iframe that will be used for the transport
	            var onLoad = function(){
	                // Remove the handler
	                var w = callerWindow || this;
	                un(w, "load", onLoad);
	                easyXDM.Fn.set(config.channel + "_load", _onLoad);
	                (function test(){
	                    if (typeof w.contentWindow.sendMessage == "function") {
	                        _onReady();
	                    }
	                    else {
	                        setTimeout(test, 50);
	                    }
	                }());
	            };
	            
	            callerWindow = createFrame({
	                props: {
	                    src: config.local + "#_4" + config.channel
	                },
	                onLoad: onLoad
	            });
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, getLocation, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.HashTransport
	 * HashTransport is a transport class that uses the IFrame URL Technique for communication.<br/>
	 * <a href="http://msdn.microsoft.com/en-us/library/bb735305.aspx">http://msdn.microsoft.com/en-us/library/bb735305.aspx</a><br/>
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The transports configuration.
	 * @cfg {String/Window} local The url to the local file used for proxying messages, or the local window.
	 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.
	 * @cfg {Number} interval The interval used when polling for messages.
	 */
	easyXDM.stack.HashTransport = function(config){
	    var pub;
	    var me = this, isHost, _timer, pollInterval, _lastMsg, _msgNr, _listenerWindow, _callerWindow;
	    var useParent, _remoteOrigin;
	    
	    function _sendMessage(message){
	        if (!_callerWindow) {
	            return;
	        }
	        var url = config.remote + "#" + (_msgNr++) + "_" + message;
	        ((isHost || !useParent) ? _callerWindow.contentWindow : _callerWindow).location = url;
	    }
	    
	    function _handleHash(hash){
	        _lastMsg = hash;
	        pub.up.incoming(_lastMsg.substring(_lastMsg.indexOf("_") + 1), _remoteOrigin);
	    }
	    
	    /**
	     * Checks location.hash for a new message and relays this to the receiver.
	     * @private
	     */
	    function _pollHash(){
	        if (!_listenerWindow) {
	            return;
	        }
	        var href = _listenerWindow.location.href, hash = "", indexOf = href.indexOf("#");
	        if (indexOf != -1) {
	            hash = href.substring(indexOf);
	        }
	        if (hash && hash != _lastMsg) {
	            _handleHash(hash);
	        }
	    }
	    
	    function _attachListeners(){
	        _timer = setInterval(_pollHash, pollInterval);
	    }
	    
	    return (pub = {
	        outgoing: function(message, domain){
	            _sendMessage(message);
	        },
	        destroy: function(){
	            window.clearInterval(_timer);
	            if (isHost || !useParent) {
	                _callerWindow.parentNode.removeChild(_callerWindow);
	            }
	            _callerWindow = null;
	        },
	        onDOMReady: function(){
	            isHost = config.isHost;
	            pollInterval = config.interval;
	            _lastMsg = "#" + config.channel;
	            _msgNr = 0;
	            useParent = config.useParent;
	            _remoteOrigin = getLocation(config.remote);
	            if (isHost) {
	                apply(config.props, {
	                    src: config.remote,
	                    name: IFRAME_PREFIX + config.channel + "_provider"
	                });
	                if (useParent) {
	                    config.onLoad = function(){
	                        _listenerWindow = window;
	                        _attachListeners();
	                        pub.up.callback(true);
	                    };
	                }
	                else {
	                    var tries = 0, max = config.delay / 50;
	                    (function getRef(){
	                        if (++tries > max) {
	                            throw new Error("Unable to reference listenerwindow");
	                        }
	                        try {
	                            _listenerWindow = _callerWindow.contentWindow.frames[IFRAME_PREFIX + config.channel + "_consumer"];
	                        } 
	                        catch (ex) {
	                        }
	                        if (_listenerWindow) {
	                            _attachListeners();
	                            pub.up.callback(true);
	                        }
	                        else {
	                            setTimeout(getRef, 50);
	                        }
	                    }());
	                }
	                _callerWindow = createFrame(config);
	            }
	            else {
	                _listenerWindow = window;
	                _attachListeners();
	                if (useParent) {
	                    _callerWindow = parent;
	                    pub.up.callback(true);
	                }
	                else {
	                    apply(config, {
	                        props: {
	                            src: config.remote + "#" + config.channel + new Date(),
	                            name: IFRAME_PREFIX + config.channel + "_consumer"
	                        },
	                        onLoad: function(){
	                            pub.up.callback(true);
	                        }
	                    });
	                    _callerWindow = createFrame(config);
	                }
	            }
	        },
	        init: function(){
	            whenReady(pub.onDOMReady, pub);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, debug */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.ReliableBehavior
	 * This is a behavior that tries to make the underlying transport reliable by using acknowledgements.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The behaviors configuration.
	 */
	easyXDM.stack.ReliableBehavior = function(config){
	    var pub, // the public interface
	 callback; // the callback to execute when we have a confirmed success/failure
	    var idOut = 0, idIn = 0, currentMessage = "";
	    
	    return (pub = {
	        incoming: function(message, origin){
	            var indexOf = message.indexOf("_"), ack = message.substring(0, indexOf).split(",");
	            message = message.substring(indexOf + 1);
	            
	            if (ack[0] == idOut) {
	                currentMessage = "";
	                if (callback) {
	                    callback(true);
	                }
	            }
	            if (message.length > 0) {
	                pub.down.outgoing(ack[1] + "," + idOut + "_" + currentMessage, origin);
	                if (idIn != ack[1]) {
	                    idIn = ack[1];
	                    pub.up.incoming(message, origin);
	                }
	            }
	            
	        },
	        outgoing: function(message, origin, fn){
	            currentMessage = message;
	            callback = fn;
	            pub.down.outgoing(idIn + "," + (++idOut) + "_" + message, origin);
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, debug, undef, removeFromStack*/
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.QueueBehavior
	 * This is a behavior that enables queueing of messages. <br/>
	 * It will buffer incoming messages and dispach these as fast as the underlying transport allows.
	 * This will also fragment/defragment messages so that the outgoing message is never bigger than the
	 * set length.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The behaviors configuration. Optional.
	 * @cfg {Number} maxLength The maximum length of each outgoing message. Set this to enable fragmentation.
	 */
	easyXDM.stack.QueueBehavior = function(config){
	    var pub, queue = [], waiting = true, incoming = "", destroying, maxLength = 0, lazy = false, doFragment = false;
	    
	    function dispatch(){
	        if (config.remove && queue.length === 0) {
	            removeFromStack(pub);
	            return;
	        }
	        if (waiting || queue.length === 0 || destroying) {
	            return;
	        }
	        waiting = true;
	        var message = queue.shift();
	        
	        pub.down.outgoing(message.data, message.origin, function(success){
	            waiting = false;
	            if (message.callback) {
	                setTimeout(function(){
	                    message.callback(success);
	                }, 0);
	            }
	            dispatch();
	        });
	    }
	    return (pub = {
	        init: function(){
	            if (undef(config)) {
	                config = {};
	            }
	            if (config.maxLength) {
	                maxLength = config.maxLength;
	                doFragment = true;
	            }
	            if (config.lazy) {
	                lazy = true;
	            }
	            else {
	                pub.down.init();
	            }
	        },
	        callback: function(success){
	            waiting = false;
	            var up = pub.up; // in case dispatch calls removeFromStack
	            dispatch();
	            up.callback(success);
	        },
	        incoming: function(message, origin){
	            if (doFragment) {
	                var indexOf = message.indexOf("_"), seq = parseInt(message.substring(0, indexOf), 10);
	                incoming += message.substring(indexOf + 1);
	                if (seq === 0) {
	                    if (config.encode) {
	                        incoming = decodeURIComponent(incoming);
	                    }
	                    pub.up.incoming(incoming, origin);
	                    incoming = "";
	                }
	            }
	            else {
	                pub.up.incoming(message, origin);
	            }
	        },
	        outgoing: function(message, origin, fn){
	            if (config.encode) {
	                message = encodeURIComponent(message);
	            }
	            var fragments = [], fragment;
	            if (doFragment) {
	                // fragment into chunks
	                while (message.length !== 0) {
	                    fragment = message.substring(0, maxLength);
	                    message = message.substring(fragment.length);
	                    fragments.push(fragment);
	                }
	                // enqueue the chunks
	                while ((fragment = fragments.shift())) {
	                    queue.push({
	                        data: fragments.length + "_" + fragment,
	                        origin: origin,
	                        callback: fragments.length === 0 ? fn : null
	                    });
	                }
	            }
	            else {
	                queue.push({
	                    data: message,
	                    origin: origin,
	                    callback: fn
	                });
	            }
	            if (lazy) {
	                pub.down.init();
	            }
	            else {
	                dispatch();
	            }
	        },
	        destroy: function(){
	            destroying = true;
	            pub.down.destroy();
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, undef, debug */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.VerifyBehavior
	 * This behavior will verify that communication with the remote end is possible, and will also sign all outgoing,
	 * and verify all incoming messages. This removes the risk of someone hijacking the iframe to send malicious messages.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} config The behaviors configuration.
	 * @cfg {Boolean} initiate If the verification should be initiated from this end.
	 */
	easyXDM.stack.VerifyBehavior = function(config){
	    var pub, mySecret, theirSecret, verified = false;
	    
	    function startVerification(){
	        mySecret = Math.random().toString(16).substring(2);
	        pub.down.outgoing(mySecret);
	    }
	    
	    return (pub = {
	        incoming: function(message, origin){
	            var indexOf = message.indexOf("_");
	            if (indexOf === -1) {
	                if (message === mySecret) {
	                    pub.up.callback(true);
	                }
	                else if (!theirSecret) {
	                    theirSecret = message;
	                    if (!config.initiate) {
	                        startVerification();
	                    }
	                    pub.down.outgoing(message);
	                }
	            }
	            else {
	                if (message.substring(0, indexOf) === theirSecret) {
	                    pub.up.incoming(message.substring(indexOf + 1), origin);
	                }
	            }
	        },
	        outgoing: function(message, origin, fn){
	            pub.down.outgoing(mySecret + "_" + message, origin, fn);
	        },
	        callback: function(success){
	            if (config.initiate) {
	                startVerification();
	            }
	        }
	    });
	};
	/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
	/*global easyXDM, window, escape, unescape, undef, getJSON, debug, emptyFn, isArray */
	//
	// easyXDM
	// http://easyxdm.net/
	// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.
	//
	
	/**
	 * @class easyXDM.stack.RpcBehavior
	 * This uses JSON-RPC 2.0 to expose local methods and to invoke remote methods and have responses returned over the the string based transport stack.<br/>
	 * Exposed methods can return values synchronous, asyncronous, or bet set up to not return anything.
	 * @namespace easyXDM.stack
	 * @constructor
	 * @param {Object} proxy The object to apply the methods to.
	 * @param {Object} config The definition of the local and remote interface to implement.
	 * @cfg {Object} local The local interface to expose.
	 * @cfg {Object} remote The remote methods to expose through the proxy.
	 * @cfg {Object} serializer The serializer to use for serializing and deserializing the JSON. Should be compatible with the HTML5 JSON object. Optional, will default to JSON.
	 */
	easyXDM.stack.RpcBehavior = function(proxy, config){
	    var pub, serializer = config.serializer || getJSON();
	    var _callbackCounter = 0, _callbacks = {};
	    
	    /**
	     * Serializes and sends the message
	     * @private
	     * @param {Object} data The JSON-RPC message to be sent. The jsonrpc property will be added.
	     */
	    function _send(data){
	        data.jsonrpc = "2.0";
	        pub.down.outgoing(serializer.stringify(data));
	    }
	    
	    /**
	     * Creates a method that implements the given definition
	     * @private
	     * @param {Object} The method configuration
	     * @param {String} method The name of the method
	     * @return {Function} A stub capable of proxying the requested method call
	     */
	    function _createMethod(definition, method){
	        var slice = Array.prototype.slice;
	        
	        return function(){
	            var l = arguments.length, callback, message = {
	                method: method
	            };
	            
	            if (l > 0 && typeof arguments[l - 1] === "function") {
	                //with callback, procedure
	                if (l > 1 && typeof arguments[l - 2] === "function") {
	                    // two callbacks, success and error
	                    callback = {
	                        success: arguments[l - 2],
	                        error: arguments[l - 1]
	                    };
	                    message.params = slice.call(arguments, 0, l - 2);
	                }
	                else {
	                    // single callback, success
	                    callback = {
	                        success: arguments[l - 1]
	                    };
	                    message.params = slice.call(arguments, 0, l - 1);
	                }
	                _callbacks["" + (++_callbackCounter)] = callback;
	                message.id = _callbackCounter;
	            }
	            else {
	                // no callbacks, a notification
	                message.params = slice.call(arguments, 0);
	            }
	            if (definition.namedParams && message.params.length === 1) {
	                message.params = message.params[0];
	            }
	            // Send the method request
	            _send(message);
	        };
	    }
	    
	    /**
	     * Executes the exposed method
	     * @private
	     * @param {String} method The name of the method
	     * @param {Number} id The callback id to use
	     * @param {Function} method The exposed implementation
	     * @param {Array} params The parameters supplied by the remote end
	     */
	    function _executeMethod(method, id, fn, params){
	        if (!fn) {
	            if (id) {
	                _send({
	                    id: id,
	                    error: {
	                        code: -32601,
	                        message: "Procedure not found."
	                    }
	                });
	            }
	            return;
	        }
	        
	        var success, error;
	        if (id) {
	            success = function(result){
	                success = emptyFn;
	                _send({
	                    id: id,
	                    result: result
	                });
	            };
	            error = function(message, data){
	                error = emptyFn;
	                var msg = {
	                    id: id,
	                    error: {
	                        code: -32099,
	                        message: message
	                    }
	                };
	                if (data) {
	                    msg.error.data = data;
	                }
	                _send(msg);
	            };
	        }
	        else {
	            success = error = emptyFn;
	        }
	        // Call local method
	        if (!isArray(params)) {
	            params = [params];
	        }
	        try {
	            var result = fn.method.apply(fn.scope, params.concat([success, error]));
	            if (!undef(result)) {
	                success(result);
	            }
	        } 
	        catch (ex1) {
	            error(ex1.message);
	        }
	    }
	    
	    return (pub = {
	        incoming: function(message, origin){
	            var data = serializer.parse(message);
	            if (data.method) {
	                // A method call from the remote end
	                if (config.handle) {
	                    config.handle(data, _send);
	                }
	                else {
	                    _executeMethod(data.method, data.id, config.local[data.method], data.params);
	                }
	            }
	            else {
	                // A method response from the other end
	                var callback = _callbacks[data.id];
	                if (data.error) {
	                    if (callback.error) {
	                        callback.error(data.error);
	                    }
	                }
	                else if (callback.success) {
	                    callback.success(data.result);
	                }
	                delete _callbacks[data.id];
	            }
	        },
	        init: function(){
	            if (config.remote) {
	                // Implement the remote sides exposed methods
	                for (var method in config.remote) {
	                    if (config.remote.hasOwnProperty(method)) {
	                        proxy[method] = _createMethod(config.remote[method], method);
	                    }
	                }
	            }
	            pub.down.init();
	        },
	        destroy: function(){
	            for (var method in config.remote) {
	                if (config.remote.hasOwnProperty(method) && proxy.hasOwnProperty(method)) {
	                    delete proxy[method];
	                }
	            }
	            pub.down.destroy();
	        }
	    });
	};
	module.exports = easyXDM;
	})(window, document, location, window.setTimeout, decodeURIComponent, encodeURIComponent);


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * Simple logging to console.
	 */
	var Log = (function () {
	    function Log() {
	    }
	    /**
	     * Set/get logging level
	     *
	     * @param level
	     * @returns {number}
	     */
	    Log.level = function (level) {
	        if (level !== undefined) {
	            this._level = level;
	        }
	        return this._level;
	    };
	    Log.error = function () {
	        this._log(1, arguments);
	    };
	    Log.warning = function () {
	        this._log(2, arguments);
	    };
	    Log.info = function () {
	        this._log(3, arguments);
	    };
	    Log.debug = function () {
	        this._log(4, arguments);
	    };
	    Log.trace = function () {
	        this._log(5, arguments);
	    };
	    Log.log = function (name, data) {
	        this._log(0, arguments);
	    };
	    /**
	     * Generic function to log something
	     *
	     * @param level
	     * @param args
	     * @private
	     */
	    Log._log = function (level) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        if (level > this._level) {
	            return;
	        }
	        if (!console || typeof (console.log) !== "function") {
	            return;
	        }
	        var type = (["Log", "Error", "Warning", "Info", "Debug", "Trace"])[level];
	        args.unshift("[FE][" + type + "]:");
	        console.log.apply(console, args);
	    };
	    ;
	    /**
	     * default logging level (surpress all logs except the ones with 0 level)
	     *
	     * @type {number}
	     * @private
	     */
	    Log._level = 0;
	    return Log;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Log;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var native_1 = __webpack_require__(14);
	exports.Native = native_1.default;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../../../../typings/tsd.d.ts" />
	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var $ = __webpack_require__(7);
	var abstract_server_api_1 = __webpack_require__(15);
	/**
	 * Retrieve the ad from an AdZerk API
	 */
	var Native = (function (_super) {
	    __extends(Native, _super);
	    function Native(base) {
	        var _this = this;
	        _super.call(this, base);
	        this.trackers = { click: [], event: {}, impression: [], viewableImpression: "" };
	        // Grab the current view time
	        this.viewTime = Math.round(new Date().getTime() / 1000);
	        this._callback = this.adzerkDecision;
	        // listen to events from the ad (through the base object):
	        this.base.addEventListener("*", function (e) {
	            switch (e.name) {
	                case "AD_LOADED":
	                    // Serve impressions.
	                    // Ad has been loaded, but not yet visible
	                    for (var _i = 0, _a = _this.trackers.impression; _i < _a.length; _i++) {
	                        var url = _a[_i];
	                        $.ajax(url, { crossDomain: true, type: "GET" });
	                    }
	                    break;
	                case "AD_SERVED":
	                    // Serve viewable impression.
	                    // All panels are ready and viewed.
	                    $.ajax(_this.trackers.viewableImpression, { crossDomain: true, type: "GET" });
	                    _this.frequencyCapping();
	                    break;
	                default:
	                    // Serve custom event.
	                    _this.fireTracker(e.name, e.data);
	                    break;
	            }
	        });
	    }
	    /**
	     *
	     * @param macro
	     * @returns {JQueryPromise<*>}
	     */
	    Native.prototype.makeAdCall = function (macro) {
	        var _this = this;
	        var url = "https://engine.adzerk.net/api/v2";
	        //    let flightId: string = macro.srv_AdvertIDs ? `"flightId": ${macro.srv_AdvertIDs},` : "";
	        var userKey = this.getCookie("user") ? "\"user\": { \"key\": \"" + this.getCookie("user") + "\" }," : "";
	        var adViews = this.getCookie("adViews") ? "\"flightViewTimes\": " + this.getCookie("adViews") + "," : "";
	        var eventIds = [
	            40,
	            104, 105, 106, 107, 108, 109, 110,
	            201, 202, 203, 204, 205, 206, 207, 208, 209, 210,
	        ];
	        // Add impression tracker URL form as tag
	        if (macro.plr_ImpressionURL) {
	            this.trackers.impression.push(macro.plr_ImpressionURL);
	        }
	        // Add click tracker URL form as tag
	        if (macro.plr_ClickURL) {
	            this.trackers.click.push(macro.plr_ClickURL);
	        }
	        return $.ajax(url, {
	            crossDomain: true,
	            // data: `{
	            //         ${userKey}
	            //         ${adViews}
	            //         "time": ${this.viewTime},
	            //         "placements": [{
	            //         "divName": "ad",
	            //         "siteId": ${macro.srv_SectionID},
	            //         ${flightId}
	            //         "adTypes": [163],
	            //         "eventIds": [${eventIds.toString()}]
	            // }]}`,
	            data: "{\n                    " + userKey + "\n                    " + adViews + "\n                    \"time\": " + this.viewTime + ",\n                    \"placements\": [{\n                    \"divName\": \"ad\",\n                    \"siteId\": " + macro.srv_SectionID + ",\n                    \"adTypes\": [5, 163],\n                    \"eventIds\": [" + eventIds.toString() + "]\n            }]}",
	            dataType: "json",
	            type: "POST",
	        }).then(function (response) {
	            return _this._callback(response);
	        });
	    };
	    Object.defineProperty(Native.prototype, "callback", {
	        get: function () {
	            return this._callback;
	        },
	        set: function (callback) {
	            this._callback = callback ? callback : this.adzerkDecision;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Native.prototype.adzerkDecision = function (response) {
	        this.saveUserIdInCookie(response.user.key);
	        // Check if Adzerk response meets minimum requirements
	        if (!this.checkNested(response, "decisions", "ad", "contents")) {
	            return;
	        }
	        this.flightId = response.decisions.ad.flightId;
	        var json = response.decisions.ad.contents[0];
	        if (response.decisions.ad.impressionUrl) {
	            this.trackers.impression.push(response.decisions.ad.impressionUrl);
	        }
	        if (response.decisions.ad.clickUrl) {
	            this.trackers.click.push(response.decisions.ad.clickUrl);
	        }
	        if (json.data.customData && json.data.customData.events && response.decisions.ad.events) {
	            this.collectTrackers(json.data.customData.events, response.decisions.ad.events);
	        }
	        if (this.base.get("autopilot") && json.data.customData) {
	            this.base.serve(json.data.customData);
	            this.base.dispatchEvent("AD_LOADED");
	        }
	        // If response has an executable script body - evaluate it
	        if (json.body) {
	            this._evalScriptBody(json.body);
	        }
	    };
	    /**
	     * Collect Custom events from Manifest and map them to Event trackers, provided by AdZerk
	     *
	     * @param customEvents
	     * @param adzerkEvents
	     */
	    Native.prototype.collectTrackers = function (customEvents, adzerkEvents) {
	        // Initialize custom events list
	        this.trackers.event = {};
	        // Reformat AdZerk trackers into associative array [id: url]
	        var formattedAdzerkEvents = {};
	        for (var _i = 0, adzerkEvents_1 = adzerkEvents; _i < adzerkEvents_1.length; _i++) {
	            var event_1 = adzerkEvents_1[_i];
	            if (event_1.id === 40) {
	                // Tracker with ID of 40 is a Viewable impression
	                this.trackers.viewableImpression = event_1.url;
	            }
	            else {
	                formattedAdzerkEvents[event_1.id] = event_1.url;
	            }
	        }
	        for (var _a = 0, customEvents_1 = customEvents; _a < customEvents_1.length; _a++) {
	            var event_2 = customEvents_1[_a];
	            if ("IMPRESSION_TRACKER" === event_2.tag) {
	                // Events with "IMPRESSION_TRACKER" tag served separately
	                this.trackers.impression.push(event_2.url);
	            }
	            else {
	                this.trackers.event["AD_" + event_2.tag] = {
	                    "urls": [event_2.url, formattedAdzerkEvents[event_2.customId]],
	                    "landingPageUrl": event_2.landingPageUrl,
	                    "silent": event_2.silent,
	                };
	            }
	        }
	    };
	    /**
	     * Fire custom event tracker
	     *
	     * @param name
	     * @param data
	     */
	    Native.prototype.fireTracker = function (name, data) {
	        if (this.trackers.event[name]) {
	            // Fire all trackers, registered for current event
	            for (var _i = 0, _a = this.trackers.event[name].urls; _i < _a.length; _i++) {
	                var url = _a[_i];
	                $.ajax(url, { crossDomain: true, type: "GET" });
	            }
	            // Fire all click events if no silent option is set
	            if (!this.trackers.event[name].silent && this.trackers.click) {
	                for (var _b = 0, _c = this.trackers.click; _b < _c.length; _b++) {
	                    var url = _c[_b];
	                    $.ajax(url, { crossDomain: true, type: "GET" });
	                }
	            }
	            // If event has landingPageUrl parameter - open the URL in a new browser tab
	            if (this.trackers.event[name].landingPageUrl) {
	                var win = window.open(this.trackers.event[name].landingPageUrl, "_blank");
	                win.focus();
	            }
	        }
	        // Log.log(name, data);
	    };
	    Native.prototype.frequencyCapping = function () {
	        var _this = this;
	        // Create a new hash with empty views array
	        var hash = {};
	        hash[this.flightId] = [];
	        // Check if hash already exists in Cookies
	        var adViews = this.getCookie("adViews");
	        if (adViews) {
	            // If hash found in Cookies - remove old view timestamps (older than 60 days)
	            hash = JSON.parse(adViews);
	            hash[this.flightId] = hash[this.flightId].filter(function (date) {
	                return _this.viewTime - 60 * 60 * 24 * 60 < date;
	            });
	        }
	        hash[this.flightId].push(this.viewTime);
	        // Save updated hash to the Cookie
	        this.saveViewTimeInCookie(hash);
	    };
	    /**
	     * Check if JSON structure is valid
	     *
	     * @param obj
	     * @param args
	     * @returns {boolean}
	     */
	    Native.prototype.checkNested = function (obj) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        for (var i = 0; i < args.length; i++) {
	            if (!obj || !obj.hasOwnProperty(args[i])) {
	                return false;
	            }
	            obj = obj[args[i]];
	        }
	        return true;
	    };
	    Native.prototype.saveUserIdInCookie = function (user) {
	        document.cookie = "user=" + user + "; path=/";
	    };
	    Native.prototype.saveViewTimeInCookie = function (hash) {
	        var adViews = JSON.stringify(hash);
	        document.cookie = "adViews=" + adViews + "; path=/";
	    };
	    /* tslint:disable:no-eval */
	    /**
	     * Evaluate script from script body
	     *
	     * @param code
	     * @private
	     */
	    Native.prototype._evalScriptBody = function (code) {
	        try {
	            //  console.log(this._callbackFunction);
	            //  console.log(this._callbackFunction(code));
	            // // let fn = window[this._callbackFunction];
	            //  this._callbackFunction(code);
	            //  Strip all HTML tags (which are <script> tags)
	            //  eval(code.replace(/(<([^>]+)>)/ig, ""));
	            //  let regex = /<script.*?src="(.*?)"/;
	            //  let src = regex.exec(code)[1];
	            //
	            //  console.log(src);
	            var iframe = document.createElement("iframe");
	            iframe.width = "320px";
	            iframe.height = "270px";
	            var html = "<body>" + code + "</body>";
	            iframe.src = "data:text/html;charset=utf-8," + encodeURI(html);
	            iframe.scrolling = "no";
	            iframe.frameBorder = "0";
	            document.getElementById("targ").appendChild(iframe);
	        }
	        catch (e) {
	            if (e instanceof SyntaxError) {
	                console.log(e.message);
	            }
	        }
	    };
	    /* tslint:enable:no-eval */
	    Native.prototype.getCookie = function (name) {
	        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
	        return matches ? decodeURIComponent(matches[1]) : undefined;
	    };
	    return Native;
	}(abstract_server_api_1.default));
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Native;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * The base class for all server APIs.
	 */
	"use strict";
	var AbstractServerApi = (function () {
	    function AbstractServerApi(base) {
	        this.base = base;
	    }
	    return AbstractServerApi;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = AbstractServerApi;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=base-full.js.map
