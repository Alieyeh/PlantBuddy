import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/apiService';
import { SessionManager } from '../storage/SessionManager';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';
import { LISTING_TYPES } from '../api/listingsService';

function InitialsAvatar({ name, onPress }) {
  const initials = (name ?? '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <TouchableOpacity style={styles.avatar} onPress={onPress}>
      <Text style={styles.avatarText}>{initials}</Text>
    </TouchableOpacity>
  );
}

/**
 * Owner dashboard for viewing active plants and creating listings from an individual plant card.
 */
export default function PlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [activeListings, setActiveListings] = useState({});
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPlants = useCallback(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const data = await api.getPlants();
        setPlants(data);

        if (user) {
          const { data: profile } = await supabase
            .from('owner_profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();
          setDisplayName(profile?.display_name || user.email?.split('@')[0] || '');

          const { data: listings } = await supabase
            .from('plant_listings')
            .select('id, title, plant_id, status, listing_type')
            .eq('owner_user_id', user.id)
            .eq('status', 'OPEN');
          const map = {};
          (listings ?? []).forEach((l) => { map[l.plant_id] = l; });
          setActiveListings(map);
        }
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load plants');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useFocusEffect(fetchPlants);

  const handleLogout = async () => {
    await SessionManager.clear();
    navigation.getParent()?.getParent()?.replace('Login');
  };

  const renderPlant = ({ item }) => {
    const subtitle = [item.species, item.location_notes].filter(Boolean).join(' · ') || 'No details yet';
    const activeListing = activeListings[item.id];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddEditPlant', { plant: item })}
        activeOpacity={0.78}
      >
        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantSubtitle}>{subtitle}</Text>
          </View>
          <View style={styles.cardActions}>
            {activeListing ? (
              activeListing.listing_type === LISTING_TYPES.SITTING_REQUEST ? (
                <TouchableOpacity
                  style={[styles.actionChip, styles.applicantsChip]}
                  onPress={() => navigation.navigate('Applications', {
                    listingId: activeListing.id,
                    listingTitle: activeListing.title,
                  })}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.applicantsChipText}>Applicants</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.actionChip, styles.liveChip]}>
                  <Text style={styles.liveChipText}>
                    {activeListing.listing_type === LISTING_TYPES.GIFT ? 'Gift live' : 'Sale live'}
                  </Text>
                </View>
              )
            ) : (
              <TouchableOpacity
                style={[styles.actionChip, styles.sitterChip]}
                onPress={() => navigation.navigate('PostListing', { plantId: item.id })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.sitterChipText}>List plant</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <InitialsAvatar name={displayName} onPress={handleLogout} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPlant}
          contentContainerStyle={plants.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Text style={styles.emptyIcon}>🪴</Text>
              <Text style={styles.emptyTitle}>Your garden is empty</Text>
              <Text style={styles.emptyBody}>Add your first plant and introduce it to the community.</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddEditPlant', {})}
              >
                <Text style={styles.emptyButtonText}>Add a plant</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditPlant', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: S.base, paddingTop: 52, paddingBottom: S.base,
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.mist,
  },
  title: { ...T.h1 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.mist, borderWidth: 1.5, borderColor: C.sage,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { ...T.label, color: C.forest, fontSize: 14 },
  loader: { flex: 1 },
  listContent: { paddingTop: S.sm, paddingBottom: S.xxxl },
  card: {
    backgroundColor: C.white,
    marginHorizontal: S.base, marginTop: S.md,
    borderRadius: S.card, padding: S.base,
    ...S.cardShadow,
  },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  plantName: { ...T.h3, color: C.forest, marginBottom: 3 },
  plantSubtitle: { ...T.caption, color: C.stone },
  cardActions: { flexDirection: 'column', alignItems: 'flex-end', marginLeft: S.md },
  actionChip: {
    borderRadius: S.chip, paddingHorizontal: S.md, paddingVertical: 6,
    borderWidth: 1,
  },
  sitterChip: { backgroundColor: C.amberLight, borderColor: C.amber },
  sitterChipText: { ...T.badge, color: C.clay },
  applicantsChip: { backgroundColor: C.mist, borderColor: C.sage },
  applicantsChipText: { ...T.badge, color: C.forest },
  liveChip: { backgroundColor: C.parchment, borderColor: C.sage },
  liveChipText: { ...T.badge, color: C.moss },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: S.xl },
  emptyInner: { alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: S.md },
  emptyTitle: { ...T.h2, textAlign: 'center', marginBottom: S.sm },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center', lineHeight: 22, marginBottom: S.xl },
  emptyButton: { ...shared.primaryButton, paddingHorizontal: S.xl },
  emptyButtonText: { ...shared.primaryButtonText },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.amber, justifyContent: 'center', alignItems: 'center',
    shadowColor: C.amber, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: { fontSize: 28, color: C.white, lineHeight: 32 },
});
