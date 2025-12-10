import { parseMajorVersion, fetchPortalVersion } from '../services/portalVersionService';
import { configService } from '../config/env.config';
import apiClient from '../lib/apiClient';

jest.mock('../config/env.config');
jest.mock('../lib/apiClient');

const mockConfigService = configService as jest.Mocked<typeof configService>;
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

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
            } as any);

            const result = await fetchPortalVersion();

            expect(mockConfigService.get).toHaveBeenCalledWith('AUTH0_API_URL');
            expect(mockApiClient.get).toHaveBeenCalledWith(
                'https://api.example.com/manifest.json'
            );
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
            } as any);

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
            } as any);

            const result = await fetchPortalVersion();

            expect(result).toEqual({
                fullVersion: 'invalid-version',
                majorVersion: 0,
            });
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Portal version "invalid-version" could not be parsed')
            );
        });
    });
});
