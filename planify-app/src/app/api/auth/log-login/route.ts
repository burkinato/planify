import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export async function POST() {
  const supabase = await createClient();
  const headersList = await headers();
  
  // 1. Kullanıcı oturumunu doğrula
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  // 2. IP ve User-Agent bilgilerini al
  // Cloudflare veya Vercel arkasında x-forwarded-for kullanılır
  const forwardedFor = headersList.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  const userAgent = headersList.get('user-agent') || 'Unknown';

  try {
    // 3. Login logunu kaydet
    const { error: logError } = await supabase
      .from('login_logs')
      .insert({
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
        is_suspicious: false // İleride coğrafi IP kontrolü ile geliştirilebilir
      });

    if (logError) {
      console.warn('Login log is not saved (migration might be missing or RLS error):', logError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login logging failed:', err);
    // Veritabanı tabloları eksik olsa bile 500 dönüp uygulamayı kırma
    return NextResponse.json({ success: true, warning: 'Log kaydı başarısız' });
  }
}
