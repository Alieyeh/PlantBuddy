import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SessionManager } from '../storage/SessionManager';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PlantsScreen from '../screens/PlantsScreen';
import AddEditPlantScreen from '../screens/AddEditPlantScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    SessionManager.isLoggedIn().then((loggedIn) => {
      setInitialRoute(loggedIn ? 'Plants' : 'Login');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Plants" component={PlantsScreen} />
        <Stack.Screen
          name="AddEditPlant"
          component={AddEditPlantScreen}
          options={{ headerShown: true, title: 'Plant Details', headerTintColor: '#2e7d32' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
