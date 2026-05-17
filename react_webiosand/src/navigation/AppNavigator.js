import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PlantsScreen from '../screens/PlantsScreen';
import AddEditPlantScreen from '../screens/AddEditPlantScreen';
import ListingsScreen from '../screens/ListingsScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import PostListingScreen from '../screens/PostListingScreen';

import { SessionManager } from '../storage/SessionManager';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const GREEN = '#2e7d32';
const LIGHT_GREEN = '#4CAF50';
const GREY = '#9e9e9e';

/**
 * Minimal tab icon renderer used by the current bottom navigation.
 */
function TabIcon({ label, focused }) {
  const icons = { 'My Plants': '🌿', Browse: '🔍' };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

/**
 * Stack for owner plant management screens.
 */
function PlantsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: GREEN }}>
      <Stack.Screen name="PlantsList" component={PlantsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEditPlant"
        component={AddEditPlantScreen}
        options={{ title: 'Plant Details', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="PostListing"
        component={PostListingScreen}
        options={{ title: 'Post Sitting Request', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Stack for browsing open sitting requests.
 */
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: GREEN }}>
      <Stack.Screen name="ListingsFeed" component={ListingsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Sitting Request', headerBackTitle: 'Browse' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Main authenticated tab shell.
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: LIGHT_GREEN,
        tabBarInactiveTintColor: GREY,
        tabBarStyle: { borderTopColor: '#eee', paddingBottom: 4 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="My Plants" component={PlantsStack} />
      <Tab.Screen name="Browse" component={BrowseStack} />
    </Tab.Navigator>
  );
}

/**
 * Root navigator. It waits for the persisted Supabase session before choosing
 * the authenticated or unauthenticated route.
 */
export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    SessionManager.isLoggedIn().then((loggedIn) => {
      setInitialRoute(loggedIn ? 'Main' : 'Login');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={LIGHT_GREEN} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
