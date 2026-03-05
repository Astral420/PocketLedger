BEGIN;

-- =========================================================
-- Extra tables for fares + discounts (seed-friendly)
-- (Your migration didn't include these, so we create them here.)
-- =========================================================

CREATE TABLE IF NOT EXISTS fare_discounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_type TEXT NOT NULL CHECK (passenger_type IN ('regular','student','senior','pwd')),
  discount_rate  NUMERIC(5,4) NOT NULL CHECK (discount_rate >= 0 AND discount_rate <= 1),
  effective_from DATE NOT NULL,
  effective_to   DATE NULL,
  notes          TEXT NULL,
  UNIQUE (passenger_type, effective_from)
);

CREATE TABLE IF NOT EXISTS transit_fares (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id                 UUID NOT NULL REFERENCES transit_lines(id) ON DELETE CASCADE,
  fare_medium             TEXT NOT NULL CHECK (fare_medium IN ('SJT','SVC')), -- Single Journey Ticket vs Stored Value Card
  origin_station_id       UUID NOT NULL REFERENCES transit_stations(id) ON DELETE CASCADE,
  destination_station_id  UUID NOT NULL REFERENCES transit_stations(id) ON DELETE CASCADE,
  base_fare               NUMERIC(12,2) NOT NULL CHECK (base_fare >= 0),
  effective_from          DATE NOT NULL,
  source_note             TEXT NULL,
  UNIQUE (line_id, fare_medium, origin_station_id, destination_station_id, effective_from)
);

-- =========================================================
-- Transit Lines
-- =========================================================

INSERT INTO transit_lines (code, name, color, is_active)
VALUES
  ('LRT-1', 'LRT Line 1',  '#1E88E5', TRUE),
  ('LRT-2', 'LRT Line 2',  '#7B1FA2', TRUE),
  ('MRT-3', 'MRT Line 3',  '#2E7D32', TRUE),
  ('MRT-7', 'MRT Line 7',  '#8B0000', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Helper CTE to fetch line IDs
WITH line_ids AS (
  SELECT
    (SELECT id FROM transit_lines WHERE code='LRT-1') AS lrt1,
    (SELECT id FROM transit_lines WHERE code='LRT-2') AS lrt2,
    (SELECT id FROM transit_lines WHERE code='MRT-3') AS mrt3,
    (SELECT id FROM transit_lines WHERE code='MRT-7') AS mrt7
)
SELECT 1;

-- =========================================================
-- Stations (seed in logical order for dropdowns)
-- =========================================================

-- LRT-1 stations (based on the Apr 2, 2025 matrices)
WITH lrt1 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-1')
INSERT INTO transit_stations (line_id, name, sort_order, is_active)
SELECT lrt1.line_id, s.name, s.sort_order, TRUE
FROM lrt1
JOIN (VALUES
  ('Dr. Santos', 1),
  ('Ninoy Aquino Avenue', 2),
  ('PITX', 3),
  ('MIA Road', 4),
  ('Redemptorist-Aseana', 5),
  ('Baclaran', 6),
  ('EDSA', 7),
  ('Libertad', 8),
  ('Gil Puyat', 9),
  ('Vito Cruz', 10),
  ('Quirino', 11),
  ('Pedro Gil', 12),
  ('UN Avenue', 13),
  ('Central Terminal', 14),
  ('Carriedo', 15),
  ('Doroteo Jose', 16),
  ('Bambang', 17),
  ('Tayuman', 18),
  ('Blumentritt', 19),
  ('Abad Santos', 20),
  ('R. Papa', 21),
  ('5th Avenue', 22),
  ('Monumento', 23),
  ('Balintawak', 24),
  ('Fernando Poe Jr.', 25)
) AS s(name, sort_order) ON TRUE
ON CONFLICT (line_id, name) DO NOTHING;

-- LRT-2 stations (Recto -> Antipolo)
WITH lrt2 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-2')
INSERT INTO transit_stations (line_id, name, sort_order, is_active)
SELECT lrt2.line_id, s.name, s.sort_order, TRUE
FROM lrt2
JOIN (VALUES
  ('Recto', 1),
  ('Legarda', 2),
  ('Pureza', 3),
  ('V. Mapa', 4),
  ('J. Ruiz', 5),
  ('Gilmore', 6),
  ('Betty Go-Belmonte', 7),
  ('Cubao', 8),
  ('Anonas', 9),
  ('Katipunan', 10),
  ('Santolan', 11),
  ('Marikina–Pasig', 12),
  ('Antipolo', 13)
) AS s(name, sort_order) ON TRUE
ON CONFLICT (line_id, name) DO NOTHING;

-- MRT-3 stations (North Ave -> Taft)
WITH mrt3 AS (SELECT id AS line_id FROM transit_lines WHERE code='MRT-3')
INSERT INTO transit_stations (line_id, name, sort_order, is_active)
SELECT mrt3.line_id, s.name, s.sort_order, TRUE
FROM mrt3
JOIN (VALUES
  ('North Avenue', 1),
  ('Quezon Avenue', 2),
  ('Kamuning', 3),
  ('Cubao', 4),
  ('Santolan–Annapolis', 5),
  ('Ortigas', 6),
  ('Shaw Boulevard', 7),
  ('Boni', 8),
  ('Guadalupe', 9),
  ('Buendia', 10),
  ('Ayala', 11),
  ('Magallanes', 12),
  ('Taft Avenue', 13)
) AS s(name, sort_order) ON TRUE
ON CONFLICT (line_id, name) DO NOTHING;

-- MRT-7 stations (seed only; fares not available yet)
WITH mrt7 AS (SELECT id AS line_id FROM transit_lines WHERE code='MRT-7')
INSERT INTO transit_stations (line_id, name, sort_order, is_active)
SELECT mrt7.line_id, s.name, s.sort_order, TRUE
FROM mrt7
JOIN (VALUES
  ('North EDSA', 1),
  ('Quezon Memorial Circle', 2),
  ('University Avenue', 3),
  ('Tandang Sora', 4),
  ('Don Antonio', 5),
  ('Batasan', 6),
  ('Manggahan', 7),
  ('Doña Carmen', 8),
  ('Regalado Avenue', 9),
  ('Mindanao Avenue', 10),
  ('Quirino Highway', 11),
  ('Sacred Heart', 12),
  ('Tala', 13),
  ('San Jose del Monte', 14)
) AS s(name, sort_order) ON TRUE
ON CONFLICT (line_id, name) DO NOTHING;

-- =========================================================
-- Discount policy (LATEST): Students, Seniors, PWD = 50%
-- =========================================================

INSERT INTO fare_discounts (passenger_type, discount_rate, effective_from, effective_to, notes)
VALUES
  ('regular', 0.0000, '2000-01-01', NULL, 'No discount'),
  ('student', 0.5000, '2025-06-20', '2028-12-31', 'DOTr: Student discount increased to 50% for SJT (LRT-1/LRT-2/MRT-3)'),
  ('senior',  0.5000, '2025-07-16', NULL, '50% discount for seniors on LRT-1/LRT-2/MRT-3'),
  ('pwd',     0.5000, '2025-07-16', NULL, '50% discount for PWD on LRT-1/LRT-2/MRT-3')
ON CONFLICT (passenger_type, effective_from) DO NOTHING;

-- =========================================================
-- Sample point-to-point fares (end-to-end examples)
-- NOTE: These are base fares. Apply discount_rate in app logic.
-- =========================================================

-- LRT-1 end-to-end: Dr. Santos -> Fernando Poe Jr.
-- Effective: Apr 2, 2025 (SJT max 55; SVC max 52)
WITH
  lrt1 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-1'),
  o AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt1) AND name='Dr. Santos'
  ),
  d AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt1) AND name='Fernando Poe Jr.'
  )
