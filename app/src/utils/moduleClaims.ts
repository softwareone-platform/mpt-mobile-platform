import { jwtDecode } from 'jwt-decode';

import { MODULES_CLAIMS_KEY, ACCOUNT_TYPE_CLAIM_KEY } from '@/constants/auth';
import { appInsightsService } from '@/services/appInsightsService';
import { AccountType } from '@/types/common';
import { ModuleClaims, ModuleClaimsPayload, ModuleName } from '@/types/modules';

export function getModuleClaims(accessToken: string): ModuleClaims | null {
  try {
    const decoded = jwtDecode<ModuleClaimsPayload>(accessToken);
    const claims = decoded[MODULES_CLAIMS_KEY];
    return claims || null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to decode module claims');
    appInsightsService.trackException(err, { operation: 'getModuleClaims' }, 'Error');
    console.error('Failed to extract module claims:', err.message);
    return null;
  }
}

export function hasModuleAccess(accessToken: string, moduleName: ModuleName): boolean {
  const claims = getModuleClaims(accessToken);
  if (!claims) return false;

  const modulePermissions = claims[moduleName];
  const hasAccess = !!modulePermissions && modulePermissions.length > 0;
  return hasAccess;
}

export function getAccountType(accessToken: string): AccountType | null {
  try {
    const decoded = jwtDecode<ModuleClaimsPayload>(accessToken);
    const accountType = decoded[ACCOUNT_TYPE_CLAIM_KEY];
    return (accountType as AccountType) || null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Failed to decode account type');
    appInsightsService.trackException(err, { operation: 'getAccountType' }, 'Error');
    console.error('Failed to extract account type:', err.message);
    return null;
  }
}
