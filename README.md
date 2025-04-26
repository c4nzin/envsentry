
# EnvShield

A powerful environment variable validation library with full TypeScript support. EnvShield helps you validate, transform, and handle environment variables with ease, making your applications more robust and error-resistant.

## Features

- 🛡️ **Type Safety** - Full TypeScript support with type inference
- ✅ **Powerful Validators** - Validate strings, numbers, URLs, emails, and more
- 🔄 **Dotenv Integration** - Seamless integration with `.env` files
- ⚙️ **Customizable Rules** - Create complex validation rules for your environment
- 🚫 **Error Handling** - Clear error messages when validation fails
- 📊 **Detailed Reporting** - Generate comprehensive reports on your environment setup
- 🏭 **Environment Templates** - Generate example `.env` files from your schema

## Installation

To install the package, run:

### With npm

```bash
npm install envshield
```

### With yarn

```bash
yarn add envshield
```

### With pnpm

```bash
pnpm install envshield
```

### With bun

```bash
bun add envshield
```

## Quick Start

```typescript
import { cleanEnv, str, num, bool, url } from 'envshield';

// Define and validate your environment
const env = cleanEnv({
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: num({ default: 3000 }),
  DEBUG: bool({ default: false }),
  API_KEY: str({ required: true }),
  API_URL: url({ protocols: ['https'] })
});

// Use your validated environment variables with full type safety
console.log(`Server running on port ${env.PORT}`);
console.log(`Environment: ${env.NODE_ENV}`);
```

## Available Validators

EnvShield comes with a rich set of validators to match your needs:

| Validator | Description | Options |
|-----------|-------------|---------|
| `str()` | String values | `choices`, `default`, `minLength`, `maxLength`, `pattern`, `required` |
| `num()` | Numeric values | `choices`, `default`, `min`, `max`, `integer`, `required` |
| `bool()` | Boolean values | `default`, `required` |
| `port()` | TCP/UDP port numbers | `default`, `required` |
| `url()` | URL values | `default`, `protocols`, `required` |
| `email()` | Email addresses | `default`, `required` |
| `json()` | JSON strings | `default`, `required`, `schema` |
| `date()` | Date strings | `default`, `required`, `min`, `max` |
| `array()` | Array values | `default`, `separator`, `itemValidator`, `itemParser`, `required` |
| `filePath()` | File paths | `default`, `mustExist`, `canBeDir`, `required` |
| `host()` | Hostnames | `default`, `required` |

## Advanced Usage

### Validator Options

```typescript
interface ValidatorSpec<T> {
  /**
   * The type of validator (string, number, boolean, etc.)
   */
  type: string;
  
  /**
   * The validation function that checks the value
   */
  validator: (value: any) => boolean;
  
  /**
   * Optional default value
   */
  default?: T;
  
  /**
   * Optional list of allowed values
   */
  choices?: T[];
  
  /**
   * Function to parse string value to the expected type
   */
  parse?: (value: string) => T;
  
  /**
   * Error message to show when validation fails
   */
  message?: string;
  
  /**
   * Whether the value is required
   */
  required?: boolean;
}
```

### Comprehensive Validation

EnvShield allows you to define comprehensive validation rules for your environment variables:

```typescript
import { cleanEnv, str, num, bool, url, email, port, json } from 'envshield';

const env = cleanEnv({
  // Server configuration
  NODE_ENV: str({ 
    choices: ['development', 'production', 'test'],
    default: 'development'
  }),
  PORT: port({ default: 3000 }),
  
  // API Configuration
  API_URL: url({
    protocols: ['https'],
    message: 'API URL must be a valid HTTPS URL'
  }),
  
  // Database configuration
  DB_CONNECTION: str({
    pattern: /^mongodb(\+srv)?:\/\/.+$/,
    message: 'Must be a valid MongoDB connection string'
  }),
  
  // User-related settings
  ADMIN_EMAIL: email({ required: true }),
  USER_LIMITS: json({
    default: { maxUploads: 5, maxProjects: 10 },
    schema: (data) => 
      typeof data === 'object' && 
      typeof data.maxUploads === 'number' &&
      typeof data.maxProjects === 'number'
  }),
  
  // Feature flags
  ENABLE_FEATURE_X: bool({ default: false })
});
```

### Dotenv Configuration

EnvShield integrates with dotenv to load environment variables from a file:

```typescript
const env = cleanEnv({
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: num({ default: 3000 }),
}, {
  dotenv: {
    path: '.env.production',
    override: true,
    optional: true
  }
});
```

### Generate Example Environment File

Create a template `.env` file based on your schema:

```typescript
import { generateEnvFile, str, num, bool, url } from 'envshield';

generateEnvFile(
  {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: num({ default: 3000 }),
    API_KEY: str({ required: true }),
    DEBUG: bool({ default: false }),
    API_URL: url(),
  },
  '.env.example'
);
```

### Environment Reporting

Get comprehensive reports about your environment variables:

```typescript
import { printEnvStatus, str, num, bool } from 'envshield';

// Print a detailed report of environment variables
printEnvStatus({
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  PORT: num({ default: 3000 }),
  DEBUG: bool({ default: false }),
});
```

## Usage with Express

```typescript
import express from 'express';
import { cleanEnv, str, port, bool } from 'envshield';

// Validate environment
const env = cleanEnv({
  PORT: port({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  ENABLE_CORS: bool({ default: true }),
});

const app = express();

// Use validated environment
if (env.ENABLE_CORS) {
  app.use(cors());
}

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
```

## API Reference

### Main Functions

| Function | Description |
|----------|-------------|
| `cleanEnv()` | Validates environment variables against a schema |
| `testEnv()` | Tests if environment variables are valid without throwing |
| `reportEnv()` | Generates a detailed report about environment variables |
| `printEnvStatus()` | Prints environment status to the console |
| `generateEnvFile()` | Creates an example .env file from schema |
| `loadEnvFile()` | Loads environment variables from a file |
| `mergeEnv()` | Merges custom environment variables with process.env |

### Options

```typescript
interface EnvValidatorOptions {
  /**
   * Dotenv options
   */
  dotenv?: {
    path?: string;      // Path to .env file
    silent?: boolean;   // Suppress errors
    override?: boolean; // Override existing env vars
    optional?: boolean; // Don't fail if file not found
  };
  
  /**
   * Only allow variables defined in schema
   */
  strict?: boolean;
  
  /**
   * Show warnings and info
   */
  verbose?: boolean;
  
  /**
   * Throw on validation errors
   */
  throwOnError?: boolean;
}
```

## Example .env

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# API Configuration
API_URL=https://api.example.com
API_KEY=your-secret-key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mydatabase

# Feature Flags
ENABLE_FEATURE_X=true
DEBUG=false
```

## TypeScript Support

EnvShield is built with TypeScript and provides excellent type inference:

```typescript
import { cleanEnv, str, num } from 'envshield';

const env = cleanEnv({
  PORT: num(),
  NODE_ENV: str(),
});

// TypeScript knows the types!
const port: number = env.PORT;   // ✓
const mode: string = env.NODE_ENV; // ✓

// These would cause compile errors:
// const port: string = env.PORT;   // ✗ Type 'number' is not assignable to type 'string'
// const foo = env.FOO;             // ✗ Property 'FOO' does not exist
```


## Contribute

We welcome contributions! Feel free to open an issue or submit a pull request.

For more details, visit the [GitHub repository](https://github.com/c4nzin/envshield).

## License

This project is licensed under the MIT License
