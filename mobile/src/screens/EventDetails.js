import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import {API_URL, BASE_URL} from '../config';

const { width } = Dimensions.get('window');

export default function EventDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  
  // Récupération du token et user depuis Redux
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [coords, setCoords] = useState(null);

  // Configuration du header pour qu'il se fonde dans le design sombre
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#0b1622' },
      headerTintColor: '#fff',
      headerTitle: '',
      headerShadowVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/event/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        
        // Géocodage de l'adresse pour la carte
        if (data.location) {
          const parts = data.location.split(',');
          if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
             setCoords({ latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) });
          } else {
             try {
               const geocoded = await Location.geocodeAsync(data.location);
               if (geocoded.length > 0) {
                 setCoords({ latitude: geocoded[0].latitude, longitude: geocoded[0].longitude });
               }
             } catch (err) {
               console.log("Géocodage impossible", err);
             }
          }
        }
      } else {
        Alert.alert("Erreur", "Impossible de charger l'événement");
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Erreur réseau");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
    }
    setJoining(true);
    try {
        // Vérifier si déjà inscrit
        const isParticipant = event.participant.some(p => p.User.id === user.id);
        
        // Détermine la méthode et l'endpoint (POST pour rejoindre, DELETE pour quitter)
        const method = isParticipant ? 'DELETE' : 'POST';
        const endpoint = isParticipant ? 'leave' : 'join';
        
        const response = await fetch(`${API_URL}/event/${id}/${endpoint}`, {
            method: method, 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok || response.status === 201 || response.status === 204) {
            Alert.alert("Succès", isParticipant ? "Désinscription réussie" : "Inscription réussie");
            fetchEventDetails(); // Rafraîchir les données
        } else {
            const errData = await response.json();
            Alert.alert("Erreur", errData.message || "Une erreur est survenue");
        }
    } catch (error) {
        Alert.alert("Erreur", "Erreur réseau");
    } finally {
        setJoining(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!event) return null;

  const isParticipant = event.participant?.some(p => p.User.id === user?.id);
  const reviews = (event.review || event.reviews || []).map(r => ({
    ...r,
    rating: r.note ?? r.rating ?? 0,
    comment: r.description ?? r.comment ?? r.content ?? "",
    createdAt: r.created_at ?? r.createdAt ?? Date.now(),
  }));
  
  // Construction de l'URL de l'image
  const mainGame = event.event_game?.[0]?.game;
  const bannerUrl = mainGame?.banner?.url 
    ? `${BASE_URL}/uploads/${mainGame.banner.url}`
    : (event.event_photo?.[0]?.photo?.url ? `${API_URL.replace('/v1', '')}/uploads/${event.event_photo[0].photo.url}` : null);

  const date = new Date(event.scheduled_date);
  const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 1. Header Card */}
        <View style={styles.headerContainer}>
            <View style={styles.imageContainer}>
                {bannerUrl ? (
                    <Image source={{ uri: bannerUrl }} style={styles.banner} resizeMode="cover" />
                ) : (
                    <View style={[styles.banner, { backgroundColor: '#1a2c3d', justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialIcons name="image-not-supported" size={50} color="#374151" />
                    </View>
                )}
                <View style={styles.overlay}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    {event.event_game && event.event_game.length > 0 ? (
                        event.event_game.map((eg, index) => {
                            const g = eg.game;
                            const logoUrl = g?.logo?.url ? `${API_URL.replace('/v1', '')}/uploads/${g.logo.url}` : null;
                            return (
                                <View key={index} style={styles.gameContainer}>
                                    {logoUrl ? (
                                        <Image source={{ uri: logoUrl }} style={styles.gameLogo} />
                                    ) : (
                                        <View style={[styles.gameLogo, { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                                            <MaterialIcons name="sports-esports" size={16} color="#d1d5db" />
                                        </View>
                                    )}
                                    <Text style={styles.gameTitle}>{g?.name || "Jeu inconnu"}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={[styles.gameTitle, { marginTop: 4 }]}>Jeu non spécifié</Text>
                    )}
                </View>
            </View>
        </View>

        {/* 2. Infos Section */}
        <View style={styles.infoSection}>
            <View style={{ flex: 1 }}>
                <Text style={styles.label}>DATE DE L'ÉVÈNEMENT</Text>
                <Text style={styles.value}>{formattedDate}</Text>

                <Text style={[styles.label, { marginTop: 16 }]}>ORGANISATEUR</Text>
                <View style={styles.organizerRow}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={{ fontSize: 18 }}>👤</Text>
                    </View>
                    <Text style={styles.organizerName}>{event.User?.pseudo || "Inconnu"}</Text>
                </View>
            </View>
            
            <View style={styles.countBox}>
                <Text style={styles.countText}>{event._count?.participant || 0}</Text>
                {event.max_capacity && <Text style={styles.capacityText}>/ {event.max_capacity}</Text>}
            </View>
        </View>

        {/* 3. Description */}
        <View style={styles.section}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <Text style={styles.description}>
                {event.description || "Aucune description fournie."}
            </Text>
        </View>

        {/* Photos de l'événement */}
        {event.event_photo && event.event_photo.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.label}>PHOTOS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    {event.event_photo.map((ep, index) => (
                        <Image 
                            key={index}
                            source={{ uri: `${API_URL.replace('/v1', '')}/uploads/${ep.photo.url}` }}
                            style={styles.eventPhoto}
                        />
                    ))}
                </ScrollView>
            </View>
        )}

        {/* 3.5 Reviews Section */}
        <View style={styles.section}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <Text style={styles.label}>AVIS ({reviews.length})</Text>
                <TouchableOpacity onPress={() => Alert.alert("Avis", "Fonctionnalité à venir")}>
                    <Text style={{color: '#3b82f6', fontSize: 12, fontWeight: 'bold'}}>ÉCRIRE UN AVIS</Text>
                </TouchableOpacity>
            </View>
            
            {reviews.length === 0 ? (
                <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>Aucun avis pour le moment.</Text>
            ) : (
                reviews.map((review, index) => (
                    <View key={review.id || index} style={[styles.reviewCard, index > 0 && { marginTop: 10 }]}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewAvatar}>
                                <Text>👤</Text>
                            </View>
                            <View style={{marginLeft: 10, flex: 1}}>
                                <Text style={styles.reviewUser}>{review.User?.pseudo || "Utilisateur"}</Text>
                                <View style={{flexDirection: 'row'}}>
                                    {[1,2,3,4,5].map(i => (
                                        <MaterialIcons key={i} name="star" size={14} color={i <= (review.rating || 0) ? "#fbbf24" : "#4b5563"} />
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.reviewTime}>{new Date(review.createdAt || Date.now()).toLocaleDateString('fr-FR')}</Text>
                        </View>
                        <Text style={styles.reviewContent}>{review.comment}</Text>
                    </View>
                ))
            )}
        </View>

        {/* 4. Map & Button */}
        <View style={styles.mapSection}>
            <View style={styles.mapContainer}>
                {coords ? (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        liteMode={true}
                    >
                        <Marker coordinate={coords} />
                    </MapView>
                ) : (
                    <View style={styles.mapPlaceholder}>
                        <MaterialIcons name="map" size={40} color="gray" />
                        <Text style={{ color: 'gray', marginTop: 10 }}>Carte non disponible</Text>
                        <Text style={{ color: 'gray', fontSize: 12 }}>{event.location}</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.joinButton, isParticipant && styles.leaveButton]} 
                    onPress={handleJoin}
                    disabled={joining}
                >
                    {joining ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.joinButtonText}>
                            {isParticipant ? "Se désinscrire" : "S'inscrire à l'évènement"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1622', // bg-[#0b1622]
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 16,
  },
  imageContainer: {
    height: 250,
    borderRadius: 24, // rounded-3xl
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1a2c3d',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)', // Gradient simulation
    justifyContent: 'flex-end',
  },
  eventTitle: {
    color: 'white',
    fontSize: 28, // text-3xl
    fontWeight: 'bold',
  },
  gameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gameLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  gameTitle: {
    color: '#d1d5db', // text-gray-300
    fontSize: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  label: {
    color: '#9ca3af', // text-gray-400
    fontSize: 12, // text-sm
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    color: 'white',
    fontSize: 18, // text-lg
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  organizerName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  countBox: {
    backgroundColor: '#1a2c3d', // bg-[#1a2c3d]
    padding: 16,
    borderRadius: 12, // rounded-xl
    minWidth: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 24, // text-2xl
    fontWeight: 'bold',
  },
  capacityText: {
    color: '#9ca3af',
    fontSize: 10,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  description: {
    color: '#d1d5db', // text-gray-300
    fontSize: 14, // text-sm
    lineHeight: 24, // leading-relaxed
    marginTop: 8,
  },
  eventPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  mapSection: {
    marginTop: 16,
    position: 'relative',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#1e293b', // bg-slate-800
    borderTopLeftRadius: 24, // rounded-t-3xl
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    opacity: 0.7, // opacity-50 in design, adjusted for visibility
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20, // bottom-4
    left: 24, // px-6
    right: 24,
  },
  joinButton: {
    backgroundColor: '#3b82f6', // bg-[#3b82f6]
    paddingVertical: 16,
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  leaveButton: {
    backgroundColor: '#ef4444', // Rouge pour quitter
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold', // font-semibold
  },
  reviewCard: {
    backgroundColor: '#1a2c3d',
    padding: 16,
    borderRadius: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewUser: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewTime: {
    color: '#9ca3af',
    fontSize: 12,
  },
  reviewContent: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
});
