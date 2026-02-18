export const updateApiClientBaseURL = jest.fn();

// Mock the apiClient instance
const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

export default apiClient;
