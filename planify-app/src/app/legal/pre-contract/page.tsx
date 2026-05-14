import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Ön Bilgilendirme Formu',
  description: 'KolayTahliye SaaS abonelik ve kredi paketleri için mesafeli satış ön bilgilendirme formu, cayma hakkı ve dijital ürün istisnaları.',
};

export default function PreContractPage() {
  return (
    <>
      <h1>Mesafeli Satış Ön Bilgilendirme Formu</h1>

      <p>
        Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca,
        KolayTahliye platformu üzerinden satın alacağınız <strong>dijital içerik ve hizmetler</strong> hakkında sizi
        bilgilendirmek amacıyla hazırlanmıştır.
      </p>

      <h2>1. Satıcı Bilgileri</h2>
      <ul>
        <li><strong>Ticari Unvan:</strong> KolayTahliye Yazılım ve Bilişim Hizmetleri</li>
        <li><strong>Adres:</strong> İstanbul, Türkiye (kayıtlı şirket adresi)</li>
        <li><strong>Vergi Dairesi / VKN:</strong> [Belirtilecek]</li>
        <li><strong>E-posta:</strong> destek@kolaytahliye.com.tr</li>
        <li><strong>MERSİS:</strong> [Belirtilecek]</li>
      </ul>

      <h2>2. Hizmetin Niteliği ve Temel Özellikleri</h2>
      <p>
        KolayTahliye, ISO 7010 ve ISO 23601 standartlarına uygun acil durum tahliye planı tasarım ve çıktı hizmeti sunan
        bulut tabanlı bir SaaS (Software as a Service) ürünüdür. Satın alınan hizmet aboneliği veya kredi paketi şu
        içerikleri sağlar:
      </p>
      <ul>
        <li>Web tarayıcısı üzerinden erişilebilen tahliye planı editörüne erişim</li>
        <li>PDF / PNG formatlarında profesyonel çıktı üretimi</li>
        <li>Premium şablon ve sembol kütüphanelerine erişim</li>
        <li>e-Arşiv fatura ile dijital fatura teslimi</li>
      </ul>

      <h2>3. Fiyatlandırma ve KDV</h2>
      <p>
        Tüm fiyatlar Türk Lirası cinsinden ve <strong>KDV (%20) dahil</strong> olarak gösterilir. Satın alma anında
        gösterilen toplam tutar, ödemenin son tutarıdır; ek vergi veya gizli ücret bulunmamaktadır. Kurumsal müşterilerimize
        VKN bilgisiyle KDV ayrıştırılmış e-Arşiv faturası iletilir.
      </p>

      <h2>4. Ödeme Yöntemi</h2>
      <p>
        Ödemeler, PayTR Sanal POS altyapısı üzerinden 3D Secure ile yapılır. Kredi kartı bilgileriniz KolayTahliye
        sunucularında saklanmaz; bankanız tarafından doğrulanır. <strong>9 taksite kadar bölme imkanı</strong> ödeme
        ekranında sunulur.
      </p>

      <h2>5. Cayma Hakkı (Dijital İçerik İstisnası)</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendine göre, <strong>tüketicinin onayı ile ifasına
        başlanan ve dijital içerik teslimine ilişkin sözleşmelerde</strong> cayma hakkı kullanılamaz. KolayTahliye
        aboneliği veya kredi paketi satın aldığınızda, hizmet anında aktive edilir; bu nedenle:
      </p>
      <ul>
        <li>Abonelik satın alındığında ve panele giriş yapıldığında cayma hakkı kullanılamaz.</li>
        <li>Kullanılmamış kredi paketleri için satın alma tarihinden itibaren <strong>14 gün içinde</strong> iade talep
        edilebilir; iade işlenmesi 7 iş günü içinde gerçekleştirilir.</li>
        <li>Aboneliğinizi istediğiniz zaman iptal edebilirsiniz; ödediğiniz dönem sonuna kadar Pro özellikler aktif kalır.</li>
      </ul>

      <h2>6. Şikayet ve Uyuşmazlık Çözümü</h2>
      <p>
        Hizmetle ilgili her türlü şikayetinizi <a href="mailto:destek@kolaytahliye.com.tr">destek@kolaytahliye.com.tr</a>
        adresine iletebilirsiniz. Uyuşmazlıklarda 6502 sayılı Kanun hükümlerine göre Tüketici Hakem Heyetleri ve
        Tüketici Mahkemeleri yetkilidir. Parasal sınırlar Ticaret Bakanlığı'nca her yıl güncellenir.
      </p>

      <h2>7. Kişisel Verilerin Korunması</h2>
      <p>
        Satın alma sürecinde toplanan kişisel veriler 6698 sayılı KVKK çerçevesinde işlenir. Detaylar için
        <a href="/legal/kvkk"> KVKK Aydınlatma Metni</a> sayfasını inceleyiniz.
      </p>

      <h2>8. Ön Bilgilendirme Formunun Onayı</h2>
      <p>
        Bu formu kayıt veya satın alma akışında onayladığınızda, yukarıdaki hükümleri okuyup anladığınızı ve kabul
        ettiğinizi beyan etmiş olursunuz. Formun bir kopyası tarafınıza e-posta ile iletilir.
      </p>

      <p>
        <small>Yürürlük tarihi: 14.05.2026 · Versiyon: 1.0</small>
      </p>
    </>
  );
}
