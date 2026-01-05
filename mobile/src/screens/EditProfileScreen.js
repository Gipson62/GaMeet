import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from "../constants/theme";
import { globalStyles } from '../styles/globalStyles';
import { api, buildPhotoUploadUrl, fetchMe } from "../services/api";
import { TRANSLATIONS } from "../constants/translations";
import { updateUser } from "../store/slices/authSlice";

export default function EditProfileScreen({ navigation }) {
    const { user, language } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const t = TRANSLATIONS[language || 'fr'];

    const [pseudo, setPseudo] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initialiser les champs avec les données de l'utilisateur
    useEffect(() => {
        if (user) {
            setPseudo(user.pseudo || "");
            setBio(user.bio || "");
        }
    }, [user]);

    // URL de l'avatar actuel
    const currentAvatarUri = user?.photo?.url 
        ? buildPhotoUploadUrl(user.photo.url)
        : null;

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission refusée", "Nous avons besoin d'accéder à vos photos.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0]);
        }
    };

    const onSubmit = async () => {
        if (!pseudo.trim()) {
            Alert.alert(t.error, "Le pseudo est requis.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("pseudo", pseudo.trim());
            formData.append("bio", bio.trim());

            if (avatar) {
                const filename = avatar.uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                
                formData.append("avatar", {
                    uri: avatar.uri,
                    name: filename,
                    type,
                });
            }

            await api.patch("/user/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Récupérer les données fraîches
            const updatedUser = await fetchMe(); 
            // Mettre à jour le store Redux
            dispatch(updateUser(updatedUser));
            
            Alert.alert("Succès", "Profil mis à jour !");
            navigation.goBack();

        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.message || "Erreur lors de la mise à jour.";
            Alert.alert(t.error, msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={[globalStyles.scroll, { paddingTop: 60 }]}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelText}>{t.cancel}</Text>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{t.editProfile}</Text>
                            <TouchableOpacity onPress={onSubmit} disabled={loading}>
                                {loading ? <ActivityIndicator size="small" color={COLORS.button} /> : <Text style={styles.saveText}>Enregistrer</Text>}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarSection}>
                            <TouchableOpacity onPress={pickImage}>
                                <View style={styles.avatarWrap}>
                                    {avatar ? (
                                        <Image source={{ uri: avatar.uri }} style={styles.avatar} />
                                    ) : currentAvatarUri ? (
                                        <Image source={{ uri: currentAvatarUri }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                            <Text style={{fontSize: 30}}>👤</Text>
                                        </View>
                                    )}
                                    <View style={styles.editIconBadge}>
                                        <Text style={{color: 'white', fontSize: 12}}>📷</Text>
                                    </View>
                                </View>
                                <Text style={styles.changePhotoText}>Changer la photo</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={globalStyles.formLabel}>Pseudo</Text>
                            <TextInput
                                style={globalStyles.input}
                                value={pseudo}
                                onChangeText={setPseudo}
                                placeholder="Pseudo"
                                placeholderTextColor={COLORS.formLabel}
                            />

                            <Text style={globalStyles.formLabel}>Bio</Text>
                            <TextInput
                                style={[globalStyles.input, globalStyles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Parlez-nous de vous..."
                                placeholderTextColor={COLORS.formLabel}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = {
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelText: {
        color: COLORS.formLabel,
        fontSize: 16,
    },
    saveText: {
        color: COLORS.button,
        fontSize: 16,
        fontWeight: 'bold',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.darkerBackground,
        marginBottom: 10,
        overflow: 'visible',
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.card,
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.button,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.background,
    },
    changePhotoText: {
        color: COLORS.button,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    form: {
        gap: 15,
    },
};
