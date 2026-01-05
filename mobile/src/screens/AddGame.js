import { useState } from 'react';
import { 
    View, Text, TextInput, ScrollView, TouchableOpacity, 
    Alert, ActivityIndicator, Modal, Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { TRANSLATIONS } from '../constants/translations';
import { globalStyles } from '../styles/globalStyles';
import { addGameWithPhotos } from '../services/api';

export default function AddGame() {
    const navigation = useNavigation();
    const route = useRoute();
    const language = useSelector(state => state.auth.language);
    const t = TRANSLATIONS[language || 'fr'];

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
            Alert.alert(t.error, t.requiredFieldsError);
            return;
        }

        if (!banner || !logo || !grid) {
            Alert.alert(t.error, t.allImagesRequired);
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

            await addGameWithPhotos(formData);
            Alert.alert(t.success, t.gameSubmittedSuccess);
            navigation.goBack();
        } catch (error) {
            console.error("Error creating game:", error);
            Alert.alert(t.error, t.networkError);
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

                <Text style={styles.formLabel}>{t.gameName}</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder={t.gameNamePlaceholder} 
                    placeholderTextColor={COLORS.formLabel}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.formLabel}>{t.studioLabel}</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder={t.studioPlaceholder} 
                    placeholderTextColor={COLORS.formLabel}
                    value={studio}
                    onChangeText={setStudio}
                />

                <Text style={styles.formLabel}>{t.publisherLabel}</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder={t.publisherPlaceholder} 
                    placeholderTextColor={COLORS.formLabel}
                    value={publisher}
                    onChangeText={setPublisher}
                />

                <Text style={styles.formLabel}>{t.platformsLabel}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowPlatformModal(true)}>
                    <Text style={{color: selectedPlatforms.length > 0 ? COLORS.text : COLORS.formLabel}}>
                        {selectedPlatforms.length > 0 ? selectedPlatforms.join(', ') : t.selectPlatforms}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.formLabel}>{t.releaseDateLabel}</Text>
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

                <Text style={styles.formLabel}>{t.descriptionLabel}</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder={t.descriptionPlaceholder} 
                    placeholderTextColor={COLORS.formLabel}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Text style={styles.formLabel}>{t.bannerImage}</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('banner')}>
                    {banner ? (
                        <Image source={{ uri: banner }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>{t.selectBanner}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.formLabel}>{t.logoImage}</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('logo')}>
                    {logo ? (
                        <Image source={{ uri: logo }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>{t.selectLogo}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.formLabel}>{t.gridImage}</Text>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={() => pickImage('grid')}>
                    {grid ? (
                        <Image source={{ uri: grid }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons name="add-photo-alternate" size={40} color={COLORS.formLabel} />
                            <Text style={styles.imagePlaceholderText}>{t.selectGrid}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>{t.submitGame}</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Platform Selection Modal */}
            <Modal visible={showPlatformModal} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.selectPlatformsTitle}</Text>
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
                            <Text style={styles.closeText}>{t.done}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = globalStyles;