import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  FlatList, 
  Text, 
  Image, 
  TouchableOpacity
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { COLORS } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function Map() {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour afficher la carte.');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      const userCoords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setLocation(userCoords);

      fetchEvents(userCoords);
    })();
  }, []);

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

  const fetchEvents = async (userLoc) => {
    try {
      const response = await fetch(`${API_URL}/event`);
      const rawData = await response.json();

      const data = await Promise.all(rawData.map(async (event) => {
        let coords = null;
        if (event.location) {
          const parts = event.location.split(',');
          if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
             coords = { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
          } 
          else {
             try {
               const geocoded = await Location.geocodeAsync(event.location);
               if (geocoded.length > 0) {
                 coords = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
               }
             } catch (err) {
               console.log("Géocodage impossible pour:", event.location);
             }
          }
        }
        
        let distance = null;
        if (coords && userLoc) {
            distance = getDistanceFromLatLonInKm(userLoc.latitude, userLoc.longitude, coords.latitude, coords.longitude);
        }

        return { ...event, _coords: coords, distance };
      }));
      
      const locatedEvents = data.filter(e => e._coords);
      // Tri par distance
      locatedEvents.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
      
      setEvents(locatedEvents); 
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const recenterMap = async () => {
    try {
      // 1. Essayer d'abord la dernière position connue (beaucoup plus rapide)
      let userLocation = await Location.getLastKnownPositionAsync({});
      
      // 2. Si pas de dernière position, on demande la position actuelle
      if (!userLocation) {
        userLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }

      if (userLocation && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }, 1000);
      }
    } catch (error) {
      console.log("Erreur localisation", error);
      // 3. Fallback sur la position initiale si tout échoue
      if (location && mapRef.current) {
        mapRef.current.animateToRegion(location, 1000);
      }
    }
  };

  const handleLocateEvent = (coords) => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const renderEventItem = ({ item }) => {
    const mainGame = item.event_game?.[0]?.game;
    const imageUrl = mainGame?.logo?.url 
        ? `${API_URL.replace('/v1', '')}/uploads/${mainGame.logo.url}`
        : (item.event_photo?.[0]?.photo?.url ? `${API_URL.replace('/v1', '')}/uploads/${item.event_photo[0].photo.url}` : null);

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('EventDetails', { id: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, styles.placeholderImage]}>
                        <MaterialIcons name="sports-esports" size={24} color="#fff" />
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{mainGame?.name || "Événement Gaming"}</Text>
            </View>
            <View style={styles.rightAction}>
            <Text style={styles.cardDistance}>{item.distance ? `${item.distance.toFixed(1)} km` : ''}</Text>
                <TouchableOpacity 
                    style={styles.locateBtn}
                    onPress={() => handleLocateEvent(item._coords)}
                >
                    <MaterialIcons name="place" size={24} color={COLORS.button} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
  };

  if (loading || !location) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header/Map Section */}
      <View style={styles.mapContainer}>
        <MapView 
          ref={mapRef}
          style={styles.map} 
          initialRegion={location}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          zoomControlEnabled={false}
          customMapStyle={mapStyle}
          // right: 0 pour bien centrer horizontalement
          // bottom: 100 pour remonter le logo Google au-dessus du bouton FAB
          mapPadding={{ top: 0, right: 0, bottom: 100, left: 0 }}
        >
          {events.map(event => (
            <Marker
              key={event.id}
              coordinate={event._coords}
              title={event.name}
              description={event.location}
              onCalloutPress={() => navigation.navigate('EventDetails', { id: event.id })}
            />
          ))}
        </MapView>
        <TouchableOpacity style={styles.recenterBtn} onPress={recenterMap}>
            <MaterialIcons name="my-location" size={24} color={COLORS.button} />
        </TouchableOpacity>
      </View>

      {/* Content Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
            {/* Handle removed */}
        </View>
        <FlatList
            data={events}
            renderItem={renderEventItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

// Style sombre pour la carte
const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: height * 0.6,
    width: '100%',
    borderBottomWidth: 2,
    borderColor: '#00FFFF', // Bordure bleu néon
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 15,
    zIndex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: -40, // Effet de recouvrement
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 2,
    elevation: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  panelHeader: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.formLabel,
    borderRadius: 3,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 30, 60, 0.6)', // Bleu nuit translucide
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginRight: 15,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: COLORS.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: COLORS.formLabel,
    fontSize: 14,
  },
  cardDistance: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rightAction: {
    alignItems: 'center',
    marginLeft: 10,
  },
  locateBtn: {
    padding: 4,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 47, // Positionné au-dessus du panneau qui recouvre le bas de la carte (40px + marge)
    right: 20,
    backgroundColor: COLORS.darkerBackground,
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 5,
    zIndex: 10,
  },
});