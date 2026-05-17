import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

const TODAY = new Date().toISOString().slice(0, 10);
const validateDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);

/**
 * Lets an owner publish one of their active plants as an open sitting request.
 * The form currently supports the MVP sitting flow only.
 */
export default function PostListingScreen({ route, navigation }) {
  const preselectedPlantId = route.params?.plantId ?? null;

  const [myPlants, setMyPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(preselectedPlantId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sittingNotes, setSittingNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [ownerUserId, setOwnerUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setOwnerUserId(user.id);
      const { data, error } = await supabase
        .from('plants')
        .select('id, name, species')
        .eq('current_owner_user_id', user.id)
        .eq('is_active', true)
        .order('name');
      if (!error) setMyPlants(data ?? []);
      setLoadingPlants(false);
    };
    init();
  }, []);

  const handlePost = async () => {
    if (!selectedPlantId) { Alert.alert('Required', 'Please select a plant.'); return; }
    if (!title.trim()) { Alert.alert('Required', 'Please add a listing title.'); return; }
    if (!validateDate(startDate) || !validateDate(endDate)) {
      Alert.alert('Invalid dates', 'Use YYYY-MM-DD format (e.g. 2026-06-01).'); return;
    }
    if (endDate < startDate) { Alert.alert('Invalid dates', 'End date must be on or after start date.'); return; }
    if (startDate < TODAY) { Alert.alert('Invalid dates', 'Start date cannot be in the past.'); return; }

    setLoading(true);
    try {
      await listingsService.createSittingRequest({
        plantId: selectedPlantId, ownerUserId,
        title: title.trim(), description: description.trim() || null,
        startDate, endDate, sittingNotes: sittingNotes.trim() || null,
      });
      Alert.alert('Posted!', 'Your sitting request is now live.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post listing.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlant = myPlants.find((p) => p.id === selectedPlantId);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Find a Sitter</Text>
        <Text style={styles.subtitle}>Your listing will be visible to all sitters immediately.</Text>

        <Text style={styles.fieldLabel}>Which plant needs a sitter? *</Text>
        {loadingPlants ? (
          <ActivityIndicator color={C.amber} style={{ marginVertical: S.md }} />
        ) : myPlants.length === 0 ? (
          <View style={styles.noPlants}>
            <Text style={styles.noPlantsText}>You haven't added any plants yet.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddEditPlant', {})}>
              <Text style={styles.noPlantsLink}>Add your first plant →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantPicker}>
            {myPlants.map((plant) => {
              const selected = plant.id === selectedPlantId;
              return (
                <TouchableOpacity
                  key={plant.id}
                  style={[styles.plantChip, selected && styles.plantChipSelected]}
                  onPress={() => setSelectedPlantId(plant.id)}
                >
                  <Text style={[styles.plantChipName, selected && styles.plantChipNameSelected]}>
                    {plant.name}
                  </Text>
                  {plant.species ? (
                    <Text style={[styles.plantChipSpecies, selected && styles.plantChipSpeciesSelected]}>
                      {plant.species}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Sitting period *</Text>
          <View style={styles.dateRow}>
            <View style={{ flex: 1, marginRight: S.sm }}>
              <Text style={styles.fieldLabel}>Start (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-06-01"
                placeholderTextColor={C.stone}
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>End (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-06-14"
                placeholderTextColor={C.stone}
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Listing Title *</Text>
        <TextInput
          style={styles.input}
          placeholder={selectedPlant ? `Sitter needed for ${selectedPlant.name}` : 'e.g. Sitter needed June 1–14'}
          placeholderTextColor={C.stone}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell sitters about your plant and what you're looking for..."
          placeholderTextColor={C.stone}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.fieldLabel}>Care notes for sitter</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Anything specific the sitter should know during this period..."
          placeholderTextColor={C.stone}
          multiline
          value={sittingNotes}
          onChangeText={setSittingNotes}
        />

        {loading ? (
          <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePost} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Post sitting request</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: S.base, paddingBottom: S.xxxl, paddingTop: S.base, backgroundColor: C.cream },
  title: { ...T.h1, marginBottom: S.xs },
  subtitle: { ...T.caption, color: C.stone, marginBottom: S.xl },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.md },
  input: { ...shared.input },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  plantPicker: { flexDirection: 'row', marginBottom: S.xs },
  plantChip: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.sage,
    borderRadius: S.card, paddingHorizontal: S.md, paddingVertical: S.sm,
    marginRight: S.sm, minWidth: 90, alignItems: 'center',
  },
  plantChipSelected: { borderColor: C.leaf, backgroundColor: C.mist },
  plantChipName: { ...T.label, color: C.slate },
  plantChipNameSelected: { color: C.forest },
  plantChipSpecies: { ...T.caption, fontStyle: 'italic', marginTop: 2 },
  plantChipSpeciesSelected: { color: C.moss },
  card: { backgroundColor: C.white, borderRadius: S.card, padding: S.base, marginTop: S.md, ...S.cardShadow },
  cardSectionLabel: { ...T.label, color: C.moss, marginBottom: S.sm },
  dateRow: { flexDirection: 'row' },
  noPlants: { backgroundColor: C.white, borderRadius: S.md, padding: S.base, alignItems: 'center', marginBottom: S.sm, ...S.cardShadow },
  noPlantsText: { ...T.body, color: C.stone, marginBottom: S.sm },
  noPlantsLink: { ...T.label, color: C.amber },
  button: { ...shared.primaryButton, marginTop: S.xl },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.xl },
});
