-- iGift seed data: sources and brands for production
-- Uses correct column names from current schema

-- ── Sources ──────────────────────────────────────────────────────────────────

INSERT INTO sources (slug, name, source_type, url, trust_zone, is_active, has_buyer_protection, has_refund_policy, refresh_interval_minutes, created_at, updated_at)
VALUES
  -- Green zone: authorized resellers and official stores
  ('bitrefill',  'Bitrefill',      'crypto_store',        'https://www.bitrefill.com',    'green',  true, true,  true,  60, NOW(), NOW()),
  ('dundle',     'Dundle',         'authorized_reseller', 'https://www.dundle.com',       'green',  true, true,  true,  60, NOW(), NOW()),
  ('raise',      'Raise',          'marketplace_resale',  'https://www.raise.com',        'green',  true, true,  true,  60, NOW(), NOW()),
  ('cdkeys',     'CDKeys',         'authorized_reseller', 'https://www.cdkeys.com',       'green',  true, true,  true,  60, NOW(), NOW()),
  -- Yellow zone: marketplaces with buyer protection
  ('eneba',      'Eneba',          'marketplace_resale',  'https://www.eneba.com',        'yellow', true, true,  true,  60, NOW(), NOW()),
  ('offgamers',  'OffGamers',      'marketplace_resale',  'https://www.offgamers.com',    'yellow', true, true,  false, 60, NOW(), NOW()),
  ('g2a',        'G2A',            'marketplace_resale',  'https://www.g2a.com',          'yellow', true, true,  true,  60, NOW(), NOW()),
  ('kinguin',    'Kinguin',        'marketplace_resale',  'https://www.kinguin.net',      'yellow', true, true,  true,  60, NOW(), NOW()),
  ('gameflip',   'Gameflip',       'marketplace_resale',  'https://gameflip.com',         'yellow', true, true,  true,  60, NOW(), NOW()),
  ('giftcardgranny', 'GiftCardGranny', 'deal_community', 'https://www.giftcardgranny.com', 'green', true, false, false, 120, NOW(), NOW()),
  ('buysellvouchers', 'BuySellVouchers', 'marketplace_resale', 'https://www.buysellvouchers.com', 'yellow', true, false, false, 120, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ── Brands ───────────────────────────────────────────────────────────────────

INSERT INTO brands (slug, name, category, description, regions_supported, is_active, created_at, updated_at)
VALUES
  -- Gaming
  ('steam',            'Steam',              'gaming',      'PC gaming platform by Valve',                '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('playstation',      'PlayStation',         'gaming',      'Sony PlayStation Store credits',             '["US","EU","GB","JP"]',     true, NOW(), NOW()),
  ('xbox',             'Xbox',               'gaming',      'Microsoft Xbox/Game Pass credits',           '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('nintendo',         'Nintendo',           'gaming',      'Nintendo eShop credits',                     '["US","EU","JP"]',          true, NOW(), NOW()),
  ('roblox',           'Roblox',             'gaming',      'Roblox in-game currency',                   '["US","Global"]',           true, NOW(), NOW()),
  ('valorant',         'Valorant',           'gaming',      'Riot Games Valorant Points',                '["US","EU","Global"]',      true, NOW(), NOW()),
  ('ea-play',          'EA Play',            'gaming',      'Electronic Arts subscription and credits',   '["US","EU","GB"]',          true, NOW(), NOW()),
  ('razer-gold',       'Razer Gold',         'gaming',      'Razer Gold virtual credits',                '["US","EU","Global"]',      true, NOW(), NOW()),
  -- App Stores
  ('apple',            'Apple',              'app_stores',  'Apple App Store & iTunes credits',          '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('google-play',      'Google Play',        'app_stores',  'Google Play Store credits',                 '["US","EU","GB","Global"]', true, NOW(), NOW()),
  -- Streaming
  ('netflix',          'Netflix',            'streaming',   'Netflix subscription gift cards',           '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('spotify',          'Spotify',            'streaming',   'Spotify Premium subscription cards',        '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('twitch',           'Twitch',             'streaming',   'Twitch gift subscriptions',                 '["US","Global"]',           true, NOW(), NOW()),
  ('disney-plus',      'Disney+',            'streaming',   'Disney+ streaming gift cards',              '["US","EU","GB"]',          true, NOW(), NOW()),
  -- Retail
  ('amazon',           'Amazon',             'retail',      'Amazon gift cards and credits',             '["US","EU","GB","DE","JP"]', true, NOW(), NOW()),
  ('walmart',          'Walmart',            'retail',      'Walmart gift cards',                        '["US"]',                    true, NOW(), NOW()),
  ('target',           'Target',             'retail',      'Target gift cards',                         '["US"]',                    true, NOW(), NOW()),
  ('ebay',             'eBay',               'retail',      'eBay gift cards',                           '["US","EU","GB","Global"]', true, NOW(), NOW()),
  -- Food & Dining
  ('uber-eats',        'Uber Eats',          'food_dining', 'Uber Eats delivery credits',               '["US","EU","GB","Global"]', true, NOW(), NOW()),
  ('doordash',         'DoorDash',           'food_dining', 'DoorDash delivery gift cards',              '["US"]',                   true, NOW(), NOW()),
  ('starbucks',        'Starbucks',          'food_dining', 'Starbucks gift cards',                     '["US","EU","GB"]',          true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