INSERT INTO transit_fares (line_id, fare_medium, origin_station_id, destination_station_id, base_fare, effective_from, source_note)
SELECT
  (SELECT line_id FROM lrt1),
  'SJT',
  (SELECT station_id FROM o),
  (SELECT station_id FROM d),
  55.00,
  '2025-04-02',
  'LRMC LRT-1 SJT fare matrix (effective Apr 2, 2025)'
ON CONFLICT DO NOTHING;

WITH
  lrt1 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-1'),
  o AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt1) AND name='Dr. Santos'
  ),
  d AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt1) AND name='Fernando Poe Jr.'
  )
INSERT INTO transit_fares (line_id, fare_medium, origin_station_id, destination_station_id, base_fare, effective_from, source_note)
SELECT
  (SELECT line_id FROM lrt1),
  'SVC',
  (SELECT station_id FROM o),
  (SELECT station_id FROM d),
  52.00,
  '2025-04-02',
  'LRMC LRT-1 Stored Value fare matrix (effective Apr 2, 2025)'
ON CONFLICT DO NOTHING;

-- LRT-2 end-to-end: Recto -> Antipolo
-- SJT max 35; SVC max 33 (matrix effective Aug 2, 2023; discount notes updated 2025)
WITH
  lrt2 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-2'),
  o AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt2) AND name='Recto'
  ),
  d AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt2) AND name='Antipolo'
  )
INSERT INTO transit_fares (line_id, fare_medium, origin_station_id, destination_station_id, base_fare, effective_from, source_note)
SELECT
  (SELECT line_id FROM lrt2),
  'SJT',
  (SELECT station_id FROM o),
  (SELECT station_id FROM d),
  35.00,
  '2023-08-02',
  'LRTA LRT-2 Single Journey fare matrix (effective Aug 2, 2023) + 50% discount notes'
ON CONFLICT DO NOTHING;

WITH
  lrt2 AS (SELECT id AS line_id FROM transit_lines WHERE code='LRT-2'),
  o AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt2) AND name='Recto'
  ),
  d AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM lrt2) AND name='Antipolo'
  )
INSERT INTO transit_fares (line_id, fare_medium, origin_station_id, destination_station_id, base_fare, effective_from, source_note)
SELECT
  (SELECT line_id FROM lrt2),
  'SVC',
  (SELECT station_id FROM o),
  (SELECT station_id FROM d),
  33.00,
  '2023-08-02',
  'LRTA LRT-2 Stored Value (Beep) fare matrix (effective Aug 2, 2023) + 50% discount notes'
ON CONFLICT DO NOTHING;

-- MRT-3 end-to-end: North Avenue -> Taft Avenue (regular 28)
WITH
  mrt3 AS (SELECT id AS line_id FROM transit_lines WHERE code='MRT-3'),
  o AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM mrt3) AND name='North Avenue'
  ),
  d AS (
    SELECT id AS station_id FROM transit_stations
    WHERE line_id = (SELECT line_id FROM mrt3) AND name='Taft Avenue'
  )
INSERT INTO transit_fares (line_id, fare_medium, origin_station_id, destination_station_id, base_fare, effective_from, source_note)
SELECT
  (SELECT line_id FROM mrt3),
  'SJT',
  (SELECT station_id FROM o),
  (SELECT station_id FROM d),
  28.00,
  '2025-01-01',
  'DOTr MRT-3 fare matrix (brochure PDF)'
ON CONFLICT DO NOTHING;

COMMIT;