import { renderHook, act } from '@testing-library/react-native';

import {
  mockCertificateId1,
  mockCertificateId2,
  mockCertificateData,
  expectedCertificateUrl1,
  expectedCertificateUrl2,
  mockCertificateResponse1,
  mockCertificateResponse2,
} from '../__mocks__/services/certificate';
import { mockNetworkError } from '../__mocks__/services/common';

import { useCertificateApi } from '@/services/certificateService';

const mockGet = jest.fn();

jest.mock('@/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
  }),
}));

const setup = () => renderHook(() => useCertificateApi()).result.current;

describe('useCertificateApi - getCertificateData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getCertificateData with correct endpoint and returns data', async () => {
    const api = setup();

    let res;

    mockGet.mockResolvedValueOnce(mockCertificateData);

    await act(async () => {
      res = await api.getCertificateData(mockCertificateId1);
    });

    expect(mockGet).toHaveBeenCalledWith(expectedCertificateUrl1);
    expect(res).toEqual(mockCertificateData);
  });

  it('handles API errors correctly', async () => {
    const api = setup();

    mockGet.mockRejectedValueOnce(mockNetworkError);

    await expect(api.getCertificateData(mockCertificateId1)).rejects.toThrow('Network error');
  });

  it('handles multiple calls correctly', async () => {
    const api = setup();

    let res1;
    let res2;

    mockGet.mockResolvedValueOnce(mockCertificateResponse1);
    mockGet.mockResolvedValueOnce(mockCertificateResponse2);

    await act(async () => {
      res1 = await api.getCertificateData(mockCertificateId1);
    });

    await act(async () => {
      res2 = await api.getCertificateData(mockCertificateId2);
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, expectedCertificateUrl1);
    expect(mockGet).toHaveBeenNthCalledWith(2, expectedCertificateUrl2);

    expect(res1).toEqual(mockCertificateResponse1);
    expect(res2).toEqual(mockCertificateResponse2);
  });
});
