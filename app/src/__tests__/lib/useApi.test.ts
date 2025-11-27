import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/hooks/useApi';
import apiClient from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('useApi - pure functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('apiGet calls apiClient.get and returns data', async () => {
    const mockData = { foo: 'bar' };
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiGet('/test');

    expect(apiClient.get).toHaveBeenCalledWith('/test');
    expect(result).toEqual(mockData);
  });

  it('apiPost calls apiClient.post with body and returns data', async () => {
    const mockData = { success: true };
    const body = { foo: 'bar' };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPost('/test', body);

    expect(apiClient.post).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('apiPut calls apiClient.put with body and returns data', async () => {
    const mockData = { updated: true };
    const body = { foo: 'bar' };
    (apiClient.put as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPut('/test', body);

    expect(apiClient.put).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('apiPatch calls apiClient.patch with body and returns data', async () => {
    const mockData = { patched: true };
    const body = { foo: 'bar' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPatch('/test', body);

    expect(apiClient.patch).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('apiDelete calls apiClient.delete and returns data', async () => {
    const mockData = { deleted: true };
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiDelete('/test');

    expect(apiClient.delete).toHaveBeenCalledWith('/test');
    expect(result).toEqual(mockData);
  });
});
