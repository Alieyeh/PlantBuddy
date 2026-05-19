import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listingsService, LISTING_TYPES } from '../api/listingsService';
import { supabase } from '../lib/supabase';
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

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [handoff, setHandoff] = useState(null);
  const [mySwapProposal, setMySwapProposal] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const listingData = await listingsService.getListing(listingId);
        const [handoffData, myProposal] = await Promise.all([
          listingsService.getListingHandoff(listingId),
          user && listingData.listing_type === LISTING_TYPES.SWAP && listingData.owner_user_id !== user.id
            ? listingsService.getMySwapProposalForListing(listingId, user.id)
            : Promise.resolve(null),
        ]);

        setCurrentUserId(user?.id ?? null);
        setListing(listingData);
        setHandoff(handoffData);
        setMySwapProposal(myProposal);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [listingId]);

  useFocusEffect(load);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={C.amber} /></View>;
  }
  if (!listing) return null;

  const plant = listing.plants;
  const days = daysBetween(listing.sitting_start_date, listing.sitting_end_date);
  const isOwner = listing.owner_user_id === currentUserId;
  const isHandoffParticipant = handoff && (handoff.owner_user_id === currentUserId || handoff.recipient_user_id === currentUserId);
  const currentReview = handoff?.listing_handoff_reviews?.find((review) => review.reviewer_user_id === currentUserId);
  const revieweeUserId = handoff
    ? (currentUserId === handoff.owner_user_id ? handoff.recipient_user_id : handoff.owner_user_id)
    : null;
  const canConfirmHandoff = handoff && isHandoffParticipant && handoff.status !== 'COMPLETED' && handoff.status !== 'CANCELLED'
    && !((currentUserId === handoff.owner_user_id && handoff.owner_confirmed_at) || (currentUserId === handoff.recipient_user_id && handoff.recipient_confirmed_at));

  const modeLabel = listing.listing_type === LISTING_TYPES.SALE
    ? 'For sale'
    : listing.listing_type === LISTING_TYPES.GIFT
      ? 'Gift listing'
      : listing.listing_type === LISTING_TYPES.SWAP
        ? 'Swap listing'
        : 'Sitting request';

  const handleStartHandoff = () => {
    const noun = listing.listing_type === LISTING_TYPES.SALE ? 'purchase' : 'handoff';
    Alert.alert(
      `Start ${noun}?`,
      listing.listing_type === LISTING_TYPES.SALE
        ? 'This will reserve the listing for you while both sides confirm completion.'
        : 'This lets both sides confirm the exchange inside the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setActionLoading(true);
            try {
              const nextHandoff = await listingsService.startListingHandoff({
                listing,
                recipientUserId: currentUserId,
                notes: listing.listing_type === LISTING_TYPES.GIFT ? listing.gift_notes : listing.description,
              });
              setHandoff(nextHandoff);
              Alert.alert('Handoff started', 'Both sides can now confirm completion from this listing.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not start the handoff.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmHandoff = async () => {
    if (!handoff) return;
    setActionLoading(true);
    try {
      const updated = await listingsService.confirmListingHandoff(handoff.id);
      setHandoff(updated);
      Alert.alert(
        updated.status === 'COMPLETED' ? 'Handoff completed' : 'Confirmation saved',
        updated.status === 'COMPLETED'
          ? 'Both participants have confirmed the exchange.'
          : 'Your confirmation was recorded. Waiting for the other participant.'
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not confirm the handoff.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrimaryAction = () => {
    if (listing.listing_type === LISTING_TYPES.SITTING_REQUEST) {
      if (isOwner) {
        navigation.navigate('Applications', { listingId: listing.id, listingTitle: listing.title });
      } else {
        navigation.navigate('Apply', {
          listingId: listing.id,
          plantName: plant?.name,
          sittingStart: listing.sitting_start_date,
          sittingEnd: listing.sitting_end_date,
        });
      }
      return;
    }

    if (listing.listing_type === LISTING_TYPES.SWAP) {
      if (handoff && canConfirmHandoff) {
        handleConfirmHandoff();
      } else if (handoff && handoff.status === 'COMPLETED' && !currentReview && revieweeUserId) {
        navigation.navigate('HandoffReview', {
          handoffId: handoff.id,
          revieweeUserId,
          revieweeLabel: currentUserId === handoff.owner_user_id ? 'Swap partner' : 'Owner',
        });
      } else if (isOwner) {
        navigation.navigate('SwapProposals', {
          listingId: listing.id,
          listingTitle: listing.title,
          ownerUserId: listing.owner_user_id,
        });
      } else if (!mySwapProposal) {
        navigation.navigate('SwapProposal', {
          listingId: listing.id,
          listedPlantId: plant?.id,
          plantName: plant?.name,
        });
      }
      return;
    }

    if (handoff && canConfirmHandoff) {
      handleConfirmHandoff();
      return;
    }

    if (handoff && handoff.status === 'COMPLETED' && !currentReview && revieweeUserId) {
      navigation.navigate('HandoffReview', {
        handoffId: handoff.id,
        revieweeUserId,
        revieweeLabel: currentUserId === handoff.owner_user_id ? 'Recipient' : 'Owner',
      });
      return;
    }

    if (!isOwner && !handoff) {
      handleStartHandoff();
    }
  };

  const primaryActionLabel = (() => {
    if (listing.listing_type === LISTING_TYPES.SITTING_REQUEST) {
      return isOwner ? 'View applicants' : 'Apply to Sit';
    }

    if (handoff && canConfirmHandoff) {
      return currentUserId === handoff.owner_user_id ? 'Confirm handoff' : 'Confirm receipt';
    }

    if (handoff && handoff.status === 'COMPLETED' && !currentReview) {
      return 'Leave review';
    }

    if (listing.listing_type === LISTING_TYPES.SWAP) {
      if (isOwner) return 'View swap proposals';
      if (mySwapProposal) return null;
      return 'Propose swap';
    }

    if (isOwner || handoff) return null;

    return listing.listing_type === LISTING_TYPES.SALE ? 'Start purchase handoff' : 'Start gift handoff';
  })();

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.plantName}>{plant?.name}</Text>
              {plant?.species ? <Text style={styles.species}>{plant.species}</Text> : null}
              <Text style={styles.modeText}>{modeLabel}</Text>
            </View>
            {listing.listing_type === LISTING_TYPES.SITTING_REQUEST && days != null && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysText}>{days} days</Text>
              </View>
            )}
            {listing.listing_type === LISTING_TYPES.SALE && (
              <View style={styles.daysBadge}>
                <Text style={styles.daysText}>{listing.currency_code} {Number(listing.sale_price ?? 0).toFixed(2)}</Text>
              </View>
            )}
          </View>

          <View style={styles.careChips}>
            <CareChip icon="💧" label={plant?.watering_frequency_days ? `Every ${plant.watering_frequency_days} days` : null} />
            <CareChip icon="☀️" label={plant?.light_requirements} />
            <CareChip icon="🌫️" label={plant?.humidity_requirements} />
          </View>
        </View>

        {listing.listing_type === LISTING_TYPES.SITTING_REQUEST ? (
          <>
            <Text style={shared.sectionLabel}>Sitting Period</Text>
            <View style={styles.section}>
              <InfoRow label="From" value={formatDate(listing.sitting_start_date)} />
              <InfoRow label="Until" value={formatDate(listing.sitting_end_date)} />
            </View>
          </>
        ) : null}

        {/* About listing */}
        <Text style={shared.sectionLabel}>About this listing</Text>
        <View style={styles.section}>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          {listing.description ? <Text style={styles.bodyText}>{listing.description}</Text> : null}
          {listing.sitting_notes ? <Text style={styles.notesText}>{listing.sitting_notes}</Text> : null}
          {listing.gift_notes ? <Text style={styles.notesText}>{listing.gift_notes}</Text> : null}
          {listing.desired_swap_notes ? <Text style={styles.notesText}>{listing.desired_swap_notes}</Text> : null}
        </View>

        {handoff ? (
          <>
            <Text style={shared.sectionLabel}>Handoff</Text>
            <View style={styles.section}>
              <InfoRow label="Status" value={handoff.status.replace('_', ' ')} />
              <InfoRow label="Owner confirmed" value={handoff.owner_confirmed_at ? formatDate(handoff.owner_confirmed_at) : 'Pending'} />
              <InfoRow label="Recipient confirmed" value={handoff.recipient_confirmed_at ? formatDate(handoff.recipient_confirmed_at) : 'Pending'} />
              {handoff.completed_at ? <InfoRow label="Completed" value={formatDate(handoff.completed_at)} /> : null}
              {currentReview ? <Text style={styles.notesText}>You rated this exchange {currentReview.rating}/5.</Text> : null}
            </View>
          </>
        ) : null}

        {listing.listing_type === LISTING_TYPES.SWAP && mySwapProposal && !isOwner ? (
          <>
            <Text style={shared.sectionLabel}>Your proposal</Text>
            <View style={styles.section}>
              <InfoRow label="Status" value={mySwapProposal.status.replace('_', ' ')} />
              <InfoRow label="Offered plant" value={mySwapProposal.offered_plant?.name} />
              {mySwapProposal.message_to_owner ? <Text style={styles.notesText}>{mySwapProposal.message_to_owner}</Text> : null}
            </View>
          </>
        ) : null}

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
      {primaryActionLabel ? (
        <View style={styles.stickyBar}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handlePrimaryAction}
            activeOpacity={0.85}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.applyBtnText}>{primaryActionLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
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
  modeText: { ...T.badge, color: C.moss, marginTop: S.sm },
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
