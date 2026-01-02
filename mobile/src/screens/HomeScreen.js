import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { COLORS } from "../constants/theme";
import { logout } from "../store/slices/authSlice";

export default function HomeScreen() {
    const dispatch = useDispatch();

    const handleLogout = () => {
        // L'action logout va nettoyer le token dans le store
        // Le RootStack va détecter le changement et rediriger automatiquement vers AuthStack
        dispatch(logout());
    };

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "700" }}>Home (placeholder)</Text>

            <TouchableOpacity
                onPress={handleLogout}
                style={{ marginTop: 20, padding: 12, borderRadius: 8, backgroundColor: COLORS.button }}
            >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}
