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
var COLLECT_WINDOW = "Tuesdays only, between 1:00 PM and 4:00 PM";
var collectNoteHtml = `<strong>Collection policy:</strong> Cash and cheques are handed over <strong>on ${COLLECT_WINDOW}</strong> at our office. Collection must be made by an <strong>authorised representative of your company whose Emirates ID is registered under the company name</strong>, presenting their <strong>original Emirates ID</strong> (the EID number is recorded at handover). The <strong>original TAX invoice</strong> and a <strong>signed &amp; stamped receipt voucher</strong> are <strong>mandatory</strong> and must be submitted at the time of collection.`;
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
    adminEmail: getEnv("ADMIN_EMAIL") || saved.adminEmail || "ceo@maagroup.ae",
    logoUrl: getEnv("LOGO_URL") || saved.logoUrl || "https://ma-group-payments.netlify.app/logo.png",
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
<tr><td style="background:#ffffff;padding:18px 30px 14px;border-bottom:1px solid #eef1f5">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:14px;vertical-align:middle"><img src="${cfg.logoUrl || "https://ma-group-payments.netlify.app/logo.png"}" alt="MA Group" width="66" style="display:block;width:66px;height:auto;border:0"></td>
<td style="vertical-align:middle"><div style="color:#1f3864;font-size:20px;font-weight:800;letter-spacing:.3px">MA GROUP</div>
<div style="color:#8a93a3;font-size:11px;margin-top:2px">Marvellous Art \u2022 MA Building Contracting \u2022 MA Building Maintenance</div></td>
</tr></table>
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
This is an automated notification from the MA Group management system. You may reply directly to this email to reach our team.
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
  if (type === "paymentcycle") {
    const period = ctx.period || "";
    return {
      to, toName: greeting, greeting,
      subject: `Payment Certificate Submission ${period ? "— " + period + " " : ""}| Signed Attendance & Report Required — MA Group`,
      html: emailShell(cfg, {
        title: "Monthly Payment Certificate Cycle", band: "#1f3864", greeting,
        preheader: `Submit between the 20th and 25th with signed attendance and works report — no invoice accepted without them.`,
        lead: [
          `This is a reminder of MA Group's monthly payment certificate cycle${period ? " for <strong>" + emEsc(period) + "</strong>" : ""}.`,
          `To have your works certified and paid in this cycle, kindly submit your documents <strong>between the 20th and the 25th of the month</strong>, in the order below.`
        ],
        table: [
          ["Submission window", "20th – 25th of each month"],
          ["Required (1)", "Monthly progress / works report"],
          ["Required (2)", "Attendance sheet signed &amp; verified by the MA Group site engineer"],
          ["Then", "Your Tax Invoice for the certified amount"]
        ],
        note: `<strong>Important:</strong> No Tax Invoice will be accepted unless accompanied by the <strong>signed attendance verified by the MA Group site engineer</strong> and the <strong>works report</strong>. Invoices without these attachments — or submitted outside the 20th–25th window — will be held to the next payment cycle.`,
        noteColor: "#fff8e6", noteBar: "#bf9000",
        closing: `Please reply to this email attaching your works report, the signed attendance sheet and your tax invoice.`
      })
    };
  }
  if (type === "policyack") {
    const a = ctx.ack || {};
    const forCeo = !!ctx.forCeo;
    return {
      to: ctx.to,
      toName: forCeo ? "Eng. Mohammed Abuassba" : (a.name || "Colleague"),
      greeting: forCeo ? "Eng. Mohammed Abuassba" : (a.name || "Colleague"),
      subject: forCeo
        ? `Confidentiality Undertaking Signed — ${a.name || a.userId} (${a.role || ""})`
        : `Your signed Confidentiality Undertaking — MA Group`,
      html: emailShell(cfg, {
        title: forCeo ? "Confidentiality Undertaking — Signed" : "Confidentiality Undertaking — Confirmation",
        band: "#375623",
        preheader: forCeo
          ? `${a.name || a.userId} has digitally signed the Confidentiality Undertaking.`
          : `This confirms you have digitally signed MA Group's Confidentiality Undertaking.`,
        lead: forCeo
          ? [
              `This is to confirm that the following team member has <strong>digitally accepted and signed</strong> the MA Group Confidentiality &amp; Non-Disclosure Undertaking before accessing the MA Group management system.`,
              `This acknowledgement is recorded in the system's confidentiality register and is legally binding.`
            ]
          : [
              `This confirms that you have <strong>digitally accepted and signed</strong> the MA Group Confidentiality &amp; Non-Disclosure Undertaking.`,
              `By signing, you have agreed to keep all information accessed through the MA Group management system strictly confidential and to use it solely for your authorised duties. Please retain this email for your records.`
            ],
        table: [
          ["Signatory", a.name || a.userId || "—"],
          ["Login ID", a.userId || "—"],
          ["Role", a.role || "—"],
          ["Typed signature", a.signature || "—"],
          ["Date &amp; time signed", emDate(a.acceptedAt) + (a.acceptedAt ? " (GST)" : "")],
          ["Policy version", "v" + (a.version || 1)],
          ["Source IP", a.ip || "—"]
        ],
        note: `This is an electronic acknowledgement captured at first access to the system. It carries the same weight as a signed undertaking under the UAE Federal Decree-Law on the protection of confidential information and MA Group's internal policy.`,
        noteColor: "#eef5ec", noteBar: "#375623",
        closing: forCeo
          ? `The full confidentiality register is available under Settings → Confidentiality in the MA Group management system.`
          : `Thank you for your commitment to protecting MA Group's confidential information.`
      })
    };
  }
  if (type === "announcement") {
    const cat = ctx.category || "Notice";
    const bands = { "Payment & Certification": "#1f3864", "General Information": "#2e75b6", "Instruction / Notice": "#bf9000", "Policy Update": "#375623" };
    const bodyParas = String(ctx.body || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
      .map((p) => emEsc(p).replace(/\n/g, "<br>"));
    return {
      to: ctx.to,
      toName: ctx.toName || "Valued Partner",
      greeting: ctx.greeting || "Valued Partner",
      bcc: ctx.bcc || [],
      subject: ctx.subject || `${cat} \u2014 MA Group`,
      html: emailShell(cfg, {
        title: cat,
        band: bands[cat] || "#1f3864",
        preheader: ctx.subject || cat,
        lead: bodyParas.length ? bodyParas : ["\u2014"],
        note: ctx.note || `This is an official communication from MA Group. Please retain it for your records and ensure compliance. For any clarification, reply to <strong>${emEsc(cfg.replyTo)}</strong>.`,
        noteColor: "#eef2f8", noteBar: "#1f3864",
        closing: ctx.closing || `Thank you for your continued cooperation.`
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
  const msgBcc = Array.isArray(msg.bcc) ? msg.bcc.filter(Boolean) : split(msg.bcc);
  const allBcc = [...split(cfg.bcc), ...msgBcc];
  rec.bccCount = msgBcc.length;
  // CC: settings-level cc + per-message cc (e.g. a supplier's additional contact
  // emails), deduped and never duplicating the primary To recipient.
  const msgCc = Array.isArray(msg.cc) ? msg.cc.filter(Boolean) : split(msg.cc);
  const toLc = String(msg.to || "").trim().toLowerCase();
  const allCc = [...new Set([...split(cfg.cc), ...msgCc].map((a) => a.trim()).filter((a) => a && a.toLowerCase() !== toLc))];
  rec.ccCount = allCc.length;
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
        cc: allCc.join(", ") || void 0,
        bcc: allBcc.join(", ") || void 0,
        subject: msg.subject,
        html: msg.html,
        attachments: msg.attachments || void 0
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
      if (allCc.length) body.cc = allCc.map((a) => ({ email_address: { address: a } }));
      if (allBcc.length) body.bcc = allBcc.map((a) => ({ email_address: { address: a } }));
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
    // Copy every additional supplier contact email so all their contacts receive it.
    const sup = ctx.sup || {};
    const cc = Array.isArray(sup.emails) ? sup.emails : [];
    return await sendMail(s, cfg, { type, to: t.to, toName: t.toName, subject: t.subject, html: t.html, cc, certNo: ctx.cert?.no, supplierId: ctx.sup?.id });
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
  // Only request an SOA from suppliers/subcontractors we actually transact with —
  // i.e. a payment was made or initiated (a supplier IPC exists, or a cost-log/expense
  // is booked against them). Directory-only / never-paid vendors are excluded.
  const [certs, expenses] = await Promise.all([getAllJSON(s, "cert/"), getAllJSON(s, "expense/")]);
  const txnIds = new Set(), txnNames = new Set();
  for (const c of certs) { if (c && c.status !== "Cancelled" && c.supplierId) txnIds.add(String(c.supplierId)); }
  for (const e of expenses) { if (e) { if (e.supplierId) txnIds.add(String(e.supplierId)); if (e.supplier) txnNames.add(String(e.supplier).trim().toLowerCase()); } }
  const hasTxn = (sup) => txnIds.has(String(sup.id)) || txnNames.has(String(sup.name || "").trim().toLowerCase());
  const t = /* @__PURE__ */ new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const period = `${months[t.getUTCMonth()]} ${t.getUTCFullYear()}`;
  const asOf = t.toISOString().slice(0, 10);
  const sent = [];
  let eligible = 0;
  for (const sup of suppliers) {
    if (sup.status && sup.status !== "Active" || !sup.email) continue;
    if (!hasTxn(sup)) continue;
    eligible++;
    const rec = await notify(s, "soa", { sup, period, asOf });
    sent.push({ supplier: sup.name, status: rec?.status });
  }
  return { job: "soa", period, eligible, notified: sent.length, sent };
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
  // v9: payee + amount-in-words another 5 mm left (x 122 → 117; total 15 mm left
  // of the original 132). Date and figures unchanged.
  layoutVersion: 9,
  widthMm: 297,
  heightMm: 210,
  fontPt: 11,
  offsetXmm: 0,
  offsetYmm: 0,
  wordsWrapMm: 112,
  paper: "A4",
  fields: {
    date: { x: 227, y: 87, label: "Date" },
    payee: { x: 117, y: 94, label: "Payee" },
    words1: { x: 117, y: 107, label: "Amount in words (line 1)" },
    words2: { x: 117, y: 114, label: "Amount in words (line 2)" },
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
  bankOpening: {},
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
var ROLES = ["CEO", "QS", "PM", "Accounts", "Secretary", "Clerk", "HR", "Marketing"];
// Departments: Finance / Accounts → Accounts · HR & Admin → HR · Projects / QS → PM, QS ·
// Marketing → Marketing · Admin & data entry → Clerk, Secretary · CEO → everything.
var DEFAULT_USERS = [
  { id: "ceo", name: "Mohammed Abuassba", role: "CEO", salt: "", pinHash: "" },
  { id: "qs", name: "QS / Site Engineer", role: "QS", salt: "", pinHash: "" },
  { id: "pm", name: "PM / Commercial", role: "PM", salt: "", pinHash: "" },
  { id: "accounts", name: "Accounts", role: "Accounts", salt: "", pinHash: "" },
  { id: "secretary", name: "Secretary / Reception", role: "Secretary", salt: "", pinHash: "" }
];
var DEFAULT_PINS = { ceo: "1234", qs: "1111", pm: "2222", accounts: "3333", secretary: "4444" };
var PROC_SEED = [{"n":"Alutal Aluminium & Glass LLC","t":"Glass & Aluminium","sp":"Curtain wall, glazing, shopfronts, cladding","cp":"","ph":"+971 4 323 3222","wa":"","e":"info@alutaluae.com","w":"alutaluae.com","a":"Al Quoz Ind 3, Dubai","ty":"Subcontractor","no":""},{"n":"Ideal Aluminium & Glass LLC","t":"Glass & Aluminium","sp":"Architectural aluminium & glass (specialist sub)","cp":"","ph":"","wa":"","e":"info@idealagdubai.com","w":"idealagdubai.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Glass Mirror","t":"Glass & Aluminium","sp":"Mirrors, glass, aluminium works","cp":"","ph":"+971 58 877 9766","wa":"+971 58 877 9766","e":"info@glassmirror.ae","w":"glassmirror.ae","a":"Dubai","ty":"Both","no":"Alt +971 52 832 4482"},{"n":"The Glass Company","t":"Glass & Aluminium","sp":"Custom glass & mirrors, slim systems","cp":"","ph":"","wa":"","e":"","w":"theglasscompany.ae","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"British Glass & Aluminium","t":"Glass & Aluminium","sp":"Mirrors, partitions, balustrades, shopfronts","cp":"","ph":"+971 55 650 3170","wa":"+971 55 650 3170","e":"","w":"britishglasses.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Glass Aluminum Dubai","t":"Glass & Aluminium","sp":"Glass & aluminium works, shopfronts","cp":"","ph":"+971 58 667 1875","wa":"+971 58 667 1875","e":"info@glassaluminumdubai.com","w":"glassaluminumdubai.com","a":"Naif, Dubai","ty":"Both","no":""},{"n":"Glassman","t":"Glass & Aluminium","sp":"Aluminium windows/doors, partitions, curtain wall","cp":"","ph":"","wa":"","e":"","w":"glassman.ae","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"CMBM Dubai (Crew Master Bldg)","t":"Gypsum / Ceiling / Partition","sp":"Gypsum partition, false ceiling, drywall","cp":"","ph":"+971 54 309 9991","wa":"+971 54 309 9991","e":"info@cmbmdubai.com","w":"cmbmdubai.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Four Square Construction Contracting LLC","t":"Joinery / Carpentry / Fit-out","sp":"Gypsum partition, ceiling (also steel fab & fit-out)","cp":"","ph":"+971 4 335 7551","wa":"+971 58 595 2060","e":"info@foursqrllc.com","w":"foursqrllc.com","a":"Al Qusais Ind 1, Dubai","ty":"Both","no":"Also mezzanine; mob +971 52 807 8039"},{"n":"Sana Decoration LLC","t":"Gypsum / Ceiling / Partition","sp":"False ceiling & gypsum partition","cp":"","ph":"+971 4 273 1286","wa":"+971 55 744 8018","e":"sales@sanadecoration.com","w":"sanadecoration.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Najmat Al Miraj","t":"Gypsum / Ceiling / Partition","sp":"Gypsum partition & false ceiling","cp":"","ph":"","wa":"","e":"","w":"najmatalmiraj.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Wavex Technical","t":"Gypsum / Ceiling / Partition","sp":"Gypsum ceiling, partition, decoration","cp":"","ph":"+971 50 725 0215","wa":"+971 50 725 0215","e":"","w":"wavex.ae","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Al Shirawi Interiors (Visionwood)","t":"Joinery / Carpentry / Fit-out","sp":"Joinery factory, turnkey fit-out, timber","cp":"","ph":"","wa":"","e":"","w":"alshirawiinteriors.com","a":"Dubai","ty":"Subcontractor","no":"Premium; get contact from site"},{"n":"Team Visual Solutions","t":"Joinery / Carpentry / Fit-out","sp":"Joinery, metal fab, acrylic, upholstery, CNC","cp":"","ph":"+971 4 884 9405","wa":"","e":"info@teamvisualsolutions.com","w":"teamvisualsolutions.com","a":"Dubai / Abu Dhabi","ty":"Subcontractor","no":""},{"n":"Mark Fit Out","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"","ph":"","wa":"","e":"","w":"markfitout.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Appello Interiors","t":"Joinery / Carpentry / Fit-out","sp":"Interior fit-out & joinery","cp":"","ph":"+971 52 447 4455","wa":"+971 52 447 4455","e":"","w":"appellointeriors.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Al Moroojtec","t":"Joinery / Carpentry / Fit-out","sp":"Joinery workshop, doors, fit-out","cp":"","ph":"","wa":"","e":"","w":"moroojtec.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Bespoke Joinery","t":"Furniture & Furnishing","sp":"Bespoke joinery & furniture","cp":"","ph":"","wa":"","e":"","w":"bespokejoinery.ae","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"GridPoint Electromechanical Works LLC","t":"HVAC","sp":"MEP - HVAC, electrical, plumbing, fire (DEWA appr.)","cp":"","ph":"","wa":"","e":"","w":"gridpoint.ae","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Lumens MEP","t":"HVAC","sp":"MEP - electrical, plumbing, HVAC","cp":"","ph":"+971 50 266 4403","wa":"+971 50 266 4403","e":"","w":"lumens-mep.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Arco Electromechanical LLC","t":"HVAC","sp":"MEP - HVAC, electrical, plumbing, fire, ELV","cp":"","ph":"","wa":"","e":"","w":"arcomep.ae","a":"Dubai / Abu Dhabi","ty":"Subcontractor","no":"Large established contractor"},{"n":"Tecnico Services LLC","t":"MEP / Electromechanical","sp":"MEP contracting","cp":"","ph":"+971 4 272 3739","wa":"+971 50 516 3318","e":"","w":"tecnicoservices.com","a":"Deira, Dubai","ty":"Subcontractor","no":""},{"n":"Align Electromechanical Work LLC","t":"MEP / Electromechanical","sp":"MEP - mech, electrical, plumbing, firefighting","cp":"","ph":"","wa":"","e":"","w":"alignmepservices.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"MEP Works","t":"MEP / Electromechanical","sp":"MEP, AC, electrical, plumbing (DEWA approved)","cp":"","ph":"","wa":"","e":"","w":"mepworks.ae","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Independent Marble & Granite","t":"Tiles / Marble / Stone","sp":"Natural stone (marble, granite, quartz) supply","cp":"","ph":"+971 4 346 8830","wa":"","e":"","w":"independentmng.com","a":"Jebel Ali, Dubai","ty":"Supplier","no":""},{"n":"Al Taj Marble & Tiles Industry LLC","t":"Tiles / Marble / Stone","sp":"Marble, granite, travertine","cp":"","ph":"+971 55 557 5049","wa":"+971 55 557 5049","e":"","w":"tajmarble.ae","a":"Dubai","ty":"Supplier","no":"Alt +971 6 740 8250"},{"n":"SIOM Marble & Granite","t":"Tiles / Marble / Stone","sp":"Italian marble, granite, natural stone supply+fix","cp":"","ph":"","wa":"","e":"","w":"siommarble.com","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"White Palace Marbles & Granite LLC","t":"Tiles / Marble / Stone","sp":"Marble & granite supply + fixing","cp":"","ph":"+971 50 105 3714","wa":"+971 50 105 3714","e":"","w":"wpmarbles.ae","a":"Dubai / Sharjah","ty":"Both","no":""},{"n":"GLAZE Granite & Marble","t":"Tiles / Marble / Stone","sp":"Marble, granite, quartzite, onyx, travertine","cp":"","ph":"","wa":"","e":"","w":"glaze.ae","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Remal Tiles & Marble Co LLC","t":"Tiles / Marble / Stone","sp":"Marble, granite, tiles supply+install, waterjet","cp":"","ph":"","wa":"","e":"","w":"alremalmarble.com","a":"Dubai / Sharjah","ty":"Both","no":"Get phone/email from site"},{"n":"Rajasthan Natural Marbles & Tiles","t":"Tiles / Marble / Stone","sp":"Marble & tiles","cp":"","ph":"+971 4 272 9183","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"MAK Hardware & Tools Trading LLC","t":"Tiles / Marble / Stone","sp":"Tiles, hardware & tools","cp":"","ph":"+971 4 256 5252","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"RAK Ceramics","t":"Sanitaryware / Plumbing","sp":"Ceramic & porcelain tiles, sanitaryware, faucets","cp":"","ph":"","wa":"","e":"","w":"rakceramics.com","a":"Ras Al Khaimah / UAE","ty":"Supplier","no":"Mfr; nationwide showrooms"},{"n":"Kludi RAK","t":"Sanitaryware / Plumbing","sp":"Bathroom & kitchen mixers, sanitaryware","cp":"","ph":"","wa":"","e":"","w":"","a":"Ras Al Khaimah","ty":"Supplier","no":"Verify website & contact"},{"n":"KABCO Group","t":"Landscaping / Irrigation","sp":"Softscape, hardscape, irrigation (DM certified)","cp":"","ph":"+971 50 219 7300","wa":"+971 50 219 7300","e":"","w":"kabcogroup.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Emirates Landscape LLC","t":"Landscaping / Irrigation","sp":"Landscape & irrigation, turnkey","cp":"","ph":"","wa":"","e":"","w":"emirateslandscape.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Gebal Group","t":"Landscaping / Irrigation","sp":"Landscaping, civil, irrigation, hardscape","cp":"","ph":"","wa":"","e":"","w":"gebalgroup.com","a":"Dubai","ty":"Subcontractor","no":"40 yrs; get contact from site"},{"n":"KCJ Landscaping LLC","t":"Swimming Pool","sp":"Landscaping, irrigation, pools, pergolas","cp":"","ph":"","wa":"","e":"","w":"kcjlandscaping.ae","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Green Vista Pools & Landscaping LLC","t":"Swimming Pool","sp":"Landscaping, GRP pools, fountains, irrigation","cp":"","ph":"+971 4 392 1299","wa":"+971 50 998 7945","e":"","w":"","a":"Al Quoz, Dubai","ty":"Subcontractor","no":""},{"n":"Terraforma Landscaping","t":"Swimming Pool","sp":"Hardscape, softscape, irrigation, pools","cp":"","ph":"+971 55 960 6763","wa":"+971 55 960 6763","e":"info@terraforma.ae","w":"terraforma.ae","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Beautiful Garden","t":"Landscaping / Irrigation","sp":"Landscaping, pergolas, irrigation, lighting","cp":"","ph":"+971 4 361 8119","wa":"+971 56 557 7774","e":"info@beautifulgardendubai.com","w":"","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Mahraj Industries","t":"Steel / Rebar / Fabrication","sp":"Structural & custom steel fabrication + install","cp":"","ph":"+971 54 542 4920","wa":"+971 54 542 4920","e":"","w":"mahrajindustries.com","a":"Dubai","ty":"Subcontractor","no":""},{"n":"Dar Al Fann","t":"Steel / Rebar / Fabrication","sp":"Mild steel fabrication, workshop & onsite","cp":"","ph":"","wa":"","e":"","w":"daralfannfab.com","a":"Dubai / Sharjah","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Tecmark Contracting LLC","t":"Steel / Rebar / Fabrication","sp":"Structural steel, sandwich panel (JAFZA approved)","cp":"","ph":"","wa":"","e":"","w":"tecmarkllc.com","a":"Al Quoz / Jebel Ali","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al Safrik Steel","t":"Steel / Rebar / Fabrication","sp":"Steel & stainless fabrication","cp":"","ph":"","wa":"","e":"","w":"alsafriksteel.com","a":"Dubai / Abu Dhabi","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al Dhabi Steel LLC","t":"Glass & Aluminium","sp":"Steel, stainless, aluminium, kitchen fab (ISO 9001)","cp":"","ph":"","wa":"","e":"","w":"aldhabisteel.com","a":"Sharjah","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Abbas Metal","t":"Steel / Rebar / Fabrication","sp":"Structural & stainless steel fabrication, CNC","cp":"","ph":"","wa":"","e":"","w":"abbasmetal.com","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Gulf Precast","t":"Concrete / Ready-mix / Precast","sp":"Precast walls, columns, slabs, foundations","cp":"","ph":"","wa":"","e":"","w":"","a":"Abu Dhabi / UAE","ty":"Supplier","no":"Verify website & contact"},{"n":"Emirates Precast Construction LLC","t":"Concrete / Ready-mix / Precast","sp":"Precast concrete elements","cp":"","ph":"","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Verify website & contact"},{"n":"Exeed Precast","t":"Concrete / Ready-mix / Precast","sp":"Precast concrete elements","cp":"","ph":"","wa":"","e":"","w":"","a":"Abu Dhabi","ty":"Supplier","no":"Verify website & contact"},{"n":"Dubai Precast LLC","t":"Concrete / Ready-mix / Precast","sp":"Precast concrete elements","cp":"","ph":"","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Verify website & contact"},{"n":"Cemex UAE","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix concrete (all grades, pumping)","cp":"","ph":"+971 4 347 0427","wa":"","e":"info.uae@cemex.com","w":"cemex.ae","a":"Dubai","ty":"Supplier","no":"Toll-free 800 23639"},{"n":"Conmix Ltd","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix, drymix, GRC","cp":"","ph":"","wa":"","e":"","w":"conmix.com","a":"Sharjah / Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Readymix4u (Readymix UAE)","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix concrete","cp":"","ph":"","wa":"","e":"","w":"readymix4u.ae","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Unibeton Ready Mix LLC","t":"Concrete / Ready-mix / Precast","sp":"SCC, green, high-strength ready-mix","cp":"","ph":"","wa":"","e":"","w":"","a":"Jebel Ali Ind 3, Dubai","ty":"Supplier","no":"Al Fara'a Group; verify contact"},{"n":"Unimix","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix concrete (R&D lab, Al Quoz)","cp":"","ph":"","wa":"","e":"","w":"unimix-uae.com","a":"Al Quoz, Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Dubai Readymix Concrete LLC","t":"Concrete / Ready-mix / Precast","sp":"Standard/SCC/lightweight/fibre ready-mix","cp":"","ph":"+971 4 880 1141","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"Emirates Beton ReadyMix","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix concrete","cp":"","ph":"+971 4 320 9205","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"Emix - Emirates Sas Readymix LLC","t":"Concrete / Ready-mix / Precast","sp":"Ready-mix concrete","cp":"","ph":"+971 4 880 3244","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"FEPY","t":"Steel / Rebar / Fabrication","sp":"Cement, steel, building materials (online store)","cp":"","ph":"","wa":"","e":"","w":"fepy.com","a":"UAE","ty":"Supplier","no":""},{"n":"QCON General Trading LLC","t":"Gypsum / Ceiling / Partition","sp":"One-stop: chemicals, gypsum, paint, electric, tools","cp":"","ph":"+971 4 334 8881","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Multi-branch building materials"},{"n":"Madar Building Materials","t":"Steel / Rebar / Fabrication","sp":"Steel, cement, blocks; multi-brand distributor","cp":"","ph":"","wa":"","e":"","w":"madar-uae.com","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Emirates Steel (EMSTEEL)","t":"Steel / Rebar / Fabrication","sp":"Rebar, sections, wire rod (mill)","cp":"","ph":"","wa":"","e":"","w":"","a":"Abu Dhabi","ty":"Supplier","no":"Verify portal/distributor"},{"n":"Conares Metal Supply Ltd","t":"Steel / Rebar / Fabrication","sp":"Rebar, steel pipes, structural steel, coils","cp":"","ph":"","wa":"","e":"","w":"conares.com","a":"Dubai / Jebel Ali","ty":"Supplier","no":"Est. 1988; get phone from site"},{"n":"Hamriyah Steel","t":"Steel / Rebar / Fabrication","sp":"Rebar, wire rod, structural steel (mill)","cp":"","ph":"","wa":"","e":"","w":"hamriyahsteel.ae","a":"Hamriyah FZ, Sharjah","ty":"Supplier","no":"Get phone/email from site"},{"n":"Union Iron & Steel / Union Rebar Factory","t":"Steel / Rebar / Fabrication","sp":"Rebar & welded mesh","cp":"","ph":"","wa":"","e":"","w":"unionrebar.ae","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Gulf Steel Industries","t":"Steel / Rebar / Fabrication","sp":"Rebar & steel products","cp":"","ph":"","wa":"","e":"","w":"gulfsteeluae.com","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"BHMK","t":"Aggregates / Sand / Base","sp":"Road base, sub-base, aggregate, sand","cp":"","ph":"","wa":"","e":"","w":"bhmk.ae","a":"Dubai / UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Saif Bin Darwish Crushers","t":"Aggregates / Sand / Base","sp":"Sub-base, road base, wet mix, aggregate","cp":"","ph":"","wa":"","e":"","w":"sbdcrushers.com","a":"Fujairah / UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Zarei Group","t":"Aggregates / Sand / Base","sp":"Road base, aggregate","cp":"","ph":"","wa":"","e":"","w":"zarei-group.com","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Earth Movers International","t":"Aggregates / Sand / Base","sp":"Road base, sub-base, aggregate","cp":"","ph":"","wa":"","e":"","w":"earthmoversint.com","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Miras Al Dhahbi Trading LLC","t":"Aggregates / Sand / Base","sp":"Road base, aggregate","cp":"","ph":"","wa":"","e":"","w":"mirasaldhahbi.ae","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Tasamoh","t":"Aggregates / Sand / Base","sp":"Road base, aggregate (ATT)","cp":"","ph":"+971 52 288 1584","wa":"+971 52 288 1584","e":"infoaltasamoh@gmail.com","w":"","a":"Dubai / Abu Dhabi","ty":"Supplier","no":""},{"n":"RAKNOR LLC","t":"Tiles / Marble / Stone","sp":"Concrete blocks, interlock, kerbstone, ready-mix","cp":"","ph":"+971 7 266 8351","wa":"","e":"","w":"raknor.com","a":"Ras Al Khaimah","ty":"Supplier","no":"Hardscape products"},{"n":"National Tiles & Block Co Ltd","t":"Tiles / Marble / Stone","sp":"Blocks & interlocking cement products","cp":"","ph":"+971 7 266 2431","wa":"","e":"","w":"","a":"Ras Al Khaimah","ty":"Supplier","no":""},{"n":"Maimoon Bldg & Construction Material Trdg LLC","t":"Hardware / Fasteners","sp":"Anchor bolts, fasteners","cp":"","ph":"","wa":"","e":"","w":"mbcmtrade.com","a":"UAE","ty":"Supplier","no":"Get phone/email from site"},{"n":"Petrofast Middle East","t":"Hardware / Fasteners","sp":"Anchor bolts, HDG fasteners (ASTM F1554)","cp":"","ph":"","wa":"","e":"","w":"petrofastme.com","a":"Sharjah","ty":"Supplier","no":"Get phone/email from site"},{"n":"Alhafoof","t":"Hardware / Fasteners","sp":"GI/MS anchor bolts, fasteners","cp":"","ph":"","wa":"","e":"","w":"alhafoof.com","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Sika UAE","t":"Waterproofing / Chemicals","sp":"Waterproofing, admixtures, sealants, repair (mfr)","cp":"","ph":"+971 4 439 8200","wa":"","e":"info@ae.sika.com","w":"gcc.sika.com","a":"Dubai Industrial City","ty":"Supplier","no":""},{"n":"Fosroc","t":"Waterproofing / Chemicals","sp":"Construction chemicals, waterproofing, admixtures (mfr)","cp":"","ph":"","wa":"","e":"","w":"fosroc.com","a":"Al Quoz Ind 4, Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Gurg Fosroc LLC","t":"Waterproofing / Chemicals","sp":"Fosroc construction chemicals distributor","cp":"","ph":"+971 4 203 9699","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"Henkel Polybit Industries","t":"Waterproofing / Chemicals","sp":"Waterproofing membranes & chemicals (Polybit)","cp":"","ph":"+971 4 320 5066","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"Dani Trading LLC","t":"Paints & Coatings","sp":"Chemicals, paints & building materials trader","cp":"","ph":"+971 4 283 7373","wa":"","e":"","w":"danitrading.ae","a":"Dubai","ty":"Supplier","no":"Fosroc/Sika/Mapei/Weber; also Jotun"},{"n":"Sodamco-Weber (Sodap Emirates)","t":"Tiles / Marble / Stone","sp":"Tile adhesive, mortars, chemicals (Weber)","cp":"","ph":"+971 4 347 2640","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":""},{"n":"Jotun UAE","t":"Paints & Coatings","sp":"Decorative, protective, marine, powder coatings (mfr)","cp":"","ph":"","wa":"","e":"","w":"jotun.com","a":"Dubai","ty":"Supplier","no":"Mfr; supplied via dealers"},{"n":"National Paints","t":"Paints & Coatings","sp":"Decorative & protective paints (mfr)","cp":"","ph":"","wa":"","e":"","w":"nationalpaints.com","a":"Sharjah","ty":"Supplier","no":"Mfr"},{"n":"Caparol Paints LLC","t":"Paints & Coatings","sp":"German paints, emulsions, EIFS (mfr)","cp":"","ph":"","wa":"","e":"","w":"caparolarabia.com","a":"Dubai","ty":"Supplier","no":"Mfr; experience centres UAE"},{"n":"Ducab","t":"Electrical & Lighting","sp":"Power & building wires/cables (mfr)","cp":"","ph":"","wa":"","e":"","w":"ducab.com","a":"Dubai / Abu Dhabi","ty":"Supplier","no":"Cables; via approved distributors"},{"n":"Well Certified Scaffolding Contracting LLC","t":"Scaffolding","sp":"Scaffolding hire, erection & dismantling","cp":"","ph":"+971 55 575 8940","wa":"+971 55 575 8940","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":""},{"n":"HMI Building Materials Trading LLC","t":"Fire & Safety","sp":"Industrial/commercial doors, rolling shutters, fire doors","cp":"","ph":"+971 56 889 8355","wa":"+971 56 889 8355","e":"","w":"hmi.group","a":"Dubai","ty":"Supplier","no":""},{"n":"Drafline LLC","t":"Landscaping / Irrigation","sp":"Landscaping, civil, irrigation, hardscape","cp":"","ph":"542285330","wa":"542285330","e":"operations@draftline.ae","w":"https://www.draftline.ae/","a":"Abu Dhabi","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ABAW Rubber Trading LLC","t":"Electrical & Lighting","sp":"Rubber Installation","cp":"Husain Fakhruddin","ph":"+971 55 452 2350","wa":"+971 55 452 2350","e":"husain@abaw.ae","w":"www.abaw.ae","a":"Ajman","ty":"Supplier","no":"Get phone/email from site"},{"n":"Zain Mandekar Swaidan Trading LLC","t":"Equipment / Rental","sp":"Transportation/ Services","cp":"Zain Mandekar","ph":"+971 50 224 7086","wa":"+971 50 224 7086","e":"","w":"","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"Rajsinh Dalma Motors LLC","t":"Equipment / Rental","sp":"Transportation/ Services","cp":"Rajsinh","ph":"+971 50 918 3577","wa":"+971 50 918 3577","e":"","w":"","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"Ashoka Leyland bus","t":"General Trading / Materials","sp":"Transportation/ Services","cp":"Abhishek","ph":"+971 54 791 0057","wa":"+971 54 791 0057","e":"","w":"","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"Asia Demolition Works LLC","t":"Cement / Building Materials","sp":"Demolation","cp":"","ph":"+971 50 271 1806","wa":"+971 50 271 1806","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Demolition Sub Con","t":"General Trading / Materials","sp":"Demolation","cp":"","ph":"+971 50 271 1806","wa":"+971 50 271 1806","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Demolition Sub Con - Zafar Transport","t":"General Trading / Materials","sp":"Demolation","cp":"","ph":"+971 52 734 4313","wa":"+971 52 734 4313","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Goldline Demolition - Farooq","t":"General Trading / Materials","sp":"Demolation","cp":"","ph":"+971 55 212 9760","wa":"+971 55 212 9760","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"PERFECT QUALITY","t":"Sanitaryware / Plumbing","sp":"","cp":"SWAMINATHAN","ph":"+971 55 861 6299","wa":"+971 55 861 6299","e":"swami@pqbmt.ae","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"BUILDING MATERIAL","t":"Sanitaryware / Plumbing","sp":"","cp":"SOORAJ","ph":"+971 52 346 8750","wa":"+971 52 346 8750","e":"info@alhassai.com","w":"","a":"Dubai","ty":"Both","no":"Get phone/email from site"},{"n":"SIMAR","t":"Joinery / Carpentry / Fit-out","sp":"Joinery factory, turnkey fit-out, timber","cp":"ROHITH","ph":"+971 52 432 9692","wa":"+971 52 432 9692","e":"sam_rasa@hotmail.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"AFRID KHAN","t":"Paints & Coatings","sp":"Decorative & protective paints (mfr)","cp":"ALI KHAN","ph":"+971 55 786 0949","wa":"+971 55 786 0949","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"SURFACE PRO","t":"Joinery / Carpentry / Fit-out","sp":"Joinery factory, turnkey fit-out, timber","cp":"RABHIN","ph":"+971 50 273 7877","wa":"+971 50 273 7877","e":"rabhin@surfaceprollc.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Alfam Packing And Packaging Materials Trading LLC","t":"Printing & Signage","sp":"Packaging materials","cp":"","ph":"+971 50 143 4767","wa":"+971 50 143 4767","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"All in one packing and packaging Packaging Company","t":"Printing & Signage","sp":"Packaging materials","cp":"","ph":"+971 50 105 4456","wa":"+971 50 105 4456","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"NOOR AL HUDA","t":"Glass & Aluminium","sp":"Gypsum partition, false ceiling, drywall","cp":"NOOR AL HUDA","ph":"+971 58 820 9296","wa":"+971 58 820 9296","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"NOOR AL BALAD","t":"Steel / Rebar / Fabrication","sp":"Steel & stainless fabrication","cp":"SABITH","ph":"+971 56 909 4408","wa":"+971 56 909 4408","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"NAVEED ADVERTISEMENT","t":"Printing & Signage","sp":"Printing and typing.","cp":"IQBAL","ph":"+971 56 481 5043","wa":"+971 56 481 5043","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ROYAL CERAMIC GENERAL","t":"Sanitaryware / Plumbing","sp":"Ceramic & porcelain tiles, sanitaryware, faucets","cp":"Ayah","ph":"+971 54 321 5059","wa":"+971 54 321 5059","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Seven Bros Dream Marbles","t":"Tiles / Marble / Stone","sp":"Marble, granite, travertine","cp":"HAJI","ph":"+91 98290 78114","wa":"+91 98290 78114","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Silver Maids Dubai Cleaning","t":"Cleaning Services","sp":"Silver Dubai Cleaning","cp":"Silver Dubai Cleaning","ph":"+971 55 883 3686","wa":"+971 55 883 3686","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al Fakhama","t":"Tiles / Marble / Stone","sp":"Marble, granite, travertine","cp":"Al Fakhama","ph":"+971 56 433 7180","wa":"+971 56 433 7180","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"INVEST","t":"MEP / Electromechanical","sp":"MEP","cp":"Modar","ph":"+971 50 449 0303","wa":"+971 50 449 0303","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Igreen Landscaping","t":"Landscaping / Irrigation","sp":"Landscape & irrigation, turnkey","cp":"","ph":"‪+971 55 601 2556‬","wa":"‪+971 55 601 2556‬","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Honeyway","t":"MEP / Electromechanical","sp":"MEP","cp":"Mr.Rafeeq","ph":"+971 50 588 7289","wa":"+971 50 588 7289","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Wasat AlDHAID paints cont LLC.SP","t":"Paints & Coatings","sp":"Decorative & protective paints (mfr)","cp":"Raheem","ph":"+971 52633177","wa":"+971 52633177","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"TAAG","t":"MEP / Electromechanical","sp":"MEP","cp":"imran","ph":"‪+971 50 345 6238‬","wa":"‪+971 50 345 6238‬","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"~Amirah's Water Supply Transport L.L.C","t":"Utilities","sp":"Water Supply","cp":"","ph":"‪+971 55 832 7249‬","wa":"‪+971 55 832 7249‬","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"~RDC cleaning services co.","t":"Cleaning Services","sp":"Cleaning Services","cp":"","ph":"‪+971 55 861 1561‬","wa":"‪+971 55 861 1561‬","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"AL FALASI TECH GROUP","t":"Fire & Safety","sp":"Fire Fighting","cp":"","ph":"+971 50 798 0136","wa":"+971 50 798 0136","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"MK Building material LLC.","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"","ph":"+971 54 570 0862","wa":"+971 54 570 0862","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"DELEGATE TECHNICAL SERVICES LLC","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"","ph":"+971 58 807 8965","wa":"+971 58 807 8965","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Lamsa Fanya company for CNC services.","t":"Steel / Rebar / Fabrication","sp":"CNC Services","cp":"ahmed","ph":"+971 50 595 1523","wa":"+971 50 595 1523","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"glassrusindustrie","t":"Glass & Aluminium","sp":"Aluminium windows/doors, partitions, curtain wall","cp":"Madhu","ph":"+971 56 415 8760","wa":"+971 56 415 8760","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Graffiti Ceramics.","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"Suhaib Ahmed Khan","ph":"+971 58 805 9403","wa":"+971 58 805 9403","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"LUAR - Procurement Agency","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"Raphael Garabedian","ph":"+971 54 442 7573","wa":"+971 54 442 7573","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"HOME SCAPE","t":"General Trading / Materials","sp":"BUILDING MATERIAL","cp":"MOHAMMAD","ph":"+971 58 835 2690","wa":"+971 58 835 2690","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Luxury future decore","t":"General Trading / Materials","sp":"Flooring","cp":"Hossam suliman","ph":"+971 50 536 6284","wa":"+971 50 536 6284","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Alaan Media","t":"Marketing & Media","sp":"Video Maker","cp":"","ph":"+971 55 699 2368","wa":"+971 55 699 2368","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Mrs Razan AbuDaqqa team.","t":"Marketing & Media","sp":"marketing","cp":"Nour Alaaeldin","ph":"+971 52 151 5840","wa":"+971 52 151 5840","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Scrap & Metal Waste Trading","t":"Electrical & Lighting","sp":"Metal and scrap","cp":"Usman","ph":"+971 55 209 4394","wa":"+971 55 209 4394","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"US+A Lighting Studio","t":"General Trading / Materials","sp":"Lights","cp":"Shoeb Undre","ph":"+971 52 128 4017","wa":"+971 52 128 4017","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"crain services","t":"Steel / Rebar / Fabrication","sp":"crain services","cp":"","ph":"+971 52 314 2609","wa":"+971 52 314 2609","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Elisa advertisement agency","t":"Marketing & Media","sp":"Marketing","cp":"sameena","ph":"+971 55 232 1124","wa":"+971 55 232 1124","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Painting works","t":"Paints & Coatings","sp":"Painting","cp":"HARSHA","ph":"+971 50 220 9588","wa":"+971 50 220 9588","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Emirates Advocates","t":"Professional Services","sp":"Advocates","cp":"","ph":"+971 52 368 7204","wa":"+971 52 368 7204","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"HMA Auditing","t":"Professional Services","sp":"Accounting","cp":"Mikael","ph":"+971 56 964 4328","wa":"+971 56 964 4328","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"BETTER POOLS LLC","t":"Swimming Pool","sp":"POOL CONSTRUCTION","cp":"Jasem Karim","ph":"+971 50 436 6207","wa":"+971 50 436 6207","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"LIGHTS","t":"MEP / Electromechanical","sp":"MEP","cp":"Rana","ph":"+971 52 762 6792","wa":"+971 52 762 6792","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Stone Marble Granite","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"","ph":"+971 55 430 2646","wa":"+971 55 430 2646","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Etisalat services","t":"IT & Technology","sp":"Etisalat","cp":"Abdur","ph":"+971 55 500 7788","wa":"+971 55 500 7788","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"FindAnyAgent","t":"General Trading / Materials","sp":"Management services","cp":"","ph":"+971 50 121 8728","wa":"+971 50 121 8728","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ROWDAT ALMADINA","t":"Paints & Coatings","sp":"Painting","cp":"Mohammad junayed","ph":"+971 56 691 6537","wa":"+971 56 691 6537","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Henyam Island Metal Smettellig L.L.C","t":"Glass & Aluminium","sp":"Gypsum partition, false ceiling, drywall","cp":"Rashad ahmed","ph":"+971 55 982 7423","wa":"+971 55 982 7423","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Glass Manufacture","t":"Glass & Aluminium","sp":"Mirrors, glass, aluminium works","cp":"Loki","ph":"+971 50 967 7986","wa":"+971 50 967 7986","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Dar Al Anamat","t":"IT & Technology","sp":"IT Consulting Services","cp":"ritu","ph":"+971 52 859 6357","wa":"+971 52 859 6357","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Nouman Tariq","t":"Marketing & Media","sp":"Video Maker","cp":"","ph":"+971 50 173 8035","wa":"+971 50 173 8035","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Qasr Al Yamamah Tile Company","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"","ph":"+971 58 853 7066","wa":"+971 58 853 7066","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Atlantis Interior","t":"Paints & Coatings","sp":"Painting","cp":"","ph":"+971 58 853 7066","wa":"+971 58 853 7066","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Wonder Glass","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"","ph":"+971 50 735 4082","wa":"+971 50 735 4082","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Kanz al bahar bmt llc","t":"Waterproofing / Chemicals","sp":"Construction Materials","cp":"Sabbir","ph":"+971 50 806 2853","wa":"+971 50 806 2853","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"DNIEPER FIRE AND SAFETY","t":"Fire & Safety","sp":"Fire & Safety Services","cp":"","ph":"+971 52 541 0206","wa":"+971 52 541 0206","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"FLYBIRD – Luxury Handles Collection","t":"Hardware / Fasteners","sp":"Hardware & Fittings","cp":"Murtaza","ph":"+971 50 840 0651","wa":"+971 50 840 0651","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Amirah_Water_Supply_Dubai","t":"Utilities","sp":"Water Supply Services","cp":"","ph":"+971 55 832 7249","wa":"+971 55 832 7249","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Bharat curtain","t":"Furniture & Furnishing","sp":"Interior Decoration & Finishing","cp":"","ph":"+971 55 440 0278","wa":"+971 55 440 0278","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Technical Services LLC","t":"Permits & Approvals","sp":"Building & Government Approvals","cp":"Rosie","ph":"+971 58 531 7979","wa":"+971 58 531 7979","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Five Cube Media","t":"Marketing & Media","sp":"Event Management Services","cp":"","ph":"+971 50 405 2453","wa":"+971 50 405 2453","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Sansam Ceramics","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"Yuliya","ph":"+971 56 646 4689","wa":"+971 56 646 4689","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Top good lights Junjue","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"Judy","ph":"+86 134 2551 8416","wa":"+86 134 2551 8416","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Amara LLC","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"Zameer","ph":"+971 56 791 6625","wa":"+971 56 791 6625","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"BUILDING MATERIALS","t":"General Trading / Materials","sp":"Construction Materials","cp":"","ph":"+971 50 111 3202","wa":"+971 50 111 3202","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AC TECH","t":"HVAC","sp":"HVAC Services & Equipment","cp":"","ph":"+92 341 2427585","wa":"+92 341 2427585","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ID8 Furniture","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"Shareef","ph":"+971 55 425 4396","wa":"+971 55 425 4396","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Sketchiz Design, Dubai.","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"Dildar","ph":"+971 50 705 3049","wa":"+971 50 705 3049","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"aqeelahmad","t":"Paints & Coatings","sp":"Painting","cp":"","ph":"+971 55 340 1965","wa":"+971 55 340 1965","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Infinite Interiors LLC","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"Zakia Khan","ph":"+971 52 196 3127","wa":"+971 52 196 3127","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Marble polish","t":"Tiles / Marble / Stone","sp":"Tiles fixing","cp":"","ph":"+971 56 969 0624","wa":"+971 56 969 0624","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Bait Al Shabbir Marble Trading LLC.","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Nasir","ph":"","wa":"","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"London Architectural Aluminum","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"Eslam AbdElhamed","ph":"+971 50 187 4829","wa":"+971 50 187 4829","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"TEN TEN ALUMINUM & GLASS","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"SURESH","ph":"+971 58 272 8704","wa":"+971 58 272 8704","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Alfriday","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"","ph":"+971 56 798 0999","wa":"+971 56 798 0999","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"DE FACTO MOBILI","t":"Doors / Shutters","sp":"Italian concealed doors (hidden)","cp":"KHALED","ph":"+971 58 588 3514","wa":"+971 58 588 3514","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"FINPOWER","t":"HVAC","sp":"HVAC Services & Equipment","cp":"MONA","ph":"+971 56 218 8107","wa":"+971 56 218 8107","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"WAEL","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"","ph":"+971 56 989 8591","wa":"+971 56 989 8591","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"INDOOR & OUTDOOR PLANTS","t":"Landscaping / Irrigation","sp":"Landscaping & Gardening","cp":"","ph":"+971 559697552","wa":"+971 559697552","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AHMED","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"","ph":"+971 50 212 6501","wa":"+971 50 212 6501","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"BELLACASA","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"ABOU HAMIA","ph":"+971 45 468 889","wa":"+971 45 468 889","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"DANUBE","t":"Permits & Approvals","sp":"Building & Government Approvals","cp":"AJAY","ph":"+971 55 220 8354","wa":"+971 55 220 8354","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"SMLFCS","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"ALINA XIA","ph":"+971 586818810","wa":"+971 586818810","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"DYNA","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"RAKESH SINGH","ph":"+971  56 900 2266","wa":"+971  56 900 2266","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"VERONA","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"TANNOUS","ph":"+971 54 522 0218","wa":"+971 54 522 0218","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"SAFETY FIRST SAFETY SYSTEMS LLC","t":"Fire & Safety","sp":"Fire Fighting","cp":"ANAS","ph":"+971 56 218 2690","wa":"+971 56 218 2690","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"TARMAC LABORITORY","t":"Testing / Survey","sp":"Laboratory Services","cp":"RENJITH","ph":"+971 58 950 1753","wa":"+971 58 950 1753","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Surface 11","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Abhishek","ph":"+971 50 687 8332","wa":"+971 50 687 8332","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al imran","t":"CCTV & Security","sp":"CCTV & Security Systems","cp":"","ph":"+971 56 288 9967","wa":"+971 56 288 9967","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"ALUMINIUM AND BULLET PROOF GLASS","t":"Glass & Aluminium","sp":"ALUMINIUM AND BULLET PROOF GLASS","cp":"","ph":"+971 50 187 4829","wa":"+971 50 187 4829","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Arfat","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"","ph":"+971582091498","wa":"+971582091498","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Zak Azeemah","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Bilal","ph":"+971 52 790 6355","wa":"+971 52 790 6355","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Creative Concrete Concepts","t":"Paints & Coatings","sp":"Painting","cp":"Qasim","ph":"+971 52 109 3718","wa":"+971 52 109 3718","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Dinesh","t":"Tiles / Marble / Stone","sp":"Tiles and mason","cp":"Dinesh","ph":"+971 50 190 4870","wa":"+971 50 190 4870","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Fmdr","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"Fazal","ph":"+971 58 899 1420","wa":"+971 58 899 1420","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Pawan Landscaping","t":"Landscaping / Irrigation","sp":"Landscape Contractor","cp":"Gopen","ph":"+971 55 636 4277","wa":"+971 55 636 4277","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"AL AZEEMAH FLOORS","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"HASSAN","ph":"+971 50 790 6382","wa":"+971 50 790 6382","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Surveyors","t":"Testing / Survey","sp":"Construction Surveying","cp":"ilyas","ph":"+971 56 505 2739","wa":"+971 56 505 2739","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Islam","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Islam","ph":"+971 52 766 6730","wa":"+971 52 766 6730","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Rashid Afasco Glass Alumil","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"Rashid","ph":"+971 55 145 6847","wa":"+971 55 145 6847","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Alwan Marble Trading","t":"Tiles / Marble / Stone","sp":"Cutting, Fabrication & Fixing Factory,","cp":"Ali Khan","ph":"+971 50 354 5950","wa":"+971 50 354 5950","e":"","w":"","a":"Sharjah","ty":"Supplier","no":"Get phone/email from site"},{"n":"M Three Building Materials","t":"Permits & Approvals","sp":"BUILDING MATERIALS","cp":"~Binu Chandran","ph":"+971 50 528 7536","wa":"+971 50 528 7536","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"INFOTID","t":"IT & Technology","sp":"IT Consulting Services","cp":"GAGANDEEP","ph":"+971 55 778 8536","wa":"+971 55 778 8536","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Vinyl Floor","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Massimo","ph":"+971 58 561 9494","wa":"+971 58 561 9494","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Medical Curtain Aster","t":"Joinery / Carpentry / Fit-out","sp":"Curtains & Blinds","cp":"","ph":"+971 50 164 9039","wa":"+971 50 164 9039","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Halo Decorative","t":"Paints & Coatings","sp":"Painting","cp":"","ph":"+971 50 311 9537","wa":"+971 50 311 9537","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Musa","t":"MEP / Electromechanical","sp":"MEP","cp":"","ph":"+971 56 665 4701","wa":"+971 56 665 4701","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Nishad Steel Doors","t":"Steel / Rebar / Fabrication","sp":"Steel & stainless fabrication","cp":"","ph":"+971 50 916 5289","wa":"+971 50 916 5289","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"WOODMANS","t":"HVAC","sp":"HVAC Services & Equipment","cp":"Nithin","ph":"+971 52 760 4853","wa":"+971 52 760 4853","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al Azeemah Trading LLC","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Nithyanand","ph":"+971 50 273 0667","wa":"+971 50 273 0667","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"BINA AL IMAAD","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"PRASHANTH","ph":"+971 58 540 0237","wa":"+971 58 540 0237","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Printer And Plotter","t":"IT & Technology","sp":"Office Equipment & Supplies","cp":"Saad manager","ph":"+971 58 105 9786","wa":"+971 58 105 9786","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"AL AHEED","t":"IT & Technology","sp":"Office Equipment & Supplies","cp":"","ph":"+971 54 785 8887","wa":"+971 54 785 8887","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Rafiq","t":"HVAC","sp":"HVAC Services & Equipment","cp":"Rafiq","ph":"+971 50 588 7289","wa":"+971 50 588 7289","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Rameez","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"C/O Ravi","ph":"+971 55 406 1313","wa":"+971 55 406 1313","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Beacon","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"Ratheesh","ph":"+971 52 233 1061","wa":"+971 52 233 1061","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Make My Restaurant","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"Ravi","ph":"+971 58 570 7110","wa":"+971 58 570 7110","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ROYAL ROSE","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"","ph":"+971 55 376 0376","wa":"+971 55 376 0376","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Azeemah Floors","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Sanooz","ph":"+971 54 306 6672","wa":"+971 54 306 6672","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"SENSI","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Majd alam","ph":"+971 52 498 1324","wa":"+971 52 498 1324","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Septic","t":"MEP / Electromechanical","sp":"Septic Tank Installation","cp":"","ph":"+971 50 283 5339","wa":"+971 50 283 5339","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Naxim","t":"CCTV & Security","sp":"CCTV & Security Systems","cp":"Shrehaas","ph":"+971 52 343 5878","wa":"+971 52 343 5878","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Marble Constructor","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Shoaib","ph":"542138881","wa":"542138881","e":"shoaib.sales@gmao.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Fire Fighting","t":"Fire & Safety","sp":"Fire Fighting","cp":"Shyjil","ph":"+971 56 586 9877","wa":"+971 56 586 9877","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"COSMOS","t":"Pest Control","sp":"Pest Control","cp":"Zafar Ali","ph":"+971 56 160 9992","wa":"+971 56 160 9992","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Tile King","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Mohammed","ph":"+971 50 772 0447","wa":"+971 50 772 0447","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Tiles Manju","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"","ph":"+971 55 680 0685","wa":"+971 55 680 0685","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Umair Ramzan LLC","t":"IT & Technology","sp":"Software","cp":"","ph":"+971 50 723 7419","wa":"+971 50 723 7419","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Wissam Hardwares","t":"Furniture & Furnishing","sp":"Joinery, custom furniture, fit-out","cp":"","ph":"+971 50 270 0759","wa":"+971 50 270 0759","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Massimo Trading","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Zakaria","ph":"+971 58 561 9494","wa":"+971 58 561 9494","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Zulfikar Tools & Machinery Rental","t":"Equipment / Rental","sp":"Construction Equipment Rental","cp":"","ph":"+971 55 763 8795","wa":"+971 55 763 8795","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"IMPEX GLOBAL","t":"General Trading / Materials","sp":"Building Materials & Supplies","cp":"","ph":"+971 50 660 5446","wa":"+971 50 660 5446","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"DEWMARK","t":"Insulation","sp":"Expansion Joint Systems","cp":"Denis","ph":"+971 56 174 5555","wa":"+971 56 174 5555","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"GAAP","t":"IT & Technology","sp":"Financial Accounting, Audit & Accounting","cp":"Abdul Riyaz","ph":"+971 50 361 3306","wa":"+971 50 361 3306","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AL WAED AL MONGEZ","t":"Tiles / Marble / Stone","sp":"Tiles, and Marbles fixing","cp":"Alidarwish","ph":"+971 52 679 5620","wa":"+971 52 679 5620","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AL KHAIL","t":"Landscaping / Irrigation","sp":"Equestrian Equipment Supply","cp":"Naseer aweer","ph":"+971 50 868 6774","wa":"+971 50 868 6774","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"GENERAL INTERNATIONAL","t":"Fire & Safety","sp":"Fire Fighting","cp":"","ph":"+971 50 839 7533","wa":"+971 50 839 7533","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"LULATH SAHRA DÉCOR LLC","t":"General Trading / Materials","sp":"GRP Products Supply","cp":"kamran","ph":"+971 58 299 3130","wa":"+971 58 299 3130","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Pecom Technologies","t":"Electrical & Lighting","sp":"Cable Termination","cp":"Thalha","ph":"+971 50 908 7643","wa":"+971 50 908 7643","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Createve  Rent","t":"Equipment / Rental","sp":"Generator Supply","cp":"Thahsin","ph":"+971 52 385 6604","wa":"+971 52 385 6604","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"ALBADYA","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"Arun","ph":"971554693900","wa":"971554693900","e":"lighting.sales@albadayalighting.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"High quality scaffolding LLC","t":"Scaffolding","sp":"Scaffolding Installation","cp":"Ahmed","ph":"+971 54 244 0841","wa":"+971 54 244 0841","e":"rental@highqualityscaf.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"INSTANTFIX Technical services","t":"Joinery / Carpentry / Fit-out","sp":"Interior Design, Fit-Out, MEP Works, Joinery & Landscaping","cp":"","ph":"+971 554240171","wa":"+971 554240171","e":"infoinstantfix@gmail.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Cosmos star electromechanical LLC","t":"Permits & Approvals","sp":"DEWA Approvals","cp":"","ph":"+971 521942977","wa":"+971 521942977","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"PRIME PHOENIX","t":"Fire & Safety","sp":"Fire Fighting","cp":"Maruthi Vadnala","ph":"+971 509474262","wa":"+971 509474262","e":"mailto:maruthi@phoenix-uae.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"NOOR AL BUROOJ","t":"Professional Services","sp":"Technical Maintenance","cp":"","ph":"971544862924","wa":"971544862924","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"BLUE CODE","t":"IT & Technology","sp":"Information Technology","cp":"K.AHMED","ph":"558840788","wa":"558840788","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"SAAI SHAAN","t":"General Trading / Materials","sp":"Building Materials Supply","cp":"BHARATH","ph":"+971 54 444 1489","wa":"+971 54 444 1489","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"WIMAX","t":"IT & Technology","sp":"Smart Film Installation, LED Display Systems","cp":"MUHAMED SHAN","ph":"971542340588","wa":"971542340588","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AL SHATI STEEL WORKSHOP","t":"Steel / Rebar / Fabrication","sp":"Structural Steel Fabrication","cp":"SHAIKH FAHAD ISLAM","ph":"971-54-2855734","wa":"971-54-2855734","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"AAR Designs","t":"Joinery / Carpentry / Fit-out","sp":"Interior Design, Fit-Out, MEP Works, Joinery & Landscaping","cp":"Lijna","ph":"9715471551127","wa":"9715471551127","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"TRAILWISE SOLUTIONS FZCO","t":"HVAC","sp":"HVAC Services & Equipment","cp":"","ph":"971523354235","wa":"971523354235","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"SABTA Granite & Marbles Trading","t":"Tiles / Marble / Stone","sp":"Granite & Marble Supply","cp":"","ph":"971 65344972","wa":"971 65344972","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"JACK GROUP","t":"Professional Services","sp":"AutoCAD Drafting","cp":"BLESSON JOHN","ph":"971 509633144","wa":"971 509633144","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"CAESARSTONE","t":"Tiles / Marble / Stone","sp":"Marble & Granite Supply","cp":"Mohamed Afsar","ph":"971 65392488","wa":"971 65392488","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Hanart Façade Specialist Engineering","t":"Joinery / Carpentry / Fit-out","sp":"Partition Systems,Room Divider Installation,Wall Panel Installation","cp":"","ph":"058 2677012","wa":"058 2677012","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"ADVERTISING","t":"Printing & Signage","sp":"Sign Board Design & Installation,Digital Printing, Branding & Visual Solutions","cp":"MEHAR AD","ph":"971 551460084","wa":"971 551460084","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"ACCURATE","t":"Pest Control","sp":"Pest Control,Termite Control,Insect Control","cp":"NAVEED AHAMED","ph":"971 524557184","wa":"971 524557184","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"NAVSAC","t":"IT & Technology","sp":"IT Support,Network Solutions,Hardware Support","cp":"KAMAL HANEEF","ph":"971 507893696","wa":"971 507893696","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"MFZ","t":"General Trading / Materials","sp":"Building Materials Supply","cp":"","ph":"971 502107638","wa":"971 502107638","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"NOBEL DESIGN","t":"Joinery / Carpentry / Fit-out","sp":"Interior Design, Fit-Out, MEP Works, Joinery & Landscaping","cp":"","ph":"971 527317887","wa":"971 527317887","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"K A M E  Landscaping","t":"Swimming Pool","sp":"Swimming Pool Maintenance","cp":"","ph":"971 56 746 6725","wa":"971 56 746 6725","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"MARBLE WORKS","t":"Tiles / Marble / Stone","sp":"Marble & Granite Supply","cp":"","ph":"+971 50 915 6238","wa":"+971 50 915 6238","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ACUMEN LIGHT","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"Nawas Ahamed","ph":"971 543681886","wa":"971 543681886","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"RYAN TECHNICAL SERVICES LLC","t":"MEP / Electromechanical","sp":"MEP","cp":"","ph":"971 56 530 6933","wa":"971 56 530 6933","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Al Hadid","t":"Glass & Aluminium","sp":"Glass bluring Film work","cp":"","ph":"971 55 457 6735","wa":"971 55 457 6735","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"SOFT TECH MIDDLE EAST LLC","t":"IT & Technology","sp":"IT Support,Network Solutions,Hardware Support","cp":"","ph":"971 56 412 6251","wa":"971 56 412 6251","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"SHUNTIAN","t":"General Trading / Materials","sp":"Building Materials Supply","cp":"SUMEYA SIRAJ","ph":"971 5077898871","wa":"971 5077898871","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AATC TRDING","t":"Electrical & Lighting","sp":"Electrical Materials Supply","cp":"","ph":"971 568449962","wa":"971 568449962","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"AL NAIM LIGHTING","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"","ph":"97 568673222","wa":"97 568673222","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Craft Stone Technical Services LLC","t":"Tiles / Marble / Stone","sp":"Marble & Granite Supply","cp":"MOHAMMED","ph":"542138881","wa":"542138881","e":"info@craftstoneae.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Hebei Ouyin Acoustic Decoration Materials Co., Ltd.","t":"Insulation","sp":"Acoustic Insulation Materials, & Noise Control Solutions","cp":"PENNY","ph":"+86 13230193679","wa":"+86 13230193679","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"CHEMSOL TRADING LLC","t":"Paints & Coatings","sp":"Epoxy Flooring,Epoxy Floor Coating,Resin Flooring","cp":"ASHKER","ph":"525770370","wa":"525770370","e":"ASHKER.HUSSAIN@CHEMSOPOLY.COM","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"LEADERS FORT CONTRACTING L.L.C","t":"Paints & Coatings","sp":"Epoxy Flooring,Epoxy Floor Coating,Resin Flooring","cp":"MOHAMED","ph":"507040094","wa":"507040094","e":"yehia.a@leaders-fort.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"SEMAAN_EPOXY-I FIX","t":"Paints & Coatings","sp":"Epoxy Flooring,Epoxy Floor Coating,Resin Flooring","cp":"SEEMAAN","ph":"507511221","wa":"507511221","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"CATERPILLAR-UAE RENTAL &SALES.","t":"IT & Technology","sp":"Diesel generator and Tower lights,Reach trucks and PPT,Diesel and electric forklift","cp":"REJU","ph":"44597200","wa":"561355038","e":"reju.kattukaran@albahar.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Reshma Facade lighting","t":"Electrical & Lighting","sp":"Lighting & Electrical Supplies","cp":"Reshma","ph":"563823624","wa":"563823624","e":"reshma@facadelight.com","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Evin Thomas~Reyah Al Reef","t":"HVAC","sp":"HVAC Services & Equipment","cp":"Thomas","ph":"+971 52 929 2198","wa":"+971 52 929 2198","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"Riyas -Solico Tanks Grp Water Tank | Bridgestone","t":"General Trading / Materials","sp":"Building Materials/ General Trading","cp":"Riyas","ph":"+971 50 460 0250","wa":"+971 50 460 0250","e":"","w":"","a":"Dubai","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ALHARAM ALAALI SCAFFOLDING TRADING","t":"Scaffolding","sp":"Scaffolding Materials & Services","cp":"","ph":"+971 55 108 6677","wa":"+971 55 108 6677","e":"","w":"","a":"Abu Dhabi","ty":"Subcontractor","no":"Get phone/email from site"},{"n":"ANT Sundex Sanitary","t":"MEP / Electromechanical","sp":"Sanitary wares & Building materials","cp":"","ph":"+971 58 185 4835","wa":"+971 58 185 4835","e":"sales@antdubai.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Aquazone Bagno Sanitary","t":"Furniture & Furnishing","sp":"EXPERTLY CRAFTED BATHROOMS ,TILES,SLABS,KITCHEN APPLIANCES, OUTDOOR FURNITURE","cp":"","ph":"‎+971 3 766 3300","wa":"+971 54 994 4095","e":"info@sanipexgroup.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Artificial Trd Tile Marble","t":"Tiles / Marble / Stone","sp":"Tiles & Marble / Building Finishing Materials","cp":"","ph":"+971 50 123 0127","wa":"+971 50 123 0127","e":"info@royaltopmarbles.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Bita Justime Taiwan Sanitary","t":"Sanitaryware / Plumbing","sp":"Faucets / Taps & Plumbing Fixtures","cp":"","ph":"‎+971 58 207 9931","wa":"‎+971 58 207 9931","e":"justime.uae@gmail.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Dream Sanitary Tile Marble","t":"Sanitaryware / Plumbing","sp":"Bathroom Fixtures / Tiles / Marble & Stone","cp":"","ph":"+971 55 951 9123","wa":"+971 55 951 9123","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Emirates Sanitary","t":"Sanitaryware / Plumbing","sp":"Sanitary Ware, Ceramic/Porcelain Tiles & Bathroom Accessories","cp":"","ph":"‎+971 2 671 5500","wa":"‎+971 2 671 5500","e":"eceramic@emiratesceramic.ae","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Mams Trading Plywood","t":"Joinery / Carpentry / Fit-out","sp":"Plywood / Timber / Building Materials","cp":"","ph":"+971 52 672 1258","wa":"+971 52 672 1258","e":"support@mamstradingllc.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Mansoor UAE Enterprises","t":"General Trading / Materials","sp":"supplies materials","cp":"","ph":"+971 52 775 4476","wa":"+971 52 775 4476","e":"info@almansoorgroup.com","w":"","a":"Abu Dhabi","ty":"Supplier","no":"Get phone/email from site"},{"n":"Arabian Electrical Db Switch Gear Al Ain","t":"Electrical & Lighting","sp":"Electrical / Switchgear & Distribution Boards","cp":"","ph":"+971 50 854 5007","wa":"+971 50 854 5007","e":"asdswitchgear@gmail.com","w":"","a":"Abu Dhabi","ty":"Supplier","no":"Get phone/email from site"},{"n":"Musammil Moosa ( Rackfab Storage Solution )","t":"IT & Technology","sp":"Pallet racking and heavy-duty racks,Pipe and tyre racking,Customized warehouse storage solutions","cp":"Musammil","ph":"+971 58 295 5656","wa":"+971 58 295 5656","e":"hr@rackfab.ae","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Stride Information Technology L.L.C.","t":"IT & Technology","sp":"IT systems, networking, technology solutions","cp":"Stide IT","ph":"+971 50 159 3100","wa":"+971 50 159 3100","e":"Sales@strideitme.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"DSS Steel Athaur Rehman","t":"Steel / Rebar / Fabrication","sp":"Steel Materials.","cp":"","ph":"+971 58 821 7649","wa":"+971 58 821 7649","e":"info@dsssteel.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Ajmal Steel Tubes and Pipes Industries LLC","t":"Steel / Rebar / Fabrication","sp":"produces carbon steel pipes and structural steel tubes","cp":"Syed","ph":"+971 56 509 2350","wa":"+971 56 509 2350","e":"syed@ajsteel.com","w":"","a":"Abu Dhabi","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Abbas Fasteners And Hardware Ali Hati","t":"Hardware / Fasteners","sp":"hardware and construction-material supplier","cp":"","ph":"+971 50 349 5251","wa":"+971 50 349 5251","e":"alihatim@abbasihardware.ae","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Al Suwaidi Computer Senthil Ref By Soumya.","t":"IT & Technology","sp":"IT / Information Technology Services","cp":"","ph":"‎+971 55 473 0326","wa":"‎+971 55 473 0326","e":"presales@suwaidillc.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Building Material/ Hardware Admiral Tech","t":"General Trading / Materials","sp":"wholesale distribution, import/export","cp":"Aziz Murtaza","ph":"+971 55 895 2520","wa":"+971 55 895 2520","e":"admiral.hardware@eim.ae","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Calibre Hardware","t":"Gypsum / Ceiling / Partition","sp":"Specialized pipe supports, high-pressure industrial pipe fittings","cp":"Hamid","ph":"+971 55 678 1061","wa":"+971 55 678 1061","e":"sales@calibrehardware.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Computer Trading Nippon General Trading","t":"Equipment / Rental","sp":"Refurbished Electronics Supply","cp":"Amjad Ref Abrar","ph":"+971 52 874 6290","wa":"+971 52 874 6290","e":"info@nipponuae.com","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"},{"n":"Ghazi Textile Trading","t":"Tiles / Marble / Stone","sp":"importer, exporter, and wholesaler within the textiles and fabrics industry","cp":"Ghazi Amanullah","ph":"+971 50 341 0415","wa":"+971 50 341 0415","e":"","w":"","a":"Dubai","ty":"Supplier","no":"Get phone/email from site"}];
var PROC_TRADES = ["Glass & Aluminium","Tiles / Marble / Stone","Joinery / Carpentry / Fit-out","Gypsum / Ceiling / Partition","MEP / Electromechanical","Electrical & Lighting","HVAC","Fire & Safety","Paints & Coatings","Waterproofing / Chemicals","Steel / Rebar / Fabrication","Concrete / Ready-mix / Precast","Aggregates / Sand / Base","Blocks / Interlock / Kerb","Cement / Building Materials","Sanitaryware / Plumbing","Doors / Shutters","Landscaping / Irrigation","Swimming Pool","Scaffolding","Cleaning Services","Pest Control","CCTV & Security","IT & Technology","Printing & Signage","Equipment / Rental","Testing / Survey","Permits & Approvals","Professional Services","Marketing & Media","Insulation","Storage / Racking","Hardware / Fasteners","Furniture & Furnishing","Utilities","General Trading / Materials"];
function canonTrade(cat, trade) {
  var t = String((cat || "") + " " + (trade || "")).toLowerCase();
  var H = function () { for (var i = 0; i < arguments.length; i++) if (t.indexOf(arguments[i]) >= 0) return true; return false; };
  if (H("glass","alumini","glazing","curtain wall","cladding","mirror")) return "Glass & Aluminium";
  if (H("tile","marble","granite","stone") && !H("sanitary")) return "Tiles / Marble / Stone";
  if (H("furniture","home furn")) return "Furniture & Furnishing";
  if (H("joinery","carpentry","fit-out","fit out","fitout","plywood","timber","furnishing","interior fit")) return "Joinery / Carpentry / Fit-out";
  if (H("gypsum","ceiling","partition","framing")) return "Gypsum / Ceiling / Partition";
  if (H("hvac","air condition")) return "HVAC";
  if (H("mep","electromechanical")) return "MEP / Electromechanical";
  if (H("fire")) return "Fire & Safety";
  if (H("paint","coating")) return "Paints & Coatings";
  if (H("waterproof","construction chemical")) return "Waterproofing / Chemicals";
  if (H("rebar","steel","fabricat","metal work","structural","cnc")) return "Steel / Rebar / Fabrication";
  if (H("ready-mix","ready mix","precast","concrete")) return "Concrete / Ready-mix / Precast";
  if (H("aggregate","road base","sand")) return "Aggregates / Sand / Base";
  if (H("block","interlock","kerbstone")) return "Blocks / Interlock / Kerb";
  if (H("cement")) return "Cement / Building Materials";
  if (H("sanitary","ceramic","bathroom") || H("plumbing")) return "Sanitaryware / Plumbing";
  if (H("door","shutter")) return "Doors / Shutters";
  if (H("pool")) return "Swimming Pool";
  if (H("landscap","irrigation","hardscape","garden","equestrian")) return "Landscaping / Irrigation";
  if (H("scaffold")) return "Scaffolding";
  if (H("lighting","electrical","switchgear")) return "Electrical & Lighting";
  if (H("clean")) return "Cleaning Services";
  if (H("pest")) return "Pest Control";
  if (H("cctv","security")) return "CCTV & Security";
  if (H("information technology","software","network","computer","office equipment","audio visual","display","telecom") || H("it ")) return "IT & Technology";
  if (H("print","signage","ink","typing","advertis")) return "Printing & Signage";
  if (H("crane","equipment","generator","power generation","truck","leyland")) return "Equipment / Rental";
  if (H("testing","laborator","survey")) return "Testing / Survey";
  if (H("permit","licens","government","approval")) return "Permits & Approvals";
  if (H("advocate","legal","account","engineering & design","interior design","design services","facility")) return "Professional Services";
  if (H("marketing","media","event","video","production")) return "Marketing & Media";
  if (H("insulation","expansion joint")) return "Insulation";
  if (H("storage","racking","shelving")) return "Storage / Racking";
  if (H("anchor","fastener","hardware")) return "Hardware / Fasteners";
  if (H("water supply","utility")) return "Utilities";
  return "General Trading / Materials";
}

function dirNm(x) { return String(x || "").trim().toLowerCase(); }
// Mirror a finance supplier/subcontractor into the procurement directory so the
// two are one growing vendor base. Creates a directory entry if none matches by
// link or name, else links it and fills blank contact/trade fields (never
// overwrites existing directory data). Pass ctx.{items,stg} to batch in a loop.
async function dirUpsertFromSupplier(s, sup, ctx) {
  if (!sup || !sup.name) return null;
  ctx = ctx || {};
  const items = ctx.items || await getAllJSON(s, "pvendor/");
  const isEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(e || "").trim());
  const phone = sup.mobile || sup.tel || sup.contact || "";
  const trade = canonTrade(sup.category, sup.trade);
  let pv = items.find((v) => v.supplierId === sup.id) || items.find((v) => dirNm(v.name) === dirNm(sup.name));
  if (pv) {
    let ch = false;
    if (pv.supplierId !== sup.id) { pv.supplierId = sup.id; ch = true; }
    if (!isEmail(pv.email) && isEmail(sup.email)) { pv.email = String(sup.email).trim(); ch = true; }
    if (!pv.phone && phone) { pv.phone = phone; ch = true; }
    if (!pv.contactName && sup.contactName) { pv.contactName = sup.contactName; ch = true; }
    if (!pv.emirate && sup.emirate) { pv.emirate = sup.emirate; ch = true; }
    if (!pv.website && sup.website) { pv.website = sup.website; ch = true; }
    if ((!pv.trade || pv.trade === "General Trading / Materials") && trade && trade !== "General Trading / Materials") { pv.trade = trade; ch = true; }
    if (sup.type === "Subcontractor" && pv.type === "Supplier") { pv.type = "Both"; ch = true; }
    if (ch) { pv.updatedAt = now(); await s.setJSON("pvendor/" + pv.id, pv); }
    return pv.id;
  }
  const stg = ctx.stg || await s.get("settings", { type: "json" });
  const id = await nextId(s, stg, "pvendorSeq", "PV", "pvendor/", 4);
  if (!ctx.stg) await s.setJSON("settings", stg);
  pv = {
    id, seq: Number(String(id).replace(/\D/g, "")) || 0, name: sup.name, trade, specialty: sup.trade || "",
    contactName: sup.contactName || "", phone, whatsapp: "", email: isEmail(sup.email) ? String(sup.email).trim() : "", website: sup.website || "",
    emirate: sup.emirate || "", type: sup.type === "Subcontractor" ? "Subcontractor" : (sup.type === "Both" ? "Both" : "Supplier"),
    status: "Active", rating: 0, notes: "", supplierId: sup.id, source: "supplier-registry",
    createdAt: now(), createdBy: "system", updatedAt: now()
  };
  await s.setJSON("pvendor/" + id, pv);
  if (ctx.items) ctx.items.push(pv);
  return id;
}
var TARMAC_BOQ = [{"ref": "1", "description": "Concrete – Sulphate Content of Hardened Concrete / Dust Sample (BS 1881-124:2015+A1:2021)", "unit": "Test", "rate": 40.0, "qty": 1.0}, {"ref": "2", "description": "Ultrasonic Pulse Velocity Test (Min. 5 tests per visit) (BS EN 12504 Part 4)", "unit": "Test", "rate": 225.0, "qty": 1.0}, {"ref": "3", "description": "Water Absorption Test on Hardened Concrete (BS 1881 Part 122:2011+A1:2020)", "unit": "Cube", "rate": 55.0, "qty": 1.0}, {"ref": "4", "description": "Chloride Content of Hardened Concrete / Dust Sample (BS 1881-124:2015+A1:2021)", "unit": "Test", "rate": 40.0, "qty": 1.0}, {"ref": "5", "description": "Compressive Strength of Cubes (BS 1881 Part 116:83 AMD 6097-89 & 6720-91)", "unit": "Cube", "rate": 10.0, "qty": 1.0}, {"ref": "6", "description": "Compressive Strength of Drilled Concrete Cores (Core Test) (BS 1881-120 / BS EN 12504-1)", "unit": "Core", "rate": 125.0, "qty": 1.0}, {"ref": "7", "description": "Concrete Core Sampling & Compressive Strength Test (incl. sample prep) (BS EN 12504-1:2019)", "unit": "Core", "rate": 325.0, "qty": 1.0}, {"ref": "8", "description": "Depth of Penetration of Water Under Pressure (BS EN 12390 Part 8:2019)", "unit": "Cube", "rate": 50.0, "qty": 1.0}, {"ref": "9", "description": "Initial Surface Absorption on Concrete – ISAT (BS 1881 Part 208:1996)", "unit": "Cube", "rate": 50.0, "qty": 1.0}, {"ref": "10", "description": "Rapid Chloride Penetration of Concrete – RCP (ASTM C1202-22)", "unit": "Cube", "rate": 110.0, "qty": 1.0}, {"ref": "11", "description": "Schmidt Hammer / Rebound Hammer Test (Min. 5 tests per visit) (BS EN 12504-2:2012)", "unit": "Test", "rate": 120.0, "qty": 1.0}, {"ref": "12", "description": "In-Situ Density (Min. 4 tests per visit) (BS 1377 Part 9)", "unit": "Test", "rate": 50.0, "qty": 1.0}, {"ref": "13", "description": "Coating Thickness of Paint – Onsite (Min. 5 tests per visit) (ASTM D4138-07a / ISO 2808:2019)", "unit": "Test", "rate": 100.0, "qty": 1.0}, {"ref": "14", "description": "Mobilization Charge for Field Tests / Sample Collection", "unit": "Visit", "rate": 150.0, "qty": 1.0}, {"ref": "15", "description": "Pull Off Test of Paint (Min. 3 tests per visit) (ASTM D4541-17)", "unit": "Test", "rate": 250.0, "qty": 1.0}, {"ref": "16", "description": "Acid Soluble Chloride Content of Soil (BS 1377 Part 3)", "unit": "Test", "rate": 40.0, "qty": 1.0}, {"ref": "17", "description": "Acid Soluble Sulphate Content of Soil (BS 1377 Part 3)", "unit": "Test", "rate": 40.0, "qty": 1.0}, {"ref": "18", "description": "California Bearing Ratio – CBR (BS 1377 Part 2:2022 Cl.15)", "unit": "Test", "rate": 120.0, "qty": 1.0}, {"ref": "19", "description": "Dry Density / Optimum Moisture Content Relationship (BS 1377 Part 4:1990 / BS 1377-2:2022)", "unit": "Test", "rate": 100.0, "qty": 1.0}, {"ref": "20", "description": "Level Confirmation", "unit": "No.", "rate": 200.0, "qty": 1.0}, {"ref": "21", "description": "Liquid Limit, Plastic Limit & Plasticity Index (BS 1377 Part 2 / BS EN ISO 17892-12)", "unit": "Test", "rate": 70.0, "qty": 1.0}, {"ref": "22", "description": "Plate Load Test (reaction load by Client) (BS 1377 Part 9:1990)", "unit": "Test", "rate": 385.0, "qty": 1.0}, {"ref": "23", "description": "Bend Test on Reinforcement Steel Bars (up to 32mm dia) (BS 4449:2005+A3:2016)", "unit": "Specimen", "rate": 30.0, "qty": 1.0}, {"ref": "24", "description": "Chemical Testing of Steel (C,S,P,N & CEV) – Optical Emission (ASTM E415)", "unit": "Specimen", "rate": 275.0, "qty": 1.0}, {"ref": "25", "description": "Pull Out Test of Steel Bar (up to 25mm dia, Min. 3 tests per visit) (BS 5080 Part 1)", "unit": "Test", "rate": 200.0, "qty": 1.0}, {"ref": "26", "description": "Rebend Test on Reinforcement Steel Bars (up to 32mm dia) (BS 4449:2005+A3:2016)", "unit": "Specimen", "rate": 32.0, "qty": 1.0}, {"ref": "27", "description": "Tensile Test on Reinforcement Steel Bars (up to 32mm dia) (BS 4449:2005+A3:2016 / BS EN ISO 15630-1)", "unit": "Specimen", "rate": 48.0, "qty": 1.0}];
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
  try { await runProjectMergeMigration(s, settings); } catch (e) { }
  try { await runProjectFixV2(s, settings); } catch (e) { }
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
  // One-time: provision the MA Group staff accounts per the CEO's list.
  if (!settings.staffV1) {
    const staff = [
      { id: "ceo", name: "Eng. Mohammed Abuassba", role: "CEO", pin: null },
      { id: "osama", name: "Mr. Osama", role: "Accounts", pin: "3333" },
      { id: "sinan", name: "Sinan", role: "Clerk", pin: "5555" },
      { id: "jesse", name: "Jesse", role: "Secretary", pin: "4444" }
    ];
    for (const st of staff) {
      let u = users.find((x) => x.id === st.id);
      if (!u) { u = { id: st.id, salt: randomBytes(8).toString("hex"), pinHash: "" }; users.push(u); }
      u.name = st.name; u.role = st.role;
      if (st.pin && !u.pinHash) { u.pinHash = hashPin(st.pin, u.salt); u.mustChangePin = true; }
    }
    await s.setJSON("users", users);
    settings.staffV1 = true;
    await s.setJSON("settings", settings);
  }
  // Remove the demo/seed accounts with public default PINs — the real staff are
  // the four provisioned above. (Historical records keep the actor's name, so
  // audit trails are unaffected.)
  if (!settings.staffPruneV1) {
    const keep = new Set(["ceo", "osama", "sinan", "jesse"]);
    const pruned = users.filter((u) => keep.has(u.id));
    if (pruned.length !== users.length) { users = pruned; await s.setJSON("users", users); }
    settings.staffPruneV1 = true;
    await s.setJSON("settings", settings);
  }
  // One-time: grant the CFO (Mr. Osama) full CEO-equivalent access. Access role is
  // set to CEO so every permission gate (backend + frontend) treats him identically;
  // a display title keeps his designation shown as CFO in the header.
  if (!settings.cfoFullAccessV1) {
    const ceoU = users.find((x) => x.id === "ceo");
    if (ceoU && !ceoU.title) ceoU.title = "Chief Executive Officer (CEO)";
    const u = users.find((x) => x.id === "osama");
    if (u) { u.role = "CEO"; u.title = "Chief Financial Officer (CFO)"; }
    await s.setJSON("users", users);
    settings.cfoFullAccessV1 = true;
    await s.setJSON("settings", settings);
  }
  // One-time: repair supplier IPCs where the invoice amount was mistakenly entered
  // in the Contra box (zero certified value + a contra) — a per-invoice payment that
  // came out negative. Move the amount to the invoice value so it becomes a normal
  // positive payment, and align any recorded payment / register / cost line.
  if (!settings.fixNegContraV1) {
    try {
      const certs = await getAllJSON(s, "cert/");
      let reg = null;
      for (const c of certs) {
        if (!c || c.status === "Cancelled") continue;
        const cum = num(c.calc?.cumValue), contra = num(c.contra), inv = num(c.invoiceAmount);
        if (cum === 0 && contra > 0 && inv === 0) {
          c.invoiceAmount = contra; c.contra = 0;
          const sup = await s.get("supplier/" + c.supplierId, { type: "json" });
          await recompute(c, sup);
          if (c.payment) {
            const newAmt = num(c.calc?.payable);
            c.payment.amount = newAmt;
            if (!reg) reg = await s.get("register", { type: "json" }) || [];
            for (const r of reg) if (r && r.no === c.no) r.amount = newAmt;
          }
          if (Array.isArray(c.audit)) c.audit.push({ at: now(), by: "system", action: `Auto-corrected — invoice amount ${contra} had been entered as contra; moved to invoice value (now a positive payment)` });
          await s.setJSON("cert/" + c.no, c);
          try { await upsertCertExpense(s, c); } catch (e) {}
        }
      }
      if (reg) await s.setJSON("register", reg);
    } catch (e) {}
    settings.fixNegContraV1 = true;
    await s.setJSON("settings", settings);
  }
  // One-time: per-invoice suppliers (rate / no fixed contract — equipment rental,
  // one-off services) should carry no retention and no DLP (nothing to secure).
  // Zero both on those supplier records and re-cost their not-yet-paid certificates.
  if (!settings.zeroRetPerInvoiceV1) {
    try {
      const sups = await getAllJSON(s, "supplier/");
      const changed = new Set();
      for (const sp of sups) {
        if (!sp) continue;
        const perInvoice = sp.contractType === "Rate" || !(num(sp.contractValue) > 0);
        if (perInvoice && (num(sp.retentionPct) > 0 || num(sp.dlpMonths) > 0)) {
          sp.retentionPct = 0; sp.dlpMonths = 0; sp.retentionRelease = "";
          await s.setJSON("supplier/" + sp.id, sp);
          changed.add(sp.id);
        }
      }
      if (changed.size) {
        const certs = await getAllJSON(s, "cert/");
        for (const c of certs) {
          if (!c || !changed.has(c.supplierId)) continue;
          if (["Paid", "Cancelled"].includes(c.status)) continue; // don't disturb settled payments
          const sp = await s.get("supplier/" + c.supplierId, { type: "json" });
          c.retentionPct = 0;
          await recompute(c, sp);
          await s.setJSON("cert/" + c.no, c);
          try { await upsertCertExpense(s, c); } catch (e) {}
        }
      }
    } catch (e) {}
    settings.zeroRetPerInvoiceV1 = true;
    await s.setJSON("settings", settings);
  }
  // One-time seed of the procurement vendor directory from the MA Group
  // supplier/subcontractor directory (296 vendors, deduped, trade-normalised).
  if (!settings.procSeedV1) {
    try {
      const existing = await s.list({ prefix: "pvendor/" });
      if (!existing.blobs.length) {
        let seq = num(settings.pvendorSeq) || 0;
        const items = PROC_SEED.map((r) => {
          seq++;
          const id = "PV" + String(seq).padStart(4, "0");
          return {
            id, seq, name: r.n, trade: r.t, specialty: r.sp || "",
            contactName: r.cp || "", phone: r.ph || "", whatsapp: r.wa || "", email: r.e || "",
            website: r.w || "", emirate: r.a || "", type: r.ty || "Supplier",
            status: "Active", rating: 0, notes: r.no || "", supplierId: "",
            source: "directory-import", createdAt: now(), createdBy: "system", updatedAt: now()
          };
        });
        settings.pvendorSeq = seq;
        await s.setJSON("settings", settings);
        for (let i = 0; i < items.length; i += 40) {
          await Promise.all(items.slice(i, i + 40).map((v) => s.setJSON("pvendor/" + v.id, v)));
        }
      }
    } catch (e) {}
    settings.procSeedV1 = true;
    await s.setJSON("settings", settings);
  }
  // Retro-activate contracts that were countersigned before the automation existed:
  // push their terms onto the supplier (so IPCs treat them as fixed contracts with
  // retention/advance recovery) and create the down-payment certificate if an advance
  // is due and none exists yet.
  if (!settings.contractActivateV1) {
    try {
      const awards = await getAllJSON(s, "award/");
      const sysMe = { id: "system", name: "system" };
      for (const aw of awards) {
        if (!aw || aw.status !== "Countersigned") continue;
        const sup = await syncSupplierFromAward(s, aw);
        if (sup && num(aw.advanceAmount) > 0 && !aw.advanceCertNo) {
          try { await createAdvanceCertFromAward(s, aw, sup, sysMe); await s.setJSON("award/" + aw.id, aw); } catch (e) {}
        }
      }
    } catch (e) {}
    settings.contractActivateV1 = true;
    await s.setJSON("settings", settings);
  }
  // Write per-project contract records for existing signed contracts, so each
  // project's IPCs read ITS OWN contract (value, retention, advance) instead of the
  // supplier's global fields.
  if (!settings.contractPerProjectV1) {
    try {
      const awards = await getAllJSON(s, "award/");
      for (const aw of awards) {
        if (!aw || aw.status !== "Countersigned" || !aw.project) continue;
        try { await syncSupplierFromAward(s, aw); } catch (e) {}
      }
    } catch (e) {}
    settings.contractPerProjectV1 = true;
    await s.setJSON("settings", settings);
  }
  if (!settings.tarmacBoqV1) {
    try {
      const sups = await getAllJSON(s, "supplier/");
      const t = sups.find(x => /tarmac/i.test(x.name || ""));
      if (t) {
        let proj = (t.project && /squar/i.test(t.project)) ? t.project : "";
        if (!proj) { const p = (settings.projects || []).find(p => /squar/i.test(p.name || "")); proj = p ? p.name : (t.project || ""); }
        if (proj) {
          const key = supProjKey(t.id, proj);
          let rec = await s.get(key, { type: "json" }) || { supplierId: t.id, project: proj, contractType: "Rate", contractValue: 0, advanceAmount: 0, advanceRecoveryRate: 0, retentionPct: num(t.retentionPct), dlpMonths: num(t.dlpMonths), vatPct: num(t.vatPct) || 0.05, createdAt: now() };
          if (!(Array.isArray(rec.boq) && rec.boq.length)) {
            rec.boq = TARMAC_BOQ.map(l => ({ ref: l.ref, description: l.description, unit: l.unit, rate: num(l.rate), qty: num(l.qty) }));
            rec.contractType = "Rate"; rec.docNo = rec.docNo || "MAG/PO-00179";
            rec.boqValue = r2(rec.boq.reduce((a, l) => a + r2(num(l.qty) * num(l.rate)), 0)); rec.updatedAt = now();
            await s.setJSON(key, rec);
          }
        }
      }
    } catch (e) {}
    settings.tarmacBoqV1 = true;
    await s.setJSON("settings", settings);
  }
  // Recompute BOQ / rate-schedule certificates under the corrected rule: a rate /
  // price-list contract (e.g. a testing lab) values each certificate per-invoice and
  // never deducts another invoice's previously-certified amount. Fixed-value measured
  // BOQs are unaffected (they stay cumulative), so this is safe and idempotent.
  if (!settings.boqPerInvoiceV1) {
    try {
      const certs = await getAllJSON(s, "cert/");
      for (const c of certs) {
        if (!c || c.kind === "advance") continue;
        if (!(Array.isArray(c.lines) && c.lines.length)) continue;
        const sp = await s.get("supplier/" + c.supplierId, { type: "json" });
        await recompute(c, sp);
        await s.setJSON("cert/" + c.no, c);
        try { await upsertCertExpense(s, c); } catch (e) {}
      }
    } catch (e) {}
    settings.boqPerInvoiceV1 = true;
    await s.setJSON("settings", settings);
  }
  // Pre-load The Square 2.0 client contract's work-breakdown (by-building BOQ) so the
  // client IPC only needs the cumulative % done per building each period.
  if (!settings.squareClientBoqV1) {
    try {
      const contracts = await getAllJSON(s, "contract/");
      const k = contracts.find((c) => /squar/i.test(c.project || ""));
      if (k && !(Array.isArray(k.boq) && k.boq.length)) {
        k.boq = [
          { ref: "1", name: "Operation Building", value: 1202483, isVariation: false, remarks: "" },
          { ref: "2", name: "Male & Female Toilet – With Prayer", value: 877050, isVariation: false, remarks: "" },
          { ref: "3", name: "Male & Female Toilet – Without Prayer", value: 814280, isVariation: false, remarks: "" },
          { ref: "4", name: "Staff Toilet – With Prayer", value: 418257, isVariation: false, remarks: "" },
          { ref: "5", name: "Staff Toilet – Without Prayer", value: 268785, isVariation: false, remarks: "" },
          { ref: "6", name: "Substation", value: 829367, isVariation: false, remarks: "" },
          { ref: "7", name: "Pump Room", value: 267601, isVariation: false, remarks: "" },
          { ref: "8", name: "Kids Play Area – Toilet", value: 814280, isVariation: false, remarks: "" },
          { ref: "9", name: "Firefighting (All Buildings)", value: 500000, isVariation: false, remarks: "" },
          { ref: "10", name: "F&P Foundations – Type A/B/C", value: 961536, isVariation: false, remarks: "" },
          { ref: "11", name: "Approved Variations (General / All VOs)", value: 280179, isVariation: true, remarks: "" }
        ];
        k.updatedAt = now();
        await s.setJSON("contract/" + k.id, k);
      }
    } catch (e) {}
    settings.squareClientBoqV1 = true;
    await s.setJSON("settings", settings);
  }
  // Retrospective ledger completion for The Square 2.0: payments were received against
  // paid tax invoices before the matching client payment certificate was raised in the
  // system. For each historical payment below, create the certificate and the receipt
  // ONLY if no record with a matching amount already exists (idempotent — never
  // duplicates anything the team already logged). Figures come verbatim from the paid
  // tax invoice, so the certificate's net/VAT/payable equal the money actually received
  // and the next certificate deducts them via "previously certified".
  if (!settings.histSquarePayV1) {
    try {
      const contracts = await getAllJSON(s, "contract/");
      const k = contracts.find((c) => /squar/i.test(c.project || ""));
      if (k) {
        const HIST = [
          { net: 476190.48, vat: 23809.52, payable: 500000, date: "2026-08-11", inv: "MAG/TAX/010/00223", desc: "The Square 2.0 Nad Al Sheba Gardens — Part #3 (P.O. PI-00041)" }
        ];
        const client = await s.get("client/" + k.clientId, { type: "json" });
        const certs = (await getAllJSON(s, "clientcert/")).filter((c) => c && c.contractId === k.id);
        const receipts = (await getAllJSON(s, "clientreceipt/")).filter((r) => r && (r.contractId === k.id || (r.project && r.project === k.project)));
        const amtNear = (x, y) => Math.abs(num(x) - num(y)) <= 1;
        let maxSeq = certs.reduce((a, c) => Math.max(a, c.seq || 0), 0);
        for (const h of HIST) {
          let cert = certs.find((c) => c.status !== "Cancelled" && (amtNear(c.calc?.payable, h.payable) || amtNear(c.calc?.net, h.net)));
          if (!cert) {
            const seq = ++maxSeq;
            let key = clientCertKey(k.id, seq);
            if (await s.get("clientcert/" + key)) continue;
            const before = certs.filter((c) => c.status !== "Cancelled" && (c.seq || 0) < seq).sort((a, b) => (b.seq || 0) - (a.seq || 0));
            const prevNet = r2(before.reduce((a, p) => a + (p.calc?.net || 0), 0));
            const recBefore = r2(before.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
            const prevGross = before[0] ? num(before[0].calc?.gross) : 0;
            const variationsCum = before[0] ? num(before[0].calc?.variationsCum) : 0;
            const grossCum = r2(prevGross + h.net);
            cert = {
              no: clientCertNo(k, client, seq, h.date), key, seq, contractId: k.id, clientId: k.clientId,
              createdBy: "system", createdAt: now(), date: h.date, periodFrom: "", periodTo: h.date,
              lines: [], grossCum, variationsCum, mos: 0, contra: 0, historical: true,
              notes: "Historical certificate raised retrospectively against PAID tax invoice " + h.inv + ". " + h.desc,
              status: "Approved",
              audit: [{ at: now(), by: "System", action: "Created retrospectively from paid tax invoice " + h.inv }],
              calc: {
                perBuilding: false, cumValue: grossCum, mos: 0, gross: grossCum, retentionPct: 0, retention: 0, afterRet: grossCum,
                advanceAmount: num(k.advanceAmount), advanceRate: 0, advanceRecovery: 0,
                advanceRecoveredToDate: recBefore, advanceOutstanding: Math.max(0, r2(num(k.advanceAmount) - recBefore)),
                retentionHeld: 0, grossThis: h.net, variationsCum, variationsThis: 0,
                grossCertifiedToDate: grossCum, retentionHeldToDate: 0, netToDate: r2(prevNet + h.net),
                prevCertified: prevNet, contra: 0, net: h.net, vatPct: 0.05, vat: h.vat, payable: h.payable
              }
            };
            await s.setJSON("clientcert/" + key, cert);
            certs.push(cert);
          }
          if (!receipts.find((r) => amtNear(r.amount, h.payable) && !r.isAdvance && !r.isRetentionRelease)) {
            const id = await nextId(s, settings, "clientReceiptSeq", "CR", "clientreceipt/", 4);
            const rec = {
              id, seq: Number(String(id).replace(/\D/g, "")) || 0,
              contractId: k.id, clientId: k.clientId, project: k.project, certNo: cert.no,
              date: h.date, amount: h.payable, mode: "Bank Transfer", ref: h.inv, bank: "",
              isRetentionRelease: false, isAdvance: false,
              notes: "Recorded retrospectively — payment received against PAID tax invoice " + h.inv,
              createdBy: "System", createdAt: now(), updatedAt: now(), updatedBy: "System"
            };
            await s.setJSON("clientreceipt/" + id, rec);
            receipts.push(rec);
          }
        }
      }
    } catch (e) {}
    settings.histSquarePayV1 = true;
    await s.setJSON("settings", settings);
  }
  // The Square 2.0 advance / down payment was received BEFORE this system went
  // live, so it was never logged — while every IPC has been recovering it. That
  // made "advance received" read zero against a real recovery. Record it once,
  // dated to the contract, flagged as an advance. It sits before the bank
  // opening date, so it does not disturb the live bank balance.
  if (!settings.histSquareAdvanceV1) {
    try {
      const contracts = await getAllJSON(s, "contract/");
      const k = contracts.find((c) => /squar/i.test(c.project || ""));
      if (k && num(k.advanceAmount) > 0) {
        const rs = (await getAllJSON(s, "clientreceipt/")).filter((r) => r && (r.contractId === k.id || (r.project && r.project === k.project)));
        const already = rs.some((r) => r.isAdvance || r.type === "advance");
        if (!already) {
          const id = await nextId(s, settings, "clientReceiptSeq", "CR", "clientreceipt/", 4);
          const rec = {
            id, seq: Number(String(id).replace(/\D/g, "")) || 0,
            contractId: k.id, clientId: k.clientId, project: k.project, certNo: "",
            date: "2026-06-12",
            amount: r2(num(k.advanceAmount)), mode: "Bank Transfer",
            ref: String(k.subcontractRef || k.offerRef || "Advance payment"),
            // Book it to the main account so it is classified, not "unallocated";
            // being dated before the opening balance it never moves the balance.
            bank: String((settings.banks || [])[0] || ""),
            isRetentionRelease: false, isAdvance: true,
            notes: "Advance / down payment received before this system went live — recorded retrospectively so the advance recovered on each IPC reconciles to cash actually received.",
            createdBy: "System", createdAt: now(), updatedAt: now(), updatedBy: "System"
          };
          await s.setJSON("clientreceipt/" + id, rec);
        }
      }
    } catch (e) {}
    settings.histSquareAdvanceV1 = true;
    await s.setJSON("settings", settings);
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
// Collision-safe sequential ID: bump the counter, then verify the record slot
// is actually free (strong-consistency read) and keep bumping until it is.
// Protects against two staff creating the same record type simultaneously.
async function nextId(s, stg, seqKey, idPrefix, storePrefix, pad) {
  let n = num(stg[seqKey]) || 0, id, guard = 0;
  do { n++; id = idPrefix + String(n).padStart(pad, "0"); } while ((await s.get(storePrefix + id)) && guard++ < 1000);
  stg[seqKey] = n;
  return id;
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
function computeCert(c, supplier, prevNet, recoveredSoFar, prevContra) {
  prevContra = num(prevContra);
  const isRate = c.basis === "rate";
  const adjusted = isRate ? 0 : num(c.originalValue) + num(c.variations);
  // BOQ / rate-schedule measurement: value the certificate from the CUMULATIVE
  // quantity done × rate per line item. This is a cumulative contract (previous
  // certificates are deducted), just measured by quantity instead of a % or lump sum.
  const hasLines = Array.isArray(c.lines) && c.lines.length > 0;
  const boqValue = hasLines ? r2(c.lines.reduce((a, l) => a + r2(num(l.qty) * num(l.rate)), 0)) : 0;
  // Per-invoice certification — each certificate stands ALONE against its own invoice,
  // nothing previously certified is deducted:
  //   • rate / price-list contracts (a testing lab, a call-off order) whether or not a
  //     BOQ price list is attached — every invoice bills its own selected items; and
  //   • any supplier with no fixed contract value.
  // A BOQ attached to a FIXED-value contract stays cumulative (measured subcontract).
  const perInvoice = isRate || adjusted <= 0;
  const cumValue = hasLines ? boqValue : (perInvoice ? r2(num(c.invoiceAmount)) : r2(adjusted * num(c.workPct)));
  const gross = r2(cumValue + num(c.materialsOnSite));
  const retention = r2(gross * num(c.retentionPct));
  const afterRet = r2(gross - retention);
  let advanceRecovery = 0;
  // Advance terms are snapshotted onto the certificate at creation (per project), so
  // they never read another project's contract. Fall back to the supplier only for
  // legacy certs created before per-project snapshotting.
  let advanceAmount = c.advanceAmount != null ? num(c.advanceAmount) : (supplier ? num(supplier.advanceAmount) : 0);
  let advanceRate = c.advanceRate != null ? num(c.advanceRate) : (supplier ? num(supplier.advanceRecoveryRate) : 0);
  {
    if (advanceAmount > 0 && advanceRate > 0) {
      if (perInvoice) {
        // Per-invoice supplier: recover the rate on THIS invoice's gross,
        // capped at the advance still outstanding.
        const remaining = Math.max(0, r2(advanceAmount - recoveredSoFar));
        advanceRecovery = Math.min(r2(advanceRate * gross), remaining);
      } else {
        // Cumulative contract: gross is the value certified to date, so
        // advanceRate * gross is the CUMULATIVE recovery target. Cap it at the
        // advance, then take this period's increment over what earlier
        // certificates already recovered — so each certificate stores a true
        // per-period recovery, never a cumulative figure that gets re-summed.
        const cumRecovery = Math.min(r2(advanceRate * gross), advanceAmount);
        advanceRecovery = Math.max(0, r2(cumRecovery - recoveredSoFar));
      }
    }
  }
  // Net this certificate = cumulative value net of retention, cumulative advance
  // recovered and cumulative contra, minus what was previously certified. Using
  // cumulative advance/contra (not just this period's) prevents prior-period
  // deductions being silently refunded on later certificates.
  const advRecToDate = r2(recoveredSoFar + advanceRecovery);
  const net = perInvoice
    ? r2(afterRet - advanceRecovery - num(c.contra))
    : r2(afterRet - advRecToDate - r2(prevContra + num(c.contra)) - prevNet);
  const vat = r2(net * num(c.vatPct));
  return {
    adjusted,
    perInvoice,
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
  // Advance / down-payment certificate: stands alone — the advance value + VAT,
  // no retention, no advance recovery (it IS the advance, recovered later by
  // progress IPCs). Excluded from the progress-cert running totals below.
  if (c.kind === "advance") {
    const adv = r2(num(c.invoiceAmount));
    const vat = r2(adv * num(c.vatPct));
    c.calc = { perInvoice: true, kind: "advance", cumValue: adv, gross: adv, retention: 0, afterRet: adv, advanceRecovery: 0, advanceAmount: 0, advanceRate: 0, advanceRecoveredToDate: 0, advanceOutstanding: 0, prevCertified: 0, net: adv, vat, payable: r2(adv + vat) };
    return c;
  }
  const priors = await certsBySupplier(c.supplierId, c.no);
  // Scope the cumulative running totals to the SAME PROJECT — a subcontractor's
  // certificates on other projects must never affect this project's certificate.
  const before = priors.filter((p) => (p.seq || 0) < (c.seq || 0) && p.kind !== "advance" && String(p.project || "") === String(c.project || ""));
  const prevNet = r2(before.reduce((a, p) => a + (p.calc?.net || 0), 0));
  const recoveredSoFar = r2(before.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
  const prevContra = r2(before.reduce((a, p) => a + num(p.contra), 0));
  c.calc = computeCert(c, supplier, prevNet, recoveredSoFar, prevContra);
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
  suppliers: ["QS", "PM", "CEO", "Secretary", "Clerk", "HR"],
  assets: ["CEO", "PM", "Secretary", "QS", "Clerk", "HR"],
  assetsDelete: ["CEO"],
  clients: ["CEO", "PM", "QS", "Secretary", "Clerk"],
  contracts: ["CEO", "PM", "QS"],
  procurement: ["CEO", "PM", "QS"],
  clientcert: ["CEO", "PM", "QS"],
  clientcertIssue: ["CEO", "PM"],
  expense: ["CEO", "PM", "QS", "Accounts", "Secretary", "Clerk", "HR"],
  expenseDelete: ["CEO", "PM"],
  pnl: ["CEO", "PM", "QS", "Accounts", "Clerk"],
  budget: ["CEO", "PM", "QS", "Accounts", "Clerk"],
  budgetEdit: ["CEO", "PM", "QS"],
  ops: ["CEO", "PM", "QS", "Accounts", "Clerk", "Secretary", "HR"],
  opsEdit: ["CEO", "Accounts", "Secretary", "HR"],
  opsPayroll: ["CEO", "Accounts", "HR"],
  opsPost: ["CEO", "Accounts"],
  // Marketing department prepares; the CEO approves, publishes and sends.
  announce: ["CEO", "HR", "Marketing"],
  marketing: ["CEO", "Marketing"],
  marketingApprove: ["CEO"],
  marketingPublish: ["CEO"],
  users: ["CEO"]
};
// Clerk = data-entry + view only: can add expenses, suppliers, clients, assets
// and view P&L/budget, but CANNOT approve, record payments/print cheques,
// create/edit certificates, edit budgets, or delete anything.
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
function computeClientCert(c, contract, prevNet, recoveredSoFar, prevContra) {
  prevContra = num(prevContra);
  const cumValue = num(c.grossCum);
  const mos = num(c.mos);
  const gross = r2(cumValue + mos);
  const retentionPct = num(contract?.retentionPct);
  const retention = r2(gross * retentionPct);
  const afterRet = r2(gross - retention);
  let advanceRecovery = 0;
  const advanceAmount = num(contract?.advanceAmount);
  let advanceRate = num(contract?.recoveryRate);
  // If an advance/down payment exists but no explicit recovery rate is set, recover
  // it pro-rata against the contract value so it is fully repaid by completion
  // (rate = advance ÷ contract value). Prevents the advance silently never recovering.
  if (advanceAmount > 0 && !(advanceRate > 0)) {
    const base = num(contract?.contractSum);
    if (base > 0) advanceRate = advanceAmount / base;
  }
  if (advanceAmount > 0 && advanceRate > 0) {
    // Advance is recovered on the BASE works value only (excluding approved
    // variations, per UAE practice and the client's own IPC format). advanceRate *
    // baseCum is the cumulative recovery target — cap at the advance, then take this
    // period's increment over prior recovery so each certificate stores a true
    // per-period figure and Σ advanceRecovery equals the correct cumulative.
    const baseCum = Math.max(0, r2(cumValue - num(c.variationsCum)));
    const cumRecovery = Math.min(r2(advanceRate * baseCum), advanceAmount);
    advanceRecovery = Math.max(0, r2(cumRecovery - recoveredSoFar));
  }
  const contra = num(c.contra);
  // Cumulative advance recovered & cumulative contra, minus previously certified —
  // prevents prior-period advance/contra being refunded on later certificates.
  const advRecToDate = r2(recoveredSoFar + advanceRecovery);
  const net = r2(afterRet - advRecToDate - r2(prevContra + contra) - prevNet);
  const vatPct = num(contract?.vatPct);
  const vat = r2(net * vatPct);
  // This-period gross increment = cumulative gross − previously-certified gross.
  const grossThis = r2(gross - num(c.prevGross));
  const variationsCum = num(c.variationsCum);
  const variationsThis = r2(variationsCum - num(c.prevVariations));
  return {
    cumValue, mos, gross, retentionPct, retention, afterRet,
    advanceAmount, advanceRate, advanceRecovery,
    advanceRecoveredToDate: r2(recoveredSoFar + advanceRecovery),
    advanceOutstanding: Math.max(0, r2(advanceAmount - recoveredSoFar - advanceRecovery)),
    retentionHeld: retention,
    grossThis, variationsCum, variationsThis,
    grossCertifiedToDate: gross, retentionHeldToDate: retention,
    netToDate: r2(afterRet - advRecToDate - r2(prevContra + contra)),
    prevCertified: prevNet, contra, net, vatPct, vat, payable: r2(net + vat)
  };
}
// From the per-building lines on a client cert (each {value, pct, isVariation}),
// compute the cumulative gross certified and the cumulative variations portion.
function ccGrossFromLines(lines) {
  let grossCum = 0, variationsCum = 0;
  for (const l of (lines || [])) {
    const v = r2(num(l.value) * num(l.pct));
    grossCum = r2(grossCum + v);
    if (l.isVariation) variationsCum = r2(variationsCum + v);
  }
  return { grossCum, variationsCum };
}
async function recomputeClientCert(c, contract) {
  const priors = await clientCertsByContract(c.contractId, c.no);
  const before = priors.filter((p) => (p.seq || 0) < (c.seq || 0));
  const prevNet = r2(before.reduce((a, p) => a + (p.calc?.net || 0), 0));
  const recoveredSoFar = r2(before.reduce((a, p) => a + (p.calc?.advanceRecovery || 0), 0));
  const prevContra = r2(before.reduce((a, p) => a + num(p.contra), 0));
  // Previous cumulative gross & variations (highest prior cert) so this cert can show
  // the per-period increment for the certificate-calculation section.
  const prior = before.slice().sort((a, b) => (b.seq || 0) - (a.seq || 0))[0];
  c.prevGross = prior ? num(prior.calc?.gross) : 0;
  c.prevVariations = prior ? num(prior.calc?.variationsCum) : 0;
  c.calc = computeClientCert(c, contract, prevNet, recoveredSoFar, prevContra);
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
// One-time server-side consolidation of the duplicate project names that the
// various imports created, per the CEO's instruction. Runs once (guarded by a
// flag), moving every contract/IPC/expense/register/budget onto the kept name
// and dropping the duplicates from the registry. No password needed — it runs
// inside the trusted backend at bootstrap.
var PROJECT_MERGES_V1 = [
  { from: ["The Square 2.0 - Nad Al Sheba"], to: "The Square 2.0 construction", code: "SQU" },
  { from: ["Aster Garden Hospital @ Jabal Ali", "Aster Garden Jabal Ali"], to: "Aster Garden Hospital", code: "AGH" }
];
async function runProjectMergeMigration(s, settings) {
  if (settings.projMergeV1) return false;
  for (const m of PROJECT_MERGES_V1) {
    const fromSet = new Set(m.from.map((x) => x.toLowerCase()));
    const isFrom = (p) => fromSet.has(String(p || "").trim().toLowerCase());
    for (const bl of (await s.list({ prefix: "contract/" })).blobs) { const c = await s.get(bl.key, { type: "json" }); if (c && isFrom(c.project)) { c.project = m.to; c.projShort = m.code; c.updatedAt = now(); await s.setJSON(bl.key, c); } }
    for (const bl of (await s.list({ prefix: "cert/" })).blobs) { const c = await s.get(bl.key, { type: "json" }); if (c && isFrom(c.project)) { c.project = m.to; c.updatedAt = now(); await s.setJSON(bl.key, c); } }
    for (const bl of (await s.list({ prefix: "expense/" })).blobs) { const e = await s.get(bl.key, { type: "json" }); if (e && isFrom(e.project)) { e.project = m.to; e.updatedAt = now(); await s.setJSON(bl.key, e); } }
    const reg = await s.get("register", { type: "json" }) || []; let rc = false; for (const r of reg) { if (r && isFrom(r.project)) { r.project = m.to; rc = true; } } if (rc) await s.setJSON("register", reg);
    const toSlug = budgetSlug(m.to); const target = await s.get("budget/" + toSlug, { type: "json" }) || { project: m.to, lines: [] };
    for (const f of m.from) { if (f.toLowerCase() === m.to.toLowerCase()) continue; const bud = await s.get("budget/" + budgetSlug(f), { type: "json" }); if (bud && Array.isArray(bud.lines) && bud.lines.length) target.lines = (target.lines || []).concat(bud.lines); try { await s.delete("budget/" + budgetSlug(f)); } catch {} }
    target.project = m.to; await s.setJSON("budget/" + toSlug, target);
    const keep = []; let toEntry = null;
    for (const p of (settings.projects || [])) { if (!p) continue; if (String(p.name).trim().toLowerCase() === m.to.toLowerCase()) { toEntry = p; keep.push(p); continue; } if (isFrom(p.name)) continue; keep.push(p); }
    if (!toEntry) { toEntry = { code: m.code, name: m.to }; keep.push(toEntry); } else toEntry.code = m.code;
    settings.projects = keep;
  }
  ensureHQProject(settings);
  settings.projMergeV1 = true;
  await s.setJSON("settings", settings);
  return true;
}
// Corrective fix: "The Square 2.0 Infrastructure" is a SEPARATE project and was
// wrongly folded into "construction" by the first migration. Restore it as its
// own registry entry (it held no records — it was only a name), so it is again
// selectable and distinct.
async function runProjectFixV2(s, settings) {
  if (settings.projFixV2) return false;
  if (!Array.isArray(settings.projects)) settings.projects = [];
  const has = settings.projects.some((p) => p && String(p.name || "").trim().toLowerCase() === "the square 2.0 infrastructure");
  if (!has) settings.projects.push({ code: "SQI", name: "The Square 2.0 Infrastructure" });
  settings.projFixV2 = true;
  await s.setJSON("settings", settings);
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
  const id = await nextId(s, st, "supplierSeq", "S", "supplier/", 3);
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
// Promote a procurement directory vendor into the finance supplier registry, importing
// all data we hold so missing fields (TL, TRN, bank) can be completed later. Idempotent:
// if the vendor is already linked to a supplier, or a supplier with the same name exists,
// that supplier is returned/refreshed instead of creating a duplicate. Returns supplierId.
async function promoteVendorToSupplier(s, pv, opts) {
  opts = opts || {};
  const stg = await s.get("settings", { type: "json" });
  let supplierId = pv.supplierId;
  let sup = supplierId ? await s.get("supplier/" + supplierId, { type: "json" }) : null;
  if (!sup) {
    const sups = await getAllJSON(s, "supplier/");
    sup = sups.find((x) => String(x.name || "").trim().toLowerCase() === String(pv.name || "").trim().toLowerCase());
  }
  const ent = stg.entities && stg.entities[0] && stg.entities[0].short || "Marvellous Art";
  if (!sup) {
    supplierId = await nextId(s, stg, "supplierSeq", "S", "supplier/", 3);
    await s.setJSON("settings", stg);
    sup = {
      id: supplierId, type: pv.type === "Supplier" ? "Supplier" : "Subcontractor", name: pv.name, tradeName: "",
      licenseNo: pv.licenseNo || "", licenseExpiry: "", establishmentCard: "", address: pv.address || pv.emirate || "", poBox: "", emirate: pv.emirate || "", website: pv.website || "",
      category: pv.trade || "", trade: pv.specialty || "", contactName: pv.contactName || "", contactDesignation: "", mobile: pv.phone || "", tel: pv.phone || "", contact: pv.phone || "",
      email: pv.email || "", trn: pv.trn || "", vatRegistered: !!pv.trn,
      bank: "", accountName: "", accountNo: "", iban: "", swift: "", entity: ent, project: opts.project || "", lpoRef: "",
      contractValue: 0, vatPct: 0.05, retentionPct: 0.1, dlpMonths: 0, retentionRelease: "", advanceAmount: 0, advanceRecoveryRate: 0, advanceDate: "", advanceRef: "",
      notes: opts.note || ("Registered from procurement directory (" + (pv.id || "") + "). Complete TL, TRN and bank details before payment."),
      status: opts.status || "Prospect", source: "procurement", incomplete: !(String(pv.licenseNo || "").trim() && String(pv.trn || "").trim()), docs: {}, regNo: "MA-SUP-" + supplierId,
      createdAt: now(), createdBy: opts.by || "system", updatedAt: now()
    };
    await s.setJSON("supplier/" + supplierId, sup);
  } else {
    // Existing supplier — backfill only the fields that are still blank, never overwrite.
    supplierId = sup.id; let ch = false;
    const fill = (k, v) => { if (v && !String(sup[k] || "").trim()) { sup[k] = v; ch = true; } };
    fill("email", pv.email); fill("mobile", pv.phone); fill("tel", pv.phone); fill("contact", pv.phone);
    fill("contactName", pv.contactName); fill("category", pv.trade); fill("trade", pv.specialty);
    fill("emirate", pv.emirate); fill("website", pv.website); fill("licenseNo", pv.licenseNo); fill("trn", pv.trn);
    if (opts.project && !String(sup.project || "").trim()) { sup.project = opts.project; ch = true; }
    if (opts.status && sup.status !== opts.status) { sup.status = opts.status; ch = true; }
    sup.incomplete = !(String(sup.licenseNo || "").trim() && String(sup.trn || "").trim());
    if (ch) { sup.updatedAt = now(); await s.setJSON("supplier/" + supplierId, sup); }
  }
  // Link the directory record back to the supplier so the two never duplicate.
  if (pv.supplierId !== supplierId) { pv.supplierId = supplierId; pv.updatedAt = now(); await s.setJSON("pvendor/" + pv.id, pv); }
  return { supplierId, supplier: sup };
}
async function upsertCertExpense(s, c) {
  // Auto-post an approved/paid supplier IPC as a cost line (idempotent by cert no).
  if (!c || !c.project) return;
  const isAdvance = c.kind === "advance";
  const id = "XPC-" + c.no.replace(/[^A-Za-z0-9]+/g, "_");
  const existing = await s.get("expense/" + id, { type: "json" });
  // Advance / down payment is a recoverable prepayment — carried at amount 0 so it
  // never inflates project cost; the cash paid is still tracked (bank out) and it is
  // recovered by progress IPCs. Progress IPCs post their net certified value as cost.
  const amount = isAdvance ? 0 : num(c.calc?.net);
  const paid = c.status === "Paid" ? num(c.payment?.amount || c.calc?.payable) : num(existing?.paid);
  const exp = {
    id, seq: existing?.seq || 0, project: c.project,
    date: (c.payment?.date || c.date || now().slice(0, 10)).slice(0, 10),
    area: existing?.area || "General / All", category: existing?.category || (c.trade || "Subcontractor"),
    costType: existing?.costType || "Subcontractor",
    supplier: c.supplier || "", supplierId: c.supplierId || existing?.supplierId || null, invoiceNo: c.invoiceNo || "",
    description: isAdvance ? `Advance / down payment${c.awardDocNo ? " — " + c.awardDocNo : ""} (${c.no})` : `Supplier IPC ${c.no}${c.invoiceNo ? " — inv " + c.invoiceNo : ""}`,
    poRef: c.lpoRef || "", boqRef: existing?.boqRef || "",
    budgeted: num(existing?.budgeted), amount, status: c.status === "Paid" ? "Paid" : "Pending", paid,
    advanceValue: isAdvance ? r2(num(c.invoiceAmount)) : 0,
    notes: existing?.notes || "", supplierCertNo: c.no, source: isAdvance ? "supplier-advance" : "supplier-ipc",
    createdBy: existing?.createdBy || "system", createdAt: existing?.createdAt || now(), updatedAt: now()
  };
  await s.setJSON("expense/" + id, exp);
}
async function computeTreasury(s) {
  const settings = await s.get("settings", { type: "json" }) || {};
  const opening = settings.bankOpening || {};
  const [register, receipts, moves] = await Promise.all([
    s.get("register", { type: "json" }).then((r) => r || []),
    getAllJSON(s, "clientreceipt/"),
    getAllJSON(s, "bankmove/")
  ]);
  const acc = {};
  const ensure = (name) => { name = name || "(unallocated)"; if (!acc[name]) acc[name] = { name, opening: 0, openingDate: "", inflow: 0, outflow: 0, preIn: 0, preOut: 0 }; return acc[name]; };
  for (const nm of (settings.banks || [])) { const a = ensure(nm); a.opening = num(opening[nm] && opening[nm].balance); a.openingDate = (opening[nm] && opening[nm].date) || ""; }
  // A movement DATED BEFORE the account's opening-balance date is already
  // contained in that opening figure (it is the bank-statement balance on that
  // day), so counting it again would double-count. Such rows stay visible in the
  // ledger, flagged, but never move the live balance.
  const isPre = (a, date) => !!(a.openingDate && date && String(date).slice(0, 10) < String(a.openingDate).slice(0, 10));
  const post = (a, date, inAmt, outAmt) => {
    if (isPre(a, date)) { a.preIn += num(inAmt); a.preOut += num(outAmt); return true; }
    a.inflow += num(inAmt); a.outflow += num(outAmt); return false;
  };
  const ledger = [];
  for (const r of register) { if (!r) continue; const a = ensure(r.bank); const amt = num(r.amount);
    const pre = post(a, r.date, 0, amt);
    ledger.push({ date: r.date || "", account: a.name, kind: "Payment", ref: r.ref || "", party: r.payee || r.supplier || "", note: "IPC " + (r.no || ""), certNo: r.no || "", inAmt: 0, outAmt: amt, preOpening: pre }); }
  for (const rc of receipts) { if (!rc) continue; const a = ensure(rc.bank); const amt = num(rc.amount);
    const pre = post(a, rc.date, amt, 0);
    ledger.push({ date: rc.date || "", account: a.name, kind: "Receipt", ref: rc.ref || "", party: rc.project || "", note: rc.isAdvance ? "Advance received" : rc.isRetentionRelease ? "Retention release" : "Client receipt", inAmt: amt, outAmt: 0, preOpening: pre }); }
  for (const m of moves) { if (!m) continue; const amt = num(m.amount); const t = m.type;
    if (t === "transfer") {
      const from = ensure(m.account), to = ensure(m.toAccount);
      const preF = post(from, m.date, 0, amt), preT = post(to, m.date, amt, 0);
      ledger.push({ date: m.date || "", account: from.name, kind: "Transfer out", ref: m.ref || "", party: to.name, note: m.description || "", inAmt: 0, outAmt: amt, preOpening: preF });
      ledger.push({ date: m.date || "", account: to.name, kind: "Transfer in", ref: m.ref || "", party: from.name, note: m.description || "", inAmt: amt, outAmt: 0, preOpening: preT });
    } else {
      const a = ensure(m.account); const isIn = (t === "deposit" || t === "adjust-in");
      const pre = post(a, m.date, isIn ? amt : 0, isIn ? 0 : amt);
      ledger.push({ date: m.date || "", account: a.name, kind: t === "deposit" ? "Deposit" : t === "charge" ? "Bank charge" : t === "withdrawal" ? "Withdrawal" : "Adjustment", ref: m.ref || "", party: "", note: m.description || "", inAmt: isIn ? amt : 0, outAmt: isIn ? 0 : amt, id: m.id, preOpening: pre });
    }
  }
  const accounts = Object.values(acc).map((a) => ({ ...a, opening: r2(a.opening), inflow: r2(a.inflow), outflow: r2(a.outflow), preIn: r2(a.preIn), preOut: r2(a.preOut), preCount: 0, balance: r2(a.opening + a.inflow - a.outflow) }));
  for (const e of ledger) { if (e.preOpening) { const a = accounts.find((x) => x.name === e.account); if (a) a.preCount++; } }
  accounts.sort((x, y) => x.name === "(unallocated)" ? 1 : y.name === "(unallocated)" ? -1 : x.name.localeCompare(y.name));
  // Running balance per account (bank-statement style): order each account's
  // movements oldest→newest, carry the balance forward, and add an Opening line.
  const byAcc = {};
  for (const e of ledger) { (byAcc[e.account] = byAcc[e.account] || []).push(e); }
  const withRun = [];
  for (const name in byAcc) {
    const a = acc[name] || { opening: 0, openingDate: "" };
    const arr = byAcc[name].slice().sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
    let run = num(a.opening);
    // Rows before the opening date are shown for reference but carry no running
    // balance — the opening figure already includes them.
    for (const e of arr) if (e.preOpening) { e.balanceAfter = null; withRun.push(e); }
    withRun.push({ date: a.openingDate || "", account: name, kind: "Opening balance", ref: "", party: "", note: "", inAmt: 0, outAmt: 0, balanceAfter: r2(run), opening: true });
    for (const e of arr) { if (e.preOpening) continue; run = r2(run + num(e.inAmt) - num(e.outAmt)); e.balanceAfter = run; withRun.push(e); }
  }
  withRun.forEach((e, i) => e._i = i);
  withRun.sort((x, y) => x.date < y.date ? 1 : x.date > y.date ? -1 : y._i - x._i);
  for (const e of withRun) delete e._i;
  // The headline figure is the money in REAL bank accounts. Payments/receipts
  // recorded without a bank account sit in "(unallocated)" and must never inflate
  // it — they are reported separately so they can be assigned to an account.
  const realAccounts = accounts.filter((a) => a.name !== "(unallocated)");
  const totalBalance = r2(realAccounts.reduce((t, a) => t + a.balance, 0));
  const un = accounts.find((a) => a.name === "(unallocated)");
  const unallocated = un ? { inflow: un.inflow, outflow: un.outflow, net: r2(un.inflow - un.outflow) } : { inflow: 0, outflow: 0, net: 0 };
  const preOpeningTotal = r2(accounts.reduce((t, a) => t + num(a.preIn) + num(a.preOut), 0));
  const preOpeningCount = accounts.reduce((t, a) => t + num(a.preCount), 0);
  // ---- Cheque diary: what clears / falls due on a given day ----
  // Outgoing = cheques we issued (payment register, mode Cheque); incoming =
  // client cheques received. Each carries a status the finance team maintains
  // (Due → Cleared, or Returned), so the bank statement can be reconciled:
  // statement balance = live balance + cheques issued but not yet cleared.
  const chqSt = await s.get("chequestatus", { type: "json" }) || {};
  const today = now().slice(0, 10);
  const cheques = [];
  for (const r of register) {
    if (!r || String(r.mode || "") !== "Cheque") continue;
    const key = "out:" + (r.no || r.ref || r.sr);
    const st = chqSt[key] || {};
    cheques.push({
      key, dir: "out", date: String(r.date || "").slice(0, 10), ref: r.ref || "", bank: r.bank || "",
      party: r.payee || r.supplier || "", project: r.project || "", certNo: r.no || "", amount: num(r.amount),
      status: st.status || "Due", clearedAt: st.clearedAt || "", note: st.note || "",
      overdue: (st.status || "Due") === "Due" && String(r.date || "").slice(0, 10) && String(r.date || "").slice(0, 10) < today
    });
  }
  for (const rc of receipts) {
    if (!rc || !/cheque/i.test(String(rc.mode || ""))) continue;
    const key = "in:" + rc.id;
    const st = chqSt[key] || {};
    cheques.push({
      key, dir: "in", date: String(rc.date || "").slice(0, 10), ref: rc.ref || "", bank: rc.bank || "",
      party: rc.project || "", project: rc.project || "", certNo: rc.certNo || "", amount: num(rc.amount),
      status: st.status || "Due", clearedAt: st.clearedAt || "", note: st.note || "",
      overdue: (st.status || "Due") === "Due" && String(rc.date || "").slice(0, 10) && String(rc.date || "").slice(0, 10) < today
    });
  }
  cheques.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const pend = cheques.filter((c) => c.status === "Due");
  const chequeSummary = {
    today,
    unclearedOut: r2(pend.filter((c) => c.dir === "out").reduce((t, c) => t + c.amount, 0)),
    unclearedIn: r2(pend.filter((c) => c.dir === "in").reduce((t, c) => t + c.amount, 0)),
    overdueOut: r2(pend.filter((c) => c.dir === "out" && c.overdue).reduce((t, c) => t + c.amount, 0)),
    dueToday: r2(pend.filter((c) => c.dir === "out" && c.date === today).reduce((t, c) => t + c.amount, 0)),
    count: pend.length
  };
  return { accounts, totalBalance, unallocated, preOpeningTotal, preOpeningCount, ledger: withRun.slice(0, 400), cheques, chequeSummary };
}
// ===================== OPERATIONS COST / HR MANAGEMENT =====================
// CFO model: every dirham the company spends that is not a direct project cost
// lands in the HQ cost centre (MA HQ – Operations) — staff payroll not assigned
// to a site, fixed overheads (rent, telecom, utilities, insurance, licences…),
// monthly depreciation of the asset register, and any other HQ expense. Each
// month that HQ pool is ALLOCATED across the live projects on a chosen basis so
// every project P&L carries its fair share of running the company.
//
//   Payroll (HR system) ─┬─ staff assigned to a site ──► project cost (Labour)
//                        └─ HQ / unassigned ──────────┐
//   Fixed expense register (monthly accrual) ─────────┤
//   Asset register (monthly depreciation, non-cash) ──┼──► HQ pool ──► allocation ──► project P&L
//   Other manual HQ expenses ─────────────────────────┘        (revenue / cost / contract / staff / manual %)
var OPS_FIXED_CATS = [
  "Rent & Office", "Telecom (Etisalat / du)", "Utilities (DEWA / Chiller)", "Insurance (medical, vehicles, office)",
  "Licences, Visas & Government fees", "Vehicles & Fuel", "Software & Subscriptions", "Bank charges & Finance",
  "Marketing & Branding", "Professional fees (audit, PRO, legal)", "Staff accommodation & welfare", "Other fixed"
];
var OPS_FREQ = { monthly: 1, quarterly: 3, "half-yearly": 6, annual: 12 };
var OPS_BASES = [
  { code: "revenue", name: "Revenue certified in the month", hint: "share of client IPC value certified in the month (ex-VAT)" },
  { code: "cost", name: "Direct cost incurred in the month", hint: "share of project cost logged in the month (excl. HQ)" },
  { code: "contract", name: "Contract value (active contracts)", hint: "share of contract sum + approved variations" },
  { code: "staff", name: "Staff man-months (payroll assignment)", hint: "share of staff time assigned to each project this month" },
  { code: "manual", name: "Manual %", hint: "percentages you enter (must total 100)" }
];
var OPS_STAFF_COST_TYPES = ["Labour (Indirect)", "Labour (Direct)", "Professional Fees", "Overhead / Admin"];
function monthKeyOf(d) { return String(d || "").slice(0, 7); }
function monthEnd(m) { const y = +m.slice(0, 4), mo = +m.slice(5, 7); const last = new Date(Date.UTC(y, mo, 0)).getUTCDate(); return `${m}-${String(last).padStart(2, "0")}`; }
function validMonth(m) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(m || "")); }
function projSlug(p) { return String(p || "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 40) || "x"; }
async function listOpsFixed() { return (await getAllJSON(store(), "opsfixed/")).filter((v) => v && v.id).sort((a, b) => (a.id || "").localeCompare(b.id || "", void 0, { numeric: true })); }
async function listOpsStaff() { return (await getAllJSON(store(), "opsstaff/")).filter((v) => v && v.empId); }
async function listOpsAlloc() { return (await getAllJSON(store(), "opsalloc/")).filter((v) => v && v.month).sort((a, b) => a.month < b.month ? -1 : 1); }
// A fixed item is "live" in a month when the month falls inside its start/end.
function fixedActiveIn(f, m) {
  if (f.status && f.status !== "Active") return false;
  const st = monthKeyOf(f.startDate), en = monthKeyOf(f.endDate);
  if (st && m < st) return false;
  if (en && m > en) return false;
  return true;
}
// Monthly accrual of a fixed item (quarterly / annual bills are spread evenly so
// the allocation to projects is smooth and not lumpy in the billing month).
function fixedMonthly(f) { const per = OPS_FREQ[f.freq] || 1; return r2(num(f.amount) / per); }
// Employer cost of one payroll row: everything earned (basic + allowances + OT +
// commission). Deductions (absence, advances, fines) are recoveries against the
// employee, not a reduction of what the job costs — except absence, which the
// HR system already nets out of gross where applicable.
function payrollCost(r) { return r2(num(r.gross) + num(r.ot) + num(r.commission)); }
// Straight-line depreciation charge for ONE month, capped at the remaining
// depreciable value. Disposed / sold / written-off assets stop depreciating.
function assetMonthDep(a, m) {
  if (a.status && a.status !== "Active") return 0;
  const pm = monthKeyOf(a.purchaseDate);
  if (!pm || pm > m) return 0;
  const cost = num(a.cost), life = num(a.life) || 0, resid = num(a.residPct) || 0;
  if (!(cost > 0) || !(life > 0)) return 0;
  const depreciable = r2(cost * (1 - resid)), perMonth = depreciable / (life * 12);
  const monthsBefore = (+m.slice(0, 4) - +pm.slice(0, 4)) * 12 + (+m.slice(5, 7) - +pm.slice(5, 7));
  const accumBefore = Math.min(depreciable, perMonth * monthsBefore);
  return r2(Math.max(0, Math.min(perMonth, depreciable - accumBefore)));
}
function staffSplits(st) {
  const sp = Array.isArray(st?.splits) ? st.splits.filter((x) => x && x.project && num(x.pct) > 0) : [];
  // Percentages are "% of the employee's time"; anything not assigned stays
  // with HQ. If someone keys more than 100% in total, scale back to 100%.
  const tot = sp.reduce((t, x) => t + num(x.pct), 0);
  const scale = tot > 100 ? 100 / tot : 1;
  return sp.map((x) => ({ project: String(x.project), pct: r2(num(x.pct) * scale) / 100 }));
}
// ---- live link to the attendance / HR system (same Netlify team, separate site & data store) ----
// The HR API accepts its ADMIN_MASTER_KEY as a bearer token on every /admin/* route,
// so the finance app reads payroll and attendance server-to-server with one secret
// (HR_API_KEY) — no user password involved and nothing is re-typed.
var HR_BASE = () => (process.env.HR_API_URL || "https://hr.maagroup.ae").replace(/\/+$/, "");
async function hrGet(pathQ) {
  const key = process.env.HR_API_KEY || "";
  if (!key) throw new Error("HR link not configured — add HR_API_KEY (the HR system's admin master key) in Netlify → ma-group-payments → Environment variables.");
  const base = HR_BASE();
  let lastErr = "";
  for (const u of [`${base}/api${pathQ}`, `${base}/.netlify/functions/api${pathQ}`]) {
    try {
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 8500);
      const rs = await fetch(u, { headers: { Authorization: "Bearer " + key, Accept: "application/json" }, signal: ctl.signal });
      clearTimeout(tm);
      const txt = await rs.text();
      let j = null; try { j = JSON.parse(txt); } catch {}
      if (!rs.ok) { lastErr = `${rs.status} ${j?.error || ""} (${u})`.trim(); if (rs.status === 401 || rs.status === 403) break; continue; }
      if (j === null) { lastErr = "non-JSON answer from " + u; continue; }
      return j;
    } catch (e) { lastErr = String(e.message || e); }
  }
  throw new Error("Could not reach the HR system: " + lastErr);
}
// Site name as recorded on a check-in, without the "(outside zone)" suffix.
function hrSiteKey(n) { return String(n || "").replace(/\s*\(outside zone\)\s*$/i, "").trim(); }
// Attendance-driven project split for one employee: worked days on sites mapped
// to a project ÷ all worked days in the month. Sites mapped to HQ (or unmapped)
// keep that share of the salary in the HQ pool.
function attendanceSplits(att, siteMap, empId) {
  const by = att?.byEmp?.[empId]; if (!by) return null;
  let total = 0; const perProj = {};
  for (const site in by) { const d = num(by[site]); total += d; const p = siteMap[site]; if (p && p !== HQ_PROJECT && p !== "__ignore") perProj[p] = (perProj[p] || 0) + d; }
  if (!(total > 0)) return null;
  return { total, splits: Object.entries(perProj).map(([project, d]) => ({ project, pct: r2(d / total * 10000) / 10000, days: d })) };
}
// Full monthly operations picture: pool components, what is posted vs still to
// post, allocation drivers per project and the saved allocation (if any).
async function computeOps(s, month) {
  const [expenses, fixed, staff, assets, payroll, allocRec, contracts, allCC, names, att] = await Promise.all([
    listExpenses(""), listOpsFixed(), listOpsStaff(), listAssets(), s.get("opspayroll/" + month, { type: "json" }),
    s.get("opsalloc/" + month, { type: "json" }), listContracts(), getAllJSON(s, "clientcert/"), projectNames(s), s.get("opsatt/" + month, { type: "json" })
  ]);
  const st = await s.get("settings", { type: "json" }) || {};
  const siteMap = st.hrSiteMap || {};
  const overheadNames = new Set([HQ_PROJECT, ...(st.projects || []).filter((p) => p && p.kind === "overhead").map((p) => p.name)]);
  const projects = names.filter((p) => !overheadNames.has(p));
  const mExp = expenses.filter((e) => monthKeyOf(e.date) === month);
  const hqExp = mExp.filter((e) => e.project === HQ_PROJECT);
  const bySource = { "ops-payroll": 0, "ops-fixed": 0, "ops-depreciation": 0, other: 0 };
  for (const e of hqExp) { const k = bySource[e.source] !== void 0 ? e.source : "other"; bySource[k] = r2(bySource[k] + num(e.amount)); }
  const pool = r2(hqExp.reduce((t, e) => t + num(e.amount), 0));
  // ---- payroll ----
  const staffMap = {}; for (const x of staff) staffMap[x.empId] = x;
  const rows = (payroll?.rows || []).map((r) => {
    const sm = staffMap[r.empId] || {};
    const cost = payrollCost(r);
    // Attendance decides the split (check-in sites → projects) unless a manual
    // assignment has been saved for the employee; no attendance → manual/none.
    const auto = sm.manualSplits ? null : attendanceSplits(att, siteMap, r.empId);
    const splits = auto ? auto.splits : staffSplits(sm);
    const splitSource = auto ? "attendance" : splits.length ? "manual" : "none";
    const assigned = r2(cost * splits.reduce((t, x) => t + x.pct, 0));
    const attDays = att?.byEmp?.[r.empId] || null;
    return { ...r, cost, splits, splitSource, attDays, manualSplits: !!sm.manualSplits, costType: sm.costType || "Labour (Indirect)", assigned, hqShare: r2(cost - assigned) };
  });
  const payrollTot = { count: rows.length, gross: 0, ot: 0, commission: 0, deductions: 0, net: 0, cost: 0, assigned: 0, hq: 0, wps: 0, cash: 0 };
  const payrollByProject = {};
  for (const r of rows) {
    payrollTot.gross = r2(payrollTot.gross + num(r.gross)); payrollTot.ot = r2(payrollTot.ot + num(r.ot)); payrollTot.commission = r2(payrollTot.commission + num(r.commission));
    payrollTot.deductions = r2(payrollTot.deductions + num(r.deductions)); payrollTot.net = r2(payrollTot.net + num(r.net)); payrollTot.cost = r2(payrollTot.cost + r.cost);
    payrollTot.assigned = r2(payrollTot.assigned + r.assigned); payrollTot.hq = r2(payrollTot.hq + r.hqShare);
    if (/cash/i.test(r.payMethod || "")) payrollTot.cash = r2(payrollTot.cash + num(r.net)); else payrollTot.wps = r2(payrollTot.wps + num(r.net));
    for (const sp of r.splits) payrollByProject[sp.project] = r2((payrollByProject[sp.project] || 0) + r.cost * sp.pct);
  }
  const payrollPosted = mExp.some((e) => e.source === "ops-payroll");
  // ---- fixed expenses ----
  const fixedRows = fixed.map((f) => { const live = fixedActiveIn(f, month); const xid = `XFX-${month}-${f.id}`; const posted = expenses.find((e) => e.id === xid); return { ...f, monthly: fixedMonthly(f), live, posted: !!posted, postedAmount: posted ? num(posted.amount) : 0 }; });
  const fixedExpected = r2(fixedRows.filter((f) => f.live).reduce((t, f) => t + f.monthly, 0));
  // ---- depreciation ----
  const depRows = assets.map((a) => ({ code: a.code, description: a.description, cat: a.cat, cost: num(a.cost), month: assetMonthDep(a, month) })).filter((x) => x.month > 0);
  const depExpected = r2(depRows.reduce((t, x) => t + x.month, 0));
  const depPosted = expenses.find((e) => e.id === `XDP-${month}`);
  // ---- allocation drivers per project ----
  const cids = {}; for (const c of contracts) cids[c.id] = c;
  const drivers = {};
  for (const p of projects) drivers[p] = { project: p, revenue: 0, cost: 0, contract: 0, staff: 0 };
  for (const c of allCC) {
    if (!c || !["Issued", "Approved"].includes(c.status) || monthKeyOf(c.date) !== month) continue;
    const ct = cids[c.contractId]; const p = ct?.project || c.project; if (!drivers[p]) continue;
    drivers[p].revenue = r2(drivers[p].revenue + Math.max(0, num(c.calc?.grossThis != null ? c.calc.grossThis : c.calc?.gross)));
  }
  for (const e of mExp) { if (drivers[e.project] && e.source !== "ops-allocation") drivers[e.project].cost = r2(drivers[e.project].cost + num(e.amount)); }
  for (const c of contracts) { if (!c || /closed|complete|cancel/i.test(c.status || "")) continue; if (drivers[c.project]) drivers[c.project].contract = r2(drivers[c.project].contract + num(c.contractSum) + num(c.variations)); }
  for (const r of rows) for (const sp of r.splits) { if (drivers[sp.project]) drivers[sp.project].staff = r2(drivers[sp.project].staff + sp.pct); }
  return {
    month, project: HQ_PROJECT, bases: OPS_BASES, fixedCats: OPS_FIXED_CATS, freqs: Object.keys(OPS_FREQ), staffCostTypes: OPS_STAFF_COST_TYPES,
    projects, pool, bySource, hqExpenses: hqExp.sort((a, b) => a.date < b.date ? 1 : -1),
    payroll: payroll ? { month, source: payroll.source, importedAt: payroll.importedAt, importedBy: payroll.importedBy, rows, totals: payrollTot, byProject: payrollByProject, posted: payrollPosted } : null,
    fixed: fixedRows, fixedExpected, fixedPosted: r2(fixedRows.filter((f) => f.posted).reduce((t, f) => t + f.postedAmount, 0)),
    depreciation: { rows: depRows, expected: depExpected, posted: depPosted ? num(depPosted.amount) : 0, isPosted: !!depPosted },
    drivers: Object.values(drivers), alloc: allocRec || null,
    staff: staff,
    attendance: att ? { month, from: att.from, to: att.to, days: Object.keys(att.byDay || {}).length, pulledAt: att.pulledAt, sites: att.sites || {}, siteList: att.siteList || [], staffDays: att.staffDays || 0 } : null,
    siteMap
  };
}
// Split the HQ pool across projects on the chosen basis. Returns rows that
// always sum to the pool (last row absorbs rounding).
function allocateOps(pool, basis, drivers, manual) {
  const rows = [];
  let weights = [];
  if (basis === "manual") {
    const m = manual || {};
    weights = Object.keys(m).filter((p) => num(m[p]) > 0).map((p) => ({ project: p, w: num(m[p]) }));
  } else {
    const k = basis === "revenue" ? "revenue" : basis === "cost" ? "cost" : basis === "contract" ? "contract" : "staff";
    weights = drivers.filter((d) => num(d[k]) > 0).map((d) => ({ project: d.project, w: num(d[k]) }));
  }
  const tot = weights.reduce((t, x) => t + x.w, 0);
  if (!(tot > 0)) return { rows: [], total: 0, reason: basis === "manual" ? "Enter a percentage for at least one project." : "No project has a non-zero driver for this basis in the month — choose another basis or enter manual %." };
  let acc = 0;
  weights.forEach((x, i) => {
    const share = x.w / tot;
    let amt = i === weights.length - 1 ? r2(pool - acc) : r2(pool * share);
    acc = r2(acc + amt);
    rows.push({ project: x.project, driver: r2(x.w), share: r2(share * 10000) / 10000, amount: amt });
  });
  return { rows, total: r2(acc), reason: "" };
}
// Sum of posted allocations that hit ONE project (used by the project P&L).
async function allocatedOpsFor(s, project) {
  const all = await listOpsAlloc();
  let total = 0; const months = [];
  for (const a of all) { if (a.status !== "Posted") continue; for (const r of a.rows || []) { if (r.project === project) { total = r2(total + num(r.amount)); months.push({ month: a.month, basis: a.basis, amount: num(r.amount) }); } } }
  return { total, months };
}
// Tolerant reader for whatever the HR system returns for a month's payroll
// (payroll-split rows / payslip rows). Field names differ between builds, so
// every known spelling is honoured.
function normalisePayrollRows(list) {
  const pick = (o, ...ks) => { for (const k of ks) { if (o[k] !== void 0 && o[k] !== null && o[k] !== "") return o[k]; } return void 0; };
  const out = [];
  for (const o of list || []) {
    if (!o || typeof o !== "object") continue;
    const empId = String(pick(o, "empId", "id", "ID", "employeeId") || "").trim();
    const name = String(pick(o, "name", "employee", "Employee", "fullName") || "").trim();
    if (!empId && !name) continue;
    if (/^total/i.test(empId) || /^total/i.test(name)) continue;
    const basic = num(pick(o, "basic", "Basic", "basicSalary")), housing = num(pick(o, "housing", "Housing")), transport = num(pick(o, "transport", "Transport")), other = num(pick(o, "other", "Other", "otherAllowance"));
    let gross = num(pick(o, "gross", "Gross", "grossSalary"));
    if (!gross) gross = r2(basic + housing + transport + other);
    const ot = num(pick(o, "ot", "otPay", "overtime", "Overtime", "otAmount"));
    const commission = num(pick(o, "commission", "Commission", "commissionTotal"));
    const deductions = num(pick(o, "deductions", "Deductions", "totalDeductions"));
    let net = num(pick(o, "net", "NET", "Net", "netPay"));
    if (!net) net = r2(gross + ot + commission - deductions);
    out.push({ empId: empId || name, name: name || empId, role: String(pick(o, "role", "Role", "jobTitle") || ""), company: String(pick(o, "company", "Company") || ""),
      basic, housing, transport, other, gross: r2(gross), ot: r2(ot), commission: r2(commission), deductions: r2(deductions), net: r2(net), payMethod: String(pick(o, "payMethod", "paidBy", "Paid by") || "WPS") });
  }
  return out;
}
// ===================== MARKETING MODULE =====================
// One place to plan, approve and push every outbound message the company makes:
// LinkedIn / Instagram / Facebook posts (published through the Meta Graph API and
// the LinkedIn Community Management API once the tokens are set), WhatsApp
// broadcasts (Meta Cloud API — the same WhatsApp Business number as the MA
// chatbot), e-mail campaigns (Zoho SMTP already configured for notifications) and
// the vendor announcement. Every post goes Draft → Review → Approved → Scheduled →
// Published with a per-channel log, so marketing staff prepare and the CEO releases.
var MKT_CHANNELS = [
  { code: "linkedin", name: "LinkedIn", kind: "social" },
  { code: "instagram", name: "Instagram", kind: "social" },
  { code: "facebook", name: "Facebook", kind: "social" },
  { code: "whatsapp", name: "WhatsApp broadcast", kind: "direct" },
  { code: "email", name: "E-mail campaign", kind: "direct" }
];
var MKT_STATUS = ["Draft", "Review", "Approved", "Scheduled", "Published", "Failed", "Cancelled"];
var MKT_TYPES = ["Project showcase", "Completed project / handover", "Company news", "Hiring", "Offer / promotion", "Client announcement", "Greeting / occasion", "Tip / know-how", "Other"];
var GRAPH_API = "https://graph.facebook.com/v20.0";
var LI_API = "https://api.linkedin.com/rest";
function mktEnv() {
  return {
    metaToken: process.env.META_ACCESS_TOKEN || "", waPhoneId: process.env.META_PHONE_NUMBER_ID || "",
    fbPageId: process.env.META_PAGE_ID || "", igUserId: process.env.IG_USER_ID || "",
    liToken: process.env.LINKEDIN_ACCESS_TOKEN || "", liOrg: process.env.LINKEDIN_ORG_ID || "",
    siteUrl: (process.env.SITE_URL || process.env.URL || "https://ma-group-payments.netlify.app").replace(/\/+$/, ""),
    waDefaultTemplate: process.env.WA_TEMPLATE || "", waLang: process.env.WA_TEMPLATE_LANG || "en"
  };
}
function mktChannelStatus() {
  const e = mktEnv();
  return {
    linkedin: { ready: !!(e.liToken && e.liOrg), need: "LINKEDIN_ACCESS_TOKEN + LINKEDIN_ORG_ID" },
    instagram: { ready: !!(e.metaToken && e.igUserId), need: "META_ACCESS_TOKEN (instagram_content_publish) + IG_USER_ID" },
    facebook: { ready: !!(e.metaToken && e.fbPageId), need: "META_ACCESS_TOKEN (pages_manage_posts) + META_PAGE_ID" },
    whatsapp: { ready: !!(e.metaToken && e.waPhoneId), need: "META_ACCESS_TOKEN + META_PHONE_NUMBER_ID" },
    email: { ready: true, need: "" }
  };
}
async function listPosts() {
  const out = (await getAllJSON(store(), "mkt/post/")).filter((v) => v && v.id);
  out.sort((a, b) => String(b.scheduledAt || b.createdAt || "").localeCompare(String(a.scheduledAt || a.createdAt || "")));
  return out;
}
async function listAudiences() { return (await getAllJSON(store(), "mkt/audience/")).filter((v) => v && v.id); }
function normPhone(p) {
  let d = String(p || "").replace(/[^\d+]/g, "");
  if (!d) return "";
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (/^0\d{8,9}$/.test(d)) d = "971" + d.slice(1);   // UAE local → E.164
  if (/^5\d{8}$/.test(d)) d = "971" + d;
  return /^\d{8,15}$/.test(d) ? d : "";
}
// Built-in audiences are derived live from the records already in the system.
async function resolveAudience(s, id) {
  const contacts = [];
  const push = (name, email, phone, company, tag) => { const e = String(email || "").trim().toLowerCase(), p = normPhone(phone); if (!e && !p) return; contacts.push({ name: String(name || "").trim(), email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) ? e : "", phone: p, company: String(company || ""), tag }); };
  if (id === "clients") { for (const c of await listClients()) { if (c.status && /inactive|blocked/i.test(c.status)) continue; push(c.contactName || c.contact || c.name, c.email, c.mobile || c.phone, c.name, "client"); } }
  else if (id === "suppliers") { for (const v of await listSuppliers()) { if (v.status && /inactive|blocked|blacklist/i.test(v.status)) continue; push(v.contactName || v.contact || v.name, v.email, v.mobile || v.whatsapp || v.phone, v.name, "supplier"); } }
  else if (id === "staff") {
    const emps = await hrGet("/admin/employees");
    for (const e of Array.isArray(emps) ? emps : emps.employees || []) { if (e.active === false) continue; push(e.name, e.email, e.phone || e.mobile, e.company || "MA Group", "staff"); }
  } else {
    const a = await s.get("mkt/audience/" + id, { type: "json" });
    if (!a) throw new Error("Audience not found");
    for (const c of a.contacts || []) { if (c.consent === false) continue; push(c.name, c.email, c.phone, c.company, "list"); }
  }
  // de-duplicate on e-mail / phone
  const seen = new Set(); const out = [];
  for (const c of contacts) { const k = c.email || c.phone; if (seen.has(k)) continue; seen.add(k); out.push(c); }
  return out;
}
async function graphCall(url, body, token, method) {
  const rs = await fetch(url, { method: method || (body ? "POST" : "GET"), headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: body ? JSON.stringify(body) : void 0 });
  const txt = await rs.text(); let j = null; try { j = JSON.parse(txt); } catch {}
  if (!rs.ok) throw new Error((j && j.error && (j.error.message || j.error.error_user_msg)) || `Graph API ${rs.status}: ${txt.slice(0, 200)}`);
  return j || {};
}
function postText(post) {
  const tags = (post.hashtags || "").split(/[\s,]+/).filter(Boolean).map((t) => t.startsWith("#") ? t : "#" + t).join(" ");
  return [post.body || "", post.link ? post.link : "", tags].filter(Boolean).join("\n\n").trim();
}
function mediaUrl(env, post, i) { return `${env.siteUrl}/api/mkt/media/${post.id}/${i}?k=${post.mediaKey}`; }
async function publishFacebook(post, env) {
  const text = postText(post), media = post.media || [];
  const img = media.find((m) => /^image\//.test(m.type || ""));
  if (img) return await graphCall(`${GRAPH_API}/${env.fbPageId}/photos`, { url: mediaUrl(env, post, media.indexOf(img)), caption: text, published: true }, env.metaToken);
  return await graphCall(`${GRAPH_API}/${env.fbPageId}/feed`, { message: text, ...(post.link ? { link: post.link } : {}) }, env.metaToken);
}
async function publishInstagram(post, env) {
  const media = post.media || [];
  const img = media.find((m) => /^image\//.test(m.type || ""));
  if (!img) throw new Error("Instagram needs a picture — attach an image (JPEG) to this post.");
  const c = await graphCall(`${GRAPH_API}/${env.igUserId}/media`, { image_url: mediaUrl(env, post, media.indexOf(img)), caption: postText(post) }, env.metaToken);
  let lastErr = "";
  for (let i = 0; i < 4; i++) {
    try { return await graphCall(`${GRAPH_API}/${env.igUserId}/media_publish`, { creation_id: c.id }, env.metaToken); }
    catch (e) { lastErr = e.message; if (!/not ready|9007|in progress/i.test(lastErr)) throw e; await new Promise((r) => setTimeout(r, 2500)); }
  }
  throw new Error(lastErr || "Instagram did not finish processing the image");
}
async function publishLinkedIn(post, env) {
  const H = { Authorization: "Bearer " + env.liToken, "LinkedIn-Version": "202409", "X-Restli-Protocol-Version": "2.0.0", "Content-Type": "application/json" };
  const author = `urn:li:organization:${env.liOrg}`;
  const media = post.media || [];
  const img = media.find((m) => /^image\//.test(m.type || ""));
  let content;
  if (img) {
    const init = await fetch(`${LI_API}/images?action=initializeUpload`, { method: "POST", headers: H, body: JSON.stringify({ initializeUploadRequest: { owner: author } }) });
    const ij = await init.json().catch(() => ({}));
    if (!init.ok) throw new Error("LinkedIn image upload init failed: " + (ij.message || init.status));
    const buf = Buffer.from(String(img.data || "").split(",").pop(), "base64");
    const up = await fetch(ij.value.uploadUrl, { method: "PUT", headers: { Authorization: "Bearer " + env.liToken, "Content-Type": img.type || "image/jpeg" }, body: buf });
    if (!up.ok) throw new Error("LinkedIn image upload failed: " + up.status);
    content = { media: { title: post.title || "MA Group", id: ij.value.image } };
  } else if (post.link) {
    content = { article: { source: post.link, title: post.title || "MA Group" } };
  }
  const body = { author, commentary: postText(post), visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: "PUBLISHED", isReshareDisabledByAuthor: false, ...(content ? { content } : {}) };
  const rs = await fetch(`${LI_API}/posts`, { method: "POST", headers: H, body: JSON.stringify(body) });
  if (!rs.ok) { const t = await rs.text(); throw new Error("LinkedIn: " + rs.status + " " + t.slice(0, 200)); }
  return { id: rs.headers.get("x-restli-id") || "ok" };
}
// WhatsApp Cloud API. Outside a 24-hour customer window only APPROVED TEMPLATES
// can be sent, so broadcasts use a template (name + language) with the post
// body as the first body parameter; a plain text is attempted when no template
// is given (delivered only to numbers that wrote to the business recently).
async function sendWhatsApp(env, to, post, opts) {
  const tpl = opts.template || env.waDefaultTemplate;
  const msg = tpl
    ? { messaging_product: "whatsapp", to, type: "template", template: { name: tpl, language: { code: opts.lang || env.waLang || "en" }, components: opts.params && opts.params.length ? [{ type: "body", parameters: opts.params.map((t) => ({ type: "text", text: String(t) })) }] : void 0 } }
    : { messaging_product: "whatsapp", to, type: "text", text: { body: postText(post), preview_url: !!post.link } };
  const r = await graphCall(`${GRAPH_API}/${env.waPhoneId}/messages`, msg, env.metaToken);
  return (r.messages && r.messages[0] && r.messages[0].id) || "sent";
}
async function publishToChannel(s, post, ch) {
  const env = mktEnv(), st = mktChannelStatus();
  if (!st[ch] || !st[ch].ready) throw new Error(`${ch} is not connected yet — set ${st[ch] ? st[ch].need : ch} in Netlify environment variables.`);
  if (ch === "facebook") return await publishFacebook(post, env);
  if (ch === "instagram") return await publishInstagram(post, env);
  if (ch === "linkedin") return await publishLinkedIn(post, env);
  throw new Error("Use the broadcast action for " + ch);
}
function mktLog(post, entry) { post.log = post.log || []; post.log.push({ at: now(), ...entry }); if (post.log.length > 200) post.log = post.log.slice(-200); }
function mktRollStatus(post) {
  const social = (post.channels || []).filter((c) => ["linkedin", "instagram", "facebook"].includes(c));
  const done = social.filter((c) => post.published && post.published[c]);
  const failed = social.filter((c) => post.failed && post.failed[c]);
  const direct = (post.channels || []).filter((c) => ["whatsapp", "email"].includes(c));
  const directDone = direct.filter((c) => post.published && post.published[c]);
  if (social.length + direct.length === 0) return;
  if (done.length + directDone.length === social.length + direct.length) post.status = "Published";
  else if (failed.length && done.length + directDone.length + failed.length === social.length + direct.length) post.status = "Failed";
}
// Runs everything that is Scheduled and due (called by the 15-minute cron).
async function runScheduledPosts(s) {
  const posts = await listPosts(); const due = posts.filter((p) => p.status === "Scheduled" && p.scheduledAt && p.scheduledAt <= now());
  const out = [];
  for (const post of due) {
    for (const ch of post.channels || []) {
      if (post.published && post.published[ch]) continue;
      try {
        if (["linkedin", "instagram", "facebook"].includes(ch)) { const r = await publishToChannel(s, post, ch); post.published = post.published || {}; post.published[ch] = { at: now(), id: r.id || r.post_id || "" }; if (post.failed) delete post.failed[ch]; mktLog(post, { channel: ch, ok: true, id: r.id || "" }); }
        else if (post.audienceId) { const r = await broadcastPost(s, post, ch, {}); mktLog(post, { channel: ch, ok: true, sent: r.sent, failed: r.failed }); }
      } catch (e) { post.failed = post.failed || {}; post.failed[ch] = { at: now(), error: e.message }; mktLog(post, { channel: ch, ok: false, error: e.message }); }
    }
    mktRollStatus(post); post.updatedAt = now();
    await s.setJSON("mkt/post/" + post.id, post);
    out.push({ id: post.id, status: post.status });
  }
  return out;
}
// WhatsApp / e-mail broadcast of one post to its audience, in batches so one
// request never runs longer than the platform allows. Idempotent per recipient.
async function broadcastPost(s, post, ch, opts) {
  const env = mktEnv();
  const audienceId = opts.audienceId || post.audienceId;
  if (!audienceId) throw new Error("Choose an audience first.");
  const contacts = await resolveAudience(s, audienceId);
  const key = "mkt/sent/" + post.id + "-" + ch;
  const sentRec = (await s.get(key, { type: "json" })) || { post: post.id, channel: ch, done: {}, failed: {} };
  const max = Math.max(1, Math.min(num(opts.batch) || 25, 40));
  let sent = 0, failed = 0, skipped = 0, remaining = 0;
  const pending = contacts.filter((c) => { const id = ch === "email" ? c.email : c.phone; if (!id) { skipped++; return false; } return !sentRec.done[id]; });
  const batch = pending.slice(0, max); remaining = Math.max(0, pending.length - batch.length);
  if (ch === "email") {
    const cfg = await getEmailCfg(s);
    for (const c of batch) {
      const html = emailShell(cfg, { title: post.title || "MA Group", band: "#1f3864", greeting: c.name ? c.name.split(" ")[0] : "Valued partner", lead: String(post.body || "").split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br>")), closing: post.link ? `<a href="${post.link}">${post.link}</a>` : "", preheader: (post.body || "").slice(0, 90) });
      const r = await sendMail(s, cfg, { type: "marketing", to: c.email, toName: c.name, subject: post.emailSubject || post.title || "MA Group", html });
      if (r && (r.status === "sent")) { sentRec.done[c.email] = now(); sent++; } else { sentRec.failed[c.email] = (r && r.detail) || r.status || "not sent"; failed++; }
    }
  } else {
    for (const c of batch) {
      try { const id = await sendWhatsApp(env, c.phone, post, { template: opts.template || post.waTemplate, lang: opts.lang || post.waLang, params: opts.params || post.waParams || [postText(post)] }); sentRec.done[c.phone] = id; sent++; }
      catch (e) { sentRec.failed[c.phone] = e.message; failed++; }
    }
  }
  sentRec.updatedAt = now(); sentRec.audienceId = audienceId; sentRec.total = contacts.length;
  await s.setJSON(key, sentRec);
  if (!remaining) { post.published = post.published || {}; post.published[ch] = { at: now(), count: Object.keys(sentRec.done).length, failed: Object.keys(sentRec.failed).length }; }
  return { sent, failed, skipped, remaining, total: contacts.length, doneTotal: Object.keys(sentRec.done).length };
}

async function computePnl(s, project) {
  const expenses = await listExpenses(project);
  let cost = 0, paidOut = 0, ipcCost = 0, advanceUtilised = 0, subAdvancePaid = 0;
  const byType = {}, byCat = {}, byGroup = { Direct: 0, Indirect: 0, Overhead: 0 }, byDate = {}, byProject = {};
  let hqCost = 0;
  for (const e of expenses) {
    const a = num(e.amount), p = num(e.paid);
    const isHQ = e.project === HQ_PROJECT;
    if (e.source === "supplier-ipc") ipcCost += a; // subcontract cost certified via IPCs
    if (e.source === "supplier-advance") subAdvancePaid += p; // down payment paid to subs (prepayment, not cost)
    // Payments funded out of the client's down payment (advance) — a memo of how
    // much of the advance has been consumed. Uses cash paid if any, else the cost.
    if (e.fromAdvance) advanceUtilised += (p > 0 ? p : a);
    cost += a; paidOut += p;
    if (isHQ) hqCost += a;
    byType[e.costType] = (byType[e.costType] || 0) + a;
    byCat[e.category] = (byCat[e.category] || 0) + a;
    byGroup[isHQ ? "Overhead" : costGroup(e.costType)] = (byGroup[isHQ ? "Overhead" : costGroup(e.costType)] || 0) + a;
    byProject[e.project] = (byProject[e.project] || 0) + a;
    const d = String(e.date || "").slice(0, 10);
    if (d) { byDate[d] = byDate[d] || { cost: 0, paid: 0 }; byDate[d].cost += a; byDate[d].paid += p; }
  }
  const [contracts, allCC, receipts] = await Promise.all([listContracts(), getAllJSON(s, "clientcert/"), getAllJSON(s, "clientreceipt/")]);
  const projContracts = contracts.filter((c) => !project || c.project === project);
  const cids = new Set(projContracts.map((c) => c.id));
  let collectedAll = 0, advanceReceiptSum = 0;
  // Client receipts store the advance flag as `isAdvance` (the older `type`
  // spelling is still honoured), so an advance / down payment logged by the team
  // is recognised here instead of silently reading as a progress collection.
  for (const rc of receipts) { if (!rc) continue; if (project && rc.project !== project) continue; const amt = num(rc.amount); collectedAll += amt; if (rc.isAdvance || rc.type === "advance") advanceReceiptSum += amt; }
  // Per-contract LATEST cumulative position (taken at the highest-gross IPC),
  // plus cumulative billing (net + VAT) summed across that contract's IPCs.
  const maxGross = {}, latestRetention = {}, latestAdvRec = {}, latestMos = {}, latestWork = {};
  const netCertified = {}, vatBilled = {};
  for (const c of allCC) {
    if (!c || !cids.has(c.contractId)) continue;
    if (!["Issued", "Approved"].includes(c.status)) continue;
    const g = num(c.calc?.gross);
    if (g >= (maxGross[c.contractId] || 0)) {
      maxGross[c.contractId] = g;
      latestRetention[c.contractId] = num(c.calc?.retention);
      latestAdvRec[c.contractId] = num(c.calc?.advanceRecoveredToDate || c.calc?.advanceRecovery);
      latestMos[c.contractId] = num(c.calc?.mos);
      latestWork[c.contractId] = num(c.calc?.cumValue);
    }
    netCertified[c.contractId] = (netCertified[c.contractId] || 0) + num(c.calc?.net);
    vatBilled[c.contractId] = (vatBilled[c.contractId] || 0) + num(c.calc?.vat);
  }
  let revenue = 0, netDue = 0, retentionHeld = 0, advanceRecovered = 0, vatDue = 0, materialsOnSite = 0, workExecuted = 0;
  for (const cid in maxGross) revenue += maxGross[cid];
  for (const cid in latestMos) materialsOnSite += latestMos[cid];
  for (const cid in latestWork) workExecuted += latestWork[cid];
  for (const cid in netCertified) netDue += netCertified[cid];
  for (const cid in latestRetention) retentionHeld += latestRetention[cid];
  for (const cid in latestAdvRec) advanceRecovered += latestAdvRec[cid];
  for (const cid in vatBilled) vatDue += vatBilled[cid];
  // Advance (down payment) agreed on the contracts in scope.
  let advanceAgreed = 0;
  for (const c of projContracts) advanceAgreed += num(c.advanceAmount);
  revenue = r2(revenue);
  // ---- subcontract commitments (LOA / contracts issued) ----
  // The award is the committed cost; supplier IPCs (PCs) draw it down. Remaining
  // commitment = committed − certified via IPCs. No double-count: IPC cost is the
  // actual expense; the commitment is a forward view of the awarded total.
  let committed = 0;
  try {
    const awards = await getAllJSON(s, "award/");
    for (const aw of awards) { if (!aw || aw.status === "Cancelled") continue; if (project && aw.project !== project) continue; committed += num(aw.amount); }
  } catch (e) {}
  committed = r2(committed);
  const committedCertified = r2(ipcCost);
  const committedRemaining = r2(Math.max(0, committed - committedCertified));
  // ---- cash position ----
  // "Received" / "collected" reflect ONLY actual logged client receipts — never the
  // agreed down payment or the contract value. The agreed advance is a contract TERM
  // (advanceAgreed), separate from cash actually received (advanceReceived).
  const advanceReceived = r2(advanceReceiptSum);            // logged advance receipts only
  const progressCollected = r2(collectedAll - advanceReceiptSum); // logged progress receipts
  const totalCashIn = r2(collectedAll);                     // all logged receipts (advance + progress)
  const netCash = r2(totalCashIn - paidOut);
  const collected = progressCollected;
  // ---- down-payment (advance) utilisation ----
  // Balance of the agreed advance FACILITY after payments already drawn from it.
  advanceUtilised = r2(advanceUtilised);
  const advanceBalanceRemaining = r2(advanceAgreed - advanceUtilised);
  // ---- CFO income-statement waterfall ----
  // ---- allocated operations cost (HQ pool share) ----
  // Project view: the posted monthly allocations for this project are added as
  // overhead so the project carries its share of running the company. Group
  // view: HQ expenses are already in the ledger, so allocations are memo only
  // (adding them again would double count).
  let allocatedOps = 0, allocMonths = [];
  try {
    if (project && project !== HQ_PROJECT) { const ao = await allocatedOpsFor(s, project); allocatedOps = ao.total; allocMonths = ao.months; }
    else if (!project) { const all = await listOpsAlloc(); for (const a of all) if (a.status === "Posted") allocatedOps = r2(allocatedOps + num(a.total)); }
  } catch (e) {}
  const allocApplied = !!project && project !== HQ_PROJECT && allocatedOps > 0;
  if (allocApplied) { byGroup.Overhead = r2((byGroup.Overhead || 0) + allocatedOps); byType["Allocated operations cost (HQ share)"] = allocatedOps; byCat["Head Office Overhead (allocated)"] = allocatedOps; cost = r2(cost + allocatedOps); }
  const directCost = r2(byGroup.Direct || 0);
  const indirectCost = r2(byGroup.Indirect || 0);
  const overheadCost = r2(byGroup.Overhead || 0);
  const grossProfit = r2(revenue - directCost);                 // after direct cost only
  const operatingProfit = r2(grossProfit - indirectCost);       // after indirect
  const netProfit = r2(operatingProfit - overheadCost);         // after overhead (incl. HQ)
  const grossMargin = revenue ? grossProfit / revenue : 0;
  const operatingMargin = revenue ? operatingProfit / revenue : 0;
  const netMargin = revenue ? netProfit / revenue : 0;
  return {
    project: project || "", scope: project || "All projects",
    revenue, netDue: r2(netDue), cost: r2(cost), paidOut: r2(paidOut), hqCost: r2(hqCost), projectCost: r2(cost - hqCost),
    committed, committedCertified, committedRemaining, ipcCost: r2(ipcCost),
    directCost, indirectCost, overheadCost,
    grossProfit, operatingProfit, netProfit,
    grossMargin, operatingMargin, netMargin,
    // profit / margin retained for existing callers = the bottom line (net)
    profit: netProfit, margin: netMargin,
    // client billing & cash position (advance is a liability, NOT revenue)
    retentionHeld: r2(retentionHeld), advanceRecovered: r2(advanceRecovered),
    advanceAgreed: r2(advanceAgreed), advanceOutstanding: r2(Math.max(0, advanceAgreed - advanceRecovered)),
    vatDue: r2(vatDue), grossBilledInclVat: r2(netDue + vatDue),
    collected: r2(collected), outstandingReceivable: r2(netDue + vatDue - collected),
    materialsOnSite: r2(materialsOnSite), workExecuted: r2(workExecuted),
    advanceReceived, progressCollected, totalCashIn, netCash,
    advanceUtilised, advanceBalanceRemaining, subAdvancePaid: r2(subAdvancePaid),
    allocatedOps: r2(allocatedOps), allocApplied, allocMonths,
    byType, byCat, byGroup, byProject,
    count: expenses.length,
    byDate: Object.entries(byDate).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([d, v]) => ({ date: d, cost: r2(v.cost), paid: r2(v.paid) })),
    expenses: expenses.slice(0, 800)
  };
}
// Work-in-Progress / over-under-billing schedule (construction CFO standard).
// For each project: % complete (cost-to-cost) → earned revenue vs billed
// (certified) → over-billing (billed ahead of work, a liability) or
// under-billing (earned but not yet billed, an asset).
async function computeWip(s) {
  const st = await s.get("settings", { type: "json" }) || {};
  const targetMargin = st.targetMargin != null ? num(st.targetMargin) : 0.15;
  const [contracts, expenses, allCC] = await Promise.all([listContracts(), listExpenses(""), getAllJSON(s, "clientcert/")]);
  const costByProj = {};
  for (const e of expenses) { if (!e || e.project === HQ_PROJECT) continue; costByProj[e.project] = (costByProj[e.project] || 0) + num(e.amount); }
  const contractProj = {}, cvByProj = {};
  for (const c of contracts) { contractProj[c.id] = c.project; cvByProj[c.project] = (cvByProj[c.project] || 0) + num(c.contractSum) + num(c.variations); }
  const maxGross = {};
  for (const c of allCC) { if (!c || !["Issued", "Approved"].includes(c.status)) continue; const g = num(c.calc?.gross); if (g > (maxGross[c.contractId] || 0)) maxGross[c.contractId] = g; }
  const billedByProj = {};
  for (const cid in maxGross) { const p = contractProj[cid]; if (p) billedByProj[p] = (billedByProj[p] || 0) + maxGross[cid]; }
  const projSet = {};
  for (const p of (st.projects || [])) { if (p && !p.fixed) projSet[p.name] = { cv: num(p.contractValue), estCost: num(p.estCost), targetMargin: p.targetMargin != null ? num(p.targetMargin) : null }; }
  const names = [...new Set([...Object.keys(costByProj), ...Object.keys(cvByProj), ...Object.keys(projSet)])].filter((n) => n && n !== HQ_PROJECT);
  const rows = [];
  for (const p of names) {
    const cv = r2(cvByProj[p] || projSet[p]?.cv || 0);
    const cost = r2(num(costByProj[p]));
    const bud = await s.get("budget/" + budgetSlug(p), { type: "json" });
    let estCost = 0, basis = "target margin";
    if (bud && Array.isArray(bud.lines) && bud.lines.length) { estCost = bud.lines.reduce((a, l) => a + num(l.boq), 0); if (estCost > 0) basis = "budget/BOQ"; }
    if (!estCost && projSet[p]?.estCost) { estCost = projSet[p].estCost; basis = "set"; }
    const projTM = projSet[p]?.targetMargin != null ? projSet[p].targetMargin : targetMargin;
    if (!estCost && cv) { estCost = r2(cv * (1 - projTM)); basis = "target margin " + Math.round(projTM * 100) + "%"; }
    const pct = estCost > 0 ? Math.min(1, cost / estCost) : 0;
    const earned = r2(pct * cv);
    const billed = r2(billedByProj[p] || 0);
    const over = Math.max(0, r2(billed - earned));
    const under = Math.max(0, r2(earned - billed));
    rows.push({ project: p, contractValue: cv, estCost: r2(estCost), estProfit: r2(cv - estCost), estMargin: cv ? (cv - estCost) / cv : 0, costToDate: cost, pctComplete: pct, earned, billed, overBilling: over, underBilling: under, basis });
  }
  rows.sort((a, b) => b.contractValue - a.contractValue);
  const t = { contractValue: 0, estCost: 0, costToDate: 0, earned: 0, billed: 0, overBilling: 0, underBilling: 0 };
  for (const r of rows) { t.contractValue += r.contractValue; t.estCost += r.estCost; t.costToDate += r.costToDate; t.earned += r.earned; t.billed += r.billed; t.overBilling += r.overBilling; t.underBilling += r.underBilling; }
  for (const k in t) t[k] = r2(t[k]);
  return { rows, totals: t, targetMargin };
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
    const bac = target;
    // VAC and CPI are only meaningful against a budget — null (shown as "—") when no BOQ.
    const vac = boq > 0 ? r2(bac - eac) : null;
    const cpi = boq > 0 && actual > 0 ? r2(ev / actual) : null;
    const status = boq === 0 ? "—" : vac < 0 ? "Overrun" : vac < bac * 0.05 ? "Watch" : "On budget";
    return { area: l.area, boq, targetPct: tPct, pctComplete: pct, actualMatched: matched, actualOverride: hasOv ? r2(num(l.actualOverride)) : null, target, actual, ev, eac, bac, vac, cpi, status };
  });
  const matchedAreas = new Set(lines.map((l) => l.area));
  let unalloc = 0; for (const k in actualByArea) { if (!matchedAreas.has(k)) unalloc += actualByArea[k]; }
  const sum = (f) => r2(computed.reduce((a, l) => a + f(l), 0));
  const totEv = sum((l) => l.ev), totTarget = sum((l) => l.target), totActual = r2(sum((l) => l.actual) + unalloc);
  const totEac = r2(sum((l) => l.eac) + unalloc);
  const hasBudget = totTarget > 0;
  const totals = {
    boq: sum((l) => l.boq), target: totTarget, actual: totActual, eac: totEac, ev: totEv, hasBudget,
    // Overall % complete: earned-value (EV/BAC) when a BOQ exists, otherwise
    // cost-to-cost (actual ÷ forecast final cost) so it's never a false 0%.
    overallPct: hasBudget ? (totTarget ? r2(totEv / totTarget) : 0) : (totEac ? r2(totActual / totEac) : 0),
    // VAC and CPI require a budget to be meaningful.
    vac: hasBudget ? r2(totTarget - totEac) : null,
    cpi: hasBudget && totActual ? r2(totEv / totActual) : null
  };
  return { project, lines: computed, unalloc: r2(unalloc), saved: !!(bud.lines && bud.lines.length), totals };
}
var POLICY_VERSION = 1;
var CONFIDENTIALITY_POLICY = `<h2 style="margin:0 0 4px;color:#1f3864">MA Group — Confidentiality &amp; Data Protection Undertaking</h2>
<div style="color:#667;font-size:12px;margin-bottom:12px">Applicable to Marvellous Art Decoration &amp; Fit Out Design L.L.C · MA Building Contracting L.L.C · MA Building Maintenance L.L.C ("MA Group"). Version ${POLICY_VERSION}.</div>
<p>This system ("MA Group management system") and the data within it are <b>strictly confidential and the exclusive property of MA Group</b>. By accessing it you agree to the following legally binding undertaking.</p>
<p><b>1. Confidential Information.</b> "Confidential Information" means all information accessible through this system, including without limitation: financial records, payment &amp; interim payment certificates (IPCs), bills of quantities (BOQs), unit rates, pricing, margins, profit &amp; loss and budget data, client and supplier/subcontractor details, contracts, variations, bank details, TRN and tax data, salaries and payroll, and any related commercial, technical or personal data — in any form, whether marked confidential or not.</p>
<p><b>2. Ownership.</b> All Confidential Information is and remains the sole property of MA Group. No right or licence is granted to you other than to use it strictly for the performance of your authorised duties for MA Group.</p>
<p><b>3. Your undertakings.</b> You expressly undertake that you shall: (a) access and use the Confidential Information <b>only</b> for your authorised job duties; (b) <b>not disclose</b> it to any third party or to any colleague not authorised to receive it; (c) <b>not copy, export, download, screenshot, photograph, print, transmit or remove</b> any Confidential Information except as required for your authorised duties; (d) <b>not use it for any personal benefit</b> or for the benefit of any competitor or third party; (e) keep your login credentials confidential, never share your account, and log out after each use; and (f) immediately report any actual or suspected breach, loss or unauthorised access to the CEO.</p>
<p><b>4. Non-use &amp; non-disclosure.</b> You confirm that this is confidential information and that you <b>will not use the same at all</b> outside your authorised duties for MA Group, whether directly or indirectly, during and after your employment or engagement.</p>
<p><b>5. Duration.</b> These obligations take effect from your first access and <b>survive indefinitely</b> after the end of your employment or engagement with MA Group.</p>
<p><b>6. Data protection.</b> You shall handle all personal data in accordance with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data and all other applicable laws.</p>
<p><b>7. Consequences of breach.</b> Any breach of this undertaking may result in <b>disciplinary action up to and including termination</b>, and may expose you to <b>civil and criminal liability under the laws of the United Arab Emirates</b> (including provisions of the UAE Penal Code on breach of trust and the Cybercrime Law), together with liability for all resulting damages and losses to MA Group.</p>
<p><b>8. Acknowledgement &amp; electronic signature.</b> By entering your full name and confirming below, you acknowledge that you have read, understood and agree to be bound by this Undertaking. Your typed name, together with the date, time and your user account, constitutes your <b>electronic signature</b> and is admissible as evidence of your acceptance under UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services.</p>`;
async function hasAcceptedPolicy(s, userId) {
  const a = await s.get("policyack/" + userId, { type: "json" });
  return !!(a && a.version >= POLICY_VERSION);
}
var AWARD_THRESHOLD_DEFAULT = 1e4;
function entityTRN(entObj) {
  if (!entObj) return "";
  if (entObj.trn) return String(entObj.trn).trim();
  const m = String(entObj.line3 || "").match(/TRN[:\s]*([0-9]{5,})/i);
  return m ? m[1] : "";
}
function awardThreshold(settings) { return num(settings && settings.loaThreshold) || AWARD_THRESHOLD_DEFAULT; }
function awardTypeFor(amount, settings) { return num(amount) < awardThreshold(settings) ? "LOA" : "AGREEMENT"; }
// Full letterhead legal document (LOA for small packages, Subcontract Agreement for larger ones).
// ---- Shared MAA Group letterhead (matches the corporate letter design) ----
function mahLogo(cfg) { return cfg && cfg.logoUrl || "https://ma-group-payments.netlify.app/logo.png"; }
function mahHeader(cfg, entName) {
  return `<div class="mah"><img class="mah-logo" src="${mahLogo(cfg)}" alt="MA GROUP" onerror="this.style.display='none'">
    <div class="mah-co"><div class="mah-tag">CONTRACTING &nbsp;&middot;&nbsp; FIT-OUT &nbsp;&middot;&nbsp; CONSTRUCTION</div>
      <div class="mah-n1">${emEsc(entName)}</div>
      <div class="mah-ad">Office No. 1, Al Basha Plaza Building, Nad Al Hamar</div>
      <div class="mah-ad">P.O. Box 455277, Dubai, United Arab Emirates</div>
      <div class="mah-ad">T 800 62044 &nbsp;&middot;&nbsp; info@maagroup.ae &nbsp;&middot;&nbsp; www.maagroup.ae</div>
    </div></div><div class="mah-rule"></div>`;
}
function mahFooter(entName) {
  return `<div class="mah-foot"><div class="mah-foot-rule"></div>
    <div class="mah-foot-co">${emEsc(entName)} &nbsp;&mdash;&nbsp; trading as MAA GROUP</div>
    <div class="mah-foot-cr">Trade Licence No. 1175355 &nbsp;|&nbsp; TRN 104117106500003 &nbsp;|&nbsp; Civil Defence Reg. DCDS0000634132 &nbsp;|&nbsp; ISO 9001 : ISO 14001 : ISO 45001 Certified</div>
    <div class="mah-foot-cr">Office No. 1, Al Basha Plaza Building, Nad Al Hamar, P.O. Box 455277, Dubai, United Arab Emirates &nbsp;|&nbsp; T 800 62044 &nbsp;|&nbsp; info@maagroup.ae &nbsp;|&nbsp; www.maagroup.ae</div></div>`;
}
var MAH_CSS = `.mah{display:flex;align-items:center;gap:16px;border:0}.mah-logo{height:62px;width:auto;max-width:165px;object-fit:contain}.mah-co{flex:1;text-align:right}.mah-tag{color:#C6A252;font-size:10px;font-weight:700;letter-spacing:1.6px}.mah-n1{color:#1F3864;font-size:15px;font-weight:800;margin-top:3px}.mah-ad{color:#6b7280;font-size:9.5px;line-height:1.5}.mah-rule{height:3px;margin:9px 0 4px;background:linear-gradient(to right,#C6A252 0 30%,#1F3864 30% 100%)}.mah-sec{color:#C6A252;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin:16px 0 4px}.mah-foot{margin-top:20px}.mah-foot-rule{height:2px;background:#C6A252;margin-bottom:6px}.mah-foot-co{text-align:center;color:#1F3864;font-weight:800;font-size:10px}.mah-foot-cr{text-align:center;color:#6b7280;font-size:8.6px;line-height:1.5;margin-top:2px}`;
/* ---------- Corporate document pagination ----------
   Turns a flowing corporate document into true A4 pages: content is packed page
   by page, page 2 onward opens with a compact repeated letterhead marked
   "continued", every page carries "Page N of M", and breaks fall between blocks
   or between whole table rows (with the table's header row repeated) — never
   through the middle of a table, a photo or a signature block. */
var MAPG_CSS = `
@page{size:A4;margin:0}
.mapg{width:210mm;height:297mm;padding:12mm 14mm 9mm;margin:0 auto 10px;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;page-break-after:always;break-after:page}
.mapg.last{page-break-after:auto;break-after:auto}
.mapg-body{flex:1 1 auto;overflow:hidden}
.mapg-cont{display:flex;align-items:center;gap:12px;border-bottom:2.5px solid #C6A252;padding-bottom:7px;margin-bottom:11px}
.mapg-cont img{height:11mm;width:auto;max-width:40mm;object-fit:contain}
.mapg-cont .n{font-size:12px;font-weight:800;color:#1F3864;line-height:1.3}
.mapg-cont .r{margin-left:auto;text-align:right;font-size:9.5px;color:#6b7280;line-height:1.45}
.mapg-cont .r b{color:#1F3864;font-size:10.5px}
.mapg-num{flex:0 0 auto;display:flex;justify-content:space-between;align-items:flex-end;gap:12px;font-size:8.6px;color:#8a8f98;border-top:1px solid #e3e7ee;padding-top:5px;margin-top:8px}
.mapg-num b{color:#1F3864;font-weight:700}
@media screen{body.mapg-on{background:#eceff3;padding:14px 0}.mapg{box-shadow:0 2px 14px rgba(0,0,0,.16)}}
@media print{body.mapg-on{background:#fff;padding:0}.mapg{margin:0;box-shadow:none}}
`;
var MAPG_JS = `<script>
window.MAPG_DONE=false;
function MAPG_RUN(){
  try{
    var src=document.querySelector('.page'); if(!src||document.querySelector('.mapg')) { window.MAPG_DONE=true; return; }
    var pb=document.createElement('div'); pb.style.cssText='width:100mm;position:absolute;visibility:hidden;left:-9999px'; document.body.appendChild(pb);
    var MM=pb.getBoundingClientRect().width/100; pb.parentNode.removeChild(pb);
    if(!(MM>0)){ window.MAPG_DONE=true; return; }
    var PGH=297*MM, PADT=12*MM, PADB=9*MM, NUMH=7*MM, CONTH=20*MM;
    var capFirst=PGH-PADT-PADB-NUMH, capCont=capFirst-CONTH;
    var logoEl=src.querySelector('.mah-logo'), nameEl=src.querySelector('.mah-n1');
    var logo=logoEl?logoEl.getAttribute('src'):'';
    var coName=nameEl?nameEl.textContent:'';
    var tEl=src.querySelector('.band .t'); var dTitle=tEl?tEl.textContent:(document.title||'');
    var nEl=src.querySelector('table.pt b'); var dNo=nEl?nEl.textContent:'';
    var foot=src.querySelector('.mah-foot'); if(foot&&foot.parentNode) foot.parentNode.removeChild(foot);
    src.style.maxWidth=(182*MM)+'px'; src.style.padding='0'; src.style.margin='0';
    // ---- Single-page mode (data-fit="1"): a certificate must read as ONE page.
    // The content is uniformly scaled down (never below 62%) so everything —
    // letterhead, particulars, scope, declaration, signatures — lands on one A4
    // sheet. If even the floor scale will not fit, normal pagination takes over.
    if(src.getAttribute('data-fit')==='1'){
      var holder=document.createElement('div');
      while(src.firstChild) holder.appendChild(src.firstChild);
      if(foot) holder.appendChild(foot);
      var pg1=document.createElement('div'); pg1.className='mapg last';
      var body1=document.createElement('div'); body1.className='mapg-body'; body1.style.overflow='visible';
      var scaler=document.createElement('div'); scaler.style.transformOrigin='top left';
      scaler.appendChild(holder); body1.appendChild(scaler); pg1.appendChild(body1);
      if(src.parentNode) src.parentNode.removeChild(src);
      document.body.appendChild(pg1);
      document.body.className=(document.body.className+' mapg-on').trim();
      var avail=capFirst+NUMH; // no page-number strip needed on a one-page document
      var k=1, fits=false;
      for(var it=0; it<7; it++){
        scaler.style.width=(100/k)+'%';
        scaler.style.transform='scale('+k+')';
        var hh=holder.getBoundingClientRect().height;
        if(hh<=avail){ fits=true; break; }
        var nk=k*(avail/hh)*0.985;
        if(nk<0.62){ k=0.62; scaler.style.width=(100/k)+'%'; scaler.style.transform='scale('+k+')';
          fits=holder.getBoundingClientRect().height<=avail; break; }
        k=nk;
      }
      if(fits){ body1.style.overflow='hidden'; window.MAPG_DONE=true; return; }
      // Too much content even at the floor scale — restore and paginate normally.
      scaler.style.width=''; scaler.style.transform='';
      if(pg1.parentNode) pg1.parentNode.removeChild(pg1);
      document.body.className=document.body.className.replace(/\\s*mapg-on/,'');
      var back=document.createElement('div'); back.className='page';
      back.style.maxWidth=(182*MM)+'px'; back.style.padding='0'; back.style.margin='0';
      while(holder.firstChild) back.appendChild(holder.firstChild);
      document.body.appendChild(back);
      src=back;
      foot=src.querySelector('.mah-foot'); if(foot&&foot.parentNode) foot.parentNode.removeChild(foot);
    }
    var blocks=[].slice.call(src.children);
    var H=function(el){ var r=el.getBoundingClientRect(); var cs=window.getComputedStyle(el);
      return r.height+(parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0); };
    var pages=[], cur=[], curH=0, idx=0;
    var cap=function(){ return idx===0?capFirst:capCont; };
    var isHead=function(el){ var c=' '+String(el.className||'')+' '; return c.indexOf(' sec ')>=0||c.indexOf(' mah-sec ')>=0||c.indexOf(' band ')>=0||c.indexOf(' goldrule ')>=0; };
    // A section heading never ends a page on its own — it travels with the block
    // that follows it, so a page never opens with orphaned content.
    var carry=[];
    var flush=function(){
      carry=[];
      while(cur.length>1&&isHead(cur[cur.length-1])) carry.unshift(cur.pop());
      if(cur.length){ pages.push(cur); idx++; }
      cur=[]; curH=0;
      for(var z=0;z<carry.length;z++){ cur.push(carry[z]); curH+=H(carry[z]); }
    };
    var addTall=function(el){
      if(el.tagName==='TABLE'&&el.rows&&el.rows.length>3){
        var rows=[].slice.call(el.rows), hdr=[], i;
        for(i=0;i<rows.length;i++){ if(rows[i].querySelector('th')) hdr.push(rows[i]); else break; }
        var hdrH=0; for(i=0;i<hdr.length;i++) hdrH+=hdr[i].getBoundingClientRect().height;
        var rh=rows.map(function(x){ return x.getBoundingClientRect().height; });
        var part=document.createElement('table'); part.className=el.className; part.style.cssText=el.style.cssText;
        var ph=0, n=0;
        for(i=0;i<rows.length;i++){
          if(curH+ph+rh[i]>cap()&&n>hdr.length){ cur.push(part); flush();
            part=document.createElement('table'); part.className=el.className; part.style.cssText=el.style.cssText;
            for(var k=0;k<hdr.length;k++) part.appendChild(hdr[k].cloneNode(true));
            ph=hdrH; n=hdr.length; }
          part.appendChild(rows[i]); ph+=rh[i]; n++;
        }
        cur.push(part); curH+=ph; return true;
      }
      if(el.className&&String(el.className).indexOf('phgrid')>=0){
        var kids=[].slice.call(el.children);
        var g=el.cloneNode(false), gh=0, rowH=0, c=0;
        for(var j=0;j<kids.length;j++){
          var kh=kids[j].getBoundingClientRect().height+10;
          if(c%2===0){ rowH=kh; } else { rowH=Math.max(rowH,kh); }
          var add=(c%2===0)?kh:0;
          if(curH+gh+add>cap()&&g.children.length){ cur.push(g); flush(); g=el.cloneNode(false); gh=0; c=0; add=kh; }
          g.appendChild(kids[j]); if(c%2===0) gh+=kh; c++;
        }
        if(g.children.length){ cur.push(g); curH+=gh; }
        return true;
      }
      return false;
    };
    for(var b=0;b<blocks.length;b++){
      var el=blocks[b], h=H(el);
      if(h>cap()){ if(curH>0&&cur.length) flush(); if(addTall(el)) continue; }
      if(curH+h>cap()&&cur.length) flush();
      cur.push(el); curH+=h;
    }
    flush();
    if(!pages.length){ window.MAPG_DONE=true; return; }
    var host=document.createElement('div');
    for(var p=0;p<pages.length;p++){
      var pg=document.createElement('div'); pg.className='mapg'+(p===pages.length-1?' last':'');
      if(p>0){ var ch=document.createElement('div'); ch.className='mapg-cont';
        ch.innerHTML=(logo?'<img src="'+logo+'" alt="">':'')+'<div class="n">'+coName+'</div>'+
          '<div class="r"><b>'+dTitle+'</b>'+(dNo?' &nbsp;·&nbsp; '+dNo:'')+'<br>continued from previous page</div>';
        pg.appendChild(ch); }
      var body=document.createElement('div'); body.className='mapg-body';
      for(var q=0;q<pages[p].length;q++) body.appendChild(pages[p][q]);
      if(p===pages.length-1&&foot) body.appendChild(foot);
      pg.appendChild(body);
      var nm=document.createElement('div'); nm.className='mapg-num';
      nm.innerHTML='<span>'+dTitle+(dNo?' &nbsp;·&nbsp; '+dNo:'')+'</span><span>Page <b>'+(p+1)+'</b> of <b>'+pages.length+'</b></span>';
      pg.appendChild(nm);
      host.appendChild(pg);
    }
    if(src.parentNode) src.parentNode.removeChild(src);
    document.body.appendChild(host);
    document.body.className=(document.body.className+' mapg-on').trim();
  }catch(e){}
  window.MAPG_DONE=true;
}
(function(){
  var imgs=[].slice.call(document.images), left=imgs.length, done=false;
  var go=function(){ if(done) return; done=true; setTimeout(MAPG_RUN,30); };
  if(!left) return go();
  var tick=function(){ if(--left<=0) go(); };
  for(var i=0;i<imgs.length;i++){ if(imgs[i].complete) tick(); else { imgs[i].onload=tick; imgs[i].onerror=tick; } }
  setTimeout(go,2500);
})();
<\/script>`;
function buildRfqHtml(rec, cfg, vendor) {
  const money = (n) => emMoney(n), dt = (d) => emDate(d), esc = (x) => emEsc(x);
  const ent = rec.entityName || "MA Group – Marvellous Art LLC";
  const entTrn = String(rec.entityTRN || (/marvellous/i.test(ent) ? "104117106500003" : "")).trim();
  const logo = cfg && cfg.logoUrl || "https://ma-group-payments.netlify.app/logo.png";
  const vName = vendor ? (vendor.name || "") : "";
  const vAttn = vendor ? (vendor.contactName || "") : "";
  const scopeHtml = String(rec.scope || "").split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join("") || "<li>As per the attached BOQ, drawings and specifications.</li>";
  const reqHtml = String(rec.requirements || "").split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join("");
  const filesHtml = (rec.files || []).length ? (rec.files || []).map((f) => `<li>${esc(f.name)}</li>`).join("") : "";
  const submitList = [
    "Itemised unit rates and total price (AED), clearly stating whether VAT is inclusive or exclusive",
    "Delivery / completion lead time from the date of our LPO / award",
    "Validity of the offer (minimum 30 days)",
    "Payment terms proposed",
    "Make / brand / country of origin and technical submittals or samples where applicable",
    "Valid trade licence and VAT (TRN) certificate"
  ].map((x) => `<li>${x}</li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rec.rfqNo)} — Request for Quotation</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Arial,sans-serif;color:#1f2733;margin:0;background:#fff;font-size:12.7px;line-height:1.55}
  .page{max-width:820px;margin:0 auto;padding:26px 34px}
  .lh{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1f3864;padding-bottom:10px}
  .lh img{height:54px}
  .n1{font-size:19px;font-weight:800;color:#1f3864;letter-spacing:.3px}
  .n2{font-size:11px;color:#5b6472}
  .title{text-align:center;margin:16px 0 2px;font-size:17px;font-weight:800;color:#1f3864;letter-spacing:.5px}
  .sub{text-align:center;color:#7a8494;font-size:11px;margin-bottom:14px}
  table.pt{width:100%;border-collapse:collapse;margin:6px 0 14px;font-size:12px}
  table.pt td{border:1px solid #d9dfe8;padding:5px 9px;vertical-align:top}
  table.pt td.k{background:#f4f6f9;color:#5b6472;width:150px;font-weight:600}
  h3{color:#1f3864;font-size:13.5px;margin:16px 0 4px}
  ul{margin:4px 0 4px 18px;padding:0} li{margin:2px 0}
  .note{background:#fff8e6;border-left:4px solid #bf9000;border-radius:4px;padding:9px 13px;margin:10px 0;font-size:12px}
  .sig{margin-top:22px;font-size:12px}
  ${MAH_CSS}
  ${MAPG_CSS}
</style></head><body><div class="page">
  ${mahHeader(cfg, ent)}
  <div class="mah-sec">Procurement — Enquiry / RFQ</div>
  <div class="title">REQUEST FOR QUOTATION</div>
  <div class="sub">Inquiry / Enquiry — Supply &amp; / or Subcontract · United Arab Emirates</div>
  <table class="pt">
    <tr><td class="k">RFQ No.</td><td>${esc(rec.rfqNo)}</td><td class="k">Date</td><td>${dt(rec.sentAt || rec.createdAt)}</td></tr>
    <tr><td class="k">Project</td><td colspan="3">${esc(rec.project || "—")}${rec.location ? " · " + esc(rec.location) : ""}</td></tr>
    <tr><td class="k">Trade / Package</td><td>${esc(rec.trade || "—")}</td><td class="k">Reply by</td><td><b>${rec.dueDate ? dt(rec.dueDate) : "at your earliest"}</b></td></tr>
    ${vName ? `<tr><td class="k">To (Vendor)</td><td colspan="3"><b>${esc(vName)}</b>${vAttn ? " · Attn: " + esc(vAttn) : ""}</td></tr>` : ""}
  </table>
  <p>Dear ${esc(vAttn || vName || "Valued Partner")},</p>
  <p>${esc(ent)} invites your most competitive quotation for the following ${rec.trade ? esc(rec.trade).toLowerCase() : "supply / works"} package${rec.project ? " on our project <b>" + esc(rec.project) + "</b>" : ""}. Kindly review the scope and requirements below and the attached documents, and submit your offer on or before <b>${rec.dueDate ? dt(rec.dueDate) : "the earliest possible date"}</b>.</p>
  <h3>1. Scope of works / supply${rec.scopeTitle ? " — " + esc(rec.scopeTitle) : ""}</h3>
  <ul>${scopeHtml}</ul>
  ${reqHtml ? `<h3>2. Technical requirements &amp; specifications</h3><ul>${reqHtml}</ul>` : ""}
  ${filesHtml ? `<h3>${reqHtml ? "3" : "2"}. Documents attached to this inquiry</h3><ul>${filesHtml}</ul>` : ""}
  <h3>${(reqHtml ? 1 : 0) + (filesHtml ? 1 : 0) + 2}. Your quotation must include</h3>
  <ul>${submitList}</ul>
  ${rec.deliveryTerms ? `<p><b>Delivery / site:</b> ${esc(rec.deliveryTerms)}</p>` : ""}
  ${rec.siteVisit ? `<p><b>Site visit:</b> ${esc(rec.siteVisit)}</p>` : ""}
  ${rec.notes ? `<p>${esc(rec.notes)}</p>` : ""}
  <div class="note">Prices shall be firm and fixed for the validity period. Submission of a quotation does not constitute an award. Any resulting order will be governed by MA Group's standard purchase / subcontract terms, and — where applicable — a Letter of Award or Subcontract Agreement will be issued. Please quote the RFQ number in your reply.</div>
  <p>For any clarification, contact our procurement team at <a href="mailto:${esc(cfg && cfg.replyTo || "info@maagroup.ae")}">${esc(cfg && cfg.replyTo || "info@maagroup.ae")}</a>. We look forward to your competitive offer.</p>
  <div class="sig">Best regards,<br><b>Procurement Department</b><br>${esc(ent)}</div>
  <div style="margin-top:6px;color:#98a2b3;font-size:9px;text-align:center">This Request for Quotation is confidential and intended only for the addressed vendor. ${esc(rec.rfqNo)} · Generated by the MA Group Procurement System.</div>
  ${mahFooter(ent)}
</div>${MAPG_JS}</body></html>`;
}

// ===================== COMPLETION & DLP CERTIFICATES =====================
// Standard MA Group formats (register: MA_COMPLETION_CERTIFICATE_FORMAT_20AUG2026):
// Completion = completion/acceptance record only (no warranty/DLP wording);
// DLP = defects-liability discharge at end of the DLP (UAE practice, Civil Code
// Arts. 880–883 reserved). All clauses editable per certificate before issue.
function compCertDefaults(type) {
  if (type === "WARRANTY") return [
    "We hereby guarantee and warrant all works performed under the referenced contract / purchase order for a period of {WARRANTY_PERIOD} commencing on {DLP_START} (date of completion) and expiring on {DLP_END}. During this period we will repair or replace, at no additional charge to the owner, any defect arising from faulty workmanship in the works performed by us, subject to the terms and conditions below.",
    "Products and manufactured items are covered by the respective suppliers' / manufacturers' warranties as submitted in the close-out documents; those warranties apply in accordance with their own terms and are neither extended nor varied by this certificate.",
    "This warranty covers workmanship defects only. It does not cover damage caused by force, misuse, neglect or accident; damage reported during other fit-out / construction activity; defects or repairs arising from the works of other subcontractors; normal wear and tear; or any part of the works altered, repaired or modified by others without our written consent, in respect of which this warranty is void."
  ];
  if (type === "DLP") return [
    "This is to certify that the Defects Liability Period for the works described in Section 2, which commenced on {DLP_START} and expired on {DLP_END}, has been completed, and that all defects, shrinkages and other faults notified during the Defects Liability Period have been made good to the satisfaction of the Client.",
    "Accordingly, the balance of retention (or the retention guarantee / cheque, where applicable) becomes releasable in accordance with the terms of the contract, and the Contractor's obligations under the contract are discharged, save as stated in this certificate.",
    "This certificate does not affect any liability arising from latent defects, fraud or deliberate concealment, nor the decennial liability imposed by Articles 880–883 of the UAE Civil Code, where applicable."
  ];
  return [
    "This is to certify that the works described in Section 2, executed under the referenced contract / purchase order for the project stated in Section 1, were fully completed on {COMPLETION_DATE} in accordance with the contract documents, approved drawings and specifications, and to a good and workmanlike standard.",
    "The works have been handed over, the site has been cleared of the Contractor's plant, surplus materials and rubbish, and all keys, documentation and deliverables associated with the works have been delivered.",
    "The works are hereby accepted by the Client without reservation. Any works beyond the scope stated in Section 2 shall be treated as a separate order or variation."
  ];
}
/* ---------- DLP service request: SLA, liability catalogue and documents ---------- */
var SR_CATEGORIES = ["Civil & finishes", "Painting & decoration", "Joinery & carpentry", "Doors & ironmongery", "Flooring & tiling", "Ceilings & partitions", "Glass & aluminium", "Electrical", "Plumbing & drainage", "HVAC & ventilation", "Firefighting & alarm", "Data & telecom", "External works & landscape", "Other"];
// Reason codes behind every liability decision — the audit trail that lets MA
// defend a "this is chargeable" position with the client.
var SR_REASONS_IN = [
  { k: "workmanship", t: "Defective workmanship by MA Group" },
  { k: "material", t: "Defective or non-compliant material supplied by MA Group" },
  { k: "installation", t: "Installation error / incomplete installation" },
  { k: "spec", t: "Not in accordance with the approved specification or drawings" },
  { k: "latent", t: "Latent defect appearing within the DLP" },
  { k: "subcontractor", t: "Defect attributable to an MA subcontractor (back-charged)" }
];
var SR_REASONS_OUT = [
  { k: "misuse", t: "Misuse, abuse or improper operation by the occupant" },
  { k: "thirdparty", t: "Third-party works, alteration or interference after handover" },
  { k: "maintenance", t: "Lack of routine maintenance / cleaning by the client" },
  { k: "wear", t: "Fair wear and tear / consumable item" },
  { k: "clientmaterial", t: "Client-supplied material, equipment or nominated supplier" },
  { k: "design", t: "Design or consultant instruction — not a construction defect" },
  { k: "external", t: "External event — water ingress, power surge, force majeure" },
  { k: "notscope", t: "Item never formed part of MA Group's scope of works" },
  { k: "expired", t: "Reported after expiry of the Defects Liability Period" },
  { k: "new", t: "New works / addition requested by the client" }
];
function srSla(settings) {
  const d = (settings && settings.srSla) || {};
  return {
    Emergency: { respondHrs: num(d.emergencyRespond) || 4, rectifyDays: num(d.emergencyRectify) || 1 },
    Urgent: { respondHrs: num(d.urgentRespond) || 24, rectifyDays: num(d.urgentRectify) || 7 },
    Routine: { respondHrs: num(d.routineRespond) || 72, rectifyDays: num(d.routineRectify) || 14 }
  };
}
function srQuoteTotals(r) {
  const subtotal = r2((r.quoteLines || []).reduce((a, l) => a + r2(num(l.qty) * num(l.rate)), 0));
  const vat = r2(subtotal * (r.quoteVatPct != null ? num(r.quoteVatPct) : 0.05));
  return { subtotal, vat, total: r2(subtotal + vat) };
}
// Everything derived rather than stored: SLA clocks, in-warranty check, ageing.
function srDerive(r, settings) {
  if (!r) return r;
  const sla = srSla(settings)[r.priority] || srSla(settings).Routine;
  const rep = r.reportedAt ? new Date(r.reportedAt.length <= 10 ? r.reportedAt + "T09:00" : r.reportedAt) : null;
  const responseDue = rep ? new Date(rep.getTime() + sla.respondHrs * 3600e3).toISOString().slice(0, 16) : "";
  const rectifyDue = rep ? new Date(rep.getTime() + sla.rectifyDays * 864e5).toISOString().slice(0, 10) : "";
  const respondedAt = r.acknowledgedAt || r.inspectedAt || "";
  const nowIso = now();
  const open = !["Closed", "Cancelled", "Declined", "Rejected"].includes(r.status);
  const q = srQuoteTotals(r);
  // In-warranty test: a concern reported after the DLP end date can never be a
  // free rectification, whatever its cause.
  const withinDlp = r.dlpEnd ? String(r.reportedAt || "").slice(0, 10) <= String(r.dlpEnd).slice(0, 10) : null;
  return {
    ...r, quoteSubtotal: q.subtotal, quoteVat: q.vat, quoteTotal: q.total,
    slaRespondHrs: sla.respondHrs, slaRectifyDays: sla.rectifyDays,
    responseDue, rectifyDue, respondedAt,
    responseMet: respondedAt ? (respondedAt <= responseDue) : null,
    responseOverdue: !respondedAt && open && responseDue ? nowIso > responseDue : false,
    rectifyMet: r.completedAt ? (String(r.completedAt).slice(0, 10) <= rectifyDue) : null,
    rectifyOverdue: !r.completedAt && open && rectifyDue ? nowIso.slice(0, 10) > rectifyDue : false,
    ageDays: rep ? Math.max(0, Math.round((Date.now() - rep.getTime()) / 864e5)) : 0,
    withinDlp, open,
    chargeable: r.liability === "out-of-scope" || (r.liability === "partial" && num(r.sharePct) < 100)
  };
}
function srStats(items) {
  const open = items.filter((x) => x.open);
  const closed = items.filter((x) => x.status === "Closed");
  const respTimes = items.filter((x) => x.respondedAt && x.reportedAt)
    .map((x) => (new Date(x.respondedAt) - new Date(x.reportedAt.length <= 10 ? x.reportedAt + "T09:00" : x.reportedAt)) / 3600e3);
  const rectTimes = closed.filter((x) => x.completedAt && x.reportedAt)
    .map((x) => (new Date(x.completedAt) - new Date(x.reportedAt.length <= 10 ? x.reportedAt + "T09:00" : x.reportedAt)) / 864e5);
  const avg = (a) => a.length ? r2(a.reduce((t, v) => t + v, 0) / a.length) : 0;
  return {
    total: items.length, open: open.length, closed: closed.length,
    overdue: open.filter((x) => x.responseOverdue || x.rectifyOverdue).length,
    emergencyOpen: open.filter((x) => x.priority === "Emergency").length,
    inScope: items.filter((x) => x.liability === "in-scope").length,
    outOfScope: items.filter((x) => x.liability === "out-of-scope").length,
    awaitingVerdict: items.filter((x) => x.open && !x.liability).length,
    chargeableValue: r2(items.filter((x) => x.liability === "out-of-scope").reduce((t, x) => t + num(x.quoteTotal), 0)),
    approvedChargeable: r2(items.filter((x) => x.quoteApprovedAt).reduce((t, x) => t + num(x.quoteTotal), 0)),
    backCharges: r2(items.reduce((t, x) => t + num(x.backChargeAmount), 0)),
    avgResponseHrs: avg(respTimes), avgRectifyDays: avg(rectTimes),
    slaResponseMet: items.filter((x) => x.responseMet === true).length,
    slaResponseTotal: items.filter((x) => x.responseMet !== null).length
  };
}
function srReasonText(k) {
  const all = SR_REASONS_IN.concat(SR_REASONS_OUT).find((x) => x.k === k);
  return all ? all.t : (k || "");
}
function srLiabilityLabel(r) {
  return r.liability === "in-scope" ? "MA GROUP LIABILITY — RECTIFIED FREE OF CHARGE UNDER THE DLP"
    : r.liability === "out-of-scope" ? "OUTSIDE THE DLP SCOPE — CHARGEABLE TO THE CLIENT"
    : r.liability === "partial" ? `SHARED LIABILITY — MA GROUP ${num(r.sharePct)}% / CLIENT ${r2(100 - num(r.sharePct))}%`
    : r.liability === "rejected" ? "NOT ACCEPTED — NO MA GROUP LIABILITY"
    : "PENDING INSPECTION & DETERMINATION";
}
function srDocShell(rec, cfg, assets, title, sub, bodyHtml, fit) {
  const esc = (x) => emEsc(x);
  const ent = rec.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rec.no)} — ${esc(title)}</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Arial,sans-serif;color:#1f2733;margin:0;background:#fff;font-size:11.6px;line-height:1.42}
  .page{max-width:820px;margin:0 auto;padding:18px 26px}
  ${MAH_CSS}
  .mah-logo{height:52px}
  .band{background:#183048;color:#fff;text-align:center;padding:7px 12px;margin-top:9px}
  .band .t{font-size:15.5px;font-weight:800;letter-spacing:1.3px}
  .band .s{font-size:10px;color:#d8e0ea;margin-top:1px}
  .goldrule{height:3px;background:#cc9c30;margin-bottom:10px}
  table.pt{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:11.2px}
  table.pt td,table.pt th{border:1px solid #d9dfe8;padding:3.5px 8px;vertical-align:top;text-align:left}
  table.pt td.k{background:#f4f6f9;color:#5b6472;width:160px;font-weight:600}
  table.pt th{background:#183048;color:#fff;font-size:10.5px}
  td.num{text-align:right}
  .sec{color:#183048;font-size:12px;font-weight:800;margin:9px 0 3px;border-left:4px solid #cc9c30;padding-left:8px}
  .decl{border:1px solid #d9dfe8;border-left:4px solid #183048;padding:8px 11px;margin:5px 0;font-size:11.4px}
  .verdict{padding:9px 12px;margin:6px 0;font-weight:800;font-size:12.5px;text-align:center;letter-spacing:.4px;color:#fff}
  .v-in{background:#2E7D32}.v-out{background:#B45309}.v-part{background:#2E75B6}.v-rej{background:#C00000}.v-none{background:#8a8a8a}
  .prio{display:inline-block;padding:2px 8px;border-radius:10px;color:#fff;font-weight:700;font-size:10px}
  .p-Emergency{background:#C00000}.p-Urgent{background:#B45309}.p-Routine{background:#2E75B6}
  .phgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:6px 0}
  .ph{border:1px solid #d9dfe8;border-radius:4px;overflow:hidden}
  .ph img{width:100%;height:200px;object-fit:cover;display:block}
  .pc{padding:5px 8px;font-size:10px;color:#374151;background:#f8fafc;border-top:1px solid #e5e9f0}
  table.sig{width:100%;border-collapse:collapse;margin-top:11px;font-size:11px}
  table.sig td{border:1px solid #d9dfe8;padding:8px 10px;width:50%;vertical-align:top}
  .sh{color:#5b6472;font-weight:700;font-size:10px;letter-spacing:.5px;text-transform:uppercase}
  .sn{font-weight:800;color:#183048;margin:2px 0 5px}
  .sl{color:#444;font-size:10.5px;margin-top:4px}
  .mah-foot{margin-top:12px}
  ${MAPG_CSS}
</style></head><body><div class="page"${fit ? ' data-fit="1"' : ""}>
  ${mahHeader(cfg, ent)}
  <div class="band"><div class="t">${esc(title)}</div><div class="s">${esc(sub)}</div></div><div class="goldrule"></div>
  ${bodyHtml}
  ${mahFooter(ent)}
</div>${MAPG_JS}</body></html>`;
}
function srParticulars(r) {
  const esc = (x) => emEsc(x), dt = (d) => emDate(d);
  const dtm = (x) => x ? (emDate(String(x).slice(0, 10)) + (String(x).length > 10 ? " " + String(x).slice(11, 16) : "")) : "—";
  return `<table class="pt">
    <tr><td class="k">Request No.</td><td><b>${esc(r.no)}</b></td><td class="k">Date reported</td><td>${dtm(r.reportedAt)}</td></tr>
    <tr><td class="k">Project</td><td>${esc(r.project)}</td><td class="k">Priority</td><td><span class="prio p-${esc(r.priority)}">${esc(r.priority)}</span></td></tr>
    <tr><td class="k">Client</td><td>${esc(r.clientName || "—")}</td><td class="k">Client reference</td><td>${esc(r.clientRef || "—")}</td></tr>
    <tr><td class="k">Reported by</td><td>${esc(r.reportedBy || "—")}${r.reportedPhone ? " · " + esc(r.reportedPhone) : ""}</td><td class="k">Received via</td><td>${esc(r.channel)}</td></tr>
    <tr><td class="k">Location</td><td>${esc(r.location || "—")}</td><td class="k">System / asset</td><td>${esc(r.asset || "—")}</td></tr>
    <tr><td class="k">Category</td><td>${esc(r.category)}</td><td class="k">DLP period</td><td>${r.dlpStart || r.dlpEnd ? `${dt(r.dlpStart)} – ${dt(r.dlpEnd)}${r.withinDlp === false ? ' · <b style="color:#C00000">REPORTED AFTER EXPIRY</b>' : r.withinDlp === true ? ' · <b style="color:#2E7D32">within DLP</b>' : ""}` : "—"}</td></tr>
    <tr><td class="k">Response target</td><td>${r.slaRespondHrs} hours — by ${dtm(r.responseDue)}</td><td class="k">Rectification target</td><td>${r.slaRectifyDays} days — by ${dt(r.rectifyDue)}</td></tr>
  </table>`;
}
function buildSrHtml(r, cfg, assets) {
  const esc = (x) => emEsc(x), dt = (d) => emDate(d);
  const vcls = r.liability === "in-scope" ? "v-in" : r.liability === "out-of-scope" ? "v-out" : r.liability === "partial" ? "v-part" : r.liability === "rejected" ? "v-rej" : "v-none";
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:46px;max-width:150px;object-fit:contain;display:block">` : `<div style="height:46px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:80px;opacity:.85;object-fit:contain">` : "";
  const before = (r.photos || []).filter((p) => p.stage !== "after");
  const body = `
  <div class="sec">1. REQUEST PARTICULARS</div>
  ${srParticulars(r)}
  <div class="sec">2. CONCERN AS REPORTED BY THE CLIENT</div>
  <div class="decl">${esc(r.description)}</div>
  ${before.length ? `<div class="sec">3. SITE PHOTOGRAPHS — AS FOUND</div><div class="phgrid">${before.slice(0, 6).map((p, i) => `<div class="ph"><img src="${p.dataUrl}" alt=""><div class="pc"><b>Photo ${String(i + 1).padStart(2, "0")}</b>${p.caption ? " — " + esc(p.caption) : ""}</div></div>`).join("")}</div>` : ""}
  <div class="sec">${before.length ? "4" : "3"}. SITE INSPECTION &amp; ROOT CAUSE</div>
  <table class="pt">
    <tr><td class="k">Inspected by</td><td>${esc(r.inspectedBy || "—")}</td><td class="k">Inspection date</td><td>${r.inspectedAt ? emDate(String(r.inspectedAt).slice(0, 10)) : "—"}</td></tr>
    <tr><td class="k">Findings</td><td colspan="3" style="white-space:pre-wrap">${esc(r.findings || "—")}</td></tr>
    <tr><td class="k">Root cause</td><td colspan="3" style="white-space:pre-wrap">${esc(r.rootCause || "—")}</td></tr>
  </table>
  <div class="sec">${before.length ? "5" : "4"}. LIABILITY DETERMINATION</div>
  <div class="verdict ${vcls}">${esc(srLiabilityLabel(r))}</div>
  <table class="pt">
    <tr><td class="k">Basis of determination</td><td>${esc(srReasonText(r.liabilityReason) || "—")}</td></tr>
    ${r.liabilityNote ? `<tr><td class="k">Remarks</td><td style="white-space:pre-wrap">${esc(r.liabilityNote)}</td></tr>` : ""}
    ${r.liability === "out-of-scope" ? `<tr><td class="k">Commercial effect</td><td><b>These works fall outside the Defects Liability Period and are chargeable.</b> A separate quotation is issued; no works will commence until the client's written approval is received.</td></tr>` : ""}
    ${r.liability === "in-scope" ? `<tr><td class="k">Commercial effect</td><td><b>Rectification will be carried out at MA Group's cost</b> under the Defects Liability Period, at no charge to the client.</td></tr>` : ""}
  </table>
  <div class="decl" style="border-left-color:#cc9c30;font-size:10.8px">This determination is made in accordance with the contract and UAE construction practice: the Defects Liability Period covers defective workmanship, defective materials and installation not in accordance with the approved specification. It does not cover misuse, third-party alterations, absence of routine maintenance, fair wear and tear, client-supplied items, design matters, external events, or any concern reported after the DLP has expired.</div>
  <table class="sig"><tr>
    <td><div class="sh">Assessed &amp; issued by — Contractor</div><div class="sn">${esc(r.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C")}</div>
      <div style="position:relative">${signImg}<div style="position:absolute;left:120px;top:-12px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div><div class="sl">Date: ${dt(now().slice(0, 10))}</div></td>
    <td><div class="sh">Acknowledged by — Client</div><div class="sn">${esc(r.clientName || "")}</div><div style="height:46px"></div>
      <div class="sl">Name: ______________________________</div><div class="sl">Signature &amp; Date: ______________________</div></td>
  </tr></table>`;
  return srDocShell(r, cfg, assets, "DLP SERVICE REQUEST", "Defects Liability Period — Maintenance Request, Inspection &amp; Liability Determination", body, true);
}
function buildSrQuoteHtml(r, cfg, assets) {
  const esc = (x) => emEsc(x), money = (n) => emMoney(n);
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:46px;max-width:150px;object-fit:contain;display:block">` : `<div style="height:46px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:80px;opacity:.85;object-fit:contain">` : "";
  const body = `
  <div class="sec">1. REFERENCE</div>
  ${srParticulars(r)}
  <div class="sec">2. WORKS QUOTED</div>
  <div class="decl">${esc(r.description)}${r.findings ? `<div style="margin-top:5px"><b>Inspection findings:</b> ${esc(r.findings)}</div>` : ""}</div>
  <div class="verdict v-out">OUTSIDE THE DEFECTS LIABILITY PERIOD — CHARGEABLE WORKS</div>
  <table class="pt"><tr><td class="k">Reason</td><td>${esc(srReasonText(r.liabilityReason) || "—")}${r.liabilityNote ? " — " + esc(r.liabilityNote) : ""}</td></tr></table>
  <div class="sec">3. PRICE BREAKDOWN (AED)</div>
  <table class="pt"><tr><th style="width:34px">#</th><th>Description</th><th style="width:55px">Unit</th><th style="width:55px">Qty</th><th style="width:80px">Rate</th><th style="width:90px">Amount</th></tr>
    ${(r.quoteLines || []).map((l, i) => `<tr><td>${i + 1}</td><td>${esc(l.description)}</td><td>${esc(l.unit || "—")}</td><td class="num">${esc(l.qty)}</td><td class="num">${money(l.rate)}</td><td class="num">${money(l.amount)}</td></tr>`).join("") || `<tr><td colspan="6">—</td></tr>`}
    <tr><td colspan="5" style="text-align:right"><b>Subtotal (excl. VAT)</b></td><td class="num"><b>${money(r.quoteSubtotal)}</b></td></tr>
    <tr><td colspan="5" style="text-align:right">VAT @ ${Math.round(num(r.quoteVatPct) * 100)}%</td><td class="num">${money(r.quoteVat)}</td></tr>
    <tr style="background:#f4f6f9"><td colspan="5" style="text-align:right"><b>TOTAL PAYABLE (incl. VAT)</b></td><td class="num"><b>${money(r.quoteTotal)}</b></td></tr>
    <tr><td colspan="6" style="font-style:italic">${esc(amountWords(r.quoteTotal))}</td></tr>
  </table>
  <div class="sec">4. TERMS</div>
  <div class="decl" style="font-size:11px">
    <p style="margin:0 0 4px">• Quotation validity: <b>${esc(r.quoteValidity || "15 days")}</b> from the date of issue.</p>
    <p style="margin:0 0 4px">• Works will be scheduled and commenced <b>only upon receipt of the client's written approval</b> (email or signed copy of this quotation).</p>
    <p style="margin:0 0 4px">• Prices are for the works described above only; any additional scope discovered during execution will be quoted separately before proceeding.</p>
    <p style="margin:0 0 4px">• Payment terms: as per the main contract, unless otherwise agreed in writing.</p>
    <p style="margin:0">• These works are <b>not</b> covered by the Defects Liability Period for the reason stated in section 2 above.</p>
  </div>
  <table class="sig"><tr>
    <td><div class="sh">Quoted by — Contractor</div><div class="sn">${esc(r.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C")}</div>
      <div style="position:relative">${signImg}<div style="position:absolute;left:120px;top:-12px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div></td>
    <td><div class="sh">Approved for execution — Client</div><div class="sn">${esc(r.clientName || "")}</div><div style="height:46px"></div>
      <div class="sl">Name: ______________________________</div><div class="sl">LPO / approval ref: ________________</div><div class="sl">Signature, Stamp &amp; Date: _____________</div></td>
  </tr></table>`;
  return srDocShell(r, cfg, assets, "QUOTATION — CHARGEABLE WORKS", "Works outside the Defects Liability Period", body, true);
}
function buildSrReportHtml(r, cfg, assets) {
  const esc = (x) => emEsc(x), dt = (d) => emDate(d);
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:46px;max-width:150px;object-fit:contain;display:block">` : `<div style="height:46px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:80px;opacity:.85;object-fit:contain">` : "";
  const after = (r.photos || []).filter((p) => p.stage === "after");
  const before = (r.photos || []).filter((p) => p.stage !== "after");
  const grid = (list, label) => list.length ? `<div class="sec">${label}</div><div class="phgrid">${list.slice(0, 6).map((p, i) => `<div class="ph"><img src="${p.dataUrl}" alt=""><div class="pc"><b>${String(i + 1).padStart(2, "0")}</b>${p.caption ? " — " + esc(p.caption) : ""}</div></div>`).join("")}</div>` : "";
  const body = `
  <div class="sec">1. REFERENCE</div>
  ${srParticulars(r)}
  <div class="sec">2. CONCERN REPORTED</div>
  <div class="decl">${esc(r.description)}</div>
  <div class="sec">3. DETERMINATION</div>
  <div class="verdict ${r.liability === "in-scope" ? "v-in" : r.liability === "out-of-scope" ? "v-out" : r.liability === "partial" ? "v-part" : "v-none"}">${esc(srLiabilityLabel(r))}</div>
  <table class="pt"><tr><td class="k">Basis</td><td>${esc(srReasonText(r.liabilityReason) || "—")}</td></tr>
    ${r.liability === "out-of-scope" && r.clientApprovalRef ? `<tr><td class="k">Client approval</td><td>${esc(r.clientApprovalRef)} — dated ${r.quoteApprovedAt ? dt(String(r.quoteApprovedAt).slice(0, 10)) : "—"}</td></tr>` : ""}
    ${r.liability === "out-of-scope" ? `<tr><td class="k">Chargeable amount</td><td><b>AED ${emMoney(r.quoteTotal)}</b> (incl. VAT)</td></tr>` : ""}</table>
  <div class="sec">4. WORK CARRIED OUT</div>
  <table class="pt">
    <tr><td class="k">Attended by</td><td>${esc(r.assignedTo || "—")}</td><td class="k">Date completed</td><td>${r.completedAt ? dt(String(r.completedAt).slice(0, 10)) : "—"}</td></tr>
    <tr><td class="k">Work done</td><td colspan="3" style="white-space:pre-wrap">${esc(r.workDone || "—")}</td></tr>
    ${r.materialsUsed ? `<tr><td class="k">Materials used</td><td colspan="3">${esc(r.materialsUsed)}</td></tr>` : ""}
    ${num(r.manHours) ? `<tr><td class="k">Man-hours</td><td colspan="3">${num(r.manHours)}</td></tr>` : ""}
    <tr><td class="k">Response time</td><td>${r.respondedAt ? "Attended within target" + (r.responseMet === false ? " — EXCEEDED" : "") : "—"}</td><td class="k">Rectification</td><td>${r.rectifyMet === true ? "Within target" : r.rectifyMet === false ? "Exceeded target" : "—"}</td></tr>
  </table>
  ${grid(before, "5. PHOTOGRAPHS — BEFORE")}
  ${grid(after, before.length ? "6. PHOTOGRAPHS — AFTER RECTIFICATION" : "5. PHOTOGRAPHS — AFTER RECTIFICATION")}
  <div class="decl" style="border-left-color:#2E7D32">The works described above have been completed and the location left clean and in working order. ${r.liability === "in-scope" ? "This rectification was carried out at MA Group's cost under the Defects Liability Period." : r.liability === "out-of-scope" ? "These works were outside the Defects Liability Period and are chargeable as per the approved quotation." : ""} ${r.dlpEnd ? `The Defects Liability Period for this project ends on <b>${dt(r.dlpEnd)}</b>; this attendance does not extend it except in respect of the rectified item.` : ""}</div>
  <table class="sig"><tr>
    <td><div class="sh">Completed by — Contractor</div><div class="sn">${esc(r.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C")}</div>
      <div style="position:relative">${signImg}<div style="position:absolute;left:120px;top:-12px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div></td>
    <td><div class="sh">Works accepted by — Client</div><div class="sn">${esc(r.clientSignName || r.clientName || "")}</div><div style="height:46px"></div>
      <div class="sl">Name: ${r.clientSignName ? esc(r.clientSignName) : "______________________________"}</div>
      <div class="sl">Date: ${r.clientSignDate ? dt(r.clientSignDate) : "______________"}</div>
      <div class="sl">Signature &amp; Stamp</div></td>
  </tr></table>`;
  return srDocShell(r, cfg, assets, "SERVICE COMPLETION REPORT", "Defects Liability Period — rectification record and client acceptance", body, true);
}
function buildCompCertHtml(rec, cfg, assets) {
  const money = (n) => emMoney(n), dt = (d) => emDate(d), esc = (x) => emEsc(x);
  const isDlp = rec.type === "DLP", isW = rec.type === "WARRANTY";
  const ent = rec.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C";
  const entTrn = String(rec.entityTRN || (/marvellous/i.test(ent) ? "104117106500003" : "")).trim();
  const title = isW ? "WARRANTY CERTIFICATE" : isDlp ? "DEFECTS LIABILITY COMPLETION CERTIFICATE" : "CERTIFICATE OF COMPLETION";
  const sub = isW ? "Warranty of Works — Fit-Out / Construction" : isDlp ? "Certificate of Making Good Defects — end of Defects Liability Period" : "Completion & Handover of Works";
  const scopeRows = (rec.scope || []).filter((l) => l && (l.description || "").trim()).map((l, i) =>
    `<tr><td>${esc(l.ref || i + 1)}</td><td>${esc(l.description)}</td><td>${esc(l.unit || "—")}</td><td class="num">${esc(l.qty || "—")}</td><td>${esc(l.status || "Completed")}</td></tr>`).join("")
    || `<tr><td>1</td><td>As per the referenced contract / purchase order and approved quotation.</td><td>—</td><td class="num">—</td><td>Completed</td></tr>`;
  const clauses = (Array.isArray(rec.clauses) && rec.clauses.length ? rec.clauses : compCertDefaults(rec.type))
    .map((c) => String(c || "")
      .replace(/\{COMPLETION_DATE\}/g, dt(rec.completionDate))
      .replace(/\{DLP_START\}/g, dt(rec.dlpStart))
      .replace(/\{DLP_END\}/g, dt(rec.dlpEnd))
      .replace(/\{WARRANTY_PERIOD\}/g, rec.warrantyPeriod || "12 months"))
    .filter((c) => c.trim())
    .map((c) => `<p style="margin:0 0 8px">${esc(c)}</p>`).join("");
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:50px;max-width:160px;object-fit:contain;display:block">` : `<div style="height:50px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:90px;opacity:.85;object-fit:contain">` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rec.docNo)} — ${title}</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Arial,sans-serif;color:#1f2733;margin:0;background:#fff;font-size:11.6px;line-height:1.42}
  .page{max-width:820px;margin:0 auto;padding:18px 26px}
  ${MAH_CSS}
  .mah-logo{height:52px}
  .band{background:#183048;color:#fff;text-align:center;padding:7px 12px;margin-top:9px}
  .band .t{font-size:15.5px;font-weight:800;letter-spacing:1.3px}
  .band .s{font-size:10px;color:#d8e0ea;margin-top:1px}
  .goldrule{height:3px;background:#cc9c30;margin-bottom:10px}
  table.pt{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:11.2px}
  table.pt td,table.pt th{border:1px solid #d9dfe8;padding:3.5px 8px;vertical-align:top;text-align:left}
  table.pt td.k{background:#f4f6f9;color:#5b6472;width:165px;font-weight:600}
  table.pt th{background:#183048;color:#fff;font-size:10.5px}
  td.num{text-align:right}
  .sec{color:#183048;font-size:12px;font-weight:800;margin:9px 0 3px;border-left:4px solid #cc9c30;padding-left:8px}
  .decl{border:1px solid #d9dfe8;border-left:4px solid #183048;padding:8px 11px;margin:5px 0;font-size:11.4px}
  .decl p{margin:0 0 5px}
  table.sig{width:100%;border-collapse:collapse;margin-top:11px;font-size:11px}
  table.sig td{border:1px solid #d9dfe8;padding:8px 10px;width:50%;vertical-align:top}
  .sh{color:#5b6472;font-weight:700;font-size:10px;letter-spacing:.5px;text-transform:uppercase}
  .sn{font-weight:800;color:#183048;margin:2px 0 5px}
  .sl{color:#444;font-size:10.5px;margin-top:4px}
  .mah-foot{margin-top:12px}
  ${MAPG_CSS}
</style></head><body><div class="page" data-fit="1">
  ${mahHeader(cfg, ent)}
  <div class="band"><div class="t">${title}</div><div class="s">${sub}</div></div><div class="goldrule"></div>
  <table class="pt">
    <tr><td class="k">Certificate No.</td><td><b>${esc(rec.docNo)}</b></td><td class="k">Date of Issue</td><td>${dt(rec.date)}</td></tr>
  </table>
  <div class="sec">1. PROJECT &amp; CONTRACT PARTICULARS</div>
  <table class="pt">
    <tr><td class="k">${isDlp ? "Client / Employer" : "Client"}</td><td colspan="3"><b>${esc(rec.partyName || "—")}</b>${rec.partyTrn ? " · TRN " + esc(rec.partyTrn) : ""}${rec.partyAttn ? " · Attn: " + esc(rec.partyAttn) : ""}</td></tr>
    <tr><td class="k">Project</td><td>${esc(rec.project || "—")}</td><td class="k">Location</td><td>${esc(rec.location || "—")}</td></tr>
    <tr><td class="k">Contractor</td><td colspan="3">${esc(ent)}${entTrn ? " · TRN " + esc(entTrn) : ""}</td></tr>
    <tr><td class="k">Contract / PO Ref.</td><td>${esc(rec.contractRef || "—")}${rec.contractDate ? " dated " + dt(rec.contractDate) : ""}</td><td class="k">Quotation Ref.</td><td>${esc(rec.quotationRef || "—")}${rec.quotationDate ? " dated " + dt(rec.quotationDate) : ""}</td></tr>
    ${isW
      ? `<tr><td class="k">Date of Completion</td><td>${dt(rec.completionDate || rec.dlpStart)}</td><td class="k">Warranty Period</td><td><b>${esc(rec.warrantyPeriod || "12 months")}</b> — from <b>${dt(rec.dlpStart)}</b> to <b>${dt(rec.dlpEnd)}</b></td></tr>`
      : isDlp
      ? `<tr><td class="k">Date of Completion</td><td>${dt(rec.completionDate)}</td><td class="k">DLP</td><td>From <b>${dt(rec.dlpStart)}</b> to <b>${dt(rec.dlpEnd)}</b></td></tr>`
      : `<tr><td class="k">Date of Completion</td><td colspan="3"><b>${dt(rec.completionDate)}</b></td></tr>`}
  </table>
  <div class="sec">2. SCOPE OF WORKS ${isW ? "COVERED BY THIS WARRANTY" : isDlp ? "COVERED" : "COMPLETED"}</div>
  <table class="pt"><tr><th style="width:34px">#</th><th>Description</th><th style="width:60px">Unit</th><th style="width:60px">Qty</th><th style="width:110px">Status</th></tr>${scopeRows}</table>
  ${isDlp && rec.retentionDue ? `<div class="sec">3. RETENTION</div><table class="pt"><tr><td class="k">Retention release</td><td>${esc(rec.retentionDue)}</td></tr></table>` : ""}
  <div class="sec">${(isDlp && rec.retentionDue) ? "4" : "3"}. ${isW ? "WARRANTY, TERMS &amp; CONDITIONS" : "DECLARATION"}</div>
  <div class="decl">${clauses}</div>
  ${rec.notes ? `<div class="decl" style="border-left-color:#cc9c30"><b>Remarks / exceptions:</b> ${esc(rec.notes)}</div>` : ""}
  <table class="sig"><tr>
    <td><div class="sh">Issued by — Contractor</div><div class="sn">${esc(ent)}</div>
      <div style="position:relative">${signImg}<div style="position:absolute;left:130px;top:-14px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div><div class="sl">Signature &amp; Company Stamp</div><div class="sl">Date: ${dt(rec.date)}</div></td>
    <td><div class="sh">${isW ? "Received &amp; acknowledged by" : "Accepted by"} — ${esc(rec.partyType || "Client")}</div><div class="sn">${esc(rec.partyName || "")}</div>
      <div style="height:50px"></div>
      <div class="sl">Name: ______________________________</div><div class="sl">Title: ______________________________</div><div class="sl">Signature &amp; Company Stamp</div><div class="sl">Date: ______________</div></td>
  </tr></table>
  <div style="color:#7a8494;font-size:9.5px;margin-top:8px">Issued in duplicate — one signed original to be retained by each party. ${isW ? "Warranty claims are to be notified in writing to info@maagroup.ae within the warranty period." : isDlp ? "" : "This certificate is a completion record only; warranty and defects liability, where applicable, remain governed by the approved quotation / purchase order terms."}</div>
  ${mahFooter(ent)}
</div>${MAPG_JS}</body></html>`;
}

// Professional Project Completion Report — accompanies the Completion Certificate:
// executive summary, project & contract particulars, scope completed, and the
// photographic record of the finished works, on the corporate letterhead.
function buildCompReportHtml(rec, cfg, assets) {
  const money = (n) => emMoney(n), dt = (d) => emDate(d), esc = (x) => emEsc(x);
  const ent = rec.entityName || "Marvellous Art Decoration Design & Fit Out Co. L.L.C";
  const entTrn = String(rec.entityTRN || (/marvellous/i.test(ent) ? "104117106500003" : "")).trim();
  const photos = Array.isArray(rec.photos) ? rec.photos : [];
  const scopeRows = (rec.scope || []).filter((l) => l && (l.description || "").trim()).map((l, i) =>
    `<tr><td>${esc(l.ref || i + 1)}</td><td>${esc(l.description)}</td><td>${esc(l.unit || "—")}</td><td class="num">${esc(l.qty || "—")}</td><td>${esc(l.status || "Completed")}</td></tr>`).join("")
    || `<tr><td>1</td><td>As per the referenced contract / purchase order and approved quotation.</td><td>—</td><td class="num">—</td><td>Completed</td></tr>`;
  const summary = String(rec.reportIntro || "").trim() ||
    `${ent} is pleased to report the successful completion of the works for ${rec.partyName || "the Client"} on the project “${rec.project || ""}”${rec.location ? " at " + rec.location : ""}. The works, executed under ${rec.contractRef ? "contract / purchase order " + rec.contractRef : "the referenced contract"}${rec.quotationRef ? " (quotation " + rec.quotationRef + ")" : ""}, were completed on ${emDate(rec.completionDate)} in accordance with the contract documents, approved drawings and specifications. This report accompanies Certificate No. ${rec.docNo} dated ${emDate(rec.date)} and records the project particulars, the scope of works completed and the photographic record of the finished works.`;
  const photoCells = photos.map((p, i) => `<div class="ph"><img src="${p.dataUrl}" alt=""><div class="pc"><b>Photo ${String(i + 1).padStart(2, "0")}</b>${p.caption ? " — " + esc(p.caption) : ""}</div></div>`).join("");
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:50px;max-width:160px;object-fit:contain;display:block">` : `<div style="height:50px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:90px;opacity:.85;object-fit:contain">` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rec.docNo)} — Project Completion Report</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Arial,sans-serif;color:#1f2733;margin:0;background:#fff;font-size:12.5px;line-height:1.55}
  .page{max-width:820px;margin:0 auto;padding:26px 34px}
  ${MAH_CSS}
  .band{background:#183048;color:#fff;text-align:center;padding:10px 12px;margin-top:12px}
  .band .t{font-size:17px;font-weight:800;letter-spacing:1.4px}
  .band .s{font-size:10.5px;color:#d8e0ea;margin-top:2px}
  .goldrule{height:3px;background:#cc9c30;margin-bottom:14px}
  table.pt{width:100%;border-collapse:collapse;margin:6px 0 12px;font-size:12px}
  table.pt td,table.pt th{border:1px solid #d9dfe8;padding:5px 9px;vertical-align:top;text-align:left}
  table.pt td.k{background:#f4f6f9;color:#5b6472;width:170px;font-weight:600}
  table.pt th{background:#183048;color:#fff;font-size:11px}
  td.num{text-align:right}
  .sec{color:#183048;font-size:13px;font-weight:800;margin:14px 0 4px;border-left:4px solid #cc9c30;padding-left:8px}
  .exec{border:1px solid #d9dfe8;border-left:4px solid #183048;padding:12px 14px;margin:8px 0;font-size:12.3px}
  .phgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:8px 0}
  .ph{border:1px solid #d9dfe8;border-radius:4px;overflow:hidden;page-break-inside:avoid}
  .ph img{width:100%;height:250px;object-fit:cover;display:block}
  .pc{padding:6px 9px;font-size:10.5px;color:#374151;background:#f8fafc;border-top:1px solid #e5e9f0}
  table.sig{width:100%;border-collapse:collapse;margin-top:20px;font-size:11.5px}
  table.sig td{border:1px solid #d9dfe8;padding:10px 12px;width:50%;vertical-align:top}
  .sh{color:#5b6472;font-weight:700;font-size:10.5px;letter-spacing:.5px;text-transform:uppercase}
  .sn{font-weight:800;color:#183048;margin:3px 0 8px}
  .sl{color:#444;font-size:11px;margin-top:6px}
  @media print{ .ph img{height:230px} }
  ${MAPG_CSS}
</style></head><body><div class="page">
  ${mahHeader(cfg, ent)}
  <div class="band"><div class="t">PROJECT COMPLETION REPORT</div><div class="s">Accompanying Certificate No. ${esc(rec.docNo)} · ${dt(rec.date)}</div></div><div class="goldrule"></div>
  <div class="sec">1. EXECUTIVE SUMMARY</div>
  <div class="exec">${esc(summary)}</div>
  <div class="sec">2. PROJECT &amp; CONTRACT PARTICULARS</div>
  <table class="pt">
    <tr><td class="k">Client / Employer</td><td colspan="3"><b>${esc(rec.partyName || "—")}</b>${rec.partyTrn ? " · TRN " + esc(rec.partyTrn) : ""}</td></tr>
    <tr><td class="k">Project</td><td>${esc(rec.project || "—")}</td><td class="k">Location</td><td>${esc(rec.location || "—")}</td></tr>
    <tr><td class="k">Contractor</td><td colspan="3">${esc(ent)}${entTrn ? " · TRN " + esc(entTrn) : ""}</td></tr>
    <tr><td class="k">Contract / PO Ref.</td><td>${esc(rec.contractRef || "—")}${rec.contractDate ? " dated " + dt(rec.contractDate) : ""}</td><td class="k">Quotation Ref.</td><td>${esc(rec.quotationRef || "—")}${rec.quotationDate ? " dated " + dt(rec.quotationDate) : ""}</td></tr>
    <tr><td class="k">Date of Completion</td><td><b>${dt(rec.completionDate)}</b></td><td class="k">Certificate</td><td>${esc(rec.docNo)} — ${dt(rec.date)}</td></tr>

  </table>
  <div class="sec">3. SCOPE OF WORKS COMPLETED</div>
  <table class="pt"><tr><th style="width:34px">#</th><th>Description</th><th style="width:60px">Unit</th><th style="width:60px">Qty</th><th style="width:110px">Status</th></tr>${scopeRows}</table>
  ${rec.notes ? `<div class="exec" style="border-left-color:#cc9c30"><b>Remarks:</b> ${esc(rec.notes)}</div>` : ""}
  <div class="sec">4. PHOTOGRAPHIC RECORD OF COMPLETED WORKS ${photos.length ? `<span style="font-weight:400;color:#6b7280;font-size:11px">(${photos.length} photograph${photos.length === 1 ? "" : "s"})</span>` : ""}</div>
  ${photos.length ? `<div class="phgrid">${photoCells}</div>` : `<div class="exec" style="color:#6b7280">No photographs attached.</div>`}
  <div class="sec">5. COMPLETION STATEMENT</div>
  <div class="exec">We confirm that the works recorded in this report have been completed, inspected and handed over in a satisfactory condition, and that the photographic record above fairly represents the state of the completed works at handover. This report is issued in support of Certificate No. ${esc(rec.docNo)} and forms part of the project close-out documentation.</div>
  <table class="sig"><tr>
    <td><div class="sh">Prepared &amp; issued by — Contractor</div><div class="sn">${esc(ent)}</div>
      <div style="position:relative">${signImg}<div style="position:absolute;left:130px;top:-14px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div><div class="sl">Signature &amp; Company Stamp</div><div class="sl">Date: ${dt(rec.date)}</div></td>
    <td><div class="sh">Received by — ${esc(rec.partyType || "Client")}</div><div class="sn">${esc(rec.partyName || "")}</div>
      <div style="height:50px"></div>
      <div class="sl">Name: ______________________________</div><div class="sl">Title: ______________________________</div><div class="sl">Signature &amp; Date</div></td>
  </tr></table>
  ${mahFooter(ent)}
</div>${MAPG_JS}</body></html>`;
}
function buildAwardDocHtml(rec, cfg, assets) {
  const isAgr = rec.type === "AGREEMENT";
  const money = (n) => emMoney(n), dt = (d) => emDate(d), esc = (x) => emEsc(x);
  const a = num(rec.amount);
  const retPct = num(rec.retentionPct) || 10, delayDay = num(rec.delayPctPerDay) || 0.5, delayCap = num(rec.delayCapPct) || 10;
  const perfPct = num(rec.performancePct) || 10;
  const dlp = num(rec.dlpDays) || 365, payDays = num(rec.paymentDays) || 30, hrs = num(rec.signBackHours) || 24;
  const perfAmt = r2(a * perfPct / 100);
  // UAE-standard security: performance security (bank guarantee for agreements,
  // undated cheque for small LOAs), retention 10% capped at 5% of the price,
  // and an advance-payment guarantee equal to the advance.
  const perfType = rec.perfSecurityType || (isAgr ? "guarantee" : "cheque");
  const perfValidity = rec.perfValidity || "valid until 28 days after the end of the Defects Liability Period";
  const secDays = num(rec.securityDeliveryDays) || 7;
  const retCapPct = rec.retentionCapPct != null && rec.retentionCapPct !== "" ? num(rec.retentionCapPct) : 5;
  const advGuarType = rec.advGuaranteeType || "guarantee";
  const priceWord = isAgr ? "Subcontract Price" : "award value";
  const advAmt = num(rec.advanceAmount);
  const advRecPct = num(rec.advanceRecoveryPct) || (advAmt > 0 && a > 0 ? r2(advAmt / a * 100) : 0);
  const advPctOfAward = a > 0 ? r2(advAmt / a * 100) : 0;
  const ent = rec.entityName || "MA Group – Marvellous Art LLC";
  // TRN is taken from the paying entity (stored on the award), never hardcoded,
  // so each entity/tenant prints its own tax number. Fallback keeps existing
  // Marvellous Art documents correct for records saved before this field existed.
  const entTrn = String(rec.entityTRN || (/marvellous/i.test(ent) ? "104117106500003" : "")).trim();
  // Instrument description used by the Performance Security clause.
  const perfInstrument = perfType === "guarantee"
    ? `an <b>unconditional, irrevocable, on-demand bank guarantee for ${money(perfAmt)}</b> (${perfPct}% of the ${priceWord}), issued by a UAE-licensed bank in favour of ${esc(ent)}, ${perfValidity}`
    : perfType === "cheque"
    ? `an <b>undated performance cheque for ${money(perfAmt)}</b> (${perfPct}% of the ${priceWord}), drawn on a UAE-licensed bank in favour of ${esc(ent)}`
    : "";
  const perfReturn = perfType === "guarantee"
    ? "The guarantee is released within 30 days after expiry of its validity, provided all your obligations are discharged."
    : perfType === "cheque"
    ? "The cheque is returned within 30 days after the end of the DLP and rectification of defects, provided nothing is outstanding."
    : "";
  const retentionText = `retention of <b>${retPct}%</b> of each certificate, capped at <b>${retCapPct}% of the ${priceWord}</b> (released 50% on taking-over and 50% after the ${dlp}-day defects liability period)`;
  const perfCore = perfType === "na"
    ? `A separate performance security is <b>not applicable</b> to this ${isAgr ? "Agreement" : "award"}.`
    : perfType === "none"
    ? `No separate performance security is required for this ${isAgr ? "Agreement" : "award"}; your performance is secured by the retention held under the Payment clause and by our rights of set-off and back-charge.`
    : `Within ${secDays} days of ${isAgr ? "signing" : "accepting this award"} and before mobilisation, deliver ${perfInstrument}. Delivery of the performance security is a <b>condition precedent to mobilisation and to any payment</b>. We may call, date or present it — in whole or in part — to recover any amount due from you, including delay damages, back-charges, unrecovered advance, or the cost of completion by others. ${perfReturn}`;
  // Optional performance bond — same instrument choices as the performance security.
  const bondType = rec.perfBondType || "none";
  const bondPct = num(rec.performanceBondPct) || 0;
  const bondAmt = r2(a * bondPct / 100);
  const perfBondText = bondType === "guarantee"
    ? ` In addition, provide a <b>performance bond by way of an unconditional, irrevocable, on-demand bank guarantee for ${money(bondAmt)}</b> (${bondPct}% of the ${priceWord}), issued by a UAE-licensed bank in favour of ${esc(ent)}, ${perfValidity}.`
    : bondType === "cheque"
    ? ` In addition, provide a <b>performance bond by way of an undated cheque for ${money(bondAmt)}</b> (${bondPct}% of the ${priceWord}), drawn on a UAE-licensed bank in favour of ${esc(ent)}.`
    : bondType === "na"
    ? ` A performance bond is <b>not applicable</b> to this ${isAgr ? "Agreement" : "award"}.`
    : "";
  const perfClauseText = perfCore + perfBondText;
  const signImg = assets && assets.sign ? `<img src="${assets.sign}" style="height:52px;max-width:170px;object-fit:contain;display:block">` : `<div style="height:52px"></div>`;
  const stampImg = assets && assets.stamp ? `<img src="${assets.stamp}" style="height:96px;opacity:.85;object-fit:contain">` : "";
  const scopeHtml = String(rec.scope || "").split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x) => `<p style="margin:0 0 6px">${esc(x)}</p>`).join("") || "<p>As per the quotation and drawings/specifications issued.</p>";
  const clause = (n, t, body) => `<div class="cl"><div class="ct"><b>${n}. ${esc(t)}</b></div><div class="cb">${body}</div></div>`;
  const partyTbl = `<table class="pt">
    <tr><td class="k">Reference No.</td><td>${esc(rec.docNo)}</td><td class="k">Date</td><td>${dt(rec.createdAt)}</td></tr>
    <tr><td class="k">Project</td><td colspan="3">${esc(rec.project || "—")}</td></tr>
    <tr><td class="k">Location</td><td>${esc(rec.location || "—")}</td><td class="k">Client / Employer</td><td>${esc(rec.client || "—")}</td></tr>
    <tr><td class="k">Main Contractor</td><td colspan="3">${esc(ent)} (“First Party”)${entTrn ? ", TRN " + esc(entTrn) : ""}</td></tr>
    <tr><td class="k">Subcontractor</td><td colspan="3"><b>${esc(rec.supplierName)}</b>${rec.supplierTL ? " · Trade Licence " + esc(rec.supplierTL) : ""}${rec.supplierTRN ? " · TRN " + esc(rec.supplierTRN) : ""} (“Second Party”)</td></tr>
    ${(rec.supplierAttn || rec.supplierEmail) ? `<tr><td class="k">Attention / Email</td><td colspan="3">${esc(rec.supplierAttn || "—")}${rec.supplierEmail ? " · " + esc(rec.supplierEmail) : ""}</td></tr>` : ""}
    ${rec.quotationRef ? `<tr><td class="k">Based on your quotation</td><td colspan="3">Ref. ${esc(rec.quotationRef)}${rec.quotationDate ? " dated " + dt(rec.quotationDate) : ""}</td></tr>` : ""}
  </table>`;
  const advSecurity = advGuarType === "guarantee"
    ? `an <b>advance-payment guarantee equal to 100% of the advance (${money(advAmt)})</b> issued by a UAE-licensed bank, which reduces pro-rata as the advance is recovered`
    : advGuarType === "na"
    ? `<b>no separate advance security or deposit</b> (the advance is secured by the recovery mechanism and our rights of set-off below)`
    : `an <b>additional undated cheque of equal value (${money(advAmt)})</b>`;
  const advClauseText = advAmt > 0
    ? `An advance / down payment of <b>${money(advAmt)}</b> (${advPctOfAward}% of the ${priceWord}) will be paid to you against your valid tax invoice and ${advSecurity}. The advance is a <b>loan against the works</b>, not additional value, and is <b>recovered by deduction from every interim certificate at ${advRecPct}% of the certified gross</b> until fully repaid. Any unrecovered balance becomes immediately due on completion or termination, and may be recovered from sums due, retention, or the performance security.`
    : "";
  const sigBlock = `<table class="sig"><tr>
    <td><div class="sh">For and on behalf of the Main Contractor</div><div class="sn">${esc(ent)}</div>
      <div style="position:relative;margin-top:6px">${signImg}<div style="position:absolute;left:120px;top:-16px">${stampImg}</div></div>
      <div class="sl">Name: Eng. Mohammed Abuassba</div><div class="sl">Title: Chief Executive Officer</div><div class="sl">Date: ${dt(rec.createdAt)}</div><div class="sl">Company Stamp</div></td>
    <td><div class="sh">Accepted &amp; agreed — Subcontractor</div><div class="sn">${esc(rec.supplierName)}</div>
      <div style="height:58px"></div>
      <div class="sl">Name: ______________________________</div><div class="sl">Title: ______________________________</div><div class="sl">Signature: __________________________</div><div class="sl">Date: ______________  Company Stamp</div></td>
  </tr></table>`;
  // Health & safety liability sits ENTIRELY with the subcontractor/supplier — the Main
  // Contractor carries no liability for any injury, death or incident.
  const hseClause = `The ${isAgr ? "Subcontractor" : "Second Party"} is <b>solely and exclusively responsible for health and safety</b> on and around the Works, and for the safety of its personnel, its subcontractors and any person or property affected by its works. It shall comply with all UAE HSE laws, the Client's and site HSE rules, and provide PPE, method statements, risk assessments, training, inductions, competent supervision and valid workmen's compensation and third-party liability insurance. <b>${esc(ent)} (the Main Contractor) bears no liability whatsoever for any injury, illness, death, accident or incident to the ${isAgr ? "Subcontractor" : "Second Party"}'s personnel, or arising out of the ${isAgr ? "Subcontractor" : "Second Party"}'s works, acts, omissions or default.</b> The ${isAgr ? "Subcontractor" : "Second Party"} shall <b>fully indemnify and hold harmless</b> the Main Contractor and the Client against all claims, compensation, damages, fines, penalties, costs and losses (including legal costs) arising from any such injury, death or incident, or from any breach of these health &amp; safety obligations, and shall report every incident to the Main Contractor immediately.`;
  let list;
  if (!isAgr) {
    list = [
      ["Award value", `The award value is <b>${money(a)}</b> (fixed lump sum, exclusive of VAT). The price is fixed, firm and inclusive of all costs, and is not subject to any escalation. VAT will be added at the prevailing rate against a valid tax invoice.`],
      ["Scope of works", scopeHtml],
      ["Time for completion", `Commencement: within ${esc(rec.commenceDays || 7)} days of our written notice to proceed. Completion by <b>${dt(rec.completion)}</b>. Time is of the essence. Delay damages of <b>${delayDay}%</b> of the award value apply per day of delay, capped at <b>${delayCap}%</b>. We may reassign delayed or defective works to others at your cost plus 15% overhead.`],
      ["Payment", `Monthly interim payment against quantities certified by our QS, payable within <b>${payDays} days</b> of certification and receipt of a valid VAT invoice, less ${retentionText}. Submit each application by the 25th of the month with a works report and attendance signed by the MA site engineer.`],
      ...(advAmt > 0 ? [["Advance / down payment & recovery", advClauseText]] : []),
      ["Performance security", perfClauseText],
      ["Your obligations", `Maintain a valid UAE trade licence and all permits; comply with UAE Labour Law, WPS, and all HSE and site rules; hold workmen's compensation and third-party insurance; be solely responsible for your personnel and their wages and end-of-service; and replace any unsuitable personnel within 24 hours of notice. No variation or extra work is valid unless instructed by us in writing.`],
      ["Health, safety & liability for injury / incident", hseClause],
      ["Set-off, confidentiality & law", `We may deduct or back-charge from any sum due (including retention) the cost of rectification by others, supplementary labour/plant, delay damages, fines and any other amount due from you. You shall keep all project information confidential and shall not publish site photos/data without our written consent. This award is governed by the laws of the United Arab Emirates and the courts of Abu Dhabi.`],
      ["Acceptance", `Please confirm acceptance by <b>signing and stamping</b> below and returning a copy <b>within ${hrs} hours</b> of the date above, failing which this award may lapse without liability on us. Our standard Subcontract terms apply to any works commenced.`]
    ];
  } else {
    list = [
      ["Scope of works", `${scopeHtml}<p style="margin:6px 0 0">The Works include all labour, materials, plant, tools, supervision and everything necessary for proper completion in accordance with the drawings, specifications, programme and the reasonable instructions of the MA Representative. You are deemed to have inspected the site and satisfied yourself as to all conditions.</p>`],
      ["Subcontract price", `The Subcontract Price is <b>${money(a)}</b> (exclusive of VAT). Rates are fixed and firm, inclusive of all costs, overheads, profit and risks, with no escalation. VAT is added against a valid tax invoice. For re-measurable work you are paid only for quantities executed, measured and certified by the MA Representative.`],
      ["Your obligations", `Maintain a valid UAE trade licence, permits and registrations; comply with UAE Labour Law (Decree-Law 33/2021), WPS, and all visa/work-permit rules; comply with all HSE and client/site rules and provide PPE and inductions; hold and evidence workmen's compensation and third-party liability insurance; be solely liable for your personnel, wages and end-of-service; not assign or further subcontract without our written consent; and replace unsuitable personnel within 24 hours of notice.`],
      ["Performance security", perfClauseText],
      ["Payment", `Submit a detailed interim application with signed joint measurement, works report and attendance by the <b>25th</b> of each month. We certify within <b>14 days</b> and pay the certified amount, less ${retentionText} and any deductions, within <b>${payDays} days</b> of certification and receipt of your valid VAT invoice. We may withhold payment where security, insurances or documents are missing, where progress is behind due to your default, or where WPS wages are unpaid.`],
      ...(advAmt > 0 ? [["Advance / down payment & recovery", advClauseText]] : []),
      ["Time & delay", `Commence within ${esc(rec.commenceDays || 7)} days of our notice to proceed and complete by <b>${dt(rec.completion)}</b>. Time is of the essence. Extensions are granted only for our acts of prevention, instructed variations, or force majeure, and only if notified in writing within 7 days. Delay damages of <b>${delayDay}%</b> of the price per day apply, capped at <b>${delayCap}%</b>. If you fall behind, you shall recover the delay at your cost; we may also engage others to supplement, take over or reassign any part of the Works, and recover all extra cost plus 15% overhead from sums due, the retention, the performance security, or as a debt.`],
      ["Variations", `We may instruct variations in writing. You shall not execute any variation without a written instruction and have no entitlement to payment for unauthorised work. Variations are valued at the agreed rates or fair market rates agreed in writing before the work.`],
      ["Quality, defects & DLP", `All Works shall conform to the specifications, approved samples and good industry practice; materials shall be new and of the specified quality; no work shall be covered up without inspection. You shall rectify defects notified during execution or the ${dlp}-day DLP at your cost; failing which we may rectify by others and back-charge the cost plus 15%. Decennial liability applies under Articles 880–883 of the UAE Civil Code where applicable.`],
      ["Liability, indemnity & insurance", `You are responsible for the care of your Works, personnel and materials until taking-over, and shall indemnify us and the client against all claims, damage, fines and losses arising from your personnel, your damage to property, or your breach of law or this Agreement. Maintain the insurances required by law and this Agreement; failing which we may procure them and back-charge the premium.`],
      ["Health, safety & liability for injury / incident", hseClause],
      ["Default & termination", `On abandonment, insufficient progress, unremedied defects, HSE breaches, unpaid wages/WPS, insolvency, unauthorised assignment, a dishonoured cheque or a lapsed/withdrawn performance security, or any material breach, we may (after 48 hours' notice, or immediately for serious defaults) terminate in whole or part, complete the Works ourselves or through others using your on-site materials and plant, and recover all additional costs plus 15% from sums due, the cheques, or as a debt. We may also terminate for convenience on 7 days' notice, paying only for Works properly executed and certified to that date, with no loss-of-profit claim.`],
      ["Confidentiality", `You shall keep all project information, drawings, prices and documents confidential, use them only for the Works, and not publish any site photos, videos or data (including on social media) without our written consent. This obligation survives 5 years after completion or termination.`],
      ["Force majeure", `Neither party is liable for failure caused by events beyond its reasonable control (Article 273, UAE Civil Code); shortage of labour, materials or funds and normal weather are excluded. If force majeure continues beyond 60 days either party may terminate, and you are paid for Works properly executed and certified.`],
      ["Governing law & disputes", `This Agreement is governed by the federal laws of the United Arab Emirates and the laws of the Emirate of Abu Dhabi. The parties shall first attempt amicable settlement within 28 days; failing which the dispute shall be finally settled by the courts of Abu Dhabi. You shall continue the Works during any dispute.`],
      ["General & acceptance", `This Agreement and its appendices are the entire agreement and supersede all prior LPOs, quotations and correspondence; any amendment must be in writing and signed by both parties. Nothing creates any relationship between you and the client, nor any partnership or employment between the parties. Please <b>sign and stamp</b> below and return a signed copy <b>within ${hrs} hours</b> of the date above.`]
    ];
  }
  const clauses = list.map((x, i) => clause(i + 1, x[0], x[1])).join("");
  const secDocItem = perfType === "guarantee" ? "performance bank guarantee" : perfType === "cheque" ? "performance cheque" : "";
  const advDocItem = advAmt > 0 ? (advGuarType === "guarantee" ? " · advance-payment guarantee" : " · advance cheque") : "";
  const docsChecklist = isAgr ? `<div class="cl"><div class="ct"><b>Documents required before signature</b></div><div class="cb">Signed Agreement (all pages) · valid trade licence · TRN certificate · Emirates ID / passport of signatory${secDocItem ? " · " + secDocItem : ""}${advDocItem} · insurance certificates · bank details letter · manpower list with ID/visa. Missing items must be justified in writing.</div></div>` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(rec.docNo)} — ${isAgr ? "Subcontract Agreement" : "Letter of Award"}</title>
<style>
  *{box-sizing:border-box} body{font-family:"Segoe UI",Arial,sans-serif;color:#1f2733;margin:0;background:#fff;font-size:12.5px;line-height:1.5}
  .page{max-width:820px;margin:0 auto;padding:26px 34px}
  .lh{display:flex;align-items:center;gap:14px;border-bottom:3px solid #1f3864;padding-bottom:10px}
  .lh img{height:56px}
  .lh .n1{font-size:20px;font-weight:800;color:#1f3864;letter-spacing:.3px}
  .lh .n2{font-size:11px;color:#5b6472}
  .title{text-align:center;margin:14px 0 4px;font-size:17px;font-weight:800;color:#1f3864;letter-spacing:.5px}
  .sub{text-align:center;color:#7a8494;font-size:11px;margin-bottom:12px}
  table.pt{width:100%;border-collapse:collapse;margin:8px 0 14px;font-size:12px}
  table.pt td{border:1px solid #d8deea;padding:5px 9px;vertical-align:top}
  table.pt td.k{background:#f4f6fb;color:#5b6472;width:20%;font-weight:600}
  .subj{background:#1f3864;color:#fff;padding:7px 12px;border-radius:5px;font-weight:600;margin:6px 0 12px;font-size:12.5px}
  .cl{margin:0 0 9px}
  .cl .ct{color:#1f3864;margin-bottom:2px}
  .cl .cb{text-align:justify}
  table.sig{width:100%;border-collapse:collapse;margin-top:18px}
  table.sig td{width:50%;border:1px solid #c9d2e2;padding:12px 14px;vertical-align:top}
  .sh{font-size:10.5px;color:#7a8494;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
  .sn{font-weight:700;color:#1f3864}
  .sl{font-size:11px;color:#33404f;margin-top:5px}
  .note{background:#fff8e6;border-left:4px solid #bf9000;padding:9px 13px;border-radius:4px;font-size:11.5px;margin:12px 0}
  @media print{.page{max-width:none;padding:12mm}}
${MAH_CSS}
  ${MAPG_CSS}
</style></head><body><div class="page">
  ${mahHeader(cfg, ent)}
  <div class="title">${isAgr ? "SUBCONTRACT AGREEMENT" : "LETTER OF AWARD"}</div>
  <div class="sub">${isAgr ? "Subcontract / Supply Package — UAE" : "Subcontract / Supply Package — UAE"}</div>
  ${partyTbl}
  <div class="subj">Subject: ${isAgr ? "Subcontract Agreement" : "Letter of Award"} — ${esc(rec.scopeTitle || rec.project || "Works Package")}</div>
  <p>Dear Sir/Madam,</p>
  <p>${isAgr ? `This Subcontract Agreement is made between <b>${esc(ent)}</b> (the “Main Contractor”) and <b>${esc(rec.supplierName)}</b> (the “Subcontractor”) for the Works described below, on the following terms.` : `Further to your quotation and our discussions, <b>${esc(ent)}</b> (the “Main Contractor”) is pleased to award to <b>${esc(rec.supplierName)}</b> (the “Subcontractor”) the following work package, subject to the terms below.`}</p>
  ${clauses}
  ${docsChecklist}
  <div class="note"><b>Action required:</b> Please print, <b>sign and stamp</b> this document and return a scanned copy to <b>${esc(cfg && cfg.replyTo || "info@maagroup.ae")}</b> within <b>${hrs} hours</b>. Commencement of any works constitutes acceptance of these terms.</div>
  ${sigBlock}
  ${mahFooter(ent)}
</div>${MAPG_JS}</body></html>`;
}
// ---- Per-project contract terms ----
// A subcontractor can hold DIFFERENT contracts on DIFFERENT projects. Terms and the
// cumulative payment history must therefore be scoped per (supplier, project), never
// pooled on the supplier record. This key stores each contract's terms.
function supProjKey(supplierId, project) {
  return "supproj/" + String(supplierId) + "__" + String(project || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}
// A supplier's LPO rate schedule that we pre-load so the IPC only needs quantity
// selection. Keyed by a matcher on the supplier name + the LPO items + doc ref.
const LPO_RATE_SCHEDULES = [
  { match: /tarmac/i, docNo: "MAG/PO-00179", items: TARMAC_BOQ }
];
function lpoScheduleFor(sup) {
  const nm = String((sup && sup.name) || "");
  return LPO_RATE_SCHEDULES.find((x) => x.match.test(nm)) || null;
}
async function getContractTerms(s, supplierId, project) {
  let rec = null;
  try { rec = await s.get(supProjKey(supplierId, project), { type: "json" }); } catch {}
  const sup = await s.get("supplier/" + supplierId, { type: "json" }) || {};
  const sched = lpoScheduleFor(sup);
  const applySched = (out) => {
    // If this supplier has a known LPO rate schedule and no BOQ is stored yet,
    // surface the LPO items directly so the IPC shows them for selection —
    // regardless of which project key the contract was saved under.
    if (sched && !(Array.isArray(out.boq) && out.boq.length)) {
      out.boq = sched.items.map((l) => ({ ref: l.ref, description: l.description, unit: l.unit, rate: num(l.rate), qty: num(l.qty) }));
      out.contractType = "Rate";
      if (!out.docNo) out.docNo = sched.docNo;
    }
    return out;
  };
  if (rec) return applySched({
    source: "contract", supplierId, project,
    contractValue: num(rec.contractValue), advanceAmount: num(rec.advanceAmount), advanceRecoveryRate: num(rec.advanceRecoveryRate),
    retentionPct: num(rec.retentionPct), dlpMonths: num(rec.dlpMonths),
    vatPct: rec.vatPct != null ? num(rec.vatPct) : (num(sup.vatPct) || 0.05),
    contractType: rec.contractType || "Fixed", docNo: rec.docNo || "", awardId: rec.awardId || "", signDate: rec.signDate || "",
    boq: Array.isArray(rec.boq) ? rec.boq : []
  });
  return applySched({
    source: "supplier", supplierId, project,
    contractValue: num(sup.contractValue), advanceAmount: num(sup.advanceAmount), advanceRecoveryRate: num(sup.advanceRecoveryRate),
    retentionPct: num(sup.retentionPct), dlpMonths: num(sup.dlpMonths), vatPct: num(sup.vatPct) || 0.05,
    contractType: sup.contractType || (num(sup.contractValue) > 0 ? "Fixed" : "Rate"), docNo: sup.lpoRef || "", awardId: "", signDate: sup.signDate || "",
    boq: []
  });
}
// ---- Contract → Project → Payment Certificate → Expenses automation ----
// When a subcontract/LOA is signed, copy its commercial terms onto the supplier
// so every progress IPC applies advance recovery + retention automatically.
async function syncSupplierFromAward(s, award) {
  if (!award || !award.supplierId) return null;
  const sup = await s.get("supplier/" + award.supplierId, { type: "json" });
  if (!sup) return null;
  sup.contractType = "Fixed";
  sup.contractValue = num(award.amount);
  sup.advanceAmount = num(award.advanceAmount);
  sup.advanceRecoveryRate = num(award.advanceRecoveryPct) > 0 ? r2(num(award.advanceRecoveryPct) / 100) : (num(award.advanceAmount) > 0 && num(award.amount) > 0 ? r2(num(award.advanceAmount) / num(award.amount)) : 0);
  sup.retentionPct = num(award.retentionPct) > 0 ? r2(num(award.retentionPct) / 100) : num(sup.retentionPct);
  sup.dlpMonths = num(award.dlpDays) > 0 ? Math.round(num(award.dlpDays) / 30.44) : num(sup.dlpMonths);
  if (award.project) sup.project = award.project;
  if (award.entity) sup.entity = award.entity;
  sup.lpoRef = award.docNo || sup.lpoRef || "";
  sup.subcontractRef = award.docNo || sup.subcontractRef || "";
  sup.signDate = sup.signDate || now().slice(0, 10);
  if (sup.status !== "Active") sup.status = "Active";
  sup.incomplete = !(String(sup.licenseNo || "").trim() && String(sup.trn || "").trim());
  sup.updatedAt = now();
  await s.setJSON("supplier/" + sup.id, sup);
  // Authoritative per-project contract terms — this is what the IPC engine reads, so
  // each project's payments use ITS OWN contract and never another project's.
  if (award.project) {
    await s.setJSON(supProjKey(sup.id, award.project), {
      supplierId: sup.id, project: award.project, awardId: award.id, docNo: award.docNo,
      contractType: "Fixed", contractValue: num(award.amount), advanceAmount: num(award.advanceAmount),
      advanceRecoveryRate: sup.advanceRecoveryRate, retentionPct: sup.retentionPct, dlpMonths: sup.dlpMonths,
      vatPct: num(sup.vatPct) || 0.05, entity: award.entity || sup.entity || "", signDate: sup.signDate,
      createdAt: now(), updatedAt: now()
    });
  }
  return sup;
}
// Create the down-payment (advance) certificate against a signed contract. It is a
// recoverable prepayment: paid to the sub via the normal approve→pay→cheque→bank
// flow, posted to the project at cost 0 (prepayment), recovered by progress IPCs.
async function createAdvanceCertFromAward(s, award, sup, me) {
  if (num(award.advanceAmount) <= 0) return { skipped: "no-advance" };
  if (award.advanceCertNo) {
    const ex = await s.get("cert/" + award.advanceCertNo, { type: "json" });
    if (ex) return { existing: ex };
  }
  const st = await s.get("settings", { type: "json" });
  const project = award.project || sup.project || "";
  const entity = award.entity || sup.entity || (st.entities[0] && st.entities[0].short) || "";
  let maxSeq = st.seq || 0;
  const { blobs } = await s.list({ prefix: "cert/" });
  for (const bl of blobs) { const ec = await s.get(bl.key, { type: "json" }); if (ec && (ec.seq || 0) > maxSeq) maxSeq = ec.seq; }
  let seq = maxSeq + 1;
  let no = certNo(project, sup.name, seq, st.projects) + "-ADV";
  let guard = 0;
  while (await s.get("cert/" + no) && guard++ < 50) { seq++; no = certNo(project, sup.name, seq, st.projects) + "-ADV"; }
  st.seq = seq;
  const cert = {
    no, seq, kind: "advance", createdBy: me.id, createdAt: now(), date: now().slice(0, 10),
    entity, project, supplierId: sup.id, supplier: sup.name, lpoRef: award.docNo || sup.lpoRef || "",
    awardId: award.id, awardDocNo: award.docNo, invoiceNo: "",
    trade: sup.trade || sup.category || "", periodFrom: "", periodTo: "",
    originalValue: num(award.amount), basis: "advance",
    invoiceAmount: num(award.advanceAmount), variations: 0, workPct: 0, materialsOnSite: 0,
    retentionPct: 0, contra: 0, vatPct: num(sup.vatPct) || 0.05,
    notes: `Down payment / advance against ${award.docNo}`, status: "Draft", payment: null,
    audit: [{ at: now(), by: me.name, action: "Advance / down payment created from signed contract " + award.docNo }]
  };
  await recompute(cert, sup);
  await s.setJSON("cert/" + no, cert);
  await s.setJSON("settings", st);
  try { await upsertCertExpense(s, cert); } catch (e) {}
  award.advanceCertNo = no;
  return { created: cert };
}
var api_default = async (req, context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/, "");
  const s = store();
  const { settings, users } = await ensureInit();
  if (path === "login" && req.method === "POST") {
    const { userId: userId2, pin } = await req.json();
    const u = users.find((x) => x.id === userId2);
    if (u && u.active === false) return err("This account is deactivated — contact the CEO", 403);
    // Brute-force protection: a 4–8 digit PIN is small enough to guess, so
    // throttle failed attempts per user. Lenient window that auto-expires —
    // real users are never locked out for long, but an attacker cannot spray.
    const LK_MAX = 8, LK_WINDOW_MS = 15 * 60 * 1e3, LK_LOCK_MS = 15 * 60 * 1e3;
    const lkKey = "authlock/" + String(userId2 || "unknown").replace(/[^A-Za-z0-9_-]/g, "_");
    let lk = null;
    try { lk = await s.get(lkKey, { type: "json" }); } catch {}
    const tnow = Date.now();
    if (lk && lk.lockUntil && lk.lockUntil > tnow) {
      const mins = Math.ceil((lk.lockUntil - tnow) / 6e4);
      return err(`Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`, 429);
    }
    if (!u || hashPin(String(pin || ""), u.salt) !== u.pinHash) {
      try {
        // Reset the counter if the window has elapsed since the first failure.
        if (!lk || !lk.firstAt || tnow - lk.firstAt > LK_WINDOW_MS) lk = { fails: 0, firstAt: tnow, lockUntil: 0 };
        lk.fails = num(lk.fails) + 1;
        if (lk.fails >= LK_MAX) { lk.lockUntil = tnow + LK_LOCK_MS; lk.fails = 0; lk.firstAt = tnow; }
        await s.setJSON(lkKey, lk);
      } catch {}
      return err("Wrong PIN", 401);
    }
    try { if (lk) await s.delete(lkKey); } catch {}
    return json({ token: await makeToken(u.id), user: { id: u.id, name: u.name, role: u.role, title: u.title || "", mustChangePin: !!u.mustChangePin } });
  }
  if (path === "userlist") return json(users.filter((u) => u.active !== false).map((u) => ({ id: u.id, name: u.name, role: u.role })));
  // Public picture for a marketing post: Meta / LinkedIn fetch it by URL when
  // publishing. Guarded by the post's random key, no login involved.
  if (path.startsWith("mkt/media/") && req.method === "GET") {
    const [, , pid, idx] = path.split("/");
    const p = await s.get("mkt/post/" + pid, { type: "json" });
    if (!p || !p.mediaKey || url.searchParams.get("k") !== p.mediaKey) return err("Not found", 404);
    const m = (p.media || [])[+idx || 0]; if (!m || !m.data) return err("Not found", 404);
    const buf = Buffer.from(String(m.data).split(",").pop(), "base64");
    return new Response(buf, { headers: { "content-type": m.type || "image/jpeg", "cache-control": "public, max-age=86400", "content-length": String(buf.length) } });
  }
  // Scheduled publishing runner (called by cron-mkt every 15 min with the shared key).
  if (path === "mkt/run-scheduled") {
    const k = process.env.CRON_KEY || "";
    if (!k || (req.headers.get("x-cron-key") || url.searchParams.get("k")) !== k) return err("Forbidden", 403);
    try { return json({ ok: true, ran: await runScheduledPosts(s) }); } catch (e) { return err(e.message, 500); }
  }
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
  if (path === "policy" && req.method === "GET") {
    return json({ version: POLICY_VERSION, text: CONFIDENTIALITY_POLICY, accepted: await hasAcceptedPolicy(s, me.id) });
  }
  if (path === "policy/accept" && req.method === "POST") {
    const b = await req.json();
    const signature = String(b.signature || "").trim();
    if (signature.length < 3) return err("Please type your full name to sign");
    const rec = {
      userId: me.id, name: me.name, role: me.role, signature,
      version: POLICY_VERSION, acceptedAt: now(),
      ip: req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "",
      ua: (req.headers.get("user-agent") || "").slice(0, 200)
    };
    // Notify the CEO with the signed acknowledgement, and send the signer their own copy.
    try {
      const cfg = await getEmailCfg(s);
      const r = await notify(s, "policyack", { to: cfg.adminEmail, forCeo: true, ack: rec });
      if (r && r.status !== "error") rec.ceoNotified = now();
      if (me.email) await notify(s, "policyack", { to: me.email, forCeo: false, ack: rec });
    } catch (e) { }
    await s.setJSON("policyack/" + me.id, rec);
    return json({ ok: true });
  }
  if (path === "policy/register" && req.method === "GET") {
    if (!can("admin")) return err("CEO only", 403);
    const acks = await getAllJSON(s, "policyack/");
    acks.sort((a, b) => a.acceptedAt < b.acceptedAt ? 1 : -1);
    // Auto-push to the CEO any signed acknowledgement not yet emailed (e.g. signed
    // before on-accept email existed). Sent once, then flagged to avoid duplicates.
    let pushed = 0;
    try {
      const cfg = await getEmailCfg(s);
      for (const ack of acks) {
        if (ack.ceoNotified) continue;
        const r = await notify(s, "policyack", { to: cfg.adminEmail, forCeo: true, ack });
        if (r && r.status !== "error") {
          ack.ceoNotified = now();
          await s.setJSON("policyack/" + ack.userId, ack);
          pushed++;
        }
      }
    } catch (e) { }
    return json({ version: POLICY_VERSION, acks, pushed });
  }
  if (path === "policy/resend" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const b = await req.json().catch(() => ({}));
    const cfg = await getEmailCfg(s);
    let acks = await getAllJSON(s, "policyack/");
    if (b.userId) acks = acks.filter((a) => a.userId === b.userId);
    if (!acks.length) return err("No signed acknowledgement found", 404);
    const sent = [];
    for (const ack of acks) {
      const rec = await notify(s, "policyack", { to: cfg.adminEmail, forCeo: true, ack });
      sent.push({ userId: ack.userId, name: ack.name, status: rec?.status || "sent" });
    }
    return json({ ok: true, to: cfg.adminEmail, count: sent.length, sent });
  }
  const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(e || "").trim());
  if (path === "announcement/recipients" && req.method === "GET") {
    if (!can("announce")) return err("Announcements: CEO / HR / Marketing only", 403);
    const sups = await listSuppliers();
    const active = sups.filter((x) => !x.status || x.status === "Active");
    const withEmail = active.filter((x) => validEmail(x.email));
    return json({ total: sups.length, active: active.length, withEmail: withEmail.length, missingEmail: active.length - withEmail.length });
  }
  if (path === "announcement/list" && req.method === "GET") {
    if (!can("announce")) return err("Announcements: CEO / HR / Marketing only", 403);
    const items = await getAllJSON(s, "announcement/");
    items.sort((a, b) => a.sentAt < b.sentAt ? 1 : -1);
    return json({ items });
  }
  if (path === "announcement/send" && req.method === "POST") {
    if (!can("announce")) return err("Announcements: CEO / HR / Marketing only", 403);
    const b = await req.json();
    const category = String(b.category || "General Information").trim();
    const subject = String(b.subject || "").trim();
    const body = String(b.body || "").trim();
    if (subject.length < 3) return err("Please enter a subject line");
    if (body.length < 5) return err("Please enter the announcement message");
    const cfg = await getEmailCfg(s);
    // Test send: goes only to the CEO/admin inbox for preview.
    if (b.test) {
      const t = buildEmail("announcement", { to: cfg.adminEmail, category, subject, body }, cfg);
      const r = await sendMail(s, cfg, { type: "announcement", to: t.to, toName: t.toName, subject: "[TEST] " + t.subject, html: t.html });
      return json({ ok: true, test: true, to: cfg.adminEmail, status: r.status });
    }
    const sups = await listSuppliers();
    const emails = [...new Set(sups.filter((x) => (!x.status || x.status === "Active") && validEmail(x.email)).map((x) => x.email.trim()))];
    if (!emails.length) return err("No suppliers/subcontractors with a valid email were found", 400);
    // Batch the BCC so recipients never see one another and SMTP limits are respected.
    const CHUNK = 50;
    let delivered = 0, groups = 0, lastStatus = "";
    for (let i = 0; i < emails.length; i += CHUNK) {
      const grp = emails.slice(i, i + CHUNK);
      const t = buildEmail("announcement", { to: cfg.from, toName: "MA Group Partners", greeting: "Valued Partner", category, subject, body, bcc: grp }, cfg);
      const r = await sendMail(s, cfg, { type: "announcement", to: t.to, toName: t.toName, subject: t.subject, html: t.html, bcc: grp });
      if (r.status === "sent" || r.status === "logged") delivered += grp.length;
      lastStatus = r.status; groups++;
    }
    const id = "ANN" + Date.now().toString(36) + randomBytes(2).toString("hex");
    const recA = { id, category, subject, body, sentAt: now(), sentBy: me.name, recipientCount: delivered, totalTargets: emails.length, autoNew: b.autoNew !== false, lastStatus };
    await s.setJSON("announcement/" + id, recA);
    return json({ ok: true, id, recipientCount: delivered, totalTargets: emails.length, groups, lastStatus });
  }
  // ============ PROCUREMENT: vendor directory ============
  if (path === "pvendors" && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    let items = await getAllJSON(s, "pvendor/");
    // Grow the directory with the supplier registry. Gated on supplier count so
    // steady-state loads are cheap; a full mirror runs when suppliers were added.
    try {
      const supKeys = (await s.list({ prefix: "supplier/" })).blobs;
      const stg = await s.get("settings", { type: "json" });
      if (num(stg.dirSyncSupCount) !== supKeys.length) {
        const sups = await getAllJSON(s, "supplier/");
        const ctx = { items, stg };
        for (const sup of sups) { try { await dirUpsertFromSupplier(s, sup, ctx); } catch (e) {} }
        stg.dirSyncSupCount = supKeys.length;
        await s.setJSON("settings", stg);
        items = ctx.items;
      }
    } catch (e) {}
    items.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    return json({ items, trades: PROC_TRADES });
  }
  if (path === "procurement/meta" && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    const items = await getAllJSON(s, "pvendor/");
    const byTrade = {};
    for (const v of items) {
      const t = v.trade || "General Trading / Materials";
      byTrade[t] = byTrade[t] || { trade: t, total: 0, withEmail: 0 };
      byTrade[t].total++;
      if (validEmail(v.email)) byTrade[t].withEmail++;
    }
    const trades = PROC_TRADES.map((t) => byTrade[t] || { trade: t, total: 0, withEmail: 0 }).filter((x) => x.total > 0);
    return json({ trades, total: items.length, withEmail: items.filter((v) => validEmail(v.email)).length });
  }
  {
    const m = path.match(/^pvendor\/([^/]+)\/register$/);
    if (m && req.method === "POST") {
      if (!can("create") && !can("contracts") && !can("procurement")) return err("Not permitted", 403);
      const pv = await s.get("pvendor/" + decodeURIComponent(m[1]), { type: "json" });
      if (!pv) return err("Vendor not found", 404);
      let project = ""; try { const b = await req.json(); project = String(b.project || ""); } catch (e) {}
      const prom = await promoteVendorToSupplier(s, pv, { project, by: me.name, note: "Registered from procurement directory. Complete TL, TRN and bank details before payment." });
      return json({ ok: true, supplierId: prom.supplierId, supplierName: prom.supplier.name });
    }
  }
  if (path === "pvendor" && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const b = await req.json();
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    const ex = id ? await s.get("pvendor/" + id, { type: "json" }) : null;
    if (!id) { id = await nextId(s, stg, "pvendorSeq", "PV", "pvendor/", 4); await s.setJSON("settings", stg); }
    const str = (k) => b[k] === void 0 ? ex?.[k] || "" : String(b[k] || "");
    if (!str("name").trim()) return err("Vendor name is required");
    const v = {
      id, seq: ex?.seq || (Number(String(id).replace(/\D/g, "")) || 0),
      name: str("name").trim(), trade: str("trade") || "General Trading / Materials", specialty: str("specialty"),
      contactName: str("contactName"), phone: str("phone"), whatsapp: str("whatsapp"), email: str("email").trim(),
      website: str("website"), emirate: str("emirate"), type: str("type") || "Supplier",
      status: str("status") || "Active", rating: b.rating === void 0 ? num(ex?.rating) : num(b.rating),
      notes: str("notes"), supplierId: ex?.supplierId || "", source: ex?.source || "manual",
      createdAt: ex?.createdAt || now(), createdBy: ex?.createdBy || me.name, updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("pvendor/" + id, v);
    return json(v);
  }
  const pvDel = path.match(/^pvendor\/([^/]+)$/);
  if (pvDel && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    await s.delete("pvendor/" + decodeURIComponent(pvDel[1])).catch(() => {});
    return json({ ok: true });
  }

  // ============ PROCUREMENT: RFQ / inquiry ============
  if (path === "rfqs" && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    const items = (await getAllJSON(s, "rfq/")).map((r) => ({ ...r, files: (r.files || []).map((f) => ({ idx: f.idx, name: f.name, size: f.size })) }));
    items.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    return json({ items });
  }
  if (path === "rfq" && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const b = await req.json();
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    const ex = id ? await s.get("rfq/" + id, { type: "json" }) : null;
    if (ex && (ex.status === "Awarded" || ex.status === "Cancelled")) return err("This RFQ is " + ex.status.toLowerCase() + " and can no longer be edited", 400);
    let rfqNo = ex?.rfqNo;
    if (!id) {
      const seqv = await nextId(s, stg, "rfqSeq", "R", "rfq/", 3);
      id = seqv;
      const yr = String(now()).slice(0, 4);
      rfqNo = "MA-RFQ-" + yr + "/" + String(stg.rfqSeq).padStart(3, "0");
      await s.setJSON("settings", stg);
    }
    const entObj = (stg.entities || []).find((e) => e.short === b.entity) || (stg.entities || [])[0] || { name: "MA Group – Marvellous Art LLC" };
    const rec = {
      id, rfqNo, status: ex?.status || "Draft",
      project: String(b.project || ex?.project || "").trim(), trade: String(b.trade || ex?.trade || ""),
      scopeTitle: String(b.scopeTitle || ex?.scopeTitle || "").trim(), scope: String(b.scope || ex?.scope || ""),
      requirements: String(b.requirements ?? ex?.requirements ?? ""),
      dueDate: String(b.dueDate || ex?.dueDate || ""), siteVisit: String(b.siteVisit ?? ex?.siteVisit ?? ""),
      deliveryTerms: String(b.deliveryTerms ?? ex?.deliveryTerms ?? ""), notes: String(b.notes ?? ex?.notes ?? ""),
      entity: entObj.short || "", entityName: entObj.name || "MA Group – Marvellous Art LLC", entityTRN: entityTRN(entObj),
      location: String(b.location ?? ex?.location ?? ""),
      vendorIds: Array.isArray(b.vendorIds) ? b.vendorIds.map(String) : (ex?.vendorIds || []),
      files: ex?.files || [], quotes: ex?.quotes || [],
      sentAt: ex?.sentAt || "", sentBy: ex?.sentBy || "", sentCount: ex?.sentCount || 0, callList: ex?.callList || [],
      awardedVendorId: ex?.awardedVendorId || "", awardedSupplierId: ex?.awardedSupplierId || "", awardedAmount: ex?.awardedAmount || 0,
      createdAt: ex?.createdAt || now(), createdBy: ex?.createdBy || me.name, updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("rfq/" + id, rec);
    return json({ ...rec, files: rec.files.map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  const rfqGet = path.match(/^rfq\/([^/]+)$/);
  if (rfqGet && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + decodeURIComponent(rfqGet[1]), { type: "json" });
    if (!rec) return err("Not found", 404);
    return json({ ...rec, files: (rec.files || []).map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  if (rfqGet && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    const rec = await s.get("rfq/" + decodeURIComponent(rfqGet[1]), { type: "json" });
    if (rec) { for (const f of rec.files || []) { try { await s.delete("rfqfile/" + rec.id + "/" + f.idx); } catch {} } }
    await s.delete("rfq/" + decodeURIComponent(rfqGet[1])).catch(() => {});
    return json({ ok: true });
  }
  const rfqAttach = path.match(/^rfq\/([^/]+)\/attach$/);
  if (rfqAttach && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqAttach[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const b = await req.json();
    const data = String(b.data || "");
    const b64 = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
    const approxBytes = Math.floor(b64.length * 3 / 4);
    if (approxBytes > 7 * 1024 * 1024) return err("File too large — max 7 MB per attachment. For large drawing sets, share a cloud link in the scope instead.", 400);
    const totalExisting = (rec.files || []).reduce((a, f) => a + num(f.size), 0);
    if (totalExisting + approxBytes > 22 * 1024 * 1024) return err("Total attachments would exceed 22 MB — remove a file or share a link for large sets.", 400);
    const idx = (rec.files || []).reduce((m, f) => Math.max(m, f.idx), 0) + 1;
    await s.setJSON("rfqfile/" + rec.id + "/" + idx, { name: String(b.name || "attachment"), type: String(b.type || "application/octet-stream"), b64 });
    rec.files = rec.files || [];
    rec.files.push({ idx, name: String(b.name || "attachment"), size: approxBytes, type: String(b.type || "application/octet-stream") });
    rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, files: rec.files.map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  const rfqFile = path.match(/^rfqfile\/([^/]+)\/(\d+)$/);
  if (rfqFile && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    const f = await s.get("rfqfile/" + rfqFile[1] + "/" + rfqFile[2], { type: "json" });
    if (!f) return err("Not found", 404);
    const buf = Buffer.from(f.b64, "base64");
    return new Response(buf, { headers: { "content-type": f.type || "application/octet-stream", "content-disposition": `inline; filename="${String(f.name || "file").replace(/[^\w.\- ]+/g, "_")}"` } });
  }
  const rfqFileDel = path.match(/^rfq\/([^/]+)\/file\/(\d+)$/);
  if (rfqFileDel && req.method === "DELETE") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqFileDel[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    await s.delete("rfqfile/" + rec.id + "/" + rfqFileDel[2]).catch(() => {});
    rec.files = (rec.files || []).filter((f) => String(f.idx) !== rfqFileDel[2]);
    rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, files: rec.files.map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  const rfqHtml = path.match(/^rfq\/([^/]+)\/html$/);
  if (rfqHtml && req.method === "GET") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqHtml[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const cfg = await getEmailCfg(s);
    return new Response(buildRfqHtml(rec, cfg, null), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const rfqSend = path.match(/^rfq\/([^/]+)\/send$/);
  if (rfqSend && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqSend[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    if (!rec.scopeTitle && !rec.scope) return err("Add a scope title / requirements before sending");
    if (!(rec.vendorIds || []).length) return err("Select at least one vendor to send the inquiry to");
    let b = {}; try { b = await req.json(); } catch {}
    // Optional targeted send: email only these vendor id(s) — used when a vendor
    // replies with their email after a WhatsApp inquiry, so we don't re-blast everyone.
    const only = Array.isArray(b.only) ? b.only.map(String) : null;
    const cfg = await getEmailCfg(s);
    const attachments = [];
    for (const f of rec.files || []) {
      const blob = await s.get("rfqfile/" + rec.id + "/" + f.idx, { type: "json" });
      if (blob && blob.b64) attachments.push({ filename: f.name, content: blob.b64, encoding: "base64", contentType: f.type || "application/octet-stream" });
    }
    // Current vendor records for every vendor on the RFQ (email may have changed).
    const allVendors = [];
    for (const vid of rec.vendorIds) { const v = await s.get("pvendor/" + vid, { type: "json" }); if (v) allVendors.push(v); }
    const targets = only ? allVendors.filter((v) => only.includes(v.id)) : allVendors;
    const subject = `Request for Quotation — ${rec.rfqNo}${rec.project ? " — " + rec.project : ""}${rec.dueDate ? " — reply by " + emDate(rec.dueDate) : ""}`;
    let sent = 0; let lastStatus = "";
    if (only) {
      // Targeted single-vendor send (e.g. after a WhatsApp email capture):
      // addressed personally, one recipient, no privacy concern.
      for (const v of targets) {
        if (validEmail(v.email)) {
          const html = buildRfqHtml(rec, cfg, v);
          const r = await sendMail(s, cfg, { type: "rfq", to: v.email.trim(), toName: v.contactName || v.name, subject, html, attachments });
          if (r.status === "sent" || r.status === "logged") sent++;
          lastStatus = r.status;
        }
      }
    } else {
      // Full inquiry: one email with every selected vendor in BCC, so no vendor
      // can see another vendor's email address. Batched to respect SMTP limits.
      const emails = [...new Set(allVendors.filter((v) => validEmail(v.email)).map((v) => v.email.trim()))];
      if (!emails.length) return err("None of the selected vendors have an email — use the WhatsApp / call list instead", 400);
      const html = buildRfqHtml(rec, cfg, null);
      const CHUNK = 50;
      for (let i = 0; i < emails.length; i += CHUNK) {
        const grp = emails.slice(i, i + CHUNK);
        const r = await sendMail(s, cfg, { type: "rfq", to: cfg.from, toName: "MA Group Procurement", subject, html, attachments, bcc: grp });
        if (r.status === "sent" || r.status === "logged") sent += grp.length;
        lastStatus = r.status;
      }
    }
    // Recompute the call list from ALL vendors' current email status, so anyone
    // who has since given an email automatically drops off it.
    const callList = allVendors.filter((v) => !validEmail(v.email)).map((v) => ({ id: v.id, name: v.name, phone: v.phone || "", whatsapp: v.whatsapp || "", trade: v.trade || "" }));
    // Copy to the CEO/admin for the record (full blast only).
    if (!only) { try { const html = buildRfqHtml(rec, cfg, null); await sendMail(s, cfg, { type: "rfq", to: cfg.adminEmail, toName: "MA Group", subject: "[COPY] " + subject, html, attachments }); } catch (e) {} }
    rec.sentAt = now(); rec.sentBy = me.name;
    rec.sentCount = only ? num(rec.sentCount) + sent : sent;
    rec.callList = callList; rec.lastStatus = lastStatus;
    if (rec.status === "Draft") rec.status = "Sent";
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, sent, emailed: sent, callList, totalVendors: allVendors.length });
  }
  const rfqWa = path.match(/^rfq\/([^/]+)\/wa-mark$/);
  if (rfqWa && req.method === "POST") {
    // Record that a WhatsApp inquiry was issued to a vendor (for tracking only).
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqWa[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const b = await req.json();
    const vid = String(b.vendorId || "");
    rec.waSent = rec.waSent || [];
    if (vid && !rec.waSent.includes(vid)) rec.waSent.push(vid);
    if (rec.status === "Draft") rec.status = "Sent";
    rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, waSent: rec.waSent });
  }
  const rfqQuote = path.match(/^rfq\/([^/]+)\/quote$/);
  if (rfqQuote && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqQuote[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const b = await req.json();
    const vid = String(b.vendorId || "");
    if (!vid) return err("Vendor is required");
    const v = await s.get("pvendor/" + vid, { type: "json" });
    rec.quotes = rec.quotes || [];
    let q = rec.quotes.find((x) => x.vendorId === vid);
    if (!q) { q = { vendorId: vid, vendorName: v?.name || String(b.vendorName || ""), createdAt: now() }; rec.quotes.push(q); }
    q.vendorName = v?.name || q.vendorName;
    q.amount = num(b.amount); q.vatIncl = !!b.vatIncl; q.leadTime = String(b.leadTime || ""); q.validity = String(b.validity || "");
    q.paymentTerms = String(b.paymentTerms || ""); q.notes = String(b.notes || "");
    q.status = String(b.status || q.status || "Received"); q.updatedAt = now(); q.by = me.name;
    if (b.remove) rec.quotes = rec.quotes.filter((x) => x.vendorId !== vid);
    if (rec.status === "Sent" || rec.status === "Draft") rec.status = "Quoting";
    rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ...rec, files: (rec.files || []).map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  /* ---------- Technical & commercial evaluation (pre-award) ----------
     Stored on the RFQ as rec.eval. Weighted-criteria scoring per vendor plus a
     mandatory prequalification (pass/fail) gate and a normalised commercial
     comparison, producing a ranked comparison sheet and a recommendation that
     must be approved before the award is raised. */
  const rfqEval = path.match(/^rfq\/([^/]+)\/eval$/);
  if (rfqEval && req.method === "POST") {
    if (!can("procurement")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + decodeURIComponent(rfqEval[1]), { type: "json" });
    if (!rec) return err("Not found", 404);
    const b = await req.json();
    const ex = rec.eval || null;
    if (ex && ex.status === "Approved" && !can("admin")) return err("Evaluation approved — locked", 403);
    const criteria = Array.isArray(b.criteria) ? b.criteria.filter((c) => c && String(c.label || "").trim()).map((c, i) => ({
      key: String(c.key || "c" + i), label: String(c.label || ""), section: c.section === "commercial" ? "commercial" : "technical",
      weight: num(c.weight), auto: !!c.auto
    })) : (ex?.criteria || []);
    const totW = r2(criteria.reduce((a, c) => a + num(c.weight), 0));
    if (criteria.length && Math.abs(totW - 100) > 0.01) return err(`Criteria weights must total 100% — currently ${totW}%`);
    const vendors = Array.isArray(b.vendors) ? b.vendors.map((v) => ({
      vendorId: String(v.vendorId || ""), vendorName: String(v.vendorName || ""),
      quoted: num(v.quoted), discount: num(v.discount), adjustment: num(v.adjustment),
      evaluated: r2(num(v.quoted) - num(v.discount) + num(v.adjustment)),
      vatIncl: !!v.vatIncl, leadTime: String(v.leadTime || ""), validity: String(v.validity || ""),
      paymentTerms: String(v.paymentTerms || ""), qualifications: String(v.qualifications || ""),
      excluded: !!v.excluded, excludeReason: String(v.excludeReason || ""),
      prequal: (v.prequal && typeof v.prequal === "object") ? v.prequal : {},
      scores: (v.scores && typeof v.scores === "object") ? v.scores : {}
    })).filter((v) => v.vendorId) : (ex?.vendors || []);
    // Auto price score: lowest compliant evaluated price scores 10, others pro-rata.
    const live = vendors.filter((v) => !v.excluded && v.evaluated > 0);
    const lowest = live.length ? Math.min(...live.map((v) => v.evaluated)) : 0;
    for (const v of vendors) {
      for (const c of criteria) if (c.auto) v.scores[c.key] = (!v.excluded && v.evaluated > 0 && lowest > 0) ? r2(10 * lowest / v.evaluated) : 0;
      const prequalFail = Object.values(v.prequal || {}).some((x) => x === "fail");
      v.prequalPassed = !prequalFail;
      v.weighted = v.excluded ? 0 : r2(criteria.reduce((a, c) => a + num(v.scores[c.key]) / 10 * num(c.weight), 0));
      v.commercialScore = r2(criteria.filter((c) => c.section === "commercial").reduce((a, c) => a + num(v.scores[c.key]) / 10 * num(c.weight), 0));
      v.technicalScore = r2(criteria.filter((c) => c.section === "technical").reduce((a, c) => a + num(v.scores[c.key]) / 10 * num(c.weight), 0));
      v.varianceVsLowest = lowest > 0 && v.evaluated > 0 ? r2(v.evaluated - lowest) : 0;
      v.variancePct = lowest > 0 && v.evaluated > 0 ? r2((v.evaluated - lowest) / lowest * 100) : 0;
    }
    const ranked = vendors.filter((v) => !v.excluded).slice().sort((a, b2) => b2.weighted - a.weighted);
    ranked.forEach((v, i) => { v.rank = i + 1; });
    vendors.filter((v) => v.excluded).forEach((v) => { v.rank = 0; });
    const recommendedId = String(b.recommendedVendorId || (ranked[0] ? ranked[0].vendorId : ""));
    const recV = vendors.find((v) => v.vendorId === recommendedId);
    const lowestV = live.slice().sort((a, b2) => a.evaluated - b2.evaluated)[0];
    const notLowest = !!(recV && lowestV && recV.vendorId !== lowestV.vendorId);
    if (notLowest && !String(b.notLowestJustification || ex?.notLowestJustification || "").trim())
      return err("The recommended bidder is not the lowest — a written justification is mandatory before approval");
    rec.eval = {
      criteria, vendors,
      budget: num(b.budget), budgetRef: String(b.budgetRef ?? ex?.budgetRef ?? ""),
      basis: String(b.basis ?? ex?.basis ?? ""), openedAt: String(b.openedAt ?? ex?.openedAt ?? ""),
      recommendedVendorId: recommendedId, recommendedName: recV?.vendorName || "",
      recommendedAmount: recV ? recV.evaluated : 0,
      notLowest, notLowestJustification: String(b.notLowestJustification ?? ex?.notLowestJustification ?? ""),
      recommendation: String(b.recommendation ?? ex?.recommendation ?? ""),
      conditions: String(b.conditions ?? ex?.conditions ?? ""),
      lowestEvaluated: lowest, savingVsBudget: num(b.budget) > 0 && recV ? r2(num(b.budget) - recV.evaluated) : 0,
      status: ex?.status === "Approved" && !b.reopen ? "Approved" : (ex?.status || "Draft"),
      preparedBy: ex?.preparedBy || me.name, preparedAt: ex?.preparedAt || now(),
      approvedBy: ex?.approvedBy || "", approvedAt: ex?.approvedAt || "",
      updatedBy: me.name, updatedAt: now()
    };
    rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ...rec, files: (rec.files || []).map((f) => ({ idx: f.idx, name: f.name, size: f.size })) });
  }
  const rfqEvalSt = path.match(/^rfq\/([^/]+)\/eval\/status$/);
  if (rfqEvalSt && req.method === "POST") {
    const rec = await s.get("rfq/" + decodeURIComponent(rfqEvalSt[1]), { type: "json" });
    if (!rec || !rec.eval) return err("No evaluation on this inquiry", 404);
    const b = await req.json(); const a = String(b.action || "");
    if (a === "approve") {
      if (!can("admin")) return err("CEO approval only", 403);
      if (!rec.eval.recommendedVendorId) return err("Select the recommended bidder first");
      rec.eval.status = "Approved"; rec.eval.approvedBy = me.name; rec.eval.approvedAt = now();
    } else if (a === "reopen") {
      if (!can("admin")) return err("CEO only", 403);
      if (rec.status === "Awarded") return err("Already awarded — the evaluation is part of the award record");
      rec.eval.status = "Draft"; rec.eval.approvedBy = ""; rec.eval.approvedAt = "";
    } else return err("Unknown action");
    rec.eval.updatedBy = me.name; rec.eval.updatedAt = now(); rec.updatedAt = now();
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, eval: rec.eval });
  }
  const rfqAward = path.match(/^rfq\/([^/]+)\/award$/);
  if (rfqAward && req.method === "POST") {
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("rfq/" + rfqAward[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const b = await req.json();
    const vid = String(b.vendorId || "");
    const q = (rec.quotes || []).find((x) => x.vendorId === vid);
    if (!q) return err("Record the winning vendor's quote first");
    // Governance: with competing quotes the selection must rest on an approved
    // evaluation. A deviation from the recommended bidder is allowed only with a
    // recorded reason (kept on the award record for audit).
    const liveQ = (rec.quotes || []).filter((x) => num(x.amount) > 0);
    if (liveQ.length >= 2 && !(rec.eval && rec.eval.status === "Approved") && !b.skipEval)
      return err("NO_EVAL: Complete and approve the technical & commercial evaluation before awarding (Procurement → Evaluation).");
    if (rec.eval && rec.eval.status === "Approved" && rec.eval.recommendedVendorId && rec.eval.recommendedVendorId !== vid) {
      if (!String(b.deviationReason || "").trim())
        return err("DEVIATION: The approved evaluation recommends " + (rec.eval.recommendedName || "another bidder") + ". Awarding a different bidder requires a recorded reason.");
      rec.awardDeviationReason = String(b.deviationReason);
    }
    const pv = await s.get("pvendor/" + vid, { type: "json" });
    if (!pv) return err("Vendor not found", 404);
    // Promote the directory vendor into the finance supplier registry (for LOA/PC),
    // importing all held data so missing fields can be completed before payment.
    const prom = await promoteVendorToSupplier(s, pv, { project: rec.project || "", status: "Active", by: me.name, note: "Awarded via procurement RFQ " + rec.rfqNo + ". Complete TL, TRN and bank details before payment." });
    const supplierId = prom.supplierId, sup = prom.supplier;
    if (num(q.rating)) { pv.rating = num(q.rating); pv.updatedAt = now(); await s.setJSON("pvendor/" + pv.id, pv); }
    for (const x of rec.quotes) x.status = x.vendorId === vid ? "Accepted" : (x.status === "Accepted" ? "Received" : x.status);
    rec.status = "Awarded"; rec.awardedVendorId = vid; rec.awardedSupplierId = supplierId; rec.awardedAmount = num(q.amount);
    rec.updatedAt = now(); rec.awardedAt = now(); rec.awardedBy = me.name;
    await s.setJSON("rfq/" + rec.id, rec);
    return json({ ok: true, supplierId, supplierName: sup.name, amount: num(q.amount), project: rec.project, scope: rec.scope || rec.scopeTitle });
  }

  if (path === "award/threshold" && req.method === "GET") {
    return json({ threshold: awardThreshold(settings) });
  }
  if (path === "award/generate" && req.method === "POST") {
    if (!can("contracts")) return err("Not permitted", 403);
    const b = await req.json();
    const sup = await s.get("supplier/" + b.supplierId, { type: "json" });
    if (!sup) return err("Supplier not found", 404);
    const amount = num(b.amount);
    if (amount <= 0) return err("Enter the award / quotation amount");
    const type = awardTypeFor(amount, settings);
    const entObj = (settings.entities || []).find((e) => e.short === b.entity) || (settings.entities || [])[0] || { name: "MA Group – Marvellous Art LLC" };
    const yr = String(now()).slice(0, 4);
    settings.awardSeq = (num(settings.awardSeq) || 0) + 1;
    const seq = String(settings.awardSeq).padStart(3, "0");
    const docNo = (type === "LOA" ? "MA-LOA-" : "MA-SUB-") + yr + "/" + seq;
    const id = "AWD" + Date.now().toString(36) + randomBytes(2).toString("hex");
    const rec = {
      id, docNo, type, status: "Issued",
      supplierId: sup.id, supplierName: sup.name, supplierTL: sup.licenseNo || "", supplierTRN: sup.trn || "", supplierEmail: sup.email || "", supplierAttn: sup.contactName || "",
      entity: entObj.short || "", entityName: entObj.name || "MA Group – Marvellous Art LLC", entityTRN: entityTRN(entObj),
      project: b.project || "", location: b.location || "", client: b.client || "",
      quotationRef: b.quotationRef || "", quotationDate: b.quotationDate || "",
      scopeTitle: b.scopeTitle || "", scope: b.scope || "", amount,
      commenceDays: num(b.commenceDays) || 7, commencement: b.commencement || "", completion: b.completion || "",
      retentionPct: num(b.retentionPct) || 10, delayPctPerDay: num(b.delayPctPerDay) || 0.5, delayCapPct: num(b.delayCapPct) || 10,
      retentionCapPct: (b.retentionCapPct != null && b.retentionCapPct !== "") ? num(b.retentionCapPct) : 5,
      performancePct: num(b.performancePct) || 10,
      perfSecurityType: b.perfSecurityType || (type === "AGREEMENT" ? "guarantee" : "cheque"),
      perfValidity: b.perfValidity || "valid until 28 days after the end of the Defects Liability Period",
      securityDeliveryDays: num(b.securityDeliveryDays) || 7,
      perfBondType: b.perfBondType || "none",
      performanceBondPct: num(b.performanceBondPct) || 0,
      advGuaranteeType: b.advGuaranteeType || "guarantee",
      securityDepPct: num(b.securityDepPct) || 0,
      dlpDays: num(b.dlpDays) || 365, paymentDays: num(b.paymentDays) || 30, signBackHours: num(b.signBackHours) || 24,
      advanceAmount: (b.advanceAmount != null && b.advanceAmount !== "") ? num(b.advanceAmount) : num(sup.advanceAmount),
      advanceRecoveryPct: (b.advanceRecoveryPct != null && b.advanceRecoveryPct !== "") ? num(b.advanceRecoveryPct) : r2(num(sup.advanceRecoveryRate) * 100),
      createdAt: now(), createdBy: me.name, sentAt: "", receivedAt: "", audit: []
    };
    await s.setJSON("award/" + id, rec);
    await s.setJSON("settings", settings);
    return json(rec);
  }
  if (path === "award/list" && req.method === "GET") {
    if (!can("contracts")) return err("Not permitted", 403);
    const items = await getAllJSON(s, "award/");
    items.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    return json({ items, threshold: awardThreshold(settings) });
  }
  /* ===================== DLP SERVICE REQUESTS =====================
     Every maintenance concern raised by a client during the Defects Liability
     Period is logged, triaged against an SLA, inspected, and — the control that
     protects the business — formally determined as either an MA liability
     (rectified free of charge) or OUTSIDE the DLP scope (chargeable, quoted and
     not started until the client approves in writing). UAE practice: the DLP
     covers defective workmanship, materials and installation; it does not cover
     misuse, third-party alterations, lack of maintenance, fair wear and tear or
     anything reported after the DLP has expired. */
  if (path === "srs" && req.method === "GET") {
    const items = (await getAllJSON(s, "sr/")).map((r) => srDerive(r, settings));
    items.sort((a, b) => (a.reportedAt < b.reportedAt ? 1 : a.reportedAt > b.reportedAt ? -1 : 0));
    return json({ items, sla: srSla(settings), stats: srStats(items) });
  }
  if (path === "sr" && req.method === "POST") {
    if (!can("contracts") && !can("procurement")) return err("Not permitted", 403);
    const b = await req.json();
    const stg = settings;
    let id = b.id, ex = id ? await s.get("sr/" + id, { type: "json" }) : null;
    if (id && !ex) return err("Service request not found", 404);
    if (ex && ex.status === "Closed" && !can("admin")) return err("Closed — reopen it first (CEO)", 403);
    const project = String(b.project ?? ex?.project ?? "").trim();
    if (!project) return err("Choose the project");
    if (!String(b.description ?? ex?.description ?? "").trim()) return err("Describe the reported concern");
    if (!id) {
      id = await nextId(s, stg, "srSeq", "SR", "sr/", 4);
      await s.setJSON("settings", stg);
    }
    const yr = String(b.reportedAt || now()).slice(2, 4);
    const pj = String(project).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3).padEnd(3, "X");
    const rec = {
      id, no: ex?.no || `SR/MA${yr}/${pj}/${String(num(String(id).replace(/\D/g, ""))).padStart(3, "0")}`,
      project, contractId: String(b.contractId ?? ex?.contractId ?? ""), compCertId: String(b.compCertId ?? ex?.compCertId ?? ""),
      clientName: String(b.clientName ?? ex?.clientName ?? ""), clientRef: String(b.clientRef ?? ex?.clientRef ?? ""),
      reportedBy: String(b.reportedBy ?? ex?.reportedBy ?? ""), reportedPhone: String(b.reportedPhone ?? ex?.reportedPhone ?? ""),
      reportedEmail: String(b.reportedEmail ?? ex?.reportedEmail ?? ""),
      channel: String(b.channel ?? ex?.channel ?? "Phone"),
      reportedAt: String(b.reportedAt || ex?.reportedAt || now()).slice(0, 16),
      location: String(b.location ?? ex?.location ?? ""), asset: String(b.asset ?? ex?.asset ?? ""),
      category: String(b.category ?? ex?.category ?? "Other"),
      priority: ["Emergency", "Urgent", "Routine"].includes(String(b.priority)) ? String(b.priority) : (ex?.priority || "Routine"),
      description: String(b.description ?? ex?.description ?? ""),
      // DLP window carried from the completion / DLP certificate for the automatic
      // in-warranty check (a request after expiry can never be a free rectification).
      dlpStart: String(b.dlpStart ?? ex?.dlpStart ?? "").slice(0, 10),
      dlpEnd: String(b.dlpEnd ?? ex?.dlpEnd ?? "").slice(0, 10),
      // --- inspection & liability determination ---
      inspectedBy: String(b.inspectedBy ?? ex?.inspectedBy ?? ""), inspectedAt: String(b.inspectedAt ?? ex?.inspectedAt ?? "").slice(0, 16),
      findings: String(b.findings ?? ex?.findings ?? ""), rootCause: String(b.rootCause ?? ex?.rootCause ?? ""),
      liability: ["", "in-scope", "out-of-scope", "partial", "rejected"].includes(String(b.liability)) ? String(b.liability) : (ex?.liability || ""),
      liabilityReason: String(b.liabilityReason ?? ex?.liabilityReason ?? ""),
      liabilityNote: String(b.liabilityNote ?? ex?.liabilityNote ?? ""),
      sharePct: num(b.sharePct ?? ex?.sharePct),
      // --- back-charge to the responsible subcontractor (in-scope defects) ---
      subcontractorId: String(b.subcontractorId ?? ex?.subcontractorId ?? ""),
      subcontractorName: String(b.subcontractorName ?? ex?.subcontractorName ?? ""),
      backChargeAmount: num(b.backChargeAmount ?? ex?.backChargeAmount),
      // --- chargeable quotation (out of scope) ---
      quoteLines: Array.isArray(b.quoteLines) ? b.quoteLines.filter((l) => l && (String(l.description || "").trim() || num(l.qty) || num(l.rate)))
        .map((l) => ({ description: String(l.description || ""), unit: String(l.unit || ""), qty: num(l.qty), rate: num(l.rate), amount: r2(num(l.qty) * num(l.rate)) })) : (ex?.quoteLines || []),
      quoteVatPct: b.quoteVatPct === void 0 ? (ex?.quoteVatPct != null ? num(ex.quoteVatPct) : 0.05) : num(b.quoteVatPct),
      quoteValidity: String(b.quoteValidity ?? ex?.quoteValidity ?? "15 days"),
      quoteSentAt: ex?.quoteSentAt || "", clientApprovalRef: String(b.clientApprovalRef ?? ex?.clientApprovalRef ?? ""),
      quoteApprovedAt: ex?.quoteApprovedAt || "",
      // --- execution ---
      assignedTo: String(b.assignedTo ?? ex?.assignedTo ?? ""), targetDate: String(b.targetDate ?? ex?.targetDate ?? "").slice(0, 10),
      startedAt: ex?.startedAt || "", completedAt: ex?.completedAt || "",
      workDone: String(b.workDone ?? ex?.workDone ?? ""), materialsUsed: String(b.materialsUsed ?? ex?.materialsUsed ?? ""),
      manHours: num(b.manHours ?? ex?.manHours),
      // --- closeout ---
      clientSignName: String(b.clientSignName ?? ex?.clientSignName ?? ""), clientSignDate: String(b.clientSignDate ?? ex?.clientSignDate ?? "").slice(0, 10),
      satisfaction: num(b.satisfaction ?? ex?.satisfaction), closedAt: ex?.closedAt || "",
      notes: String(b.notes ?? ex?.notes ?? ""),
      photos: ex?.photos || [],
      acknowledgedAt: ex?.acknowledgedAt || "",
      status: ex?.status || "New",
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedBy: me.name, updatedAt: now(),
      audit: [...(ex?.audit || []), { at: now(), by: me.name, action: ex ? "Updated" : "Logged (New)" }]
    };
    const q = srQuoteTotals(rec);
    rec.quoteSubtotal = q.subtotal; rec.quoteVat = q.vat; rec.quoteTotal = q.total;
    await s.setJSON("sr/" + id, rec);
    return json(srDerive(rec, settings));
  }
  const srOne = path.match(/^sr\/([^/]+)$/);
  if (srOne && req.method === "GET") {
    const r = await s.get("sr/" + decodeURIComponent(srOne[1]), { type: "json" });
    if (!r) return err("Not found", 404);
    return json(srDerive(r, settings));
  }
  if (srOne && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    await s.delete("sr/" + decodeURIComponent(srOne[1]));
    return json({ ok: true });
  }
  const srStat = path.match(/^sr\/([^/]+)\/status$/);
  if (srStat && req.method === "POST") {
    if (!can("contracts") && !can("procurement")) return err("Not permitted", 403);
    const r = await s.get("sr/" + decodeURIComponent(srStat[1]), { type: "json" });
    if (!r) return err("Not found", 404);
    const b = await req.json(), a = String(b.action || "");
    const stamp = (f) => { r[f] = now(); };
    if (a === "acknowledge") { if (r.status !== "New") return err("Already acknowledged"); r.status = "Acknowledged"; stamp("acknowledgedAt"); }
    else if (a === "inspect") {
      if (!r.inspectedBy || !r.findings) return err("Record who inspected and the findings first");
      if (!r.liability) return err("Determine the liability (in scope / out of scope / partial / rejected) first");
      if (r.liability !== "in-scope" && !r.liabilityReason) return err("Select the reason for the liability determination");
      r.status = "Inspected"; if (!r.inspectedAt) stamp("inspectedAt");
    }
    else if (a === "quote-sent") { if (!(num(r.quoteTotal) > 0)) return err("Price the chargeable works first"); r.status = "Quoted"; stamp("quoteSentAt"); }
    else if (a === "quote-approved") {
      if (!String(b.clientApprovalRef || r.clientApprovalRef || "").trim()) return err("Record the client's written approval reference");
      r.clientApprovalRef = String(b.clientApprovalRef || r.clientApprovalRef); r.status = "Approved"; stamp("quoteApprovedAt");
    }
    else if (a === "quote-declined") { r.status = "Declined"; }
    else if (a === "start") {
      if (r.liability === "out-of-scope" && r.status !== "Approved") return err("Chargeable works cannot start before the client approves the quotation in writing");
      if (r.liability === "rejected") return err("This request was rejected — reopen and re-determine it first");
      r.status = "In progress"; if (!r.startedAt) stamp("startedAt");
    }
    else if (a === "complete") { if (!r.workDone) return err("Record the work carried out first"); r.status = "Completed"; if (!r.completedAt) stamp("completedAt"); }
    else if (a === "close") {
      if (r.status !== "Completed") return err("Complete the works before closing");
      if (!r.clientSignName) return err("Record the client representative who accepted the works");
      r.status = "Closed"; stamp("closedAt");
    }
    else if (a === "cancel") { r.status = "Cancelled"; }
    else if (a === "reopen") { if (!can("admin")) return err("CEO only", 403); r.status = "Acknowledged"; r.closedAt = ""; }
    else return err("Unknown action");
    r.audit = [...(r.audit || []), { at: now(), by: me.name, action: "Status → " + r.status + (b.comment ? " — " + String(b.comment) : "") }];
    r.updatedAt = now(); r.updatedBy = me.name;
    await s.setJSON("sr/" + r.id, r);
    return json(srDerive(r, settings));
  }
  const srPhoto = path.match(/^sr\/([^/]+)\/photo$/);
  if (srPhoto && req.method === "POST") {
    const r = await s.get("sr/" + decodeURIComponent(srPhoto[1]), { type: "json" });
    if (!r) return err("Not found", 404);
    const b = await req.json();
    r.photos = Array.isArray(r.photos) ? r.photos : [];
    if (b.removeIndex !== void 0) r.photos.splice(num(b.removeIndex), 1);
    else if (b.captionIndex !== void 0) { const p = r.photos[num(b.captionIndex)]; if (p) p.caption = String(b.caption || ""); }
    else {
      const d = String(b.dataUrl || "");
      if (!/^data:image\/(jpeg|png|webp);base64,/.test(d)) return err("Only JPG / PNG / WebP images");
      if (d.length > 2e6) return err("Image too large — keep each photo under ~1.5 MB");
      if (r.photos.length >= 20) return err("Maximum 20 photos per request");
      r.photos.push({ dataUrl: d, caption: String(b.caption || ""), stage: String(b.stage || "before"), at: now(), by: me.name });
    }
    r.updatedAt = now();
    await s.setJSON("sr/" + r.id, r);
    return json(srDerive(r, settings));
  }
  const srHtml = path.match(/^sr\/([^/]+)\/(html|quote|report)$/);
  if (srHtml && req.method === "GET") {
    const r = await s.get("sr/" + decodeURIComponent(srHtml[1]), { type: "json" });
    if (!r) return err("Not found", 404);
    const cfg = await getEmailCfg(s);
    const sign = await s.get("asset/sign").catch(() => "") || "";
    const stamp = await s.get("asset/stamp").catch(() => "") || "";
    const kind = srHtml[2];
    const body = kind === "quote" ? buildSrQuoteHtml(srDerive(r, settings), cfg, { sign, stamp })
      : kind === "report" ? buildSrReportHtml(srDerive(r, settings), cfg, { sign, stamp })
      : buildSrHtml(srDerive(r, settings), cfg, { sign, stamp });
    return new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const srSend = path.match(/^sr\/([^/]+)\/send$/);
  if (srSend && req.method === "POST") {
    if (!can("contracts") && !can("procurement")) return err("Not permitted", 403);
    const r = await s.get("sr/" + decodeURIComponent(srSend[1]), { type: "json" });
    if (!r) return err("Not found", 404);
    const b = await req.json();
    const to = String(b.to || r.reportedEmail || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return err("Enter a valid recipient email", 400);
    const cc = [...new Set((Array.isArray(b.cc) ? b.cc : String(b.cc || "").split(/[,;\s]+/)).map((x) => String(x || "").trim())
      .filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) && x.toLowerCase() !== to.toLowerCase()))].slice(0, 12);
    const cfg = await getEmailCfg(s);
    const sign = await s.get("asset/sign").catch(() => "") || "";
    const stampA = await s.get("asset/stamp").catch(() => "") || "";
    const d = srDerive(r, settings);
    const kind = String(b.kind || "ack");
    const html = kind === "quote" ? buildSrQuoteHtml(d, cfg, { sign, stamp: stampA })
      : kind === "report" ? buildSrReportHtml(d, cfg, { sign, stamp: stampA })
      : buildSrHtml(d, cfg, { sign, stamp: stampA });
    const subject = kind === "quote" ? `Quotation for chargeable works — ${r.no} — ${r.project}`
      : kind === "report" ? `Service completion report — ${r.no} — ${r.project}`
      : `Service request acknowledgement — ${r.no} — ${r.project}`;
    const pdfs = Array.isArray(b.pdfs) ? b.pdfs.filter((p) => p && p.base64) : [];
    const attachments = pdfs.length ? pdfs.map((p, i) => ({ filename: String(p.name || (r.no.replace(/[^A-Za-z0-9._-]+/g, "_") + (i ? "_" + i : "") + ".pdf")), content: Buffer.from(String(p.base64), "base64"), contentType: "application/pdf" })) : void 0;
    const res = await sendMail(s, cfg, { type: "awarddoc", to, toName: r.reportedBy || r.clientName, cc, subject, html, attachments });
    if (kind === "ack" && r.status === "New") { r.status = "Acknowledged"; r.acknowledgedAt = now(); }
    if (kind === "quote") { r.status = "Quoted"; r.quoteSentAt = now(); }
    r.audit = [...(r.audit || []), { at: now(), by: me.name, action: `Emailed (${kind}) to ${to}${cc.length ? " cc " + cc.join(", ") : ""}` }];
    r.updatedAt = now();
    await s.setJSON("sr/" + r.id, r);
    try { await sendMail(s, cfg, { type: "awarddoc", to: cfg.adminEmail, toName: "MA Group", subject: "[COPY] " + subject, html, attachments }); } catch (e) {}
    return json({ ok: true, status: res.status, to, cc, sr: srDerive(r, settings) });
  }
  // ===================== COMPLETION & DLP CERTIFICATE ENDPOINTS =====================
  if (path === "compcerts" && req.method === "GET") {
    const items = await getAllJSON(s, "compcert/");
    items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return json({ items });
  }
  if (path === "compcert" && req.method === "POST") {
    if (!can("contracts")) return err("Not permitted", 403);
    const b = await req.json();
    const type = b.type === "DLP" ? "DLP" : b.type === "WARRANTY" ? "WARRANTY" : "COMPLETION";
    const stg = await s.get("settings", { type: "json" });
    let id = b.id, ex = null;
    if (id) { ex = await s.get("compcert/" + id, { type: "json" }); if (!ex) return err("Not found", 404); }
    else { id = await nextId(s, stg, "compcertSeq", "CX", "compcert/", 4); }
    // Document number: MA/CC | MA/DLP | MA/WC /<year>/<serial> (editable while Draft).
    let docNo = String(b.docNo || ex?.docNo || "").trim();
    if (!docNo) {
      const yr = String(new Date().getFullYear());
      const key = type === "DLP" ? "dlpSerial" : type === "WARRANTY" ? "wcSerial" : "ccSerial";
      stg[key] = (num(stg[key]) || 102) + 1; // continues after MA/CC/2026/0102 in the register
      docNo = `MA/${type === "DLP" ? "DLP" : type === "WARRANTY" ? "WC" : "CC"}/${yr}/${String(stg[key]).padStart(4, "0")}`;
    }
    await s.setJSON("settings", stg);
    const str = (k) => b[k] === void 0 ? (ex?.[k] || "") : (b[k] || "");
    const entObj = (settings.entities || []).find((e) => e.short === (b.entity || ex?.entity)) || settings.entities[0];
    const rec = {
      id, type, docNo,
      date: str("date") || now().slice(0, 10),
      entity: entObj.short, entityName: entObj.name, entityTRN: entityTRN(entObj),
      partyType: str("partyType") || "Client", partyName: str("partyName"), partyTrn: str("partyTrn"),
      partyAttn: str("partyAttn"), partyEmail: str("partyEmail"),
      // Additional recipients — they receive the same email with both PDFs.
      cc: (Array.isArray(b.cc) ? b.cc : String(b.cc ?? ex?.cc ?? "").split(/[,;\s]+/))
        .map((x) => String(x || "").trim()).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)).slice(0, 12),
      project: str("project"), location: str("location"),
      contractRef: str("contractRef"), contractDate: str("contractDate"),
      quotationRef: str("quotationRef"), quotationDate: str("quotationDate"),
      completionDate: str("completionDate"),
      dlpStart: str("dlpStart"), dlpEnd: str("dlpEnd"), retentionDue: str("retentionDue"),
      warrantyPeriod: str("warrantyPeriod"),
      scope: Array.isArray(b.scope) ? b.scope.map((l, i) => ({ ref: String(l.ref || i + 1), description: String(l.description || ""), unit: String(l.unit || ""), qty: String(l.qty || ""), status: String(l.status || "Completed") })) : (ex?.scope || []),
      valueExVat: b.valueExVat === void 0 ? num(ex?.valueExVat) : num(b.valueExVat),
      vatPct: b.vatPct === void 0 ? (ex?.vatPct != null ? num(ex.vatPct) : 0.05) : num(b.vatPct),
      variations: str("variations") || "NIL", paymentTerms: str("paymentTerms"),
      clauses: Array.isArray(b.clauses) ? b.clauses.map((c) => String(c || "")) : (ex?.clauses || compCertDefaults(type)),
      notes: str("notes"),
      reportIntro: str("reportIntro"),
      photos: ex?.photos || [],
      status: b.status || ex?.status || "Draft",
      createdAt: ex?.createdAt || now(), createdBy: ex?.createdBy || me.name,
      updatedAt: now(), updatedBy: me.name, sentAt: ex?.sentAt || "",
      audit: [...(ex?.audit || []), { at: now(), by: me.name, action: ex ? "Edited" : "Created (Draft)" }]
    };
    if (!rec.partyName) return err("Enter the party (client / subcontractor) name");
    if (!rec.project) return err("Enter the project");
    if (type === "COMPLETION" && !rec.completionDate) return err("Enter the date of completion");
    if (type === "DLP" && (!rec.dlpStart || !rec.dlpEnd)) return err("Enter the DLP start and end dates");
    if (type === "WARRANTY" && (!rec.dlpStart || !rec.dlpEnd)) return err("Enter the warranty start and end dates");
    await s.setJSON("compcert/" + id, rec);
    return json(rec);
  }
  {
    const m = path.match(/^compcert\/([^/]+)$/);
    if (m && req.method === "GET") {
      const rec = await s.get("compcert/" + decodeURIComponent(m[1]), { type: "json" });
      if (!rec) return err("Not found", 404);
      return json(rec);
    }
    if (m && req.method === "DELETE") {
      if (!can("admin")) return err("CEO only", 403);
      await s.delete("compcert/" + decodeURIComponent(m[1])).catch(() => {});
      return json({ ok: true });
    }
  }
  {
    const m = path.match(/^compcert\/([^/]+)\/html$/);
    if (m && req.method === "GET") {
      const rec = await s.get("compcert/" + decodeURIComponent(m[1]), { type: "json" });
      if (!rec) return err("Not found", 404);
      const cfg = await getEmailCfg(s);
      const sign = await s.get("asset/sign").catch(() => "") || "";
      const stamp = await s.get("asset/stamp").catch(() => "") || "";
      return new Response(buildCompCertHtml(rec, cfg, { sign, stamp }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }
  {
    // Photos attached to a completion/DLP/warranty certificate (for the photo report).
    const m = path.match(/^compcert\/([^/]+)\/photo$/);
    if (m && req.method === "POST") {
      if (!can("contracts")) return err("Not permitted", 403);
      const rec = await s.get("compcert/" + decodeURIComponent(m[1]), { type: "json" });
      if (!rec) return err("Not found", 404);
      const b = await req.json();
      rec.photos = Array.isArray(rec.photos) ? rec.photos : [];
      if (b.removeIndex != null) {
        rec.photos.splice(num(b.removeIndex), 1);
      } else if (b.captionIndex != null) {
        if (rec.photos[num(b.captionIndex)]) rec.photos[num(b.captionIndex)].caption = String(b.caption || "");
      } else {
        if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(String(b.dataUrl || ""))) return err("Photo must be a JPEG/PNG image");
        if (String(b.dataUrl).length > 2e6) return err("Photo too large after compression — under ~1.5 MB");
        if (rec.photos.length >= 40) return err("Maximum 40 photos per report");
        rec.photos.push({ name: String(b.name || "photo"), caption: String(b.caption || ""), dataUrl: b.dataUrl, at: now(), by: me.name });
      }
      rec.updatedAt = now();
      await s.setJSON("compcert/" + rec.id, rec);
      return json({ ok: true, count: rec.photos.length, photos: rec.photos.map((p, i) => ({ i, name: p.name, caption: p.caption })) });
    }
  }
  {
    const m = path.match(/^compcert\/([^/]+)\/report$/);
    if (m && req.method === "GET") {
      const rec = await s.get("compcert/" + decodeURIComponent(m[1]), { type: "json" });
      if (!rec) return err("Not found", 404);
      const cfg = await getEmailCfg(s);
      const sign = await s.get("asset/sign").catch(() => "") || "";
      const stamp = await s.get("asset/stamp").catch(() => "") || "";
      return new Response(buildCompReportHtml(rec, cfg, { sign, stamp }), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
  }
  {
    const m = path.match(/^compcert\/([^/]+)\/send$/);
    if (m && req.method === "POST") {
      if (!can("contracts")) return err("Not permitted", 403);
      const rec = await s.get("compcert/" + decodeURIComponent(m[1]), { type: "json" });
      if (!rec) return err("Not found", 404);
      let b = {}; try { b = await req.json(); } catch (e) {}
      const to = String(b.to || rec.partyEmail || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return err("Enter a valid recipient email", 400);
      const ccList = [...new Set((Array.isArray(b.cc) ? b.cc : (b.cc !== void 0 ? String(b.cc).split(/[,;\s]+/) : (rec.cc || [])))
        .map((x) => String(x || "").trim()).filter((x) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x) && x.toLowerCase() !== to.toLowerCase()))].slice(0, 12);
      const cfg = await getEmailCfg(s);
      const sign = await s.get("asset/sign").catch(() => "") || "";
      const stamp = await s.get("asset/stamp").catch(() => "") || "";
      const certHtml = buildCompCertHtml(rec, cfg, { sign, stamp });
      const label = rec.type === "DLP" ? "Defects Liability Completion Certificate" : rec.type === "WARRANTY" ? "Warranty Certificate" : "Certificate of Completion";
      let attachments;
      const pdfs = Array.isArray(b.pdfs) ? b.pdfs.filter((p) => p && p.base64) : (b.pdfBase64 ? [{ name: b.pdfName, base64: b.pdfBase64 }] : []);
      if (pdfs.length) {
        attachments = pdfs.map((p, i) => ({
          filename: String(p.name || (rec.docNo.replace(/[^A-Za-z0-9._-]+/g, "_") + (i ? "_report" : "") + ".pdf")),
          content: Buffer.from(String(p.base64), "base64"), contentType: "application/pdf"
        }));
      }
      // Both documents go out in ONE email: the certificate and, where photos /
      // a completion report exist, the Project Completion Report — listed as
      // enclosures at the head of the message so the recipient sees both.
      const hasReport = (attachments || []).some((a) => /report/i.test(a.filename));
      const nPhotos = (rec.photos || []).length;
      const subject = `${label} ${rec.docNo} — ${rec.project || ""}${hasReport ? " (incl. Completion Report)" : ""}`;
      const encl = attachments && attachments.length
        ? `<div style="font-family:Segoe UI,Arial,sans-serif;font-size:13px;color:#1F3864;border:1px solid #e3e7ee;border-left:4px solid #cc9c30;background:#f7f9fc;padding:12px 14px;margin:0 0 14px">
             <b>Enclosures — attached to this email</b>
             <ol style="margin:6px 0 0 18px;padding:0;color:#333">${attachments.map((a) => `<li>${emEsc(a.filename)}${/report/i.test(a.filename) ? ` — Project Completion Report${nPhotos ? ` including ${nPhotos} site photograph${nPhotos === 1 ? "" : "s"}` : ""}` : ` — ${emEsc(label)}`}</li>`).join("")}</ol>
           </div>` : "";
      const html = encl + certHtml;
      const r = await sendMail(s, cfg, { type: "awarddoc", to, toName: rec.partyAttn || rec.partyName, cc: ccList, subject, html, attachments });
      rec.status = rec.status === "Countersigned" ? "Countersigned" : "Issued";
      rec.sentAt = now(); rec.partyEmail = to; if (ccList.length) rec.cc = ccList;
      rec.audit = [...(rec.audit || []), { at: now(), by: me.name, action: "Emailed to " + to + (ccList.length ? " (cc: " + ccList.join(", ") + ")" : "") + (attachments ? ` — ${attachments.length} PDF attached` : "") }];
      await s.setJSON("compcert/" + rec.id, rec);
      try { await sendMail(s, cfg, { type: "awarddoc", to: cfg.adminEmail, toName: "MA Group", subject: "[COPY] " + subject, html, attachments }); } catch (e) {}
      return json({ ok: true, status: r.status, to, cc: ccList, attached: !!attachments, files: (attachments || []).map((a) => a.filename) });
    }
  }
  const awdHtml = path.match(/^award\/([^/]+)\/html$/);
  if (awdHtml && req.method === "GET") {
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdHtml[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const cfg = await getEmailCfg(s);
    const sign = await s.get("asset/sign").catch(() => "") || "";
    const stamp = await s.get("asset/stamp").catch(() => "") || "";
    return new Response(buildAwardDocHtml(rec, cfg, { sign, stamp }), { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const awdSend = path.match(/^award\/([^/]+)\/send$/);
  if (awdSend && req.method === "POST") {
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdSend[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    if (!rec.supplierEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rec.supplierEmail)) return err("This supplier has no valid email on file", 400);
    const cfg = await getEmailCfg(s);
    const sign = await s.get("asset/sign").catch(() => "") || "";
    const stamp = await s.get("asset/stamp").catch(() => "") || "";
    const html = buildAwardDocHtml(rec, cfg, { sign, stamp });
    const label = rec.type === "LOA" ? "Letter of Award" : "Subcontract Agreement";
    const subject = `${label} ${rec.docNo} — ${rec.project || "Works Package"} — Signature required within ${rec.signBackHours || 24}h`;
    // Optional PDF of the document, rendered in the browser and attached to the email.
    let attachments;
    try {
      const b = await req.json();
      if (b && b.pdfBase64) {
        const fn = String(b.pdfName || ((rec.docNo || "Award").replace(/[^A-Za-z0-9._-]+/g, "_") + ".pdf"));
        attachments = [{ filename: fn, content: Buffer.from(String(b.pdfBase64), "base64"), contentType: "application/pdf" }];
      }
    } catch (e) {}
    const r = await sendMail(s, cfg, { type: "awarddoc", to: rec.supplierEmail, toName: rec.supplierName, subject, html, supplierId: rec.supplierId, attachments });
    rec.status = "Sent"; rec.sentAt = now(); rec.sendStatus = r.status;
    await s.setJSON("award/" + rec.id, rec);
    // Copy to the CEO/CFO for the record.
    try { await sendMail(s, cfg, { type: "awarddoc", to: cfg.adminEmail, toName: "MA Group", subject: "[COPY] " + subject, html, attachments }); } catch (e) { }
    return json({ ok: true, status: r.status, to: rec.supplierEmail, attached: !!attachments });
  }
  const awdUpd = path.match(/^award\/([^/]+)\/update$/);
  if (awdUpd && req.method === "POST") {
    // Amend a draft/issued award before it is countersigned.
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdUpd[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    if (rec.status === "Countersigned") return err("This document is already signed & returned — it cannot be amended. Delete and re-issue if a change is needed.", 400);
    const b = await req.json();
    const amount = (b.amount != null && b.amount !== "") ? num(b.amount) : num(rec.amount);
    if (amount <= 0) return err("Enter the award / quotation amount");
    // Type may flip across the threshold — refresh the ref prefix, keep the sequence.
    const newType = awardTypeFor(amount, settings);
    if (newType !== rec.type) {
      const m = String(rec.docNo).match(/(\d{4})\/(\d+)$/);
      const yr = m ? m[1] : String(now()).slice(0, 4);
      const seq = m ? m[2] : String(num(settings.awardSeq)).padStart(3, "0");
      rec.docNo = (newType === "LOA" ? "MA-LOA-" : "MA-SUB-") + yr + "/" + seq;
      rec.type = newType;
    }
    // Swap supplier (re-pull its details) if changed.
    if (b.supplierId && b.supplierId !== rec.supplierId) {
      const sup = await s.get("supplier/" + b.supplierId, { type: "json" });
      if (sup) { rec.supplierId = sup.id; rec.supplierName = sup.name; rec.supplierTL = sup.licenseNo || ""; rec.supplierTRN = sup.trn || ""; rec.supplierEmail = sup.email || ""; rec.supplierAttn = sup.contactName || ""; }
    }
    if (b.entity !== void 0) { const entObj = (settings.entities || []).find((e) => e.short === b.entity); if (entObj) { rec.entity = entObj.short; rec.entityName = entObj.name; rec.entityTRN = entityTRN(entObj); } }
    rec.amount = amount;
    for (const k of ["project", "location", "client", "quotationRef", "quotationDate", "scopeTitle", "scope", "completion", "commencement", "perfValidity", "perfSecurityType", "advGuaranteeType", "perfBondType"]) {
      if (b[k] !== void 0) rec[k] = typeof b[k] === "string" ? b[k] : b[k];
    }
    for (const k of ["commenceDays", "retentionPct", "delayPctPerDay", "delayCapPct", "performancePct", "performanceBondPct", "retentionCapPct", "securityDeliveryDays", "dlpDays", "paymentDays", "signBackHours", "advanceAmount", "advanceRecoveryPct"]) {
      if (b[k] !== void 0 && b[k] !== "") rec[k] = num(b[k]);
    }
    rec.updatedAt = now(); rec.updatedBy = me.name;
    rec.audit = rec.audit || [];
    rec.audit.push({ at: now(), by: me.name, action: rec.status === "Sent" ? "Amended after sending — reverted to Issued for re-send" : "Amended before sending" });
    if (rec.status === "Sent") rec.status = "Issued";
    await s.setJSON("award/" + rec.id, rec);
    return json(rec);
  }
  const awdRecv = path.match(/^award\/([^/]+)\/received$/);
  if (awdRecv && req.method === "POST") {
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdRecv[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    rec.status = "Countersigned"; rec.receivedAt = now(); rec.receivedBy = me.name;
    // Automation: signed contract → sync terms to supplier → create the down-payment
    // certificate (draft) ready to approve & pay. Progress IPCs then flow from the
    // supplier's synced terms and recover the advance automatically.
    let synced = null, advance = null;
    try { synced = await syncSupplierFromAward(s, rec); } catch (e) {}
    try { if (synced && num(rec.advanceAmount) > 0 && !rec.advanceCertNo) { const r = await createAdvanceCertFromAward(s, rec, synced, me); if (r && r.created) advance = r.created; } } catch (e) {}
    await s.setJSON("award/" + rec.id, rec);
    return json({ ok: true, supplierSynced: !!synced, advanceCertNo: rec.advanceCertNo || null, advanceAmount: num(rec.advanceAmount), advanceCreated: !!advance });
  }
  const awdAdv = path.match(/^award\/([^/]+)\/process-advance$/);
  if (awdAdv && req.method === "POST") {
    // Manual fallback: (re-)sync terms and create the down-payment certificate.
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdAdv[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    const sup = await syncSupplierFromAward(s, rec);
    if (!sup) return err("Linked supplier not found — award cannot be processed", 404);
    if (num(rec.advanceAmount) <= 0) { await s.setJSON("award/" + rec.id, rec); return json({ ok: true, supplierSynced: true, advanceCertNo: null, note: "No advance on this contract — terms synced to supplier." }); }
    const r = await createAdvanceCertFromAward(s, rec, sup, me);
    await s.setJSON("award/" + rec.id, rec);
    return json({ ok: true, supplierSynced: true, advanceCertNo: rec.advanceCertNo || null, advanceCreated: !!(r && r.created), already: !!(r && r.existing) });
  }
  const awdDel = path.match(/^award\/([^/]+)$/);
  if (awdDel && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    await s.delete("award/" + awdDel[1]).catch(() => {});
    return json({ ok: true });
  }
  if (awdDel && req.method === "GET") {
    if (!can("contracts")) return err("Not permitted", 403);
    const rec = await s.get("award/" + awdDel[1], { type: "json" });
    if (!rec) return err("Not found", 404);
    return json(rec);
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
      lead: [`This is a test email from the MA Group management system, confirming that outbound notifications are configured correctly.`, `Sent at ${emDate(now())}.`],
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
    const policyAccepted = await hasAcceptedPolicy(s, me.id);
    return json({
      me: { id: me.id, name: me.name, role: me.role, title: me.title || "", policyAccepted },
      policyVersion: POLICY_VERSION,
      policyText: policyAccepted ? "" : CONFIDENTIALITY_POLICY,
      settings,
      certs,
      register,
      suppliers,
      assets,
      assetCount,
      clientCount,
      contractCount,
      clientCertCount,
      users: users.map((u) => ({ id: u.id, name: u.name, role: u.role, title: u.title || "", department: u.department || "", active: u.active !== false }))
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
    const { id: idRaw, name, role, pin, title, department, active, remove } = await req.json();
    const id = String(idRaw || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    if (!id) return err("User id is required (letters / numbers)");
    const all = await s.get("users", { type: "json" });
    let u = all.find((x) => x.id === id);
    if (remove) { if (!u) return err("User not found"); if (u.id === me.id || u.id === "ceo") return err("This account cannot be removed"); await s.setJSON("users", all.filter((x) => x.id !== id)); return json({ ok: true, removed: id }); }
    if (!name || !ROLES.includes(role)) return err("Name and a valid role / department are required");
    if (!u) {
      if (all.length >= 40) return err("User limit reached");
      if (!pin || !/^\d{4,8}$/.test(String(pin))) return err("A 4–8 digit starting PIN is required for a new user");
      u = { id, salt: randomBytes(8).toString("hex"), pinHash: "", createdAt: now(), createdBy: me.name };
      all.push(u);
    }
    u.name = name;
    u.role = role;
    if (title !== void 0) u.title = String(title || "");
    if (department !== void 0) u.department = String(department || "");
    if (active !== void 0) { if (u.id === me.id) return err("You cannot deactivate your own account"); u.active = !!active; }
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
      id = await nextId(s, st, "supplierSeq", "S", "supplier/", 3);
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
      // All contact emails (primary first). Every system email is sent to the primary
      // and CC's the rest, so the vendor never misses a notification.
      emails: (() => {
        const rx = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        const src = Array.isArray(b.emails) ? b.emails : (b.emails === void 0 ? (existing?.emails || []) : []);
        const list = [str("email"), ...src].map((e) => String(e || "").trim()).filter((e) => e && rx.test(e));
        const seen = new Set(), out = [];
        for (const e of list) { const k = e.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(e); } }
        return out;
      })(),
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
    // Keep the procurement directory in step — every registered supplier /
    // subcontractor is also an inquirable vendor.
    try { await dirUpsertFromSupplier(s, sup); } catch (e) {}
    if (!b.id) {
      await notify(s, "welcome", { sup });
      await notify(s, "paymentcycle", { sup });
      // Auto-send the most recent announcement to the newly registered vendor.
      try {
        if (sup.email) {
          const anns = await getAllJSON(s, "announcement/");
          const latest = anns.filter((a) => a.autoNew !== false).sort((a, b2) => a.sentAt < b2.sentAt ? 1 : -1)[0];
          if (latest) {
            const cfg = await getEmailCfg(s);
            const t = buildEmail("announcement", { to: sup.email, toName: sup.contactName || sup.name, greeting: sup.contactName || sup.name, category: latest.category, subject: latest.subject, body: latest.body }, cfg);
            await sendMail(s, cfg, { type: "announcement", to: t.to, toName: t.toName, subject: t.subject, html: t.html, supplierId: sup.id });
          }
        }
      } catch (e) { }
    }
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
  if (path === "contract-terms" && req.method === "GET") {
    const supplierId = url.searchParams.get("supplier") || "";
    const project = url.searchParams.get("project") || "";
    if (!supplierId) return err("supplier required");
    return json(await getContractTerms(s, supplierId, project));
  }
  if (path === "contract-boq" && req.method === "POST") {
    // Save the rate schedule (BOQ) for a (supplier, project) contract.
    if (!can("create") && !can("contracts")) return err("Not permitted", 403);
    const b = await req.json();
    const supplierId = String(b.supplierId || "");
    const project = String(b.project || "");
    if (!supplierId || !project) return err("Supplier and project are required");
    const key = supProjKey(supplierId, project);
    let rec = await s.get(key, { type: "json" });
    const sup = await s.get("supplier/" + supplierId, { type: "json" }) || {};
    if (!rec) rec = { supplierId, project, contractType: "Rate", contractValue: 0, advanceAmount: 0, advanceRecoveryRate: 0, retentionPct: num(sup.retentionPct), dlpMonths: num(sup.dlpMonths), vatPct: num(sup.vatPct) || 0.05, createdAt: now() };
    const items = Array.isArray(b.boq) ? b.boq.map((l, i) => ({
      ref: String(l.ref || (i + 1)), description: String(l.description || ""), unit: String(l.unit || ""),
      rate: num(l.rate), qty: num(l.qty)
    })).filter((l) => l.description || l.rate > 0) : [];
    rec.boq = items;
    rec.contractType = "Rate";
    rec.boqValue = r2(items.reduce((a, l) => a + r2(num(l.qty) * num(l.rate)), 0));
    rec.updatedAt = now();
    await s.setJSON(key, rec);
    return json({ ok: true, boq: items, boqValue: rec.boqValue });
  }
  if (path === "cert" && req.method === "POST") {
    if (!can("create")) return err("Only QS or CEO can create certificates", 403);
    const b = await req.json();
    if (!b.supplierId) return err("Choose a supplier");
    const sup = await s.get("supplier/" + b.supplierId, { type: "json" });
    if (!sup) return err("Supplier not found");
    // Multiple invoices per certificate, with PARTIAL payment support: each line is
    // {no, amount (full invoice value), thisAmount (certified on THIS IPC)}. The
    // remaining balance of an invoice can be certified on a later IPC. Validation
    // blocks certifying more than the invoice's remaining balance.
    const invoices = Array.isArray(b.invoices) ? b.invoices
      .map((iv) => ({ no: String(iv.no || "").trim(), amount: num(iv.amount), thisAmount: num(iv.thisAmount) }))
      .filter((iv) => iv.no && iv.thisAmount > 0) : [];
    const paidSoFar = (priorC, key) => priorC.filter((x) => x.status !== "Cancelled" && x.kind !== "advance").reduce((a, x) => {
      if (Array.isArray(x.invoices) && x.invoices.length) { for (const v of x.invoices) { if (String(v.no || "").trim().toLowerCase() === key) a += num(v.thisAmount); } }
      else if (String(x.invoiceNo || "").trim().toLowerCase() === key) a += num(x.invoiceAmount);
      return a;
    }, 0);
    if (invoices.length) {
      const priorC = await certsBySupplier(sup.id);
      for (const iv of invoices) {
        const key = iv.no.toLowerCase();
        const paid = r2(paidSoFar(priorC, key));
        if (iv.amount > 0) {
          const remaining = r2(iv.amount - paid);
          if (remaining <= 0) return err(`Invoice ${iv.no} is already fully certified (AED ${iv.amount.toFixed(2)}).`, 409);
          if (iv.thisAmount > remaining + 0.01) return err(`Invoice ${iv.no}: only AED ${remaining.toFixed(2)} remains uncertified (invoice ${iv.amount.toFixed(2)}, previously certified ${paid.toFixed(2)}).`, 409);
        }
      }
    } else {
      // Legacy single-invoice path: block exact duplicate certification.
      const invNo = String(b.invoiceNo || "").trim();
      if (invNo) {
        const priorC = await certsBySupplier(sup.id);
        const dupC = priorC.find((x) => x.status !== "Cancelled" && String(x.invoiceNo || "").trim().toLowerCase() === invNo.toLowerCase());
        if (dupC) return err(`Supplier invoice ${invNo} is already certified on ${dupC.no} (${dupC.status}). Use the multi-invoice rows to certify a remaining balance.`, 409);
      }
    }
    const st = await s.get("settings", { type: "json" });
    const project = b.project || sup.project || "";
    const entity = b.entity || sup.entity || settings.entities[0].short;
    const terms = await getContractTerms(s, sup.id, project);
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
      invoiceNo: invoices.length ? invoices.map((iv) => iv.no).join(", ") : (b.invoiceNo || ""),
      invoices,
      trade: sup.trade || sup.category || b.trade || "",
      periodFrom: b.periodFrom || "",
      periodTo: b.periodTo || "",
      originalValue: num(terms.contractValue),
      basis: terms.contractType === "Rate" ? "rate" : "fixed",
      invoiceAmount: invoices.length ? r2(invoices.reduce((a, iv) => a + iv.thisAmount, 0)) : num(b.invoiceAmount),
      variations: num(b.variations),
      workPct: num(b.workPct),
      lines: Array.isArray(b.lines) ? b.lines.map((l, i) => ({ ref: String(l.ref || (i + 1)), description: String(l.description || ""), unit: String(l.unit || ""), rate: num(l.rate), contractQty: num(l.contractQty), qty: num(l.qty) })) : [],
      materialsOnSite: num(b.materialsOnSite),
      retentionPct: num(terms.retentionPct),
      advanceAmount: num(terms.advanceAmount),
      advanceRate: num(terms.advanceRecoveryRate),
      contractDocNo: terms.docNo || "",
      contra: num(b.contra),
      vatPct: num(terms.vatPct),
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
    if (Array.isArray(b.invoices)) {
      const invoices = b.invoices.map((iv) => ({ no: String(iv.no || "").trim(), amount: num(iv.amount), thisAmount: num(iv.thisAmount) })).filter((iv) => iv.no && iv.thisAmount > 0);
      // Validate remaining balances against OTHER certificates (this one excluded).
      const priorC = await certsBySupplier(c.supplierId, c.no);
      for (const iv of invoices) {
        if (!(iv.amount > 0)) continue;
        const key = iv.no.toLowerCase();
        const paid = r2(priorC.filter((x) => x.status !== "Cancelled" && x.kind !== "advance").reduce((a, x) => {
          if (Array.isArray(x.invoices) && x.invoices.length) { for (const v of x.invoices) { if (String(v.no || "").trim().toLowerCase() === key) a += num(v.thisAmount); } }
          else if (String(x.invoiceNo || "").trim().toLowerCase() === key) a += num(x.invoiceAmount);
          return a;
        }, 0));
        const remaining = r2(iv.amount - paid);
        if (iv.thisAmount > remaining + 0.01) return err(`Invoice ${iv.no}: only AED ${remaining.toFixed(2)} remains uncertified on other certificates.`, 409);
      }
      c.invoices = invoices;
      c.invoiceAmount = r2(invoices.reduce((a, iv) => a + iv.thisAmount, 0));
      c.invoiceNo = invoices.map((iv) => iv.no).join(", ");
    }
    if (b.lines !== void 0) c.lines = Array.isArray(b.lines) ? b.lines.map((l, i) => ({ ref: String(l.ref || (i + 1)), description: String(l.description || ""), unit: String(l.unit || ""), rate: num(l.rate), contractQty: num(l.contractQty), qty: num(l.qty) })) : [];
    const sup = await s.get("supplier/" + c.supplierId, { type: "json" });
    if (sup && c.kind !== "advance") {
      // Refresh from the per-project contract, not the global supplier record.
      const terms = await getContractTerms(s, c.supplierId, c.project);
      c.originalValue = num(terms.contractValue);
      c.basis = terms.contractType === "Rate" ? "rate" : "fixed";
      c.retentionPct = num(terms.retentionPct);
      c.vatPct = num(terms.vatPct);
      c.advanceAmount = num(terms.advanceAmount);
      c.advanceRate = num(terms.advanceRecoveryRate);
      c.contractDocNo = terms.docNo || c.contractDocNo || "";
      c.lpoRef = terms.docNo || sup.lpoRef;
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
      if (c.payment) return err("This certificate is already paid — refresh to see the recorded payment.", 409);
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
  const chqNoM = path.match(/^cert\/([^/]+)\/chequeno$/);
  if (chqNoM && req.method === "POST") {
    if (!can("admin")) return err("Only the CEO can amend a cheque number", 403);
    const key = "cert/" + decodeURIComponent(chqNoM[1]);
    const c = await s.get(key, { type: "json" });
    if (!c || !c.payment) return err("No payment recorded on this certificate", 404);
    if (c.payment.mode !== "Cheque") return err("This payment is not by cheque", 400);
    const b = await req.json().catch(() => ({}));
    const newRef = String(b.ref || "").trim();
    if (!newRef) return err("Enter the corrected cheque number");
    const oldRef = String(c.payment.ref || "").trim();
    if (newRef.toLowerCase() === oldRef.toLowerCase()) return json({ ok: true, unchanged: true });
    // Anti-duplication: the corrected number must not belong to another payment.
    const reg = await s.get("register", { type: "json" }) || [];
    const dupR = reg.find((r) => r && r.mode === "Cheque" && r.no !== c.no && String(r.ref || "").trim().toLowerCase() === newRef.toLowerCase());
    if (dupR) return err(`Cheque no. ${newRef} is already used on payment ${dupR.no} (${dupR.date}, ${dupR.payee}). Choose a different number.`, 409);
    const reason = String(b.reason || "").trim();
    c.payment.ref = newRef;
    c.payment.chequeAmended = now();
    c.payment.chequeAmendedBy = me.name;
    if (c.audit) c.audit.push({ at: now(), by: me.name, action: `Cheque no. amended ${oldRef ? "from " + oldRef + " " : ""}to ${newRef}${reason ? " — " + reason : ""}` });
    await s.setJSON(key, c);
    // Keep the payment register in sync.
    let regChanged = false;
    for (const r of reg) { if (r && r.no === c.no && r.mode === "Cheque") { r.ref = newRef; regChanged = true; } }
    if (regChanged) await s.setJSON("register", reg);
    return json({ ok: true, ref: newRef, oldRef });
  }
  const payAmtM = path.match(/^cert\/([^/]+)\/paymentamount$/);
  if (payAmtM && req.method === "POST") {
    if (!can("admin")) return err("Only the CEO can amend a payment amount", 403);
    const key = "cert/" + decodeURIComponent(payAmtM[1]);
    const c = await s.get(key, { type: "json" });
    if (!c || !c.payment) return err("No payment recorded on this certificate", 404);
    const b = await req.json().catch(() => ({}));
    const newAmt = num(b.amount);
    if (!(newAmt > 0)) return err("Enter a valid amount");
    const oldAmt = num(c.payment.amount);
    if (newAmt === oldAmt) return json({ ok: true, unchanged: true });
    const reason = String(b.reason || "").trim();
    c.payment.amount = newAmt;
    c.payment.amountAmended = now();
    c.payment.amountAmendedBy = me.name;
    if (c.audit) c.audit.push({ at: now(), by: me.name, action: `Payment amount amended from AED ${oldAmt} to AED ${newAmt}${reason ? " — " + reason : ""}` });
    await s.setJSON(key, c);
    // Keep the payment register (and therefore the bank balance) in sync.
    const reg = await s.get("register", { type: "json" }) || [];
    let regChanged = false;
    for (const r of reg) { if (r && r.no === c.no) { r.amount = newAmt; regChanged = true; } }
    if (regChanged) await s.setJSON("register", reg);
    // Mirror the paid amount on the project cost line.
    try { const xid = "XPC-" + c.no.replace(/[^A-Za-z0-9]+/g, "_"); const xp = await s.get("expense/" + xid, { type: "json" }); if (xp) { xp.paid = newAmt; xp.updatedAt = now(); await s.setJSON("expense/" + xid, xp); } } catch (e) {}
    return json({ ok: true, amount: newAmt, oldAmount: oldAmt });
  }
  const revM = path.match(/^cert\/([^/]+)\/reverse-payment$/);
  if (revM && req.method === "POST") {
    if (!can("admin")) return err("Only the CEO can reverse a payment", 403);
    const key = "cert/" + decodeURIComponent(revM[1]);
    const c = await s.get(key, { type: "json" });
    if (!c || !c.payment) return err("No payment to reverse on this certificate", 404);
    const b = await req.json().catch(() => ({}));
    const reason = String(b.reason || "").trim();
    const prevRef = c.payment.ref || "", prevMode = c.payment.mode || "", prevAmt = num(c.payment.amount);
    // Remove this payment's entry from the payment register (frees the cheque number too).
    const reg = await s.get("register", { type: "json" }) || [];
    const newReg = reg.filter((r) => !(r && r.no === c.no));
    if (newReg.length !== reg.length) await s.setJSON("register", newReg);
    c.payment = null;
    if (c.status === "Paid") c.status = "Approved";
    if (c.audit) c.audit.push({ at: now(), by: me.name, action: `Payment reversed — ${prevMode} ${prevRef} AED ${prevAmt}${reason ? " — " + reason : ""}` });
    await s.setJSON(key, c);
    // Mark the mirrored project cost line back to unpaid (it stays as an approved cost).
    try {
      const xid = "XPC-" + c.no.replace(/[^A-Za-z0-9]+/g, "_");
      const xp = await s.get("expense/" + xid, { type: "json" });
      if (xp) { xp.status = "Pending"; xp.paid = 0; xp.amount = num(c.calc?.net); xp.updatedAt = now(); await s.setJSON("expense/" + xid, xp); }
    } catch (e) {}
    return json({ ok: true, status: c.status });
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
    if (!id) { id = await nextId(s, stg, "clientSeq", "C", "client/", 3); await s.setJSON("settings", stg); }
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
    if (!id) { id = await nextId(s, stg, "contractSeq", "K", "contract/", 3); await s.setJSON("settings", stg); }
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
      // Work-breakdown by building / scope (the BOQ for the by-building IPC). Each
      // line: {ref, name, value, isVariation, remarks}. % done is entered per IPC.
      boq: Array.isArray(b.boq) ? b.boq.map((l, i) => ({ ref: String(l.ref || (i + 1)), name: String(l.name || ""), value: num(l.value), isVariation: !!l.isVariation, remarks: String(l.remarks || "") })) : (ex?.boq || []),
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
    const live = certs.filter((c) => c && c.status !== "Cancelled");
    const certifiedNet = r2(live.reduce((a, c) => a + (c.calc?.net || 0), 0));
    const recovered = r2(live.reduce((a, c) => a + (c.calc?.advanceRecovery || 0), 0));
    const retentionHeld = r2(live.reduce((a, c) => Math.max(a, c.calc?.retention || 0), 0));
    const contraToDate = r2(live.reduce((a, c) => a + num(c.contra), 0));
    // Latest cumulative gross / variations already certified (highest-seq live cert),
    // so a new IPC can show this-period increments.
    const latest = live.slice().sort((a, b) => (b.seq || 0) - (a.seq || 0))[0];
    const grossToDate = latest ? num(latest.calc?.gross) : 0;
    const variationsToDate = latest ? num(latest.calc?.variationsCum) : 0;
    v.summary = {
      certCount: certs.length,
      certifiedNet,
      advanceRecovered: recovered,
      advanceOutstanding: Math.max(0, r2(num(v.advanceAmount) - recovered)),
      retentionHeld, contraToDate, grossToDate, variationsToDate,
      pctToDate: (num(v.contractSum) + num(v.variations)) > 0 ? grossToDate / (num(v.contractSum) + num(v.variations)) : 0
    };
    const client = await s.get("client/" + v.clientId, { type: "json" });
    v.clientName = client?.name || "";
    return json(v);
  }
  if (path === "clientcerts" && req.method === "GET") {
    const [all, clist] = await Promise.all([getAllJSON(s, "clientcert/"), listContracts()]);
    const cmap = {}; for (const c of clist) cmap[c.id] = c;
    const out = all.map((c) => { const ct = cmap[c.contractId] || {}; return { no: c.no, key: c.key || clientCertKey(c.contractId, c.seq), seq: c.seq, date: c.date, contractId: c.contractId, project: ct.project || "", clientId: c.clientId, periodFrom: c.periodFrom, periodTo: c.periodTo, gross: c.calc?.gross, net: c.calc?.net, payable: c.calc?.payable, status: c.status, lines: Array.isArray(c.lines) ? c.lines : void 0 }; });
    out.sort((a, b) => a.no < b.no ? 1 : -1);
    return json(out);
  }
  if (path === "clientreceipts" && req.method === "GET") {
    const proj = url.searchParams.get("project") || "";
    const all = await getAllJSON(s, "clientreceipt/");
    const out = all.filter((r) => r && (!proj || r.project === proj));
    out.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.seq || 0) - (a.seq || 0));
    return json(out);
  }
  if (path === "clientreceipt" && req.method === "POST") {
    if (!can("clientcert") && !can("pay")) return err("No rights to record client receipts", 403);
    const b = await req.json();
    const contract = b.contractId ? await s.get("contract/" + b.contractId, { type: "json" }) : null;
    const project = (contract && contract.project) || String(b.project || "").trim();
    if (!project) return err("Choose the project / contract");
    if (!(num(b.amount) > 0)) return err("Enter the amount received");
    const stg = await s.get("settings", { type: "json" });
    let id = b.id;
    const ex = id ? await s.get("clientreceipt/" + id, { type: "json" }) : null;
    if (!id) { id = await nextId(s, stg, "clientReceiptSeq", "CR", "clientreceipt/", 4); await s.setJSON("settings", stg); }
    const rec = {
      id, seq: ex?.seq || (Number(String(id).replace(/\D/g, "")) || 0),
      contractId: b.contractId || ex?.contractId || "", clientId: (contract && contract.clientId) || ex?.clientId || "",
      project, certNo: String(b.certNo || ex?.certNo || ""),
      date: String(b.date || ex?.date || now().slice(0, 10)).slice(0, 10),
      amount: num(b.amount), mode: String(b.mode || ex?.mode || "Bank Transfer"),
      ref: String(b.ref || ex?.ref || ""), bank: String(b.bank || ex?.bank || ""),
      isRetentionRelease: !!b.isRetentionRelease, isAdvance: !!b.isAdvance,
      notes: String(b.notes || ex?.notes || ""),
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("clientreceipt/" + id, rec);
    return json(rec);
  }
  const crDel = path.match(/^clientreceipt\/([^/]+)$/);
  if (crDel && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    await s.delete("clientreceipt/" + decodeURIComponent(crDel[1]));
    return json({ ok: true });
  }
  /* ---------- Variation Orders (client-side) ----------
     Lifecycle: Draft → Submitted (to client) → Approved / Rejected.
     Approval RECORDS the client's approval; a separate CEO-only "apply" step adds
     the VO value to the contract's Approved Variations (revised contract sum) and
     appends a variation line to the by-building BOQ — auditable, never automatic. */
  if (path === "vos" && req.method === "GET") {
    const [all, clist] = await Promise.all([getAllJSON(s, "vo/"), listContracts()]);
    const cmap = {}; for (const c of clist) cmap[c.id] = c;
    const out = all.map((v) => ({ ...v, project: v.project || cmap[v.contractId]?.project || "" }));
    out.sort((a, b) => a.no < b.no ? 1 : -1);
    return json(out);
  }
  if (path === "vo" && req.method === "POST") {
    if (!can("clientcert")) return err("No rights to record variations", 403);
    const b = await req.json();
    if (!b.contractId) return err("Choose the contract / project");
    const contract = await s.get("contract/" + b.contractId, { type: "json" });
    if (!contract) return err("Contract not found");
    const client = await s.get("client/" + contract.clientId, { type: "json" });
    let ex = null, key = b.key ? String(b.key) : "";
    if (key) {
      ex = await s.get("vo/" + key, { type: "json" }); if (!ex) return err("Variation not found", 404);
      if (ex.status === "Approved" && !can("admin")) return err("Locked after approval", 403);
      if (ex.appliedToContract) return err("Already applied to the contract — record a further VO instead of editing this one");
    }
    let seq = ex?.seq;
    if (!ex) {
      const all = (await getAllJSON(s, "vo/")).filter((v) => v && v.contractId === contract.id);
      seq = all.reduce((a, v) => Math.max(a, v.seq || 0), 0) + 1;
      key = contract.id + "-V" + String(seq).padStart(3, "0");
      let guard = 0; while (await s.get("vo/" + key) && guard++ < 200) { seq++; key = contract.id + "-V" + String(seq).padStart(3, "0"); }
    }
    const lines = Array.isArray(b.lines) ? b.lines.filter((l) => l && (String(l.description || "").trim() || num(l.qty) || num(l.rate))).map((l) => ({ description: String(l.description || ""), unit: String(l.unit || ""), qty: num(l.qty), rate: num(l.rate), amount: r2(num(l.qty) * num(l.rate)) })) : [];
    const amount = lines.length ? r2(lines.reduce((a, l) => a + l.amount, 0)) : num(b.amount);
    if (!(amount > 0)) return err("Enter the variation amount (or measured lines)");
    const title = String(b.title ?? ex?.title ?? "").trim();
    if (!title) return err("Enter the variation title / subject");
    const yr = String(b.date || now()).slice(2, 4);
    const first = String(client?.name || "CLIENT").trim().split(/\s+/)[0].replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "CLIENT";
    const proj = (String(contract.projShort || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || String(contract.project || "PRJ").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3)).slice(0, 3).padEnd(3, "X");
    const rec = {
      key, seq, no: ex?.no || `VO/MA${yr}/${first}/${proj}/${String(seq).padStart(3, "0")}`,
      contractId: contract.id, clientId: contract.clientId, project: contract.project || "",
      title, type: b.type === "omission" ? "omission" : "addition",
      instructionRef: String(b.instructionRef ?? ex?.instructionRef ?? ""),
      description: String(b.description ?? ex?.description ?? ""),
      lines, amount,
      date: String(b.date || ex?.date || now().slice(0, 10)).slice(0, 10),
      dateInstructed: String(b.dateInstructed ?? ex?.dateInstructed ?? "").slice(0, 10),
      certNo: String(b.certNo ?? ex?.certNo ?? ""), proformaRef: String(b.proformaRef ?? ex?.proformaRef ?? ""),
      otherLinks: String(b.otherLinks ?? ex?.otherLinks ?? ""),
      clientApprovalRef: String(b.clientApprovalRef ?? ex?.clientApprovalRef ?? ""),
      notes: String(b.notes ?? ex?.notes ?? ""),
      status: ex?.status || "Draft",
      submittedAt: ex?.submittedAt || "", approvedAt: ex?.approvedAt || "", approvedBy: ex?.approvedBy || "",
      appliedToContract: ex?.appliedToContract || false, appliedAt: ex?.appliedAt || "",
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedBy: me.name, updatedAt: now(),
      audit: [...(ex?.audit || []), { at: now(), by: me.name, action: ex ? "Updated" : "Created (Draft)" }]
    };
    await s.setJSON("vo/" + key, rec);
    return json(rec);
  }
  const voStat = path.match(/^vo\/([^/]+)\/status$/);
  if (voStat && req.method === "POST") {
    const v = await s.get("vo/" + decodeURIComponent(voStat[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    const b = await req.json(); const a = String(b.action || "");
    if (a === "submit") { if (!can("clientcert")) return err("Not permitted", 403); if (!["Draft", "Rejected"].includes(v.status)) return err("Only a draft can be submitted"); v.status = "Submitted"; v.submittedAt = now(); }
    else if (a === "approve") { if (!can("admin")) return err("CEO only", 403); if (!["Submitted", "Draft"].includes(v.status)) return err("Already " + v.status); v.status = "Approved"; v.approvedAt = now(); v.approvedBy = me.name; if (b.clientApprovalRef !== void 0) v.clientApprovalRef = String(b.clientApprovalRef || ""); }
    else if (a === "reject") { if (!can("admin")) return err("CEO only", 403); if (v.appliedToContract) return err("Already applied to the contract"); v.status = "Rejected"; }
    else if (a === "reopen") { if (!can("admin")) return err("CEO only", 403); if (v.appliedToContract) return err("Already applied to the contract — adjust with a new omission VO instead"); v.status = "Draft"; }
    else return err("Unknown action");
    v.audit = [...(v.audit || []), { at: now(), by: me.name, action: "Status → " + v.status }];
    v.updatedAt = now(); v.updatedBy = me.name;
    await s.setJSON("vo/" + v.key, v);
    return json(v);
  }
  const voApply = path.match(/^vo\/([^/]+)\/apply$/);
  if (voApply && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const v = await s.get("vo/" + decodeURIComponent(voApply[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    if (v.status !== "Approved") return err("Only an APPROVED variation can be applied to the contract");
    if (v.appliedToContract) return err("Already applied to the contract");
    const ct = await s.get("contract/" + v.contractId, { type: "json" });
    if (!ct) return err("Contract not found", 404);
    const delta = v.type === "omission" ? -num(v.amount) : num(v.amount);
    ct.variations = r2(num(ct.variations) + delta);
    if (Array.isArray(ct.boq) && ct.boq.length) {
      ct.boq.push({ ref: "V" + v.seq, name: `VO ${v.no} — ${v.title}`, value: delta, isVariation: true, remarks: "VO applied " + now().slice(0, 10) });
    }
    ct.updatedAt = now();
    await s.setJSON("contract/" + ct.id, ct);
    v.appliedToContract = true; v.appliedAt = now();
    v.audit = [...(v.audit || []), { at: now(), by: me.name, action: `Applied to contract — Approved Variations ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}; revised contract sum updated` }];
    v.updatedAt = now(); v.updatedBy = me.name;
    await s.setJSON("vo/" + v.key, v);
    return json({ ok: true, vo: v, contract: ct });
  }
  const voOne = path.match(/^vo\/([^/]+)$/);
  if (voOne && req.method === "GET") {
    const v = await s.get("vo/" + decodeURIComponent(voOne[1]), { type: "json" });
    if (!v) return err("Not found", 404);
    const contract = await s.get("contract/" + v.contractId, { type: "json" });
    const client = contract ? await s.get("client/" + contract.clientId, { type: "json" }) : null;
    return json({ ...v, contract, client });
  }
  if (voOne && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    const v = await s.get("vo/" + decodeURIComponent(voOne[1]), { type: "json" });
    if (v && v.appliedToContract) return err("Applied to the contract — cannot delete; record an omission VO instead");
    await s.delete("vo/" + decodeURIComponent(voOne[1]));
    return json({ ok: true });
  }
  if (path === "treasury" && req.method === "GET") {
    if (!can("pnl") && !can("pay")) return err("Not permitted", 403);
    return json(await computeTreasury(s));
  }
  // Mark a cheque cleared / returned (or back to due) — the finance team keeps
  // this in step with the bank statement.
  if (path === "cheque/status" && req.method === "POST") {
    if (!can("pay") && !can("admin")) return err("Not permitted", 403);
    const b = await req.json();
    const key = String(b.key || "");
    if (!/^(out|in):/.test(key)) return err("Unknown cheque");
    const status = ["Due", "Cleared", "Returned"].includes(String(b.status)) ? String(b.status) : "Due";
    const map = await s.get("chequestatus", { type: "json" }) || {};
    if (status === "Due") delete map[key];
    else map[key] = { status, clearedAt: String(b.clearedAt || now().slice(0, 10)).slice(0, 10), note: String(b.note || ""), by: me.name, at: now() };
    await s.setJSON("chequestatus", map);
    return json({ ok: true, key, status });
  }
  if (path === "bankopening" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const b = await req.json();
    const stg = await s.get("settings", { type: "json" }) || {};
    const name = String(b.name || "").trim();
    if (!name) return err("Account name required");
    if (!Array.isArray(stg.banks)) stg.banks = [];
    if (!stg.banks.includes(name)) stg.banks.push(name);
    stg.bankOpening = stg.bankOpening || {};
    stg.bankOpening[name] = { balance: num(b.balance), date: String(b.date || "").slice(0, 10) };
    await s.setJSON("settings", stg);
    return json({ ok: true });
  }
  if (path === "bankmove" && req.method === "POST") {
    if (!can("pay") && !can("admin")) return err("Not permitted", 403);
    const b = await req.json();
    const type = String(b.type || "").trim();
    const okTypes = ["deposit", "withdrawal", "charge", "transfer", "adjust-in", "adjust-out"];
    if (!okTypes.includes(type)) return err("Invalid movement type");
    if (!(num(b.amount) > 0)) return err("Enter an amount");
    if (!String(b.account || "").trim()) return err("Choose the account");
    if (type === "transfer" && !String(b.toAccount || "").trim()) return err("Choose the destination account for a transfer");
    const stg = await s.get("settings", { type: "json" }) || {};
    let id = b.id, ex = null;
    if (id) { ex = await s.get("bankmove/" + id, { type: "json" }); if (!ex) return err("Movement not found", 404); }
    else { id = await nextId(s, stg, "bankMoveSeq", "BM", "bankmove/", 4); await s.setJSON("settings", stg); }
    const rec = { id, type, account: String(b.account).trim(), toAccount: String(b.toAccount || "").trim(), amount: num(b.amount), date: String(b.date || now().slice(0, 10)).slice(0, 10), ref: String(b.ref || ""), description: String(b.description || ""), createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedBy: me.name, updatedAt: now() };
    await s.setJSON("bankmove/" + id, rec);
    return json(rec);
  }
  const bmDel = path.match(/^bankmove\/([^/]+)$/);
  if (bmDel && req.method === "DELETE") {
    if (!can("admin")) return err("CEO only", 403);
    await s.delete("bankmove/" + decodeURIComponent(bmDel[1]));
    return json({ ok: true });
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
    // By-building IPC: when per-building lines are supplied, cumulative gross and the
    // variations portion are derived from Σ(BOQ value × cumulative % done).
    const hasLines = Array.isArray(b.lines) && b.lines.length > 0;
    const lines = hasLines ? b.lines.map((l) => ({ ref: String(l.ref || ""), name: String(l.name || ""), value: num(l.value), pct: num(l.pct), isVariation: !!l.isVariation, remarks: String(l.remarks || "") })) : [];
    const g = hasLines ? ccGrossFromLines(lines) : { grossCum: num(b.grossCum), variationsCum: num(b.variationsCum) };
    const cert = {
      no, key, seq, contractId: contract.id, clientId: contract.clientId,
      createdBy: me.id, createdAt: now(),
      date,
      periodFrom: b.periodFrom || "", periodTo: b.periodTo || "",
      lines, grossCum: g.grossCum, variationsCum: g.variationsCum, mos: num(b.mos), contra: num(b.contra),
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
    if (Array.isArray(b.lines)) {
      c.lines = b.lines.map((l) => ({ ref: String(l.ref || ""), name: String(l.name || ""), value: num(l.value), pct: num(l.pct), isVariation: !!l.isVariation, remarks: String(l.remarks || "") }));
      const g = ccGrossFromLines(c.lines);
      c.grossCum = g.grossCum; c.variationsCum = g.variationsCum;
    } else {
      for (const f of ["grossCum", "variationsCum", "mos", "contra"]) if (b[f] !== void 0) c[f] = num(b[f]);
    }
    if (b.mos !== void 0) c.mos = num(b.mos);
    if (b.contra !== void 0) c.contra = num(b.contra);
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
        const id = await nextId(s, stg, "clientSeq", "C", "client/", 3);
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
        const id = await nextId(s, stg, "contractSeq", "K", "contract/", 3);
        contract = { id, ...fields, notes: kb.notes || "", createdAt: now(), createdBy: me.name, updatedAt: now() };
        await s.setJSON("contract/" + id, contract);
        await s.setJSON("settings", stg);
      }
      // Register the project into the Settings registry (single source of truth)
      // so an imported project also appears in every page's dropdown.
      { const st2 = await s.get("settings", { type: "json" });
        if (!Array.isArray(st2.projects)) st2.projects = [];
        if (!st2.projects.some((p) => p && String(p.name || "").trim().toLowerCase() === String(fields.project).trim().toLowerCase())) {
          st2.projects.push({ code: fields.projShort || String(fields.project).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3), name: fields.project });
          await s.setJSON("settings", st2);
        }
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
  if (path === "project/merge" && req.method === "POST") {
    if (!can("admin")) return err("CEO only", 403);
    const b = await req.json();
    const fromRaw = (Array.isArray(b.from) ? b.from : [b.from]).map((x) => String(x || "").trim()).filter(Boolean);
    const to = String(b.to || "").trim();
    let toCode = String(b.toCode || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3);
    if (!fromRaw.length || !to) return err("Choose the project(s) to merge and the name to keep");
    const fromSet = new Set(fromRaw.map((x) => x.toLowerCase()));
    const isFrom = (p) => fromSet.has(String(p || "").trim().toLowerCase());
    const counts = { contracts: 0, supplierCerts: 0, expenses: 0, register: 0, budgets: 0 };
    // contracts (client IPCs inherit their project from the contract, so this covers them too)
    for (const bl of (await s.list({ prefix: "contract/" })).blobs) {
      const c = await s.get(bl.key, { type: "json" });
      if (c && isFrom(c.project)) { c.project = to; if (toCode) c.projShort = toCode; c.updatedAt = now(); await s.setJSON(bl.key, c); counts.contracts++; }
    }
    // supplier certificates
    for (const bl of (await s.list({ prefix: "cert/" })).blobs) {
      const c = await s.get(bl.key, { type: "json" });
      if (c && isFrom(c.project)) { c.project = to; c.updatedAt = now(); await s.setJSON(bl.key, c); counts.supplierCerts++; }
    }
    // expenses (incl. auto-posted supplier-IPC cost lines)
    for (const bl of (await s.list({ prefix: "expense/" })).blobs) {
      const e = await s.get(bl.key, { type: "json" });
      if (e && isFrom(e.project)) { e.project = to; e.updatedAt = now(); await s.setJSON(bl.key, e); counts.expenses++; }
    }
    // payment register
    const reg = await s.get("register", { type: "json" }) || [];
    let regChanged = false;
    for (const r of reg) { if (r && isFrom(r.project)) { r.project = to; counts.register++; regChanged = true; } }
    if (regChanged) await s.setJSON("register", reg);
    // budgets: merge lines from each source into the kept project's budget, then remove the old ones
    const toSlug = budgetSlug(to);
    const target = await s.get("budget/" + toSlug, { type: "json" }) || { project: to, lines: [] };
    for (const f of fromRaw) {
      if (f.toLowerCase() === to.toLowerCase()) continue;
      const bud = await s.get("budget/" + budgetSlug(f), { type: "json" });
      if (bud && Array.isArray(bud.lines) && bud.lines.length) { target.lines = (target.lines || []).concat(bud.lines); counts.budgets++; }
      try { await s.delete("budget/" + budgetSlug(f)); } catch {}
    }
    target.project = to;
    await s.setJSON("budget/" + toSlug, target);
    // settings project list: drop the merged-away names, ensure the kept one exists
    const st = await s.get("settings", { type: "json" });
    const keep = [];
    let toEntry = null;
    for (const p of (st.projects || [])) {
      if (!p) continue;
      if (String(p.name).trim().toLowerCase() === to.toLowerCase()) { toEntry = p; keep.push(p); continue; }
      if (isFrom(p.name)) continue; // merged away
      keep.push(p);
    }
    if (!toEntry) { toEntry = { code: toCode || to.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3), name: to }; keep.push(toEntry); }
    else if (toCode) toEntry.code = toCode;
    st.projects = keep;
    ensureHQProject(st);
    await s.setJSON("settings", st);
    return json({ ok: true, to, code: toEntry.code, counts });
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
    if (!id) { id = await nextId(s, stg, "expenseSeq", "X", "expense/", 5); await s.setJSON("settings", stg); }
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
      fromAdvance: b.fromAdvance === void 0 ? !!ex?.fromAdvance : !!b.fromAdvance,
      notes: str("notes"),
      supplierCertNo: ex?.supplierCertNo || b.supplierCertNo || null,
      source: ex?.source || "manual",
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    exp.vat = r2(exp.amount * exp.vatPct);
    exp.gross = r2(exp.amount + exp.vat);
    await s.setJSON("expense/" + id, exp);
    // Reallocation: if a linked Supplier-IPC cost line is moved to another
    // project, move its parent certificate too so the two never diverge.
    if (exp.source === "supplier-ipc" && exp.supplierCertNo) {
      try {
        const pc = await s.get("cert/" + exp.supplierCertNo, { type: "json" });
        if (pc && String(pc.project || "") !== String(exp.project || "")) {
          pc.project = exp.project;
          pc.audit = pc.audit || [];
          pc.audit.push({ at: now(), by: me.name, action: `Project reallocated to ${exp.project} (via cost log)` });
          await s.setJSON("cert/" + pc.no, pc);
        }
      } catch {}
    }
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
        fromAdvance: !!r.fromAdvance,
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
  if (path === "expenses/bulk-assign" && req.method === "POST") {
    // Bulk-tag existing cost-log rows (typically old imported payments): set
    // their project and/or mark them as paid from the client down payment.
    if (!can("expense")) return err("No rights", 403);
    const b = await req.json();
    const ids = Array.isArray(b.ids) ? b.ids.map(String) : [];
    if (!ids.length) return err("No rows selected");
    const setProject = b.project !== void 0 && b.project !== null && String(b.project).trim() !== "";
    const project = setProject ? String(b.project).trim() : null;
    const setAdvance = b.fromAdvance !== void 0 && b.fromAdvance !== null;
    const fromAdvance = !!b.fromAdvance;
    let updated = 0, ipcMoved = 0;
    for (const id of ids) {
      const e = await s.get("expense/" + id, { type: "json" });
      if (!e) continue;
      let changed = false;
      // Reallocating a Supplier-IPC line moves its parent certificate too, and is CEO-only.
      if (setProject && String(e.project || "") !== project) {
        if (e.source === "supplier-ipc") {
          if (me.role === "CEO" && e.supplierCertNo) {
            try {
              const pc = await s.get("cert/" + e.supplierCertNo, { type: "json" });
              if (pc && String(pc.project || "") !== project) {
                pc.project = project; pc.audit = pc.audit || [];
                pc.audit.push({ at: now(), by: me.name, action: `Project reallocated to ${project} (bulk assign)` });
                await s.setJSON("cert/" + pc.no, pc); ipcMoved++;
              }
              e.project = project; changed = true;
            } catch {}
          }
        } else { e.project = project; changed = true; }
      }
      if (setAdvance && !!e.fromAdvance !== fromAdvance) { e.fromAdvance = fromAdvance; changed = true; }
      if (changed) { e.updatedAt = now(); e.updatedBy = me.name; await s.setJSON("expense/" + id, e); updated++; }
    }
    return json({ ok: true, updated, ipcMoved });
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
  // ===================== MARKETING ENDPOINTS =====================
  if (path === "mkt" && req.method === "GET") {
    if (!can("marketing")) return err("Marketing is for the Marketing department / CEO", 403);
    const [posts, audiences] = await Promise.all([listPosts(), listAudiences()]);
    const light = posts.map((p) => ({ ...p, media: (p.media || []).map((m, i) => ({ name: m.name, type: m.type, size: m.size, i })) }));
    const kpi = { total: posts.length, published: posts.filter((p) => p.status === "Published").length, scheduled: posts.filter((p) => p.status === "Scheduled").length, review: posts.filter((p) => p.status === "Review").length, draft: posts.filter((p) => p.status === "Draft").length, failed: posts.filter((p) => p.status === "Failed").length };
    return json({ posts: light, audiences: audiences.map((a) => ({ id: a.id, name: a.name, count: (a.contacts || []).length, updatedAt: a.updatedAt })), channels: MKT_CHANNELS, statuses: MKT_STATUS, types: MKT_TYPES, status: mktChannelStatus(), kpi, builtIn: [{ id: "clients", name: "Clients (registered)" }, { id: "suppliers", name: "Suppliers & subcontractors" }, { id: "staff", name: "Staff (HR system)" }], waTemplate: mktEnv().waDefaultTemplate, cronReady: !!process.env.CRON_KEY });
  }
  if (path === "mkt/post" && req.method === "POST") {
    if (!can("marketing")) return err("No rights", 403);
    const b = await req.json();
    const stg = await s.get("settings", { type: "json" }) || {};
    let id = b.id; const ex = id ? await s.get("mkt/post/" + id, { type: "json" }) : null;
    if (id && !ex) return err("Post not found", 404);
    if (ex && ["Published"].includes(ex.status) && !can("admin")) return err("A published post cannot be edited", 403);
    if (!id) { id = await nextId(s, stg, "mktSeq", "MK", "mkt/post/", 4); await s.setJSON("settings", stg); }
    const channels = (Array.isArray(b.channels) ? b.channels : []).filter((c) => MKT_CHANNELS.some((x) => x.code === c));
    if (!b.title) return err("Give the post a title");
    if (!channels.length) return err("Choose at least one channel");
    const media = [];
    for (const m of (Array.isArray(b.media) ? b.media : ex?.media || []).slice(0, 4)) {
      if (!m) continue;
      if (m.keep && ex) { const old = (ex.media || [])[m.i]; if (old) media.push(old); continue; }
      if (!m.data || !/^data:(image\/(jpeg|png)|video\/mp4|application\/pdf);base64,/.test(m.data)) continue;
      const size = Math.round(String(m.data).length * 0.75);
      if (size > 4.5e6) return err(`${m.name || "File"} is larger than 4.5 MB — resize the picture first.`);
      media.push({ name: String(m.name || "media"), type: String(m.data).slice(5, String(m.data).indexOf(";")), size, data: m.data });
    }
    const st = MKT_STATUS.includes(b.status) ? b.status : ex?.status || "Draft";
    const post = {
      id, title: String(b.title).trim(), type: MKT_TYPES.includes(b.type) ? b.type : "Other", campaign: String(b.campaign || ""), project: String(b.project || ""),
      channels, body: String(b.body || ""), hashtags: String(b.hashtags || ""), link: String(b.link || ""), emailSubject: String(b.emailSubject || ""),
      audienceId: String(b.audienceId || ""), waTemplate: String(b.waTemplate || ""), waLang: String(b.waLang || "en"), waParams: Array.isArray(b.waParams) ? b.waParams.map(String).filter(Boolean) : [],
      scheduledAt: b.scheduledAt ? String(b.scheduledAt) : "", status: st, media, mediaKey: ex?.mediaKey || randomBytes(8).toString("hex"),
      published: ex?.published || {}, failed: ex?.failed || {}, log: ex?.log || [],
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    if (!ex) mktLog(post, { action: "Created", by: me.name });
    await s.setJSON("mkt/post/" + id, post);
    return json({ ...post, media: post.media.map((m, i) => ({ name: m.name, type: m.type, size: m.size, i })) });
  }
  if (path.startsWith("mkt/post/") && req.method === "GET") {
    if (!can("marketing")) return err("No rights", 403);
    const id = path.split("/")[2];
    const p = await s.get("mkt/post/" + id, { type: "json" });
    if (!p) return err("Not found", 404);
    const sent = {}; for (const ch of ["whatsapp", "email"]) { const r = await s.get(`mkt/sent/${id}-${ch}`, { type: "json" }); if (r) sent[ch] = { done: Object.keys(r.done || {}).length, failed: r.failed || {}, total: r.total, updatedAt: r.updatedAt }; }
    return json({ ...p, media: (p.media || []).map((m, i) => ({ name: m.name, type: m.type, size: m.size, i, preview: /^image\//.test(m.type) ? m.data : "" })), sent });
  }
  if (path.startsWith("mkt/post/") && path.endsWith("/status") && req.method === "POST") {
    if (!can("marketing")) return err("No rights", 403);
    const id = path.split("/")[2]; const b = await req.json();
    const p = await s.get("mkt/post/" + id, { type: "json" }); if (!p) return err("Not found", 404);
    const to = b.status;
    if (!MKT_STATUS.includes(to)) return err("Bad status");
    // Marketing prepares (Draft → Review); the CEO approves / schedules / cancels.
    if (["Approved", "Scheduled"].includes(to) && !can("marketingApprove")) return err("Approval is reserved for the CEO", 403);
    if (to === "Scheduled" && !(p.scheduledAt || b.scheduledAt)) return err("Set the date & time to schedule");
    if (b.scheduledAt) p.scheduledAt = String(b.scheduledAt);
    mktLog(p, { action: `${p.status} → ${to}`, by: me.name, note: b.note || "" });
    p.status = to; p.updatedAt = now(); p.updatedBy = me.name;
    if (to === "Approved") { p.approvedBy = me.name; p.approvedAt = now(); }
    await s.setJSON("mkt/post/" + id, p);
    return json({ ok: true, status: p.status });
  }
  if (path.startsWith("mkt/post/") && path.endsWith("/publish") && req.method === "POST") {
    if (!can("marketingPublish")) return err("Publishing is reserved for the CEO", 403);
    const id = path.split("/")[2]; const b = await req.json();
    const p = await s.get("mkt/post/" + id, { type: "json" }); if (!p) return err("Not found", 404);
    if (!["Approved", "Scheduled", "Failed", "Published"].includes(p.status)) return err("Approve the post first (Review → Approved), then publish.");
    const chs = (Array.isArray(b.channels) && b.channels.length ? b.channels : p.channels).filter((c) => ["linkedin", "instagram", "facebook"].includes(c) && p.channels.includes(c));
    if (!chs.length) return err("No social channel on this post — WhatsApp and e-mail go out with “Send broadcast”.");
    const results = {};
    for (const ch of chs) {
      try { const r = await publishToChannel(s, p, ch); p.published = p.published || {}; p.published[ch] = { at: now(), id: r.id || r.post_id || "" }; if (p.failed) delete p.failed[ch]; mktLog(p, { channel: ch, ok: true, id: r.id || r.post_id || "", by: me.name }); results[ch] = { ok: true, id: r.id || r.post_id || "" }; }
      catch (e) { p.failed = p.failed || {}; p.failed[ch] = { at: now(), error: e.message }; mktLog(p, { channel: ch, ok: false, error: e.message, by: me.name }); results[ch] = { ok: false, error: e.message }; }
    }
    mktRollStatus(p); p.updatedAt = now();
    await s.setJSON("mkt/post/" + id, p);
    return json({ ok: true, status: p.status, results });
  }
  if (path.startsWith("mkt/post/") && path.endsWith("/broadcast") && req.method === "POST") {
    if (!can("marketingPublish")) return err("Sending broadcasts is reserved for the CEO", 403);
    const id = path.split("/")[2]; const b = await req.json();
    const p = await s.get("mkt/post/" + id, { type: "json" }); if (!p) return err("Not found", 404);
    if (!["Approved", "Scheduled", "Failed", "Published"].includes(p.status)) return err("Approve the post first, then send.");
    const ch = b.channel; if (!["whatsapp", "email"].includes(ch) || !p.channels.includes(ch)) return err("This post has no " + ch + " channel");
    let r;
    try { r = await broadcastPost(s, p, ch, { audienceId: b.audienceId, template: b.template, lang: b.lang, params: b.params, batch: b.batch }); }
    catch (e) { return err(e.message); }
    if (b.audienceId) p.audienceId = b.audienceId;
    if (!r.remaining) mktLog(p, { channel: ch, ok: r.failed === 0, sent: r.doneTotal, failed: r.failed, by: me.name });
    mktRollStatus(p); p.updatedAt = now();
    await s.setJSON("mkt/post/" + id, p);
    return json({ ok: true, ...r, status: p.status });
  }
  if (path.startsWith("mkt/post/") && req.method === "DELETE") {
    if (!can("marketingApprove")) return err("CEO only", 403);
    const id = path.split("/")[2];
    await s.delete("mkt/post/" + id); for (const ch of ["whatsapp", "email"]) { try { await s.delete(`mkt/sent/${id}-${ch}`); } catch {} }
    return json({ ok: true });
  }
  if (path === "mkt/audience" && req.method === "POST") {
    if (!can("marketing")) return err("No rights", 403);
    const b = await req.json();
    if (!b.name) return err("List name is required");
    const stg = await s.get("settings", { type: "json" }) || {};
    let id = b.id; const ex = id ? await s.get("mkt/audience/" + id, { type: "json" }) : null;
    if (!id) { id = await nextId(s, stg, "mktAudSeq", "AUD", "mkt/audience/", 3); await s.setJSON("settings", stg); }
    const contacts = (Array.isArray(b.contacts) ? b.contacts : ex?.contacts || []).map((c) => ({ name: String(c.name || "").trim(), email: String(c.email || "").trim().toLowerCase(), phone: normPhone(c.phone) || String(c.phone || "").trim(), company: String(c.company || "").trim(), consent: c.consent !== false })).filter((c) => c.email || c.phone).slice(0, 5000);
    const rec = { id, name: String(b.name).trim(), description: String(b.description || ""), contacts, createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name };
    await s.setJSON("mkt/audience/" + id, rec);
    return json({ id, name: rec.name, count: contacts.length });
  }
  if (path.startsWith("mkt/audience/") && req.method === "GET") {
    if (!can("marketing")) return err("No rights", 403);
    const id = path.split("/")[2];
    if (["clients", "suppliers", "staff"].includes(id)) { try { const list = await resolveAudience(s, id); return json({ id, builtIn: true, contacts: list, count: list.length }); } catch (e) { return err(e.message); } }
    const a = await s.get("mkt/audience/" + id, { type: "json" }); if (!a) return err("Not found", 404);
    return json(a);
  }
  if (path.startsWith("mkt/audience/") && req.method === "DELETE") {
    if (!can("marketingApprove")) return err("CEO only", 403);
    await s.delete("mkt/audience/" + path.split("/")[2]); return json({ ok: true });
  }
  if (path === "mkt/test" && req.method === "POST") {
    // Connection test per channel: a cheap read against each API with the stored token.
    if (!can("marketing")) return err("No rights", 403);
    const env = mktEnv(), st = mktChannelStatus(), out = {};
    for (const ch of ["facebook", "instagram", "whatsapp", "linkedin"]) {
      if (!st[ch].ready) { out[ch] = { ok: false, error: "not configured — " + st[ch].need }; continue; }
      try {
        if (ch === "facebook") { const r = await graphCall(`${GRAPH_API}/${env.fbPageId}?fields=name`, null, env.metaToken); out[ch] = { ok: true, detail: r.name }; }
        else if (ch === "instagram") { const r = await graphCall(`${GRAPH_API}/${env.igUserId}?fields=username`, null, env.metaToken); out[ch] = { ok: true, detail: "@" + r.username }; }
        else if (ch === "whatsapp") { const r = await graphCall(`${GRAPH_API}/${env.waPhoneId}?fields=display_phone_number,verified_name`, null, env.metaToken); out[ch] = { ok: true, detail: `${r.verified_name || ""} ${r.display_phone_number || ""}`.trim() }; }
        else { const rs = await fetch(`${LI_API}/organizations/${env.liOrg}`, { headers: { Authorization: "Bearer " + env.liToken, "LinkedIn-Version": "202409", "X-Restli-Protocol-Version": "2.0.0" } }); const j = await rs.json().catch(() => ({})); out[ch] = rs.ok ? { ok: true, detail: j.localizedName || "connected" } : { ok: false, error: j.message || ("HTTP " + rs.status) }; }
      } catch (e) { out[ch] = { ok: false, error: e.message }; }
    }
    return json(out);
  }
  // ===================== OPERATIONS COST / HR MANAGEMENT ENDPOINTS =====================
  if (path === "ops" && req.method === "GET") {
    if (!can("ops")) return err("No rights", 403);
    const month = url.searchParams.get("month") || now().slice(0, 7);
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const d = await computeOps(s, month);
    if (!can("opsPayroll") && d.payroll) {
      // Salary detail is CEO / Accounts only — others see totals without names.
      d.payroll = { ...d.payroll, rows: [], restricted: true };
    }
    d.hrLink = { url: HR_BASE(), configured: !!process.env.HR_API_KEY };
    return json(d);
  }
  // ---- fixed expense register ----
  if (path === "ops/fixed" && req.method === "POST") {
    if (!can("opsEdit")) return err("No rights to edit the fixed expense register", 403);
    const b = await req.json();
    if (!b.name) return err("Item name is required");
    if (!(num(b.amount) > 0)) return err("Amount must be greater than zero");
    if (!OPS_FREQ[b.freq || "monthly"]) return err("Choose a valid frequency");
    const stg = await s.get("settings", { type: "json" });
    let id = b.id; const ex = id ? await s.get("opsfixed/" + id, { type: "json" }) : null;
    if (!id) { id = await nextId(s, stg, "opsFixedSeq", "FX", "opsfixed/", 3); await s.setJSON("settings", stg); }
    const str = (k) => b[k] === void 0 ? ex?.[k] || "" : String(b[k] || "");
    const item = {
      id, name: String(b.name).trim(), cat: str("cat") || "Other fixed", vendor: str("vendor"), ref: str("ref"),
      amount: r2(num(b.amount)), vatPct: b.vatPct === void 0 ? (ex ? num(ex.vatPct) : 0.05) : num(b.vatPct), freq: b.freq || ex?.freq || "monthly",
      dueDay: Math.min(28, Math.max(1, num(b.dueDay) || num(ex?.dueDay) || 1)),
      startDate: str("startDate").slice(0, 10), endDate: str("endDate").slice(0, 10),
      entity: str("entity"), status: b.status || ex?.status || "Active", notes: str("notes"),
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("opsfixed/" + id, item);
    return json(item);
  }
  if (path.startsWith("ops/fixed/") && req.method === "DELETE") {
    if (!can("opsEdit")) return err("No rights", 403);
    const id = path.slice("ops/fixed/".length);
    const ex = await s.get("opsfixed/" + id, { type: "json" });
    if (!ex) return err("Not found", 404);
    // Keep history: retire instead of hard delete once it has ever been posted.
    const posted = (await listExpenses(HQ_PROJECT)).some((e) => String(e.id || "").endsWith("-" + id) && e.source === "ops-fixed");
    if (posted) { ex.status = "Retired"; ex.endDate = ex.endDate || now().slice(0, 10); ex.updatedAt = now(); ex.updatedBy = me.name; await s.setJSON("opsfixed/" + id, ex); return json({ ok: true, retired: true }); }
    await s.delete("opsfixed/" + id);
    return json({ ok: true, deleted: true });
  }
  // Post this month's accrual of every live fixed item into the HQ cost ledger
  // (idempotent — an item already posted for the month is left untouched).
  if (path === "ops/fixed/post" && req.method === "POST") {
    if (!can("opsPost")) return err("No rights to post operations cost", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const fixed = (await listOpsFixed()).filter((f) => fixedActiveIn(f, month));
    let created = 0, skipped = 0, total = 0;
    for (const f of fixed) {
      const xid = `XFX-${month}-${f.id}`;
      if (await s.get("expense/" + xid)) { skipped++; continue; }
      const amt = fixedMonthly(f);
      if (!(amt > 0)) { skipped++; continue; }
      const day = String(f.dueDay || 1).padStart(2, "0");
      const exp = {
        id: xid, seq: 0, project: HQ_PROJECT, date: `${month}-${day}`, area: "", category: "Head Office Overhead", costType: "Overhead / Admin",
        supplier: f.vendor || "", supplierId: null, invoiceNo: f.ref || "", description: `${f.name} — ${f.cat}${f.freq !== "monthly" ? ` (${f.freq} bill accrued monthly)` : ""}`,
        poRef: "", boqRef: "", budgeted: 0, amount: amt, vatPct: num(f.vatPct), status: "Pending", paid: 0, fromAdvance: false,
        notes: `Fixed expense ${f.id} · ${month}`, supplierCertNo: null, source: "ops-fixed", opsRef: f.id, month,
        createdBy: me.name, createdAt: now(), updatedAt: now(), updatedBy: me.name
      };
      exp.vat = r2(exp.amount * exp.vatPct); exp.gross = r2(exp.amount + exp.vat);
      await s.setJSON("expense/" + xid, exp); created++; total = r2(total + amt);
    }
    return json({ ok: true, month, created, skipped, total });
  }
  // ---- payroll: import (CSV / Excel rows from the HR system) or pull live ----
  if (path === "ops/payroll/import" && req.method === "POST") {
    if (!can("opsPayroll")) return err("Payroll is CEO / Accounts only", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const rows = normalisePayrollRows(b.rows);
    if (!rows.length) return err("No employee rows found — export the salary list from the HR system (Payroll → Export Excel) and import that file.");
    const rec = { month, rows, source: b.source || "file", fileName: String(b.fileName || ""), importedBy: me.name, importedAt: now() };
    await s.setJSON("opspayroll/" + month, rec);
    // Seed staff records so every employee can be assigned to a project.
    for (const r of rows) { const k = "opsstaff/" + r.empId.replace(/[^A-Za-z0-9_-]+/g, "_"); const ex = await s.get(k, { type: "json" }); if (!ex) await s.setJSON(k, { empId: r.empId, name: r.name, role: r.role, company: r.company, splits: [], costType: "Labour (Indirect)", updatedAt: now(), updatedBy: me.name }); else if (ex.name !== r.name || ex.role !== r.role) { ex.name = r.name; ex.role = r.role || ex.role; await s.setJSON(k, ex); } }
    return json({ ok: true, month, count: rows.length, cost: r2(rows.reduce((t, r) => t + payrollCost(r), 0)) });
  }
  if (path === "ops/payroll/pull" && req.method === "POST") {
    if (!can("opsPayroll")) return err("Payroll is CEO / Accounts only", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    let data;
    try { data = await hrGet(`/admin/payroll-split?month=${month}`); }
    catch (e) { return err(e.message + " — you can still import the salary list file (Payroll → Export Excel in the HR system)."); }
    const list = data.rows || data.employees || data.all?.rows || (Array.isArray(data) ? data : null) || [...(data.wps?.rows || []), ...(data.cash?.rows || [])];
    const rows = normalisePayrollRows(list);
    if (!rows.length) return err("HR system answered but no payroll rows were recognised for " + month + " — import the salary list file instead.");
    const rec = { month, rows, source: "hr-link", importedBy: me.name, importedAt: now(),
      hr: { wps: data.wps || null, cash: data.cash || null, all: data.all || null, excluded: data.excluded || [], payrollRun: data.payrollRun || null } };
    await s.setJSON("opspayroll/" + month, rec);
    for (const r of rows) { const k = "opsstaff/" + r.empId.replace(/[^A-Za-z0-9_-]+/g, "_"); if (!(await s.get(k))) await s.setJSON(k, { empId: r.empId, name: r.name, role: r.role, company: r.company, splits: [], costType: "Labour (Indirect)", updatedAt: now(), updatedBy: me.name }); }
    return json({ ok: true, month, count: rows.length, source: "hr-link", excluded: (data.excluded || []).length, payrollRun: data.payrollRun || null });
  }
  // Pull attendance for a run of days (≤ 10 per call — the HR overview reads one
  // day at a time) and roll it up into man-days per employee per site.
  if (path === "ops/attendance/pull" && req.method === "POST") {
    if (!can("opsEdit")) return err("No rights", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const last = monthEnd(month);
    const from = /^\d{4}-\d{2}-\d{2}$/.test(b.from || "") ? b.from : month + "-01";
    let to = /^\d{4}-\d{2}-\d{2}$/.test(b.to || "") ? b.to : last;
    if (to > last) to = last;
    const today = now().slice(0, 10); if (to > today) to = today;
    const dates = [];
    for (let d = new Date(from + "T00:00:00Z"); d.toISOString().slice(0, 10) <= to && dates.length < 10; d.setUTCDate(d.getUTCDate() + 1)) dates.push(d.toISOString().slice(0, 10));
    const att = (await s.get("opsatt/" + month, { type: "json" })) || { month, byDay: {}, byEmp: {}, sites: {}, siteList: [], from: month + "-01", to: last };
    if (b.reset) { att.byDay = {}; att.byEmp = {}; att.sites = {}; }
    if (from === month + "-01" || !att.siteList?.length) {
      try { const sl = await hrGet("/admin/sites"); att.siteList = (Array.isArray(sl) ? sl : sl.sites || []).map((x) => x && (x.name || x)).filter(Boolean).map(String); } catch {}
    }
    let fetched = 0;
    try {
      const results = await Promise.all(dates.map((d) => hrGet(`/admin/overview?date=${d}`)));
      results.forEach((ov, i) => {
        const date = dates[i]; const day = {};
        for (const r of ov.rows || []) {
          const ev = (r.events || []).find((x) => x.type === "in") || (r.events || [])[0];
          const worked = (r.events || []).length > 0 || r.status === "in" || !!r.overnight;
          if (!worked) continue;
          const site = hrSiteKey(ev?.siteName || r.site || "Unknown location") || "Unknown location";
          day[r.id] = site;
        }
        att.byDay[date] = day; fetched++;
      });
    } catch (e) { return err(e.message); }
    // rebuild the roll-ups from byDay so re-pulls never double count
    att.byEmp = {}; att.sites = {}; let staffDays = 0;
    for (const date in att.byDay) for (const emp in att.byDay[date]) { const site = att.byDay[date][emp]; att.byEmp[emp] = att.byEmp[emp] || {}; att.byEmp[emp][site] = (att.byEmp[emp][site] || 0) + 1; att.sites[site] = (att.sites[site] || 0) + 1; staffDays++; }
    att.staffDays = staffDays; att.pulledAt = now(); att.pulledBy = me.name;
    await s.setJSON("opsatt/" + month, att);
    const nextFrom = dates.length ? new Date(new Date(dates[dates.length - 1] + "T00:00:00Z").getTime() + 864e5).toISOString().slice(0, 10) : null;
    return json({ ok: true, month, fetched, days: Object.keys(att.byDay).length, next: nextFrom && nextFrom <= to ? nextFrom : null, to, sites: att.sites, staffDays });
  }
  // Map each HR check-in site (geofence) to a finance project (or HQ / ignore).
  if (path === "ops/sitemap" && req.method === "POST") {
    if (!can("opsEdit")) return err("No rights", 403);
    const b = await req.json();
    const stg = await s.get("settings", { type: "json" }) || {};
    const map = {}; for (const k in (b.map || {})) { const v = String(b.map[k] || "").trim(); if (v) map[String(k).trim()] = v; }
    stg.hrSiteMap = map; await s.setJSON("settings", stg);
    return json({ ok: true, map });
  }
  if (path === "ops/staff" && req.method === "POST") {
    if (!can("opsEdit")) return err("No rights", 403);
    const b = await req.json();
    if (!b.empId) return err("Employee id required");
    const k = "opsstaff/" + String(b.empId).replace(/[^A-Za-z0-9_-]+/g, "_");
    const ex = await s.get(k, { type: "json" }) || { empId: b.empId };
    const splits = (Array.isArray(b.splits) ? b.splits : []).filter((x) => x && x.project && num(x.pct) > 0).map((x) => ({ project: String(x.project).trim(), pct: r2(num(x.pct)) }));
    const tot = splits.reduce((t, x) => t + x.pct, 0);
    if (tot > 100.01) return err("Project splits total " + r2(tot) + "% — they cannot exceed 100%. The remainder stays with MA HQ.");
    const rec = { ...ex, name: b.name || ex.name || "", role: b.role || ex.role || "", company: b.company || ex.company || "", splits, costType: OPS_STAFF_COST_TYPES.includes(b.costType) ? b.costType : ex.costType || "Labour (Indirect)",
      // a saved assignment overrides attendance until "use attendance" is chosen again
      manualSplits: b.useAttendance ? false : true, updatedAt: now(), updatedBy: me.name };
    await s.setJSON(k, rec);
    return json(rec);
  }
  // Post payroll to the cost ledger: one line per project (staff time assigned
  // there) + one HQ line for the unassigned remainder. Re-posting replaces the
  // month's payroll lines so a changed assignment is reflected exactly once.
  if (path === "ops/payroll/post" && req.method === "POST") {
    if (!can("opsPost")) return err("No rights to post operations cost", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const d = await computeOps(s, month);
    if (!d.payroll || !d.payroll.rows.length) return err("No payroll imported for " + month + " yet.");
    const old = (await listExpenses("")).filter((e) => e.source === "ops-payroll" && e.month === month);
    for (const e of old) await s.delete("expense/" + e.id);
    const groups = {}; // project|costType -> amount, heads
    for (const r of d.payroll.rows) {
      for (const sp of r.splits) { const k = sp.project + "|" + r.costType; groups[k] = groups[k] || { project: sp.project, costType: r.costType, amount: 0, heads: 0 }; groups[k].amount = r2(groups[k].amount + r.cost * sp.pct); groups[k].heads += sp.pct; }
      if (r.hqShare > 0) { const k = HQ_PROJECT + "|Overhead / Admin"; groups[k] = groups[k] || { project: HQ_PROJECT, costType: "Overhead / Admin", amount: 0, heads: 0 }; groups[k].amount = r2(groups[k].amount + r.hqShare); groups[k].heads += r.hqShare / (r.cost || 1); }
    }
    const date = monthEnd(month); let created = 0, total = 0;
    for (const g of Object.values(groups)) {
      if (!(g.amount > 0)) continue;
      const isHQ = g.project === HQ_PROJECT;
      const xid = `XPR-${month}-${projSlug(g.project)}-${projSlug(g.costType)}`;
      const exp = {
        id: xid, seq: 0, project: g.project, date, area: "", category: isHQ ? "Head Office Overhead" : "Site Management & Engineers", costType: g.costType,
        supplier: "MA Group payroll (HR system)", supplierId: null, invoiceNo: `PAYROLL/${month}`, description: `Staff payroll ${month} — ${isHQ ? "HQ / unassigned staff" : "staff assigned to project"} (${r2(g.heads)} man-month${g.heads === 1 ? "" : "s"})`,
        poRef: "", boqRef: "", budgeted: 0, amount: r2(g.amount), vatPct: 0, vat: 0, gross: r2(g.amount), status: "Pending", paid: 0, fromAdvance: false,
        notes: `Employer cost = gross + overtime + commission · source: ${d.payroll.source}`, supplierCertNo: null, source: "ops-payroll", month,
        createdBy: me.name, createdAt: now(), updatedAt: now(), updatedBy: me.name
      };
      await s.setJSON("expense/" + xid, exp); created++; total = r2(total + exp.amount);
    }
    return json({ ok: true, month, created, replaced: old.length, total });
  }
  // Post the month's depreciation (non-cash) as one HQ line.
  if (path === "ops/depreciation/post" && req.method === "POST") {
    if (!can("opsPost")) return err("No rights to post operations cost", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const assets = await listAssets();
    const rows = assets.map((a) => ({ code: a.code, amt: assetMonthDep(a, month) })).filter((x) => x.amt > 0);
    const total = r2(rows.reduce((t, x) => t + x.amt, 0));
    const xid = `XDP-${month}`;
    if (!(total > 0)) { if (await s.get("expense/" + xid)) await s.delete("expense/" + xid); return json({ ok: true, month, total: 0, removed: true }); }
    const ex = await s.get("expense/" + xid, { type: "json" });
    const exp = {
      id: xid, seq: 0, project: HQ_PROJECT, date: monthEnd(month), area: "", category: "Head Office Overhead", costType: "Overhead / Admin",
      supplier: "", supplierId: null, invoiceNo: `DEP/${month}`, description: `Depreciation ${month} — ${rows.length} asset${rows.length === 1 ? "" : "s"} (straight-line, non-cash)`,
      poRef: "", boqRef: "", budgeted: 0, amount: total, vatPct: 0, vat: 0, gross: total, status: "Paid", paid: 0, fromAdvance: false, nonCash: true,
      notes: rows.map((x) => `${x.code} ${x.amt.toFixed(2)}`).join(", ").slice(0, 900), supplierCertNo: null, source: "ops-depreciation", month,
      createdBy: ex?.createdBy || me.name, createdAt: ex?.createdAt || now(), updatedAt: now(), updatedBy: me.name
    };
    await s.setJSON("expense/" + xid, exp);
    return json({ ok: true, month, total, count: rows.length, replaced: !!ex });
  }
  // ---- allocation of the HQ pool to projects ----
  if (path === "ops/alloc/preview" && req.method === "POST") {
    if (!can("ops")) return err("No rights", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    const d = await computeOps(s, month);
    const out = allocateOps(d.pool, b.basis || "revenue", d.drivers, b.manual);
    return json({ month, pool: d.pool, basis: b.basis || "revenue", ...out });
  }
  if (path === "ops/alloc" && req.method === "POST") {
    if (!can("opsPost")) return err("No rights to post the allocation", 403);
    const b = await req.json(); const month = b.month;
    if (!validMonth(month)) return err("Month must be YYYY-MM");
    if (!OPS_BASES.some((x) => x.code === b.basis)) return err("Choose an allocation basis");
    const d = await computeOps(s, month);
    if (!(d.pool > 0)) return err("The HQ pool for " + month + " is zero — post payroll, fixed expenses or depreciation first.");
    const out = allocateOps(d.pool, b.basis, d.drivers, b.manual);
    if (!out.rows.length) return err(out.reason || "Nothing to allocate");
    const unposted = [];
    if (d.payroll && !d.payroll.posted) unposted.push("payroll");
    if (d.fixedExpected > d.fixedPosted + 0.01) unposted.push("fixed expenses");
    if (d.depreciation.expected > 0 && !d.depreciation.isPosted) unposted.push("depreciation");
    if (unposted.length && !b.force) return err("NOT_POSTED:" + unposted.join(", ") + " for " + month + " not yet posted to the ledger — post them first so the pool is complete, or confirm to allocate the current pool anyway.");
    const rec = { month, basis: b.basis, manual: b.basis === "manual" ? b.manual || {} : null, pool: d.pool, bySource: d.bySource, rows: out.rows, total: out.total, status: "Posted", postedBy: me.name, postedAt: now(), note: String(b.note || "") };
    await s.setJSON("opsalloc/" + month, rec);
    return json(rec);
  }
  if (path.startsWith("ops/alloc/") && req.method === "DELETE") {
    if (!can("opsPost")) return err("No rights", 403);
    const month = path.slice("ops/alloc/".length);
    await s.delete("opsalloc/" + month);
    return json({ ok: true });
  }
  if (path === "ops/allocs" && req.method === "GET") {
    if (!can("ops")) return err("No rights", 403);
    return json(await listOpsAlloc());
  }
  // Year-to-date view: month by month pool, allocation and payroll.
  if (path === "ops/ytd" && req.method === "GET") {
    if (!can("ops")) return err("No rights", 403);
    const year = url.searchParams.get("year") || now().slice(0, 4);
    const [expenses, allocs] = await Promise.all([listExpenses(HQ_PROJECT), listOpsAlloc()]);
    const months = {};
    for (let i = 1; i <= 12; i++) { const m = `${year}-${String(i).padStart(2, "0")}`; months[m] = { month: m, payroll: 0, fixed: 0, depreciation: 0, other: 0, pool: 0, allocated: 0, basis: "" }; }
    for (const e of expenses) { const m = monthKeyOf(e.date); if (!months[m]) continue; const k = e.source === "ops-payroll" ? "payroll" : e.source === "ops-fixed" ? "fixed" : e.source === "ops-depreciation" ? "depreciation" : "other"; months[m][k] = r2(months[m][k] + num(e.amount)); months[m].pool = r2(months[m].pool + num(e.amount)); }
    for (const a of allocs) { if (months[a.month] && a.status === "Posted") { months[a.month].allocated = num(a.total); months[a.month].basis = a.basis; } }
    return json({ year, months: Object.values(months) });
  }
  if (path === "pnl" && req.method === "GET") {
    if (!can("pnl")) return err("No rights", 403);
    return json(await computePnl(s, url.searchParams.get("project") || ""));
  }
  if (path === "wip" && req.method === "GET") {
    if (!can("pnl")) return err("No rights", 403);
    return json(await computeWip(s));
  }
  if (path === "backup" && req.method === "GET") {
    if (!can("admin")) return err("CEO only", 403);
    const prefixes = ["supplier/", "cert/", "client/", "contract/", "clientcert/", "clientreceipt/", "expense/", "budget/", "asset/", "opsfixed/", "opspayroll/", "opsstaff/", "opsalloc/", "opsatt/", "mkt/post/", "mkt/audience/", "mkt/sent/"];
    const data = {};
    for (const p of prefixes) data[p.replace(/\//g, "")] = await getAllJSON(s, p);
    data.settings = await s.get("settings", { type: "json" });
    data.register = await s.get("register", { type: "json" }) || [];
    const us = await s.get("users", { type: "json" }) || [];
    data.users = us.map((u) => ({ id: u.id, name: u.name, role: u.role, title: u.title || "", department: u.department || "", active: u.active !== false })); // never export PIN hashes
    const counts = {}; for (const k in data) counts[k] = Array.isArray(data[k]) ? data[k].length : 1;
    return json({ generatedAt: now(), version: 1, counts, data });
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
