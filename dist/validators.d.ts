import { ValidatorSpec } from "./types";
export declare function str(options?: {
    choices?: string[];
    default?: string;
    message?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}): ValidatorSpec<string>;
export declare function num(options?: {
    choices?: number[];
    default?: number;
    message?: string;
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
}): ValidatorSpec<number>;
export declare function bool(options?: {
    default?: boolean;
    message?: string;
    required?: boolean;
}): ValidatorSpec<boolean>;
export declare function port(options?: {
    default?: number;
    message?: string;
    required?: boolean;
}): ValidatorSpec<number>;
export declare function url(options?: {
    default?: string;
    message?: string;
    required?: boolean;
    protocols?: string[];
}): ValidatorSpec<string>;
export declare function email(options?: {
    default?: string;
    message?: string;
    required?: boolean;
}): ValidatorSpec<string>;
export declare function json<T = any>(options?: {
    default?: T;
    message?: string;
    required?: boolean;
    schema?: (data: any) => boolean;
}): ValidatorSpec<T>;
export declare function date(options?: {
    default?: Date;
    message?: string;
    required?: boolean;
    min?: Date;
    max?: Date;
}): ValidatorSpec<Date>;
export declare function array<T = string>(options?: {
    default?: T[];
    message?: string;
    required?: boolean;
    separator?: string;
    itemValidator?: (item: string) => boolean;
    itemParser?: (item: string) => T;
}): ValidatorSpec<T[]>;
export declare function filePath(options?: {
    default?: string;
    message?: string;
    required?: boolean;
    mustExist?: boolean;
    canBeDir?: boolean;
}): ValidatorSpec<string>;
export declare function host(options?: {
    default?: string;
    message?: string;
    required?: boolean;
}): ValidatorSpec<string>;
