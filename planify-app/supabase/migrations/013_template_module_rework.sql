-- KolayTahliye v2 professional template/module catalog.
-- Keeps users/projects intact and resets only official template/module catalog rows.

ALTER TABLE public.template_layouts
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.template_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement TEXT NOT NULL DEFAULT 'recommended',
  default_region JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  renderer_variant TEXT NOT NULL DEFAULT 'standard',
  audit_tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  version INTEGER NOT NULL DEFAULT 2,
  is_official BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.template_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view official template modules" ON public.template_modules;
CREATE POLICY "Users can view official template modules"
  ON public.template_modules FOR SELECT
  USING (is_official = true);

DELETE FROM public.template_modules WHERE is_official = true;

INSERT INTO public.template_modules (
  type,
  label,
  description,
  requirement,
  default_region,
  default_state,
  renderer_variant,
  audit_tags,
  version,
  is_official
)
VALUES
  ('Header', 'Baslik / Kimlik', 'Logo, isyeri/proje adi, kat, tarih ve revizyon kimligi.', 'required', '{"x":3,"y":3,"w":94,"h":10}', '{"title":"ACIL DURUM TAHLİYE PLANI","body":"Emergency Evacuation Plan","meta":"Isyeri / Proje: __________ | Kat/Bolum: __________ | Revizyon: 00"}', 'official-title', ARRAY['title','workplace','floor','date','revision'], 2, true),
  ('DrawingArea', 'Cizim Alani', 'Konva tabanli mimari plan, rota ve sembol cizim alani.', 'required', '{"x":25,"y":16,"w":57,"h":62}', '{"title":"Ana Cizim Alani","body":""}', 'cad-grid', ARRAY['floorplan','route','you-are-here'], 2, true),
  ('EmergencyCall', 'Acil Numaralar', '112 ve yerel acil durum arama bilgileri.', 'required', '{"x":3,"y":16,"w":19,"h":10}', '{"title":"ACIL YARDIM NUMARASI","body":"112 - ACIL CAGRI MERKEZI\nItfaiye, Ambulans, Polis, Jandarma","meta":"EMERGENCY CALL"}', 'callout-red', ARRAY['112','emergency-call','communication'], 2, true),
  ('EvacuationInstructions', 'Tahliye Talimati', 'Alarm, tahliye, toplanma ve yoklama adimlari.', 'required', '{"x":3,"y":28,"w":19,"h":24}', '{"title":"ACIL DURUM TALIMATI","body":"1. Sakin olun.\n2. En yakin acil cikisa ilerleyin.\n3. Asansorleri kullanmayin.\n4. Toplanma alaninda yoklama bekleyin."}', 'numbered-green', ARRAY['evacuation','no-elevator','assembly'], 2, true),
  ('FireInstructions', 'Yangin Talimati', 'Alarm, 112, sondurucu ve guvenli tahliye adimlari.', 'recommended', '{"x":3,"y":54,"w":19,"h":24}', '{"title":"YANGIN TALIMATI","body":"1. Alarm butonuna basin.\n2. 112 numarasini arayin.\n3. Guvenliyse uygun sondurucu ile mudahale edin.\n4. Kontrol edilemiyorsa tahliye edin."}', 'numbered-red', ARRAY['fire','extinguisher','alarm'], 2, true),
  ('Legend', 'Lejand / Semboller', 'Rota ve ISO 7010 sembollerinin okunabilir dizini.', 'required', '{"x":84,"y":16,"w":13,"h":28}', '{"title":"SEMBOLLER DIZINI","body":"-> Tahliye Yolu\n-- Alternatif Rota\nX Acil Cikis\n* Buradasiniz\nO Toplanma Alani"}', 'symbol-index', ARRAY['legend','symbols','iso-7010'], 2, true),
  ('AssemblyMap', 'Toplanma / Vaziyet', 'Bina disi toplanma noktasi veya vaziyet krokisi.', 'required', '{"x":84,"y":47,"w":13,"h":31}', '{"title":"TOPLANMA ALANI","body":"Toplanma noktasi bina disinda guvenli uzaklikta isaretlenmistir."}', 'assembly-card', ARRAY['assembly-area','site-plan'], 2, true),
  ('ApprovalRevision', 'Onay / Revizyon', 'Hazirlayan, kontrol, onaylayan, tarih ve revizyon kaydi.', 'required', '{"x":3,"y":82,"w":94,"h":15}', '{"title":"REVIZYON VE ONAY","body":"Hazirlayan: __________\nKontrol: ISG Uzmani\nOnaylayan: Isveren / Yetkili\nTarih: ____ / ____ / ______\nRevizyon No: 00"}', 'signature-grid', ARRAY['approval','revision','signature'], 2, true),
  ('EmergencyTeams', 'Acil Durum Ekipleri', 'Sondurme, kurtarma, koruma ve ilk yardim sorumlulari.', 'recommended', '{"x":67,"y":68,"w":30,"h":10}', '{"title":"ACIL DURUM EKIBI","body":"Tahliye: __________ | Sondurme: __________\nKurtarma: __________ | Ilk Yardim: __________"}', 'team-strip', ARRAY['teams','responsible-persons'], 2, true),
  ('HazardUtilities', 'Risk / Utility', 'Gaz, elektrik kesme noktalari ve ozel risk alanlari.', 'recommended', '{"x":67,"y":48,"w":30,"h":18}', '{"title":"RISK VE KESME NOKTALARI","body":"Elektrik ana kesici: __________\nDogalgaz vanasi: __________\nOzel risk alani: __________"}', 'risk-utility', ARRAY['hazards','gas-shutoff','electric-shutoff'], 2, true),
  ('AccessibilityRefuge', 'Erisilebilirlik', 'Engelli, yasli, gebe refakat ve erisilebilir cikis bilgisi.', 'recommended', '{"x":67,"y":36,"w":30,"h":10}', '{"title":"ERISILEBILIR TAHLİYE","body":"Refakat sorumlusu: __________\nErisilebilir cikis/yardim noktasi planda isaretlenmelidir."}', 'accessibility', ARRAY['accessibility','refuge','wheelchair'], 2, true),
  ('FireEquipmentInventory', 'Yangin Ekipmani', 'Sondurucu, dolap, alarm, hidrant ve bakim notlari.', 'recommended', '{"x":67,"y":24,"w":30,"h":10}', '{"title":"YANGIN EKIPMANI","body":"Yangin tupu: ___ adet\nYangin dolabi: ___ adet\nAlarm butonu: ___ adet\nHidrant: ___ adet"}', 'equipment-list', ARRAY['fire-equipment','alarm','hydrant'], 2, true),
  ('QrDocumentInfo', 'QR / Belge Bilgisi', 'Belge no, gecerlilik, QR ve dijital dogrulama alani.', 'optional', '{"x":84,"y":68,"w":13,"h":10}', '{"title":"BELGE BILGISI","body":"Belge No: PLN-____\nGecerlilik: ____ / ____ / ______\nQR dogrulama alani"}', 'qr-document', ARRAY['qr','document-control'], 2, true),
  ('Notes', 'Notlar', 'Ziyaretci, alt isveren veya saha ozel bilgilendirme notlari.', 'optional', '{"x":3,"y":70,"w":19,"h":8}', '{"title":"OZEL NOTLAR","body":"Ziyaretci ve alt isverenler tahliye sorumlusunun yonlendirmesine uymakla yukumludur."}', 'notes', ARRAY['notes','visitors'], 2, true);

