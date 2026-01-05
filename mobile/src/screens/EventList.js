import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, Button, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { globalStyles } from '../styles/globalStyles';
import { fetchEvents, buildPhotoUrl } from '../services/api';

export default function EventList() {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const language = useSelector(state => state.auth.language);
  const t = TRANSLATIONS[language || 'fr'];
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [searchText, setSearchText] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [maxDistance, setMaxDistance] = useState(50); // km par défaut
  const [userLocation, setUserLocation] = useState(null);
  const [myEventsFilter, setMyEventsFilter] = useState(null); // 'created', 'history', null
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [showMyEventsModal, setShowMyEventsModal] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    getUserLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedGame, maxDistance, events, userLocation, myEventsFilter]);

  const loadEvents = async () => {
    try {
      const rawData = await fetchEvents();
      
      // Garder uniquement les événements futurs
      // const futureEvents = data.filter(event => new Date(event.scheduled_date) > new Date());
      // Conversion des adresses en coordonnées (Géocodage)
      const data = await Promise.all(rawData.map(async (event) => {
        let coords = null;
        if (event.location) {
          const parts = event.location.split(',');
          // 1. Si c'est déjà des coordonnées "lat,long"
          if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
             coords = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
          } 
          // 2. Sinon, on essaie de convertir l'adresse en GPS
          else {
             try {
               // On vérifie qu'on a la permission (nécessaire pour geocodeAsync)
               const { status } = await Location.getForegroundPermissionsAsync();
               if (status === 'granted') {
                 const geocoded = await Location.geocodeAsync(event.location);
                 if (geocoded.length > 0) {
                   coords = { lat: geocoded[0].latitude, lng: geocoded[0].longitude };
                 }
               }
             } catch (err) {
               console.log("Géocodage impossible pour:", event.location);
             }
          }
        }
        return { ...event, _coords: coords };
      }));
      
      // Tri du plus récent au plus ancien (Décroissant)
      data.sort((a, b) => new Date(b.scheduled_date) - new Date(a.scheduled_date));
      setEvents(data);
      
      // Extraire les jeux pour le filtre
      const games = new Set();
      data.forEach(event => {
        if (event.event_game) {
          event.event_game.forEach(eg => {
            if (eg.game) games.add(eg.game.name);
          });
        }
      });
      setAvailableGames(Array.from(games));
      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement events:", error);
      Alert.alert(t.error, t.serverError || "Impossible de contacter le serveur");
      Alert.alert(t.error, error.message);
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission localisation refusée');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    console.log('Position utilisateur trouvée:', location.coords.latitude, location.coords.longitude);
    setUserLocation(location.coords);
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; 
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const applyFilters = () => {
    let result = events;

    // Recherche textuelle
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(lower) || (e.description && e.description.toLowerCase().includes(lower)));
    }

    // Filtre Jeu
    if (selectedGame) {
      result = result.filter(e => e.event_game && e.event_game.some(eg => eg.game.name === selectedGame));
    }

    // Filtre Distance (si location est "lat,long")
    if (userLocation && maxDistance < 1000) {
      result = result.filter(e => {
        // Si on a réussi à obtenir des coordonnées (via DB ou géocodage)
        if (e._coords && e._coords.lat !== null) {
            const dist = getDistanceFromLatLonInKm(userLocation.latitude, userLocation.longitude, e._coords.lat, e._coords.lng);
            console.log(`[Distance] ${e.name}: ${dist.toFixed(1)} km (Max: ${maxDistance})`);
            return dist <= maxDistance;
        }
        return true; // On garde l'événement si on n'a pas pu le localiser
      });
    }

    // Filtre Mes événements / Historique
    if (user && myEventsFilter) {
      if (myEventsFilter === 'created') {
        // Mes événements (Créés)
        result = result.filter(e => e.author === user.id);
      } else if (myEventsFilter === 'history') {
        // Mon historique (Participations passées)
        const now = new Date();
        result = result.filter(e => {
          const isPast = new Date(e.scheduled_date) < now;
          const isParticipant = e.participant && e.participant.some(p => p.User && p.User.id === user.id);
          const isAuthor = e.author === user.id;
          return isPast && (isParticipant || isAuthor);
        });
      }
    }

    setFilteredEvents(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={COLORS.formLabel} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder || "Rechercher..."}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={COLORS.formLabel}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color={COLORS.formLabel} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>{t.sortBy || "Filtres"}</Text>
        
        <TouchableOpacity style={globalStyles.filterBtn} onPress={() => setModalVisible(true)}>
          <Text style={globalStyles.filterBtnText}>{(t.game || "Jeu")}</Text>
          {selectedGame && (
            <View style={globalStyles.badge}>
              <Text style={globalStyles.badgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={globalStyles.filterBtn} onPress={() => setMaxDistance(prev => prev === 50 ? 5000 : 50)}>
          <Text style={globalStyles.filterBtnText}>{maxDistance < 1000 ? `< ${maxDistance} km` : (t.distanceAll || "Tout")}</Text>
        </TouchableOpacity>
        
        {user && (
          <TouchableOpacity 
            style={globalStyles.filterBtn}
            onPress={() => setShowMyEventsModal(true)}
          >
            <Text style={[globalStyles.filterBtnText, myEventsFilter && { color: COLORS.text }]}>{myEventsFilter === 'history' ? (t.history || "Historique") : (t.myEvents || "Mes events")}</Text>
            {myEventsFilter && (
              <View style={globalStyles.badge}>
                <Text style={globalStyles.badgeText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.button} /> : (
        filteredEvents.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>{t.noEventsFound || "Aucun événement trouvé."}</Text>
        ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const mainGame = item.event_game?.[0]?.game;
            const bannerUrl = mainGame?.banner?.id 
              ? buildPhotoUrl(mainGame.banner.id)
              : (item.event_photo?.[0]?.photo?.id ? buildPhotoUrl(item.event_photo[0].photo.id) : null);

            return (
            <TouchableOpacity style={styles.eventCard} onPress={() => navigation.navigate('EventDetails', { id: item.id })}>
              {bannerUrl ? (
                <Image source={{ uri: bannerUrl }} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }]}>
                  <MaterialIcons name="image" size={40} color={COLORS.formLabel} />
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.eventTitle}>{item.name}</Text>
                <Text style={{color: COLORS.formLabel}}>{new Date(item.scheduled_date).toLocaleDateString()}</Text>
                <Text style={styles.games}>{item.event_game?.map(g => g.game.name).join(', ')}</Text>
                <Text style={styles.loc}>{item.location}</Text>
              </View>
            </TouchableOpacity>
          )}}
        />
        )
      )}

      {/* Game Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={globalStyles.modalOverlayBottom}>
          <View style={globalStyles.modal}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>{t.game || "Jeu"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: '60%' }}>
              <TouchableOpacity
                style={[globalStyles.option, !selectedGame && globalStyles.optionActive, { paddingHorizontal: 20 }]}
                onPress={() => { setSelectedGame(null); setModalVisible(false); }}
              >
                <Text style={globalStyles.optionText}>{t.showAll || "Tout afficher"}</Text>
                {!selectedGame && (
                  <MaterialIcons name="check" size={20} color={COLORS.button} />
                )}
              </TouchableOpacity>
              {availableGames.map(game => (
                <TouchableOpacity
                  key={game}
                  style={[globalStyles.option, selectedGame === game && globalStyles.optionActive, { paddingHorizontal: 20 }]}
                  onPress={() => { setSelectedGame(game); setModalVisible(false); }}
                >
                  <Text style={globalStyles.optionText}>{game}</Text>
                  {selectedGame === game && (
                    <MaterialIcons name="check" size={20} color={COLORS.button} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={globalStyles.doneBtn} onPress={() => setModalVisible(false)}>
              <Text style={globalStyles.doneBtnText}>{t.done || "Terminé"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* My Events Filter Modal */}
      <Modal
        visible={showMyEventsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMyEventsModal(false)}
      >
        <View style={globalStyles.modalOverlayBottom}>
          <View style={globalStyles.modal}>
            <View style={globalStyles.modalHeader}>
              <Text style={globalStyles.modalTitle}>{t.myEvents || "Mes events"}</Text>
              <TouchableOpacity onPress={() => setShowMyEventsModal(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={{ paddingBottom: 20 }}>
              <TouchableOpacity style={[globalStyles.option, !myEventsFilter && globalStyles.optionActive, { paddingHorizontal: 20 }]} onPress={() => { setMyEventsFilter(null); setShowMyEventsModal(false); }}>
                <Text style={globalStyles.optionText}>{t.showAll || "Tout afficher"}</Text>
                {!myEventsFilter && <MaterialIcons name="check" size={20} color={COLORS.button} />}
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.option, myEventsFilter === 'created' && globalStyles.optionActive, { paddingHorizontal: 20 }]} onPress={() => { setMyEventsFilter('created'); setShowMyEventsModal(false); }}>
                <Text style={globalStyles.optionText}>{t.myEvents || "Mes événements"}</Text>
                {myEventsFilter === 'created' && <MaterialIcons name="check" size={20} color={COLORS.button} />}
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.option, myEventsFilter === 'history' && globalStyles.optionActive, { paddingHorizontal: 20 }]} onPress={() => { setMyEventsFilter('history'); setShowMyEventsModal(false); }}>
                <Text style={globalStyles.optionText}>{t.history || "Mon historique"}</Text>
                {myEventsFilter === 'history' && <MaterialIcons name="check" size={20} color={COLORS.button} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {user && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEvent')}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = {
  ...globalStyles,
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.darkerBackground,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.formLabel,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.darkerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  listContent: {
    padding: 20,
  },
  eventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: 150
  },
  cardContent: {
    padding: 15
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text
  },
  games: {
    color: COLORS.button,
    marginTop: 5,
    fontWeight: '600'
  },
  loc: {
    fontStyle: 'italic',
    color: COLORS.formLabel,
    marginTop: 5
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: COLORS.border
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text
  },
};