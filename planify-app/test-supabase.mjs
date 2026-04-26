import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rjutnbgeqesyzokqrdmx.supabase.co'
const supabaseKey = 'sb_publishable_QFWfA-2FfUpoWbBsR0mdiQ_LVG5DHRq'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('Testing Supabase connection with provided keys...')
  
  // Create a random test email
  const testEmail = `test_${Math.random().toString(36).substring(7)}@planify.app`
  const testPassword = 'TestPassword123!'
  
  console.log(`Attempting to register user: ${testEmail}`)
  
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        full_name: 'Terminal Test User'
      }
    }
  })

  if (error) {
    console.error('❌ Connection Failed or Error occurred:', error.message)
    return
  }

  console.log('✅ Connection Successful! Data sent.')
  console.log('User created:', data.user?.id)
  
  // Wait a bit to let the profile trigger run
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if profile was created
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user?.id)
    .single()
    
  console.log('Profile created by trigger:', profileData)
}

testSupabase()
