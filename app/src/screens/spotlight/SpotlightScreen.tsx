import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useAccount } from '@/context/AccountContext';
import { Color } from '@/styles/tokens';
import { screenStyle, cardStyle, Spacing } from '@/styles';
import NavigationItemWithImage from '@/components/navigation-item/NavigationItemWithImage';
import type { SpotlightItem } from '@/types/api';
import useSafeBottomPadding from '@/hooks/ui/useSafeBottomPadding';

const SpotlightScreen = () => {
  const { logout } = useAuth();
  const { spotlightData } = useAccount();

  const bottomPadding = useSafeBottomPadding();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout - dev purpose only</Text>
      </TouchableOpacity>

      <ScrollView style={styles.containerMain} contentContainerStyle={{ paddingBottom: bottomPadding }}>
        {Object.entries(spotlightData).map(([categoryName, sections]) => (
          <View key={categoryName}>
            {(sections as SpotlightItem[]).map((section) => (
              <View key={section.id} style={styles.containerCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardHeaderText}>
                    {/* TODO: remove the below line and add text from i18n file, no support for plural for now */}
                    {section.total} {section.total > 1 ? section.query?.name.toLowerCase() : section.query?.name?.slice(0, -1).toLowerCase()}
                  </Text>
                </View>

                {section.top.map((item, itemIndex) => {
                  const nestedItem = item?.product || item?.program || item?.user || item?.buyer;
                  const itemImagePath = item?.icon || nestedItem?.icon || '';
                  const itemId = item?.id || `${section.id}-${itemIndex}`;
                  const itemName = item?.name || nestedItem?.name || '';

                  return (
                    <NavigationItemWithImage
                      key={itemId}
                      id={itemId}
                      imagePath={itemImagePath}
                      title={itemName}
                      subtitle={itemId}
                      isLast={itemIndex === section.top.length - 1}
                      // TODO: Implement navigation on press of each spotlight item
                      onPress={() => {}}
                    />
                  );
                })}

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>
                    Showing {section.top.length} of {section.total} (view all)
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Color.brand.danger,
    padding: 12,
    margin: 16,
  },
  buttonText: {
    color: Color.brand.white,
    textAlign: 'center',
  },
  containerMain: screenStyle.containerMain,
  containerCard: {
    ...cardStyle.containerRounded,
    marginBottom: Spacing.spacing2,
  },
  cardHeader: cardStyle.header,
  cardHeaderText: cardStyle.headerText,
  cardFooter: cardStyle.footer,
  cardFooterText: cardStyle.footerText,
});

export default SpotlightScreen;
