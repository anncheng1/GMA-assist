/* GMA Assist — reference content.
 * Teaching text is an original summary written for revision. Scoring proformas follow
 * Einspieler C, Prechtl HFR, Bos AF, Ferrari F, Cioni G. Prechtl's Method on the Qualitative
 * Assessment of General Movements in Preterm, Term and Young Infants. Mac Keith Press, 2004
 * (Fig. 3.7 trajectory, Fig. 3.8 GM optimality list, Fig. 3.9 motor repertoire 3-5 months).
 */
const GMA = {};

GMA.version = '1.2.1';

/* Built-in reference videos (embedded from the publisher's YouTube channel; not downloaded). */
GMA.referenceVideos = [
  { yt: 'XrVZmG9KSxo', title: 'Video 1 — Normal general movements', cls: 'N', source: 'JAMA Network — companion video to Ferrari F et al. Cramped synchronized general movements in preterm infants as an early marker for cerebral palsy. Arch Pediatr Adolesc Med 2002;156:460–7.',
    note: 'Whole-body, variable sequence of arm, leg, neck and trunk movements; waxing and waning intensity; rotations; gradual onset and offset.' },
  { yt: '2tGAK8BKJwo', title: 'Video 2 — Normal fidgety movements', cls: 'FN', source: 'JAMA Network — companion video to Ferrari F et al. Cramped synchronized general movements in preterm infants as an early marker for cerebral palsy. Arch Pediatr Adolesc Med 2002;156:460–7.',
    note: 'Small, moderate-speed movements of neck, trunk and limbs in all directions with variable acceleration, continual while awake and not crying.' },
  { yt: 'LSa4jENxgLk', title: 'Video 3 — Cramped-synchronised movements', cls: 'CS', source: 'JAMA Network — companion video to Ferrari F et al. Cramped synchronized general movements in preterm infants as an early marker for cerebral palsy. Arch Pediatr Adolesc Med 2002;156:460–7.',
    note: 'Rigid movements lacking smooth fluency; limb and trunk muscles contract and relax almost simultaneously. Compare directly with Video 1.' },
  { yt: 'Soi_yNVkeos', title: 'Video 4 — Abnormal fidgety movements', cls: 'AF', source: 'JAMA Network — companion video to Ferrari F et al. Cramped synchronized general movements in preterm infants as an early marker for cerebral palsy. Arch Pediatr Adolesc Med 2002;156:460–7.',
    note: 'The fidgety pattern is recognisable, but amplitude, speed and jerkiness are exaggerated. Compare directly with Video 2.' }
];

/* Additional videos: explainers and unverified examples (kind: 'explainer' | 'example'). */
GMA.referenceVideos.forEach(v => v.kind = 'example');
GMA.referenceVideos.push(
  { yt: 'pXSjaQJb7qo', kind: 'example', cls: '', title: 'GMA video — fidgety movements (YouTube Short)',
    source: 'Clinic-uploaded YouTube Short titled “General Movement Assessment Video — Fidgety Movements”. Uploader classification not formally stated.',
    note: 'Unverified example: a GM-trained trainer should confirm the classification before using it for teaching.' },
  { yt: 'rMDqkqqGt1Y', kind: 'explainer', cls: '', title: '¿Qué son los Movimientos Generales de Prechtl? (Spanish)',
    source: 'Spanish-language introduction linked to GM Trust certification courses.',
    note: 'Overview of what general movements are and why the assessment is useful.' }
);

/* Open-licence figures (hot-linked from the publisher; shown with attribution, need internet). */
GMA.referenceImages = [
  { src: 'https://mdpi-res.com/jcm/jcm-08-01616/article_deploy/html/images/jcm-08-01616-g002-550.jpg',
    full: 'https://www.mdpi.com/2077-0383/8/10/1616/htm#fig_body_display_jcm-08-01616-f002',
    title: 'Revised Motor Optimality Score (MOS-R) proforma, 3–5 months',
    credit: 'Einspieler C, Bos AF, Krieber-Tomantschger M, et al. Cerebral Palsy: Early Markers of Clinical Phenotype and Functional Outcome. J Clin Med 2019;8:1616, Figure 2. CC BY 3.0.',
    note: 'The consensus revision of the motor repertoire assessment. The app scores the original 2004 version (Fig. 3.9 of the manual); compare the two.' },
  { src: 'https://mdpi-res.com/jcm/jcm-08-01616/article_deploy/html/images/jcm-08-01616-g003-550.jpg',
    full: 'https://www.mdpi.com/2077-0383/8/10/1616/htm#fig_body_display_jcm-08-01616-f003',
    title: 'Postural item “Body symmetry” — illustration',
    credit: 'Einspieler C et al. J Clin Med 2019;8:1616, Figure 3. CC BY 3.0.',
    note: 'Use this when scoring the posture item (symmetrical vs asymmetrical).' }
];

