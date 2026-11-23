-- Seed data for Al Hashmi Real Estate Agency Sahiwal
-- All 6 listings are clearly marked as sample placeholder listings (is_sample = true) for easy replacement.

insert into public.site_settings (id) values ('default') on conflict (id) do nothing;

insert into public.properties (
  title, slug, description, purpose, type, price_pkr, area_value, area_unit,
  bedrooms, bathrooms, parking, furnished, year_built, address, area_name,
  lat, lng, amenities, status, featured, is_sample
) values
(
  '[Sample Listing] 10 Marla Double-Storey Residence near Ahdian Road',
  'sample-10-marla-residence-ahdian-road',
  'Sample placeholder listing demonstrating a contemporary 10 Marla double-storey family home with solid brick construction, arched entrance porch, spacious drawing and dining areas, and dedicated car porch.',
  'sale', 'house', 28500000, 10, 'marla', 4, 5, 2, 'semi_furnished', 2024,
  'Ahdian Road, Bashir Town, Ferozewala', 'Bashir Town, Ferozewala',
  31.6921, 74.2945, array['Gas connection', 'Electricity', '24/7 water supply', 'Car porch', 'Lawn'],
  'for_sale', true, true
),
(
  '[Sample Listing] 1 Kanal Corner Villa in Rana Town',
  'sample-1-kanal-corner-villa-rana-town',
  'Sample placeholder listing showcasing a corner 1 Kanal residential villa with stone facade, verandah arches, servant quarters, and wide street frontage.',
  'sale', 'house', 64000000, 1, 'kanal', 5, 6, 3, 'unfurnished', 2023,
  'Block B, Rana Town, Tehsil Ferozewala', 'Rana Town',
  31.6908, 74.2931, array['Corner plot', 'Electricity', 'Lawn', 'Servant quarter', 'Store room'],
  'for_sale', true, true
),
(
  '[Sample Listing] 12 Marla Commercial Corner Plot on Hardosohal Road',
  'sample-12-marla-commercial-plot-hardosohal',
  'Sample placeholder listing for a level, demarcated 12 Marla commercial-potential plot situated along 1.5 Hardosohal Road with direct road access.',
  'sale', 'plot', 18000000, 12, 'marla', 0, 0, 0, 'unfurnished', null,
  '1.5 Hardosohal Road Corridor, Ferozewala', 'Hardosohal Road',
  31.6934, 74.2958, array['Main road frontage', 'Registry & Intiqal ready', 'Corner access'],
  'for_sale', true, true
),
(
  '[Sample Listing] Ground Floor Retail & Office Suite near Sahiwal GT Road',
  'sample-commercial-suite-sahiwal-gt-road',
  'Sample placeholder listing for a modern commercial office and showroom unit suitable for banks, pharmacies, or corporate branch offices.',
  'rent', 'office', 145000, 1800, 'sq_ft', 0, 2, 4, 'semi_furnished', 2022,
  'Main GT Road Commercial Zone, Sahiwal', 'GT Road, Sahiwal',
  30.6682, 73.1114, array['Dedicated parking', 'Backup generator provision', 'Glass storefront'],
  'for_rent', true, true
),
(
  '[Sample Listing] 3-Bedroom Upper Portion Apartment for Family Rent',
  'sample-3-bed-apartment-farid-town-sahiwal',
  'Sample placeholder listing for a bright, well-ventilated 3-bedroom residential apartment with walnut woodwork and marble flooring.',
  'rent', 'apartment', 55000, 1650, 'sq_ft', 3, 3, 1, 'furnished', 2023,
  'Farid Town Phase 1, Sahiwal', 'Farid Town, Sahiwal',
  30.6612, 73.1068, array['Furnished', 'Separate electricity meter', 'Balcony', 'Security gate'],
  'for_rent', true, true
),
(
  '[Sample Listing] 4 Acre Irrigated Agricultural Estate & Farmhouse',
  'sample-4-acre-agricultural-farmhouse-punjab',
  'Sample placeholder listing for fertile irrigated farmland paired with a brick country farmhouse and private tree-lined access track.',
  'sale', 'agricultural_land', 42000000, 4, 'acre', 2, 2, 4, 'unfurnished', 2019,
  'Ahdian Mouza Agricultural Belt, Ferozewala', 'Ahdian Belt',
  31.6850, 74.2870, array['Canal & tube-well water', 'Brick farmhouse', 'Clear Fard record'],
  'for_sale', true, true
);
