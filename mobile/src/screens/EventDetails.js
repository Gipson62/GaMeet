import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, Alert, Dimensions, Modal, TextInput
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import {API_URL, BASE_URL} from '../config';
import { TRANSLATIONS } from '../constants/translations';
import { COLORS } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

export default function EventDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  
  // Récupération du token et user depuis Redux
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const language = useSelector(state => state.auth.language);
  const t = TRANSLATIONS[language || 'fr'];

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [coords, setCoords] = useState(null);

  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isOrganizer = user && event && user.id === event.User?.id;
  const isEventPassed = event && new Date(event.scheduled_date) < new Date();

  // Configuration du header pour qu'il se fonde dans le design sombre
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#0b1622' },
      headerTintColor: '#fff',
      headerTitle: '',
      headerShadowVisible: false,
      headerRight: () => isOrganizer ? (
        <TouchableOpacity onPress={() => navigation.navigate('AddEvent', { eventToEdit: event })} style={{ marginRight: 10 }}>
            <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
      ) : null,
    });
  }, [navigation, isOrganizer, event]);

  useFocusEffect(
    useCallback(() => {
      fetchEventDetails();
    }, [id])
  );

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
        Alert.alert(t.error, t.unableToLoadEvent);
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t.error, t.networkError);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
        Alert.alert(t.error, t.mustBeLoggedIn);
        return;
    }

    const isParticipant = event.participant.some(p => p.User.id === user.id);

    if (isEventPassed && !isParticipant) {
        Alert.alert(t.impossible, t.cannotJoinPastEvent);
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
            Alert.alert(t.success, isParticipant ? t.unsubscribeSuccess : t.subscribeSuccess);
            fetchEventDetails(); // Rafraîchir les données
        } else {
            const errData = await response.json();
            Alert.alert(t.error, errData.message || t.errorOccurred);
        }
    } catch (error) {
        Alert.alert(t.error, t.networkError);
    } finally {
        setJoining(false);
    }
  };

  const handleOpenReview = () => {
    if (!user) return Alert.alert(t.error, t.mustBeLoggedIn);
    
    if (isOrganizer) {
        return Alert.alert(t.actionImpossible, t.cannotReviewOwnEvent);
    }

    const hasReviewed = event.review?.some(r => r.User?.id === user.id);
    if (hasReviewed) {
        return Alert.alert(t.alreadyReviewed, t.alreadyReviewedBody);
    }

    const isPart = event.participant?.some(p => p.User.id === user.id);
    if (!isPart) {
        return Alert.alert(t.accessDenied, t.mustParticipateToReview);
    }

    const eventDate = new Date(event.scheduled_date);
    if (new Date() < eventDate) {
        return Alert.alert(t.tooEarly, t.eventNotPassed);
    }

    setReviewModalVisible(true);
  };

  const submitReview = async () => {
    if (rating === 0) return Alert.alert(t.missingRating, t.selectRating);
    
    setSubmittingReview(true);
    try {
        const response = await fetch(`${API_URL}/event/${id}/review`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ note: rating, description: reviewComment })
        });

        if (response.ok) {
            Alert.alert(t.success, t.reviewPublished);
            setReviewModalVisible(false);
            setRating(0);
            setReviewComment("");
            fetchEventDetails();
        } else {
            const data = await response.json();
            Alert.alert(t.error, data.message || t.unableToPublishReview);
        }
    } catch (error) {
        Alert.alert(t.error, t.networkError);
    } finally {
        setSubmittingReview(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert(
      t.deleteReview,
      t.deleteReviewConfirm,
      [
        { text: t.cancel, style: "cancel" },
        { 
          text: t.delete, 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/review/${reviewId}`, {
                method: 'DELETE',
                headers: { 
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok || response.status === 204) {
                Alert.alert(t.success, t.reviewDeleted);
                fetchEventDetails();
              } else {
                Alert.alert(t.error, t.unableToDeleteReview);
              }
            } catch (error) {
              Alert.alert(t.error, t.networkError);
            }
          }
        }
      ]
    );
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
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Construction de l'URL de l'image
  const mainGame = event.event_game?.[0]?.game;
  const bannerUrl = mainGame?.banner?.url 
    ? `${BASE_URL}/uploads/${mainGame.banner.url}`
    : (event.event_photo?.[0]?.photo?.url ? `${API_URL.replace('/v1', '')}/uploads/${event.event_photo[0].photo.url}` : null);

  const date = new Date(event.scheduled_date);
  const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // Avatar de l'organisateur
  const organizerAvatarUrl = event.User?.photo?.url 
    ? `${API_URL.replace('/v1', '')}/uploads/${event.User.photo.url}` 
    : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        
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
                                    <Text style={styles.gameTitle}>{g?.name || t.unknownGame}</Text>
                                </View>
                            );
                        })
                    ) : (
                        <Text style={[styles.gameTitle, { marginTop: 4 }]}>{t.unspecifiedGame}</Text>
                    )}
                </View>
            </View>
        </View>

        {/* 2. Infos Section */}
        <View style={styles.infoSection}>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>{t.eventDate ? t.eventDate.toUpperCase() : "DATE DE L'ÉVÈNEMENT"}</Text>
                <Text style={styles.value}>{formattedDate}</Text>

                <Text style={[styles.infoLabel, { marginTop: 16 }]}>{t.organizer ? t.organizer.toUpperCase() : "ORGANISATEUR"}</Text>
                <View style={styles.organizerRow}>
                    {organizerAvatarUrl ? (
                        <Image source={{ uri: organizerAvatarUrl }} style={styles.organizerAvatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={{ fontSize: 18 }}>👤</Text>
                        </View>
                    )}
                    <Text style={styles.organizerName}>{event.User?.pseudo || t.unknown}</Text>
                </View>
            </View>
            
            <View style={styles.countBox}>
                <Text style={styles.countText}>{event._count?.participant || 0}</Text>
                {event.max_capacity && <Text style={styles.capacityText}>/ {event.max_capacity}</Text>}
            </View>
        </View>

        {/* 3. Description */}
        <View style={styles.section}>
            <Text style={styles.infoLabel}>{t.description ? t.description.toUpperCase() : "DESCRIPTION"}</Text>
            <Text style={styles.description}>
                {event.description || t.noDescription}
            </Text>
        </View>

        {/* Photos de l'événement */}
        {event.event_photo && event.event_photo.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.infoLabel}>{t.photos ? t.photos.toUpperCase() : "PHOTOS"}</Text>
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
                <Text style={styles.infoLabel}>{t.reviews ? t.reviews.toUpperCase() : "AVIS"} ({reviews.length})</Text>
                {!isOrganizer && (
                    <TouchableOpacity onPress={handleOpenReview}>
                        <Text style={{color: '#3b82f6', fontSize: 12, fontWeight: 'bold'}}>{t.writeReview ? t.writeReview.toUpperCase() : "ÉCRIRE UN AVIS"}</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {reviews.length === 0 ? (
                <Text style={{ color: '#9ca3af', fontStyle: 'italic' }}>{t.noReviews}</Text>
            ) : (
                reviews.map((review, index) => (
                    <View key={review.id || index} style={[styles.reviewCard, index > 0 && { marginTop: 10 }]}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.reviewAvatar}>
                                <Text>👤</Text>
                            </View>
                            <View style={{marginLeft: 10, flex: 1}}>
                                <Text style={styles.reviewUser}>{review.User?.pseudo || t.user}</Text>
                                <View style={{flexDirection: 'row'}}>
                                    {[1,2,3,4,5].map(i => (
                                        <MaterialIcons key={i} name="star" size={14} color={i <= (review.rating || 0) ? "#fbbf24" : "#4b5563"} />
                                    ))}
                                </View>
                            </View>
                            {user && review.User?.id === user.id && (
                                <TouchableOpacity onPress={() => handleDeleteReview(review.id)} style={{ marginRight: 10 }}>
                                    <MaterialIcons name="delete" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            )}
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
                        <Text style={{ color: 'gray', marginTop: 10 }}>{t.mapUnavailable}</Text>
                        <Text style={{ color: 'gray', fontSize: 12 }}>{event.location}</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.buttonContainer}>
                {!isOrganizer && (
                    <TouchableOpacity 
                        style={[
                            styles.joinButton, 
                            isParticipant && styles.leaveButton,
                            (isEventPassed && !isParticipant) && { backgroundColor: '#4b5563' }
                        ]} 
                        onPress={handleJoin}
                        disabled={joining || (isEventPassed && !isParticipant)}
                    >
                        {joining ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.joinButtonText}>
                                {isParticipant ? t.unsubscribe : (isEventPassed ? t.eventPassed : t.subscribe)}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>

      </ScrollView>

      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t.rateEvent}</Text>
                
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <MaterialIcons 
                                name="star" 
                                size={32} 
                                color={star <= rating ? "#fbbf24" : "#4b5563"} 
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.inputReview}
                    placeholder={t.yourComment}
                    placeholderTextColor="#9ca3af"
                    multiline
                    value={reviewComment}
                    onChangeText={setReviewComment}
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setReviewModalVisible(false)}>
                        <Text style={styles.btnText}>{t.cancel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={submitReview} disabled={submittingReview}>
                        {submittingReview ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.btnText}>{t.send}</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  ...globalStyles,
  headerContainer: {
    padding: 16,
  },
  imageContainer: {
    height: 250,
    borderRadius: 24,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  eventTitle: {
    color: 'white',
    fontSize: 28,
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
    color: '#d1d5db',
    fontSize: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    color: 'white',
    fontSize: 18,
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
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  countBox: {
    backgroundColor: '#1a2c3d',
    padding: 16,
    borderRadius: 12,
    minWidth: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 24,
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
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 24,
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
    height: 300,
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  inputReview: {
    backgroundColor: '#0b1622',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#374151',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
};