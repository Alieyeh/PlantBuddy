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
      const res = await api.getPlants();
      setPlants(res.data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load plants';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchPlants);

  const handleLogout = async () => {
    await SessionManager.clear();
    navigation.replace('Login');
  };

  const renderPlant = ({ item }) => {
    const subtitle = [item.species, item.room].filter(Boolean).join(' · ') || 'No details added';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AddEditPlant', { plant: item })}
      >
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantSubtitle}>{subtitle}</Text>
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
    borderRadius: 10, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  plantName: { fontSize: 17, fontWeight: '600', color: '#1b5e20', marginBottom: 4 },
  plantSubtitle: { fontSize: 13, color: '#777' },
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
