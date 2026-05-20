-- =========================================================
-- PlantBuddy — Row Level Security Policies
--
-- Run this in the Supabase SQL editor AFTER applying
-- sql_build_tables.sql and enabling RLS on each table.
--
-- Enable RLS on a table:
--   ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
--
-- auth.uid() returns the UUID of the currently authenticated
-- Supabase Auth user. In this schema, users.id maps to the
-- Supabase auth.uid() — ensure your users table uses
-- auth.uid() as the primary key or stores it as a column.
-- =========================================================

-- =========================================================
-- ENABLE RLS ON ALL TABLES
-- =========================================================

ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_owner_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plants                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_photos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_care_tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_listings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_proposals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_plants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_handoffs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_ledger          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_availability     ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_handoff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_cases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log               ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USERS
-- =========================================================

-- Anyone authenticated can read public user profiles
CREATE POLICY "users_select_authenticated"
  ON users FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Users can only update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert handled by Supabase Auth trigger (not direct client insert)

-- =========================================================
-- OWNER PROFILES
-- =========================================================

CREATE POLICY "owner_profiles_select_authenticated"
  ON owner_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "owner_profiles_insert_own"
  ON owner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner_profiles_update_own"
  ON owner_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- SITTER PROFILES
-- =========================================================

CREATE POLICY "sitter_profiles_select_authenticated"
  ON sitter_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sitter_profiles_insert_own"
  ON sitter_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sitter_profiles_update_own"
  ON sitter_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- STORE OWNER PROFILES
-- =========================================================

CREATE POLICY "store_owner_profiles_select_authenticated"
  ON store_owner_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "store_owner_profiles_insert_own"
  ON store_owner_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "store_owner_profiles_update_own"
  ON store_owner_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- PLANTS
-- =========================================================

-- All authenticated users can see active plants (needed for listings browse)
CREATE POLICY "plants_select_authenticated"
  ON plants FOR SELECT
  TO authenticated
  USING (is_active = true AND archived_at IS NULL);

-- Owners can only insert plants owned by themselves
CREATE POLICY "plants_insert_own"
  ON plants FOR INSERT
  TO authenticated
  WITH CHECK (current_owner_user_id = auth.uid());

-- Owners can only update their own plants
CREATE POLICY "plants_update_own"
  ON plants FOR UPDATE
  TO authenticated
  USING (current_owner_user_id = auth.uid())
  WITH CHECK (current_owner_user_id = auth.uid());

-- Soft-delete only (handled via update above; no hard delete allowed from client)

-- =========================================================
-- PLANT PHOTOS
-- =========================================================

CREATE POLICY "plant_photos_select_authenticated"
  ON plant_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plant_photos_insert_own"
  ON plant_photos FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by_user_id = auth.uid());

CREATE POLICY "plant_photos_delete_own"
  ON plant_photos FOR DELETE
  TO authenticated
  USING (uploaded_by_user_id = auth.uid());

-- =========================================================
-- PLANT CARE TASKS
-- =========================================================

-- Visible to anyone who can see the plant (owner + sitter during contract)
CREATE POLICY "plant_care_tasks_select_authenticated"
  ON plant_care_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_care_tasks.plant_id
        AND p.is_active = true
    )
  );

-- Only plant owner can create/update/delete care tasks
CREATE POLICY "plant_care_tasks_write_own"
  ON plant_care_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_care_tasks.plant_id
        AND p.current_owner_user_id = auth.uid()
    )
  );

CREATE POLICY "plant_care_tasks_update_own"
  ON plant_care_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_care_tasks.plant_id
        AND p.current_owner_user_id = auth.uid()
    )
  );

CREATE POLICY "plant_care_tasks_delete_own"
  ON plant_care_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_care_tasks.plant_id
        AND p.current_owner_user_id = auth.uid()
    )
  );

-- =========================================================
-- PLANT LISTINGS
-- =========================================================

-- All authenticated users can browse OPEN listings
CREATE POLICY "plant_listings_select_open"
  ON plant_listings FOR SELECT
  TO authenticated
  USING (
    status = 'OPEN'
    OR owner_user_id = auth.uid()
    OR store_owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listing_handoffs lh
      WHERE lh.listing_id = plant_listings.id
        AND (lh.owner_user_id = auth.uid() OR lh.recipient_user_id = auth.uid())
    )
  );

-- Owners can create listings for their own plants
CREATE POLICY "plant_listings_insert_own"
  ON plant_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_listings.plant_id
        AND p.current_owner_user_id = auth.uid()
        AND p.is_active = TRUE
        AND p.archived_at IS NULL
    )
    AND (
      (owner_user_id = auth.uid() AND store_owner_user_id IS NULL)
      OR
      (
        store_owner_user_id = auth.uid()
        AND owner_user_id IS NULL
        AND EXISTS (
          SELECT 1 FROM store_owner_profiles sop
          WHERE sop.user_id = auth.uid()
            AND sop.is_approved = TRUE
        )
      )
    )
  );

