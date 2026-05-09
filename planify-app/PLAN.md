# PLAN.md - Planify Profesyonel Sablon ve Modul Rework

## Ozet

Planify editoru, mevcut sabit region sablonu yaklasimindan profesyonel, denetim odakli ve sag panelden surukle-birak kagit modulleriyle calisan bir sablon motoruna tasinir. Sol CAD araclari korunur; sag panel ise baslik, cizim alani, lejand, talimat, onay, QR, ekip, tehlike/utility ve vaziyet modullerini kagida yerlestirmek icin kullanilir.

Karar kilitleri:

- Kapsam: `Editor + Sablon`
- DB stratejisi: kullanici/proje verilerini koru, resmi sablon/modul kataloglarini resetle
- UX onceligi: sagdan surukle-birak sadece kagit modulleri icin; CAD nesneleri mevcut cizim araclariyla kalir

## Temel Degisiklikler

- `template_layouts` resmi seedleri sifirlanir ve tek kaynakli, versiyonlu bir sablon katalogu kurulur.
- Yeni `template_modules` mantigi eklenir: her modul tip, varsayilan icerik, onerilen boyut, denetim amaci, zorunluluk seviyesi ve renderer varyanti tasir.
- `layout_json` v2 formatina gecilir: kagit olcusu, modul instancelari, cizim alani, z-index, kilit/resize/move ayarlari netlesir.
- Mevcut projeler silinmez; eski `regions` yapisi v2 module instance yapisina migrate edilir.
- `EditorCanvas` parcalanir: kagit renderer, Konva cizim alani, modul katmani, sag modul paleti, modul inspector ve export renderer ayrilir.
- `TemplatePaperRenderer`, `ElementDispatcher`, `WallRenderer` gibi kullanilmayan parcalar aktif mimariye alinir veya tekillestirilir.

## Profesyonel Modul Sistemi

Sag panelde `Denetim Modulleri` bulunur. Kullanici karti tutup kagida birakir, sonra tasir veya resize eder. Cizim alani ozel moduldur: tek instance olur ve CAD icerigi varsa silinemez.

Hazir modul seti:

- `Header`: logo, isyeri/proje adi, kat, revizyon, tarih
- `DrawingArea`: Konva cizim alani, grid, export uyumu
- `EmergencyCall`: 112 ve yerel acil numaralar
- `EvacuationInstructions`: tahliye talimati
- `FireInstructions`: yangin talimati
- `Legend`: kullanilan rota/sembollerden otomatik lejand
- `AssemblyMap`: toplanma alani/vaziyet gorseli
- `ApprovalRevision`: hazirlayan, kontrol, onaylayan, tarih, revizyon
- `EmergencyTeams`: sondurme, kurtarma, koruma, ilk yardim ekipleri
- `HazardUtilities`: riskli alanlar, gaz/elektrik kesme noktalari, kimyasal/parlama ozel riskleri
- `AccessibilityRefuge`: engelli/yasli/gebe refakat ve erisilebilir cikis bilgisi
- `FireEquipmentInventory`: yangin sondurucu, dolap, alarm, hidrant listesi
- `QrDocumentInfo`: QR, belge no, gecerlilik ve dijital imza alani
- `Notes`: ozel notlar, ziyaretci/alt isveren bilgilendirme

Hazir sablon koleksiyonu:

- `Denetim Minimal`: genis cizim alani, net onay ve lejand
- `Kurumsal ISO`: logo/baslik agirlikli, resmi kurum dili
- `Endustriyel Tesis`: tehlike/utility/fire equipment modulleri guclu
- `Kamu / Okul`: talimat ve toplanma alani okunabilirligi yuksek
- `AVM / Coklu Ziyaretci`: ziyaretci yonlendirme, primary/secondary route vurgusu
- `Saglik / Erisilebilirlik`: refakat, erisilebilir cikis ve yardim noktalari one cikar
- `Santiye / Gecici Alan`: vaziyet, dis toplanma, risk ve utility modulleri onde
- `Premium Denetim`: QR, onay, revizyon, ekip ve checklist yogun

