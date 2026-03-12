BEGIN;

DELETE FROM transit_fares
WHERE line_id IN (
  SELECT id FROM transit_lines WHERE code = 'MRT-7'
);

DELETE FROM transit_stations
WHERE line_id IN (
  SELECT id FROM transit_lines WHERE code = 'MRT-7'
);

DELETE FROM transit_lines
WHERE code = 'MRT-7';

COMMIT;
