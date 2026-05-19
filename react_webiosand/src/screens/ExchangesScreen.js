import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>🤝</Text>
      <Text style={styles.emptyTitle}>No exchanges yet</Text>
      <Text style={styles.emptyBody}>Swap proposals, handoffs, and completed exchanges will appear here.</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function StatusBadge({ label, tone = 'neutral' }) {
  const toneStyles = tone === 'pending'
    ? { backgroundColor: C.amberLight, borderColor: C.amber, color: C.clay }
    : tone === 'complete'
      ? { backgroundColor: C.mist, borderColor: C.sage, color: C.forest }
      : { backgroundColor: C.parchment, borderColor: C.sage, color: C.moss };

  return (
    <View style={[styles.badge, { backgroundColor: toneStyles.backgroundColor, borderColor: toneStyles.borderColor }]}>
      <Text style={[styles.badgeText, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
}

function ActionLink({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.actionLink}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ExchangesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [exchangeInbox, setExchangeInbox] = useState({
    activeProposals: [],
    pendingHandoffs: [],
    completedExchanges: [],
  });

  const load = useCallback(() => {
    async function fetchInbox() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const inbox = await listingsService.getExchangeInbox(user.id);
        setUserId(user.id);
        setExchangeInbox(inbox);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load your exchanges.');
      } finally {
        setLoading(false);
      }
    }

    fetchInbox();
  }, []);

  useFocusEffect(load);

  const { activeProposals, pendingHandoffs, completedExchanges } = exchangeInbox;
  const isEmpty = !loading && activeProposals.length === 0 && pendingHandoffs.length === 0 && completedExchanges.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exchanges</Text>
        <Text style={styles.subtitle}>Track proposals, handoffs, and completed transfers.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {activeProposals.length > 0 ? (
            <>
              <SectionHeader title="Active proposals" subtitle="Pending or accepted swap offers that still need attention." />
              {activeProposals.map((proposal) => {
                const listing = proposal.listing;
                const listingPlant = Array.isArray(listing) ? listing[0] : listing;
                const plant = listingPlant?.plants;
                const directionLabel = proposal.direction === 'INCOMING' ? 'Incoming' : 'Outgoing';
                return (
                  <View key={`proposal-${proposal.id}-${proposal.direction}`} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listingPlant?.title ?? 'Swap proposal'}</Text>
                        <Text style={styles.cardMeta}>{plant?.name ?? 'Plant listing'}</Text>
                      </View>
                      <StatusBadge label={directionLabel} tone={proposal.direction === 'INCOMING' ? 'pending' : 'neutral'} />
                    </View>
                    <Text style={styles.cardBody}>
                      {proposal.direction === 'INCOMING'
                        ? `${proposal.proposer?.display_name || 'Another owner'} offered ${proposal.offered_plant?.name || 'a plant'}.`
                        : `You offered ${proposal.offered_plant?.name || 'a plant'} on this listing.`}
                    </Text>
                    <View style={styles.cardFooter}>
                      <StatusBadge label={proposal.status.replace('_', ' ')} tone={proposal.status === 'ACCEPTED' ? 'complete' : 'pending'} />
                      <ActionLink
                        label={proposal.direction === 'INCOMING' ? 'Review proposals' : 'Open listing'}
                        onPress={() => {
                          if (proposal.direction === 'INCOMING') {
                            navigation.navigate('SwapProposals', {
                              listingId: listingPlant?.id,
                              listingTitle: listingPlant?.title,
                              ownerUserId: listingPlant?.owner_user_id,
                            });
                          } else {
                            navigation.navigate('ListingDetail', { listingId: listingPlant?.id });
                          }
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}

          {pendingHandoffs.length > 0 ? (
            <>
              <SectionHeader title="Pending handoffs" subtitle="Open exchanges waiting for confirmation from one or both sides." />
              {pendingHandoffs.map((handoff) => {
                const listing = handoff.listing;
                const plant = listing?.plants;
                const waitingOnMe = (handoff.owner_user_id === userId && !handoff.owner_confirmed_at)
                  || (handoff.recipient_user_id === userId && !handoff.recipient_confirmed_at);
                return (
                  <View key={`handoff-${handoff.id}`} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listing?.title ?? 'Exchange handoff'}</Text>
                        <Text style={styles.cardMeta}>{plant?.name ?? 'Plant listing'}</Text>
                      </View>
                      <StatusBadge label={handoff.status.replace('_', ' ')} tone="pending" />
                    </View>
                    <Text style={styles.cardBody}>
                      {waitingOnMe ? 'Your confirmation is still required.' : 'Waiting on the other participant to confirm.'}
                    </Text>
                    <View style={styles.cardFooter}>
                      <ActionLink label="Open handoff" onPress={() => navigation.navigate('ListingDetail', { listingId: handoff.listing_id })} />
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}

          {completedExchanges.length > 0 ? (
            <>
              <SectionHeader title="Completed exchanges" subtitle="Finished handoffs and transfers, including review follow-up." />
              {completedExchanges.map((handoff) => {
                const listing = handoff.listing;
                const plant = listing?.plants;
                const myReview = handoff.listing_handoff_reviews?.find((review) => review.reviewer_user_id === userId);
                return (
                  <View key={`completed-${handoff.id}`} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listing?.title ?? 'Completed exchange'}</Text>
                        <Text style={styles.cardMeta}>{plant?.name ?? 'Plant listing'}</Text>
                      </View>
                      <StatusBadge label="Completed" tone="complete" />
                    </View>
                    <Text style={styles.cardBody}>
                      {myReview ? `You already left a ${myReview.rating}/5 review.` : 'Review this exchange or revisit the listing details.'}
                    </Text>
                    <View style={styles.cardFooter}>
                      <ActionLink label={myReview ? 'View exchange' : 'Open exchange'} onPress={() => navigation.navigate('ListingDetail', { listingId: handoff.listing_id })} />
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}
        </ScrollView>
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
  loader: { flex: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: S.base },
  emptyCard: { ...shared.card, alignItems: 'center', width: '100%' },
  emptyIcon: { fontSize: 52, marginBottom: S.md },
  emptyTitle: { ...T.h2, marginBottom: S.sm, textAlign: 'center' },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center' },
  content: { padding: S.base, paddingBottom: S.xxxl },
  sectionHeader: { marginBottom: S.sm, marginTop: S.sm },
  sectionTitle: { ...T.h2, color: C.forest },
  sectionSubtitle: { ...T.caption, color: C.stone, marginTop: 2 },
  card: { ...shared.card, marginBottom: S.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: S.sm, marginBottom: S.sm },
  cardTitle: { ...T.h3, color: C.forest },
  cardMeta: { ...T.caption, color: C.stone, marginTop: 2 },
  cardBody: { ...T.body, color: C.slate },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: S.md },
  badge: {
    borderWidth: 1,
    borderRadius: S.chip,
    paddingHorizontal: S.sm,
    paddingVertical: 4,
  },
  badgeText: { ...T.badge },
  actionLink: { ...T.label, color: C.amber },
});