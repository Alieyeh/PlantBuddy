import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';
import { MACHINE_TEXTBOX_PROPS } from '../utils/textInputProps';

/**
 * Email/password sign-in screen backed by Supabase Auth.
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      Alert.alert('Login failed', error.message);
      return;
    }
    if (!data?.session) {
      Alert.alert(
        'Check your email',
        'Your account exists, but Supabase did not return a session. If email confirmation is enabled, confirm your email and then log in again.'
      );
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}>
          <Text style={styles.leaf}>🌿</Text>
        </View>

        <Text style={styles.wordmark}>PlantBuddy</Text>
        <Text style={styles.tagline}>Every plant deserves a caretaker.</Text>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={C.stone}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            {...MACHINE_TEXTBOX_PROPS}
          />
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={C.stone}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            {...MACHINE_TEXTBOX_PROPS}
          />

          {loading ? (
            <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Welcome back</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>New here? <Text style={styles.registerLinkBold}>Create an account</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  inner: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: S.lg, paddingVertical: S.xxxl,
  },
  brandMark: { alignItems: 'center', marginBottom: S.sm },
  leaf: { fontSize: 52 },
  wordmark: {
    ...T.hero,
    textAlign: 'center',
    marginBottom: S.xs,
  },
  tagline: {
    ...T.body,
    color: C.stone,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: S.xxl,
  },
  form: {
    backgroundColor: C.white,
    borderRadius: S.card,
    padding: S.lg,
    marginBottom: S.xl,
    ...S.cardShadow,
  },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.sm },
  input: { ...shared.input },
  button: { ...shared.primaryButton, marginTop: S.md },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.lg },
  registerLink: { ...T.body, color: C.stone, textAlign: 'center' },
  registerLinkBold: { color: C.amber, fontWeight: '700' },
});
