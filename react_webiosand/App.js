import { View, ActivityIndicator } from 'react-native';
import { useFonts, Fraunces_400Regular, Fraunces_700Bold, Fraunces_900Black } from '@expo-google-fonts/fraunces';
import { BricolageGrotesque_400Regular, BricolageGrotesque_600SemiBold, BricolageGrotesque_300Light } from '@expo-google-fonts/bricolage-grotesque';
import AppNavigator from './src/navigation/AppNavigator';
import { applyFonts } from './src/lib/theme';

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

  return <AppNavigator />;
}
