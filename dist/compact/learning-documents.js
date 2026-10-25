import { MATERIALS,SOURCES } from './materials.js';
import { resourceHTML,responseLayout,lessonFormat,TEACHER_NOTES } from './lesson-layouts.js';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// A table header repeats the card identity on every printed continuation page.
// The nested content table and answer blocks keep their own fragmentation rules.
const documentStyle=`
@page{size:A4;margin:15mm}
*{box-sizing:border-box}
body{font:14px/1.5 system-ui;max-width:850px;margin:30px auto;padding:20px;color:#263c32}
article{border-top:1px solid #aaa;margin:30px 0}
h1,h2{font-family:Georgia;font-weight:400}
h2,h3{break-after:avoid}
h3{font-size:15px;margin:14px 0 6px}
p{margin:8px 0;orphans:3;widows:3}
a{color:#295842;overflow-wrap:anywhere}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:12px}
th,td{border:1px solid #83988a;padding:7px;text-align:left;vertical-align:top}
caption{text-align:left;font-weight:600}
thead{display:table-header-group}
tr,svg{break-inside:avoid}
.work-table td{height:47px}
.writing{height:91px;border-bottom:1px solid #8c9f92;background:repeating-linear-gradient(white,white 28px,#ccd6cf 29px,white 30px)}
svg{width:100%;max-height:200px}
.response-group,.review-group,.work-product,.table-scroll,.teacher-guidance,.card-end{break-inside:avoid}
.sources{font-size:12px;line-height:1.4}
.card-frame{margin:0;font:inherit}
.card-frame>thead>tr,.card-frame>tbody>tr{break-inside:auto}
.card-frame>thead>tr>td,.card-frame>tbody>tr>td{border:0;padding:0}
.card-frame>thead>tr>td{padding:12px 0 4px}
.card-frame h2{margin:8px 0}
.page-identity{display:flex;justify-content:space-between;gap:12px;font-size:12px;border-bottom:1px solid #83988a;padding-bottom:6px}
.page-identity span{text-align:right}
@media print{body{font-family:Arial,"Liberation Sans",sans-serif;margin:0;padding:0}article{break-before:page;margin:0;border:0}.cover{break-after:page}.writing{height:101px}}
`;

function renderCard(c,teacher){
 const notes=TEACHER_NOTES[c.id],expect=notes?[...c.expected,notes[0]]:c.expected;
 const response=responseLayout(c),flowEnd=lessonFormat(c)==='flows'&&response.includes('</svg>')?response.indexOf('</svg>')+6:0;
 // A flow diagram and its balance table are distinct working steps. They may
 // occupy separate pages, while each table and its reasoning space stay whole.
 const product=!teacher&&flowEnd?`<section class="work-product"><h3>Mein Arbeitsprodukt</h3>${response.slice(0,flowEnd)}</section><section class="response-group"><section class="work-product">${response.slice(flowEnd)}</section>`:`${teacher?'':'<section class="response-group">'}<section class="work-product"><h3>Mein Arbeitsprodukt</h3>${response}</section>`;
 return `<article data-card="${c.id}" data-product="${lessonFormat(c)}"><table class="card-frame"><thead><tr><td><div class="page-identity"><strong>${c.id} · Ranger Kompakt</strong><span>${teacher?'Lehrkräftefassung':'Arbeitsblatt'} / Fortsetzung</span></div><h2>${e(c.title)}</h2></td></tr></thead><tbody><tr><td>
 <p>${e(c.level)} · ${e(c.activity)}</p><h3>Material / Herkunft</h3><p>${e(c.data)}</p>${resourceHTML(c,e)}
 <h3>Auftrag</h3><p>${e(c.task)}</p>${c.helps?'<h3>Hilfen</h3><ol>'+c.helps.map(h=>'<li>'+e(h)+'</li>').join('')+'</ol>':''}
 ${product}
 ${teacher?'<section class="review-group"><section class="teacher-guidance"><h3>Erwartung, Alternativen und Rückmeldung</h3><ul>'+expect.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul><p>Fachlich begründete andere Formulierungen und Unsicherheit zulassen; offene Texte nicht per Stichwort benoten.</p><p><strong>Typische Fehlvorstellung:</strong> '+e(c.pitfall||notes?.[1]||'Programmregel mit unabhängig bestätigter Naturbeobachtung gleichsetzen.')+'</p><p><strong>Rückmeldung:</strong> '+e(c.feedback||notes?.[2]||'Eine Aussage einem konkreten Beleg und seiner Herkunft zuordnen lassen.')+'</p></section>':''}
 <section class="card-end"><p><strong>Grenze:</strong> ${e(c.limit)}</p><div class="sources">${c.sources.map(k=>`<p>${e(SOURCES[k].title)}: <a href="${e(SOURCES[k].url)}">${e(SOURCES[k].url)}</a></p>`).join('')}</div><p>Leistungsnachweis: □ noch nicht erhoben □ Arbeitsprodukt vorhanden □ fachlich besprochen. Datum / Rückmeldung: __________</p></section></section>
 </td></tr></tbody></table></article>`;
}

