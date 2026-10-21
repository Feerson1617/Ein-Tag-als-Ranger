const areas=(habitats,...species)=>habitats.map(habitat=>({id:`${habitat}:${species[0]}`,habitat,species}));
const land=['forest','meadow','city','farmland'];
export const INTERACTION_CASES={
 predation:[...areas(['forest','city'],'fox','apodemus_sylvaticus'),...areas(['meadow','farmland'],'falco_tinnunculus','microtus_arvalis'),...areas(['lake'],'esox_lucius','rutilus_rutilus'),...areas(['beach','wadden'],'carcinus_maenas','cerastoderma_edule'),...areas(['saltmarsh'],'tringa_totanus','hediste_diversicolor')],
 competition:[...areas(['forest'],'parus_major','cyanistes_caeruleus'),...areas(['meadow'],'hare','oryctolagus_cuniculus'),...areas(['city'],'passer_domesticus','fringilla_coelebs'),...areas(['farmland'],'columba_palumbus','fringilla_coelebs'),...areas(['lake'],'anas_platyrhynchos','fulica_atra'),...areas(['beach','wadden','saltmarsh'],'calidris_alpina','charadrius_hiaticula')],
 mutualism:[...areas(land,'bombus_lapidarius','trifolium_pratense'),...areas(['city'],'apis_mellifera','achillea_millefolium'),...areas(['lake'],'bombus_terrestris','lythrum_salicaria'),...areas(['beach'],'bombus_terrestris','cakile_maritima'),...areas(['wadden','saltmarsh'],'bombus_terrestris','limonium_vulgare')],
 herbivory:[...areas(land,'capreolus_capreolus','corylus_avellana'),...areas(['lake'],'cygnus_olor','nymphaea_alba'),...areas(['beach'],'anser_anser','festuca_rubra'),...areas(['wadden'],'branta_bernicla','elymus_athericus'),...areas(['saltmarsh'],'branta_leucopsis','puccinellia_maritima')],
 dispersal:[...areas(['forest','meadow','farmland'],'garrulus_glandarius','quercus_robur'),...areas(['city'],'sciurus_vulgaris','quercus_robur')],
 deposit:[...areas(land,'lumbricus_terrestris'),...areas(['lake'],'asellus_aquaticus'),...areas(['beach'],'talitrus_saltator'),...areas(['wadden'],'arenicola_marina'),...areas(['saltmarsh'],'orchestia_gammarellus')],
 filtering:[...areas(['forest','lake','city'],'anodonta_anatina'),...areas(['beach','wadden','saltmarsh'],'mytilus_edulis')]
};
export function assignFocus(quests){const focus={};for(const q of quests){q.habitat=q.encounters[0].habitat;q.species=[...new Set(q.encounters.flatMap(c=>c.species))];for(const id of q.species){if(focus[id]&&focus[id]!==q.kind)throw Error(`Two educational focuses for ${id}`);focus[id]=q.kind;}}return focus;}
