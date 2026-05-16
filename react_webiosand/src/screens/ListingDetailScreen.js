import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { listingsService } from '../api/listingsService';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
};

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
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!listing) return null;

  const plant = listing.plants;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.plantCard}>
        <Text style={styles.plantName}>{plant?.name}</Text>
        {plant?.species ? <Text style={styles.species}>{plant.species}</Text> : null}
      </View>

      <Text style={styles.sectionHeader}>Sitting Period</Text>
      <View style={styles.section}>
        <InfoRow label="From" value={formatDate(listing.sitting_start_date)} />
        <InfoRow label="Until" value={formatDate(listing.sitting_end_date)} />
      </View>

      <Text style={styles.sectionHeader}>About This Listing</Text>
      <View style={styles.section}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        {listing.description ? (
          <Text style={styles.description}>{listing.description}</Text>
        ) : null}
        {listing.sitting_notes ? (
          <Text style={styles.notes}>{listing.sitting_notes}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionHeader}>Plant Care</Text>
      <View style={styles.section}>
        <InfoRow label="Size" value={plant?.size_description} />
        <InfoRow label="Health" value={plant?.health_status} />
        <InfoRow
          label="Watering"
          value={plant?.watering_frequency_days ? `Every ${plant.watering_frequency_days} days` : null}
        />
        <InfoRow label="Light" value={plant?.light_requirements} />
        <InfoRow label="Humidity" value={plant?.humidity_requirements} />
        {plant?.special_instructions ? (
          <View style={styles.specialBox}>
            <Text style={styles.specialLabel}>Special Instructions</Text>
            <Text style={styles.specialText}>{plant.special_instructions}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.applyBtn}
        onPress={() => Alert.alert('Coming soon', 'Application flow is in Stage 2.')}
      >
        <Text style={styles.applyBtnText}>Apply to Sit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  plantName: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20' },
  species: { fontSize: 15, color: '#888', fontStyle: 'italic', marginTop: 4 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  listingTitle: { fontSize: 17, fontWeight: '600', color: '#222', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 20 },
  notes: { fontSize: 14, color: '#555', lineHeight: 20, marginTop: 8, fontStyle: 'italic' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValue: { fontSize: 14, color: '#222', fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  specialBox: {
    backgroundColor: '#f9fbe7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#aed581',
  },
  specialLabel: { fontSize: 12, fontWeight: '700', color: '#558b2f', marginBottom: 4 },
  specialText: { fontSize: 14, color: '#444', lineHeight: 20 },
  applyBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
