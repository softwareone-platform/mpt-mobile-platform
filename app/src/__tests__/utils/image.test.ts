import { getImageUrl, getImageHeaders } from '@/utils/image';

const baseUrlMock = 'https://example.com';
const imagePathMock = '/path/to/image.png';
const accessTokenMock = 'abc123';
const imageHeadersMock = {
  'Authorization': `Bearer ${accessTokenMock}`,
  'Content-Type': 'application/json',
  'Accept': 'image/*',
};

describe('getImageUrl', () => {
  it('should return full URL with proper slashes', () => {
    const imageUrl = getImageUrl(baseUrlMock, imagePathMock);
    const expectedImageUrl = 'https://example.com/path/to/image.png';

    expect(imageUrl).toBe(expectedImageUrl);
  });

  it('should return null if baseUrl is empty', () => {
    const imageUrl = getImageUrl('', imagePathMock);

    expect(imageUrl).toBeNull();
  });

  it('should return null if imagePath is empty', () => {
    const imageUrl = getImageUrl(baseUrlMock, '');

    expect(imageUrl).toBeNull();
  });

  it('should return null if both baseUrl and imagePath are empty', () => {
    const imageUrl = getImageUrl('', '');

    expect(imageUrl).toBeNull();
  });
});

describe('getImageHeaders', () => {
  it('should return correct headers with valid token', () => {
    const imageHeaders = getImageHeaders(accessTokenMock);

    expect(imageHeaders).toEqual(imageHeadersMock);
  });

  it('should return null if token is empty', () => {
    const imageHeaders = getImageHeaders('');
    
    expect(imageHeaders).toBeNull();
  });

  it('should return null if token is null', () => {
    const imageHeaders = getImageHeaders(null as unknown as string);

    expect(imageHeaders).toBeNull();
  });
});
