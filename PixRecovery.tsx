'use client';
export default function PixRecovery({payment,money}:{payment:any;money:(value:number)=>string}){
 if(payment.checking)return <p className="pix-recovery" role="status">Conferindo pagamento anterior…</p>;
 if(!payment.previous&&!payment.recoveryError)return payment.message?<div className="notice" role="status"><p>{payment.message}</p><a href="/pedido/">Acompanhar pedido anterior →</a></div>:null;
 return <section className="pix-recovery" aria-labelledby="previous-pix-title">
  <h2 id="previous-pix-title">{payment.previous?'Você tem um Pix anterior':'Confira o pagamento anterior'}</h2>
  <p>{payment.previous?`Há um pagamento de ${money(payment.previous.amount)} aguardando confirmação.`:payment.recoveryError}</p>
  <p>Se já pagou, consulte esse pedido. Iniciar outro pedido não cancela o Pix anterior.</p>
  <div className="pix-recovery-actions">
   <button type="button" className="primary" onClick={payment.previous?payment.resume:payment.retry}>{payment.previous?'Ver Pix anterior':'Consultar novamente'}</button>
   <button type="button" className="text-action" onClick={payment.newOrder}>Fazer novo pedido</button>
  </div>
 </section>;
}
