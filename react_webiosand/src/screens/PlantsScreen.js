import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/apiService';
import { SessionManager } from '../storage/SessionManager';

export default function PlantsScreen({ navigation }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPlants();
      setPlants(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load plants');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchPlants);

  const handleLogout = async () => {
    await SessionManager.clear();
    navigation.getParent()?.getParent()?.replace('Login');
  };

  const renderPlant = ({ item }) => {
    const subtitle = [item.species, item.location_notes].filter(Boolean).join(' · ') || 'No details added';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddEditPlant', { plant: item })}
        activeOpacity={0.75}
      >
        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{item.name}</Text>
            <Text style={styles.plantSubtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.sitBtn}
            onPress={() => navigation.navigate('PostListing', { plantId: item.id })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.sitBtnText}>Find sitter</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Plants</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPlant}
          contentContainerStyle={plants.length === 0 && styles.emptyContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No plants yet. Add your first one!</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditPlant', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, paddingTop: 48, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  logoutBtn: { padding: 8 },
  logoutText: { color: '#e53935', fontSize: 14, fontWeight: '600' },
  loader: { flex: 1 },
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  cardBody: { flexDirection: 'row', alignItems: 'center' },
  plantName: { fontSize: 17, fontWeight: '600', color: '#1b5e20', marginBottom: 4 },
  plantSubtitle: { fontSize: 13, color: '#777' },
  sitBtn: {
    backgroundColor: '#e8f5e9', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 12,
  },
  sitBtnText: { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
