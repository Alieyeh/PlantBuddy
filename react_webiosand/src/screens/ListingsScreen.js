import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listingsService } from '../api/listingsService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const daysBetween = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

export default function ListingsScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingsService.getOpenListings();
      setListings(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchListings);

  const renderListing = ({ item }) => {
    const plant = item.plants;
    const days = daysBetween(item.sitting_start_date, item.sitting_end_date);
    const dateRange = item.sitting_start_date
      ? `${formatDate(item.sitting_start_date)} – ${formatDate(item.sitting_end_date)}`
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.plantName}>{plant?.name ?? 'Unknown plant'}</Text>
          {days != null && (
            <View style={styles.daysBadge}>
              <Text style={styles.daysText}>{days}d</Text>
            </View>
          )}
        </View>

        {plant?.species ? (
          <Text style={styles.species}>{plant.species}</Text>
        ) : null}

        <Text style={styles.listingTitle}>{item.title}</Text>

        <View style={styles.metaRow}>
          {dateRange ? <Text style={styles.meta}>{dateRange}</Text> : null}
          {plant?.light_requirements ? (
            <Text style={styles.meta}>{plant.light_requirements}</Text>
          ) : null}
          {plant?.watering_frequency_days ? (
            <Text style={styles.meta}>Water every {plant.watering_frequency_days}d</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Plants</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderListing}
          contentContainerStyle={listings.length === 0 && styles.emptyContainer}
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyText}>No sitting requests open yet.</Text>
              <Text style={styles.emptyHint}>Be the first to list a plant!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  loader: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  plantName: { fontSize: 18, fontWeight: '700', color: '#1b5e20' },
  daysBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  daysText: { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  species: { fontSize: 13, color: '#888', marginBottom: 6, fontStyle: 'italic' },
  listingTitle: { fontSize: 15, color: '#333', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#66bb6a',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyInner: { alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 17, color: '#555', fontWeight: '600' },
  emptyHint: { fontSize: 14, color: '#999' },
});
