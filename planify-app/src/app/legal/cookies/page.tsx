import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası | KolayTahliye',
  description: 'KolayTahliye çerez politikası — çerez kullanımı ve tercihleriniz hakkında bilgilendirme.',
};

export default function CookiesPage() {
  return (
    <>
      <h1>Çerez Politikası</h1>
      <p className="text-sm text-slate-400">Son güncelleme: 10 Mayıs 2026</p>

      <h2>1. Çerez Nedir?</h2>
      <p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza yerleştirilen küçük metin dosyalarıdır. Sitemizin düzgün çalışması, güvenliğin sağlanması ve kullanıcı deneyiminin iyileştirilmesi amacıyla kullanılır.</p>

      <h2>2. Kullanılan Çerez Türleri</h2>

      <h3>Zorunlu Çerezler</h3>
      <p>Bu çerezler platformun temel işlevlerinin çalışması için gereklidir ve devre dışı bırakılamaz.</p>
      <ul>
        <li><strong>Oturum çerezi:</strong> Giriş yapan kullanıcıların kimlik doğrulaması</li>
        <li><strong>Güvenlik çerezi:</strong> CSRF koruması ve güvenlik doğrulamaları</li>
      </ul>

      <h3>İşlevsel Çerezler</h3>
      <p>Tercihlerinizi hatırlamak için kullanılır:</p>
      <ul>
        <li><strong>Tema tercihi:</strong> Açık/koyu tema seçiminiz</li>
        <li><strong>Editör ayarları:</strong> Grid görünürlüğü, birim tercihi</li>
      </ul>

      <h3>Analitik Çerezler</h3>
      <p>Sitemizin nasıl kullanıldığını anlamamıza yardımcı olan anonim istatistik çerezleri. Bu çerezler kişisel bilgi toplamaz.</p>

      <h2>3. Üçüncü Taraf Çerezleri</h2>
      <p>Platformumuz aşağıdaki üçüncü taraf hizmetlerinden çerezler kullanabilir:</p>
      <ul>
        <li><strong>Supabase:</strong> Kimlik doğrulama ve oturum yönetimi</li>
        <li><strong>PayTR:</strong> Ödeme işlemleri sırasında güvenlik çerezleri</li>
      </ul>

      <h2>4. Çerez Yönetimi</h2>
      <p>Tarayıcı ayarlarınızdan çerezleri yönetebilir veya silebilirsiniz. Ancak zorunlu çerezlerin devre dışı bırakılması platformun düzgün çalışmasını engelleyebilir.</p>

      <h2>5. İletişim</h2>
      <p>Çerez politikası hakkında sorularınız için: <a href="mailto:destek@KolayTahliye.com.tr">destek@KolayTahliye.com.tr</a></p>
    </>
  );
}
