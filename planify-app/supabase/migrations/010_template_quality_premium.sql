-- Premium template polish and private region media assets.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template-region-assets',
  'template-region-assets',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can view own template region assets" ON storage.objects;
CREATE POLICY "Users can view own template region assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'template-region-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can upload own template region assets" ON storage.objects;
CREATE POLICY "Users can upload own template region assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'template-region-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own template region assets" ON storage.objects;
CREATE POLICY "Users can update own template region assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'template-region-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'template-region-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own template region assets" ON storage.objects;
CREATE POLICY "Users can delete own template region assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'template-region-assets'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

WITH families AS (
  SELECT *
  FROM (VALUES
    ('premium-audit', 'Premium Denetim', 'PREMIUM', 'Denetim skoru, acil telefon ve resmi onay blokları güçlü premium düzen.', 'premiumAudit', '#0f766e'),
    ('site-overview-pro', 'Saha Vaziyet Premium', 'PREMIUM', 'Vaziyet/toplanma görseli ve ana tahliye planını dengeli sunan saha düzeni.', 'sitePremium', '#2563eb'),
    ('corporate-3d-board', 'Kurumsal 3D Board', 'PREMIUM', 'Satış algısı yüksek, katmanlı resmi pano estetiği ve güçlü bilgi hiyerarşisi.', 'corporate3d', '#4f46e5')
  ) AS f(slug, name, category, description, style, accent)
),
presets AS (
  SELECT *
  FROM (VALUES
    ('Landscape', 'landscape', 1414, 1000),
    ('Portrait', 'portrait', 1000, 1414)
  ) AS p(page_preset, orientation, width, height)
),
seed_rows AS (
  SELECT
    lower(f.slug || '-a3-' || p.orientation) AS slug,
    f.name || ' (' || CASE WHEN p.orientation = 'landscape' THEN 'Yatay' ELSE 'Dikey' END || ')' AS name,
    f.description,
    f.category,
    p.page_preset,
    p.orientation,
    f.style,
    f.accent,
    p.width,
    p.height
  FROM families f
  CROSS JOIN presets p
)
INSERT INTO public.template_layouts (
  slug,
  name,
  description,
  category,
  page_preset,
  orientation,
  layout_json,
  thumbnail_json,
  compliance_tags,
  version,
  is_official
)
SELECT
  slug,
  name,
  description,
  category,
  page_preset,
  orientation,
  jsonb_build_object(
    'id', slug,
    'style', style,
    'accent', accent,
    'page', jsonb_build_object('preset', page_preset, 'width', width, 'height', height, 'orientation', orientation),
    'regions',
      CASE style
        WHEN 'premiumAudit' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','ACİL DURUM VE YANGIN TAHLİYE PLANI','x',2,'y',2,'w',96,'h',9,'tone','green'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',2,'y',13,'w',68,'h',66,'tone','paper'),
          jsonb_build_object('id','emergency','type','emergency','label','112 Acil Durum Telefonu','x',72,'y',13,'w',26,'h',10,'tone','red'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',72,'y',25,'w',26,'h',22,'tone','green'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',72,'y',49,'w',26,'h',18,'tone','info'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma / Vaziyet','x',72,'y',69,'w',26,'h',10,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon ve Onay','x',2,'y',82,'w',96,'h',14,'tone','neutral')
        )
        WHEN 'sitePremium' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','ACİL DURUM VE YANGIN TAHLİYE PLANI','x',2,'y',2,'w',96,'h',9,'tone','green'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',2,'y',13,'w',64,'h',62,'tone','paper'),
          jsonb_build_object('id','assembly','type','assembly','label','Vaziyet / Toplanma Alanı','x',68,'y',13,'w',30,'h',30,'tone','blue'),
          jsonb_build_object('id','emergency','type','emergency','label','112 Acil Durum Telefonu','x',68,'y',45,'w',30,'h',10,'tone','red'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',68,'y',57,'w',30,'h',18,'tone','info'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',2,'y',78,'w',45,'h',18,'tone','green'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon ve Onay','x',49,'y',78,'w',49,'h',18,'tone','neutral')
        )
        ELSE jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','ACİL DURUM VE YANGIN TAHLİYE PLANI','x',2,'y',2,'w',96,'h',10,'tone','green'),
          jsonb_build_object('id','emergency','type','emergency','label','112 Acil Durum Telefonu','x',2,'y',14,'w',18,'h',10,'tone','red'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',2,'y',26,'w',18,'h',29,'tone','green'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',2,'y',57,'w',18,'h',20,'tone','info'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',22,'y',14,'w',54,'h',63,'tone','paper'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma / Vaziyet','x',78,'y',14,'w',20,'h',29,'tone','blue'),
          jsonb_build_object('id','fireInstruction','type','instruction','label','Yangın Talimatı','x',78,'y',45,'w',20,'h',32,'tone','red'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon ve Onay','x',2,'y',80,'w',96,'h',16,'tone','neutral')
        )
      END
  ),
  jsonb_build_object('accent', accent, 'style', style, 'depth', 'premium'),
  ARRAY['ISO 23601:2020', 'ISO 7010:2019', 'TR BYKHY', 'Premium'],
  2,
  true
FROM seed_rows
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  page_preset = EXCLUDED.page_preset,
  orientation = EXCLUDED.orientation,
  layout_json = EXCLUDED.layout_json,
  thumbnail_json = EXCLUDED.thumbnail_json,
  compliance_tags = EXCLUDED.compliance_tags,
  version = EXCLUDED.version,
  is_official = EXCLUDED.is_official,
  updated_at = NOW();
