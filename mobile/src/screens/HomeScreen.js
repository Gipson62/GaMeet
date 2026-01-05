import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Dimensions, 
  FlatList, 
  ActivityIndicator,
  StatusBar
} from "react-native";
import { useSelector } from "react-redux";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS } from "../constants/theme";
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

// Style sombre pour la carte (identique à Map.js)
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

const DEFAULT_REGION = {
    latitude: 50.8503,
    longitude: 4.3517,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function HomeScreen() {
    const navigation = useNavigation();
    const user = useSelector(state => state.auth.user);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [participatingEvents, setParticipatingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            // Permission requise pour le géocodage des adresses
            await Location.requestForegroundPermissionsAsync();

            // Récupérer les événements
            const response = await fetch(`${API_URL}/event`);
            const rawData = await response.json();

            // Traitement des données (Géocodage + Distance)
            const processedData = await Promise.all(rawData.map(async (event) => {
                let coords = null;
                if (event.location) {
                    const parts = event.location.split(',');
                    if (parts.length === 2 && !isNaN(parseFloat(parts[0]))) {
                        coords = { latitude: parseFloat(parts[0]), longitude: parseFloat(parts[1]) };
                    } else {
                        try {
                            const geocoded = await Location.geocodeAsync(event.location);
                            if (geocoded.length > 0) {
                                coords = { latitude: geocoded[0].latitude, longitude: geocoded[0].longitude };
                            }
                        } catch (e) {}
                    }
                }

                return { ...event, _coords: coords };
            }));

            // Filtrer les événements à venir
            const now = new Date();
            const upcoming = processedData
                .filter(e => new Date(e.scheduled_date) > now)
                .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

            // Filtrer les événements auxquels je participe
            const participating = processedData.filter(e => 
                user && e.participant && e.participant.some(p => p.User.id === user.id)
            );

            setUpcomingEvents(upcoming);
            setParticipatingEvents(participating);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const renderUpcomingCard = ({ item }) => {
        const mainGame = item.event_game?.[0]?.game;
        const imageUrl = mainGame?.logo?.url 
            ? `${API_URL.replace('/v1', '')}/uploads/${mainGame.logo.url}`
            : (item.event_photo?.[0]?.photo?.url ? `${API_URL.replace('/v1', '')}/uploads/${item.event_photo[0].photo.url}` : null);
        
        const date = new Date(item.scheduled_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

        return (
            <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('EventDetails', { id: item.id })}
                activeOpacity={0.9}
            >
                <View style={styles.cardImageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={[styles.cardImage, styles.placeholderImage]}>
                            <MaterialIcons name="sports-esports" size={30} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.cardInfoRow}>
                        <Text style={styles.cardInfoText}>{date}</Text>
                    </View>
                    <Text style={styles.cardLocation} numberOfLines={1}>{item.location}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* 1. Hero Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Bonjour {user?.pseudo || 'Joueur'} !</Text>
                    </View>
                </View>

                {/* 2. Évènements à venir */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Évènements à venir</Text>
                    {loading ? (
                        <ActivityIndicator color={COLORS.button} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={upcomingEvents}
                            renderItem={renderUpcomingCard}
                            keyExtractor={item => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Aucun événement à venir.</Text>
                            }
                        />
                    )}
                </View>

                {/* 3. Évènements auxquels on participe (Map Preview) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Carte du prochain événement</Text>
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            region={upcomingEvents[0]?._coords ? {
                                latitude: upcomingEvents[0]._coords.latitude,
                                longitude: upcomingEvents[0]._coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            } : DEFAULT_REGION}
                            showsUserLocation={false}
                            customMapStyle={mapStyle}
                            scrollEnabled={false}
                            zoomEnabled={false}
                        >
                            {upcomingEvents.length > 0 && upcomingEvents[0]._coords && (
                                <Marker
                                    key={upcomingEvents[0].id}
                                    coordinate={upcomingEvents[0]._coords}
                                    pinColor={COLORS.button}
                                />
                            )}
                        </MapView>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 20,
        marginBottom: 16,
    },
    horizontalList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#0D1B2A', // Bleu nuit très sombre
        borderRadius: 20,
        padding: 12,
        width: width * 0.85,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardImageContainer: {
        marginRight: 16,
    },
    cardImage: {
        width: 70,
        height: 70,
        borderRadius: 16,
    },
    placeholderImage: {
        backgroundColor: COLORS.button,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardInfoText: {
        color: '#94A3B8', // Bleu gris clair
        fontSize: 13,
    },
    cardInfoSeparator: {
        color: '#94A3B8',
        marginHorizontal: 6,
    },
    cardLocation: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    mapContainer: {
        marginHorizontal: 20,
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    emptyText: {
        color: COLORS.formLabel,
        marginLeft: 20,
        fontStyle: 'italic',
    }
});
