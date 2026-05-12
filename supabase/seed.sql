-- Default placeholder content. Owner replaces from the admin panel.

insert into public.clinic (
  id, parking_info, insurance_info, what_to_bring, walk_in_policy, languages_supported, stats
) values (
  1,
  'Free on-site parking with accessible spots near the entrance. Street parking is also available on Wellness Avenue.',
  'We accept most major provincial health plans and direct-bill several private insurers. Bring your health card and any insurance details to your visit.',
  'Health card · Government photo ID · Current medication list · Any recent lab results or imaging · Referral letter (if applicable)',
  'Walk-ins are welcome during clinic hours. We do our best to see you the same day. For shorter waits, call ahead and we will hold a slot when possible.',
  array['English','French'],
  '[
    {"value":"15","suffix":"+","label":"Years serving the community"},
    {"value":"5,000","suffix":"+","label":"Patients cared for"},
    {"value":"3","suffix":"","label":"Board-certified specialists"},
    {"value":"4.9","suffix":"★","label":"Average patient rating"}
  ]'::jsonb
)
on conflict (id) do update set
  parking_info       = coalesce(excluded.parking_info, public.clinic.parking_info),
  insurance_info     = coalesce(excluded.insurance_info, public.clinic.insurance_info),
  what_to_bring      = coalesce(excluded.what_to_bring, public.clinic.what_to_bring),
  walk_in_policy     = coalesce(excluded.walk_in_policy, public.clinic.walk_in_policy),
  languages_supported = excluded.languages_supported,
  stats              = case when public.clinic.stats = '[]'::jsonb then excluded.stats else public.clinic.stats end;

insert into public.hours (day_index, day_name, open_time, close_time, closed) values
  (0,'Monday',    '8:00 AM','6:00 PM', false),
  (1,'Tuesday',   '8:00 AM','7:00 PM', false),
  (2,'Wednesday', '8:00 AM','6:00 PM', false),
  (3,'Thursday',  '8:00 AM','7:00 PM', false),
  (4,'Friday',    '8:00 AM','5:00 PM', false),
  (5,'Saturday',  '9:00 AM','2:00 PM', false),
  (6,'Sunday',     null,     null,     true)
on conflict (day_index) do nothing;

insert into public.announcement (id, message, active, urgent) values
  (1, 'Walk-ins welcome — we''ll do our best to see you the same day.', true, false)
on conflict (id) do nothing;

insert into public.popup_alert (id, active, urgent, title, body) values
  (1, false, false, 'Important notice', 'Sample popup body. Edit me from the admin panel.')
on conflict (id) do nothing;

insert into public.doctors (
  name, initials, specialty, bio, status, schedule, sort,
  slug, languages, education, conditions, years_experience
) values
  ('Dr. Alexandra Chen','AC','Family Medicine',
   'A compassionate family physician with 18 years serving local families. Dr. Chen believes in unhurried appointments, continuity of care, and treating each patient as a whole person — not just a chart.',
   'available',
   '{"Monday":"9:00 AM – 5:00 PM","Tuesday":"9:00 AM – 5:00 PM","Wednesday":null,"Thursday":"1:00 PM – 7:00 PM","Friday":"9:00 AM – 3:00 PM","Saturday":null}'::jsonb,
   1,
   'dr-alexandra-chen',
   array['English','Mandarin'],
   'MD, McMaster University · Residency, Family Medicine, Dalhousie',
   array['Routine check-ups','Hypertension','Diabetes','Women''s health','Paediatric primary care'],
   18),
  ('Dr. Michael Patel','MP','Internal Medicine & Geriatrics',
   'Dedicated to adult and elderly care for over 12 years. Dr. Patel specialises in chronic disease management and builds long-term relationships with his patients and their families.',
   'available',
   '{"Monday":"1:00 PM – 7:00 PM","Tuesday":"9:00 AM – 5:00 PM","Wednesday":"9:00 AM – 5:00 PM","Thursday":null,"Friday":"9:00 AM – 5:00 PM","Saturday":"9:00 AM – 1:00 PM"}'::jsonb,
   2,
   'dr-michael-patel',
   array['English','Hindi','Gujarati'],
   'MD, University of Toronto · Internal Medicine, Western University',
   array['Chronic disease','Geriatric care','Cardiovascular health','Diabetes management','Medication review'],
   12),
  ('Dr. Sarah Okonkwo','SO','Physiotherapy & Rehabilitation',
   'Certified physiotherapist with deep expertise in restoring movement, managing chronic pain, and guiding patients through full recovery. Dr. Okonkwo brings warmth and precision to every session.',
   'limited',
   '{"Monday":"9:00 AM – 4:00 PM","Tuesday":null,"Wednesday":"9:00 AM – 4:00 PM","Thursday":null,"Friday":"9:00 AM – 4:00 PM","Saturday":null}'::jsonb,
   3,
   'dr-sarah-okonkwo',
   array['English','French'],
   'BScPT, Dalhousie University · Manual Therapy Certification, CPA',
   array['Sports injuries','Post-surgical recovery','Chronic pain','Lower back pain','Shoulder rehabilitation'],
   9)
