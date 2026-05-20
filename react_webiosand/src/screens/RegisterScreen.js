import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';
import { MACHINE_TEXTBOX_PROPS, SHORT_TEXTBOX_SUGGESTION_PROPS } from '../utils/textInputProps';

/**
 * Account creation screen. Username and display name are passed into Supabase
 * Auth metadata so the database signup trigger can populate public profiles.
 */
export default function RegisterScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim().toLowerCase(), display_name: displayName.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Registration failed', error.message);
      return;
    }
    navigation.replace('ProfileSetup');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Join the community</Text>
        <Text style={styles.subtitle}>Plant owners and plant sitters, united.</Text>

        <View style={styles.steps}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.step, i === 0 && styles.stepActive]} />
          ))}
        </View>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="How should we call you?"
            placeholderTextColor={C.stone}
            value={displayName}
            onChangeText={setDisplayName}
            {...SHORT_TEXTBOX_SUGGESTION_PROPS}
          />
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="letters, numbers, underscores"
            placeholderTextColor={C.stone}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            autoCorrect={false}
            spellCheck={false}
          />
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
            placeholder="min 8 characters"
            placeholderTextColor={C.stone}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            {...MACHINE_TEXTBOX_PROPS}
          />

          {loading ? (
            <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Create account</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
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
  title: { ...T.h1, textAlign: 'center', marginBottom: S.xs },
  subtitle: { ...T.body, color: C.stone, textAlign: 'center', fontStyle: 'italic', marginBottom: S.lg },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: S.sm, marginBottom: S.xl },
  step: { width: 24, height: 4, borderRadius: 2, backgroundColor: C.sage },
  stepActive: { backgroundColor: C.amber, width: 32 },
  form: { backgroundColor: C.white, borderRadius: S.card, padding: S.lg, marginBottom: S.xl, ...S.cardShadow },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.sm },
  input: { ...shared.input },
  button: { ...shared.primaryButton, marginTop: S.md },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.lg },
  loginLink: { ...T.body, color: C.stone, textAlign: 'center' },
  loginLinkBold: { color: C.amber, fontWeight: '700' },
});
