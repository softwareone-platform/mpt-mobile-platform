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

const MANIFEST_PATH = '/manifest.json';

const parseMajorVersion = (version: string): number => {
  const match = version.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
};

export async function fetchPortalVersion(): Promise<PortalVersionInfo> {
  const baseUrl = configService.get('AUTH0_API_URL');
  if (!baseUrl) {
    console.warn('Portal version fetch skipped: Api url not configured');
    return { fullVersion: '', majorVersion: 0 };
  }

  const url = `${baseUrl.replace(/\/+$/, '')}${MANIFEST_PATH}`;

  try {
    const { data } = await apiClient.get<PortalManifest>(url);
    const fullVersion = data.version || '';
    const majorVersion = parseMajorVersion(fullVersion);
    
    if (majorVersion === 0 && fullVersion) {
      console.warn(`Portal version "${fullVersion}" could not be parsed to a valid major version`);
    }
    
    return { fullVersion, majorVersion };
  } catch (error) {
    console.error('Failed to fetch portal manifest:', error);
    return { fullVersion: '', majorVersion: 0 };
  }
}

export { parseMajorVersion };
