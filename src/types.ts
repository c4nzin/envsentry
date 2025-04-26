export type ValidatorSpec<T> = {
  type: string;

  validator: (value: any) => boolean;

  default?: T;

  choices?: T[];

  parse?: (value: string) => T;

  message?: string;

  required?: boolean;
};

export type Validators = {
  [key: string]: ValidatorSpec<any>;
};

export type CleanedEnv<T extends Validators> = {
  [K in keyof T]: ReturnType<NonNullable<T[K]["parse"]>>;
};

export interface EnvValidatorOptions {
  strict?: boolean;

  dotenv?: {
    path?: string;
    silent?: boolean;
    override?: boolean;
    optional?: boolean;
  };

  verbose?: boolean;

  throwOnError?: boolean;
}

export class EnvValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super(`Environment validation failed:\n${errors.join("\n")}`);
    this.name = "EnvValidationError";
    this.errors = errors;
  }
}

export class MissingEnvError extends Error {
  constructor(key: string) {
    super(`Missing required environment variable: ${key}`);
    this.name = "MissingEnvError";
  }
}

export class InvalidEnvError extends Error {
  constructor(key: string, value: any, message?: string) {
    super(
      message || `Invalid value "${value}" for environment variable ${key}`
    );
    this.name = "InvalidEnvError";
  }
}
