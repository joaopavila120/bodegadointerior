(() => {
  const results=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
  for(const id of ['vila','serra','sc']){
    const M=WORLD_MAPS[id],d=worldDressing(M),trees=d.props.filter(p=>p.sheet==='nature'&&p.index<3);
    for(const r of worldLandmarkClearings(id)){
      check(!trees.some(p=>p.x+p.w/2>r.x-12&&p.x-p.w/2<r.x+r.w+12&&p.y>r.y-12&&p.y-p.h<r.y+r.h+12),'Landmark covered in '+id);
      check(!d.clear(r.x+r.w/2,r.y+r.h,300,430),'Fixed tree permitted at landmark in '+id);
    }
    check(trees.length>10,'Remaining landscape lost in '+id);
    const positions=JSON.stringify(d.props);
    worldDressingCache.delete(id);
    check(JSON.stringify(worldDressing(M).props)===positions,'Landscape changed after regeneration in '+id);
  }
  check(WORLD_MAPS.vila.canWalk(300,917)&&WORLD_MAPS.vila.canWalk(530,917),'Pier approach blocked');
  return results;
})()
