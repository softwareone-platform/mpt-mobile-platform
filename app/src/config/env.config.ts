import {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE,
  AUTH0_SCOPE,
  AUTH0_API_URL,
  AUTH0_OTP_DIGITS,
  AUTH0_SCHEME,
  APPLICATION_INSIGHTS_CONNECTION_STRING,
} from '@env';

import {
  isTestEnvironment,
  validateRequiredVars,
  formatValidationError,
} from '@/utils/configValidation';

type EnvironmentVariable =
  | 'AUTH0_DOMAIN'
  | 'AUTH0_CLIENT_ID'
  | 'AUTH0_AUDIENCE'
  | 'AUTH0_SCOPE'
  | 'AUTH0_API_URL'
  | 'AUTH0_OTP_DIGITS'
  | 'AUTH0_SCHEME'
  | 'APPLICATION_INSIGHTS_CONNECTION_STRING';

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
  APPLICATION_INSIGHTS_CONNECTION_STRING?: string;
  [key: string]: string | undefined;
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
      APPLICATION_INSIGHTS_CONNECTION_STRING,
    };

    if (!isTestEnvironment()) {
      this.validateConfig();
    }
  }

  private validateConfig(): void {
    const missingVars = validateRequiredVars(this.config, REQUIRED_VARS);

    if (missingVars.length > 0) {
      const errorMessage = formatValidationError(missingVars);
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public get(key: EnvironmentVariable): string {
    const value = this.config[key];

    if (!value && REQUIRED_VARS.includes(key) && !isTestEnvironment()) {
      throw new Error(`Required environment variable ${key} is not set`);
    }

    return value || '';
  }

  public getAll(): Readonly<EnvironmentConfig> {
    return { ...this.config };
  }

  public update(updates: Partial<EnvironmentConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };

    if (!isTestEnvironment()) {
      this.validateConfig();
    }
  }
}

export const configService = new ConfigService();

export type { EnvironmentVariable, EnvironmentConfig };
