// data.js
// Mock content layer for the frontend design phase.
// Structured so this maps cleanly onto a future Supabase `site_settings` /
// `posts` table: each post is one JSONB record, each block is an array item.

const SITE = {
  name: { en: 'Pain Association of Maldives', dv: 'ޕެއިން އެސޯސިއޭޝަން އޮފް މޯލްޑިވްސް' },
  tagline: { en: 'Understanding pain. Supporting treatment. Building community.', dv: 'ތަދަކީ ކޮބައިކަން ދެނެގަތުން. ފަރުވާ ފޯރުކޮށްދިނުން. މުޖުތަމައެއް ބިނާކުރުން.' },
  contact: {
    email: 'info@painassociation.mv',
    phone: '+960 000 0000',
    address: { en: 'Malé, Republic of Maldives', dv: 'މާލެ، ދިވެހިރާއްޖެ' }
  }
};

const NAV = [
  { key: 'home', en: 'Home', dv: 'ފުރަތަމަ ސަފުހާ' },
  { key: 'medical', en: 'Pain & Treatment', dv: 'ތަދާއި ފަރުވާ' },
  { key: 'events', en: 'News', dv: 'ޚަބަރު' },
  { key: 'contact', en: 'Contact', dv: 'ގުޅުއްވުމަށް' }
];

const CATEGORIES = {
  medical: { en: 'Pain & Treatment', dv: 'ތަދާއި ފަރުވާ' },
  events: { en: 'News', dv: 'ޚަބަރު' }
};

const MEDICAL_TOPICS = [
  { key: 'chronic-pain', en: 'Chronic Pain', dv: 'ދިގުމުއްދަތުގެ ތަދު' },
  { key: 'back-pain', en: 'Back Pain', dv: 'ބުރަކަށީގެ ތަދު' },
  { key: 'arthritis', en: 'Arthritis', dv: 'ރާއްޖެ ބަލި' },
  { key: 'nerve-pain', en: 'Nerve Pain', dv: 'ނާރުތަކުގެ ތަދު' },
  { key: 'treatment-options', en: 'Treatment Options', dv: 'ފަރުވާތައް' }
];

// Admin accounts and posts now live in Supabase (see supabase-client.js and
// supabase/schema.sql) instead of being mocked here. POSTS is still declared
// as a plain array — index.html populates it from the database on load and
// keeps using it exactly the same way in all the render functions below.
let POSTS = [];