-- Owners can update/cancel their own listings
CREATE POLICY "plant_listings_update_own"
  ON plant_listings FOR UPDATE
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR store_owner_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = plant_listings.plant_id
        AND p.current_owner_user_id = auth.uid()
        AND p.is_active = TRUE
        AND p.archived_at IS NULL
    )
    AND (
      (owner_user_id = auth.uid() AND store_owner_user_id IS NULL)
      OR
      (
        store_owner_user_id = auth.uid()
        AND owner_user_id IS NULL
        AND EXISTS (
          SELECT 1 FROM store_owner_profiles sop
          WHERE sop.user_id = auth.uid()
            AND sop.is_approved = TRUE
        )
      )
    )
  );

-- =========================================================
-- LISTING APPLICATIONS
-- =========================================================

-- Applicant can see their own applications; listing owner can see all applications for their listing
CREATE POLICY "listing_applications_select"
  ON listing_applications FOR SELECT
  TO authenticated
  USING (
    applicant_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.owner_user_id = auth.uid()
    )
  );

-- Only sitter-profile users can apply to open sitting listings they do not own.
CREATE POLICY "listing_applications_insert"
  ON listing_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_user_id = auth.uid()
    AND status = 'PENDING'
    AND EXISTS (
      SELECT 1 FROM sitter_profiles sp
      WHERE sp.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.status = 'OPEN'
        AND COALESCE(pl.owner_user_id, pl.store_owner_user_id) <> auth.uid()
    )
  );

-- Applicant can update their own (withdraw); owner can update status (accept/decline)
CREATE POLICY "listing_applications_update"
  ON listing_applications FOR UPDATE
  TO authenticated
  USING (
    applicant_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    (
      applicant_user_id = auth.uid()
      AND status = 'WITHDRAWN'
    )
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.owner_user_id = auth.uid()
    )
  );

-- =========================================================
-- SWAP PROPOSALS
-- =========================================================

CREATE POLICY "swap_proposals_select"
  ON swap_proposals FOR SELECT
  TO authenticated
  USING (
    proposer_owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = swap_proposals.listing_id
        AND pl.listing_type = 'SWAP'
        AND pl.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "swap_proposals_insert"
  ON swap_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    proposer_owner_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = swap_proposals.listing_id
        AND pl.listing_type = 'SWAP'
        AND pl.status = 'OPEN'
        AND pl.owner_user_id <> auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM plants p
      WHERE p.id = swap_proposals.offered_plant_id
        AND p.current_owner_user_id = auth.uid()
        AND p.is_active = TRUE
        AND p.archived_at IS NULL
    )
  );

CREATE POLICY "swap_proposals_update"
  ON swap_proposals FOR UPDATE
  TO authenticated
  USING (
    proposer_owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = swap_proposals.listing_id
        AND pl.listing_type = 'SWAP'
        AND pl.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    proposer_owner_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM plant_listings pl
      WHERE pl.id = swap_proposals.listing_id
        AND pl.listing_type = 'SWAP'
        AND pl.owner_user_id = auth.uid()
    )
  );

-- =========================================================
-- CONTRACTS
-- =========================================================

-- Only the owner or sitter on the contract can see it
CREATE POLICY "contracts_select"
  ON contracts FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid() OR sitter_user_id = auth.uid());

CREATE POLICY "contracts_insert"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND (
      owner_user_id = auth.uid()
      OR sitter_user_id = auth.uid()
    )
  );

CREATE POLICY "contracts_update"
  ON contracts FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid() OR sitter_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid() OR sitter_user_id = auth.uid());

-- =========================================================
-- CONTRACT PLANTS
-- =========================================================

CREATE POLICY "contract_plants_select"
  ON contract_plants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_plants.contract_id
        AND (c.owner_user_id = auth.uid() OR c.sitter_user_id = auth.uid())
    )
  );

CREATE POLICY "contract_plants_insert"
  ON contract_plants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contracts c
      WHERE c.id = contract_plants.contract_id
        AND (c.owner_user_id = auth.uid() OR c.sitter_user_id = auth.uid())
    )
  );

-- =========================================================
-- LISTING HANDOFFS
-- =========================================================

CREATE POLICY "listing_handoffs_select"
  ON listing_handoffs FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid() OR recipient_user_id = auth.uid());

