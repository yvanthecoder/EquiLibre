-- =============================================
-- MIGRATION - AJOUT STATUT PROPOSED
-- =============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        WHERE enumlabel = 'PROPOSED'
          AND enumtypid = 'interview_status'::regtype
    ) THEN
        ALTER TYPE interview_status ADD VALUE 'PROPOSED';
    END IF;
END $$;

SELECT 'Migration interview_status PROPOSED appliquee' AS status;
