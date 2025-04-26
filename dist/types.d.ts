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
export declare class EnvValidationError extends Error {
    errors: string[];
    constructor(errors: string[]);
}
export declare class MissingEnvError extends Error {
    constructor(key: string);
}
export declare class InvalidEnvError extends Error {
    constructor(key: string, value: any, message?: string);
}
