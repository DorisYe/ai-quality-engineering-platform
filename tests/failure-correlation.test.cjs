const test=require('node:test');
const assert=require('node:assert/strict');
const {correlateFailures}=require('../portal/evidence-intelligence');

test('correlates a failed action with three preceding safe action types',()=>{
 const items=[
  {action:'goto',durationMs:10,failed:false},
  {action:'click',durationMs:20,failed:false},
  {action:'fill',durationMs:30,failed:false},
  {action:'press',durationMs:40,failed:false},
  {action:'toBeVisible',durationMs:50,failed:true}
 ];
 const matches=correlateFailures(items);
 assert.deepEqual(matches,[{
  failedAction:'toBeVisible',failedDurationMs:50,
  precedingActions:['click','fill','press'],
  relation:'preceded-in-trace',conclusion:'unverified'
 }]);
});
test('no failed trace actions produces no guessed correlation',()=>{
 assert.deepEqual(correlateFailures([{action:'goto',failed:false}]),[]);
});
test('does not echo raw log, URL, selectors or error text',()=>{
 const input=[{action:'goto',failed:false,url:'https://secret',selector:'TOKEN'}, {action:'click',failed:true,error:'PRIVATE SECRET',durationMs:5}];
 const result=correlateFailures(input);
 assert.equal(result.length,1);
 assert.ok(!JSON.stringify(result).includes('PRIVATE'));
 assert.ok(!JSON.stringify(result).includes('secret'));
 assert.ok(!JSON.stringify(result).includes('TOKEN'));
});
