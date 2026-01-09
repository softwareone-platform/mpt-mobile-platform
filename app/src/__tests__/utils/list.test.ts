import {
  statusList,
  baseItem,
  configFull,
  expectedMappedItemFull,
  configNoImageNoSubtitle,
  expectedMappedItemNoImageNoSubtitle,
  itemWithNumericField,
} from '../__mocks__/utils/list';

import type { ListItemWithStatusProps } from '@/types/lists';
import { getStatus, mapToListItemProps } from '@/utils/list';

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

describe('mapToListItemProps', () => {
  it('maps all fields correctly', () => {
    const result: ListItemWithStatusProps = mapToListItemProps(baseItem, configFull);

    expect(result).toEqual(expectedMappedItemFull);
  });

  it('handles missing optional subtitle and imagePath', () => {
    const result: ListItemWithStatusProps = mapToListItemProps(baseItem, configNoImageNoSubtitle);

    expect(result).toEqual(expectedMappedItemNoImageNoSubtitle);
  });

  it('converts numeric or boolean values to string', () => {
    const result = mapToListItemProps(itemWithNumericField, configFull);

    expect(result).toEqual(expectedMappedItemFull);
  });
});
