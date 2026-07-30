CREATE TABLE earthquake_event (
    usgs_id VARCHAR(32) PRIMARY KEY,
    magnitude DOUBLE PRECISION,
    place TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    depth_km DOUBLE PRECISION NOT NULL,
    alert VARCHAR(16),
    status VARCHAR(32) NOT NULL,
    significance INTEGER NOT NULL,
    tsunami BOOLEAN NOT NULL,
    detail_url TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_earthquake_event_occurred_at
    ON earthquake_event (occurred_at DESC);
