const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','portal','public','index.html'),'utf8');
test('Evidence Dashboard compiles and retains local preview endpoint',()=>{
 const match=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(match);assert.doesNotThrow(()=>new vm.Script(match[1]));
 assert.ok(html.includes("fetch('/api/runs/'+id+'/evidence-preview')"));
 assert.ok(html.includes('renderEvidenceBoard(data.preview,previewOutput)'));
});
test('Dashboard contains attempt/evidence/failure panels and collapsible diagnostics',()=>{
 for(const label of ['Test attempts','Evidence and timeline','Failure assessment','Technical diagnostics (safe metadata)'])assert.ok(html.includes(label));
 assert.ok(html.includes("document.createElement('details')"));
 assert.ok(html.includes('root cause is not established'));
});
test('Dashboard outputs dynamic data via textContent rather than untrusted HTML interpolation',()=>{
 assert.ok(html.includes('const element=(tag,text)=>'));
 assert.ok(html.includes('node.textContent=text'));
 assert.ok(!html.includes('previewOutput.innerHTML'));
});
