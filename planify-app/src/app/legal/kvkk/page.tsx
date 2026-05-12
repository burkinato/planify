import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | KolayTahliye',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default function KvkkPage() {
  return (
    <>
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-slate-400">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında</p>
      <p className="text-sm text-slate-400">Son güncelleme: 10 Mayıs 2026</p>

      <h2>1. Veri Sorumlusu</h2>
      <p>KolayTahliye platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.</p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 border-b">Veri Kategorisi</th>
            <th className="text-left py-2 border-b">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="py-2 border-b">Kimlik Bilgileri</td><td className="py-2 border-b">Ad, soyad</td></tr>
          <tr><td className="py-2 border-b">İletişim Bilgileri</td><td className="py-2 border-b">E-posta adresi</td></tr>
          <tr><td className="py-2 border-b">Müşteri İşlem Bilgileri</td><td className="py-2 border-b">Oluşturulan projeler, kullanım geçmişi</td></tr>
          <tr><td className="py-2 border-b">Finansal Bilgiler</td><td className="py-2 border-b">Kredi paketi satın alma kayıtları</td></tr>
          <tr><td className="py-2 border-b">İşlem Güvenliği</td><td className="py-2 border-b">IP adresi, oturum bilgileri</td></tr>
        </tbody>
      </table>

      <h2>3. Kişisel Veri İşleme Amaçları</h2>
      <ul>
        <li>Hizmetlerin sunulması ve sözleşme yükümlülüklerinin yerine getirilmesi</li>
        <li>Kullanıcı hesaplarının oluşturulması ve yönetilmesi</li>
        <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
        <li>Teknik destek sağlanması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Hizmet kalitesinin iyileştirilmesi</li>
      </ul>

      <h2>4. Hukuki Sebepler</h2>
      <p>Kişisel verileriniz KVKK madde 5/2 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
      <ul>
        <li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
        <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
        <li>Meşru menfaat</li>
      </ul>

      <h2>5. Veri Aktarımı</h2>
      <p>Kişisel verileriniz yurt içi ve yurt dışındaki altyapı sağlayıcılarına (Supabase/AWS) KVKK&apos;nın 8. ve 9. maddelerine uygun olarak aktarılabilir.</p>

      <h2>6. İlgili Kişi Hakları</h2>
      <p>KVKK madde 11 uyarınca aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
        <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
      </ul>

      <h2>7. Başvuru</h2>
      <p>Haklarınızı kullanmak için <a href="mailto:kvkk@KolayTahliye.com.tr">kvkk@KolayTahliye.com.tr</a> adresine yazılı olarak başvurabilirsiniz.</p>
    </>
  );
}
