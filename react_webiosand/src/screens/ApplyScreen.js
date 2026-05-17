import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { listingsService } from '../api/listingsService';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
};

export default function ApplyScreen({ route, navigation }) {
  const { listingId, plantName, sittingStart, sittingEnd } = route.params;

  const [message, setMessage] = useState('');
  const [proposedStart, setProposedStart] = useState(sittingStart ?? '');
  const [proposedEnd, setProposedEnd] = useState(sittingEnd ?? '');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (proposedStart && !DATE_RE.test(proposedStart)) { Alert.alert('Error', 'Start date must be YYYY-MM-DD'); return; }
    if (proposedEnd && !DATE_RE.test(proposedEnd)) { Alert.alert('Error', 'End date must be YYYY-MM-DD'); return; }
    if (proposedStart && proposedEnd && proposedEnd < proposedStart) { Alert.alert('Error', 'End date must be on or after start date'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await listingsService.applyToListing({
        listingId, applicantUserId: user.id,
        message: message.trim(),
        proposedStartDate: proposedStart || null,
        proposedEndDate: proposedEnd || null,
      });

      Alert.alert(
        'Application sent!',
        'The plant owner will review your application and get back to you.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      if (err.code === '23505') {
        Alert.alert('Already applied', 'You have already applied to this listing.');
      } else {
        Alert.alert('Error', err.message || 'Could not submit application');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Context card */}
        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>Applying to sit</Text>
          <Text style={styles.contextPlant}>{plantName}</Text>
          {(sittingStart || sittingEnd) && (
            <Text style={styles.contextDates}>
              {formatDate(sittingStart)} → {formatDate(sittingEnd)}
            </Text>
          )}
        </View>

        <Text style={styles.fieldLabel}>Message to owner</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell the owner about yourself and why you'd be a great caregiver for this plant..."
          placeholderTextColor={C.stone}
          multiline
          value={message}
          onChangeText={setMessage}
        />

        <View style={styles.datesCard}>
          <Text style={styles.datesCardLabel}>Your proposed dates</Text>
          <Text style={styles.datesCardHint}>Pre-filled from the listing — change if you need different dates.</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1, marginRight: S.sm }}>
              <Text style={styles.fieldLabel}>Start (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-06-01"
                placeholderTextColor={C.stone}
                value={proposedStart}
                onChangeText={setProposedStart}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>End (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-06-14"
                placeholderTextColor={C.stone}
                value={proposedEnd}
                onChangeText={setProposedEnd}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleApply} activeOpacity={0.85}>
            <Text style={styles.buttonText}>✉ Send application</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: S.base, paddingTop: S.base, paddingBottom: S.xxxl, backgroundColor: C.cream },
  contextCard: {
    backgroundColor: C.white, borderRadius: S.card,
    padding: S.base, marginBottom: S.lg,
    borderLeftWidth: 4, borderLeftColor: C.amber,
    ...S.cardShadow,
  },
  contextLabel: { ...T.badge, color: C.moss, marginBottom: S.xs },
  contextPlant: { ...T.h2, color: C.forest },
  contextDates: { ...T.caption, color: C.stone, marginTop: S.xs },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.sm },
  input: { ...shared.input },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  datesCard: {
    backgroundColor: C.white, borderRadius: S.card,
    padding: S.base, marginTop: S.lg, ...S.cardShadow,
  },
  datesCardLabel: { ...T.h3, color: C.forest, marginBottom: S.xs },
  datesCardHint: { ...T.caption, color: C.stone, marginBottom: S.sm },
  dateRow: { flexDirection: 'row' },
  button: { ...shared.primaryButton, marginTop: S.xl },
  buttonText: { ...shared.primaryButtonText, fontSize: 17 },
  loader: { marginVertical: S.xl },
});
