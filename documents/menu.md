# Mobile App Modules - Menu Structure

This document outlines the menu structure from the SoftwareOne Marketplace Platform and helps identify which URLs/pages will be transformed into the mobile app. Each module corresponds to a context/service file that groups related functionality together.

## Module Organization Strategy

We follow a **Domain-Driven Module-Based Architecture** where each module is a self-contained unit with its own services, hooks, context, types, and screens.

### Folder Structure

```
src/
├── modules/
│   ├── billing/
│   │   ├── services/
│   │   │   └── billingService.ts      # API calls for all billing endpoints
│   │   ├── hooks/
│   │   │   ├── useCreditMemosData.ts  # React Query hook for credit memos
│   │   │   ├── useInvoicesData.ts     # React Query hook for invoices
│   │   │   └── useStatementsData.ts   # React Query hook for statements
│   │   ├── context/
│   │   │   └── BillingContext.tsx     # State provider for billing module
│   │   ├── types/
│   │   │   └── billing.ts             # TypeScript types (CreditMemo, Invoice...)
│   │   ├── screens/
│   │   │   ├── CreditMemosScreen.tsx
│   │   │   ├── InvoicesScreen.tsx
│   │   │   └── StatementsScreen.tsx
│   │   └── index.ts                   # Public exports for this module
│   │
│   ├── marketplace/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   ├── screens/
│   │   └── index.ts
│   │
│   └── [other-modules]/
│       └── ...
│
├── shared/                             # Cross-module utilities
│   ├── components/                    # Reusable UI (List, Chip, Avatar...)
│   ├── hooks/                         # useApi, usePaginatedQuery...
│   ├── types/                         # api.ts, navigation.ts...
│   ├── utils/
│   └── styles/
│
├── config/
├── constants/
├── i18n/
└── lib/
```

### Key Principles

| Principle | Description |
|-----------|-------------|
| **1 Module = 1 Folder** | Everything related to a module lives in `modules/{module-name}/` |
| **Self-Contained** | Each module has its own services, hooks, context, types, and screens |
| **Public API via index.ts** | Modules export only what's needed by other modules |
| **Shared utilities** | Cross-cutting concerns go in `shared/` folder |
| **User Type Awareness** | Some features are available to all users, others are role-specific (Operations, Client, Vendor) |

### Naming Conventions

| Layer | Convention | Example |
|-------|------------|--------|
| Service | `use{Module}Api()` | `useBillingApi()` |
| Query Hook | `use{Entity}Data()` | `useCreditMemosData()` |
| Context | `{Module}Context` | `BillingContext` |
| Types | `{Entity}` (singular) | `CreditMemo`, `Invoice` |
| Screen | `{Entity}Screen` | `CreditMemosScreen` |

### Benefits

- **Isolation** - Easy to delete, refactor, or disable entire modules
- **Scalability** - Adding new modules doesn't pollute existing folders
- **Discoverability** - All billing-related code is in `modules/billing/`
- **Clear boundaries** - `index.ts` controls what's exposed to other modules
- **Onboarding** - New developers can focus on one module at a time

---

## Modules Overview

| Module | Icon | Description |
|--------|------|-------------|
| Home | `home` | Centralized homepage with favorites and quick access |
| Billing | `receipt_long` | Financial transactions, invoices, credit memos |
| Marketplace | `shopping_cart` | Agreements, orders, subscriptions |
| Catalog | `widgets` | Products, items, price lists |
| Helpdesk | `3p` | Support cases and feedback |
| Settings | `settings` | Account, users, groups management |
| Inventory | `inventory` | License agreements, software assets |
| Cloud Tools | `analytics` | Cloud management and optimization |
| ITAM Tools | `business` | IT asset management tools |
| Procurement | `perm_data_setting` | Sales quotes and orders |
| Procurement Workbench | `shopping_basket` | Cart, cloud subscriptions |
| Program | `handshake` | Vendor programs and enrollments |
| Administration | `apartment` | Platform administration (Operations only) |
| Chat | `chat_bubble_outline` | Helpdesk chats |
| Other Tools | `group` | Dashboard, reports, collaboration |
| Partner | `group_work` | Partner management (Partners only) |

---

## Detailed Module Breakdown

### 1. Home Module
**Service File:** `homeService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Home | `/` | All | - |

---

### 2. Billing Module
**Service File:** `billingService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Credit cards | `/portal/CreditCard/BuyAuthorizationRequired` | Client | `billing` |
| Credit memos | `/billing/credit-memos` | Operations, Client | `billing` |
| Overrides | `/billing/overrides` | Operations | `billing` |
| Custom ledgers | `/billing/custom-ledgers` | Operations | `billing` |
| Invoices | `/billing/invoices` | Operations, Client | `billing` |
| Journals | `/billing/journals` | Operations, Vendor | `billing` |
| Ledgers | `/billing/ledgers` | Operations | `billing` |
| Sales orders | `/portal/orders` | Client | `billing` |
| Statements | `/billing/statements` | Operations, Client | `billing` |
| Shipments | `/portal/Shipments` | Client | `billing` |
| Analytics | `/billing/analytics` | All | `billing` |

