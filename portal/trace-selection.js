function selectMappedTraces(mapping, evidence, limit=10) {
 const approved=new Set((evidence||[]).map(x=>x.name));
 const seen=new Set();
 const selected=[];
 for(const entry of mapping?.mapped||[]){
  if(entry.kind!=='trace'||typeof entry.evidenceName!=='string'||!entry.evidenceName.toLowerCase().endsWith('.zip')||!approved.has(entry.evidenceName))continue;
  const key=entry.testKey+':'+entry.attempt+':'+entry.evidenceName;
  if(seen.has(key))continue;
  seen.add(key);
  selected.push({testKey:entry.testKey,testId:entry.testId,attempt:entry.attempt,evidenceName:entry.evidenceName});
  if(selected.length>=limit)break;
 }
 const unowned=(evidence||[]).filter(e=>e.name.toLowerCase().endsWith('.zip')&&!selected.some(s=>s.evidenceName===e.name)).length;
 return {selected,unowned};
}
module.exports={selectMappedTraces};
