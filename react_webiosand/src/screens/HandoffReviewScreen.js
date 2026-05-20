import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';
import { TEXTBOX_SPELLCHECK_PROPS } from '../utils/textInputProps';

export default function HandoffReviewScreen({ route, navigation }) {
  const { handoffId, revieweeUserId, revieweeLabel } = route.params;
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await listingsService.createListingHandoffReview({
        handoffId,
        reviewerUserId: user.id,
        revieweeUserId,
        rating,
        reviewText: reviewText.trim(),
      });

      Alert.alert('Review submitted', 'Thanks for rating this exchange.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not submit your review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Review {revieweeLabel}</Text>
        <Text style={styles.subtitle}>Rate how the handoff went and add any useful context.</Text>

        <Text style={styles.fieldLabel}>Rating</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = value === rating;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.ratingPill, selected && styles.ratingPillSelected]}
                onPress={() => setRating(value)}
              >
                <Text style={[styles.ratingPillText, selected && styles.ratingPillTextSelected]}>{value}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Review</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Helpful, careful, communicative, smooth pickup..."
          placeholderTextColor={C.stone}
          multiline
          value={reviewText}
          onChangeText={setReviewText}
          {...TEXTBOX_SPELLCHECK_PROPS}
        />

        {loading ? (
          <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Submit review</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream, padding: S.base },
  card: { ...shared.card },
  title: { ...T.h2, color: C.forest },
  subtitle: { ...T.body, color: C.stone, marginTop: S.xs, marginBottom: S.lg },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.sm },
  ratingRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.md },
  ratingPill: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.sage,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.white,
  },
  ratingPillSelected: { backgroundColor: C.amber, borderColor: C.amber },
  ratingPillText: { ...T.label, color: C.forest },
  ratingPillTextSelected: { color: C.white },
  input: { ...shared.input },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  button: { ...shared.primaryButton, marginTop: S.lg },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.xl },
});
