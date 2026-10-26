import { TAXA } from './taxa.js';

// Metres. These are explicit design dimensions, not measured local individuals.
// Group entries deliberately retain their coarser resolution.
const profiles={
 fagus_sylvatica:['tree',10,'smooth-bark','elliptic-leaf','ectomycorrhiza'],
 quercus_robur:['tree',9,'lobed-leaf','short-petiole','stalked-acorn'],
 galium_odoratum:['plant',.25,'leaf-whorls','narrow-leaves','no-summer-flowers'],
 urtica_dioica:['plant',.9,'opposite-leaves','serrated-edge','stinging-hairs'],
 rubus_fruticosus:['plant',1.25,'arching-prickles','compound-leaves','aggregate-fruit'],
 trifolium_pratense:['plant',.3,'three-leaflets','pink-floret-head','pollen-contact'],
 fomes_fomentarius:['fungus',.22,'hoof-bracket','grey-rings','pores-below'],
 capreolus_capreolus:['mammal',1.12,'slender-legs','white-rump','short-tail'],
 vulpes_vulpes:['mammal',1.1,'pointed-muzzle','bushy-tail','dark-legs'],
 apodemus_sylvaticus:['mammal',.095,'large-eyes','long-tail','round-ears'],
 dendrocopos_major:['bird',.24,'white-shoulders','red-vent','stiff-tail'],
 garrulus_glandarius:['bird',.34,'blue-barred-wing','pale-rump','pink-brown-body'],
 parus_major:['bird',.14,'white-cheeks','yellow-belly','black-stripe'],
 bombus_lapidarius:['insect',.017,'hairy-body','red-tail','six-legs'],
 aglais_io:['insect',.06,'four-eyespots','club-antennae','nettle-caterpillar'],
 coccinella_septempunctata:['insect',.007,'seven-spots','six-legs','aphid-prey'],
 aphidoidea:['insect',.003,'siphunculi','six-legs','plant-host'],
 lumbricidae:['worm',.18,'segmented-body','adult-clitellum','litter-pulling'],
 ixodes_ricinus:['arachnid',.004,'eight-legs','adult-female','attached-host'],
 halimione_portulacoides:['plant',.65,'fleshy-opposite-leaves','silvery-shrub','branched-wood'],
 salicornia_europaea:['plant',.3,'segmented-shoot','reduced-leaves','succulent'],
 festuca_rubra:['plant',.55,'fine-rolled-leaves','narrow-panicle','upper-marsh'],
 sporobolus_anglicus:['plant',.95,'broad-grass-leaves','upright-tuft','spike-branches'],
 puccinellia_maritima:['plant',.4,'fine-grey-leaves','open-panicle','lower-marsh'],
 limonium_vulgare:['plant',.45,'basal-rosette','branched-purple-flowers','marsh'],
 recurvirostra_avosetta:['bird',.43,'upcurved-bill','black-white-plumage','sweeping'],
 platalea_leucorodia:['bird',.85,'spatulate-tip','pale-body','sweeping'],
 tringa_totanus:['bird',.28,'red-legs','red-bill-base','probing'],
 haematopus_ostralegus:['bird',.43,'straight-orange-bill','black-white-body','shell-opening'],
 cerastoderma_edule:['bivalve',.025,'radial-ribs','paired-valves','shallow-burial'],
 mytilus_edulis:['bivalve',.045,'elongate-dark-shell','byssus','attached-bed'],
 arenicola_marina:['worm',.2,'casts-and-funnel','segmented-body','burrow-section'],
 hediste_diversicolor:['worm',.065,'paired-parapodia','segmented-body','tube'],
 crangon_crangon:['crustacean',.035,'long-antennae','segmented-abdomen','swimmerets'],
 carcinus_maenas:['crustacean',.055,'wide-carapace','two-claws','sideways-walk'],
 peringia_ulvae:['gastropod',.004,'coiled-shell','grazing-foot','small-size']
};
export const CATALOG=Object.fromEntries(TAXA.map(t=>[t.id,{...t,kind:profiles[t.id][0],length:profiles[t.id][1],diagnostics:profiles[t.id].slice(2),dimensionStatus:'didactic design in metres; species size source not independently calibrated',identificationLimit:['aphidoidea','lumbricidae','rubus_fruticosus','festuca_rubra','salicornia_europaea','urtica_dioica'].includes(t.id)?'group-or-aggregate':'model comparison; natural identification may need more characters'}]));
export const WINDOWS=Object.freeze({summer:{date:'2026-08-25',label:'Spätsommer · Grundszene'},autumn:{date:'2026-10-05',label:'Herbst · Eicheln und Verstecken'},dusk:{date:'2026-08-25 20:00',label:'Dämmerung · Fuchs und Waldmaus'},spring:{date:'2026-05-10',label:'Frühjahr · Kommunikationsmodell'}});
export const FUNCTIONAL_GROUPS=Object.freeze([
 {id:'phytoplankton',name:'Phytoplankton',role:'Photosynthese im Wasser; Muschel-Nahrung',view:'water-section'},
 {id:'benthic-diatoms',name:'Benthische Kieselalgen',role:'Belag am Sediment; Schnecken-Nahrung',view:'sediment-section'},
 {id:'wood-insect-larvae',name:'Holzbewohnende Insektenlarven',role:'Spechtressource im Holz; Sammelgruppe',view:'wood-section'},
 {id:'ectomycorrhiza',name:'Ektomykorrhizapilze',role:'Pilz erhält Zucker; Baum erhält Mineralstoffe/Wasser',view:'root-section'},
 {id:'saprotrophs',name:'Saprotrophe Pilze und Bakterien',role:'Abbau und mikrobielle Mineralisierung; eigene Atmung',view:'soil-section'},
 {id:'nitrogen-process-groups',name:'N-Mikroorganismen nach Prozess',role:'Fixierung, Ammonifikation, Nitrifikation und Denitrifikation getrennt',view:'nitrogen-section'}
]);
export const KEY_OPTIONS={
 galium_odoratum:{correct:['leaf-whorls','narrow-leaves'],wrong:['opposite-leaves','pink-floret-head'],limits:['no-flowers','insufficient-detail'],groups:['galium-group']},
 urtica_dioica:{correct:['opposite-leaves','serrated-edge'],wrong:['leaf-whorls','succulent'],limits:['insufficient-detail'],groups:['urtica-group']},
 fagus_sylvatica:{correct:['smooth-bark','elliptic-leaf','smooth-edge'],wrong:['lobed-leaf','rough-bark'],limits:['insufficient-detail'],groups:['broadleaf-tree']},
 quercus_robur:{correct:['lobed-leaf','short-petiole'],wrong:['elliptic-leaf','leaf-whorls'],limits:['no-fruit','insufficient-detail'],groups:['oak-group']}
};
export const FEATURE_LABELS={
 'smooth-edge':'Glatter Blattrand','rough-bark':'Tiefrissige Borke','long-petiole':'Langer Blattstiel',
 'leaf-whorls':'Mehrere Blätter stehen im Quirl','narrow-leaves':'Schmale lanzettliche Blätter','opposite-leaves':'Blätter stehen paarweise gegenüber','serrated-edge':'Deutlich gesägter Blattrand','pink-floret-head':'Rosaroter Kopf aus Einzelblüten','succulent':'Fleischige gegliederte Sprosse','smooth-bark':'Glatte graue Rinde','elliptic-leaf':'Elliptisches, kaum gezähntes Blatt','lobed-leaf':'Mehrfach gelapptes Blatt','short-petiole':'Sehr kurzer Blattstiel','spatulate-tip':'Löffelförmiges Schnabelende','no-flowers':'Keine Blüten für die Feinbestimmung sichtbar','no-fruit':'Keine reifen Früchte für den Vergleich','insufficient-detail':'Feinmerkmale in dieser Ansicht nicht ausreichend aufgelöst'
};
