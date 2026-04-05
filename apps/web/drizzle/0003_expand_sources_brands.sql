-- Migration 0003: Expand sources and brands for Phase 4.2 partner feed expansion
-- Adds 10 new sources (5 live + 5 catalog) and 6 new brands

-- ── New Sources ────────────────────────────────────────────────────────────────

INSERT INTO sources (slug, name, type, base_url, trust_zone, is_active, created_at, updated_at)
VALUES
  -- Live HTML adapters (Phase 4.2)
  ('cdkeys',     'CDKeys',     'authorized_reseller', 'https://www.cdkeys.com',     'green',  true, NOW(), NOW()),
  ('eneba',      'Eneba',      'marketplace_resale',  'https://www.eneba.com',      'yellow', true, NOW(), NOW()),
  ('offgamers',  'OffGamers',  'marketplace_resale',  'https://www.offgamers.com',  'yellow', true, NOW(), NOW()),
  ('g2a',        'G2A',        'marketplace_resale',  'https://www.g2a.com',        'yellow', true, NOW(), NOW()),
  ('kinguin',    'Kinguin',    'marketplace_resale',  'https://www.kinguin.net',    'yellow', true, NOW(), NOW()),
  -- Catalog sources (Phase 4.2 expansion)
  ('bestbuy',    'Best Buy',   'authorized_reseller', 'https://www.bestbuy.com',    'green',  true, NOW(), NOW()),
  ('target',     'Target',     'authorized_reseller', 'https://www.target.com',     'green',  true, NOW(), NOW()),
  ('newegg',     'Newegg',     'authorized_reseller', 'https://www.newegg.com',     'green',  true, NOW(), NOW()),
  ('walmart',    'Walmart',    'authorized_reseller', 'https://www.walmart.com',    'green',  true, NOW(), NOW()),
  ('gamestop',   'GameStop',   'authorized_reseller', 'https://www.gamestop.com',   'green',  true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ── New Brands ─────────────────────────────────────────────────────────────────

INSERT INTO brands (slug, name, category, country_of_origin, created_at, updated_at)
VALUES
  ('roblox',         'Roblox',         'gaming',    'US', NOW(), NOW()),
  ('valorant',       'Valorant',        'gaming',    'US', NOW(), NOW()),
  ('twitch',         'Twitch',          'streaming', 'US', NOW(), NOW()),
  ('ea-play',        'EA Play',         'gaming',    'US', NOW(), NOW()),
  ('playstation-plus', 'PlayStation Plus', 'gaming', 'JP', NOW(), NOW()),
  ('razer-gold',     'Razer Gold',      'gaming',    'SG', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
