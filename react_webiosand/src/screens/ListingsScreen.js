import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listingsService, LISTING_TYPES } from '../api/listingsService';
import {
  BROWSE_SORT_OPTIONS,
  BROWSE_TYPE_FILTERS,
  filterAndSortListings,
} from '../utils/browseListings';
import { formatWateringFrequency } from '../utils/plantForm';
import { SEARCH_TEXTBOX_SUGGESTION_PROPS } from '../utils/textInputProps';
import { C, T, S } from '../lib/theme';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
};

function MetaChip({ label }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const TYPE_META = {
  [LISTING_TYPES.SITTING_REQUEST]: { label: 'Needs sitter', bg: C.amberLight, text: C.clay, border: C.amber },
  [LISTING_TYPES.GIFT]: { label: 'Gift', bg: C.mist, text: C.forest, border: C.sage },
  [LISTING_TYPES.SALE]: { label: 'For sale', bg: '#f6e8dd', text: C.terracotta, border: C.amber },
  [LISTING_TYPES.SWAP]: { label: 'Swap', bg: C.parchment, text: C.moss, border: C.sage },
};

const TYPE_FILTER_OPTIONS = [
  { value: BROWSE_TYPE_FILTERS.ALL, label: 'All' },
  { value: BROWSE_TYPE_FILTERS.SITTING_REQUEST, label: 'Sitting' },
  { value: BROWSE_TYPE_FILTERS.GIFT, label: 'Gifts' },
  { value: BROWSE_TYPE_FILTERS.SALE, label: 'Sales' },
  { value: BROWSE_TYPE_FILTERS.SWAP, label: 'Swaps' },
];

const SORT_OPTIONS = [
  { value: BROWSE_SORT_OPTIONS.NEWEST, label: 'Newest' },
  { value: BROWSE_SORT_OPTIONS.SOONEST_SITTING, label: 'Soonest sit' },
  { value: BROWSE_SORT_OPTIONS.PRICE_LOW, label: 'Price low' },
  { value: BROWSE_SORT_OPTIONS.PRICE_HIGH, label: 'Price high' },
];

function FilterButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ListingsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState(BROWSE_TYPE_FILTERS.ALL);
  const [sortBy, setSortBy] = useState(BROWSE_SORT_OPTIONS.NEWEST);

  const fetchListings = useCallback(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await listingsService.getOpenListings();
        setListings(data);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useFocusEffect(fetchListings);

  const visibleListings = useMemo(() => filterAndSortListings(listings, {
    listingType: listingTypeFilter,
    searchTerm,
    sortBy,
  }), [listingTypeFilter, listings, searchTerm, sortBy]);

  const hasActiveFilters = searchTerm.trim().length > 0 || listingTypeFilter !== BROWSE_TYPE_FILTERS.ALL;

  const renderListing = ({ item }) => {
    const plant = item.plants;
    const days = daysBetween(item.sitting_start_date, item.sitting_end_date);
    const dateRange = item.sitting_start_date
      ? `${formatDate(item.sitting_start_date)} - ${formatDate(item.sitting_end_date)}`
      : null;
    const wateringFrequencyLabel = formatWateringFrequency(
      plant?.watering_frequency_days,
      plant?.watering_frequency_unit,
      true
    );
    const typeMeta = TYPE_META[item.listing_type] ?? TYPE_META[LISTING_TYPES.SITTING_REQUEST];
    const summary = item.listing_type === LISTING_TYPES.SALE
      ? `${item.currency_code ?? 'GBP'} ${Number(item.sale_price ?? 0).toFixed(2)}`
      : item.listing_type === LISTING_TYPES.GIFT
        ? (item.gift_notes || 'Free to a good home')
        : item.listing_type === LISTING_TYPES.SWAP
          ? (item.desired_swap_notes || 'Open to swap offers')
          : item.title;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
        activeOpacity={0.78}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{plant?.name ?? 'Unknown plant'}</Text>
            {plant?.species ? <Text style={styles.species}>{plant.species}</Text> : null}
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeMeta.bg, borderColor: typeMeta.border }]}>
            <Text style={[styles.typeBadgeText, { color: typeMeta.text }]}>{typeMeta.label}</Text>
          </View>
        </View>

        <Text style={styles.listingTitle}>{summary}</Text>

        {item.listing_type === LISTING_TYPES.SITTING_REQUEST && dateRange && (
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{dateRange}</Text>
            {days != null ? <Text style={styles.dateHint}>{days} days</Text> : null}
          </View>
        )}

        {item.listing_type === LISTING_TYPES.SALE && (
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>Peer sale listing</Text>
          </View>
        )}

        {item.listing_type === LISTING_TYPES.GIFT && (
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>Community rehome</Text>
          </View>
        )}

        {item.listing_type === LISTING_TYPES.SWAP && (
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>Trade with another owner</Text>
          </View>
        )}

        <View style={styles.chips}>
          {plant?.light_requirements ? <MetaChip label={`Light: ${plant.light_requirements}`} /> : null}
          {wateringFrequencyLabel ? <MetaChip label={`Water: ${wateringFrequencyLabel.toLowerCase()}`} /> : null}
          {item.listing_type === LISTING_TYPES.SALE ? <MetaChip label={`${item.currency_code ?? 'GBP'} ${Number(item.sale_price ?? 0).toFixed(2)}`} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyInner}>
      <Text style={styles.emptyTitle}>{hasActiveFilters ? 'No matching listings' : 'No listings right now'}</Text>
      <Text style={styles.emptyBody}>
        {hasActiveFilters
          ? 'Try a different search, listing type, or sort option.'
          : 'Check back soon, or post your own plant to get started.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Plants</Text>
        <Text style={styles.subtitle}>Sale, gift, swap, and sitter listings</Text>

        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by plant, species, care need, or listing"
          placeholderTextColor={C.stone}
          style={styles.searchInput}
          {...SEARCH_TEXTBOX_SUGGESTION_PROPS}
        />

        <View style={styles.controlBlock}>
          <Text style={styles.controlLabel}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {TYPE_FILTER_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                active={listingTypeFilter === option.value}
                onPress={() => setListingTypeFilter(option.value)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.controlBlock}>
          <Text style={styles.controlLabel}>Sort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {SORT_OPTIONS.map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                active={sortBy === option.value}
                onPress={() => setSortBy(option.value)}
              />
            ))}
          </ScrollView>
        </View>

        <Text style={styles.resultCount}>
          {visibleListings.length} of {listings.length} open listings
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <FlatList
          data={visibleListings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderListing}
          contentContainerStyle={visibleListings.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  header: {
    paddingHorizontal: S.base,
    paddingTop: 52,
    paddingBottom: S.base,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.mist,
  },
  title: { ...T.h1 },
  subtitle: { ...T.caption, color: C.stone, marginTop: 2 },
  searchInput: {
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.sage,
    borderRadius: S.input,
    color: C.ink,
    fontSize: 14,
    marginTop: S.md,
    minHeight: 44,
    paddingHorizontal: S.md,
  },
  controlBlock: { marginTop: S.md },
  controlLabel: { ...T.label, color: C.moss, marginBottom: S.xs },
  filterRow: { gap: S.sm, paddingRight: S.base },
  filterButton: {
    borderWidth: 1,
    borderColor: C.sage,
    borderRadius: S.chip,
    backgroundColor: C.white,
    paddingHorizontal: S.md,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: C.forest,
    borderColor: C.forest,
  },
  filterButtonText: { ...T.caption, color: C.moss, fontWeight: '700' },
  filterButtonTextActive: { color: C.white },
  resultCount: { ...T.caption, color: C.stone, marginTop: S.sm },
  loader: { flex: 1 },
  listContent: { paddingTop: S.sm, paddingBottom: S.xxxl },
  card: {
    backgroundColor: C.white,
    marginHorizontal: S.base,
    marginTop: S.md,
    borderRadius: S.card,
    padding: S.base,
    ...S.cardShadow,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.xs },
  plantName: { ...T.h2, color: C.forest },
  species: { ...T.caption, color: C.stone, fontStyle: 'italic', marginTop: 2 },
  typeBadge: {
    borderRadius: S.chip,
    paddingHorizontal: S.md,
    paddingVertical: 4,
    borderWidth: 1,
    marginLeft: S.sm,
  },
  typeBadgeText: { ...T.badge },
  listingTitle: { ...T.body, color: C.slate, marginBottom: S.sm },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: S.sm },
  dateText: { ...T.caption, color: C.slate, fontWeight: '600' },
  dateHint: { ...T.caption, color: C.stone, marginLeft: S.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  chip: {
    backgroundColor: C.mist,
    borderRadius: S.chip,
    paddingHorizontal: S.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.sage,
  },
  chipText: { ...T.caption, color: C.moss, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: S.xl },
  emptyInner: { alignItems: 'center' },
  emptyTitle: { ...T.h2, textAlign: 'center', marginBottom: S.sm },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center', lineHeight: 22 },
});
