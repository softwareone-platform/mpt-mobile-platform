import { AxiosResponse } from 'axios';

jest.mock('../services/appInsightsService', () => ({
  appInsightsService: {
    trackException: jest.fn(),
  },
}));

import { configService } from '../config/env.config';
import apiClient from '../lib/apiClient';
import { parseSemanticVersion, fetchPortalVersion } from '../services/portalVersionService';

jest.mock('../config/env.config');
jest.mock('../lib/apiClient');

const mockConfigService = configService as jest.Mocked<typeof configService>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

type PortalManifest = {
  product: string;
  components: Record<string, string>;
  version?: string;
};

describe('portalVersionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseSemanticVersion', () => {
    it('parses full semantic version from version with commit', () => {
      const result = parseSemanticVersion('4.0.1661-gab73f827');
      expect(result).toEqual({ major: 4, minor: 0, patch: 1661 });
    });

    it('parses semantic version from simple version string', () => {
      const result = parseSemanticVersion('5.2.3');
      expect(result).toEqual({ major: 5, minor: 2, patch: 3 });
    });

    it('parses semantic version with large patch number', () => {
      const result = parseSemanticVersion('4.0.1661');
      expect(result).toEqual({ major: 4, minor: 0, patch: 1661 });
    });

    it('returns fallback version for empty string', () => {
      const result = parseSemanticVersion('');
      expect(result).toEqual({ major: 4, minor: 0, patch: 0 });
    });

    it('returns fallback version for invalid string', () => {
      const result = parseSemanticVersion('invalid');
      expect(result).toEqual({ major: 4, minor: 0, patch: 0 });
    });

    it('returns fallback version for partial version string', () => {
      const result = parseSemanticVersion('5.2');
      expect(result).toEqual({ major: 4, minor: 0, patch: 0 });
    });
  });

  describe('fetchPortalVersion', () => {
    const mockBaseUrl = 'https://api.example.com';

    it('should fetch and parse portal version successfully', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockResolvedValue({
        data: {
          product: 'marketplace',
          components: {},
          version: '5.0.2494-g4c551809',
        },
      } as AxiosResponse<PortalManifest>);

      const result = await fetchPortalVersion();

      expect(mockConfigService.get).toHaveBeenCalledWith('AUTH0_API_URL');
      expect(mockApiClient.get).toHaveBeenCalledWith(
        'https://api.example.com',
        expect.objectContaining({
          noAuth: true,
          headers: { Accept: 'application/json' },
        }),
      );
      expect(result).toEqual({
        fullVersion: '5.0.2494-g4c551809',
        major: 5,
        minor: 0,
        patch: 2494,
      });
    });
    it('should return fallback version 4 when version is empty', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockResolvedValue({
        data: {
          product: 'marketplace',
          components: {},
          version: '',
        },
      } as AxiosResponse<PortalManifest>);

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        major: 4,
        minor: 0,
        patch: 0,
      });
    });

    it('should return fallback version 4 when version cannot be parsed', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockResolvedValue({
        data: {
          product: 'marketplace',
          components: {},
          version: 'invalid-version',
        },
      } as AxiosResponse<PortalManifest>);

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: 'invalid-version',
        major: 4,
        minor: 0,
        patch: 0,
      });
    });

    it('should return fallback version 4 when AUTH0_API_URL is not configured', async () => {
      mockConfigService.get.mockReturnValue('');

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        major: 4,
        minor: 0,
        patch: 0,
      });
      expect(console.warn).toHaveBeenCalledWith(
        'Portal version fetch skipped: Api url not configured, using fallback',
      );
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should return fallback version 4 when API call fails', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        major: 4,
        minor: 0,
        patch: 0,
      });
    });

    it('should handle missing version field in response', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockResolvedValue({
        data: {
          product: 'marketplace',
          components: {},
        },
      } as AxiosResponse<PortalManifest>);

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        major: 4,
        minor: 0,
        patch: 0,
      });
    });
  });
});
