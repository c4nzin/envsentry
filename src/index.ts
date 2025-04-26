import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import {
  Validators,
  CleanedEnv,
  EnvValidatorOptions,
  EnvValidationError,
  MissingEnvError,
  InvalidEnvError,
} from "./types";

export * from "./validators";
export * from "./types";

export function cleanEnv<T extends Validators>(
  schema: T,
  options: EnvValidatorOptions = {}
): CleanedEnv<T> {
  if (options.dotenv) {
    dotenv.config(options.dotenv);
  } else {
    dotenv.config();
  }

  const env = process.env;
  const cleanedEnv: any = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const key in schema) {
    const spec = schema[key];
    let value = env[key];

    if (value === undefined) {
      if ("default" in spec) {
        cleanedEnv[key] = spec.default;
        warnings.push(`Using default value for ${key}: ${spec.default}`);
        continue;
      } else if (spec.required !== false) {
        errors.push(`Missing required environment variable: ${key}`);
        continue;
      }
    }

    if (value === undefined) {
      continue;
    }

    if (!spec.validator(value)) {
      errors.push(
        `Invalid value "${value}" for environment variable ${key}: ${spec.message}`
      );
      continue;
    }

    if (spec.choices && !spec.choices.includes(spec.parse!(value))) {
      errors.push(
        `Invalid value "${value}" for environment variable ${key}. Allowed values: ${spec.choices.join(
          ", "
        )}`
      );
      continue;
    }

    cleanedEnv[key] = spec.parse!(value);
  }

  if (!options.strict) {
    for (const key in env) {
      if (!(key in schema) && env[key] !== undefined) {
        cleanedEnv[key] = env[key];
      }
    }
  } else {
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
      throw new EnvValidationError(errors);
    }
  }

  return cleanedEnv as CleanedEnv<T>;
}

export function testEnv<T extends Validators>(
  schema: T,
  options: EnvValidatorOptions = {}
): true | string[] {
  try {
    cleanEnv(schema, { ...options, throwOnError: true });
    return true;
  } catch (error) {
    if (error instanceof EnvValidationError) {
      return error.errors;
    }
    throw error;
  }
}

export function reportEnv<T extends Validators>(
  schema: T,
  options: EnvValidatorOptions = {}
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  env: Partial<CleanedEnv<T>>;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let env: Partial<CleanedEnv<T>> = {};

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
  } catch (error) {
    if (error instanceof EnvValidationError) {
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

export function generateEnvFile(
  schema: Validators,
  outputPath: string = ".env.example"
): void {
  let content = "# Environment Variables Example\n\n";

  for (const key in schema) {
    const spec = schema[key];
    let line = "";

    if (spec.required !== false) {
      line += `${key}=`;
    } else {
      line += `# ${key}=`;
    }

    if ("default" in spec) {
      line += `${spec.default} # Default value`;
    } else if (spec.choices) {
      line += `${spec.choices[0]} # Choices: ${spec.choices.join(", ")}`;
    } else {
      line += `# ${spec.type}`;
    }

    content += line + "\n";
  }

  fs.writeFileSync(path.resolve(outputPath), content);
}

export function loadEnvFile(filePath: string): Record<string, string> {
  const envContent = fs.readFileSync(path.resolve(filePath), "utf8");
  const envVars: Record<string, string> = {};

  envContent.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;

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

export function mergeEnv<T extends Validators>(
  schema: T,
  customEnv: Record<string, any>,
  options: EnvValidatorOptions = {}
): CleanedEnv<T> {
  const originalEnv = { ...process.env };

  try {
    Object.entries(customEnv).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = String(value);
      }
    });

    return cleanEnv(schema, options);
  } finally {
    process.env = originalEnv;
  }
}

export function printEnvStatus<T extends Validators>(
  schema: T,
  options: EnvValidatorOptions = { verbose: true }
): void {
  const report = reportEnv(schema, options);

  console.log("\n===== Environment Variables Status =====");

  if (report.errors.length > 0) {
    console.log("\n❌ ERRORS:");
    report.errors.forEach((err) => console.log(`  - ${err}`));
  } else {
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
      console.log(
        `  - ${key}: ${
          typeof value === "object" ? JSON.stringify(value) : value
        }`
      );
    } else {
      console.log(`  - ${key}: <missing>`);
    }
  }

  console.log("\n====================================\n");
}
