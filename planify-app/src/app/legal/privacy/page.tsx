import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Planify',
  description: 'Planify gizlilik politikası — kişisel verilerin korunması ve kullanımı hakkında bilgilendirme.',
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Gizlilik Politikası</h1>
      <p className="text-sm text-slate-400">Son güncelleme: 10 Mayıs 2026</p>

      <h2>1. Toplanan Veriler</h2>
      <p>Planify aşağıdaki kişisel verileri toplar:</p>
      <ul>
        <li><strong>Hesap Bilgileri:</strong> Ad, soyad, e-posta adresi, şifre (hash&apos;lenmiş)</li>
        <li><strong>Profil Bilgileri:</strong> Unvan, kurum adı (opsiyonel)</li>
        <li><strong>Kullanım Verileri:</strong> Oluşturulan projeler, kullanılan özellikler, oturum süreleri</li>
        <li><strong>Ödeme Bilgileri:</strong> Ödeme işlemleri PayTR aracılığıyla güvenli şekilde gerçekleştirilir. Kredi kartı bilgileri Planify tarafından saklanmaz.</li>
      </ul>

      <h2>2. Veri Kullanım Amaçları</h2>
      <ul>
        <li>Hizmet sunumu ve hesap yönetimi</li>
        <li>Kullanıcı deneyiminin iyileştirilmesi</li>
        <li>Teknik destek sağlanması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>3. Veri Güvenliği</h2>
      <p>Verileriniz Supabase altyapısı üzerinde şifrelenmiş olarak saklanır. SSL/TLS şifreli bağlantılar kullanılır. Şifreler bcrypt algoritması ile hash&apos;lenir ve hiçbir zaman düz metin olarak saklanmaz.</p>

      <h2>4. Veri Paylaşımı</h2>
      <p>Kişisel verileriniz üçüncü taraflarla paylaşılmaz. Yalnızca yasal zorunluluklar dahilinde ve yetkili makamların talebi üzerine paylaşım yapılabilir.</p>

      <h2>5. Veri Saklama Süresi</h2>
      <p>Hesap bilgileriniz hesabınız aktif olduğu sürece saklanır. Hesap silme talebinde tüm kişisel verileriniz 30 gün içinde silinir.</p>

      <h2>6. Kullanıcı Hakları</h2>
      <p>Kullanıcılar aşağıdaki haklara sahiptir:</p>
      <ul>
        <li>Verilerinize erişim talep etme</li>
        <li>Verilerin düzeltilmesini isteme</li>
        <li>Verilerin silinmesini isteme</li>
        <li>Veri taşınabilirliği talep etme</li>
      </ul>

      <h2>7. İletişim</h2>
      <p>Gizlilik politikası hakkında sorularınız için: <a href="mailto:destek@planify.com.tr">destek@planify.com.tr</a></p>
    </>
  );
}
