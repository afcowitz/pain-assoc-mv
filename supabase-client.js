// supabase-client.js
// Connects to the SAME Supabase project as SAARC-AA. Every table/bucket
// name here is prefixed pain_assoc_ / pain-assoc- so nothing collides with
// SAARC-AA's own site_settings, admin_roles, or post-images bucket.
//
// Requires the Supabase JS library loaded first, e.g. in index.html:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
// Note the client variable is named supabaseClient, not supabase — the CDN
// script registers a global called `supabase`, and reusing that name
// crashes with "Identifier already declared" (same gotcha hit on SAARC-AA).

const SUPABASE_URL = 'https://beijsnnzxldhygvomyhl.supabase.co';   // same URL as SAARC-AA
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlaWpzbm56eGxkaHlndm9teWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTgzNzgsImV4cCI6MjEwMzM3NDM3OH0.cMaVMAlCsWs56QpzHo8UJjOeaahzSCiPRbRnxoLr6Hc';;      // same key as SAARC-AA

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------------------------------------------------------
   Posts
--------------------------------------------------------------- */

async function dbFetchPosts() {
  const { data, error } = await supabaseClient
    .from('pain_assoc_posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('dbFetchPosts failed:', error); return []; }
  return data.map(dbRowToPost);
}

async function dbCreatePost(post) {
  const { data, error } = await supabaseClient
    .from('pain_assoc_posts')
    .insert(postToDbRow(post))
    .select()
    .single();
  if (error) { console.error('dbCreatePost failed:', error); throw error; }
  return dbRowToPost(data);
}

async function dbUpdatePost(id, post) {
  const { data, error } = await supabaseClient
    .from('pain_assoc_posts')
    .update(postToDbRow(post))
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('dbUpdatePost failed:', error); throw error; }
  return dbRowToPost(data);
}

async function dbDeletePost(id) {
  const { error } = await supabaseClient.from('pain_assoc_posts').delete().eq('id', id);
  if (error) { console.error('dbDeletePost failed:', error); throw error; }
}

// Database row -> the post shape the rest of the app already renders.
function dbRowToPost(row) {
  return {
    id: row.id,
    category: row.category,
    topic: row.topic,
    title: { en: row.title_en, dv: row.title_dv || '' },
    excerpt: { en: row.excerpt_en || '', dv: row.excerpt_dv || '' },
    thumbnail: row.thumbnail || '',
    date: row.created_at ? row.created_at.slice(0, 10) : '',
    author: row.author_email,
    reviewedDate: row.reviewed_date,
    gallery: { position: row.gallery_position, images: row.gallery_images || [] },
    blocks: row.blocks || []
  };
}

// The app's post shape -> database columns, for insert/update.
function postToDbRow(post) {
  return {
    category: post.category,
    topic: post.topic,
    title_en: post.title.en,
    title_dv: post.title.dv || null,
    excerpt_en: post.excerpt.en || null,
    excerpt_dv: post.excerpt.dv || null,
    thumbnail: post.thumbnail || null,
    blocks: post.blocks,
    gallery_position: post.gallery.position,
    gallery_images: post.gallery.images,
    reviewed_date: post.reviewedDate || null,
    author_email: post.author
  };
}

/* ---------------------------------------------------------------
   Site-wide content (hero, contact) — key/value JSONB rows
--------------------------------------------------------------- */

async function dbFetchSiteSettings() {
  const { data, error } = await supabaseClient.from('pain_assoc_site_settings').select('key, value');
  if (error || !data) { console.error('dbFetchSiteSettings failed:', error); return {}; }
  const map = {};
  data.forEach(row => { map[row.key] = row.value; });
  return map;
}

async function dbUpdateSiteSetting(key, value) {
  const { error } = await supabaseClient
    .from('pain_assoc_site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) { console.error('dbUpdateSiteSetting failed:', error); throw error; }
}

/* ---------------------------------------------------------------
   Auth
   Admin login now takes a real email + password (Supabase Auth),
   rather than the placeholder Admin1/Admin2 username check.
--------------------------------------------------------------- */

async function dbLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, email: data.user.email };
}

async function dbLogout() {
  await supabaseClient.auth.signOut();
}

// Restores a session on page load (e.g. after a refresh) so an admin
// doesn't have to sign in again every time.
async function dbCurrentAdminEmail() {
  const { data } = await supabaseClient.auth.getUser();
  return data && data.user ? data.user.email : null;
}

// Looks up the friendly name (e.g. "Admin1") for the admin bar. Falls back
// to showing the raw email if the lookup fails for any reason.
async function dbGetAdminDisplayName(email) {
  const { data, error } = await supabaseClient
    .from('pain_assoc_admin_roles')
    .select('display_name')
    .eq('email', email)
    .single();
  if (error || !data) return null;
  return data.display_name;
}

// Fetches every admin's email -> display name, for showing bylines on
// posts (e.g. "by Admin1") without a lookup per post.
async function dbFetchAdminDisplayNames() {
  const { data, error } = await supabaseClient
    .from('pain_assoc_admin_roles')
    .select('email, display_name');
  if (error || !data) return {};
  const map = {};
  data.forEach(row => { map[row.email] = row.display_name; });
  return map;
}

/* ---------------------------------------------------------------
   Images — client-side compression before upload, same pattern as
   SAARC-AA's post-images bucket.
--------------------------------------------------------------- */

async function dbUploadImage(file) {
  const compressed = await compressImageFile(file);
  const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { error } = await supabaseClient.storage
    .from('pain-assoc-images')
    .upload(path, compressed, { contentType: file.type });
  if (error) { console.error('dbUploadImage failed:', error); throw error; }
  const { data } = supabaseClient.storage.from('pain-assoc-images').getPublicUrl(path);
  return data.publicUrl;
}

function compressImageFile(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => { img.src = e.target.result; };
    img.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    reader.readAsDataURL(file);
  });
}
