const { apiClient } = require('./api-client');
const { API_OPS_TOKEN, LIMITED_TEST_DATA } = require('./env');

let cachedProfilePromise;

function getTotalCount(response) {
  if (!response) {
    return 0;
  }

  if (typeof response.pagination?.total === 'number') {
    return response.pagination.total;
  }

  if (Array.isArray(response.data)) {
    return response.data.length;
  }

  if (Array.isArray(response)) {
    return response.length;
  }

  return 0;
}

async function safeCheck(fn, fallback = false) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

async function buildProfile() {
  const tokenUserId = apiClient.getTokenUserId();
  const canProbeSpotlightByToken = !!tokenUserId;

  const profile = {
    generatedAt: new Date().toISOString(),
    tokenUserId,
    userId: tokenUserId,
    limitedMode: LIMITED_TEST_DATA,
    apiTokenAvailable: !!API_OPS_TOKEN,
    datasets: {
      spotlight: false,
      orders: false,
      subscriptions: false,
      agreements: false,
      programs: false,
      enrollments: false,
      buyers: false,
      licensees: false,
      invoices: false,
      journals: false,
      users: false,
    },
  };

  if (!API_OPS_TOKEN) {
    return profile;
  }

  const [
    spotlightAvailability,
    orders,
    subscriptions,
    agreements,
    programs,
    enrollments,
    buyers,
    licensees,
    invoices,
  ] = await Promise.all([
    canProbeSpotlightByToken
      ? safeCheck(() => apiClient.getSpotlightDataAvailability(), null)
      : Promise.resolve(null),
    safeCheck(() => apiClient.hasOrders()),
    safeCheck(() => apiClient.hasSubscriptions()),
    safeCheck(() => apiClient.hasAgreements()),
    safeCheck(() => apiClient.hasPrograms()),
    safeCheck(() => apiClient.hasEnrollments()),
    safeCheck(() => apiClient.hasBuyers()),
    safeCheck(() => apiClient.hasLicensees()),
    safeCheck(async () => {
      const response = await apiClient.getInvoices({ limit: 1 });
      return getTotalCount(response) > 0;
    }),
  ]);

  profile.datasets.orders = orders;
  profile.datasets.subscriptions = subscriptions;
  profile.datasets.agreements = agreements;
  profile.datasets.programs = programs;
  profile.datasets.enrollments = enrollments;
  profile.datasets.buyers = buyers;
  profile.datasets.licensees = licensees;
  profile.datasets.invoices = invoices;

  if (spotlightAvailability) {
    profile.datasets.spotlight =
      spotlightAvailability.hasOrders ||
      spotlightAvailability.hasSubscriptions ||
      spotlightAvailability.hasUsers ||
      spotlightAvailability.hasInvoices ||
      spotlightAvailability.hasJournals ||
      spotlightAvailability.hasEnrollments ||
      spotlightAvailability.hasBuyers;
    profile.datasets.journals = !!spotlightAvailability.hasJournals;
    profile.datasets.users = !!spotlightAvailability.hasUsers;
  }

  return profile;
}

async function detectTestDataProfile({ forceRefresh = false } = {}) {
  if (!cachedProfilePromise || forceRefresh) {
    cachedProfilePromise = buildProfile();
  }

  return cachedProfilePromise;
}

module.exports = {
  detectTestDataProfile,
};
