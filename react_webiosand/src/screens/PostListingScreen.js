import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { listingsService, LISTING_TYPES } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';
import { buildListingPayload, validateListingForm } from '../utils/listingForm';

const LISTING_MODE_OPTIONS = [
  { value: LISTING_TYPES.SITTING_REQUEST, label: 'Find sitter' },
  { value: LISTING_TYPES.GIFT, label: 'Gift' },
  { value: LISTING_TYPES.SALE, label: 'Sell' },
];

const LISTING_COPY = {
  [LISTING_TYPES.SITTING_REQUEST]: {
    title: 'Find a Sitter',
    subtitle: 'Your sitting request will be visible to plant sitters immediately.',
    cta: 'Post sitting request',
    successTitle: 'Posted!',
    successMessage: 'Your sitting request is now live.',
  },
  [LISTING_TYPES.GIFT]: {
    title: 'Gift a Plant',
    subtitle: 'Offer this plant to a good home in the community.',
    cta: 'Post gift listing',
    successTitle: 'Posted!',
    successMessage: 'Your gift listing is now live.',
  },
  [LISTING_TYPES.SALE]: {
    title: 'Sell a Plant',
    subtitle: 'List your plant for a peer-to-peer sale.',
    cta: 'Post sale listing',
    successTitle: 'Posted!',
    successMessage: 'Your sale listing is now live.',
  },
};

/**
 * Lets an owner publish one of their active plants as a sitting, gift, or sale listing.
 */
export default function PostListingScreen({ route, navigation }) {
  const preselectedPlantId = route.params?.plantId ?? null;

  const [myPlants, setMyPlants] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(preselectedPlantId);
  const [listingType, setListingType] = useState(route.params?.listingType ?? LISTING_TYPES.SITTING_REQUEST);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sittingNotes, setSittingNotes] = useState('');
  const [giftNotes, setGiftNotes] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [currencyCode, setCurrencyCode] = useState('GBP');
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
    const validation = validateListingForm({
      listingType,
      selectedPlantId,
      title,
      startDate,
      endDate,
      salePrice,
      currencyCode,
    });
    if (!validation.valid) {
      Alert.alert(validation.title, validation.message);
      return;
    }

    setLoading(true);
    try {
      await listingsService.createListing(buildListingPayload({
        ownerUserId,
        listingType,
        selectedPlantId,
        title,
        description,
        startDate,
        endDate,
        sittingNotes,
        giftNotes,
        salePrice,
        currencyCode,
      }));
      Alert.alert(LISTING_COPY[listingType].successTitle, LISTING_COPY[listingType].successMessage, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to post listing.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlant = myPlants.find((p) => p.id === selectedPlantId);
  const screenCopy = LISTING_COPY[listingType];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{screenCopy.title}</Text>
        <Text style={styles.subtitle}>{screenCopy.subtitle}</Text>

        <Text style={styles.fieldLabel}>Listing type *</Text>
        <View style={styles.modeRow}>
          {LISTING_MODE_OPTIONS.map((option) => {
            const selected = option.value === listingType;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.modeChip, selected && styles.modeChipSelected]}
                onPress={() => setListingType(option.value)}
              >
                <Text style={[styles.modeChipText, selected && styles.modeChipTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Which plant is this for? *</Text>
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

        {listingType === LISTING_TYPES.SITTING_REQUEST ? (
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
        ) : null}

        <Text style={styles.fieldLabel}>Listing Title *</Text>
        <TextInput
          style={styles.input}
          placeholder={
            listingType === LISTING_TYPES.SITTING_REQUEST
              ? (selectedPlant ? `Sitter needed for ${selectedPlant.name}` : 'e.g. Sitter needed June 1–14')
              : listingType === LISTING_TYPES.GIFT
                ? (selectedPlant ? `${selectedPlant.name} free to a good home` : 'e.g. Free to a good home')
                : (selectedPlant ? `${selectedPlant.name} for sale` : 'e.g. Rooted cutting for sale')
          }
          placeholderTextColor={C.stone}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder={
            listingType === LISTING_TYPES.SITTING_REQUEST
              ? 'Tell sitters about your plant and what you are looking for...'
              : listingType === LISTING_TYPES.GIFT
                ? 'Describe the plant and the kind of new home you want for it...'
                : 'Describe the plant, condition, and anything included in the sale...'
          }
          placeholderTextColor={C.stone}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {listingType === LISTING_TYPES.SITTING_REQUEST ? (
          <>
            <Text style={styles.fieldLabel}>Care notes for sitter</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Anything specific the sitter should know during this period..."
              placeholderTextColor={C.stone}
              multiline
              value={sittingNotes}
              onChangeText={setSittingNotes}
            />
          </>
        ) : null}

        {listingType === LISTING_TYPES.GIFT ? (
          <>
            <Text style={styles.fieldLabel}>Gift notes</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Pickup preference, urgency, or anything a recipient should know..."
              placeholderTextColor={C.stone}
              multiline
              value={giftNotes}
              onChangeText={setGiftNotes}
            />
          </>
        ) : null}

        {listingType === LISTING_TYPES.SALE ? (
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>Sale details *</Text>
            <View style={styles.dateRow}>
              <View style={{ flex: 1, marginRight: S.sm }}>
                <Text style={styles.fieldLabel}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15.00"
                  placeholderTextColor={C.stone}
                  value={salePrice}
                  onChangeText={setSalePrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 90 }}>
                <Text style={styles.fieldLabel}>Currency</Text>
                <TextInput
                  style={styles.input}
                  placeholder="GBP"
                  placeholderTextColor={C.stone}
                  value={currencyCode}
                  onChangeText={setCurrencyCode}
                  autoCapitalize="characters"
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePost} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{screenCopy.cta}</Text>
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
  modeRow: { flexDirection: 'row', marginBottom: S.sm },
  modeChip: {
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.sage,
    borderRadius: S.chip, paddingHorizontal: S.md, paddingVertical: S.sm,
    marginRight: S.sm,
  },
  modeChipSelected: { backgroundColor: C.mist, borderColor: C.leaf },
  modeChipText: { ...T.label, color: C.slate },
  modeChipTextSelected: { color: C.forest },
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
