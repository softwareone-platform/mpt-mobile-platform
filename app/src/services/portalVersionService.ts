import { configService } from '@/config/env.config';
import apiClient from '@/lib/apiClient';

type PortalManifest = {
  product: string;
  components: Record<string, string>;
  version: string;
};

export type PortalVersionInfo = {
  fullVersion: string;
  major: number;
  minor: number;
  patch: number;
};

const FALLBACK_MAJOR_VERSION = 4;
const FALLBACK_MINOR_VERSION = 0;
const FALLBACK_PATCH_VERSION = 0;

const parseSemanticVersion = (version: string): { major: number; minor: number; patch: number } => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (match) {
    return {
      major: Number(match[1]),
      minor: Number(match[2]),
      patch: Number(match[3]),
    };
  }
  return {
    major: FALLBACK_MAJOR_VERSION,
    minor: FALLBACK_MINOR_VERSION,
    patch: FALLBACK_PATCH_VERSION,
  };
};

export async function fetchPortalVersion(): Promise<PortalVersionInfo> {
  const baseUrl = configService.get('AUTH0_API_URL');
  if (!baseUrl) {
    console.warn('Portal version fetch skipped: Api url not configured, using fallback');
    return {
      fullVersion: '',
      major: FALLBACK_MAJOR_VERSION,
      minor: FALLBACK_MINOR_VERSION,
      patch: FALLBACK_PATCH_VERSION,
    };
  }

  try {
    const { data } = await apiClient.get<PortalManifest>(baseUrl, {
      noAuth: true,
      headers: {
        Accept: 'application/json',
      },
    } as { noAuth: boolean; headers: Record<string, string> });

    const fullVersion = data.version || '';
    const { major, minor, patch } = parseSemanticVersion(fullVersion);

    return { fullVersion, major, minor, patch };
  } catch (error) {
    console.error('Failed to fetch portal manifest, using fallback version:', error);
    return {
      fullVersion: '',
      major: FALLBACK_MAJOR_VERSION,
      minor: FALLBACK_MINOR_VERSION,
      patch: FALLBACK_PATCH_VERSION,
    };
  }
}

export { parseSemanticVersion };
