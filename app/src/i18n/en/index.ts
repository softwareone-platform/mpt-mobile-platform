import auth from './auth.json';
import billing from './billing.json';
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

  // Module: Program (programs, enrollments, certificates)
  ...program,

  // Module: Settings (profile, users, account settings)
  ...settings,
  ...details,
};

export default en;