export function renderLessonDocument(teacher=false){
 return `<!doctype html><html lang="de"><meta charset="utf-8"><title>Ranger Kompakt · ${teacher?'Lehrkräfte':'Arbeitsblätter'}</title><style>${documentStyle}</style><body>
 <section class="cover"><h1>Ranger Kompakt · ${teacher?'Lehrkräftefassung mit Erwartung und Rückmeldung':'Arbeitsblätter und Quellen'}</h1>
 <p>Gestaltetes Modell, keine Naturmessung. Freie Erklärungen fachlich besprechen; keine automatische Stichwortbenotung. Pro Kernfamilie 20–35 Minuten als ungeprüftes Planungsziel. Kein Gesamtsammelzwang.</p>
 <p>Die drei Ebenen getrennt erfassen: 1 curricular zugeordnet; 2 Lernangebot vorhanden; 3 konkrete Leistung erhoben/besprochen. Eine vorhandene Karte erfüllt nur Ebene 2. Ebene 3 braucht das ausgefüllte Arbeitsprodukt und eine fachliche Rückmeldung.</p>
 <p>Abgleich mit den Originalen der Fachanforderungen Biologie SH 2026 und des Leitfadens 2017; die Ökologieseiten 27–28 des schulinternen ETS-Plans 2025/26 wurden anhand der Original-PDF sowie bereitgestellter Originalseiten-Abbildungen abgeglichen. Andere Jahrgänge sind damit nicht vollständig geprüft. Der Leitfaden enthält einen möglichen Unterrichtsgang der Einführungsphase. Lehrplanbezug, Lernangebot und tatsächliche Leistung bleiben getrennt. Virtuelle Tests bescheinigen keine reale Geräteführung oder Exkursion.</p>
 <p>Mehrseitige Karten tragen auf jeder Seite dieselbe Kartenkennung im Kopf „Arbeitsblatt / Fortsetzung“ beziehungsweise „Lehrkräftefassung / Fortsetzung“. Antworttabellen und die abschließende Rückmeldung gehören jeweils zusammen.</p>
 <h2>Unterrichtspilot: noch durchzuführen</h2><p>Tatsächliches Schulgerät, installierte System- und Browserversion vor dem Pilot eintragen; keine pauschale iPad-/Safari-Freigabe. Ein früher genannter Gerätename ist kein geprüftes Profil. Im Pilot anonym Bearbeitungszeit, Hilfebedarf, Aufgabenverständnis, neue Transferantwort und Ausfälle erfassen. Keine Namen, Anmeldung oder Cloudübermittlung. Reale Exkursion und Gerätekompetenz gesondert prüfen.</p></section>
 ${MATERIALS.map(c=>renderCard(c,teacher)).join('')}</body></html>`;
}
