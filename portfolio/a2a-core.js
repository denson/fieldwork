(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.A2ALab=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const defaults={budget:50,price:40,fee:0,recurring:false,scopeMatches:true,authorityValid:true,payment:'not-requested',deliveryAccepted:false};
  function assess(value){
    const d={...defaults,...value}, reasons=[];
    const money=['budget','price','fee'].every(k=>typeof d[k]==='number'&&Number.isFinite(d[k])&&d[k]>=0&&d[k]<=1000000);
    if(!money)return {status:'invalid',title:'Check the amounts',reasons:['Use nonnegative, finite dollar amounts up to $1,000,000.'],total:null,canProceed:false};
    const total=Math.round((d.price+d.fee)*100)/100;
    if(total>Math.round(d.budget*100)/100)reasons.push('The total, including fees, exceeds the approved limit.');
    if(d.recurring)reasons.push('The approved task is one purchase. A recurring commitment needs new approval.');
    if(d.scopeMatches!==true)reasons.push('The offer does not match the approved seller, deliverable or other constraints.');
    if(d.authorityValid!==true)reasons.push('Purchase and payment authority has not been verified. A budget alone is insufficient.');
    if(reasons.length){
      if(d.payment==='unknown')reasons.push('The existing payment outcome is also unknown. Reconcile that transaction before any retry; changing the terms does not resolve it.');
      if(d.payment==='succeeded')reasons.push('A payment is already recorded in this scenario. Review that transaction and the authorization mismatch; do not submit another payment.');
      return {status:'needs-approval',title:d.payment==='succeeded'?'Review the authority mismatch':'Pause before payment',reasons,total,canProceed:false};
    }
    if(d.payment==='unknown')return {status:'unknown',title:'Reconcile the existing payment',reasons:['Check the existing transaction or receipt. Do not infer failure and submit a duplicate charge.'],total,canProceed:false};
    if(d.payment==='failed')return {status:'failed',title:'Payment did not complete',reasons:['Inspect the failure and resolve it before a supported retry. Do not mark the order paid.'],total,canProceed:false};
    if(d.payment==='succeeded')return {status:d.deliveryAccepted===true?'accepted':'awaiting-delivery',title:d.deliveryAccepted===true?'Simulated order accepted':'Payment recorded; delivery still needs review',reasons:[d.deliveryAccepted===true?'The exercise has separate records for authority, payment and accepted work.':'Compare the delivered artifact with the agreed scope; payment success is not customer acceptance.'],total,canProceed:false};
    if(d.payment!=='not-requested')return {status:'invalid',title:'Check payment status',reasons:['Choose a known payment state.'],total,canProceed:false};
    return {status:'ready',title:'Within the simulated authority',reasons:['This fictional offer satisfies the exercise rules. A real implementation still validates mandates and uses a payment provider. No payment is made here.'],total,canProceed:true};
  }
  function grade(quiz,answers){
    const answered=quiz.filter(q=>Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<q.options.length);
    const correct=answered.filter(q=>answers[q.id]===q.answer).length;
    const critical=quiz.filter(q=>q.critical&&answers[q.id]!==q.answer).map(q=>q.id);
    return {answered:answered.length,total:quiz.length,correct,critical,complete:answered.length===quiz.length,passed:answered.length===quiz.length&&correct>=6&&critical.length===0};
  }
  return {defaults,assess,grade};
});
