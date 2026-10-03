// One-time script to create staff auth accounts.
// Run: node --env-file=.env create-staff.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY. Run with: node --env-file=.env create-staff.js');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const STAFF = [
  { email: 'nova@cod.com',       password: 'Nova@01',  full_name: 'Nova',        role: 'leader' },
  { email: 'marina@cod.com',     password: 'Mari@02',  full_name: 'Marina',      role: 'leader' },
  { email: 'fared_nemr@cod.com', password: 'Fare@03',  full_name: 'Fared Nemr',  role: 'leader' },
  { email: 'joseph@cod.com',     password: 'Jose@04',  full_name: 'Joseph',      role: 'leader' },
];

for (const user of STAFF) {
  const { data: auth, error: authErr } = await admin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (authErr) {
    console.error(`✗ ${user.email} — auth: ${authErr.message}`);
    continue;
  }

  const { error: dbErr } = await admin.from('users').insert({
    id: auth.user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  });

  if (dbErr) {
    console.error(`✗ ${user.email} — db: ${dbErr.message}`);
    await admin.auth.admin.deleteUser(auth.user.id); // roll back
    continue;
  }

  console.log(`✓ ${user.email}  password: ${user.password}  role: ${user.role}`);
}
