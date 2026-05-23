import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listingsService, LISTING_TYPES } from '../api/listingsService';
import { supabase } from '../lib/supabase';
import { C, T, S, shared } from '../lib/theme';
import { formatWateringFrequency } from '../utils/plantForm';

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

function PlantIllustration() {
  return (
    <View style={styles.plantIllustration} accessible accessibilityLabel="Decorative plant illustration">
      <View style={styles.illustrationHalo} />
      <View style={styles.illustrationShelf} />
      <View style={styles.leafCluster}>
        <View style={[styles.leafShape, styles.leafLeft]} />
        <View style={[styles.leafShape, styles.leafCenter]} />
        <View style={[styles.leafShape, styles.leafRight]} />
        <View style={[styles.leafShape, styles.leafSmall]} />
      </View>
      <View style={styles.stem} />
      <View style={styles.potRim} />
      <View style={styles.potBody} />
    </View>
  );
}

function HeroVines() {
  return (
    <View style={styles.heroVines} pointerEvents="none">
      <View style={[styles.vineLine, styles.vineOne]} />
      <View style={[styles.vineLine, styles.vineTwo]} />
      <View style={[styles.tinyLeaf, styles.tinyLeafOne]} />
      <View style={[styles.tinyLeaf, styles.tinyLeafTwo]} />
      <View style={[styles.tinyLeaf, styles.tinyLeafThree]} />
      <View style={[styles.tinyLeaf, styles.tinyLeafFour]} />
      <View style={styles.gardenBed} />
    </View>
  );
}

function DetailStat({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.detailStat}>
      <Text style={styles.detailStatLabel}>{label}</Text>
      <Text style={styles.detailStatValue}>{value}</Text>
    </View>
  );
}

function CareTile({ title, value, accentColor }) {
  if (!value) return null;
  return (
    <View style={styles.careTile}>
      <View style={[styles.careTileAccent, { backgroundColor: accentColor }]} />
      <Text style={styles.careTileTitle}>{title}</Text>
      <Text style={styles.careTileValue}>{value}</Text>
    </View>
  );
}

