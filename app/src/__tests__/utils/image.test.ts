import { HttpMethod } from '@/types/api';
import { getImageUrl, getImageHeaders } from '@/utils/image';

const baseUrlMock = 'https://example.com';
const httpUrlMock = 'http://example.com/images/photo.png';
const httpsUrlMock = 'https://example.com/images/photo.png';
const imagePathMock = '/path/to/image.png';
const accessTokenMock = 'abc123';

const imageHeadersMock = {
  Authorization: `Bearer ${accessTokenMock}`,
  Accept: 'image/*',
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
  it('should return the same URL if imagePath is already a full https URL', () => {
    const imageUrl = getImageUrl(baseUrlMock, httpsUrlMock);

    expect(imageUrl).toBe(httpsUrlMock);
  });

  it('should return the same URL if imagePath is already a full http URL', () => {
    const imageUrl = getImageUrl(baseUrlMock, httpUrlMock);

    expect(imageUrl).toBe(httpUrlMock);
  });
});

describe('getImageHeaders', () => {
  it('should return correct headers with valid token (GET)', () => {
    const imageHeaders = getImageHeaders(accessTokenMock, HttpMethod.GET);

    expect(imageHeaders).toEqual(imageHeadersMock);
  });

  it('should include Content-Type for POST requests', () => {
    const imageHeaders = getImageHeaders(accessTokenMock, HttpMethod.POST);

    expect(imageHeaders).toEqual({
      ...imageHeadersMock,
      'Content-Type': 'application/json',
    });
  });

  it('should include Content-Type for PUT requests', () => {
    const imageHeaders = getImageHeaders(accessTokenMock, HttpMethod.PUT);

    expect(imageHeaders).toEqual({
      ...imageHeadersMock,
      'Content-Type': 'application/json',
    });
  });

  it('should include Content-Type for PATCH requests', () => {
    const imageHeaders = getImageHeaders(accessTokenMock, HttpMethod.PATCH);

    expect(imageHeaders).toEqual({
      ...imageHeadersMock,
      'Content-Type': 'application/json',
    });
  });

  it('should return undefined if token is empty', () => {
    const imageHeaders = getImageHeaders('', HttpMethod.GET);

    expect(imageHeaders).toBeUndefined();
  });

  it('should return undefined if token is null', () => {
    const imageHeaders = getImageHeaders(null as unknown as string, HttpMethod.GET);

    expect(imageHeaders).toBeUndefined();
  });
});
