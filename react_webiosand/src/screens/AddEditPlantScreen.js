import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../api/apiService';

const parseInteger = (val) => {
  if (!val || val.trim() === '') return null;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? null : n;
};

export default function AddEditPlantScreen({ route, navigation }) {
  const existing = route.params?.plant;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState(existing?.species ?? '');
  const [room, setRoom] = useState(existing?.room ?? '');
  const [careNotes, setCareNotes] = useState(existing?.careNotes ?? '');
  const [lightRequirement, setLightRequirement] = useState(existing?.lightRequirement ?? '');
  const [waterFreq, setWaterFreq] = useState(existing?.wateringFrequencyDays != null ? String(existing.wateringFrequencyDays) : '');
  const [waterVol, setWaterVol] = useState(existing?.wateringVolumeMl != null ? String(existing.wateringVolumeMl) : '');
  const [quirk, setQuirk] = useState(existing?.quirk ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Plant name is required');
      return;
    }
    const plantData = {
      name: name.trim(),
      species: species.trim() || null,
      profileImageUrl: null,
      room: room.trim() || null,
      careNotes: careNotes.trim() || null,
      lightRequirement: lightRequirement.trim() || null,
      wateringFrequencyDays: parseInteger(waterFreq),
      wateringVolumeMl: parseInteger(waterVol),
      preferredTemperatureC: null,
      heightCm: null,
      widthCm: null,
      weightG: null,
      quirk: quirk.trim() || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.updatePlant(existing.id, plantData);
        Alert.alert('Success', 'Plant updated');
      } else {
        await api.createPlant(plantData);
        Alert.alert('Success', 'Plant saved');
      }
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save plant';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEdit ? 'Edit Plant' : 'Add Plant'}</Text>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Monstera" placeholderTextColor="#999" value={name} onChangeText={setName} />

        <Text style={styles.label}>Species</Text>
        <TextInput style={styles.input} placeholder="e.g. Monstera deliciosa" placeholderTextColor="#999" value={species} onChangeText={setSpecies} />

        <Text style={styles.label}>Room / Location</Text>
        <TextInput style={styles.input} placeholder="e.g. Living Room" placeholderTextColor="#999" value={room} onChangeText={setRoom} />

        <Text style={styles.label}>Care Notes</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Any care instructions..." placeholderTextColor="#999" multiline value={careNotes} onChangeText={setCareNotes} />

        <Text style={styles.label}>Light Requirement</Text>
        <TextInput style={styles.input} placeholder="e.g. Bright indirect light" placeholderTextColor="#999" value={lightRequirement} onChangeText={setLightRequirement} />

        <Text style={styles.label}>Watering Frequency (days)</Text>
        <TextInput style={styles.input} placeholder="e.g. 7" placeholderTextColor="#999" keyboardType="numeric" value={waterFreq} onChangeText={setWaterFreq} />

        <Text style={styles.label}>Watering Volume (ml)</Text>
        <TextInput style={styles.input} placeholder="e.g. 250" placeholderTextColor="#999" keyboardType="numeric" value={waterVol} onChangeText={setWaterVol} />

        <Text style={styles.label}>Quirks</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Any special notes..." placeholderTextColor="#999" multiline value={quirk} onChangeText={setQuirk} />

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
