import { supabase } from './supabaseClient.js';

async function main() {
  // Insert a test row
  const { data, error } = await supabase
    .from('users')
    .insert([{ name: 'Nafis', email: 'nafis@example.com' }])
    .select(); // This makes Supabase return the inserted row

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Inserted:', data);
  }
}

main();
