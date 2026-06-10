-- V3__add_salon_coordinates.sql
-- Add latitude and longitude fields to salons table

ALTER TABLE salons ADD COLUMN latitude NUMERIC(9,6);
ALTER TABLE salons ADD COLUMN longitude NUMERIC(9,6);

-- Seed default coordinates for existing salons
-- Wimco Nagar branch: approx 13.1706 N, 80.3015 E
-- Theradi branch: approx 13.1594 N, 80.3014 E
-- Chennai Central default (for Vip salon or others): 13.0827, 80.2707
UPDATE salons SET latitude = 13.170600, longitude = 80.301500 WHERE LOWER(name) LIKE '%wimco%';
UPDATE salons SET latitude = 13.159400, longitude = 80.301400 WHERE LOWER(name) LIKE '%theradi%';
UPDATE salons SET latitude = 13.082700, longitude = 80.270700 WHERE latitude IS NULL;
