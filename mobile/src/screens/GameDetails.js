import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../config';
import { COLORS } from '../constants/theme';
import { api, buildPhotoUrl, fetchGame } from '../services/api';
import { TRANSLATIONS } from '../constants/translations';
import { globalStyles } from '../styles/globalStyles';

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
            <Text style={gameTitle}>{game.name}</Text>
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
                  <View style={eventInfo}>
                    <Text style={eventName}>{event.name}</Text>
                    <Text style={eventDate}>{eventDate}</Text>
                    {event.location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialIcons name="location-on" size={14} color={COLORS.formLabel} />
                        <Text style={eventLocation}>{event.location}</Text>
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

const styles = globalStyles;

// Game-specific styles for title with shadow
const gameTitle = {
  fontSize: 28,
  fontWeight: 'bold',
  color: COLORS.text,
  textShadowColor: 'rgba(0, 0, 0, 0.8)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
};

const eventInfo = { flex: 1 };
const eventName = {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text,
  marginBottom: 4,
};
const eventDate = {
  fontSize: 13,
  color: COLORS.formLabel,
};
const eventLocation = {
  fontSize: 12,
  color: COLORS.formLabel,
  marginLeft: 4,
};