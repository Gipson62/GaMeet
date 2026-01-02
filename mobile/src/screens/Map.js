import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';
import { COLORS } from '../constants/theme';

export default function Map() {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Demander la permission et récupérer la position
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour afficher la carte.');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      fetchEvents();
    })();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/event`);
      const rawData = await response.json();

      // 2. Géocodage des événements (Adresse -> GPS)
      const data = await Promise.all(rawData.map(async (event) => {
        let coords = null;
        if (event.location) {
          const parts = event.location.split(',');
          // Cas 1: Coordonnées brutes "lat,long"
          if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
             coords = { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
          } 
          // Cas 2: Adresse postale
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
        return { ...event, _coords: coords };
      }));
      
      // On ne garde que les événements qu'on a réussi à localiser
      setEvents(data.filter(e => e._coords)); 
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        initialRegion={location}
        showsUserLocation={true}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});