function PlantNotesCard({ title, children }) {
  if (!children) return null;
  return (
    <View style={styles.notePanel}>
      <Text style={styles.notePanelTitle}>{title}</Text>
      <Text style={styles.notePanelText}>{children}</Text>
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
  const headlineDetail = plant?.health_status || plant?.size_description || 'Plant profile';
  const wateringFrequencyLabel = formatWateringFrequency(
    plant?.watering_frequency_days,
    plant?.watering_frequency_unit
  );
  const compactWateringFrequencyLabel = formatWateringFrequency(
    plant?.watering_frequency_days,
    plant?.watering_frequency_unit,
    true
  );
  const careSummary = [
    wateringFrequencyLabel,
    plant?.light_requirements,
    plant?.humidity_requirements,
  ].filter(Boolean);
  const plantSummary = plant?.description || listing.description || 'A plant waiting for the right match.';

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

        {/* Plant profile hero */}
        <View style={styles.heroCard}>
          <HeroVines />
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <View style={styles.modePill}>
                <Text style={styles.modeText}>{modeLabel}</Text>
              </View>
              <Text style={styles.plantName}>{plant?.name || 'Plant profile'}</Text>
              {plant?.species ? <Text style={styles.species}>{plant.species}</Text> : null}
              <Text style={styles.heroHint}>{headlineDetail}</Text>
              <Text style={styles.heroSummary} numberOfLines={3}>{plantSummary}</Text>
            </View>
            <PlantIllustration />
          </View>

          <View style={styles.detailStats}>
            <DetailStat label="Mode" value={modeLabel} />
            {listing.listing_type === LISTING_TYPES.SITTING_REQUEST && days != null ? <DetailStat label="Duration" value={`${days} days`} /> : null}
            {listing.listing_type === LISTING_TYPES.SALE ? <DetailStat label="Price" value={`${listing.currency_code} ${Number(listing.sale_price ?? 0).toFixed(2)}`} /> : null}
            {compactWateringFrequencyLabel ? <DetailStat label="Water" value={compactWateringFrequencyLabel} /> : null}
          </View>

          {careSummary.length > 0 ? <Text style={styles.careIntro}>Care snapshot</Text> : null}
          <View style={styles.careGrid}>
            <CareTile title="Water rhythm" value={wateringFrequencyLabel} accentColor={C.leaf} />
            <CareTile title="Light mood" value={plant?.light_requirements} accentColor={C.amber} />
            <CareTile title="Humidity" value={plant?.humidity_requirements} accentColor={C.moss} />
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
          <PlantNotesCard title="Sitting notes">{listing.sitting_notes}</PlantNotesCard>
          <PlantNotesCard title="Gift notes">{listing.gift_notes}</PlantNotesCard>
          <PlantNotesCard title="Swap wishes">{listing.desired_swap_notes}</PlantNotesCard>
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
          <View style={styles.plantCareGrid}>
            <DetailStat label="Size" value={plant?.size_description || 'Not set'} />
            <DetailStat label="Health" value={plant?.health_status || 'Not set'} />
            <DetailStat label="Species" value={plant?.species || 'Not set'} />
          </View>
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
    backgroundColor: '#fffaf7',
    borderRadius: 22,
    padding: S.lg,
    marginBottom: S.md,
    borderWidth: 1,
    borderColor: C.amberLight,
    overflow: 'hidden',
    ...S.cardShadowElevated,
  },
  heroVines: {
    ...StyleSheet.absoluteFillObject,
  },
  vineLine: {
    position: 'absolute',
    width: 2,
    height: 138,
    backgroundColor: '#dfe9db',
    borderRadius: 2,
  },
  vineOne: { right: 28, top: -18, transform: [{ rotate: '-18deg' }] },
  vineTwo: { right: 72, top: -34, transform: [{ rotate: '18deg' }] },
  tinyLeaf: {
    position: 'absolute',
    width: 14,
    height: 24,
    backgroundColor: '#cfe0c6',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 18,
  },
  tinyLeafOne: { right: 26, top: 32, transform: [{ rotate: '34deg' }] },
  tinyLeafTwo: { right: 67, top: 24, transform: [{ rotate: '-38deg' }] },
  tinyLeafThree: { right: 40, top: 78, transform: [{ rotate: '-28deg' }] },
  tinyLeafFour: { right: 86, top: 82, transform: [{ rotate: '32deg' }] },
  gardenBed: {
    position: 'absolute',
    left: -24,
    right: -24,
    bottom: -20,
    height: 64,
    backgroundColor: '#eef3e8',
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
  },
  heroTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: S.base,
    marginBottom: S.md,
  },
  heroCopy: { flex: 1, minWidth: 190, paddingRight: S.sm },
  modePill: {
    alignSelf: 'flex-start',
    backgroundColor: C.mist,
    borderRadius: S.chip,
    borderWidth: 1,
    borderColor: C.sage,
    paddingHorizontal: S.md,
    paddingVertical: 6,
    marginBottom: S.sm,
  },
  plantName: { ...T.hero, fontSize: 34, lineHeight: 40 },
  species: { ...T.caption, fontSize: 12, fontStyle: 'italic', color: C.stone, marginTop: 3 },
  modeText: { ...T.badge, color: C.moss },
  heroHint: { ...T.caption, color: C.clay, marginTop: S.sm, fontWeight: '700' },
  heroSummary: { ...T.body, color: C.slate, marginTop: S.sm, maxWidth: 420 },
  plantIllustration: {
    width: 138,
    height: 148,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  illustrationHalo: {
    position: 'absolute',
    width: 124,
    height: 96,
    bottom: 14,
    backgroundColor: '#f7e5d4',
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#f2cfb6',
  },
  illustrationShelf: {
    position: 'absolute',
    width: 110,
    height: 10,
    bottom: 0,
    backgroundColor: C.forest,
    borderRadius: 999,
    opacity: 0.12,
  },
  leafCluster: {
    position: 'absolute',
    top: 10,
    width: 118,
    height: 88,
  },
  leafShape: {
    position: 'absolute',
    width: 42,
    height: 62,
    backgroundColor: C.leaf,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    borderColor: C.forest,
  },
  leafLeft: { left: 8, top: 28, transform: [{ rotate: '-38deg' }], backgroundColor: C.moss },
  leafCenter: { left: 38, top: 6, height: 70, transform: [{ rotate: '-5deg' }] },
  leafRight: { right: 8, top: 26, transform: [{ rotate: '34deg' }], backgroundColor: C.sage },
  leafSmall: { left: 68, top: 0, width: 28, height: 46, transform: [{ rotate: '24deg' }], backgroundColor: C.amberLight },
  stem: {
    width: 6,
    height: 60,
    backgroundColor: C.moss,
    borderRadius: 6,
    marginBottom: -5,
  },
  potRim: {
    width: 72,
    height: 16,
    backgroundColor: C.amber,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  potBody: {
    width: 58,
    height: 42,
    backgroundColor: C.terracotta,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  detailStats: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginBottom: S.md },
  detailStat: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: S.md,
    borderWidth: 1,
    borderColor: C.mist,
    paddingHorizontal: S.md,
    paddingVertical: S.sm,
    minWidth: 92,
  },
  detailStatLabel: { ...T.caption, color: C.stone, marginBottom: 2 },
  detailStatValue: { ...T.label, color: C.forest },
  careIntro: { ...T.caption, color: C.moss, fontWeight: '700', marginBottom: S.sm },
  careGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  careTile: {
    flexGrow: 1,
    flexBasis: 138,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: S.md,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.mist,
    minHeight: 82,
  },
  careTileAccent: {
    width: 34,
    height: 4,
    borderRadius: 999,
    marginBottom: S.sm,
  },
  careTileTitle: { ...T.caption, color: C.stone, fontWeight: '700', textTransform: 'uppercase' },
  careTileValue: { ...T.label, color: C.forest, marginTop: 3 },
  section: {
    backgroundColor: C.white, borderRadius: S.card,
    padding: S.base, marginBottom: S.md,
    ...S.cardShadow,
  },
  listingTitle: { ...T.h3, color: C.ink, marginBottom: S.sm },
  bodyText: { ...T.body, color: C.slate, lineHeight: 22 },
  notesText: { ...T.body, color: C.slate, fontStyle: 'italic', marginTop: S.sm },
  notePanel: {
    backgroundColor: C.mist,
    borderRadius: S.md,
    borderWidth: 1,
    borderColor: '#d9e7dc',
    padding: S.md,
    marginTop: S.md,
  },
  notePanelTitle: { ...T.badge, color: C.moss, marginBottom: S.xs },
  notePanelText: { ...T.body, color: C.ink, lineHeight: 22 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.mist,
  },
  infoLabel: { ...T.label, color: C.stone },
  infoValue: { ...T.label, color: C.ink, flex: 1, textAlign: 'right' },
  plantCareGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
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
