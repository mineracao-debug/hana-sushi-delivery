'use client';
import {ORDER_STEPS,orderProgress} from './order-progress.mjs';
export default function OrderProgress({payment}:{payment:any}){
 const current=orderProgress(payment);
 const times=[null,payment.fulfillment?.preparingAt||payment.approvedAt,payment.fulfillment?.dispatchedAt,payment.fulfillment?.deliveredAt];
 const time=(value:number)=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 return <section className="order-progress" aria-label="Acompanhamento do pedido">
  <div className="order-status-heading" role="status"><span className="order-status-icon" aria-hidden="true">{current.index===3?'✓':current.index===2?'↗':current.index===1?'♨':'◷'}</span><div>{payment.paid&&<span className="payment-confirmed">✓ Pagamento confirmado</span>}<h2>{current.title}</h2><p>{current.description}</p></div></div>
  <ol className="order-timeline">{ORDER_STEPS.map((step,index)=><li key={step.id} className={current.index<0?'':index<current.index?'complete':index===current.index?'current':''} aria-current={index===current.index?'step':undefined}><span className="timeline-dot" aria-hidden="true">{index<current.index?'✓':index+1}</span><div><b>{step.title}</b>{index<=current.index&&times[index]&&<small>{time(times[index])}</small>}</div></li>)}</ol>
  {current.index>=0&&current.index<3&&<p className="tracking-help">Esta página acompanha as atualizações do seu pedido.</p>}
 </section>;
}
