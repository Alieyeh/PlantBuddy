import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

const STATUS = {
  PENDING: { bg: C.amberLight, text: C.clay, border: C.amber },
  ACCEPTED: { bg: C.mist, text: C.forest, border: C.sage },
  DECLINED: { bg: C.roseLight, text: C.terracotta, border: C.terracotta },
};

export default function SwapProposalsScreen({ route }) {
  const { listingId, listingTitle, ownerUserId } = route.params;
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await listingsService.getSwapProposalsForListing(listingId);
        setProposals(data);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load swap proposals.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [listingId]);

  useFocusEffect(load);

  const handleAccept = (proposal) => {
    Alert.alert(
      'Accept this swap?',
      'This starts a handoff record for the exchange so both sides can confirm completion.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              await listingsService.acceptSwapProposal({
                proposal,
                listingOwnerUserId: ownerUserId,
                actingUserId: user?.id,
              });
              setProposals((prev) => prev.map((item) => item.id === proposal.id ? { ...item, status: 'ACCEPTED' } : item));
              Alert.alert('Accepted', 'The swap handoff is now ready for both sides to confirm.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not accept the proposal.');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (proposalId) => {
    try {
      await listingsService.updateSwapProposalStatus(proposalId, 'DECLINED');
      setProposals((prev) => prev.map((item) => item.id === proposalId ? { ...item, status: 'DECLINED' } : item));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not decline the proposal.');
    }
  };

  const renderProposal = ({ item }) => {
    const status = STATUS[item.status] ?? STATUS.PENDING;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plantName}>{item.offered_plant?.name ?? 'Unnamed plant'}</Text>
            <Text style={styles.metaText}>{item.offered_plant?.species || item.proposer?.display_name || 'Swap proposal'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: status.bg, borderColor: status.border }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>{item.status}</Text>
          </View>
        </View>

        {item.message_to_owner ? <Text style={styles.message}>{item.message_to_owner}</Text> : null}
        {item.offered_plant?.health_status ? <Text style={styles.metaText}>Health: {item.offered_plant.health_status}</Text> : null}
        {item.offered_plant?.size_description ? <Text style={styles.metaText}>Size: {item.offered_plant.size_description}</Text> : null}

        {item.status === 'PENDING' ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item.id)}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.subheader}>
        <Text style={styles.subheaderTitle} numberOfLines={1}>{listingTitle}</Text>
        <Text style={styles.subheaderBody}>Review offers from other owners.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <FlatList
          data={proposals}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProposal}
          contentContainerStyle={proposals.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Text style={styles.emptyIcon}>🔄</Text>
              <Text style={styles.emptyTitle}>No swap proposals yet</Text>
              <Text style={styles.emptyBody}>When another owner proposes a trade, it will appear here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  subheader: { backgroundColor: C.white, paddingHorizontal: S.base, paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.mist },
  subheaderTitle: { ...T.body, color: C.slate, fontStyle: 'italic' },
  subheaderBody: { ...T.caption, color: C.stone, marginTop: 2 },
  loader: { flex: 1 },
  listContent: { paddingTop: S.sm, paddingBottom: S.xxxl },
  card: { ...shared.card, marginHorizontal: S.base, marginTop: S.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.sm },
  plantName: { ...T.h3, color: C.forest },
  metaText: { ...T.caption, color: C.stone, marginTop: 2 },
  badge: { borderWidth: 1, borderRadius: S.chip, paddingHorizontal: S.sm, paddingVertical: 4, marginLeft: S.sm },
  badgeText: { ...T.badge },
  message: { ...T.body, color: C.slate, marginBottom: S.sm },
  actions: { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  acceptButton: { flex: 1, ...shared.primaryButton, minHeight: 40, paddingVertical: 10 },
  acceptButtonText: { ...shared.primaryButtonText, fontSize: 14 },
  declineButton: { flex: 1, borderRadius: S.button, borderWidth: 1.5, borderColor: C.sage, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  declineButtonText: { ...T.label, color: C.terracotta },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: S.xl },
  emptyInner: { alignItems: 'center' },
  emptyIcon: { fontSize: 52, marginBottom: S.md },
  emptyTitle: { ...T.h2, textAlign: 'center', marginBottom: S.sm },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center' },
});