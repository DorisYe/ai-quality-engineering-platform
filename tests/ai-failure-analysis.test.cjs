const test = require('node:test');
const assert = require('node:assert/strict');
const { analyze, buildInput } = require('../portal/ai-failure-analysis');

test('only allowlisted text is sent to model', () => {
  const result = buildInput({ testId:'TC-001',title:'failure',actualResult:'bad',expectedResult:'good',evidence:[{secret:'file'}],reviewNotes:'private notes'});
  assert.deepEqual(Object.keys(result),['testId','title','actualResult','expectedResult']);
  assert.ok(!JSON.stringify(result).includes('private notes'));
});
test('missing key disables AI, no network request', async () => {
  await assert.rejects(analyze({}, { apiKey:'',fetchFn:()=>{throw Error('must not call');} }),/AI is disabled/);
});
test('mocked Responses API produces nonbinding analysis', async () => {
  let request;
  const result = await analyze({testId:'TC-001',actualResult:'timeout'},{
    apiKey:'test-key',model:'test-model',
    fetchFn:async (_url,opts)=>{
      request=JSON.parse(opts.body);
      return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify({
        suggestedCategory:'Flaky test',hypothesis:'May be timing related',nextCheck:'Inspect timeline'
      })}]}]})};
    }
  });
  assert.equal(request.store,false);
  assert.equal(result.suggestedCategory,'Flaky test');
  assert.equal(result.requiresHumanReview,true);
  assert.equal(result.confidence,'unverified');
});
test('provider error returns failure rather than invented analysis', async () => {
  await assert.rejects(analyze({}, {apiKey:'test-key', fetchFn:async()=>({ok:false,status:429})}), /HTTP 429/);
});
