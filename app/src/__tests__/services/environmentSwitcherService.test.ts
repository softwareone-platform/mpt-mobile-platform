// Mock dependencies before any imports
jest.mock('@/config/env.config');
jest.mock('@/services/authService');
jest.mock('@/lib/apiClient');
jest.mock('@/config/reviewers.config');
jest.mock('@/services/appInsightsService');

// Import after mocks are defined
import { configService } from '@/config/env.config';
import { isReviewerEmail } from '@/config/reviewers.config';
import { updateApiClientBaseURL } from '@/lib/apiClient';
import { appInsightsService } from '@/services/appInsightsService';
import authService from '@/services/authService';
import { environmentSwitcherService } from '@/services/environmentSwitcherService';

// Get mock references
const mockConfigServiceGet = configService.get as jest.Mock;
const mockConfigServiceUpdate = configService.update as jest.Mock;
const mockAuthServiceReinitialize = authService.reinitialize as jest.Mock;
const mockUpdateApiClientBaseURL = updateApiClientBaseURL as jest.Mock;
const mockIsReviewerEmail = isReviewerEmail as jest.Mock;
const mockTrackEvent = appInsightsService.trackEvent as jest.Mock;
const mockTrackException = appInsightsService.trackException as jest.Mock;

describe('EnvironmentSwitcherService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup mocks first
    mockConfigServiceGet.mockImplementation((key: string) => {
      const config: Record<string, string> = {
        AUTH0_DOMAIN: 'default-domain.com',
        AUTH0_CLIENT_ID: 'default-client-id',
        AUTH0_AUDIENCE: 'default-audience',
        AUTH0_API_URL: 'https://api.default.com',
      };
      return config[key];
    });
    mockAuthServiceReinitialize.mockResolvedValue(undefined);

    // Reset the service state before each test
    await environmentSwitcherService.reset();
  });

  describe('getEnvironmentForEmail', () => {
    it('should return "review" for reviewer email', () => {
      mockIsReviewerEmail.mockReturnValue(true);
      const result = environmentSwitcherService.getEnvironmentForEmail('reviewer@apple.com');
      expect(result).toBe('review');
    });

    it('should return "default" for non-reviewer email', () => {
      mockIsReviewerEmail.mockReturnValue(false);
      const result = environmentSwitcherService.getEnvironmentForEmail('user@example.com');
      expect(result).toBe('default');
    });
  });

  describe('getCurrentEnvironment', () => {
    it('should return current environment type', () => {
      const result = environmentSwitcherService.getCurrentEnvironment();
      expect(result).toBe('default');
    });
  });

  describe('shouldSwitchEnvironment', () => {
    it('should return true when environment needs to change', () => {
      mockIsReviewerEmail.mockReturnValue(true);
      const result = environmentSwitcherService.shouldSwitchEnvironment('reviewer@apple.com');
      expect(result).toBe(true);
    });

    it('should return false when already in correct environment', () => {
      mockIsReviewerEmail.mockReturnValue(false);
      const result = environmentSwitcherService.shouldSwitchEnvironment('user@example.com');
      expect(result).toBe(false);
    });
  });

  describe('switchEnvironmentForEmail', () => {
    it('should not switch when already in correct environment', async () => {
      mockIsReviewerEmail.mockReturnValue(false);
      const result = await environmentSwitcherService.switchEnvironmentForEmail('user@example.com');

      expect(result).toBe('default');
      expect(mockConfigServiceUpdate).not.toHaveBeenCalled();
    });

    it('should switch to review environment for reviewer email', async () => {
      mockIsReviewerEmail.mockReturnValue(true);
      const result =
        await environmentSwitcherService.switchEnvironmentForEmail('reviewer@apple.com');

      expect(result).toBe('review');
      expect(mockConfigServiceUpdate).toHaveBeenCalledWith({
        AUTH0_DOMAIN: 'review-domain.com',
        AUTH0_CLIENT_ID: 'review-client-id',
        AUTH0_AUDIENCE: 'review-audience',
        AUTH0_API_URL: 'https://api.review.com',
      });
      expect(mockAuthServiceReinitialize).toHaveBeenCalled();
      expect(mockUpdateApiClientBaseURL).toHaveBeenCalled();
      expect(mockTrackEvent).toHaveBeenCalledWith({
        name: 'ReviewerEnvironmentSwitch',
        properties: { environment: 'review' },
      });
    });

    it('should store original config on first switch', async () => {
      mockIsReviewerEmail.mockReturnValue(true);
      await environmentSwitcherService.switchEnvironmentForEmail('reviewer@apple.com');

      expect(mockConfigServiceGet).toHaveBeenCalledWith('AUTH0_DOMAIN');
      expect(mockConfigServiceGet).toHaveBeenCalledWith('AUTH0_CLIENT_ID');
      expect(mockConfigServiceGet).toHaveBeenCalledWith('AUTH0_AUDIENCE');
      expect(mockConfigServiceGet).toHaveBeenCalledWith('AUTH0_API_URL');
    });

    it('should track exception when switch fails', async () => {
      mockIsReviewerEmail.mockReturnValue(true);
      const error = new Error('Auth reinit failed');
      mockAuthServiceReinitialize.mockRejectedValue(error);

      await expect(
        environmentSwitcherService.switchEnvironmentForEmail('reviewer@apple.com'),
      ).rejects.toThrow('Auth reinit failed');

      expect(mockTrackException).toHaveBeenCalledWith(
        error,
        { operation: 'switchToReview' },
        'Error',
      );
    });
  });

  describe('reset', () => {
    it('should reset to default and clear config', async () => {
      // First switch to review
      mockIsReviewerEmail.mockReturnValue(true);
      await environmentSwitcherService.switchEnvironmentForEmail('reviewer@apple.com');

      jest.clearAllMocks();

      // Then reset
      await environmentSwitcherService.reset();

      expect(mockConfigServiceUpdate).toHaveBeenCalledWith({
        AUTH0_DOMAIN: 'default-domain.com',
        AUTH0_CLIENT_ID: 'default-client-id',
        AUTH0_AUDIENCE: 'default-audience',
        AUTH0_API_URL: 'https://api.default.com',
      });
    });

    it('should track exception when reset fails', async () => {
      // First switch to review
      mockIsReviewerEmail.mockReturnValue(true);
      await environmentSwitcherService.switchEnvironmentForEmail('reviewer@apple.com');

      jest.clearAllMocks();
      const error = new Error('Auth reinit failed');
      mockAuthServiceReinitialize.mockRejectedValue(error);

      try {
        await environmentSwitcherService.reset();
        fail('Should have thrown an error');
      } catch (err) {
        expect(err).toEqual(error);
      }

      expect(mockTrackException).toHaveBeenCalledWith(
        error,
        { operation: 'switchToDefault' },
        'Error',
      );
    });
  });
});
