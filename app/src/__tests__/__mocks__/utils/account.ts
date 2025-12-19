import { UserAccount } from '@/types/api';

export const accounts: UserAccount[] = [
  {
    id: '1',
    name: 'Account 1',
    type: 'Client',
    favorite: true,
    audit: {
      access: { at: '2025-01-01T10:01:00.000Z' },
    },
  },
  {
    id: '2',
    name: 'Account 2',
    type: 'Client',
    favorite: false,
    audit: {
      access: { at: '2025-01-02T10:02:10.000Z' },
    },
  },
  {
    id: '3',
    name: 'Account 3',
    type: 'Client',
    favorite: false,
    audit: {
      access: { at: '2025-01-03T10:02:00.000Z' },
    },
  },
  {
    id: '4',
    name: 'Account 4',
    type: 'Vendor',
    favorite: true,
    audit: {
      access: { at: '2025-01-03T10:01:05.000Z' },
    },
  },
];

export const accountsNoFavouritesNoTimestamps: UserAccount[] = [
  {
    id: '1',
    name: 'Account 1',
    type: 'Client',
  },
  {
    id: '2',
    name: 'Account 2',
    type: 'Client',
  },
  {
    id: '3',
    name: 'Account 3',
    type: 'Client',
  },
];

export const accountsSomeMissingFields: UserAccount[] = [
  {
    id: '1',
    name: 'Account 1',
    type: 'Client',
    audit: {
      access: { at: '2025-01-01T10:01:00.000Z' },
    },
  },
  {
    id: '2',
    name: 'Account 2',
    type: 'Client',
    favorite: false,
  },
  {
    id: '3',
    name: 'Account 3',
    type: 'Client',
    favorite: false,
    audit: {
      access: { at: '2025-01-03T10:02:00.000Z' },
    },
  },
  {
    id: '4',
    name: 'Account 4',
    type: 'Vendor',
    favorite: true,
    audit: {
      access: { at: '2025-01-03T10:01:05.000Z' },
    },
  },
];

export const accountsSomeInvalidTimestamps: UserAccount[] = [
  {
    id: '1',
    name: 'Account 1',
    type: 'Client',
    audit: {
      access: { at: '2025-01-01' },
    },
  },
  {
    id: '2',
    name: 'Account 2',
    type: 'Client',
    favorite: false,
    audit: {
      access: { at: '' },
    },
  },
  {
    id: '3',
    name: 'Account 3',
    type: 'Client',
    favorite: false,
    audit: {
      access: { at: '2025-01-03T10:02:00.000Z' },
    },
  },
  {
    id: '4',
    name: 'Account 4',
    type: 'Vendor',
    favorite: true,
    audit: {
      access: { at: '2025-01-03T10:01:05.000Z' },
    },
  },
];

export const accountsAllFavouritesFalse = [
  {
    id: '1',
    name: 'Account 1',
    type: 'Client',
    favorite: false,
  },
  {
    id: '2',
    name: 'Account 2',
    type: 'Client',
    favorite: false,
  },
];
