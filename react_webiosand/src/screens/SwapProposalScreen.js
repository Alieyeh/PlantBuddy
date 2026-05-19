import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

export default function SwapProposalScreen({ route, navigation }) {
  const { listingId, listedPlantId, plantName } = route.params;
  const [plants, setPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        setUserId(user.id);

        const { data, error } = await supabase
          .from('plants')
          .select('id, name, species, health_status')
          .eq('current_owner_user_id', user.id)
          .eq('is_active', true)
          .neq('id', listedPlantId)
          .order('name');

        if (error) throw error;
        setPlants(data ?? []);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load your plants.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [listedPlantId]);

  const handleSubmit = async () => {
    if (!selectedPlantId) {
      Alert.alert('Required', 'Please choose one of your plants to offer.');
      return;
    }

    setSubmitting(true);
    try {
      await listingsService.createSwapProposal({
        listingId,
        proposerOwnerUserId: userId,
        offeredPlantId: selectedPlantId,
        message: message.trim(),
      });
      Alert.alert('Proposal sent', 'The owner can now review your swap offer.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not send the swap proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.contextCard}>
        <Text style={styles.contextLabel}>Proposing a swap for</Text>
        <Text style={styles.contextPlant}>{plantName}</Text>
      </View>

      <Text style={styles.fieldLabel}>Offer one of your plants *</Text>
      {loading ? (
        <ActivityIndicator color={C.amber} style={{ marginVertical: S.md }} />
      ) : plants.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>You need another active plant first.</Text>
          <Text style={styles.emptyBody}>Add one to your collection, then come back to propose a swap.</Text>
        </View>
      ) : (
        <View style={styles.optionsColumn}>
          {plants.map((plant) => {
            const selected = plant.id === selectedPlantId;
            return (
              <TouchableOpacity
                key={plant.id}
                style={[styles.plantOption, selected && styles.plantOptionSelected]}
                onPress={() => setSelectedPlantId(plant.id)}
              >
                <Text style={[styles.plantOptionName, selected && styles.plantOptionNameSelected]}>{plant.name}</Text>
                {plant.species ? <Text style={styles.plantOptionMeta}>{plant.species}</Text> : null}
                {plant.health_status ? <Text style={styles.plantOptionMeta}>{plant.health_status}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.fieldLabel}>Message to owner</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Explain why your plant would make a good trade..."
        placeholderTextColor={C.stone}
        multiline
        value={message}
        onChangeText={setMessage}
      />

      {submitting ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Send swap proposal</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: S.base, paddingBottom: S.xxxl, backgroundColor: C.cream },
  contextCard: { ...shared.card, borderLeftWidth: 4, borderLeftColor: C.amber },
  contextLabel: { ...T.badge, color: C.moss, marginBottom: S.xs },
  contextPlant: { ...T.h2, color: C.forest },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.lg },
  optionsColumn: { gap: S.sm },
  plantOption: { ...shared.card, borderWidth: 1.5, borderColor: C.sage },
  plantOptionSelected: { borderColor: C.leaf, backgroundColor: C.mist },
  plantOptionName: { ...T.h3, color: C.forest },
  plantOptionNameSelected: { color: C.leaf },
  plantOptionMeta: { ...T.caption, color: C.stone, marginTop: 2 },
  input: { ...shared.input },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  button: { ...shared.primaryButton, marginTop: S.xl },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.xl },
  emptyCard: { ...shared.card },
  emptyTitle: { ...T.h3, color: C.forest, marginBottom: S.sm },
  emptyBody: { ...T.body, color: C.stone },
});