import {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE,
  AUTH0_SCOPE,
  AUTH0_API_URL,
  AUTH0_OTP_DIGITS,
  AUTH0_SCHEME,
} from '@env';

type EnvironmentVariable = 
  | 'AUTH0_DOMAIN'
  | 'AUTH0_CLIENT_ID'
  | 'AUTH0_AUDIENCE'
  | 'AUTH0_SCOPE'
  | 'AUTH0_API_URL'
  | 'AUTH0_OTP_DIGITS'
  | 'AUTH0_SCHEME';

const REQUIRED_VARS: EnvironmentVariable[] = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_SCOPE',
  'AUTH0_SCHEME',
];

interface EnvironmentConfig {
  AUTH0_DOMAIN?: string;
  AUTH0_CLIENT_ID?: string;
  AUTH0_AUDIENCE?: string;
  AUTH0_SCOPE?: string;
  AUTH0_API_URL?: string;
  AUTH0_OTP_DIGITS?: string;
  AUTH0_SCHEME?: string;
}

class ConfigService {
  private config: EnvironmentConfig = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.config = {
      AUTH0_DOMAIN,
      AUTH0_CLIENT_ID,
      AUTH0_AUDIENCE,
      AUTH0_SCOPE,
      AUTH0_API_URL,
      AUTH0_OTP_DIGITS,
      AUTH0_SCHEME,
    };

    if (!this.isTestEnvironment()) {
      this.validateConfig();
    }
  }

  private isTestEnvironment(): boolean {
    return process.env.JEST_WORKER_ID !== undefined;
  }

  private validateConfig(): void {
    const missingVars: string[] = [];

    REQUIRED_VARS.forEach((varName) => {
      if (!this.config[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      const errorMessage = this.formatValidationError(missingVars);
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  private formatValidationError(missingVars: string[]): string {
    const varList = missingVars.map(v => `  - ${v}`).join('\n');
    return `CONFIGURATION ERROR: Missing required environment variables:\n${varList}\n\nPlease check your .env file and ensure all required variables are set.\nAfter updating .env, you MUST restart Metro: npx expo start --clear`;
  }

  public get(key: EnvironmentVariable): string {
    const value = this.config[key];
    
    if (!value && REQUIRED_VARS.includes(key)) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    
    return value || '';
  }

  public getAll(): Readonly<EnvironmentConfig> {
    return { ...this.config };
  }
}

export const configService = new ConfigService();

export type { EnvironmentVariable, EnvironmentConfig };
