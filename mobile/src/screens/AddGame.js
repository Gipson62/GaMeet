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

export default function AddGame() {
    const navigation = useNavigation();
    const route = useRoute();
    const token = useSelector(state => state.auth.token);

    // États du formulaire
    const [name, setName] = useState('');
    const [studio, setStudio] = useState('');
    const [publisher, setPublisher] = useState('');
    const [release_date, setReleaseDate] = useState(new Date());
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [description, setDescription] = useState('');
    const [banner, setBanner] = useState(null);
    const [logo, setLogo] = useState(null);
    const [grid, setGrid] = useState(null);
    
    // Gestion des pickers et modals
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPlatformModal, setShowPlatformModal] = useState(false);
    
    const [loading, setLoading] = useState(false);

    // Get platforms from navigation params or use defaults
    const availablePlatforms = route.params?.availablePlatforms || ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile', 'VR'];

    const handleCreate = async () => {
        if (!name || !studio || !publisher || selectedPlatforms.length === 0) {
            Alert.alert("Error", "Please fill in all required fields (Name, Studio, Publisher, Platforms)");
            return;
        }

        if (!banner || !logo || !grid) {
            Alert.alert("Error", "All three images (Banner, Logo, Grid) are required");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            
            // Add text fields
            formData.append('name', name);
            formData.append('studio', studio);
            formData.append('publisher', publisher);
            formData.append('platforms', selectedPlatforms.join(', '));
            formData.append('release_date', release_date.toISOString());
            formData.append('is_approved', 'false');
            
            if (description) {
                formData.append('description', description);
            }

            // Add images
            formData.append('banner', {
                uri: banner,
                name: 'banner.jpg',
                type: 'image/jpeg',
            });
            formData.append('logo', {
                uri: logo,
                name: 'logo.jpg',
                type: 'image/jpeg',
            });
            formData.append('grid', {
                uri: grid,
                name: 'grid.jpg',
                type: 'image/jpeg',
            });

            const response = await fetch(`${API_URL}/game/with-photos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                Alert.alert("Success", "Game submitted for approval!");
                navigation.goBack();
            } else {
                const err = await response.json();
                Alert.alert("Error", err.message || "Unable to create game");
            }
        } catch (error) {
            console.error("Error creating game:", error);
            Alert.alert("Error", "Network error");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setReleaseDate(selectedDate);
        }
    };

    const pickImage = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'grid' ? [3, 4] : type === 'logo' ? [1, 1] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            if (type === 'banner') setBanner(uri);
            else if (type === 'logo') setLogo(uri);
            else if (type === 'grid') setGrid(uri);
        }
    };

    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>

                <Text style={styles.label}>Game Name *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Elden Ring..." 
                    placeholderTextColor={COLORS.formLabel}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Studio *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="FromSoftware" 
                    placeholderTextColor={COLORS.formLabel}
                    value={studio}
                    onChangeText={setStudio}
                />

                <Text style={styles.label}>Publisher *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Bandai Namco" 
                    placeholderTextColor={COLORS.formLabel}
                    value={publisher}
                    onChangeText={setPublisher}
                />

                <Text style={styles.label}>Platforms *</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowPlatformModal(true)}>
                    <Text style={{color: selectedPlatforms.length > 0 ? COLORS.text : COLORS.formLabel}}>
                        {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : 'Select platforms...'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Release Date *</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={{color: COLORS.text}}>{release_date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={release_date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Game description..." 
                    placeholderTextColor={COLORS.formLabel}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.label}>Banner Image * (31:10)</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('banner')}>
                    {banner ? (
                        <Image source={{ uri: banner }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>Select Banner</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Logo Image * (1:1)</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('logo')}>
                    {logo ? (
                        <Image source={{ uri: logo }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>Select Logo</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Grid Image * (3:4)</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('grid')}>
                    {grid ? (
                        <Image source={{ uri: grid }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>Select Grid</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.submitText}>Submit Game</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Platform Selection Modal */}
            <Modal visible={showPlatformModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Platforms</Text>
                        <ScrollView>
                            {availablePlatforms.map((platform) => (
                                <TouchableOpacity
                                    key={platform}
                                    style={styles.platformItem}
                                    onPress={() => togglePlatform(platform)}
                                >
                                    <Text style={[styles.platformText, selectedPlatforms.includes(platform) && styles.selectedPlatformText]}>
                                        {platform}
                                    </Text>
                                    {selectedPlatforms.includes(platform) && (
                                        <MaterialIcons name="check" size={20} color={COLORS.button} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPlatformModal(false)}>
                            <Text style={styles.closeText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        padding: 16,
    },
    label: { color: COLORS.formLabel, marginBottom: 8, marginTop: 12, fontWeight: '600' },
    input: {
        backgroundColor: COLORS.card,
        color: COLORS.text,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    imagePickerBtn: {
        backgroundColor: COLORS.card,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        height: 150,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: COLORS.formLabel,
        marginTop: 8,
    },
    submitBtn: {
        backgroundColor: COLORS.button,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20
    },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%'
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    platformItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: COLORS.border
    },
    platformText: {
        color: COLORS.text,
        fontSize: 16
    },
    selectedPlatformText: {
        color: COLORS.button,
        fontWeight: 'bold'
    },
    closeBtn: {
        backgroundColor: COLORS.button,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold'
    },
});