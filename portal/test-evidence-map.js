const path=require('node:path');
function mapEvidence(report, evidence, artifactRoot) {
 const indexed=new Map((evidence||[]).map(e=>[String(e.name||'').replace(/\\/g,'/'),e]));
 const matches=[],unmapped=[];
 let sequence=0;
 function walk(suites) {
  for(const suite of suites||[]){
   for(const spec of suite.specs||[]){
    for(const test of spec.tests||[]){
     const testKey=typeof test.id==='string'&&test.id.length>0?'pw:'+test.id:'report-index:'+sequence;
     sequence++;
     const match=(spec.title||'').match(/\b(TC-00[1-5]|DIAG-001)\b/);
     const testId=match?match[1]:null;
     const results=test.results||[];
     results.forEach((attempt,index)=>{
      for(const attachment of attempt.attachments||[]){
       if(typeof attachment.path!=='string'||!testId)continue;
       const relative=path.relative(artifactRoot,path.resolve(attachment.path)).replace(/\\/g,'/');
       const safe=relative && !relative.startsWith('../') && relative!=='..' && !path.isAbsolute(relative);
       const file=safe?indexed.get(relative):null;
       if(file)matches.push({testKey,testId,attempt:index,kind:typeof attachment.contentType==='string'&&attachment.contentType.startsWith('image/')?'screenshot':relative.endsWith('.zip')?'trace':relative.endsWith('.webm')?'video':'other',evidenceName:file.name,evidenceUrl:file.url,association:'playwright-json-attachment'});
       else unmapped.push({testKey,testId,attempt:index,reason:'Attachment not found in approved artifacts'});
      }
     });
    }
   }
   walk(suite.suites);
  }
 }
 walk(report?.suites);
 return {mapped:matches.slice(0,100),unmapped:unmapped.slice(0,30),source:'playwright-json-reporter',mappingMethod:'attachment-path',verifiedOwnership:matches.length>0};
}
module.exports={mapEvidence};
