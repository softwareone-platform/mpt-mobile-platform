import { configService } from '@/config/env.config';
import { isReviewerEmail, REVIEW_ENVIRONMENT } from '@/config/reviewers.config';
import { updateApiClientBaseURL } from '@/lib/apiClient';
import { appInsightsService } from '@/services/appInsightsService';
import authService from '@/services/authService';
import { logger } from '@/services/loggerService';

export type EnvironmentType = 'default' | 'review';

interface EnvironmentConfig {
  type: EnvironmentType;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_AUDIENCE: string;
  AUTH0_API_URL: string;
}

class EnvironmentSwitcherService {
  private currentEnvironment: EnvironmentType = 'default';
  private originalConfig: Partial<EnvironmentConfig> | null = null;

  getEnvironmentForEmail(email: string): EnvironmentType {
    return isReviewerEmail(email) ? 'review' : 'default';
  }

  shouldSwitchEnvironment(email: string): boolean {
    const targetEnvironment = this.getEnvironmentForEmail(email);
    return this.currentEnvironment !== targetEnvironment;
  }

  async switchEnvironmentForEmail(email: string): Promise<EnvironmentType> {
    const targetEnvironment = this.getEnvironmentForEmail(email);

    if (this.currentEnvironment === targetEnvironment) {
      return this.currentEnvironment;
    }

    if (targetEnvironment === 'review') {
      await this.switchToReview();
    } else {
      await this.switchToDefault();
    }

    return this.currentEnvironment;
  }

  private async switchToReview(): Promise<void> {
    try {
      this.originalConfig ??= {
        AUTH0_DOMAIN: configService.get('AUTH0_DOMAIN'),
        AUTH0_CLIENT_ID: configService.get('AUTH0_CLIENT_ID'),
        AUTH0_AUDIENCE: configService.get('AUTH0_AUDIENCE'),
        AUTH0_API_URL: configService.get('AUTH0_API_URL'),
      };

      configService.update({
        AUTH0_DOMAIN: REVIEW_ENVIRONMENT.AUTH0_DOMAIN,
        AUTH0_CLIENT_ID: REVIEW_ENVIRONMENT.AUTH0_CLIENT_ID,
        AUTH0_AUDIENCE: REVIEW_ENVIRONMENT.AUTH0_AUDIENCE,
        AUTH0_API_URL: REVIEW_ENVIRONMENT.AUTH0_API_URL,
      });

      await authService.reinitialize();
      updateApiClientBaseURL();

      this.currentEnvironment = 'review';

      appInsightsService.trackEvent({
        name: 'ReviewerEnvironmentSwitch',
        properties: {
          environment: 'review',
        },
      });
    } catch (error) {
      logger.error('Failed to switch to review environment', error, {
        operation: 'switchToReview',
      });
      throw error instanceof Error ? error : new Error('Failed to switch to review environment');
    }
  }

  private async switchToDefault(): Promise<void> {
    if (!this.originalConfig) {
      logger.warn('Original config not stored, cannot switch environment', {
        operation: 'switchToDefault',
      });
      return;
    }

    try {
      configService.update({
        AUTH0_DOMAIN: this.originalConfig.AUTH0_DOMAIN!,
        AUTH0_CLIENT_ID: this.originalConfig.AUTH0_CLIENT_ID!,
        AUTH0_AUDIENCE: this.originalConfig.AUTH0_AUDIENCE!,
        AUTH0_API_URL: this.originalConfig.AUTH0_API_URL!,
      });

      await authService.reinitialize();
      updateApiClientBaseURL();

      this.currentEnvironment = 'default';
    } catch (error) {
      logger.error('Failed to switch to default environment', error, {
        operation: 'switchToDefault',
      });
      throw error instanceof Error ? error : new Error('Failed to switch to default environment');
    }
  }

  getCurrentEnvironment(): EnvironmentType {
    return this.currentEnvironment;
  }

  async reset(): Promise<void> {
    if (this.currentEnvironment === 'review' && this.originalConfig) {
      await this.switchToDefault();
    }
    this.originalConfig = null;
  }
}

export const environmentSwitcherService = new EnvironmentSwitcherService();
