import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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

function PlantTabIcon() {
  return (
    <View style={styles.plantIcon}>
      <View style={[styles.plantLeaf, styles.plantLeafLeft]} />
      <View style={[styles.plantLeaf, styles.plantLeafRight]} />
      <View style={styles.plantStem} />
    </View>
  );
}

function BrowseTabIcon() {
  return (
    <View style={styles.searchIcon}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function ExchangesTabIcon() {
  return (
    <View style={styles.exchangeIcon}>
      <View style={[styles.exchangeLine, styles.exchangeLineTop]} />
      <View style={[styles.exchangeLine, styles.exchangeLineBottom]} />
      <View style={[styles.exchangeArrowHead, styles.exchangeArrowTop]} />
      <View style={[styles.exchangeArrowHead, styles.exchangeArrowBottom]} />
    </View>
  );
}

function TabIcon({ label, focused }) {
  const icon = label === 'My Plants'
    ? <PlantTabIcon />
    : label === 'Browse'
      ? <BrowseTabIcon />
      : <ExchangesTabIcon />;

  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
      {icon}
    </View>
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
 * Stack for browsing open plant marketplace listings.
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
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: C.forest,
        tabBarInactiveTintColor: C.stone,
        tabBarStyle: {
          backgroundColor: '#fffdf9',
          borderTopColor: C.amberLight,
          borderTopWidth: 1,
          borderRadius: 24,
          height: 74,
          marginHorizontal: 14,
          marginBottom: 10,
          paddingBottom: 9,
          paddingTop: 9,
          shadowColor: C.forest,
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -3 },
          elevation: 10,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 1,
        },
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

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 42,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: C.mist,
    borderWidth: 1,
    borderColor: C.sage,
  },
  plantIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plantLeaf: {
    position: 'absolute',
    width: 10,
    height: 17,
    backgroundColor: C.leaf,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 10,
  },
  plantLeafLeft: {
    left: 4,
    top: 4,
    transform: [{ rotate: '-36deg' }],
    backgroundColor: C.moss,
  },
  plantLeafRight: {
    right: 4,
    top: 2,
    transform: [{ rotate: '36deg' }],
    backgroundColor: C.sage,
  },
  plantStem: {
    width: 4,
    height: 16,
    borderRadius: 4,
    backgroundColor: C.forest,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  searchCircle: {
    width: 15,
    height: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: C.forest,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  searchHandle: {
    width: 10,
    height: 3,
    borderRadius: 3,
    backgroundColor: C.forest,
    position: 'absolute',
    right: 1,
    bottom: 4,
    transform: [{ rotate: '42deg' }],
  },
  exchangeIcon: {
    width: 26,
    height: 24,
  },
  exchangeLine: {
    position: 'absolute',
    left: 2,
    right: 4,
    height: 3,
    borderRadius: 3,
    backgroundColor: C.forest,
  },
  exchangeLineTop: { top: 6 },
  exchangeLineBottom: { bottom: 6 },
  exchangeArrowHead: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: C.forest,
  },
  exchangeArrowTop: {
    right: 2,
    top: 3,
    transform: [{ rotate: '45deg' }],
  },
  exchangeArrowBottom: {
    left: 2,
    bottom: 3,
    transform: [{ rotate: '225deg' }],
  },
});
