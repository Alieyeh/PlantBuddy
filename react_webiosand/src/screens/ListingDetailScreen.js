import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
};

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  return Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function CareChip({ icon, label }) {
  if (!label) return null;
  return (
    <View style={styles.careChip}>
      <Text style={styles.careChipIcon}>{icon}</Text>
      <Text style={styles.careChipText}>{label}</Text>
    </View>
  );
}

/**
 * Detail page for one sitting request, including the linked plant's care notes.
 * Applying is intentionally still a Stage 2 placeholder.
 */
export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingsService.getListing(listingId)
      .then(setListing)
      .catch((err) => Alert.alert('Error', err.message || 'Failed to load listing'))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.amber} /></View>;
  }
  if (!listing) return null;

  const plant = listing.plants;
  const days = daysBetween(listing.sitting_start_date, listing.sitting_end_date);

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.plantName}>{plant?.name}</Text>
              {plant?.species ? <Text style={styles.species}>{plant.species}</Text> : null}
            </View>
            {days != null && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysText}>{days} days</Text>
              </View>
            )}
          </View>

          <View style={styles.careChips}>
            <CareChip icon="💧" label={plant?.watering_frequency_days ? `Every ${plant.watering_frequency_days} days` : null} />
            <CareChip icon="☀️" label={plant?.light_requirements} />
            <CareChip icon="🌫️" label={plant?.humidity_requirements} />
          </View>
        </View>

        {/* Sitting period */}
        <Text style={shared.sectionLabel}>Sitting Period</Text>
        <View style={styles.section}>
          <InfoRow label="From" value={formatDate(listing.sitting_start_date)} />
          <InfoRow label="Until" value={formatDate(listing.sitting_end_date)} />
        </View>

        {/* About listing */}
        <Text style={shared.sectionLabel}>About this listing</Text>
        <View style={styles.section}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          {listing.description ? <Text style={styles.bodyText}>{listing.description}</Text> : null}
          {listing.sitting_notes ? <Text style={styles.notesText}>{listing.sitting_notes}</Text> : null}
        </View>

        {/* Plant care */}
        <Text style={shared.sectionLabel}>Plant care</Text>
        <View style={styles.section}>
          <InfoRow label="Size" value={plant?.size_description} />
          <InfoRow label="Health" value={plant?.health_status} />
          {plant?.special_instructions && (
            <View style={styles.specialBox}>
              <Text style={styles.specialLabel}>Special instructions</Text>
              <Text style={styles.specialText}>{plant.special_instructions}</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky apply button */}
      <View style={styles.stickyBar}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => navigation.navigate('Apply', {
            listingId: listing.id,
            plantName: plant?.name,
            sittingStart: listing.sitting_start_date,
            sittingEnd: listing.sitting_end_date,
          })}
          activeOpacity={0.85}
        >
          <Text style={styles.applyBtnText}>Apply to Sit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: S.base, paddingBottom: S.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.cream },
  heroCard: {
    backgroundColor: C.white, borderRadius: S.card,
    padding: S.base, marginBottom: S.md,
    ...S.cardShadowElevated,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.md },
  plantName: { ...T.hero, fontSize: 30, lineHeight: 36 },
  species: { ...T.caption, fontStyle: 'italic', color: C.stone, marginTop: 3 },
  daysBadge: {
    backgroundColor: C.amberLight, borderRadius: S.chip,
    paddingHorizontal: S.md, paddingVertical: 5,
    borderWidth: 1, borderColor: C.amber, marginLeft: S.sm, marginTop: 4,
  },
  daysText: { ...T.badge, color: C.clay },
  careChips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.xs },
  careChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.mist, borderRadius: S.chip,
    paddingHorizontal: S.md, paddingVertical: 5,
    borderWidth: 1, borderColor: C.sage,
  },
  careChipIcon: { fontSize: 13, marginRight: S.xs },
  careChipText: { ...T.caption, color: C.moss, fontWeight: '600' },
  section: {
    backgroundColor: C.white, borderRadius: S.card,
    padding: S.base, marginBottom: S.md,
    ...S.cardShadow,
  },
  listingTitle: { ...T.h3, color: C.ink, marginBottom: S.sm },
  bodyText: { ...T.body, color: C.slate, lineHeight: 22 },
  notesText: { ...T.body, color: C.slate, fontStyle: 'italic', marginTop: S.sm },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.mist,
  },
  infoLabel: { ...T.label, color: C.stone },
  infoValue: { ...T.label, color: C.ink, flex: 1, textAlign: 'right' },
  specialBox: {
    backgroundColor: '#fffaf7', borderRadius: S.md,
    padding: S.md, marginTop: S.sm,
    borderLeftWidth: 4, borderLeftColor: C.amber,
  },
  specialLabel: { ...T.badge, color: C.clay, marginBottom: S.xs },
  specialText: { ...T.body, color: C.ink, lineHeight: 22 },
  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, padding: S.base, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: C.mist,
    shadowColor: C.forest, shadowOpacity: 0.1, shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 }, elevation: 8,
  },
  applyBtn: { ...shared.primaryButton },
  applyBtnText: { ...shared.primaryButtonText, fontSize: 17 },
});
