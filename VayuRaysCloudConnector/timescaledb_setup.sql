-- ============================================================================
-- VayuRays Cloud Connector — TimescaleDB Schema
-- Self-hosted cloud database for Indian customers (data sovereignty)
--
-- Prerequisites:
--   1. PostgreSQL 14+ installed
--   2. TimescaleDB extension installed:
--      CREATE EXTENSION IF NOT EXISTS timescaledb;
-- ============================================================================

-- Create the database (run as superuser)
-- CREATE DATABASE vayurays_cloud;
-- \c vayurays_cloud

CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================================
-- 1. Telemetry Table (time-series hypertable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS telemetry (
    time        TIMESTAMPTZ      NOT NULL,
    site_id     TEXT             NOT NULL,
    device_id   TEXT             NOT NULL,
    point_id    TEXT             NOT NULL,
    value       DOUBLE PRECISION NOT NULL
);

-- Convert to hypertable — automatically partitions by time (7-day chunks)
SELECT create_hypertable('telemetry', 'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '7 days');

-- Index for fast lookups by site + point
CREATE INDEX IF NOT EXISTS idx_telemetry_site_point
    ON telemetry (site_id, point_id, time DESC);

-- Index for fast lookups by device
CREATE INDEX IF NOT EXISTS idx_telemetry_device
    ON telemetry (device_id, time DESC);

-- ============================================================================
-- 2. Device Status / Heartbeat Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_status (
    time            TIMESTAMPTZ      NOT NULL,
    site_id         TEXT             NOT NULL,
    device_id       TEXT             NOT NULL,
    status          TEXT             NOT NULL,  -- 'online', 'offline'
    point_count     INTEGER,
    uptime_seconds  BIGINT,
    publish_speed   TEXT                        -- 'Economy', 'Standard', 'RealTime'
);

SELECT create_hypertable('device_status', 'time', if_not_exists => TRUE, chunk_time_interval => INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_device_status_lookup
    ON device_status (site_id, device_id, time DESC);

-- ============================================================================
-- 3. Compression Policies (saves 90%+ storage after 7 days)
-- ============================================================================
ALTER TABLE telemetry SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'site_id, device_id, point_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('telemetry', INTERVAL '7 days', if_not_exists => TRUE);

ALTER TABLE device_status SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'site_id, device_id',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('device_status', INTERVAL '30 days', if_not_exists => TRUE);

-- ============================================================================
-- 4. Retention Policies (auto-delete old data)
-- ============================================================================
-- Keep telemetry for 2 years, heartbeat status for 90 days
SELECT add_retention_policy('telemetry', INTERVAL '2 years', if_not_exists => TRUE);
SELECT add_retention_policy('device_status', INTERVAL '90 days', if_not_exists => TRUE);

-- ============================================================================
-- 5. Continuous Aggregates (pre-computed rollups for dashboards)
-- ============================================================================

-- 5-minute average rollup for dashboard charts
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_5min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    site_id,
    device_id,
    point_id,
    AVG(value)   AS avg_value,
    MIN(value)   AS min_value,
    MAX(value)   AS max_value,
    COUNT(*)     AS sample_count
FROM telemetry
GROUP BY bucket, site_id, device_id, point_id
WITH NO DATA;

-- Auto-refresh the 5-minute rollup every 5 minutes
SELECT add_continuous_aggregate_policy('telemetry_5min',
    start_offset    => INTERVAL '1 hour',
    end_offset      => INTERVAL '5 minutes',
    schedule_interval => INTERVAL '5 minutes',
    if_not_exists   => TRUE
);

-- 1-hour average rollup for long-term trend analysis
CREATE MATERIALIZED VIEW IF NOT EXISTS telemetry_1hr
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    site_id,
    device_id,
    point_id,
    AVG(value)   AS avg_value,
    MIN(value)   AS min_value,
    MAX(value)   AS max_value,
    COUNT(*)     AS sample_count
FROM telemetry
GROUP BY bucket, site_id, device_id, point_id
WITH NO DATA;

SELECT add_continuous_aggregate_policy('telemetry_1hr',
    start_offset    => INTERVAL '3 hours',
    end_offset      => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists   => TRUE
);

-- ============================================================================
-- 6. Example Queries (for Grafana / Dashboard)
-- ============================================================================

-- Latest value for all points at a site
-- SELECT DISTINCT ON (point_id)
--     point_id, value, time
-- FROM telemetry
-- WHERE site_id = 'mumbai-plant-01'
-- ORDER BY point_id, time DESC;

-- SoC trend over last 24 hours (5-min averages)
-- SELECT bucket, avg_value
-- FROM telemetry_5min
-- WHERE site_id = 'mumbai-plant-01'
--   AND point_id = 'SoC'
--   AND bucket > NOW() - INTERVAL '24 hours'
-- ORDER BY bucket;

-- Device online/offline history
-- SELECT time, status, uptime_seconds
-- FROM device_status
-- WHERE site_id = 'mumbai-plant-01'
--   AND device_id = 'BESS1'
--   AND time > NOW() - INTERVAL '7 days'
-- ORDER BY time DESC;

-- Daily peak power for the last month (from 1-hour rollups)
-- SELECT
--     time_bucket('1 day', bucket) AS day,
--     MAX(max_value) AS peak_power_kw
-- FROM telemetry_1hr
-- WHERE point_id = 'ActivePower_kW'
--   AND site_id = 'mumbai-plant-01'
--   AND bucket > NOW() - INTERVAL '30 days'
-- GROUP BY day
-- ORDER BY day;
