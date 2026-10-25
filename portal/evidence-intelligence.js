const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const MAX_ZIP = 12 * 1024 * 1024;
function extractTrace(zipPath) {
  const file = fs.readFileSync(zipPath);
  if (file.length > MAX_ZIP) return {actions:[], traceEntries:0, beforeEvents:0, reason:'ZIP exceeds size limit'};
  // Central directory supports ZIP data descriptors commonly used by Playwright.
  const min = Math.max(0, file.length - 65557);
  let eocd = -1;
  for(let i=file.length-22;i>=min;i--) if(file.readUInt32LE(i)===0x06054b50){eocd=i;break;}
  if(eocd<0)return {actions:[], traceEntries:0, beforeEvents:0, reason:'ZIP directory not found'};
  const entries=Math.min(file.readUInt16LE(eocd+10),200);
  let pos=file.readUInt32LE(eocd+16), total=0;
  const actions=[];
  let traceEntries=0,beforeEvents=0;
  for(let i=0;i<entries && pos+46<=file.length;i++){
    if(file.readUInt32LE(pos)!==0x02014b50)break;
    const method=file.readUInt16LE(pos+10), comp=file.readUInt32LE(pos+20);
    const uncomp=file.readUInt32LE(pos+24), nameLength=file.readUInt16LE(pos+28);
    const extra=file.readUInt16LE(pos+30), comment=file.readUInt16LE(pos+32);
    const offset=file.readUInt32LE(pos+42);
    const name=file.subarray(pos+46,pos+46+nameLength).toString('utf8');
    pos+=46+nameLength+extra+comment;
    if(!name.endsWith('.trace'))continue;
    traceEntries++;
    if(comp>2*1024*1024 || uncomp>2*1024*1024 || (method!==0&&method!==8))continue;
    if(offset+30>file.length || file.readUInt32LE(offset)!==0x04034b50)continue;
    const start=offset+30+file.readUInt16LE(offset+26)+file.readUInt16LE(offset+28);
    if(start+comp>file.length || total+uncomp>4*1024*1024)continue;
    try{
      const bytes=file.subarray(start,start+comp);
      const decoded=(method===8?zlib.inflateRawSync(bytes,{maxOutputLength:2*1024*1024}):bytes).toString('utf8');
      total+=decoded.length;
      for(const line of decoded.split('\n')){
        if(actions.length>=40)break;
        try{
          const event=JSON.parse(line);
          if(event.type==='before') {
            beforeEvents++;
            if(typeof event.apiName==='string' && /^(page|locator|frame|browserContext|expect|Page|Locator|Frame|BrowserContext|Expect)\.[a-zA-Z]+$/.test(event.apiName))
              actions.push({action:event.apiName});
          }
        }catch{}
      }
    }catch{}
  }
  return {actions,traceEntries,beforeEvents,reason:actions.length?'actions found':traceEntries===0?'No .trace entry found':beforeEvents===0?'No before events decoded':'Before events had no allowlisted API names'};
}
function extractActions(zipPath) { return extractTrace(zipPath).actions; }

function preview(run, evidence, zipReader=extractActions) {
  const files=(evidence||[]).map(e=>String(e.name||''));
  const count=extension=>files.filter(n=>n.toLowerCase().endsWith(extension)).length;
  const tests=(run.summary?.tests||[]).slice(0,20).map(t=>({
    id:String(t.id||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50),
    status:['expected','unexpected','flaky','skipped'].includes(t.status)?t.status:'unknown',
    durationMs:Number.isFinite(t.durationMs)?Math.max(0,Math.round(t.durationMs)):0
  }));
  return { source:'local-evidence', uploaded:false, counts:{screenshots:count('.png'),videos:count('.webm'),traces:count('.zip')},tests, actions:[], notes:'Only allowlisted action names and status metadata are shown; no raw ZIP or sensitive logs are transmitted.' };
}
module.exports={extractActions,extractTrace,preview};
