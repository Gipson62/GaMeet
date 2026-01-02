import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { COLORS, theme } from "../constants/theme";
import { login } from "../store/slices/authSlice";

function isEmailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const dispatch = useDispatch();
    const { isLoading, error: authError } = useSelector((state) => state.auth);

    const safeTrim = (v) => (typeof v === "string" ? v.trim() : "");

    const validationError = useMemo(() => {
        if (!isEmailValid(email)) return "Email invalide.";
        if (!password) return "Mot de passe requis.";
        return null;
    }, [email, password]);

    const onSubmit = async () => {
        if (validationError) return;

        try {
            await dispatch(login({
                email: safeTrim(email).toLowerCase(),
                password,
            })).unwrap();
            navigation.navigate("Main");

        } catch (err) {
            Alert.alert("Erreur", err || "Impossible de se connecter.");
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
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.title}>Connexion</Text>

                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={email}
                                onChangeText={(v) => setEmail(v ?? "")}
                                placeholder="Entrez un email valide"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.input}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                returnKeyType="next"
                            />
                        </View>

                        <Text style={styles.label}>Mot de passe</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={password}
                                onChangeText={(v) => setPassword(v ?? "")}
                                placeholder="Entrez votre mot de passe"
                                placeholderTextColor={COLORS.formLabel}
                                style={styles.input}
                                secureTextEntry={!showPassword}
                                returnKeyType="done"
                                onSubmitEditing={onSubmit}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} color={COLORS.formLabel} />
                            </TouchableOpacity>
                        </View>

                        {validationError ? <Text style={styles.error}>{validationError}</Text> : null}
                        {authError ? <Text style={styles.error}>{authError}</Text> : null}

                        <TouchableOpacity
                            style={[styles.button, (isLoading || !!validationError) && { opacity: 0.7 }]}
                            onPress={onSubmit}
                            disabled={isLoading || !!validationError}
                        >
                            {isLoading ? (
                                <ActivityIndicator />
                            ) : (
                                <Text style={styles.buttonText}>Se connecter</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("SignUp")}
                            style={styles.linkBtn}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.linkText}>Pas encore de compte ?</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: theme.padding,
        paddingBottom: 40,
    },
    title: {
        color: COLORS.text,
        fontSize: theme.h2,
        fontWeight: "700",
        marginBottom: 24,
        textAlign: "center",
    },
    label: {
        color: COLORS.formLabel,
        fontSize: 12,
        marginTop: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        borderRadius: theme.radius,
        backgroundColor: COLORS.background,
        borderBottomWidth: 2,
        borderColor: COLORS.formLabel,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        color: COLORS.formText,
        fontSize: theme.body,
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
    button: {
        marginTop: 28,
        backgroundColor: COLORS.button,
        paddingVertical: 14,
        borderRadius: theme.radius,
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.text,
        fontSize: theme.body,
        fontWeight: "700",
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
});
