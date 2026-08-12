ALTER TABLE ingestion_run
    ADD COLUMN source VARCHAR(16) NOT NULL DEFAULT 'LIVE_FEED',
    ADD COLUMN range_start TIMESTAMP WITH TIME ZONE,
    ADD COLUMN range_end TIMESTAMP WITH TIME ZONE;

ALTER TABLE ingestion_run
    ADD CONSTRAINT ingestion_run_source_check
        CHECK (source IN ('LIVE_FEED', 'MANUAL', 'HISTORICAL')),
    ADD CONSTRAINT ingestion_run_range_check
        CHECK (range_start IS NULL OR range_end IS NULL OR range_start <= range_end);
