// Explicit teaching traits, independent of the geometric form of the model.
// Unlisted nectar/pollen offers are NOT MODELLED, not declared biologically absent.
const nectar=new Set(['crataegus_monogyna','prunus_spinosa','galium_odoratum',
 'trifolium_pratense','leucanthemum_vulgare','achillea_millefolium','cakile_maritima',
 'tripleurospermum_maritimum','limonium_vulgare','centaurea_cyanus',
 'tripolium_pannonicum','armeria_maritima','lythrum_salicaria']);
const pollenOnly=new Set(['papaver_rhoeas','sambucus_nigra','anemone_nemorosa','rosa_canina','nymphaea_alba']);
const seedFood=new Set(['quercus_robur','quercus_petraea','corylus_avellana','fagus_sylvatica']);
export const RESOURCE_REFERENCES={
 papaver_rhoeas:['https://pubmed.ncbi.nlm.nih.gov/17149583/','https://doi.org/10.1371/journal.pone.0158117'],
 sambucus_nigra:['https://doi.org/10.1007/s00425-019-03176-5']
};
export function plantResources(s){
 const id=typeof s==='string'?s:s?.id;
 return {nectar:nectar.has(id),pollen:nectar.has(id)||pollenOnly.has(id),
  floralStatus:nectar.has(id)?'nectar-and-pollen':pollenOnly.has(id)?'pollen-only':'not-modelled',
  leaves:!!s&&typeof s==='object'&&!['fungus','moss'].includes(s.type),seeds:seedFood.has(id)};
}
export function pollinatorCanFeed(p,s){
 const nectar=p.nectar??p.flower; // Legacy synthetic fixtures explicitly specify flower.
 return !!nectar||!!p.pollen&&(s.id==='apis_mellifera'||s.id?.startsWith('bombus_'));
}