on conflict do nothing;

insert into public.services (name, description, icon, color, tags, sort) values
  ('Family Medicine','Primary care for every stage of life — from infants and children to adults and seniors.','🏥','ic-teal',array['All Ages','Chronic Disease','Preventive Care'],1),
  ('General Consultation','Thorough, unhurried assessments. We listen first, then act.','🩺','ic-navy',array['Diagnosis','Second Opinions','Referrals'],2),
  ('Physiotherapy','Evidence-based rehabilitation and pain management by certified specialists.','🦴','ic-green',array['Rehabilitation','Sports Injury','Chronic Pain'],3),
  ('Preventive Care','Health screenings, vaccinations, and personalised wellness plans.','🛡️','ic-teal',array['Screenings','Vaccinations','Wellness'],4),
  ('Follow-Up Care','Ongoing monitoring to ensure your treatment stays on track.','📋','ic-navy',array['Chronic Management','Medication Review'],5),
  ('Annual Health Assessments','Comprehensive check-ups with tailored recommendations.','📊','ic-amber',array['Annual Check-up','Blood Tests','Risk Assessment'],6)
on conflict do nothing;

insert into public.testimonials (text, name, tag, initials, sort) values
  ('Dr. Chen has been our family doctor for over eight years. She takes the time to truly listen — every visit feels thorough and reassuring, never rushed.','Margaret T.','Patient, 8 years','MT',1),
  ('After my knee surgery, Dr. Okonkwo''s rehabilitation programme had me back on the ice in just 10 weeks. Exceptional, personalised care throughout.','James R.','Physiotherapy Patient','JR',2),
  ('Dr. Patel''s approach to managing my father''s chronic condition has been transformative. He explains everything clearly and is genuinely invested in our family''s health.','Priya K.','Family Caregiver','PK',3)
on conflict do nothing;

insert into public.authors (name, initials, role) values
  ('Dr. Alexandra Chen','AC','Family Physician'),
  ('Dr. Michael Patel','MP','Internal Medicine & Geriatrics'),
  ('Dr. Sarah Okonkwo','SO','Physiotherapist')
on conflict do nothing;

with a as (select id from public.authors where initials='AC' limit 1),
     m as (select id from public.authors where initials='MP' limit 1),
     s as (select id from public.authors where initials='SO' limit 1)
