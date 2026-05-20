import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { api } from '../api/apiService';
import { C, T, S, shared } from '../lib/theme';
import {
  MACHINE_TEXTBOX_PROPS,
  SHORT_TEXTBOX_SUGGESTION_PROPS,
  TEXTBOX_SPELLCHECK_PROPS,
} from '../utils/textInputProps';

const parseInteger = (val) => {
  if (!val || val.trim() === '') return null;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? null : n;
};

function SectionDivider({ label }) {
  return (
    <View style={sectionStyles.row}>
      <View style={sectionStyles.line} />
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.line} />
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: S.lg },
  line: { flex: 1, height: 1, backgroundColor: C.mist },
  label: { ...T.caption, color: C.moss, paddingHorizontal: S.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
});

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
    if (!name.trim()) {
      Alert.alert('Required', 'Please give your plant a name.');
      return;
    }

    const plantData = {
      name: name.trim(),
      species: species.trim() || null,
      description: description.trim() || null,
      location_notes: locationNotes.trim() || null,
      size_description: sizeDescription.trim() || null,
      health_status: healthStatus.trim() || null,
      light_requirements: lightRequirements.trim() || null,
      humidity_requirements: humidityRequirements.trim() || null,
      watering_frequency_days: parseInteger(wateringFrequency),
      special_instructions: specialInstructions.trim() || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.updatePlant(existing.id, plantData);
        Alert.alert('Saved', 'Plant updated successfully.');
      } else {
        await api.createPlant(plantData);
        Alert.alert('Added', 'Your plant has been added.');
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionDivider label="Identity" />

        <Text style={styles.fieldLabel}>Name *</Text>
        <TextInput style={styles.input} placeholder="e.g. Gerald" placeholderTextColor={C.stone} value={name} onChangeText={setName} {...SHORT_TEXTBOX_SUGGESTION_PROPS} />

        <Text style={styles.fieldLabel}>Species</Text>
        <TextInput style={styles.input} placeholder="e.g. Monstera deliciosa" placeholderTextColor={C.stone} value={species} onChangeText={setSpecies} {...SHORT_TEXTBOX_SUGGESTION_PROPS} />

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput style={[styles.input, styles.multiline]} placeholder="Personality, history, quirks..." placeholderTextColor={C.stone} multiline value={description} onChangeText={setDescription} {...TEXTBOX_SPELLCHECK_PROPS} />

        <SectionDivider label="Physical" />

        <Text style={styles.fieldLabel}>Location / Room</Text>
        <TextInput style={styles.input} placeholder="e.g. East-facing living room window" placeholderTextColor={C.stone} value={locationNotes} onChangeText={setLocationNotes} {...TEXTBOX_SPELLCHECK_PROPS} />

        <Text style={styles.fieldLabel}>Size</Text>
        <TextInput style={styles.input} placeholder="e.g. Medium, about 60cm tall" placeholderTextColor={C.stone} value={sizeDescription} onChangeText={setSizeDescription} {...TEXTBOX_SPELLCHECK_PROPS} />

        <Text style={styles.fieldLabel}>Health Status</Text>
        <TextInput style={styles.input} placeholder="e.g. Healthy, new growth appearing" placeholderTextColor={C.stone} value={healthStatus} onChangeText={setHealthStatus} {...TEXTBOX_SPELLCHECK_PROPS} />

        <SectionDivider label="Care" />

        <Text style={styles.fieldLabel}>Watering Frequency (days)</Text>
        <TextInput style={styles.input} placeholder="e.g. 7" placeholderTextColor={C.stone} keyboardType="numeric" value={wateringFrequency} onChangeText={setWateringFrequency} {...MACHINE_TEXTBOX_PROPS} />

        <Text style={styles.fieldLabel}>Light Requirements</Text>
        <TextInput style={styles.input} placeholder="e.g. Bright indirect light" placeholderTextColor={C.stone} value={lightRequirements} onChangeText={setLightRequirements} {...TEXTBOX_SPELLCHECK_PROPS} />

        <Text style={styles.fieldLabel}>Humidity Requirements</Text>
        <TextInput style={styles.input} placeholder="e.g. High humidity, mist weekly" placeholderTextColor={C.stone} value={humidityRequirements} onChangeText={setHumidityRequirements} {...TEXTBOX_SPELLCHECK_PROPS} />

        <Text style={styles.fieldLabel}>Special Instructions</Text>
        <TextInput style={[styles.input, styles.multiline, styles.specialInput]} placeholder="Anything a sitter must know..." placeholderTextColor={C.stone} multiline value={specialInstructions} onChangeText={setSpecialInstructions} {...TEXTBOX_SPELLCHECK_PROPS} />

        {loading ? (
          <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{isEdit ? 'Save changes' : 'Add plant'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: S.base, paddingBottom: S.xxxl, backgroundColor: C.cream },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.xs },
  input: { ...shared.input },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  specialInput: {
    borderColor: C.amberLight,
    backgroundColor: '#fffaf7',
  },
  button: { ...shared.primaryButton, marginTop: S.xl },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.xl },
});
