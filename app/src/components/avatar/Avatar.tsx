import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Jdenticon from '@/components/common/JdenticonIcon';
import { getImageUrl, getImageHeaders } from '@/utils/image';
import { HttpMethod } from '@/types/api';
import { configService } from '@/config/env.config';
import { getAccessTokenAsync } from '@/lib/tokenProvider';
import { Color, avatarStyle } from '@/styles';
import { DEFAULT_AVATAR_SIZE } from '@/constants';

interface AvatarProps {
  id: string;
  imagePath?: string;
  size?: number;
}

interface AuthenticatedImageSource {
  uri: string;
  headers?: { [key: string]: string };
}

const Avatar: React.FC<AvatarProps> = ({ id, imagePath, size = DEFAULT_AVATAR_SIZE }) => {
  const [imageSource, setImageSource] = useState<AuthenticatedImageSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const BASE_URL = configService.get('AUTH0_API_URL');

  useEffect(() => {
    setHasError(false);
  }, [imagePath]);

  useEffect(() => {
    const fetchImageSource = async () => {
      if (!imagePath) {
        setImageSource(null);
        return;
      }

      try {
        setIsLoading(true);

        const token = await getAccessTokenAsync();
        const uri = getImageUrl(BASE_URL, imagePath);
        const headers = token ? getImageHeaders(token, HttpMethod.GET) : undefined;

        if (!uri) {
          setImageSource(null);
          return;
        }

        setImageSource({ uri, headers });
      } catch (error) {
        console.warn('Failed to get authenticated image URL:', error);
        setImageSource(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageSource();
  }, [imagePath, BASE_URL]);

  const handleImageLoadError = () => {
    console.warn('Failed to load avatar image');

    setHasError(true);
    setIsLoading(false);
    setImageSource(null);
  }

  return (
    <View style={styles.container}>
      {imageSource && !hasError ? (
        <View style={[styles.iconContainer, styles.commonIconContainer]}>
          <Image
            source={{ uri: imageSource.uri, headers: imageSource.headers }}
            style={styles.imageStyle}
            contentFit="contain"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={handleImageLoadError}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={Color.brand.primary} />
            </View>
          )}
        </View>
      ) : (
        <Jdenticon value={id} size={size} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: avatarStyle.container,
  commonIconContainer: avatarStyle.commonIconContainer,
  iconContainer: avatarStyle.iconContainer,
  loadingOverlay: avatarStyle.loadingOverlay,
  imageStyle: avatarStyle.imageStyle,
});

export default Avatar;
