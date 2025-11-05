jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-auth0', () => {
  return jest.fn().mockImplementation(() => ({
    auth: {
      passwordlessWithEmail: jest.fn(),
      refreshToken: jest.fn(),
      userInfo: jest.fn(),
      revoke: jest.fn(),
    },
  }));
});

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

jest.mock('@/config/environment', () => ({
  default: {
    AUTH0_DOMAIN: 'test-domain.auth0.com',
    AUTH0_CLIENT_ID: 'test-client-id',
    AUTH0_AUDIENCE: 'test-audience',
    AUTH0_SCOPE: 'openid profile email',
  },
}));

const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});