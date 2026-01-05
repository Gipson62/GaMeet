import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar, faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { COLORS } from "../constants/theme";
import { registerUser } from "../services/api";
import { globalStyles } from '../styles/globalStyles';
import DateTimePicker from '@react-native-community/datetimepicker';

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export default function SignUpScreen({ navigation }) {
    const [pseudo, setPseudo] = useState("");
    const [birthDateText, setBirthDateText] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [birthDateObj, setBirthDateObj] = useState(null); // Date JS
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); // Nouvel état pour savoir si on a cliqué
    
    // États pour la visibilité des mots de passe
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const safeTrim = (v) => (typeof v === "string" ? v.trim() : "");

    const error = useMemo(() => {
        if (!safeTrim(pseudo)) return "Nom d’utilisateur requis.";
        if (!birthDateObj) return "Date de naissance requise";
        if (!safeTrim(email)) return "Email requis.";
        if (!isEmailValid(email)) return "Email invalide.";
        if (!password || password.length < 8) return "Mot de passe trop court (min 8).";
        if (password !== confirm) return "Les mots de passe ne correspondent pas.";
        return null;
    }, [pseudo, birthDateObj, email, password, confirm]);

    function formatDateForApi(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD
    }

    function formatDateFR(date) {
        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    const onSubmit = async () => {
        setSubmitted(true); // On marque le formulaire comme soumis
        
        if (error) return;

        try {
            setLoading(true);

            await registerUser({
                pseudo: pseudo.trim(),
                birth_date: formatDateForApi(birthDateObj),
                email: email.trim().toLowerCase(),
                password,
            });

            Alert.alert("Compte créé", "Ton compte a été créé.");
            navigation.navigate("Login")
        } catch (e) {
            const msg =
                e?.response?.data?.message ||
                "Impossible de créer le compte. Vérifie les informations.";
            Alert.alert("Erreur", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={globalStyles.title}>Création de compte</Text>
                        
                        <Text style={globalStyles.formLabel}>Nom d'utilisateur</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={pseudo}
                                onChangeText={setPseudo}
                                placeholder="Entrez un nom d'utilisateur"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.inputField}
                                autoCapitalize="none"
                            />
                        </View>

                        <Text style={globalStyles.formLabel}>Date de naissance</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.inputContainer} pointerEvents="none">
                                <TextInput
                                    value={birthDateText}
                                    placeholder="Sélectionner une date"
                                    placeholderTextColor={COLORS.formLabel}
                                    style={styles.inputField}
                                    editable={false}
                                />
                                <FontAwesomeIcon icon={faCalendar} size={20} color={COLORS.formLabel} style={styles.icon} />
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={birthDateObj || new Date(2000, 0, 1)}
                                mode="date"
                                display="spinner"
                                maximumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (event.type === "dismissed" || !selectedDate) return;

                                    setBirthDateObj(selectedDate);
                                    setBirthDateText(formatDateFR(selectedDate));
                                }}
                            />
                        )}

                        <Text style={globalStyles.formLabel}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Entrez un email valide"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.inputField}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <Text style={globalStyles.formLabel}>Mot de passe</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Entrez un mot de passe"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.inputField}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} color={COLORS.formLabel} />
                            </TouchableOpacity>
                        </View>

                        <Text style={globalStyles.formLabel}>Confirmer mot de passe</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={confirm}
                                onChangeText={setConfirm}
                                placeholder="Confirmez le mot de passe"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.inputField}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.iconButton}>
                                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} size={20} color={COLORS.formLabel} />
                            </TouchableOpacity>
                        </View>

                        {/* On affiche l'erreur seulement si submitted est true */}
                        {submitted && error ? <Text style={styles.error}>{error}</Text> : null}

                        <TouchableOpacity
                            style={[globalStyles.submitBtn, (loading) && { opacity: 0.7 }]}
                            onPress={onSubmit}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator /> : <Text style={globalStyles.buttonText}>Créer le compte</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("Login")}
                            style={styles.linkBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.linkText}>Déjà inscrit ?</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = {
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 16,
        paddingBottom: 40,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        borderRadius: 8,
        backgroundColor: COLORS.background,
        borderBottomWidth: 2,
        borderColor: COLORS.formLabel,
    },
    inputField: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        color: COLORS.text,
        fontSize: 16,
    },
    icon: {
        marginRight: 14,
    },
    iconButton: {
        padding: 10,
        marginRight: 4,
    },
    error: {
        color: COLORS.error,
        marginTop: 12,
        fontSize: 12,
    },
    linkBtn: {
        marginTop: 16,
        alignItems: "center",
    },
    linkText: {
        color: COLORS.formLabel,
        fontSize: 12,
        textDecorationLine: "underline",
    },
};
