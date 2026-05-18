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

-- ─── PATIENT HUB seed ──────────────────────────────────────────────────────
insert into public.patient_hub (
  slug, title, excerpt, body, category, cover_gradient, tags, read_minutes,
  related_links, published, featured, sort
) values
  ('preparing-for-a-blood-test',
   'Preparing for a Blood Test',
   'A short guide to fasting, hydration, medication, and what to bring on the day of your blood draw.',
   E'## Why preparation matters\n\nSome blood tests need fasting; others don''t. A little preparation makes results more accurate and your visit faster.\n\n## The night before\n\n- **Fasting tests** (cholesterol, glucose, comprehensive metabolic panel): no food or drinks other than water for 8–12 hours.\n- **Water is fine** — drink it freely. Hydrated veins are easier to find.\n- **Medications** — take as normal unless your doctor said otherwise. If unsure, call us.\n- **Avoid alcohol** for 24 hours before any lipid test.\n\n## The morning of\n\n- Wear a short-sleeve top or one with sleeves that roll up easily.\n- Bring your **health card**, **photo ID**, and any **requisition form**.\n- Have a small snack and water ready to enjoy right after.\n\n## During the draw\n\nLet the nurse know if you feel light-headed, have ever fainted at blood draws, or prefer to lie down. We will accommodate.\n\n## After the draw\n\n- Keep the bandage on for 30 minutes.\n- Avoid heavy lifting with that arm for a few hours.\n- A small bruise is normal — it fades in a few days.\n\n## When you''ll hear back\n\nMost results return in 1–3 business days. We will call if anything needs urgent attention. Otherwise, your physician will discuss results at your next visit.',
   'Tests & Procedures', 'bcim-1',
   array['blood test','fasting','lab work','blood draw','phlebotomy'], 4,
   '[{"label":"Health Canada — Blood tests","url":"https://www.canada.ca/en/health-canada.html"},{"label":"Nova Scotia Health Lab Services","url":"https://www.nshealth.ca/"}]'::jsonb,
   true, true, 1),

  ('understanding-blood-pressure',
   'Understanding Your Blood Pressure Reading',
   'What systolic and diastolic numbers mean, how to read your home monitor, and when to call us.',
   E'## The two numbers\n\nBlood pressure is written as **systolic / diastolic** — for example, 120/80 mmHg.\n\n- **Systolic** (top number): the pressure when your heart beats.\n- **Diastolic** (bottom number): the pressure between beats.\n\n## What ranges mean for adults\n\n| Category | Systolic | Diastolic |\n|---|---|---|\n| Normal | < 120 | < 80 |\n| Elevated | 120–129 | < 80 |\n| High (Stage 1) | 130–139 | 80–89 |\n| High (Stage 2) | ≥ 140 | ≥ 90 |\n| Hypertensive crisis | > 180 | > 120 |\n\n## How to measure correctly at home\n\n1. Rest quietly for 5 minutes first. No coffee or exercise in the last 30 minutes.\n2. Sit upright with back supported, feet flat, arm resting at heart height.\n3. Cuff goes on bare skin, snug but not tight.\n4. Stay still and silent during the reading.\n5. Take **two readings** one minute apart and record both.\n\n## When to call us\n\n- Two consecutive readings above 140/90 over a week.\n- Headache, vision changes, or chest discomfort with high readings.\n- Any single reading above 180/120 — call us or go to the ER.\n\n## What helps lower it\n\n- Reduce salt to under 2,300 mg/day.\n- Move your body 30 minutes most days — even walking counts.\n- Limit alcohol to one drink a day or less.\n- Sleep 7–8 hours a night.\n- If your doctor prescribed medication, take it daily at the same time.',
   'Vitals & Self-Monitoring', 'bcim-2',
   array['blood pressure','hypertension','vitals','heart health','home monitoring'], 5,
   '[{"label":"Hypertension Canada — Patient resources","url":"https://hypertension.ca/patients/"},{"label":"Heart & Stroke Foundation","url":"https://www.heartandstroke.ca/"}]'::jsonb,
   true, false, 2),

  ('adult-vaccine-schedule-canada',
   'Adult Vaccine Schedule in Canada',
   'A plain-language overview of recommended vaccines for adults living in Nova Scotia.',
   E'## Vaccines aren''t just for kids\n\nMany adults are due for boosters or new vaccines they didn''t get as children.\n\n## Annual\n\n- **Influenza (flu)** — every fall. Available free in NS for all residents.\n\n## Every 10 years\n\n- **Tdap booster** (tetanus, diphtheria, whooping cough).\n\n## Once in a lifetime (or per schedule)\n\n- **Shingles (Shingrix)** — adults 50+. Two doses, 2–6 months apart.\n- **Pneumococcal** — adults 65+, or younger with certain conditions.\n- **HPV** — recommended up to age 26, considered up to 45 in consultation with your doctor.\n\n## Special situations\n\n- **Pregnancy** — Tdap, flu, and RSV vaccines are recommended.\n- **Chronic conditions** — additional vaccines may be needed for diabetes, kidney disease, or immunocompromised patients.\n- **Travel** — book a travel-medicine visit 4–6 weeks before departure.\n\n## Records\n\nBring your immunization record to your next appointment. Don''t have one? We can help reconstruct it.',
   'Preventive Care', 'bcim-3',
   array['vaccines','immunisation','flu shot','shingles','HPV','tetanus','adult care'], 4,
   '[{"label":"NS Vaccination programs","url":"https://novascotia.ca/dhw/cdpc/vaccination.asp"},{"label":"Public Health Agency of Canada","url":"https://www.canada.ca/en/public-health.html"}]'::jsonb,
   true, false, 3),

  ('healthy-eating-on-a-budget',
   'Healthy Eating on a Canadian Budget',
   'Practical ways to follow Canada''s Food Guide without overspending. Tips that work for one person or a family of six.',
   E'## Start with Canada''s plate\n\nHalf vegetables and fruits, a quarter whole grains, a quarter protein. Water as the drink of choice.\n\n## Save without losing quality\n\n- **Frozen vegetables** are picked at peak ripeness, last weeks, and cost less than fresh.\n- **Eggs, lentils, canned beans, tofu, oats** — cheap, nutritious staples.\n- **Buy whole chickens** and use the carcass for stock.\n- **Shop the perimeter** of the grocery store first.\n\n## Meal-prep one afternoon a week\n\nCook a grain (rice, quinoa, pasta), a protein, and two vegetables. Mix and match through the week with different sauces.\n\n## Resources at the clinic\n\nIf you''d like a free 30-minute consult with our team to plan meals around a medical condition (diabetes, hypertension, kidney disease), just ask at reception.',
   'Lifestyle & Wellness', 'bcim-4',
   array['nutrition','diet','food','budget','meal planning','healthy eating'], 4,
   '[{"label":"Canada''s Food Guide","url":"https://food-guide.canada.ca/"},{"label":"Dietitians of Canada","url":"https://www.dietitians.ca/"}]'::jsonb,
   true, false, 4),

  ('mental-health-when-to-reach-out',
   'Mental Health — When and How to Reach Out',
   'Stress, anxiety, and low mood are real medical concerns. Here''s how to know when it''s time to talk to us — and what help is available.',
   E'## You don''t have to be in crisis to ask for help\n\nMild persistent symptoms still affect health. The sooner we address them, the better the outcome.\n\n## Common signs to bring up with your physician\n\n- Feeling low or hopeless most days for two weeks or more.\n- Difficulty falling asleep, staying asleep, or sleeping much more than usual.\n- Loss of interest in things you used to enjoy.\n- Persistent worry that interrupts daily life.\n- Changes in appetite or weight.\n- Feeling on edge, restless, or overwhelmed.\n- Thoughts of self-harm — please call us or 988 immediately.\n\n## What a visit looks like\n\nWe listen. We talk about what''s going on at home, work, school. We discuss options together — talk therapy, lifestyle changes, medication, or a combination. There is no rush, no judgment.\n\n## 24/7 crisis support\n\n- **988** — Suicide Crisis Helpline (Canada-wide, free, in English & French)\n- **NS Mental Health Crisis Line**: 1-888-429-8167\n- **Kids Help Phone**: 1-800-668-6868 or text CONNECT to 686868',
   'Mental Wellness', 'bcim-5',
   array['mental health','depression','anxiety','stress','crisis support','therapy'], 5,
   '[{"label":"988 Suicide Crisis Helpline","url":"https://988.ca/"},{"label":"NS Mental Health & Addictions","url":"https://mha.nshealth.ca/"},{"label":"Wellness Together Canada","url":"https://www.wellnesstogether.ca/"}]'::jsonb,
   true, false, 5),

  ('trusted-external-resources',
   'Trusted External Health Resources',
   'A curated list of evidence-based Canadian and international health websites we recommend to patients.',
   E'## Why this list exists\n\nThe internet has a lot of health information — much of it inaccurate. These are the sources we trust and use ourselves.\n\n## General Canadian health\n\n- **Government of Canada — Health**: official guidance on illness, medication, vaccines, travel health.\n- **Health Canada**: drug safety alerts, food and product recalls.\n- **Nova Scotia Health**: provincial services, clinic locator, prescription assistance.\n\n## Condition-specific\n\n- **Diabetes Canada** — meal plans, monitoring guides.\n- **Heart & Stroke Foundation** — risk calculator, recovery resources.\n- **Canadian Cancer Society** — screening guides, support programs.\n- **Lung Health Foundation** — asthma, COPD, smoking cessation.\n- **Arthritis Society Canada** — exercise programs, pain management.\n\n## Mental wellness\n\n- **Wellness Together Canada** — free 24/7 counselling.\n- **CAMH** — Centre for Addiction and Mental Health, patient education library.\n\n## Find a specialist or service\n\n- **211 Nova Scotia** — community resources, food banks, transportation, housing.\n- **Health Standards Organization** — find accredited clinics.\n\nIf there''s a topic you want us to add to this list, mention it on your next visit.',
   'External Resources', 'bcim-6',
   array['resources','external links','health information','government','canada','nova scotia'], 3,
   '[{"label":"Government of Canada — Health","url":"https://www.canada.ca/en/services/health.html"},{"label":"Health Canada","url":"https://www.canada.ca/en/health-canada.html"},{"label":"Nova Scotia Health","url":"https://www.nshealth.ca/"},{"label":"Diabetes Canada","url":"https://www.diabetes.ca/"},{"label":"Heart & Stroke Foundation","url":"https://www.heartandstroke.ca/"},{"label":"Canadian Cancer Society","url":"https://www.cancer.ca/"},{"label":"Wellness Together Canada","url":"https://www.wellnesstogether.ca/"},{"label":"211 Nova Scotia","url":"https://ns.211.ca/"}]'::jsonb,
   true, false, 6)
on conflict (slug) do nothing;
