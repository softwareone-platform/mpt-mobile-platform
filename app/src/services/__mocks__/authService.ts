const authService = {
  reinitialize: jest.fn(),
  sendPasswordlessEmail: jest.fn(),
  loginWithEmail: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  isTokenExpired: jest.fn(),
  verifyPasswordlessOtp: jest.fn(),
};

export default authService;