## Denetim Mantigi

Uyumluluk kontrolu modul ve CAD iceriklerinden birlikte beslenir. Minimum denetim checklisti:

- Baslik, isyeri adi, kat/bolum, tarih, revizyon, hazirlayan/onay bilgisi
- En az bir cizim alani
- En az bir tahliye rotasi
- Primary/secondary cikis veya alternatif rota gostergesi
- Buradasiniz isareti
- Toplanma alani
- Acil cikis sembolleri
- Yangin ekipmani sembolu
- Ilk yardim noktasi
- Alarm/uyari sistemi bilgisi
- Tehlikeli alanlardan uzak rota mantigi
- Asansor kullanilmamasi uyarisi
- Erisilebilir cikis/refakat bilgisi
- Acil ekip ve iletisim bilgileri
- Elektrik/gaz kesme noktalari, ozel risk alanlari

Kaynak dayanaklari:

- [ISO 23601:2020](https://www.iso.org/standard/80678.html): escape/evacuation plan design principles
- [ISO 7010:2019](https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/24/72424.html?browse=tc): guvenlik isaretleri, renk/sekil standardi
- [OSHA Floorplan Demo](https://osha.prod.pace.dol.gov/etools/evacuation-plans-procedures/eap/elements/floorplan-demo): primary/secondary exit, assembly area, current location, wheelchair access, no elevators
- [OSHA EAP Minimum Requirements](https://www.osha.gov/etools/evacuation-plans-procedures/eap/minimum-requirements): tahliye, gorevli ekipler, sayim ve iletisim basliklari
- [TR Acil Durum Yonetmeligi ornek metni](https://taskopru.meb.gov.tr/meb_iys_dosyalar/2023_01/09161423_Acil_Durumlar_Yonetmelik.pdf): kroki, ekipman, ilk yardim, kacis yollari, toplanma yerleri, ekip ve acil numara alanlari

## Uygulama ve Test Plani

- Once repo kokune bu icerik `PLAN.md` olarak eklenir.
- Ardindan sablon/modul veri modeli olusturulur, resmi seedler resetlenir, eski projeler v2 yapiya donusturulur.
- Editor UI'da sag modul paneli, modul drag/drop, resize/move, module inspector ve drawing-area odak davranisi eklenir.
- Export hatti v2 kagit rendererdan uretir; PNG/PDF'de modul sinirlari, edit handlelari ve grid overlay cikmaz.
- Dashboard template gallery yeni koleksiyonlari kart/preview olarak gosterir.

Testler:

- `npm run lint`
- `npm run build`
- Eski proje acma: canvas, template state ve export bozulmamali
- Yeni proje: sablon sec, modul surukle, cizim alanina gir, duvar/rota/sembol ciz, autosave, refresh, export
- Sablon modulu: ekle, tasi, resize, sil, geri al/ileri al
- Compliance: eksikler dogru uyari versin, tamamlaninca skor yukselsin
- Mobile/tablet: sag panel drawer olarak calissin, kagit tasmasin
- PDF/PNG: A3 yatay/dikey oranlari ve metin okunabilirligi dogrulansin

## Varsayimlar

- Kullanici, proje ve auth verileri korunacak; sadece resmi template/module kataloglari resetlenecek.
- Sagdan surukle-birak v1'de kagit modulleri icin yapilacak; CAD nesneleri icin mevcut sol arac akisi korunacak.
- Hukuki/denetim metinleri yardimci uyumluluk olarak sunulacak; uygulama resmi mevzuat danismanligi iddiasi tasimayacak.
- Sablonlarin gorsel dili temiz, resmi, yuksek okunurluklu ve baski dostu olacak; suslu dashboard estetigi yerine denetmen guveni onceliklenecek.
