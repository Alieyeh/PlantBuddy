import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';

const TODAY = new Date().toISOString().split('T')[0];

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

  const validateDate = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val);

  const handlePost = async () => {
    if (!selectedPlantId) {
      Alert.alert('Required', 'Please select a plant.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Required', 'Please add a listing title.');
      return;
    }
    if (!validateDate(startDate) || !validateDate(endDate)) {
      Alert.alert('Invalid dates', 'Use YYYY-MM-DD format (e.g. 2026-06-01).');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Invalid dates', 'End date must be on or after start date.');
      return;
    }
    if (startDate < TODAY) {
      Alert.alert('Invalid dates', 'Start date cannot be in the past.');
      return;
    }

    setLoading(true);
    try {
      await listingsService.createSittingRequest({
        plantId: selectedPlantId,
        ownerUserId,
        title: title.trim(),
        description: description.trim() || null,
        startDate,
        endDate,
        sittingNotes: sittingNotes.trim() || null,
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Post a Sitting Request</Text>
        <Text style={styles.subtitle}>Find someone to care for your plant while you're away.</Text>

        <Text style={styles.label}>Which plant needs a sitter? *</Text>
        {loadingPlants ? (
          <ActivityIndicator color="#4CAF50" style={{ marginVertical: 12 }} />
        ) : myPlants.length === 0 ? (
          <View style={styles.noPlants}>
            <Text style={styles.noPlantsText}>You have no plants yet.</Text>
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

        <Text style={styles.label}>Listing Title *</Text>
        <TextInput
          style={styles.input}
          placeholder={selectedPlant ? `Sitter needed for ${selectedPlant.name}` : 'e.g. Sitter needed June 1–14'}
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell sitters about your plant and what you're looking for..."
          placeholderTextColor="#999"
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Start Date * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-06-01"
          placeholderTextColor="#999"
          value={startDate}
          onChangeText={setStartDate}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.label}>End Date * (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2026-06-14"
          placeholderTextColor="#999"
          value={endDate}
          onChangeText={setEndDate}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.label}>Care Notes for Sitter</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Anything specific the sitter should know during this period..."
          placeholderTextColor="#999"
          multiline
          value={sittingNotes}
          onChangeText={setSittingNotes}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePost}>
            <Text style={styles.buttonText}>Post Sitting Request</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f5f5f5', paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2e7d32', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  plantPicker: { flexDirection: 'row', marginBottom: 4 },
  plantChip: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  plantChipSelected: { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
  plantChipName: { fontSize: 14, fontWeight: '600', color: '#444' },
  plantChipNameSelected: { color: '#2e7d32' },
  plantChipSpecies: { fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 2 },
  plantChipSpeciesSelected: { color: '#558b2f' },
  noPlants: { backgroundColor: '#fff', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 8 },
  noPlantsText: { fontSize: 14, color: '#888', marginBottom: 8 },
  noPlantsLink: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loader: { marginVertical: 24 },
});