DELETE FROM public.template_layouts WHERE is_official = true;

WITH families AS (
  SELECT *
  FROM (VALUES
    ('audit-minimal', 'Denetim Minimal', 'DENETIM', 'Genis cizim alani, net onay ve lejand.', 'auditMinimal', '#059669', false, ARRAY['ISO 23601:2020','ISO 7010:2019','OSHA EAP','TR Acil Durum']),
    ('corporate-iso', 'Kurumsal ISO', 'KURUMSAL', 'Logo ve baslik agirlikli resmi kurum dili.', 'corporateIso', '#0f766e', true, ARRAY['ISO 23601:2020','ISO 7010:2019','Belge Kontrol']),
    ('industrial-plant', 'Endustriyel Tesis', 'ENDUSTRI', 'Risk, utility ve yangin ekipmani guclu tesis sablonu.', 'industrialPlant', '#dc2626', true, ARRAY['Risk','Utility','Yangin Ekipmani']),
    ('public-school', 'Kamu / Okul', 'KAMU', 'Talimat ve toplanma alani okunabilirligi yuksek.', 'publicSchool', '#2563eb', false, ARRAY['Kamu','Okul','Toplanma Alani']),
    ('mall-visitor', 'AVM / Coklu Ziyaretci', 'ZIYARETCI', 'Ziyaretci yonlendirme ve alternatif rota vurgusu.', 'mallVisitor', '#0284c7', true, ARRAY['Ziyaretci','Alternatif Rota']),
    ('health-accessibility', 'Saglik / Erisilebilirlik', 'SAGLIK', 'Refakat, erisilebilir cikis ve yardim noktalari onde.', 'healthAccessibility', '#0891b2', true, ARRAY['Erisilebilirlik','Ilk Yardim']),
    ('construction-site', 'Santiye / Gecici Alan', 'SAHA', 'Vaziyet, dis toplanma, risk ve utility modulleri onde.', 'constructionSite', '#ea580c', true, ARRAY['Santiye','Vaziyet','Risk']),
    ('premium-audit', 'Premium Denetim', 'PREMIUM', 'QR, revizyon, ekip ve checklist yogun denetim sablonu.', 'premiumAudit', '#0f172a', true, ARRAY['Premium','QR','Revizyon','Denetim'])
  ) AS f(slug, name, category, description, style, accent, is_pro, tags)
),
presets AS (
  SELECT *
  FROM (VALUES
    ('Landscape', 'landscape', 1414, 1000),
    ('Portrait', 'portrait', 1000, 1414)
  ) AS p(page_preset, orientation, width, height)
),
module_sets AS (
  SELECT
    f.*,
    p.page_preset,
    p.orientation,
    p.width,
    p.height,
    CASE
      WHEN p.orientation = 'portrait' THEN jsonb_build_array(
        jsonb_build_object('id','header','type','Header','label','Baslik / Kimlik','x',4,'y',2,'w',92,'h',8,'tone','green','zIndex',20,'locked',false,'movable',true,'resizable',true,'rendererVariant','official-title','requirement','required'),
        jsonb_build_object('id','emergency','type','EmergencyCall','label','Acil Numaralar','x',4,'y',12,'w',28,'h',8,'tone','red','zIndex',21,'locked',false,'movable',true,'resizable',true,'rendererVariant','callout-red','requirement','required'),
        jsonb_build_object('id','legend','type','Legend','label','Lejand / Semboller','x',34,'y',12,'w',30,'h',8,'tone','info','zIndex',22,'locked',false,'movable',true,'resizable',true,'rendererVariant','symbol-index','requirement','required'),
        jsonb_build_object('id','assembly','type','AssemblyMap','label','Toplanma / Vaziyet','x',66,'y',12,'w',30,'h',8,'tone','blue','zIndex',23,'locked',false,'movable',true,'resizable',true,'rendererVariant','assembly-card','requirement','required'),
        jsonb_build_object('id','drawing','type','DrawingArea','label','Cizim Alani','x',4,'y',22,'w',92,'h',48,'tone','paper','zIndex',10,'locked',true,'movable',false,'resizable',true,'rendererVariant','cad-grid','requirement','required'),
        jsonb_build_object('id','instructions','type','EvacuationInstructions','label','Tahliye Talimati','x',4,'y',72,'w',44,'h',11,'tone','green','zIndex',24,'locked',false,'movable',true,'resizable',true,'rendererVariant','numbered-green','requirement','required'),
        jsonb_build_object('id','fireInstruction','type','FireInstructions','label','Yangin Talimati','x',50,'y',72,'w',46,'h',11,'tone','red','zIndex',25,'locked',false,'movable',true,'resizable',true,'rendererVariant','numbered-red','requirement','recommended'),
        jsonb_build_object('id','approval','type','ApprovalRevision','label','Onay / Revizyon','x',4,'y',85,'w',92,'h',10,'tone','neutral','zIndex',26,'locked',false,'movable',true,'resizable',true,'rendererVariant','signature-grid','requirement','required')
      )
      ELSE jsonb_build_array(
        jsonb_build_object('id','header','type','Header','label','Baslik / Kimlik','x',3,'y',3,'w',94,'h',10,'tone','green','zIndex',20,'locked',false,'movable',true,'resizable',true,'rendererVariant','official-title','requirement','required'),
        jsonb_build_object('id','emergency','type','EmergencyCall','label','Acil Numaralar','x',3,'y',16,'w',19,'h',10,'tone','red','zIndex',21,'locked',false,'movable',true,'resizable',true,'rendererVariant','callout-red','requirement','required'),
        jsonb_build_object('id','instructions','type','EvacuationInstructions','label','Tahliye Talimati','x',3,'y',28,'w',19,'h',24,'tone','green','zIndex',22,'locked',false,'movable',true,'resizable',true,'rendererVariant','numbered-green','requirement','required'),
        jsonb_build_object('id','fireInstruction','type','FireInstructions','label','Yangin Talimati','x',3,'y',54,'w',19,'h',24,'tone','red','zIndex',23,'locked',false,'movable',true,'resizable',true,'rendererVariant','numbered-red','requirement','recommended'),
        jsonb_build_object('id','drawing','type','DrawingArea','label','Cizim Alani','x',25,'y',16,'w',57,'h',62,'tone','paper','zIndex',10,'locked',true,'movable',false,'resizable',true,'rendererVariant','cad-grid','requirement','required'),
        jsonb_build_object('id','legend','type','Legend','label','Lejand / Semboller','x',84,'y',16,'w',13,'h',28,'tone','info','zIndex',24,'locked',false,'movable',true,'resizable',true,'rendererVariant','symbol-index','requirement','required'),
        jsonb_build_object('id','assembly','type','AssemblyMap','label','Toplanma / Vaziyet','x',84,'y',47,'w',13,'h',31,'tone','blue','zIndex',25,'locked',false,'movable',true,'resizable',true,'rendererVariant','assembly-card','requirement','required'),
        jsonb_build_object('id','approval','type','ApprovalRevision','label','Onay / Revizyon','x',3,'y',82,'w',94,'h',15,'tone','neutral','zIndex',26,'locked',false,'movable',true,'resizable',true,'rendererVariant','signature-grid','requirement','required')
      )
    END AS modules
  FROM families f
  CROSS JOIN presets p
)
INSERT INTO public.template_layouts (
  slug,
  name,
  description,
  category,
  is_pro,
  page_preset,
  orientation,
  layout_json,
  thumbnail_json,
  compliance_tags,
  version,
  is_official
)
SELECT
  lower(slug || '-a3-' || orientation),
  name || ' (' || CASE WHEN orientation = 'landscape' THEN 'Yatay' ELSE 'Dikey' END || ')',
  description,
  category,
  is_pro,
  page_preset,
  orientation,
  jsonb_build_object(
    'id', lower(slug || '-a3-' || orientation),
    'style', style,
    'accent', accent,
    'version', 2,
    'page', jsonb_build_object('preset', page_preset, 'width', width, 'height', height, 'orientation', orientation),
    'modules', modules,
    'regions', jsonb_build_array()
  ),
  jsonb_build_object('accent', accent, 'style', style, 'version', 2),
  tags,
  2,
  true
FROM module_sets
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_pro = EXCLUDED.is_pro,
  page_preset = EXCLUDED.page_preset,
  orientation = EXCLUDED.orientation,
  layout_json = EXCLUDED.layout_json,
  thumbnail_json = EXCLUDED.thumbnail_json,
  compliance_tags = EXCLUDED.compliance_tags,
  version = EXCLUDED.version,
  is_official = EXCLUDED.is_official,
  updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_template_modules_official_type
  ON public.template_modules (is_official, type);
