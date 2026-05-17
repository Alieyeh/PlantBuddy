import AppNavigator from './src/navigation/AppNavigator';

/**
 * Expo app root. Navigation owns the current auth gate and screen tree.
 */
export default function App() {
  return <AppNavigator />;
}
