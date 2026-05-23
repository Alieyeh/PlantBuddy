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

function PlantSketch() {
  return (
    <View style={styles.plantSketch} accessible accessibilityLabel="Decorative plant illustration">
      <View style={styles.sketchGlow} />
      <View style={[styles.sketchLeaf, styles.sketchLeafLeft]} />
      <View style={[styles.sketchLeaf, styles.sketchLeafCenter]} />
      <View style={[styles.sketchLeaf, styles.sketchLeafRight]} />
      <View style={styles.sketchStem} />
      <View style={styles.sketchPotLip} />
      <View style={styles.sketchPot} />
    </View>
  );
}

function FormHero({ isEdit }) {
  return (
    <View style={styles.heroPanel}>
      <View style={styles.heroPattern}>
        <View style={[styles.patternLeaf, styles.patternLeafOne]} />
        <View style={[styles.patternLeaf, styles.patternLeafTwo]} />
        <View style={[styles.patternLeaf, styles.patternLeafThree]} />
      </View>
      <View style={styles.heroText}>
        <Text style={styles.heroKicker}>{isEdit ? 'Plant profile' : 'New plant profile'}</Text>
        <Text style={styles.heroTitle}>{isEdit ? 'Refresh the details' : 'Add a leafy friend'}</Text>
        <Text style={styles.heroBody}>
          Capture the little care details that make matching, sitting, swapping, and gifting feel easier later.
        </Text>
      </View>
      <PlantSketch />
    </View>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function CarePreview({ wateringFrequency, lightRequirements, humidityRequirements }) {
  const careItems = [
    { label: 'Water', value: wateringFrequency ? `Every ${wateringFrequency} days` : 'Not set', color: C.leaf },
    { label: 'Light', value: lightRequirements || 'Not set', color: C.amber },
    { label: 'Humidity', value: humidityRequirements || 'Not set', color: C.moss },
  ];

  return (
    <View style={styles.carePreview}>
      {careItems.map((item) => (
        <View key={item.label} style={styles.carePreviewTile}>
          <View style={[styles.carePreviewAccent, { backgroundColor: item.color }]} />
          <Text style={styles.carePreviewLabel}>{item.label}</Text>
          <Text style={styles.carePreviewValue}>{item.value}</Text>
        </View>
      ))}
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
        <FormHero isEdit={isEdit} />

        <SectionDivider label="Identity" />
        <FormSection title="Plant identity" subtitle="Start with the basics people will recognize in browse and exchange flows.">
          <Text style={styles.fieldLabel}>Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Gerald" placeholderTextColor={C.stone} value={name} onChangeText={setName} {...SHORT_TEXTBOX_SUGGESTION_PROPS} />

          <Text style={styles.fieldLabel}>Species</Text>
          <TextInput style={styles.input} placeholder="e.g. Monstera deliciosa" placeholderTextColor={C.stone} value={species} onChangeText={setSpecies} {...SHORT_TEXTBOX_SUGGESTION_PROPS} />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput style={[styles.input, styles.multiline]} placeholder="Personality, history, quirks..." placeholderTextColor={C.stone} multiline value={description} onChangeText={setDescription} {...TEXTBOX_SPELLCHECK_PROPS} />
        </FormSection>

        <SectionDivider label="Physical" />
        <FormSection title="Home and condition" subtitle="Helpful context for sitters, buyers, and swap partners.">
          <Text style={styles.fieldLabel}>Location / Room</Text>
          <TextInput style={styles.input} placeholder="e.g. East-facing living room window" placeholderTextColor={C.stone} value={locationNotes} onChangeText={setLocationNotes} {...TEXTBOX_SPELLCHECK_PROPS} />

          <Text style={styles.fieldLabel}>Size</Text>
          <TextInput style={styles.input} placeholder="e.g. Medium, about 60cm tall" placeholderTextColor={C.stone} value={sizeDescription} onChangeText={setSizeDescription} {...TEXTBOX_SPELLCHECK_PROPS} />

          <Text style={styles.fieldLabel}>Health Status</Text>
          <TextInput style={styles.input} placeholder="e.g. Healthy, new growth appearing" placeholderTextColor={C.stone} value={healthStatus} onChangeText={setHealthStatus} {...TEXTBOX_SPELLCHECK_PROPS} />
        </FormSection>

        <SectionDivider label="Care" />
        <FormSection title="Care rhythm" subtitle="These fields become the quick care snapshot on plant and listing detail pages.">
          <CarePreview
            wateringFrequency={wateringFrequency}
            lightRequirements={lightRequirements}
            humidityRequirements={humidityRequirements}
          />

          <Text style={styles.fieldLabel}>Watering Frequency (days)</Text>
          <TextInput style={styles.input} placeholder="e.g. 7" placeholderTextColor={C.stone} keyboardType="numeric" value={wateringFrequency} onChangeText={setWateringFrequency} {...MACHINE_TEXTBOX_PROPS} />

          <Text style={styles.fieldLabel}>Light Requirements</Text>
          <TextInput style={styles.input} placeholder="e.g. Bright indirect light" placeholderTextColor={C.stone} value={lightRequirements} onChangeText={setLightRequirements} {...TEXTBOX_SPELLCHECK_PROPS} />

          <Text style={styles.fieldLabel}>Humidity Requirements</Text>
          <TextInput style={styles.input} placeholder="e.g. High humidity, mist weekly" placeholderTextColor={C.stone} value={humidityRequirements} onChangeText={setHumidityRequirements} {...TEXTBOX_SPELLCHECK_PROPS} />

          <Text style={styles.fieldLabel}>Special Instructions</Text>
          <TextInput style={[styles.input, styles.multiline, styles.specialInput]} placeholder="Anything a sitter must know..." placeholderTextColor={C.stone} multiline value={specialInstructions} onChangeText={setSpecialInstructions} {...TEXTBOX_SPELLCHECK_PROPS} />
        </FormSection>

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
  container: { paddingHorizontal: S.base, paddingTop: S.base, paddingBottom: S.xxxl, backgroundColor: C.cream },
  heroPanel: {
    backgroundColor: '#fffaf7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.amberLight,
    padding: S.lg,
    marginBottom: S.md,
    minHeight: 176,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.base,
    ...S.cardShadowElevated,
  },
  heroPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  patternLeaf: {
    position: 'absolute',
    width: 20,
    height: 34,
    backgroundColor: '#dfead8',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 22,
  },
  patternLeafOne: { right: 28, top: 18, transform: [{ rotate: '34deg' }] },
  patternLeafTwo: { right: 92, top: 40, transform: [{ rotate: '-30deg' }] },
  patternLeafThree: { left: 18, bottom: 16, transform: [{ rotate: '24deg' }] },
  heroText: { flex: 1, minWidth: 190 },
  heroKicker: { ...T.badge, color: C.moss, marginBottom: S.xs },
  heroTitle: { ...T.hero, fontSize: 32, lineHeight: 38 },
  heroBody: { ...T.body, color: C.slate, marginTop: S.sm, maxWidth: 440 },
  plantSketch: {
    width: 118,
    height: 128,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  sketchGlow: {
    position: 'absolute',
    width: 110,
    height: 86,
    bottom: 12,
    borderRadius: 44,
    backgroundColor: '#f7e5d4',
    borderWidth: 1,
    borderColor: '#f2cfb6',
  },
  sketchLeaf: {
    position: 'absolute',
    width: 35,
    height: 54,
    backgroundColor: C.leaf,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderColor: C.forest,
  },
  sketchLeafLeft: { left: 16, top: 26, transform: [{ rotate: '-36deg' }], backgroundColor: C.moss },
  sketchLeafCenter: { left: 43, top: 8, height: 62, transform: [{ rotate: '-4deg' }] },
  sketchLeafRight: { right: 14, top: 28, transform: [{ rotate: '36deg' }], backgroundColor: C.sage },
  sketchStem: {
    width: 6,
    height: 54,
    backgroundColor: C.moss,
    borderRadius: 6,
    marginBottom: -5,
  },
  sketchPotLip: {
    width: 64,
    height: 14,
    backgroundColor: C.amber,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  sketchPot: {
    width: 52,
    height: 36,
    backgroundColor: C.terracotta,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  formSection: {
    backgroundColor: C.white,
    borderRadius: S.card,
    borderWidth: 1,
    borderColor: C.mist,
    padding: S.base,
    marginBottom: S.md,
    ...S.cardShadow,
  },
  sectionHeader: {
    borderLeftWidth: 4,
    borderLeftColor: C.amber,
    paddingLeft: S.md,
    marginBottom: S.md,
  },
  sectionTitle: { ...T.h3, color: C.forest },
  sectionSubtitle: { ...T.caption, color: C.stone, marginTop: 2 },
  fieldLabel: { ...T.label, marginBottom: S.xs, marginTop: S.xs },
  input: { ...shared.input },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  carePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: S.sm,
    marginBottom: S.md,
  },
  carePreviewTile: {
    flexGrow: 1,
    flexBasis: 136,
    minHeight: 78,
    backgroundColor: '#fffaf7',
    borderRadius: S.md,
    borderWidth: 1,
    borderColor: C.amberLight,
    padding: S.md,
  },
  carePreviewAccent: {
    width: 32,
    height: 4,
    borderRadius: 999,
    marginBottom: S.sm,
  },
  carePreviewLabel: { ...T.caption, color: C.stone, fontWeight: '700', textTransform: 'uppercase' },
  carePreviewValue: { ...T.label, color: C.forest, marginTop: 3 },
  specialInput: {
    borderColor: C.amberLight,
    backgroundColor: '#fffaf7',
  },
  button: { ...shared.primaryButton, marginTop: S.xl },
  buttonText: { ...shared.primaryButtonText },
  loader: { marginVertical: S.xl },
});
