import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';
import {
  MACHINE_TEXTBOX_PROPS,
  SHORT_TEXTBOX_SUGGESTION_PROPS,
  TEXTBOX_SPELLCHECK_PROPS,
} from '../utils/textInputProps';

export default function ProfileSetupScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [wantToSit, setWantToSit] = useState(false);
  const [experienceSummary, setExperienceSummary] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: ownerErr } = await supabase
        .from('owner_profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('user_id', user.id);
      if (ownerErr) throw ownerErr;

      if (wantToSit) {
        const rate = dailyRate.trim() ? parseFloat(dailyRate.trim()) : null;
        if (rate !== null && isNaN(rate)) {
          Alert.alert('Error', 'Daily rate must be a number');
          return;
        }
        const { error: sitterErr } = await supabase
          .from('sitter_profiles')
          .upsert({
            user_id: user.id,
            display_name: displayName.trim() || null,
            experience_summary: experienceSummary.trim() || null,
            base_daily_rate: rate,
          }, { onConflict: 'user_id' });
        if (sitterErr) throw sitterErr;
      }

      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.emoji}>🌱</Text>
        <Text style={styles.title}>You're in.</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <View style={styles.steps}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.step, i === 1 && styles.stepActive]} />
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

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>I want to sit plants</Text>
              <Text style={styles.toggleHint}>You can always change this later</Text>
            </View>
            <Switch
              value={wantToSit}
              onValueChange={setWantToSit}
              trackColor={{ false: C.sage, true: C.leaf }}
              thumbColor={C.white}
            />
          </View>

          {wantToSit && (
            <View style={styles.sitterSection}>
              <Text style={styles.sitterTitle}>Sitter details</Text>
              <Text style={styles.fieldLabel}>Your experience</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Tell plant owners about your experience caring for plants..."
                placeholderTextColor={C.stone}
                multiline
                value={experienceSummary}
                onChangeText={setExperienceSummary}
                {...TEXTBOX_SPELLCHECK_PROPS}
              />
              <Text style={styles.fieldLabel}>Daily rate (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 15.00"
                placeholderTextColor={C.stone}
                keyboardType="decimal-pad"
                value={dailyRate}
                onChangeText={setDailyRate}
                {...MACHINE_TEXTBOX_PROPS}
              />
            </View>
          )}

          {loading ? (
            <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Let's go</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.replace('Main')}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: S.lg, paddingVertical: S.xxxl },
  emoji: { textAlign: 'center', fontSize: 52, marginBottom: S.sm },
  title: { ...T.h1, textAlign: 'center', marginBottom: S.xs },
  subtitle: { ...T.body, color: C.stone, textAlign: 'center', fontStyle: 'italic', marginBottom: S.lg },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: S.sm, marginBottom: S.xl },
  step: { width: 24, height: 4, borderRadius: 2, backgroundColor: C.sage },
  stepActive: { backgroundColor: C.amber, width: 32 },
  form: { backgroundColor: C.white, borderRadius: S.card, padding: S.lg, marginBottom: S.xl, ...S.cardShadow },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.sm },
  input: { ...shared.input },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  divider: { height: 1, backgroundColor: C.mist, marginVertical: S.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: S.xs },
  toggleLabel: { ...T.h3, color: C.ink },
  toggleHint: { ...T.caption, marginTop: 2 },
  sitterSection: {
    backgroundColor: C.mist, borderRadius: S.md, padding: S.md,
    marginTop: S.md, borderLeftWidth: 4, borderLeftColor: C.leaf,
  },
  sitterTitle: { ...T.label, color: C.leaf, marginBottom: S.sm },
  button: { ...shared.primaryButton, marginTop: S.lg },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.lg },
  skip: { ...shared.ghostLink },
});
