import { Validators, CleanedEnv, EnvValidatorOptions } from "./types";
export * from "./validators";
export * from "./types";
export declare function cleanEnv<T extends Validators>(schema: T, options?: EnvValidatorOptions): CleanedEnv<T>;
export declare function testEnv<T extends Validators>(schema: T, options?: EnvValidatorOptions): true | string[];
export declare function reportEnv<T extends Validators>(schema: T, options?: EnvValidatorOptions): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    env: Partial<CleanedEnv<T>>;
};
export declare function generateEnvFile(schema: Validators, outputPath?: string): void;
export declare function loadEnvFile(filePath: string): Record<string, string>;
export declare function mergeEnv<T extends Validators>(schema: T, customEnv: Record<string, any>, options?: EnvValidatorOptions): CleanedEnv<T>;
export declare function printEnvStatus<T extends Validators>(schema: T, options?: EnvValidatorOptions): void;
