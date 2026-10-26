const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const MAX_ZIP = 12 * 1024 * 1024;
// Association is sequence-based only, not proof that a preceding action caused a failure.
function correlateFailures(timeline) {
  const items = Array.isArray(timeline) ? timeline : [];
  const output = [];
  for (let i = 0; i < items.length && output.length < 10; i++) {
    if (items[i].failed !== true) continue;
    output.push({
      failedAction: items[i].action,
      failedDurationMs: items[i].durationMs,
      precedingActions: items.slice(Math.max(0, i - 3), i).map(x => x.action),
      relation: 'preceded-in-trace',
      conclusion: 'unverified'
    });
  }
  return output;
}
function emptyTrace(reason) {return {actions:[],timeline:[],correlations:[],completedEvents:0,failedEvents:0,traceEntries:0,beforeEvents:0,reason};}
function extractTrace(zipPath) {
  let file;
  try { const stat=fs.statSync(zipPath); if(stat.size>MAX_ZIP)return emptyTrace('ZIP exceeds size limit'); file=fs.readFileSync(zipPath); }
  catch { return emptyTrace('ZIP unreadable'); }
  if (file.length > MAX_ZIP) return {actions:[],timeline:[],correlations:[],completedEvents:0,failedEvents:0,traceEntries:0,beforeEvents:0,reason:'ZIP exceeds size limit'};
  // Central directory supports ZIP data descriptors commonly used by Playwright.
  const min = Math.max(0, file.length - 65557);
  let eocd = -1;
  for(let i=file.length-22;i>=min;i--) if(file.readUInt32LE(i)===0x06054b50){eocd=i;break;}
  if(eocd<0)return {actions:[],timeline:[],correlations:[],completedEvents:0,failedEvents:0,traceEntries:0,beforeEvents:0,reason:'ZIP directory not found'};
  const declared=file.readUInt16LE(eocd+10);
  const directorySize=file.readUInt32LE(eocd+12);
  const directoryOffset=file.readUInt32LE(eocd+16);
  if(declared===65535||directorySize===0xffffffff||directoryOffset===0xffffffff||declared>200)return emptyTrace('Unsupported ZIP directory');
  if(directoryOffset>eocd||directorySize>eocd-directoryOffset)return emptyTrace('Invalid ZIP directory bounds');
  const entries=declared;
  let pos=directoryOffset, total=0;
  const actions=[],timeline=[];
  let traceEntries=0,beforeEvents=0,completedEvents=0,failedEvents=0;
  const pending=new Map();
  const sanitizeTime=v=>Number.isFinite(v)&&v>=0&&v<1e15?Math.round(v):null;
  for(let i=0;i<entries && pos+46<=file.length;i++){
    if(file.readUInt32LE(pos)!==0x02014b50)break;
    const method=file.readUInt16LE(pos+10), comp=file.readUInt32LE(pos+20);
    const uncomp=file.readUInt32LE(pos+24), nameLength=file.readUInt16LE(pos+28);
    const extra=file.readUInt16LE(pos+30), comment=file.readUInt16LE(pos+32);
    const offset=file.readUInt32LE(pos+42);
    const next=pos+46+nameLength+extra+comment;
    if(next>file.length||next>directoryOffset+directorySize)return emptyTrace('Invalid ZIP entry bounds');
    const name=file.subarray(pos+46,pos+46+nameLength).toString('utf8');
    pos=next;
    if(!name.endsWith('.trace'))continue;
    traceEntries++;
    if(comp>2*1024*1024 || uncomp>2*1024*1024 || (method!==0&&method!==8))continue;
    if(offset>file.length-30 || file.readUInt32LE(offset)!==0x04034b50)continue;
    const start=offset+30+file.readUInt16LE(offset+26)+file.readUInt16LE(offset+28);
    if(start>file.length||comp>file.length-start || total+uncomp>4*1024*1024)continue;
    try{
      const bytes=file.subarray(start,start+comp);
      const decoded=(method===8?zlib.inflateRawSync(bytes,{maxOutputLength:2*1024*1024}):bytes).toString('utf8');
      if(Buffer.byteLength(decoded,'utf8')>uncomp+4||total+Buffer.byteLength(decoded,'utf8')>4*1024*1024)continue;
      total+=Buffer.byteLength(decoded,'utf8');
      for(const line of decoded.split('\n')){
        // Keep inspecting events after reaching the action display limit.
        try{
          const event=JSON.parse(line);
          if(event.type==='after') {
            completedEvents++;
            const start=pending.get(event.callId);
            if(start){pending.delete(event.callId);const end=sanitizeTime(event.endTime);
              const durationMs=end!==null&&start.start!==null&&end>=start.start?Math.round(end-start.start):null;
              const failed=Boolean(event.error);if(failed)failedEvents++;
              if(timeline.length<40)timeline.push({action:start.action,durationMs,failed});
            } else if(event.error) failedEvents++;
          }
          if(event.type==='before') {
            beforeEvents++;
            // Playwright trace apiName may be e.g. "locator.click" or
            // "expect.toBeVisible"; some versions put action metadata in method.
            // Never send raw apiName, params, selector, or URL to browser.
            const raw=typeof event.apiName==='string'?event.apiName:'';
            const method=typeof event.method==='string'?event.method:'';
            const candidate=raw || method;
            const match=candidate.match(/(?:^|\.)(click|dblclick|fill|press|check|uncheck|selectOption|goto|reload|waitFor|toBeVisible|toHaveText|screenshot|hover|type|focus|blur|tap|setInputFiles|navigate)$/i);
            if(match) {
              const action=match[1];
              if(actions.length<40)actions.push({action});
              if((typeof event.callId==='string'||typeof event.callId==='number')&&pending.size<250)
                pending.set(event.callId,{action,start:sanitizeTime(event.startTime)});
            }
          }
        }catch{}
      }
    }catch{}
  }
  return {actions,timeline,correlations:correlateFailures(timeline),completedEvents,failedEvents,traceEntries,beforeEvents,reason:actions.length?'actions found':traceEntries===0?'No .trace entry found':beforeEvents===0?'No before events decoded':'Before events had no allowlisted API names'};
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
module.exports={extractActions,extractTrace,correlateFailures,preview};
