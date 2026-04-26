-- Corporate emergency evacuation paper template system.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS template_layout_id UUID,
  ADD COLUMN IF NOT EXISTS page_preset TEXT DEFAULT 'A3-Landscape',
  ADD COLUMN IF NOT EXISTS template_state JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.template_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'GENEL',
  page_preset TEXT NOT NULL DEFAULT 'A3-Landscape',
  orientation TEXT NOT NULL DEFAULT 'landscape',
  layout_json JSONB NOT NULL,
  thumbnail_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  compliance_tags TEXT[] NOT NULL DEFAULT ARRAY['ISO 23601:2020', 'ISO 7010:2019'],
  version INTEGER NOT NULL DEFAULT 1,
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND constraint_name = 'projects_template_layout_id_fkey'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_template_layout_id_fkey
      FOREIGN KEY (template_layout_id)
      REFERENCES public.template_layouts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_template_layouts_official_category
  ON public.template_layouts (is_official, category, page_preset);

CREATE INDEX IF NOT EXISTS idx_template_layouts_user
  ON public.template_layouts (user_id);

ALTER TABLE public.template_layouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view official and own template layouts" ON public.template_layouts;
CREATE POLICY "Users can view official and own template layouts"
  ON public.template_layouts FOR SELECT
  USING (is_official = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own template layouts" ON public.template_layouts;
CREATE POLICY "Users can insert own template layouts"
  ON public.template_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_official = false);

DROP POLICY IF EXISTS "Users can update own template layouts" ON public.template_layouts;
CREATE POLICY "Users can update own template layouts"
  ON public.template_layouts FOR UPDATE
  USING (auth.uid() = user_id AND is_official = false);

DROP POLICY IF EXISTS "Users can delete own template layouts" ON public.template_layouts;
CREATE POLICY "Users can delete own template layouts"
  ON public.template_layouts FOR DELETE
  USING (auth.uid() = user_id AND is_official = false);

