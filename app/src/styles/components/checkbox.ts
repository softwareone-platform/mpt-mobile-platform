import { BorderRadius, Color } from '../tokens';

export const checkboxStyle = {
  container: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.round,
    borderColor: Color.gray.gray3,
  },
  containerSelected: {
    backgroundColor: Color.brand.primary,
    borderColor: Color.brand.primary,
  },
  iconColor: Color.brand.white,
} as const;
