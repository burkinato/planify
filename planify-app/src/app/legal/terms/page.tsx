import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Planify',
  description: 'Planify platformunun kullanım koşulları ve hizmet sözleşmesi.',
};

export default function TermsPage() {
  return (
    <>
      <h1>Kullanım Koşulları</h1>
      <p className="text-sm text-slate-400">Son güncelleme: 10 Mayıs 2026</p>

      <h2>1. Hizmet Tanımı</h2>
      <p>Planify, İş Sağlığı ve Güvenliği (İSG) uzmanları, mimarlar ve mühendisler için geliştirilmiş web tabanlı bir acil durum tahliye planı tasarım yazılımıdır. Platform, ISO 23601 ve ISO 7010 standartlarına referans alarak oluşturulmuş araçlar sunar.</p>

      <h2>2. Kabul ve Kayıt</h2>
      <p>Planify&apos;a kayıt olarak bu koşulları kabul etmiş sayılırsınız. Platformu kullanmak için 18 yaşından büyük olmanız gerekmektedir.</p>

      <h2>3. Kullanım Kuralları</h2>
      <ul>
        <li>Platform yalnızca yasal amaçlarla kullanılabilir.</li>
        <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.</li>
        <li>Platformda oluşturulan planlar, yetkili İSG uzmanı tarafından denetlenmeli ve onaylanmalıdır.</li>
        <li>Yazılım mesleki danışmanlık hizmeti yerine geçmez.</li>
      </ul>

      <h2>4. Kredi Sistemi ve Ödeme</h2>
      <p>Planify, kredi bazlı bir ödeme sistemi kullanır. Satın alınan krediler iade edilemez, ancak kullanılmamış kredi bakiyesi hesapta kalır. Fiyatlar önceden haber verilmeksizin değiştirilebilir.</p>

      <h2>5. Fikri Mülkiyet</h2>
      <p>Planify yazılımı, arayüzü, sembol kütüphanesi ve şablonları Planify&apos;ın fikri mülkiyetidir. Kullanıcılar tarafından oluşturulan planların hakları kullanıcıya aittir.</p>

      <h2>6. Sorumluluk Sınırı</h2>
      <p>Planify, oluşturulan tahliye planlarının mevzuata uygunluğunu garanti etmez. Planların resmi denetimlerde kullanılabilmesi için yetkili İSG uzmanı onayı gereklidir. Uyumluluk aracı yalnızca bilgilendirme amaçlıdır.</p>

      <h2>7. Hizmet Değişiklikleri</h2>
      <p>Planify, hizmette değişiklik yapma, özellik ekleme veya kaldırma hakkını saklı tutar. Önemli değişiklikler e-posta ile bildirilir.</p>

      <h2>8. Hesap Fesih</h2>
      <p>Kullanıcılar hesaplarını istedikleri zaman kapatabilir. Planify, koşullara aykırı davranan hesapları askıya alma veya kapatma hakkını saklı tutar.</p>

      <h2>9. Uygulanacak Hukuk</h2>
      <p>Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul mahkemeleri ve icra daireleri yetkilidir.</p>

      <h2>10. İletişim</h2>
      <p>Sorularınız için: <a href="mailto:destek@planify.com.tr">destek@planify.com.tr</a></p>
    </>
  );
}
