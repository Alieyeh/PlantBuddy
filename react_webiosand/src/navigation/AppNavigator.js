import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import PlantsScreen from '../screens/PlantsScreen';
import AddEditPlantScreen from '../screens/AddEditPlantScreen';
import ListingsScreen from '../screens/ListingsScreen';
import ExchangesScreen from '../screens/ExchangesScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import PostListingScreen from '../screens/PostListingScreen';
import ApplyScreen from '../screens/ApplyScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import SwapProposalScreen from '../screens/SwapProposalScreen';
import SwapProposalsScreen from '../screens/SwapProposalsScreen';
import HandoffReviewScreen from '../screens/HandoffReviewScreen';

import { SessionManager } from '../storage/SessionManager';
import { C } from '../lib/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = { 'My Plants': '🌿', Browse: '🔍', Exchanges: '🤝', Profile: '👤' };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {icons[label] ?? '●'}
    </Text>
  );
}

/**
 * Stack for owner plant management screens.
 */
function PlantsStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerTintColor: C.forest,
      headerStyle: { backgroundColor: C.white },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: C.cream },
    }}>
      <Stack.Screen name="PlantsList" component={PlantsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddEditPlant"
        component={AddEditPlantScreen}
        options={{ title: 'Plant Details', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="PostListing"
        component={PostListingScreen}
        options={{ title: 'Create Listing', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: 'Applicants', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="SwapProposal"
        component={SwapProposalScreen}
        options={{ title: 'Propose Swap', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="SwapProposals"
        component={SwapProposalsScreen}
        options={{ title: 'Swap Proposals', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="HandoffReview"
        component={HandoffReviewScreen}
        options={{ title: 'Leave Review', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Stack for browsing open sitting requests.
 */
function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerTintColor: C.forest,
      headerStyle: { backgroundColor: C.white },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: C.cream },
    }}>
      <Stack.Screen name="ListingsFeed" component={ListingsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Listing', headerBackTitle: 'Browse' }}
      />
      <Stack.Screen
        name="Apply"
        component={ApplyScreen}
        options={{ title: 'Apply to Sit', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="SwapProposal"
        component={SwapProposalScreen}
        options={{ title: 'Propose Swap', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="SwapProposals"
        component={SwapProposalsScreen}
        options={{ title: 'Swap Proposals', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="HandoffReview"
        component={HandoffReviewScreen}
        options={{ title: 'Leave Review', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}

function ExchangesStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerTintColor: C.forest,
      headerStyle: { backgroundColor: C.white },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: C.cream },
    }}>
      <Stack.Screen name="ExchangesHome" component={ExchangesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{ title: 'Listing', headerBackTitle: 'Exchanges' }}
      />
      <Stack.Screen
        name="SwapProposals"
        component={SwapProposalsScreen}
        options={{ title: 'Swap Proposals', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="HandoffReview"
        component={HandoffReviewScreen}
        options={{ title: 'Leave Review', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="Apply"
        component={ApplyScreen}
        options={{ title: 'Apply to Sit', headerBackTitle: 'Back' }}
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
        tabBarActiveTintColor: C.forest,
        tabBarInactiveTintColor: C.stone,
        tabBarStyle: {
          backgroundColor: C.white,
          borderTopColor: C.mist,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="My Plants" component={PlantsStack} />
      <Tab.Screen name="Browse" component={BrowseStack} />
      <Tab.Screen name="Exchanges" component={ExchangesStack} />
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.cream }}>
        <ActivityIndicator size="large" color={C.amber} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