---

### 3. Marketplace Module
**Service File:** `marketplaceService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Agreements | `/commerce/agreements` | All | `new-marketplace` |
| Orders | `/commerce/orders` | All | `new-marketplace` |
| Requests | `/commerce/requests` | All | `new-marketplace` |
| Subscriptions | `/commerce/subscriptions` | All | `new-marketplace` |
| Assets | `/commerce/assets` | All | `new-marketplace` |
| Entitlements | `/commerce/entitlements` | All | `new-marketplace` |

---

### 4. Catalog Module
**Service File:** `catalogService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Products (Ops/Vendor) | `/catalog/products` | Operations, Vendor | `catalog-management` |
| Products (Client) | `/catalog/products` | Client | `new-marketplace` |
| Items (Ops/Vendor) | `/catalog/items` | Operations, Vendor | `catalog-management` |
| Items (Client) | `/catalog/items` | Client | `new-marketplace` |
| Authorizations | `/catalog/authorizations` | Operations, Vendor | `catalog-management` |
| Price lists (Ops/Vendor) | `/catalog/price-lists` | Operations, Vendor | `catalog-management` |
| Price lists (Client) | `/catalog/price-lists` | Client | `new-marketplace` |
| Pricing policies | `/catalog/pricing-policies` | Operations | `catalog-management` |
| Listings | `/catalog/listings` | Operations, Vendor | `catalog-management` |
| Units of measure | `/catalog/units-of-measure` | Operations | `catalog-management` |

---

### 5. Helpdesk Module
**Service File:** `helpdeskService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Cases | `/helpdesk/cases` | All | `helpdesk` |
| Feedback | `/helpdesk/feedback` | All | `helpdesk` |
| Chats | `/helpdesk/chats` | All | - |

---

### 6. Settings Module
**Service File:** `settingsService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Account | `/administration/settings/account` | All | `account-management` |
| API tokens | `/administration/settings/api-tokens` | All | `access-management` |
| Audit trail | `/administration/settings/audit-trail` | All | `access-management` |
| Buyers | `/administration/settings/buyers` | Client | `account-management` |
| Company structure | `/account-management/company-tree` | Client | `user-management` |
| Licensees | `/administration/settings/licensees` | Client | `account-management` |
| Sellers | `/administration/settings/sellers` | Client | `account-management` |
| Groups | `/administration/settings/groups` | All | `access-management` |
| Notifications | `/administration/settings/notifications` | All | `notifications` |
| User management | `/iam` | Client | `user-management` |
| Users | `/administration/settings/users` | All | `access-management` |
| Exchange | `/exchange/currencies` | Client, Vendor | - |

---

### 7. Inventory Module
**Service File:** `inventoryService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Agreement terms | `/portal/LicenseAgreements/Terms` | Client | `compliance-check` |
| License agreements | `/portal/LicenseAgreements/List` | Client | `digital-supply-chain`, `procurement` |
| License keys | `/portal/LicenseAgreements/LicenseKeys` | Client | `digital-supply-chain`, `procurement` |
| Quotes | `/portal/Quotes/Documents` | Client | `digital-supply-chain`, `procurement` |
| Software assets | `/portal/SoftwareAssets` | Client | `digital-supply-chain`, `procurement` |
| Software downloads | `/esd` | Client | `software-downloads` |

---

### 8. Cloud Tools Module
**Service File:** `cloudToolsService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| 365 Analytics | External URL | Client | `digital-workplace-essentials` |
| AzureSimple | `/services/azure-simple` | Client | `azure-simple` |
| Budgets | `/cgbm/budgets` | Client | Multiple |
| Chargebacks | `/chargeback-manager` | Client | Multiple |
| Cloud cost optimization | `/cloud-cost-optimization` | Client | `cloud-cost-optimization` |
| Connect cloud accounts | `/integration-manager` | Client | Multiple |
| Consumption overview | `/report-designer` | Client | Multiple |
| Custom groups | `/cgbm` | Client | Multiple |
| Digital workplace essentials | `/services/365-simple` | Client | `digital-workplace-essentials` |
| Pricelist center | `/pricelist` | Client | Multiple |
| Recommendations | `/insights` | Client | Multiple |
| Resources | `/resource-manager` | Client | Multiple |
| Simple for AWS | `/services/aws-simple` | Client | `aws-simple` |
| Tags | `/resource-manager/tags` | Client | Multiple |
| Utilization | `/cloud-utilization` | Client | `cloud-cost-optimization` |

---

