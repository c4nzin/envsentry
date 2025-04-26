"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEnvError = exports.MissingEnvError = exports.EnvValidationError = void 0;
class EnvValidationError extends Error {
    constructor(errors) {
        super(`Environment validation failed:\n${errors.join("\n")}`);
        this.name = "EnvValidationError";
        this.errors = errors;
    }
}
exports.EnvValidationError = EnvValidationError;
class MissingEnvError extends Error {
    constructor(key) {
        super(`Missing required environment variable: ${key}`);
        this.name = "MissingEnvError";
    }
}
exports.MissingEnvError = MissingEnvError;
class InvalidEnvError extends Error {
    constructor(key, value, message) {
        super(message || `Invalid value "${value}" for environment variable ${key}`);
        this.name = "InvalidEnvError";
    }
}
exports.InvalidEnvError = InvalidEnvError;
//# sourceMappingURL=types.js.map