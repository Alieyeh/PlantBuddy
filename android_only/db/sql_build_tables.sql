BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;

-- =========================================================
-- ENUMS
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'PENDING_VERIFICATION');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
        CREATE TYPE listing_type AS ENUM ('SITTING_REQUEST', 'GIFT', 'SWAP', 'SALE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
        CREATE TYPE listing_status AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'MATCHED', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'EXPIRED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'swap_status') THEN
        CREATE TYPE swap_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
        CREATE TYPE contract_status AS ENUM ('DRAFT', 'PENDING_OWNER', 'PENDING_SITTER', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE message_type AS ENUM ('TEXT', 'SYSTEM', 'IMAGE', 'FILE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'APPLICATION_RECEIVED',
            'APPLICATION_ACCEPTED',
            'APPLICATION_DECLINED',
            'SWAP_PROPOSAL_RECEIVED',
            'SWAP_PROPOSAL_ACCEPTED',
            'SWAP_PROPOSAL_DECLINED',
            'CONTRACT_CREATED',
            'CONTRACT_ACCEPTED',
            'MESSAGE_RECEIVED',
            'ORDER_CREATED',
            'PAYMENT_POSTED',
            'SYSTEM_ALERT'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_direction') THEN
        CREATE TYPE payment_direction AS ENUM ('DEBIT', 'CREDIT');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('PENDING', 'AUTHORIZED', 'SETTLED', 'FAILED', 'REFUNDED', 'VOIDED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'availability_status') THEN
        CREATE TYPE availability_status AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'BOOKED', 'TENTATIVE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attachment_kind') THEN
        CREATE TYPE attachment_kind AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
        CREATE TYPE moderation_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'ACTION_TAKEN', 'DISMISSED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELLED', 'REFUNDED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'handoff_status') THEN
        CREATE TYPE handoff_status AS ENUM ('PENDING', 'OWNER_CONFIRMED', 'RECIPIENT_CONFIRMED', 'COMPLETED', 'CANCELLED');
    END IF;
END$$;

-- =========================================================
-- USERS
-- id = auth.uid() UUID from Supabase Auth.
-- password_hash and refresh_tokens are owned by Supabase Auth
-- and live in the auth schema — not duplicated here.

CREATE OR REPLACE FUNCTION public.confirm_listing_handoff(p_handoff_id BIGINT)
RETURNS public.listing_handoffs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor UUID := auth.uid();
    v_now TIMESTAMPTZ := NOW();
    v_handoff public.listing_handoffs%ROWTYPE;
    v_listing public.plant_listings%ROWTYPE;
    v_swap_offered_plant_id BIGINT;
BEGIN
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT *
    INTO v_handoff
    FROM public.listing_handoffs
    WHERE id = p_handoff_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Handoff % does not exist', p_handoff_id;
    END IF;

    IF v_actor <> v_handoff.owner_user_id AND v_actor <> v_handoff.recipient_user_id THEN
        RAISE EXCEPTION 'Only handoff participants can confirm completion';
    END IF;

    IF v_handoff.status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Cancelled handoffs cannot be confirmed';
    END IF;

    IF v_handoff.status = 'COMPLETED' THEN
        RETURN v_handoff;
    END IF;

    IF v_actor = v_handoff.owner_user_id THEN
        UPDATE public.listing_handoffs
        SET owner_confirmed_at = COALESCE(owner_confirmed_at, v_now),
            status = CASE
                WHEN recipient_confirmed_at IS NOT NULL THEN 'COMPLETED'::handoff_status
                ELSE 'OWNER_CONFIRMED'::handoff_status
            END,
            completed_at = CASE
                WHEN recipient_confirmed_at IS NOT NULL THEN COALESCE(completed_at, v_now)
                ELSE completed_at
            END,
            updated_at = v_now
        WHERE id = p_handoff_id;
    ELSE
        UPDATE public.listing_handoffs
        SET recipient_confirmed_at = COALESCE(recipient_confirmed_at, v_now),
            status = CASE
                WHEN owner_confirmed_at IS NOT NULL THEN 'COMPLETED'::handoff_status
                ELSE 'RECIPIENT_CONFIRMED'::handoff_status
            END,
            completed_at = CASE
                WHEN owner_confirmed_at IS NOT NULL THEN COALESCE(completed_at, v_now)
                ELSE completed_at
            END,
            updated_at = v_now
        WHERE id = p_handoff_id;
    END IF;

    SELECT *
    INTO v_handoff
    FROM public.listing_handoffs
    WHERE id = p_handoff_id;

    IF v_handoff.status = 'COMPLETED' THEN
        SELECT *
        INTO v_listing
        FROM public.plant_listings
        WHERE id = v_handoff.listing_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Listing % does not exist', v_handoff.listing_id;
        END IF;

        UPDATE public.plant_listings
        SET status = 'COMPLETED',
            updated_at = v_now
        WHERE id = v_listing.id
          AND status <> 'COMPLETED';

        IF v_listing.listing_type IN ('SALE', 'GIFT') THEN
            UPDATE public.plants
            SET current_owner_user_id = v_handoff.recipient_user_id,
                updated_at = v_now
            WHERE id = v_listing.plant_id;
        ELSIF v_listing.listing_type = 'SWAP' THEN
            SELECT offered_plant_id
            INTO v_swap_offered_plant_id
            FROM public.swap_proposals
            WHERE id = v_handoff.swap_proposal_id
            FOR UPDATE;

            IF v_swap_offered_plant_id IS NULL THEN
                RAISE EXCEPTION 'Swap handoff % is missing its accepted proposal plant', p_handoff_id;
            END IF;

            UPDATE public.plants
            SET current_owner_user_id = v_handoff.recipient_user_id,
                updated_at = v_now
            WHERE id = v_listing.plant_id;

            UPDATE public.plants
            SET current_owner_user_id = v_handoff.owner_user_id,
                updated_at = v_now
            WHERE id = v_swap_offered_plant_id;

            UPDATE public.swap_proposals
            SET status = CASE
                    WHEN id = v_handoff.swap_proposal_id THEN 'COMPLETED'::swap_status
                    ELSE 'DECLINED'::swap_status
                END,
                responded_at = COALESCE(responded_at, v_now),
                updated_at = v_now
            WHERE listing_id = v_handoff.listing_id
              AND status IN ('PENDING', 'ACCEPTED');
        END IF;
    END IF;

    SELECT *
    INTO v_handoff
    FROM public.listing_handoffs
    WHERE id = p_handoff_id;

    RETURN v_handoff;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_listing_handoff(BIGINT) TO authenticated;
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id                          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username                    CITEXT NOT NULL UNIQUE,
    email                       CITEXT NOT NULL UNIQUE,
    phone_number                VARCHAR(30),
    first_name                  VARCHAR(100),
    last_name                   VARCHAR(100),
    bio                         TEXT,
    city                        VARCHAR(120),
    region                      VARCHAR(120),
    country_code                CHAR(2),
    profile_photo_url           TEXT,
    status                      user_status NOT NULL DEFAULT 'ACTIVE',
    email_verified_at           TIMESTAMPTZ,
    last_login_at               TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

-- Auto-create a users row and a default owner_profiles row when someone
-- signs up via Supabase Auth. username and display_name come from
-- options.data passed in signUp(). Every user gets owner_profiles so
-- they can add plants immediately without a separate onboarding step.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_display_name VARCHAR(120);
BEGIN
    v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', '');

    INSERT INTO public.users (id, email, username, first_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        v_display_name
    )
    ON CONFLICT (id) DO NOTHING;

    -- Every new user becomes an owner by default so they can add plants
    -- immediately. Sitter profile is opt-in (Stage 2b).
    INSERT INTO public.owner_profiles (user_id, display_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- ROLE PROFILES
-- user_id is UUID FK → users(id)
-- =========================================================

CREATE TABLE IF NOT EXISTS owner_profiles (
    user_id                     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name                VARCHAR(120),
    address_line_1              VARCHAR(255),
    address_line_2              VARCHAR(255),
    postal_code                 VARCHAR(30),
    emergency_contact_name      VARCHAR(120),
    emergency_contact_phone     VARCHAR(30),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sitter_profiles (
    user_id                     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name                VARCHAR(120),
    experience_summary          TEXT,
    years_experience            INTEGER,
    base_daily_rate             NUMERIC(10,2),
    rating_average              NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    rating_count                INTEGER NOT NULL DEFAULT 0,
    can_travel                  BOOLEAN NOT NULL DEFAULT FALSE,
    travel_radius_km            INTEGER,
    identity_verified_at        TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sitter_profiles_years_chk CHECK (years_experience IS NULL OR years_experience >= 0),
    CONSTRAINT sitter_profiles_rate_chk CHECK (base_daily_rate IS NULL OR base_daily_rate >= 0)
);

CREATE TABLE IF NOT EXISTS store_owner_profiles (
    user_id                     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    store_name                  VARCHAR(180) NOT NULL,
    business_email              CITEXT,
    business_phone              VARCHAR(30),
    business_address_line_1     VARCHAR(255),
    business_address_line_2     VARCHAR(255),
    business_postal_code        VARCHAR(30),
    tax_identifier              VARCHAR(100),
    payout_account_ref          VARCHAR(255),
    approved_at                 TIMESTAMPTZ,
    approved_by_user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_notes              TEXT,
    is_approved                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PLANTS
-- current_owner_user_id is UUID FK → owner_profiles(user_id)
-- Non-user entity IDs remain BIGINT IDENTITY
-- =========================================================

CREATE TABLE IF NOT EXISTS plants (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    current_owner_user_id       UUID NOT NULL REFERENCES owner_profiles(user_id) ON DELETE RESTRICT,
    name                        VARCHAR(150) NOT NULL,
    species                     VARCHAR(150),
    description                 TEXT,
    age_description             VARCHAR(100),
    size_description            VARCHAR(100),
    health_status               VARCHAR(100),
    watering_frequency_days     INTEGER,
    watering_frequency_unit     TEXT NOT NULL DEFAULT 'days',
    light_requirements          VARCHAR(120),
    humidity_requirements       VARCHAR(120),
    special_instructions        TEXT,
    location_notes              TEXT,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at                 TIMESTAMPTZ,
    CONSTRAINT plants_watering_chk CHECK (watering_frequency_days IS NULL OR watering_frequency_days > 0),
    CONSTRAINT plants_watering_unit_chk CHECK (watering_frequency_unit IN ('days', 'weeks', 'months')),
    CONSTRAINT plants_age_description_chk CHECK (
        age_description IS NULL OR age_description IN (
            'Cutting / propagation',
            'Seedling',
            'Young plant',
            'Mature plant',
            'Established plant'
        )
    )
);

CREATE TABLE IF NOT EXISTS plant_photos (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plant_id                    BIGINT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    storage_key                 TEXT NOT NULL,
    public_url                  TEXT,
    content_type                VARCHAR(100),
    file_size_bytes             BIGINT,
    sort_order                  INTEGER NOT NULL DEFAULT 0,
    uploaded_by_user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plant_care_tasks (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plant_id                    BIGINT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    task_name                   VARCHAR(150) NOT NULL,
    instructions                TEXT,
    frequency_days              INTEGER,
    preferred_time_note         VARCHAR(120),
    is_required                 BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PLANT LISTINGS
-- owner_user_id / store_owner_user_id are UUID FKs
-- =========================================================

CREATE TABLE IF NOT EXISTS plant_listings (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    plant_id                    BIGINT NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    listing_type                listing_type NOT NULL,
    status                      listing_status NOT NULL DEFAULT 'DRAFT',

    owner_user_id               UUID REFERENCES owner_profiles(user_id) ON DELETE CASCADE,
    store_owner_user_id         UUID REFERENCES store_owner_profiles(user_id) ON DELETE CASCADE,

    title                       VARCHAR(200) NOT NULL,
    description                 TEXT,

    desired_swap_notes          TEXT,
    gift_notes                  TEXT,
    sitting_start_date          DATE,
    sitting_end_date            DATE,
    sitting_notes               TEXT,

    sale_price                  NUMERIC(10,2),
    currency_code               CHAR(3),

    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at                TIMESTAMPTZ,
    closed_at                   TIMESTAMPTZ,

    CONSTRAINT plant_listings_sale_price_chk
        CHECK (sale_price IS NULL OR sale_price >= 0),

    CONSTRAINT plant_listings_sitting_dates_chk
        CHECK (
            sitting_start_date IS NULL
            OR sitting_end_date IS NULL
            OR sitting_end_date >= sitting_start_date
        ),

    CONSTRAINT plant_listings_owner_or_store_chk
        CHECK (
            (owner_user_id IS NOT NULL AND store_owner_user_id IS NULL)
            OR
            (owner_user_id IS NULL AND store_owner_user_id IS NOT NULL)
        ),

    CONSTRAINT plant_listings_sale_requires_price_chk
        CHECK (
            (listing_type <> 'SALE')
            OR
            (sale_price IS NOT NULL AND currency_code IS NOT NULL)
        ),

    CONSTRAINT plant_listings_non_sale_clears_price_chk
        CHECK (
            (listing_type = 'SALE')
            OR
            (sale_price IS NULL AND currency_code IS NULL)
        ),

    CONSTRAINT plant_listings_sitting_requires_dates_chk
        CHECK (
            (listing_type <> 'SITTING_REQUEST')
            OR
            (sitting_start_date IS NOT NULL AND sitting_end_date IS NOT NULL)
        ),

    CONSTRAINT plant_listings_non_sitting_clears_dates_chk
        CHECK (
            (listing_type = 'SITTING_REQUEST')
            OR
            (sitting_start_date IS NULL AND sitting_end_date IS NULL)
        )
);

-- =========================================================
-- APPLICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS listing_applications (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT NOT NULL REFERENCES plant_listings(id) ON DELETE CASCADE,
    applicant_user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_to_lister           TEXT,
    proposed_start_date         DATE,
    proposed_end_date           DATE,
    proposed_price              NUMERIC(10,2),
    status                      application_status NOT NULL DEFAULT 'PENDING',
    responded_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT listing_applications_price_chk CHECK (proposed_price IS NULL OR proposed_price >= 0),
    CONSTRAINT listing_applications_dates_chk CHECK (
        proposed_start_date IS NULL
        OR proposed_end_date IS NULL
        OR proposed_end_date >= proposed_start_date
    ),
    CONSTRAINT listing_applications_unique UNIQUE (listing_id, applicant_user_id)
);

-- =========================================================
-- SWAP PROPOSALS
-- =========================================================

CREATE TABLE IF NOT EXISTS swap_proposals (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT NOT NULL REFERENCES plant_listings(id) ON DELETE CASCADE,
    proposer_owner_user_id      UUID NOT NULL REFERENCES owner_profiles(user_id) ON DELETE CASCADE,
    offered_plant_id            BIGINT NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    message_to_owner            TEXT,
    status                      swap_status NOT NULL DEFAULT 'PENDING',
    responded_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT swap_proposals_unique UNIQUE (listing_id, proposer_owner_user_id, offered_plant_id)
);

-- =========================================================
-- CONTRACTS
-- =========================================================

CREATE TABLE IF NOT EXISTS contracts (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT REFERENCES plant_listings(id) ON DELETE SET NULL,
    application_id              BIGINT UNIQUE REFERENCES listing_applications(id) ON DELETE SET NULL,
    owner_user_id               UUID NOT NULL REFERENCES owner_profiles(user_id) ON DELETE RESTRICT,
    sitter_user_id              UUID NOT NULL REFERENCES sitter_profiles(user_id) ON DELETE RESTRICT,
    title                       VARCHAR(200),
    description                 TEXT,
    start_date                  DATE NOT NULL,
    end_date                    DATE NOT NULL,
    agreed_price                NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency_code               CHAR(3) NOT NULL DEFAULT 'USD',
    status                      contract_status NOT NULL DEFAULT 'DRAFT',
    owner_accepted_at           TIMESTAMPTZ,
    sitter_accepted_at          TIMESTAMPTZ,
    cancelled_at                TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    created_by_user_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contracts_dates_chk CHECK (end_date >= start_date),
    CONSTRAINT contracts_price_chk CHECK (agreed_price >= 0),
    CONSTRAINT contracts_distinct_parties_chk CHECK (owner_user_id <> sitter_user_id)
);

CREATE TABLE IF NOT EXISTS contract_plants (
    contract_id                 BIGINT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    plant_id                    BIGINT NOT NULL REFERENCES plants(id) ON DELETE RESTRICT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (contract_id, plant_id)
);

-- =========================================================
-- PEER-TO-PEER HANDOFFS
-- =========================================================

CREATE TABLE IF NOT EXISTS listing_handoffs (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT NOT NULL UNIQUE REFERENCES plant_listings(id) ON DELETE CASCADE,
    owner_user_id               UUID NOT NULL REFERENCES owner_profiles(user_id) ON DELETE RESTRICT,
    recipient_user_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    swap_proposal_id            BIGINT UNIQUE REFERENCES swap_proposals(id) ON DELETE SET NULL,
    amount                      NUMERIC(10,2),
    currency_code               CHAR(3),
    status                      handoff_status NOT NULL DEFAULT 'PENDING',
    notes                       TEXT,
    owner_confirmed_at          TIMESTAMPTZ,
    recipient_confirmed_at      TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    cancelled_at                TIMESTAMPTZ,
    created_by_user_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT listing_handoffs_amount_chk CHECK (amount IS NULL OR amount >= 0),
    CONSTRAINT listing_handoffs_distinct_parties_chk CHECK (owner_user_id <> recipient_user_id)
);

-- =========================================================
-- STORE SALES
-- =========================================================

CREATE TABLE IF NOT EXISTS store_orders (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT NOT NULL REFERENCES plant_listings(id) ON DELETE RESTRICT,
    buyer_user_id               UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    store_owner_user_id         UUID NOT NULL REFERENCES store_owner_profiles(user_id) ON DELETE RESTRICT,
    amount                      NUMERIC(10,2) NOT NULL,
    currency_code               CHAR(3) NOT NULL DEFAULT 'USD',
    status                      order_status NOT NULL DEFAULT 'PENDING',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at                     TIMESTAMPTZ,
    fulfilled_at                TIMESTAMPTZ,
    cancelled_at                TIMESTAMPTZ,
    CONSTRAINT store_orders_amount_chk CHECK (amount >= 0)
);

-- =========================================================
-- CONVERSATIONS / MESSAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS conversations (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    listing_id                  BIGINT REFERENCES plant_listings(id) ON DELETE SET NULL,
    contract_id                 BIGINT REFERENCES contracts(id) ON DELETE SET NULL,
    order_id                    BIGINT REFERENCES store_orders(id) ON DELETE SET NULL,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at             TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id             BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    conversation_id             BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_user_id              UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message_type                message_type NOT NULL DEFAULT 'TEXT',
    body                        TEXT,
    is_edited                   BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at                   TIMESTAMPTZ,
    delivered_at                TIMESTAMPTZ,
    read_at                     TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at                  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS message_attachments (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    message_id                  BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    attachment_kind             attachment_kind NOT NULL,
    original_filename           VARCHAR(255),
    storage_key                 TEXT NOT NULL,
    public_url                  TEXT,
    content_type                VARCHAR(100),
    file_size_bytes             BIGINT,
    image_width                 INTEGER,
    image_height                INTEGER,
    checksum_sha256             VARCHAR(128),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type           notification_type NOT NULL,
    title                       VARCHAR(200) NOT NULL,
    body                        TEXT,
    related_listing_id          BIGINT REFERENCES plant_listings(id) ON DELETE SET NULL,
    related_application_id      BIGINT REFERENCES listing_applications(id) ON DELETE SET NULL,
    related_swap_proposal_id    BIGINT REFERENCES swap_proposals(id) ON DELETE SET NULL,
    related_contract_id         BIGINT REFERENCES contracts(id) ON DELETE SET NULL,
    related_order_id            BIGINT REFERENCES store_orders(id) ON DELETE SET NULL,
    related_message_id          BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    is_read                     BOOLEAN NOT NULL DEFAULT FALSE,
    read_at                     TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- PAYMENTS / LEDGER
-- =========================================================

CREATE TABLE IF NOT EXISTS payment_ledger (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    contract_id                 BIGINT REFERENCES contracts(id) ON DELETE SET NULL,
    order_id                    BIGINT REFERENCES store_orders(id) ON DELETE SET NULL,
    payer_user_id               UUID REFERENCES users(id) ON DELETE RESTRICT,
    payee_user_id               UUID REFERENCES users(id) ON DELETE RESTRICT,
    direction                   payment_direction NOT NULL,
    amount                      NUMERIC(12,2) NOT NULL,
    currency_code               CHAR(3) NOT NULL DEFAULT 'USD',
    status                      payment_status NOT NULL DEFAULT 'PENDING',
    external_reference          VARCHAR(255),
    notes                       TEXT,
    occurred_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT payment_ledger_amount_chk CHECK (amount >= 0)
);

-- =========================================================
-- AVAILABILITY
-- =========================================================

CREATE TABLE IF NOT EXISTS sitter_availability (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    sitter_user_id              UUID NOT NULL REFERENCES sitter_profiles(user_id) ON DELETE CASCADE,
    start_at                    TIMESTAMPTZ NOT NULL,
    end_at                      TIMESTAMPTZ NOT NULL,
    status                      availability_status NOT NULL DEFAULT 'AVAILABLE',
    notes                       TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT sitter_availability_time_chk CHECK (end_at > start_at)
);

-- =========================================================
-- REVIEWS / MODERATION / AUDIT
-- =========================================================

CREATE TABLE IF NOT EXISTS sitter_reviews (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    contract_id                 BIGINT NOT NULL UNIQUE REFERENCES contracts(id) ON DELETE CASCADE,
    sitter_user_id              UUID NOT NULL REFERENCES sitter_profiles(user_id) ON DELETE CASCADE,
    owner_user_id               UUID NOT NULL REFERENCES owner_profiles(user_id) ON DELETE CASCADE,
    rating                      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text                 TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_handoff_reviews (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    handoff_id                  BIGINT NOT NULL REFERENCES listing_handoffs(id) ON DELETE CASCADE,
    reviewer_user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating                      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text                 TEXT,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT listing_handoff_reviews_distinct_users_chk CHECK (reviewer_user_id <> reviewee_user_id),
    CONSTRAINT listing_handoff_reviews_unique UNIQUE (handoff_id, reviewer_user_id)
);

CREATE TABLE IF NOT EXISTS moderation_cases (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    reported_by_user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    target_user_id              UUID REFERENCES users(id) ON DELETE SET NULL,
    target_message_id           BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    target_contract_id          BIGINT REFERENCES contracts(id) ON DELETE SET NULL,
    target_listing_id           BIGINT REFERENCES plant_listings(id) ON DELETE SET NULL,
    reason                      VARCHAR(255) NOT NULL,
    description                 TEXT,
    status                      moderation_status NOT NULL DEFAULT 'OPEN',
    reviewed_by_user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id                          BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    actor_user_id               UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type                 VARCHAR(100) NOT NULL,
    target_table                VARCHAR(100) NOT NULL,
    target_id                   BIGINT,
    metadata_json               JSONB,
    ip_address                  INET,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- CROSS-TABLE BUSINESS RULES
-- =========================================================

CREATE OR REPLACE FUNCTION public.validate_plant_listing()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_current_owner UUID;
BEGIN
    IF NEW.owner_user_id IS NOT NULL THEN
        SELECT current_owner_user_id
        INTO v_current_owner
        FROM plants
        WHERE id = NEW.plant_id;

        IF v_current_owner IS NULL THEN
            RAISE EXCEPTION 'Plant % does not exist', NEW.plant_id;
        END IF;

        IF v_current_owner <> NEW.owner_user_id THEN
            RAISE EXCEPTION 'Owner listing must reference a plant currently owned by that owner';
        END IF;
    END IF;

    IF NEW.listing_type = 'SWAP' AND NEW.owner_user_id IS NULL THEN
        RAISE EXCEPTION 'Swap listings must belong to a normal owner';
    END IF;

    IF NEW.listing_type = 'GIFT' AND NEW.owner_user_id IS NULL THEN
        RAISE EXCEPTION 'Gift listings must belong to a normal owner';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_plant_listing ON plant_listings;
CREATE TRIGGER trg_validate_plant_listing
    BEFORE INSERT OR UPDATE ON plant_listings
    FOR EACH ROW EXECUTE FUNCTION public.validate_plant_listing();

CREATE OR REPLACE FUNCTION public.validate_listing_application()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_listing_type listing_type;
    v_listing_status listing_status;
    v_owner_user_id UUID;
    v_store_owner_user_id UUID;
BEGIN
    SELECT listing_type, status, owner_user_id, store_owner_user_id
    INTO v_listing_type, v_listing_status, v_owner_user_id, v_store_owner_user_id
    FROM plant_listings
    WHERE id = NEW.listing_id;

    IF v_listing_type IS NULL THEN
        RAISE EXCEPTION 'Listing % does not exist', NEW.listing_id;
    END IF;

    IF v_listing_type <> 'SITTING_REQUEST' THEN
        RAISE EXCEPTION 'Applications are only valid for sitting request listings';
    END IF;

    IF TG_OP = 'INSERT' AND v_listing_status <> 'OPEN' THEN
        RAISE EXCEPTION 'Applications can only be created for open listings';
    END IF;

    IF NEW.applicant_user_id = COALESCE(v_owner_user_id, v_store_owner_user_id) THEN
        RAISE EXCEPTION 'Listing owners cannot apply to their own listings';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM sitter_profiles sp
        WHERE sp.user_id = NEW.applicant_user_id
    ) THEN
        RAISE EXCEPTION 'Applicants must have a sitter profile';
    END IF;

    IF TG_OP = 'INSERT' AND NEW.status <> 'PENDING' THEN
        RAISE EXCEPTION 'New applications must start as pending';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.listing_id <> OLD.listing_id OR NEW.applicant_user_id <> OLD.applicant_user_id THEN
            RAISE EXCEPTION 'Application listing and applicant cannot be changed';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_listing_application ON listing_applications;
CREATE TRIGGER trg_validate_listing_application
    BEFORE INSERT OR UPDATE ON listing_applications
    FOR EACH ROW EXECUTE FUNCTION public.validate_listing_application();

CREATE OR REPLACE FUNCTION public.validate_swap_proposal()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_listing_type listing_type;
    v_listing_plant_id BIGINT;
BEGIN
    SELECT listing_type, plant_id
    INTO v_listing_type, v_listing_plant_id
    FROM plant_listings
    WHERE id = NEW.listing_id;

    IF v_listing_type IS NULL THEN
        RAISE EXCEPTION 'Listing % does not exist', NEW.listing_id;
    END IF;

    IF v_listing_type <> 'SWAP' THEN
        RAISE EXCEPTION 'Swap proposals are only valid for swap listings';
    END IF;

    IF v_listing_plant_id = NEW.offered_plant_id THEN
        RAISE EXCEPTION 'Cannot offer the same plant that is already listed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM plants p
        WHERE p.id = NEW.offered_plant_id
          AND p.current_owner_user_id = NEW.proposer_owner_user_id
          AND p.is_active = TRUE
          AND p.archived_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Swap proposals must use an active plant owned by the proposer';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_swap_proposal ON swap_proposals;
CREATE TRIGGER trg_validate_swap_proposal
    BEFORE INSERT OR UPDATE ON swap_proposals
    FOR EACH ROW EXECUTE FUNCTION public.validate_swap_proposal();

CREATE OR REPLACE FUNCTION public.validate_contract()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_listing_type listing_type;
    v_listing_owner UUID;
    v_application_listing_id BIGINT;
    v_application_user UUID;
    v_application_status application_status;
BEGIN
    IF NEW.listing_id IS NULL AND NEW.application_id IS NULL THEN
        RAISE EXCEPTION 'Contracts must reference a sitting listing or accepted application';
    END IF;

    IF NEW.listing_id IS NOT NULL THEN
        SELECT listing_type, owner_user_id
        INTO v_listing_type, v_listing_owner
        FROM plant_listings
        WHERE id = NEW.listing_id;

        IF v_listing_type IS NULL THEN
            RAISE EXCEPTION 'Listing % does not exist', NEW.listing_id;
        END IF;

        IF v_listing_type <> 'SITTING_REQUEST' THEN
            RAISE EXCEPTION 'Contracts can only be created for sitting request listings';
        END IF;

        IF v_listing_owner <> NEW.owner_user_id THEN
            RAISE EXCEPTION 'Contract owner must match listing owner';
        END IF;
    END IF;

    IF NEW.application_id IS NOT NULL THEN
        SELECT la.listing_id, la.applicant_user_id, la.status
        INTO v_application_listing_id, v_application_user, v_application_status
        FROM listing_applications la
        WHERE la.id = NEW.application_id;

        IF v_application_listing_id IS NULL THEN
            RAISE EXCEPTION 'Application % does not exist', NEW.application_id;
        END IF;

        IF v_application_status <> 'ACCEPTED' THEN
            RAISE EXCEPTION 'Contracts can only be created from accepted applications';
        END IF;

        IF NEW.listing_id IS NOT NULL AND v_application_listing_id <> NEW.listing_id THEN
            RAISE EXCEPTION 'Contract listing and application listing must match';
        END IF;

        IF NEW.sitter_user_id <> v_application_user THEN
            RAISE EXCEPTION 'Contract sitter must match the accepted applicant';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_contract ON contracts;
CREATE TRIGGER trg_validate_contract
    BEFORE INSERT OR UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION public.validate_contract();

CREATE OR REPLACE FUNCTION public.validate_listing_handoff()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_listing_type listing_type;
    v_listing_owner UUID;
    v_proposer UUID;
    v_swap_status swap_status;
BEGIN
    SELECT listing_type, owner_user_id
    INTO v_listing_type, v_listing_owner
    FROM plant_listings
    WHERE id = NEW.listing_id;

    IF v_listing_type IS NULL THEN
        RAISE EXCEPTION 'Listing % does not exist', NEW.listing_id;
    END IF;

    IF v_listing_type NOT IN ('SALE', 'GIFT', 'SWAP') THEN
        RAISE EXCEPTION 'Handoffs are only valid for sale, gift, and swap listings';
    END IF;

    IF v_listing_owner IS NULL THEN
        RAISE EXCEPTION 'Only owner-backed listings can create peer handoffs';
    END IF;

    IF NEW.owner_user_id <> v_listing_owner THEN
        RAISE EXCEPTION 'Handoff owner must match listing owner';
    END IF;

    IF v_listing_type = 'SALE' THEN
        IF NEW.amount IS NULL OR NEW.currency_code IS NULL THEN
            RAISE EXCEPTION 'Sale handoffs require an amount and currency';
        END IF;
        IF NEW.swap_proposal_id IS NOT NULL THEN
            RAISE EXCEPTION 'Sale handoffs cannot reference swap proposals';
        END IF;
    ELSIF v_listing_type = 'GIFT' THEN
        IF NEW.amount IS NOT NULL OR NEW.currency_code IS NOT NULL THEN
            RAISE EXCEPTION 'Gift handoffs cannot record a sale amount';
        END IF;
        IF NEW.swap_proposal_id IS NOT NULL THEN
            RAISE EXCEPTION 'Gift handoffs cannot reference swap proposals';
        END IF;
    ELSIF v_listing_type = 'SWAP' THEN
        IF NEW.swap_proposal_id IS NULL THEN
            RAISE EXCEPTION 'Swap handoffs require an accepted swap proposal';
        END IF;
        IF NEW.amount IS NOT NULL OR NEW.currency_code IS NOT NULL THEN
            RAISE EXCEPTION 'Swap handoffs do not support cash amounts';
        END IF;

        SELECT proposer_owner_user_id, status
        INTO v_proposer, v_swap_status
        FROM swap_proposals
        WHERE id = NEW.swap_proposal_id
          AND listing_id = NEW.listing_id;

        IF v_proposer IS NULL THEN
            RAISE EXCEPTION 'Swap handoff must reference a swap proposal for the same listing';
        END IF;

        IF v_swap_status <> 'ACCEPTED' THEN
            RAISE EXCEPTION 'Swap handoff requires an accepted swap proposal';
        END IF;

        IF NEW.recipient_user_id <> v_proposer THEN
            RAISE EXCEPTION 'Swap handoff recipient must match the accepted proposer';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_listing_handoff ON listing_handoffs;
CREATE TRIGGER trg_validate_listing_handoff
    BEFORE INSERT OR UPDATE ON listing_handoffs
    FOR EACH ROW EXECUTE FUNCTION public.validate_listing_handoff();

CREATE OR REPLACE FUNCTION public.validate_store_order()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_listing_type listing_type;
    v_store_owner UUID;
    v_sale_price NUMERIC(10,2);
    v_currency CHAR(3);
BEGIN
    SELECT listing_type, store_owner_user_id, sale_price, currency_code
    INTO v_listing_type, v_store_owner, v_sale_price, v_currency
    FROM plant_listings
    WHERE id = NEW.listing_id;

    IF v_listing_type IS NULL THEN
        RAISE EXCEPTION 'Listing % does not exist', NEW.listing_id;
    END IF;

    IF v_listing_type <> 'SALE' THEN
        RAISE EXCEPTION 'Store orders are only valid for sale listings';
    END IF;

    IF v_store_owner IS NULL THEN
        RAISE EXCEPTION 'Peer sale listings must use listing_handoffs instead of store_orders';
    END IF;

    IF NEW.store_owner_user_id <> v_store_owner THEN
        RAISE EXCEPTION 'Store order owner must match listing store owner';
    END IF;

    IF NEW.amount <> v_sale_price OR NEW.currency_code <> v_currency THEN
        RAISE EXCEPTION 'Store order pricing must match the listing price';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_store_order ON store_orders;
CREATE TRIGGER trg_validate_store_order
    BEFORE INSERT OR UPDATE ON store_orders
    FOR EACH ROW EXECUTE FUNCTION public.validate_store_order();

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_plants_current_owner ON plants(current_owner_user_id);

CREATE INDEX IF NOT EXISTS idx_plant_listings_plant_id ON plant_listings(plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_listings_type ON plant_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_plant_listings_status ON plant_listings(status);
CREATE INDEX IF NOT EXISTS idx_plant_listings_owner_user_id ON plant_listings(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_plant_listings_store_owner_user_id ON plant_listings(store_owner_user_id);

CREATE INDEX IF NOT EXISTS idx_listing_applications_listing_id ON listing_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_applications_applicant_user_id ON listing_applications(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_listing_applications_status ON listing_applications(status);

CREATE INDEX IF NOT EXISTS idx_swap_proposals_listing_id ON swap_proposals(listing_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_proposer_owner ON swap_proposals(proposer_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_proposals_status ON swap_proposals(status);

CREATE INDEX IF NOT EXISTS idx_contracts_owner ON contracts(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_sitter ON contracts(sitter_user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

CREATE INDEX IF NOT EXISTS idx_listing_handoffs_owner ON listing_handoffs(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_listing_handoffs_recipient ON listing_handoffs(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_listing_handoffs_status ON listing_handoffs(status);
CREATE INDEX IF NOT EXISTS idx_listing_handoff_reviews_handoff_id ON listing_handoff_reviews(handoff_id);
CREATE INDEX IF NOT EXISTS idx_listing_handoff_reviews_reviewee ON listing_handoff_reviews(reviewee_user_id);

CREATE INDEX IF NOT EXISTS idx_store_orders_listing_id ON store_orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_buyer ON store_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_store_owner ON store_orders(store_owner_user_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(status);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_ledger_contract_id ON payment_ledger(contract_id);
CREATE INDEX IF NOT EXISTS idx_payment_ledger_order_id ON payment_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_sitter_availability_sitter_user_id ON sitter_availability(sitter_user_id);

COMMIT;
