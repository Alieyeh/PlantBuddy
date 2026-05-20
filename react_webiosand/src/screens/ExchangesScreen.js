import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';
import {
  formatInboxDate,
  getExchangeInboxCounts,
  getMyHandoffReview,
  getProposalListing,
  isHandoffWaitingOnUser,
  participantLabel,
} from '../utils/exchangeInbox';

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>🤝</Text>
      <Text style={styles.emptyTitle}>No exchanges yet</Text>
      <Text style={styles.emptyBody}>Swap proposals, handoffs, and completed exchanges will appear here.</Text>
    </View>
  );
}

function SectionHeader({ title, subtitle, count }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{count}</Text>
      </View>
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

function SummaryPill({ label, value, emphasis = false }) {
  return (
    <View style={[styles.summaryPill, emphasis && styles.summaryPillEmphasis]}>
      <Text style={[styles.summaryValue, emphasis && styles.summaryValueEmphasis]}>{value}</Text>
      <Text style={[styles.summaryLabel, emphasis && styles.summaryLabelEmphasis]}>{label}</Text>
    </View>
  );
}

export default function ExchangesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [exchangeInbox, setExchangeInbox] = useState({
    activeProposals: [],
    pendingHandoffs: [],
    completedExchanges: [],
  });

  const load = useCallback((options = {}) => {
    const showLoader = options.showLoader ?? true;

    async function fetchInbox() {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

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
        setRefreshing(false);
      }
    }

    fetchInbox();
  }, []);

  useFocusEffect(load);

  const { activeProposals, pendingHandoffs, completedExchanges } = exchangeInbox;
  const counts = getExchangeInboxCounts(exchangeInbox, userId);
  const isEmpty = !loading && counts.total === 0;
  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={() => load({ showLoader: false })} tintColor={C.amber} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exchanges</Text>
        <Text style={styles.subtitle}>Track proposals, handoffs, and completed transfers.</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, isEmpty && styles.emptyContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {isEmpty ? <EmptyState /> : (
            <View style={styles.summaryRow}>
              <SummaryPill label="Needs action" value={counts.actionNeeded} emphasis={counts.actionNeeded > 0} />
              <SummaryPill label="Proposals" value={counts.activeProposals} />
              <SummaryPill label="Handoffs" value={counts.pendingHandoffs} />
              <SummaryPill label="Completed" value={counts.completedExchanges} />
            </View>
          )}

          {activeProposals.length > 0 ? (
            <>
              <SectionHeader title="Active proposals" count={activeProposals.length} subtitle="Pending or accepted swap offers that still need attention." />
              {activeProposals.map((proposal) => {
                const listingPlant = getProposalListing(proposal);
                const plant = listingPlant?.plants;
                const directionLabel = proposal.direction === 'INCOMING' ? 'Incoming' : 'Outgoing';
                const needsAction = proposal.direction === 'INCOMING' && proposal.status === 'PENDING';
                const timestamp = formatInboxDate(proposal.responded_at || proposal.created_at);
                return (
                  <View key={`proposal-${proposal.id}-${proposal.direction}`} style={[styles.card, needsAction && styles.cardNeedsAction]}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listingPlant?.title ?? 'Swap proposal'}</Text>
                        <Text style={styles.cardMeta}>
                          {[plant?.name ?? 'Plant listing', directionLabel, timestamp].filter(Boolean).join(' • ')}
                        </Text>
                      </View>
                      <StatusBadge label={needsAction ? 'Action needed' : directionLabel} tone={needsAction ? 'pending' : 'neutral'} />
                    </View>
                    <Text style={styles.cardBody}>
                      {proposal.direction === 'INCOMING'
                        ? `${participantLabel(proposal.proposer, 'Another owner')} offered ${proposal.offered_plant?.name || 'a plant'}.`
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
              <SectionHeader title="Pending handoffs" count={pendingHandoffs.length} subtitle="Open exchanges waiting for confirmation from one or both sides." />
              {pendingHandoffs.map((handoff) => {
                const listing = handoff.listing;
                const plant = listing?.plants;
                const waitingOnMe = isHandoffWaitingOnUser(handoff, userId);
                const role = handoff.owner_user_id === userId ? 'Owner' : 'Recipient';
                const timestamp = formatInboxDate(handoff.updated_at || handoff.created_at);
                return (
                  <View key={`handoff-${handoff.id}`} style={[styles.card, waitingOnMe && styles.cardNeedsAction]}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listing?.title ?? 'Exchange handoff'}</Text>
                        <Text style={styles.cardMeta}>
                          {[plant?.name ?? 'Plant listing', role, timestamp].filter(Boolean).join(' • ')}
                        </Text>
                      </View>
                      <StatusBadge label={waitingOnMe ? 'Confirm now' : handoff.status.replace('_', ' ')} tone="pending" />
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
              <SectionHeader title="Completed exchanges" count={completedExchanges.length} subtitle="Finished handoffs and transfers, including review follow-up." />
              {completedExchanges.map((handoff) => {
                const listing = handoff.listing;
                const plant = listing?.plants;
                const myReview = getMyHandoffReview(handoff, userId);
                const timestamp = formatInboxDate(handoff.completed_at || handoff.updated_at);
                return (
                  <View key={`completed-${handoff.id}`} style={[styles.card, !myReview && styles.cardReviewDue]}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{listing?.title ?? 'Completed exchange'}</Text>
                        <Text style={styles.cardMeta}>
                          {[plant?.name ?? 'Plant listing', timestamp].filter(Boolean).join(' • ')}
                        </Text>
                      </View>
                      <StatusBadge label={myReview ? 'Completed' : 'Review due'} tone={myReview ? 'complete' : 'pending'} />
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
  emptyCard: { ...shared.card, alignItems: 'center', width: '100%' },
  emptyIcon: { fontSize: 52, marginBottom: S.md },
  emptyTitle: { ...T.h2, marginBottom: S.sm, textAlign: 'center' },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center' },
  content: { padding: S.base, paddingBottom: S.xxxl },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.lg },
  summaryPill: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.mist,
    borderRadius: S.card,
    paddingVertical: S.sm,
    paddingHorizontal: S.xs,
    alignItems: 'center',
    ...S.cardShadow,
  },
  summaryPillEmphasis: { backgroundColor: C.amberLight, borderColor: C.amber },
  summaryValue: { ...T.h3, color: C.forest },
  summaryValueEmphasis: { color: C.clay },
  summaryLabel: { ...T.caption, color: C.stone, textAlign: 'center', marginTop: 1 },
  summaryLabelEmphasis: { color: C.clay },
  sectionHeader: { marginBottom: S.sm, marginTop: S.sm },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...T.h2, color: C.forest },
  sectionCount: { ...T.badge, color: C.stone },
  sectionSubtitle: { ...T.caption, color: C.stone, marginTop: 2 },
  card: { ...shared.card, marginBottom: S.md },
  cardNeedsAction: { borderLeftWidth: 4, borderLeftColor: C.amber },
  cardReviewDue: { borderLeftWidth: 4, borderLeftColor: C.moss },
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
