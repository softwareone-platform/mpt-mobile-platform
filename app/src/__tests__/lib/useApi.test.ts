import { useApi } from '@/hooks/useApi';
import apiClient from '@/lib/apiClient';

jest.mock('@/lib/apiClient');

describe('useApi', () => {
  const api = useApi();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('get calls apiClient.get and returns data', async () => {
    const mockData = { foo: 'bar' };
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await api.get('/test');
    expect(apiClient.get).toHaveBeenCalledWith('/test');
    expect(result).toEqual(mockData);
  });

  it('post calls apiClient.post with body and returns data', async () => {
    const mockData = { success: true };
    const body = { foo: 'bar' };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await api.post('/test', body);
    expect(apiClient.post).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('put calls apiClient.put with body and returns data', async () => {
    const mockData = { updated: true };
    const body = { foo: 'bar' };
    (apiClient.put as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await api.put('/test', body);
    expect(apiClient.put).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('patch calls apiClient.patch with body and returns data', async () => {
    const mockData = { patched: true };
    const body = { foo: 'bar' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await api.patch('/test', body);
    expect(apiClient.patch).toHaveBeenCalledWith('/test', body);
    expect(result).toEqual(mockData);
  });

  it('delete calls apiClient.delete and returns data', async () => {
    const mockData = { deleted: true };
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await api.delete('/test');
    expect(apiClient.delete).toHaveBeenCalledWith('/test');
    expect(result).toEqual(mockData);
  });
});
