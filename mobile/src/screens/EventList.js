import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, Button, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { API_URL } from '../config';
import { COLORS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { globalStyles } from '../styles/globalStyles';

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
  const [showMyEvents, setShowMyEvents] = useState(false);
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);

  useEffect(() => {
    getUserLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [searchText, selectedGame, maxDistance, events, userLocation, showMyEvents]);

  const fetchEvents = async () => {
    try {
      console.log('Tentative de connexion vers :', `${API_URL}/event`);
      const response = await fetch(`${API_URL}/event`);
      const rawData = await response.json();
      
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

    // Filtre Mes événements
    if (showMyEvents && user) {
      result = result.filter(e => e.author === user.id);
    }

    setFilteredEvents(result);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder={t.searchPlaceholder || "Rechercher..."}
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor={COLORS.formLabel}
      />

      <View style={styles.filters}>
        <TouchableOpacity style={styles.btnFilter} onPress={() => setModalVisible(true)}>
          <Text style={styles.btnText}>{selectedGame || t.game || "Jeu"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnFilter} onPress={() => setMaxDistance(prev => prev === 50 ? 5000 : 50)}>
          <Text style={styles.btnText}>{maxDistance < 1000 ? `< ${maxDistance} km` : (t.distanceAll || "Distance: Tout")}</Text>
        </TouchableOpacity>
        {user && (
          <TouchableOpacity style={[styles.btnFilter, showMyEvents && { backgroundColor: '#10b981' }]} onPress={() => setShowMyEvents(!showMyEvents)}>
            <Text style={styles.btnText}>{t.myEvents || "Mes events"}</Text>
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
          renderItem={({ item }) => {
            const mainGame = item.event_game?.[0]?.game;
            const bannerUrl = mainGame?.banner?.url 
              ? `${API_URL.replace('/v1', '')}/uploads/${mainGame.banner.url}`
              : (item.event_photo?.[0]?.photo?.url ? `${API_URL.replace('/v1', '')}/uploads/${item.event_photo[0].photo.url}` : null);

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

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Button title={t.showAll || "Tout afficher"} color={COLORS.button} onPress={() => { setSelectedGame(null); setModalVisible(false); }} />
          <FlatList 
            data={availableGames}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { setSelectedGame(item); setModalVisible(false); }} style={styles.modalItem}>
                <Text style={styles.modalText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title={t.close || "Fermer"} color={COLORS.error || "red"} onPress={() => setModalVisible(false)} />
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
  scroll: {
    padding: 16,
    paddingTop: 50,
  },
  searchBar: {
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: COLORS.text
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10
  },
  btnFilter: {
    backgroundColor: COLORS.button,
    padding: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 12
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