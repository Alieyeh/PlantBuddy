create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
    id bigserial primary key,
    username varchar(50) not null unique,
    email varchar(255) not null unique,
    password_hash varchar(255) not null,
    display_name varchar(100) not null,
    phone_number varchar(30),
    bio text,
    profile_image_url varchar(500),
    primary_role varchar(20) not null default 'OWNER' check (primary_role in ('OWNER','SITTER','ADMIN')),
    is_active boolean not null default true,
    is_admin boolean not null default false,
    holiday_mode boolean not null default false,
    email_verified boolean not null default false,
    last_login_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_users_updated_at before update on users for each row execute function set_updated_at();

create table if not exists owner_profiles (
    user_id bigint primary key references users(id) on delete cascade,
    home_name varchar(120),
    address_line_1 varchar(255),
    address_line_2 varchar(255),
    city varchar(120),
    region varchar(120),
    postal_code varchar(30),
    country_code char(2),
    latitude numeric(9,6),
    longitude numeric(9,6),
    emergency_contact_name varchar(120),
    emergency_contact_phone varchar(30),
    holiday_mode boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_owner_profiles_updated_at before update on owner_profiles for each row execute function set_updated_at();

create table if not exists sitter_profiles (
    user_id bigint primary key references users(id) on delete cascade,
    headline varchar(140),
    sitter_bio text,
    service_radius_km integer check (service_radius_km is null or service_radius_km >= 0),
    hourly_rate_cents integer check (hourly_rate_cents is null or hourly_rate_cents >= 0),
    daily_rate_cents integer check (daily_rate_cents is null or daily_rate_cents >= 0),
    years_experience integer check (years_experience is null or years_experience >= 0),
    can_travel boolean not null default false,
    offers_overnight boolean not null default false,
    holiday_mode boolean not null default false,
    verified_status varchar(20) not null default 'UNVERIFIED' check (verified_status in ('UNVERIFIED','PENDING','VERIFIED','REJECTED')),
    average_rating numeric(3,2) check (average_rating is null or (average_rating >= 0 and average_rating <= 5)),
    rating_count integer not null default 0 check (rating_count >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_sitter_profiles_updated_at before update on sitter_profiles for each row execute function set_updated_at();

create table if not exists sitter_availability (
    id bigserial primary key,
    sitter_user_id bigint not null references sitter_profiles(user_id) on delete cascade,
    start_at timestamptz not null,
    end_at timestamptz not null,
    availability_type varchar(20) not null default 'AVAILABLE' check (availability_type in ('AVAILABLE','UNAVAILABLE','TENTATIVE','BOOKED','TIME_OFF')),
    recurrence_rule varchar(255),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_sitter_availability_dates check (end_at > start_at)
);
create trigger trg_sitter_availability_updated_at before update on sitter_availability for each row execute function set_updated_at();
create index if not exists idx_sitter_availability_sitter_user_id on sitter_availability(sitter_user_id, start_at);

create table if not exists plants (
    id bigserial primary key,
    owner_id bigint not null references owner_profiles(user_id) on delete cascade,
    current_sitter_id bigint references sitter_profiles(user_id) on delete set null,
    name varchar(100) not null,
    species varchar(120),
    cultivar varchar(120),
    profile_image_url varchar(500),
    room varchar(100),
    light_requirement varchar(50) check (light_requirement is null or light_requirement in ('LOW','INDIRECT','BRIGHT_INDIRECT','DIRECT','MIXED')),
    watering_frequency_days integer check (watering_frequency_days is null or watering_frequency_days > 0),
    watering_times varchar(255),
    watering_volume_ml integer check (watering_volume_ml is null or watering_volume_ml >= 0),
    mist_frequency_days integer check (mist_frequency_days is null or mist_frequency_days > 0),
    fertilizer_frequency_days integer check (fertilizer_frequency_days is null or fertilizer_frequency_days > 0),
    preferred_temperature_c integer,
    preferred_humidity_percent integer check (preferred_humidity_percent is null or (preferred_humidity_percent between 0 and 100)),
    height_cm integer check (height_cm is null or height_cm >= 0),
    width_cm integer check (width_cm is null or width_cm >= 0),
    weight_g integer check (weight_g is null or weight_g >= 0),
    plant_bio text,
    toxicity_notes text,
    care_notes text,
    quirk text,
    last_watered_on date,
    archived boolean not null default false,
    date_added timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_plants_owner_name unique (owner_id, name)
);
create trigger trg_plants_updated_at before update on plants for each row execute function set_updated_at();
create index if not exists idx_plants_owner_id on plants(owner_id);
create index if not exists idx_plants_current_sitter_id on plants(current_sitter_id);

create table if not exists plant_photos (
    id bigserial primary key,
    plant_id bigint not null references plants(id) on delete cascade,
    image_url varchar(500) not null,
    caption varchar(255),
    taken_at timestamptz,
    uploaded_by_user_id bigint references users(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists plant_care_tasks (
    id bigserial primary key,
    plant_id bigint not null references plants(id) on delete cascade,
    assigned_sitter_id bigint references sitter_profiles(user_id) on delete set null,
    task_type varchar(30) not null check (task_type in ('WATER','MIST','ROTATE','FERTILIZE','PRUNE','CHECK_SOIL','OTHER')),
    instructions text,
    due_at timestamptz,
    completed_at timestamptz,
    status varchar(20) not null default 'PENDING' check (status in ('PENDING','COMPLETED','SKIPPED','CANCELLED')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_plant_care_tasks_updated_at before update on plant_care_tasks for each row execute function set_updated_at();

create table if not exists plant_interest (
    id bigserial primary key,
    plant_id bigint not null references plants(id) on delete cascade,
    owner_id bigint not null references owner_profiles(user_id) on delete cascade,
    sitter_id bigint not null references sitter_profiles(user_id) on delete cascade,
    message text,
    proposed_start_at timestamptz,
    proposed_end_at timestamptz,
    status varchar(20) not null default 'EXPRESSED' check (status in ('EXPRESSED','VIEWED','OWNER_SHORTLISTED','OWNER_DECLINED','WITHDRAWN','CONVERTED_TO_CONTRACT')),
    owner_responded_at timestamptz,
    contract_id bigint,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_plant_interest_open unique (plant_id, sitter_id)
);
create trigger trg_plant_interest_updated_at before update on plant_interest for each row execute function set_updated_at();
create index if not exists idx_plant_interest_owner_id on plant_interest(owner_id, status);

create table if not exists contracts (
    id bigserial primary key,
    owner_id bigint not null references owner_profiles(user_id) on delete restrict,
    sitter_id bigint not null references sitter_profiles(user_id) on delete restrict,
    primary_plant_id bigint references plants(id) on delete set null,
    interest_id bigint unique references plant_interest(id) on delete set null,
    contract_type varchar(20) not null default 'SIT' check (contract_type in ('SIT','EXCHANGE','DONATE','STORE_HELP')),
    status varchar(20) not null default 'REQUESTED' check (status in ('REQUESTED','PENDING_OWNER','PENDING_SITTER','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED','DISPUTED','EXPIRED','DECLINED')),
    title varchar(140),
    request_message text,
    start_at timestamptz not null,
    end_at timestamptz not null,
    meet_and_greet_at timestamptz,
    access_notes text,
    service_address_line_1 varchar(255),
    service_address_line_2 varchar(255),
    service_city varchar(120),
    service_region varchar(120),
    service_postal_code varchar(30),
    service_country_code char(2),
    total_price_cents integer check (total_price_cents is null or total_price_cents >= 0),
    currency_code char(3) not null default 'GBP',
    owner_accepted_at timestamptz,
    sitter_accepted_at timestamptz,
    cancelled_at timestamptz,
    cancelled_by_user_id bigint references users(id) on delete set null,
    cancellation_reason text,
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_contract_dates check (end_at > start_at),
    constraint chk_contract_owner_sitter_distinct check (owner_id <> sitter_id)
);
create trigger trg_contracts_updated_at before update on contracts for each row execute function set_updated_at();
create index if not exists idx_contracts_owner_id on contracts(owner_id, status);
create index if not exists idx_contracts_sitter_id on contracts(sitter_id, status);

alter table plant_interest add constraint fk_interest_contract foreign key (contract_id) references contracts(id) on delete set null;

create table if not exists contract_plants (
    contract_id bigint not null references contracts(id) on delete cascade,
    plant_id bigint not null references plants(id) on delete restrict,
    care_summary text,
    pickup_required boolean not null default false,
    primary key (contract_id, plant_id)
);

create table if not exists conversations (
    id bigserial primary key,
    owner_id bigint not null references owner_profiles(user_id) on delete cascade,
    sitter_id bigint not null references sitter_profiles(user_id) on delete cascade,
    contract_id bigint unique references contracts(id) on delete set null,
    interest_id bigint unique references plant_interest(id) on delete set null,
    last_message_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_conversation_owner_sitter_distinct check (owner_id <> sitter_id),
    constraint uq_conversation_context unique (owner_id, sitter_id, contract_id, interest_id)
);
create trigger trg_conversations_updated_at before update on conversations for each row execute function set_updated_at();

create table if not exists messages (
    id bigserial primary key,
    conversation_id bigint not null references conversations(id) on delete cascade,
    sender_user_id bigint not null references users(id) on delete restrict,
    message_type varchar(20) not null default 'TEXT' check (message_type in ('TEXT','IMAGE','SYSTEM','CONTRACT_UPDATE','FILE')),
    body text,
    media_url varchar(500),
    sent_at timestamptz not null default now(),
    edited_at timestamptz,
    deleted_at timestamptz,
    read_at timestamptz,
    created_at timestamptz not null default now(),
    constraint chk_message_payload check (
        (message_type = 'TEXT' and body is not null) or message_type in ('IMAGE','SYSTEM','CONTRACT_UPDATE','FILE')
    )
);
create index if not exists idx_messages_conversation_id on messages(conversation_id, sent_at desc);

create table if not exists message_attachments (
    id bigserial primary key,
    message_id bigint not null references messages(id) on delete cascade,
    storage_key varchar(255),
    original_filename varchar(255) not null,
    mime_type varchar(100),
    byte_size bigint check (byte_size is null or byte_size >= 0),
    width_px integer,
    height_px integer,
    checksum_sha256 varchar(64),
    preview_url varchar(500),
    download_url varchar(500),
    created_at timestamptz not null default now()
);

create table if not exists notifications (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    actor_user_id bigint references users(id) on delete set null,
    notification_type varchar(40) not null check (notification_type in ('MESSAGE','CONTRACT_REQUEST','CONTRACT_STATUS','PLANT_INTEREST','PAYMENT','SYSTEM','REVIEW','REMINDER')),
    title varchar(140) not null,
    body text,
    deep_link varchar(255),
    related_entity_type varchar(40),
    related_entity_id bigint,
    is_read boolean not null default false,
    read_at timestamptz,
    created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_id on notifications(user_id, is_read, created_at desc);

create table if not exists payment_ledger (
    id bigserial primary key,
    contract_id bigint references contracts(id) on delete set null,
    payer_user_id bigint references users(id) on delete set null,
    payee_user_id bigint references users(id) on delete set null,
    ledger_type varchar(30) not null check (ledger_type in ('PAYMENT_INTENT','AUTH','CHARGE','REFUND','PAYOUT','FEE','ADJUSTMENT')),
    direction varchar(20) not null check (direction in ('DEBIT','CREDIT')),
    status varchar(20) not null default 'PENDING' check (status in ('PENDING','AUTHORIZED','SETTLED','FAILED','REFUNDED','REVERSED','CANCELLED')),
    amount_cents integer not null check (amount_cents >= 0),
    currency_code char(3) not null default 'GBP',
    external_reference varchar(120),
    notes text,
    created_at timestamptz not null default now(),
    settled_at timestamptz
);
create index if not exists idx_payment_ledger_contract_id on payment_ledger(contract_id, created_at desc);

create table if not exists refresh_tokens (
    id bigserial primary key,
    user_id bigint not null references users(id) on delete cascade,
    token_hash varchar(255) not null,
    issued_at timestamptz not null default now(),
    expires_at timestamptz not null,
    revoked_at timestamptz,
    replaced_by_token_id bigint references refresh_tokens(id) on delete set null,
    user_agent varchar(255),
    ip_address inet
);
create unique index if not exists uq_refresh_tokens_token_hash on refresh_tokens(token_hash);

create table if not exists sitter_reviews (
    id bigserial primary key,
    contract_id bigint not null unique references contracts(id) on delete cascade,
    owner_id bigint not null references owner_profiles(user_id) on delete restrict,
    sitter_id bigint not null references sitter_profiles(user_id) on delete restrict,
    rating integer not null check (rating between 1 and 5),
    review_text text,
    created_at timestamptz not null default now(),
    constraint chk_review_owner_sitter_distinct check (owner_id <> sitter_id)
);

create table if not exists audit_log (
    id bigserial primary key,
    actor_user_id bigint references users(id) on delete set null,
    target_user_id bigint references users(id) on delete set null,
    entity_type varchar(40) not null,
    entity_id bigint,
    action varchar(50) not null,
    summary text,
    metadata_json jsonb,
    ip_address inet,
    user_agent varchar(255),
    created_at timestamptz not null default now()
);
create index if not exists idx_audit_log_entity on audit_log(entity_type, entity_id, created_at desc);

create table if not exists moderation_cases (
    id bigserial primary key,
    reported_by_user_id bigint references users(id) on delete set null,
    subject_user_id bigint references users(id) on delete set null,
    entity_type varchar(40),
    entity_id bigint,
    reason_code varchar(40) not null,
    notes text,
    status varchar(20) not null default 'OPEN' check (status in ('OPEN','UNDER_REVIEW','RESOLVED','DISMISSED')),
    resolved_by_user_id bigint references users(id) on delete set null,
    resolved_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_moderation_cases_updated_at before update on moderation_cases for each row execute function set_updated_at();

create or replace view v_users_with_roles as
select u.*,
    exists(select 1 from owner_profiles op where op.user_id = u.id) as has_owner_profile,
    exists(select 1 from sitter_profiles sp where sp.user_id = u.id) as has_sitter_profile
from users u;
