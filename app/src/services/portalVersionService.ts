import { configService } from '@/config/env.config';
import apiClient from '@/lib/apiClient';

type PortalManifest = {
  product: string;
  components: Record<string, string>;
  version: string;
};

export type PortalVersionInfo = {
  fullVersion: string;
  majorVersion: number;
};

const FALLBACK_MAJOR_VERSION = 4;

const parseMajorVersion = (version: string): number => {
  const match = version.match(/^(\d+)/);
  return match ? Number(match[1]) : FALLBACK_MAJOR_VERSION;
};

export async function fetchPortalVersion(): Promise<PortalVersionInfo> {
  const baseUrl = configService.get('AUTH0_API_URL');
  if (!baseUrl) {
    console.warn('Portal version fetch skipped: Api url not configured, using fallback');
    return { fullVersion: '', majorVersion: FALLBACK_MAJOR_VERSION };
  }

  try {
    const { data } = await apiClient.get<PortalManifest>(baseUrl, {
      noAuth: true,
      headers: {
        Accept: 'application/json',
      },
    } as { noAuth: boolean; headers: Record<string, string> });

    const fullVersion = data.version || '';
    const majorVersion = parseMajorVersion(fullVersion);

    return { fullVersion, majorVersion };
  } catch (error) {
    console.error('Failed to fetch portal manifest, using fallback version:', error);
    return { fullVersion: '', majorVersion: FALLBACK_MAJOR_VERSION };
  }
}

export { parseMajorVersion };
