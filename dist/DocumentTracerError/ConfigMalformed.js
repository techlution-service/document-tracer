"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DocumentTracerError_js_1 = require("./DocumentTracerError.js");
/**
 * @extends DocumentTracerError
 */
var ConfigMalformed = /** @class */ (function (_super) {
    __extends(ConfigMalformed, _super);
    /**
     * @param {string} config
     */
    function ConfigMalformed(config) {
        return _super.call(this, '000000', "Docuemnt Tracer Config ".concat(config, " is missing or malformed")) || this;
    }
    return ConfigMalformed;
}(DocumentTracerError_js_1.default));
exports.default = ConfigMalformed;