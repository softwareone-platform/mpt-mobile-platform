import account from './account.json';
import admin from './admin.json';
import auth from './auth.json';
import billing from './billing.json';
import catalog from './catalog.json';
import details from './details.json';
import home from './home.json';
import marketplace from './marketplace.json';
import navigation from './navigation.json';
import program from './program.json';
import settings from './settings.json';
import shared from './shared.json';
import status from './status.json';

// Follows module structure from documents/menu.md
const en = {
  // Shared (cross-module)
  common: shared,
  status,

  // Auth (standalone)
  auth,

  // Navigation (standalone)
  navigation,

  // Module: Home (spotlightScreen)
  ...home,

  // Module: Marketplace (orders, subscriptions, agreements, etc.)
  ...marketplace,

  // Module: Billing (credit memos, invoices, statements)
  ...billing,

  // Module: Catalog (products, items, authorizations, price lists, pricing policies, listings, units of measure)
  ...catalog,

  // Module: Program (programs, enrollments, certificates)
  ...program,

  // Module: Settings (profile, users, account settings, licensees)
  ...settings,
  ...details,

  // Module: Account (account details - vendor, client, operations)
  ...account,

  // Module Administration (buyers, sellers)
  ...admin,
};

export default en;