WITH families AS (
  SELECT *
  FROM (VALUES
    ('classic-composite', 'TR Klasik Kompozit', 'GENEL', 'Üst başlık, sol bilgilendirme, sağ ekip rayı ve alt talimat blokları.', 'classic', '#00965e'),
    ('left-instruction', 'TR Sol Talimat', 'GENEL', 'Sol tarafta geniş acil durum ve yangın talimat kolonları.', 'leftRail', '#00965e'),
    ('right-equipment', 'TR Sağ Bilgi Rayı', 'GENEL', 'Sağ tarafta sembol dizini ve ekipman listesi vurgulu kompozisyon.', 'rightRail', '#0ea5e9'),
    ('bottom-guidance', 'TR Alt Talimat Şeridi', 'GENEL', 'Alt bantta talimat, lejand ve onay alanları bulunan geniş çizim düzeni.', 'bottomBand', '#00965e'),
    ('dual-instruction', 'Çift Talimat Paneli', 'KURUMSAL', 'Yangın ve acil durum talimatlarını iki dengeli kolonda verir.', 'dualRails', '#b91c1c'),
    ('overview-plus', 'Vaziyet Planlı', 'SAHA', 'Ana kat planının yanında vaziyet/toplanma alanı için ayrılmış düzen.', 'overview', '#2563eb'),
    ('approval-qr', 'Onay ve QR Alanlı', 'KURUMSAL', 'Revizyon, hazırlayan, onay ve QR alanları güçlü kurumsal çıktı.', 'approval', '#334155'),
    ('compact-a4', 'Kompakt Talimatlı', 'SERBEST', 'A4 ve dar panolar için yoğun ama okunaklı yerleşim.', 'compact', '#00965e'),
    ('panoramic-a3', 'Panoramik A3', 'ENDÜSTRİ', 'Büyük kat planına öncelik veren geniş panoramik kompozisyon.', 'panoramic', '#0284c7'),
    ('public-board', 'Kamu Duyuru Panosu', 'KAMU', 'Kamu alanları için net başlık, duyuru ve talimat hiyerarşisi.', 'public', '#007a3d'),
    ('minimal-iso', 'Minimal ISO Çerçeve', 'SERBEST', 'Beyaz alanı yüksek, sakin ve denetim odaklı resmi şablon.', 'minimal', '#00965e'),
    ('technical-slate', 'Teknik Slate Kompozit', 'ENDÜSTRİ', 'Teknik tesisler için koyu başlık raylı endüstriyel kağıt düzeni.', 'technical', '#475569'),
    ('wide-legend', 'Geniş Lejand Dizini', 'GENEL', 'Çok sembollü projelerde geniş lejand ve açıklama alanı sağlar.', 'legendHeavy', '#00965e'),
    ('response-team', 'Ekip ve Sorumlu Alanlı', 'KURUMSAL', 'Acil durum sorumlusu, yangın sorumlusu ve ekip bilgisi alanları içerir.', 'team', '#dc2626')
  ) AS f(slug, name, category, description, style, accent)
),
presets AS (
  SELECT *
  FROM (VALUES
    ('A3-Landscape', 'landscape', 1400, 990),
    ('A3-Portrait', 'portrait', 990, 1400),
    ('A4-Landscape', 'landscape', 1120, 792),
    ('A4-Portrait', 'portrait', 792, 1120)
  ) AS p(page_preset, orientation, width, height)
),
seed_rows AS (
  SELECT
    lower(f.slug || '-' || replace(p.page_preset, '-', '-')) AS slug,
    f.name || ' / ' || replace(p.page_preset, '-', ' ') AS name,
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
        WHEN 'panoramic' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Üst Başlık / Duyuru','x',2,'y',2,'w',96,'h',10,'tone','green'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',2,'y',14,'w',76,'h',68,'tone','paper'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',80,'y',14,'w',18,'h',32,'tone','info'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',80,'y',48,'w',18,'h',22,'tone','green'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma / Vaziyet','x',80,'y',72,'w',18,'h',18,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon / Onay','x',2,'y',84,'w',96,'h',12,'tone','neutral')
        )
        WHEN 'leftRail' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Başlık / Kurum','x',3,'y',3,'w',94,'h',9,'tone','green'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',3,'y',15,'w',19,'h',35,'tone','green'),
          jsonb_build_object('id','fireInstruction','type','instruction','label','Yangın Talimatı','x',3,'y',52,'w',19,'h',28,'tone','red'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',25,'y',15,'w',70,'h',65,'tone','paper'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',3,'y',82,'w',44,'h',13,'tone','info'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma Alanı','x',50,'y',82,'w',22,'h',13,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Onay','x',75,'y',82,'w',20,'h',13,'tone','neutral')
        )
        WHEN 'rightRail' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Başlık / Kurum','x',3,'y',3,'w',94,'h',9,'tone','green'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',3,'y',15,'w',70,'h',65,'tone','paper'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',76,'y',15,'w',21,'h',35,'tone','info'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',76,'y',52,'w',21,'h',28,'tone','green'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma Alanı','x',3,'y',82,'w',34,'h',13,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon / Onay','x',40,'y',82,'w',57,'h',13,'tone','neutral')
        )
        WHEN 'bottomBand' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Başlık / Duyuru','x',3,'y',3,'w',94,'h',10,'tone','green'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',3,'y',16,'w',94,'h',58,'tone','paper'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',3,'y',77,'w',30,'h',18,'tone','green'),
          jsonb_build_object('id','fireInstruction','type','instruction','label','Yangın Talimatı','x',35,'y',77,'w',30,'h',18,'tone','red'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',67,'y',77,'w',18,'h',18,'tone','info'),
          jsonb_build_object('id','approval','type','approval','label','Onay / QR','x',87,'y',77,'w',10,'h',18,'tone','neutral')
        )
        WHEN 'dualRails' THEN jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Başlık / Duyuru','x',3,'y',3,'w',94,'h',10,'tone','green'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',3,'y',16,'w',17,'h',38,'tone','green'),
          jsonb_build_object('id','fireInstruction','type','instruction','label','Yangın Talimatı','x',80,'y',16,'w',17,'h',38,'tone','red'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',22,'y',16,'w',56,'h',62,'tone','paper'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',3,'y',57,'w',17,'h',38,'tone','info'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma Alanı','x',22,'y',81,'w',35,'h',14,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Sorumlu / Onay','x',59,'y',81,'w',38,'h',14,'tone','neutral')
        )
        ELSE jsonb_build_array(
          jsonb_build_object('id','header','type','header','label','Başlık / Duyuru','x',3,'y',3,'w',94,'h',10,'tone','green'),
          jsonb_build_object('id','instructions','type','instruction','label','Acil Durum Talimatı','x',3,'y',16,'w',18,'h',31,'tone','green'),
          jsonb_build_object('id','fireInstruction','type','instruction','label','Yangın Talimatı','x',3,'y',50,'w',18,'h',28,'tone','red'),
          jsonb_build_object('id','drawing','type','drawing','label','Ana Çizim Alanı','x',24,'y',16,'w',58,'h',62,'tone','paper'),
          jsonb_build_object('id','legend','type','legend','label','Semboller Dizini','x',84,'y',16,'w',13,'h',31,'tone','info'),
          jsonb_build_object('id','assembly','type','assembly','label','Toplanma / Vaziyet','x',84,'y',50,'w',13,'h',28,'tone','blue'),
          jsonb_build_object('id','approval','type','approval','label','Revizyon / Onay','x',3,'y',81,'w',94,'h',14,'tone','neutral')
        )
      END
  ),
  jsonb_build_object('accent', accent, 'style', style, 'regions', 6),
  ARRAY['ISO 23601:2020', 'ISO 7010:2019', 'TR BYKHY', 'Saglik Guvenlik Isaretleri'],
  1,
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
