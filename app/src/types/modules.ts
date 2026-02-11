export const MODULES_CLAIMS_KEY = 'https://claims.softwareone.com/modules';
export const ACCOUNT_TYPE_CLAIM_KEY = 'https://claims.softwareone.com/accountType';

export type ModulePermission = 'read' | 'edit';

export type ModuleName =
  | 'access-management'
  | 'account-management'
  | 'billing'
  | 'catalog-management'
  | 'compliance-check'
  | 'digital-supply-chain'
  | 'enterprise-agreements'
  | 'new-marketplace'
  | 'notification-administration'
  | 'notifications'
  | 'partner-management'
  | 'platform-account-management'
  | 'procurement'
  | 'purchase-approval'
  | 'service-provider';

export type ModuleClaims = Partial<Record<ModuleName, ModulePermission[]>>;

export interface ModuleClaimsPayload {
  [MODULES_CLAIMS_KEY]?: ModuleClaims;
  [ACCOUNT_TYPE_CLAIM_KEY]?: string;
  [key: string]: unknown;
}
