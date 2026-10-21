// Keep the forest's central footprint. Compress only the outer, open-land bands.
// These transforms place habitats; organism anatomy and deck width remain life size.
export const LANDSCAPE_SCALE = .62;
export const AREA_RATIO = LANDSCAPE_SCALE ** 2;
export const spaced = n => n * LANDSCAPE_SCALE;
export const FOREST_CORE = 73;
export const OPENLAND_COMPRESSION = .46;
export const AUTHORED_CENTERS = {forest:{x:0,z:0},meadow:{x:0,z:140},city:{x:-150,z:0},lake:{x:150,z:0},beach:{x:130,z:-150},wadden:{x:-15,z:-175},farmland:{x:-150,z:140},saltmarsh:{x:-105,z:-150}};
export const layoutAxis = n => spaced(Math.sign(n)*(Math.min(Math.abs(n),FOREST_CORE)+Math.max(0,Math.abs(n)-FOREST_CORE)*OPENLAND_COMPRESSION));
export const authoredAxis = n => {const v=Math.abs(n)/LANDSCAPE_SCALE;return Math.sign(n)*(Math.min(v,FOREST_CORE)+Math.max(0,v-FOREST_CORE)/OPENLAND_COMPRESSION);};
export const layoutSpan = (a,b) => layoutAxis(b)-layoutAxis(a);
export const layoutPoint = p => ({...p, x:layoutAxis(p.x), z:layoutAxis(p.z), ...(p.r == null ? {} : {r:Math.min(layoutSpan(p.x-p.r,p.x+p.r),layoutSpan(p.z-p.r,p.z+p.r))/2,rx:layoutSpan(p.x-p.r,p.x+p.r)/2,rz:layoutSpan(p.z-p.r,p.z+p.r)/2})});
export function localPoint(id,p){const c=AUTHORED_CENTERS[id];return {...p,x:layoutAxis(c.x+p.x)-layoutAxis(c.x),z:layoutAxis(c.z+p.z)-layoutAxis(c.z)};}
export function authoredLocal(id,x,z){const c=AUTHORED_CENTERS[id];return {x:authoredAxis(x+layoutAxis(c.x))-c.x,z:authoredAxis(z+layoutAxis(c.z))-c.z};}
export function habitatArea(id){const c=AUTHORED_CENTERS[id];return layoutSpan(c.x-73,c.x+73)*layoutSpan(c.z-73,c.z+73)/(146*146);}
export const WORLD_BOUNDS = {west:layoutAxis(-219), east:layoutAxis(219), north:layoutAxis(207), south:layoutAxis(-235), sea:layoutAxis(-211)};
export const VIEW_DISTANCE = 135;
export const VIEW_FOG = .014;

// The crest is outside the playable fence. Slopes, not a flat wall, close landward views.
export function boundaryRise(x,z) {
 const coastFade=Math.max(0,Math.min(1,(z-layoutAxis(-190))/layoutSpan(-190,-125)));
 const side=5.7*Math.exp(-(((Math.abs(x)-layoutAxis(231))/9.5)**2))*coastFade;
 const north=6.2*Math.exp(-(((z-layoutAxis(222))/11)**2));
 return Math.max(side,north);
}

// Shared by terrain, vegetation and animal spawning: no hidden third pond.
export const AUTHORED_PONDS=[{x:27,z:12,r:13,habitat:'forest'},{x:-35,z:-29,r:9,habitat:'forest'},{x:175,z:12,r:31,habitat:'lake'},{x:-125,z:30,r:9,habitat:'city'}];