/* Open-access reading (links only). */
GMA.reading = [
  { title: 'Fidgety movements – tiny in appearance, but huge in impact', cite: 'Einspieler C, Peharz R, Marschik PB. J Pediatr (Rio J) 2016;92(3 Suppl 1):S64–70', url: 'https://doi.org/10.1016/j.jped.2015.12.003' },
  { title: 'The general movement checklist: a guide to assessment of GMs during preterm and term age', cite: 'Aizawa CYP, Einspieler C, et al. J Pediatr (Rio J) 2021;97:445–52', url: 'https://doi.org/10.1016/j.jped.2020.09.006' },
  { title: 'Cerebral palsy: early markers of clinical phenotype and functional outcome (MOS-R)', cite: 'Einspieler C, Bos AF, et al. J Clin Med 2019;8:1616', url: 'https://doi.org/10.3390/jcm8101616' },
  { title: 'Are sporadic fidgety movements as clinically relevant as is their absence?', cite: 'Einspieler C, et al. Early Hum Dev 2015', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5951271/' },
  { title: 'The GMA helps us to identify preterm infants at risk for cognitive dysfunction', cite: 'Einspieler C, Bos AF, Libertus ME, Marschik PB. Front Psychol 2016;7:406', url: 'https://doi.org/10.3389/fpsyg.2016.00406' },
  { title: 'Zika-exposed infants evaluated with the general movement assessment', cite: 'Einspieler C, et al. JAMA Netw Open 2019;2:e187235', url: 'https://doi.org/10.1001/jamanetworkopen.2018.7235' },
  { title: 'The GMA in non-European low- and middle-income countries', cite: 'Tomantschger I, et al. Rev Saude Publica 2018;52:6', url: 'https://scielosp.org/pdf/rsp/2018.v52/6/en' },
  { title: 'Cramped synchronized GMs in preterm infants as an early marker for CP (source of Videos 1–4)', cite: 'Ferrari F, et al. Arch Pediatr Adolesc Med 2002;156:460–7', url: 'https://jamanetwork.com/journals/jamapediatrics/fullarticle/191860' },
  { title: 'General Movement Video and Assessment Guideline (NICU)', cite: 'Child and Adolescent Health Service, Western Australia', url: 'https://cahs.health.wa.gov.au/~/media/HSPs/CAHS/Documents/Health-Professionals/Neonatology-guidelines/General-Movement-Video-and-Assessment-Guideline.pdf' },
  { title: 'Parent fact sheet: Prechtl’s General Movements Assessment', cite: 'Cerebral Palsy Alliance, Australia', url: 'https://cerebralpalsy.org.au/wp-content/uploads/2023/06/Parental-Fact-Sheets.pdf' }
];

GMA.ytId = function (url) {
  if (!url) return null;
  const s = String(url).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
};
GMA.ytEmbed = (id, autoplay) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1&mute=1' : ''}`;

/* ---------- Classification categories ---------- */
GMA.classes = {
  N:   { label: 'Normal GMs', short: 'N', period: ['preterm','writhing'], desc: 'Complex, variable, fluent; waxing and waning; rotations; gradual onset/offset.' },
  PR:  { label: 'Poor repertoire (PR)', short: 'PR', period: ['preterm','writhing'], desc: 'Monotonous sequence of components; less complex than normal.' },
  CS:  { label: 'Cramped-synchronised (CS)', short: 'CS', period: ['preterm','writhing','fidgety'], desc: 'Rigid; limbs and trunk contract and relax almost simultaneously.' },
  Ch:  { label: 'Chaotic (Ch)', short: 'Ch', period: ['preterm','writhing'], desc: 'Large amplitude, chaotic order, abrupt, no fluency. Rare.' },
  H:   { label: 'Hypokinesis (H)', short: 'H', period: ['preterm','writhing'], desc: 'No GMs observed during the recording.' },
  FN:  { label: 'Normal fidgety movements (F+)', short: 'N', period: ['fidgety'], desc: 'Small, moderate-speed, variable-acceleration movements of neck, trunk and limbs in all directions.' },
  AF:  { label: 'Abnormal fidgety (AF)', short: 'AF', period: ['fidgety'], desc: 'Like fidgety movements but amplitude, speed and jerkiness moderately/greatly exaggerated. Rare.' },
  'F-':{ label: 'Absent fidgety (F−)', short: 'F-', period: ['fidgety'], desc: 'Fidgety movements never observed from 9 to 20 weeks post-term; other movements may be present.' }
};
GMA.trajectoryRows = ['F-','AF','CS','Ch','PR','H','N']; // top → bottom, as in Fig. 3.7
GMA.abnormal = new Set(['PR','CS','Ch','H','AF','F-']);

/* ---------- Age periods ---------- */
GMA.periodFor = function (pmaWeeks) {
  const pt = pmaWeeks - 40;
  if (pmaWeeks < 38) return { key: 'preterm', label: 'Preterm GM period', tool: 'gmos' };
  if (pt < 6)  return { key: 'writhing', label: 'Writhing movement period', tool: 'gmos' };
  if (pt < 9)  return { key: 'transition', label: 'Transition (writhing → fidgety, 6–9 wk post-term)', tool: 'gmos',
                         note: 'Fidgety movements may be just emerging. If fidgety movements are not yet seen, re-record in the fidgety period (ideally 12 and 15 weeks).' };
  if (pt <= 20) return { key: 'fidgety', label: 'Fidgety movement period', tool: 'mos' };
  return { key: 'late', label: 'Beyond fidgety period (>20 wk post-term)', tool: 'mos',
           note: 'Fidgety movements normally fade after ~20 weeks as intentional and antigravity movements take over. Interpret with caution.' };
};

/* ---------- Recording quality checklist (Chapter 3) ---------- */
GMA.quality = [
  { id: 'supine', text: 'Infant supine; camera fixed high above, whole body and face visible' },
  { id: 'state', text: 'Correct state: ≥36 wk PMA active wakefulness (eyes open, irregular breathing, moving, not crying); <36 wk recorded during activity bouts' },
  { id: 'nocry', text: 'Assessed segments free of prolonged fussing, crying, drowsiness or hiccups' },
  { id: 'nodummy', text: 'No dummy/pacifier (sucking posture invalidates assessment)' },
  { id: 'dress', text: 'Lightly dressed, arms and legs bare; preterm nappy loosened; out of the nest' },
  { id: 'clear', text: 'No caregiver interaction, toys, mirror or patterned blanket in view' },
  { id: 'temp', text: 'Comfortable ambient temperature' },
  { id: 'surface', text: 'Safe surface (incubator, cot or mattress on floor — not a table)' },
  { id: 'duration', text: 'Adequate material: preterm ~30–60 min recording with ≈3 GM sequences selected; later periods 5–10 min of optimal recording' },
  { id: 'nosound', text: 'Reviewed without sound; assessor rested (break after ~45 min)' }
];

/* ---------- GM Optimality List — preterm & writhing (Fig. 3.8) ---------- */
GMA.gmos = [
  { id: 'quality', name: '1. Quality', opts: [['normal, variable, complex',4],['poor repertoire',2],['chaotic',1],['cramped-synchronised',1]] },
  { id: 'sequence', name: '2. Sequence', opts: [['variable',2],['monotonous within GM',1],['similar from GM to GM',1],['disorganised',1]] },
  { id: 'amplitude', name: '3. Amplitude', opts: [['variable, full range',2],['predominantly small range',1],['predominantly large range',1],['mainly one range, not variable',1]] },
  { id: 'speed', name: '4. Speed', opts: [['variable',2],['monotonously slow',1],['monotonously fast',1],['mainly one speed, not variable',1]] },
  { id: 'space', name: '5. Space', opts: [['from horizontal to vertical plane',2],['not the full space used',1]] },
  { id: 'rotation', name: '6. Rotatory components', opts: [['present, fluent and elegant',2],['no or just a few rotations',1]] },
  { id: 'onset', name: '7. Onset and offset', opts: [['smooth',2],['minimal fluctuations or abrupt',1]] },
  { id: 'tremor', name: '8. Tremulous movements', opts: [['absent',2],['present',1]] }
];

/* ---------- Motor repertoire 3–5 months (Fig. 3.9) ---------- */
// allowed: 'NA' both, 'N' normal only, 'A' abnormal only
GMA.mosMovement = [
  ['fidgety movements','NA'],['swiping movements','NA'],['wiggling-oscillating movements','NA'],['saccadic arm movements','NA'],
  ['kicking','NA'],['excitement bursts','NA'],["'cha-cha-cha' movements",'A'],['smiles','NA'],['mouth movements','NA'],
  ['tongue movements','NA'],['head rotation','NA'],['hand–face contact','N'],['hand–mouth contact','N'],['hand–hand contact','N'],
  ['hand–hand manipulation','N'],['fiddling / clothes, blanket','NA'],['reaching','N'],['foot–foot contact','NA'],
  ['foot–foot manipulation','N'],['segmental movements arms','NA'],['segmental movements legs','NA'],
  ['segmental: discrepancy arm–leg','A'],['legs lift, flexion at knees','NA'],['legs lift, extension at knees','NA'],
  ['hand–knee contact','N'],['arching','NA'],['trunk rotation','NA'],['axial rolling','N'],['visual scanning','NA'],
  ['hand regard','N'],['head anteflexion','N'],['arm movements in circles','A'],['almost no leg movements','A']
];
GMA.mosPosture = [
  ['head in midline (within 20°)','NA'],['symmetrical','NA'],['spontaneous ATNR absent or could be overcome','NA'],
  ["body and limbs 'flat' on surface",'A'],['variable finger postures','N'],['predominant fisting','A'],['finger spreading','A'],
  ['a few finger postures','A'],['synchronised opening and closing of the fingers','A'],['hyperextension of the neck','A'],
  ['hyperextension of trunk','A'],['extended arms on/above surface predominant','A'],['extended legs on/above surface predominant','A']
];
GMA.mosCharacter = [
  ['smooth and fluent','N'],['jerky','A'],['monotonous','A'],['tremulous','A'],['stiff','A'],['cramped','A'],['synchronous','A'],
  ['cramped-synchronised','A'],['predominantly slow speed','A'],['predominantly fast speed','A'],
  ['predominantly large amplitude','A'],['predominantly small amplitude','A']
];
GMA.mos = [
  { id: 'fm', name: '1. Fidgety movements', opts: [['normal',12],['abnormal',4],['absent',1]] },
  { id: 'rep', name: '2. Repertoire of co-existent other movements', opts: [['age-adequate',4],['reduced',2],['absent',1]] },
  { id: 'qual', name: '3. Quality of other movements', opts: [['N > A',4],['N = A',2],['N < A',1]] },
  { id: 'post', name: '4. Posture', opts: [['N > A',4],['N = A',2],['N < A',1]] },
  { id: 'char', name: '5. Movement character', opts: [['smooth and fluent',4],['abnormal, not cramped-synchronised',2],['cramped-synchronised',1]] }
];

/* ---------- Lessons ---------- */
GMA.lessons = [
{ id: 'intro', title: '1. Why assess general movements?', html: `
<p>General movements (GMs) are spontaneous whole-body movements generated endogenously by central pattern generators in the brainstem, modulated by higher (cortical) structures. They are present from about 9–10 weeks post-menstrual age (PMA) in the fetus until about 20 weeks after term. Because they are generated by the nervous system itself — not provoked by handling — their <em>quality</em> is a sensitive window onto the integrity of the young brain.</p>
<p>GMA is <strong>non-invasive</strong>: the infant is not touched, and it can be done in the NICU despite ventilation, lines and electrodes, provided the infant moves.</p>
<div class="key"><strong>Key idea:</strong> GMA assesses <em>quality</em>, not quantity. Counting or measuring how much an infant moves is an insensitive indicator of brain impairment; the complexity, variability and fluency of the movement are what matter.</div>
<h3>How good is it?</h3>
<ul>
<li>Inter-observer agreement in trained assessors is high (around 89–93% across studies; mean kappa ~0.88).</li>
<li>Pooled sensitivity for later neurological deficit is around 94%.</li>
<li>Specificity is lower in the preterm and writhing periods (many poor-repertoire infants normalise) and rises to roughly 82–100% in the fidgety period.</li>
<li>Persistent <strong>cramped-synchronised GMs</strong> and <strong>absent fidgety movements</strong> are the strongest predictors of cerebral palsy.</li>
</ul>
<p class="ref">Manual: Chapters 1, 5, 7.</p>` },

{ id: 'normal', title: '2. Normal GMs across ages', html: `
<p>Normal GMs involve the whole body in a variable sequence of arm, leg, neck and trunk movements. They <strong>wax and wane</strong> in intensity, force and speed, start and end gradually, and include <strong>rotations</strong> along the limb axes and small changes of direction that give them a fluent, elegant, complex appearance.</p>
<table>
<tr><th>Period</th><th>Age</th><th>Character</th></tr>
<tr><td>Preterm (fetal) GMs</td><td>to ~term</td><td>Variable, complex; can include large-amplitude, fast components, sometimes with pelvic/trunk involvement.</td></tr>
<tr><td>Writhing movements</td><td>term to ~6–9 wk post-term</td><td>Small-to-moderate amplitude, slow-to-moderate speed; often an elliptical, “writhing” form.</td></tr>
<tr><td>Fidgety movements</td><td>~6–9 wk to ~20 wk post-term (usually from ~9 wk)</td><td>Small movements of moderate speed and variable acceleration of neck, trunk and limbs in all directions; continual in the awake, non-crying infant.</td></tr>
</table>
<h3>Scoring fidgety movements</h3>
<ul>
<li><strong>++ continual</strong> — frequent, with only short pauses.</li>
<li><strong>+ intermittent</strong> — present in all body parts but with longer pauses (about half the observation time).</li>
<li><strong>+/− sporadic</strong> — present but interspersed with even longer pauses.</li>
<li>Distribution: usually <strong>D = P</strong> (distal = proximal); some infants show D &gt; P or P &gt; D.</li>
</ul>
<p>Preterm-born infants may show fidgety movements early (~6 weeks). Use <strong>corrected age</strong> (post-term age) throughout.</p>
<p class="ref">Manual: Chapter 2.</p>` },

{ id: 'other', title: '3. Movements co-existing with fidgety', html: `
<p>From 3 to 5 months, other movements occur alongside or between fidgety movements. Recognising an <em>age-adequate repertoire</em> is part of the motor optimality score.</p>
<table>
<tr><th>Pattern</th><th>Brief description</th><th>Typical onset (post-term)</th></tr>
<tr><td>Wiggling-oscillating arm movements</td><td>Irregular waving oscillations ~2–3 Hz, small amplitude; smoother and less regular than tremor</td><td>6–14 wk</td></tr>
<tr><td>Saccadic arm movements</td><td>Jerky zig-zag movements continually changing direction</td><td>6–15 wk</td></tr>
<tr><td>Swiping</td><td>Ballistic-looking, fast, large arm (or leg) movements with fluid onset and smooth offset</td><td>6–20 wk</td></tr>
<tr><td>Mutual finger manipulation</td><td>Hands meet in midline; fingers touch, stroke, grasp</td><td>from 12 wk</td></tr>
<tr><td>Fiddling with clothing</td><td>Fingers repetitively touch/grasp clothing or objects</td><td>from 12 wk</td></tr>
<tr><td>Reaching and touching</td><td>Arm extends to an object; fingers contact it</td><td>from 12 wk</td></tr>
<tr><td>Trunk rotation</td><td>Feet push down; one hip lifts and rotates</td><td>from 12 wk</td></tr>
<tr><td>Legs lift</td><td>Both legs lifted vertically, hands may hold knees</td><td>from 15 wk</td></tr>
<tr><td>Axial rolling</td><td>Head-led roll from supine towards prone</td><td>from 18 wk</td></tr>
</table>
<p>Patterns to score as <strong>abnormal</strong> include: predominant swipes, wiggling-oscillating or saccadic movements; monotonous kicking; monotonous excitement bursts without pleasure mimic; “cha-cha-cha” movements; frozen smiles; synchronous mouth opening/closing; repetitive tongue protrusion or head rotation; awkward fiddling; segmental movements that are side-dominant; en-bloc trunk rotation; prolonged arching. Postural abnormalities include persistent lateral head position (&gt;20°), asymmetry, and an ATNR that cannot be overcome.</p>
<p class="ref">Manual: Chapter 2 (Table 2.2) and Chapter 3 (Fig. 3.9).</p>` },

{ id: 'abnormal', title: '4. Abnormal GMs', html: `
<p>When the nervous system is impaired, GMs lose complexity and variability.</p>
<table>
<tr><th>Category</th><th>Period</th><th>What you see</th><th>Prognostic weight</th></tr>
<tr><td><strong>Poor repertoire (PR)</strong></td><td>Preterm, term, early post-term</td><td>Monotonous sequence; body parts do not move in the normal complex way</td><td>Low on its own — may be followed by normal, abnormal or absent fidgety movements. Common with ultrasound abnormalities.</td></tr>
<tr><td><strong>Cramped-synchronised (CS)</strong></td><td>From preterm age</td><td>Rigid, lacking smooth fluent character; limb and trunk muscles contract and relax almost simultaneously</td><td>High if consistent over several weeks → spastic CP.</td></tr>
<tr><td><strong>Chaotic (Ch)</strong></td><td>Preterm, term, early post-term</td><td>Large-amplitude movements of all limbs in chaotic order, abrupt, no fluency</td><td>Rare; often evolves into CS.</td></tr>
<tr><td><strong>Abnormal fidgety (AF)</strong></td><td>Fidgety period</td><td>Look like fidgety but amplitude, speed and jerkiness exaggerated</td><td>Low; rare.</td></tr>
<tr><td><strong>Absent fidgety (F−)</strong></td><td>9–20 wk post-term</td><td>Fidgety never observed; other movements may occur</td><td>High → CP (spastic and dyskinetic).</td></tr>
<tr><td><strong>Hypokinesis (H)</strong></td><td>Any (trajectory code)</td><td>No GMs during the recording</td><td>Context-dependent (e.g. HIE, sedation).</td></tr>
</table>
<div class="key">If the cramped-synchronised character persists to 3–4 months, fidgety movements are absent.</div>
<h3>Look-alikes</h3>
<ul>
<li><strong>Sepsis</strong> can make GMs sluggish and slow, but complexity, variable sequence and rotations are preserved — unlike true PR.</li>
<li><strong>Subtle seizures</strong> are extremely stereotyped and often accompanied by eye, oral-buccal-lingual or autonomic phenomena; PR is monotonous but never that stereotyped.</li>
<li><strong>Tonic seizures / epileptic spasms</strong> may resemble CS but are stereotyped (spasms also faster and clustered). If in doubt, obtain (video-)EEG.</li>
<li>Drugs: dexamethasone and indomethacin may transiently reduce motility, speed or amplitude.</li>
</ul>
<p class="ref">Manual: Chapters 2 and 4.</p>` },

{ id: 'record', title: '5. Recording technique', html: `
<ol>
<li><strong>Camera</strong>: fixed high above the infant (tripod), small and unobtrusive; digital with time code.</li>
<li><strong>Position</strong>: supine in incubator, cot or on a mattress on the floor — never on a table. Remove from the nest to avoid mechanical restriction.</li>
<li><strong>Clothing</strong>: preterm — nappy loosened/opened; post-term — lightly dressed, arms and legs bare. Comfortable room temperature.</li>
<li><strong>State</strong>: from ~36 weeks PMA record in active wakefulness (state 4). Younger preterms: record during activity bouts whether awake or asleep. Face must be visible so rigidity due to crying can be excluded.</li>
<li><strong>Duration</strong>: preterm — 30–60 min (staff can start it) then select ≈3 GM sequences; from the writhing period — 5–10 min of optimal recording.</li>
<li><strong>Avoid</strong>: prolonged fussing/crying (stop, soothe, restart — or another day), drowsiness, dummy sucking, prolonged hiccups, interacting caregivers, toys, mirrors, busy patterned blankets, and recordings in the first 3 days after birth.</li>
</ol>
<div class="key">Use the <em>Recording quality checklist</em> in the Analyse tab each time — an unsuitable recording should not be classified.</div>
<p class="ref">Manual: Chapter 3.</p>` },

{ id: 'assess', title: '6. How to assess: Gestalt perception', html: `
<p>GM assessment relies on <strong>visual Gestalt perception</strong> — global pattern recognition, just as when reading an X-ray or EEG. It is trained, not intuitive.</p>
<ol>
<li>Watch without sound, ideally at normal speed first, then replay (slow or fast) as needed. Fast replay can help reveal monotony; slow replay helps with detail.</li>
<li>First decide: <strong>normal or abnormal?</strong> Then assign the age-specific abnormal category.</li>
<li>Only after the global judgement, use the optimality score to describe details — it cannot replace the Gestalt.</li>
<li>Take a break after ~45 minutes of assessing. After viewing many abnormal recordings, re-calibrate by watching a normal reference recording.</li>
<li>Remove distractions from the image (crop / region of interest) and from your environment.</li>
</ol>
<p class="ref">Manual: Chapter 3.</p>` },

{ id: 'scores', title: '7. Optimality scores', html: `
<h3>GM Optimality Score (preterm &amp; writhing) — max 16, min 8</h3>
<p>Eight items: quality, sequence, amplitude, speed, space, rotatory components, onset/offset, tremulous movements. The sequence item is never optimal in abnormal GMs; amplitude and speed can be less than optimal even in GMs judged normal.</p>
<h3>Motor Optimality Score (3–5 months) — max 28, min 5</h3>
<ol>
<li>Fidgety movements: normal 12 · abnormal 4 · absent 1</li>
<li>Repertoire of co-existent other movements: age-adequate 4 · reduced 2 · absent 1</li>
<li>Quality of other movements: N&gt;A 4 · N=A 2 · N&lt;A 1</li>
<li>Posture: N&gt;A 4 · N=A 2 · N&lt;A 1</li>
<li>Movement character: smooth and fluent 4 · abnormal not CS 2 · CS 1</li>
</ol>
<div class="key">Scores are <em>semi-quantitative</em>: useful for tracking improvement/deterioration and for research, but the detail-focused approach loses the power of the global Gestalt.</div>
<p class="ref">Manual: Chapter 3 (Figs 3.8, 3.9).</p>` },

{ id: 'trajectory', title: '8. Developmental trajectory', html: `
<p>Avoid snapshot judgements from a single recording. Build an <strong>individual developmental trajectory</strong>:</p>
<ul>
<li>2–3 recordings in the preterm period (≈3 GM sequences each)</li>
<li>1 recording at term and/or early post-term age</li>
<li>at least 1 recording at 9–15 weeks post-term; if fidgety movements seem absent, record again (e.g. at 12 and 15 weeks)</li>
</ul>
<p>Plot each result (N, H, PR, Ch, CS, AF, F−) against age. The earlier and more consistently the trajectory deviates from the normal baseline, the higher the probability of later neurological deficit. A common benign pattern is PR in the preterm/term period followed by normal fidgety movements.</p>
<p>The <em>Records &amp; trajectory</em> tab draws this chart automatically from saved assessments.</p>
<p class="ref">Manual: Chapter 3 (Fig. 3.7), Chapter 5.</p>` },

{ id: 'clinical', title: '9. Clinical use & communication', html: `
<ul>
<li>Early in NICU, GMA mainly reflects <strong>acute</strong> neurological status (e.g. effects of illness, medication); prediction is most reliable from the fidgety period.</li>
<li>Combine GMA with neuroimaging and neurological examination (e.g. HINE) — each adds information.</li>
<li>Normal fidgety movements at 3 months strongly predict a normal neurological outcome; absent fidgety movements warrant urgent referral for early intervention and CP diagnostic pathways.</li>
<li>Communicate results with parents carefully: explain that GMA indicates risk, and plan follow-up.</li>
<li>Document recording conditions, age (corrected), scorer and classification for every recording.</li>
</ul>
<p class="ref">Manual: Chapters 5, 6, 8, 9.</p>` }
];

GMA.lessons.push({ id: 'refvideos', title: '10. Reference library (videos, figures, reading)', html: '<div id="refLibrary"></div>' });

/* ---------- Quiz bank ---------- */
GMA.quiz = [
{ q: 'What does Prechtl’s GMA primarily evaluate?', o: ['The amount of spontaneous movement','The quality (complexity, variability, fluency) of spontaneous movement','Muscle tone on handling','Primitive reflexes'], a: 1, e: 'GMA is a qualitative assessment. Quantity of movement is an insensitive indicator of brain impairment.' },
{ q: 'Writhing movements are typically seen from term until about…', o: ['2 weeks post-term','6–9 weeks post-term','20 weeks post-term','6 months post-term'], a: 1, e: 'Writhing GMs gradually disappear at 6–9 weeks post-term while fidgety movements emerge.' },
{ q: 'Fidgety movements are normally present from about 9 weeks until about…', o: ['12 weeks','15 weeks','20 weeks post-term','1 year'], a: 2, e: 'Fidgety movements usually occur from ~9 to ~20 weeks post-term, sometimes a little longer.' },
{ q: 'Which description best fits cramped-synchronised GMs?', o: ['Large-amplitude movements in chaotic order','Monotonous sequence of components','Rigid movements; limb and trunk muscles contract and relax almost simultaneously','Exaggerated fidgety movements'], a: 2, e: 'CS GMs lack smooth, fluent character; all limb and trunk muscles contract and relax almost simultaneously.' },
{ q: 'Which finding on its own has rather LOW predictive value?', o: ['Consistent cramped-synchronised GMs','Absent fidgety movements','Poor repertoire GMs','Persisting CS at 3 months'], a: 2, e: 'PR GMs are common and may be followed by normal fidgety movements; their predictive value is low.' },
{ q: 'Absence of fidgety movements is defined as fidgety movements never observed between…', o: ['6 and 9 weeks post-term','9 and 20 weeks post-term','term and 6 weeks','36 and 40 weeks PMA'], a: 1, e: 'F− means fidgety movements are never observed from 9 to 20 weeks post-term.' },
{ q: 'Preferred behavioural state for recording an infant older than 36 weeks PMA?', o: ['Quiet sleep','Active sleep','Active wakefulness (state 4) without crying','Crying (state 5)'], a: 2, e: 'State 4: eyes open, irregular breathing, movements present, no crying.' },
{ q: 'How should younger preterm infants (<36 wk PMA) be recorded?', o: ['Only when awake','During bouts of activity, whether awake or asleep','Only in quiet sleep','After a feed with a dummy'], a: 1, e: 'Behavioural states are not established before ~36 weeks, so record during activity bouts.' },
{ q: 'Why should the infant not suck on a dummy during recording?', o: ['It increases crying','It produces the sucking posture (flexed arms, fisting, extended legs)','It stops all movement','It causes hiccups'], a: 1, e: 'Dummy sucking produces a sucking posture; GM assessment is no longer possible.' },
{ q: 'Where should the camera be positioned?', o: ['At the foot of the cot at mattress level','Held by a parent','High above the infant, fixed on a tripod','Beside the infant at 45°'], a: 2, e: 'A fixed camera high above the supine infant gives an undisturbed view.' },
{ q: 'Approximately how long should a preterm recording be?', o: ['1–2 minutes','5 minutes','30–60 minutes, then select about 3 GM sequences','24 hours'], a: 2, e: 'Longer recordings ensure enough activity bouts; ≈3 GMs are then selected for assessment.' },
{ q: 'From the writhing period onwards, how much optimal recording usually suffices?', o: ['30 seconds','5–10 minutes','1 hour','3 hours'], a: 1, e: 'Five to ten minutes of optimal recording is usually sufficient.' },
{ q: 'Recording GMs is advised against during…', o: ['The first 3 days after birth','The first 3 weeks','Term age','Any time on ventilation'], a: 0, e: 'Early physiological and state instability interferes with proper observation.' },
{ q: 'Which should be avoided during the assessment (video review)?', o: ['Replaying at different speeds','Watching without sound','Assessing for hours without a break','Comparing with earlier recordings'], a: 2, e: 'Tiredness impairs Gestalt perception; take a break after about 45 minutes.' },
{ q: 'After watching many abnormal recordings, the manual advises…', o: ['Stopping for the day','Watching a criterion-standard normal recording to re-calibrate','Switching to the optimality score only','Increasing playback speed'], a: 1, e: 'Re-calibrate your Gestalt perception with a normal reference recording.' },
{ q: 'Maximum GM Optimality Score for preterm/writhing GMs?', o: ['8','16','28','42'], a: 1, e: 'Eight items; max 16, min 8.' },
{ q: 'In the 3–5 month Motor Optimality Score, normal fidgety movements score…', o: ['4','8','12','28'], a: 2, e: 'Item 1: normal 12, abnormal 4, absent 1. Total max 28, min 5.' },
{ q: 'Continual fidgety movements are scored as…', o: ['+/−','+','++','F−'], a: 2, e: '++ continual; + intermittent; +/− sporadic.' },
{ q: 'Which feature distinguishes subtle seizures from poor repertoire GMs?', o: ['Monotony','Extreme stereotypy with ocular/oral/autonomic phenomena','Slow speed','Small amplitude'], a: 1, e: 'PR is monotonous but never as stereotyped as seizures, and lacks ictal phenomena.' },
{ q: 'GMs in a preterm infant with severe sepsis (no brain lesion) typically look…', o: ['Cramped-synchronised','Chaotic','Sluggish and slow but still complex with rotations','Absent'], a: 2, e: 'Complexity and variability are preserved, distinguishing them from true PR.' },
{ q: 'A trajectory of PR at term followed by normal fidgety movements at 12 weeks most often means…', o: ['High risk of spastic CP','Likely normal outcome','Dyskinetic CP','Repeat at 6 months mandatory'], a: 1, e: 'Many infants with early PR normalise by the fidgety period and have normal outcomes — hence lower early specificity.' },
{ q: 'Minimum recommended GMA recordings for a trajectory include at least one between…', o: ['Birth and day 3','9 and 15 weeks post-term','6 and 12 months','24 and 26 weeks PMA'], a: 1, e: 'Plus 2–3 preterm recordings and one at term/early post-term.' },
{ q: 'Which environment issue impairs Gestalt perception on video?', o: ['Plain mattress','Mirror image / colourful patterned blanket / many toys','Quiet room','Light clothing'], a: 1, e: 'Mirrors, toys, caregivers and busy blankets distract the observer.' },
{ q: 'Which is TRUE about this app’s motion analysis?', o: ['It classifies GMs automatically','It replaces trained observers','It gives exploratory pixel-change indicators only; classification remains a trained Gestalt judgement','It is validated for CP diagnosis'], a: 2, e: 'The indicators help find activity bouts and check recordings; they do not judge complexity or fluency.' },
{ q: 'Which age should be used when interpreting GMs in a preterm-born infant?', o: ['Chronological age','Corrected (post-term / post-menstrual) age','Maternal age','Bone age'], a: 1, e: 'GM periods are defined by PMA and post-term (corrected) age.' }
];
