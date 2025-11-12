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
      loginWithEmail: jest.fn(),
      refreshToken: jest.fn(),
      userInfo: jest.fn(),
      revoke: jest.fn(),
    },
  }));
});

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
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