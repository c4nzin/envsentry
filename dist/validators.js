"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.str = str;
exports.num = num;
exports.bool = bool;
exports.port = port;
exports.url = url;
exports.email = email;
exports.json = json;
exports.date = date;
exports.array = array;
exports.filePath = filePath;
exports.host = host;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
function str(options = {}) {
    return {
        type: "string",
        validator: (value) => {
            if (typeof value !== "string")
                return false;
            if (options.minLength !== undefined && value.length < options.minLength)
                return false;
            if (options.maxLength !== undefined && value.length > options.maxLength)
                return false;
            if (options.pattern && !options.pattern.test(value))
                return false;
            return true;
        },
        choices: options.choices,
        default: options.default,
        parse: (value) => value,
        message: options.message ||
            `Expected a string${options.minLength !== undefined
                ? ` with min length ${options.minLength}`
                : ""}${options.maxLength !== undefined
                ? ` with max length ${options.maxLength}`
                : ""}${options.pattern ? ` matching pattern ${options.pattern}` : ""}`,
        required: options.required !== false,
    };
}
function num(options = {}) {
    return {
        type: "number",
        validator: (value) => {
            const numValue = Number(value);
            if (isNaN(numValue))
                return false;
            if (options.min !== undefined && numValue < options.min)
                return false;
            if (options.max !== undefined && numValue > options.max)
                return false;
            if (options.integer && !Number.isInteger(numValue))
                return false;
            return true;
        },
        choices: options.choices,
        default: options.default,
        parse: (value) => Number(value),
        message: options.message ||
            `Expected a ${options.integer ? "integer " : ""}number${options.min !== undefined ? ` >= ${options.min}` : ""}${options.max !== undefined ? ` <= ${options.max}` : ""}`,
        required: options.required !== false,
    };
}
function bool(options = {}) {
    return {
        type: "boolean",
        validator: (value) => {
            return (value === "true" ||
                value === "false" ||
                value === "1" ||
                value === "0" ||
                value === true ||
                value === false ||
                value === "yes" ||
                value === "no" ||
                value === "y" ||
                value === "n");
        },
        default: options.default,
        parse: (value) => {
            return (value === "true" || value === "1" || value === "yes" || value === "y");
        },
        message: options.message || "Expected a boolean (true/false, 1/0, yes/no, y/n)",
        required: options.required !== false,
    };
}
function port(options = {}) {
    return {
        type: "port",
        validator: (value) => {
            const port = Number(value);
            return (!isNaN(port) && port >= 0 && port <= 65535 && Number.isInteger(port));
        },
        default: options.default,
        parse: (value) => Number(value),
        message: options.message || "Expected a valid port number (0-65535)",
        required: options.required !== false,
    };
}
function url(options = {}) {
    return {
        type: "url",
        validator: (value) => {
            try {
                const url = new URL(value);
                if (options.protocols &&
                    !options.protocols.includes(url.protocol.replace(":", ""))) {
                    return false;
                }
                return true;
            }
            catch (_a) {
                return false;
            }
        },
        default: options.default,
        parse: (value) => value,
        message: options.message ||
            `Expected a valid URL${options.protocols
                ? ` with protocol ${options.protocols.join(" or ")}`
                : ""}`,
        required: options.required !== false,
    };
}
function email(options = {}) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        type: "email",
        validator: (value) => typeof value === "string" && emailRegex.test(value),
        default: options.default,
        parse: (value) => value,
        message: options.message || "Expected a valid email address",
        required: options.required !== false,
    };
}
function json(options = {}) {
    return {
        type: "json",
        validator: (value) => {
            try {
                const parsed = JSON.parse(value);
                if (options.schema) {
                    return options.schema(parsed);
                }
                return true;
            }
            catch (_a) {
                return false;
            }
        },
        default: options.default,
        parse: (value) => JSON.parse(value),
        message: options.message || "Expected a valid JSON string",
        required: options.required !== false,
    };
}
function date(options = {}) {
    return {
        type: "date",
        validator: (value) => {
            try {
                const date = new Date(value);
                if (isNaN(date.getTime()))
                    return false;
                if (options.min && date < options.min)
                    return false;
                if (options.max && date > options.max)
                    return false;
                return true;
            }
            catch (_a) {
                return false;
            }
        },
        default: options.default,
        parse: (value) => new Date(value),
        message: options.message || "Expected a valid date string",
        required: options.required !== false,
    };
}
function array(options = {}) {
    const separator = options.separator || ",";
    return {
        type: "array",
        validator: (value) => {
            if (typeof value !== "string")
                return false;
            const items = value
                .split(separator)
                .map((i) => i.trim())
                .filter(Boolean);
            if (options.itemValidator) {
                return items.every(options.itemValidator);
            }
            return true;
        },
        default: options.default,
        parse: (value) => {
            const items = value
                .split(separator)
                .map((i) => i.trim())
                .filter(Boolean);
            if (options.itemParser) {
                return items.map(options.itemParser);
            }
            return items;
        },
        message: options.message || `Expected a comma-separated list`,
        required: options.required !== false,
    };
}
function filePath(options = {}) {
    return {
        type: "filePath",
        validator: (value) => {
            if (typeof value !== "string")
                return false;
            if (options.mustExist) {
                try {
                    const stats = fs.statSync(path.resolve(value));
                    if (!options.canBeDir && stats.isDirectory()) {
                        return false;
                    }
                    return true;
                }
                catch (_a) {
                    return false;
                }
            }
            return true;
        },
        default: options.default,
        parse: (value) => path.resolve(value),
        message: options.message ||
            `Expected a valid file path${options.mustExist ? " that exists" : ""}${options.mustExist && !options.canBeDir ? " and is not a directory" : ""}`,
        required: options.required !== false,
    };
}
function host(options = {}) {
    const hostRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return {
        type: "host",
        validator: (value) => {
            if (typeof value !== "string")
                return false;
            if (value === "localhost")
                return true;
            return hostRegex.test(value);
        },
        default: options.default,
        parse: (value) => value,
        message: options.message || "Expected a valid hostname",
        required: options.required !== false,
    };
}
//# sourceMappingURL=validators.js.map