CREATE POLICY "listing_handoffs_insert"
  ON listing_handoffs FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by_user_id = auth.uid()
    AND (owner_user_id = auth.uid() OR recipient_user_id = auth.uid())
  );

CREATE POLICY "listing_handoffs_update"
  ON listing_handoffs FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid() OR recipient_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid() OR recipient_user_id = auth.uid());

-- =========================================================
-- CONVERSATIONS + MESSAGES
-- =========================================================

CREATE POLICY "conversations_select"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversations.id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true); -- participants row added separately

CREATE POLICY "conversation_participants_select"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "conversation_participants_insert"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (true); -- any participant can add others at creation

CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "message_attachments_select"
  ON message_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "message_attachments_insert"
  ON message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_attachments.message_id
        AND cp.user_id = auth.uid()
        AND m.sender_user_id = auth.uid()
    )
  );

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only service role inserts notifications (from triggers/functions)
-- No client INSERT policy — notifications are created server-side

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =========================================================
-- PAYMENT LEDGER
-- =========================================================

-- Users can only see ledger rows where they are payer or payee
CREATE POLICY "payment_ledger_select"
  ON payment_ledger FOR SELECT
  TO authenticated
  USING (payer_user_id = auth.uid() OR payee_user_id = auth.uid());

-- No client INSERT — payments inserted by server-side functions only

-- =========================================================
-- SITTER AVAILABILITY
-- =========================================================

CREATE POLICY "sitter_availability_select_authenticated"
  ON sitter_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sitter_availability_insert_own"
  ON sitter_availability FOR INSERT
  TO authenticated
  WITH CHECK (sitter_user_id = auth.uid());

CREATE POLICY "sitter_availability_update_own"
  ON sitter_availability FOR UPDATE
  TO authenticated
  USING (sitter_user_id = auth.uid())
  WITH CHECK (sitter_user_id = auth.uid());

CREATE POLICY "sitter_availability_delete_own"
  ON sitter_availability FOR DELETE
  TO authenticated
  USING (sitter_user_id = auth.uid());

-- =========================================================
-- SITTER REVIEWS
-- =========================================================

-- Reviews are public to all authenticated users
CREATE POLICY "sitter_reviews_select_authenticated"
  ON sitter_reviews FOR SELECT
  TO authenticated
  USING (true);

-- Only the owner on the contract can write a review
CREATE POLICY "sitter_reviews_insert_own"
  ON sitter_reviews FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "sitter_reviews_update_own"
  ON sitter_reviews FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- =========================================================
-- LISTING HANDOFF REVIEWS
-- =========================================================

CREATE POLICY "listing_handoff_reviews_select_authenticated"
  ON listing_handoff_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "listing_handoff_reviews_insert_own"
  ON listing_handoff_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM listing_handoffs lh
      WHERE lh.id = listing_handoff_reviews.handoff_id
        AND lh.status = 'COMPLETED'
        AND (
          (lh.owner_user_id = auth.uid() AND listing_handoff_reviews.reviewee_user_id = lh.recipient_user_id)
          OR
          (lh.recipient_user_id = auth.uid() AND listing_handoff_reviews.reviewee_user_id = lh.owner_user_id)
        )
    )
  );

CREATE POLICY "listing_handoff_reviews_update_own"
  ON listing_handoff_reviews FOR UPDATE
  TO authenticated
  USING (reviewer_user_id = auth.uid())
  WITH CHECK (reviewer_user_id = auth.uid());

-- =========================================================
-- STORE ORDERS
-- =========================================================

CREATE POLICY "store_orders_select"
  ON store_orders FOR SELECT
  TO authenticated
  USING (buyer_user_id = auth.uid() OR store_owner_user_id = auth.uid());

CREATE POLICY "store_orders_insert"
  ON store_orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY "store_orders_update"
  ON store_orders FOR UPDATE
  TO authenticated
  USING (buyer_user_id = auth.uid() OR store_owner_user_id = auth.uid());

-- =========================================================
-- MODERATION CASES
-- =========================================================

-- Users can see cases they reported
CREATE POLICY "moderation_cases_select_own"
  ON moderation_cases FOR SELECT
  TO authenticated
  USING (reported_by_user_id = auth.uid());

-- Any authenticated user can file a report
CREATE POLICY "moderation_cases_insert"
  ON moderation_cases FOR INSERT
  TO authenticated
  WITH CHECK (reported_by_user_id = auth.uid());

-- =========================================================
-- AUDIT LOG
-- =========================================================

-- Users can only see their own audit entries
CREATE POLICY "audit_log_select_own"
  ON audit_log FOR SELECT
  TO authenticated
  USING (actor_user_id = auth.uid());

-- Audit log is insert-only from service role — no client inserts