### 9. ITAM Tools Module
**Service File:** `itamService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| 365EA + Unified Support | `/services/365ea-unified` | Client | `365-ea-unified-support` |
| Compliance check | `/portal/Compliance/History` | Client | `compliance-check` |
| DSC Simple | `/services/dsc-simple` | Client | `digital-supply-chain` |
| Entitlement manager | `/entitlements` | Client | `digital-supply-chain`, `entitlement-manager` |
| Renewal manager | `/renewal-manager` | Client | `digital-supply-chain`, `renewal-manager` |
| SAM tool | `/sam-license-manager/sam-tool-redirect` | Client | `sam-simple` |
| Unified Support for MultiVendor | `/usmv` | Client | `multivendor-unified-support` |

---

### 10. Procurement Module
**Service File:** `procurementService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| ERP items | `/procurement/erp-items` | Operations | - |
| Sales quotes (Ops) | `/procurement/sales-quotes` | Operations | - |
| Sales quotes (Client) | `/procurement/sales-quotes` | Client | `new-procurement` |
| Sales orders (Ops) | `/procurement/sales-orders` | Operations | - |
| Sales orders (Client) | `/procurement/sales-orders` | Client | `new-procurement` |

---

### 11. Procurement Workbench Module
**Service File:** `procurementWorkbenchService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Cart | `/portal/shoppingcart` | Client | `digital-supply-chain`, `procurement` |
| Cloud subscriptions | `/cloud-subscriptions/marketplace` | Client | `cloud-subscription` |
| Currency overview | `/portal/Settings/CountryCurrenciesOverview` | Client | `digital-supply-chain`, `procurement` |
| EA setup wizard | `/ea` | Client | `enterprise-agreements` |
| Enterprise agreements | `/portal/EnterpriseAgreementsProcurement` | Client | `enterprise-agreements` |
| EA reporting | `/portal/EA` | Client | `enterprise-agreements` |
| Products (Catalog) | `/portal/Products/Catalog` | Client | `digital-supply-chain`, `procurement` |
| Procurement notifications | `/notifications` | Client | - |
| Purchase approval setup | `/portal/Settings/ApprovalGroups` | Client | `purchase-approval` |
| Service provider dashboard | `/portal/SPLA/Dashboard` | Client | `service-provider` |
| Service provider reporting | `/portal/SPLA/Report` | Client | `service-provider` |
| Special quotes | `/portal/SpecialQuotes/Documents` | Client | `digital-supply-chain`, `procurement` |
| Workbench | `/portal/ProcurementWorkbench` | Client | `digital-supply-chain`, `procurement` |

---

### 12. Program Module
**Service File:** `programService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Programs (Ops/Vendor) | `/program/programs` | Operations, Vendor | `new-marketplace` |
| Programs (Client) | `/program/programs` | Client | `new-marketplace` |
| Enrollments (Ops/Vendor) | `/program/enrollments` | Operations, Vendor | `new-marketplace` |
| Enrollments (Client) | `/program/enrollments` | Client | `new-marketplace` |
| Certificates (Ops/Vendor) | `/program/certificates` | Operations, Vendor | `catalog-management` |
| Certificates (Client) | `/program/certificates` | Client | `new-marketplace` |

---

### 13. Administration Module (Operations Only)
**Service File:** `administrationService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| API tokens | `/administration/accounts/api-tokens` | Operations | `platform-account-management` |
| Buyers | `/administration/accounts/buyers` | Operations | `platform-account-management` |
| Clients | `/administration/accounts` | Operations | `platform-account-management` |
| Contacts | `/administration/accounts/contacts` | Operations | `notification-administration` |
| Sellers | `/administration/accounts/sellers` | Operations | `platform-account-management` |
| Notifications | `/administration/accounts/notifications` | Operations | `notification-administration` |
| Users | `/administration/accounts/users` | Operations | `platform-account-management` |
| Vendors | `/administration/accounts/vendors` | Operations | `platform-account-management` |
| Task log | `/administration/accounts/task-log` | Operations | - |
| Exchange | `/exchange/currencies` | Operations | - |
| Helpdesk config | `/administration/settings/helpdesk` | Operations | `helpdesk-administration` |

---

### 14. Other Tools Module
**Service File:** `otherToolsService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Collaboration site | `/collaboration-site` | Client | `collaboration-site` |
| Dashboard | `/dashboard` | Client | Multiple |
| Reports | `/reporting-engine` | Client | Multiple |

---

### 15. Partner Module (Partners Only)
**Service File:** `partnerService.ts`

| Feature | URL | User Type | Permission |
|---------|-----|-----------|------------|
| Customer contracts | `/portal/VARLicenseAgreements` | Client | `partner-management` |
| Customers | `/portal/VARRelatedCustomers` | Client | `partner-management` |
| Fee transactions | `/portal/VARFeeTransactions` | Client | `partner-management` |
| Opportunities | `/portal/VAROpportunities` | Client | `partner-management` |
| Partner agreement | `/portal/VARPartnerAgreement` | Client | `partner-management` |
| Sales transactions | `/portal/VARSalesTransactions` | Client | `partner-management` |

---

## Notes

- URLs starting with `/portal/` are legacy portal endpoints
- URLs starting with `/administration/` are newer admin endpoints
- External URLs (like 365 Analytics) require special handling
- Multiple permissions separated by space indicate OR logic (user needs at least one)
