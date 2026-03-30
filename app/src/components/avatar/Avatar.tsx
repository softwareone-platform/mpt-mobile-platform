import { Image } from 'expo-image';
import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import Jdenticon from '@/components/common/JdenticonIcon';
import { configService } from '@/config/env.config';
import { DEFAULT_AVATAR_SIZE, DEFAULT_AVATAR_VARIANT } from '@/constants';
import { getAccessTokenAsync } from '@/lib/tokenProvider';
import { logger } from '@/services/loggerService';
import { avatarStyle } from '@/styles';
import { HttpMethod } from '@/types/api';
import type { AvatarProps } from '@/types/icons';
import { getImageUrl, getImageHeaders } from '@/utils/image';

interface AuthenticatedImageSource {
  uri: string;
  headers?: { [key: string]: string };
}

const imageSourceCache = new Map<string, AuthenticatedImageSource>();

export const clearAvatarCache = () => {
  imageSourceCache.clear();
};

const Avatar: React.FC<AvatarProps> = ({
  id,
  imagePath,
  size = DEFAULT_AVATAR_SIZE,
  variant = DEFAULT_AVATAR_VARIANT,
}) => {
  const [imageSource, setImageSource] = useState<AuthenticatedImageSource | null>(
    imagePath ? (imageSourceCache.get(imagePath) ?? null) : null,
  );
  const [hasError, setHasError] = useState(false);

  const BASE_URL = configService.get('AUTH0_API_URL');

  const containerVariantStyle = {
    default: styles.default,
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
    badgeSmall: styles.badgeSmall,
    badgeMedium: styles.badgeMedium,
  };

  useEffect(() => {
    setHasError(false);
  }, [imagePath]);

  useEffect(() => {
    const fetchImageSource = async () => {
      if (!imagePath) {
        setImageSource(null);
        return;
      }

      const cached = imageSourceCache.get(imagePath);
      if (cached) {
        setImageSource(cached);
        return;
      }

      try {
        const token = await getAccessTokenAsync();
        const uri = getImageUrl(BASE_URL, imagePath);
        const headers = token ? getImageHeaders(token, HttpMethod.GET) : undefined;

        if (!uri) {
          setImageSource(null);
          return;
        }

        const source = { uri, headers };
        imageSourceCache.set(imagePath, source);
        setImageSource(source);
      } catch (error) {
        logger.warn('Failed to get authenticated image URL', {
          operation: 'fetchImageSource',
        });
        setImageSource(null);
      }
    };

    void fetchImageSource();
  }, [imagePath, BASE_URL]);

  const handleImageLoadError = () => {
    setHasError(true);
    setImageSource(null);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.commonIconContainer, containerVariantStyle[variant]]}>
        {imageSource && !hasError ? (
          <Image
            source={{ uri: imageSource.uri, headers: imageSource.headers }}
            style={styles.imageStyle}
            contentFit="cover"
            onError={handleImageLoadError}
            cachePolicy="memory-disk"
          />
        ) : (
          <Jdenticon value={id} size={size} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
  commonIconContainer: avatarStyle.commonIconContainer,
  imageStyle: avatarStyle.imageStyle,
  default: avatarStyle.iconContainer,
  small: avatarStyle.smallIconContainer,
  medium: avatarStyle.mediumIconContainer,
  large: avatarStyle.largeIconContainer,
  badgeSmall: avatarStyle.smallBadgeContainer,
  badgeMedium: avatarStyle.mediumBadgeContainer,
});

export default Avatar;
