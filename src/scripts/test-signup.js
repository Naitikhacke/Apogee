const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ntmpfwhwnmysyxpnnkgm.supabase.co';
const supabaseAnonKey = 'sb_publishable_Rv0OJxzsx-Kr5TaF1gDLsg_wHxbjb7E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log('Attempting to insert test user...');
  const { data, error } = await supabase
    .from('custom_users')
    .insert([
      { email: 'test@example.com', password: 'password123', full_name: 'Test User', phone: '1234567890' }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting user:', error);
  } else {
    console.log('User inserted successfully:', data);
  }
}

testSignup();
