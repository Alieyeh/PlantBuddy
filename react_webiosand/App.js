import { View, ActivityIndicator, Text } from 'react-native';
import { useFonts, Fraunces_400Regular, Fraunces_700Bold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { BricolageGrotesque_400Regular, BricolageGrotesque_600SemiBold, BricolageGrotesque_300Light } from '@expo-google-fonts/bricolage-grotesque';
import AppNavigator from './src/navigation/AppNavigator';
import { applyFonts } from './src/lib/theme';
import { supabaseConfigError } from './src/lib/supabase';

/**
 * Expo app root. Navigation owns the current auth gate and screen tree.
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Fraunces_900Black,
    BricolageGrotesque_300Light,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#faf7f2' }}>
        <ActivityIndicator size="large" color="#d4804a" />
      </View>
    );
  }

  applyFonts({
    display: 'Fraunces_700Bold',
    displayBlack: 'Fraunces_900Black',
    displayRegular: 'Fraunces_400Regular',
    body: 'BricolageGrotesque_400Regular',
    bodyMedium: 'BricolageGrotesque_600SemiBold',
    bodyLight: 'BricolageGrotesque_300Light',
  });

  if (supabaseConfigError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#faf7f2' }}>
        <Text style={{ color: '#254236', fontSize: 24, fontWeight: '700', marginBottom: 12 }}>
          Supabase config missing
        </Text>
        <Text style={{ color: '#4d5d53', fontSize: 16, lineHeight: 22 }}>
          {supabaseConfigError.message}
        </Text>
      </View>
    );
  }

  return <AppNavigator />;
}
