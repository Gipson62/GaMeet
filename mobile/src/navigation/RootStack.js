import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector, useDispatch } from "react-redux";
import AuthStack from "./stacks/AuthStack";
import MainTabs from "./stacks/MainTabs";
import EditProfileScreen from "../screens/EditProfileScreen";
import { loadUserSession } from "../store/slices/authSlice";
import { COLORS } from "../constants/theme";

const Stack = createNativeStackNavigator();

export default function RootStack() {
    const dispatch = useDispatch();
    const { token, isInitialized } = useSelector((state) => state.auth);
    
    useEffect(() => {
        dispatch(loadUserSession());
    }, [dispatch]);

    if (!isInitialized) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.button} />
            </View>
        );
    }

    const isAuthenticated = !!token;

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "none" }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                    <Stack.Screen 
                        name="EditProfile" 
                        component={EditProfileScreen} 
                        options={{ 
                            headerShown: true, 
                            title: '',
                            headerStyle: { backgroundColor: COLORS.background },
                            headerTintColor: COLORS.text,
                            headerShadowVisible: false,
                            presentation: 'modal' // Animation type modal (slide up sur iOS)
                        }} 
                    />
                </>
            ) : (
                <Stack.Screen name="AuthStack" component={AuthStack} />
            )}
        </Stack.Navigator>
    );
}
