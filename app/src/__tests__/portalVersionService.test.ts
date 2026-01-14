import { AxiosResponse } from 'axios';

import { configService } from '../config/env.config';
import apiClient from '../lib/apiClient';
import { parseMajorVersion, fetchPortalVersion } from '../services/portalVersionService';

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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('parseMajorVersion', () => {
    it('should parse major version from full version string', () => {
      expect(parseMajorVersion('5.0.2494-g4c551809')).toBe(5);
    });

    it('should parse single digit major version', () => {
      expect(parseMajorVersion('4.1.0')).toBe(4);
    });

    it('should parse double digit major version', () => {
      expect(parseMajorVersion('12.3.456')).toBe(12);
    });

    it('should return 0 for invalid version strings', () => {
      expect(parseMajorVersion('invalid')).toBe(0);
      expect(parseMajorVersion('abc.1.2')).toBe(0);
      expect(parseMajorVersion('')).toBe(0);
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
      expect(mockApiClient.get).toHaveBeenCalledWith('https://api.example.com/manifest.json');
      expect(result).toEqual({
        fullVersion: '5.0.2494-g4c551809',
        majorVersion: 5,
      });
    });
    it('should return object with majorVersion 0 when version is empty', async () => {
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
        majorVersion: 0,
      });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should return object with majorVersion 0 and warn when version cannot be parsed', async () => {
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
        majorVersion: 0,
      });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Portal version "invalid-version" could not be parsed'),
      );
    });

    it('should return default values when AUTH0_API_URL is not configured', async () => {
      mockConfigService.get.mockReturnValue('');

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        majorVersion: 0,
      });
      expect(console.warn).toHaveBeenCalledWith(
        'Portal version fetch skipped: Api url not configured',
      );
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should return default values when API call fails', async () => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await fetchPortalVersion();

      expect(result).toEqual({
        fullVersion: '',
        majorVersion: 0,
      });
    });

    it('should handle URL with trailing slash correctly', async () => {
      mockConfigService.get.mockReturnValue('https://api.example.com/');
      mockApiClient.get.mockResolvedValue({
        data: {
          product: 'marketplace',
          components: {},
          version: '6.1.0',
        },
      } as AxiosResponse<PortalManifest>);

      await fetchPortalVersion();

      expect(mockApiClient.get).toHaveBeenCalledWith('https://api.example.com/manifest.json');
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
        majorVersion: 0,
      });
    });
  });
});
