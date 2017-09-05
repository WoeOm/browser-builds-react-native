/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 430);
/******/ })
/************************************************************************/
/******/ ({

/***/ 181:
/***/ (function(module, exports, __webpack_require__) {

var hex = __webpack_require__(182)

// For simplicity we redefine it, as the default uses lowercase
var BASE36_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
var bs36 = __webpack_require__(77)(BASE36_ALPHABET)

var ICAP = {}

ICAP.decodeBBAN = function (bban) {
  var length = bban.length
  if (length === 30 || length === 31) {
    var tmp = hex.bytesToHex(bs36.decode(bban))

    // FIXME: horrible padding code
    while (tmp.length < 40) {
      tmp = '0' + tmp
    }

    // NOTE: certain tools include an extra leading 0, drop that
    if ((tmp.length === 42) && (tmp[0] === '0') && (tmp[1] === '0')) {
      tmp = tmp.slice(2)
    }

    return '0x' + tmp
  } else if (length === 16) {
    return {
      asset: bban.slice(0, 3),
      institution: bban.slice(3, 7),
      client: bban.slice(7, 16)
    }
  } else {
    throw new Error('Not a valid Ethereum BBAN')
  }
}

ICAP.encodeBBAN = function (bban) {
  if (typeof bban === 'object') {
    if (bban.asset.length !== 3 ||
        bban.institution.length !== 4 ||
        bban.client.length !== 9) {
      throw new Error('Invalid \'indirect\' Ethereum BBAN')
    }
    return [ bban.asset, bban.institution, bban.client ].join('').toUpperCase()
  } else if ((bban.length === 42) && (bban[0] === '0') && (bban[1] === 'x')) {
    // Workaround for base-x, see https://github.com/cryptocoinjs/base-x/issues/18
    if ((bban[2] === '0') && (bban[3] === '0')) {
      bban = '0x' + bban.slice(4)
    }

    return bs36.encode(hex.hexToBytes(bban))
  } else {
    throw new Error('Not a valid input for Ethereum BBAN')
  }
}

// ISO13616 reordering and letter translation
// NOTE: we assume input is uppercase only
// based off code from iban.js
function prepare (iban) {
  // move front to the back
  iban = iban.slice(4) + iban.slice(0, 4)

  // translate letters to numbers
  return iban.split('').map(function (n) {
    var code = n.charCodeAt(0)
    // 65 == A, 90 == Z in ASCII
    if (code >= 65 && code <= 90) {
      // A = 10, B = 11, ... Z = 35
      return code - 65 + 10
    } else {
      return n
    }
  }).join('')
}

// Calculate ISO7064 mod 97-10
// NOTE: assumes all numeric input string
function mod9710 (input) {
  var m = 0
  for (var i = 0; i < input.length; i++) {
    m *= 10
    m += input.charCodeAt(i) - 48 // parseInt()
    m %= 97
  }
  return m
}

ICAP.encode = function (bban, print) {
  bban = ICAP.encodeBBAN(bban)

  var checksum = 98 - mod9710(prepare('XE00' + bban))

  // format into 2 digits
  checksum = ('0' + checksum).slice(-2)

  var iban = 'XE' + checksum + bban
  if (print === true) {
    // split a group of 4 chars with spaces
    iban = iban.replace(/(.{4})/g, '$1 ')
  }

  return iban
}

ICAP.decode = function (iban, novalidity) {
  // change from 'print format' to 'electronic format', e.g. remove spaces
  iban = iban.replace(/\ /g, '')

  // check for validity
  if (!novalidity) {
    if (iban.slice(0, 2) !== 'XE') {
      throw new Error('Not in ICAP format')
    }

    if (mod9710(prepare(iban)) !== 1) {
      throw new Error('Invalid checksum in IBAN')
    }
  }

  return ICAP.decodeBBAN(iban.slice(4, 35))
}

/*
 * Convert Ethereum address to ICAP
 * @method fromAddress
 * @param {String} address Address as a hex string.
 * @param {bool} nonstd Accept address which will result in non-standard IBAN
 * @returns {String}
 */
ICAP.fromAddress = function (address, print, nonstd) {
  var ret = ICAP.encode(address, print)

  if ((ret.replace(' ', '').length !== 34) && (nonstd !== true)) {
    throw new Error('Supplied address will result in invalid an IBAN')
  }

  return ret
}

/*
 * Convert asset into ICAP
 * @method fromAsset
 * @param {Object} asset Asset object, must contain the fields asset, institution and client
 * @returns {String}
 */
ICAP.fromAsset = function (asset, print) {
  return ICAP.encode(asset, print)
}

/*
 * Convert an ICAP into an address
 * @method toAddress
 * @param {String} iban IBAN/ICAP, must have an address encoded
 * @returns {String}
 */
ICAP.toAddress = function (iban) {
  var address = ICAP.decode(iban)
  if (typeof address !== 'string') {
    throw new Error('Not an address-encoded ICAP')
  }
  return address
}

/*
 * Convert an ICAP into an asset
 * @method toAsset
 * @param {String} iban IBAN/ICAP, must have an asset encoded
 * @returns {Object}
 */
ICAP.toAsset = function (iban) {
  var asset = ICAP.decode(iban)
  if (typeof asset !== 'object') {
    throw new Error('Not an asset-encoded ICAP')
  }
  return asset
}

ICAP.isICAP = function (iban) {
  try {
    ICAP.decode(iban)
    return true
  } catch (e) {
    return false
  }
}

ICAP.isAddress = function (iban) {
  try {
    ICAP.toAddress(iban)
    return true
  } catch (e) {
    return false
  }
}

ICAP.isAsset = function (iban) {
  try {
    ICAP.toAsset(iban)
    return true
  } catch (e) {
    return false
  }
}

module.exports = ICAP


/***/ }),

/***/ 182:
/***/ (function(module, exports) {

!function(globals) {
'use strict'

var convertHex = {
  bytesToHex: function(bytes) {
    /*if (typeof bytes.byteLength != 'undefined') {
      var newBytes = []

      if (typeof bytes.buffer != 'undefined')
        bytes = new DataView(bytes.buffer)
      else
        bytes = new DataView(bytes)

      for (var i = 0; i < bytes.byteLength; ++i) {
        newBytes.push(bytes.getUint8(i))
      }
      bytes = newBytes
    }*/
    return arrBytesToHex(bytes)
  },
  hexToBytes: function(hex) {
    if (hex.length % 2 === 1) throw new Error("hexToBytes can't have a string with an odd number of characters.")
    if (hex.indexOf('0x') === 0) hex = hex.slice(2)
    return hex.match(/../g).map(function(x) { return parseInt(x,16) })
  }
}


// PRIVATE

function arrBytesToHex(bytes) {
  return bytes.map(function(x) { return padLeft(x.toString(16),2) }).join('')
}

function padLeft(orig, len) {
  if (orig.length > len) return orig
  return Array(len - orig.length + 1).join('0') + orig
}


if (typeof module !== 'undefined' && module.exports) { //CommonJS
  module.exports = convertHex
} else {
  globals.convertHex = convertHex
}

}(this);

/***/ }),

/***/ 4:
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ 430:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

global.EthJs = {
  ICAP: __webpack_require__(181)
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),

/***/ 77:
/***/ (function(module, exports) {

// base-x encoding
// Forked from https://github.com/cryptocoinjs/bs58
// Originally written by Mike Hearn for BitcoinJ
// Copyright (c) 2011 Google Inc
// Ported to JavaScript by Stefan Thomas
// Merged Buffer refactorings from base58-native by Stephen Pair
// Copyright (c) 2013 BitPay Inc

module.exports = function base (ALPHABET) {
  var ALPHABET_MAP = {}
  var BASE = ALPHABET.length
  var LEADER = ALPHABET.charAt(0)

  // pre-compute lookup table
  for (var i = 0; i < ALPHABET.length; i++) {
    ALPHABET_MAP[ALPHABET.charAt(i)] = i
  }

  function encode (source) {
    if (source.length === 0) return ''

    var digits = [0]
    for (var i = 0; i < source.length; ++i) {
      for (var j = 0, carry = source[i]; j < digits.length; ++j) {
        carry += digits[j] << 8
        digits[j] = carry % BASE
        carry = (carry / BASE) | 0
      }

      while (carry > 0) {
        digits.push(carry % BASE)
        carry = (carry / BASE) | 0
      }
    }

    var string = ''

    // deal with leading zeros
    for (var k = 0; source[k] === 0 && k < source.length - 1; ++k) string += ALPHABET[0]
    // convert digits to a string
    for (var q = digits.length - 1; q >= 0; --q) string += ALPHABET[digits[q]]

    return string
  }

  function decodeUnsafe (string) {
    if (string.length === 0) return []

    var bytes = [0]
    for (var i = 0; i < string.length; i++) {
      var value = ALPHABET_MAP[string[i]]
      if (value === undefined) return

      for (var j = 0, carry = value; j < bytes.length; ++j) {
        carry += bytes[j] * BASE
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    // deal with leading zeros
    for (var k = 0; string[k] === LEADER && k < string.length - 1; ++k) {
      bytes.push(0)
    }

    return bytes.reverse()
  }

  function decode (string) {
    var array = decodeUnsafe(string)
    if (array) return array

    throw new Error('Non-base' + BASE + ' character')
  }

  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}


/***/ })

/******/ });