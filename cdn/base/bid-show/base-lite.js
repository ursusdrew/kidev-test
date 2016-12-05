(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jQuery"));
	else if(typeof define === 'function' && define.amd)
		define(["jQuery"], factory);
	else if(typeof exports === 'object')
		exports["FE"] = factory(require("jQuery"));
	else
		root["FE"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_7__) {
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
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

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
	            data: "{\n                    " + userKey + "\n                    " + adViews + "\n                    \"time\": " + this.viewTime + ",\n                    \"placements\": [{\n                    \"divName\": \"ad\",\n                    \"siteId\": " + macro.srv_SectionID + ",\n                    \"adTypes\": [5],\n                    \"eventIds\": [" + eventIds.toString() + "]\n            }]}",
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
//# sourceMappingURL=base-lite.js.map
