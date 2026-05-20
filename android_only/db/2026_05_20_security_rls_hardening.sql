BEGIN;

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
    FROM public.plant_listings
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
        FROM public.sitter_profiles sp
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

DROP TRIGGER IF EXISTS trg_validate_listing_application ON public.listing_applications;
CREATE TRIGGER trg_validate_listing_application
    BEFORE INSERT OR UPDATE ON public.listing_applications
    FOR EACH ROW EXECUTE FUNCTION public.validate_listing_application();

DROP POLICY IF EXISTS "plant_listings_insert_own" ON public.plant_listings;
CREATE POLICY "plant_listings_insert_own"
  ON public.plant_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plants p
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
          SELECT 1 FROM public.store_owner_profiles sop
          WHERE sop.user_id = auth.uid()
            AND sop.is_approved = TRUE
        )
      )
    )
  );

DROP POLICY IF EXISTS "plant_listings_update_own" ON public.plant_listings;
CREATE POLICY "plant_listings_update_own"
  ON public.plant_listings FOR UPDATE
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR store_owner_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plants p
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
          SELECT 1 FROM public.store_owner_profiles sop
          WHERE sop.user_id = auth.uid()
            AND sop.is_approved = TRUE
        )
      )
    )
  );

DROP POLICY IF EXISTS "listing_applications_insert" ON public.listing_applications;
CREATE POLICY "listing_applications_insert"
  ON public.listing_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_user_id = auth.uid()
    AND status = 'PENDING'
    AND EXISTS (
      SELECT 1 FROM public.sitter_profiles sp
      WHERE sp.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.status = 'OPEN'
        AND COALESCE(pl.owner_user_id, pl.store_owner_user_id) <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "listing_applications_update" ON public.listing_applications;
CREATE POLICY "listing_applications_update"
  ON public.listing_applications FOR UPDATE
  TO authenticated
  USING (
    applicant_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.plant_listings pl
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
      SELECT 1 FROM public.plant_listings pl
      WHERE pl.id = listing_applications.listing_id
        AND pl.listing_type = 'SITTING_REQUEST'
        AND pl.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "swap_proposals_insert" ON public.swap_proposals;
CREATE POLICY "swap_proposals_insert"
  ON public.swap_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    proposer_owner_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.plant_listings pl
      WHERE pl.id = swap_proposals.listing_id
        AND pl.listing_type = 'SWAP'
        AND pl.status = 'OPEN'
        AND pl.owner_user_id <> auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.plants p
      WHERE p.id = swap_proposals.offered_plant_id
        AND p.current_owner_user_id = auth.uid()
        AND p.is_active = TRUE
        AND p.archived_at IS NULL
    )
  );

COMMIT;
