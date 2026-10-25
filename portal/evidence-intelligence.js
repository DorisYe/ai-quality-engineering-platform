const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const MAX_ZIP = 12 * 1024 * 1024;
function extractActions(zipPath) {
  const file = fs.readFileSync(zipPath);
  if (file.length > MAX_ZIP) return [];
  // Walk ZIP local-file headers; Playwright normally writes trace entries with data descriptors,
  // so this lightweight scanner intentionally skips unsupported archives.
  const actions = [];
  for (let i=0;i+30<file.length;) {
    if (file.readUInt32LE(i)!==0x04034b50) { i++;continue; }
    const flag=file.readUInt16LE(i+6), method=file.readUInt16LE(i+8);
    const compressed=file.readUInt32LE(i+18), uncompressed=file.readUInt32LE(i+22);
    const nameSize=file.readUInt16LE(i+26), extra=file.readUInt16LE(i+28);
    const name=file.subarray(i+30,i+30+nameSize).toString('utf8');
    const begin=i+30+nameSize+extra;
    if (flag&8 || compressed>1024*1024 || uncompressed>1024*1024 || begin+compressed>file.length) { i=begin+Math.max(1,compressed);continue; }
    if (name.endsWith('.trace') && (method===0||method===8)) {
      try {
        const bytes=file.subarray(begin,begin+compressed);
        const decoded=(method===8?zlib.inflateRawSync(bytes,{maxOutputLength:1024*1024}):bytes).toString('utf8');
        for(const line of decoded.split('\n')) {
          if(actions.length>=40)break;
          try {
            const event=JSON.parse(line);
            if(event.type==='before' && typeof event.apiName==='string') {
              // Never include params, selectors, URLs, page text, network bodies or stack traces.
              const apiName=event.apiName;
              if (/^(page|locator|frame|browserContext|expect)\.[a-zA-Z]+$/.test(apiName))
                actions.push({action:apiName});
            }
          }catch{}
        }
      }catch{}
    }
    i=begin+Math.max(1,compressed);
  }
  return actions;
}
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
module.exports={extractActions,preview};
