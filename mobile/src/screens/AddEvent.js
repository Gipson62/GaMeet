import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, 
    Alert, ActivityIndicator, Modal, FlatList, Platform, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { COLORS, theme } from '../constants/theme';

export default function AddEvent() {
    const navigation = useNavigation();
    const route = useRoute();
    const { eventToEdit } = route.params || {};
    const token = useSelector(state => state.auth.token);

    // États du formulaire
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [capacity, setCapacity] = useState('');
    const [date, setDate] = useState(new Date());
    const [photos, setPhotos] = useState([]);
    
    // Gestion des pickers de date/heure
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Gestion des jeux
    const [allGames, setAllGames] = useState([]);
    const [selectedGames, setSelectedGames] = useState([]);
    const [gameModalVisible, setGameModalVisible] = useState(false);
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGames();
        if (eventToEdit) {
            setName(eventToEdit.name);
            setLocation(eventToEdit.location);
            setDescription(eventToEdit.description || '');
            setCapacity(eventToEdit.max_capacity ? String(eventToEdit.max_capacity) : '');
            setDate(new Date(eventToEdit.scheduled_date));
            if (eventToEdit.event_game) {
                setSelectedGames(eventToEdit.event_game.map(eg => eg.game.id));
            }
            if (eventToEdit.event_photo) {
                setPhotos(eventToEdit.event_photo.map(ep => ({
                    id: ep.photo.id,
                    uri: `${API_URL.replace('/v1', '')}/uploads/${ep.photo.url}`
                })));
            }
            // Mise à jour du titre de la page via la navigation
            navigation.setOptions({ title: "Modifier l'événement" });
        }
    }, [eventToEdit]);

    const fetchGames = async () => {
        try {
            const response = await fetch(`${API_URL}/game`);
            if (response.ok) {
                const data = await response.json();
                setAllGames(data);
            }
        } catch (error) {
            console.error("Erreur chargement jeux", error);
        }
    };

    const handleCreate = async () => {
        if (!name || !location) {
            Alert.alert("Erreur", "Veuillez remplir les champs obligatoires (Nom, Lieu)");
            return;
        }

        setLoading(true);
        try {
            const finalPhotoIds = [];
            
            // Upload des nouvelles photos
            for (const p of photos) {
                if (p.id) {
                    finalPhotoIds.push(p.id);
                } else {
                    const formData = new FormData();
                    formData.append('photo', {
                        uri: p.uri,
                        name: 'photo.jpg',
                        type: 'image/jpeg',
                    });

                    const uploadRes = await fetch(`${API_URL}/photo`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        body: formData
                    });

                    if (uploadRes.ok) {
                        const data = await uploadRes.json();
                        finalPhotoIds.push(data.photo.id);
                    }
                }
            }

            const payload = {
                name,
                location,
                description,
                scheduled_date: date.toISOString(),
                max_capacity: capacity ? parseInt(capacity) : null,
                game_id: selectedGames,
                photo_id: finalPhotoIds
            };

            const url = eventToEdit ? `${API_URL}/event/${eventToEdit.id}` : `${API_URL}/event`;
            const method = eventToEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Alert.alert("Succès", eventToEdit ? "Événement modifié !" : "Événement créé !");
                navigation.goBack();
                // Idéalement, déclencher un rafraîchissement de la liste ici
            } else {
                const err = await response.json();
                Alert.alert("Erreur", err.message || "Impossible de créer l'événement");
            }
        } catch (error) {
            Alert.alert("Erreur", "Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setDate(newDate);
        }
    };

    const onTimeChange = (event, selectedDate) => {
        setShowTimePicker(false);
        if (selectedDate) {
            const newDate = new Date(date);
            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            setDate(newDate);
        }
    };

    const toggleGame = (id) => {
        if (selectedGames.includes(id)) {
            setSelectedGames(selectedGames.filter(g => g !== id));
        } else {
            setSelectedGames([...selectedGames, id]);
        }
    };

    const getSelectedGameNames = () => {
        if (selectedGames.length === 0) return "Sélectionner des jeux";
        const names = allGames.filter(g => selectedGames.includes(g.id)).map(g => g.name);
        return names.join(', ');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, { uri: result.assets[0].uri }]);
        }
    };

    const removePhoto = (index) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <Text style={styles.label}>Nom de l'événement *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Soirée Jeux..." 
                    placeholderTextColor={COLORS.formLabel}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Lieu *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Adresse ou ville" 
                    placeholderTextColor={COLORS.formLabel}
                    value={location}
                    onChangeText={setLocation}
                />

                <Text style={styles.label}>Date et Heure *</Text>
                <View style={styles.dateRow}>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                        <MaterialIcons name="calendar-today" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.dateText}>{date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                        <MaterialIcons name="access-time" size={20} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                <Text style={styles.label}>Jeux</Text>
                <TouchableOpacity style={styles.input} onPress={() => setGameModalVisible(true)}>
                    <Text style={{color: selectedGames.length ? COLORS.text : COLORS.formLabel}}>
                        {getSelectedGameNames()}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Capacité max (optionnel)</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Ex: 10" 
                    placeholderTextColor={COLORS.formLabel}
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Détails de l'événement..." 
                    placeholderTextColor={COLORS.formLabel}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Photos</Text>
                <View style={styles.photosContainer}>
                    {photos.map((p, index) => (
                        <View key={index} style={styles.photoWrapper}>
                            <Image source={{ uri: p.uri }} style={styles.photoThumb} />
                            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                                <MaterialIcons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
                        <MaterialIcons name="add-a-photo" size={24} color={COLORS.formLabel} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>{eventToEdit ? "Modifier l'événement" : "Créer l'événement"}</Text>}
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={gameModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sélectionner les jeux</Text>
                        <FlatList
                            data={allGames}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.gameItem} onPress={() => toggleGame(item.id)}>
                                    <Text style={[styles.gameText, selectedGames.includes(item.id) && styles.selectedGameText]}>
                                        {item.name}
                                    </Text>
                                    {selectedGames.includes(item.id) && <MaterialIcons name="check" size={20} color={COLORS.button} />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setGameModalVisible(false)}>
                            <Text style={styles.closeText}>Valider</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scroll: { padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
    label: { color: COLORS.formLabel, marginBottom: 8, marginTop: 12, fontWeight: '600' },
    input: {
        backgroundColor: COLORS.card,
        color: COLORS.text,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    dateRow: { flexDirection: 'row', gap: 10 },
    dateBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    dateText: { color: COLORS.text },
    submitBtn: {
        backgroundColor: COLORS.button,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20
    },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.darkerBackground, borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    gameItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: COLORS.border },
    gameText: { color: COLORS.text, fontSize: 16 },
    selectedGameText: { color: COLORS.button, fontWeight: 'bold' },
    closeBtn: { backgroundColor: COLORS.button, padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
    closeText: { color: 'white', fontWeight: 'bold' },
    photosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
    photoWrapper: { position: 'relative' },
    photoThumb: { width: 80, height: 80, borderRadius: 8 },
    removePhotoBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.error || 'red',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addPhotoBtn: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.formLabel,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
