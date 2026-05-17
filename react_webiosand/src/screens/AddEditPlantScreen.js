import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../api/apiService';
import { buildPlantPayload, validatePlantForm } from '../utils/plantForm';

/**
 * Screen for creating or editing the current user's plant profile. The UI keeps
 * friendly camelCase state, then normalizes it into Supabase columns on save.
 */
export default function AddEditPlantScreen({ route, navigation }) {
  const existing = route.params?.plant;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState(existing?.species ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [locationNotes, setLocationNotes] = useState(existing?.location_notes ?? '');
  const [sizeDescription, setSizeDescription] = useState(existing?.size_description ?? '');
  const [healthStatus, setHealthStatus] = useState(existing?.health_status ?? '');
  const [lightRequirements, setLightRequirements] = useState(existing?.light_requirements ?? '');
  const [humidityRequirements, setHumidityRequirements] = useState(existing?.humidity_requirements ?? '');
  const [wateringFrequency, setWateringFrequency] = useState(
    existing?.watering_frequency_days != null ? String(existing.watering_frequency_days) : ''
  );
  const [specialInstructions, setSpecialInstructions] = useState(existing?.special_instructions ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const form = {
      name,
      species,
      description,
      locationNotes,
      sizeDescription,
      healthStatus,
      lightRequirements,
      humidityRequirements,
      wateringFrequency,
      specialInstructions,
    };
    const validation = validatePlantForm(form);

    if (!validation.valid) {
      Alert.alert(validation.title, validation.message);
      return;
    }

    const plantData = buildPlantPayload(form);

    setLoading(true);
    try {
      if (isEdit) {
        await api.updatePlant(existing.id, plantData);
        Alert.alert('Success', 'Plant updated');
      } else {
        await api.createPlant(plantData);
        Alert.alert('Success', 'Plant added');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save plant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEdit ? 'Edit Plant' : 'Add Plant'}</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Gerald" placeholderTextColor="#999" value={name} onChangeText={setName} />

        <Text style={styles.label}>Species</Text>
        <TextInput style={styles.input} placeholder="e.g. Monstera deliciosa" placeholderTextColor="#999" value={species} onChangeText={setSpecies} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Personality, history, quirks..." placeholderTextColor="#999" multiline value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Location / Room</Text>
        <TextInput style={styles.input} placeholder="e.g. Lives in the living room, east window" placeholderTextColor="#999" value={locationNotes} onChangeText={setLocationNotes} />

        <Text style={styles.label}>Size</Text>
        <TextInput style={styles.input} placeholder="e.g. Medium, about 60cm tall" placeholderTextColor="#999" value={sizeDescription} onChangeText={setSizeDescription} />

        <Text style={styles.label}>Health Status</Text>
        <TextInput style={styles.input} placeholder="e.g. Healthy, new growth appearing" placeholderTextColor="#999" value={healthStatus} onChangeText={setHealthStatus} />

        <Text style={styles.label}>Light Requirements</Text>
        <TextInput style={styles.input} placeholder="e.g. Bright indirect light" placeholderTextColor="#999" value={lightRequirements} onChangeText={setLightRequirements} />

        <Text style={styles.label}>Humidity Requirements</Text>
        <TextInput style={styles.input} placeholder="e.g. High humidity, mist weekly" placeholderTextColor="#999" value={humidityRequirements} onChangeText={setHumidityRequirements} />

        <Text style={styles.label}>Watering Frequency (days)</Text>
        <TextInput style={styles.input} placeholder="e.g. 7" placeholderTextColor="#999" keyboardType="numeric" value={wateringFrequency} onChangeText={setWateringFrequency} />

        <Text style={styles.label}>Special Instructions</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Anything a sitter must know..." placeholderTextColor="#999" multiline value={specialInstructions} onChangeText={setSpecialInstructions} />

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Plant</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f5f5f5', paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2e7d32', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, marginBottom: 4, borderWidth: 1, borderColor: '#ddd', color: '#333',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#4CAF50', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loader: { marginVertical: 24 },
});
