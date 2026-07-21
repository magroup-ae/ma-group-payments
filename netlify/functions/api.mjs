import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/nodemailer/lib/punycode/index.js
var require_punycode = __commonJS({
  "node_modules/nodemailer/lib/punycode/index.js"(exports, module) {
    "use strict";
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7F]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error(type) {
      throw new RangeError(errors[type]);
    }
    function map(array, callback) {
      const result = [];
      let length = array.length;
      while (length--) {
        result[length] = callback(array[length]);
      }
      return result;
    }
    function mapDomain(domain, callback) {
      const parts = domain.split("@");
      let result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        domain = parts[1];
      }
      domain = domain.replace(regexSeparators, ".");
      const labels = domain.split(".");
      const encoded = map(labels, callback).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      const output = [];
      let counter = 0;
      const length = string.length;
      while (counter < length) {
        const value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          const extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
    var basicToDigit = function(codePoint) {
      if (codePoint >= 48 && codePoint < 58) {
        return 26 + (codePoint - 48);
      }
      if (codePoint >= 65 && codePoint < 91) {
        return codePoint - 65;
      }
      if (codePoint >= 97 && codePoint < 123) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function(delta, numPoints, firstTime) {
      let k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (
        ;
        /* no initialization */
        delta > baseMinusTMin * tMax >> 1;
        k += base
      ) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    var decode = function(input) {
      const output = [];
      const inputLength = input.length;
      let i = 0;
      let n = initialN;
      let bias = initialBias;
      let basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (let j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        const oldi = i;
        for (let w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error("invalid-input");
          }
          const digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base) {
            error("invalid-input");
          }
          if (digit > floor((maxInt - i) / w)) {
            error("overflow");
          }
          i += digit * w;
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          const baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error("overflow");
          }
          w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i - oldi, out, oldi == 0);
        if (floor(i / out) > maxInt - n) {
          error("overflow");
        }
        n += floor(i / out);
        i %= out;
        output.splice(i++, 0, n);
      }
      return String.fromCodePoint(...output);
    };
    var encode = function(input) {
      const output = [];
      input = ucs2decode(input);
      const inputLength = input.length;
      let n = initialN;
      let delta = 0;
      let bias = initialBias;
      for (const currentValue of input) {
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      const basicLength = output.length;
      let handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        let m = maxInt;
        for (const currentValue of input) {
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input) {
          if (currentValue < n && ++delta > maxInt) {
            error("overflow");
          }
          if (currentValue === n) {
            let q = delta;
            for (let k = base; ; k += base) {
              const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              const qMinusT = q - t;
              const baseMinusT = base - t;
              output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
      });
    };
    var toASCII = function(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
      });
    };
    var punycode = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      version: "2.3.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      ucs2: {
        decode: ucs2decode,
        encode: ucs2encode
      },
      decode,
      encode,
      toASCII,
      toUnicode
    };
    module.exports = punycode;
  }
});

// node_modules/nodemailer/lib/shared/url.js
var require_url = __commonJS({
  "node_modules/nodemailer/lib/shared/url.js"(exports, module) {
    "use strict";
    var urllib = __require("url");
    var punycode = require_punycode();
    var URLImpl = typeof URL !== "undefined" && URL || urllib.URL;
    var SLASHLESS_AUTHORITY = /^([a-zA-Z][a-zA-Z0-9+.-]*:)(?!\/\/)(.+)$/;
    function safeDecode(str) {
      try {
        return decodeURIComponent(str);
      } catch (_err) {
        return str;
      }
    }
    function normalizeHostname(raw) {
      let hostname = raw || "";
      if (!hostname) {
        return "";
      }
      if (hostname.charAt(0) === "[" && hostname.charAt(hostname.length - 1) === "]") {
        return hostname.slice(1, -1);
      }
      return punycode.toASCII(safeDecode(hostname));
    }
    module.exports.parse = (input, parseQueryString) => {
      input = input || "";
      if (!URLImpl) {
        return urllib.parse(input, parseQueryString);
      }
      const slashless = SLASHLESS_AUTHORITY.exec(input);
      const normalized = slashless ? slashless[1] + "//" + slashless[2] : input;
      let u;
      try {
        u = new URLImpl(normalized);
      } catch (_err) {
        return urllib.parse(input, parseQueryString);
      }
      const hostname = normalizeHostname(u.hostname);
      const port = u.port || null;
      const pathname = u.pathname || null;
      const search = u.search || null;
      let auth = null;
      if (u.username || u.password) {
        auth = safeDecode(u.username) + (u.password ? ":" + safeDecode(u.password) : "");
      }
      let query;
      if (parseQueryString) {
        query = /* @__PURE__ */ Object.create(null);
        u.searchParams.forEach((value, key) => {
          if (Object.prototype.hasOwnProperty.call(query, key)) {
            if (Array.isArray(query[key])) {
              query[key].push(value);
            } else {
              query[key] = [query[key], value];
            }
          } else {
            query[key] = value;
          }
        });
      } else {
        query = search ? search.slice(1) : null;
      }
      return {
        protocol: u.protocol || null,
        host: u.host || null,
        hostname,
        port,
        pathname,
        search,
        path: (pathname || "") + (search || "") || null,
        href: u.href,
        auth,
        query
      };
    };
    module.exports.resolve = (from, to) => {
      if (!URLImpl) {
        return urllib.resolve(from, to);
      }
      try {
        return new URLImpl(to, from).href;
      } catch (_err) {
        return urllib.resolve(from, to);
      }
    };
  }
});

// node_modules/nodemailer/lib/fetch/cookies.js
var require_cookies = __commonJS({
  "node_modules/nodemailer/lib/fetch/cookies.js"(exports, module) {
    "use strict";
    var urllib = require_url();
    var SESSION_TIMEOUT = 1800;
    var Cookies = class {
      constructor(options) {
        this.options = options || {};
        this.cookies = [];
      }
      /**
       * Stores a cookie string to the cookie storage
       *
       * @param {String} cookieStr Value from the 'Set-Cookie:' header
       * @param {String} url Current URL
       */
      set(cookieStr, url) {
        const urlparts = urllib.parse(url || "");
        const cookie = this.parse(cookieStr);
        let domain;
        if (cookie.domain) {
          domain = cookie.domain.replace(/^\./, "");
          if (
            // can't be valid if the requested domain is shorter than current hostname
            urlparts.hostname.length < domain.length || // prefix domains with dot to be sure that partial matches are not used
            ("." + urlparts.hostname).substr(-domain.length + 1) !== "." + domain
          ) {
            cookie.domain = urlparts.hostname;
          }
        } else {
          cookie.domain = urlparts.hostname;
        }
        if (!cookie.path) {
          cookie.path = this.getPath(urlparts.pathname);
        }
        if (!cookie.expires) {
          cookie.expires = new Date(Date.now() + (Number(this.options.sessionTimeout || SESSION_TIMEOUT) || SESSION_TIMEOUT) * 1e3);
        }
        return this.add(cookie);
      }
      /**
       * Returns cookie string for the 'Cookie:' header.
       *
       * @param {String} url URL to check for
       * @returns {String} Cookie header or empty string if no matches were found
       */
      get(url) {
        return this.list(url).map((cookie) => cookie.name + "=" + cookie.value).join("; ");
      }
      /**
       * Lists all valied cookie objects for the specified URL
       *
       * @param {String} url URL to check for
       * @returns {Array} An array of cookie objects
       */
      list(url) {
        const result = [];
        for (let i = this.cookies.length - 1; i >= 0; i--) {
          const cookie = this.cookies[i];
          if (this.isExpired(cookie)) {
            this.cookies.splice(i, 1);
            continue;
          }
          if (this.match(cookie, url)) {
            result.unshift(cookie);
          }
        }
        return result;
      }
      /**
       * Parses cookie string from the 'Set-Cookie:' header
       *
       * @param {String} cookieStr String from the 'Set-Cookie:' header
       * @returns {Object} Cookie object
       */
      parse(cookieStr) {
        const cookie = {};
        (cookieStr || "").toString().split(";").forEach((cookiePart) => {
          const valueParts = cookiePart.split("=");
          const key = valueParts.shift().trim().toLowerCase();
          let value = valueParts.join("=").trim();
          let domain;
          if (!key) {
            return;
          }
          switch (key) {
            case "expires":
              value = new Date(value);
              if (value.toString() !== "Invalid Date") {
                cookie.expires = value;
              }
              break;
            case "path":
              cookie.path = value;
              break;
            case "domain":
              domain = value.toLowerCase();
              if (domain.length && domain.charAt(0) !== ".") {
                domain = "." + domain;
              }
              cookie.domain = domain;
              break;
            case "max-age":
              cookie.expires = new Date(Date.now() + (Number(value) || 0) * 1e3);
              break;
            case "secure":
              cookie.secure = true;
              break;
            case "httponly":
              cookie.httponly = true;
              break;
            default:
              if (!cookie.name) {
                cookie.name = key;
                cookie.value = value;
              }
          }
        });
        return cookie;
      }
      /**
       * Checks if a cookie object is valid for a specified URL
       *
       * @param {Object} cookie Cookie object
       * @param {String} url URL to check for
       * @returns {Boolean} true if cookie is valid for specifiec URL
       */
      match(cookie, url) {
        const urlparts = urllib.parse(url || "");
        if (urlparts.hostname !== cookie.domain && (cookie.domain.charAt(0) !== "." || ("." + urlparts.hostname).substr(-cookie.domain.length) !== cookie.domain)) {
          return false;
        }
        const path = this.getPath(urlparts.pathname);
        if (path.substr(0, cookie.path.length) !== cookie.path) {
          return false;
        }
        if (cookie.secure && urlparts.protocol !== "https:") {
          return false;
        }
        return true;
      }
      /**
       * Adds (or updates/removes if needed) a cookie object to the cookie storage
       *
       * @param {Object} cookie Cookie value to be stored
       */
      add(cookie) {
        if (!cookie || !cookie.name) {
          return false;
        }
        for (let i = 0, len = this.cookies.length; i < len; i++) {
          if (this.compare(this.cookies[i], cookie)) {
            if (this.isExpired(cookie)) {
              this.cookies.splice(i, 1);
              return false;
            }
            this.cookies[i] = cookie;
            return true;
          }
        }
        if (!this.isExpired(cookie)) {
          this.cookies.push(cookie);
        }
        return true;
      }
      /**
       * Checks if two cookie objects are the same
       *
       * @param {Object} a Cookie to check against
       * @param {Object} b Cookie to check against
       * @returns {Boolean} True, if the cookies are the same
       */
      compare(a, b) {
        return a.name === b.name && a.path === b.path && a.domain === b.domain && a.secure === b.secure && a.httponly === b.httponly;
      }
      /**
       * Checks if a cookie is expired
       *
       * @param {Object} cookie Cookie object to check against
       * @returns {Boolean} True, if the cookie is expired
       */
      isExpired(cookie) {
        return cookie.expires && cookie.expires < /* @__PURE__ */ new Date() || !cookie.value;
      }
      /**
       * Returns normalized cookie path for an URL path argument
       *
       * @param {String} pathname
       * @returns {String} Normalized path
       */
      getPath(pathname) {
        let path = (pathname || "/").split("/");
        path.pop();
        path = path.join("/").trim();
        if (path.charAt(0) !== "/") {
          path = "/" + path;
        }
        if (path.substr(-1) !== "/") {
          path += "/";
        }
        return path;
      }
    };
    module.exports = Cookies;
  }
});

// node_modules/nodemailer/package.json
var require_package = __commonJS({
  "node_modules/nodemailer/package.json"(exports, module) {
    module.exports = {
      name: "nodemailer",
      version: "9.0.3",
      description: "Easy as cake e-mail sending from your Node.js applications",
      main: "lib/nodemailer.js",
      scripts: {
        test: "node --test --test-concurrency=1 $(find test \\( -name '*-test.js' -o -name '*.test.js' \\))",
        "test:coverage": "c8 node --test --test-concurrency=1 $(find test \\( -name '*-test.js' -o -name '*.test.js' \\))",
        format: 'prettier --write "**/*.{js,json,md}"',
        "format:check": 'prettier --check "**/*.{js,json,md}"',
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        update: "rm -rf node_modules/ package-lock.json && ncu -u && npm install",
        "test:syntax": 'docker run --rm -v "$PWD:/app:ro" -w /app node:6-alpine node test/syntax-compat.js'
      },
      repository: {
        type: "git",
        url: "https://github.com/nodemailer/nodemailer.git"
      },
      keywords: [
        "Nodemailer"
      ],
      author: "Andris Reinman",
      license: "MIT-0",
      bugs: {
        url: "https://github.com/nodemailer/nodemailer/issues"
      },
      homepage: "https://nodemailer.com/",
      devDependencies: {
        "@aws-sdk/client-sesv2": "3.1068.0",
        bunyan: "1.8.15",
        c8: "11.0.0",
        eslint: "10.5.0",
        "eslint-config-prettier": "10.1.8",
        globals: "17.6.0",
        libbase64: "1.3.0",
        libmime: "5.3.8",
        libqp: "2.1.1",
        prettier: "3.8.4",
        proxy: "1.0.2",
        "proxy-test-server": "1.0.0",
        "smtp-server": "3.19.0"
      },
      engines: {
        node: ">=6.0.0"
      }
    };
  }
});

// node_modules/nodemailer/lib/errors.js
var require_errors = __commonJS({
  "node_modules/nodemailer/lib/errors.js"(exports, module) {
    "use strict";
    var ERROR_CODES = {
      // Connection errors
      ECONNECTION: "Connection closed unexpectedly",
      ETIMEDOUT: "Connection or operation timed out",
      ESOCKET: "Socket-level error",
      EDNS: "DNS resolution failed",
      // TLS/Security errors
      ETLS: "TLS handshake or STARTTLS failed",
      EREQUIRETLS: "REQUIRETLS not supported by server (RFC 8689)",
      // Protocol errors
      EPROTOCOL: "Invalid SMTP server response",
      EENVELOPE: "Invalid mail envelope (sender or recipients)",
      EMESSAGE: "Message delivery error",
      ESTREAM: "Stream processing error",
      // Authentication errors
      EAUTH: "Authentication failed",
      ENOAUTH: "Authentication credentials not provided",
      EOAUTH2: "OAuth2 token generation or refresh error",
      // Resource errors
      EMAXLIMIT: "Pool resource limit reached (max messages per connection)",
      // Transport-specific errors
      ESENDMAIL: "Sendmail command error",
      ESES: "AWS SES transport error",
      // Configuration and access errors
      ECONFIG: "Invalid configuration",
      EPROXY: "Proxy connection error",
      EFILEACCESS: "File access rejected (disableFileAccess is set)",
      EURLACCESS: "URL access rejected (disableUrlAccess is set)",
      EFETCH: "HTTP fetch error"
    };
    module.exports = { ERROR_CODES };
    for (const code of Object.keys(ERROR_CODES)) {
      module.exports[code] = code;
    }
  }
});

// node_modules/nodemailer/lib/fetch/index.js
var require_fetch = __commonJS({
  "node_modules/nodemailer/lib/fetch/index.js"(exports, module) {
    "use strict";
    var http = __require("http");
    var https = __require("https");
    var urllib = require_url();
    var zlib = __require("zlib");
    var { PassThrough } = __require("stream");
    var Cookies = require_cookies();
    var packageData = require_package();
    var net = __require("net");
    var errors = require_errors();
    var MAX_REDIRECTS = 5;
    module.exports = function(url, options) {
      return nmfetch(url, options);
    };
    module.exports.Cookies = Cookies;
    function nmfetch(url, options) {
      options = options || {};
      options.fetchRes = options.fetchRes || new PassThrough();
      options.cookies = options.cookies || new Cookies();
      options.redirects = options.redirects || 0;
      options.maxRedirects = isNaN(options.maxRedirects) ? MAX_REDIRECTS : options.maxRedirects;
      if (options.cookie) {
        [].concat(options.cookie || []).forEach((cookie) => {
          options.cookies.set(cookie, url);
        });
        options.cookie = false;
      }
      const fetchRes = options.fetchRes;
      const parsed = urllib.parse(url);
      let method = (options.method || "").toString().trim().toUpperCase() || "GET";
      let finished = false;
      let cookies;
      let body;
      const handler = parsed.protocol === "https:" ? https : http;
      const headers = {
        "accept-encoding": "gzip,deflate",
        "user-agent": "nodemailer/" + packageData.version
      };
      Object.keys(options.headers || {}).forEach((key) => {
        headers[key.toLowerCase().trim()] = options.headers[key];
      });
      if (options.userAgent) {
        headers["user-agent"] = options.userAgent;
      }
      if (parsed.auth) {
        headers.Authorization = "Basic " + Buffer.from(parsed.auth).toString("base64");
      }
      if (cookies = options.cookies.get(url)) {
        headers.cookie = cookies;
      }
      if (options.body) {
        if (options.contentType !== false) {
          headers["Content-Type"] = options.contentType || "application/x-www-form-urlencoded";
        }
        if (typeof options.body.pipe === "function") {
          headers["Transfer-Encoding"] = "chunked";
          body = options.body;
          body.on("error", (err2) => {
            if (finished) {
              return;
            }
            finished = true;
            err2.code = errors.EFETCH;
            err2.sourceUrl = url;
            fetchRes.emit("error", err2);
          });
        } else {
          if (options.body instanceof Buffer) {
            body = options.body;
          } else if (typeof options.body === "object") {
            try {
              body = Buffer.from(
                Object.keys(options.body).map((key) => {
                  const value = options.body[key].toString().trim();
                  return encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }).join("&")
              );
            } catch (E) {
              if (finished) {
                return;
              }
              finished = true;
              E.code = errors.EFETCH;
              E.sourceUrl = url;
              fetchRes.emit("error", E);
              return;
            }
          } else {
            body = Buffer.from(options.body.toString().trim());
          }
          headers["Content-Type"] = options.contentType || "application/x-www-form-urlencoded";
          headers["Content-Length"] = body.length;
        }
        method = (options.method || "").toString().trim().toUpperCase() || "POST";
      }
      let req;
      const reqOptions = {
        method,
        host: parsed.hostname,
        path: parsed.path,
        port: parsed.port ? parsed.port : parsed.protocol === "https:" ? 443 : 80,
        headers,
        // Validate TLS certificates by default. Callers that genuinely need to
        // reach a self-signed/internal host opt out explicitly with
        // options.tls = { rejectUnauthorized: false }.
        rejectUnauthorized: true,
        agent: false
      };
      if (options.tls) {
        Object.assign(reqOptions, options.tls);
      }
      if (parsed.protocol === "https:" && parsed.hostname && parsed.hostname !== reqOptions.host && !net.isIP(parsed.hostname) && !reqOptions.servername) {
        reqOptions.servername = parsed.hostname;
      }
      try {
        req = handler.request(reqOptions);
      } catch (E) {
        finished = true;
        setImmediate(() => {
          E.code = errors.EFETCH;
          E.sourceUrl = url;
          fetchRes.emit("error", E);
        });
        return fetchRes;
      }
      if (options.timeout) {
        req.setTimeout(options.timeout, () => {
          if (finished) {
            return;
          }
          finished = true;
          req.abort();
          const err2 = new Error("Request Timeout");
          err2.code = errors.EFETCH;
          err2.sourceUrl = url;
          fetchRes.emit("error", err2);
        });
      }
      req.on("error", (err2) => {
        if (finished) {
          return;
        }
        finished = true;
        err2.code = errors.EFETCH;
        err2.sourceUrl = url;
        fetchRes.emit("error", err2);
      });
      req.on("response", (res) => {
        let inflate;
        if (finished) {
          return;
        }
        switch (res.headers["content-encoding"]) {
          case "gzip":
          case "deflate":
            inflate = zlib.createUnzip();
            break;
        }
        if (res.headers["set-cookie"]) {
          [].concat(res.headers["set-cookie"] || []).forEach((cookie) => {
            options.cookies.set(cookie, url);
          });
        }
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          options.redirects++;
          if (options.redirects > options.maxRedirects) {
            finished = true;
            const err2 = new Error("Maximum redirect count exceeded");
            err2.code = errors.EFETCH;
            err2.sourceUrl = url;
            fetchRes.emit("error", err2);
            req.abort();
            return;
          }
          options.method = "GET";
          options.body = false;
          const redirectUrl = urllib.resolve(url, res.headers.location);
          const redirectParsed = urllib.parse(redirectUrl);
          const crossHost = redirectParsed.hostname !== parsed.hostname;
          const downgrade = parsed.protocol === "https:" && redirectParsed.protocol === "http:";
          if (options.headers && (crossHost || downgrade)) {
            const sensitive = ["authorization", "cookie", "proxy-authorization"];
            Object.keys(options.headers).forEach((key) => {
              if (sensitive.includes(key.toLowerCase())) {
                delete options.headers[key];
              }
            });
          }
          return nmfetch(redirectUrl, options);
        }
        fetchRes.statusCode = res.statusCode;
        fetchRes.headers = res.headers;
        if (res.statusCode >= 300 && !options.allowErrorResponse) {
          finished = true;
          const err2 = new Error("Invalid status code " + res.statusCode);
          err2.code = errors.EFETCH;
          err2.sourceUrl = url;
          fetchRes.emit("error", err2);
          req.abort();
          return;
        }
        res.on("error", (err2) => {
          if (finished) {
            return;
          }
          finished = true;
          err2.code = errors.EFETCH;
          err2.sourceUrl = url;
          fetchRes.emit("error", err2);
          req.abort();
        });
        if (inflate) {
          res.pipe(inflate).pipe(fetchRes);
          inflate.on("error", (err2) => {
            if (finished) {
              return;
            }
            finished = true;
            err2.code = errors.EFETCH;
            err2.sourceUrl = url;
            fetchRes.emit("error", err2);
            req.abort();
          });
        } else {
          res.pipe(fetchRes);
        }
      });
      setImmediate(() => {
        if (body) {
          try {
            if (typeof body.pipe === "function") {
              return body.pipe(req);
            }
            req.write(body);
          } catch (err2) {
            finished = true;
            err2.code = errors.EFETCH;
            err2.sourceUrl = url;
            fetchRes.emit("error", err2);
            return;
          }
        }
        req.end();
      });
      return fetchRes;
    }
  }
});

// node_modules/nodemailer/lib/shared/index.js
var require_shared = __commonJS({
  "node_modules/nodemailer/lib/shared/index.js"(exports, module) {
    "use strict";
    var urllib = require_url();
    var util = __require("util");
    var fs = __require("fs");
    var nmfetch = require_fetch();
    var errors = require_errors();
    var dns = __require("dns");
    var net = __require("net");
    var os = __require("os");
    var DNS_TTL = 5 * 60 * 1e3;
    var CACHE_CLEANUP_INTERVAL = 30 * 1e3;
    var MAX_CACHE_SIZE = 1e3;
    var lastCacheCleanup = 0;
    module.exports._lastCacheCleanup = () => lastCacheCleanup;
    module.exports._resetCacheCleanup = () => {
      lastCacheCleanup = 0;
    };
    var networkInterfaces;
    try {
      networkInterfaces = os.networkInterfaces();
    } catch (_err) {
    }
    module.exports.networkInterfaces = networkInterfaces;
    var isFamilySupported = (family, allowInternal) => {
      const ifaces = module.exports.networkInterfaces;
      if (!ifaces) {
        return true;
      }
      return Object.keys(ifaces).map((key) => ifaces[key]).reduce((acc, val) => acc.concat(val), []).filter((i) => !i.internal || allowInternal).some((i) => i.family === "IPv" + family || i.family === family);
    };
    var resolve = (family, hostname, options, callback) => {
      options = options || {};
      if (!isFamilySupported(family, options.allowInternalNetworkInterfaces)) {
        return callback(null, []);
      }
      const dnsResolver = dns.Resolver ? new dns.Resolver(options) : dns;
      dnsResolver["resolve" + family](hostname, (err2, addresses) => {
        if (err2) {
          switch (err2.code) {
            case dns.NODATA:
            case dns.NOTFOUND:
            case dns.NOTIMP:
            case dns.SERVFAIL:
            case dns.CONNREFUSED:
            case dns.REFUSED:
            case "EAI_AGAIN":
              return callback(null, []);
          }
          return callback(err2);
        }
        return callback(null, Array.isArray(addresses) ? addresses : [].concat(addresses || []));
      });
    };
    var dnsCache = module.exports.dnsCache = /* @__PURE__ */ new Map();
    var formatDNSValue = (value, extra) => {
      if (!value) {
        return Object.assign({}, extra || {});
      }
      const addresses = value.addresses || [];
      const host = addresses.length > 0 ? addresses[Math.floor(Math.random() * addresses.length)] : null;
      return Object.assign(
        {
          servername: value.servername,
          host,
          // Include all addresses for connection fallback support
          _addresses: addresses
        },
        extra || {}
      );
    };
    module.exports.resolveHostname = (options, callback) => {
      options = options || {};
      if (!options.host && options.servername) {
        options.host = options.servername;
      }
      if (!options.host || net.isIP(options.host)) {
        const value = {
          addresses: [options.host],
          servername: options.servername || false
        };
        return callback(
          null,
          formatDNSValue(value, {
            cached: false
          })
        );
      }
      let cached;
      if (dnsCache.has(options.host)) {
        cached = dnsCache.get(options.host);
        const now2 = Date.now();
        if (now2 - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
          lastCacheCleanup = now2;
          for (const [host, entry] of dnsCache.entries()) {
            if (entry.expires && entry.expires < now2) {
              dnsCache.delete(host);
            }
          }
          if (dnsCache.size > MAX_CACHE_SIZE) {
            const toDelete = Math.floor(MAX_CACHE_SIZE * 0.1);
            const keys = Array.from(dnsCache.keys()).slice(0, toDelete);
            keys.forEach((key) => dnsCache.delete(key));
          }
        }
        if (!cached.expires || cached.expires >= now2) {
          return callback(
            null,
            formatDNSValue(cached.value, {
              cached: true
            })
          );
        }
      }
      let ipv4Addresses = [];
      let ipv6Addresses = [];
      let ipv4Error = null;
      let ipv6Error = null;
      resolve(4, options.host, options, (err2, addresses) => {
        if (err2) {
          ipv4Error = err2;
        } else {
          ipv4Addresses = addresses || [];
        }
        resolve(6, options.host, options, (err3, addresses2) => {
          if (err3) {
            ipv6Error = err3;
          } else {
            ipv6Addresses = addresses2 || [];
          }
          const allAddresses = ipv4Addresses.concat(ipv6Addresses);
          if (allAddresses.length) {
            const value = {
              addresses: allAddresses,
              servername: options.servername || options.host
            };
            dnsCache.set(options.host, {
              value,
              expires: Date.now() + (options.dnsTtl || DNS_TTL)
            });
            return callback(
              null,
              formatDNSValue(value, {
                cached: false
              })
            );
          }
          if (ipv4Error && ipv6Error) {
            if (cached) {
              dnsCache.set(options.host, {
                value: cached.value,
                expires: Date.now() + (options.dnsTtl || DNS_TTL)
              });
              return callback(
                null,
                formatDNSValue(cached.value, {
                  cached: true,
                  error: ipv4Error
                })
              );
            }
          }
          try {
            dns.lookup(options.host, { all: true }, (err4, addresses3) => {
              if (err4) {
                if (cached) {
                  dnsCache.set(options.host, {
                    value: cached.value,
                    expires: Date.now() + (options.dnsTtl || DNS_TTL)
                  });
                  return callback(
                    null,
                    formatDNSValue(cached.value, {
                      cached: true,
                      error: err4
                    })
                  );
                }
                return callback(err4);
              }
              const supportedAddresses = addresses3 ? addresses3.filter((addr) => isFamilySupported(addr.family)).map((addr) => addr.address) : [];
              if (addresses3 && addresses3.length && !supportedAddresses.length) {
                console.warn(`Failed to resolve IPv${addresses3[0].family} addresses with current network`);
              }
              if (!supportedAddresses.length && cached) {
                return callback(
                  null,
                  formatDNSValue(cached.value, {
                    cached: true
                  })
                );
              }
              const value = {
                addresses: supportedAddresses.length ? supportedAddresses : [options.host],
                servername: options.servername || options.host
              };
              dnsCache.set(options.host, {
                value,
                expires: Date.now() + (options.dnsTtl || DNS_TTL)
              });
              return callback(
                null,
                formatDNSValue(value, {
                  cached: false
                })
              );
            });
          } catch (lookupErr) {
            if (cached) {
              dnsCache.set(options.host, {
                value: cached.value,
                expires: Date.now() + (options.dnsTtl || DNS_TTL)
              });
              return callback(
                null,
                formatDNSValue(cached.value, {
                  cached: true,
                  error: lookupErr
                })
              );
            }
            return callback(ipv4Error || ipv6Error || lookupErr);
          }
        });
      });
    };
    module.exports.parseConnectionUrl = (str) => {
      str = str || "";
      const options = {};
      const url = urllib.parse(str, true);
      switch (url.protocol) {
        case "smtp:":
          options.secure = false;
          break;
        case "smtps:":
          options.secure = true;
          break;
        case "direct:":
          options.direct = true;
          break;
      }
      if (!isNaN(url.port) && Number(url.port)) {
        options.port = Number(url.port);
      }
      if (url.hostname) {
        options.host = url.hostname;
      }
      if (url.auth) {
        const auth = url.auth.split(":");
        options.auth = {
          user: auth.shift(),
          pass: auth.join(":")
        };
      }
      Object.keys(url.query || {}).forEach((key) => {
        let obj = options;
        let lKey = key;
        let value = url.query[key];
        if (!isNaN(value)) {
          value = Number(value);
        }
        switch (value) {
          case "true":
            value = true;
            break;
          case "false":
            value = false;
            break;
        }
        if (key.indexOf("tls.") === 0) {
          lKey = key.substr(4);
          if (!options.tls) {
            options.tls = {};
          }
          obj = options.tls;
        } else if (key.indexOf(".") >= 0) {
          return;
        }
        if (!(lKey in obj)) {
          obj[lKey] = value;
        }
      });
      return options;
    };
    module.exports._logFunc = (logger, level, defaults, data, message, ...args) => {
      const entry = Object.assign({}, defaults || {}, data || {});
      delete entry.level;
      let logLevel = level;
      if (typeof logger[logLevel] !== "function") {
        logLevel = ["info", "debug", "log", "trace", "warn", "error"].find((name) => typeof logger[name] === "function");
      }
      if (logLevel) {
        logger[logLevel](entry, message, ...args);
      }
    };
    module.exports.getLogger = (options, defaults) => {
      options = options || {};
      const response = {};
      const levels = ["trace", "debug", "info", "warn", "error", "fatal"];
      if (!options.logger) {
        levels.forEach((level) => {
          response[level] = () => false;
        });
        return response;
      }
      const logger = options.logger === true ? createDefaultLogger(levels) : options.logger;
      levels.forEach((level) => {
        response[level] = (data, message, ...args) => {
          module.exports._logFunc(logger, level, defaults, data, message, ...args);
        };
      });
      return response;
    };
    module.exports.callbackPromise = (resolve2, reject) => function() {
      const args = Array.from(arguments);
      const err2 = args.shift();
      if (err2) {
        reject(err2);
      } else {
        resolve2(...args);
      }
    };
    module.exports.parseDataURI = (uri) => {
      if (typeof uri !== "string") {
        return null;
      }
      if (!uri.startsWith("data:")) {
        return null;
      }
      const commaPos = uri.indexOf(",");
      if (commaPos === -1) {
        return null;
      }
      const data = uri.substring(commaPos + 1);
      const metaStr = uri.substring("data:".length, commaPos);
      let encoding;
      const metaEntries = metaStr.split(";");
      if (metaEntries.length > 0) {
        const lastEntry = metaEntries[metaEntries.length - 1].toLowerCase().trim();
        if (["base64", "utf8", "utf-8"].includes(lastEntry) && lastEntry.indexOf("=") === -1) {
          encoding = lastEntry;
          metaEntries.pop();
        }
      }
      const contentType = metaEntries.length > 0 ? metaEntries.shift() : "application/octet-stream";
      const params = {};
      for (let i = 0; i < metaEntries.length; i++) {
        const entry = metaEntries[i];
        const sepPos = entry.indexOf("=");
        if (sepPos > 0) {
          const key = entry.substring(0, sepPos).trim();
          const value = entry.substring(sepPos + 1).trim();
          if (key) {
            params[key] = value;
          }
        }
      }
      let bufferData;
      try {
        if (encoding === "base64") {
          bufferData = Buffer.from(data, "base64");
        } else {
          try {
            bufferData = Buffer.from(decodeURIComponent(data));
          } catch (_decodeError) {
            bufferData = Buffer.from(data);
          }
        }
      } catch (_bufferError) {
        bufferData = Buffer.alloc(0);
      }
      return {
        data: bufferData,
        encoding: encoding || null,
        contentType: contentType || "application/octet-stream",
        params
      };
    };
    module.exports.resolveContent = (data, key, options, callback) => {
      if (!callback && typeof options === "function") {
        callback = options;
        options = false;
      }
      options = options || {};
      let promise;
      if (!callback) {
        promise = new Promise((resolve2, reject) => {
          callback = module.exports.callbackPromise(resolve2, reject);
        });
      }
      resolveContentValue(data, key, options, callback);
      return promise;
    };
    function resolveContentValue(data, key, options, callback) {
      let content = data && data[key] && data[key].content || data[key];
      const encoding = (typeof data[key] === "object" && data[key].encoding || "utf8").toString().toLowerCase().replace(/[-_\s]/g, "");
      if (!content) {
        return callback(null, content);
      }
      if (typeof content === "object") {
        if (typeof content.pipe === "function") {
          return resolveStream(content, (err2, value) => {
            if (err2) {
              return callback(err2);
            }
            if (data[key].content) {
              data[key].content = value;
            } else {
              data[key] = value;
            }
            callback(null, value);
          });
        } else if (/^https?:\/\//i.test(content.path || content.href)) {
          if (options.disableUrlAccess) {
            return setImmediate(() => {
              const err2 = new Error("Url access rejected for " + (content.path || content.href));
              err2.code = errors.EURLACCESS;
              callback(err2);
            });
          }
          return resolveStream(nmfetch(content.path || content.href, { headers: content.httpHeaders, tls: content.tls }), callback);
        } else if (/^data:/i.test(content.path || content.href)) {
          const parsedDataUri = module.exports.parseDataURI(content.path || content.href);
          return callback(null, parsedDataUri && parsedDataUri.data ? parsedDataUri.data : Buffer.alloc(0));
        } else if (content.path) {
          if (options.disableFileAccess) {
            return setImmediate(() => {
              const err2 = new Error("File access rejected for " + content.path);
              err2.code = errors.EFILEACCESS;
              callback(err2);
            });
          }
          return resolveStream(fs.createReadStream(content.path), callback);
        }
      }
      if (typeof data[key].content === "string" && !["utf8", "usascii", "ascii"].includes(encoding)) {
        content = Buffer.from(data[key].content, encoding);
      }
      setImmediate(() => callback(null, content));
    }
    module.exports.assign = function() {
      const args = Array.from(arguments);
      const target = args.shift() || {};
      args.forEach((source) => {
        Object.keys(source || {}).forEach((key) => {
          if (["tls", "auth"].includes(key) && source[key] && typeof source[key] === "object") {
            target[key] = Object.assign(target[key] || {}, source[key]);
          } else {
            target[key] = source[key];
          }
        });
      });
      return target;
    };
    module.exports.encodeXText = (str) => {
      if (!/[^\x21-\x2A\x2C-\x3C\x3E-\x7E]/.test(str)) {
        return str;
      }
      const buf = Buffer.from(str);
      let result = "";
      for (let i = 0, len = buf.length; i < len; i++) {
        const c = buf[i];
        if (c < 33 || c > 126 || c === 43 || c === 61) {
          result += "+" + (c < 16 ? "0" : "") + c.toString(16).toUpperCase();
        } else {
          result += String.fromCharCode(c);
        }
      }
      return result;
    };
    function resolveStream(stream, callback) {
      let responded = false;
      const chunks = [];
      let chunklen = 0;
      stream.on("error", (err2) => {
        if (responded) {
          return;
        }
        responded = true;
        callback(err2);
      });
      stream.on("readable", () => {
        let chunk;
        while ((chunk = stream.read()) !== null) {
          chunks.push(chunk);
          chunklen += chunk.length;
        }
      });
      stream.on("end", () => {
        if (responded) {
          return;
        }
        responded = true;
        let value;
        try {
          value = Buffer.concat(chunks, chunklen);
        } catch (E) {
          return callback(E);
        }
        callback(null, value);
      });
    }
    function createDefaultLogger(levels) {
      const levelMaxLen = levels.reduce((max, level) => Math.max(max, level.length), 0);
      const levelNames = /* @__PURE__ */ new Map();
      levels.forEach((level) => {
        let levelName = level.toUpperCase();
        if (levelName.length < levelMaxLen) {
          levelName += " ".repeat(levelMaxLen - levelName.length);
        }
        levelNames.set(level, levelName);
      });
      const print = (level, entry, message, ...args) => {
        let prefix = "";
        if (entry) {
          if (entry.tnx === "server") {
            prefix = "S: ";
          } else if (entry.tnx === "client") {
            prefix = "C: ";
          }
          if (entry.sid) {
            prefix = "[" + entry.sid + "] " + prefix;
          }
          if (entry.cid) {
            prefix = "[#" + entry.cid + "] " + prefix;
          }
        }
        message = util.format(message, ...args);
        message.split(/\r?\n/).forEach((line) => {
          console.log("[%s] %s %s", (/* @__PURE__ */ new Date()).toISOString().substr(0, 19).replace(/T/, " "), levelNames.get(level), prefix + line);
        });
      };
      const logger = {};
      levels.forEach((level) => {
        logger[level] = print.bind(null, level);
      });
      return logger;
    }
  }
});

// node_modules/nodemailer/lib/mime-funcs/mime-types.js
var require_mime_types = __commonJS({
  "node_modules/nodemailer/lib/mime-funcs/mime-types.js"(exports, module) {
    "use strict";
    var path = __require("path");
    var defaultMimeType = "application/octet-stream";
    var defaultExtension = "bin";
    var mimeTypes = /* @__PURE__ */ new Map([
      ["application/acad", "dwg"],
      ["application/applixware", "aw"],
      ["application/arj", "arj"],
      ["application/atom+xml", "xml"],
      ["application/atomcat+xml", "atomcat"],
      ["application/atomsvc+xml", "atomsvc"],
      ["application/base64", ["mm", "mme"]],
      ["application/binhex", "hqx"],
      ["application/binhex4", "hqx"],
      ["application/book", ["book", "boo"]],
      ["application/ccxml+xml,", "ccxml"],
      ["application/cdf", "cdf"],
      ["application/cdmi-capability", "cdmia"],
      ["application/cdmi-container", "cdmic"],
      ["application/cdmi-domain", "cdmid"],
      ["application/cdmi-object", "cdmio"],
      ["application/cdmi-queue", "cdmiq"],
      ["application/clariscad", "ccad"],
      ["application/commonground", "dp"],
      ["application/cu-seeme", "cu"],
      ["application/davmount+xml", "davmount"],
      ["application/drafting", "drw"],
      ["application/dsptype", "tsp"],
      ["application/dssc+der", "dssc"],
      ["application/dssc+xml", "xdssc"],
      ["application/dxf", "dxf"],
      ["application/ecmascript", ["js", "es"]],
      ["application/emma+xml", "emma"],
      ["application/envoy", "evy"],
      ["application/epub+zip", "epub"],
      ["application/excel", ["xls", "xl", "xla", "xlb", "xlc", "xld", "xlk", "xll", "xlm", "xlt", "xlv", "xlw"]],
      ["application/exi", "exi"],
      ["application/font-tdpfr", "pfr"],
      ["application/fractals", "fif"],
      ["application/freeloader", "frl"],
      ["application/futuresplash", "spl"],
      ["application/geo+json", "geojson"],
      ["application/gnutar", "tgz"],
      ["application/groupwise", "vew"],
      ["application/hlp", "hlp"],
      ["application/hta", "hta"],
      ["application/hyperstudio", "stk"],
      ["application/i-deas", "unv"],
      ["application/iges", ["iges", "igs"]],
      ["application/inf", "inf"],
      ["application/internet-property-stream", "acx"],
      ["application/ipfix", "ipfix"],
      ["application/java", "class"],
      ["application/java-archive", "jar"],
      ["application/java-byte-code", "class"],
      ["application/java-serialized-object", "ser"],
      ["application/java-vm", "class"],
      ["application/javascript", "js"],
      ["application/json", "json"],
      ["application/lha", "lha"],
      ["application/lzx", "lzx"],
      ["application/mac-binary", "bin"],
      ["application/mac-binhex", "hqx"],
      ["application/mac-binhex40", "hqx"],
      ["application/mac-compactpro", "cpt"],
      ["application/macbinary", "bin"],
      ["application/mads+xml", "mads"],
      ["application/marc", "mrc"],
      ["application/marcxml+xml", "mrcx"],
      ["application/mathematica", "ma"],
      ["application/mathml+xml", "mathml"],
      ["application/mbedlet", "mbd"],
      ["application/mbox", "mbox"],
      ["application/mcad", "mcd"],
      ["application/mediaservercontrol+xml", "mscml"],
      ["application/metalink4+xml", "meta4"],
      ["application/mets+xml", "mets"],
      ["application/mime", "aps"],
      ["application/mods+xml", "mods"],
      ["application/mp21", "m21"],
      ["application/mp4", "mp4"],
      ["application/mspowerpoint", ["ppt", "pot", "pps", "ppz"]],
      ["application/msword", ["doc", "dot", "w6w", "wiz", "word"]],
      ["application/mswrite", "wri"],
      ["application/mxf", "mxf"],
      ["application/netmc", "mcp"],
      ["application/octet-stream", ["*"]],
      ["application/oda", "oda"],
      ["application/oebps-package+xml", "opf"],
      ["application/ogg", "ogx"],
      ["application/olescript", "axs"],
      ["application/onenote", "onetoc"],
      ["application/patch-ops-error+xml", "xer"],
      ["application/pdf", "pdf"],
      ["application/pgp-encrypted", "asc"],
      ["application/pgp-signature", "pgp"],
      ["application/pics-rules", "prf"],
      ["application/pkcs-12", "p12"],
      ["application/pkcs-crl", "crl"],
      ["application/pkcs10", "p10"],
      ["application/pkcs7-mime", ["p7c", "p7m"]],
      ["application/pkcs7-signature", "p7s"],
      ["application/pkcs8", "p8"],
      ["application/pkix-attr-cert", "ac"],
      ["application/pkix-cert", ["cer", "crt"]],
      ["application/pkix-crl", "crl"],
      ["application/pkix-pkipath", "pkipath"],
      ["application/pkixcmp", "pki"],
      ["application/plain", "text"],
      ["application/pls+xml", "pls"],
      ["application/postscript", ["ps", "ai", "eps"]],
      ["application/powerpoint", "ppt"],
      ["application/pro_eng", ["part", "prt"]],
      ["application/prs.cww", "cww"],
      ["application/pskc+xml", "pskcxml"],
      ["application/rdf+xml", "rdf"],
      ["application/reginfo+xml", "rif"],
      ["application/relax-ng-compact-syntax", "rnc"],
      ["application/resource-lists+xml", "rl"],
      ["application/resource-lists-diff+xml", "rld"],
      ["application/ringing-tones", "rng"],
      ["application/rls-services+xml", "rs"],
      ["application/rsd+xml", "rsd"],
      ["application/rss+xml", "xml"],
      ["application/rtf", ["rtf", "rtx"]],
      ["application/sbml+xml", "sbml"],
      ["application/scvp-cv-request", "scq"],
      ["application/scvp-cv-response", "scs"],
      ["application/scvp-vp-request", "spq"],
      ["application/scvp-vp-response", "spp"],
      ["application/sdp", "sdp"],
      ["application/sea", "sea"],
      ["application/set", "set"],
      ["application/set-payment-initiation", "setpay"],
      ["application/set-registration-initiation", "setreg"],
      ["application/shf+xml", "shf"],
      ["application/sla", "stl"],
      ["application/smil", ["smi", "smil"]],
      ["application/smil+xml", "smi"],
      ["application/solids", "sol"],
      ["application/sounder", "sdr"],
      ["application/sparql-query", "rq"],
      ["application/sparql-results+xml", "srx"],
      ["application/srgs", "gram"],
      ["application/srgs+xml", "grxml"],
      ["application/sru+xml", "sru"],
      ["application/ssml+xml", "ssml"],
      ["application/step", ["step", "stp"]],
      ["application/streamingmedia", "ssm"],
      ["application/tei+xml", "tei"],
      ["application/thraud+xml", "tfi"],
      ["application/timestamped-data", "tsd"],
      ["application/toolbook", "tbk"],
      ["application/vda", "vda"],
      ["application/vnd.3gpp.pic-bw-large", "plb"],
      ["application/vnd.3gpp.pic-bw-small", "psb"],
      ["application/vnd.3gpp.pic-bw-var", "pvb"],
      ["application/vnd.3gpp2.tcap", "tcap"],
      ["application/vnd.3m.post-it-notes", "pwn"],
      ["application/vnd.accpac.simply.aso", "aso"],
      ["application/vnd.accpac.simply.imp", "imp"],
      ["application/vnd.acucobol", "acu"],
      ["application/vnd.acucorp", "atc"],
      ["application/vnd.adobe.air-application-installer-package+zip", "air"],
      ["application/vnd.adobe.fxp", "fxp"],
      ["application/vnd.adobe.xdp+xml", "xdp"],
      ["application/vnd.adobe.xfdf", "xfdf"],
      ["application/vnd.ahead.space", "ahead"],
      ["application/vnd.airzip.filesecure.azf", "azf"],
      ["application/vnd.airzip.filesecure.azs", "azs"],
      ["application/vnd.amazon.ebook", "azw"],
      ["application/vnd.americandynamics.acc", "acc"],
      ["application/vnd.amiga.ami", "ami"],
      ["application/vnd.android.package-archive", "apk"],
      ["application/vnd.anser-web-certificate-issue-initiation", "cii"],
      ["application/vnd.anser-web-funds-transfer-initiation", "fti"],
      ["application/vnd.antix.game-component", "atx"],
      ["application/vnd.apple.installer+xml", "mpkg"],
      ["application/vnd.apple.mpegurl", "m3u8"],
      ["application/vnd.aristanetworks.swi", "swi"],
      ["application/vnd.audiograph", "aep"],
      ["application/vnd.blueice.multipass", "mpm"],
      ["application/vnd.bmi", "bmi"],
      ["application/vnd.businessobjects", "rep"],
      ["application/vnd.chemdraw+xml", "cdxml"],
      ["application/vnd.chipnuts.karaoke-mmd", "mmd"],
      ["application/vnd.cinderella", "cdy"],
      ["application/vnd.claymore", "cla"],
      ["application/vnd.cloanto.rp9", "rp9"],
      ["application/vnd.clonk.c4group", "c4g"],
      ["application/vnd.cluetrust.cartomobile-config", "c11amc"],
      ["application/vnd.cluetrust.cartomobile-config-pkg", "c11amz"],
      ["application/vnd.commonspace", "csp"],
      ["application/vnd.contact.cmsg", "cdbcmsg"],
      ["application/vnd.cosmocaller", "cmc"],
      ["application/vnd.crick.clicker", "clkx"],
      ["application/vnd.crick.clicker.keyboard", "clkk"],
      ["application/vnd.crick.clicker.palette", "clkp"],
      ["application/vnd.crick.clicker.template", "clkt"],
      ["application/vnd.crick.clicker.wordbank", "clkw"],
      ["application/vnd.criticaltools.wbs+xml", "wbs"],
      ["application/vnd.ctc-posml", "pml"],
      ["application/vnd.cups-ppd", "ppd"],
      ["application/vnd.curl.car", "car"],
      ["application/vnd.curl.pcurl", "pcurl"],
      ["application/vnd.data-vision.rdz", "rdz"],
      ["application/vnd.denovo.fcselayout-link", "fe_launch"],
      ["application/vnd.dna", "dna"],
      ["application/vnd.dolby.mlp", "mlp"],
      ["application/vnd.dpgraph", "dpg"],
      ["application/vnd.dreamfactory", "dfac"],
      ["application/vnd.dvb.ait", "ait"],
      ["application/vnd.dvb.service", "svc"],
      ["application/vnd.dynageo", "geo"],
      ["application/vnd.ecowin.chart", "mag"],
      ["application/vnd.enliven", "nml"],
      ["application/vnd.epson.esf", "esf"],
      ["application/vnd.epson.msf", "msf"],
      ["application/vnd.epson.quickanime", "qam"],
      ["application/vnd.epson.salt", "slt"],
      ["application/vnd.epson.ssf", "ssf"],
      ["application/vnd.eszigno3+xml", "es3"],
      ["application/vnd.ezpix-album", "ez2"],
      ["application/vnd.ezpix-package", "ez3"],
      ["application/vnd.fdf", "fdf"],
      ["application/vnd.fdsn.seed", "seed"],
      ["application/vnd.flographit", "gph"],
      ["application/vnd.fluxtime.clip", "ftc"],
      ["application/vnd.framemaker", "fm"],
      ["application/vnd.frogans.fnc", "fnc"],
      ["application/vnd.frogans.ltf", "ltf"],
      ["application/vnd.fsc.weblaunch", "fsc"],
      ["application/vnd.fujitsu.oasys", "oas"],
      ["application/vnd.fujitsu.oasys2", "oa2"],
      ["application/vnd.fujitsu.oasys3", "oa3"],
      ["application/vnd.fujitsu.oasysgp", "fg5"],
      ["application/vnd.fujitsu.oasysprs", "bh2"],
      ["application/vnd.fujixerox.ddd", "ddd"],
      ["application/vnd.fujixerox.docuworks", "xdw"],
      ["application/vnd.fujixerox.docuworks.binder", "xbd"],
      ["application/vnd.fuzzysheet", "fzs"],
      ["application/vnd.genomatix.tuxedo", "txd"],
      ["application/vnd.geogebra.file", "ggb"],
      ["application/vnd.geogebra.tool", "ggt"],
      ["application/vnd.geometry-explorer", "gex"],
      ["application/vnd.geonext", "gxt"],
      ["application/vnd.geoplan", "g2w"],
      ["application/vnd.geospace", "g3w"],
      ["application/vnd.gmx", "gmx"],
      ["application/vnd.google-earth.kml+xml", "kml"],
      ["application/vnd.google-earth.kmz", "kmz"],
      ["application/vnd.grafeq", "gqf"],
      ["application/vnd.groove-account", "gac"],
      ["application/vnd.groove-help", "ghf"],
      ["application/vnd.groove-identity-message", "gim"],
      ["application/vnd.groove-injector", "grv"],
      ["application/vnd.groove-tool-message", "gtm"],
      ["application/vnd.groove-tool-template", "tpl"],
      ["application/vnd.groove-vcard", "vcg"],
      ["application/vnd.hal+xml", "hal"],
      ["application/vnd.handheld-entertainment+xml", "zmm"],
      ["application/vnd.hbci", "hbci"],
      ["application/vnd.hhe.lesson-player", "les"],
      ["application/vnd.hp-hpgl", ["hgl", "hpg", "hpgl"]],
      ["application/vnd.hp-hpid", "hpid"],
      ["application/vnd.hp-hps", "hps"],
      ["application/vnd.hp-jlyt", "jlt"],
      ["application/vnd.hp-pcl", "pcl"],
      ["application/vnd.hp-pclxl", "pclxl"],
      ["application/vnd.hydrostatix.sof-data", "sfd-hdstx"],
      ["application/vnd.hzn-3d-crossword", "x3d"],
      ["application/vnd.ibm.minipay", "mpy"],
      ["application/vnd.ibm.modcap", "afp"],
      ["application/vnd.ibm.rights-management", "irm"],
      ["application/vnd.ibm.secure-container", "sc"],
      ["application/vnd.iccprofile", "icc"],
      ["application/vnd.igloader", "igl"],
      ["application/vnd.immervision-ivp", "ivp"],
      ["application/vnd.immervision-ivu", "ivu"],
      ["application/vnd.insors.igm", "igm"],
      ["application/vnd.intercon.formnet", "xpw"],
      ["application/vnd.intergeo", "i2g"],
      ["application/vnd.intu.qbo", "qbo"],
      ["application/vnd.intu.qfx", "qfx"],
      ["application/vnd.ipunplugged.rcprofile", "rcprofile"],
      ["application/vnd.irepository.package+xml", "irp"],
      ["application/vnd.is-xpr", "xpr"],
      ["application/vnd.isac.fcs", "fcs"],
      ["application/vnd.jam", "jam"],
      ["application/vnd.jcp.javame.midlet-rms", "rms"],
      ["application/vnd.jisp", "jisp"],
      ["application/vnd.joost.joda-archive", "joda"],
      ["application/vnd.kahootz", "ktz"],
      ["application/vnd.kde.karbon", "karbon"],
      ["application/vnd.kde.kchart", "chrt"],
      ["application/vnd.kde.kformula", "kfo"],
      ["application/vnd.kde.kivio", "flw"],
      ["application/vnd.kde.kontour", "kon"],
      ["application/vnd.kde.kpresenter", "kpr"],
      ["application/vnd.kde.kspread", "ksp"],
      ["application/vnd.kde.kword", "kwd"],
      ["application/vnd.kenameaapp", "htke"],
      ["application/vnd.kidspiration", "kia"],
      ["application/vnd.kinar", "kne"],
      ["application/vnd.koan", "skp"],
      ["application/vnd.kodak-descriptor", "sse"],
      ["application/vnd.las.las+xml", "lasxml"],
      ["application/vnd.llamagraphics.life-balance.desktop", "lbd"],
      ["application/vnd.llamagraphics.life-balance.exchange+xml", "lbe"],
      ["application/vnd.lotus-1-2-3", "123"],
      ["application/vnd.lotus-approach", "apr"],
      ["application/vnd.lotus-freelance", "pre"],
      ["application/vnd.lotus-notes", "nsf"],
      ["application/vnd.lotus-organizer", "org"],
      ["application/vnd.lotus-screencam", "scm"],
      ["application/vnd.lotus-wordpro", "lwp"],
      ["application/vnd.macports.portpkg", "portpkg"],
      ["application/vnd.mcd", "mcd"],
      ["application/vnd.medcalcdata", "mc1"],
      ["application/vnd.mediastation.cdkey", "cdkey"],
      ["application/vnd.mfer", "mwf"],
      ["application/vnd.mfmp", "mfm"],
      ["application/vnd.micrografx.flo", "flo"],
      ["application/vnd.micrografx.igx", "igx"],
      ["application/vnd.mif", "mif"],
      ["application/vnd.mobius.daf", "daf"],
      ["application/vnd.mobius.dis", "dis"],
      ["application/vnd.mobius.mbk", "mbk"],
      ["application/vnd.mobius.mqy", "mqy"],
      ["application/vnd.mobius.msl", "msl"],
      ["application/vnd.mobius.plc", "plc"],
      ["application/vnd.mobius.txf", "txf"],
      ["application/vnd.mophun.application", "mpn"],
      ["application/vnd.mophun.certificate", "mpc"],
      ["application/vnd.mozilla.xul+xml", "xul"],
      ["application/vnd.ms-artgalry", "cil"],
      ["application/vnd.ms-cab-compressed", "cab"],
      ["application/vnd.ms-excel", ["xls", "xla", "xlc", "xlm", "xlt", "xlw", "xlb", "xll"]],
      ["application/vnd.ms-excel.addin.macroenabled.12", "xlam"],
      ["application/vnd.ms-excel.sheet.binary.macroenabled.12", "xlsb"],
      ["application/vnd.ms-excel.sheet.macroenabled.12", "xlsm"],
      ["application/vnd.ms-excel.template.macroenabled.12", "xltm"],
      ["application/vnd.ms-fontobject", "eot"],
      ["application/vnd.ms-htmlhelp", "chm"],
      ["application/vnd.ms-ims", "ims"],
      ["application/vnd.ms-lrm", "lrm"],
      ["application/vnd.ms-officetheme", "thmx"],
      ["application/vnd.ms-outlook", "msg"],
      ["application/vnd.ms-pki.certstore", "sst"],
      ["application/vnd.ms-pki.pko", "pko"],
      ["application/vnd.ms-pki.seccat", "cat"],
      ["application/vnd.ms-pki.stl", "stl"],
      ["application/vnd.ms-pkicertstore", "sst"],
      ["application/vnd.ms-pkiseccat", "cat"],
      ["application/vnd.ms-pkistl", "stl"],
      ["application/vnd.ms-powerpoint", ["ppt", "pot", "pps", "ppa", "pwz"]],
      ["application/vnd.ms-powerpoint.addin.macroenabled.12", "ppam"],
      ["application/vnd.ms-powerpoint.presentation.macroenabled.12", "pptm"],
      ["application/vnd.ms-powerpoint.slide.macroenabled.12", "sldm"],
      ["application/vnd.ms-powerpoint.slideshow.macroenabled.12", "ppsm"],
      ["application/vnd.ms-powerpoint.template.macroenabled.12", "potm"],
      ["application/vnd.ms-project", "mpp"],
      ["application/vnd.ms-word.document.macroenabled.12", "docm"],
      ["application/vnd.ms-word.template.macroenabled.12", "dotm"],
      ["application/vnd.ms-works", ["wks", "wcm", "wdb", "wps"]],
      ["application/vnd.ms-wpl", "wpl"],
      ["application/vnd.ms-xpsdocument", "xps"],
      ["application/vnd.mseq", "mseq"],
      ["application/vnd.musician", "mus"],
      ["application/vnd.muvee.style", "msty"],
      ["application/vnd.neurolanguage.nlu", "nlu"],
      ["application/vnd.noblenet-directory", "nnd"],
      ["application/vnd.noblenet-sealer", "nns"],
      ["application/vnd.noblenet-web", "nnw"],
      ["application/vnd.nokia.configuration-message", "ncm"],
      ["application/vnd.nokia.n-gage.data", "ngdat"],
      ["application/vnd.nokia.n-gage.symbian.install", "n-gage"],
      ["application/vnd.nokia.radio-preset", "rpst"],
      ["application/vnd.nokia.radio-presets", "rpss"],
      ["application/vnd.nokia.ringing-tone", "rng"],
      ["application/vnd.novadigm.edm", "edm"],
      ["application/vnd.novadigm.edx", "edx"],
      ["application/vnd.novadigm.ext", "ext"],
      ["application/vnd.oasis.opendocument.chart", "odc"],
      ["application/vnd.oasis.opendocument.chart-template", "otc"],
      ["application/vnd.oasis.opendocument.database", "odb"],
      ["application/vnd.oasis.opendocument.formula", "odf"],
      ["application/vnd.oasis.opendocument.formula-template", "odft"],
      ["application/vnd.oasis.opendocument.graphics", "odg"],
      ["application/vnd.oasis.opendocument.graphics-template", "otg"],
      ["application/vnd.oasis.opendocument.image", "odi"],
      ["application/vnd.oasis.opendocument.image-template", "oti"],
      ["application/vnd.oasis.opendocument.presentation", "odp"],
      ["application/vnd.oasis.opendocument.presentation-template", "otp"],
      ["application/vnd.oasis.opendocument.spreadsheet", "ods"],
      ["application/vnd.oasis.opendocument.spreadsheet-template", "ots"],
      ["application/vnd.oasis.opendocument.text", "odt"],
      ["application/vnd.oasis.opendocument.text-master", "odm"],
      ["application/vnd.oasis.opendocument.text-template", "ott"],
      ["application/vnd.oasis.opendocument.text-web", "oth"],
      ["application/vnd.olpc-sugar", "xo"],
      ["application/vnd.oma.dd2+xml", "dd2"],
      ["application/vnd.openofficeorg.extension", "oxt"],
      ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
      ["application/vnd.openxmlformats-officedocument.presentationml.slide", "sldx"],
      ["application/vnd.openxmlformats-officedocument.presentationml.slideshow", "ppsx"],
      ["application/vnd.openxmlformats-officedocument.presentationml.template", "potx"],
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"],
      ["application/vnd.openxmlformats-officedocument.spreadsheetml.template", "xltx"],
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"],
      ["application/vnd.openxmlformats-officedocument.wordprocessingml.template", "dotx"],
      ["application/vnd.osgeo.mapguide.package", "mgp"],
      ["application/vnd.osgi.dp", "dp"],
      ["application/vnd.palm", "pdb"],
      ["application/vnd.pawaafile", "paw"],
      ["application/vnd.pg.format", "str"],
      ["application/vnd.pg.osasli", "ei6"],
      ["application/vnd.picsel", "efif"],
      ["application/vnd.pmi.widget", "wg"],
      ["application/vnd.pocketlearn", "plf"],
      ["application/vnd.powerbuilder6", "pbd"],
      ["application/vnd.previewsystems.box", "box"],
      ["application/vnd.proteus.magazine", "mgz"],
      ["application/vnd.publishare-delta-tree", "qps"],
      ["application/vnd.pvi.ptid1", "ptid"],
      ["application/vnd.quark.quarkxpress", "qxd"],
      ["application/vnd.realvnc.bed", "bed"],
      ["application/vnd.recordare.musicxml", "mxl"],
      ["application/vnd.recordare.musicxml+xml", "musicxml"],
      ["application/vnd.rig.cryptonote", "cryptonote"],
      ["application/vnd.rim.cod", "cod"],
      ["application/vnd.rn-realmedia", "rm"],
      ["application/vnd.rn-realplayer", "rnx"],
      ["application/vnd.route66.link66+xml", "link66"],
      ["application/vnd.sailingtracker.track", "st"],
      ["application/vnd.seemail", "see"],
      ["application/vnd.sema", "sema"],
      ["application/vnd.semd", "semd"],
      ["application/vnd.semf", "semf"],
      ["application/vnd.shana.informed.formdata", "ifm"],
      ["application/vnd.shana.informed.formtemplate", "itp"],
      ["application/vnd.shana.informed.interchange", "iif"],
      ["application/vnd.shana.informed.package", "ipk"],
      ["application/vnd.simtech-mindmapper", "twd"],
      ["application/vnd.smaf", "mmf"],
      ["application/vnd.smart.teacher", "teacher"],
      ["application/vnd.solent.sdkm+xml", "sdkm"],
      ["application/vnd.spotfire.dxp", "dxp"],
      ["application/vnd.spotfire.sfs", "sfs"],
      ["application/vnd.stardivision.calc", "sdc"],
      ["application/vnd.stardivision.draw", "sda"],
      ["application/vnd.stardivision.impress", "sdd"],
      ["application/vnd.stardivision.math", "smf"],
      ["application/vnd.stardivision.writer", "sdw"],
      ["application/vnd.stardivision.writer-global", "sgl"],
      ["application/vnd.stepmania.stepchart", "sm"],
      ["application/vnd.sun.xml.calc", "sxc"],
      ["application/vnd.sun.xml.calc.template", "stc"],
      ["application/vnd.sun.xml.draw", "sxd"],
      ["application/vnd.sun.xml.draw.template", "std"],
      ["application/vnd.sun.xml.impress", "sxi"],
      ["application/vnd.sun.xml.impress.template", "sti"],
      ["application/vnd.sun.xml.math", "sxm"],
      ["application/vnd.sun.xml.writer", "sxw"],
      ["application/vnd.sun.xml.writer.global", "sxg"],
      ["application/vnd.sun.xml.writer.template", "stw"],
      ["application/vnd.sus-calendar", "sus"],
      ["application/vnd.svd", "svd"],
      ["application/vnd.symbian.install", "sis"],
      ["application/vnd.syncml+xml", "xsm"],
      ["application/vnd.syncml.dm+wbxml", "bdm"],
      ["application/vnd.syncml.dm+xml", "xdm"],
      ["application/vnd.tao.intent-module-archive", "tao"],
      ["application/vnd.tmobile-livetv", "tmo"],
      ["application/vnd.trid.tpt", "tpt"],
      ["application/vnd.triscape.mxs", "mxs"],
      ["application/vnd.trueapp", "tra"],
      ["application/vnd.ufdl", "ufd"],
      ["application/vnd.uiq.theme", "utz"],
      ["application/vnd.umajin", "umj"],
      ["application/vnd.unity", "unityweb"],
      ["application/vnd.uoml+xml", "uoml"],
      ["application/vnd.vcx", "vcx"],
      ["application/vnd.visio", "vsd"],
      ["application/vnd.visionary", "vis"],
      ["application/vnd.vsf", "vsf"],
      ["application/vnd.wap.wbxml", "wbxml"],
      ["application/vnd.wap.wmlc", "wmlc"],
      ["application/vnd.wap.wmlscriptc", "wmlsc"],
      ["application/vnd.webturbo", "wtb"],
      ["application/vnd.wolfram.player", "nbp"],
      ["application/vnd.wordperfect", "wpd"],
      ["application/vnd.wqd", "wqd"],
      ["application/vnd.wt.stf", "stf"],
      ["application/vnd.xara", ["web", "xar"]],
      ["application/vnd.xfdl", "xfdl"],
      ["application/vnd.yamaha.hv-dic", "hvd"],
      ["application/vnd.yamaha.hv-script", "hvs"],
      ["application/vnd.yamaha.hv-voice", "hvp"],
      ["application/vnd.yamaha.openscoreformat", "osf"],
      ["application/vnd.yamaha.openscoreformat.osfpvg+xml", "osfpvg"],
      ["application/vnd.yamaha.smaf-audio", "saf"],
      ["application/vnd.yamaha.smaf-phrase", "spf"],
      ["application/vnd.yellowriver-custom-menu", "cmp"],
      ["application/vnd.zul", "zir"],
      ["application/vnd.zzazz.deck+xml", "zaz"],
      ["application/vocaltec-media-desc", "vmd"],
      ["application/vocaltec-media-file", "vmf"],
      ["application/voicexml+xml", "vxml"],
      ["application/widget", "wgt"],
      ["application/winhlp", "hlp"],
      ["application/wordperfect", ["wp", "wp5", "wp6", "wpd"]],
      ["application/wordperfect6.0", ["w60", "wp5"]],
      ["application/wordperfect6.1", "w61"],
      ["application/wsdl+xml", "wsdl"],
      ["application/wspolicy+xml", "wspolicy"],
      ["application/x-123", "wk1"],
      ["application/x-7z-compressed", "7z"],
      ["application/x-abiword", "abw"],
      ["application/x-ace-compressed", "ace"],
      ["application/x-aim", "aim"],
      ["application/x-authorware-bin", "aab"],
      ["application/x-authorware-map", "aam"],
      ["application/x-authorware-seg", "aas"],
      ["application/x-bcpio", "bcpio"],
      ["application/x-binary", "bin"],
      ["application/x-binhex40", "hqx"],
      ["application/x-bittorrent", "torrent"],
      ["application/x-bsh", ["bsh", "sh", "shar"]],
      ["application/x-bytecode.elisp", "elc"],
      ["application/x-bytecode.python", "pyc"],
      ["application/x-bzip", "bz"],
      ["application/x-bzip2", ["boz", "bz2"]],
      ["application/x-cdf", "cdf"],
      ["application/x-cdlink", "vcd"],
      ["application/x-chat", ["cha", "chat"]],
      ["application/x-chess-pgn", "pgn"],
      ["application/x-cmu-raster", "ras"],
      ["application/x-cocoa", "cco"],
      ["application/x-compactpro", "cpt"],
      ["application/x-compress", "z"],
      ["application/x-compressed", ["tgz", "gz", "z", "zip"]],
      ["application/x-conference", "nsc"],
      ["application/x-cpio", "cpio"],
      ["application/x-cpt", "cpt"],
      ["application/x-csh", "csh"],
      ["application/x-debian-package", "deb"],
      ["application/x-deepv", "deepv"],
      ["application/x-director", ["dir", "dcr", "dxr"]],
      ["application/x-doom", "wad"],
      ["application/x-dtbncx+xml", "ncx"],
      ["application/x-dtbook+xml", "dtb"],
      ["application/x-dtbresource+xml", "res"],
      ["application/x-dvi", "dvi"],
      ["application/x-elc", "elc"],
      ["application/x-envoy", ["env", "evy"]],
      ["application/x-esrehber", "es"],
      ["application/x-excel", ["xls", "xla", "xlb", "xlc", "xld", "xlk", "xll", "xlm", "xlt", "xlv", "xlw"]],
      ["application/x-font-bdf", "bdf"],
      ["application/x-font-ghostscript", "gsf"],
      ["application/x-font-linux-psf", "psf"],
      ["application/x-font-otf", "otf"],
      ["application/x-font-pcf", "pcf"],
      ["application/x-font-snf", "snf"],
      ["application/x-font-ttf", "ttf"],
      ["application/x-font-type1", "pfa"],
      ["application/x-font-woff", "woff"],
      ["application/x-frame", "mif"],
      ["application/x-freelance", "pre"],
      ["application/x-futuresplash", "spl"],
      ["application/x-gnumeric", "gnumeric"],
      ["application/x-gsp", "gsp"],
      ["application/x-gss", "gss"],
      ["application/x-gtar", "gtar"],
      ["application/x-gzip", ["gz", "gzip"]],
      ["application/x-hdf", "hdf"],
      ["application/x-helpfile", ["help", "hlp"]],
      ["application/x-httpd-imap", "imap"],
      ["application/x-ima", "ima"],
      ["application/x-internet-signup", ["ins", "isp"]],
      ["application/x-internett-signup", "ins"],
      ["application/x-inventor", "iv"],
      ["application/x-ip2", "ip"],
      ["application/x-iphone", "iii"],
      ["application/x-java-class", "class"],
      ["application/x-java-commerce", "jcm"],
      ["application/x-java-jnlp-file", "jnlp"],
      ["application/x-javascript", "js"],
      ["application/x-koan", ["skd", "skm", "skp", "skt"]],
      ["application/x-ksh", "ksh"],
      ["application/x-latex", ["latex", "ltx"]],
      ["application/x-lha", "lha"],
      ["application/x-lisp", "lsp"],
      ["application/x-livescreen", "ivy"],
      ["application/x-lotus", "wq1"],
      ["application/x-lotusscreencam", "scm"],
      ["application/x-lzh", "lzh"],
      ["application/x-lzx", "lzx"],
      ["application/x-mac-binhex40", "hqx"],
      ["application/x-macbinary", "bin"],
      ["application/x-magic-cap-package-1.0", "mc$"],
      ["application/x-mathcad", "mcd"],
      ["application/x-meme", "mm"],
      ["application/x-midi", ["mid", "midi"]],
      ["application/x-mif", "mif"],
      ["application/x-mix-transfer", "nix"],
      ["application/x-mobipocket-ebook", "prc"],
      ["application/x-mplayer2", "asx"],
      ["application/x-ms-application", "application"],
      ["application/x-ms-wmd", "wmd"],
      ["application/x-ms-wmz", "wmz"],
      ["application/x-ms-xbap", "xbap"],
      ["application/x-msaccess", "mdb"],
      ["application/x-msbinder", "obd"],
      ["application/x-mscardfile", "crd"],
      ["application/x-msclip", "clp"],
      ["application/x-msdownload", ["exe", "dll"]],
      ["application/x-msexcel", ["xls", "xla", "xlw"]],
      ["application/x-msmediaview", ["mvb", "m13", "m14"]],
      ["application/x-msmetafile", "wmf"],
      ["application/x-msmoney", "mny"],
      ["application/x-mspowerpoint", "ppt"],
      ["application/x-mspublisher", "pub"],
      ["application/x-msschedule", "scd"],
      ["application/x-msterminal", "trm"],
      ["application/x-mswrite", "wri"],
      ["application/x-navi-animation", "ani"],
      ["application/x-navidoc", "nvd"],
      ["application/x-navimap", "map"],
      ["application/x-navistyle", "stl"],
      ["application/x-netcdf", ["cdf", "nc"]],
      ["application/x-newton-compatible-pkg", "pkg"],
      ["application/x-nokia-9000-communicator-add-on-software", "aos"],
      ["application/x-omc", "omc"],
      ["application/x-omcdatamaker", "omcd"],
      ["application/x-omcregerator", "omcr"],
      ["application/x-pagemaker", ["pm4", "pm5"]],
      ["application/x-pcl", "pcl"],
      ["application/x-perfmon", ["pma", "pmc", "pml", "pmr", "pmw"]],
      ["application/x-pixclscript", "plx"],
      ["application/x-pkcs10", "p10"],
      ["application/x-pkcs12", ["p12", "pfx"]],
      ["application/x-pkcs7-certificates", ["p7b", "spc"]],
      ["application/x-pkcs7-certreqresp", "p7r"],
      ["application/x-pkcs7-mime", ["p7m", "p7c"]],
      ["application/x-pkcs7-signature", ["p7s", "p7a"]],
      ["application/x-pointplus", "css"],
      ["application/x-portable-anymap", "pnm"],
      ["application/x-project", ["mpc", "mpt", "mpv", "mpx"]],
      ["application/x-qpro", "wb1"],
      ["application/x-rar-compressed", "rar"],
      ["application/x-rtf", "rtf"],
      ["application/x-sdp", "sdp"],
      ["application/x-sea", "sea"],
      ["application/x-seelogo", "sl"],
      ["application/x-sh", "sh"],
      ["application/x-shar", ["shar", "sh"]],
      ["application/x-shockwave-flash", "swf"],
      ["application/x-silverlight-app", "xap"],
      ["application/x-sit", "sit"],
      ["application/x-sprite", ["spr", "sprite"]],
      ["application/x-stuffit", "sit"],
      ["application/x-stuffitx", "sitx"],
      ["application/x-sv4cpio", "sv4cpio"],
      ["application/x-sv4crc", "sv4crc"],
      ["application/x-tar", "tar"],
      ["application/x-tbook", ["sbk", "tbk"]],
      ["application/x-tcl", "tcl"],
      ["application/x-tex", "tex"],
      ["application/x-tex-tfm", "tfm"],
      ["application/x-texinfo", ["texi", "texinfo"]],
      ["application/x-troff", ["roff", "t", "tr"]],
      ["application/x-troff-man", "man"],
      ["application/x-troff-me", "me"],
      ["application/x-troff-ms", "ms"],
      ["application/x-troff-msvideo", "avi"],
      ["application/x-ustar", "ustar"],
      ["application/x-visio", ["vsd", "vst", "vsw"]],
      ["application/x-vnd.audioexplosion.mzz", "mzz"],
      ["application/x-vnd.ls-xpix", "xpix"],
      ["application/x-vrml", "vrml"],
      ["application/x-wais-source", ["src", "wsrc"]],
      ["application/x-winhelp", "hlp"],
      ["application/x-wintalk", "wtk"],
      ["application/x-world", ["wrl", "svr"]],
      ["application/x-wpwin", "wpd"],
      ["application/x-wri", "wri"],
      ["application/x-x509-ca-cert", ["cer", "crt", "der"]],
      ["application/x-x509-user-cert", "crt"],
      ["application/x-xfig", "fig"],
      ["application/x-xpinstall", "xpi"],
      ["application/x-zip-compressed", "zip"],
      ["application/xcap-diff+xml", "xdf"],
      ["application/xenc+xml", "xenc"],
      ["application/xhtml+xml", "xhtml"],
      ["application/xml", "xml"],
      ["application/xml-dtd", "dtd"],
      ["application/xop+xml", "xop"],
      ["application/xslt+xml", "xslt"],
      ["application/xspf+xml", "xspf"],
      ["application/xv+xml", "mxml"],
      ["application/yang", "yang"],
      ["application/yin+xml", "yin"],
      ["application/ynd.ms-pkipko", "pko"],
      ["application/zip", "zip"],
      ["audio/adpcm", "adp"],
      ["audio/aiff", ["aiff", "aif", "aifc"]],
      ["audio/basic", ["snd", "au"]],
      ["audio/it", "it"],
      ["audio/make", ["funk", "my", "pfunk"]],
      ["audio/make.my.funk", "pfunk"],
      ["audio/mid", ["mid", "rmi"]],
      ["audio/midi", ["midi", "kar", "mid"]],
      ["audio/mod", "mod"],
      ["audio/mp4", "mp4a"],
      ["audio/mpeg", ["mpga", "mp3", "m2a", "mp2", "mpa", "mpg"]],
      ["audio/mpeg3", "mp3"],
      ["audio/nspaudio", ["la", "lma"]],
      ["audio/ogg", "oga"],
      ["audio/s3m", "s3m"],
      ["audio/tsp-audio", "tsi"],
      ["audio/tsplayer", "tsp"],
      ["audio/vnd.dece.audio", "uva"],
      ["audio/vnd.digital-winds", "eol"],
      ["audio/vnd.dra", "dra"],
      ["audio/vnd.dts", "dts"],
      ["audio/vnd.dts.hd", "dtshd"],
      ["audio/vnd.lucent.voice", "lvp"],
      ["audio/vnd.ms-playready.media.pya", "pya"],
      ["audio/vnd.nuera.ecelp4800", "ecelp4800"],
      ["audio/vnd.nuera.ecelp7470", "ecelp7470"],
      ["audio/vnd.nuera.ecelp9600", "ecelp9600"],
      ["audio/vnd.qcelp", "qcp"],
      ["audio/vnd.rip", "rip"],
      ["audio/voc", "voc"],
      ["audio/voxware", "vox"],
      ["audio/wav", "wav"],
      ["audio/webm", "weba"],
      ["audio/x-aac", "aac"],
      ["audio/x-adpcm", "snd"],
      ["audio/x-aiff", ["aiff", "aif", "aifc"]],
      ["audio/x-au", "au"],
      ["audio/x-gsm", ["gsd", "gsm"]],
      ["audio/x-jam", "jam"],
      ["audio/x-liveaudio", "lam"],
      ["audio/x-mid", ["mid", "midi"]],
      ["audio/x-midi", ["midi", "mid"]],
      ["audio/x-mod", "mod"],
      ["audio/x-mpeg", "mp2"],
      ["audio/x-mpeg-3", "mp3"],
      ["audio/x-mpegurl", "m3u"],
      ["audio/x-mpequrl", "m3u"],
      ["audio/x-ms-wax", "wax"],
      ["audio/x-ms-wma", "wma"],
      ["audio/x-nspaudio", ["la", "lma"]],
      ["audio/x-pn-realaudio", ["ra", "ram", "rm", "rmm", "rmp"]],
      ["audio/x-pn-realaudio-plugin", ["ra", "rmp", "rpm"]],
      ["audio/x-psid", "sid"],
      ["audio/x-realaudio", "ra"],
      ["audio/x-twinvq", "vqf"],
      ["audio/x-twinvq-plugin", ["vqe", "vql"]],
      ["audio/x-vnd.audioexplosion.mjuicemediafile", "mjf"],
      ["audio/x-voc", "voc"],
      ["audio/x-wav", "wav"],
      ["audio/xm", "xm"],
      ["chemical/x-cdx", "cdx"],
      ["chemical/x-cif", "cif"],
      ["chemical/x-cmdf", "cmdf"],
      ["chemical/x-cml", "cml"],
      ["chemical/x-csml", "csml"],
      ["chemical/x-pdb", ["pdb", "xyz"]],
      ["chemical/x-xyz", "xyz"],
      ["drawing/x-dwf", "dwf"],
      ["i-world/i-vrml", "ivr"],
      ["image/bmp", ["bmp", "bm"]],
      ["image/cgm", "cgm"],
      ["image/cis-cod", "cod"],
      ["image/cmu-raster", ["ras", "rast"]],
      ["image/fif", "fif"],
      ["image/florian", ["flo", "turbot"]],
      ["image/g3fax", "g3"],
      ["image/gif", "gif"],
      ["image/ief", ["ief", "iefs"]],
      ["image/jpeg", ["jpeg", "jpe", "jpg", "jfif", "jfif-tbnl"]],
      ["image/jutvision", "jut"],
      ["image/ktx", "ktx"],
      ["image/naplps", ["nap", "naplps"]],
      ["image/pict", ["pic", "pict"]],
      ["image/pipeg", "jfif"],
      ["image/pjpeg", ["jfif", "jpe", "jpeg", "jpg"]],
      ["image/png", ["png", "x-png"]],
      ["image/prs.btif", "btif"],
      ["image/svg+xml", "svg"],
      ["image/tiff", ["tif", "tiff"]],
      ["image/vasa", "mcf"],
      ["image/vnd.adobe.photoshop", "psd"],
      ["image/vnd.dece.graphic", "uvi"],
      ["image/vnd.djvu", "djvu"],
      ["image/vnd.dvb.subtitle", "sub"],
      ["image/vnd.dwg", ["dwg", "dxf", "svf"]],
      ["image/vnd.dxf", "dxf"],
      ["image/vnd.fastbidsheet", "fbs"],
      ["image/vnd.fpx", "fpx"],
      ["image/vnd.fst", "fst"],
      ["image/vnd.fujixerox.edmics-mmr", "mmr"],
      ["image/vnd.fujixerox.edmics-rlc", "rlc"],
      ["image/vnd.ms-modi", "mdi"],
      ["image/vnd.net-fpx", ["fpx", "npx"]],
      ["image/vnd.rn-realflash", "rf"],
      ["image/vnd.rn-realpix", "rp"],
      ["image/vnd.wap.wbmp", "wbmp"],
      ["image/vnd.xiff", "xif"],
      ["image/webp", "webp"],
      ["image/x-cmu-raster", "ras"],
      ["image/x-cmx", "cmx"],
      ["image/x-dwg", ["dwg", "dxf", "svf"]],
      ["image/x-freehand", "fh"],
      ["image/x-icon", "ico"],
      ["image/x-jg", "art"],
      ["image/x-jps", "jps"],
      ["image/x-niff", ["niff", "nif"]],
      ["image/x-pcx", "pcx"],
      ["image/x-pict", ["pct", "pic"]],
      ["image/x-portable-anymap", "pnm"],
      ["image/x-portable-bitmap", "pbm"],
      ["image/x-portable-graymap", "pgm"],
      ["image/x-portable-greymap", "pgm"],
      ["image/x-portable-pixmap", "ppm"],
      ["image/x-quicktime", ["qif", "qti", "qtif"]],
      ["image/x-rgb", "rgb"],
      ["image/x-tiff", ["tif", "tiff"]],
      ["image/x-windows-bmp", "bmp"],
      ["image/x-xbitmap", "xbm"],
      ["image/x-xbm", "xbm"],
      ["image/x-xpixmap", ["xpm", "pm"]],
      ["image/x-xwd", "xwd"],
      ["image/x-xwindowdump", "xwd"],
      ["image/xbm", "xbm"],
      ["image/xpm", "xpm"],
      ["message/rfc822", ["eml", "mht", "mhtml", "nws", "mime"]],
      ["model/iges", ["iges", "igs"]],
      ["model/mesh", "msh"],
      ["model/vnd.collada+xml", "dae"],
      ["model/vnd.dwf", "dwf"],
      ["model/vnd.gdl", "gdl"],
      ["model/vnd.gtw", "gtw"],
      ["model/vnd.mts", "mts"],
      ["model/vnd.vtu", "vtu"],
      ["model/vrml", ["vrml", "wrl", "wrz"]],
      ["model/x-pov", "pov"],
      ["multipart/x-gzip", "gzip"],
      ["multipart/x-ustar", "ustar"],
      ["multipart/x-zip", "zip"],
      ["music/crescendo", ["mid", "midi"]],
      ["music/x-karaoke", "kar"],
      ["paleovu/x-pv", "pvu"],
      ["text/asp", "asp"],
      ["text/calendar", "ics"],
      ["text/css", "css"],
      ["text/csv", "csv"],
      ["text/ecmascript", "js"],
      ["text/h323", "323"],
      ["text/html", ["html", "htm", "stm", "acgi", "htmls", "htx", "shtml"]],
      ["text/iuls", "uls"],
      ["text/javascript", "js"],
      ["text/mcf", "mcf"],
      ["text/n3", "n3"],
      ["text/pascal", "pas"],
      [
        "text/plain",
        [
          "txt",
          "bas",
          "c",
          "h",
          "c++",
          "cc",
          "com",
          "conf",
          "cxx",
          "def",
          "f",
          "f90",
          "for",
          "g",
          "hh",
          "idc",
          "jav",
          "java",
          "list",
          "log",
          "lst",
          "m",
          "mar",
          "pl",
          "sdml",
          "text"
        ]
      ],
      ["text/plain-bas", "par"],
      ["text/prs.lines.tag", "dsc"],
      ["text/richtext", ["rtx", "rt", "rtf"]],
      ["text/scriplet", "wsc"],
      ["text/scriptlet", "sct"],
      ["text/sgml", ["sgm", "sgml"]],
      ["text/tab-separated-values", "tsv"],
      ["text/troff", "t"],
      ["text/turtle", "ttl"],
      ["text/uri-list", ["uni", "unis", "uri", "uris"]],
      ["text/vnd.abc", "abc"],
      ["text/vnd.curl", "curl"],
      ["text/vnd.curl.dcurl", "dcurl"],
      ["text/vnd.curl.mcurl", "mcurl"],
      ["text/vnd.curl.scurl", "scurl"],
      ["text/vnd.fly", "fly"],
      ["text/vnd.fmi.flexstor", "flx"],
      ["text/vnd.graphviz", "gv"],
      ["text/vnd.in3d.3dml", "3dml"],
      ["text/vnd.in3d.spot", "spot"],
      ["text/vnd.rn-realtext", "rt"],
      ["text/vnd.sun.j2me.app-descriptor", "jad"],
      ["text/vnd.wap.wml", "wml"],
      ["text/vnd.wap.wmlscript", "wmls"],
      ["text/webviewhtml", "htt"],
      ["text/x-asm", ["asm", "s"]],
      ["text/x-audiosoft-intra", "aip"],
      ["text/x-c", ["c", "cc", "cpp"]],
      ["text/x-component", "htc"],
      ["text/x-fortran", ["for", "f", "f77", "f90"]],
      ["text/x-h", ["h", "hh"]],
      ["text/x-java-source", ["java", "jav"]],
      ["text/x-java-source,java", "java"],
      ["text/x-la-asf", "lsx"],
      ["text/x-m", "m"],
      ["text/x-pascal", "p"],
      ["text/x-script", "hlb"],
      ["text/x-script.csh", "csh"],
      ["text/x-script.elisp", "el"],
      ["text/x-script.guile", "scm"],
      ["text/x-script.ksh", "ksh"],
      ["text/x-script.lisp", "lsp"],
      ["text/x-script.perl", "pl"],
      ["text/x-script.perl-module", "pm"],
      ["text/x-script.phyton", "py"],
      ["text/x-script.rexx", "rexx"],
      ["text/x-script.scheme", "scm"],
      ["text/x-script.sh", "sh"],
      ["text/x-script.tcl", "tcl"],
      ["text/x-script.tcsh", "tcsh"],
      ["text/x-script.zsh", "zsh"],
      ["text/x-server-parsed-html", ["shtml", "ssi"]],
      ["text/x-setext", "etx"],
      ["text/x-sgml", ["sgm", "sgml"]],
      ["text/x-speech", ["spc", "talk"]],
      ["text/x-uil", "uil"],
      ["text/x-uuencode", ["uu", "uue"]],
      ["text/x-vcalendar", "vcs"],
      ["text/x-vcard", "vcf"],
      ["text/xml", "xml"],
      ["video/3gpp", "3gp"],
      ["video/3gpp2", "3g2"],
      ["video/animaflex", "afl"],
      ["video/avi", "avi"],
      ["video/avs-video", "avs"],
      ["video/dl", "dl"],
      ["video/fli", "fli"],
      ["video/gl", "gl"],
      ["video/h261", "h261"],
      ["video/h263", "h263"],
      ["video/h264", "h264"],
      ["video/jpeg", "jpgv"],
      ["video/jpm", "jpm"],
      ["video/mj2", "mj2"],
      ["video/mp4", "mp4"],
      ["video/mpeg", ["mpeg", "mp2", "mpa", "mpe", "mpg", "mpv2", "m1v", "m2v", "mp3"]],
      ["video/msvideo", "avi"],
      ["video/ogg", "ogv"],
      ["video/quicktime", ["mov", "qt", "moov"]],
      ["video/vdo", "vdo"],
      ["video/vivo", ["viv", "vivo"]],
      ["video/vnd.dece.hd", "uvh"],
      ["video/vnd.dece.mobile", "uvm"],
      ["video/vnd.dece.pd", "uvp"],
      ["video/vnd.dece.sd", "uvs"],
      ["video/vnd.dece.video", "uvv"],
      ["video/vnd.fvt", "fvt"],
      ["video/vnd.mpegurl", "mxu"],
      ["video/vnd.ms-playready.media.pyv", "pyv"],
      ["video/vnd.rn-realvideo", "rv"],
      ["video/vnd.uvvu.mp4", "uvu"],
      ["video/vnd.vivo", ["viv", "vivo"]],
      ["video/vosaic", "vos"],
      ["video/webm", "webm"],
      ["video/x-amt-demorun", "xdr"],
      ["video/x-amt-showrun", "xsr"],
      ["video/x-atomic3d-feature", "fmf"],
      ["video/x-dl", "dl"],
      ["video/x-dv", ["dif", "dv"]],
      ["video/x-f4v", "f4v"],
      ["video/x-fli", "fli"],
      ["video/x-flv", "flv"],
      ["video/x-gl", "gl"],
      ["video/x-isvideo", "isu"],
      ["video/x-la-asf", ["lsf", "lsx"]],
      ["video/x-m4v", "m4v"],
      ["video/x-motion-jpeg", "mjpg"],
      ["video/x-mpeg", ["mp3", "mp2"]],
      ["video/x-mpeq2a", "mp2"],
      ["video/x-ms-asf", ["asf", "asr", "asx"]],
      ["video/x-ms-asf-plugin", "asx"],
      ["video/x-ms-wm", "wm"],
      ["video/x-ms-wmv", "wmv"],
      ["video/x-ms-wmx", "wmx"],
      ["video/x-ms-wvx", "wvx"],
      ["video/x-msvideo", "avi"],
      ["video/x-qtc", "qtc"],
      ["video/x-scm", "scm"],
      ["video/x-sgi-movie", ["movie", "mv"]],
      ["windows/metafile", "wmf"],
      ["www/mime", "mime"],
      ["x-conference/x-cooltalk", "ice"],
      ["x-music/x-midi", ["mid", "midi"]],
      ["x-world/x-3dmf", ["3dm", "3dmf", "qd3", "qd3d"]],
      ["x-world/x-svr", "svr"],
      ["x-world/x-vrml", ["flr", "vrml", "wrl", "wrz", "xaf", "xof"]],
      ["x-world/x-vrt", "vrt"],
      ["xgl/drawing", "xgz"],
      ["xgl/movie", "xmz"]
    ]);
    var extensions = /* @__PURE__ */ new Map([
      ["123", "application/vnd.lotus-1-2-3"],
      ["323", "text/h323"],
      ["*", "application/octet-stream"],
      ["3dm", "x-world/x-3dmf"],
      ["3dmf", "x-world/x-3dmf"],
      ["3dml", "text/vnd.in3d.3dml"],
      ["3g2", "video/3gpp2"],
      ["3gp", "video/3gpp"],
      ["7z", "application/x-7z-compressed"],
      ["a", "application/octet-stream"],
      ["aab", "application/x-authorware-bin"],
      ["aac", "audio/x-aac"],
      ["aam", "application/x-authorware-map"],
      ["aas", "application/x-authorware-seg"],
      ["abc", "text/vnd.abc"],
      ["abw", "application/x-abiword"],
      ["ac", "application/pkix-attr-cert"],
      ["acc", "application/vnd.americandynamics.acc"],
      ["ace", "application/x-ace-compressed"],
      ["acgi", "text/html"],
      ["acu", "application/vnd.acucobol"],
      ["acx", "application/internet-property-stream"],
      ["adp", "audio/adpcm"],
      ["aep", "application/vnd.audiograph"],
      ["afl", "video/animaflex"],
      ["afp", "application/vnd.ibm.modcap"],
      ["ahead", "application/vnd.ahead.space"],
      ["ai", "application/postscript"],
      ["aif", ["audio/aiff", "audio/x-aiff"]],
      ["aifc", ["audio/aiff", "audio/x-aiff"]],
      ["aiff", ["audio/aiff", "audio/x-aiff"]],
      ["aim", "application/x-aim"],
      ["aip", "text/x-audiosoft-intra"],
      ["air", "application/vnd.adobe.air-application-installer-package+zip"],
      ["ait", "application/vnd.dvb.ait"],
      ["ami", "application/vnd.amiga.ami"],
      ["ani", "application/x-navi-animation"],
      ["aos", "application/x-nokia-9000-communicator-add-on-software"],
      ["apk", "application/vnd.android.package-archive"],
      ["application", "application/x-ms-application"],
      ["apr", "application/vnd.lotus-approach"],
      ["aps", "application/mime"],
      ["arc", "application/octet-stream"],
      ["arj", ["application/arj", "application/octet-stream"]],
      ["art", "image/x-jg"],
      ["asf", "video/x-ms-asf"],
      ["asm", "text/x-asm"],
      ["aso", "application/vnd.accpac.simply.aso"],
      ["asp", "text/asp"],
      ["asr", "video/x-ms-asf"],
      ["asx", ["video/x-ms-asf", "application/x-mplayer2", "video/x-ms-asf-plugin"]],
      ["atc", "application/vnd.acucorp"],
      ["atomcat", "application/atomcat+xml"],
      ["atomsvc", "application/atomsvc+xml"],
      ["atx", "application/vnd.antix.game-component"],
      ["au", ["audio/basic", "audio/x-au"]],
      ["avi", ["video/avi", "video/msvideo", "application/x-troff-msvideo", "video/x-msvideo"]],
      ["avs", "video/avs-video"],
      ["aw", "application/applixware"],
      ["axs", "application/olescript"],
      ["azf", "application/vnd.airzip.filesecure.azf"],
      ["azs", "application/vnd.airzip.filesecure.azs"],
      ["azw", "application/vnd.amazon.ebook"],
      ["bas", "text/plain"],
      ["bcpio", "application/x-bcpio"],
      ["bdf", "application/x-font-bdf"],
      ["bdm", "application/vnd.syncml.dm+wbxml"],
      ["bed", "application/vnd.realvnc.bed"],
      ["bh2", "application/vnd.fujitsu.oasysprs"],
      [
        "bin",
        ["application/octet-stream", "application/mac-binary", "application/macbinary", "application/x-macbinary", "application/x-binary"]
      ],
      ["bm", "image/bmp"],
      ["bmi", "application/vnd.bmi"],
      ["bmp", ["image/bmp", "image/x-windows-bmp"]],
      ["boo", "application/book"],
      ["book", "application/book"],
      ["box", "application/vnd.previewsystems.box"],
      ["boz", "application/x-bzip2"],
      ["bsh", "application/x-bsh"],
      ["btif", "image/prs.btif"],
      ["bz", "application/x-bzip"],
      ["bz2", "application/x-bzip2"],
      ["c", ["text/plain", "text/x-c"]],
      ["c++", "text/plain"],
      ["c11amc", "application/vnd.cluetrust.cartomobile-config"],
      ["c11amz", "application/vnd.cluetrust.cartomobile-config-pkg"],
      ["c4g", "application/vnd.clonk.c4group"],
      ["cab", "application/vnd.ms-cab-compressed"],
      ["car", "application/vnd.curl.car"],
      ["cat", ["application/vnd.ms-pkiseccat", "application/vnd.ms-pki.seccat"]],
      ["cc", ["text/plain", "text/x-c"]],
      ["ccad", "application/clariscad"],
      ["cco", "application/x-cocoa"],
      ["ccxml", "application/ccxml+xml,"],
      ["cdbcmsg", "application/vnd.contact.cmsg"],
      ["cdf", ["application/cdf", "application/x-cdf", "application/x-netcdf"]],
      ["cdkey", "application/vnd.mediastation.cdkey"],
      ["cdmia", "application/cdmi-capability"],
      ["cdmic", "application/cdmi-container"],
      ["cdmid", "application/cdmi-domain"],
      ["cdmio", "application/cdmi-object"],
      ["cdmiq", "application/cdmi-queue"],
      ["cdx", "chemical/x-cdx"],
      ["cdxml", "application/vnd.chemdraw+xml"],
      ["cdy", "application/vnd.cinderella"],
      ["cer", ["application/pkix-cert", "application/x-x509-ca-cert"]],
      ["cgm", "image/cgm"],
      ["cha", "application/x-chat"],
      ["chat", "application/x-chat"],
      ["chm", "application/vnd.ms-htmlhelp"],
      ["chrt", "application/vnd.kde.kchart"],
      ["cif", "chemical/x-cif"],
      ["cii", "application/vnd.anser-web-certificate-issue-initiation"],
      ["cil", "application/vnd.ms-artgalry"],
      ["cla", "application/vnd.claymore"],
      [
        "class",
        ["application/octet-stream", "application/java", "application/java-byte-code", "application/java-vm", "application/x-java-class"]
      ],
      ["clkk", "application/vnd.crick.clicker.keyboard"],
      ["clkp", "application/vnd.crick.clicker.palette"],
      ["clkt", "application/vnd.crick.clicker.template"],
      ["clkw", "application/vnd.crick.clicker.wordbank"],
      ["clkx", "application/vnd.crick.clicker"],
      ["clp", "application/x-msclip"],
      ["cmc", "application/vnd.cosmocaller"],
      ["cmdf", "chemical/x-cmdf"],
      ["cml", "chemical/x-cml"],
      ["cmp", "application/vnd.yellowriver-custom-menu"],
      ["cmx", "image/x-cmx"],
      ["cod", ["image/cis-cod", "application/vnd.rim.cod"]],
      ["com", ["application/octet-stream", "text/plain"]],
      ["conf", "text/plain"],
      ["cpio", "application/x-cpio"],
      ["cpp", "text/x-c"],
      ["cpt", ["application/mac-compactpro", "application/x-compactpro", "application/x-cpt"]],
      ["crd", "application/x-mscardfile"],
      ["crl", ["application/pkix-crl", "application/pkcs-crl"]],
      ["crt", ["application/pkix-cert", "application/x-x509-user-cert", "application/x-x509-ca-cert"]],
      ["cryptonote", "application/vnd.rig.cryptonote"],
      ["csh", ["text/x-script.csh", "application/x-csh"]],
      ["csml", "chemical/x-csml"],
      ["csp", "application/vnd.commonspace"],
      ["css", ["text/css", "application/x-pointplus"]],
      ["csv", "text/csv"],
      ["cu", "application/cu-seeme"],
      ["curl", "text/vnd.curl"],
      ["cww", "application/prs.cww"],
      ["cxx", "text/plain"],
      ["dae", "model/vnd.collada+xml"],
      ["daf", "application/vnd.mobius.daf"],
      ["davmount", "application/davmount+xml"],
      ["dcr", "application/x-director"],
      ["dcurl", "text/vnd.curl.dcurl"],
      ["dd2", "application/vnd.oma.dd2+xml"],
      ["ddd", "application/vnd.fujixerox.ddd"],
      ["deb", "application/x-debian-package"],
      ["deepv", "application/x-deepv"],
      ["def", "text/plain"],
      ["der", "application/x-x509-ca-cert"],
      ["dfac", "application/vnd.dreamfactory"],
      ["dif", "video/x-dv"],
      ["dir", "application/x-director"],
      ["dis", "application/vnd.mobius.dis"],
      ["djvu", "image/vnd.djvu"],
      ["dl", ["video/dl", "video/x-dl"]],
      ["dll", "application/x-msdownload"],
      ["dms", "application/octet-stream"],
      ["dna", "application/vnd.dna"],
      ["doc", "application/msword"],
      ["docm", "application/vnd.ms-word.document.macroenabled.12"],
      ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ["dot", "application/msword"],
      ["dotm", "application/vnd.ms-word.template.macroenabled.12"],
      ["dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template"],
      ["dp", ["application/commonground", "application/vnd.osgi.dp"]],
      ["dpg", "application/vnd.dpgraph"],
      ["dra", "audio/vnd.dra"],
      ["drw", "application/drafting"],
      ["dsc", "text/prs.lines.tag"],
      ["dssc", "application/dssc+der"],
      ["dtb", "application/x-dtbook+xml"],
      ["dtd", "application/xml-dtd"],
      ["dts", "audio/vnd.dts"],
      ["dtshd", "audio/vnd.dts.hd"],
      ["dump", "application/octet-stream"],
      ["dv", "video/x-dv"],
      ["dvi", "application/x-dvi"],
      ["dwf", ["model/vnd.dwf", "drawing/x-dwf"]],
      ["dwg", ["application/acad", "image/vnd.dwg", "image/x-dwg"]],
      ["dxf", ["application/dxf", "image/vnd.dwg", "image/vnd.dxf", "image/x-dwg"]],
      ["dxp", "application/vnd.spotfire.dxp"],
      ["dxr", "application/x-director"],
      ["ecelp4800", "audio/vnd.nuera.ecelp4800"],
      ["ecelp7470", "audio/vnd.nuera.ecelp7470"],
      ["ecelp9600", "audio/vnd.nuera.ecelp9600"],
      ["edm", "application/vnd.novadigm.edm"],
      ["edx", "application/vnd.novadigm.edx"],
      ["efif", "application/vnd.picsel"],
      ["ei6", "application/vnd.pg.osasli"],
      ["el", "text/x-script.elisp"],
      ["elc", ["application/x-elc", "application/x-bytecode.elisp"]],
      ["eml", "message/rfc822"],
      ["emma", "application/emma+xml"],
      ["env", "application/x-envoy"],
      ["eol", "audio/vnd.digital-winds"],
      ["eot", "application/vnd.ms-fontobject"],
      ["eps", "application/postscript"],
      ["epub", "application/epub+zip"],
      ["es", ["application/ecmascript", "application/x-esrehber"]],
      ["es3", "application/vnd.eszigno3+xml"],
      ["esf", "application/vnd.epson.esf"],
      ["etx", "text/x-setext"],
      ["evy", ["application/envoy", "application/x-envoy"]],
      ["exe", ["application/octet-stream", "application/x-msdownload"]],
      ["exi", "application/exi"],
      ["ext", "application/vnd.novadigm.ext"],
      ["ez2", "application/vnd.ezpix-album"],
      ["ez3", "application/vnd.ezpix-package"],
      ["f", ["text/plain", "text/x-fortran"]],
      ["f4v", "video/x-f4v"],
      ["f77", "text/x-fortran"],
      ["f90", ["text/plain", "text/x-fortran"]],
      ["fbs", "image/vnd.fastbidsheet"],
      ["fcs", "application/vnd.isac.fcs"],
      ["fdf", "application/vnd.fdf"],
      ["fe_launch", "application/vnd.denovo.fcselayout-link"],
      ["fg5", "application/vnd.fujitsu.oasysgp"],
      ["fh", "image/x-freehand"],
      ["fif", ["application/fractals", "image/fif"]],
      ["fig", "application/x-xfig"],
      ["fli", ["video/fli", "video/x-fli"]],
      ["flo", ["image/florian", "application/vnd.micrografx.flo"]],
      ["flr", "x-world/x-vrml"],
      ["flv", "video/x-flv"],
      ["flw", "application/vnd.kde.kivio"],
      ["flx", "text/vnd.fmi.flexstor"],
      ["fly", "text/vnd.fly"],
      ["fm", "application/vnd.framemaker"],
      ["fmf", "video/x-atomic3d-feature"],
      ["fnc", "application/vnd.frogans.fnc"],
      ["for", ["text/plain", "text/x-fortran"]],
      ["fpx", ["image/vnd.fpx", "image/vnd.net-fpx"]],
      ["frl", "application/freeloader"],
      ["fsc", "application/vnd.fsc.weblaunch"],
      ["fst", "image/vnd.fst"],
      ["ftc", "application/vnd.fluxtime.clip"],
      ["fti", "application/vnd.anser-web-funds-transfer-initiation"],
      ["funk", "audio/make"],
      ["fvt", "video/vnd.fvt"],
      ["fxp", "application/vnd.adobe.fxp"],
      ["fzs", "application/vnd.fuzzysheet"],
      ["g", "text/plain"],
      ["g2w", "application/vnd.geoplan"],
      ["g3", "image/g3fax"],
      ["g3w", "application/vnd.geospace"],
      ["gac", "application/vnd.groove-account"],
      ["gdl", "model/vnd.gdl"],
      ["geo", "application/vnd.dynageo"],
      ["geojson", "application/geo+json"],
      ["gex", "application/vnd.geometry-explorer"],
      ["ggb", "application/vnd.geogebra.file"],
      ["ggt", "application/vnd.geogebra.tool"],
      ["ghf", "application/vnd.groove-help"],
      ["gif", "image/gif"],
      ["gim", "application/vnd.groove-identity-message"],
      ["gl", ["video/gl", "video/x-gl"]],
      ["gmx", "application/vnd.gmx"],
      ["gnumeric", "application/x-gnumeric"],
      ["gph", "application/vnd.flographit"],
      ["gqf", "application/vnd.grafeq"],
      ["gram", "application/srgs"],
      ["grv", "application/vnd.groove-injector"],
      ["grxml", "application/srgs+xml"],
      ["gsd", "audio/x-gsm"],
      ["gsf", "application/x-font-ghostscript"],
      ["gsm", "audio/x-gsm"],
      ["gsp", "application/x-gsp"],
      ["gss", "application/x-gss"],
      ["gtar", "application/x-gtar"],
      ["gtm", "application/vnd.groove-tool-message"],
      ["gtw", "model/vnd.gtw"],
      ["gv", "text/vnd.graphviz"],
      ["gxt", "application/vnd.geonext"],
      ["gz", ["application/x-gzip", "application/x-compressed"]],
      ["gzip", ["multipart/x-gzip", "application/x-gzip"]],
      ["h", ["text/plain", "text/x-h"]],
      ["h261", "video/h261"],
      ["h263", "video/h263"],
      ["h264", "video/h264"],
      ["hal", "application/vnd.hal+xml"],
      ["hbci", "application/vnd.hbci"],
      ["hdf", "application/x-hdf"],
      ["help", "application/x-helpfile"],
      ["hgl", "application/vnd.hp-hpgl"],
      ["hh", ["text/plain", "text/x-h"]],
      ["hlb", "text/x-script"],
      ["hlp", ["application/winhlp", "application/hlp", "application/x-helpfile", "application/x-winhelp"]],
      ["hpg", "application/vnd.hp-hpgl"],
      ["hpgl", "application/vnd.hp-hpgl"],
      ["hpid", "application/vnd.hp-hpid"],
      ["hps", "application/vnd.hp-hps"],
      [
        "hqx",
        [
          "application/mac-binhex40",
          "application/binhex",
          "application/binhex4",
          "application/mac-binhex",
          "application/x-binhex40",
          "application/x-mac-binhex40"
        ]
      ],
      ["hta", "application/hta"],
      ["htc", "text/x-component"],
      ["htke", "application/vnd.kenameaapp"],
      ["htm", "text/html"],
      ["html", "text/html"],
      ["htmls", "text/html"],
      ["htt", "text/webviewhtml"],
      ["htx", "text/html"],
      ["hvd", "application/vnd.yamaha.hv-dic"],
      ["hvp", "application/vnd.yamaha.hv-voice"],
      ["hvs", "application/vnd.yamaha.hv-script"],
      ["i2g", "application/vnd.intergeo"],
      ["icc", "application/vnd.iccprofile"],
      ["ice", "x-conference/x-cooltalk"],
      ["ico", "image/x-icon"],
      ["ics", "text/calendar"],
      ["idc", "text/plain"],
      ["ief", "image/ief"],
      ["iefs", "image/ief"],
      ["ifm", "application/vnd.shana.informed.formdata"],
      ["iges", ["application/iges", "model/iges"]],
      ["igl", "application/vnd.igloader"],
      ["igm", "application/vnd.insors.igm"],
      ["igs", ["application/iges", "model/iges"]],
      ["igx", "application/vnd.micrografx.igx"],
      ["iif", "application/vnd.shana.informed.interchange"],
      ["iii", "application/x-iphone"],
      ["ima", "application/x-ima"],
      ["imap", "application/x-httpd-imap"],
      ["imp", "application/vnd.accpac.simply.imp"],
      ["ims", "application/vnd.ms-ims"],
      ["inf", "application/inf"],
      ["ins", ["application/x-internet-signup", "application/x-internett-signup"]],
      ["ip", "application/x-ip2"],
      ["ipfix", "application/ipfix"],
      ["ipk", "application/vnd.shana.informed.package"],
      ["irm", "application/vnd.ibm.rights-management"],
      ["irp", "application/vnd.irepository.package+xml"],
      ["isp", "application/x-internet-signup"],
      ["isu", "video/x-isvideo"],
      ["it", "audio/it"],
      ["itp", "application/vnd.shana.informed.formtemplate"],
      ["iv", "application/x-inventor"],
      ["ivp", "application/vnd.immervision-ivp"],
      ["ivr", "i-world/i-vrml"],
      ["ivu", "application/vnd.immervision-ivu"],
      ["ivy", "application/x-livescreen"],
      ["jad", "text/vnd.sun.j2me.app-descriptor"],
      ["jam", ["application/vnd.jam", "audio/x-jam"]],
      ["jar", "application/java-archive"],
      ["jav", ["text/plain", "text/x-java-source"]],
      ["java", ["text/plain", "text/x-java-source,java", "text/x-java-source"]],
      ["jcm", "application/x-java-commerce"],
      ["jfif", ["image/pipeg", "image/jpeg", "image/pjpeg"]],
      ["jfif-tbnl", "image/jpeg"],
      ["jisp", "application/vnd.jisp"],
      ["jlt", "application/vnd.hp-jlyt"],
      ["jnlp", "application/x-java-jnlp-file"],
      ["joda", "application/vnd.joost.joda-archive"],
      ["jpe", ["image/jpeg", "image/pjpeg"]],
      ["jpeg", ["image/jpeg", "image/pjpeg"]],
      ["jpg", ["image/jpeg", "image/pjpeg"]],
      ["jpgv", "video/jpeg"],
      ["jpm", "video/jpm"],
      ["jps", "image/x-jps"],
      ["js", ["application/javascript", "application/ecmascript", "text/javascript", "text/ecmascript", "application/x-javascript"]],
      ["json", "application/json"],
      ["jut", "image/jutvision"],
      ["kar", ["audio/midi", "music/x-karaoke"]],
      ["karbon", "application/vnd.kde.karbon"],
      ["kfo", "application/vnd.kde.kformula"],
      ["kia", "application/vnd.kidspiration"],
      ["kml", "application/vnd.google-earth.kml+xml"],
      ["kmz", "application/vnd.google-earth.kmz"],
      ["kne", "application/vnd.kinar"],
      ["kon", "application/vnd.kde.kontour"],
      ["kpr", "application/vnd.kde.kpresenter"],
      ["ksh", ["application/x-ksh", "text/x-script.ksh"]],
      ["ksp", "application/vnd.kde.kspread"],
      ["ktx", "image/ktx"],
      ["ktz", "application/vnd.kahootz"],
      ["kwd", "application/vnd.kde.kword"],
      ["la", ["audio/nspaudio", "audio/x-nspaudio"]],
      ["lam", "audio/x-liveaudio"],
      ["lasxml", "application/vnd.las.las+xml"],
      ["latex", "application/x-latex"],
      ["lbd", "application/vnd.llamagraphics.life-balance.desktop"],
      ["lbe", "application/vnd.llamagraphics.life-balance.exchange+xml"],
      ["les", "application/vnd.hhe.lesson-player"],
      ["lha", ["application/octet-stream", "application/lha", "application/x-lha"]],
      ["lhx", "application/octet-stream"],
      ["link66", "application/vnd.route66.link66+xml"],
      ["list", "text/plain"],
      ["lma", ["audio/nspaudio", "audio/x-nspaudio"]],
      ["log", "text/plain"],
      ["lrm", "application/vnd.ms-lrm"],
      ["lsf", "video/x-la-asf"],
      ["lsp", ["application/x-lisp", "text/x-script.lisp"]],
      ["lst", "text/plain"],
      ["lsx", ["video/x-la-asf", "text/x-la-asf"]],
      ["ltf", "application/vnd.frogans.ltf"],
      ["ltx", "application/x-latex"],
      ["lvp", "audio/vnd.lucent.voice"],
      ["lwp", "application/vnd.lotus-wordpro"],
      ["lzh", ["application/octet-stream", "application/x-lzh"]],
      ["lzx", ["application/lzx", "application/octet-stream", "application/x-lzx"]],
      ["m", ["text/plain", "text/x-m"]],
      ["m13", "application/x-msmediaview"],
      ["m14", "application/x-msmediaview"],
      ["m1v", "video/mpeg"],
      ["m21", "application/mp21"],
      ["m2a", "audio/mpeg"],
      ["m2v", "video/mpeg"],
      ["m3u", ["audio/x-mpegurl", "audio/x-mpequrl"]],
      ["m3u8", "application/vnd.apple.mpegurl"],
      ["m4v", "video/x-m4v"],
      ["ma", "application/mathematica"],
      ["mads", "application/mads+xml"],
      ["mag", "application/vnd.ecowin.chart"],
      ["man", "application/x-troff-man"],
      ["map", "application/x-navimap"],
      ["mar", "text/plain"],
      ["mathml", "application/mathml+xml"],
      ["mbd", "application/mbedlet"],
      ["mbk", "application/vnd.mobius.mbk"],
      ["mbox", "application/mbox"],
      ["mc$", "application/x-magic-cap-package-1.0"],
      ["mc1", "application/vnd.medcalcdata"],
      ["mcd", ["application/mcad", "application/vnd.mcd", "application/x-mathcad"]],
      ["mcf", ["image/vasa", "text/mcf"]],
      ["mcp", "application/netmc"],
      ["mcurl", "text/vnd.curl.mcurl"],
      ["mdb", "application/x-msaccess"],
      ["mdi", "image/vnd.ms-modi"],
      ["me", "application/x-troff-me"],
      ["meta4", "application/metalink4+xml"],
      ["mets", "application/mets+xml"],
      ["mfm", "application/vnd.mfmp"],
      ["mgp", "application/vnd.osgeo.mapguide.package"],
      ["mgz", "application/vnd.proteus.magazine"],
      ["mht", "message/rfc822"],
      ["mhtml", "message/rfc822"],
      ["mid", ["audio/mid", "audio/midi", "music/crescendo", "x-music/x-midi", "audio/x-midi", "application/x-midi", "audio/x-mid"]],
      ["midi", ["audio/midi", "music/crescendo", "x-music/x-midi", "audio/x-midi", "application/x-midi", "audio/x-mid"]],
      ["mif", ["application/vnd.mif", "application/x-mif", "application/x-frame"]],
      ["mime", ["message/rfc822", "www/mime"]],
      ["mj2", "video/mj2"],
      ["mjf", "audio/x-vnd.audioexplosion.mjuicemediafile"],
      ["mjpg", "video/x-motion-jpeg"],
      ["mlp", "application/vnd.dolby.mlp"],
      ["mm", ["application/base64", "application/x-meme"]],
      ["mmd", "application/vnd.chipnuts.karaoke-mmd"],
      ["mme", "application/base64"],
      ["mmf", "application/vnd.smaf"],
      ["mmr", "image/vnd.fujixerox.edmics-mmr"],
      ["mny", "application/x-msmoney"],
      ["mod", ["audio/mod", "audio/x-mod"]],
      ["mods", "application/mods+xml"],
      ["moov", "video/quicktime"],
      ["mov", "video/quicktime"],
      ["movie", "video/x-sgi-movie"],
      ["mp2", ["video/mpeg", "audio/mpeg", "video/x-mpeg", "audio/x-mpeg", "video/x-mpeq2a"]],
      ["mp3", ["audio/mpeg", "audio/mpeg3", "video/mpeg", "audio/x-mpeg-3", "video/x-mpeg"]],
      ["mp4", ["video/mp4", "application/mp4"]],
      ["mp4a", "audio/mp4"],
      ["mpa", ["video/mpeg", "audio/mpeg"]],
      ["mpc", ["application/vnd.mophun.certificate", "application/x-project"]],
      ["mpe", "video/mpeg"],
      ["mpeg", "video/mpeg"],
      ["mpg", ["video/mpeg", "audio/mpeg"]],
      ["mpga", "audio/mpeg"],
      ["mpkg", "application/vnd.apple.installer+xml"],
      ["mpm", "application/vnd.blueice.multipass"],
      ["mpn", "application/vnd.mophun.application"],
      ["mpp", "application/vnd.ms-project"],
      ["mpt", "application/x-project"],
      ["mpv", "application/x-project"],
      ["mpv2", "video/mpeg"],
      ["mpx", "application/x-project"],
      ["mpy", "application/vnd.ibm.minipay"],
      ["mqy", "application/vnd.mobius.mqy"],
      ["mrc", "application/marc"],
      ["mrcx", "application/marcxml+xml"],
      ["ms", "application/x-troff-ms"],
      ["mscml", "application/mediaservercontrol+xml"],
      ["mseq", "application/vnd.mseq"],
      ["msf", "application/vnd.epson.msf"],
      ["msg", "application/vnd.ms-outlook"],
      ["msh", "model/mesh"],
      ["msl", "application/vnd.mobius.msl"],
      ["msty", "application/vnd.muvee.style"],
      ["mts", "model/vnd.mts"],
      ["mus", "application/vnd.musician"],
      ["musicxml", "application/vnd.recordare.musicxml+xml"],
      ["mv", "video/x-sgi-movie"],
      ["mvb", "application/x-msmediaview"],
      ["mwf", "application/vnd.mfer"],
      ["mxf", "application/mxf"],
      ["mxl", "application/vnd.recordare.musicxml"],
      ["mxml", "application/xv+xml"],
      ["mxs", "application/vnd.triscape.mxs"],
      ["mxu", "video/vnd.mpegurl"],
      ["my", "audio/make"],
      ["mzz", "application/x-vnd.audioexplosion.mzz"],
      ["n-gage", "application/vnd.nokia.n-gage.symbian.install"],
      ["n3", "text/n3"],
      ["nap", "image/naplps"],
      ["naplps", "image/naplps"],
      ["nbp", "application/vnd.wolfram.player"],
      ["nc", "application/x-netcdf"],
      ["ncm", "application/vnd.nokia.configuration-message"],
      ["ncx", "application/x-dtbncx+xml"],
      ["ngdat", "application/vnd.nokia.n-gage.data"],
      ["nif", "image/x-niff"],
      ["niff", "image/x-niff"],
      ["nix", "application/x-mix-transfer"],
      ["nlu", "application/vnd.neurolanguage.nlu"],
      ["nml", "application/vnd.enliven"],
      ["nnd", "application/vnd.noblenet-directory"],
      ["nns", "application/vnd.noblenet-sealer"],
      ["nnw", "application/vnd.noblenet-web"],
      ["npx", "image/vnd.net-fpx"],
      ["nsc", "application/x-conference"],
      ["nsf", "application/vnd.lotus-notes"],
      ["nvd", "application/x-navidoc"],
      ["nws", "message/rfc822"],
      ["o", "application/octet-stream"],
      ["oa2", "application/vnd.fujitsu.oasys2"],
      ["oa3", "application/vnd.fujitsu.oasys3"],
      ["oas", "application/vnd.fujitsu.oasys"],
      ["obd", "application/x-msbinder"],
      ["oda", "application/oda"],
      ["odb", "application/vnd.oasis.opendocument.database"],
      ["odc", "application/vnd.oasis.opendocument.chart"],
      ["odf", "application/vnd.oasis.opendocument.formula"],
      ["odft", "application/vnd.oasis.opendocument.formula-template"],
      ["odg", "application/vnd.oasis.opendocument.graphics"],
      ["odi", "application/vnd.oasis.opendocument.image"],
      ["odm", "application/vnd.oasis.opendocument.text-master"],
      ["odp", "application/vnd.oasis.opendocument.presentation"],
      ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
      ["odt", "application/vnd.oasis.opendocument.text"],
      ["oga", "audio/ogg"],
      ["ogv", "video/ogg"],
      ["ogx", "application/ogg"],
      ["omc", "application/x-omc"],
      ["omcd", "application/x-omcdatamaker"],
      ["omcr", "application/x-omcregerator"],
      ["onetoc", "application/onenote"],
      ["opf", "application/oebps-package+xml"],
      ["org", "application/vnd.lotus-organizer"],
      ["osf", "application/vnd.yamaha.openscoreformat"],
      ["osfpvg", "application/vnd.yamaha.openscoreformat.osfpvg+xml"],
      ["otc", "application/vnd.oasis.opendocument.chart-template"],
      ["otf", "application/x-font-otf"],
      ["otg", "application/vnd.oasis.opendocument.graphics-template"],
      ["oth", "application/vnd.oasis.opendocument.text-web"],
      ["oti", "application/vnd.oasis.opendocument.image-template"],
      ["otp", "application/vnd.oasis.opendocument.presentation-template"],
      ["ots", "application/vnd.oasis.opendocument.spreadsheet-template"],
      ["ott", "application/vnd.oasis.opendocument.text-template"],
      ["oxt", "application/vnd.openofficeorg.extension"],
      ["p", "text/x-pascal"],
      ["p10", ["application/pkcs10", "application/x-pkcs10"]],
      ["p12", ["application/pkcs-12", "application/x-pkcs12"]],
      ["p7a", "application/x-pkcs7-signature"],
      ["p7b", "application/x-pkcs7-certificates"],
      ["p7c", ["application/pkcs7-mime", "application/x-pkcs7-mime"]],
      ["p7m", ["application/pkcs7-mime", "application/x-pkcs7-mime"]],
      ["p7r", "application/x-pkcs7-certreqresp"],
      ["p7s", ["application/pkcs7-signature", "application/x-pkcs7-signature"]],
      ["p8", "application/pkcs8"],
      ["par", "text/plain-bas"],
      ["part", "application/pro_eng"],
      ["pas", "text/pascal"],
      ["paw", "application/vnd.pawaafile"],
      ["pbd", "application/vnd.powerbuilder6"],
      ["pbm", "image/x-portable-bitmap"],
      ["pcf", "application/x-font-pcf"],
      ["pcl", ["application/vnd.hp-pcl", "application/x-pcl"]],
      ["pclxl", "application/vnd.hp-pclxl"],
      ["pct", "image/x-pict"],
      ["pcurl", "application/vnd.curl.pcurl"],
      ["pcx", "image/x-pcx"],
      ["pdb", ["application/vnd.palm", "chemical/x-pdb"]],
      ["pdf", "application/pdf"],
      ["pfa", "application/x-font-type1"],
      ["pfr", "application/font-tdpfr"],
      ["pfunk", ["audio/make", "audio/make.my.funk"]],
      ["pfx", "application/x-pkcs12"],
      ["pgm", ["image/x-portable-graymap", "image/x-portable-greymap"]],
      ["pgn", "application/x-chess-pgn"],
      ["pgp", "application/pgp-signature"],
      ["pic", ["image/pict", "image/x-pict"]],
      ["pict", "image/pict"],
      ["pkg", "application/x-newton-compatible-pkg"],
      ["pki", "application/pkixcmp"],
      ["pkipath", "application/pkix-pkipath"],
      ["pko", ["application/ynd.ms-pkipko", "application/vnd.ms-pki.pko"]],
      ["pl", ["text/plain", "text/x-script.perl"]],
      ["plb", "application/vnd.3gpp.pic-bw-large"],
      ["plc", "application/vnd.mobius.plc"],
      ["plf", "application/vnd.pocketlearn"],
      ["pls", "application/pls+xml"],
      ["plx", "application/x-pixclscript"],
      ["pm", ["text/x-script.perl-module", "image/x-xpixmap"]],
      ["pm4", "application/x-pagemaker"],
      ["pm5", "application/x-pagemaker"],
      ["pma", "application/x-perfmon"],
      ["pmc", "application/x-perfmon"],
      ["pml", ["application/vnd.ctc-posml", "application/x-perfmon"]],
      ["pmr", "application/x-perfmon"],
      ["pmw", "application/x-perfmon"],
      ["png", "image/png"],
      ["pnm", ["application/x-portable-anymap", "image/x-portable-anymap"]],
      ["portpkg", "application/vnd.macports.portpkg"],
      ["pot", ["application/vnd.ms-powerpoint", "application/mspowerpoint"]],
      ["potm", "application/vnd.ms-powerpoint.template.macroenabled.12"],
      ["potx", "application/vnd.openxmlformats-officedocument.presentationml.template"],
      ["pov", "model/x-pov"],
      ["ppa", "application/vnd.ms-powerpoint"],
      ["ppam", "application/vnd.ms-powerpoint.addin.macroenabled.12"],
      ["ppd", "application/vnd.cups-ppd"],
      ["ppm", "image/x-portable-pixmap"],
      ["pps", ["application/vnd.ms-powerpoint", "application/mspowerpoint"]],
      ["ppsm", "application/vnd.ms-powerpoint.slideshow.macroenabled.12"],
      ["ppsx", "application/vnd.openxmlformats-officedocument.presentationml.slideshow"],
      ["ppt", ["application/vnd.ms-powerpoint", "application/mspowerpoint", "application/powerpoint", "application/x-mspowerpoint"]],
      ["pptm", "application/vnd.ms-powerpoint.presentation.macroenabled.12"],
      ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      ["ppz", "application/mspowerpoint"],
      ["prc", "application/x-mobipocket-ebook"],
      ["pre", ["application/vnd.lotus-freelance", "application/x-freelance"]],
      ["prf", "application/pics-rules"],
      ["prt", "application/pro_eng"],
      ["ps", "application/postscript"],
      ["psb", "application/vnd.3gpp.pic-bw-small"],
      ["psd", ["application/octet-stream", "image/vnd.adobe.photoshop"]],
      ["psf", "application/x-font-linux-psf"],
      ["pskcxml", "application/pskc+xml"],
      ["ptid", "application/vnd.pvi.ptid1"],
      ["pub", "application/x-mspublisher"],
      ["pvb", "application/vnd.3gpp.pic-bw-var"],
      ["pvu", "paleovu/x-pv"],
      ["pwn", "application/vnd.3m.post-it-notes"],
      ["pwz", "application/vnd.ms-powerpoint"],
      ["py", "text/x-script.phyton"],
      ["pya", "audio/vnd.ms-playready.media.pya"],
      ["pyc", "application/x-bytecode.python"],
      ["pyv", "video/vnd.ms-playready.media.pyv"],
      ["qam", "application/vnd.epson.quickanime"],
      ["qbo", "application/vnd.intu.qbo"],
      ["qcp", "audio/vnd.qcelp"],
      ["qd3", "x-world/x-3dmf"],
      ["qd3d", "x-world/x-3dmf"],
      ["qfx", "application/vnd.intu.qfx"],
      ["qif", "image/x-quicktime"],
      ["qps", "application/vnd.publishare-delta-tree"],
      ["qt", "video/quicktime"],
      ["qtc", "video/x-qtc"],
      ["qti", "image/x-quicktime"],
      ["qtif", "image/x-quicktime"],
      ["qxd", "application/vnd.quark.quarkxpress"],
      ["ra", ["audio/x-realaudio", "audio/x-pn-realaudio", "audio/x-pn-realaudio-plugin"]],
      ["ram", "audio/x-pn-realaudio"],
      ["rar", "application/x-rar-compressed"],
      ["ras", ["image/cmu-raster", "application/x-cmu-raster", "image/x-cmu-raster"]],
      ["rast", "image/cmu-raster"],
      ["rcprofile", "application/vnd.ipunplugged.rcprofile"],
      ["rdf", "application/rdf+xml"],
      ["rdz", "application/vnd.data-vision.rdz"],
      ["rep", "application/vnd.businessobjects"],
      ["res", "application/x-dtbresource+xml"],
      ["rexx", "text/x-script.rexx"],
      ["rf", "image/vnd.rn-realflash"],
      ["rgb", "image/x-rgb"],
      ["rif", "application/reginfo+xml"],
      ["rip", "audio/vnd.rip"],
      ["rl", "application/resource-lists+xml"],
      ["rlc", "image/vnd.fujixerox.edmics-rlc"],
      ["rld", "application/resource-lists-diff+xml"],
      ["rm", ["application/vnd.rn-realmedia", "audio/x-pn-realaudio"]],
      ["rmi", "audio/mid"],
      ["rmm", "audio/x-pn-realaudio"],
      ["rmp", ["audio/x-pn-realaudio-plugin", "audio/x-pn-realaudio"]],
      ["rms", "application/vnd.jcp.javame.midlet-rms"],
      ["rnc", "application/relax-ng-compact-syntax"],
      ["rng", ["application/ringing-tones", "application/vnd.nokia.ringing-tone"]],
      ["rnx", "application/vnd.rn-realplayer"],
      ["roff", "application/x-troff"],
      ["rp", "image/vnd.rn-realpix"],
      ["rp9", "application/vnd.cloanto.rp9"],
      ["rpm", "audio/x-pn-realaudio-plugin"],
      ["rpss", "application/vnd.nokia.radio-presets"],
      ["rpst", "application/vnd.nokia.radio-preset"],
      ["rq", "application/sparql-query"],
      ["rs", "application/rls-services+xml"],
      ["rsd", "application/rsd+xml"],
      ["rt", ["text/richtext", "text/vnd.rn-realtext"]],
      ["rtf", ["application/rtf", "text/richtext", "application/x-rtf"]],
      ["rtx", ["text/richtext", "application/rtf"]],
      ["rv", "video/vnd.rn-realvideo"],
      ["s", "text/x-asm"],
      ["s3m", "audio/s3m"],
      ["saf", "application/vnd.yamaha.smaf-audio"],
      ["saveme", "application/octet-stream"],
      ["sbk", "application/x-tbook"],
      ["sbml", "application/sbml+xml"],
      ["sc", "application/vnd.ibm.secure-container"],
      ["scd", "application/x-msschedule"],
      [
        "scm",
        ["application/vnd.lotus-screencam", "video/x-scm", "text/x-script.guile", "application/x-lotusscreencam", "text/x-script.scheme"]
      ],
      ["scq", "application/scvp-cv-request"],
      ["scs", "application/scvp-cv-response"],
      ["sct", "text/scriptlet"],
      ["scurl", "text/vnd.curl.scurl"],
      ["sda", "application/vnd.stardivision.draw"],
      ["sdc", "application/vnd.stardivision.calc"],
      ["sdd", "application/vnd.stardivision.impress"],
      ["sdkm", "application/vnd.solent.sdkm+xml"],
      ["sdml", "text/plain"],
      ["sdp", ["application/sdp", "application/x-sdp"]],
      ["sdr", "application/sounder"],
      ["sdw", "application/vnd.stardivision.writer"],
      ["sea", ["application/sea", "application/x-sea"]],
      ["see", "application/vnd.seemail"],
      ["seed", "application/vnd.fdsn.seed"],
      ["sema", "application/vnd.sema"],
      ["semd", "application/vnd.semd"],
      ["semf", "application/vnd.semf"],
      ["ser", "application/java-serialized-object"],
      ["set", "application/set"],
      ["setpay", "application/set-payment-initiation"],
      ["setreg", "application/set-registration-initiation"],
      ["sfd-hdstx", "application/vnd.hydrostatix.sof-data"],
      ["sfs", "application/vnd.spotfire.sfs"],
      ["sgl", "application/vnd.stardivision.writer-global"],
      ["sgm", ["text/sgml", "text/x-sgml"]],
      ["sgml", ["text/sgml", "text/x-sgml"]],
      ["sh", ["application/x-shar", "application/x-bsh", "application/x-sh", "text/x-script.sh"]],
      ["shar", ["application/x-bsh", "application/x-shar"]],
      ["shf", "application/shf+xml"],
      ["shtml", ["text/html", "text/x-server-parsed-html"]],
      ["sid", "audio/x-psid"],
      ["sis", "application/vnd.symbian.install"],
      ["sit", ["application/x-stuffit", "application/x-sit"]],
      ["sitx", "application/x-stuffitx"],
      ["skd", "application/x-koan"],
      ["skm", "application/x-koan"],
      ["skp", ["application/vnd.koan", "application/x-koan"]],
      ["skt", "application/x-koan"],
      ["sl", "application/x-seelogo"],
      ["sldm", "application/vnd.ms-powerpoint.slide.macroenabled.12"],
      ["sldx", "application/vnd.openxmlformats-officedocument.presentationml.slide"],
      ["slt", "application/vnd.epson.salt"],
      ["sm", "application/vnd.stepmania.stepchart"],
      ["smf", "application/vnd.stardivision.math"],
      ["smi", ["application/smil", "application/smil+xml"]],
      ["smil", "application/smil"],
      ["snd", ["audio/basic", "audio/x-adpcm"]],
      ["snf", "application/x-font-snf"],
      ["sol", "application/solids"],
      ["spc", ["text/x-speech", "application/x-pkcs7-certificates"]],
      ["spf", "application/vnd.yamaha.smaf-phrase"],
      ["spl", ["application/futuresplash", "application/x-futuresplash"]],
      ["spot", "text/vnd.in3d.spot"],
      ["spp", "application/scvp-vp-response"],
      ["spq", "application/scvp-vp-request"],
      ["spr", "application/x-sprite"],
      ["sprite", "application/x-sprite"],
      ["src", "application/x-wais-source"],
      ["sru", "application/sru+xml"],
      ["srx", "application/sparql-results+xml"],
      ["sse", "application/vnd.kodak-descriptor"],
      ["ssf", "application/vnd.epson.ssf"],
      ["ssi", "text/x-server-parsed-html"],
      ["ssm", "application/streamingmedia"],
      ["ssml", "application/ssml+xml"],
      ["sst", ["application/vnd.ms-pkicertstore", "application/vnd.ms-pki.certstore"]],
      ["st", "application/vnd.sailingtracker.track"],
      ["stc", "application/vnd.sun.xml.calc.template"],
      ["std", "application/vnd.sun.xml.draw.template"],
      ["step", "application/step"],
      ["stf", "application/vnd.wt.stf"],
      ["sti", "application/vnd.sun.xml.impress.template"],
      ["stk", "application/hyperstudio"],
      ["stl", ["application/vnd.ms-pkistl", "application/sla", "application/vnd.ms-pki.stl", "application/x-navistyle"]],
      ["stm", "text/html"],
      ["stp", "application/step"],
      ["str", "application/vnd.pg.format"],
      ["stw", "application/vnd.sun.xml.writer.template"],
      ["sub", "image/vnd.dvb.subtitle"],
      ["sus", "application/vnd.sus-calendar"],
      ["sv4cpio", "application/x-sv4cpio"],
      ["sv4crc", "application/x-sv4crc"],
      ["svc", "application/vnd.dvb.service"],
      ["svd", "application/vnd.svd"],
      ["svf", ["image/vnd.dwg", "image/x-dwg"]],
      ["svg", "image/svg+xml"],
      ["svr", ["x-world/x-svr", "application/x-world"]],
      ["swf", "application/x-shockwave-flash"],
      ["swi", "application/vnd.aristanetworks.swi"],
      ["sxc", "application/vnd.sun.xml.calc"],
      ["sxd", "application/vnd.sun.xml.draw"],
      ["sxg", "application/vnd.sun.xml.writer.global"],
      ["sxi", "application/vnd.sun.xml.impress"],
      ["sxm", "application/vnd.sun.xml.math"],
      ["sxw", "application/vnd.sun.xml.writer"],
      ["t", ["text/troff", "application/x-troff"]],
      ["talk", "text/x-speech"],
      ["tao", "application/vnd.tao.intent-module-archive"],
      ["tar", "application/x-tar"],
      ["tbk", ["application/toolbook", "application/x-tbook"]],
      ["tcap", "application/vnd.3gpp2.tcap"],
      ["tcl", ["text/x-script.tcl", "application/x-tcl"]],
      ["tcsh", "text/x-script.tcsh"],
      ["teacher", "application/vnd.smart.teacher"],
      ["tei", "application/tei+xml"],
      ["tex", "application/x-tex"],
      ["texi", "application/x-texinfo"],
      ["texinfo", "application/x-texinfo"],
      ["text", ["application/plain", "text/plain"]],
      ["tfi", "application/thraud+xml"],
      ["tfm", "application/x-tex-tfm"],
      ["tgz", ["application/gnutar", "application/x-compressed"]],
      ["thmx", "application/vnd.ms-officetheme"],
      ["tif", ["image/tiff", "image/x-tiff"]],
      ["tiff", ["image/tiff", "image/x-tiff"]],
      ["tmo", "application/vnd.tmobile-livetv"],
      ["torrent", "application/x-bittorrent"],
      ["tpl", "application/vnd.groove-tool-template"],
      ["tpt", "application/vnd.trid.tpt"],
      ["tr", "application/x-troff"],
      ["tra", "application/vnd.trueapp"],
      ["trm", "application/x-msterminal"],
      ["tsd", "application/timestamped-data"],
      ["tsi", "audio/tsp-audio"],
      ["tsp", ["application/dsptype", "audio/tsplayer"]],
      ["tsv", "text/tab-separated-values"],
      ["ttf", "application/x-font-ttf"],
      ["ttl", "text/turtle"],
      ["turbot", "image/florian"],
      ["twd", "application/vnd.simtech-mindmapper"],
      ["txd", "application/vnd.genomatix.tuxedo"],
      ["txf", "application/vnd.mobius.txf"],
      ["txt", "text/plain"],
      ["ufd", "application/vnd.ufdl"],
      ["uil", "text/x-uil"],
      ["uls", "text/iuls"],
      ["umj", "application/vnd.umajin"],
      ["uni", "text/uri-list"],
      ["unis", "text/uri-list"],
      ["unityweb", "application/vnd.unity"],
      ["unv", "application/i-deas"],
      ["uoml", "application/vnd.uoml+xml"],
      ["uri", "text/uri-list"],
      ["uris", "text/uri-list"],
      ["ustar", ["application/x-ustar", "multipart/x-ustar"]],
      ["utz", "application/vnd.uiq.theme"],
      ["uu", ["application/octet-stream", "text/x-uuencode"]],
      ["uue", "text/x-uuencode"],
      ["uva", "audio/vnd.dece.audio"],
      ["uvh", "video/vnd.dece.hd"],
      ["uvi", "image/vnd.dece.graphic"],
      ["uvm", "video/vnd.dece.mobile"],
      ["uvp", "video/vnd.dece.pd"],
      ["uvs", "video/vnd.dece.sd"],
      ["uvu", "video/vnd.uvvu.mp4"],
      ["uvv", "video/vnd.dece.video"],
      ["vcd", "application/x-cdlink"],
      ["vcf", "text/x-vcard"],
      ["vcg", "application/vnd.groove-vcard"],
      ["vcs", "text/x-vcalendar"],
      ["vcx", "application/vnd.vcx"],
      ["vda", "application/vda"],
      ["vdo", "video/vdo"],
      ["vew", "application/groupwise"],
      ["vis", "application/vnd.visionary"],
      ["viv", ["video/vivo", "video/vnd.vivo"]],
      ["vivo", ["video/vivo", "video/vnd.vivo"]],
      ["vmd", "application/vocaltec-media-desc"],
      ["vmf", "application/vocaltec-media-file"],
      ["voc", ["audio/voc", "audio/x-voc"]],
      ["vos", "video/vosaic"],
      ["vox", "audio/voxware"],
      ["vqe", "audio/x-twinvq-plugin"],
      ["vqf", "audio/x-twinvq"],
      ["vql", "audio/x-twinvq-plugin"],
      ["vrml", ["model/vrml", "x-world/x-vrml", "application/x-vrml"]],
      ["vrt", "x-world/x-vrt"],
      ["vsd", ["application/vnd.visio", "application/x-visio"]],
      ["vsf", "application/vnd.vsf"],
      ["vst", "application/x-visio"],
      ["vsw", "application/x-visio"],
      ["vtu", "model/vnd.vtu"],
      ["vxml", "application/voicexml+xml"],
      ["w60", "application/wordperfect6.0"],
      ["w61", "application/wordperfect6.1"],
      ["w6w", "application/msword"],
      ["wad", "application/x-doom"],
      ["wav", ["audio/wav", "audio/x-wav"]],
      ["wax", "audio/x-ms-wax"],
      ["wb1", "application/x-qpro"],
      ["wbmp", "image/vnd.wap.wbmp"],
      ["wbs", "application/vnd.criticaltools.wbs+xml"],
      ["wbxml", "application/vnd.wap.wbxml"],
      ["wcm", "application/vnd.ms-works"],
      ["wdb", "application/vnd.ms-works"],
      ["web", "application/vnd.xara"],
      ["weba", "audio/webm"],
      ["webm", "video/webm"],
      ["webp", "image/webp"],
      ["wg", "application/vnd.pmi.widget"],
      ["wgt", "application/widget"],
      ["wiz", "application/msword"],
      ["wk1", "application/x-123"],
      ["wks", "application/vnd.ms-works"],
      ["wm", "video/x-ms-wm"],
      ["wma", "audio/x-ms-wma"],
      ["wmd", "application/x-ms-wmd"],
      ["wmf", ["windows/metafile", "application/x-msmetafile"]],
      ["wml", "text/vnd.wap.wml"],
      ["wmlc", "application/vnd.wap.wmlc"],
      ["wmls", "text/vnd.wap.wmlscript"],
      ["wmlsc", "application/vnd.wap.wmlscriptc"],
      ["wmv", "video/x-ms-wmv"],
      ["wmx", "video/x-ms-wmx"],
      ["wmz", "application/x-ms-wmz"],
      ["woff", "application/x-font-woff"],
      ["word", "application/msword"],
      ["wp", "application/wordperfect"],
      ["wp5", ["application/wordperfect", "application/wordperfect6.0"]],
      ["wp6", "application/wordperfect"],
      ["wpd", ["application/wordperfect", "application/vnd.wordperfect", "application/x-wpwin"]],
      ["wpl", "application/vnd.ms-wpl"],
      ["wps", "application/vnd.ms-works"],
      ["wq1", "application/x-lotus"],
      ["wqd", "application/vnd.wqd"],
      ["wri", ["application/mswrite", "application/x-wri", "application/x-mswrite"]],
      ["wrl", ["model/vrml", "x-world/x-vrml", "application/x-world"]],
      ["wrz", ["model/vrml", "x-world/x-vrml"]],
      ["wsc", "text/scriplet"],
      ["wsdl", "application/wsdl+xml"],
      ["wspolicy", "application/wspolicy+xml"],
      ["wsrc", "application/x-wais-source"],
      ["wtb", "application/vnd.webturbo"],
      ["wtk", "application/x-wintalk"],
      ["wvx", "video/x-ms-wvx"],
      ["x-png", "image/png"],
      ["x3d", "application/vnd.hzn-3d-crossword"],
      ["xaf", "x-world/x-vrml"],
      ["xap", "application/x-silverlight-app"],
      ["xar", "application/vnd.xara"],
      ["xbap", "application/x-ms-xbap"],
      ["xbd", "application/vnd.fujixerox.docuworks.binder"],
      ["xbm", ["image/xbm", "image/x-xbm", "image/x-xbitmap"]],
      ["xdf", "application/xcap-diff+xml"],
      ["xdm", "application/vnd.syncml.dm+xml"],
      ["xdp", "application/vnd.adobe.xdp+xml"],
      ["xdr", "video/x-amt-demorun"],
      ["xdssc", "application/dssc+xml"],
      ["xdw", "application/vnd.fujixerox.docuworks"],
      ["xenc", "application/xenc+xml"],
      ["xer", "application/patch-ops-error+xml"],
      ["xfdf", "application/vnd.adobe.xfdf"],
      ["xfdl", "application/vnd.xfdl"],
      ["xgz", "xgl/drawing"],
      ["xhtml", "application/xhtml+xml"],
      ["xif", "image/vnd.xiff"],
      ["xl", "application/excel"],
      ["xla", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
      ["xlam", "application/vnd.ms-excel.addin.macroenabled.12"],
      ["xlb", ["application/excel", "application/vnd.ms-excel", "application/x-excel"]],
      ["xlc", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
      ["xld", ["application/excel", "application/x-excel"]],
      ["xlk", ["application/excel", "application/x-excel"]],
      ["xll", ["application/excel", "application/vnd.ms-excel", "application/x-excel"]],
      ["xlm", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
      ["xls", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
      ["xlsb", "application/vnd.ms-excel.sheet.binary.macroenabled.12"],
      ["xlsm", "application/vnd.ms-excel.sheet.macroenabled.12"],
      ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ["xlt", ["application/vnd.ms-excel", "application/excel", "application/x-excel"]],
      ["xltm", "application/vnd.ms-excel.template.macroenabled.12"],
      ["xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template"],
      ["xlv", ["application/excel", "application/x-excel"]],
      ["xlw", ["application/vnd.ms-excel", "application/excel", "application/x-msexcel", "application/x-excel"]],
      ["xm", "audio/xm"],
      ["xml", ["application/xml", "text/xml", "application/atom+xml", "application/rss+xml"]],
      ["xmz", "xgl/movie"],
      ["xo", "application/vnd.olpc-sugar"],
      ["xof", "x-world/x-vrml"],
      ["xop", "application/xop+xml"],
      ["xpi", "application/x-xpinstall"],
      ["xpix", "application/x-vnd.ls-xpix"],
      ["xpm", ["image/xpm", "image/x-xpixmap"]],
      ["xpr", "application/vnd.is-xpr"],
      ["xps", "application/vnd.ms-xpsdocument"],
      ["xpw", "application/vnd.intercon.formnet"],
      ["xslt", "application/xslt+xml"],
      ["xsm", "application/vnd.syncml+xml"],
      ["xspf", "application/xspf+xml"],
      ["xsr", "video/x-amt-showrun"],
      ["xul", "application/vnd.mozilla.xul+xml"],
      ["xwd", ["image/x-xwd", "image/x-xwindowdump"]],
      ["xyz", ["chemical/x-xyz", "chemical/x-pdb"]],
      ["yang", "application/yang"],
      ["yin", "application/yin+xml"],
      ["z", ["application/x-compressed", "application/x-compress"]],
      ["zaz", "application/vnd.zzazz.deck+xml"],
      ["zip", ["application/zip", "multipart/x-zip", "application/x-zip-compressed", "application/x-compressed"]],
      ["zir", "application/vnd.zul"],
      ["zmm", "application/vnd.handheld-entertainment+xml"],
      ["zoo", "application/octet-stream"],
      ["zsh", "text/x-script.zsh"]
    ]);
    module.exports = {
      detectMimeType(filename) {
        if (!filename) {
          return defaultMimeType;
        }
        const parsed = path.parse(filename);
        const extension = (parsed.ext.substr(1) || parsed.name || "").split("?").shift().trim().toLowerCase();
        const value = extensions.has(extension) ? extensions.get(extension) : defaultMimeType;
        if (Array.isArray(value)) {
          return value[0];
        }
        return value;
      },
      detectExtension(mimeType) {
        if (!mimeType) {
          return defaultExtension;
        }
        const parts = mimeType.toLowerCase().trim().split("/");
        const rootType = parts.shift().trim();
        const subType = parts.join("/").trim();
        if (mimeTypes.has(rootType + "/" + subType)) {
          const value = mimeTypes.get(rootType + "/" + subType);
          if (Array.isArray(value)) {
            return value[0];
          }
          return value;
        }
        switch (rootType) {
          case "text":
            return "txt";
          default:
            return "bin";
        }
      }
    };
  }
});

// node_modules/nodemailer/lib/base64/index.js
var require_base64 = __commonJS({
  "node_modules/nodemailer/lib/base64/index.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    function encode(buffer) {
      if (typeof buffer === "string") {
        buffer = Buffer.from(buffer, "utf-8");
      }
      return buffer.toString("base64");
    }
    function wrap(str, lineLength) {
      str = (str || "").toString();
      lineLength = lineLength || 76;
      if (str.length <= lineLength) {
        return str;
      }
      const result = [];
      let pos = 0;
      const chunkLength = lineLength * 1024;
      const wrapRegex = new RegExp(".{" + lineLength + "}", "g");
      while (pos < str.length) {
        const wrappedLines = str.substr(pos, chunkLength).replace(wrapRegex, "$&\r\n").trim();
        result.push(wrappedLines);
        pos += chunkLength;
      }
      return result.join("\r\n").trim();
    }
    var Encoder = class extends Transform {
      constructor(options) {
        super();
        this.options = options || {};
        if (this.options.lineLength !== false) {
          this.options.lineLength = this.options.lineLength || 76;
        }
        this._curLine = "";
        this._remainingBytes = false;
        this.inputBytes = 0;
        this.outputBytes = 0;
      }
      _transform(chunk, encoding, done) {
        if (encoding !== "buffer") {
          chunk = Buffer.from(chunk, encoding);
        }
        if (!chunk || !chunk.length) {
          return setImmediate(done);
        }
        this.inputBytes += chunk.length;
        if (this._remainingBytes && this._remainingBytes.length) {
          chunk = Buffer.concat([this._remainingBytes, chunk], this._remainingBytes.length + chunk.length);
          this._remainingBytes = false;
        }
        if (chunk.length % 3) {
          this._remainingBytes = chunk.slice(chunk.length - chunk.length % 3);
          chunk = chunk.slice(0, chunk.length - chunk.length % 3);
        } else {
          this._remainingBytes = false;
        }
        let b64 = this._curLine + encode(chunk);
        if (this.options.lineLength) {
          b64 = wrap(b64, this.options.lineLength);
          const lastLF = b64.lastIndexOf("\n");
          if (lastLF < 0) {
            this._curLine = b64;
            b64 = "";
          } else if (lastLF === b64.length - 1) {
            this._curLine = "";
          } else {
            this._curLine = b64.substring(lastLF + 1);
            b64 = b64.substring(0, lastLF + 1);
          }
        }
        if (b64) {
          this.outputBytes += b64.length;
          this.push(Buffer.from(b64, "ascii"));
        }
        setImmediate(done);
      }
      _flush(done) {
        if (this._remainingBytes && this._remainingBytes.length) {
          this._curLine += encode(this._remainingBytes);
        }
        if (this._curLine) {
          this._curLine = wrap(this._curLine, this.options.lineLength);
          this.outputBytes += this._curLine.length;
          this.push(Buffer.from(this._curLine, "ascii"));
          this._curLine = "";
        }
        done();
      }
    };
    module.exports = {
      encode,
      wrap,
      Encoder
    };
  }
});

// node_modules/nodemailer/lib/qp/index.js
var require_qp = __commonJS({
  "node_modules/nodemailer/lib/qp/index.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var QP_RANGES = [
      [9],
      // <TAB>
      [10],
      // <LF>
      [13],
      // <CR>
      [32, 60],
      // <SP>!"#$%&'()*+,-./0123456789:;
      [62, 126]
      // >?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}
    ];
    function encode(buffer) {
      if (typeof buffer === "string") {
        buffer = Buffer.from(buffer, "utf-8");
      }
      let result = "";
      let ord;
      for (let i = 0, len = buffer.length; i < len; i++) {
        ord = buffer[i];
        if (checkRanges(ord, QP_RANGES) && !((ord === 32 || ord === 9) && (i === len - 1 || buffer[i + 1] === 10 || buffer[i + 1] === 13))) {
          result += String.fromCharCode(ord);
          continue;
        }
        result += "=" + (ord < 16 ? "0" : "") + ord.toString(16).toUpperCase();
      }
      return result;
    }
    function wrap(str, lineLength) {
      str = (str || "").toString();
      lineLength = lineLength || 76;
      if (str.length <= lineLength) {
        return str;
      }
      let pos = 0;
      const len = str.length;
      let match, code, line;
      const lineMargin = Math.floor(lineLength / 3);
      let result = "";
      while (pos < len) {
        line = str.substr(pos, lineLength);
        if (match = line.match(/\r\n/)) {
          line = line.substr(0, match.index + match[0].length);
          result += line;
          pos += line.length;
          continue;
        }
        if (line.substr(-1) === "\n") {
          result += line;
          pos += line.length;
          continue;
        }
        if (match = line.substr(-lineMargin).match(/\n.*?$/)) {
          line = line.substr(0, line.length - (match[0].length - 1));
          result += line;
          pos += line.length;
          continue;
        }
        if (line.length > lineLength - lineMargin && (match = line.substr(-lineMargin).match(/[ \t.,!?][^ \t.,!?]*$/))) {
          line = line.substr(0, line.length - (match[0].length - 1));
        } else if (line.match(/[=][\da-f]{0,2}$/i)) {
          if (match = line.match(/[=][\da-f]{0,1}$/i)) {
            line = line.substr(0, line.length - match[0].length);
          }
          while (line.length > 3 && line.length < len - pos && !line.match(/^(?:=[\da-f]{2}){1,4}$/i) && (match = line.match(/[=][\da-f]{2}$/gi))) {
            code = parseInt(match[0].substr(1, 2), 16);
            if (code < 128) {
              break;
            }
            line = line.substr(0, line.length - 3);
            if (code >= 192) {
              break;
            }
          }
        }
        if (pos + line.length < len && line.substr(-1) !== "\n") {
          if (line.length === lineLength && line.match(/[=][\da-f]{2}$/i)) {
            line = line.substr(0, line.length - 3);
          } else if (line.length === lineLength) {
            line = line.substr(0, line.length - 1);
          }
          pos += line.length;
          line += "=\r\n";
        } else {
          pos += line.length;
        }
        result += line;
      }
      return result;
    }
    function checkRanges(nr, ranges) {
      for (let i = ranges.length - 1; i >= 0; i--) {
        const range = ranges[i];
        if (!range.length) {
          continue;
        }
        if (range.length === 1 && nr === range[0]) {
          return true;
        }
        if (range.length === 2 && nr >= range[0] && nr <= range[1]) {
          return true;
        }
      }
      return false;
    }
    var Encoder = class extends Transform {
      constructor(options) {
        super();
        this.options = options || {};
        if (this.options.lineLength !== false) {
          this.options.lineLength = this.options.lineLength || 76;
        }
        this._curLine = "";
        this.inputBytes = 0;
        this.outputBytes = 0;
      }
      _transform(chunk, encoding, done) {
        let qp;
        if (encoding !== "buffer") {
          chunk = Buffer.from(chunk, encoding);
        }
        if (!chunk || !chunk.length) {
          return done();
        }
        this.inputBytes += chunk.length;
        if (this.options.lineLength) {
          qp = this._curLine + encode(chunk);
          qp = wrap(qp, this.options.lineLength);
          qp = qp.replace(/(^|\n)([^\n]*)$/, (match, lineBreak, lastLine) => {
            this._curLine = lastLine;
            return lineBreak;
          });
          if (qp) {
            this.outputBytes += qp.length;
            this.push(qp);
          }
        } else {
          qp = encode(chunk);
          this.outputBytes += qp.length;
          this.push(qp, "ascii");
        }
        done();
      }
      _flush(done) {
        if (this._curLine) {
          this.outputBytes += this._curLine.length;
          this.push(this._curLine, "ascii");
        }
        done();
      }
    };
    module.exports = {
      encode,
      wrap,
      Encoder
    };
  }
});

// node_modules/nodemailer/lib/mime-funcs/index.js
var require_mime_funcs = __commonJS({
  "node_modules/nodemailer/lib/mime-funcs/index.js"(exports, module) {
    "use strict";
    var base64 = require_base64();
    var qp = require_qp();
    var mimeTypes = require_mime_types();
    module.exports = {
      /**
       * Checks if a value is plaintext string (uses only printable 7bit chars)
       *
       * @param {String} value String to be tested
       * @returns {Boolean} true if it is a plaintext string
       */
      isPlainText(value, isParam) {
        const re = isParam ? /[\x00-\x08\x0b\x0c\x0e-\x1f"\u0080-\uFFFF]/ : /[\x00-\x08\x0b\x0c\x0e-\x1f\u0080-\uFFFF]/;
        return typeof value === "string" && !re.test(value);
      },
      /**
       * Checks if a multi line string containes lines longer than the selected value.
       *
       * Useful when detecting if a mail message needs any processing at all –
       * if only plaintext characters are used and lines are short, then there is
       * no need to encode the values in any way. If the value is plaintext but has
       * longer lines then allowed, then use format=flowed
       *
       * @param {Number} lineLength Max line length to check for
       * @returns {Boolean} Returns true if there is at least one line longer than lineLength chars
       */
      hasLongerLines(str, lineLength) {
        if (str.length > 128 * 1024) {
          return true;
        }
        return new RegExp("^.{" + (lineLength + 1) + ",}", "m").test(str);
      },
      /**
       * Encodes a string or an Buffer to an UTF-8 MIME Word (rfc2047)
       *
       * @param {String|Buffer} data String to be encoded
       * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
       * @param {Number} [maxLength=0] If set, split mime words into several chunks if needed
       * @return {String} Single or several mime words joined together
       */
      encodeWord(data, mimeWordEncoding, maxLength) {
        mimeWordEncoding = (mimeWordEncoding || "Q").toString().toUpperCase().trim().charAt(0);
        maxLength = maxLength || 0;
        let encodedStr;
        const toCharset = "UTF-8";
        if (maxLength && maxLength > 7 + toCharset.length) {
          maxLength -= 7 + toCharset.length;
        }
        if (mimeWordEncoding === "Q") {
          encodedStr = qp.encode(data).replace(/[^a-z0-9!*+\-/=]/gi, (chr) => {
            const ord = chr.charCodeAt(0).toString(16).toUpperCase();
            if (chr === " ") {
              return "_";
            }
            return "=" + (ord.length === 1 ? "0" + ord : ord);
          });
        } else if (mimeWordEncoding === "B") {
          encodedStr = typeof data === "string" ? data : base64.encode(data);
          maxLength = maxLength ? Math.max(3, (maxLength - maxLength % 4) / 4 * 3) : 0;
        }
        if (maxLength && (mimeWordEncoding !== "B" ? encodedStr : base64.encode(data)).length > maxLength) {
          if (mimeWordEncoding === "Q") {
            encodedStr = this.splitMimeEncodedString(encodedStr, maxLength).join("?= =?" + toCharset + "?" + mimeWordEncoding + "?");
          } else {
            const parts = [];
            let lpart = "";
            for (let i = 0, len = encodedStr.length; i < len; i++) {
              let chr = encodedStr.charAt(i);
              if (/[\ud83c\ud83d\ud83e]/.test(chr) && i < len - 1) {
                chr += encodedStr.charAt(++i);
              }
              if (Buffer.byteLength(lpart + chr) <= maxLength || i === 0) {
                lpart += chr;
              } else {
                parts.push(base64.encode(lpart));
                lpart = chr;
              }
            }
            if (lpart) {
              parts.push(base64.encode(lpart));
            }
            if (parts.length > 1) {
              encodedStr = parts.join("?= =?" + toCharset + "?" + mimeWordEncoding + "?");
            } else {
              encodedStr = parts.join("");
            }
          }
        } else if (mimeWordEncoding === "B") {
          encodedStr = base64.encode(data);
        }
        return "=?" + toCharset + "?" + mimeWordEncoding + "?" + encodedStr + (encodedStr.substr(-2) === "?=" ? "" : "?=");
      },
      /**
       * Finds word sequences with non ascii text and converts these to mime words
       *
       * @param {String} value String to be encoded
       * @param {String} mimeWordEncoding='Q' Encoding for the mime word, either Q or B
       * @param {Number} [maxLength=0] If set, split mime words into several chunks if needed
       * @param {Boolean} [encodeAll=false] If true and the value needs encoding then encodes entire string, not just the smallest match
       * @return {String} String with possible mime words
       */
      encodeWords(value, mimeWordEncoding, maxLength, encodeAll) {
        maxLength = maxLength || 0;
        const firstMatch = value.match(/(?:^|\s)([^\s]*["\u0080-\uFFFF])/);
        if (!firstMatch) {
          return value;
        }
        if (encodeAll) {
          return this.encodeWord(value, mimeWordEncoding, maxLength);
        }
        const lastMatch = value.match(/(["\u0080-\uFFFF][^\s]*)[^"\u0080-\uFFFF]*$/);
        if (!lastMatch) {
          return value;
        }
        const startIndex = firstMatch.index + (firstMatch[0].match(/[^\s]/) || {
          index: 0
        }).index;
        const endIndex = lastMatch.index + (lastMatch[1] || "").length;
        return (startIndex ? value.substr(0, startIndex) : "") + this.encodeWord(value.substring(startIndex, endIndex), mimeWordEncoding || "Q", maxLength) + (endIndex < value.length ? value.substr(endIndex) : "");
      },
      /**
       * Joins parsed header value together as 'value; param1=value1; param2=value2'
       * PS: We are following RFC 822 for the list of special characters that we need to keep in quotes.
       *      Refer: https://www.w3.org/Protocols/rfc1341/4_Content-Type.html
       * @param {Object} structured Parsed header value
       * @return {String} joined header value
       */
      buildHeaderValue(structured) {
        const paramsArray = [];
        Object.keys(structured.params || {}).forEach((param) => {
          const value = structured.params[param];
          if (!this.isPlainText(value, true) || value.length >= 75) {
            this.buildHeaderParam(param, value, 50).forEach((encodedParam) => {
              if (!/[\s"\\;:/=(),<>@[\]?]|^[-']|'$/.test(encodedParam.value) || encodedParam.key.substr(-1) === "*") {
                paramsArray.push(encodedParam.key + "=" + encodedParam.value);
              } else {
                paramsArray.push(encodedParam.key + "=" + JSON.stringify(encodedParam.value));
              }
            });
          } else if (/[\s'"\\;:/=(),<>@[\]?]|^-/.test(value)) {
            paramsArray.push(param + "=" + JSON.stringify(value));
          } else {
            paramsArray.push(param + "=" + value);
          }
        });
        return structured.value + (paramsArray.length ? "; " + paramsArray.join("; ") : "");
      },
      /**
       * Encodes a string or an Buffer to an UTF-8 Parameter Value Continuation encoding (rfc2231)
       * Useful for splitting long parameter values.
       *
       * For example
       *      title="unicode string"
       * becomes
       *     title*0*=utf-8''unicode
       *     title*1*=%20string
       *
       * @param {String|Buffer} data String to be encoded
       * @param {Number} [maxLength=50] Max length for generated chunks
       * @param {String} [fromCharset='UTF-8'] Source sharacter set
       * @return {Array} A list of encoded keys and headers
       */
      buildHeaderParam(key, data, maxLength) {
        const list = [];
        let encodedStr = typeof data === "string" ? data : (data || "").toString();
        let chr, ord;
        let line;
        let startPos = 0;
        let i, len;
        maxLength = maxLength || 50;
        if (this.isPlainText(data, true)) {
          if (encodedStr.length <= maxLength) {
            return [
              {
                key,
                value: encodedStr
              }
            ];
          }
          encodedStr = encodedStr.replace(new RegExp(".{" + maxLength + "}", "g"), (str) => {
            list.push({
              line: str
            });
            return "";
          });
          if (encodedStr) {
            list.push({
              line: encodedStr
            });
          }
        } else {
          if (/[\uD800-\uDBFF]/.test(encodedStr)) {
            const encodedStrArr = [];
            for (i = 0, len = encodedStr.length; i < len; i++) {
              chr = encodedStr.charAt(i);
              ord = chr.charCodeAt(0);
              if (ord >= 55296 && ord <= 56319 && i < len - 1) {
                chr += encodedStr.charAt(i + 1);
                encodedStrArr.push(chr);
                i++;
              } else {
                encodedStrArr.push(chr);
              }
            }
            encodedStr = encodedStrArr;
          }
          line = "utf-8''";
          let encoded = true;
          startPos = 0;
          for (i = 0, len = encodedStr.length; i < len; i++) {
            chr = encodedStr[i];
            if (encoded) {
              chr = this.safeEncodeURIComponent(chr);
            } else {
              chr = chr === " " ? chr : this.safeEncodeURIComponent(chr);
              if (chr !== encodedStr[i]) {
                if ((this.safeEncodeURIComponent(line) + chr).length >= maxLength) {
                  list.push({
                    line,
                    encoded
                  });
                  line = "";
                  startPos = i - 1;
                } else {
                  encoded = true;
                  i = startPos;
                  line = "";
                  continue;
                }
              }
            }
            if ((line + chr).length >= maxLength) {
              list.push({
                line,
                encoded
              });
              line = chr = encodedStr[i] === " " ? " " : this.safeEncodeURIComponent(encodedStr[i]);
              if (chr === encodedStr[i]) {
                encoded = false;
                startPos = i - 1;
              } else {
                encoded = true;
              }
            } else {
              line += chr;
            }
          }
          if (line) {
            list.push({
              line,
              encoded
            });
          }
        }
        return list.map((item, i2) => ({
          // encoded lines: {name}*{part}*
          // unencoded lines: {name}*{part}
          // if any line needs to be encoded then the first line (part==0) is always encoded
          key: key + "*" + i2 + (item.encoded ? "*" : ""),
          value: item.line
        }));
      },
      /**
       * Parses a header value with key=value arguments into a structured
       * object.
       *
       *   parseHeaderValue('content-type: text/plain; CHARSET='UTF-8'') ->
       *   {
       *     'value': 'text/plain',
       *     'params': {
       *       'charset': 'UTF-8'
       *     }
       *   }
       *
       * @param {String} str Header value
       * @return {Object} Header value as a parsed structure
       */
      parseHeaderValue(str) {
        const response = {
          value: false,
          params: {}
        };
        let key = false;
        let value = "";
        let type = "value";
        let quote = false;
        let escaped = false;
        let chr;
        for (let i = 0, len = str.length; i < len; i++) {
          chr = str.charAt(i);
          if (type === "key") {
            if (chr === "=") {
              key = value.trim().toLowerCase();
              type = "value";
              value = "";
              continue;
            }
            value += chr;
          } else {
            if (escaped) {
              value += chr;
            } else if (chr === "\\") {
              escaped = true;
              continue;
            } else if (quote && chr === quote) {
              quote = false;
            } else if (!quote && chr === '"') {
              quote = chr;
            } else if (!quote && chr === ";") {
              if (key === false) {
                response.value = value.trim();
              } else {
                response.params[key] = value.trim();
              }
              type = "key";
              value = "";
            } else {
              value += chr;
            }
            escaped = false;
          }
        }
        if (type === "value") {
          if (key === false) {
            response.value = value.trim();
          } else {
            response.params[key] = value.trim();
          }
        } else if (value.trim()) {
          response.params[value.trim().toLowerCase()] = "";
        }
        Object.keys(response.params).forEach((key2) => {
          let actualKey, nr, match, value2;
          if (match = key2.match(/(\*(\d+)|\*(\d+)\*|\*)$/)) {
            actualKey = key2.substr(0, match.index);
            nr = Number(match[2] || match[3]) || 0;
            if (!response.params[actualKey] || typeof response.params[actualKey] !== "object") {
              response.params[actualKey] = {
                charset: false,
                values: []
              };
            }
            value2 = response.params[key2];
            if (nr === 0 && match[0].substr(-1) === "*" && (match = value2.match(/^([^']*)'[^']*'(.*)$/))) {
              response.params[actualKey].charset = match[1] || "iso-8859-1";
              value2 = match[2];
            }
            response.params[actualKey].values[nr] = value2;
            delete response.params[key2];
          }
        });
        Object.keys(response.params).forEach((key2) => {
          let value2;
          if (response.params[key2] && Array.isArray(response.params[key2].values)) {
            value2 = response.params[key2].values.map((val) => val || "").join("");
            if (response.params[key2].charset) {
              response.params[key2] = "=?" + response.params[key2].charset + "?Q?" + value2.replace(/[=?_\s]/g, (s) => {
                const c = s.charCodeAt(0).toString(16);
                if (s === " ") {
                  return "_";
                }
                return "%" + (c.length < 2 ? "0" : "") + c;
              }).replace(/%/g, "=") + "?=";
            } else {
              response.params[key2] = value2;
            }
          }
        });
        return response;
      },
      /**
       * Returns file extension for a content type string. If no suitable extensions
       * are found, 'bin' is used as the default extension
       *
       * @param {String} mimeType Content type to be checked for
       * @return {String} File extension
       */
      detectExtension: (mimeType) => mimeTypes.detectExtension(mimeType),
      /**
       * Returns content type for a file extension. If no suitable content types
       * are found, 'application/octet-stream' is used as the default content type
       *
       * @param {String} extension Extension to be checked for
       * @return {String} File extension
       */
      detectMimeType: (extension) => mimeTypes.detectMimeType(extension),
      /**
       * Folds long lines, useful for folding header lines (afterSpace=false) and
       * flowed text (afterSpace=true)
       *
       * @param {String} str String to be folded
       * @param {Number} [lineLength=76] Maximum length of a line
       * @param {Boolean} afterSpace If true, leave a space in th end of a line
       * @return {String} String with folded lines
       */
      foldLines(str, lineLength, afterSpace) {
        str = (str || "").toString();
        lineLength = lineLength || 76;
        let pos = 0;
        const len = str.length;
        let result = "";
        let line, match;
        while (pos < len) {
          line = str.substr(pos, lineLength);
          if (line.length < lineLength) {
            result += line;
            break;
          }
          if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
            line = match[0];
            result += line;
            pos += line.length;
            continue;
          } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
            line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
          } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
            line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
          }
          result += line;
          pos += line.length;
          if (pos < len) {
            result += "\r\n";
          }
        }
        return result;
      },
      /**
       * Splits a mime encoded string. Needed for dividing mime words into smaller chunks
       *
       * @param {String} str Mime encoded string to be split up
       * @param {Number} maxlen Maximum length of characters for one part (minimum 12)
       * @return {Array} Split string
       */
      splitMimeEncodedString: (str, maxlen) => {
        const lines = [];
        let curLine, match, chr, done;
        maxlen = Math.max(maxlen || 0, 12);
        while (str.length) {
          curLine = str.substr(0, maxlen);
          if (match = curLine.match(/[=][0-9A-F]?$/i)) {
            curLine = curLine.substr(0, match.index);
          }
          done = false;
          while (!done) {
            done = true;
            if (match = str.substr(curLine.length).match(/^[=]([0-9A-F]{2})/i)) {
              chr = parseInt(match[1], 16);
              if (chr < 194 && chr > 127) {
                curLine = curLine.substr(0, curLine.length - 3);
                done = false;
              }
            }
          }
          if (curLine.length) {
            lines.push(curLine);
          }
          str = str.substr(curLine.length);
        }
        return lines;
      },
      encodeURICharComponent: (chr) => {
        let res = "";
        let ord = chr.charCodeAt(0).toString(16).toUpperCase();
        if (ord.length % 2) {
          ord = "0" + ord;
        }
        if (ord.length > 2) {
          for (let i = 0, len = ord.length / 2; i < len; i++) {
            res += "%" + ord.substr(i, 2);
          }
        } else {
          res += "%" + ord;
        }
        return res;
      },
      safeEncodeURIComponent(str) {
        str = (str || "").toString();
        try {
          str = encodeURIComponent(str);
        } catch (_E) {
          return str.replace(/[^\x00-\x1F *'()<>@,;:\\"[\]?=\u007F-\uFFFF]+/g, "");
        }
        return str.replace(/[\x00-\x1F *'()<>@,;:\\"[\]?=\u007F-\uFFFF]/g, (chr) => this.encodeURICharComponent(chr));
      }
    };
  }
});

// node_modules/nodemailer/lib/addressparser/index.js
var require_addressparser = __commonJS({
  "node_modules/nodemailer/lib/addressparser/index.js"(exports, module) {
    "use strict";
    function _handleAddress(tokens, depth) {
      let isGroup = false;
      let state = "text";
      const addresses = [];
      const data = {
        address: [],
        comment: [],
        group: [],
        text: [],
        textWasQuoted: []
      };
      let insideQuotes = false;
      for (let i = 0, len = tokens.length; i < len; i++) {
        const token = tokens[i];
        const prevToken = i ? tokens[i - 1] : null;
        if (token.type === "operator") {
          switch (token.value) {
            case "<":
              state = "address";
              insideQuotes = false;
              break;
            case "(":
              state = "comment";
              insideQuotes = false;
              break;
            case ":":
              state = "group";
              isGroup = true;
              insideQuotes = false;
              break;
            case '"':
              insideQuotes = !insideQuotes;
              state = "text";
              break;
            default:
              state = "text";
              insideQuotes = false;
              break;
          }
        } else if (token.value) {
          if (state === "address") {
            token.value = token.value.replace(/^[^<]*<\s*/, "");
          }
          if (prevToken && prevToken.noBreak && data[state].length) {
            data[state][data[state].length - 1] += token.value;
            if (state === "text" && insideQuotes) {
              data.textWasQuoted[data.textWasQuoted.length - 1] = true;
            }
          } else {
            data[state].push(token.value);
            if (state === "text") {
              data.textWasQuoted.push(insideQuotes);
            }
          }
        }
      }
      if (!data.text.length && data.comment.length) {
        data.text = data.comment;
        data.comment = [];
      }
      if (isGroup) {
        data.text = data.text.join(" ");
        let groupMembers = [];
        if (data.group.length) {
          const parsedGroup = addressparser(data.group.join(","), { _depth: depth + 1 });
          parsedGroup.forEach((member) => {
            if (member.group) {
              groupMembers = groupMembers.concat(member.group);
            } else {
              groupMembers.push(member);
            }
          });
        }
        addresses.push({
          name: data.text || "",
          group: groupMembers
        });
      } else {
        if (!data.address.length && data.text.length) {
          for (let i = data.text.length - 1; i >= 0; i--) {
            if (!data.textWasQuoted[i] && /^[^@\s]+@[^@\s]+$/.test(data.text[i])) {
              data.address = data.text.splice(i, 1);
              data.textWasQuoted.splice(i, 1);
              break;
            }
          }
          if (!data.address.length) {
            let extracted = false;
            for (let i = data.text.length - 1; i >= 0; i--) {
              if (!data.textWasQuoted[i]) {
                data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, (match) => {
                  if (!extracted) {
                    data.address = [match.trim()];
                    extracted = true;
                    return " ";
                  }
                  return match;
                }).trim();
                if (extracted) {
                  break;
                }
              }
            }
          }
        }
        if (!data.text.length && data.comment.length) {
          data.text = data.comment;
          data.comment = [];
        }
        if (data.address.length > 1) {
          data.text = data.text.concat(data.address.splice(1));
        }
        data.text = data.text.join(" ");
        data.address = data.address.join(" ");
        const address = {
          address: data.address || data.text || "",
          name: data.text || data.address || ""
        };
        if (address.address === address.name) {
          if (/@/.test(address.address || "")) {
            address.name = "";
          } else {
            address.address = "";
          }
        }
        addresses.push(address);
      }
      return addresses;
    }
    var Tokenizer = class {
      constructor(str) {
        this.str = (str || "").toString();
        this.operatorCurrent = "";
        this.operatorExpecting = "";
        this.node = null;
        this.escaped = false;
        this.inDomainLiteral = false;
        this.list = [];
        this.operators = {
          '"': '"',
          "(": ")",
          "<": ">",
          ",": "",
          ":": ";",
          // Semicolons are not a legal delimiter per the RFC2822 grammar other
          // than for terminating a group, but they are also not valid for any
          // other use in this context.  Given that some mail clients have
          // historically allowed the semicolon as a delimiter equivalent to the
          // comma in their UI, it makes sense to treat them the same as a comma
          // when used outside of a group.
          ";": ""
        };
      }
      /**
       * Tokenizes the original input string
       *
       * @return {Array} An array of operator|text tokens
       */
      tokenize() {
        const list = [];
        for (let i = 0, len = this.str.length; i < len; i++) {
          const chr = this.str.charAt(i);
          const nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
          this.checkChar(chr, nextChr);
        }
        this.list.forEach((node) => {
          node.value = (node.value || "").toString().trim();
          if (node.value) {
            list.push(node);
          }
        });
        return list;
      }
      /**
       * Checks if a character is an operator or text and acts accordingly
       *
       * @param {String} chr Character from the address field
       */
      checkChar(chr, nextChr) {
        if (!this.escaped && !this.operatorExpecting) {
          if (!this.inDomainLiteral && chr === "[") {
            this.inDomainLiteral = true;
          } else if (this.inDomainLiteral && (chr === "]" || chr === "," || chr === ";")) {
            this.inDomainLiteral = false;
          }
        }
        if (this.escaped) {
        } else if (chr === this.operatorExpecting) {
          this.node = {
            type: "operator",
            value: chr
          };
          if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
            this.node.noBreak = true;
          }
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = "";
          this.escaped = false;
          return;
        } else if (!this.operatorExpecting && !this.inDomainLiteral && chr in this.operators) {
          this.node = {
            type: "operator",
            value: chr
          };
          this.list.push(this.node);
          this.node = null;
          this.operatorExpecting = this.operators[chr];
          this.escaped = false;
          return;
        } else if (['"', "'"].includes(this.operatorExpecting) && chr === "\\") {
          this.escaped = true;
          return;
        }
        if (!this.node) {
          this.node = {
            type: "text",
            value: ""
          };
          this.list.push(this.node);
        }
        if (chr === "\n") {
          chr = " ";
        }
        if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
          this.node.value += chr;
        }
        this.escaped = false;
      }
    };
    var MAX_NESTED_GROUP_DEPTH = 50;
    function addressparser(str, options) {
      options = options || {};
      const depth = options._depth || 0;
      if (depth > MAX_NESTED_GROUP_DEPTH) {
        return [];
      }
      const tokenizer = new Tokenizer(str);
      const tokens = tokenizer.tokenize();
      const addresses = [];
      let address = [];
      let parsedAddresses = [];
      tokens.forEach((token) => {
        if (token.type === "operator" && (token.value === "," || token.value === ";")) {
          if (address.length) {
            addresses.push(address);
          }
          address = [];
        } else {
          address.push(token);
        }
      });
      if (address.length) {
        addresses.push(address);
      }
      addresses.forEach((addr) => {
        const handled = _handleAddress(addr, depth);
        if (handled.length) {
          parsedAddresses = parsedAddresses.concat(handled);
        }
      });
      for (let i = parsedAddresses.length - 2; i >= 0; i--) {
        const current = parsedAddresses[i];
        const next = parsedAddresses[i + 1];
        if (current.address === "" && current.name && !current.group && next.address && next.name) {
          next.name = current.name + ", " + next.name;
          parsedAddresses.splice(i, 1);
        }
      }
      if (options.flatten) {
        const flatAddresses = [];
        const walkAddressList = (list) => {
          list.forEach((entry) => {
            if (entry.group) {
              return walkAddressList(entry.group);
            }
            flatAddresses.push(entry);
          });
        };
        walkAddressList(parsedAddresses);
        return flatAddresses;
      }
      return parsedAddresses;
    }
    module.exports = addressparser;
  }
});

// node_modules/nodemailer/lib/mime-node/last-newline.js
var require_last_newline = __commonJS({
  "node_modules/nodemailer/lib/mime-node/last-newline.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var LastNewline = class extends Transform {
      constructor() {
        super();
        this.lastByte = false;
      }
      _transform(chunk, encoding, done) {
        if (chunk.length) {
          this.lastByte = chunk[chunk.length - 1];
        }
        this.push(chunk);
        done();
      }
      _flush(done) {
        if (this.lastByte === 10) {
          return done();
        }
        if (this.lastByte === 13) {
          this.push(Buffer.from("\n"));
          return done();
        }
        this.push(Buffer.from("\r\n"));
        return done();
      }
    };
    module.exports = LastNewline;
  }
});

// node_modules/nodemailer/lib/mime-node/le-windows.js
var require_le_windows = __commonJS({
  "node_modules/nodemailer/lib/mime-node/le-windows.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var LeWindows = class extends Transform {
      constructor(options) {
        super(options);
        this.lastByte = false;
      }
      /**
       * Escapes dots
       */
      _transform(chunk, encoding, done) {
        let buf;
        let lastPos = 0;
        for (let i = 0, len = chunk.length; i < len; i++) {
          if (chunk[i] === 10) {
            if (i && chunk[i - 1] !== 13 || !i && this.lastByte !== 13) {
              if (i > lastPos) {
                buf = chunk.slice(lastPos, i);
                this.push(buf);
              }
              this.push(Buffer.from("\r\n"));
              lastPos = i + 1;
            }
          }
        }
        if (lastPos && lastPos < chunk.length) {
          buf = chunk.slice(lastPos);
          this.push(buf);
        } else if (!lastPos) {
          this.push(chunk);
        }
        this.lastByte = chunk[chunk.length - 1];
        done();
      }
    };
    module.exports = LeWindows;
  }
});

// node_modules/nodemailer/lib/mime-node/le-unix.js
var require_le_unix = __commonJS({
  "node_modules/nodemailer/lib/mime-node/le-unix.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var LeUnix = class extends Transform {
      constructor(options) {
        super(options);
      }
      /**
       * Escapes dots
       */
      _transform(chunk, encoding, done) {
        let buf;
        let lastPos = 0;
        for (let i = 0, len = chunk.length; i < len; i++) {
          if (chunk[i] === 13) {
            buf = chunk.slice(lastPos, i);
            lastPos = i + 1;
            this.push(buf);
          }
        }
        if (lastPos && lastPos < chunk.length) {
          buf = chunk.slice(lastPos);
          this.push(buf);
        } else if (!lastPos) {
          this.push(chunk);
        }
        done();
      }
    };
    module.exports = LeUnix;
  }
});

// node_modules/nodemailer/lib/mime-node/index.js
var require_mime_node = __commonJS({
  "node_modules/nodemailer/lib/mime-node/index.js"(exports, module) {
    "use strict";
    var crypto = __require("crypto");
    var fs = __require("fs");
    var punycode = require_punycode();
    var { PassThrough } = __require("stream");
    var shared = require_shared();
    var mimeFuncs = require_mime_funcs();
    var qp = require_qp();
    var base64 = require_base64();
    var addressparser = require_addressparser();
    var nmfetch = require_fetch();
    var errors = require_errors();
    var LastNewline = require_last_newline();
    var LeWindows = require_le_windows();
    var LeUnix = require_le_unix();
    var FORMATTED_HEADERS = ["From", "Sender", "To", "Cc", "Bcc", "Reply-To", "Date", "References"];
    var MimeNode = class _MimeNode {
      constructor(contentType, options) {
        this.nodeCounter = 0;
        options = options || {};
        this.baseBoundary = options.baseBoundary || crypto.randomBytes(8).toString("hex");
        this.boundaryPrefix = options.boundaryPrefix || "--_NmP";
        this.disableFileAccess = !!options.disableFileAccess;
        this.disableUrlAccess = !!options.disableUrlAccess;
        this.normalizeHeaderKey = options.normalizeHeaderKey;
        this.date = options.parentNode ? null : /* @__PURE__ */ new Date();
        this.rootNode = options.rootNode || this;
        this.keepBcc = !!options.keepBcc;
        if (options.filename) {
          this.filename = options.filename;
          if (!contentType) {
            contentType = mimeFuncs.detectMimeType(this.filename.split(".").pop());
          }
        }
        this.textEncoding = (options.textEncoding || "").toString().trim().charAt(0).toUpperCase();
        this.parentNode = options.parentNode;
        this.hostname = options.hostname;
        this.newline = options.newline;
        this.childNodes = [];
        this._nodeId = ++this.rootNode.nodeCounter;
        this._headers = [];
        this._isPlainText = false;
        this._hasLongLines = false;
        this._envelope = false;
        this._raw = false;
        this._transforms = [];
        this._processFuncs = [];
        if (contentType) {
          this.setHeader("Content-Type", contentType);
        }
      }
      /////// PUBLIC METHODS
      /**
       * Creates and appends a child node.Arguments provided are passed to MimeNode constructor
       *
       * @param {String} [contentType] Optional content type
       * @param {Object} [options] Optional options object
       * @return {Object} Created node object
       */
      createChild(contentType, options) {
        if (!options && typeof contentType === "object") {
          options = contentType;
          contentType = void 0;
        }
        const node = new _MimeNode(contentType, options);
        this.appendChild(node);
        return node;
      }
      /**
       * Appends an existing node to the mime tree. Removes the node from an existing
       * tree if needed
       *
       * @param {Object} childNode node to be appended
       * @return {Object} Appended node object
       */
      appendChild(childNode) {
        if (childNode.rootNode !== this.rootNode) {
          childNode.rootNode = this.rootNode;
          childNode._nodeId = ++this.rootNode.nodeCounter;
        }
        childNode.parentNode = this;
        this.childNodes.push(childNode);
        return childNode;
      }
      /**
       * Replaces current node with another node
       *
       * @param {Object} node Replacement node
       * @return {Object} Replacement node
       */
      replace(node) {
        if (node === this) {
          return this;
        }
        this.parentNode.childNodes.forEach((childNode, i) => {
          if (childNode === this) {
            node.rootNode = this.rootNode;
            node.parentNode = this.parentNode;
            node._nodeId = this._nodeId;
            this.rootNode = this;
            this.parentNode = void 0;
            node.parentNode.childNodes[i] = node;
          }
        });
        return node;
      }
      /**
       * Removes current node from the mime tree
       *
       * @return {Object} removed node
       */
      remove() {
        if (!this.parentNode) {
          return this;
        }
        for (let i = this.parentNode.childNodes.length - 1; i >= 0; i--) {
          if (this.parentNode.childNodes[i] === this) {
            this.parentNode.childNodes.splice(i, 1);
            this.parentNode = void 0;
            this.rootNode = this;
            return this;
          }
        }
      }
      /**
       * Sets a header value. If the value for selected key exists, it is overwritten.
       * You can set multiple values as well by using [{key:'', value:''}] or
       * {key: 'value'} as the first argument.
       *
       * @param {String|Array|Object} key Header key or a list of key value pairs
       * @param {String} value Header value
       * @return {Object} current node
       */
      setHeader(key, value) {
        let added = false;
        if (!value && key && typeof key === "object") {
          if (key.key && "value" in key) {
            this.setHeader(key.key, key.value);
          } else if (Array.isArray(key)) {
            key.forEach((i) => {
              this.setHeader(i.key, i.value);
            });
          } else {
            Object.keys(key).forEach((i) => {
              this.setHeader(i, key[i]);
            });
          }
          return this;
        }
        key = this._normalizeHeaderKey(key);
        const headerValue = {
          key,
          value
        };
        for (let i = 0, len = this._headers.length; i < len; i++) {
          if (this._headers[i].key === key) {
            if (!added) {
              this._headers[i] = headerValue;
              added = true;
            } else {
              this._headers.splice(i, 1);
              i--;
              len--;
            }
          }
        }
        if (!added) {
          this._headers.push(headerValue);
        }
        return this;
      }
      /**
       * Adds a header value. If the value for selected key exists, the value is appended
       * as a new field and old one is not touched.
       * You can set multiple values as well by using [{key:'', value:''}] or
       * {key: 'value'} as the first argument.
       *
       * @param {String|Array|Object} key Header key or a list of key value pairs
       * @param {String} value Header value
       * @return {Object} current node
       */
      addHeader(key, value) {
        if (!value && key && typeof key === "object") {
          if (key.key && key.value) {
            this.addHeader(key.key, key.value);
          } else if (Array.isArray(key)) {
            key.forEach((i) => {
              this.addHeader(i.key, i.value);
            });
          } else {
            Object.keys(key).forEach((i) => {
              this.addHeader(i, key[i]);
            });
          }
          return this;
        } else if (Array.isArray(value)) {
          value.forEach((val) => {
            this.addHeader(key, val);
          });
          return this;
        }
        this._headers.push({
          key: this._normalizeHeaderKey(key),
          value
        });
        return this;
      }
      /**
       * Retrieves the first mathcing value of a selected key
       *
       * @param {String} key Key to search for
       * @retun {String} Value for the key
       */
      getHeader(key) {
        key = this._normalizeHeaderKey(key);
        for (let i = 0, len = this._headers.length; i < len; i++) {
          if (this._headers[i].key === key) {
            return this._headers[i].value;
          }
        }
      }
      /**
       * Sets body content for current node. If the value is a string, charset is added automatically
       * to Content-Type (if it is text/*). If the value is a Buffer, you need to specify
       * the charset yourself
       *
       * @param (String|Buffer) content Body content
       * @return {Object} current node
       */
      setContent(content) {
        this.content = content;
        if (typeof this.content.pipe === "function") {
          this._contentErrorHandler = (err2) => {
            this.content.removeListener("error", this._contentErrorHandler);
            this.content = err2;
          };
          this.content.once("error", this._contentErrorHandler);
        } else if (typeof this.content === "string") {
          this._isPlainText = mimeFuncs.isPlainText(this.content);
          if (this._isPlainText && mimeFuncs.hasLongerLines(this.content, 76)) {
            this._hasLongLines = true;
          }
        }
        return this;
      }
      build(callback) {
        let promise;
        if (!callback) {
          promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
          });
        }
        const stream = this.createReadStream();
        const buf = [];
        let buflen = 0;
        let returned = false;
        stream.on("readable", () => {
          let chunk;
          while ((chunk = stream.read()) !== null) {
            buf.push(chunk);
            buflen += chunk.length;
          }
        });
        stream.once("error", (err2) => {
          if (returned) {
            return;
          }
          returned = true;
          return callback(err2);
        });
        stream.once("end", (chunk) => {
          if (returned) {
            return;
          }
          returned = true;
          if (chunk && chunk.length) {
            buf.push(chunk);
            buflen += chunk.length;
          }
          return callback(null, Buffer.concat(buf, buflen));
        });
        return promise;
      }
      getTransferEncoding() {
        let transferEncoding = false;
        const contentType = (this.getHeader("Content-Type") || "").toString().toLowerCase().trim();
        if (this.content) {
          transferEncoding = (this.getHeader("Content-Transfer-Encoding") || "").toString().toLowerCase().trim();
          if (!transferEncoding || !["base64", "quoted-printable"].includes(transferEncoding)) {
            if (/^text\//i.test(contentType)) {
              if (this._isPlainText && !this._hasLongLines) {
                transferEncoding = "7bit";
              } else if (typeof this.content === "string" || this.content instanceof Buffer) {
                transferEncoding = this._getTextEncoding(this.content) === "Q" ? "quoted-printable" : "base64";
              } else {
                transferEncoding = this.textEncoding === "B" ? "base64" : "quoted-printable";
              }
            } else if (!/^(multipart|message)\//i.test(contentType)) {
              transferEncoding = transferEncoding || "base64";
            }
          }
        }
        return transferEncoding;
      }
      /**
       * Builds the header block for the mime node. Append \r\n\r\n before writing the content
       *
       * @returns {String} Headers
       */
      buildHeaders() {
        const transferEncoding = this.getTransferEncoding();
        const headers = [];
        if (transferEncoding) {
          this.setHeader("Content-Transfer-Encoding", transferEncoding);
        }
        if (this.filename && !this.getHeader("Content-Disposition")) {
          this.setHeader("Content-Disposition", "attachment");
        }
        if (this.rootNode === this) {
          if (!this.getHeader("Date")) {
            this.setHeader("Date", this.date.toUTCString().replace(/GMT/, "+0000"));
          }
          this.messageId();
          if (!this.getHeader("MIME-Version")) {
            this.setHeader("MIME-Version", "1.0");
          }
          for (let i = this._headers.length - 2; i >= 0; i--) {
            const header = this._headers[i];
            if (header.key === "Content-Type") {
              this._headers.splice(i, 1);
              this._headers.push(header);
            }
          }
        }
        this._headers.forEach((header) => {
          let key = header.key;
          let value = header.value;
          let structured;
          let param;
          const options = {};
          const formattedHeaders = FORMATTED_HEADERS;
          if (value && typeof value === "object" && !formattedHeaders.includes(key)) {
            Object.keys(value).forEach((key2) => {
              if (key2 !== "value") {
                options[key2] = value[key2];
              }
            });
            value = (value.value || "").toString();
            if (!value.trim()) {
              return;
            }
          }
          if (options.prepared) {
            if (options.foldLines) {
              headers.push(mimeFuncs.foldLines(key + ": " + value));
            } else {
              headers.push(key + ": " + value);
            }
            return;
          }
          switch (header.key) {
            case "Content-Disposition":
              structured = mimeFuncs.parseHeaderValue(value);
              if (this.filename) {
                structured.params.filename = this.filename;
              }
              value = mimeFuncs.buildHeaderValue(structured);
              break;
            case "Content-Type":
              structured = mimeFuncs.parseHeaderValue(value);
              this._handleContentType(structured);
              if (structured.value.match(/^text\/plain\b/) && typeof this.content === "string" && /[\u0080-\uFFFF]/.test(this.content)) {
                structured.params.charset = "utf-8";
              }
              value = mimeFuncs.buildHeaderValue(structured);
              if (this.filename) {
                param = this._encodeWords(this.filename);
                if (param !== this.filename || /[\s'"\\;:/=(),<>@[\]?]|^-/.test(param)) {
                  param = '"' + param + '"';
                }
                value += "; name=" + param;
              }
              break;
            case "Bcc":
              if (!this.keepBcc) {
                return;
              }
              break;
          }
          value = this._encodeHeaderValue(key, value);
          if (!(value || "").toString().trim()) {
            return;
          }
          if (typeof this.normalizeHeaderKey === "function") {
            const normalized = this.normalizeHeaderKey(key, value);
            if (normalized && typeof normalized === "string" && normalized.length) {
              key = normalized;
            }
          }
          headers.push(mimeFuncs.foldLines(key + ": " + value, 76));
        });
        return headers.join("\r\n");
      }
      /**
       * Streams the rfc2822 message from the current node. If this is a root node,
       * mandatory header fields are set if missing (Date, Message-Id, MIME-Version)
       *
       * @return {String} Compiled message
       */
      createReadStream(options) {
        options = options || {};
        const stream = new PassThrough(options);
        let outputStream = stream;
        let transform;
        this.stream(stream, options, (err2) => {
          if (err2) {
            outputStream.emit("error", err2);
            return;
          }
          stream.end();
        });
        for (let i = 0, len = this._transforms.length; i < len; i++) {
          transform = typeof this._transforms[i] === "function" ? this._transforms[i]() : this._transforms[i];
          outputStream.once("error", (err2) => {
            transform.emit("error", err2);
          });
          outputStream = outputStream.pipe(transform);
        }
        transform = new LastNewline();
        outputStream.once("error", (err2) => {
          transform.emit("error", err2);
        });
        outputStream = outputStream.pipe(transform);
        for (let i = 0, len = this._processFuncs.length; i < len; i++) {
          transform = this._processFuncs[i];
          outputStream = transform(outputStream);
        }
        if (this.newline) {
          const winbreak = ["win", "windows", "dos", "\r\n"].includes(this.newline.toString().toLowerCase());
          const newlineTransform = winbreak ? new LeWindows() : new LeUnix();
          const stream2 = outputStream.pipe(newlineTransform);
          outputStream.on("error", (err2) => stream2.emit("error", err2));
          return stream2;
        }
        return outputStream;
      }
      /**
       * Appends a transform stream object to the transforms list. Final output
       * is passed through this stream before exposing
       *
       * @param {Object} transform Read-Write stream
       */
      transform(transform) {
        this._transforms.push(transform);
      }
      /**
       * Appends a post process function. The functon is run after transforms and
       * uses the following syntax
       *
       *   processFunc(input) -> outputStream
       *
       * @param {Object} processFunc Read-Write stream
       */
      processFunc(processFunc) {
        this._processFuncs.push(processFunc);
      }
      stream(outputStream, options, done) {
        const transferEncoding = this.getTransferEncoding();
        let contentStream;
        let localStream;
        let returned = false;
        const callback = (err2) => {
          if (returned) {
            return;
          }
          returned = true;
          done(err2);
        };
        const finalize = () => {
          let childId = 0;
          const processChildNode = () => {
            if (childId >= this.childNodes.length) {
              outputStream.write("\r\n--" + this.boundary + "--\r\n");
              return callback();
            }
            const child = this.childNodes[childId++];
            outputStream.write((childId > 1 ? "\r\n" : "") + "--" + this.boundary + "\r\n");
            child.stream(outputStream, options, (err2) => {
              if (err2) {
                return callback(err2);
              }
              setImmediate(processChildNode);
            });
          };
          if (this.multipart) {
            setImmediate(processChildNode);
          } else {
            return callback();
          }
        };
        const sendContent = () => {
          if (this.content) {
            if (Object.prototype.toString.call(this.content) === "[object Error]") {
              return callback(this.content);
            }
            if (typeof this.content.pipe === "function") {
              this.content.removeListener("error", this._contentErrorHandler);
              this._contentErrorHandler = (err2) => callback(err2);
              this.content.once("error", this._contentErrorHandler);
            }
            const createStream = () => {
              if (["quoted-printable", "base64"].includes(transferEncoding)) {
                contentStream = new (transferEncoding === "base64" ? base64 : qp).Encoder(options);
                contentStream.pipe(outputStream, {
                  end: false
                });
                contentStream.once("end", finalize);
                contentStream.once("error", (err2) => callback(err2));
                localStream = this._getStream(this.content);
                localStream.pipe(contentStream);
              } else {
                localStream = this._getStream(this.content);
                localStream.pipe(outputStream, {
                  end: false
                });
                localStream.once("end", finalize);
              }
              localStream.once("error", (err2) => callback(err2));
            };
            if (this.content._resolve) {
              const chunks = [];
              let chunklen = 0;
              let returned2 = false;
              const sourceStream = this._getStream(this.content);
              sourceStream.on("error", (err2) => {
                if (returned2) {
                  return;
                }
                returned2 = true;
                callback(err2);
              });
              sourceStream.on("readable", () => {
                let chunk;
                while ((chunk = sourceStream.read()) !== null) {
                  chunks.push(chunk);
                  chunklen += chunk.length;
                }
              });
              sourceStream.on("end", () => {
                if (returned2) {
                  return;
                }
                returned2 = true;
                this.content._resolve = false;
                this.content._resolvedValue = Buffer.concat(chunks, chunklen);
                setImmediate(createStream);
              });
            } else {
              setImmediate(createStream);
            }
            return;
          }
          return setImmediate(finalize);
        };
        if (this._raw) {
          setImmediate(() => {
            if (Object.prototype.toString.call(this._raw) === "[object Error]") {
              return callback(this._raw);
            }
            if (typeof this._raw.pipe === "function") {
              this._raw.removeListener("error", this._contentErrorHandler);
            }
            const raw = this._getStream(this._raw);
            raw.pipe(outputStream, {
              end: false
            });
            raw.on("error", (err2) => outputStream.emit("error", err2));
            raw.on("end", finalize);
          });
        } else {
          outputStream.write(this.buildHeaders() + "\r\n\r\n");
          setImmediate(sendContent);
        }
      }
      /**
       * Sets envelope to be used instead of the generated one
       *
       * @return {Object} SMTP envelope in the form of {from: 'from@example.com', to: ['to@example.com']}
       */
      setEnvelope(envelope) {
        let list;
        this._envelope = {
          from: false,
          to: []
        };
        if (envelope.from) {
          list = [];
          this._convertAddresses(this._parseAddresses(envelope.from), list);
          list = list.filter((address) => address && address.address);
          if (list.length && list[0]) {
            this._envelope.from = list[0].address;
          }
        }
        ["to", "cc", "bcc"].forEach((key) => {
          if (envelope[key]) {
            this._convertAddresses(this._parseAddresses(envelope[key]), this._envelope.to);
          }
        });
        this._envelope.to = this._envelope.to.map((to) => to.address).filter((address) => address);
        const standardFields = ["to", "cc", "bcc", "from"];
        Object.keys(envelope).forEach((key) => {
          if (!standardFields.includes(key)) {
            this._envelope[key] = envelope[key];
          }
        });
        return this;
      }
      /**
       * Generates and returns an object with parsed address fields
       *
       * @return {Object} Address object
       */
      getAddresses() {
        const addresses = {};
        this._headers.forEach((header) => {
          const key = header.key.toLowerCase();
          if (["from", "sender", "reply-to", "to", "cc", "bcc"].includes(key)) {
            if (!Array.isArray(addresses[key])) {
              addresses[key] = [];
            }
            this._convertAddresses(this._parseAddresses(header.value), addresses[key]);
          }
        });
        return addresses;
      }
      /**
       * Generates and returns SMTP envelope with the sender address and a list of recipients addresses
       *
       * @return {Object} SMTP envelope in the form of {from: 'from@example.com', to: ['to@example.com']}
       */
      getEnvelope() {
        if (this._envelope) {
          return this._envelope;
        }
        const envelope = {
          from: false,
          to: []
        };
        this._headers.forEach((header) => {
          const list = [];
          if (header.key === "From" || !envelope.from && ["Reply-To", "Sender"].includes(header.key)) {
            this._convertAddresses(this._parseAddresses(header.value), list);
            if (list.length && list[0]) {
              envelope.from = list[0].address;
            }
          } else if (["To", "Cc", "Bcc"].includes(header.key)) {
            this._convertAddresses(this._parseAddresses(header.value), envelope.to);
          }
        });
        envelope.to = envelope.to.map((to) => to.address);
        return envelope;
      }
      /**
       * Returns Message-Id value. If it does not exist, then creates one
       *
       * @return {String} Message-Id value
       */
      messageId() {
        let messageId = this.getHeader("Message-ID");
        if (!messageId) {
          messageId = this._generateMessageId();
          this.setHeader("Message-ID", messageId);
        }
        return messageId;
      }
      /**
       * Sets pregenerated content that will be used as the output of this node
       *
       * @param {String|Buffer|Stream} Raw MIME contents
       */
      setRaw(raw) {
        this._raw = raw;
        if (this._raw && typeof this._raw.pipe === "function") {
          this._contentErrorHandler = (err2) => {
            this._raw.removeListener("error", this._contentErrorHandler);
            this._raw = err2;
          };
          this._raw.once("error", this._contentErrorHandler);
        }
        return this;
      }
      /////// PRIVATE METHODS
      /**
       * Detects and returns handle to a stream related with the content.
       *
       * @param {Mixed} content Node content
       * @returns {Object} Stream object
       */
      _getStream(content) {
        let contentStream;
        if (content._resolvedValue) {
          contentStream = new PassThrough();
          setImmediate(() => {
            try {
              contentStream.end(content._resolvedValue);
            } catch (_err) {
              contentStream.emit("error", _err);
            }
          });
          return contentStream;
        }
        if (typeof content.pipe === "function") {
          return content;
        }
        if (content && typeof content.path === "string" && !content.href) {
          if (this.disableFileAccess) {
            contentStream = new PassThrough();
            setImmediate(() => {
              const err2 = new Error("File access rejected for " + content.path);
              err2.code = errors.EFILEACCESS;
              contentStream.emit("error", err2);
            });
            return contentStream;
          }
          return fs.createReadStream(content.path);
        }
        if (content && typeof content.href === "string") {
          if (this.disableUrlAccess) {
            contentStream = new PassThrough();
            setImmediate(() => {
              const err2 = new Error("Url access rejected for " + content.href);
              err2.code = errors.EURLACCESS;
              contentStream.emit("error", err2);
            });
            return contentStream;
          }
          return nmfetch(content.href, { headers: content.httpHeaders, tls: content.tls });
        }
        contentStream = new PassThrough();
        setImmediate(() => {
          try {
            contentStream.end(content || "");
          } catch (_err) {
            contentStream.emit("error", _err);
          }
        });
        return contentStream;
      }
      /**
       * Parses addresses. Takes in a single address or an array or an
       * array of address arrays (eg. To: [[first group], [second group],...])
       *
       * @param {Mixed} addresses Addresses to be parsed
       * @return {Array} An array of address objects
       */
      _parseAddresses(addresses) {
        return [].concat.apply(
          [],
          [].concat(addresses).map((address) => {
            if (address && address.address) {
              address.address = this._normalizeAddress(address.address);
              address.name = address.name || "";
              return [address];
            }
            return addressparser(address);
          })
        );
      }
      /**
       * Normalizes a header key, uses Camel-Case form, except for uppercase MIME-
       *
       * @param {String} key Key to be normalized
       * @return {String} key in Camel-Case form
       */
      _normalizeHeaderKey(key) {
        key = (key || "").toString().replace(/\r?\n|\r/g, " ").trim().toLowerCase().replace(/^X-SMTPAPI$|^(MIME|DKIM|ARC|BIMI)\b|^[a-z]|-(SPF|FBL|ID|MD5)$|-[a-z]/gi, (c) => c.toUpperCase()).replace(/^Content-Features$/i, "Content-features");
        return key;
      }
      /**
       * Checks if the content type is multipart and defines boundary if needed.
       * Doesn't return anything, modifies object argument instead.
       *
       * @param {Object} structured Parsed header value for 'Content-Type' key
       */
      _handleContentType(structured) {
        this.contentType = structured.value.trim().toLowerCase();
        this.multipart = /^multipart\//i.test(this.contentType) ? this.contentType.substr(this.contentType.indexOf("/") + 1) : false;
        if (this.multipart) {
          this.boundary = structured.params.boundary = structured.params.boundary || this.boundary || this._generateBoundary();
        } else {
          this.boundary = false;
        }
      }
      /**
       * Generates a multipart boundary value
       *
       * @return {String} boundary value
       */
      _generateBoundary() {
        return this.rootNode.boundaryPrefix + "-" + this.rootNode.baseBoundary + "-Part_" + this._nodeId;
      }
      /**
       * Encodes a header value for use in the generated rfc2822 email.
       *
       * @param {String} key Header key
       * @param {String} value Header value
       */
      _encodeHeaderValue(key, value) {
        key = this._normalizeHeaderKey(key);
        switch (key) {
          // Structured headers
          case "From":
          case "Sender":
          case "To":
          case "Cc":
          case "Bcc":
          case "Reply-To":
            return this._convertAddresses(this._parseAddresses(value));
          // values enclosed in <>
          case "Message-ID":
          case "In-Reply-To":
          case "Content-Id":
            value = (value || "").toString().replace(/\r?\n|\r/g, " ");
            if (value.charAt(0) !== "<") {
              value = "<" + value;
            }
            if (value.charAt(value.length - 1) !== ">") {
              value = value + ">";
            }
            return value;
          // space separated list of values enclosed in <>
          case "References":
            value = [].concat.apply(
              [],
              [].concat(value || "").map((elm) => {
                elm = (elm || "").toString().replace(/\r?\n|\r/g, " ").trim();
                return elm.replace(/<[^>]*>/g, (str) => str.replace(/\s/g, "")).split(/\s+/);
              })
            ).map((elm) => {
              if (elm.charAt(0) !== "<") {
                elm = "<" + elm;
              }
              if (elm.charAt(elm.length - 1) !== ">") {
                elm = elm + ">";
              }
              return elm;
            });
            return value.join(" ").trim();
          case "Date":
            if (Object.prototype.toString.call(value) === "[object Date]") {
              return value.toUTCString().replace(/GMT/, "+0000");
            }
            value = (value || "").toString().replace(/\r?\n|\r/g, " ");
            return this._encodeWords(value);
          case "Content-Type":
          case "Content-Disposition":
            return (value || "").toString().replace(/\r?\n|\r/g, " ");
          default:
            value = (value || "").toString().replace(/\r?\n|\r/g, " ");
            return this._encodeWords(value);
        }
      }
      /**
       * Rebuilds address object using punycode and other adjustments
       *
       * @param {Array} addresses An array of address objects
       * @param {Array} [uniqueList] An array to be populated with addresses
       * @return {String} address string
       */
      _convertAddresses(addresses, uniqueList) {
        const values = [];
        uniqueList = uniqueList || [];
        [].concat(addresses || []).forEach((address) => {
          if (address.address) {
            address.address = this._normalizeAddress(address.address);
            if (!address.name) {
              values.push(address.address.indexOf(" ") >= 0 ? `<${address.address}>` : `${address.address}`);
            } else {
              values.push(`${this._encodeAddressName(address.name)} <${address.address}>`);
            }
            if (!uniqueList.some((a) => a.address === address.address)) {
              uniqueList.push(address);
            }
          } else if (address.group) {
            const groupListAddresses = (address.group.length ? this._convertAddresses(address.group, uniqueList) : "").trim();
            values.push(`${this._encodeAddressName(address.name)}:${groupListAddresses};`);
          }
        });
        return values.join(", ");
      }
      /**
       * Normalizes an email address
       *
       * @param {Array} address An array of address objects
       * @return {String} address string
       */
      _normalizeAddress(address) {
        address = (address || "").toString().replace(/[\x00-\x1F<>]+/g, " ").trim();
        const lastAt = address.lastIndexOf("@");
        if (lastAt < 0) {
          return address;
        }
        let user = address.substr(0, lastAt);
        const domain = address.substr(lastAt + 1);
        let encodedDomain = domain;
        try {
          if (/[\x80-\uFFFF]/.test(user)) {
            encodedDomain = punycode.toUnicode(domain.toLowerCase());
          } else {
            encodedDomain = punycode.toASCII(domain.toLowerCase());
          }
        } catch (_err) {
        }
        if (user.indexOf(" ") >= 0) {
          if (user.charAt(0) !== '"') {
            user = '"' + user;
          }
          if (user.substr(-1) !== '"') {
            user = user + '"';
          }
        }
        return `${user}@${encodedDomain}`;
      }
      /**
       * If needed, mime encodes the name part
       *
       * @param {String} name Name part of an address
       * @returns {String} Mime word encoded string if needed
       */
      _encodeAddressName(name) {
        if (!/^[\w ]*$/.test(name)) {
          if (/^[\x20-\x7e]*$/.test(name)) {
            return '"' + name.replace(/([\\"])/g, "\\$1") + '"';
          } else {
            return mimeFuncs.encodeWord(name, this._getTextEncoding(name), 52);
          }
        }
        return name;
      }
      /**
       * If needed, mime encodes the name part
       *
       * @param {String} name Name part of an address
       * @returns {String} Mime word encoded string if needed
       */
      _encodeWords(value) {
        return mimeFuncs.encodeWords(value, this._getTextEncoding(value), 52, true);
      }
      /**
       * Detects best mime encoding for a text value
       *
       * @param {String} value Value to check for
       * @return {String} either 'Q' or 'B'
       */
      _getTextEncoding(value) {
        value = (value || "").toString();
        if (this.textEncoding) {
          return this.textEncoding;
        }
        let nonLatinLen = 0;
        let latinLen = 0;
        for (let i = 0, len = value.length; i < len; i++) {
          const code = value.charCodeAt(i);
          if (code >= 0 && code <= 8 || code === 11 || code === 12 || code >= 14 && code <= 31 || code >= 128) {
            nonLatinLen++;
          } else if (code >= 65 && code <= 90 || code >= 97 && code <= 122) {
            latinLen++;
          }
        }
        return nonLatinLen < latinLen ? "Q" : "B";
      }
      /**
       * Generates a message id
       *
       * @return {String} Random Message-ID value
       */
      _generateMessageId() {
        return "<" + [2, 2, 2, 6].reduce(
          // crux to generate UUID-like random strings
          (prev, len) => prev + "-" + crypto.randomBytes(len).toString("hex"),
          crypto.randomBytes(4).toString("hex")
        ) + "@" + // try to use the domain of the FROM address or fallback to server hostname
        (this.getEnvelope().from || this.hostname || "localhost").split("@").pop() + ">";
      }
    };
    module.exports = MimeNode;
  }
});

// node_modules/nodemailer/lib/mail-composer/index.js
var require_mail_composer = __commonJS({
  "node_modules/nodemailer/lib/mail-composer/index.js"(exports, module) {
    "use strict";
    var MimeNode = require_mime_node();
    var mimeFuncs = require_mime_funcs();
    var { parseDataURI } = require_shared();
    var MailComposer = class {
      constructor(mail) {
        this.mail = mail || {};
        this.message = false;
      }
      /**
       * Builds MimeNode instance
       */
      compile() {
        this._alternatives = this.getAlternatives();
        this._htmlNode = this._alternatives.filter((alternative) => /^text\/html\b/i.test(alternative.contentType)).pop();
        this._attachments = this.getAttachments(!!this._htmlNode);
        this._useRelated = !!(this._htmlNode && this._attachments.related.length);
        this._useAlternative = this._alternatives.length > 1;
        this._useMixed = this._attachments.attached.length > 1 || this._alternatives.length && this._attachments.attached.length === 1;
        if (this.mail.raw) {
          this.message = new MimeNode("message/rfc822", {
            newline: this.mail.newline,
            disableUrlAccess: this.mail.disableUrlAccess,
            disableFileAccess: this.mail.disableFileAccess
          }).setRaw(this.mail.raw);
        } else if (this._useMixed) {
          this.message = this._createMixed();
        } else if (this._useAlternative) {
          this.message = this._createAlternative();
        } else if (this._useRelated) {
          this.message = this._createRelated();
        } else {
          this.message = this._createContentNode(
            false,
            [].concat(this._alternatives || []).concat(this._attachments.attached || []).shift() || {
              contentType: "text/plain",
              content: ""
            }
          );
        }
        if (this.mail.headers) {
          this.message.addHeader(this.mail.headers);
        }
        ["from", "sender", "to", "cc", "bcc", "reply-to", "in-reply-to", "references", "subject", "message-id", "date"].forEach((header) => {
          const key = header.replace(/-(\w)/g, (o, c) => c.toUpperCase());
          if (this.mail[key]) {
            this.message.setHeader(header, this.mail[key]);
          }
        });
        if (this.mail.envelope) {
          this.message.setEnvelope(this.mail.envelope);
        }
        this.message.messageId();
        return this.message;
      }
      /**
       * List all attachments. Resulting attachment objects can be used as input for MimeNode nodes
       *
       * @param {Boolean} findRelated If true separate related attachments from attached ones
       * @returns {Object} An object of arrays (`related` and `attached`)
       */
      getAttachments(findRelated) {
        let eventObject;
        const attachments = [].concat(this.mail.attachments || []).map((attachment, i) => {
          if (/^data:/i.test(attachment.path || attachment.href)) {
            attachment = this._processDataUrl(attachment);
          }
          const contentType = attachment.contentType || mimeFuncs.detectMimeType(attachment.filename || attachment.path || attachment.href || "bin");
          const isImage = /^image\//i.test(contentType);
          const isMessageNode = /^message\//i.test(contentType);
          const contentDisposition = attachment.contentDisposition || (isMessageNode || isImage && attachment.cid ? "inline" : "attachment");
          let contentTransferEncoding;
          if ("contentTransferEncoding" in attachment) {
            contentTransferEncoding = attachment.contentTransferEncoding;
          } else if (isMessageNode) {
            contentTransferEncoding = "8bit";
          } else {
            contentTransferEncoding = "base64";
          }
          const data = {
            contentType,
            contentDisposition,
            contentTransferEncoding
          };
          if (attachment.filename) {
            data.filename = attachment.filename;
          } else if (!isMessageNode && attachment.filename !== false) {
            data.filename = (attachment.path || attachment.href || "").split("/").pop().split("?").shift() || "attachment-" + (i + 1);
            if (data.filename.indexOf(".") < 0) {
              data.filename += "." + mimeFuncs.detectExtension(data.contentType);
            }
          }
          if (/^https?:\/\//i.test(attachment.path)) {
            attachment.href = attachment.path;
            attachment.path = void 0;
          }
          if (attachment.cid) {
            data.cid = attachment.cid;
          }
          if (attachment.raw) {
            data.raw = attachment.raw;
          } else if (attachment.path) {
            data.content = {
              path: attachment.path
            };
          } else if (attachment.href) {
            data.content = {
              href: attachment.href,
              httpHeaders: attachment.httpHeaders,
              tls: attachment.tls
            };
          } else {
            data.content = attachment.content || "";
          }
          if (attachment.encoding) {
            data.encoding = attachment.encoding;
          }
          if (attachment.headers) {
            data.headers = attachment.headers;
          }
          return data;
        });
        if (this.mail.icalEvent) {
          eventObject = Object.assign({}, this._getIcalEvent());
          eventObject.contentType = "application/ics";
          if (!eventObject.headers) {
            eventObject.headers = {};
          }
          eventObject.filename = eventObject.filename || "invite.ics";
          eventObject.headers["Content-Disposition"] = "attachment";
          eventObject.headers["Content-Transfer-Encoding"] = "base64";
        }
        if (!findRelated) {
          return {
            attached: attachments.concat(eventObject || []),
            related: []
          };
        }
        return {
          attached: attachments.filter((attachment) => !attachment.cid).concat(eventObject || []),
          related: attachments.filter((attachment) => !!attachment.cid)
        };
      }
      /**
       * Returns the icalEvent value with `path`/`href`/data uri input normalized into
       * a `content` entry, the same way as for regular attachments. The same event is
       * included twice (as a text/calendar alternative and as an application/ics
       * attachment), so the shared content object is marked to be resolved just once
       * and the buffered result is reused by the second node.
       *
       * @returns {Object} Normalized icalEvent data
       */
      _getIcalEvent() {
        if (!this._icalEvent) {
          let icalEvent;
          if (typeof this.mail.icalEvent === "object" && (this.mail.icalEvent.content || this.mail.icalEvent.path || this.mail.icalEvent.href || this.mail.icalEvent.raw)) {
            icalEvent = Object.assign({}, this.mail.icalEvent);
          } else {
            icalEvent = {
              content: this.mail.icalEvent
            };
          }
          if (/^data:/i.test(icalEvent.path || icalEvent.href)) {
            icalEvent = this._processDataUrl(icalEvent);
          }
          if (/^https?:\/\//i.test(icalEvent.path)) {
            icalEvent.href = icalEvent.path;
            icalEvent.path = void 0;
          }
          if (!icalEvent.raw) {
            if (icalEvent.path) {
              icalEvent.content = {
                path: icalEvent.path
              };
              icalEvent.path = void 0;
            } else if (icalEvent.href) {
              icalEvent.content = {
                href: icalEvent.href,
                httpHeaders: icalEvent.httpHeaders
              };
              icalEvent.href = void 0;
            }
          }
          if (icalEvent.content && typeof icalEvent.content === "object") {
            icalEvent.content._resolve = true;
          }
          this._icalEvent = icalEvent;
        }
        return this._icalEvent;
      }
      /**
       * List alternatives. Resulting objects can be used as input for MimeNode nodes
       *
       * @returns {Array} An array of alternative elements. Includes the `text` and `html` values as well
       */
      getAlternatives() {
        const alternatives = [];
        let text, html, watchHtml, amp, eventObject;
        if (this.mail.text) {
          if (typeof this.mail.text === "object" && (this.mail.text.content || this.mail.text.path || this.mail.text.href || this.mail.text.raw)) {
            text = this.mail.text;
          } else {
            text = {
              content: this.mail.text
            };
          }
          text.contentType = "text/plain; charset=utf-8";
        }
        if (this.mail.watchHtml) {
          if (typeof this.mail.watchHtml === "object" && (this.mail.watchHtml.content || this.mail.watchHtml.path || this.mail.watchHtml.href || this.mail.watchHtml.raw)) {
            watchHtml = this.mail.watchHtml;
          } else {
            watchHtml = {
              content: this.mail.watchHtml
            };
          }
          watchHtml.contentType = "text/watch-html; charset=utf-8";
        }
        if (this.mail.amp) {
          if (typeof this.mail.amp === "object" && (this.mail.amp.content || this.mail.amp.path || this.mail.amp.href || this.mail.amp.raw)) {
            amp = this.mail.amp;
          } else {
            amp = {
              content: this.mail.amp
            };
          }
          amp.contentType = "text/x-amp-html; charset=utf-8";
        }
        if (this.mail.icalEvent) {
          eventObject = Object.assign({}, this._getIcalEvent());
          eventObject.filename = false;
          eventObject.contentType = "text/calendar; charset=utf-8; method=" + (eventObject.method || "PUBLISH").toString().trim().toUpperCase();
          if (!eventObject.headers) {
            eventObject.headers = {};
          }
        }
        if (this.mail.html) {
          if (typeof this.mail.html === "object" && (this.mail.html.content || this.mail.html.path || this.mail.html.href || this.mail.html.raw)) {
            html = this.mail.html;
          } else {
            html = {
              content: this.mail.html
            };
          }
          html.contentType = "text/html; charset=utf-8";
        }
        [].concat(text || []).concat(watchHtml || []).concat(amp || []).concat(html || []).concat(eventObject || []).concat(this.mail.alternatives || []).forEach((alternative) => {
          if (/^data:/i.test(alternative.path || alternative.href)) {
            alternative = this._processDataUrl(alternative);
          }
          const data = {
            contentType: alternative.contentType || mimeFuncs.detectMimeType(alternative.filename || alternative.path || alternative.href || "txt"),
            contentTransferEncoding: alternative.contentTransferEncoding
          };
          if (alternative.filename) {
            data.filename = alternative.filename;
          }
          if (/^https?:\/\//i.test(alternative.path)) {
            alternative.href = alternative.path;
            alternative.path = void 0;
          }
          if (alternative.raw) {
            data.raw = alternative.raw;
          } else if (alternative.path) {
            data.content = {
              path: alternative.path
            };
          } else if (alternative.href) {
            data.content = {
              href: alternative.href
            };
          } else {
            data.content = alternative.content || "";
          }
          if (alternative.encoding) {
            data.encoding = alternative.encoding;
          }
          if (alternative.headers) {
            data.headers = alternative.headers;
          }
          alternatives.push(data);
        });
        return alternatives;
      }
      /**
       * Builds multipart/mixed node. It should always contain different type of elements on the same level
       * eg. text + attachments
       *
       * @param {Object} parentNode Parent for this note. If it does not exist, a root node is created
       * @returns {Object} MimeNode node element
       */
      _createMixed(parentNode) {
        const node = parentNode ? parentNode.createChild("multipart/mixed", {
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        }) : new MimeNode("multipart/mixed", {
          baseBoundary: this.mail.baseBoundary,
          textEncoding: this.mail.textEncoding,
          boundaryPrefix: this.mail.boundaryPrefix,
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        });
        if (this._useAlternative) {
          this._createAlternative(node);
        } else if (this._useRelated) {
          this._createRelated(node);
        }
        [].concat(!this._useAlternative && this._alternatives || []).concat(this._attachments.attached || []).forEach((element) => {
          if (!this._useRelated || element !== this._htmlNode) {
            this._createContentNode(node, element);
          }
        });
        return node;
      }
      /**
       * Builds multipart/alternative node. It should always contain same type of elements on the same level
       * eg. text + html view of the same data
       *
       * @param {Object} parentNode Parent for this note. If it does not exist, a root node is created
       * @returns {Object} MimeNode node element
       */
      _createAlternative(parentNode) {
        const node = parentNode ? parentNode.createChild("multipart/alternative", {
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        }) : new MimeNode("multipart/alternative", {
          baseBoundary: this.mail.baseBoundary,
          textEncoding: this.mail.textEncoding,
          boundaryPrefix: this.mail.boundaryPrefix,
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        });
        this._alternatives.forEach((alternative) => {
          if (this._useRelated && this._htmlNode === alternative) {
            this._createRelated(node);
          } else {
            this._createContentNode(node, alternative);
          }
        });
        return node;
      }
      /**
       * Builds multipart/related node. It should always contain html node with related attachments
       *
       * @param {Object} parentNode Parent for this note. If it does not exist, a root node is created
       * @returns {Object} MimeNode node element
       */
      _createRelated(parentNode) {
        const node = parentNode ? parentNode.createChild('multipart/related; type="text/html"', {
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        }) : new MimeNode('multipart/related; type="text/html"', {
          baseBoundary: this.mail.baseBoundary,
          textEncoding: this.mail.textEncoding,
          boundaryPrefix: this.mail.boundaryPrefix,
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        });
        this._createContentNode(node, this._htmlNode);
        this._attachments.related.forEach((alternative) => this._createContentNode(node, alternative));
        return node;
      }
      /**
       * Creates a regular node with contents
       *
       * @param {Object} parentNode Parent for this note. If it does not exist, a root node is created
       * @param {Object} element Node data
       * @returns {Object} MimeNode node element
       */
      _createContentNode(parentNode, element) {
        element = element || {};
        element.content = element.content || "";
        const encoding = (element.encoding || "utf8").toString().toLowerCase().replace(/[-_\s]/g, "");
        const node = parentNode ? parentNode.createChild(element.contentType, {
          filename: element.filename,
          textEncoding: this.mail.textEncoding,
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        }) : new MimeNode(element.contentType, {
          filename: element.filename,
          baseBoundary: this.mail.baseBoundary,
          textEncoding: this.mail.textEncoding,
          boundaryPrefix: this.mail.boundaryPrefix,
          disableUrlAccess: this.mail.disableUrlAccess,
          disableFileAccess: this.mail.disableFileAccess,
          normalizeHeaderKey: this.mail.normalizeHeaderKey,
          newline: this.mail.newline
        });
        if (element.headers) {
          node.addHeader(element.headers);
        }
        if (element.cid) {
          node.setHeader("Content-Id", "<" + element.cid.replace(/[<>]/g, "") + ">");
        }
        if (element.contentTransferEncoding) {
          node.setHeader("Content-Transfer-Encoding", element.contentTransferEncoding);
        } else if (this.mail.encoding && /^text\//i.test(element.contentType)) {
          node.setHeader("Content-Transfer-Encoding", this.mail.encoding);
        }
        if (!/^text\//i.test(element.contentType) || element.contentDisposition) {
          node.setHeader(
            "Content-Disposition",
            element.contentDisposition || (element.cid && /^image\//i.test(element.contentType) ? "inline" : "attachment")
          );
        }
        if (typeof element.content === "string" && !["utf8", "usascii", "ascii"].includes(encoding)) {
          element.content = Buffer.from(element.content, encoding);
        }
        if (element.raw) {
          node.setRaw(element.raw);
        } else {
          node.setContent(element.content);
        }
        return node;
      }
      /**
       * Parses data uri and converts it to a Buffer
       *
       * @param {Object} element Content element
       * @return {Object} Parsed element
       */
      _processDataUrl(element) {
        const dataUrl = element.path || element.href;
        if (!dataUrl || typeof dataUrl !== "string") {
          return element;
        }
        if (!dataUrl.startsWith("data:")) {
          return element;
        }
        if (dataUrl.length > 52428800) {
          let detectedType = "application/octet-stream";
          const commaPos = dataUrl.indexOf(",");
          if (commaPos > 0 && commaPos < 200) {
            const header = dataUrl.substring(5, commaPos);
            const parts = header.split(";");
            if (parts[0] && parts[0].includes("/")) {
              detectedType = parts[0].trim();
            }
          }
          return Object.assign({}, element, {
            path: false,
            href: false,
            content: Buffer.alloc(0),
            contentType: element.contentType || detectedType
          });
        }
        let parsedDataUri;
        try {
          parsedDataUri = parseDataURI(dataUrl);
        } catch (_err) {
          return element;
        }
        if (!parsedDataUri) {
          return element;
        }
        element.content = parsedDataUri.data;
        element.contentType = element.contentType || parsedDataUri.contentType;
        if ("path" in element) {
          element.path = false;
        }
        if ("href" in element) {
          element.href = false;
        }
        return element;
      }
    };
    module.exports = MailComposer;
  }
});

// node_modules/nodemailer/lib/dkim/message-parser.js
var require_message_parser = __commonJS({
  "node_modules/nodemailer/lib/dkim/message-parser.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var MessageParser = class extends Transform {
      constructor(options) {
        super(options);
        this.lastBytes = Buffer.alloc(4);
        this.headersParsed = false;
        this.headerBytes = 0;
        this.headerChunks = [];
        this.rawHeaders = false;
        this.bodySize = 0;
      }
      /**
       * Keeps count of the last 4 bytes in order to detect line breaks on chunk boundaries
       *
       * @param {Buffer} data Next data chunk from the stream
       */
      updateLastBytes(data) {
        const lblen = this.lastBytes.length;
        const nblen = Math.min(data.length, lblen);
        for (let i = 0, len = lblen - nblen; i < len; i++) {
          this.lastBytes[i] = this.lastBytes[i + nblen];
        }
        for (let i = 1; i <= nblen; i++) {
          this.lastBytes[lblen - i] = data[data.length - i];
        }
      }
      /**
       * Finds and removes message headers from the remaining body. We want to keep
       * headers separated until final delivery to be able to modify these
       *
       * @param {Buffer} data Next chunk of data
       * @return {Boolean} Returns true if headers are already found or false otherwise
       */
      checkHeaders(data) {
        if (this.headersParsed) {
          return true;
        }
        const lblen = this.lastBytes.length;
        let headerPos = 0;
        for (let i = 0, len = this.lastBytes.length + data.length; i < len; i++) {
          let chr;
          if (i < lblen) {
            chr = this.lastBytes[i];
          } else {
            chr = data[i - lblen];
          }
          if (chr === 10 && i) {
            const pr1 = i - 1 < lblen ? this.lastBytes[i - 1] : data[i - 1 - lblen];
            const pr2 = i > 1 ? i - 2 < lblen ? this.lastBytes[i - 2] : data[i - 2 - lblen] : false;
            if (pr1 === 10) {
              this.headersParsed = true;
              headerPos = i - lblen + 1;
              this.headerBytes += headerPos;
              break;
            } else if (pr1 === 13 && pr2 === 10) {
              this.headersParsed = true;
              headerPos = i - lblen + 1;
              this.headerBytes += headerPos;
              break;
            }
          }
        }
        if (this.headersParsed) {
          this.headerChunks.push(data.slice(0, headerPos));
          this.rawHeaders = Buffer.concat(this.headerChunks, this.headerBytes);
          this.headerChunks = null;
          this.emit("headers", this.parseHeaders());
          if (data.length - 1 > headerPos) {
            const chunk = data.slice(headerPos);
            this.bodySize += chunk.length;
            setImmediate(() => this.push(chunk));
          }
          return false;
        }
        this.headerBytes += data.length;
        this.headerChunks.push(data);
        this.updateLastBytes(data);
        return false;
      }
      _transform(chunk, encoding, callback) {
        if (!chunk || !chunk.length) {
          return callback();
        }
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk, encoding);
        }
        let headersFound;
        try {
          headersFound = this.checkHeaders(chunk);
        } catch (E) {
          return callback(E);
        }
        if (headersFound) {
          this.bodySize += chunk.length;
          this.push(chunk);
        }
        setImmediate(callback);
      }
      _flush(callback) {
        if (this.headerChunks) {
          const chunk = Buffer.concat(this.headerChunks, this.headerBytes);
          this.bodySize += chunk.length;
          this.push(chunk);
          this.headerChunks = null;
        }
        callback();
      }
      parseHeaders() {
        const lines = (this.rawHeaders || "").toString().split(/\r?\n/);
        for (let i = lines.length - 1; i > 0; i--) {
          if (/^\s/.test(lines[i])) {
            lines[i - 1] += "\n" + lines[i];
            lines.splice(i, 1);
          }
        }
        return lines.filter((line) => line.trim()).map((line) => ({
          key: line.substr(0, line.indexOf(":")).trim().toLowerCase(),
          line
        }));
      }
    };
    module.exports = MessageParser;
  }
});

// node_modules/nodemailer/lib/dkim/relaxed-body.js
var require_relaxed_body = __commonJS({
  "node_modules/nodemailer/lib/dkim/relaxed-body.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var crypto = __require("crypto");
    var RelaxedBody = class extends Transform {
      constructor(options) {
        super();
        options = options || {};
        this.chunkBuffer = [];
        this.chunkBufferLen = 0;
        this.bodyHash = crypto.createHash(options.hashAlgo || "sha256");
        this.remainder = "";
        this.byteLength = 0;
        this.debug = options.debug;
        this._debugBody = options.debug ? [] : false;
      }
      updateHash(chunk) {
        let bodyStr;
        let nextRemainder = "";
        let state = "file";
        for (let i = chunk.length - 1; i >= 0; i--) {
          const c = chunk[i];
          if (state === "file" && (c === 10 || c === 13)) {
          } else if (state === "file" && (c === 9 || c === 32)) {
            state = "line";
          } else if (state === "line" && (c === 9 || c === 32)) {
          } else if (state === "file" || state === "line") {
            state = "body";
            if (i === chunk.length - 1) {
              break;
            }
          }
          if (i === 0) {
            if (state === "file" && (!this.remainder || /[\r\n]$/.test(this.remainder)) || state === "line" && (!this.remainder || /[ \t]$/.test(this.remainder))) {
              this.remainder += chunk.toString("binary");
              return;
            } else if (state === "line" || state === "file") {
              nextRemainder = chunk.toString("binary");
              chunk = false;
              break;
            }
          }
          if (state !== "body") {
            continue;
          }
          nextRemainder = chunk.slice(i + 1).toString("binary");
          chunk = chunk.slice(0, i + 1);
          break;
        }
        let needsFixing = !!this.remainder;
        if (chunk && !needsFixing) {
          for (let i = 0, len = chunk.length; i < len; i++) {
            if (i && chunk[i] === 10 && chunk[i - 1] !== 13) {
              needsFixing = true;
              break;
            } else if (i && chunk[i] === 13 && chunk[i - 1] === 32) {
              needsFixing = true;
              break;
            } else if (i && chunk[i] === 32 && chunk[i - 1] === 32) {
              needsFixing = true;
              break;
            } else if (chunk[i] === 9) {
              needsFixing = true;
              break;
            }
          }
        }
        if (needsFixing) {
          bodyStr = this.remainder + (chunk ? chunk.toString("binary") : "");
          this.remainder = nextRemainder;
          bodyStr = bodyStr.replace(/\r?\n/g, "\n").replace(/[ \t]*$/gm, "").replace(/[ \t]+/gm, " ").replace(/\n/g, "\r\n");
          chunk = Buffer.from(bodyStr, "binary");
        } else if (nextRemainder) {
          this.remainder = nextRemainder;
        }
        if (this.debug) {
          this._debugBody.push(chunk);
        }
        this.bodyHash.update(chunk);
      }
      _transform(chunk, encoding, callback) {
        if (!chunk || !chunk.length) {
          return callback();
        }
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk, encoding);
        }
        this.updateHash(chunk);
        this.byteLength += chunk.length;
        this.push(chunk);
        callback();
      }
      _flush(callback) {
        if (/[\r\n]$/.test(this.remainder) && this.byteLength > 2) {
          this.bodyHash.update(Buffer.from("\r\n"));
        }
        if (!this.byteLength) {
          this.push(Buffer.from("\r\n"));
        }
        this.emit("hash", this.bodyHash.digest("base64"), this.debug ? Buffer.concat(this._debugBody) : false);
        callback();
      }
    };
    module.exports = RelaxedBody;
  }
});

// node_modules/nodemailer/lib/dkim/sign.js
var require_sign = __commonJS({
  "node_modules/nodemailer/lib/dkim/sign.js"(exports, module) {
    "use strict";
    var punycode = require_punycode();
    var mimeFuncs = require_mime_funcs();
    var crypto = __require("crypto");
    module.exports = (headers, hashAlgo, bodyHash, options) => {
      options = options || {};
      const defaultFieldNames = "From:Sender:Reply-To:Subject:Date:Message-ID:To:Cc:MIME-Version:Content-Type:Content-Transfer-Encoding:Content-ID:Content-Description:Resent-Date:Resent-From:Resent-Sender:Resent-To:Resent-Cc:Resent-Message-ID:In-Reply-To:References:List-Id:List-Help:List-Unsubscribe:List-Subscribe:List-Post:List-Owner:List-Archive";
      const fieldNames = options.headerFieldNames || defaultFieldNames;
      const canonicalizedHeaderData = relaxedHeaders(headers, fieldNames, options.skipFields);
      const dkimHeader = generateDKIMHeader(options.domainName, options.keySelector, canonicalizedHeaderData.fieldNames, hashAlgo, bodyHash);
      canonicalizedHeaderData.headers += "dkim-signature:" + relaxedHeaderLine(dkimHeader);
      const signer = crypto.createSign(("rsa-" + hashAlgo).toUpperCase());
      signer.update(canonicalizedHeaderData.headers);
      let signature;
      try {
        signature = signer.sign(options.privateKey, "base64");
      } catch (_E) {
        return false;
      }
      return dkimHeader + signature.replace(/(^.{73}|.{75}(?!\r?\n|\r))/g, "$&\r\n ").trim();
    };
    module.exports.relaxedHeaders = relaxedHeaders;
    function generateDKIMHeader(domainName, keySelector, fieldNames, hashAlgo, bodyHash) {
      const dkim = [
        "v=1",
        "a=rsa-" + hashAlgo,
        "c=relaxed/relaxed",
        "d=" + punycode.toASCII(domainName),
        "q=dns/txt",
        "s=" + keySelector,
        "bh=" + bodyHash,
        "h=" + fieldNames
      ].join("; ");
      return mimeFuncs.foldLines("DKIM-Signature: " + dkim, 76) + ";\r\n b=";
    }
    function relaxedHeaders(headers, fieldNames, skipFields) {
      const includedFields = /* @__PURE__ */ new Set();
      const skip = /* @__PURE__ */ new Set();
      const headerFields = /* @__PURE__ */ new Map();
      (skipFields || "").toLowerCase().split(":").forEach((field) => {
        skip.add(field.trim());
      });
      (fieldNames || "").toLowerCase().split(":").filter((field) => !skip.has(field.trim())).forEach((field) => {
        includedFields.add(field.trim());
      });
      for (let i = headers.length - 1; i >= 0; i--) {
        const line = headers[i];
        if (includedFields.has(line.key) && !headerFields.has(line.key)) {
          headerFields.set(line.key, relaxedHeaderLine(line.line));
        }
      }
      const headersList = [];
      const fields = [];
      includedFields.forEach((field) => {
        if (headerFields.has(field)) {
          fields.push(field);
          headersList.push(field + ":" + headerFields.get(field));
        }
      });
      return {
        headers: headersList.join("\r\n") + "\r\n",
        fieldNames: fields.join(":")
      };
    }
    function relaxedHeaderLine(line) {
      return line.substr(line.indexOf(":") + 1).replace(/\r?\n/g, "").replace(/\s+/g, " ").trim();
    }
  }
});

// node_modules/nodemailer/lib/dkim/index.js
var require_dkim = __commonJS({
  "node_modules/nodemailer/lib/dkim/index.js"(exports, module) {
    "use strict";
    var MessageParser = require_message_parser();
    var RelaxedBody = require_relaxed_body();
    var sign = require_sign();
    var { PassThrough } = __require("stream");
    var fs = __require("fs");
    var path = __require("path");
    var crypto = __require("crypto");
    var DKIM_ALGO = "sha256";
    var MAX_MESSAGE_SIZE = 2 * 1024 * 1024;
    var DKIMSigner = class {
      constructor(options, keys, input, output) {
        this.options = options || {};
        this.keys = keys;
        this.cacheTreshold = Number(this.options.cacheTreshold) || MAX_MESSAGE_SIZE;
        this.hashAlgo = this.options.hashAlgo || DKIM_ALGO;
        this.cacheDir = this.options.cacheDir || false;
        this.chunks = [];
        this.chunklen = 0;
        this.readPos = 0;
        this.cachePath = this.cacheDir ? path.join(this.cacheDir, "message." + Date.now() + "-" + crypto.randomBytes(14).toString("hex")) : false;
        this.cache = false;
        this.headers = false;
        this.bodyHash = false;
        this.parser = false;
        this.relaxedBody = false;
        this.input = input;
        this.output = output;
        this.output.usingCache = false;
        this.hasErrored = false;
        this.input.on("error", (err2) => {
          this.hasErrored = true;
          this.cleanup();
          output.emit("error", err2);
        });
      }
      cleanup() {
        if (!this.cache || !this.cachePath) {
          return;
        }
        fs.unlink(this.cachePath, () => false);
      }
      createReadCache() {
        this.cache = fs.createReadStream(this.cachePath);
        this.cache.once("error", (err2) => {
          this.cleanup();
          this.output.emit("error", err2);
        });
        this.cache.once("close", () => {
          this.cleanup();
        });
        this.cache.pipe(this.output);
      }
      sendNextChunk() {
        if (this.hasErrored) {
          return;
        }
        if (this.readPos >= this.chunks.length) {
          if (!this.cache) {
            return this.output.end();
          }
          return this.createReadCache();
        }
        const chunk = this.chunks[this.readPos++];
        if (this.output.write(chunk) === false) {
          return this.output.once("drain", () => {
            this.sendNextChunk();
          });
        }
        setImmediate(() => this.sendNextChunk());
      }
      sendSignedOutput() {
        let keyPos = 0;
        const signNextKey = () => {
          if (keyPos >= this.keys.length) {
            this.output.write(this.parser.rawHeaders);
            return setImmediate(() => this.sendNextChunk());
          }
          const key = this.keys[keyPos++];
          const dkimField = sign(this.headers, this.hashAlgo, this.bodyHash, {
            domainName: key.domainName,
            keySelector: key.keySelector,
            privateKey: key.privateKey,
            headerFieldNames: this.options.headerFieldNames,
            skipFields: this.options.skipFields
          });
          if (dkimField) {
            this.output.write(Buffer.from(dkimField + "\r\n"));
          }
          return setImmediate(signNextKey);
        };
        if (this.bodyHash && this.headers) {
          return signNextKey();
        }
        this.output.write(this.parser.rawHeaders);
        this.sendNextChunk();
      }
      createWriteCache() {
        this.output.usingCache = true;
        this.cache = fs.createWriteStream(this.cachePath);
        this.cache.once("error", (err2) => {
          this.cleanup();
          this.relaxedBody.unpipe(this.cache);
          this.relaxedBody.on("readable", () => {
            while (this.relaxedBody.read() !== null) {
            }
          });
          this.hasErrored = true;
          this.output.emit("error", err2);
        });
        this.cache.once("close", () => {
          this.sendSignedOutput();
        });
        this.relaxedBody.removeAllListeners("readable");
        this.relaxedBody.pipe(this.cache);
      }
      signStream() {
        this.parser = new MessageParser();
        this.relaxedBody = new RelaxedBody({
          hashAlgo: this.hashAlgo
        });
        this.parser.on("headers", (value) => {
          this.headers = value;
        });
        this.relaxedBody.on("hash", (value) => {
          this.bodyHash = value;
        });
        this.relaxedBody.on("readable", () => {
          let chunk;
          if (this.cache) {
            return;
          }
          while ((chunk = this.relaxedBody.read()) !== null) {
            this.chunks.push(chunk);
            this.chunklen += chunk.length;
            if (this.chunklen >= this.cacheTreshold && this.cachePath) {
              return this.createWriteCache();
            }
          }
        });
        this.relaxedBody.on("end", () => {
          if (this.cache) {
            return;
          }
          this.sendSignedOutput();
        });
        this.parser.pipe(this.relaxedBody);
        setImmediate(() => this.input.pipe(this.parser));
      }
    };
    var DKIM = class {
      constructor(options) {
        this.options = options || {};
        this.keys = [].concat(
          this.options.keys || {
            domainName: options.domainName,
            keySelector: options.keySelector,
            privateKey: options.privateKey
          }
        );
      }
      sign(input, extraOptions) {
        const output = new PassThrough();
        let inputStream = input;
        let writeValue = false;
        if (Buffer.isBuffer(input)) {
          writeValue = input;
          inputStream = new PassThrough();
        } else if (typeof input === "string") {
          writeValue = Buffer.from(input);
          inputStream = new PassThrough();
        }
        let options = this.options;
        if (extraOptions && Object.keys(extraOptions).length) {
          options = Object.assign({}, extraOptions, this.options);
        }
        const signer = new DKIMSigner(options, this.keys, inputStream, output);
        setImmediate(() => {
          signer.signStream();
          if (writeValue) {
            setImmediate(() => {
              inputStream.end(writeValue);
            });
          }
        });
        return output;
      }
    };
    module.exports = DKIM;
  }
});

// node_modules/nodemailer/lib/smtp-connection/http-proxy-client.js
var require_http_proxy_client = __commonJS({
  "node_modules/nodemailer/lib/smtp-connection/http-proxy-client.js"(exports, module) {
    "use strict";
    var net = __require("net");
    var tls = __require("tls");
    var urllib = require_url();
    var errors = require_errors();
    var MAX_RESPONSE_HEADER_BYTES = 64 * 1024;
    function httpProxyClient(proxyUrl, destinationPort, destinationHost, tlsOptions, callback) {
      if (typeof tlsOptions === "function") {
        callback = tlsOptions;
        tlsOptions = {};
      }
      tlsOptions = tlsOptions || {};
      destinationPort = Number(destinationPort) || 0;
      if (!destinationPort || /[\r\n]/.test(destinationHost)) {
        const err2 = new Error("Invalid proxy destination");
        err2.code = errors.EPROXY;
        return setImmediate(() => callback(err2));
      }
      const proxy = urllib.parse(proxyUrl);
      const connectOptions = {
        host: proxy.hostname,
        port: Number(proxy.port) ? Number(proxy.port) : proxy.protocol === "https:" ? 443 : 80
      };
      let connect;
      if (proxy.protocol === "https:") {
        connectOptions.rejectUnauthorized = tlsOptions.rejectUnauthorized !== false;
        connect = tls.connect.bind(tls);
      } else {
        connect = net.connect.bind(net);
      }
      let socket;
      let finished = false;
      const tempSocketErr = (err2) => {
        if (finished) {
          return;
        }
        finished = true;
        try {
          socket.destroy();
        } catch (_E) {
        }
        callback(err2);
      };
      const timeoutErr = () => {
        const err2 = new Error("Proxy socket timed out");
        err2.code = "ETIMEDOUT";
        tempSocketErr(err2);
      };
      socket = connect(connectOptions, () => {
        if (finished) {
          return;
        }
        const reqHeaders = {
          Host: destinationHost + ":" + destinationPort,
          Connection: "close"
        };
        if (proxy.auth) {
          reqHeaders["Proxy-Authorization"] = "Basic " + Buffer.from(proxy.auth).toString("base64");
        }
        socket.write(
          // HTTP method
          "CONNECT " + destinationHost + ":" + destinationPort + " HTTP/1.1\r\n" + // HTTP request headers
          Object.keys(reqHeaders).map((key) => key + ": " + reqHeaders[key]).join("\r\n") + // End request
          "\r\n\r\n"
        );
        let headers = "";
        const onSocketData = (chunk) => {
          let match;
          let remainder;
          if (finished) {
            return;
          }
          headers += chunk.toString("binary");
          if (match = headers.match(/\r\n\r\n/)) {
            socket.removeListener("data", onSocketData);
            remainder = headers.substr(match.index + match[0].length);
            headers = headers.substr(0, match.index);
            if (remainder) {
              socket.unshift(Buffer.from(remainder, "binary"));
            }
            finished = true;
            match = headers.match(/^HTTP\/\d+\.\d+ (\d+)/i);
            if (!match || (match[1] || "").charAt(0) !== "2") {
              try {
                socket.destroy();
              } catch (_E) {
              }
              const err2 = new Error("Invalid response from proxy" + (match && ": " + match[1] || ""));
              err2.code = errors.EPROXY;
              return callback(err2);
            }
            socket.removeListener("error", tempSocketErr);
            socket.removeListener("timeout", timeoutErr);
            socket.setTimeout(0);
            return callback(null, socket);
          }
          if (headers.length > MAX_RESPONSE_HEADER_BYTES) {
            socket.removeListener("data", onSocketData);
            const err2 = new Error("Proxy response headers too large");
            err2.code = errors.EPROXY;
            return tempSocketErr(err2);
          }
        };
        socket.on("data", onSocketData);
      });
      socket.setTimeout(httpProxyClient.timeout || 30 * 1e3);
      socket.on("timeout", timeoutErr);
      socket.once("error", tempSocketErr);
    }
    module.exports = httpProxyClient;
  }
});

// node_modules/nodemailer/lib/mailer/mail-message.js
var require_mail_message = __commonJS({
  "node_modules/nodemailer/lib/mailer/mail-message.js"(exports, module) {
    "use strict";
    var shared = require_shared();
    var MimeNode = require_mime_node();
    var mimeFuncs = require_mime_funcs();
    var MailMessage = class {
      constructor(mailer, data) {
        this.mailer = mailer;
        this.data = {};
        this.message = null;
        data = data || {};
        const options = mailer.options || {};
        const defaults = mailer._defaults || {};
        Object.assign(this.data, data);
        this.data.headers = this.data.headers || {};
        Object.keys(defaults).forEach((key) => {
          if (!(key in this.data)) {
            this.data[key] = defaults[key];
          } else if (key === "headers") {
            Object.keys(defaults.headers).forEach((key2) => {
              if (!(key2 in this.data.headers)) {
                this.data.headers[key2] = defaults.headers[key2];
              }
            });
          }
        });
        ["disableFileAccess", "disableUrlAccess", "normalizeHeaderKey"].forEach((key) => {
          if (key in options) {
            this.data[key] = options[key];
          }
        });
      }
      resolveContent(...args) {
        return shared.resolveContent(...args);
      }
      resolveAll(callback) {
        const keys = [
          [this.data, "html"],
          [this.data, "text"],
          [this.data, "watchHtml"],
          [this.data, "amp"],
          [this.data, "icalEvent"]
        ];
        if (this.data.alternatives && this.data.alternatives.length) {
          this.data.alternatives.forEach((alternative, i) => {
            keys.push([this.data.alternatives, i]);
          });
        }
        if (this.data.attachments && this.data.attachments.length) {
          this.data.attachments.forEach((attachment, i) => {
            if (!attachment.filename) {
              attachment.filename = (attachment.path || attachment.href || "").split("/").pop().split("?").shift() || "attachment-" + (i + 1);
              if (attachment.filename.indexOf(".") < 0) {
                attachment.filename += "." + mimeFuncs.detectExtension(attachment.contentType);
              }
            }
            if (!attachment.contentType) {
              attachment.contentType = mimeFuncs.detectMimeType(attachment.filename || attachment.path || attachment.href || "bin");
            }
            keys.push([this.data.attachments, i]);
          });
        }
        const mimeNode = new MimeNode();
        const addressKeys = ["from", "to", "cc", "bcc", "sender", "replyTo"];
        addressKeys.forEach((address) => {
          let value;
          if (this.message) {
            value = [].concat(mimeNode._parseAddresses(this.message.getHeader(address === "replyTo" ? "reply-to" : address)) || []);
          } else if (this.data[address]) {
            value = [].concat(mimeNode._parseAddresses(this.data[address]) || []);
          }
          if (value && value.length) {
            this.data[address] = value;
          } else if (address in this.data) {
            this.data[address] = null;
          }
        });
        const singleKeys = ["from", "sender"];
        singleKeys.forEach((address) => {
          if (this.data[address]) {
            this.data[address] = this.data[address].shift();
          }
        });
        let pos = 0;
        const resolveNext = () => {
          if (pos >= keys.length) {
            return callback(null, this.data);
          }
          const args = keys[pos++];
          if (!args[0] || !args[0][args[1]]) {
            return resolveNext();
          }
          shared.resolveContent(
            ...args,
            { disableFileAccess: this.data.disableFileAccess, disableUrlAccess: this.data.disableUrlAccess },
            (err2, value) => {
              if (err2) {
                return callback(err2);
              }
              const node = {
                content: value
              };
              if (args[0][args[1]] && typeof args[0][args[1]] === "object" && !Buffer.isBuffer(args[0][args[1]])) {
                Object.keys(args[0][args[1]]).forEach((key) => {
                  if (!(key in node) && !["content", "path", "href", "raw"].includes(key)) {
                    node[key] = args[0][args[1]][key];
                  }
                });
              }
              args[0][args[1]] = node;
              resolveNext();
            }
          );
        };
        setImmediate(() => resolveNext());
      }
      normalize(callback) {
        const envelope = this.data.envelope || this.message.getEnvelope();
        const messageId = this.message.messageId();
        this.resolveAll((err2, data) => {
          if (err2) {
            return callback(err2);
          }
          data.envelope = envelope;
          data.messageId = messageId;
          ["html", "text", "watchHtml", "amp"].forEach((key) => {
            if (data[key] && data[key].content) {
              if (typeof data[key].content === "string") {
                data[key] = data[key].content;
              } else if (Buffer.isBuffer(data[key].content)) {
                data[key] = data[key].content.toString();
              }
            }
          });
          if (data.icalEvent && Buffer.isBuffer(data.icalEvent.content)) {
            data.icalEvent.content = data.icalEvent.content.toString("base64");
            data.icalEvent.encoding = "base64";
          }
          if (data.alternatives && data.alternatives.length) {
            data.alternatives.forEach((alternative) => {
              if (alternative && alternative.content && Buffer.isBuffer(alternative.content)) {
                alternative.content = alternative.content.toString("base64");
                alternative.encoding = "base64";
              }
            });
          }
          if (data.attachments && data.attachments.length) {
            data.attachments.forEach((attachment) => {
              if (attachment && attachment.content && Buffer.isBuffer(attachment.content)) {
                attachment.content = attachment.content.toString("base64");
                attachment.encoding = "base64";
              }
            });
          }
          data.normalizedHeaders = {};
          Object.keys(data.headers || {}).forEach((key) => {
            let value = [].concat(data.headers[key] || []).shift();
            value = value && value.value || value;
            if (value) {
              if (["references", "in-reply-to", "message-id", "content-id"].includes(key)) {
                value = this.message._encodeHeaderValue(key, value);
              }
              data.normalizedHeaders[key] = value;
            }
          });
          if (data.list && typeof data.list === "object") {
            const listHeaders = this._getListHeaders(data.list);
            listHeaders.forEach((entry) => {
              data.normalizedHeaders[entry.key] = entry.value.map((val) => val && val.value || val).join(", ");
            });
          }
          if (data.references) {
            data.normalizedHeaders.references = this.message._encodeHeaderValue("references", data.references);
          }
          if (data.inReplyTo) {
            data.normalizedHeaders["in-reply-to"] = this.message._encodeHeaderValue("in-reply-to", data.inReplyTo);
          }
          return callback(null, data);
        });
      }
      setMailerHeader() {
        if (!this.message || !this.data.xMailer) {
          return;
        }
        this.message.setHeader("X-Mailer", this.data.xMailer);
      }
      setPriorityHeaders() {
        if (!this.message || !this.data.priority) {
          return;
        }
        switch ((this.data.priority || "").toString().toLowerCase()) {
          case "high":
            this.message.setHeader("X-Priority", "1 (Highest)");
            this.message.setHeader("X-MSMail-Priority", "High");
            this.message.setHeader("Importance", "High");
            break;
          case "low":
            this.message.setHeader("X-Priority", "5 (Lowest)");
            this.message.setHeader("X-MSMail-Priority", "Low");
            this.message.setHeader("Importance", "Low");
            break;
          default:
        }
      }
      setListHeaders() {
        if (!this.message || !this.data.list || typeof this.data.list !== "object") {
          return;
        }
        this._getListHeaders(this.data.list).forEach((listHeader) => {
          listHeader.value.forEach((value) => {
            this.message.addHeader(listHeader.key, value);
          });
        });
      }
      _getListHeaders(listData) {
        return Object.keys(listData).map((key) => ({
          key: "list-" + key.toLowerCase().trim(),
          value: [].concat(listData[key] || []).map((value) => ({
            prepared: true,
            foldLines: true,
            value: [].concat(value || []).map((value2) => {
              if (typeof value2 === "string") {
                value2 = {
                  url: value2
                };
              }
              if (value2 && value2.url) {
                if (key.toLowerCase().trim() === "id") {
                  let comment2 = (value2.comment || "").toString().replace(/\r?\n|\r/g, " ");
                  if (mimeFuncs.isPlainText(comment2)) {
                    comment2 = '"' + comment2 + '"';
                  } else {
                    comment2 = mimeFuncs.encodeWord(comment2);
                  }
                  return (value2.comment ? comment2 + " " : "") + this._formatListUrl(value2.url).replace(/^<[^:]+:\/{0,2}/, "<");
                }
                let comment = (value2.comment || "").toString().replace(/\r?\n|\r/g, " ");
                if (!mimeFuncs.isPlainText(comment)) {
                  comment = mimeFuncs.encodeWord(comment);
                }
                return this._formatListUrl(value2.url) + (value2.comment ? " (" + comment + ")" : "");
              }
              return "";
            }).filter((value2) => value2).join(", ")
          }))
        }));
      }
      _formatListUrl(url) {
        url = url.replace(/[\s<]+|[\s>]+/g, "");
        if (/^(https?|mailto|ftp):/.test(url)) {
          return "<" + url + ">";
        }
        if (/^[^@]+@[^@]+$/.test(url)) {
          return "<mailto:" + url + ">";
        }
        return "<http://" + url + ">";
      }
    };
    module.exports = MailMessage;
  }
});

// node_modules/nodemailer/lib/mailer/index.js
var require_mailer = __commonJS({
  "node_modules/nodemailer/lib/mailer/index.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var shared = require_shared();
    var mimeTypes = require_mime_types();
    var MailComposer = require_mail_composer();
    var DKIM = require_dkim();
    var httpProxyClient = require_http_proxy_client();
    var errors = require_errors();
    var util = __require("util");
    var urllib = require_url();
    var packageData = require_package();
    var MailMessage = require_mail_message();
    var net = __require("net");
    var dns = __require("dns");
    var crypto = __require("crypto");
    var Mail = class extends EventEmitter {
      constructor(transporter, options, defaults) {
        super();
        this.options = options || {};
        this._defaults = defaults || {};
        this._defaultPlugins = {
          compile: [(...args) => this._convertDataImages(...args)],
          stream: []
        };
        this._userPlugins = {
          compile: [],
          stream: []
        };
        this.meta = /* @__PURE__ */ new Map();
        this.dkim = this.options.dkim ? new DKIM(this.options.dkim) : false;
        this.transporter = transporter;
        this.transporter.mailer = this;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "mail"
        });
        this.logger.debug(
          {
            tnx: "create"
          },
          "Creating transport: %s",
          this.getVersionString()
        );
        if (typeof this.transporter.on === "function") {
          this.transporter.on("log", (log) => {
            this.logger.debug(
              {
                tnx: "transport"
              },
              "%s: %s",
              log.type,
              log.message
            );
          });
          this.transporter.on("error", (err2) => {
            this.logger.error(
              {
                err: err2,
                tnx: "transport"
              },
              "Transport Error: %s",
              err2.message
            );
            this.emit("error", err2);
          });
          this.transporter.on("idle", (...args) => {
            this.emit("idle", ...args);
          });
          this.transporter.on("clear", (...args) => {
            this.emit("clear", ...args);
          });
        }
        ["close", "isIdle", "verify"].forEach((method) => {
          this[method] = (...args) => {
            if (typeof this.transporter[method] === "function") {
              if (method === "verify" && typeof this.getSocket === "function") {
                this.transporter.getSocket = this.getSocket;
                this.getSocket = false;
              }
              return this.transporter[method](...args);
            }
            this.logger.warn(
              {
                tnx: "transport",
                methodName: method
              },
              "Non existing method %s called for transport",
              method
            );
            return false;
          };
        });
        if (this.options.proxy && typeof this.options.proxy === "string") {
          this.setupProxy(this.options.proxy);
        }
      }
      use(step, plugin) {
        step = (step || "").toString();
        if (!this._userPlugins.hasOwnProperty(step)) {
          this._userPlugins[step] = [plugin];
        } else {
          this._userPlugins[step].push(plugin);
        }
        return this;
      }
      /**
       * Sends an email using the preselected transport object
       *
       * @param {Object} data E-data description
       * @param {Function?} callback Callback to run once the sending succeeded or failed
       */
      sendMail(data, callback = null) {
        let promise;
        if (!callback) {
          promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
          });
        }
        if (typeof this.getSocket === "function") {
          this.transporter.getSocket = this.getSocket;
          this.getSocket = false;
        }
        const mail = new MailMessage(this, data);
        this.logger.debug(
          {
            tnx: "transport",
            name: this.transporter.name,
            version: this.transporter.version,
            action: "send"
          },
          "Sending mail using %s/%s",
          this.transporter.name,
          this.transporter.version
        );
        this._processPlugins("compile", mail, (err2) => {
          if (err2) {
            this.logger.error(
              {
                err: err2,
                tnx: "plugin",
                action: "compile"
              },
              "PluginCompile Error: %s",
              err2.message
            );
            return callback(err2);
          }
          mail.message = new MailComposer(mail.data).compile();
          mail.setMailerHeader();
          mail.setPriorityHeaders();
          mail.setListHeaders();
          this._processPlugins("stream", mail, (err3) => {
            if (err3) {
              this.logger.error(
                {
                  err: err3,
                  tnx: "plugin",
                  action: "stream"
                },
                "PluginStream Error: %s",
                err3.message
              );
              return callback(err3);
            }
            if (mail.data.dkim || this.dkim) {
              mail.message.processFunc((input) => {
                const dkim = mail.data.dkim ? new DKIM(mail.data.dkim) : this.dkim;
                this.logger.debug(
                  {
                    tnx: "DKIM",
                    messageId: mail.message.messageId(),
                    dkimDomains: dkim.keys.map((key) => key.keySelector + "." + key.domainName).join(", ")
                  },
                  "Signing outgoing message with %s keys",
                  dkim.keys.length
                );
                return dkim.sign(input, mail.data._dkim);
              });
            }
            this.transporter.send(mail, (...args) => {
              if (args[0]) {
                this.logger.error(
                  {
                    err: args[0],
                    tnx: "transport",
                    action: "send"
                  },
                  "Send Error: %s",
                  args[0].message
                );
              }
              callback(...args);
            });
          });
        });
        return promise;
      }
      getVersionString() {
        return util.format(
          "%s (%s; +%s; %s/%s)",
          packageData.name,
          packageData.version,
          packageData.homepage,
          this.transporter.name,
          this.transporter.version
        );
      }
      _processPlugins(step, mail, callback) {
        step = (step || "").toString();
        if (!this._userPlugins.hasOwnProperty(step)) {
          return callback();
        }
        const userPlugins = this._userPlugins[step] || [];
        const defaultPlugins = this._defaultPlugins[step] || [];
        if (userPlugins.length) {
          this.logger.debug(
            {
              tnx: "transaction",
              pluginCount: userPlugins.length,
              step
            },
            "Using %s plugins for %s",
            userPlugins.length,
            step
          );
        }
        if (userPlugins.length + defaultPlugins.length === 0) {
          return callback();
        }
        let pos = 0;
        let block = "default";
        const processPlugins = () => {
          let curplugins = block === "default" ? defaultPlugins : userPlugins;
          if (pos >= curplugins.length) {
            if (block === "default" && userPlugins.length) {
              block = "user";
              pos = 0;
              curplugins = userPlugins;
            } else {
              return callback();
            }
          }
          const plugin = curplugins[pos++];
          plugin(mail, (err2) => {
            if (err2) {
              return callback(err2);
            }
            processPlugins();
          });
        };
        processPlugins();
      }
      /**
       * Sets up proxy handler for a Nodemailer object
       *
       * @param {String} proxyUrl Proxy configuration url
       */
      setupProxy(proxyUrl) {
        const proxy = urllib.parse(proxyUrl);
        this.getSocket = (options, callback) => {
          const protocol = proxy.protocol.replace(/:$/, "").toLowerCase();
          if (this.meta.has("proxy_handler_" + protocol)) {
            return this.meta.get("proxy_handler_" + protocol)(proxy, options, callback);
          }
          switch (protocol) {
            // Connect using a HTTP CONNECT method
            case "http":
            case "https":
              httpProxyClient(proxy.href, options.port, options.host, this.options.tls || {}, (err3, socket) => {
                if (err3) {
                  return callback(err3);
                }
                return callback(null, {
                  connection: socket
                });
              });
              return;
            case "socks":
            case "socks5":
            case "socks4":
            case "socks4a": {
              if (!this.meta.has("proxy_socks_module")) {
                let err3 = new Error("Socks module not loaded");
                err3.code = errors.EPROXY;
                return callback(err3);
              }
              const connect = (ipaddress) => {
                const proxyV2 = !!this.meta.get("proxy_socks_module").SocksClient;
                const socksClient = proxyV2 ? this.meta.get("proxy_socks_module").SocksClient : this.meta.get("proxy_socks_module");
                const proxyType = Number(proxy.protocol.replace(/\D/g, "")) || 5;
                const connectionOpts = {
                  proxy: {
                    ipaddress,
                    port: Number(proxy.port),
                    type: proxyType
                  },
                  [proxyV2 ? "destination" : "target"]: {
                    host: options.host,
                    port: options.port
                  },
                  command: "connect"
                };
                if (proxy.auth) {
                  const username = decodeURIComponent(proxy.auth.split(":").shift());
                  const password = decodeURIComponent(proxy.auth.split(":").pop());
                  if (proxyV2) {
                    connectionOpts.proxy.userId = username;
                    connectionOpts.proxy.password = password;
                  } else if (proxyType === 4) {
                    connectionOpts.userid = username;
                  } else {
                    connectionOpts.authentication = {
                      username,
                      password
                    };
                  }
                }
                socksClient.createConnection(connectionOpts, (err3, info) => {
                  if (err3) {
                    return callback(err3);
                  }
                  return callback(null, {
                    connection: info.socket || info
                  });
                });
              };
              if (net.isIP(proxy.hostname)) {
                return connect(proxy.hostname);
              }
              return dns.resolve(proxy.hostname, (err3, address) => {
                if (err3) {
                  return callback(err3);
                }
                connect(Array.isArray(address) ? address[0] : address);
              });
            }
          }
          let err2 = new Error("Unknown proxy configuration");
          err2.code = errors.EPROXY;
          callback(err2);
        };
      }
      _convertDataImages(mail, callback) {
        if (!this.options.attachDataUrls && !mail.data.attachDataUrls || !mail.data.html) {
          return callback();
        }
        mail.resolveContent(
          mail.data,
          "html",
          { disableFileAccess: mail.data.disableFileAccess, disableUrlAccess: mail.data.disableUrlAccess },
          (err2, html) => {
            if (err2) {
              return callback(err2);
            }
            let cidCounter = 0;
            html = (html || "").toString().replace(
              /(<img\b[^<>]{0,1024} src\s{0,20}=[\s"']{0,20})(data:([^;]+);[^"'>\s]+)/gi,
              (match, prefix, dataUri, mimeType) => {
                const cid = crypto.randomBytes(10).toString("hex") + "@localhost";
                if (!mail.data.attachments) {
                  mail.data.attachments = [];
                }
                if (!Array.isArray(mail.data.attachments)) {
                  mail.data.attachments = [].concat(mail.data.attachments || []);
                }
                mail.data.attachments.push({
                  path: dataUri,
                  cid,
                  filename: "image-" + ++cidCounter + "." + mimeTypes.detectExtension(mimeType)
                });
                return prefix + "cid:" + cid;
              }
            );
            mail.data.html = html;
            callback();
          }
        );
      }
      set(key, value) {
        return this.meta.set(key, value);
      }
      get(key) {
        return this.meta.get(key);
      }
    };
    module.exports = Mail;
  }
});

// node_modules/nodemailer/lib/smtp-connection/data-stream.js
var require_data_stream = __commonJS({
  "node_modules/nodemailer/lib/smtp-connection/data-stream.js"(exports, module) {
    "use strict";
    var { Transform } = __require("stream");
    var DataStream = class extends Transform {
      constructor(options) {
        super(options);
        this.options = options || {};
        this.inByteCount = 0;
        this.outByteCount = 0;
        this.lastByte = false;
      }
      /**
       * Escapes dots
       */
      _transform(chunk, encoding, done) {
        const chunks = [];
        let chunklen = 0;
        let i, len, lastPos = 0;
        let buf;
        if (!chunk || !chunk.length) {
          return done();
        }
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk);
        }
        this.inByteCount += chunk.length;
        for (i = 0, len = chunk.length; i < len; i++) {
          if (chunk[i] === 46) {
            if (i && chunk[i - 1] === 10 || !i && (!this.lastByte || this.lastByte === 10)) {
              buf = chunk.slice(lastPos, i + 1);
              chunks.push(buf);
              chunks.push(Buffer.from("."));
              chunklen += buf.length + 1;
              lastPos = i + 1;
            }
          } else if (chunk[i] === 10) {
            if (i && chunk[i - 1] !== 13 || !i && this.lastByte !== 13) {
              if (i > lastPos) {
                buf = chunk.slice(lastPos, i);
                chunks.push(buf);
                chunklen += buf.length + 2;
              } else {
                chunklen += 2;
              }
              chunks.push(Buffer.from("\r\n"));
              lastPos = i + 1;
            }
          }
        }
        if (chunklen) {
          if (lastPos < chunk.length) {
            buf = chunk.slice(lastPos);
            chunks.push(buf);
            chunklen += buf.length;
          }
          this.outByteCount += chunklen;
          this.push(Buffer.concat(chunks, chunklen));
        } else {
          this.outByteCount += chunk.length;
          this.push(chunk);
        }
        this.lastByte = chunk[chunk.length - 1];
        done();
      }
      /**
       * Finalizes the stream with a dot on a single line
       */
      _flush(done) {
        let buf;
        if (this.lastByte === 10) {
          buf = Buffer.from(".\r\n");
        } else if (this.lastByte === 13) {
          buf = Buffer.from("\n.\r\n");
        } else {
          buf = Buffer.from("\r\n.\r\n");
        }
        this.outByteCount += buf.length;
        this.push(buf);
        done();
      }
    };
    module.exports = DataStream;
  }
});

// node_modules/nodemailer/lib/smtp-connection/index.js
var require_smtp_connection = __commonJS({
  "node_modules/nodemailer/lib/smtp-connection/index.js"(exports, module) {
    "use strict";
    var packageInfo = require_package();
    var { EventEmitter } = __require("events");
    var net = __require("net");
    var tls = __require("tls");
    var os = __require("os");
    var crypto = __require("crypto");
    var DataStream = require_data_stream();
    var { PassThrough } = __require("stream");
    var shared = require_shared();
    var CONNECTION_TIMEOUT = 2 * 60 * 1e3;
    var SOCKET_TIMEOUT = 10 * 60 * 1e3;
    var GREETING_TIMEOUT = 30 * 1e3;
    var DNS_TIMEOUT = 30 * 1e3;
    var TEARDOWN_NOOP = () => {
    };
    function decodeServerResponse(str) {
      if (!str) {
        return str;
      }
      const utf8 = Buffer.from(str, "binary").toString("utf8");
      return utf8.includes("\uFFFD") ? str : utf8;
    }
    var SMTPConnection = class extends EventEmitter {
      constructor(options) {
        super(options);
        this.id = crypto.randomBytes(8).toString("base64").replace(/\W/g, "");
        this.stage = "init";
        this.options = options || {};
        this.secureConnection = !!this.options.secure;
        this.alreadySecured = !!this.options.secured;
        this.port = Number(this.options.port) || (this.secureConnection ? 465 : 587);
        this.host = this.options.host || "localhost";
        this.servername = this.options.servername ? this.options.servername : !net.isIP(this.host) ? this.host : false;
        this.allowInternalNetworkInterfaces = this.options.allowInternalNetworkInterfaces || false;
        if (typeof this.options.secure === "undefined" && this.port === 465) {
          this.secureConnection = true;
        }
        this.name = (this.options.name || this._getHostname()).toString().replace(/[\r\n]+/g, "");
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "smtp-connection",
          sid: this.id
        });
        this.customAuth = /* @__PURE__ */ new Map();
        for (const key of Object.keys(this.options.customAuth || {})) {
          const mapKey = (key || "").toString().trim().toUpperCase();
          if (mapKey) {
            this.customAuth.set(mapKey, this.options.customAuth[key]);
          }
        }
        this.version = packageInfo.version;
        this.authenticated = false;
        this.destroyed = false;
        this.secure = !!this.secureConnection;
        this._remainder = "";
        this._responseQueue = [];
        this.lastServerResponse = false;
        this._socket = false;
        this._supportedAuth = [];
        this.allowsAuth = false;
        this._envelope = false;
        this._supportedExtensions = [];
        this._maxAllowedSize = 0;
        this._responseActions = [];
        this._recipientQueue = [];
        this._greetingTimeout = false;
        this._connectionTimeout = false;
        this._destroyed = false;
        this._closing = false;
        this._currentDataStream = false;
        this._onSocketData = (chunk) => this._onData(chunk);
        this._onSocketError = (error) => this._onError(error, "ESOCKET", false, "CONN");
        this._onSocketClose = () => this._onClose();
        this._onSocketEnd = () => this._onEnd();
        this._onSocketTimeout = () => this._onTimeout();
        this._onConnectionSocketError = (err2) => this._onConnectionError(err2, "ESOCKET");
        this._connectionAttemptId = 0;
      }
      /**
       * Creates a connection to a SMTP server and sets up connection
       * listener
       */
      connect(connectCallback) {
        if (typeof connectCallback === "function") {
          this.once("connect", () => {
            this.logger.debug(
              {
                tnx: "smtp"
              },
              "SMTP handshake finished"
            );
            connectCallback();
          });
          const isDestroyedMessage = this._isDestroyedMessage("connect");
          if (isDestroyedMessage) {
            return connectCallback(this._formatError(isDestroyedMessage, "ECONNECTION", false, "CONN"));
          }
        }
        let opts = {
          port: this.port,
          host: this.host,
          allowInternalNetworkInterfaces: this.allowInternalNetworkInterfaces,
          timeout: this.options.dnsTimeout || DNS_TIMEOUT
        };
        if (this.options.localAddress) {
          opts.localAddress = this.options.localAddress;
        }
        if (this.options.connection) {
          this._socket = this.options.connection;
          this._setupConnectionHandlers();
          if (this.secureConnection && !this.alreadySecured) {
            setImmediate(
              () => this._upgradeConnection((err2) => {
                if (err2) {
                  this._onError(new Error("Error initiating TLS - " + (err2.message || err2)), "ETLS", false, "CONN");
                  return;
                }
                this._onConnect();
              })
            );
          } else {
            setImmediate(() => this._onConnect());
          }
          return;
        } else if (this.options.socket) {
          this._socket = this.options.socket;
          return this._resolveAndConnect(opts, (_resolved) => {
            try {
              this._socket.connect(this.port, this.host, () => {
                this._socket.setKeepAlive(true);
                if (this.secureConnection && !this.alreadySecured) {
                  return this._upgradeConnection((err2) => {
                    if (err2) {
                      this._onError(new Error("Error initiating TLS - " + (err2.message || err2)), "ETLS", false, "CONN");
                      return;
                    }
                    this._onConnect();
                  });
                }
                this._onConnect();
              });
              this._setupConnectionHandlers();
            } catch (E) {
              return setImmediate(() => this._onError(E, "ECONNECTION", false, "CONN"));
            }
          });
        } else {
          if (this.secureConnection) {
            Object.assign(opts, this.options.tls || {});
            if (this.servername && !opts.servername) {
              opts.servername = this.servername;
            }
          }
          return this._resolveAndConnect(opts, (resolved) => {
            this._fallbackAddresses = (resolved._addresses || []).filter((addr) => addr !== opts.host);
            this._connectOpts = Object.assign({}, opts);
            this._connectToHost(opts, this.secureConnection);
          });
        }
      }
      /**
       * Resolves the hostname and applies resolved values to opts,
       * then calls the provided callback with the resolved data
       *
       * @param {Object} opts Connection options (modified in place)
       * @param {Function} callback Called with resolved data on success
       */
      _resolveAndConnect(opts, callback) {
        return shared.resolveHostname(opts, (err2, resolved) => {
          if (err2) {
            return setImmediate(() => this._onError(err2, "EDNS", false, "CONN"));
          }
          this.logger.debug(
            {
              tnx: "dns",
              source: opts.host,
              resolved: resolved.host,
              cached: !!resolved.cached
            },
            "Resolved %s as %s [cache %s]",
            opts.host,
            resolved.host,
            resolved.cached ? "hit" : "miss"
          );
          for (const key of Object.keys(resolved)) {
            if (key.charAt(0) !== "_" && resolved[key]) {
              opts[key] = resolved[key];
            }
          }
          callback(resolved);
        });
      }
      /**
       * Attempts to connect to the specified host address
       *
       * @param {Object} opts Connection options
       * @param {Boolean} secure Whether to use TLS
       */
      _connectToHost(opts, secure) {
        if (this._destroyed || this._closing) {
          return;
        }
        this._connectionAttemptId++;
        const currentAttemptId = this._connectionAttemptId;
        const connectFn = secure ? tls.connect : net.connect;
        try {
          this._socket = connectFn(opts, () => {
            if (this._connectionAttemptId !== currentAttemptId) {
              return;
            }
            this._socket.setKeepAlive(true);
            this._onConnect();
          });
          this._setupConnectionHandlers();
        } catch (E) {
          return setImmediate(() => this._onError(E, "ECONNECTION", false, "CONN"));
        }
      }
      /**
       * Sets up connection timeout and error handlers
       */
      _setupConnectionHandlers() {
        this._connectionTimeout = setTimeout(() => {
          this._onConnectionError("Connection timeout", "ETIMEDOUT");
        }, this.options.connectionTimeout || CONNECTION_TIMEOUT);
        this._socket.on("error", this._onConnectionSocketError);
      }
      /**
       * Handles connection errors with fallback to alternative addresses
       *
       * @param {Error|String} err Error object or message
       * @param {String} code Error code
       */
      _onConnectionError(err2, code) {
        clearTimeout(this._connectionTimeout);
        const canFallback = this._fallbackAddresses && this._fallbackAddresses.length && this.stage === "init" && !this._destroyed;
        if (!canFallback) {
          this._onError(err2, code, false, "CONN");
          return;
        }
        const nextHost = this._fallbackAddresses.shift();
        this.logger.info(
          {
            tnx: "network",
            failedHost: this._connectOpts.host,
            nextHost,
            error: err2.message || err2
          },
          "Connection to %s failed, trying %s",
          this._connectOpts.host,
          nextHost
        );
        if (this._socket) {
          try {
            this._socket.removeListener("error", this._onConnectionSocketError);
            this._socket.on("error", TEARDOWN_NOOP);
            this._socket.destroy();
          } catch (_E) {
          }
          this._socket = null;
        }
        this._connectOpts.host = nextHost;
        this._connectToHost(this._connectOpts, this.secureConnection);
      }
      /**
       * Sends QUIT
       */
      quit() {
        this._sendCommand("QUIT");
        this._responseActions.push(this.close);
      }
      /**
       * Closes the connection to the server
       */
      close() {
        clearTimeout(this._connectionTimeout);
        clearTimeout(this._greetingTimeout);
        this._responseActions = [];
        if (this._closing) {
          return;
        }
        this._closing = true;
        const closeMethod = this.stage === "init" ? "destroy" : "end";
        this.logger.debug(
          {
            tnx: "smtp"
          },
          'Closing connection to the server using "%s"',
          closeMethod
        );
        const socket = this._socket && this._socket.socket || this._socket;
        if (this._currentDataStream) {
          try {
            this._currentDataStream.unpipe(this._socket);
          } catch (_E) {
          }
          this._currentDataStream = false;
        }
        if (socket && !socket.destroyed) {
          try {
            socket.setTimeout(0);
            socket.removeListener("data", this._onSocketData);
            socket.removeListener("timeout", this._onSocketTimeout);
            socket.removeListener("close", this._onSocketClose);
            socket.removeListener("end", this._onSocketEnd);
            socket.removeListener("error", this._onSocketError);
            socket.removeListener("error", this._onConnectionSocketError);
            socket.on("error", TEARDOWN_NOOP);
            socket[closeMethod]();
          } catch (_E) {
          }
        }
        this._destroy();
      }
      /**
       * Authenticate user
       */
      login(authData, callback) {
        const isDestroyedMessage = this._isDestroyedMessage("login");
        if (isDestroyedMessage) {
          return callback(this._formatError(isDestroyedMessage, "ECONNECTION", false, "API"));
        }
        this._auth = authData || {};
        this._authMethod = (this._auth.method || "").toString().trim().toUpperCase() || false;
        if (!this._authMethod && this._auth.oauth2 && !this._auth.credentials) {
          this._authMethod = "XOAUTH2";
        } else if (!this._authMethod || this._authMethod === "XOAUTH2" && !this._auth.oauth2) {
          this._authMethod = (this._supportedAuth[0] || "PLAIN").toUpperCase().trim();
        }
        if (this._authMethod !== "XOAUTH2" && (!this._auth.credentials || !this._auth.credentials.user || !this._auth.credentials.pass)) {
          if (this._auth.user && this._auth.pass || this.customAuth.has(this._authMethod)) {
            this._auth.credentials = {
              user: this._auth.user,
              pass: this._auth.pass,
              options: this._auth.options
            };
          } else {
            return callback(this._formatError('Missing credentials for "' + this._authMethod + '"', "EAUTH", false, "API"));
          }
        }
        if (this.customAuth.has(this._authMethod)) {
          const handler = this.customAuth.get(this._authMethod);
          let lastResponse;
          let returned = false;
          const resolve = () => {
            if (returned) {
              return;
            }
            returned = true;
            this.logger.info(
              {
                tnx: "smtp",
                username: this._auth.user,
                action: "authenticated",
                method: this._authMethod
              },
              "User %s authenticated",
              JSON.stringify(this._auth.user)
            );
            this.authenticated = true;
            callback(null, true);
          };
          const reject = (err2) => {
            if (returned) {
              return;
            }
            returned = true;
            callback(this._formatError(err2, "EAUTH", lastResponse, "AUTH " + this._authMethod));
          };
          const handlerResponse = handler({
            auth: this._auth,
            method: this._authMethod,
            extensions: [].concat(this._supportedExtensions),
            authMethods: [].concat(this._supportedAuth),
            maxAllowedSize: this._maxAllowedSize || false,
            sendCommand: (cmd, done) => {
              let promise;
              if (!done) {
                promise = new Promise((resolve2, reject2) => {
                  done = shared.callbackPromise(resolve2, reject2);
                });
              }
              this._responseActions.push((str) => {
                lastResponse = str;
                let codes = str.match(/^(\d+)(?:\s(\d+\.\d+\.\d+))?\s/);
                let data = {
                  command: cmd,
                  response: str
                };
                if (codes) {
                  data.status = Number(codes[1]) || 0;
                  if (codes[2]) {
                    data.code = codes[2];
                  }
                  data.text = str.substr(codes[0].length);
                } else {
                  data.text = str;
                  data.status = 0;
                }
                done(null, data);
              });
              setImmediate(() => this._sendCommand(cmd));
              return promise;
            },
            resolve,
            reject
          });
          if (handlerResponse && typeof handlerResponse.catch === "function") {
            handlerResponse.then(resolve).catch(reject);
          }
          return;
        }
        switch (this._authMethod) {
          case "XOAUTH2":
            this._handleXOauth2Token(false, callback);
            return;
          case "LOGIN":
            this._responseActions.push((str) => {
              this._actionAUTH_LOGIN_USER(str, callback);
            });
            this._sendCommand("AUTH LOGIN");
            return;
          case "PLAIN":
            this._responseActions.push((str) => {
              this._actionAUTHComplete(str, callback);
            });
            this._sendCommand(
              "AUTH PLAIN " + Buffer.from(
                //this._auth.user+'\u0000'+
                "\0" + // skip authorization identity as it causes problems with some servers
                this._auth.credentials.user + "\0" + this._auth.credentials.pass,
                "utf-8"
              ).toString("base64"),
              // log entry without passwords
              "AUTH PLAIN " + Buffer.from(
                //this._auth.user+'\u0000'+
                "\0" + // skip authorization identity as it causes problems with some servers
                this._auth.credentials.user + "\0/* secret */",
                "utf-8"
              ).toString("base64")
            );
            return;
          case "CRAM-MD5":
            this._responseActions.push((str) => {
              this._actionAUTH_CRAM_MD5(str, callback);
            });
            this._sendCommand("AUTH CRAM-MD5");
            return;
        }
        return callback(this._formatError('Unknown authentication method "' + this._authMethod + '"', "EAUTH", false, "API"));
      }
      /**
       * Sends a message
       *
       * @param {Object} envelope Envelope object, {from: addr, to: [addr]}
       * @param {Object} message String, Buffer or a Stream
       * @param {Function} callback Callback to return once sending is completed
       */
      send(envelope, message, done) {
        if (!message) {
          return done(this._formatError("Empty message", "EMESSAGE", false, "API"));
        }
        const isDestroyedMessage = this._isDestroyedMessage("send message");
        if (isDestroyedMessage) {
          return done(this._formatError(isDestroyedMessage, "ECONNECTION", false, "API"));
        }
        if (this._maxAllowedSize && envelope.size > this._maxAllowedSize) {
          return setImmediate(() => {
            done(this._formatError("Message size larger than allowed " + this._maxAllowedSize, "EMESSAGE", false, "MAIL FROM"));
          });
        }
        let returned = false;
        const callback = function() {
          if (returned) {
            return;
          }
          returned = true;
          done(...arguments);
        };
        if (typeof message.on === "function") {
          message.on("error", (err2) => callback(this._formatError(err2, "ESTREAM", false, "API")));
        }
        const startTime = Date.now();
        this._setEnvelope(envelope, (err2, info) => {
          if (err2) {
            const stream2 = new PassThrough();
            if (typeof message.pipe === "function") {
              message.pipe(stream2);
            } else {
              stream2.write(message);
              stream2.end();
            }
            return callback(err2);
          }
          const envelopeTime = Date.now();
          const stream = this._createSendStream((err3, str) => {
            if (err3) {
              return callback(err3);
            }
            info.envelopeTime = envelopeTime - startTime;
            info.messageTime = Date.now() - envelopeTime;
            info.messageSize = stream.outByteCount;
            info.response = str;
            return callback(null, info);
          });
          if (typeof message.pipe === "function") {
            message.pipe(stream);
          } else {
            stream.write(message);
            stream.end();
          }
        });
      }
      /**
       * Resets connection state
       *
       * @param {Function} callback Callback to return once connection is reset
       */
      reset(callback) {
        const isDestroyedMessage = this._isDestroyedMessage("reset");
        if (isDestroyedMessage) {
          return callback(this._formatError(isDestroyedMessage, "ECONNECTION", false, "API"));
        }
        this._sendCommand("RSET");
        this._responseActions.push((str) => {
          if (str.charAt(0) !== "2") {
            return callback(this._formatError("Could not reset session state. response=" + str, "EPROTOCOL", str, "RSET"));
          }
          this._envelope = false;
          return callback(null, true);
        });
      }
      /**
       * Connection listener that is run when the connection to
       * the server is opened
       *
       * @event
       */
      _onConnect() {
        clearTimeout(this._connectionTimeout);
        this.logger.info(
          {
            tnx: "network",
            localAddress: this._socket.localAddress,
            localPort: this._socket.localPort,
            remoteAddress: this._socket.remoteAddress,
            remotePort: this._socket.remotePort
          },
          "%s established to %s:%s",
          this.secure ? "Secure connection" : "Connection",
          this._socket.remoteAddress,
          this._socket.remotePort
        );
        if (this._destroyed) {
          this.close();
          return;
        }
        this.stage = "connected";
        this._socket.removeListener("data", this._onSocketData);
        this._socket.removeListener("timeout", this._onSocketTimeout);
        this._socket.removeListener("close", this._onSocketClose);
        this._socket.removeListener("end", this._onSocketEnd);
        this._socket.removeListener("error", this._onConnectionSocketError);
        this._socket.removeListener("error", this._onSocketError);
        this._socket.on("error", this._onSocketError);
        this._socket.on("data", this._onSocketData);
        this._socket.once("close", this._onSocketClose);
        this._socket.once("end", this._onSocketEnd);
        this._socket.setTimeout(this.options.socketTimeout || SOCKET_TIMEOUT);
        this._socket.on("timeout", this._onSocketTimeout);
        this._greetingTimeout = setTimeout(() => {
          if (this._socket && !this._destroyed && this._responseActions[0] === this._actionGreeting) {
            this._onError("Greeting never received", "ETIMEDOUT", false, "CONN");
          }
        }, this.options.greetingTimeout || GREETING_TIMEOUT);
        this._responseActions.push(this._actionGreeting);
        this._socket.resume();
      }
      /**
       * 'data' listener for data coming from the server
       *
       * @event
       * @param {Buffer} chunk Data chunk coming from the server
       */
      _onData(chunk) {
        if (this._destroyed || !chunk || !chunk.length) {
          return;
        }
        let data = chunk.toString("binary");
        let lines = (this._remainder + data).split(/\r?\n/);
        let lastline;
        this._remainder = lines.pop();
        for (let i = 0, len = lines.length; i < len; i++) {
          if (this._responseQueue.length) {
            lastline = this._responseQueue[this._responseQueue.length - 1];
            if (/^\d+-/.test(lastline.split("\n").pop())) {
              this._responseQueue[this._responseQueue.length - 1] += "\n" + lines[i];
              continue;
            }
          }
          this._responseQueue.push(lines[i]);
        }
        if (this._responseQueue.length) {
          lastline = this._responseQueue[this._responseQueue.length - 1];
          if (/^\d+-/.test(lastline.split("\n").pop())) {
            return;
          }
        }
        this._processResponse();
      }
      /**
       * 'error' listener for the socket
       *
       * @event
       * @param {Error} err Error object
       * @param {String} type Error name
       */
      _onError(err2, type, data, command) {
        clearTimeout(this._connectionTimeout);
        clearTimeout(this._greetingTimeout);
        if (this._destroyed) {
          return;
        }
        err2 = this._formatError(err2, type, data, command);
        const transientCodes = ["ETIMEDOUT", "ESOCKET", "ECONNECTION"];
        if (transientCodes.includes(err2.code)) {
          this.logger.warn(data, err2.message);
        } else {
          this.logger.error(data, err2.message);
        }
        this.emit("error", err2);
        this.close();
      }
      _formatError(message, type, response, command) {
        let err2;
        if (/Error\]$/i.test(Object.prototype.toString.call(message))) {
          err2 = message;
        } else {
          err2 = new Error(message);
        }
        if (type && type !== "Error") {
          err2.code = type;
        }
        if (response) {
          err2.response = response;
          err2.message += ": " + response;
        }
        const responseCode = typeof response === "string" && Number((response.match(/^\d+/) || [])[0]) || false;
        if (responseCode) {
          err2.responseCode = responseCode;
        }
        if (command) {
          err2.command = command;
        }
        return err2;
      }
      /**
       * 'close' listener for the socket
       *
       * @event
       */
      _onClose() {
        let serverResponse = false;
        if (this._remainder && this._remainder.trim()) {
          this.lastServerResponse = serverResponse = decodeServerResponse(this._remainder.trim());
          if (this.options.debug || this.options.transactionLog) {
            this.logger.debug(
              {
                tnx: "server"
              },
              serverResponse
            );
          }
        }
        this.logger.info(
          {
            tnx: "network"
          },
          "Connection closed"
        );
        if (this.upgrading && !this._destroyed) {
          return this._onError(new Error("Connection closed unexpectedly"), "ETLS", serverResponse, "CONN");
        } else if (![this._actionGreeting, this.close].includes(this._responseActions[0]) && !this._destroyed) {
          return this._onError(new Error("Connection closed unexpectedly"), "ECONNECTION", serverResponse, "CONN");
        } else if (/^[45]\d{2}\b/.test(serverResponse)) {
          return this._onError(new Error("Connection closed unexpectedly"), "ECONNECTION", serverResponse, "CONN");
        }
        this._destroy();
      }
      /**
       * 'end' listener for the socket
       *
       * @event
       */
      _onEnd() {
        if (this._socket && !this._socket.destroyed) {
          this._socket.end();
        }
      }
      /**
       * 'timeout' listener for the socket
       *
       * @event
       */
      _onTimeout() {
        return this._onError(new Error("Timeout"), "ETIMEDOUT", false, "CONN");
      }
      /**
       * Destroys the client, emits 'end'
       */
      _destroy() {
        if (this._destroyed) {
          return;
        }
        this._destroyed = true;
        this.destroyed = true;
        this.emit("end");
      }
      /**
       * Upgrades the connection to TLS
       *
       * @param {Function} callback Callback function to run when the connection
       *        has been secured
       */
      _upgradeConnection(callback) {
        this._remainder = "";
        this._responseQueue = [];
        this._socket.removeListener("data", this._onSocketData);
        this._socket.removeListener("timeout", this._onSocketTimeout);
        const socketPlain = this._socket;
        const opts = Object.assign(
          {
            socket: this._socket,
            host: this.host
          },
          this.options.tls || {}
        );
        if (this.servername && !opts.servername) {
          opts.servername = this.servername;
        }
        const removePlainSocketListeners = () => {
          socketPlain.removeListener("close", this._onSocketClose);
          socketPlain.removeListener("end", this._onSocketEnd);
          socketPlain.removeListener("error", this._onSocketError);
          socketPlain.removeListener("error", this._onConnectionSocketError);
        };
        this.upgrading = true;
        try {
          this._socket = tls.connect(opts, () => {
            this.secure = true;
            this.upgrading = false;
            this._socket.on("data", this._onSocketData);
            removePlainSocketListeners();
            return callback(null, true);
          });
        } catch (err2) {
          removePlainSocketListeners();
          return callback(err2);
        }
        this._socket.on("error", this._onSocketError);
        this._socket.once("close", this._onSocketClose);
        this._socket.once("end", this._onSocketEnd);
        this._socket.setTimeout(this.options.socketTimeout || SOCKET_TIMEOUT);
        this._socket.on("timeout", this._onSocketTimeout);
        socketPlain.resume();
      }
      /**
       * Processes queued responses from the server
       */
      _processResponse() {
        if (!this._responseQueue.length) {
          return false;
        }
        const raw = (this._responseQueue.shift() || "").toString();
        if (!raw.trim()) {
          setImmediate(() => this._processResponse());
          return;
        }
        let str = this.lastServerResponse = decodeServerResponse(raw);
        if (/^\d+-/.test(str.split("\n").pop())) {
          this._responseQueue.unshift(raw);
          return;
        }
        if (this.options.debug || this.options.transactionLog) {
          this.logger.debug(
            {
              tnx: "server"
            },
            str.replace(/\r?\n$/, "")
          );
        }
        const action = this._responseActions.shift();
        if (typeof action === "function") {
          action.call(this, str);
          setImmediate(() => this._processResponse());
        } else {
          return this._onError(new Error("Unexpected Response"), "EPROTOCOL", str, "CONN");
        }
      }
      /**
       * Send a command to the server, append \r\n
       *
       * @param {String} str String to be sent to the server
       * @param {String} logStr Optional string to be used for logging instead of the actual string
       */
      _sendCommand(str, logStr) {
        if (this._destroyed) {
          return;
        }
        if (this._socket.destroyed) {
          return this.close();
        }
        if (this.options.debug || this.options.transactionLog) {
          this.logger.debug(
            {
              tnx: "client"
            },
            (logStr || str || "").toString().replace(/\r?\n$/, "")
          );
        }
        this._socket.write(Buffer.from(str + "\r\n", "utf-8"));
      }
      /**
       * Initiates a new message by submitting envelope data, starting with
       * MAIL FROM: command
       *
       * @param {Object} envelope Envelope object in the form of
       *        {from:'...', to:['...']}
       *        or
       *        {from:{address:'...',name:'...'}, to:[address:'...',name:'...']}
       */
      _setEnvelope(envelope, callback) {
        const args = [];
        let useSmtpUtf8 = false;
        this._envelope = envelope || {};
        this._envelope.from = (this._envelope.from && this._envelope.from.address || this._envelope.from || "").toString().trim();
        this._envelope.to = [].concat(this._envelope.to || []).map((to) => (to && to.address || to || "").toString().trim());
        if (!this._envelope.to.length) {
          return callback(this._formatError("No recipients defined", "EENVELOPE", false, "API"));
        }
        if (this._envelope.from && /[\r\n<>]/.test(this._envelope.from)) {
          return callback(this._formatError("Invalid sender " + JSON.stringify(this._envelope.from), "EENVELOPE", false, "API"));
        }
        if (/[\x80-\uFFFF]/.test(this._envelope.from)) {
          useSmtpUtf8 = true;
        }
        for (let i = 0, len = this._envelope.to.length; i < len; i++) {
          if (!this._envelope.to[i] || /[\r\n<>]/.test(this._envelope.to[i])) {
            return callback(this._formatError("Invalid recipient " + JSON.stringify(this._envelope.to[i]), "EENVELOPE", false, "API"));
          }
          if (/[\x80-\uFFFF]/.test(this._envelope.to[i])) {
            useSmtpUtf8 = true;
          }
        }
        this._envelope.rcptQueue = [].concat(this._envelope.to || []);
        this._envelope.rejected = [];
        this._envelope.rejectedErrors = [];
        this._envelope.accepted = [];
        if (this._envelope.dsn) {
          try {
            this._envelope.dsn = this._setDsnEnvelope(this._envelope.dsn);
          } catch (err2) {
            return callback(this._formatError("Invalid DSN " + err2.message, "EENVELOPE", false, "API"));
          }
        }
        if (this._envelope.requireTLSExtensionEnabled) {
          if (!this.secure) {
            return callback(
              this._formatError("REQUIRETLS can only be used over TLS connections (RFC 8689)", "EREQUIRETLS", false, "MAIL FROM")
            );
          }
          if (!this._supportedExtensions.includes("REQUIRETLS")) {
            return callback(
              this._formatError("Server does not support REQUIRETLS extension (RFC 8689)", "EREQUIRETLS", false, "MAIL FROM")
            );
          }
        }
        this._responseActions.push((str) => {
          this._actionMAIL(str, callback);
        });
        if (useSmtpUtf8 && this._supportedExtensions.includes("SMTPUTF8")) {
          args.push("SMTPUTF8");
          this._usingSmtpUtf8 = true;
        }
        if (this._envelope.use8BitMime && this._supportedExtensions.includes("8BITMIME")) {
          args.push("BODY=8BITMIME");
          this._using8BitMime = true;
        }
        if (this._envelope.size && this._supportedExtensions.includes("SIZE")) {
          const sizeValue = Number(this._envelope.size) || 0;
          if (sizeValue > 0) {
            args.push("SIZE=" + sizeValue);
          }
        }
        if (this._envelope.dsn && this._supportedExtensions.includes("DSN")) {
          if (this._envelope.dsn.ret) {
            args.push("RET=" + shared.encodeXText(this._envelope.dsn.ret));
          }
          if (this._envelope.dsn.envid) {
            args.push("ENVID=" + shared.encodeXText(this._envelope.dsn.envid));
          }
        }
        if (this._envelope.requireTLSExtensionEnabled) {
          args.push("REQUIRETLS");
        }
        this._sendCommand("MAIL FROM:<" + this._envelope.from + ">" + (args.length ? " " + args.join(" ") : ""));
      }
      _setDsnEnvelope(params) {
        let ret = (params.ret || params.return || "").toString().toUpperCase() || null;
        if (ret) {
          switch (ret) {
            case "HDRS":
            case "HEADERS":
              ret = "HDRS";
              break;
            case "FULL":
            case "BODY":
              ret = "FULL";
              break;
          }
        }
        if (ret && !["FULL", "HDRS"].includes(ret)) {
          throw new Error("ret: " + JSON.stringify(ret));
        }
        const envid = (params.envid || params.id || "").toString() || null;
        let notify2 = params.notify || null;
        if (notify2) {
          if (typeof notify2 === "string") {
            notify2 = notify2.split(",");
          }
          notify2 = notify2.map((n) => n.trim().toUpperCase());
          const validNotify = ["NEVER", "SUCCESS", "FAILURE", "DELAY"];
          const invalidNotify = notify2.filter((n) => !validNotify.includes(n));
          if (invalidNotify.length || notify2.length > 1 && notify2.includes("NEVER")) {
            throw new Error("notify: " + JSON.stringify(notify2.join(",")));
          }
          notify2 = notify2.join(",");
        }
        let orcpt = (params.recipient || params.orcpt || "").toString() || null;
        if (orcpt && orcpt.indexOf(";") < 0) {
          orcpt = "rfc822;" + orcpt;
        }
        return {
          ret,
          envid,
          notify: notify2,
          orcpt
        };
      }
      _getDsnRcptToArgs() {
        const args = [];
        if (this._envelope.dsn && this._supportedExtensions.includes("DSN")) {
          if (this._envelope.dsn.notify) {
            args.push("NOTIFY=" + shared.encodeXText(this._envelope.dsn.notify));
          }
          if (this._envelope.dsn.orcpt) {
            args.push("ORCPT=" + shared.encodeXText(this._envelope.dsn.orcpt));
          }
        }
        return args.length ? " " + args.join(" ") : "";
      }
      _createSendStream(callback) {
        const dataStream = new DataStream();
        if (this.options.lmtp) {
          this._envelope.accepted.forEach((recipient, i) => {
            const final = i === this._envelope.accepted.length - 1;
            this._responseActions.push((str) => {
              this._actionLMTPStream(recipient, final, str, callback);
            });
          });
        } else {
          this._responseActions.push((str) => {
            this._actionSMTPStream(str, callback);
          });
        }
        this._currentDataStream = dataStream;
        dataStream.pipe(this._socket, {
          end: false
        });
        if (this.options.debug) {
          const logStream = new PassThrough();
          logStream.on("readable", () => {
            let chunk;
            while (chunk = logStream.read()) {
              this.logger.debug(
                {
                  tnx: "message"
                },
                chunk.toString("binary").replace(/\r?\n$/, "")
              );
            }
          });
          dataStream.pipe(logStream);
        }
        dataStream.once("end", () => {
          if (this._currentDataStream === dataStream) {
            this._currentDataStream = false;
          }
          this.logger.info(
            {
              tnx: "message",
              inByteCount: dataStream.inByteCount,
              outByteCount: dataStream.outByteCount
            },
            "<%s bytes encoded mime message (source size %s bytes)>",
            dataStream.outByteCount,
            dataStream.inByteCount
          );
        });
        return dataStream;
      }
      /** ACTIONS **/
      /**
       * Will be run after the connection is created and the server sends
       * a greeting. If the incoming message starts with 220 initiate
       * SMTP session by sending EHLO command
       *
       * @param {String} str Message from the server
       */
      _actionGreeting(str) {
        clearTimeout(this._greetingTimeout);
        if (str.substr(0, 3) !== "220") {
          this._onError(new Error("Invalid greeting. response=" + str), "EPROTOCOL", str, "CONN");
          return;
        }
        if (this.options.lmtp) {
          this._responseActions.push(this._actionLHLO);
          this._sendCommand("LHLO " + this.name);
        } else {
          this._responseActions.push(this._actionEHLO);
          this._sendCommand("EHLO " + this.name);
        }
      }
      /**
       * Handles server response for LHLO command. If it yielded in
       * error, emit 'error', otherwise treat this as an EHLO response
       *
       * @param {String} str Message from the server
       */
      _actionLHLO(str) {
        if (str.charAt(0) !== "2") {
          this._onError(new Error("Invalid LHLO. response=" + str), "EPROTOCOL", str, "LHLO");
          return;
        }
        this._actionEHLO(str);
      }
      /**
       * Handles server response for EHLO command. If it yielded in
       * error, try HELO instead, otherwise initiate TLS negotiation
       * if STARTTLS is supported by the server or move into the
       * authentication phase.
       *
       * @param {String} str Message from the server
       */
      _actionEHLO(str) {
        let match;
        if (str.substr(0, 3) === "421") {
          this._onError(new Error("Server terminates connection. response=" + str), "ECONNECTION", str, "EHLO");
          return;
        }
        if (str.charAt(0) !== "2") {
          if (this.options.requireTLS) {
            this._onError(
              new Error("EHLO failed but HELO does not support required STARTTLS. response=" + str),
              "ECONNECTION",
              str,
              "EHLO"
            );
            return;
          }
          this._responseActions.push(this._actionHELO);
          this._sendCommand("HELO " + this.name);
          return;
        }
        this._ehloLines = str.split(/\r?\n/).map((line) => line.replace(/^\d+[ -]/, "").trim()).filter((line) => line).slice(1);
        if (!this.secure && !this.options.ignoreTLS && (/[ -]STARTTLS\b/im.test(str) || this.options.requireTLS)) {
          this._sendCommand("STARTTLS");
          this._responseActions.push(this._actionSTARTTLS);
          return;
        }
        if (/[ -]SMTPUTF8\b/im.test(str)) {
          this._supportedExtensions.push("SMTPUTF8");
        }
        if (/[ -]DSN\b/im.test(str)) {
          this._supportedExtensions.push("DSN");
        }
        if (/[ -]8BITMIME\b/im.test(str)) {
          this._supportedExtensions.push("8BITMIME");
        }
        if (/[ -]REQUIRETLS\b/im.test(str)) {
          this._supportedExtensions.push("REQUIRETLS");
        }
        if (/[ -]PIPELINING\b/im.test(str)) {
          this._supportedExtensions.push("PIPELINING");
        }
        if (/[ -]AUTH\b/i.test(str)) {
          this.allowsAuth = true;
        }
        if (/[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)PLAIN/i.test(str)) {
          this._supportedAuth.push("PLAIN");
        }
        if (/[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)LOGIN/i.test(str)) {
          this._supportedAuth.push("LOGIN");
        }
        if (/[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)CRAM-MD5/i.test(str)) {
          this._supportedAuth.push("CRAM-MD5");
        }
        if (/[ -]AUTH(?:(\s+|=)[^\n]*\s+|\s+|=)XOAUTH2/i.test(str)) {
          this._supportedAuth.push("XOAUTH2");
        }
        if (match = str.match(/[ -]SIZE(?:[ \t]+(\d+))?/im)) {
          this._supportedExtensions.push("SIZE");
          this._maxAllowedSize = Number(match[1]) || 0;
        }
        this.emit("connect");
      }
      /**
       * Handles server response for HELO command. If it yielded in
       * error, emit 'error', otherwise move into the authentication phase.
       *
       * @param {String} str Message from the server
       */
      _actionHELO(str) {
        if (str.charAt(0) !== "2") {
          this._onError(new Error("Invalid HELO. response=" + str), "EPROTOCOL", str, "HELO");
          return;
        }
        this.allowsAuth = true;
        this.emit("connect");
      }
      /**
       * Handles server response for STARTTLS command. If there's an error
       * try HELO instead, otherwise initiate TLS upgrade. If the upgrade
       * succeedes restart the EHLO
       *
       * @param {String} str Message from the server
       */
      _actionSTARTTLS(str) {
        if (str.charAt(0) !== "2") {
          if (this.options.opportunisticTLS) {
            this.logger.info(
              {
                tnx: "smtp"
              },
              "Failed STARTTLS upgrade, continuing unencrypted"
            );
            return this.emit("connect");
          }
          this._onError(new Error("Error upgrading connection with STARTTLS"), "ETLS", str, "STARTTLS");
          return;
        }
        this._upgradeConnection((err2, secured) => {
          if (err2) {
            this._onError(new Error("Error initiating TLS - " + (err2.message || err2)), "ETLS", false, "STARTTLS");
            return;
          }
          this.logger.info(
            {
              tnx: "smtp"
            },
            "Connection upgraded with STARTTLS"
          );
          if (secured) {
            if (this.options.lmtp) {
              this._responseActions.push(this._actionLHLO);
              this._sendCommand("LHLO " + this.name);
            } else {
              this._responseActions.push(this._actionEHLO);
              this._sendCommand("EHLO " + this.name);
            }
          } else {
            this.emit("connect");
          }
        });
      }
      /**
       * Handle the response for AUTH LOGIN command. We are expecting
       * '334 VXNlcm5hbWU6' (base64 for 'Username:'). Data to be sent as
       * response needs to be base64 encoded username. We do not need
       * exact match but settle with 334 response in general as some
       * hosts invalidly use a longer message than VXNlcm5hbWU6
       *
       * @param {String} str Message from the server
       */
      _actionAUTH_LOGIN_USER(str, callback) {
        if (!/^334[ -]/.test(str)) {
          callback(this._formatError('Invalid login sequence while waiting for "334 VXNlcm5hbWU6"', "EAUTH", str, "AUTH LOGIN"));
          return;
        }
        this._responseActions.push((str2) => {
          this._actionAUTH_LOGIN_PASS(str2, callback);
        });
        this._sendCommand(Buffer.from(this._auth.credentials.user + "", "utf-8").toString("base64"));
      }
      /**
       * Handle the response for AUTH CRAM-MD5 command. We are expecting
       * '334 <challenge string>'. Data to be sent as response needs to be
       * base64 decoded challenge string, MD5 hashed using the password as
       * a HMAC key, prefixed by the username and a space, and finally all
       * base64 encoded again.
       *
       * @param {String} str Message from the server
       */
      _actionAUTH_CRAM_MD5(str, callback) {
        const challengeMatch = str.match(/^334\s+(.+)$/);
        if (!challengeMatch) {
          return callback(
            this._formatError("Invalid login sequence while waiting for server challenge string", "EAUTH", str, "AUTH CRAM-MD5")
          );
        }
        const base64decoded = Buffer.from(challengeMatch[1], "base64").toString("ascii");
        const hmacMD5 = crypto.createHmac("md5", this._auth.credentials.pass);
        hmacMD5.update(base64decoded);
        const prepended = this._auth.credentials.user + " " + hmacMD5.digest("hex");
        this._responseActions.push((str2) => {
          this._actionAUTH_CRAM_MD5_PASS(str2, callback);
        });
        this._sendCommand(
          Buffer.from(prepended).toString("base64"),
          // hidden hash for logs
          Buffer.from(this._auth.credentials.user + " /* secret */").toString("base64")
        );
      }
      /**
       * Handles the response to CRAM-MD5 authentication, if there's no error,
       * the user can be considered logged in. Start waiting for a message to send
       *
       * @param {String} str Message from the server
       */
      _actionAUTH_CRAM_MD5_PASS(str, callback) {
        if (!str.match(/^235\s+/)) {
          return callback(this._formatError('Invalid login sequence while waiting for "235"', "EAUTH", str, "AUTH CRAM-MD5"));
        }
        this.logger.info(
          {
            tnx: "smtp",
            username: this._auth.user,
            action: "authenticated",
            method: this._authMethod
          },
          "User %s authenticated",
          JSON.stringify(this._auth.user)
        );
        this.authenticated = true;
        callback(null, true);
      }
      /**
       * Handle the response for AUTH LOGIN command. We are expecting
       * '334 UGFzc3dvcmQ6' (base64 for 'Password:'). Data to be sent as
       * response needs to be base64 encoded password.
       *
       * @param {String} str Message from the server
       */
      _actionAUTH_LOGIN_PASS(str, callback) {
        if (!/^334[ -]/.test(str)) {
          return callback(this._formatError('Invalid login sequence while waiting for "334 UGFzc3dvcmQ6"', "EAUTH", str, "AUTH LOGIN"));
        }
        this._responseActions.push((str2) => {
          this._actionAUTHComplete(str2, callback);
        });
        this._sendCommand(
          Buffer.from((this._auth.credentials.pass || "").toString(), "utf-8").toString("base64"),
          // Hidden pass for logs
          Buffer.from("/* secret */", "utf-8").toString("base64")
        );
      }
      /**
       * Handles the response for authentication, if there's no error,
       * the user can be considered logged in. Start waiting for a message to send
       *
       * @param {String} str Message from the server
       */
      _actionAUTHComplete(str, isRetry, callback) {
        if (!callback && typeof isRetry === "function") {
          callback = isRetry;
          isRetry = false;
        }
        if (str.substr(0, 3) === "334") {
          this._responseActions.push((str2) => {
            if (isRetry || this._authMethod !== "XOAUTH2") {
              this._actionAUTHComplete(str2, true, callback);
            } else {
              setImmediate(() => this._handleXOauth2Token(true, callback));
            }
          });
          this._sendCommand("");
          return;
        }
        if (str.charAt(0) !== "2") {
          this.logger.info(
            {
              tnx: "smtp",
              username: this._auth.user,
              action: "authfail",
              method: this._authMethod
            },
            "User %s failed to authenticate",
            JSON.stringify(this._auth.user)
          );
          return callback(this._formatError("Invalid login", "EAUTH", str, "AUTH " + this._authMethod));
        }
        this.logger.info(
          {
            tnx: "smtp",
            username: this._auth.user,
            action: "authenticated",
            method: this._authMethod
          },
          "User %s authenticated",
          JSON.stringify(this._auth.user)
        );
        this.authenticated = true;
        callback(null, true);
      }
      /**
       * Handle response for a MAIL FROM: command
       *
       * @param {String} str Message from the server
       */
      _actionMAIL(str, callback) {
        if (Number(str.charAt(0)) !== 2) {
          const message = this._usingSmtpUtf8 && /^550 /.test(str) && /[\x80-\uFFFF]/.test(this._envelope.from) ? "Internationalized mailbox name not allowed" : "Mail command failed";
          return callback(this._formatError(message, "EENVELOPE", str, "MAIL FROM"));
        }
        if (!this._envelope.rcptQueue.length) {
          return callback(this._formatError("Can't send mail - no recipients defined", "EENVELOPE", false, "API"));
        }
        this._recipientQueue = [];
        const usePipelining = this._supportedExtensions.includes("PIPELINING");
        do {
          const curRecipient = this._envelope.rcptQueue.shift();
          this._recipientQueue.push(curRecipient);
          this._responseActions.push((str2) => {
            this._actionRCPT(str2, callback);
          });
          this._sendCommand("RCPT TO:<" + curRecipient + ">" + this._getDsnRcptToArgs());
        } while (usePipelining && this._envelope.rcptQueue.length);
      }
      /**
       * Handle response for a RCPT TO: command
       *
       * @param {String} str Message from the server
       */
      _actionRCPT(str, callback) {
        let err2;
        const curRecipient = this._recipientQueue.shift();
        if (Number(str.charAt(0)) !== 2) {
          const message = this._usingSmtpUtf8 && /^553 /.test(str) && /[\x80-\uFFFF]/.test(curRecipient) ? "Internationalized mailbox name not allowed" : "Recipient command failed";
          this._envelope.rejected.push(curRecipient);
          err2 = this._formatError(message, "EENVELOPE", str, "RCPT TO");
          err2.recipient = curRecipient;
          this._envelope.rejectedErrors.push(err2);
        } else {
          this._envelope.accepted.push(curRecipient);
        }
        if (!this._envelope.rcptQueue.length && !this._recipientQueue.length) {
          if (this._envelope.rejected.length < this._envelope.to.length) {
            this._responseActions.push((str2) => {
              this._actionDATA(str2, callback);
            });
            this._sendCommand("DATA");
          } else {
            err2 = this._formatError("Can't send mail - all recipients were rejected", "EENVELOPE", str, "RCPT TO");
            err2.rejected = this._envelope.rejected;
            err2.rejectedErrors = this._envelope.rejectedErrors;
            return callback(err2);
          }
        } else if (this._envelope.rcptQueue.length) {
          const nextRecipient = this._envelope.rcptQueue.shift();
          this._recipientQueue.push(nextRecipient);
          this._responseActions.push((str2) => {
            this._actionRCPT(str2, callback);
          });
          this._sendCommand("RCPT TO:<" + nextRecipient + ">" + this._getDsnRcptToArgs());
        }
      }
      /**
       * Handle response for a DATA command
       *
       * @param {String} str Message from the server
       */
      _actionDATA(str, callback) {
        if (!/^[23]/.test(str)) {
          return callback(this._formatError("Data command failed", "EENVELOPE", str, "DATA"));
        }
        const response = {
          accepted: this._envelope.accepted,
          rejected: this._envelope.rejected
        };
        if (this._ehloLines && this._ehloLines.length) {
          response.ehlo = this._ehloLines;
        }
        if (this._envelope.rejectedErrors.length) {
          response.rejectedErrors = this._envelope.rejectedErrors;
        }
        callback(null, response);
      }
      /**
       * Handle response for a DATA stream when using SMTP
       * We expect a single response that defines if the sending succeeded or failed
       *
       * @param {String} str Message from the server
       */
      _actionSMTPStream(str, callback) {
        if (Number(str.charAt(0)) !== 2) {
          return callback(this._formatError("Message failed", "EMESSAGE", str, "DATA"));
        }
        return callback(null, str);
      }
      /**
       * Handle response for a DATA stream
       * We expect a separate response for every recipient. All recipients can either
       * succeed or fail separately
       *
       * @param {String} recipient The recipient this response applies to
       * @param {Boolean} final Is this the final recipient?
       * @param {String} str Message from the server
       */
      _actionLMTPStream(recipient, final, str, callback) {
        let err2;
        if (Number(str.charAt(0)) !== 2) {
          err2 = this._formatError("Message failed for recipient " + recipient, "EMESSAGE", str, "DATA");
          err2.recipient = recipient;
          this._envelope.rejected.push(recipient);
          this._envelope.rejectedErrors.push(err2);
          for (let i = 0, len = this._envelope.accepted.length; i < len; i++) {
            if (this._envelope.accepted[i] === recipient) {
              this._envelope.accepted.splice(i, 1);
            }
          }
        }
        if (final) {
          return callback(null, str);
        }
      }
      _handleXOauth2Token(isRetry, callback) {
        this._auth.oauth2.getToken(isRetry, (err2, accessToken) => {
          if (err2) {
            this.logger.info(
              {
                tnx: "smtp",
                username: this._auth.user,
                action: "authfail",
                method: this._authMethod
              },
              "User %s failed to authenticate",
              JSON.stringify(this._auth.user)
            );
            return callback(this._formatError(err2, "EAUTH", false, "AUTH XOAUTH2"));
          }
          this._responseActions.push((str) => {
            this._actionAUTHComplete(str, isRetry, callback);
          });
          this._sendCommand(
            "AUTH XOAUTH2 " + this._auth.oauth2.buildXOAuth2Token(accessToken),
            //  Hidden for logs
            "AUTH XOAUTH2 " + this._auth.oauth2.buildXOAuth2Token("/* secret */")
          );
        });
      }
      /**
       *
       * @param {string} command
       * @private
       */
      _isDestroyedMessage(command) {
        if (this._destroyed) {
          return "Cannot " + command + " - smtp connection is already destroyed.";
        }
        if (this._socket) {
          if (this._socket.destroyed) {
            return "Cannot " + command + " - smtp connection socket is already destroyed.";
          }
          if (!this._socket.writable) {
            return "Cannot " + command + " - smtp connection socket is already half-closed.";
          }
        }
      }
      _getHostname() {
        let defaultHostname;
        try {
          defaultHostname = os.hostname() || "";
        } catch (_err) {
          defaultHostname = "localhost";
        }
        if (!defaultHostname || defaultHostname.indexOf(".") < 0) {
          defaultHostname = "[127.0.0.1]";
        }
        if (defaultHostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
          defaultHostname = "[" + defaultHostname + "]";
        }
        return defaultHostname;
      }
    };
    module.exports = SMTPConnection;
  }
});

// node_modules/nodemailer/lib/xoauth2/index.js
var require_xoauth2 = __commonJS({
  "node_modules/nodemailer/lib/xoauth2/index.js"(exports, module) {
    "use strict";
    var { Stream } = __require("stream");
    var nmfetch = require_fetch();
    var crypto = __require("crypto");
    var shared = require_shared();
    var errors = require_errors();
    var XOAuth2 = class extends Stream {
      constructor(options, logger) {
        super();
        this.options = options || {};
        if (options && options.serviceClient) {
          if (!options.privateKey || !options.user) {
            const err2 = new Error('Options "privateKey" and "user" are required for service account!');
            err2.code = errors.EOAUTH2;
            setImmediate(() => this.emit("error", err2));
            return;
          }
          const serviceRequestTimeout = Math.min(Math.max(Number(this.options.serviceRequestTimeout) || 0, 0), 3600);
          this.options.serviceRequestTimeout = serviceRequestTimeout || 5 * 60;
        }
        this.logger = shared.getLogger(
          {
            logger
          },
          {
            component: this.options.component || "OAuth2"
          }
        );
        this.provisionCallback = typeof this.options.provisionCallback === "function" ? this.options.provisionCallback : false;
        this.options.accessUrl = this.options.accessUrl || "https://accounts.google.com/o/oauth2/token";
        this.options.customHeaders = this.options.customHeaders || {};
        this.options.customParams = this.options.customParams || {};
        this.accessToken = this.options.accessToken || false;
        if (this.options.expires && Number(this.options.expires)) {
          this.expires = this.options.expires;
        } else {
          const timeout = Math.max(Number(this.options.timeout) || 0, 0);
          this.expires = timeout && Date.now() + timeout * 1e3 || 0;
        }
        this.renewing = false;
        this.renewalQueue = [];
      }
      /**
       * Returns or generates (if previous has expired) a XOAuth2 token
       *
       * @param {Boolean} renew If false then use cached access token (if available)
       * @param {Function} callback Callback function with error object and token string
       */
      getToken(renew, callback) {
        if (!renew && this.accessToken && (!this.expires || this.expires > Date.now())) {
          this.logger.debug(
            {
              tnx: "OAUTH2",
              user: this.options.user,
              action: "reuse"
            },
            "Reusing existing access token for %s",
            this.options.user
          );
          return callback(null, this.accessToken);
        }
        if (!this.provisionCallback && !this.options.refreshToken && !this.options.serviceClient) {
          if (this.accessToken) {
            this.logger.debug(
              {
                tnx: "OAUTH2",
                user: this.options.user,
                action: "reuse"
              },
              "Reusing existing access token (no refresh capability) for %s",
              this.options.user
            );
            return callback(null, this.accessToken);
          }
          this.logger.error(
            {
              tnx: "OAUTH2",
              user: this.options.user,
              action: "renew"
            },
            "Cannot renew access token for %s: No refresh mechanism available",
            this.options.user
          );
          const err2 = new Error("Can't create new access token for user");
          err2.code = errors.EOAUTH2;
          return callback(err2);
        }
        if (this.renewing) {
          return this.renewalQueue.push({ renew, callback });
        }
        this.renewing = true;
        const generateCallback = (err2, accessToken) => {
          this.renewalQueue.forEach((item) => item.callback(err2, accessToken));
          this.renewalQueue = [];
          this.renewing = false;
          if (err2) {
            this.logger.error(
              {
                err: err2,
                tnx: "OAUTH2",
                user: this.options.user,
                action: "renew"
              },
              "Failed generating new Access Token for %s",
              this.options.user
            );
          } else {
            this.logger.info(
              {
                tnx: "OAUTH2",
                user: this.options.user,
                action: "renew"
              },
              "Generated new Access Token for %s",
              this.options.user
            );
          }
          callback(err2, accessToken);
        };
        if (this.provisionCallback) {
          this.provisionCallback(this.options.user, !!renew, (err2, accessToken, expires) => {
            if (!err2 && accessToken) {
              this.accessToken = accessToken;
              this.expires = expires || 0;
            }
            generateCallback(err2, accessToken);
          });
        } else {
          this.generateToken(generateCallback);
        }
      }
      /**
       * Updates token values
       *
       * @param {String} accessToken New access token
       * @param {Number} timeout Access token lifetime in seconds
       *
       * Emits 'token': { user: User email-address, accessToken: the new accessToken, timeout: TTL in seconds}
       */
      updateToken(accessToken, timeout) {
        this.accessToken = accessToken;
        timeout = Math.max(Number(timeout) || 0, 0);
        this.expires = timeout && Date.now() + timeout * 1e3 || 0;
        this.emit("token", {
          user: this.options.user,
          accessToken: accessToken || "",
          expires: this.expires
        });
      }
      /**
       * Generates a new XOAuth2 token with the credentials provided at initialization
       *
       * @param {Function} callback Callback function with error object and token string
       */
      generateToken(callback) {
        let urlOptions;
        let loggedUrlOptions;
        if (this.options.serviceClient) {
          const iat = Math.floor(Date.now() / 1e3);
          const tokenData = {
            iss: this.options.serviceClient,
            scope: this.options.scope || "https://mail.google.com/",
            sub: this.options.user,
            aud: this.options.accessUrl,
            iat,
            exp: iat + this.options.serviceRequestTimeout
          };
          let token;
          try {
            token = this.jwtSignRS256(tokenData);
          } catch (_err) {
            const err2 = new Error("Can't generate token. Check your auth options");
            err2.code = errors.EOAUTH2;
            return callback(err2);
          }
          urlOptions = {
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: token
          };
          loggedUrlOptions = {
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: tokenData
          };
        } else {
          if (!this.options.refreshToken) {
            const err2 = new Error("Can't create new access token for user");
            err2.code = errors.EOAUTH2;
            return callback(err2);
          }
          urlOptions = {
            client_id: this.options.clientId || "",
            client_secret: this.options.clientSecret || "",
            refresh_token: this.options.refreshToken,
            grant_type: "refresh_token"
          };
          loggedUrlOptions = {
            client_id: this.options.clientId || "",
            client_secret: (this.options.clientSecret || "").substr(0, 6) + "...",
            refresh_token: (this.options.refreshToken || "").substr(0, 6) + "...",
            grant_type: "refresh_token"
          };
        }
        Object.assign(urlOptions, this.options.customParams);
        Object.assign(loggedUrlOptions, this.options.customParams);
        this.logger.debug(
          {
            tnx: "OAUTH2",
            user: this.options.user,
            action: "generate"
          },
          "Requesting token using: %s",
          JSON.stringify(loggedUrlOptions)
        );
        this.postRequest(this.options.accessUrl, urlOptions, this.options, (error, body) => {
          let data;
          if (error) {
            return callback(error);
          }
          try {
            data = JSON.parse(body.toString());
          } catch (E) {
            return callback(E);
          }
          if (!data || typeof data !== "object") {
            this.logger.debug(
              {
                tnx: "OAUTH2",
                user: this.options.user,
                action: "post"
              },
              "Response: %s",
              (body || "").toString()
            );
            const err3 = new Error("Invalid authentication response");
            err3.code = errors.EOAUTH2;
            return callback(err3);
          }
          const logData = Object.assign({}, data);
          if (logData.access_token) {
            logData.access_token = (logData.access_token || "").toString().substr(0, 6) + "...";
          }
          this.logger.debug(
            {
              tnx: "OAUTH2",
              user: this.options.user,
              action: "post"
            },
            "Response: %s",
            JSON.stringify(logData)
          );
          if (data.error) {
            let errorMessage = data.error;
            if (data.error_description) {
              errorMessage += ": " + data.error_description;
            }
            if (data.error_uri) {
              errorMessage += " (" + data.error_uri + ")";
            }
            const err3 = new Error(errorMessage);
            err3.code = errors.EOAUTH2;
            return callback(err3);
          }
          if (data.access_token) {
            this.updateToken(data.access_token, data.expires_in);
            return callback(null, this.accessToken);
          }
          const err2 = new Error("No access token");
          err2.code = errors.EOAUTH2;
          return callback(err2);
        });
      }
      /**
       * Converts an access_token and user id into a base64 encoded XOAuth2 token
       *
       * @param {String} [accessToken] Access token string
       * @return {String} Base64 encoded token for IMAP or SMTP login
       */
      buildXOAuth2Token(accessToken) {
        const authData = ["user=" + (this.options.user || ""), "auth=Bearer " + (accessToken || this.accessToken), "", ""];
        return Buffer.from(authData.join(""), "utf-8").toString("base64");
      }
      /**
       * Custom POST request handler.
       * This is only needed to keep paths short in Windows – usually this module
       * is a dependency of a dependency and if it tries to require something
       * like the request module the paths get way too long to handle for Windows.
       * As we do only a simple POST request we do not actually require complicated
       * logic support (no redirects, no nothing) anyway.
       *
       * @param {String} url Url to POST to
       * @param {String|Buffer} payload Payload to POST
       * @param {Function} callback Callback function with (err, buff)
       */
      postRequest(url, payload, params, callback) {
        let returned = false;
        const chunks = [];
        let chunklen = 0;
        const fetchOptions = {
          method: "post",
          headers: params.customHeaders,
          body: payload,
          allowErrorResponse: true
        };
        if (/^https:/i.test(url)) {
          fetchOptions.tls = Object.assign({ rejectUnauthorized: true }, params.tls || {});
        }
        const req = nmfetch(url, fetchOptions);
        req.on("readable", () => {
          let chunk;
          while ((chunk = req.read()) !== null) {
            chunks.push(chunk);
            chunklen += chunk.length;
          }
        });
        req.once("error", (err2) => {
          if (returned) {
            return;
          }
          returned = true;
          return callback(err2);
        });
        req.once("end", () => {
          if (returned) {
            return;
          }
          returned = true;
          return callback(null, Buffer.concat(chunks, chunklen));
        });
      }
      /**
       * Encodes a buffer or a string into Base64url format
       *
       * @param {Buffer|String} data The data to convert
       * @return {String} The encoded string
       */
      toBase64URL(data) {
        if (typeof data === "string") {
          data = Buffer.from(data);
        }
        return data.toString("base64").replace(/[=]+/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      /**
       * Creates a JSON Web Token signed with RS256 (SHA256 + RSA)
       *
       * @param {Object} payload The payload to include in the generated token
       * @return {String} The generated and signed token
       */
      jwtSignRS256(payload) {
        payload = ['{"alg":"RS256","typ":"JWT"}', JSON.stringify(payload)].map((val) => this.toBase64URL(val)).join(".");
        const signature = crypto.createSign("RSA-SHA256").update(payload).sign(this.options.privateKey);
        return payload + "." + this.toBase64URL(signature);
      }
    };
    module.exports = XOAuth2;
  }
});

// node_modules/nodemailer/lib/smtp-pool/pool-resource.js
var require_pool_resource = __commonJS({
  "node_modules/nodemailer/lib/smtp-pool/pool-resource.js"(exports, module) {
    "use strict";
    var SMTPConnection = require_smtp_connection();
    var assign = require_shared().assign;
    var XOAuth2 = require_xoauth2();
    var errors = require_errors();
    var EventEmitter = __require("events");
    var PoolResource = class extends EventEmitter {
      constructor(pool) {
        super();
        this.pool = pool;
        this.options = pool.options;
        this.logger = this.pool.logger;
        if (this.options.auth) {
          switch ((this.options.auth.type || "").toString().toUpperCase()) {
            case "OAUTH2": {
              const oauth2 = new XOAuth2(this.options.auth, this.logger);
              oauth2.provisionCallback = this.pool.mailer && this.pool.mailer.get("oauth2_provision_cb") || oauth2.provisionCallback;
              this.auth = {
                type: "OAUTH2",
                user: this.options.auth.user,
                oauth2,
                method: "XOAUTH2"
              };
              oauth2.on("token", (token) => this.pool.mailer.emit("token", token));
              oauth2.on("error", (err2) => this.emit("error", err2));
              break;
            }
            default:
              if (!this.options.auth.user && !this.options.auth.pass) {
                break;
              }
              this.auth = {
                type: (this.options.auth.type || "").toString().toUpperCase() || "LOGIN",
                user: this.options.auth.user,
                credentials: {
                  user: this.options.auth.user || "",
                  pass: this.options.auth.pass,
                  options: this.options.auth.options
                },
                method: (this.options.auth.method || "").trim().toUpperCase() || this.options.authMethod || false
              };
          }
        }
        this._connection = false;
        this._connected = false;
        this.messages = 0;
        this.available = true;
      }
      /**
       * Initiates a connection to the SMTP server
       *
       * @param {Function} callback Callback function to run once the connection is established or failed
       */
      connect(callback) {
        this.pool.getSocket(this.options, (err2, socketOptions) => {
          if (err2) {
            return callback(err2);
          }
          let returned = false;
          let options = this.options;
          if (socketOptions && socketOptions.connection) {
            this.logger.info(
              {
                tnx: "proxy",
                remoteAddress: socketOptions.connection.remoteAddress,
                remotePort: socketOptions.connection.remotePort,
                destHost: options.host || "",
                destPort: options.port || "",
                action: "connected"
              },
              "Using proxied socket from %s:%s to %s:%s",
              socketOptions.connection.remoteAddress,
              socketOptions.connection.remotePort,
              options.host || "",
              options.port || ""
            );
            options = Object.assign(assign(false, options), socketOptions);
          }
          this.connection = new SMTPConnection(options);
          this.connection.once("error", (err3) => {
            this.emit("error", err3);
            if (returned) {
              return;
            }
            returned = true;
            return callback(err3);
          });
          this.connection.once("end", () => {
            this.close();
            if (returned) {
              return;
            }
            returned = true;
            const timer = setTimeout(() => {
              if (returned) {
                return;
              }
              const err3 = new Error("Unexpected socket close");
              if (this.connection && this.connection._socket && this.connection._socket.upgrading) {
                err3.code = errors.ETLS;
              }
              callback(err3);
            }, 1e3);
            try {
              timer.unref();
            } catch (_E) {
            }
          });
          this.connection.connect(() => {
            if (returned) {
              return;
            }
            if (this.auth && (this.connection.allowsAuth || options.forceAuth)) {
              this.connection.login(this.auth, (err3) => {
                if (returned) {
                  return;
                }
                returned = true;
                if (err3) {
                  this.connection.close();
                  this.emit("error", err3);
                  return callback(err3);
                }
                this._connected = true;
                callback(null, true);
              });
            } else {
              returned = true;
              this._connected = true;
              return callback(null, true);
            }
          });
        });
      }
      /**
       * Sends an e-mail to be sent using the selected settings
       *
       * @param {Object} mail Mail object
       * @param {Function} callback Callback function
       */
      send(mail, callback) {
        if (!this._connected) {
          return this.connect((err2) => {
            if (err2) {
              return callback(err2);
            }
            return this.send(mail, callback);
          });
        }
        const envelope = mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        const recipients = [].concat(envelope.to || []);
        if (recipients.length > 3) {
          recipients.push("...and " + recipients.splice(2).length + " more");
        }
        this.logger.info(
          {
            tnx: "send",
            messageId,
            cid: this.id
          },
          "Sending message %s using #%s to <%s>",
          messageId,
          this.id,
          recipients.join(", ")
        );
        if (mail.data.dsn) {
          envelope.dsn = mail.data.dsn;
        }
        if (mail.data.requireTLSExtensionEnabled) {
          envelope.requireTLSExtensionEnabled = mail.data.requireTLSExtensionEnabled;
        }
        this.connection.send(envelope, mail.message.createReadStream(), (err2, info) => {
          this.messages++;
          if (err2) {
            this.connection.close();
            this.emit("error", err2);
            return callback(err2);
          }
          info.envelope = {
            from: envelope.from,
            to: envelope.to
          };
          info.messageId = messageId;
          setImmediate(() => {
            if (this.messages >= this.options.maxMessages) {
              const err3 = new Error("Resource exhausted");
              err3.code = errors.EMAXLIMIT;
              this.connection.close();
              this.emit("error", err3);
            } else {
              this.pool._checkRateLimit(() => {
                this.available = true;
                this.emit("available");
              });
            }
          });
          callback(null, info);
        });
      }
      /**
       * Closes the connection
       */
      close() {
        this._connected = false;
        if (this.auth && this.auth.oauth2) {
          this.auth.oauth2.removeAllListeners();
        }
        if (this.connection) {
          this.connection.close();
        }
        this.emit("close");
      }
    };
    module.exports = PoolResource;
  }
});

// node_modules/nodemailer/lib/well-known/services.json
var require_services = __commonJS({
  "node_modules/nodemailer/lib/well-known/services.json"(exports, module) {
    module.exports = {
      "1und1": {
        description: "1&1 Mail (German hosting provider)",
        host: "smtp.1und1.de",
        port: 465,
        secure: true,
        authMethod: "LOGIN"
      },
      "126": {
        description: "126 Mail (NetEase)",
        host: "smtp.126.com",
        port: 465,
        secure: true
      },
      "163": {
        description: "163 Mail (NetEase)",
        host: "smtp.163.com",
        port: 465,
        secure: true
      },
      Aliyun: {
        description: "Alibaba Cloud Mail",
        domains: ["aliyun.com"],
        host: "smtp.aliyun.com",
        port: 465,
        secure: true
      },
      AliyunQiye: {
        description: "Alibaba Cloud Enterprise Mail",
        host: "smtp.qiye.aliyun.com",
        port: 465,
        secure: true
      },
      AOL: {
        description: "AOL Mail",
        domains: ["aol.com"],
        host: "smtp.aol.com",
        port: 587
      },
      Aruba: {
        description: "Aruba PEC (Italian email provider)",
        domains: ["aruba.it", "pec.aruba.it"],
        aliases: ["Aruba PEC"],
        host: "smtps.aruba.it",
        port: 465,
        secure: true,
        authMethod: "LOGIN"
      },
      Bluewin: {
        description: "Bluewin (Swiss email provider)",
        host: "smtpauths.bluewin.ch",
        domains: ["bluewin.ch"],
        port: 465
      },
      BOL: {
        description: "BOL Mail (Brazilian provider)",
        domains: ["bol.com.br"],
        host: "smtp.bol.com.br",
        port: 587,
        requireTLS: true
      },
      DebugMail: {
        description: "DebugMail (email testing service)",
        host: "debugmail.io",
        port: 25
      },
      Disroot: {
        description: "Disroot (privacy-focused provider)",
        domains: ["disroot.org"],
        host: "disroot.org",
        port: 587,
        secure: false,
        authMethod: "LOGIN"
      },
      DynectEmail: {
        description: "Dyn Email Delivery",
        aliases: ["Dynect"],
        host: "smtp.dynect.net",
        port: 25
      },
      ElasticEmail: {
        description: "Elastic Email",
        aliases: ["Elastic Email"],
        host: "smtp.elasticemail.com",
        port: 465,
        secure: true
      },
      Ethereal: {
        description: "Ethereal Email (email testing service)",
        aliases: ["ethereal.email"],
        host: "smtp.ethereal.email",
        port: 587
      },
      FastMail: {
        description: "FastMail",
        domains: ["fastmail.fm"],
        host: "smtp.fastmail.com",
        port: 465,
        secure: true
      },
      "Feishu Mail": {
        description: "Feishu Mail (Lark)",
        aliases: ["Feishu", "FeishuMail"],
        domains: ["www.feishu.cn"],
        host: "smtp.feishu.cn",
        port: 465,
        secure: true
      },
      "Forward Email": {
        description: "Forward Email (email forwarding service)",
        aliases: ["FE", "ForwardEmail"],
        domains: ["forwardemail.net"],
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true
      },
      GandiMail: {
        description: "Gandi Mail",
        aliases: ["Gandi", "Gandi Mail"],
        host: "mail.gandi.net",
        port: 587
      },
      Gmail: {
        description: "Gmail",
        aliases: ["Google Mail"],
        domains: ["gmail.com", "googlemail.com"],
        host: "smtp.gmail.com",
        port: 465,
        secure: true
      },
      GmailWorkspace: {
        description: "Gmail Workspace",
        aliases: ["Google Workspace Mail"],
        host: "smtp-relay.gmail.com",
        port: 465,
        secure: true
      },
      GMX: {
        description: "GMX Mail",
        domains: ["gmx.com", "gmx.net", "gmx.de"],
        host: "mail.gmx.com",
        port: 587
      },
      Godaddy: {
        description: "GoDaddy Email (US)",
        host: "smtpout.secureserver.net",
        port: 25
      },
      GodaddyAsia: {
        description: "GoDaddy Email (Asia)",
        host: "smtp.asia.secureserver.net",
        port: 25
      },
      GodaddyEurope: {
        description: "GoDaddy Email (Europe)",
        host: "smtp.europe.secureserver.net",
        port: 25
      },
      "hot.ee": {
        description: "Hot.ee (Estonian email provider)",
        host: "mail.hot.ee"
      },
      Hotmail: {
        description: "Outlook.com / Hotmail",
        aliases: ["Outlook", "Outlook.com", "Hotmail.com"],
        domains: ["hotmail.com", "outlook.com"],
        host: "smtp-mail.outlook.com",
        port: 587
      },
      iCloud: {
        description: "iCloud Mail",
        aliases: ["Me", "Mac"],
        domains: ["me.com", "mac.com"],
        host: "smtp.mail.me.com",
        port: 587
      },
      Infomaniak: {
        description: "Infomaniak Mail (Swiss hosting provider)",
        host: "mail.infomaniak.com",
        domains: ["ik.me", "ikmail.com", "etik.com"],
        port: 587
      },
      KolabNow: {
        description: "KolabNow (secure email service)",
        domains: ["kolabnow.com"],
        aliases: ["Kolab"],
        host: "smtp.kolabnow.com",
        port: 465,
        secure: true,
        authMethod: "LOGIN"
      },
      Loopia: {
        description: "Loopia (Swedish hosting provider)",
        host: "mailcluster.loopia.se",
        port: 465
      },
      Loops: {
        description: "Loops",
        host: "smtp.loops.so",
        port: 587
      },
      "mail.ee": {
        description: "Mail.ee (Estonian email provider)",
        host: "smtp.mail.ee"
      },
      "Mail.ru": {
        description: "Mail.ru",
        host: "smtp.mail.ru",
        port: 465,
        secure: true
      },
      "Mailcatch.app": {
        description: "Mailcatch (email testing service)",
        host: "sandbox-smtp.mailcatch.app",
        port: 2525
      },
      Maildev: {
        description: "MailDev (local email testing)",
        port: 1025,
        ignoreTLS: true
      },
      MailerSend: {
        description: "MailerSend",
        host: "smtp.mailersend.net",
        port: 587
      },
      Mailgun: {
        description: "Mailgun",
        host: "smtp.mailgun.org",
        port: 465,
        secure: true
      },
      Mailjet: {
        description: "Mailjet",
        host: "in.mailjet.com",
        port: 587
      },
      Mailosaur: {
        description: "Mailosaur (email testing service)",
        host: "mailosaur.io",
        port: 25
      },
      Mailtrap: {
        description: "Mailtrap",
        host: "live.smtp.mailtrap.io",
        port: 587
      },
      Mandrill: {
        description: "Mandrill (by Mailchimp)",
        host: "smtp.mandrillapp.com",
        port: 587
      },
      Naver: {
        description: "Naver Mail (Korean email provider)",
        host: "smtp.naver.com",
        port: 587
      },
      OhMySMTP: {
        description: "OhMySMTP (email delivery service)",
        host: "smtp.ohmysmtp.com",
        port: 587,
        secure: false
      },
      One: {
        description: "One.com Email",
        host: "send.one.com",
        port: 465,
        secure: true
      },
      OpenMailBox: {
        description: "OpenMailBox",
        aliases: ["OMB", "openmailbox.org"],
        host: "smtp.openmailbox.org",
        port: 465,
        secure: true
      },
      Outlook365: {
        description: "Microsoft 365 / Office 365",
        host: "smtp.office365.com",
        port: 587,
        secure: false
      },
      Postmark: {
        description: "Postmark",
        aliases: ["PostmarkApp"],
        host: "smtp.postmarkapp.com",
        port: 2525
      },
      Proton: {
        description: "Proton Mail",
        aliases: ["ProtonMail", "Proton.me", "Protonmail.com", "Protonmail.ch"],
        domains: ["proton.me", "protonmail.com", "pm.me", "protonmail.ch"],
        host: "smtp.protonmail.ch",
        port: 587,
        requireTLS: true
      },
      "qiye.aliyun": {
        description: "Alibaba Mail Enterprise Edition",
        host: "smtp.mxhichina.com",
        port: "465",
        secure: true
      },
      QQ: {
        description: "QQ Mail",
        domains: ["qq.com"],
        host: "smtp.qq.com",
        port: 465,
        secure: true
      },
      QQex: {
        description: "QQ Enterprise Mail",
        aliases: ["QQ Enterprise"],
        domains: ["exmail.qq.com"],
        host: "smtp.exmail.qq.com",
        port: 465,
        secure: true
      },
      Resend: {
        description: "Resend",
        host: "smtp.resend.com",
        port: 465,
        secure: true
      },
      Runbox: {
        description: "Runbox (Norwegian email provider)",
        domains: ["runbox.com"],
        host: "smtp.runbox.com",
        port: 465,
        secure: true
      },
      SendCloud: {
        description: "SendCloud (Chinese email delivery)",
        host: "smtp.sendcloud.net",
        port: 2525
      },
      SendGrid: {
        description: "SendGrid",
        host: "smtp.sendgrid.net",
        port: 587
      },
      SendinBlue: {
        description: "Brevo (formerly Sendinblue)",
        aliases: ["Brevo"],
        host: "smtp-relay.brevo.com",
        port: 587
      },
      SendPulse: {
        description: "SendPulse",
        host: "smtp-pulse.com",
        port: 465,
        secure: true
      },
      SES: {
        description: "AWS SES US East (N. Virginia)",
        host: "email-smtp.us-east-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-NORTHEAST-1": {
        description: "AWS SES Asia Pacific (Tokyo)",
        host: "email-smtp.ap-northeast-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-NORTHEAST-2": {
        description: "AWS SES Asia Pacific (Seoul)",
        host: "email-smtp.ap-northeast-2.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-NORTHEAST-3": {
        description: "AWS SES Asia Pacific (Osaka)",
        host: "email-smtp.ap-northeast-3.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-SOUTH-1": {
        description: "AWS SES Asia Pacific (Mumbai)",
        host: "email-smtp.ap-south-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-SOUTHEAST-1": {
        description: "AWS SES Asia Pacific (Singapore)",
        host: "email-smtp.ap-southeast-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-AP-SOUTHEAST-2": {
        description: "AWS SES Asia Pacific (Sydney)",
        host: "email-smtp.ap-southeast-2.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-CA-CENTRAL-1": {
        description: "AWS SES Canada (Central)",
        host: "email-smtp.ca-central-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-EU-CENTRAL-1": {
        description: "AWS SES Europe (Frankfurt)",
        host: "email-smtp.eu-central-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-EU-NORTH-1": {
        description: "AWS SES Europe (Stockholm)",
        host: "email-smtp.eu-north-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-EU-WEST-1": {
        description: "AWS SES Europe (Ireland)",
        host: "email-smtp.eu-west-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-EU-WEST-2": {
        description: "AWS SES Europe (London)",
        host: "email-smtp.eu-west-2.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-EU-WEST-3": {
        description: "AWS SES Europe (Paris)",
        host: "email-smtp.eu-west-3.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-SA-EAST-1": {
        description: "AWS SES South America (S\xE3o Paulo)",
        host: "email-smtp.sa-east-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-EAST-1": {
        description: "AWS SES US East (N. Virginia)",
        host: "email-smtp.us-east-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-EAST-2": {
        description: "AWS SES US East (Ohio)",
        host: "email-smtp.us-east-2.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-GOV-EAST-1": {
        description: "AWS SES GovCloud (US-East)",
        host: "email-smtp.us-gov-east-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-GOV-WEST-1": {
        description: "AWS SES GovCloud (US-West)",
        host: "email-smtp.us-gov-west-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-WEST-1": {
        description: "AWS SES US West (N. California)",
        host: "email-smtp.us-west-1.amazonaws.com",
        port: 465,
        secure: true
      },
      "SES-US-WEST-2": {
        description: "AWS SES US West (Oregon)",
        host: "email-smtp.us-west-2.amazonaws.com",
        port: 465,
        secure: true
      },
      Seznam: {
        description: "Seznam Email (Czech email provider)",
        aliases: ["Seznam Email"],
        domains: ["seznam.cz", "email.cz", "post.cz", "spoluzaci.cz"],
        host: "smtp.seznam.cz",
        port: 465,
        secure: true
      },
      SMTP2GO: {
        description: "SMTP2GO",
        host: "mail.smtp2go.com",
        port: 2525
      },
      Sparkpost: {
        description: "SparkPost",
        aliases: ["SparkPost", "SparkPost Mail"],
        domains: ["sparkpost.com"],
        host: "smtp.sparkpostmail.com",
        port: 587,
        secure: false
      },
      Tipimail: {
        description: "Tipimail (email delivery service)",
        host: "smtp.tipimail.com",
        port: 587
      },
      Tutanota: {
        description: "Tutanota (Tuta Mail)",
        domains: ["tutanota.com", "tuta.com", "tutanota.de", "tuta.io"],
        host: "smtp.tutanota.com",
        port: 465,
        secure: true
      },
      Yahoo: {
        description: "Yahoo Mail",
        domains: ["yahoo.com"],
        host: "smtp.mail.yahoo.com",
        port: 465,
        secure: true
      },
      Yandex: {
        description: "Yandex Mail",
        domains: ["yandex.ru"],
        host: "smtp.yandex.ru",
        port: 465,
        secure: true
      },
      Zimbra: {
        description: "Zimbra Mail Server",
        aliases: ["Zimbra Collaboration"],
        host: "smtp.zimbra.com",
        port: 587,
        requireTLS: true
      },
      Zoho: {
        description: "Zoho Mail",
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        authMethod: "LOGIN"
      }
    };
  }
});

// node_modules/nodemailer/lib/well-known/index.js
var require_well_known = __commonJS({
  "node_modules/nodemailer/lib/well-known/index.js"(exports, module) {
    "use strict";
    var services = require_services();
    var normalized = {};
    Object.keys(services).forEach((key) => {
      const service = services[key];
      const normalizedService = normalizeService(service);
      normalized[normalizeKey(key)] = normalizedService;
      [].concat(service.aliases || []).forEach((alias) => {
        normalized[normalizeKey(alias)] = normalizedService;
      });
      [].concat(service.domains || []).forEach((domain) => {
        normalized[normalizeKey(domain)] = normalizedService;
      });
    });
    function normalizeKey(key) {
      return key.replace(/[^a-zA-Z0-9.-]/g, "").toLowerCase();
    }
    function normalizeService(service) {
      const response = {};
      Object.keys(service).forEach((key) => {
        if (!["domains", "aliases"].includes(key)) {
          response[key] = service[key];
        }
      });
      return response;
    }
    module.exports = function(key) {
      key = normalizeKey(key.split("@").pop());
      return normalized[key] || false;
    };
  }
});

// node_modules/nodemailer/lib/smtp-pool/index.js
var require_smtp_pool = __commonJS({
  "node_modules/nodemailer/lib/smtp-pool/index.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var PoolResource = require_pool_resource();
    var SMTPConnection = require_smtp_connection();
    var wellKnown = require_well_known();
    var shared = require_shared();
    var errors = require_errors();
    var packageData = require_package();
    var SMTPPool = class extends EventEmitter {
      constructor(options) {
        super();
        options = options || {};
        if (typeof options === "string") {
          options = {
            url: options
          };
        }
        let urlData;
        let service = options.service;
        if (typeof options.getSocket === "function") {
          this.getSocket = options.getSocket;
        }
        if (options.url) {
          urlData = shared.parseConnectionUrl(options.url);
          service = service || urlData.service;
        }
        this.options = shared.assign(
          false,
          // create new object
          options,
          // regular options
          urlData,
          // url options
          service && wellKnown(service)
          // wellknown options
        );
        this.options.maxConnections = this.options.maxConnections || 5;
        this.options.maxMessages = this.options.maxMessages || 100;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "smtp-pool"
        });
        this.name = "SMTP (pool)";
        this.version = packageData.version + "[client:" + packageData.version + "]";
        this._rateLimit = {
          counter: 0,
          timeout: null,
          waiting: [],
          checkpoint: false,
          delta: Number(this.options.rateDelta) || 1e3,
          limit: Number(this.options.rateLimit) || 0
        };
        this._closed = false;
        this._queue = [];
        this._connections = [];
        this._connectionCounter = 0;
        this.idling = true;
        setImmediate(() => {
          if (this.idling) {
            this.emit("idle");
          }
        });
      }
      /**
       * Placeholder function for creating proxy sockets. This method immediatelly returns
       * without a socket
       *
       * @param {Object} options Connection options
       * @param {Function} callback Callback function to run with the socket keys
       */
      getSocket(options, callback) {
        return setImmediate(() => callback(null, false));
      }
      /**
       * Queues an e-mail to be sent using the selected settings
       *
       * @param {Object} mail Mail object
       * @param {Function} callback Callback function
       */
      send(mail, callback) {
        if (this._closed) {
          return false;
        }
        this._queue.push({
          mail,
          requeueAttempts: 0,
          callback
        });
        if (this.idling && this._queue.length >= this.options.maxConnections) {
          this.idling = false;
        }
        setImmediate(() => this._processMessages());
        return true;
      }
      /**
       * Closes all connections in the pool. If there is a message being sent, the connection
       * is closed later
       */
      close() {
        let connection;
        const len = this._connections.length;
        this._closed = true;
        clearTimeout(this._rateLimit.timeout);
        if (!len && !this._queue.length) {
          return;
        }
        for (let i = len - 1; i >= 0; i--) {
          if (this._connections[i] && this._connections[i].available) {
            connection = this._connections[i];
            connection.close();
            this.logger.info(
              {
                tnx: "connection",
                cid: connection.id,
                action: "removed"
              },
              "Connection #%s removed",
              connection.id
            );
          }
        }
        if (len && !this._connections.length) {
          this.logger.debug(
            {
              tnx: "connection"
            },
            "All connections removed"
          );
        }
        if (!this._queue.length) {
          return;
        }
        const invokeCallbacks = () => {
          if (!this._queue.length) {
            this.logger.debug(
              {
                tnx: "connection"
              },
              "Pending queue entries cleared"
            );
            return;
          }
          const entry = this._queue.shift();
          if (entry && typeof entry.callback === "function") {
            try {
              entry.callback(new Error("Connection pool was closed"));
            } catch (E) {
              this.logger.error(
                {
                  err: E,
                  tnx: "callback",
                  cid: connection.id
                },
                "Callback error for #%s: %s",
                connection.id,
                E.message
              );
            }
          }
          setImmediate(invokeCallbacks);
        };
        setImmediate(invokeCallbacks);
      }
      /**
       * Check the queue and available connections. If there is a message to be sent and there is
       * an available connection, then use this connection to send the mail
       */
      _processMessages() {
        if (this._closed) {
          return;
        }
        if (!this._queue.length) {
          if (!this.idling) {
            this.idling = true;
            this.emit("idle");
          }
          return;
        }
        let connection = this._connections.find((c) => c.available);
        if (!connection && this._connections.length < this.options.maxConnections) {
          connection = this._createConnection();
        }
        if (!connection) {
          this.idling = false;
          return;
        }
        if (!this.idling && this._queue.length < this.options.maxConnections) {
          this.idling = true;
          this.emit("idle");
        }
        const entry = connection.queueEntry = this._queue.shift();
        entry.messageId = (connection.queueEntry.mail.message.getHeader("message-id") || "").replace(/[<>\s]/g, "");
        connection.available = false;
        this.logger.debug(
          {
            tnx: "pool",
            cid: connection.id,
            messageId: entry.messageId,
            action: "assign"
          },
          "Assigned message <%s> to #%s (%s)",
          entry.messageId,
          connection.id,
          connection.messages + 1
        );
        if (this._rateLimit.limit) {
          this._rateLimit.counter++;
          if (!this._rateLimit.checkpoint) {
            this._rateLimit.checkpoint = Date.now();
          }
        }
        connection.send(entry.mail, (err2, info) => {
          if (entry === connection.queueEntry) {
            try {
              entry.callback(err2, info);
            } catch (E) {
              this.logger.error(
                {
                  err: E,
                  tnx: "callback",
                  cid: connection.id
                },
                "Callback error for #%s: %s",
                connection.id,
                E.message
              );
            }
            connection.queueEntry = false;
          }
        });
      }
      /**
       * Creates a new pool resource
       */
      _createConnection() {
        const connection = new PoolResource(this);
        connection.id = ++this._connectionCounter;
        this.logger.info(
          {
            tnx: "pool",
            cid: connection.id,
            action: "conection"
          },
          "Created new pool resource #%s",
          connection.id
        );
        connection.on("available", () => {
          this.logger.debug(
            {
              tnx: "connection",
              cid: connection.id,
              action: "available"
            },
            "Connection #%s became available",
            connection.id
          );
          if (this._closed) {
            this.close();
          } else {
            this._processMessages();
          }
        });
        connection.once("error", (err2) => {
          if (err2.code !== errors.EMAXLIMIT) {
            this.logger.warn(
              {
                err: err2,
                tnx: "pool",
                cid: connection.id
              },
              "Pool Error for #%s: %s",
              connection.id,
              err2.message
            );
          } else {
            this.logger.debug(
              {
                tnx: "pool",
                cid: connection.id,
                action: "maxlimit"
              },
              "Max messages limit exchausted for #%s",
              connection.id
            );
          }
          if (connection.queueEntry) {
            try {
              connection.queueEntry.callback(err2);
            } catch (E) {
              this.logger.error(
                {
                  err: E,
                  tnx: "callback",
                  cid: connection.id
                },
                "Callback error for #%s: %s",
                connection.id,
                E.message
              );
            }
            connection.queueEntry = false;
          }
          this._removeConnection(connection);
          this._continueProcessing();
        });
        connection.once("close", () => {
          this.logger.info(
            {
              tnx: "connection",
              cid: connection.id,
              action: "closed"
            },
            "Connection #%s was closed",
            connection.id
          );
          this._removeConnection(connection);
          if (connection.queueEntry) {
            setTimeout(() => {
              if (connection.queueEntry) {
                if (this._shouldRequeuOnConnectionClose(connection.queueEntry)) {
                  this._requeueEntryOnConnectionClose(connection);
                } else {
                  this._failDeliveryOnConnectionClose(connection);
                }
              }
              this._continueProcessing();
            }, 50);
          } else {
            if (!this._closed && this.idling && !this._connections.length) {
              this.emit("clear");
            }
            this._continueProcessing();
          }
        });
        this._connections.push(connection);
        return connection;
      }
      _shouldRequeuOnConnectionClose(queueEntry) {
        if (this.options.maxRequeues === void 0 || this.options.maxRequeues < 0) {
          return true;
        }
        return queueEntry.requeueAttempts < this.options.maxRequeues;
      }
      _failDeliveryOnConnectionClose(connection) {
        if (connection.queueEntry && connection.queueEntry.callback) {
          try {
            connection.queueEntry.callback(new Error("Reached maximum number of retries after connection was closed"));
          } catch (E) {
            this.logger.error(
              {
                err: E,
                tnx: "callback",
                messageId: connection.queueEntry.messageId,
                cid: connection.id
              },
              "Callback error for #%s: %s",
              connection.id,
              E.message
            );
          }
          connection.queueEntry = false;
        }
      }
      _requeueEntryOnConnectionClose(connection) {
        connection.queueEntry.requeueAttempts += 1;
        this.logger.debug(
          {
            tnx: "pool",
            cid: connection.id,
            messageId: connection.queueEntry.messageId,
            action: "requeue"
          },
          "Re-queued message <%s> for #%s. Attempt: #%s",
          connection.queueEntry.messageId,
          connection.id,
          connection.queueEntry.requeueAttempts
        );
        this._queue.unshift(connection.queueEntry);
        connection.queueEntry = false;
      }
      /**
       * Continue to process message if the pool hasn't closed
       */
      _continueProcessing() {
        if (this._closed) {
          this.close();
        } else {
          setTimeout(() => this._processMessages(), 100);
        }
      }
      /**
       * Remove resource from pool
       *
       * @param {Object} connection The PoolResource to remove
       */
      _removeConnection(connection) {
        const index = this._connections.indexOf(connection);
        if (index !== -1) {
          this._connections.splice(index, 1);
        }
      }
      /**
       * Checks if connections have hit current rate limit and if so, queues the availability callback
       *
       * @param {Function} callback Callback function to run once rate limiter has been cleared
       */
      _checkRateLimit(callback) {
        if (!this._rateLimit.limit) {
          return callback();
        }
        const now2 = Date.now();
        if (this._rateLimit.counter < this._rateLimit.limit) {
          return callback();
        }
        this._rateLimit.waiting.push(callback);
        if (this._rateLimit.checkpoint <= now2 - this._rateLimit.delta) {
          return this._clearRateLimit();
        }
        if (!this._rateLimit.timeout) {
          this._rateLimit.timeout = setTimeout(() => this._clearRateLimit(), this._rateLimit.delta - (now2 - this._rateLimit.checkpoint));
          this._rateLimit.checkpoint = now2;
        }
      }
      /**
       * Clears current rate limit limitation and runs paused callback
       */
      _clearRateLimit() {
        clearTimeout(this._rateLimit.timeout);
        this._rateLimit.timeout = null;
        this._rateLimit.counter = 0;
        this._rateLimit.checkpoint = false;
        while (this._rateLimit.waiting.length) {
          const cb = this._rateLimit.waiting.shift();
          setImmediate(cb);
        }
      }
      /**
       * Returns true if there are free slots in the queue
       */
      isIdle() {
        return this.idling;
      }
      /**
       * Verifies SMTP configuration
       *
       * @param {Function} callback Callback function
       */
      verify(callback) {
        let promise;
        if (!callback) {
          promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
          });
        }
        const auth = new PoolResource(this).auth;
        this.getSocket(this.options, (err2, socketOptions) => {
          if (err2) {
            return callback(err2);
          }
          let options = this.options;
          if (socketOptions && socketOptions.connection) {
            this.logger.info(
              {
                tnx: "proxy",
                remoteAddress: socketOptions.connection.remoteAddress,
                remotePort: socketOptions.connection.remotePort,
                destHost: options.host || "",
                destPort: options.port || "",
                action: "connected"
              },
              "Using proxied socket from %s:%s to %s:%s",
              socketOptions.connection.remoteAddress,
              socketOptions.connection.remotePort,
              options.host || "",
              options.port || ""
            );
            options = Object.assign(shared.assign(false, options), socketOptions);
          }
          const connection = new SMTPConnection(options);
          let returned = false;
          connection.once("error", (err3) => {
            if (returned) {
              return;
            }
            returned = true;
            connection.close();
            return callback(err3);
          });
          connection.once("end", () => {
            if (returned) {
              return;
            }
            returned = true;
            return callback(new Error("Connection closed"));
          });
          const finalize = () => {
            if (returned) {
              return;
            }
            returned = true;
            connection.quit();
            return callback(null, true);
          };
          connection.connect(() => {
            if (returned) {
              return;
            }
            if (auth && (connection.allowsAuth || options.forceAuth)) {
              connection.login(auth, (err3) => {
                if (returned) {
                  return;
                }
                if (err3) {
                  returned = true;
                  connection.close();
                  return callback(err3);
                }
                finalize();
              });
            } else if (!auth && connection.allowsAuth && options.forceAuth) {
              const err3 = new Error("Authentication info was not provided");
              err3.code = errors.ENOAUTH;
              returned = true;
              connection.close();
              return callback(err3);
            } else {
              finalize();
            }
          });
        });
        return promise;
      }
    };
    module.exports = SMTPPool;
  }
});

// node_modules/nodemailer/lib/smtp-transport/index.js
var require_smtp_transport = __commonJS({
  "node_modules/nodemailer/lib/smtp-transport/index.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var SMTPConnection = require_smtp_connection();
    var wellKnown = require_well_known();
    var shared = require_shared();
    var XOAuth2 = require_xoauth2();
    var errors = require_errors();
    var packageData = require_package();
    var SMTPTransport = class extends EventEmitter {
      constructor(options) {
        super();
        options = options || {};
        if (typeof options === "string") {
          options = {
            url: options
          };
        }
        let urlData;
        let service = options.service;
        if (typeof options.getSocket === "function") {
          this.getSocket = options.getSocket;
        }
        if (options.url) {
          urlData = shared.parseConnectionUrl(options.url);
          service = service || urlData.service;
        }
        this.options = shared.assign(
          false,
          // create new object
          options,
          // regular options
          urlData,
          // url options
          service && wellKnown(service)
          // wellknown options
        );
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "smtp-transport"
        });
        this.name = "SMTP";
        this.version = packageData.version + "[client:" + packageData.version + "]";
        if (this.options.auth) {
          this.auth = this.getAuth({});
        }
      }
      /**
       * Placeholder function for creating proxy sockets. This method immediatelly returns
       * without a socket
       *
       * @param {Object} options Connection options
       * @param {Function} callback Callback function to run with the socket keys
       */
      getSocket(options, callback) {
        return setImmediate(() => callback(null, false));
      }
      getAuth(authOpts) {
        if (!authOpts) {
          if (this.auth && this.auth.oauth2 && this.mailer) {
            this.auth.oauth2.provisionCallback = this.mailer.get("oauth2_provision_cb") || this.auth.oauth2.provisionCallback;
          }
          return this.auth;
        }
        const authData = Object.assign(
          {},
          this.options.auth && typeof this.options.auth === "object" ? this.options.auth : {},
          typeof authOpts === "object" ? authOpts : {}
        );
        if (Object.keys(authData).length === 0) {
          return false;
        }
        switch ((authData.type || "").toString().toUpperCase()) {
          case "OAUTH2": {
            if (!authData.service && !authData.user) {
              return false;
            }
            const oauth2 = new XOAuth2(authData, this.logger);
            oauth2.provisionCallback = this.mailer && this.mailer.get("oauth2_provision_cb") || oauth2.provisionCallback;
            oauth2.on("token", (token) => this.mailer.emit("token", token));
            oauth2.on("error", (err2) => this.emit("error", err2));
            return {
              type: "OAUTH2",
              user: authData.user,
              oauth2,
              method: "XOAUTH2"
            };
          }
          default:
            return {
              type: (authData.type || "").toString().toUpperCase() || "LOGIN",
              user: authData.user,
              credentials: {
                user: authData.user || "",
                pass: authData.pass,
                options: authData.options
              },
              method: (authData.method || "").trim().toUpperCase() || this.options.authMethod || false
            };
        }
      }
      /**
       * Sends an e-mail using the selected settings
       *
       * @param {Object} mail Mail object
       * @param {Function} callback Callback function
       */
      send(mail, callback) {
        this.getSocket(this.options, (err2, socketOptions) => {
          if (err2) {
            return callback(err2);
          }
          let returned = false;
          let options = this.options;
          if (socketOptions && socketOptions.connection) {
            this.logger.info(
              {
                tnx: "proxy",
                remoteAddress: socketOptions.connection.remoteAddress,
                remotePort: socketOptions.connection.remotePort,
                destHost: options.host || "",
                destPort: options.port || "",
                action: "connected"
              },
              "Using proxied socket from %s:%s to %s:%s",
              socketOptions.connection.remoteAddress,
              socketOptions.connection.remotePort,
              options.host || "",
              options.port || ""
            );
            options = Object.assign(shared.assign(false, options), socketOptions);
          }
          const connection = new SMTPConnection(options);
          let perCallAuth;
          const cleanupPerCallAuth = () => {
            if (perCallAuth && perCallAuth !== this.auth && perCallAuth.oauth2) {
              perCallAuth.oauth2.removeAllListeners();
            }
            perCallAuth = null;
          };
          connection.once("error", (err3) => {
            if (returned) {
              return;
            }
            returned = true;
            cleanupPerCallAuth();
            connection.close();
            return callback(err3);
          });
          connection.once("end", () => {
            if (returned) {
              return;
            }
            const timer = setTimeout(() => {
              if (returned) {
                return;
              }
              returned = true;
              cleanupPerCallAuth();
              const err3 = new Error("Unexpected socket close");
              if (connection && connection._socket && connection._socket.upgrading) {
                err3.code = errors.ETLS;
              }
              callback(err3);
            }, 1e3);
            try {
              timer.unref();
            } catch (_E) {
            }
          });
          const sendMessage = () => {
            const envelope = mail.message.getEnvelope();
            const messageId = mail.message.messageId();
            const recipients = [].concat(envelope.to || []);
            if (recipients.length > 3) {
              recipients.push("...and " + recipients.splice(2).length + " more");
            }
            if (mail.data.dsn) {
              envelope.dsn = mail.data.dsn;
            }
            if (mail.data.requireTLSExtensionEnabled) {
              envelope.requireTLSExtensionEnabled = mail.data.requireTLSExtensionEnabled;
            }
            this.logger.info(
              {
                tnx: "send",
                messageId
              },
              "Sending message %s to <%s>",
              messageId,
              recipients.join(", ")
            );
            connection.send(envelope, mail.message.createReadStream(), (err3, info) => {
              returned = true;
              cleanupPerCallAuth();
              connection.close();
              if (err3) {
                this.logger.error(
                  {
                    err: err3,
                    tnx: "send"
                  },
                  "Send error for %s: %s",
                  messageId,
                  err3.message
                );
                return callback(err3);
              }
              info.envelope = {
                from: envelope.from,
                to: envelope.to
              };
              info.messageId = messageId;
              try {
                return callback(null, info);
              } catch (E) {
                this.logger.error(
                  {
                    err: E,
                    tnx: "callback"
                  },
                  "Callback error for %s: %s",
                  messageId,
                  E.message
                );
              }
            });
          };
          connection.connect(() => {
            if (returned) {
              return;
            }
            perCallAuth = this.getAuth(mail.data.auth);
            if (perCallAuth && (connection.allowsAuth || options.forceAuth)) {
              connection.login(perCallAuth, (err3) => {
                cleanupPerCallAuth();
                if (returned) {
                  return;
                }
                if (err3) {
                  returned = true;
                  connection.close();
                  return callback(err3);
                }
                sendMessage();
              });
            } else {
              sendMessage();
            }
          });
        });
      }
      /**
       * Verifies SMTP configuration
       *
       * @param {Function} callback Callback function
       */
      verify(callback) {
        let promise;
        if (!callback) {
          promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
          });
        }
        this.getSocket(this.options, (err2, socketOptions) => {
          if (err2) {
            return callback(err2);
          }
          let options = this.options;
          if (socketOptions && socketOptions.connection) {
            this.logger.info(
              {
                tnx: "proxy",
                remoteAddress: socketOptions.connection.remoteAddress,
                remotePort: socketOptions.connection.remotePort,
                destHost: options.host || "",
                destPort: options.port || "",
                action: "connected"
              },
              "Using proxied socket from %s:%s to %s:%s",
              socketOptions.connection.remoteAddress,
              socketOptions.connection.remotePort,
              options.host || "",
              options.port || ""
            );
            options = Object.assign(shared.assign(false, options), socketOptions);
          }
          const connection = new SMTPConnection(options);
          let returned = false;
          let perCallAuth;
          const cleanupPerCallAuth = () => {
            if (perCallAuth && perCallAuth !== this.auth && perCallAuth.oauth2) {
              perCallAuth.oauth2.removeAllListeners();
            }
            perCallAuth = null;
          };
          connection.once("error", (err3) => {
            if (returned) {
              return;
            }
            returned = true;
            cleanupPerCallAuth();
            connection.close();
            return callback(err3);
          });
          connection.once("end", () => {
            if (returned) {
              return;
            }
            returned = true;
            cleanupPerCallAuth();
            return callback(new Error("Connection closed"));
          });
          const finalize = () => {
            if (returned) {
              return;
            }
            returned = true;
            cleanupPerCallAuth();
            connection.quit();
            return callback(null, true);
          };
          connection.connect(() => {
            if (returned) {
              return;
            }
            perCallAuth = this.getAuth({});
            if (perCallAuth && (connection.allowsAuth || options.forceAuth)) {
              connection.login(perCallAuth, (err3) => {
                cleanupPerCallAuth();
                if (returned) {
                  return;
                }
                if (err3) {
                  returned = true;
                  connection.close();
                  return callback(err3);
                }
                finalize();
              });
            } else if (!perCallAuth && connection.allowsAuth && options.forceAuth) {
              const err3 = new Error("Authentication info was not provided");
              err3.code = errors.ENOAUTH;
              returned = true;
              cleanupPerCallAuth();
              connection.close();
              return callback(err3);
            } else {
              finalize();
            }
          });
        });
        return promise;
      }
      /**
       * Releases resources
       */
      close() {
        if (this.auth && this.auth.oauth2) {
          this.auth.oauth2.removeAllListeners();
        }
        this.emit("close");
      }
    };
    module.exports = SMTPTransport;
  }
});

// node_modules/nodemailer/lib/sendmail-transport/index.js
var require_sendmail_transport = __commonJS({
  "node_modules/nodemailer/lib/sendmail-transport/index.js"(exports, module) {
    "use strict";
    var { spawn } = __require("child_process");
    var packageData = require_package();
    var shared = require_shared();
    var errors = require_errors();
    var LeWindows = require_le_windows();
    var LeUnix = require_le_unix();
    var SendmailTransport = class {
      constructor(options) {
        options = options || {};
        this._spawn = spawn;
        this.options = options;
        this.name = "Sendmail";
        this.version = packageData.version;
        this.path = "sendmail";
        this.args = false;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "sendmail"
        });
        if (typeof options === "string") {
          this.path = options;
        } else if (typeof options === "object") {
          if (options.path) {
            this.path = options.path;
          }
          if (Array.isArray(options.args)) {
            this.args = options.args;
          }
        }
        this.winbreak = ["win", "windows", "dos", "\r\n"].includes((options.newline || "").toString().toLowerCase());
      }
      /**
       * <p>Compiles a mailcomposer message and forwards it to handler that sends it.</p>
       *
       * @param {Object} emailMessage MailComposer object
       * @param {Function} callback Callback function to run when the sending is completed
       */
      send(mail, done) {
        mail.message.keepBcc = true;
        const envelope = mail.data.envelope || mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        let returned;
        const hasInvalidAddresses = [].concat(envelope.from || []).concat(envelope.to || []).some((addr) => /^-/.test(addr));
        if (hasInvalidAddresses) {
          const err2 = new Error("Can not send mail. Invalid envelope addresses.");
          err2.code = errors.ESENDMAIL;
          return done(err2);
        }
        const args = this.args ? ["-i"].concat(this.args).concat(envelope.to) : ["-i"].concat(envelope.from ? ["-f", envelope.from] : []).concat(envelope.to);
        const callback = (err2) => {
          if (returned) {
            return;
          }
          returned = true;
          if (typeof done === "function") {
            if (err2) {
              return done(err2);
            }
            return done(null, {
              envelope,
              messageId,
              response: "Messages queued for delivery"
            });
          }
        };
        let sendmail;
        try {
          sendmail = this._spawn(this.path, args);
        } catch (E) {
          this.logger.error(
            {
              err: E,
              tnx: "spawn",
              messageId
            },
            "Error occurred while spawning sendmail. %s",
            E.message
          );
          return callback(E);
        }
        if (sendmail) {
          sendmail.on("error", (err2) => {
            this.logger.error(
              {
                err: err2,
                tnx: "spawn",
                messageId
              },
              "Error occurred when sending message %s. %s",
              messageId,
              err2.message
            );
            callback(err2);
          });
          sendmail.once("exit", (code) => {
            if (!code) {
              return callback();
            }
            const err2 = new Error(
              code === 127 ? "Sendmail command not found, process exited with code " + code : "Sendmail exited with code " + code
            );
            err2.code = errors.ESENDMAIL;
            this.logger.error(
              {
                err: err2,
                tnx: "stdin",
                messageId
              },
              "Error sending message %s to sendmail. %s",
              messageId,
              err2.message
            );
            callback(err2);
          });
          sendmail.once("close", callback);
          sendmail.stdin.on("error", (err2) => {
            this.logger.error(
              {
                err: err2,
                tnx: "stdin",
                messageId
              },
              "Error occurred when piping message %s to sendmail. %s",
              messageId,
              err2.message
            );
            callback(err2);
          });
          const recipients = [].concat(envelope.to || []);
          if (recipients.length > 3) {
            recipients.push("...and " + recipients.splice(2).length + " more");
          }
          this.logger.info(
            {
              tnx: "send",
              messageId
            },
            "Sending message %s to <%s>",
            messageId,
            recipients.join(", ")
          );
          const sourceStream = mail.message.createReadStream();
          let stream = sourceStream;
          if (this.options.newline) {
            stream = sourceStream.pipe(this.winbreak ? new LeWindows() : new LeUnix());
            sourceStream.once("error", (err2) => stream.emit("error", err2));
          }
          stream.once("error", (err2) => {
            this.logger.error(
              {
                err: err2,
                tnx: "stdin",
                messageId
              },
              "Error occurred when generating message %s. %s",
              messageId,
              err2.message
            );
            sendmail.kill("SIGINT");
            callback(err2);
          });
          stream.pipe(sendmail.stdin);
        } else {
          const err2 = new Error("sendmail was not found");
          err2.code = errors.ESENDMAIL;
          return callback(err2);
        }
      }
    };
    module.exports = SendmailTransport;
  }
});

// node_modules/nodemailer/lib/stream-transport/index.js
var require_stream_transport = __commonJS({
  "node_modules/nodemailer/lib/stream-transport/index.js"(exports, module) {
    "use strict";
    var packageData = require_package();
    var shared = require_shared();
    var LeWindows = require_le_windows();
    var LeUnix = require_le_unix();
    var StreamTransport = class {
      constructor(options) {
        options = options || {};
        this.options = options;
        this.name = "StreamTransport";
        this.version = packageData.version;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "stream-transport"
        });
        this.winbreak = ["win", "windows", "dos", "\r\n"].includes((options.newline || "").toString().toLowerCase());
      }
      /**
       * Compiles a mailcomposer message and forwards it to handler that sends it
       *
       * @param {Object} emailMessage MailComposer object
       * @param {Function} callback Callback function to run when the sending is completed
       */
      send(mail, done) {
        mail.message.keepBcc = true;
        const envelope = mail.data.envelope || mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        const recipients = [].concat(envelope.to || []);
        if (recipients.length > 3) {
          recipients.push("...and " + recipients.splice(2).length + " more");
        }
        this.logger.info(
          {
            tnx: "send",
            messageId
          },
          "Sending message %s to <%s> using %s line breaks",
          messageId,
          recipients.join(", "),
          this.winbreak ? "<CR><LF>" : "<LF>"
        );
        setImmediate(() => {
          let stream;
          try {
            stream = mail.message.createReadStream();
            if (this.options.newline) {
              const sourceStream = stream;
              stream = sourceStream.pipe(this.winbreak ? new LeWindows() : new LeUnix());
              sourceStream.once("error", (err2) => stream.emit("error", err2));
            }
          } catch (E) {
            this.logger.error(
              {
                err: E,
                tnx: "send",
                messageId
              },
              "Creating send stream failed for %s. %s",
              messageId,
              E.message
            );
            return done(E);
          }
          if (!this.options.buffer) {
            stream.once("error", (err2) => {
              this.logger.error(
                {
                  err: err2,
                  tnx: "send",
                  messageId
                },
                "Failed creating message for %s. %s",
                messageId,
                err2.message
              );
            });
            return done(null, {
              envelope,
              messageId,
              message: stream
            });
          }
          const chunks = [];
          let chunklen = 0;
          stream.on("readable", () => {
            let chunk;
            while ((chunk = stream.read()) !== null) {
              chunks.push(chunk);
              chunklen += chunk.length;
            }
          });
          stream.once("error", (err2) => {
            this.logger.error(
              {
                err: err2,
                tnx: "send",
                messageId
              },
              "Failed creating message for %s. %s",
              messageId,
              err2.message
            );
            return done(err2);
          });
          stream.on(
            "end",
            () => done(null, {
              envelope,
              messageId,
              message: Buffer.concat(chunks, chunklen)
            })
          );
        });
      }
    };
    module.exports = StreamTransport;
  }
});

// node_modules/nodemailer/lib/json-transport/index.js
var require_json_transport = __commonJS({
  "node_modules/nodemailer/lib/json-transport/index.js"(exports, module) {
    "use strict";
    var packageData = require_package();
    var shared = require_shared();
    var JSONTransport = class {
      constructor(options) {
        options = options || {};
        this.options = options;
        this.name = "JSONTransport";
        this.version = packageData.version;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "json-transport"
        });
      }
      /**
       * <p>Compiles a mailcomposer message and forwards it to handler that sends it.</p>
       *
       * @param {Object} emailMessage MailComposer object
       * @param {Function} callback Callback function to run when the sending is completed
       */
      send(mail, done) {
        mail.message.keepBcc = true;
        const envelope = mail.data.envelope || mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        const recipients = [].concat(envelope.to || []);
        if (recipients.length > 3) {
          recipients.push("...and " + recipients.splice(2).length + " more");
        }
        this.logger.info(
          {
            tnx: "send",
            messageId
          },
          "Composing JSON structure of %s to <%s>",
          messageId,
          recipients.join(", ")
        );
        setImmediate(() => {
          mail.normalize((err2, data) => {
            if (err2) {
              this.logger.error(
                {
                  err: err2,
                  tnx: "send",
                  messageId
                },
                "Failed building JSON structure for %s. %s",
                messageId,
                err2.message
              );
              return done(err2);
            }
            delete data.envelope;
            delete data.normalizedHeaders;
            return done(null, {
              envelope,
              messageId,
              message: this.options.skipEncoding ? data : JSON.stringify(data)
            });
          });
        });
      }
    };
    module.exports = JSONTransport;
  }
});

// node_modules/nodemailer/lib/ses-transport/index.js
var require_ses_transport = __commonJS({
  "node_modules/nodemailer/lib/ses-transport/index.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var packageData = require_package();
    var shared = require_shared();
    var errors = require_errors();
    var LeWindows = require_le_windows();
    var MimeNode = require_mime_node();
    function tagSesError(err2) {
      if (err2 && typeof err2 === "object" && !err2.code) {
        err2.code = errors.ESES;
      }
      return err2;
    }
    var SESTransport = class extends EventEmitter {
      constructor(options) {
        super();
        options = options || {};
        this.options = options;
        this.ses = this.options.SES;
        this.name = "SESTransport";
        this.version = packageData.version;
        this.logger = shared.getLogger(this.options, {
          component: this.options.component || "ses-transport"
        });
      }
      getRegion(cb) {
        if (this.ses.sesClient.config && typeof this.ses.sesClient.config.region === "function") {
          return this.ses.sesClient.config.region().then(
            (region) => cb(null, region),
            (err2) => cb(err2)
          );
        }
        return cb(null, false);
      }
      /**
       * Compiles a mailcomposer message and forwards it to SES
       *
       * @param {Object} emailMessage MailComposer object
       * @param {Function} callback Callback function to run when the sending is completed
       */
      send(mail, callback) {
        let fromHeader = mail.message._headers.find((header) => /^from$/i.test(header.key));
        if (fromHeader) {
          const mimeNode = new MimeNode("text/plain");
          fromHeader = mimeNode._convertAddresses(mimeNode._parseAddresses(fromHeader.value));
        }
        const envelope = mail.data.envelope || mail.message.getEnvelope();
        const messageId = mail.message.messageId();
        const recipients = [].concat(envelope.to || []);
        if (recipients.length > 3) {
          recipients.push("...and " + recipients.splice(2).length + " more");
        }
        this.logger.info(
          {
            tnx: "send",
            messageId
          },
          "Sending message %s to <%s>",
          messageId,
          recipients.join(", ")
        );
        const getRawMessage = (next) => {
          if (!mail.data._dkim) {
            mail.data._dkim = {};
          }
          if (mail.data._dkim.skipFields && typeof mail.data._dkim.skipFields === "string") {
            mail.data._dkim.skipFields += ":date:message-id";
          } else {
            mail.data._dkim.skipFields = "date:message-id";
          }
          const sourceStream = mail.message.createReadStream();
          const stream = sourceStream.pipe(new LeWindows());
          const chunks = [];
          let chunklen = 0;
          stream.on("readable", () => {
            let chunk;
            while ((chunk = stream.read()) !== null) {
              chunks.push(chunk);
              chunklen += chunk.length;
            }
          });
          sourceStream.once("error", (err2) => stream.emit("error", err2));
          stream.once("error", (err2) => next(err2));
          stream.once("end", () => next(null, Buffer.concat(chunks, chunklen)));
        };
        setImmediate(
          () => getRawMessage((err2, raw) => {
            if (err2) {
              this.logger.error(
                {
                  err: err2,
                  tnx: "send",
                  messageId
                },
                "Failed creating message for %s. %s",
                messageId,
                err2.message
              );
              return callback(err2);
            }
            const sesMessage = Object.assign(
              {
                Content: {
                  Raw: {
                    // required
                    Data: raw
                    // required
                  }
                },
                FromEmailAddress: fromHeader || envelope.from,
                Destination: {
                  ToAddresses: envelope.to
                }
              },
              mail.data.ses || {}
            );
            this.getRegion((err3, region) => {
              if (err3 || !region) {
                region = "us-east-1";
              }
              let sendPromise;
              try {
                const command = new this.ses.SendEmailCommand(sesMessage);
                sendPromise = this.ses.sesClient.send(command);
              } catch (err4) {
                tagSesError(err4);
                this.logger.error(
                  {
                    err: err4,
                    tnx: "send"
                  },
                  "Send error for %s: %s",
                  messageId,
                  err4.message
                );
                setImmediate(() => callback(err4));
                return;
              }
              sendPromise.then((data) => {
                if (region === "us-east-1") {
                  region = "email";
                }
                const info = {
                  envelope: {
                    from: envelope.from,
                    to: envelope.to
                  },
                  messageId: "<" + data.MessageId + (!/@/.test(data.MessageId) ? "@" + region + ".amazonses.com" : "") + ">",
                  response: data.MessageId,
                  raw
                };
                setImmediate(() => callback(null, info));
              }).catch((err4) => {
                tagSesError(err4);
                this.logger.error(
                  {
                    err: err4,
                    tnx: "send"
                  },
                  "Send error for %s: %s",
                  messageId,
                  err4.message
                );
                setImmediate(() => callback(err4));
              });
            });
          })
        );
      }
      /**
       * Verifies SES configuration
       *
       * @param {Function} callback Callback function
       */
      verify(callback) {
        let promise;
        if (!callback) {
          promise = new Promise((resolve, reject) => {
            callback = shared.callbackPromise(resolve, reject);
          });
        }
        const cb = (err2) => {
          if (err2 && !["InvalidParameterValue", "MessageRejected"].includes(err2.code || err2.Code || err2.name)) {
            return callback(tagSesError(err2));
          }
          return callback(null, true);
        };
        const sesMessage = {
          Content: {
            Raw: {
              Data: Buffer.from("From: <invalid@invalid>\r\nTo: <invalid@invalid>\r\n Subject: Invalid\r\n\r\nInvalid")
            }
          },
          FromEmailAddress: "invalid@invalid",
          Destination: {
            ToAddresses: ["invalid@invalid"]
          }
        };
        this.getRegion(() => {
          let sendPromise;
          try {
            const command = new this.ses.SendEmailCommand(sesMessage);
            sendPromise = this.ses.sesClient.send(command);
          } catch (err2) {
            setImmediate(() => cb(err2));
            return;
          }
          sendPromise.then(() => setImmediate(() => cb(null))).catch((err2) => setImmediate(() => cb(err2)));
        });
        return promise;
      }
    };
    module.exports = SESTransport;
  }
});

// node_modules/nodemailer/lib/nodemailer.js
var require_nodemailer = __commonJS({
  "node_modules/nodemailer/lib/nodemailer.js"(exports, module) {
    "use strict";
    var Mailer = require_mailer();
    var shared = require_shared();
    var SMTPPool = require_smtp_pool();
    var SMTPTransport = require_smtp_transport();
    var SendmailTransport = require_sendmail_transport();
    var StreamTransport = require_stream_transport();
    var JSONTransport = require_json_transport();
    var SESTransport = require_ses_transport();
    var errors = require_errors();
    var nmfetch = require_fetch();
    var packageData = require_package();
    var ETHEREAL_API = (process.env.ETHEREAL_API || "https://api.nodemailer.com").replace(/\/+$/, "");
    var ETHEREAL_WEB = (process.env.ETHEREAL_WEB || "https://ethereal.email").replace(/\/+$/, "");
    var ETHEREAL_API_KEY = (process.env.ETHEREAL_API_KEY || "").replace(/\s*/g, "") || null;
    var ETHEREAL_CACHE = ["true", "yes", "y", "1"].includes((process.env.ETHEREAL_CACHE || "yes").toString().trim().toLowerCase());
    var testAccount = false;
    module.exports.createTransport = function(transporter, defaults) {
      let options;
      if (
        // provided transporter is a configuration object, not transporter plugin
        typeof transporter === "object" && typeof transporter.send !== "function" || // provided transporter looks like a connection url
        typeof transporter === "string" && /^(smtps?|direct):/i.test(transporter)
      ) {
        const urlConfig = typeof transporter === "string" ? transporter : transporter.url;
        if (urlConfig) {
          options = shared.parseConnectionUrl(urlConfig);
        } else {
          options = transporter;
        }
        if (options.pool) {
          transporter = new SMTPPool(options);
        } else if (options.sendmail) {
          transporter = new SendmailTransport(options);
        } else if (options.streamTransport) {
          transporter = new StreamTransport(options);
        } else if (options.jsonTransport) {
          transporter = new JSONTransport(options);
        } else if (options.SES) {
          if (options.SES.ses && options.SES.aws) {
            const error = new Error(
              "Using legacy SES configuration, expecting @aws-sdk/client-sesv2, see https://nodemailer.com/transports/ses/"
            );
            error.code = errors.ECONFIG;
            throw error;
          }
          transporter = new SESTransport(options);
        } else {
          transporter = new SMTPTransport(options);
        }
      }
      return new Mailer(transporter, options, defaults);
    };
    module.exports.createTestAccount = function(apiUrl, callback) {
      let promise;
      if (!callback && typeof apiUrl === "function") {
        callback = apiUrl;
        apiUrl = false;
      }
      if (!callback) {
        promise = new Promise((resolve, reject) => {
          callback = shared.callbackPromise(resolve, reject);
        });
      }
      if (ETHEREAL_CACHE && testAccount) {
        setImmediate(() => callback(null, testAccount));
        return promise;
      }
      apiUrl = apiUrl || ETHEREAL_API;
      const chunks = [];
      let chunklen = 0;
      const requestHeaders = {};
      const requestBody = {
        requestor: packageData.name,
        version: packageData.version
      };
      if (ETHEREAL_API_KEY) {
        requestHeaders.Authorization = "Bearer " + ETHEREAL_API_KEY;
      }
      const fetchOptions = {
        contentType: "application/json",
        method: "POST",
        headers: requestHeaders,
        body: Buffer.from(JSON.stringify(requestBody))
      };
      if (/^https:/i.test(apiUrl)) {
        fetchOptions.tls = { rejectUnauthorized: true };
      }
      const req = nmfetch(apiUrl + "/user", fetchOptions);
      req.on("readable", () => {
        let chunk;
        while ((chunk = req.read()) !== null) {
          chunks.push(chunk);
          chunklen += chunk.length;
        }
      });
      req.once("error", (err2) => callback(err2));
      req.once("end", () => {
        const res = Buffer.concat(chunks, chunklen);
        let data;
        try {
          data = JSON.parse(res.toString());
        } catch (E) {
          return callback(E);
        }
        if (data.status !== "success" || data.error) {
          return callback(new Error(data.error || "Request failed"));
        }
        delete data.status;
        testAccount = data;
        callback(null, testAccount);
      });
      return promise;
    };
    module.exports.getTestMessageUrl = function(info) {
      if (!info || !info.response) {
        return false;
      }
      const infoProps = /* @__PURE__ */ new Map();
      const response = info.response.toString();
      if (response.length > 2 && response.charAt(response.length - 1) === "]") {
        const open = response.indexOf("[", response.lastIndexOf("]", response.length - 2) + 1);
        if (open >= 0 && open < response.length - 2) {
          const props = response.substring(open + 1, response.length - 1);
          props.replace(/\b([A-Z0-9]+)=([^\s]+)/g, (m, key, value) => {
            infoProps.set(key, value);
          });
        }
      }
      if (infoProps.has("STATUS") && infoProps.has("MSGID")) {
        return (testAccount.web || ETHEREAL_WEB) + "/message/" + infoProps.get("MSGID");
      }
      return false;
    };
  }
});

// netlify/functions/api.mjs
var import_nodemailer = __toESM(require_nodemailer(), 1);
import { createHmac, createHash, randomBytes } from "node:crypto";
var NF_ERROR = "x-nf-error";
var NF_REQUEST_ID = "x-nf-request-id";
var BlobsInternalError = class extends Error {
  constructor(res) {
    let details = res.headers.get(NF_ERROR) || `${res.status} status code`;
    if (res.headers.has(NF_REQUEST_ID)) {
      details += `, ID: ${res.headers.get(NF_REQUEST_ID)}`;
    }
    super(`Netlify Blobs has generated an internal error (${details})`);
    this.name = "BlobsInternalError";
  }
};
var collectIterator = async (iterator) => {
  const result = [];
  for await (const item of iterator) {
    result.push(item);
  }
  return result;
};
var base64Decode = (input) => {
  const { Buffer: Buffer2 } = globalThis;
  if (Buffer2) {
    return Buffer2.from(input, "base64").toString();
  }
  return atob(input);
};
var base64Encode = (input) => {
  const { Buffer: Buffer2 } = globalThis;
  if (Buffer2) {
    return Buffer2.from(input).toString("base64");
  }
  return btoa(input);
};
var getEnvironment = () => {
  const { Deno, Netlify, process: process2 } = globalThis;
  return Netlify?.env ?? Deno?.env ?? {
    delete: (key) => delete process2?.env[key],
    get: (key) => process2?.env[key],
    has: (key) => Boolean(process2?.env[key]),
    set: (key, value) => {
      if (process2?.env) {
        process2.env[key] = value;
      }
    },
    toObject: () => process2?.env ?? {}
  };
};
var getEnvironmentContext = () => {
  const context = globalThis.netlifyBlobsContext || getEnvironment().get("NETLIFY_BLOBS_CONTEXT");
  if (typeof context !== "string" || !context) {
    return {};
  }
  const data = base64Decode(context);
  try {
    return JSON.parse(data);
  } catch {
  }
  return {};
};
var MissingBlobsEnvironmentError = class extends Error {
  constructor(requiredProperties) {
    super(
      `The environment has not been configured to use Netlify Blobs. To use it manually, supply the following properties when creating a store: ${requiredProperties.join(
        ", "
      )}`
    );
    this.name = "MissingBlobsEnvironmentError";
  }
};
var BASE64_PREFIX = "b64;";
var METADATA_HEADER_INTERNAL = "x-amz-meta-user";
var METADATA_HEADER_EXTERNAL = "netlify-blobs-metadata";
var METADATA_MAX_SIZE = 2 * 1024;
var encodeMetadata = (metadata) => {
  if (!metadata) {
    return null;
  }
  const encodedObject = base64Encode(JSON.stringify(metadata));
  const payload = `b64;${encodedObject}`;
  if (METADATA_HEADER_EXTERNAL.length + payload.length > METADATA_MAX_SIZE) {
    throw new Error("Metadata object exceeds the maximum size");
  }
  return payload;
};
var decodeMetadata = (header) => {
  if (!header || !header.startsWith(BASE64_PREFIX)) {
    return {};
  }
  const encodedData = header.slice(BASE64_PREFIX.length);
  const decodedData = base64Decode(encodedData);
  const metadata = JSON.parse(decodedData);
  return metadata;
};
var getMetadataFromResponse = (response) => {
  if (!response.headers) {
    return {};
  }
  const value = response.headers.get(METADATA_HEADER_EXTERNAL) || response.headers.get(METADATA_HEADER_INTERNAL);
  try {
    return decodeMetadata(value);
  } catch {
    throw new Error(
      "An internal error occurred while trying to retrieve the metadata for an entry. Please try updating to the latest version of the Netlify Blobs client."
    );
  }
};
var BlobsConsistencyError = class extends Error {
  constructor() {
    super(
      `Netlify Blobs has failed to perform a read using strong consistency because the environment has not been configured with a 'uncachedEdgeURL' property`
    );
    this.name = "BlobsConsistencyError";
  }
};
var regions = {
  "us-east-1": true,
  "us-east-2": true,
  "eu-central-1": true,
  "ap-southeast-1": true,
  "ap-southeast-2": true
};
var isValidRegion = (input) => Object.keys(regions).includes(input);
var InvalidBlobsRegionError = class extends Error {
  constructor(region) {
    super(
      `${region} is not a supported Netlify Blobs region. Supported values are: ${Object.keys(regions).join(", ")}.`
    );
    this.name = "InvalidBlobsRegionError";
  }
};
var DEFAULT_RETRY_DELAY = getEnvironment().get("NODE_ENV") === "test" ? 1 : 5e3;
var MIN_RETRY_DELAY = 1e3;
var MAX_RETRY = 5;
var RATE_LIMIT_HEADER = "X-RateLimit-Reset";
var fetchAndRetry = async (fetch2, url, options, attemptsLeft = MAX_RETRY) => {
  try {
    const res = await fetch2(url, options);
    if (attemptsLeft > 0 && (res.status === 429 || res.status >= 500)) {
      const delay = getDelay(res.headers.get(RATE_LIMIT_HEADER));
      await sleep(delay);
      return fetchAndRetry(fetch2, url, options, attemptsLeft - 1);
    }
    return res;
  } catch (error) {
    if (attemptsLeft === 0) {
      throw error;
    }
    const delay = getDelay();
    await sleep(delay);
    return fetchAndRetry(fetch2, url, options, attemptsLeft - 1);
  }
};
var getDelay = (rateLimitReset) => {
  if (!rateLimitReset) {
    return DEFAULT_RETRY_DELAY;
  }
  return Math.max(Number(rateLimitReset) * 1e3 - Date.now(), MIN_RETRY_DELAY);
};
var sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});
var SIGNED_URL_ACCEPT_HEADER = "application/json;type=signed-url";
var Client = class {
  constructor({ apiURL, consistency, edgeURL, fetch: fetch2, region, siteID, token, uncachedEdgeURL }) {
    this.apiURL = apiURL;
    this.consistency = consistency ?? "eventual";
    this.edgeURL = edgeURL;
    this.fetch = fetch2 ?? globalThis.fetch;
    this.region = region;
    this.siteID = siteID;
    this.token = token;
    this.uncachedEdgeURL = uncachedEdgeURL;
    if (!this.fetch) {
      throw new Error(
        "Netlify Blobs could not find a `fetch` client in the global scope. You can either update your runtime to a version that includes `fetch` (like Node.js 18.0.0 or above), or you can supply your own implementation using the `fetch` property."
      );
    }
  }
  async getFinalRequest({
    consistency: opConsistency,
    key,
    metadata,
    method,
    parameters = {},
    storeName
  }) {
    const encodedMetadata = encodeMetadata(metadata);
    const consistency = opConsistency ?? this.consistency;
    let urlPath = `/${this.siteID}`;
    if (storeName) {
      urlPath += `/${storeName}`;
    }
    if (key) {
      urlPath += `/${key}`;
    }
    if (this.edgeURL) {
      if (consistency === "strong" && !this.uncachedEdgeURL) {
        throw new BlobsConsistencyError();
      }
      const headers = {
        authorization: `Bearer ${this.token}`
      };
      if (encodedMetadata) {
        headers[METADATA_HEADER_INTERNAL] = encodedMetadata;
      }
      if (this.region) {
        urlPath = `/region:${this.region}${urlPath}`;
      }
      const url2 = new URL(urlPath, consistency === "strong" ? this.uncachedEdgeURL : this.edgeURL);
      for (const key2 in parameters) {
        url2.searchParams.set(key2, parameters[key2]);
      }
      return {
        headers,
        url: url2.toString()
      };
    }
    const apiHeaders = { authorization: `Bearer ${this.token}` };
    const url = new URL(`/api/v1/blobs${urlPath}`, this.apiURL ?? "https://api.netlify.com");
    for (const key2 in parameters) {
      url.searchParams.set(key2, parameters[key2]);
    }
    if (this.region) {
      url.searchParams.set("region", this.region);
    }
    if (storeName === void 0 || key === void 0) {
      return {
        headers: apiHeaders,
        url: url.toString()
      };
    }
    if (encodedMetadata) {
      apiHeaders[METADATA_HEADER_EXTERNAL] = encodedMetadata;
    }
    if (method === "head" || method === "delete") {
      return {
        headers: apiHeaders,
        url: url.toString()
      };
    }
    const res = await this.fetch(url.toString(), {
      headers: { ...apiHeaders, accept: SIGNED_URL_ACCEPT_HEADER },
      method
    });
    if (res.status !== 200) {
      throw new BlobsInternalError(res);
    }
    const { url: signedURL } = await res.json();
    const userHeaders = encodedMetadata ? { [METADATA_HEADER_INTERNAL]: encodedMetadata } : void 0;
    return {
      headers: userHeaders,
      url: signedURL
    };
  }
  async makeRequest({
    body,
    consistency,
    headers: extraHeaders,
    key,
    metadata,
    method,
    parameters,
    storeName
  }) {
    const { headers: baseHeaders = {}, url } = await this.getFinalRequest({
      consistency,
      key,
      metadata,
      method,
      parameters,
      storeName
    });
    const headers = {
      ...baseHeaders,
      ...extraHeaders
    };
    if (method === "put") {
      headers["cache-control"] = "max-age=0, stale-while-revalidate=60";
    }
    const options = {
      body,
      headers,
      method
    };
    if (body instanceof ReadableStream) {
      options.duplex = "half";
    }
    return fetchAndRetry(this.fetch, url, options);
  }
};
var getClientOptions = (options, contextOverride) => {
  const context = contextOverride ?? getEnvironmentContext();
  const siteID = context.siteID ?? options.siteID;
  const token = context.token ?? options.token;
  if (!siteID || !token) {
    throw new MissingBlobsEnvironmentError(["siteID", "token"]);
  }
  if (options.region !== void 0 && !isValidRegion(options.region)) {
    throw new InvalidBlobsRegionError(options.region);
  }
  const clientOptions = {
    apiURL: context.apiURL ?? options.apiURL,
    consistency: options.consistency,
    edgeURL: context.edgeURL ?? options.edgeURL,
    fetch: options.fetch,
    region: options.region,
    siteID,
    token,
    uncachedEdgeURL: context.uncachedEdgeURL ?? options.uncachedEdgeURL
  };
  return clientOptions;
};
var DEPLOY_STORE_PREFIX = "deploy:";
var LEGACY_STORE_INTERNAL_PREFIX = "netlify-internal/legacy-namespace/";
var SITE_STORE_PREFIX = "site:";
var Store = class _Store {
  constructor(options) {
    this.client = options.client;
    if ("deployID" in options) {
      _Store.validateDeployID(options.deployID);
      let name = DEPLOY_STORE_PREFIX + options.deployID;
      if (options.name) {
        name += `:${options.name}`;
      }
      this.name = name;
    } else if (options.name.startsWith(LEGACY_STORE_INTERNAL_PREFIX)) {
      const storeName = options.name.slice(LEGACY_STORE_INTERNAL_PREFIX.length);
      _Store.validateStoreName(storeName);
      this.name = storeName;
    } else {
      _Store.validateStoreName(options.name);
      this.name = SITE_STORE_PREFIX + options.name;
    }
  }
  async delete(key) {
    const res = await this.client.makeRequest({ key, method: "delete", storeName: this.name });
    if (![200, 204, 404].includes(res.status)) {
      throw new BlobsInternalError(res);
    }
  }
  async get(key, options) {
    const { consistency, type } = options ?? {};
    const res = await this.client.makeRequest({ consistency, key, method: "get", storeName: this.name });
    if (res.status === 404) {
      return null;
    }
    if (res.status !== 200) {
      throw new BlobsInternalError(res);
    }
    if (type === void 0 || type === "text") {
      return res.text();
    }
    if (type === "arrayBuffer") {
      return res.arrayBuffer();
    }
    if (type === "blob") {
      return res.blob();
    }
    if (type === "json") {
      return res.json();
    }
    if (type === "stream") {
      return res.body;
    }
    throw new BlobsInternalError(res);
  }
  async getMetadata(key, { consistency } = {}) {
    const res = await this.client.makeRequest({ consistency, key, method: "head", storeName: this.name });
    if (res.status === 404) {
      return null;
    }
    if (res.status !== 200 && res.status !== 304) {
      throw new BlobsInternalError(res);
    }
    const etag = res?.headers.get("etag") ?? void 0;
    const metadata = getMetadataFromResponse(res);
    const result = {
      etag,
      metadata
    };
    return result;
  }
  async getWithMetadata(key, options) {
    const { consistency, etag: requestETag, type } = options ?? {};
    const headers = requestETag ? { "if-none-match": requestETag } : void 0;
    const res = await this.client.makeRequest({
      consistency,
      headers,
      key,
      method: "get",
      storeName: this.name
    });
    if (res.status === 404) {
      return null;
    }
    if (res.status !== 200 && res.status !== 304) {
      throw new BlobsInternalError(res);
    }
    const responseETag = res?.headers.get("etag") ?? void 0;
    const metadata = getMetadataFromResponse(res);
    const result = {
      etag: responseETag,
      metadata
    };
    if (res.status === 304 && requestETag) {
      return { data: null, ...result };
    }
    if (type === void 0 || type === "text") {
      return { data: await res.text(), ...result };
    }
    if (type === "arrayBuffer") {
      return { data: await res.arrayBuffer(), ...result };
    }
    if (type === "blob") {
      return { data: await res.blob(), ...result };
    }
    if (type === "json") {
      return { data: await res.json(), ...result };
    }
    if (type === "stream") {
      return { data: res.body, ...result };
    }
    throw new Error(`Invalid 'type' property: ${type}. Expected: arrayBuffer, blob, json, stream, or text.`);
  }
  list(options = {}) {
    const iterator = this.getListIterator(options);
    if (options.paginate) {
      return iterator;
    }
    return collectIterator(iterator).then(
      (items) => items.reduce(
        (acc, item) => ({
          blobs: [...acc.blobs, ...item.blobs],
          directories: [...acc.directories, ...item.directories]
        }),
        { blobs: [], directories: [] }
      )
    );
  }
  async set(key, data, { metadata } = {}) {
    _Store.validateKey(key);
    const res = await this.client.makeRequest({
      body: data,
      key,
      metadata,
      method: "put",
      storeName: this.name
    });
    if (res.status !== 200) {
      throw new BlobsInternalError(res);
    }
  }
  async setJSON(key, data, { metadata } = {}) {
    _Store.validateKey(key);
    const payload = JSON.stringify(data);
    const headers = {
      "content-type": "application/json"
    };
    const res = await this.client.makeRequest({
      body: payload,
      headers,
      key,
      metadata,
      method: "put",
      storeName: this.name
    });
    if (res.status !== 200) {
      throw new BlobsInternalError(res);
    }
  }
  static formatListResultBlob(result) {
    if (!result.key) {
      return null;
    }
    return {
      etag: result.etag,
      key: result.key
    };
  }
  static validateKey(key) {
    if (key === "") {
      throw new Error("Blob key must not be empty.");
    }
    if (key.startsWith("/") || key.startsWith("%2F")) {
      throw new Error("Blob key must not start with forward slash (/).");
    }
    if (new TextEncoder().encode(key).length > 600) {
      throw new Error(
        "Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long."
      );
    }
  }
  static validateDeployID(deployID) {
    if (!/^\w{1,24}$/.test(deployID)) {
      throw new Error(`'${deployID}' is not a valid Netlify deploy ID.`);
    }
  }
  static validateStoreName(name) {
    if (name.includes("/") || name.includes("%2F")) {
      throw new Error("Store name must not contain forward slashes (/).");
    }
    if (new TextEncoder().encode(name).length > 64) {
      throw new Error(
        "Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long."
      );
    }
  }
  getListIterator(options) {
    const { client, name: storeName } = this;
    const parameters = {};
    if (options?.prefix) {
      parameters.prefix = options.prefix;
    }
    if (options?.directories) {
      parameters.directories = "true";
    }
    return {
      [Symbol.asyncIterator]() {
        let currentCursor = null;
        let done = false;
        return {
          async next() {
            if (done) {
              return { done: true, value: void 0 };
            }
            const nextParameters = { ...parameters };
            if (currentCursor !== null) {
              nextParameters.cursor = currentCursor;
            }
            const res = await client.makeRequest({
              method: "get",
              parameters: nextParameters,
              storeName
            });
            let blobs = [];
            let directories = [];
            if (![200, 204, 404].includes(res.status)) {
              throw new BlobsInternalError(res);
            }
            if (res.status === 404) {
              done = true;
            } else {
              const page = await res.json();
              if (page.next_cursor) {
                currentCursor = page.next_cursor;
              } else {
                done = true;
              }
              blobs = (page.blobs ?? []).map(_Store.formatListResultBlob).filter(Boolean);
              directories = page.directories ?? [];
            }
            return {
              done: false,
              value: {
                blobs,
                directories
              }
            };
          }
        };
      }
    };
  }
};
var getStore = (input) => {
  if (typeof input === "string") {
    const clientOptions = getClientOptions({});
    const client = new Client(clientOptions);
    return new Store({ client, name: input });
  }
  if (typeof input?.name === "string" && typeof input?.siteID === "string" && typeof input?.token === "string") {
    const { name, siteID, token } = input;
    const clientOptions = getClientOptions(input, { siteID, token });
    if (!name || !siteID || !token) {
      throw new MissingBlobsEnvironmentError(["name", "siteID", "token"]);
    }
    const client = new Client(clientOptions);
    return new Store({ client, name });
  }
  if (typeof input?.name === "string") {
    const { name } = input;
    const clientOptions = getClientOptions(input);
    if (!name) {
      throw new MissingBlobsEnvironmentError(["name"]);
    }
    const client = new Client(clientOptions);
    return new Store({ client, name });
  }
  if (typeof input?.deployID === "string") {
    const clientOptions = getClientOptions(input);
    const { deployID } = input;
    if (!deployID) {
      throw new MissingBlobsEnvironmentError(["deployID"]);
    }
    const client = new Client(clientOptions);
    return new Store({ client, deployID });
  }
  throw new Error(
    "The `getStore` method requires the name of the store as a string or as the `name` property of an options object"
  );
};
var store = () => getStore({ name: "ma-payments", consistency: "strong" });
var json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
var err = (message, status = 400) => json({ error: message }, status);
var r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
var num = (x) => typeof x === "number" && isFinite(x) ? x : parseFloat(x) || 0;
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var hashPin = (pin, salt) => createHash("sha256").update(salt + ":" + pin).digest("hex");
var emEsc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var emMoney = (n) => {
  const p = r2(num(n)).toFixed(2).split(".");
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "AED " + p.join(".");
};
var emDate = (d) => {
  if (!d) return "\u2014";
  const s = String(d).slice(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
};
function amountWords(amount) {
  amount = num(amount);
  if (!amount) return "UAE Dirhams Zero Only";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const grp = (n) => {
    let w = "";
    if (n >= 100) { w += ones[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) w += " "; }
    if (n >= 20) { w += tens[Math.floor(n / 10)]; n %= 10; if (n) w += " " + ones[n]; }
    else if (n) w += ones[n];
    return w;
  };
  const d = Math.floor(amount), f = Math.round((amount - d) * 100);
  const m = Math.floor(d / 1e6), t = Math.floor(d % 1e6 / 1e3), u = d % 1e3;
  const w = [m ? grp(m) + " Million" : "", t ? grp(t) + " Thousand" : "", u ? grp(u) : ""].filter(Boolean).join(" ") || "Zero";
  return "UAE Dirhams " + w + (f ? " and " + grp(f) + " Fils" : "") + " Only";
}
var EMAIL_TYPES = {
  welcome: "Registration confirmation",
  initiated: "Payment certificate initiated",
  approved: "Payment certificate approved",
  paid: "Payment executed",
  cheque: "Cheque ready for collection",
  action: "Action required (rejection / deduction / missing docs)",
  licence: "Trade licence expiry reminder",
  soa: "Monthly statement of account request",
  client_issued: "Client payment certificate issued",
  client_approved: "Client payment certificate approved"
};
var COLLECT_WINDOW = "Tuesdays only, between 2:00 PM and 5:00 PM";
var collectNoteHtml = `<strong>Collection policy:</strong> Cash and cheques are handed over <strong>on ${COLLECT_WINDOW}</strong> at our office. Collection must be made by an <strong>authorised representative</strong> presenting their <strong>original Emirates ID</strong> (the EID number is recorded at handover). A <strong>signed &amp; stamped receipt copy is mandatory</strong> and must be provided at the time of collection.`;
var receiptNoteHtml = `<strong>Receipt required:</strong> a signed &amp; stamped receipt copy is <strong>mandatory for every payment</strong>. Kindly return your acknowledgement so we can close our records.`;
function getEnv(k) {
  try {
    return typeof process !== "undefined" && process.env ? process.env[k] : void 0;
  } catch {
    return void 0;
  }
}
async function getEmailCfg(s) {
  const saved = await s.get("emailcfg", { type: "json" }) || {};
  const smtpUser = getEnv("SMTP_USER") || saved.smtpUser || "info@maagroup.ae";
  const smtpPass = getEnv("SMTP_PASS") || saved.smtpPass || "";
  return {
    enabled: saved.enabled !== false,
    provider: saved.provider || "smtp",
    // Zoho Mail SMTP (default) — send through your own mailbox
    smtpHost: getEnv("SMTP_HOST") || saved.smtpHost || "smtppro.zoho.com",
    smtpPort: Number(getEnv("SMTP_PORT") || saved.smtpPort || 465),
    smtpUser,
    smtpPass,
    // ZeptoMail API (alternative)
    token: getEnv("ZEPTOMAIL_TOKEN") || saved.token || "",
    host: getEnv("ZEPTOMAIL_HOST") || saved.host || "api.zeptomail.com",
    from: getEnv("MAIL_FROM") || saved.from || "info@maagroup.ae",
    fromName: saved.fromName || "MA Group Accounts",
    replyTo: getEnv("MAIL_REPLYTO") || saved.replyTo || "info@maagroup.ae",
    cc: saved.cc || "",
    bcc: saved.bcc || "",
    triggers: saved.triggers || {}
  };
}
function emailShell(cfg, o) {
  const rows = (o.table || []).map(
    (r) => `<tr><td style="padding:7px 14px;border-bottom:1px solid #eceff3;color:#5b6472;font-size:13px;width:44%">${emEsc(r[0])}</td><td style="padding:7px 14px;border-bottom:1px solid #eceff3;color:#1f2733;font-size:13px;font-weight:600">${r[2] ? r[1] : emEsc(r[1])}</td></tr>`
  ).join("");
  const tableHtml = o.table && o.table.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3e7ee;border-radius:8px;border-collapse:separate;margin:6px 0 18px">${rows}</table>` : "";
  const callout = o.note ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr><td style="background:${o.noteColor || "#fff8e6"};border-left:4px solid ${o.noteBar || "#bf9000"};border-radius:4px;padding:12px 16px;color:#4a4028;font-size:13px;line-height:1.55">${o.note}</td></tr></table>` : "";
  const lead = (o.lead || []).map((p) => `<p style="margin:0 0 13px;color:#333c48;font-size:14px;line-height:1.65">${p}</p>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef1f5;font-family:Segoe UI,Arial,Helvetica,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${emEsc(o.preheader || o.title)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(20,30,50,.08)">
<tr><td style="background:#1f3864;padding:22px 30px">
<div style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.3px">MA GROUP</div>
<div style="color:#c7d2e6;font-size:11px;margin-top:2px">Marvellous Art \u2022 MA Building Contracting \u2022 MA Building Maintenance</div>
</td></tr>
<tr><td style="background:${o.band || "#bf9000"};padding:11px 30px;color:#ffffff;font-size:15px;font-weight:600">${emEsc(o.title)}</td></tr>
<tr><td style="padding:26px 30px 8px">
<p style="margin:0 0 15px;color:#1f2733;font-size:14px">Dear ${emEsc(o.greeting || "Partner")},</p>
${lead}
${tableHtml}
${callout}
${o.closing ? `<p style="margin:0 0 6px;color:#333c48;font-size:14px;line-height:1.65">${o.closing}</p>` : ""}
</td></tr>
<tr><td style="padding:14px 30px 26px">
<p style="margin:0;color:#1f2733;font-size:14px;line-height:1.5">Best regards,<br><strong>MA Group \u2014 Accounts &amp; Administration</strong></p>
</td></tr>
<tr><td style="background:#f4f6f9;border-top:1px solid #e3e7ee;padding:16px 30px;color:#7a8494;font-size:11px;line-height:1.6">
<a href="mailto:${emEsc(cfg.replyTo)}" style="color:#2e75b6;text-decoration:none">${emEsc(cfg.replyTo)}</a> &nbsp;|&nbsp; www.maagroup.ae &nbsp;|&nbsp; +971 80062244<br>
This is an automated notification from the MA Group Payment System. You may reply directly to this email to reach our team.
</td></tr>
</table>
</td></tr></table></body></html>`;
}
function partyWord(sup) {
  return sup && sup.type === "Supplier" ? "supplier" : "subcontractor";
}
function buildEmail(type, ctx, cfg) {
  const sup = ctx.sup || {};
  const c = ctx.cert || {};
  const to = sup.email || "";
  const greeting = sup.contactName || sup.name || "Partner";
  const proj = c.project || sup.project || "\u2014";
  if (type === "welcome") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Registration Confirmed \u2014 ${sup.name || ""} | MA Group`,
      html: emailShell(cfg, {
        title: "Vendor Registration Confirmed",
        band: "#2e7d32",
        preheader: `Your registration as an approved ${partyWord(sup)} is confirmed.`,
        lead: [
          `We are pleased to confirm that <strong>${emEsc(sup.name)}</strong> has been successfully registered as an approved ${partyWord(sup)} with MA Group.`,
          `Please retain the reference below for all future correspondence, invoices and statements.`
        ],
        table: [
          ["Registration No.", sup.regNo || "\u2014"],
          ["Party type", sup.type || "Subcontractor"],
          ["TRN", sup.trn || "\u2014"],
          ["Registered on", emDate(sup.createdAt)]
        ],
        note: `Kindly note our standing requirements: (1) submit your <strong>Statement of Account (SOA)</strong> by the <strong>25th of every month</strong> for reconciliation; (2) keep a <strong>valid trade licence</strong> on file at all times to avoid any hold on payments.`,
        closing: `We look forward to a successful working relationship.`
      })
    };
  }
  if (type === "initiated") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Payment Certificate ${c.no} Initiated \u2014 ${proj}`,
      html: emailShell(cfg, {
        title: "Payment Certificate Initiated",
        band: "#2e75b6",
        preheader: `Certificate ${c.no} has been raised and is under internal review.`,
        lead: [
          `This is to notify you that a payment certificate has been <strong>initiated in your favour</strong> and is currently under internal review and approval.`,
          `The provisional assessment is summarised below. Figures are subject to certification and may change upon final approval.`
        ],
        table: [
          ["Certificate No.", c.no],
          ["Project", proj],
          ["Your invoice ref.", c.invoiceNo || "\u2014"],
          ["Gross this certificate", emMoney(c.calc?.gross)],
          ["Net payable (provisional)", emMoney(c.calc?.payable)]
        ],
        closing: `You will receive a further notification once the certificate is approved.`
      })
    };
  }
  if (type === "approved") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Payment Certificate ${c.no} Approved \u2014 ${emMoney(c.calc?.payable)}`,
      html: emailShell(cfg, {
        title: "Payment Certificate Approved",
        band: "#2e7d32",
        preheader: `Certificate ${c.no} approved for ${emMoney(c.calc?.payable)}.`,
        lead: [
          `We are pleased to inform you that payment certificate <strong>${emEsc(c.no)}</strong> has been <strong>approved</strong> and will be processed in accordance with the agreed payment terms.`
        ],
        table: [
          ["Certificate No.", c.no],
          ["Project", proj],
          ["Your invoice ref.", c.invoiceNo || "\u2014"],
          ["Gross", emMoney(c.calc?.gross)],
          ["Retention", emMoney(c.calc?.retention)],
          ["Advance recovery", emMoney(c.calc?.advanceRecovery)],
          ["Net", emMoney(c.calc?.net)],
          ["VAT", emMoney(c.calc?.vat)],
          ["Amount payable", emMoney(c.calc?.payable)]
        ],
        closing: `A further notification will follow once payment is executed.`
      })
    };
  }
  if (type === "paid") {
    const mode = c.payment?.mode || "";
    const amt = emMoney(c.payment?.amount);
    let title = "Payment Executed", band = "#2e7d32", lead0, tbl;
    if (mode === "Bank Transfer") {
      title = "Payment Transferred";
      lead0 = `We confirm that a bank transfer of <strong>${amt}</strong> has been executed against certificate <strong>${emEsc(c.no)}</strong>.`;
      tbl = [["Certificate No.", c.no], ["Project", proj], ["Transfer ref.", c.payment?.ref || "\u2014"], ["Bank", c.payment?.bank || "\u2014"], ["Value date", emDate(c.payment?.date)], ["Amount", amt]];
    } else if (mode === "Cash") {
      title = "Payment Processed (Cash)";
      lead0 = `We confirm that a cash payment of <strong>${amt}</strong> has been processed against certificate <strong>${emEsc(c.no)}</strong> via petty cash voucher.`;
      tbl = [["Certificate No.", c.no], ["Project", proj], ["Voucher ref.", c.payment?.ref || "\u2014"], ["Date", emDate(c.payment?.date)], ["Amount", amt]];
    } else {
      title = "Cheque Issued";
      lead0 = `We confirm that a cheque of <strong>${amt}</strong> has been issued against certificate <strong>${emEsc(c.no)}</strong>. You will be notified once it is ready for collection.`;
      tbl = [["Certificate No.", c.no], ["Project", proj], ["Cheque no.", c.payment?.ref || "\u2014"], ["Bank", c.payment?.bank || "\u2014"], ["Date", emDate(c.payment?.date)], ["Amount", amt]];
    }
    const noteHtml = mode === "Bank Transfer" ? receiptNoteHtml : collectNoteHtml;
    return {
      to,
      toName: greeting,
      greeting,
      subject: `${title} \u2014 ${c.no} | ${amt}`,
      html: emailShell(cfg, { title, band, preheader: `${title} for certificate ${c.no}.`, lead: [lead0], table: tbl, note: noteHtml, closing: `Kindly acknowledge receipt by return email.` })
    };
  }
  if (type === "cheque") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Cheque Ready for Collection \u2014 ${c.no}`,
      html: emailShell(cfg, {
        title: "Cheque Ready for Collection",
        band: "#2e75b6",
        preheader: `Cheque ${c.payment?.ref || ""} is ready for collection.`,
        lead: [`We are pleased to inform you that your cheque against certificate <strong>${emEsc(c.no)}</strong> has been prepared and is <strong>ready for collection</strong> from our office.`],
        table: [["Certificate No.", c.no], ["Project", proj], ["Cheque no.", c.payment?.ref || "\u2014"], ["Bank", c.payment?.bank || "\u2014"], ["Amount", emMoney(c.payment?.amount)]],
        note: collectNoteHtml
      })
    };
  }
  if (type === "action") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Action Required \u2014 Payment Certificate ${c.no}`,
      html: emailShell(cfg, {
        title: "Action Required",
        band: "#c0392b",
        preheader: `Certificate ${c.no} requires your attention.`,
        lead: [
          `One or more items relating to payment certificate <strong>${emEsc(c.no)}</strong> require your attention before processing can continue.`,
          `This may relate to a rejected item, a deduction, or a missing document.`
        ],
        table: [["Certificate No.", c.no], ["Project", proj], ["Your invoice ref.", c.invoiceNo || "\u2014"]],
        note: `<strong>Details / remarks:</strong><br>${emEsc(ctx.comment || "Please contact our accounts team for clarification.")}`,
        noteColor: "#fdecea",
        noteBar: "#c0392b",
        closing: `Kindly review and respond at your earliest convenience so we can proceed.`
      })
    };
  }
  if (type === "licence") {
    const days = ctx.daysLeft;
    const expired = days < 0;
    return {
      to,
      toName: greeting,
      greeting,
      subject: expired ? `Trade Licence Expired \u2014 ${sup.name || ""}` : `Reminder: Trade Licence Expiring in ${days} day${days === 1 ? "" : "s"} \u2014 ${sup.name || ""}`,
      html: emailShell(cfg, {
        title: expired ? "Trade Licence Expired" : "Trade Licence Expiry Reminder",
        band: expired ? "#c0392b" : "#bf9000",
        preheader: expired ? `Your trade licence on our records has expired.` : `Your trade licence expires on ${emDate(sup.licenseExpiry)}.`,
        lead: [
          expired ? `Our records indicate that your trade licence <strong>expired on ${emDate(sup.licenseExpiry)}</strong>.` : `This is a courtesy reminder that your trade licence is due to <strong>expire on ${emDate(sup.licenseExpiry)}</strong> (${days} day${days === 1 ? "" : "s"} remaining).`,
          `To maintain active vendor status and avoid any hold on pending or future payments, kindly submit your renewed trade licence copy.`
        ],
        table: [["Company", sup.name || "\u2014"], ["Licence no.", sup.licenseNo || "\u2014"], ["Expiry date", emDate(sup.licenseExpiry)]],
        note: `Please reply to this email attaching the renewed licence. If already renewed, kindly share the updated copy so we can update our records.`,
        noteColor: expired ? "#fdecea" : "#fff8e6",
        noteBar: expired ? "#c0392b" : "#bf9000"
      })
    };
  }
  if (type === "client_issued" || type === "client_approved") {
    const cl = ctx.client || {};
    const ct = ctx.contract || {};
    const K = c.calc || {};
    const cto = cl.email || "";
    const cgreet = cl.contactName || cl.name || "Sir/Madam";
    const cproj = ct.project || "\u2014";
    const period = (c.periodFrom ? emEsc(c.periodFrom) : "") + (c.periodTo ? " \u2013 " + emEsc(c.periodTo) : "");
    const approved = type === "client_approved";
    return {
      to: cto,
      toName: cgreet,
      greeting: cgreet,
      subject: `${approved ? "Approved " : ""}Interim Payment Certificate ${c.no} \u2014 ${cproj} | ${emMoney(K.payable)}`,
      html: emailShell(cfg, {
        title: approved ? "Interim Payment Certificate \u2014 Approved" : "Interim Payment Certificate \u2014 Issued",
        band: approved ? "#2e7d32" : "#1f3864",
        preheader: `IPC ${c.no} for ${cproj}: amount due ${emMoney(K.payable)} (incl. VAT).`,
        lead: [
          `Please find below our <strong>Interim Payment Certificate ${emEsc(c.no)}</strong> in respect of works executed on <strong>${emEsc(cproj)}</strong>${period ? ` for the period ${period}` : ""}.`,
          approved
            ? `The certificate has been reviewed and <strong>approved</strong>. We kindly request settlement of the certified amount in accordance with the agreed payment terms. Our proforma / tax invoice will follow.`
            : `The certificate is submitted for your <strong>review and certification</strong>. Kindly confirm so we may proceed with our proforma / tax invoice.`
        ],
        table: [
          ["Certificate No.", c.no],
          ["Project", cproj],
          ["Contract Ref.", ct.subcontractRef || "\u2014"],
          ["Period", period || "\u2014"],
          ["Gross value certified", emMoney(K.gross)],
          ["Less retention", emMoney(K.retention)],
          ["Less advance recovery", emMoney(K.advanceRecovery)],
          ["Less previously certified", emMoney(K.prevCertified)],
          ["Net amount due (excl. VAT)", emMoney(K.net)],
          ["VAT", emMoney(K.vat)],
          ["Total payable (incl. VAT)", emMoney(K.payable)]
        ],
        note: `<strong>Amount payable in words:</strong> ${emEsc(amountWords(K.payable))}. Kindly quote certificate reference <strong>${emEsc(c.no)}</strong> on your remittance.`,
        noteColor: "#eef4ff",
        noteBar: "#1f3864",
        closing: `The signed certificate is attached / available on request. Thank you for your continued cooperation.`
      })
    };
  }
  if (type === "soa") {
    return {
      to,
      toName: greeting,
      greeting,
      subject: `Statement of Account Request \u2014 ${ctx.period || ""}`,
      html: emailShell(cfg, {
        title: "Monthly Statement of Account Request",
        band: "#2e75b6",
        preheader: `Please submit your SOA for ${ctx.period || "this period"}.`,
        lead: [
          `As part of our monthly reconciliation, we kindly request your latest <strong>Statement of Account (SOA)</strong> for the period up to <strong>${emDate(ctx.asOf)}</strong>.`,
          `Timely submission ensures your outstanding balances are reconciled and any due payments are processed without delay.`
        ],
        note: `Please reply to this email attaching your SOA in PDF or Excel format. Kindly ensure it reflects all invoices, payments received and current outstanding balance.`,
        closing: `Thank you for your continued cooperation.`
      })
    };
  }
  return null;
}
async function sendMail(s, cfg, msg) {
  const id = "E" + Date.now().toString(36) + "-" + randomBytes(3).toString("hex");
  const rec = { id, at: now(), type: msg.type || "", to: msg.to || "", toName: msg.toName || "", subject: msg.subject || "", certNo: msg.certNo || "", supplierId: msg.supplierId || "", status: "", detail: "" };
  const split = (v) => String(v || "").split(/[;,]/).map((a) => a.trim()).filter(Boolean);
  const useSmtp = cfg.provider === "smtp" && cfg.smtpUser && cfg.smtpPass;
  const useZepto = cfg.provider === "zeptomail" && cfg.token;
  try {
    if (!msg.to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(msg.to)) {
      rec.status = "skipped";
      rec.detail = "no valid recipient email";
    } else if (!cfg.enabled) {
      rec.status = "disabled";
      rec.detail = "email notifications disabled";
    } else if (msg.type && cfg.triggers && cfg.triggers[msg.type] === false) {
      rec.status = "disabled";
      rec.detail = "trigger disabled in settings";
    } else if (!useSmtp && !useZepto) {
      rec.status = "logged";
      rec.detail = cfg.provider === "smtp" ? "Zoho Mail app password not set \u2014 composed but not sent" : "no provider token configured \u2014 composed but not sent";
    } else if (useSmtp) {
      const transport = import_nodemailer.default.createTransport({
        host: cfg.smtpHost,
        port: cfg.smtpPort,
        secure: cfg.smtpPort === 465,
        auth: { user: cfg.smtpUser, pass: cfg.smtpPass }
      });
      const info = await transport.sendMail({
        from: `"${cfg.fromName}" <${cfg.from}>`,
        to: msg.toName ? `"${msg.toName}" <${msg.to}>` : msg.to,
        replyTo: cfg.replyTo,
        cc: split(cfg.cc).join(", ") || void 0,
        bcc: split(cfg.bcc).join(", ") || void 0,
        subject: msg.subject,
        html: msg.html
      });
      rec.status = "sent";
      rec.detail = info && info.messageId ? "" : "";
    } else {
      const body = {
        from: { address: cfg.from, name: cfg.fromName },
        to: [{ email_address: { address: msg.to, name: msg.toName || msg.to } }],
        reply_to: [{ address: cfg.replyTo, name: cfg.fromName }],
        subject: msg.subject,
        htmlbody: msg.html
      };
      const cc = split(cfg.cc);
      if (cc.length) body.cc = cc.map((a) => ({ email_address: { address: a } }));
      const bcc = split(cfg.bcc);
      if (bcc.length) body.bcc = bcc.map((a) => ({ email_address: { address: a } }));
      const resp = await fetch(`https://${cfg.host}/v1.1/email`, {
        method: "POST",
        headers: { "Authorization": `Zoho-enczapikey ${cfg.token}`, "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body)
      });
      const txt = await resp.text();
      rec.status = resp.ok ? "sent" : "error";
      rec.detail = resp.ok ? "" : `HTTP ${resp.status}: ${txt.slice(0, 400)}`;
    }
  } catch (e) {
    rec.status = "error";
    rec.detail = String(e && e.message || e).slice(0, 400);
  }
  try {
    await s.setJSON("emaillog/" + id, rec);
  } catch {
  }
  return rec;
}
async function notify(s, type, ctx) {
  try {
    const cfg = await getEmailCfg(s);
    const t = buildEmail(type, ctx, cfg);
    if (!t) return null;
    return await sendMail(s, cfg, { type, to: t.to, toName: t.toName, subject: t.subject, html: t.html, certNo: ctx.cert?.no, supplierId: ctx.sup?.id });
  } catch (e) {
    return null;
  }
}
function daysUntil(dateStr) {
  const m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const exp = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  const t = /* @__PURE__ */ new Date();
  const today = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
  return Math.round((exp - today) / 864e5);
}
async function runLicenceJob(s) {
  const suppliers = await listSuppliers();
  const sent = [];
  let scanned = 0;
  for (const sup of suppliers) {
    if (sup.status && sup.status !== "Active" || !sup.email || !sup.licenseExpiry) continue;
    scanned++;
    const d = daysUntil(sup.licenseExpiry);
    if (d === null) continue;
    const due = [30, 14, 7, 3, 1, 0].includes(d) || d < 0 && d % 7 === 0;
    if (!due) continue;
    const rec = await notify(s, "licence", { sup, daysLeft: d });
    sent.push({ supplier: sup.name, daysLeft: d, status: rec?.status });
  }
  return { job: "licence", scanned, notified: sent.length, sent };
}
async function runSoaJob(s) {
  const suppliers = await listSuppliers();
  const t = /* @__PURE__ */ new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const period = `${months[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
  const asOf = t.toISOString().slice(0, 10);
  const sent = [];
  for (const sup of suppliers) {
    if (sup.status && sup.status !== "Active" || !sup.email) continue;
    const rec = await notify(s, "soa", { sup, period, asOf });
    sent.push({ supplier: sup.name, status: rec?.status });
  }
  return { job: "soa", period, notified: sent.length, sent };
}
async function getSecret() {
  const s = store();
  let sec = await s.get("secret");
  if (!sec) {
    sec = randomBytes(32).toString("hex");
    await s.set("secret", sec);
  }
  return sec;
}
async function makeToken(userId) {
  const exp = Date.now() + 12 * 3600 * 1e3;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", await getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}
async function verifyToken(tok) {
  if (!tok) return null;
  try {
    const raw = Buffer.from(tok, "base64url").toString();
    const [userId, exp, sig] = raw.split(".");
    if (Number(exp) < Date.now()) return null;
    const good = createHmac("sha256", await getSecret()).update(`${userId}.${exp}`).digest("hex");
    return sig === good ? userId : null;
  } catch {
    return null;
  }
}
var CHEQUE_LAYOUT = {
  layoutVersion: 5,
  widthMm: 297,
  heightMm: 210,
  fontPt: 11,
  offsetXmm: 0,
  offsetYmm: 0,
  wordsWrapMm: 112,
  paper: "A4",
  fields: {
    date: { x: 227, y: 87, label: "Date" },
    payee: { x: 132, y: 94, label: "Payee" },
    words1: { x: 132, y: 107, label: "Amount in words (line 1)" },
    words2: { x: 132, y: 114, label: "Amount in words (line 2)" },
    figures: { x: 240, y: 115, label: "Amount in figures" }
  }
};
var DEFAULT_SETTINGS = {
  entities: [
    {
      short: "Marvellous Art",
      name: "MARVELLOUS ART DECORATION DESIGN & FIT OUT CO. L.L.C",
      line2: "Company ID 1175355 \u2022 Nad Al Hamar, Dubai, U.A.E \u2022 P.O. Box DXB 455277",
      line3: "TRN: 104117106500003 | Tel: +971 80062244 | Info@maagroup.ae | www.maagroup.ae"
    },
    { short: "MA Building Contracting", name: "M A FOR BUILDING CONTRACTING CO. L.L.C", line2: "Dubai, U.A.E", line3: "" },
    { short: "MA Building Maintenance", name: "MA BUILDING MAINTENANCE L.L.C", line2: "Dubai, U.A.E", line3: "" }
  ],
  projects: [
    { code: "AST", name: "Aster Garden Jabal Ali" },
    { code: "SQU", name: "The Square 2.0 Infrastructure" },
    { code: "HQ", name: "MA HQ – Operations", fixed: true, kind: "overhead" }
  ],
  banks: ["Emirates NBD \u2014 M 3303"],
  modes: ["Cheque", "Cash", "Bank Transfer"],
  trades: [
    "Civil / Substructure Works",
    "Blockwork & Masonry",
    "Roofing & Waterproofing",
    "Finishes (Tiles, Plaster, Paint)",
    "Carpentry & Joinery",
    "Metal Work & Glazing",
    "MEP - Plumbing & Drainage",
    "MEP - Electrical",
    "MEP - Air Conditioning",
    "MEP - Firefighting",
    "Gypsum & Partitions",
    "External Works",
    "Material Supply",
    "Skilled & Unskilled Labour",
    "Plant & Equipment",
    "Transport & Logistics",
    "Professional Fees",
    "Other / General"
  ],
  cheque: CHEQUE_LAYOUT,
  seq: 0,
  supplierSeq: 0
};
var ROLES = ["CEO", "QS", "PM", "Accounts", "Secretary"];
var DEFAULT_USERS = [
  { id: "ceo", name: "Mohammed Abuassba", role: "CEO", salt: "", pinHash: "" },
  { id: "qs", name: "QS / Site Engineer", role: "QS", salt: "", pinHash: "" },
  { id: "pm", name: "PM / Commercial", role: "PM", salt: "", pinHash: "" },
  { id: "accounts", name: "Accounts", role: "Accounts", salt: "", pinHash: "" },
  { id: "secretary", name: "Secretary / Reception", role: "Secretary", salt: "", pinHash: "" }
];
var DEFAULT_PINS = { ceo: "1234", qs: "1111", pm: "2222", accounts: "3333", secretary: "4444" };
async function ensureInit() {
  const s = store();
  let settings = await s.get("settings", { type: "json" });
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await s.setJSON("settings", settings);
  }
  let patched = false;
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (settings[k] === void 0) {
      settings[k] = DEFAULT_SETTINGS[k];
      patched = true;
    }
  }
  if (!settings.cheque || settings.cheque.layoutVersion !== CHEQUE_LAYOUT.layoutVersion) {
    settings.cheque = CHEQUE_LAYOUT;
    patched = true;
  }
  if (ensureHQProject(settings)) patched = true;
  if (patched) await s.setJSON("settings", settings);
  let users = await s.get("users", { type: "json" });
  if (!users) {
    users = DEFAULT_USERS.map((u) => ({ ...u, salt: randomBytes(8).toString("hex") }));
    users.forEach((u) => {
      u.pinHash = hashPin(DEFAULT_PINS[u.id], u.salt);
      u.mustChangePin = true;
    });
    await s.setJSON("users", users);
  } else if (!users.find((u) => u.id === "secretary")) {
    const sec = { id: "secretary", name: "Secretary / Reception", role: "Secretary", salt: randomBytes(8).toString("hex"), pinHash: "" };
    sec.pinHash = hashPin("4444", sec.salt);
    sec.mustChangePin = true;
    users.push(sec);
    await s.setJSON("users", users);
  }
  return { settings, users };
}
async function getAllJSON(s, prefix) {
  const { blobs } = await s.list({ prefix });
  const out = [];
  for (let i = 0; i < blobs.length; i += 60) {
    const part = await Promise.all(blobs.slice(i, i + 60).map((b) => s.get(b.key, { type: "json" }).catch(() => null)));
    for (const v of part) if (v) out.push(v);
  }
  return out;
}
async function listSuppliers() {
  const out = await getAllJSON(store(), "supplier/");
  out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return out;
}
async function certsBySupplier(supplierId, excludeNo) {
  const out = await getAllJSON(store(), "cert/");
  return out.filter((c) => c && c.no !== excludeNo && c.status !== "Cancelled" && c.supplierId === supplierId);
}
function computeCert(c, supplier, prevNet, recoveredSoFar) {
  const isRate = c.basis === "rate";
  const adjusted = isRate ? 0 : num(c.originalValue) + num(c.variations);
  // Rate-based (services) contracts: each certificate stands alone, certified
  // against the supplier's submitted invoice amount — no cumulative % of a
  // fixed contract sum and no deduction of previous certificates.
  const cumValue = isRate ? r2(num(c.invoiceAmount)) : r2(adjusted * num(c.workPct));
  const gross = r2(cumValue + num(c.materialsOnSite));
  const retention = r2(gross * num(c.retentionPct));
  const afterRet = r2(gross - retention);
  let advanceRecovery = 0, advanceAmount = 0, advanceRate = 0;
  if (supplier) {
    advanceAmount = num(supplier.advanceAmount);
    advanceRate = num(supplier.advanceRecoveryRate);
    if (advanceAmount > 0 && advanceRate > 0) {
      const remaining = Math.max(0, r2(advanceAmount - recoveredSoFar));
      advanceRecovery = Math.min(r2(advanceRate * gross), remaining);
    }
  } else advanceRecovery = num(c.advanceRecovery);
  const net = r2(afterRet - advanceRecovery - (isRate ? 0 : prevNet) - num(c.contra));
  const vat = r2(net * num(c.vatPct));
  return {
    adjusted,
    cumValue,
    gross,
    retention,
    afterRet,
    advanceRecovery,
    advanceAmount,
    advanceRate,
    advanceRecoveredToDate: r2(recoveredSoFar + advanceRecovery),
    advanceOutstanding: Math.max(0, r2(advanceAmount - recoveredSoFar - advanceRecovery)),
    prevCertified: prevNet,
    net,
    vat,
    payable: r2(net + vat)
  };
}
async function recompute(c, supplier) {
  const priors = await certsBySupplier(c.supplierId, c.no);
  const before = priors.filter((p) => (p.seq || 0) < (c.seq || 0));
  const prevNet = r2(before.reduce((a, p) => a + (p.calc?.net || 0), 0));
  const recoveredSoFar = r2(before.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
  c.calc = computeCert(c, supplier, prevNet, recoveredSoFar);
  return c;
}
function certNo(projectName, supplierName, seq, projects) {
  const proj = projects.find((p) => p.name === projectName);
  let pro = proj?.code;
  if (!pro) {
    let base = (projectName || "GEN").trim();
    if (base.toLowerCase().startsWith("the ")) base = base.slice(4);
    pro = base.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "GEN";
  }
  const sup = (supplierName || "").replace(/\s+/g, "").slice(0, 3).toUpperCase() || "SUP";
  return `${pro}-${sup}-MA${String(seq).padStart(3, "0")}`;
}
var CAN = {
  create: ["QS", "CEO"],
  editDraft: ["QS", "PM", "CEO"],
  submit: ["QS", "CEO"],
  check: ["PM", "CEO"],
  approve: ["CEO"],
  reject: ["PM", "CEO"],
  pay: ["Accounts", "CEO"],
  cancel: ["CEO"],
  admin: ["CEO"],
  suppliers: ["QS", "PM", "CEO", "Secretary"],
  assets: ["CEO", "PM", "Secretary", "QS"],
  assetsDelete: ["CEO"],
  clients: ["CEO", "PM", "QS", "Secretary"],
  contracts: ["CEO", "PM", "QS"],
  clientcert: ["CEO", "PM", "QS"],
  clientcertIssue: ["CEO", "PM"],
  expense: ["CEO", "PM", "QS", "Accounts", "Secretary"],
  expenseDelete: ["CEO", "PM"],
  pnl: ["CEO", "PM", "QS", "Accounts"],
  budget: ["CEO", "PM", "QS", "Accounts"],
  budgetEdit: ["CEO", "PM", "QS"]
};
var DOC_KINDS = ["license", "trn", "bank", "establishment", "other"];
var ASSET_CATS = [
  { code: "IT", name: "IT & Electronics", life: 3 },
  { code: "OE", name: "Office Equipment", life: 5 },
  { code: "FUR", name: "Furniture", life: 5 },
  { code: "APP", name: "Appliances", life: 5 },
  { code: "DEC", name: "Décor & Lighting", life: 5 },
  { code: "TLS", name: "Tools", life: 3 },
  { code: "VEH", name: "Vehicles", life: 5 },
  { code: "MCH", name: "Machinery & Site Equipment", life: 7 }
];
var ASSET_CONDITIONS = ["Good", "Fair", "Needs repair", "New"];
var ASSET_STATUS = ["Active", "Disposed", "Sold", "Written off"];
function assetCode(cat, seq) { return `MAG-${cat}-${String(seq).padStart(4, "0")}`; }
async function listAssets() {
  const out = (await getAllJSON(store(), "asset/MAG-")).filter((v) => v && v.code);
  out.sort((a, b) => (a.code || "").localeCompare(b.code || "", void 0, { numeric: true }));
  return out;
}
function assetDepreciation(a) {
  const cost = num(a.cost), life = num(a.life) || 0, resid = num(a.residPct) || 0;
  const depreciable = r2(cost * (1 - resid));
  const depPerYear = life > 0 ? r2(depreciable / life) : 0;
  let age = 0;
  if (a.purchaseDate) {
    const m = String(a.purchaseDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) { const pd = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); age = Math.max(0, (Date.now() - pd) / (365.25 * 864e5)); }
  }
  let accum = (a.status && a.status !== "Active") ? depreciable : r2(Math.min(depreciable, depPerYear * age));
  const nbv = r2(cost - accum);
  return { depPerYear, age: r2(age), accumDep: r2(accum), nbv: Math.max(0, nbv) };
}
// ===================== CLIENT (RECEIVABLES) MODULE =====================
async function listClients() {
  const out = await getAllJSON(store(), "client/");
  out.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return out;
}
async function listContracts() {
  const out = await getAllJSON(store(), "contract/");
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}
async function clientCertsByContract(contractId, excludeNo) {
  const out = await getAllJSON(store(), "clientcert/");
  return out.filter((c) => c && c.no !== excludeNo && c.status !== "Cancelled" && c.contractId === contractId);
}
function computeClientCert(c, contract, prevNet, recoveredSoFar) {
  const cumValue = num(c.grossCum);
  const mos = num(c.mos);
  const gross = r2(cumValue + mos);
  const retentionPct = num(contract?.retentionPct);
  const retention = r2(gross * retentionPct);
  const afterRet = r2(gross - retention);
  let advanceRecovery = 0;
  const advanceAmount = num(contract?.advanceAmount), advanceRate = num(contract?.recoveryRate);
  if (advanceAmount > 0 && advanceRate > 0) {
    const remaining = Math.max(0, r2(advanceAmount - recoveredSoFar));
    advanceRecovery = Math.min(r2(advanceRate * gross), remaining);
  }
  const contra = num(c.contra);
  const net = r2(afterRet - advanceRecovery - prevNet - contra);
  const vatPct = num(contract?.vatPct);
  const vat = r2(net * vatPct);
  return {
    cumValue, mos, gross, retentionPct, retention, afterRet,
    advanceAmount, advanceRate, advanceRecovery,
    advanceRecoveredToDate: r2(recoveredSoFar + advanceRecovery),
    advanceOutstanding: Math.max(0, r2(advanceAmount - recoveredSoFar - advanceRecovery)),
    retentionHeld: retention,
    prevCertified: prevNet, contra, net, vatPct, vat, payable: r2(net + vat)
  };
}
async function recomputeClientCert(c, contract) {
  const priors = await clientCertsByContract(c.contractId, c.no);
  const before = priors.filter((p) => (p.seq || 0) < (c.seq || 0));
  const prevNet = r2(before.reduce((a, p) => a + (p.calc?.net || 0), 0));
  const recoveredSoFar = r2(before.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
  c.calc = computeClientCert(c, contract, prevNet, recoveredSoFar);
  return c;
}
function clientCertNo(contract, client, seq, dateStr) {
  let yr = "";
  const m = String(dateStr || now()).match(/^(\d{4})/);
  yr = m ? m[1].slice(-2) : String((/* @__PURE__ */ new Date()).getFullYear()).slice(-2);
  const first = String(client?.name || contract?.mainContractor || "CLIENT").trim().split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "CLIENT";
  const proj = (String(contract?.projShort || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || String(contract?.project || "PRJ").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3)).slice(0, 3).padEnd(3, "X");
  return `PC/MA${yr}/${first}/${proj}/${String(seq).padStart(3, "0")}`;
}
function clientCertKey(contractId, seq) {
  return `${contractId}-${String(seq).padStart(3, "0")}`;
}
async function resolveClientCert(s, param) {
  const p = decodeURIComponent(param);
  // Fast path: certs stored under their slash-free key
  let c = await s.get("clientcert/" + p, { type: "json" });
  if (c) return { c, storeKey: "clientcert/" + p, derivedKey: c.key || clientCertKey(c.contractId, c.seq) };
  // Fallback: scan (handles legacy certs stored under a slash-containing "no",
  // and lookups by cert number). Self-heals by migrating to the clean key path.
  const { blobs } = await s.list({ prefix: "clientcert/" });
  for (const bl of blobs) {
    const cc = await s.get(bl.key, { type: "json" });
    if (!cc) continue;
    const k = cc.key || clientCertKey(cc.contractId, cc.seq);
    if (k === p || cc.no === p || bl.key === "clientcert/" + p) {
      const cleanKey = "clientcert/" + k;
      if (bl.key !== cleanKey) {
        cc.key = k;
        try { await s.setJSON(cleanKey, cc); await s.delete(bl.key); } catch {}
        return { c: cc, storeKey: cleanKey, derivedKey: k };
      }
      return { c: cc, storeKey: bl.key, derivedKey: k };
    }
  }
  return null;
}
// ---------- Project cost log (expenses) & P&L ----------
var COST_TYPES = [
  { name: "Material Supply", group: "Direct" },
  { name: "Labour (Direct)", group: "Direct" },
  { name: "Subcontractor", group: "Direct" },
  { name: "Equipment / Plant", group: "Direct" },
  { name: "Labour (Indirect)", group: "Indirect" },
  { name: "Professional Fees", group: "Indirect" },
  { name: "Overhead / Admin", group: "Overhead" },
  { name: "Financing / Bank Charges", group: "Overhead" },
  { name: "Insurance & Bonds", group: "Overhead" }
];
var EXPENSE_CATEGORIES = [
  "Civil / Substructure Works", "Blockwork & Masonry", "Roofing & Waterproofing", "Finishes (Tiles, Plaster, Paint)",
  "Carpentry & Joinery", "Metal Work & Glazing", "MEP – Plumbing & Drainage", "MEP – Electrical",
  "MEP – Air Conditioning", "MEP – Firefighting", "Foundations (Types A/B/C)", "Substation Works", "External Works",
  "Site Management & Engineers", "Skilled & Unskilled Labour", "Plant & Equipment", "Temporary Facilities",
  "Testing & Commissioning", "Shop Drawings & Submittals", "HSE & Safety Compliance", "Transport & Logistics",
  "Head Office Overhead", "Financing / Bank Charges", "Insurance & Bonds", "General / Other"
];
var EXPENSE_STATUS = ["Pending", "Partially Paid", "Paid", "On Hold", "Disputed"];
var HQ_PROJECT = "MA HQ – Operations";
var HQ_CODE = "HQ";
// MA HQ is a permanent overhead/operations cost centre — recurring monthly
// office costs and payments book against it. It is a fixed project (cannot be
// removed) and its costs are reported as company overhead, not project cost.
function ensureHQProject(st) {
  if (!st) return false;
  if (!Array.isArray(st.projects)) st.projects = [];
  const hit = st.projects.find((p) => p && (p.code === HQ_CODE || String(p.name || "").trim().toLowerCase() === HQ_PROJECT.toLowerCase() || String(p.name || "").trim().toLowerCase() === "ma - hq expenses"));
  if (hit) {
    let ch = false;
    if (hit.code !== HQ_CODE) { hit.code = HQ_CODE; ch = true; }
    if (hit.name !== HQ_PROJECT) { hit.name = HQ_PROJECT; ch = true; }
    if (!hit.fixed) { hit.fixed = true; ch = true; }
    if (hit.kind !== "overhead") { hit.kind = "overhead"; ch = true; }
    return ch;
  }
  st.projects.push({ code: HQ_CODE, name: HQ_PROJECT, fixed: true, kind: "overhead" });
  return true;
}
var BANK_DETAILS = {
  "Marvellous Art": { bank: "Emirates NBD, Dubai, U.A.E", accountName: "MARVELLOUS ART DECORATION DESIGN & FIT OUT CO. L.L.C", account: "6605844299001", iban: "AE620260006605844299001", currency: "AED" }
};
function bankFor(entityShort) { return BANK_DETAILS[entityShort] || BANK_DETAILS["Marvellous Art"]; }
function proformaNo(seq, dateStr) {
  const m = String(dateStr || now()).match(/^(\d{4})/);
  const yr = m ? m[1] : String((/* @__PURE__ */ new Date()).getFullYear());
  return `MAG/${yr}/PI-${String(seq).padStart(5, "0")}`;
}
function costGroup(type) { const t = COST_TYPES.find((x) => x.name === type); return t ? t.group : "Direct"; }
async function listExpenses(project) {
  const all = await getAllJSON(store(), "expense/");
  const out = project ? all.filter((v) => v.project === project) : all;
  out.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0));
  return out;
}
async function projectNames(s) {
  const set = /* @__PURE__ */ new Set();
  set.add(HQ_PROJECT);
  const st = await s.get("settings", { type: "json" });
  if (st && Array.isArray(st.projects)) for (const p of st.projects) { if (p && p.name) set.add(String(p.name)); }
  const parts = await Promise.all(["contract/", "cert/", "expense/"].map((pfx) => getAllJSON(s, pfx)));
  for (const arr of parts) for (const v of arr) { if (v && v.project) set.add(String(v.project)); }
  return [...set].sort((a, b) => a.localeCompare(b));
}
async function ensureSupplierStub(s, name) {
  name = String(name || "").trim();
  if (!name) return null;
  const sups = await getAllJSON(s, "supplier/");
  const hit = sups.find((v) => String(v.name || "").trim().toLowerCase() === name.toLowerCase());
  if (hit) return hit.id;
  const st = await s.get("settings", { type: "json" });
  st.supplierSeq = (st.supplierSeq || 0) + 1;
  const id = "S" + String(st.supplierSeq).padStart(3, "0");
  const ent = st.entities && st.entities[0] && st.entities[0].short || "Marvellous Art";
  await s.setJSON("settings", st);
  await s.setJSON("supplier/" + id, {
    id, type: "Subcontractor", name, tradeName: "", licenseNo: "", licenseExpiry: "", establishmentCard: "", address: "", poBox: "", emirate: "", website: "",
    category: "", trade: "", contactName: "", contactDesignation: "", mobile: "", tel: "", contact: "", email: "", trn: "", vatRegistered: false,
    bank: "", accountName: "", accountNo: "", iban: "", swift: "", entity: ent, project: "", lpoRef: "", contractValue: 0, vatPct: 0.05, retentionPct: 0.1,
    dlpMonths: 0, retentionRelease: "", advanceAmount: 0, advanceRecoveryRate: 0, advanceDate: "", advanceRef: "",
    notes: "Auto-created from the cost log — please complete TRN, contact, email and bank details.",
    status: "Prospect", source: "cost-log", incomplete: true, docs: {}, regNo: "MA-SUP-" + id,
    createdAt: now(), createdBy: "system", updatedAt: now()
  });
  return id;
}
async function upsertCertExpense(s, c) {
  // Auto-post an approved/paid supplier IPC as a cost line (idempotent by cert no).
  if (!c || !c.project) return;
  const id = "XPC-" + c.no.replace(/[^A-Za-z0-9]+/g, "_");
  const existing = await s.get("expense/" + id, { type: "json" });
  const amount = num(c.calc?.net);
  const paid = c.status === "Paid" ? num(c.payment?.amount || c.calc?.payable) : num(existing?.paid);
  const exp = {
    id, seq: existing?.seq || 0, project: c.project,
    date: (c.payment?.date || c.date || now().slice(0, 10)).slice(0, 10),
    area: existing?.area || "General / All", category: existing?.category || (c.trade || "Subcontractor"),
    costType: existing?.costType || "Subcontractor",
    supplier: c.supplier || "", supplierId: c.supplierId || existing?.supplierId || null, invoiceNo: c.invoiceNo || "", description: `Supplier IPC ${c.no}${c.invoiceNo ? " — inv " + c.invoiceNo : ""}`,
    poRef: c.lpoRef || "", boqRef: existing?.boqRef || "",
    budgeted: num(existing?.budgeted), amount, status: c.status === "Paid" ? "Paid" : "Pending", paid,
    notes: existing?.notes || "", supplierCertNo: c.no, source: "supplier-ipc",
    createdBy: existing?.createdBy || "system", createdAt: existing?.createdAt || now(), updatedAt: now()
  };
  await s.setJSON("expense/" + id, exp);
}
async function computePnl(s, project) {
  const expenses = await listExpenses(project);
  let cost = 0, paidOut = 0;
  const byType = {}, byCat = {}, byGroup = { Direct: 0, Indirect: 0, Overhead: 0 }, byDate = {}, byProject = {};
  let hqCost = 0;
  for (const e of expenses) {
    const a = num(e.amount), p = num(e.paid);
    const isHQ = e.project === HQ_PROJECT;
    cost += a; paidOut += p;
    if (isHQ) hqCost += a;
    byType[e.costType] = (byType[e.costType] || 0) + a;
    byCat[e.category] = (byCat[e.category] || 0) + a;
    byGroup[isHQ ? "Overhead" : costGroup(e.costType)] = (byGroup[isHQ ? "Overhead" : costGroup(e.costType)] || 0) + a;
    byProject[e.project] = (byProject[e.project] || 0) + a;
    const d = String(e.date || "").slice(0, 10);
    if (d) { byDate[d] = byDate[d] || { cost: 0, paid: 0 }; byDate[d].cost += a; byDate[d].paid += p; }
  }
  const [contracts, allCC] = await Promise.all([listContracts(), getAllJSON(s, "clientcert/")]);
  const projContracts = contracts.filter((c) => !project || c.project === project);
  const cids = new Set(projContracts.map((c) => c.id));
  const maxGross = {}, netCertified = {};
  for (const c of allCC) {
    if (!c || !cids.has(c.contractId)) continue;
    if (!["Issued", "Approved"].includes(c.status)) continue;
    const g = num(c.calc?.gross);
    if (g > (maxGross[c.contractId] || 0)) maxGross[c.contractId] = g;
    netCertified[c.contractId] = (netCertified[c.contractId] || 0) + num(c.calc?.net);
  }
  let revenue = 0, netDue = 0;
  for (const cid in maxGross) revenue += maxGross[cid];
  for (const cid in netCertified) netDue += netCertified[cid];
  revenue = r2(revenue);
  const grossProfit = r2(revenue - cost);
  const margin = revenue ? grossProfit / revenue : 0;
  return {
    project: project || "", scope: project || "All projects",
    revenue, netDue: r2(netDue), cost: r2(cost), paidOut: r2(paidOut), hqCost: r2(hqCost), projectCost: r2(cost - hqCost),
    grossProfit, margin, byType, byCat, byGroup, byProject,
    count: expenses.length,
    byDate: Object.entries(byDate).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([d, v]) => ({ date: d, cost: r2(v.cost), paid: r2(v.paid) })),
    expenses: expenses.slice(0, 800)
  };
}
function budgetSlug(p) { return String(p).replace(/[^A-Za-z0-9]+/g, "_"); }
async function projectAreas(s, project) {
  const set = /* @__PURE__ */ new Set();
  const [bud, exps] = await Promise.all([s.get("budget/" + budgetSlug(project), { type: "json" }), getAllJSON(s, "expense/")]);
  if (bud && bud.lines) for (const l of bud.lines) { if (l.area) set.add(String(l.area)); }
  for (const e of exps) { if (e && e.project === project && e.area) set.add(String(e.area)); }
  return [...set].sort((a, b) => a.localeCompare(b));
}
async function computeBudget(s, project) {
  const bud = await s.get("budget/" + budgetSlug(project), { type: "json" }) || { project, lines: [] };
  const expenses = await listExpenses(project);
  const actualByArea = {}; let totalActual = 0;
  for (const e of expenses) { const a = num(e.amount); totalActual += a; const k = String(e.area || "").trim() || "(unassigned)"; actualByArea[k] = (actualByArea[k] || 0) + a; }
  let lines = bud.lines || [];
  if (!lines.length) { lines = Object.keys(actualByArea).map((area) => ({ area, boq: 0, targetPct: 0.85, pctComplete: 0 })); }
  const computed = lines.map((l) => {
    const boq = num(l.boq), tPct = l.targetPct == null ? 0.85 : num(l.targetPct), pct = num(l.pctComplete);
    const matched = r2(actualByArea[l.area] || 0);
    const hasOv = l.actualOverride != null && l.actualOverride !== "";
    const actual = hasOv ? r2(num(l.actualOverride)) : matched;
    const target = r2(boq * tPct), ev = r2(target * pct);
    const eac = pct > 0 ? r2(actual / pct) : (boq > 0 ? target : actual);
    const bac = target, vac = r2(bac - eac), cpi = actual > 0 ? r2(ev / actual) : null;
    const status = boq === 0 ? "—" : vac < 0 ? "Overrun" : vac < bac * 0.05 ? "Watch" : "On budget";
    return { area: l.area, boq, targetPct: tPct, pctComplete: pct, actualMatched: matched, actualOverride: hasOv ? r2(num(l.actualOverride)) : null, target, actual, ev, eac, bac, vac, cpi, status };
  });
  const matchedAreas = new Set(lines.map((l) => l.area));
  let unalloc = 0; for (const k in actualByArea) { if (!matchedAreas.has(k)) unalloc += actualByArea[k]; }
  const sum = (f) => r2(computed.reduce((a, l) => a + f(l), 0));
  const totEv = sum((l) => l.ev), totTarget = sum((l) => l.target), totActual = r2(sum((l) => l.actual) + unalloc);
  const totals = {
    boq: sum((l) => l.boq), target: totTarget, actual: totActual,
    eac: r2(sum((l) => l.eac) + unalloc), ev: totEv,
    overallPct: totTarget ? r2(totEv / totTarget) : 0, cpi: totActual ? r2(totEv / totActual) : null
  };
  totals.vac = r2(totals.target - totals.eac);
  return { project, lines: computed, unalloc: r2(unalloc), saved: !!(bud.lines && bud.lines.length), totals };
}
var api_default = async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/, "");
  const s = store();
  const { settings, users } = await ensureInit();
  if (path === "login" && req.method === "POST") {
    const { userId: userId2, pin } = await req.json();
    const u = users.find((x) => x.id === userId2);
    if (!u || hashPin(String(pin || ""), u.salt) !== u.pinHash) return err("Wrong PIN", 401);
    return json({ token: await makeToken(u.id), user: { id: u.id, name: u.name, role: u.role, mustChangePin: !!u.mustChangePin } });
  }
  if (path === "userlist") return json(users.map((u) => ({ id: u.id, name: u.name, role: u.role })));
  const auth = req.headers.get("authorization") || "";
  const userId = await verifyToken(auth.startsWith("Bearer ") ? auth.slice(7) : null);
  const me = users.find((x) => x.id === userId);
  if (!me) return err("Not logged in", 401);
  const can = (a) => CAN[a].includes(me.role);
  if (path === "pin" && req.method === "POST") {
    const { pin } = await req.json();
    if (!/^\d{4,8}$/.test(String(pin))) return err("PIN must be 4-8 digits");
    const all = await s.get("users", { type: "json" });
    const u = all.find((x) => x.id === me.id);
    u.salt = randomBytes(8).toString("hex");
    u.pinHash = hashPin(String(pin), u.salt);
    u.mustChangePin = false;
    await s.setJSON("users", all);
    return json({ ok: true });
  }
  if (path === "verifypin" && req.method === "POST") {
    const { pin } = await req.json();
    return json({ ok: hashPin(String(pin || ""), me.salt) === me.pinHash });
  }
  if (path === "admin/delete" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const { kind, id, pin } = await req.json();
    if (hashPin(String(pin || ""), me.salt) !== me.pinHash) return err("Wrong CEO password", 401);
    const del = async (k) => { try { await s.delete(k); } catch {} };
    if (kind === "supplier") await del("supplier/" + id);
    else if (kind === "client") await del("client/" + id);
    else if (kind === "contract") await del("contract/" + id);
    else if (kind === "expense") await del("expense/" + id);
    else if (kind === "asset") await del("asset/" + id);
    else if (kind === "budget") await del("budget/" + budgetSlug(id));
    else if (kind === "cert") {
      await del("cert/" + id); await del("proof/" + id);
      const reg = await s.get("register", { type: "json" }) || [];
      const nr = reg.filter((r) => r.no !== id);
      if (nr.length !== reg.length) await s.setJSON("register", nr);
      const xid = "XPC-" + String(id).replace(/[^A-Za-z0-9]+/g, "_");
      await del("expense/" + xid);
    } else if (kind === "clientcert") {
      const r = await resolveClientCert(s, id);
      const no = r ? r.c.no : id;
      if (r) await del(r.storeKey); else await del("clientcert/" + id);
      const creg = await s.get("clientregister", { type: "json" }) || [];
      const nr = creg.filter((x) => x.no !== no);
      if (nr.length !== creg.length) await s.setJSON("clientregister", nr);
      return json({ ok: true });
    } else if (kind === "expenses-project") {
      const { blobs } = await s.list({ prefix: "expense/" });
      let n = 0;
      for (const b of blobs) { const e = await s.get(b.key, { type: "json" }); if (e && e.project === id) { await del(b.key); n++; } }
      return json({ ok: true, deleted: n });
    } else if (kind === "clientcerts-contract") {
      const { blobs } = await s.list({ prefix: "clientcert/" });
      let n = 0;
      for (const b of blobs) { const c = await s.get(b.key, { type: "json" }); if (c && c.contractId === id) { await del(b.key); n++; } }
      return json({ ok: true, deleted: n });
    } else return err("Unknown delete kind: " + kind);
    return json({ ok: true });
  }
  if (path === "usage") {
    if (!can("admin")) return err("CEO only", 403);
    const count = async (prefix) => (await s.list({ prefix })).blobs.length;
    const certs = await count("cert/");
    const suppliers = await count("supplier/");
    const attachments = await count("certdoc/");
    const proofs = await count("proof/");
    const supplierDocs = await count("supplierdoc/");
    const docs = attachments + proofs + supplierDocs;
    const estMB = Math.round((certs * 0.01 + suppliers * 0.01 + docs * 0.8) * 10) / 10;
    return json({ certs, suppliers, attachments, proofs, supplierDocs, docs, estMB });
  }
  if (path === "emailcfg") {
    if (!can("admin")) return err("CEO only", 403);
    if (req.method === "GET") {
      const cfg = await getEmailCfg(s);
      return json({
        enabled: cfg.enabled,
        provider: cfg.provider,
        from: cfg.from,
        fromName: cfg.fromName,
        replyTo: cfg.replyTo,
        cc: cfg.cc,
        bcc: cfg.bcc,
        host: cfg.host,
        smtpHost: cfg.smtpHost,
        smtpPort: cfg.smtpPort,
        smtpUser: cfg.smtpUser,
        smtpPassSet: !!cfg.smtpPass,
        smtpPassFromEnv: !!getEnv("SMTP_PASS"),
        tokenSet: !!cfg.token,
        tokenFromEnv: !!getEnv("ZEPTOMAIL_TOKEN"),
        triggers: cfg.triggers,
        types: EMAIL_TYPES
      });
    }
    if (req.method === "POST") {
      const b = await req.json();
      const saved = await s.get("emailcfg", { type: "json" }) || {};
      for (const k of ["enabled", "provider", "from", "fromName", "replyTo", "cc", "bcc", "host", "smtpHost", "smtpUser"]) if (b[k] !== void 0) saved[k] = b[k];
      if (b.smtpPort !== void 0) saved.smtpPort = Number(b.smtpPort) || 465;
      if (b.triggers !== void 0) saved.triggers = b.triggers;
      if (typeof b.token === "string" && b.token.trim()) saved.token = b.token.trim();
      if (typeof b.smtpPass === "string" && b.smtpPass.trim()) saved.smtpPass = b.smtpPass.trim();
      if (b.clearToken) saved.token = "";
      if (b.clearSmtpPass) saved.smtpPass = "";
      await s.setJSON("emailcfg", saved);
      return json({ ok: true });
    }
  }
  if (path === "emaillog") {
    if (!can("admin")) return err("CEO only", 403);
    const { blobs } = await s.list({ prefix: "emaillog/" });
    const out = [];
    for (const b of blobs) {
      const v = await s.get(b.key, { type: "json" });
      if (v) out.push(v);
    }
    out.sort((a, b) => a.at < b.at ? 1 : -1);
    return json({ log: out.slice(0, 200), total: out.length });
  }
  if (path === "emailtest" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const { to } = await req.json();
    const cfg = await getEmailCfg(s);
    const html = emailShell(cfg, {
      title: "Test Notification",
      band: "#2e75b6",
      lead: [`This is a test email from the MA Group Payment System, confirming that outbound notifications are configured correctly.`, `Sent at ${emDate(now())}.`],
      note: `If you received this, replies to <strong>${emEsc(cfg.replyTo)}</strong> will reach your team.`
    });
    const rec = await sendMail(s, cfg, { type: "", to: to || cfg.replyTo, toName: "Test", subject: "MA Group \u2014 Email Test", html });
    return json(rec);
  }
  if (path === "emailrun" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const { job } = await req.json();
    if (job === "licence") return json(await runLicenceJob(s));
    if (job === "soa") return json(await runSoaJob(s));
    return err("Unknown job");
  }
  if (path === "bootstrap") {
    const [certsRaw, register, suppliers, sign, stamp, assetList, clientList, contractList, clientCertList] = await Promise.all([
      getAllJSON(s, "cert/"),
      s.get("register", { type: "json" }).then((r) => r || []),
      listSuppliers(),
      s.get("asset/sign").then((v) => v || "").catch(() => ""),
      s.get("asset/stamp").then((v) => v || "").catch(() => ""),
      s.list({ prefix: "asset/MAG-" }),
      s.list({ prefix: "client/" }),
      s.list({ prefix: "contract/" }),
      s.list({ prefix: "clientcert/" })
    ]);
    const certs = certsRaw.map((c) => ({
      no: c.no, date: c.date, entity: c.entity, project: c.project, supplier: c.supplier, supplierId: c.supplierId,
      invoiceNo: c.invoiceNo, lpoRef: c.lpoRef, status: c.status,
      payable: c.calc?.payable, net: c.calc?.net, retention: c.calc?.retention, advanceRecovery: c.calc?.advanceRecovery,
      mode: c.payment?.mode, hasPayment: !!c.payment, receiptDone: !!c.payment?.receipt?.received,
      chequePrinted: !!c.payment?.printed
    }));
    certs.sort((a, b) => a.no < b.no ? 1 : -1);
    const assets = { sign, stamp };
    const assetCount = assetList.blobs.length;
    const clientCount = clientList.blobs.length;
    const contractCount = contractList.blobs.length;
    const clientCertCount = clientCertList.blobs.length;
    return json({
      me: { id: me.id, name: me.name, role: me.role },
      settings,
      certs,
      register,
      suppliers,
      assets,
      assetCount,
      clientCount,
      contractCount,
      clientCertCount,
      users: users.map((u) => ({ id: u.id, name: u.name, role: u.role }))
    });
  }
  if (path === "settings" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const body = await req.json();
    const merged = { ...settings, ...body, seq: settings.seq, supplierSeq: settings.supplierSeq };
    ensureHQProject(merged);
    await s.setJSON("settings", merged);
    return json({ ok: true, settings: merged });
  }
  if (path === "asset" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const { kind, dataUrl } = await req.json();
    if (!["sign", "stamp"].includes(kind)) return err("Bad asset kind");
    if (dataUrl && !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataUrl)) return err("Must be a PNG/JPG image");
    if (dataUrl && dataUrl.length > 7e5) return err("Image too large \u2014 under ~500 KB");
    await s.set("asset/" + kind, dataUrl || "");
    return json({ ok: true });
  }
  if (path === "users" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const { id, name, role, pin } = await req.json();
    if (!id || !name || !ROLES.includes(role)) return err("Bad user");
    const all = await s.get("users", { type: "json" });
    let u = all.find((x) => x.id === id);
    if (!u) {
      u = { id, salt: randomBytes(8).toString("hex"), pinHash: "" };
      all.push(u);
    }
    u.name = name;
    u.role = role;
    if (pin) {
      u.salt = randomBytes(8).toString("hex");
      u.pinHash = hashPin(String(pin), u.salt);
      u.mustChangePin = true;
    }
    await s.setJSON("users", all);
    return json({ ok: true });
  }
  if (path === "supplier" && req.method === "POST") {
    if (!can("suppliers")) return err("No rights", 403);
    const b = await req.json();
    if (!b.name) return err("Legal name is required");
    const emailIn = (b.email || "").trim();
    if (!emailIn || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailIn)) return err("A valid email address is required (mandatory for notifications)");
    // Anti-duplication: on a NEW registration, match an existing supplier by
    // legal name, TRN or trade-licence no. A name-only stub (auto-created from
    // the cost log) is completed in place; a real duplicate is rejected.
    if (!b.id) {
      const dsups = await getAllJSON(s, "supplier/");
      const dn = (x) => String(x || "").trim().toLowerCase();
      const nameHit = dsups.find((v) => dn(v.name) === dn(b.name));
      const trnHit = b.trn ? dsups.find((v) => v.trn && dn(v.trn) === dn(b.trn)) : null;
      const licHit = b.licenseNo ? dsups.find((v) => v.licenseNo && dn(v.licenseNo) === dn(b.licenseNo)) : null;
      const hit = nameHit || trnHit || licHit;
      if (hit) {
        if (hit.incomplete || hit.source === "cost-log") { b.id = hit.id; }
        else {
          const why = nameHit ? `name "${b.name}"` : trnHit ? `TRN ${b.trn}` : `trade licence ${b.licenseNo}`;
          return err(`A supplier with the same ${why} already exists (${hit.id} — ${hit.name}). Open that record to edit it instead of creating a duplicate.`, 409);
        }
      }
    }
    const st = await s.get("settings", { type: "json" });
    let id = b.id;
    if (!id) {
      st.supplierSeq = (st.supplierSeq || 0) + 1;
      id = "S" + String(st.supplierSeq).padStart(3, "0");
      await s.setJSON("settings", st);
    }
    const existing = b.id ? await s.get("supplier/" + b.id, { type: "json" }) : null;
    const str = (k) => b[k] === void 0 ? existing?.[k] || "" : b[k] || "";
    const ptype = b.type === "Supplier" || b.type === "Subcontractor" ? b.type : existing?.type || "Subcontractor";
    const isSupplier = ptype === "Supplier";
    const sup = {
      id,
      type: ptype,
      // company
      name: b.name,
      tradeName: str("tradeName"),
      licenseNo: str("licenseNo"),
      licenseExpiry: str("licenseExpiry"),
      establishmentCard: str("establishmentCard"),
      address: str("address"),
      poBox: str("poBox"),
      emirate: str("emirate"),
      website: str("website"),
      category: str("category"),
      trade: str("trade") || str("category"),
      // contact
      contactName: str("contactName"),
      contactDesignation: str("contactDesignation"),
      mobile: str("mobile"),
      tel: str("tel"),
      contact: str("contact"),
      email: str("email"),
      // tax & bank
      trn: str("trn"),
      vatRegistered: b.vatRegistered === void 0 ? existing?.vatRegistered || false : !!b.vatRegistered,
      bank: str("bank"),
      accountName: str("accountName"),
      accountNo: str("accountNo"),
      iban: str("iban"),
      swift: str("swift"),
      // contract / commercial
      entity: b.entity || existing?.entity || settings.entities[0].short,
      project: str("project"),
      lpoRef: str("lpoRef"),
      signDate: str("signDate"),
      contractType: b.contractType === void 0 ? existing?.contractType || "Fixed" : b.contractType === "Rate" ? "Rate" : "Fixed",
      contractValue: b.contractValue === void 0 ? num(existing?.contractValue) : num(b.contractValue),
      vatPct: b.vatPct === void 0 || b.vatPct === "" ? existing?.vatPct ?? 0.05 : num(b.vatPct),
      retentionPct: isSupplier ? 0 : b.retentionPct === void 0 || b.retentionPct === "" ? existing?.retentionPct ?? 0.1 : num(b.retentionPct),
      dlpMonths: isSupplier ? 0 : b.dlpMonths === void 0 ? num(existing?.dlpMonths) : num(b.dlpMonths),
      retentionRelease: isSupplier ? "" : str("retentionRelease"),
      advanceAmount: b.advanceAmount === void 0 ? num(existing?.advanceAmount) : num(b.advanceAmount),
      advanceRecoveryRate: b.advanceRecoveryRate === void 0 ? num(existing?.advanceRecoveryRate) : num(b.advanceRecoveryRate),
      advanceDate: str("advanceDate"),
      advanceRef: str("advanceRef"),
      notes: str("notes"),
      status: b.status || existing?.status || "Active",
      docs: existing?.docs || {},
      regNo: existing?.regNo || "MA-SUP-" + id,
      createdAt: existing?.createdAt || now(),
      createdBy: existing?.createdBy || me.name,
      updatedAt: now(),
      updatedBy: me.name
    };
    await s.setJSON("supplier/" + id, sup);
    if (!b.id) await notify(s, "welcome", { sup });
    return json(sup);
  }
  const supGet = path.match(/^supplier\/([^/]+)$/);
  if (supGet && req.method === "GET") {
    const v = await s.get("supplier/" + decodeURIComponent(supGet[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    const priors = await certsBySupplier(v.id);
    v.advanceRecoveredToDate = r2(priors.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
    v.advanceOutstanding = Math.max(0, r2(num(v.advanceAmount) - v.advanceRecoveredToDate));
    return json(v);
  }
  const supDoc = path.match(/^supplier\/([^/]+)\/doc$/);
  if (supDoc) {
    const id = decodeURIComponent(supDoc[1]);
    if (req.method === "GET") {
      const kind = url.searchParams.get("kind") || "";
      const dataUrl = await s.get(`supplierdoc/${id}/${kind}`) || "";
      return json({ dataUrl });
    }
    if (req.method === "POST") {
      if (!can("suppliers")) return err("No rights", 403);
      const { kind, dataUrl, name } = await req.json();
      if (!DOC_KINDS.includes(kind)) return err("Bad document type");
      if (!dataUrl || !/^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,/.test(dataUrl)) return err("Attach a PNG/JPG/PDF");
      if (dataUrl.length > 26e5) return err("File too large \u2014 under ~1.8 MB");
      const sup = await s.get("supplier/" + id, { type: "json" });
      if (!sup) return err("Supplier not found", 404);
      await s.set(`supplierdoc/${id}/${kind}`, dataUrl);
      sup.docs = sup.docs || {};
      sup.docs[kind] = { name: name || kind, at: now() };
      sup.updatedAt = now();
      await s.setJSON("supplier/" + id, sup);
      return json({ ok: true, docs: sup.docs });
    }
  }
  const certGet = path.match(/^cert\/([^/]+)$/);
  if (certGet && req.method === "GET") {
    const c = await s.get("cert/" + decodeURIComponent(certGet[1]), { type: "json" });
    return c ? json(c) : err("Not found", 404);
  }
  if (path === "cert" && req.method === "POST") {
    if (!can("create")) return err("Only QS or CEO can create certificates", 403);
    const b = await req.json();
    if (!b.supplierId) return err("Choose a supplier");
    const sup = await s.get("supplier/" + b.supplierId, { type: "json" });
    if (!sup) return err("Supplier not found");
    // Anti-duplication: the same supplier invoice must not be certified twice.
    const invNo = String(b.invoiceNo || "").trim();
    if (invNo) {
      const priorC = await certsBySupplier(sup.id);
      const dupC = priorC.find((x) => x.status !== "Cancelled" && String(x.invoiceNo || "").trim().toLowerCase() === invNo.toLowerCase());
      if (dupC) return err(`Supplier invoice ${invNo} is already certified on ${dupC.no} (${dupC.status}). Duplicate certification of the same invoice is not allowed.`, 409);
    }
    const st = await s.get("settings", { type: "json" });
    const project = b.project || sup.project || "";
    const entity = b.entity || sup.entity || settings.entities[0].short;
    let maxSeq = st.seq || 0;
    {
      const { blobs } = await s.list({ prefix: "cert/" });
      for (const bl of blobs) {
        const ec = await s.get(bl.key, { type: "json" });
        if (ec && (ec.seq || 0) > maxSeq) maxSeq = ec.seq;
      }
    }
    let seq = maxSeq + 1;
    let no = certNo(project, sup.name, seq, st.projects);
    let guard = 0;
    while (await s.get("cert/" + no) && guard++ < 50) {
      seq++;
      no = certNo(project, sup.name, seq, st.projects);
    }
    st.seq = seq;
    const cert = {
      no,
      seq: st.seq,
      createdBy: me.id,
      createdAt: now(),
      date: b.date || now().slice(0, 10),
      entity,
      project,
      supplierId: sup.id,
      supplier: sup.name,
      lpoRef: sup.lpoRef || "",
      invoiceNo: b.invoiceNo || "",
      trade: sup.trade || sup.category || b.trade || "",
      periodFrom: b.periodFrom || "",
      periodTo: b.periodTo || "",
      originalValue: num(sup.contractValue),
      basis: sup.contractType === "Rate" ? "rate" : "fixed",
      invoiceAmount: num(b.invoiceAmount),
      variations: num(b.variations),
      workPct: num(b.workPct),
      materialsOnSite: num(b.materialsOnSite),
      retentionPct: num(sup.retentionPct),
      contra: num(b.contra),
      vatPct: num(sup.vatPct),
      notes: b.notes || "",
      status: "Draft",
      payment: null,
      audit: [{ at: now(), by: me.name, action: "Created (Draft)" }]
    };
    await s.setJSON("settings", st);
    await recompute(cert, sup);
    await s.setJSON("cert/" + no, cert);
    await notify(s, "initiated", { cert, sup });
    return json(cert);
  }
  const upMatch = path.match(/^cert\/([^/]+)$/);
  if (upMatch && req.method === "PUT") {
    const key = "cert/" + decodeURIComponent(upMatch[1]);
    const c = await s.get(key, { type: "json" });
    if (!c) return err("Not found", 404);
    if (["Approved", "Paid", "Cancelled"].includes(c.status) && !can("admin")) return err("Locked after approval", 403);
    if (!can("editDraft")) return err("No edit rights", 403);
    const b = await req.json();
    for (const f of ["date", "invoiceNo", "periodFrom", "periodTo", "notes", "project", "entity"]) if (b[f] !== void 0) c[f] = b[f];
    for (const f of ["variations", "workPct", "materialsOnSite", "contra", "invoiceAmount"]) if (b[f] !== void 0) c[f] = num(b[f]);
    const sup = await s.get("supplier/" + c.supplierId, { type: "json" });
    if (sup) {
      c.originalValue = num(sup.contractValue);
      c.basis = sup.contractType === "Rate" ? "rate" : "fixed";
      c.retentionPct = num(sup.retentionPct);
      c.vatPct = num(sup.vatPct);
      c.lpoRef = sup.lpoRef;
      c.supplier = sup.name;
    }
    await recompute(c, sup);
    c.audit.push({ at: now(), by: me.name, action: "Edited" });
    await s.setJSON(key, c);
    // Keep the auto-posted cost line in sync when a linked IPC is edited — so
    // changing a certificate's project/amount re-tags its expense too (the
    // expense mirrors the certificate and can't be edited on its own).
    try {
      const xpcId = "expense/XPC-" + c.no.replace(/[^A-Za-z0-9]+/g, "_");
      if (["Approved", "Paid"].includes(c.status) || await s.get(xpcId)) await upsertCertExpense(s, c);
    } catch {}
    return json(c);
  }
  const trMatch = path.match(/^cert\/([^/]+)\/transition$/);
  if (trMatch && req.method === "POST") {
    const key = "cert/" + decodeURIComponent(trMatch[1]);
    const c = await s.get(key, { type: "json" });
    if (!c) return err("Not found", 404);
    const { action, comment, payment } = await req.json();
    let mailAfter = null;
    const flow = {
      submit: ["Draft", "Certified", "submit"],
      check: ["Certified", "Checked", "check"],
      approve: ["Checked", "Approved", "approve"],
      cancel: ["*", "Cancelled", "cancel"]
    };
    if (action === "reject") {
      if (!can("reject")) return err("No rights", 403);
      if (!comment) return err("Rejection needs a comment");
      const back = { Certified: "Draft", Checked: "Draft", Approved: "Checked" };
      if (!back[c.status]) return err("Cannot reject from " + c.status);
      c.status = back[c.status];
      c.approvedBy = null;
      c.approvedAt = null;
      c.audit.push({ at: now(), by: me.name, action: `Rejected \u2192 ${c.status}`, comment });
      mailAfter = { type: "action", comment };
    } else if (action === "pay") {
      if (!can("pay")) return err("Only Accounts or CEO can record payment", 403);
      if (c.status !== "Approved") return err("Certificate must be Approved first");
      if (!payment?.mode) return err("Payment mode required");
      // Anti-duplication: a cheque number must never be reused. Check the whole
      // payment register (and any live cert already paid by that cheque).
      if (payment.mode === "Cheque") {
        const chqNo = String(payment.ref || "").trim();
        if (chqNo) {
          const reg = await s.get("register", { type: "json" }) || [];
          const dupR = reg.find((r) => r && r.mode === "Cheque" && r.no !== c.no && String(r.ref || "").trim().toLowerCase() === chqNo.toLowerCase());
          if (dupR) return err(`Cheque no. ${chqNo} was already issued on payment ${dupR.no} (${dupR.date}, ${dupR.payee}). Enter a different cheque number.`, 409);
        }
      }
      const amount = num(payment.amount) || c.calc.payable;
      c.payment = {
        mode: payment.mode,
        ref: payment.ref || "",
        bank: payment.bank || "",
        date: payment.date || now().slice(0, 10),
        amount,
        payee: payment.payee || c.supplier,
        purpose: payment.purpose || "",
        by: me.name,
        printed: false,
        proof: false,
        receipt: { received: false }
      };
      if (payment.proof && typeof payment.proof === "string" && payment.proof.startsWith("data:")) {
        if (payment.proof.length > 26e5) return err("Proof file too large \u2014 under ~1.8 MB");
        await s.set("proof/" + c.no, payment.proof);
        c.payment.proof = true;
        c.payment.proofName = payment.proofName || "proof";
      }
      c.status = "Paid";
      c.audit.push({ at: now(), by: me.name, action: `Paid \u2014 ${payment.mode} ${payment.ref || ""} AED ${amount}` });
      const register = await s.get("register", { type: "json" }) || [];
      register.push({
        sr: register.length + 1,
        at: now(),
        no: c.no,
        invoiceNo: c.invoiceNo,
        entity: c.entity,
        project: c.project,
        supplier: c.supplier,
        payee: c.payment.payee,
        mode: c.payment.mode,
        ref: c.payment.ref,
        bank: c.payment.bank,
        date: c.payment.date,
        amount,
        by: me.name,
        receiptDone: false
      });
      await s.setJSON("register", register);
      mailAfter = { type: "paid" };
    } else if (flow[action]) {
      const [from, to, right] = flow[action];
      if (!can(right)) return err("No rights for " + action, 403);
      if (from !== "*" && c.status !== from) return err(`Must be ${from} (is ${c.status})`);
      c.status = to;
      if (action === "approve") {
        c.approvedBy = me.name;
        c.approvedAt = now();
        mailAfter = { type: "approved" };
      }
      c.audit.push({ at: now(), by: me.name, action: `${action} \u2192 ${to}`, comment: comment || void 0 });
    } else return err("Unknown action");
    await s.setJSON(key, c);
    if (action === "approve" || action === "pay") { try { await upsertCertExpense(s, c); } catch {} }
    if (mailAfter) {
      const msup = await s.get("supplier/" + c.supplierId, { type: "json" });
      await notify(s, mailAfter.type, { cert: c, sup: msup, comment: mailAfter.comment });
    }
    return json(c);
  }
  const prMatch = path.match(/^cert\/([^/]+)\/printed$/);
  if (prMatch && req.method === "POST") {
    const key = "cert/" + decodeURIComponent(prMatch[1]);
    const c = await s.get(key, { type: "json" });
    if (!c || !c.payment) return err("Not found", 404);
    const wasPrinted = !!c.payment.printed;
    // Once a cheque is printed it is locked; only the CEO may reprint (guards
    // against a second cheque being produced for the same payment).
    if (wasPrinted && c.payment.mode === "Cheque" && !can("admin")) return err("This cheque has already been printed. Only the CEO can reprint it.", 403);
    c.payment.printed = true;
    c.payment.printedAt = now();
    c.payment.printedBy = me.name;
    c.payment.printCount = (c.payment.printCount || 0) + 1;
    if (c.audit) c.audit.push({ at: now(), by: me.name, action: (wasPrinted ? "Cheque reprinted (CEO)" : "Cheque printed") + (c.payment.ref ? " — no. " + c.payment.ref : "") });
    await s.setJSON(key, c);
    if (c.payment.mode === "Cheque") {
      const psup = await s.get("supplier/" + c.supplierId, { type: "json" });
      await notify(s, "cheque", { cert: c, sup: psup });
    }
    return json({ ok: true });
  }
  const proofM = path.match(/^cert\/([^/]+)\/proof$/);
  if (proofM) {
    const no = decodeURIComponent(proofM[1]);
    const key = "cert/" + no;
    if (req.method === "GET") return json({ dataUrl: await s.get("proof/" + no) || "" });
    if (req.method === "POST") {
      if (!can("pay")) return err("Only Accounts or CEO can attach proof", 403);
      const c = await s.get(key, { type: "json" });
      if (!c || !c.payment) return err("Record a payment first", 404);
      const { dataUrl, name } = await req.json();
      if (!dataUrl || !/^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,/.test(dataUrl)) return err("Attach a PNG/JPG/PDF");
      if (dataUrl.length > 26e5) return err("Proof file too large \u2014 under ~1.8 MB");
      await s.set("proof/" + no, dataUrl);
      c.payment.proof = true;
      c.payment.proofName = name || "proof";
      c.audit.push({ at: now(), by: me.name, action: "Payment proof attached" });
      await s.setJSON(key, c);
      return json({ ok: true });
    }
  }
  const rcM = path.match(/^cert\/([^/]+)\/receipt$/);
  if (rcM) {
    const no = decodeURIComponent(rcM[1]);
    const key = "cert/" + no;
    if (req.method === "GET") return json({ dataUrl: await s.get("receipt/" + no) || "" });
    if (req.method === "POST") {
      if (!can("pay")) return err("Only Accounts or CEO can record a receipt", 403);
      const c = await s.get(key, { type: "json" });
      if (!c || !c.payment) return err("Record a payment first", 404);
      const { collectorName, collectorEID, collectionDate, dataUrl, name } = await req.json();
      if (!collectorName || !String(collectorName).trim()) return err("Collector name is required");
      const eidDigits = String(collectorEID || "").replace(/\D/g, "");
      if (eidDigits.length !== 15 || !eidDigits.startsWith("784")) return err("A valid 15-digit Emirates ID (784-...) is required");
      if (!dataUrl || !/^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,/.test(dataUrl)) return err("Attach the signed receipt copy (PNG/JPG/PDF)");
      if (dataUrl.length > 26e5) return err("Receipt file too large \u2014 under ~1.8 MB");
      await s.set("receipt/" + no, dataUrl);
      c.payment.receipt = {
        received: true,
        collectorName: String(collectorName).trim(),
        collectorEID: eidDigits.replace(/(\d{3})(\d{4})(\d{7})(\d)/, "$1-$2-$3-$4"),
        collectionDate: collectionDate || now().slice(0, 10),
        name: name || "receipt",
        at: now(),
        by: me.name
      };
      c.audit.push({ at: now(), by: me.name, action: `Receipt captured \u2014 collector ${String(collectorName).trim()} (EID \u2026${eidDigits.slice(-4)})` });
      await s.setJSON(key, c);
      const register = await s.get("register", { type: "json" }) || [];
      let changed = false;
      for (const row of register) if (row.no === no) {
        row.receiptDone = true;
        changed = true;
      }
      if (changed) await s.setJSON("register", register);
      return json({ ok: true, receipt: c.payment.receipt });
    }
  }
  const attM = path.match(/^cert\/([^/]+)\/attachment$/);
  if (attM) {
    const ATT_KINDS = ["proforma", "invoice", "lpo", "delivery", "quotation", "other"];
    const no = decodeURIComponent(attM[1]);
    const key = "cert/" + no;
    if (req.method === "GET") {
      const kind = url.searchParams.get("kind") || "";
      return json({ dataUrl: await s.get("certdoc/" + no + "/" + kind) || "" });
    }
    if (req.method === "POST") {
      if (!(can("editDraft") || can("pay"))) return err("No rights to attach", 403);
      const c = await s.get(key, { type: "json" });
      if (!c) return err("Not found", 404);
      const { kind, dataUrl, name } = await req.json();
      if (!ATT_KINDS.includes(kind)) return err("Bad document type");
      if (!dataUrl || !/^data:(image\/(png|jpeg|jpg|webp)|application\/pdf);base64,/.test(dataUrl)) return err("Attach a PNG/JPG/PDF");
      if (dataUrl.length > 26e5) return err("File too large \u2014 under ~1.8 MB");
      await s.set("certdoc/" + no + "/" + kind, dataUrl);
      c.attachments = c.attachments || {};
      c.attachments[kind] = { name: name || kind, at: now(), by: me.name };
      c.audit.push({ at: now(), by: me.name, action: `Attached ${kind}` });
      await s.setJSON(key, c);
      return json({ ok: true, attachments: c.attachments });
    }
  }
  if (path === "assets" && req.method === "GET") {
    const assets = await listAssets();
    const withDep = assets.map((a) => ({ ...a, dep: assetDepreciation(a) }));
    const byCat = {};
    let totalValue = 0, totalNbv = 0, active = 0;
    for (const a of withDep) {
      const c = a.cat || "?";
      byCat[c] = byCat[c] || { count: 0, value: 0, nbv: 0 };
      byCat[c].count++; byCat[c].value = r2(byCat[c].value + num(a.cost)); byCat[c].nbv = r2(byCat[c].nbv + a.dep.nbv);
      totalValue = r2(totalValue + num(a.cost)); totalNbv = r2(totalNbv + a.dep.nbv);
      if (!a.status || a.status === "Active") active++;
    }
    return json({ assets: withDep, cats: ASSET_CATS, conditions: ASSET_CONDITIONS, statuses: ASSET_STATUS, summary: { count: withDep.length, active, totalValue, totalNbv, byCat } });
  }
  if (path === "assets" && req.method === "POST") {
    if (!can("assets")) return err("No rights to manage assets", 403);
    const b = await req.json();
    const catDef = ASSET_CATS.find((c) => c.code === b.cat);
    if (!catDef) return err("Choose a valid category");
    if (!b.description) return err("Asset description is required");
    let code = b.code;
    const existing = code ? await s.get("asset/" + code, { type: "json" }) : null;
    if (!code) {
      const all = await listAssets();
      // Anti-duplication: a serial number must be unique; without a serial,
      // block an identical description + model in the same category.
      const dn = (x) => String(x || "").trim().toLowerCase();
      if (b.serial) { const dupA = all.find((a) => a.serial && dn(a.serial) === dn(b.serial)); if (dupA) return err(`An asset with serial no. ${b.serial} already exists (${dupA.code} — ${dupA.description}). Duplicate assets are not allowed.`, 409); }
      else { const dupA = all.find((a) => a.cat === b.cat && dn(a.description) === dn(b.description) && dn(a.model) === dn(b.model)); if (dupA) return err(`An asset "${b.description}"${b.model ? " (" + b.model + ")" : ""} already exists (${dupA.code}). Add a serial number to distinguish them, or edit the existing record.`, 409); }
      let maxSeq = 0;
      for (const a of all) { const m = String(a.code || "").match(new RegExp("^MAG-" + b.cat + "-(\\d+)$")); if (m && +m[1] > maxSeq) maxSeq = +m[1]; }
      let seq = maxSeq + 1, guard = 0;
      code = assetCode(b.cat, seq);
      while (await s.get("asset/" + code) && guard++ < 200) { seq++; code = assetCode(b.cat, seq); }
    }
    const str = (k) => b[k] === void 0 ? existing?.[k] || "" : b[k] || "";
    const asset = {
      code,
      cat: b.cat,
      description: b.description,
      model: str("model"),
      year: str("year"),
      serial: str("serial"),
      location: str("location"),
      custodian: str("custodian"),
      owner: b.owner || existing?.owner || "MA Group",
      purchaseDate: str("purchaseDate"),
      condition: b.condition || existing?.condition || "Good",
      cost: b.cost === void 0 ? num(existing?.cost) : num(b.cost),
      life: b.life === void 0 || b.life === "" ? existing?.life ?? catDef.life : num(b.life),
      residPct: b.residPct === void 0 || b.residPct === "" ? existing?.residPct ?? 0 : num(b.residPct),
      status: b.status || existing?.status || "Active",
      remarks: str("remarks"),
      createdAt: existing?.createdAt || now(),
      createdBy: existing?.createdBy || me.name,
      updatedAt: now(),
      updatedBy: me.name
    };
    await s.setJSON("asset/" + code, asset);
    return json({ ...asset, dep: assetDepreciation(asset) });
  }
  const assetGet = path.match(/^assets\/([^/]+)$/);
  if (assetGet && assetGet[1] !== "import" && req.method === "GET") {
    const v = await s.get("asset/" + decodeURIComponent(assetGet[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    return json({ ...v, dep: assetDepreciation(v) });
  }
  if (assetGet && req.method === "DELETE") {
    if (!can("assetsDelete")) return err("Only the CEO can permanently delete an asset. Use 'Dispose' instead.", 403);
    const code = decodeURIComponent(assetGet[1]);
    const v = await s.get("asset/" + code, { type: "json" });
    if (!v) return err("Not found", 404);
    await s.delete("asset/" + code);
    return json({ ok: true });
  }
  if (path === "assets/import" && req.method === "POST") {
    if (!can("assets")) return err("No rights to manage assets", 403);
    const b = await req.json();
    const rows = Array.isArray(b.assets) ? b.assets : [];
    if (!rows.length) return err("Nothing to import");
    let created = 0, updated = 0, skipped = 0;
    const overwrite = !!b.overwrite;
    for (const r of rows) {
      const code = String(r.code || "").trim();
      if (!/^MAG-[A-Z]{2,3}-\d{3,5}$/.test(code)) { skipped++; continue; }
      const cat = String(r.cat || code.split("-")[1] || "").trim();
      const catDef = ASSET_CATS.find((c) => c.code === cat);
      if (!catDef) { skipped++; continue; }
      const exists = await s.get("asset/" + code, { type: "json" });
      if (exists && !overwrite) { skipped++; continue; }
      const asset = {
        code, cat,
        description: String(r.description || "").trim() || "(no description)",
        model: String(r.model || "").trim(),
        year: String(r.year || "").trim(),
        serial: String(r.serial || "").trim(),
        location: String(r.location || "").trim(),
        custodian: String(r.custodian || "").trim(),
        owner: String(r.owner || "").trim() || "MA Group",
        purchaseDate: String(r.purchaseDate || "").trim(),
        condition: String(r.condition || "").trim() || "Good",
        cost: num(r.cost),
        life: r.life === void 0 || r.life === "" ? catDef.life : num(r.life),
        residPct: num(r.residPct),
        status: String(r.status || "").trim() || "Active",
        remarks: String(r.remarks || "").trim(),
        createdAt: exists?.createdAt || now(),
        createdBy: exists?.createdBy || me.name,
        updatedAt: now(),
        updatedBy: me.name
      };
      await s.setJSON("asset/" + code, asset);
      if (exists) updated++; else created++;
    }
    return json({ ok: true, created, updated, skipped, total: rows.length });
  }
  if (path === "clients" && req.method === "GET") {
    return json(await listClients());
  }
  if (path === "client" && req.method === "POST") {
    if (!can("clients")) return err("No rights to manage clients", 403);
    const b = await req.json();
    if (!b.name) return err("Client legal name is required");
    if (!b.id) {
      const dcls = await getAllJSON(s, "client/");
      const dn = (x) => String(x || "").trim().toLowerCase();
      const hit = dcls.find((v) => dn(v.name) === dn(b.name) || (b.trn && v.trn && dn(v.trn) === dn(b.trn)));
      if (hit) return err(`A client with the same ${dn(hit.name) === dn(b.name) ? `name "${b.name}"` : `TRN ${b.trn}`} already exists (${hit.id} — ${hit.name}). Open that record instead of creating a duplicate.`, 409);
    }
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    if (!id) { stg.clientSeq = (stg.clientSeq || 0) + 1; id = "C" + String(stg.clientSeq).padStart(3, "0"); await s.setJSON("settings", stg); }
    const ex = b.id ? await s.get("client/" + b.id, { type: "json" }) : null;
    const str = (k) => b[k] === void 0 ? ex?.[k] || "" : b[k] || "";
    const cl = {
      id, type: "Client",
      name: b.name, tradeName: str("tradeName"), trn: str("trn"),
      address: str("address"), poBox: str("poBox"), emirate: str("emirate"),
      contactName: str("contactName"), contactDesignation: str("contactDesignation"),
      mobile: str("mobile"), tel: str("tel"), email: str("email"),
      notes: str("notes"), status: b.status || ex?.status || "Active",
      regNo: ex?.regNo || "MA-CLI-" + id,
      createdAt: ex?.createdAt || now(), createdBy: ex?.createdBy || me.name,
      updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("client/" + id, cl);
    return json(cl);
  }
  const clGet = path.match(/^client\/([^/]+)$/);
  if (clGet && req.method === "GET") {
    const v = await s.get("client/" + decodeURIComponent(clGet[1]), { type: "json" });
    return v ? json(v) : err("Not found", 404);
  }
  if (path === "contracts" && req.method === "GET") {
    const contracts = await listContracts();
    const clients = await listClients();
    const cmap = {}; for (const c of clients) cmap[c.id] = c.name;
    return json(contracts.map((c) => ({ ...c, clientName: cmap[c.clientId] || "" })));
  }
  if (path === "contract" && req.method === "POST") {
    if (!can("contracts")) return err("No rights to manage contracts", 403);
    const b = await req.json();
    if (!b.clientId) return err("Choose the client");
    if (!b.project) return err("Project name is required");
    const client = await s.get("client/" + b.clientId, { type: "json" });
    if (!client) return err("Client not found");
    if (!b.id) {
      const dks = await getAllJSON(s, "contract/");
      const dn = (x) => String(x || "").trim().toLowerCase();
      const hit = dks.find((v) => dn(v.project) === dn(b.project));
      if (hit) return err(`A contract for project "${b.project}" already exists (${hit.id}). Open that contract to add certificates or variations instead of creating a duplicate.`, 409);
    }
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    if (!id) { stg.contractSeq = (stg.contractSeq || 0) + 1; id = "K" + String(stg.contractSeq).padStart(3, "0"); await s.setJSON("settings", stg); }
    const ex = b.id ? await s.get("contract/" + b.id, { type: "json" }) : null;
    const str = (k) => b[k] === void 0 ? ex?.[k] || "" : b[k] || "";
    const contractSum = b.contractSum === void 0 ? num(ex?.contractSum) : num(b.contractSum);
    const variations = b.variations === void 0 ? num(ex?.variations) : num(b.variations);
    const advancePct = b.advancePct === void 0 || b.advancePct === "" ? (ex?.advancePct ?? 0.2) : num(b.advancePct);
    let advanceAmount = b.advanceAmount === void 0 || b.advanceAmount === "" ? (ex?.advanceAmount ?? null) : num(b.advanceAmount);
    if (advanceAmount === null || advanceAmount === void 0) advanceAmount = r2(contractSum * advancePct);
    const ct = {
      id, clientId: b.clientId,
      entity: b.entity || ex?.entity || settings.entities[0].short,
      project: b.project, certPrefix: str("certPrefix") || "PC",
      projShort: (str("projShort") || String(b.project || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 3)).toUpperCase().slice(0, 3),
      subcontractRef: str("subcontractRef"), offerRef: str("offerRef"),
      mainContractor: str("mainContractor") || client.name,
      contractSum, variations,
      advancePct, advanceAmount,
      retentionPct: b.retentionPct === void 0 || b.retentionPct === "" ? (ex?.retentionPct ?? 0.1) : num(b.retentionPct),
      recoveryRate: b.recoveryRate === void 0 || b.recoveryRate === "" ? (ex?.recoveryRate ?? 0.2) : num(b.recoveryRate),
      vatPct: b.vatPct === void 0 || b.vatPct === "" ? (ex?.vatPct ?? 0.05) : num(b.vatPct),
      retentionRelease: str("retentionRelease"), dlpMonths: b.dlpMonths === void 0 ? num(ex?.dlpMonths) : num(b.dlpMonths),
      startDate: str("startDate"), notes: str("notes"),
      status: b.status || ex?.status || "Active",
      createdAt: ex?.createdAt || now(), createdBy: ex?.createdBy || me.name,
      updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("contract/" + id, ct);
    return json(ct);
  }
  const ctGet = path.match(/^contract\/([^/]+)$/);
  if (ctGet && req.method === "GET") {
    const v = await s.get("contract/" + decodeURIComponent(ctGet[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    const certs = await clientCertsByContract(v.id);
    const certifiedNet = r2(certs.reduce((a, c) => a + (c.calc?.net || 0), 0));
    const recovered = r2(certs.reduce((a, c) => a + (c.calc?.advanceRecovery || 0), 0));
    const retentionHeld = r2(certs.reduce((a, c) => Math.max(a, c.calc?.retention || 0), 0));
    v.summary = {
      certCount: certs.length,
      certifiedNet,
      advanceRecovered: recovered,
      advanceOutstanding: Math.max(0, r2(num(v.advanceAmount) - recovered)),
      retentionHeld
    };
    const client = await s.get("client/" + v.clientId, { type: "json" });
    v.clientName = client?.name || "";
    return json(v);
  }
  if (path === "clientcerts" && req.method === "GET") {
    const [all, clist] = await Promise.all([getAllJSON(s, "clientcert/"), listContracts()]);
    const cmap = {}; for (const c of clist) cmap[c.id] = c;
    const out = all.map((c) => { const ct = cmap[c.contractId] || {}; return { no: c.no, key: c.key || clientCertKey(c.contractId, c.seq), seq: c.seq, date: c.date, contractId: c.contractId, project: ct.project || "", clientId: c.clientId, periodFrom: c.periodFrom, periodTo: c.periodTo, gross: c.calc?.gross, net: c.calc?.net, payable: c.calc?.payable, status: c.status }; });
    out.sort((a, b) => a.no < b.no ? 1 : -1);
    return json(out);
  }
  if (path === "clientcert" && req.method === "POST") {
    if (!can("clientcert")) return err("No rights to create client certificates", 403);
    const b = await req.json();
    if (!b.contractId) return err("Choose the contract");
    const contract = await s.get("contract/" + b.contractId, { type: "json" });
    if (!contract) return err("Contract not found");
    const client = await s.get("client/" + contract.clientId, { type: "json" });
    const allCCdup = await getAllJSON(s, "clientcert/");
    // Anti-duplication: block an identical client IPC (same contract, same
    // period-to and same cumulative gross) that isn't cancelled — guards
    // against accidental double issuance / double-clicks.
    { const pt = String(b.periodTo || "").slice(0, 10), gc = num(b.grossCum);
      const dupCC = allCCdup.find((v) => v && v.contractId === b.contractId && v.status !== "Cancelled" && String(v.periodTo || "").slice(0, 10) === pt && num(v.grossCum) === gc && (pt || gc));
      if (dupCC) return err(`A client IPC for this contract with the same period and cumulative value already exists (${dupCC.no}, ${dupCC.status}). Duplicate issuance is not allowed.`, 409); }
    let maxSeq = 0;
    for (const ec of allCCdup) { if (ec && ec.contractId === b.contractId && (ec.seq || 0) > maxSeq) maxSeq = ec.seq; }
    const date = b.date || now().slice(0, 10);
    let seq = maxSeq + 1, key = clientCertKey(contract.id, seq), guard = 0;
    while (await s.get("clientcert/" + key) && guard++ < 200) { seq++; key = clientCertKey(contract.id, seq); }
    const no = clientCertNo(contract, client, seq, date);
    const cert = {
      no, key, seq, contractId: contract.id, clientId: contract.clientId,
      createdBy: me.id, createdAt: now(),
      date,
      periodFrom: b.periodFrom || "", periodTo: b.periodTo || "",
      grossCum: num(b.grossCum), mos: num(b.mos), contra: num(b.contra),
      notes: b.notes || "", status: "Draft",
      audit: [{ at: now(), by: me.name, action: "Created (Draft)" }]
    };
    await recomputeClientCert(cert, contract);
    await s.setJSON("clientcert/" + key, cert);
    return json(cert);
  }
  const ccGet = path.match(/^clientcert\/([^/]+)$/);
  if (ccGet && req.method === "GET") {
    const r = await resolveClientCert(s, ccGet[1]);
    if (!r) return err("Not found", 404);
    const c = r.c;
    const contract = await s.get("contract/" + c.contractId, { type: "json" });
    const client = await s.get("client/" + c.clientId, { type: "json" });
    return json({ ...c, key: r.derivedKey, contract, client });
  }
  const ccPut = path.match(/^clientcert\/([^/]+)$/);
  if (ccPut && req.method === "PUT") {
    const r = await resolveClientCert(s, ccPut[1]);
    if (!r) return err("Not found", 404);
    const c = r.c, key = r.storeKey;
    if (["Issued", "Approved"].includes(c.status) && !can("admin")) return err("Locked after issue", 403);
    if (!can("clientcert")) return err("No edit rights", 403);
    const b = await req.json();
    for (const f of ["date", "periodFrom", "periodTo", "notes"]) if (b[f] !== void 0) c[f] = b[f];
    for (const f of ["grossCum", "mos", "contra"]) if (b[f] !== void 0) c[f] = num(b[f]);
    const contract = await s.get("contract/" + c.contractId, { type: "json" });
    await recomputeClientCert(c, contract);
    c.audit.push({ at: now(), by: me.name, action: "Edited" });
    await s.setJSON(key, c);
    return json(c);
  }
  const ccTr = path.match(/^clientcert\/([^/]+)\/transition$/);
  if (ccTr && req.method === "POST") {
    const r = await resolveClientCert(s, ccTr[1]);
    if (!r) return err("Not found", 404);
    const c = r.c, key = r.storeKey;
    const { action, comment } = await req.json();
    if (action === "issue") {
      if (!can("clientcertIssue")) return err("No rights to issue", 403);
      if (c.status !== "Draft") return err("Must be Draft");
      c.status = "Issued"; c.issuedBy = me.name; c.issuedAt = now();
      c.audit.push({ at: now(), by: me.name, action: "Issued", comment: comment || void 0 });
      const reg = await s.get("clientregister", { type: "json" }) || [];
      reg.push({ sr: reg.length + 1, at: now(), no: c.no, contractId: c.contractId, date: c.date, gross: c.calc?.gross, net: c.calc?.net, vat: c.calc?.vat, payable: c.calc?.payable, by: me.name });
      await s.setJSON("clientregister", reg);
      try {
        const contract = await s.get("contract/" + c.contractId, { type: "json" });
        const client = await s.get("client/" + c.clientId, { type: "json" });
        await notify(s, "client_issued", { cert: c, contract, client });
      } catch {}
    } else if (action === "approve") {
      if (!can("admin")) return err("CEO only", 403);
      if (c.status !== "Issued") return err("Must be Issued first");
      c.status = "Approved"; c.approvedBy = me.name; c.approvedAt = now();
      c.audit.push({ at: now(), by: me.name, action: "Approved", comment: comment || void 0 });
      try {
        const contract = await s.get("contract/" + c.contractId, { type: "json" });
        const client = await s.get("client/" + c.clientId, { type: "json" });
        await notify(s, "client_approved", { cert: c, contract, client });
      } catch {}
    } else if (action === "cancel") {
      if (!can("admin")) return err("CEO only", 403);
      c.status = "Cancelled";
      c.audit.push({ at: now(), by: me.name, action: "Cancelled", comment: comment || void 0 });
    } else if (action === "reopen") {
      if (!can("admin")) return err("CEO only", 403);
      c.status = "Draft"; c.issuedBy = null; c.issuedAt = null; c.approvedBy = null; c.approvedAt = null;
      c.audit.push({ at: now(), by: me.name, action: "Reopened to Draft", comment: comment || void 0 });
    } else return err("Unknown action");
    await s.setJSON(key, c);
    return json(c);
  }
  const ccPf = path.match(/^clientcert\/([^/]+)\/proforma$/);
  if (ccPf && req.method === "POST") {
    if (!can("clientcert")) return err("No rights", 403);
    const r = await resolveClientCert(s, ccPf[1]);
    if (!r) return err("Not found", 404);
    const c = r.c;
    if (!["Issued", "Approved"].includes(c.status)) return err("Certificate must be Issued or Approved first", 400);
    if (!c.proforma || !c.proforma.no) {
      const stg = await s.get("settings", { type: "json" });
      stg.proformaSeq = (stg.proformaSeq || 40) + 1;
      const date = now().slice(0, 10);
      c.proforma = { no: proformaNo(stg.proformaSeq, date), seq: stg.proformaSeq, date, by: me.name };
      c.audit.push({ at: now(), by: me.name, action: `Proforma ${c.proforma.no} generated` });
      await s.setJSON("settings", stg);
      await s.setJSON(r.storeKey, c);
    }
    const contract = await s.get("contract/" + c.contractId, { type: "json" });
    const client = await s.get("client/" + c.clientId, { type: "json" });
    const bank = bankFor(contract?.entity);
    return json({ ...c, contract, client, bank });
  }
  if (path === "clientregister" && req.method === "GET") {
    return json(await s.get("clientregister", { type: "json" }) || []);
  }
  if (path === "project/seed" && req.method === "POST") {
    if (!can("contracts")) return err("No rights to set up projects", 403);
    const body = await req.json();
    const list = Array.isArray(body.projects) ? body.projects : [body];
    const results = [];
    for (const P of list) {
      const cb = P.client || {}, kb = P.contract || {};
      if (!kb.project) continue;
      // client: upsert by name (update details in place)
      const clients = await listClients();
      let client = clients.find((c) => c.name.toLowerCase() === String(cb.name || "").toLowerCase());
      const setIf = (o, k, v) => { if (v !== void 0 && v !== "") o[k] = v; };
      if (client) {
        const cur = await s.get("client/" + client.id, { type: "json" });
        for (const f of ["trn", "address", "poBox", "emirate", "contactName", "contactDesignation", "mobile", "tel", "email"]) setIf(cur, f, cb[f]);
        cur.updatedAt = now();
        await s.setJSON("client/" + client.id, cur); client = cur;
      } else {
        const stg = await s.get("settings", { type: "json" });
        stg.clientSeq = (stg.clientSeq || 0) + 1;
        const id = "C" + String(stg.clientSeq).padStart(3, "0");
        client = {
          id, type: "Client", name: cb.name || "Client", tradeName: cb.tradeName || "", trn: cb.trn || "",
          address: cb.address || "", poBox: cb.poBox || "", emirate: cb.emirate || "",
          contactName: cb.contactName || "", contactDesignation: cb.contactDesignation || "",
          mobile: cb.mobile || "", tel: cb.tel || "", email: cb.email || "", notes: cb.notes || "",
          status: "Active", regNo: "MA-CLI-" + id, createdAt: now(), createdBy: me.name, updatedAt: now()
        };
        await s.setJSON("client/" + id, client);
        await s.setJSON("settings", stg);
      }
      // contract: upsert by project name (any client)
      const contracts = await listContracts();
      const contractSum = num(kb.contractSum), advancePct = kb.advancePct == null ? 0.2 : num(kb.advancePct);
      const advanceAmount = kb.advanceAmount == null || kb.advanceAmount === "" ? r2(contractSum * advancePct) : num(kb.advanceAmount);
      const fields = {
        clientId: client.id, entity: kb.entity || settings.entities[0].short,
        project: kb.project, certPrefix: "PC", projShort: String(kb.projShort || kb.project || "PRJ").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3),
        subcontractRef: kb.subcontractRef || "", offerRef: kb.offerRef || "", mainContractor: kb.mainContractor || client.name,
        contractSum, variations: num(kb.variations), advancePct, advanceAmount,
        retentionPct: kb.retentionPct == null ? 0.1 : num(kb.retentionPct),
        recoveryRate: kb.recoveryRate == null ? 0.2 : num(kb.recoveryRate),
        vatPct: kb.vatPct == null ? 0.05 : num(kb.vatPct),
        retentionRelease: kb.retentionRelease || "", dlpMonths: num(kb.dlpMonths), startDate: kb.startDate || "", status: "Active"
      };
      let contract = contracts.find((c) => String(c.project).toLowerCase() === String(kb.project).toLowerCase());
      if (contract) {
        const cur = await s.get("contract/" + contract.id, { type: "json" });
        Object.assign(cur, fields, { updatedAt: now(), updatedBy: me.name });
        await s.setJSON("contract/" + contract.id, cur); contract = cur;
      } else {
        const stg = await s.get("settings", { type: "json" });
        stg.contractSeq = (stg.contractSeq || 0) + 1;
        const id = "K" + String(stg.contractSeq).padStart(3, "0");
        contract = { id, ...fields, notes: kb.notes || "", createdAt: now(), createdBy: me.name, updatedAt: now() };
        await s.setJSON("contract/" + id, contract);
        await s.setJSON("settings", stg);
      }
      // certs: create only if provided AND the contract has none (avoid duplicates on re-run)
      let created = 0;
      const provided = P.certs || [];
      if (provided.length) {
        const existing = await clientCertsByContract(contract.id);
        if (!existing.length) {
          for (const cc of provided) {
            const seq = created + 1, date = (cc.date || now().slice(0, 10)).slice(0, 10);
            const key = clientCertKey(contract.id, seq), no = clientCertNo(contract, client, seq, date);
            const cert = {
              no, key, seq, contractId: contract.id, clientId: client.id, createdBy: me.id, createdAt: now(),
              date, periodFrom: cc.periodFrom || "", periodTo: cc.periodTo || "",
              grossCum: num(cc.grossCum), mos: num(cc.mos), contra: num(cc.contra), notes: cc.notes || "",
              status: "Draft", audit: [{ at: now(), by: me.name, action: "Imported (Draft)" }]
            };
            await recomputeClientCert(cert, contract);
            if (cc.issue) { cert.status = "Issued"; cert.issuedBy = me.name; cert.issuedAt = now(); cert.audit.push({ at: now(), by: me.name, action: "Issued (import)" }); }
            await s.setJSON("clientcert/" + key, cert);
            created++;
          }
        }
      }
      results.push({ clientName: client.name, project: contract.project, contractId: contract.id, certsCreated: created });
    }
    return json({ projects: results });
  }
  if (path === "costmeta" && req.method === "GET") {
    const [projects, sups] = await Promise.all([projectNames(s), listSuppliers()]);
    return json({ costTypes: COST_TYPES, categories: EXPENSE_CATEGORIES, statuses: EXPENSE_STATUS, projects, suppliers: sups.map((x) => x.name).filter(Boolean).sort() });
  }
  if (path === "expenses" && req.method === "GET") {
    return json(await listExpenses(url.searchParams.get("project") || ""));
  }
  if (path === "areas" && req.method === "GET") {
    const project = url.searchParams.get("project") || "";
    return json({ project, areas: project ? await projectAreas(s, project) : [] });
  }
  if (path === "expense" && req.method === "POST") {
    if (!can("expense")) return err("No rights to log expenses", 403);
    const b = await req.json();
    if (!b.project) return err("Choose or type a project");
    if (!b.date) return err("Date is required");
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    const ex = id ? await s.get("expense/" + id, { type: "json" }) : null;
    if (!id) { stg.expenseSeq = (stg.expenseSeq || 0) + 1; id = "X" + String(stg.expenseSeq).padStart(5, "0"); await s.setJSON("settings", stg); }
    if (ex && ex.source === "supplier-ipc" && b.__fromForm) {
      // allow editing the classification of an auto-posted line, keep the link/amounts
    }
    const str = (k) => b[k] === void 0 ? ex?.[k] || "" : String(b[k] || "");
    const supplierName = str("supplier");
    let supplierId = ex?.supplierId || null;
    if (supplierName && ex?.source !== "supplier-ipc") { try { supplierId = await ensureSupplierStub(s, supplierName) || supplierId; } catch {} }
    const exp = {
      id, seq: ex?.seq || (Number(String(id).replace(/\D/g, "")) || 0),
      project: String(b.project).trim(),
      date: String(b.date).slice(0, 10),
      area: str("area"), category: str("category") || "General / Other", costType: str("costType") || "Material Supply",
      supplier: supplierName, supplierId, invoiceNo: str("invoiceNo"), description: str("description"), poRef: str("poRef"), boqRef: str("boqRef"),
      budgeted: b.budgeted === void 0 ? num(ex?.budgeted) : num(b.budgeted),
      amount: b.amount === void 0 ? num(ex?.amount) : num(b.amount),
      vatPct: b.vatPct === void 0 ? num(ex?.vatPct) : num(b.vatPct),
      status: str("status") || "Pending",
      paid: b.paid === void 0 ? num(ex?.paid) : num(b.paid),
      notes: str("notes"),
      supplierCertNo: ex?.supplierCertNo || b.supplierCertNo || null,
      source: ex?.source || "manual",
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    exp.vat = r2(exp.amount * exp.vatPct);
    exp.gross = r2(exp.amount + exp.vat);
    await s.setJSON("expense/" + id, exp);
    return json(exp);
  }
  if (path === "expenses/import" && req.method === "POST") {
    if (!can("expense")) return err("No rights to import", 403);
    const { rows } = await req.json();
    if (!Array.isArray(rows)) return err("No rows to import");
    const stg = await s.get("settings", { type: "json" });
    let seq = stg.expenseSeq || 0;
    const validStatus = new Set(EXPENSE_STATUS);
    const validType = new Set(COST_TYPES.map((t) => t.name));
    const statusMap = { accrual: "Pending", pending: "Pending", paid: "Paid", "on hold": "On Hold", disputed: "Disputed", "partially paid": "Partially Paid", "partly paid": "Partially Paid" };
    const items = [];
    for (const r of rows) {
      if (!r || !r.project || !r.date) continue;
      seq++;
      let status = String(r.status || "Pending").trim();
      if (!validStatus.has(status)) status = statusMap[status.toLowerCase()] || "Pending";
      let costType = String(r.costType || "").trim();
      if (!validType.has(costType)) costType = "Material Supply";
      const id = "X" + String(seq).padStart(5, "0");
      items.push({
        id, seq, project: String(r.project).trim(), date: String(r.date).slice(0, 10),
        area: String(r.area || ""), category: String(r.category || "General / Other"), costType,
        supplier: String(r.supplier || ""), supplierId: null, invoiceNo: String(r.invoiceNo || ""), description: String(r.description || ""),
        poRef: String(r.poRef || ""), boqRef: String(r.boqRef || ""),
        budgeted: num(r.budgeted), amount: num(r.amount), vatPct: num(r.vatPct), vat: r2(num(r.amount) * num(r.vatPct)), gross: r2(num(r.amount) * (1 + num(r.vatPct))), status, paid: num(r.paid),
        notes: String(r.notes || ""), supplierCertNo: null, source: "import",
        createdBy: me.name, createdAt: now(), updatedAt: now()
      });
    }
    stg.expenseSeq = seq;
    await s.setJSON("settings", stg);
    // register supplier stubs for distinct supplier names, then link the expense rows
    const names = [...new Set(items.map((e) => e.supplier.trim()).filter(Boolean))];
    const nameToId = {};
    for (const nm of names) { try { nameToId[nm.toLowerCase()] = await ensureSupplierStub(s, nm); } catch {} }
    for (const e of items) { const key = e.supplier.trim().toLowerCase(); if (key && nameToId[key]) e.supplierId = nameToId[key]; }
    for (let i = 0; i < items.length; i += 25) {
      await Promise.all(items.slice(i, i + 25).map((e) => s.setJSON("expense/" + e.id, e)));
    }
    return json({ created: items.length, suppliersRegistered: names.length });
  }
  if (path === "suppliers/sync-costlog" && req.method === "POST") {
    if (!can("suppliers")) return err("No rights", 403);
    const { blobs } = await s.list({ prefix: "expense/" });
    const names = /* @__PURE__ */ new Set();
    const rows = [];
    for (const b of blobs) { const e = await s.get(b.key, { type: "json" }); if (e && e.supplier) { names.add(String(e.supplier).trim()); rows.push(e); } }
    let created = 0;
    const nameToId = {};
    for (const nm of names) { if (!nm) continue; const before = nm; const idv = await ensureSupplierStub(s, nm); nameToId[nm.toLowerCase()] = idv; }
    // link expenses missing supplierId
    for (const e of rows) { const k = String(e.supplier).trim().toLowerCase(); if (k && nameToId[k] && e.supplierId !== nameToId[k]) { e.supplierId = nameToId[k]; await s.setJSON("expense/" + e.id, e); } }
    // count how many suppliers now exist that were auto-created
    const { blobs: sb } = await s.list({ prefix: "supplier/" });
    for (const b of sb) { const v = await s.get(b.key, { type: "json" }); if (v && v.source === "cost-log") created++; }
    return json({ ok: true, distinctSuppliers: names.size, costLogSuppliers: created });
  }
  const expGet = path.match(/^expense\/([^/]+)$/);
  if (expGet && req.method === "GET") {
    const v = await s.get("expense/" + decodeURIComponent(expGet[1]), { type: "json" });
    return v ? json(v) : err("Not found", 404);
  }
  const expDel = path.match(/^expense\/([^/]+)$/);
  if (expDel && req.method === "DELETE") {
    if (!can("expenseDelete")) return err("No rights to delete", 403);
    await s.delete("expense/" + decodeURIComponent(expDel[1]));
    return json({ ok: true });
  }
  if (path === "pnl" && req.method === "GET") {
    if (!can("pnl")) return err("No rights", 403);
    return json(await computePnl(s, url.searchParams.get("project") || ""));
  }
  if (path === "budget" && req.method === "GET") {
    if (!can("budget")) return err("No rights", 403);
    const project = url.searchParams.get("project") || "";
    if (!project) return err("Choose a project");
    return json(await computeBudget(s, project));
  }
  if (path === "budget" && req.method === "POST") {
    if (!can("budgetEdit")) return err("No rights to edit budget", 403);
    const b = await req.json();
    if (!b.project) return err("Project required");
    const lines = (Array.isArray(b.lines) ? b.lines : []).filter((l) => l && l.area).map((l) => ({
      area: String(l.area).trim(), boq: num(l.boq), targetPct: l.targetPct == null ? 0.85 : num(l.targetPct), pctComplete: num(l.pctComplete),
      actualOverride: l.actualOverride == null || l.actualOverride === "" ? null : num(l.actualOverride)
    }));
    await s.setJSON("budget/" + budgetSlug(b.project), { project: b.project, lines, updatedAt: now(), updatedBy: me.name });
    return json(await computeBudget(s, b.project));
  }
  return err("Not found: " + path, 404);
};
var config = { path: "/api/*" };
export {
  config,
  api_default as default
};
