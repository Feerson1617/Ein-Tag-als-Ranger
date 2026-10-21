// Static obstacles are looked up locally, including the swept movement box.
// Records carry query stamps, so overlapping cells need no per-query Set.
export class BlockerGrid{
 constructor(source,size=8){this.source=source;this.length=source.length;this.size=size;this.cells=new Map();this.stamp=0;
  for(const p of source){const c=p.rotation?Math.cos(p.rotation):1,s=p.rotation?Math.sin(p.rotation):0,ex=p.halfX==null?p.r:Math.abs(c)*p.halfX+Math.abs(s)*p.halfZ,ez=p.halfX==null?p.r:Math.abs(s)*p.halfX+Math.abs(c)*p.halfZ,record={p,stamp:0};
   for(let x=Math.floor((p.x-ex)/size);x<=Math.floor((p.x+ex)/size);x++)for(let z=Math.floor((p.z-ez)/size);z<=Math.floor((p.z+ez)/size);z++){const key=`${x},${z}`;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(record);}
  }
 }
 near(minX,minZ,maxX,maxZ){const result=[],stamp=++this.stamp;for(let x=Math.floor(minX/this.size);x<=Math.floor(maxX/this.size);x++)for(let z=Math.floor(minZ/this.size);z<=Math.floor(maxZ/this.size);z++){const cell=this.cells.get(`${x},${z}`);if(cell)for(const record of cell)if(record.stamp!==stamp){record.stamp=stamp;result.push(record.p);}}return result;}
}
