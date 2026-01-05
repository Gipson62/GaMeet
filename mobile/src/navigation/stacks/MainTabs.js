import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/theme';
import { TRANSLATIONS } from '../../constants/translations';

// Import des écrans
import Home from '../../screens/HomeScreen';
import GameList from '../../screens/GameList';
import EventList from '../../screens/EventList';
import Map from '../../screens/Map';
import Profile from '../../screens/Profile';
import EditProfileScreen from '../../screens/EditProfileScreen';
import EventDetails from '../../screens/EventDetails';
import GameDetails from '../../screens/GameDetails';

const Tab = createBottomTabNavigator();
const EventStack = createNativeStackNavigator();
const GameStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function EventStackScreen() {
  return (
    <EventStack.Navigator>
      <EventStack.Screen name="EventList" component={EventList} options={{ headerShown: false }} />
      <EventStack.Screen name="EventDetails" component={EventDetails} />
    </EventStack.Navigator>
  );
}

function GameStackScreen() {
    return (
      <GameStack.Navigator>
        <GameStack.Screen name="GameList" component={GameList} options={{ headerShown: false }} />
        <GameStack.Screen name="GameDetails" component={GameDetails} />
      </GameStack.Navigator>
    );
  }

function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileMain" component={Profile} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
        </ProfileStack.Navigator>
    );
}

export default function MainTabs() {
  const language = useSelector((state) => state.auth.language || 'fr');
  const t = TRANSLATIONS[language];

  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = 'home';
          } else if (route.name === 'Jeux') {
            iconName = 'sports-esports';
          } else if (route.name === 'Event') {
            iconName = 'event';
          } else if (route.name === 'Carte') {
            iconName = 'map';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.button,
        tabBarInactiveTintColor: COLORS.formLabel,
        tabBarStyle: {
          backgroundColor: COLORS.background
        },
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={Home} 
        options={{
          tabBarLabel: t.home,
          headerShown: true,
          title: 'GaMeet',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
        }}
      />
      <Tab.Screen 
        name="Jeux" 
        component={GameStackScreen} 
        options={{
          tabBarLabel: t.games,
        }}
      />
      <Tab.Screen 
        name="Event" 
        component={EventStackScreen} 
        options={{
          tabBarLabel: t.events,
        }}
      />
      <Tab.Screen 
        name="Carte" 
        component={Map} 
        options={{
          tabBarLabel: t.map,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen} 
        options={{
          tabBarLabel: t.profile,
        }}
      />
    </Tab.Navigator>
  );
}
