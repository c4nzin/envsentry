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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanEnv = cleanEnv;
exports.testEnv = testEnv;
exports.reportEnv = reportEnv;
exports.generateEnvFile = generateEnvFile;
exports.loadEnvFile = loadEnvFile;
exports.mergeEnv = mergeEnv;
exports.printEnvStatus = printEnvStatus;
const dotenv = __importStar(require("dotenv"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
__exportStar(require("./validators"), exports);
__exportStar(require("./types"), exports);
function cleanEnv(schema, options = {}) {
    if (options.dotenv) {
        dotenv.config(options.dotenv);
    }
    else {
        dotenv.config();
    }
    const env = process.env;
    const cleanedEnv = {};
    const errors = [];
    const warnings = [];
    for (const key in schema) {
        const spec = schema[key];
        let value = env[key];
        if (value === undefined) {
            if ("default" in spec) {
                cleanedEnv[key] = spec.default;
                warnings.push(`Using default value for ${key}: ${spec.default}`);
                continue;
            }
            else if (spec.required !== false) {
                errors.push(`Missing required environment variable: ${key}`);
                continue;
            }
        }
        if (value === undefined) {
            continue;
        }
        if (!spec.validator(value)) {
            errors.push(`Invalid value "${value}" for environment variable ${key}: ${spec.message}`);
            continue;
        }
        if (spec.choices && !spec.choices.includes(spec.parse(value))) {
            errors.push(`Invalid value "${value}" for environment variable ${key}. Allowed values: ${spec.choices.join(", ")}`);
            continue;
        }
        cleanedEnv[key] = spec.parse(value);
    }
    if (!options.strict) {
        for (const key in env) {
            if (!(key in schema) && env[key] !== undefined) {
                cleanedEnv[key] = env[key];
            }
        }
    }
    else {
        for (const key in env) {
            if (!(key in schema) && env[key] !== undefined) {
                warnings.push(`Undefined schema for environment variable: ${key}`);
            }
        }
    }
    if (warnings.length > 0 && options.verbose) {
        console.warn("Environment validation warnings:");
        warnings.forEach((warn) => console.warn(`- ${warn}`));
    }
    if (errors.length > 0) {
        if (options.verbose) {
            console.error("Environment validation errors:");
            errors.forEach((err) => console.error(`- ${err}`));
        }
        if (options.throwOnError !== false) {
            throw new types_1.EnvValidationError(errors);
        }
    }
    return cleanedEnv;
}
function testEnv(schema, options = {}) {
    try {
        cleanEnv(schema, { ...options, throwOnError: true });
        return true;
    }
    catch (error) {
        if (error instanceof types_1.EnvValidationError) {
            return error.errors;
        }
        throw error;
    }
}
function reportEnv(schema, options = {}) {
    const errors = [];
    const warnings = [];
    let env = {};
    try {
        env = cleanEnv(schema, {
            ...options,
            throwOnError: false,
            verbose: false,
        });
        for (const key in schema) {
            if (env[key] === undefined && !("default" in schema[key])) {
                if (schema[key].required !== false) {
                    errors.push(`Missing required environment variable: ${key}`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            env,
        };
    }
    catch (error) {
        if (error instanceof types_1.EnvValidationError) {
            return {
                valid: false,
                errors: error.errors,
                warnings,
                env,
            };
        }
        throw error;
    }
}
function generateEnvFile(schema, outputPath = ".env.example") {
    let content = "# Environment Variables Example\n\n";
    for (const key in schema) {
        const spec = schema[key];
        let line = "";
        if (spec.required !== false) {
            line += `${key}=`;
        }
        else {
            line += `# ${key}=`;
        }
        if ("default" in spec) {
            line += `${spec.default} # Default value`;
        }
        else if (spec.choices) {
            line += `${spec.choices[0]} # Choices: ${spec.choices.join(", ")}`;
        }
        else {
            line += `# ${spec.type}`;
        }
        content += line + "\n";
    }
    fs.writeFileSync(path.resolve(outputPath), content);
}
function loadEnvFile(filePath) {
    const envContent = fs.readFileSync(path.resolve(filePath), "utf8");
    const envVars = {};
    envContent.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#"))
            return;
        const parts = trimmedLine.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (value && key) {
                envVars[key] = value.replace(/^["'](.*)["']$/, "$1");
            }
        }
    });
    return envVars;
}
function mergeEnv(schema, customEnv, options = {}) {
    const originalEnv = { ...process.env };
    try {
        Object.entries(customEnv).forEach(([key, value]) => {
            if (value !== undefined) {
                process.env[key] = String(value);
            }
        });
        return cleanEnv(schema, options);
    }
    finally {
        process.env = originalEnv;
    }
}
function printEnvStatus(schema, options = { verbose: true }) {
    const report = reportEnv(schema, options);
    console.log("\n===== Environment Variables Status =====");
    if (report.errors.length > 0) {
        console.log("\n❌ ERRORS:");
        report.errors.forEach((err) => console.log(`  - ${err}`));
    }
    else {
        console.log("\n✅ All required environment variables are valid.");
    }
    if (report.warnings.length > 0) {
        console.log("\n⚠️  WARNINGS:");
        report.warnings.forEach((warn) => console.log(`  - ${warn}`));
    }
    console.log("\n📋 ENVIRONMENT SUMMARY:");
    for (const key in schema) {
        const value = report.env[key];
        if (value !== undefined) {
            console.log(`  - ${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`);
        }
        else {
            console.log(`  - ${key}: <missing>`);
        }
    }
    console.log("\n====================================\n");
}
//# sourceMappingURL=index.js.map