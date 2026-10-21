import { SPECIES_PHOTOS } from './species-photos.js?revision=120';
import { assetUrl } from './asset-url.js?revision=120';
export function speciesPhotoHtml(s,discovered,escape){
 if(!discovered)return '';
 const p=SPECIES_PHOTOS[s.id];if(!p)return '<p class="mini-note">Ein geprüftes Artenfoto wird noch ergänzt.</p>';
 return `<figure class="species-photo"><img src="${escape(assetUrl(p.url))}" alt="Echte Aufnahme: ${escape(s.common)} (${escape(s.latin)})" decoding="async" loading="lazy"><figcaption>Referenzfoto · fürs Feldbuch verkleinert. Aussehen und Entwicklungsstadium können vom Spielmodell abweichen.${s.type==='plant'||s.type==='tree'||s.type==='shrub'||s.type==='herb'||s.type==='flower'||s.type==='grass'||s.type==='moss'||s.type==='fungus'?'':' Bei Mollusken ist teils die Schale abgebildet.'}<br><a href="${escape(p.source)}" target="_blank" rel="noopener">Foto: ${escape(p.author)} ↗</a> · <a href="${escape(p.licenseUrl||p.source)}" target="_blank" rel="noopener">${escape(p.license)}</a></figcaption></figure>`;
}