insert into public.blog_posts (slug, category, title, excerpt, body, cover_gradient, author_id, read_minutes, published, featured) values
  ('canadian-winter-family-health','Family Health',
   'How to Keep Your Family Healthy Through a Canadian Winter',
   'Practical, doctor-approved advice on cold prevention, vitamin D, immune support, and when to see your family physician — guidance tailored for Canadian families through the long winter months.',
   E'## Why winter is hard on the body\n\nLow sun, dry indoor air, and crowded indoor spaces all conspire to weaken our defences during a Canadian winter. Here''s how to stay ahead.\n\n## 1. Vitamin D\n\nMost Canadians under-supplement during winter. A 1,000 IU daily dose is reasonable for most adults — confirm with your physician.\n\n## 2. Hydration\n\nIndoor heating dries out airways. Drink water through the day and use a humidifier in bedrooms.\n\n## 3. Sleep & exercise\n\nShort daylight hours don''t mean shorter sleep. Aim for 7–8 hours and a daily walk — even 15 minutes outdoors makes a difference.',
   'bcim-1', (select id from a), 7, true, true),
  ('annual-checkups-matter','Preventive Care','Why Annual Check-Ups Matter More Than You Think',
   'A yearly visit isn''t just routine — it''s the foundation of catching problems early. Here''s what we look for.',
   E'## A yearly habit that protects your future self\n\nAnnual check-ups catch silent conditions early — hypertension, prediabetes, abnormal cholesterol — when they are still completely manageable.',
   'bcim-1', (select id from a), 5, true, false),
  ('knee-surgery-recovery','Physiotherapy','Recovering from Knee Surgery: A Week-by-Week Guide',
   'What to expect during your rehabilitation, and how the right physio programme accelerates lasting recovery.',
   E'## Week 1\n\nPain control and gentle range of motion.\n\n## Week 2–4\n\nStrength rebuilding starts.',
   'bcim-2', (select id from s), 8, true, false),
  ('chronic-conditions-confidence','Senior Health','Managing Chronic Conditions With Confidence',
   'Five simple habits that help patients with hypertension, diabetes, and arthritis live well — every day.',
   E'## Five habits that compound\n\n1. Daily walk\n2. Daily blood-pressure log\n3. Medication reminders\n4. One vegetable per meal\n5. Quarterly check-in',
   'bcim-3', (select id from m), 6, true, false),
  ('stress-and-your-doctor','Mental Wellness','When to Talk to Your Family Doctor About Stress',
   'Stress is universal — but knowing when it''s affecting your health is something we can address together.',
   E'## You don''t have to wait for a crisis\n\nMild but persistent stress can still raise blood pressure, disrupt sleep, and affect immunity. Talk to us early.',
   'bcim-4', (select id from a), 4, true, false),
  ('childhood-immunisations','Children''s Health','Routine Immunisations: Your Questions Answered',
   'A clear, evidence-based overview of the childhood vaccination schedule and what each shot prevents.',
   E'## A schedule worth following\n\nThe childhood vaccination schedule is built on decades of evidence. Here''s a plain-language summary.',
   'bcim-5', (select id from m), 6, true, false),
  ('movement-habit','Lifestyle','Building a Movement Habit That Actually Sticks',
   'Forget complicated routines. Small, consistent habits create lasting health benefits — here''s how to begin.',
   E'## Start tiny\n\nFive minutes a day, every day, beats 60 minutes once a week. Habits scale.',
   'bcim-6', (select id from s), 5, true, false)
on conflict (slug) do nothing;

insert into public.faqs (question, answer, category, sort) values
  ('Do I need an appointment, or can I walk in?',
   'Walk-ins are welcome during clinic hours and we do our best to see you the same day. For shorter waits, call ahead — we will hold a slot when one is available.',
   'Visiting', 1),
  ('What should I bring to my first visit?',
   'Please bring your health card, government photo ID, a list of any current medications (with doses), recent lab results or imaging if you have them, and any referral letter your previous doctor provided.',
   'Visiting', 2),
  ('Is parking available on site?',
   'Yes — we have free parking right at the clinic, including accessible spots near the entrance. Street parking on Wellness Avenue is also available.',
   'Visiting', 3),
  ('Are children welcome?',
   'Absolutely. We see patients of every age, from newborns through seniors. Bring your child''s vaccination record to their first visit.',
   'Visiting', 4),
  ('Do you accept my insurance?',
   'We accept most major provincial health plans and direct-bill several private insurers. Bring your insurance card to the visit and our front desk will confirm coverage.',
   'Billing', 5),
  ('Is there a fee for missed appointments?',
   'A no-show fee may apply for missed appointments without 24 hours notice. Please call us if your plans change — we will always do our best to reschedule.',
   'Billing', 6),
  ('Can I get my prescriptions refilled here?',
   'Yes. For ongoing medications, please book a brief follow-up so your physician can review your dose, side-effects, and any new symptoms before refilling.',
   'Care', 7),
  ('Do you offer virtual or phone appointments?',
   'Some follow-up visits and routine prescription renewals can be done over the phone. New issues or anything requiring an examination should be in person — please call us and we will help you decide.',
   'Care', 8),
  ('What languages do your physicians speak?',
   'Our team collectively speaks English, French, Mandarin, Hindi, and Gujarati. Please ask at booking and we will pair you with a doctor who speaks your preferred language when possible.',
   'Care', 9),
  ('When should I go to the emergency room instead of the clinic?',
   'For chest pain, severe difficulty breathing, sudden weakness or confusion, heavy bleeding, or any life-threatening symptom — call 911 or go directly to the nearest emergency department. For urgent but non-life-threatening issues, the ER is also the right place after our hours.',
   'Emergency', 10)
on conflict do nothing;
