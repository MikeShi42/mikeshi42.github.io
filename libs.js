
function scrollTop(){
  return document.documentElement.scrollTop || document.body.scrollTop;
}


function scrollToElement(target, duration){
  //TODO: Calculate actual offset from body element
  var elementTargetDistance = target.offsetTop;
  console.log(elementTargetDistance);
  smooth_scroll_to(document.body, elementTargetDistance, 
      duration || Math.abs(scrollTop() - elementTargetDistance)/2);
}

/**
  Smoothly scroll element to the given target (element.scrollTop)
  for the given duration

  Returns a promise that's fulfilled when done, or rejected if
  interrupted

  Source: https://coderwall.com/p/hujlhg/smooth-scrolling-without-jquery
  */
function smooth_scroll_to(element, target, duration) {
  target = Math.round(target);
  duration = Math.round(duration);
  if (duration < 0) {
    return Promise.reject("bad duration");
  }
  if (duration === 0) {
    element.scrollTop = target;
    return Promise.resolve();
  }

  var start_time = Date.now();
  var end_time = start_time + duration;

  var start_top = element.scrollTop;
  var distance = target - start_top;

  // based on http://en.wikipedia.org/wiki/Smoothstep
  var smooth_step = function(start, end, point) {
    if(point <= start) { return 0; }
    if(point >= end) { return 1; }
    var x = (point - start) / (end - start); // interpolation
    return x*x*(3 - 2*x);
  }

  return new Promise(function(resolve, reject) {
    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    var previous_top = element.scrollTop;

    // This is like a think function from a game loop
    var scroll_frame = function() {
      if(element.scrollTop != previous_top) {
        reject("interrupted");
        return;
      }

      // set the scrollTop for this frame
      var now = Date.now();
      var point = smooth_step(start_time, end_time, now);
      var frameTop = Math.round(start_top + (distance * point));
      element.scrollTop = frameTop;

      // check if we're done!
      if(now >= end_time) {
        resolve();
        return;
      }

      // If we were supposed to scroll but didn't, then we
      // probably hit the limit, so consider it done; not
      // interrupted.
      if(element.scrollTop === previous_top
          && element.scrollTop !== frameTop) {
            resolve();
            return;
          }
      previous_top = element.scrollTop;

      // schedule next frame for execution
      setTimeout(scroll_frame, 0);
    }

    // boostrap the animation process
    setTimeout(scroll_frame, 0);
  });
}

/* 
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self) {

  // Full polyfill for browsers with no classList support
  if (!("classList" in document.createElement("_"))) {

    (function (view) {

      "use strict";

      if (!('Element' in view)) return;

      var
      classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
    , arrIndexOf = Array[protoProp].indexOf || function (item) {
      var
      i = 0
      , len = this.length
      ;
    for (; i < len; i++) {
      if (i in this && this[i] === item) {
        return i;
      }
    }
    return -1;
    }
    // Vendors: please allow content code to instantiate DOMExceptions
    , DOMEx = function (type, message) {
      this.name = type;
      this.code = DOMException[type];
      this.message = message;
    }
    , checkTokenAndGetIndex = function (classList, token) {
      if (token === "") {
        throw new DOMEx(
            "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
            );
      }
      if (/\s/.test(token)) {
        throw new DOMEx(
            "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
            );
      }
      return arrIndexOf.call(classList, token);
    }
    , ClassList = function (elem) {
      var
        trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
        , i = 0
        , len = classes.length
        ;
      for (; i < len; i++) {
        this.push(classes[i]);
      }
      this._updateClassName = function () {
        elem.setAttribute("class", this.toString());
      };
    }
    , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
        tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
        tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
        ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
        result = this.contains(token)
        , method = result ?
        force !== true && "remove"
        :
        force !== false && "add"
        ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
        get: classListGetter
          , enumerable: true
          , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(self));

  } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());

  }

}
