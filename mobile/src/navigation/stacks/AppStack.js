import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../screens/HomeScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import { COLORS } from "../../constants/theme";

const Tab = createBottomTabNavigator();

export default function AppStack() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.darkerBackground,
                    borderTopColor: COLORS.border,
                },
                tabBarActiveTintColor: COLORS.button,
                tabBarInactiveTintColor: COLORS.formLabel,
            }}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: "Accueil",
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{
                    tabBarLabel: "Profil",
                }}
            />
        </Tab.Navigator>
    );
}
