import { queryClient } from '@/config/queryClient';

describe('queryClient', () => {
  it('should be defined', () => {
    expect(queryClient).toBeDefined();
  });

  it('should have default query options configured', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    
    expect(defaultOptions.queries).toBeDefined();
    expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 5); // 5 minutes
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 1); // 1 minute
    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it('should have default mutation options configured', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    
    expect(defaultOptions.mutations).toBeDefined();
    expect(defaultOptions.mutations?.retry).toBe(1);
  });
});
