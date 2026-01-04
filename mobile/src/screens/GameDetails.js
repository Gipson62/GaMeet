import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../config';
import { COLORS } from '../constants/theme';
import { api, buildPhotoUrl, fetchGame } from '../services/api';
import { TRANSLATIONS } from '../constants/translations';

const { width } = Dimensions.get('window');

export default function GameDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params;
  
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const language = useSelector(state => state.auth.language);
  const t = TRANSLATIONS[language || 'fr'];

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: COLORS.darkerBackground },
      headerTintColor: '#fff',
      headerTitle: '',
      headerShadowVisible: false,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchGameDetails();
    }, [gameId])
  );

  const fetchGameDetails = async () => {
    try {
      const response = await fetchGame(gameId);
      setGame(response);
    } catch (error) {
      console.error("Error loading game:", error);
      Alert.alert(t.error, t.unableToLoadGameDetails);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.button} />
      </View>
    );
  }

  if (!game) return null;

  const bannerUrl = buildPhotoUrl(game.banner_id);
  const logoUrl = buildPhotoUrl(game.logo_id);
  const gridUrl = buildPhotoUrl(game.grid_id);
  
  const releaseDate = game.release_date ? new Date(game.release_date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }) : 'Unknown';

  const platforms = game.platforms ? game.platforms.split(',').map(p => p.trim()) : [];
  const tags = game.game_tag || [];
  const relatedEvents = game.event_game || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Header with banner */}
        <View style={styles.headerContainer}>
          {bannerUrl ? (
            <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
          ) : (
            <View style={[styles.banner, styles.bannerPlaceholder]}>
              <MaterialIcons name="videogame-asset" size={60} color={COLORS.formLabel} />
            </View>
          )}
          <View style={styles.overlay}>
            {logoUrl && (
              <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
            )}
            <Text style={styles.gameTitle}>{game.name}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.studio}</Text>
            <Text style={styles.value}>{game.studio || t.unknown}</Text>

            <Text style={[styles.label, { marginTop: 16 }]}>{t.publisher}</Text>
            <Text style={styles.value}>{game.publisher || t.unknown}</Text>
            
            <Text style={[styles.label, { marginTop: 16 }]}>{t.releaseDate}</Text>
            <Text style={styles.value}>{releaseDate}</Text>
          </View>
          
          {gridUrl && (
            <Image source={{ uri: gridUrl }} style={styles.gridImage} resizeMode="cover" />
          )}
        </View>

        {/* Platforms */}
        {platforms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>{t.platforms.toUpperCase()}</Text>
            <View style={styles.tagsContainer}>
              {platforms.map((platform, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{platform}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>{t.tags.toUpperCase()}</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={[styles.tag, styles.tagAccent]}>
                  <Text style={styles.tagText}>{tag.tag?.name || tag.tag_name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {game.description && (
          <View style={styles.section}>
            <Text style={styles.label}>{t.description}</Text>
            <Text style={styles.description}>{game.description}</Text>
          </View>
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>{t.relatedEvents} ({relatedEvents.length})</Text>
            {relatedEvents.map((eg, index) => {
              const event = eg.event;
              const eventDate = new Date(event.scheduled_date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.eventCard}
                  onPress={() => navigation.navigate('EventDetails', { id: event.id })}
                >
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    <Text style={styles.eventDate}>{eventDate}</Text>
                    {event.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialIcons name="place" size={14} color={COLORS.formLabel} />
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </View>
                    )}
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={COLORS.formLabel} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  banner: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerPlaceholder: {
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9))',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gridImage: {
    width: 90,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginLeft: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.formLabel,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  description: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagAccent: {
    backgroundColor: COLORS.button,
    borderColor: COLORS.button,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: COLORS.formLabel,
  },
  eventLocation: {
    fontSize: 12,
    color: COLORS.formLabel,
    marginLeft: 4,
  },
});