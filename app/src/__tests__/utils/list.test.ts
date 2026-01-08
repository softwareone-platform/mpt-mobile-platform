import { statusList } from '../__mocks__/utils/list';

import { getStatus } from '@/utils/list';

describe('getStatus with mock status list', () => {
  it('returns correct Status for keys in the mock', () => {
    expect(getStatus('Accepted', statusList)).toBe('success');
    expect(getStatus('Invitation Expired', statusList)).toBe('default');
    expect(getStatus('Configuring', statusList)).toBe('info');
    expect(getStatus('Conflict', statusList)).toBe('danger');
    expect(getStatus('Review', statusList)).toBe('warning');
  });

  it('returns "default" for keys not in the mock', () => {
    expect(getStatus('Unknown', statusList)).toBe('default');
    expect(getStatus('Pending', statusList)).toBe('default');
    expect(getStatus('', statusList)).toBe('default');
  });

  it('handles edge cases gracefully - whitespace, casing, or special chars', () => {
    expect(getStatus(' accepted ', statusList)).toBe('default');
    expect(getStatus('REVIEW', statusList)).toBe('default');
    expect(getStatus('For_Sale', statusList)).toBe('default');
  });
});
