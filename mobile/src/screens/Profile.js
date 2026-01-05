import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Image,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../constants/theme";
import { fetchMe, deleteMyAccount, buildPhotoUrl, buildPhotoUploadUrl } from "../services/api";
import { logout, setLanguage, updateUser } from "../store/slices/authSlice";
import { TRANSLATIONS } from "../constants/translations";
import { globalStyles } from '../styles/globalStyles';

export default function Profile({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    
    const dispatch = useDispatch();
    const { user: me, language } = useSelector((state) => state.auth);
    const t = TRANSLATIONS[language || 'fr'];

    // Fonction pour recharger les données
    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await fetchMe();
            // Mise à jour du store Redux avec les données fraîches
            dispatch(updateUser(data));
        } catch (e) {
            const msg = e?.response?.data?.message || "Impossible de charger le profil.";
            Alert.alert(t.error, msg);
        } finally {
            setLoading(false);
        }
    };

    // Charger au montage
    useEffect(() => {
        loadProfile();
    }, [language]);

    // Recharger quand on revient sur l'écran (focus)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadProfile();
        });
        return unsubscribe;
    }, [navigation]);

    const onEditProfile = () => {
        navigation.navigate("EditProfile");
    };

    const onLanguage = () => {
        setModalVisible(true);
    };

    const changeLanguage = (lang) => {
        dispatch(setLanguage(lang));
        setModalVisible(false);
    };

    const onLogout = () => {
        dispatch(logout());
    };

    const onDeleteAccount = () => {
        Alert.alert(t.deleteConfirmTitle, t.deleteConfirmBody, [
            { text: t.cancel, style: "cancel" },
            {
                text: t.delete,
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteMyAccount();
                        dispatch(logout());
                        Alert.alert(t.accountDeleted, t.accountDeleted);
                    } catch (e) {
                        const msg = e?.response?.data?.message || "Impossible de supprimer le compte.";
                        Alert.alert(t.error, msg);
                    }
                },
            },
        ]);
    };

    if (loading && !me) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <ActivityIndicator />
                </View>
            </SafeAreaView>
        );
    }

    const pseudo = me?.pseudo ?? t.userPlaceholder;
    const email = me?.email ?? "";
    const bio = me?.bio ?? t.bioPlaceholder;

    // Construction de l'URL de l'avatar
    // On affiche l'image si elle existe (même si c'est l'image par défaut)
    const avatarUri = me?.photo?.url 
        ? buildPhotoUploadUrl(me.photo.url)
        : null;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.header}>{t.header}</Text>

                <View style={styles.profile}>
                    <View style={styles.avatarWrap}>
                        {avatarUri ? (
                            <Image 
                                source={{ uri: avatarUri }} 
                                style={styles.avatar} 
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={{fontSize: 30}}>👤</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{pseudo}</Text>
                    <Text style={styles.email}>{email}</Text>

                    <Text style={styles.bio}>{bio}</Text>
                </View>

                <View style={styles.menu}>
                    <MenuRow label={t.editProfile} onPress={onEditProfile} />
                    <MenuRow label={`${t.language} (${language.toUpperCase()})`} onPress={onLanguage} />
                    <MenuRow label={t.logout} onPress={onLogout} />
                    <TouchableOpacity style={styles.dangerRow} onPress={onDeleteAccount}>
                        <Text style={styles.dangerText}>{t.deleteAccount}</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal de choix de langue */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
                            
                            <TouchableOpacity 
                                style={[styles.langOption, language === 'fr' && styles.selectedLang]} 
                                onPress={() => changeLanguage('fr')}
                            >
                                <Text style={styles.langText}>Français 🇫🇷</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.langOption, language === 'en' && styles.selectedLang]} 
                                onPress={() => changeLanguage('en')}
                            >
                                <Text style={styles.langText}>English 🇬🇧</Text>
                            </TouchableOpacity>

                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>{t.cancel}</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

function MenuRow({ label, onPress }) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <Text style={styles.rowText}>{label}</Text>
            <Text style={styles.chev}>›</Text>
        </TouchableOpacity>
    );
}

const styles = {
    ...globalStyles,
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
        paddingHorizontal: 16,
    },
    profile: {
        alignItems: "center",
        marginBottom: 24,
    },
    avatarWrap: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: COLORS.darkerBackground,
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.card,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    name: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: "700",
    },
    email: {
        color: COLORS.formLabel,
        fontSize: 12,
        marginTop: 4,
    },
    bio: {
        color: COLORS.text,
        fontSize: 12,
        textAlign: "center",
        marginTop: 16,
        paddingHorizontal: 16,
        lineHeight: 18,
    },
    menu: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
    },
    row: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    rowText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "600",
    },
    chev: {
        color: COLORS.formLabel,
        fontSize: 20,
    },
    dangerRow: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dangerText: {
        color: COLORS.warning,
        fontSize: 16,
        fontWeight: "700",
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    langOption: {
        padding: 15,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    selectedLang: {
        backgroundColor: COLORS.card,
        borderRadius: 10,
    },
    langText: {
        color: COLORS.text,
        fontSize: 16,
    },
    buttonClose: {
        backgroundColor: COLORS.button,
        marginTop: 20,
        padding: 10,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    header: {
        color: COLORS.formLabel,
        fontSize: 18,
        marginBottom: 16,
        textAlign: "center",
        fontWeight: "bold",
    },
};
