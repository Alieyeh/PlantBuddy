import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listingsService } from '../api/listingsService';
import { C, T, S, shared } from '../lib/theme';

const STATUS = {
  PENDING:   { bg: C.statusPendingBg,   text: C.statusPendingText,   border: C.statusPendingBorder,   label: 'Pending' },
  ACCEPTED:  { bg: C.statusAcceptedBg,  text: C.statusAcceptedText,  border: C.statusAcceptedBorder,  label: 'Accepted' },
  DECLINED:  { bg: C.statusDeclinedBg,  text: C.statusDeclinedText,  border: C.statusDeclinedBorder,  label: 'Declined' },
  WITHDRAWN: { bg: C.mist,             text: C.stone,               border: C.sage,                  label: 'Withdrawn' },
};

const formatDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ApplicationsScreen({ route }) {
  const { listingId, listingTitle } = route.params;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await listingsService.getApplicationsForListing(listingId);
        setApplications(data);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [listingId]);

  useFocusEffect(fetchApplications);

  const handleUpdateStatus = (applicationId, newStatus) => {
    const isAccept = newStatus === 'ACCEPTED';
    Alert.alert(
      isAccept ? 'Accept this sitter?' : 'Decline this application?',
      isAccept
        ? "They'll be notified that their application was accepted."
        : "They'll be notified that their application was declined.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isAccept ? 'Accept' : 'Decline',
          style: isAccept ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await listingsService.updateApplicationStatus(applicationId, newStatus);
              setApplications((prev) =>
                prev.map((a) => a.id === applicationId ? { ...a, status: newStatus } : a)
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not update application');
            }
          },
        },
      ]
    );
  };

  const renderApplication = ({ item }) => {
    const st = STATUS[item.status] ?? STATUS.PENDING;
    const applicantName = item.users?.first_name || item.users?.username || 'Unknown';
    const isPending = item.status === 'PENDING';

    return (
      <View style={[styles.card, item.status === 'ACCEPTED' && styles.cardAccepted]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.applicantName}>{applicantName}</Text>
            {item.users?.username && (
              <Text style={styles.username}>@{item.users.username}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
          </View>
        </View>

        {item.message_to_lister ? (
          <Text style={styles.message}>{item.message_to_lister}</Text>
        ) : (
          <Text style={styles.noMessage}>No message provided</Text>
        )}

        {(item.proposed_start_date || item.proposed_end_date) && (
          <View style={styles.datesRow}>
            <Text style={styles.datesLabel}>📅 </Text>
            <Text style={styles.datesValue}>
              {formatDate(item.proposed_start_date)} → {formatDate(item.proposed_end_date)}
            </Text>
          </View>
        )}

        <Text style={styles.appliedAt}>Applied {formatDate(item.created_at)}</Text>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleUpdateStatus(item.id, 'ACCEPTED')}
              activeOpacity={0.85}
            >
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={() => handleUpdateStatus(item.id, 'DECLINED')}
              activeOpacity={0.85}
            >
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.subheader}>
        <Text style={styles.subheaderTitle} numberOfLines={1}>{listingTitle}</Text>
        <Text style={styles.count}>
          {applications.length} application{applications.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={C.amber} style={styles.loader} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderApplication}
          contentContainerStyle={applications.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>No applicants yet</Text>
              <Text style={styles.emptyBody}>Share your listing to find a sitter!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  subheader: {
    backgroundColor: C.white, paddingHorizontal: S.base, paddingVertical: S.sm,
    borderBottomWidth: 1, borderBottomColor: C.mist,
  },
  subheaderTitle: { ...T.body, color: C.slate, fontStyle: 'italic' },
  count: { ...T.caption, color: C.stone, marginTop: 2 },
  loader: { flex: 1 },
  listContent: { paddingTop: S.sm, paddingBottom: S.xxxl },
  card: {
    backgroundColor: C.white, marginHorizontal: S.base, marginTop: S.md,
    borderRadius: S.card, padding: S.base, ...S.cardShadow,
  },
  cardAccepted: { borderLeftWidth: 4, borderLeftColor: C.leaf },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: S.xs },
  applicantName: { ...T.h3, color: C.forest },
  username: { ...T.caption, color: C.stone, marginTop: 2 },
  badge: { borderRadius: S.chip, paddingHorizontal: S.sm, paddingVertical: 4, borderWidth: 1, marginLeft: S.sm },
  badgeText: { ...T.badge },
  message: { ...T.body, color: C.slate, lineHeight: 22, marginBottom: S.sm },
  noMessage: { ...T.body, color: C.stone, fontStyle: 'italic', marginBottom: S.sm },
  datesRow: { flexDirection: 'row', alignItems: 'center', marginBottom: S.xs },
  datesLabel: { ...T.caption },
  datesValue: { ...T.caption, color: C.slate, fontWeight: '600' },
  appliedAt: { ...T.caption, color: C.stone, marginTop: S.xs },
  actions: { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  acceptBtn: { flex: 1, ...shared.primaryButton, paddingVertical: 10, minHeight: 40 },
  acceptBtnText: { ...shared.primaryButtonText, fontSize: 14 },
  declineBtn: {
    flex: 1, borderRadius: S.button, paddingVertical: 10, minHeight: 40,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.sage,
  },
  declineBtnText: { ...T.label, color: C.terracotta },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: S.xl },
  emptyInner: { alignItems: 'center' },
  emptyIcon: { fontSize: 52, marginBottom: S.md },
  emptyTitle: { ...T.h2, textAlign: 'center', marginBottom: S.sm },
  emptyBody: { ...T.body, color: C.stone, textAlign: 'center' },
});
