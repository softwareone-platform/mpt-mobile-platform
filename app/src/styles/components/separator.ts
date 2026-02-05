import { Color } from '../tokens';

export const separatorStyle = {
  nonOpaque: {
    borderColor: Color.separators.nonOpaque,
    borderWidth: 1,
  },
  bottomBorder1: {
    borderBottomColor: Color.gray.gray2,
    borderBottomWidth: 1,
  },
} as const;
