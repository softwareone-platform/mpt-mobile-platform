import { renderHook } from '@testing-library/react-native';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, useApi } from '@/hooks/useApi';
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

  it('apiPost calls apiClient.post without body', async () => {
    const mockData = { success: true };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPost('/test');

    expect(apiClient.post).toHaveBeenCalledWith('/test', undefined);
    expect(result).toEqual(mockData);
  });

  it('apiPut calls apiClient.put without body', async () => {
    const mockData = { updated: true };
    (apiClient.put as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPut('/test');

    expect(apiClient.put).toHaveBeenCalledWith('/test', undefined);
    expect(result).toEqual(mockData);
  });

  it('apiPatch calls apiClient.patch without body', async () => {
    const mockData = { patched: true };
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await apiPatch('/test');

    expect(apiClient.patch).toHaveBeenCalledWith('/test', undefined);
    expect(result).toEqual(mockData);
  });
});

describe('useApi - hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all HTTP methods', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current).toHaveProperty('get');
    expect(result.current).toHaveProperty('post');
    expect(result.current).toHaveProperty('put');
    expect(result.current).toHaveProperty('patch');
    expect(result.current).toHaveProperty('delete');
  });

  it('should call apiGet through hook get method', async () => {
    const mockData = { foo: 'bar' };
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());
    const response = await result.current.get('/test');

    expect(apiClient.get).toHaveBeenCalledWith('/test');
    expect(response).toEqual(mockData);
  });

  it('should call apiPost through hook post method', async () => {
    const mockData = { success: true };
    const body = { foo: 'bar' };
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());
    const response = await result.current.post('/test', body);

    expect(apiClient.post).toHaveBeenCalledWith('/test', body);
    expect(response).toEqual(mockData);
  });

  it('should call apiPut through hook put method', async () => {
    const mockData = { updated: true };
    const body = { foo: 'bar' };
    (apiClient.put as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());
    const response = await result.current.put('/test', body);

    expect(apiClient.put).toHaveBeenCalledWith('/test', body);
    expect(response).toEqual(mockData);
  });

  it('should call apiPatch through hook patch method', async () => {
    const mockData = { patched: true };
    const body = { foo: 'bar' };
    (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());
    const response = await result.current.patch('/test', body);

    expect(apiClient.patch).toHaveBeenCalledWith('/test', body);
    expect(response).toEqual(mockData);
  });

  it('should call apiDelete through hook delete method', async () => {
    const mockData = { deleted: true };
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());
    const response = await result.current.delete('/test');

    expect(apiClient.delete).toHaveBeenCalledWith('/test');
    expect(response).toEqual(mockData);
  });

  it('should maintain stable function references across renders', () => {
    const { result, rerender } = renderHook(() => useApi());

    const firstRender = result.current;
    rerender();
    const secondRender = result.current;

    expect(firstRender.get).toBe(secondRender.get);
    expect(firstRender.post).toBe(secondRender.post);
    expect(firstRender.put).toBe(secondRender.put);
    expect(firstRender.patch).toBe(secondRender.patch);
    expect(firstRender.delete).toBe(secondRender.delete);
  });

  it('should return stable object reference with useMemo', () => {
    const { result, rerender } = renderHook(() => useApi());

    const firstApi = result.current;
    rerender();
    const secondApi = result.current;

    expect(firstApi).toBe(secondApi);
  });
});
