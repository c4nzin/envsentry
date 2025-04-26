import { ValidatorSpec } from "./types";
import * as path from "path";
import * as fs from "fs";

export function str(
  options: {
    choices?: string[];
    default?: string;
    message?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  } = {}
): ValidatorSpec<string> {
  return {
    type: "string",
    validator: (value: any) => {
      if (typeof value !== "string") return false;
      if (options.minLength !== undefined && value.length < options.minLength)
        return false;
      if (options.maxLength !== undefined && value.length > options.maxLength)
        return false;
      if (options.pattern && !options.pattern.test(value)) return false;
      return true;
    },
    choices: options.choices,
    default: options.default,
    parse: (value: string) => value,
    message:
      options.message ||
      `Expected a string${
        options.minLength !== undefined
          ? ` with min length ${options.minLength}`
          : ""
      }${
        options.maxLength !== undefined
          ? ` with max length ${options.maxLength}`
          : ""
      }${options.pattern ? ` matching pattern ${options.pattern}` : ""}`,
    required: options.required !== false,
  };
}

export function num(
  options: {
    choices?: number[];
    default?: number;
    message?: string;
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {}
): ValidatorSpec<number> {
  return {
    type: "number",
    validator: (value: any) => {
      const numValue = Number(value);
      if (isNaN(numValue)) return false;
      if (options.min !== undefined && numValue < options.min) return false;
      if (options.max !== undefined && numValue > options.max) return false;
      if (options.integer && !Number.isInteger(numValue)) return false;
      return true;
    },
    choices: options.choices,
    default: options.default,
    parse: (value: string) => Number(value),
    message:
      options.message ||
      `Expected a ${options.integer ? "integer " : ""}number${
        options.min !== undefined ? ` >= ${options.min}` : ""
      }${options.max !== undefined ? ` <= ${options.max}` : ""}`,
    required: options.required !== false,
  };
}

export function bool(
  options: {
    default?: boolean;
    message?: string;
    required?: boolean;
  } = {}
): ValidatorSpec<boolean> {
  return {
    type: "boolean",
    validator: (value: any) => {
      return (
        value === "true" ||
        value === "false" ||
        value === "1" ||
        value === "0" ||
        value === true ||
        value === false ||
        value === "yes" ||
        value === "no" ||
        value === "y" ||
        value === "n"
      );
    },
    default: options.default,
    parse: (value: string) => {
      return (
        value === "true" || value === "1" || value === "yes" || value === "y"
      );
    },
    message:
      options.message || "Expected a boolean (true/false, 1/0, yes/no, y/n)",
    required: options.required !== false,
  };
}

export function port(
  options: {
    default?: number;
    message?: string;
    required?: boolean;
  } = {}
): ValidatorSpec<number> {
  return {
    type: "port",
    validator: (value: any) => {
      const port = Number(value);
      return (
        !isNaN(port) && port >= 0 && port <= 65535 && Number.isInteger(port)
      );
    },
    default: options.default,
    parse: (value: string) => Number(value),
    message: options.message || "Expected a valid port number (0-65535)",
    required: options.required !== false,
  };
}

export function url(
  options: {
    default?: string;
    message?: string;
    required?: boolean;
    protocols?: string[];
  } = {}
): ValidatorSpec<string> {
  return {
    type: "url",
    validator: (value: any) => {
      try {
        const url = new URL(value);
        if (
          options.protocols &&
          !options.protocols.includes(url.protocol.replace(":", ""))
        ) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    default: options.default,
    parse: (value: string) => value,
    message:
      options.message ||
      `Expected a valid URL${
        options.protocols
          ? ` with protocol ${options.protocols.join(" or ")}`
          : ""
      }`,
    required: options.required !== false,
  };
}

export function email(
  options: {
    default?: string;
    message?: string;
    required?: boolean;
  } = {}
): ValidatorSpec<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    type: "email",
    validator: (value: any) =>
      typeof value === "string" && emailRegex.test(value),
    default: options.default,
    parse: (value: string) => value,
    message: options.message || "Expected a valid email address",
    required: options.required !== false,
  };
}

export function json<T = any>(
  options: {
    default?: T;
    message?: string;
    required?: boolean;
    schema?: (data: any) => boolean;
  } = {}
): ValidatorSpec<T> {
  return {
    type: "json",
    validator: (value: any) => {
      try {
        const parsed = JSON.parse(value);
        if (options.schema) {
          return options.schema(parsed);
        }
        return true;
      } catch {
        return false;
      }
    },
    default: options.default,
    parse: (value: string) => JSON.parse(value),
    message: options.message || "Expected a valid JSON string",
    required: options.required !== false,
  };
}

export function date(
  options: {
    default?: Date;
    message?: string;
    required?: boolean;
    min?: Date;
    max?: Date;
  } = {}
): ValidatorSpec<Date> {
  return {
    type: "date",
    validator: (value: any) => {
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        if (options.min && date < options.min) return false;
        if (options.max && date > options.max) return false;
        return true;
      } catch {
        return false;
      }
    },
    default: options.default,
    parse: (value: string) => new Date(value),
    message: options.message || "Expected a valid date string",
    required: options.required !== false,
  };
}

export function array<T = string>(
  options: {
    default?: T[];
    message?: string;
    required?: boolean;
    separator?: string;
    itemValidator?: (item: string) => boolean;
    itemParser?: (item: string) => T;
  } = {}
): ValidatorSpec<T[]> {
  const separator = options.separator || ",";
  return {
    type: "array",
    validator: (value: any) => {
      if (typeof value !== "string") return false;

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
    parse: (value: string) => {
      const items = value
        .split(separator)
        .map((i) => i.trim())
        .filter(Boolean);
      if (options.itemParser) {
        return items.map(options.itemParser);
      }
      return items as unknown as T[];
    },
    message: options.message || `Expected a comma-separated list`,
    required: options.required !== false,
  };
}

export function filePath(
  options: {
    default?: string;
    message?: string;
    required?: boolean;
    mustExist?: boolean;
    canBeDir?: boolean;
  } = {}
): ValidatorSpec<string> {
  return {
    type: "filePath",
    validator: (value: any) => {
      if (typeof value !== "string") return false;

      if (options.mustExist) {
        try {
          const stats = fs.statSync(path.resolve(value));
          if (!options.canBeDir && stats.isDirectory()) {
            return false;
          }
          return true;
        } catch {
          return false;
        }
      }

      return true;
    },
    default: options.default,
    parse: (value: string) => path.resolve(value),
    message:
      options.message ||
      `Expected a valid file path${options.mustExist ? " that exists" : ""}${
        options.mustExist && !options.canBeDir ? " and is not a directory" : ""
      }`,
    required: options.required !== false,
  };
}

export function host(
  options: {
    default?: string;
    message?: string;
    required?: boolean;
  } = {}
): ValidatorSpec<string> {
  const hostRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return {
    type: "host",
    validator: (value: any) => {
      if (typeof value !== "string") return false;
      if (value === "localhost") return true;
      return hostRegex.test(value);
    },
    default: options.default,
    parse: (value: string) => value,
    message: options.message || "Expected a valid hostname",
    required: options.required !== false,
  };
}
