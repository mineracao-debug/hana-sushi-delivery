'use client';
import {useEffect,useState} from 'react';
import OrderProgress from './OrderProgress';
import {forgetPix,pixState,sameOrderItems} from './pix-session.mjs';
const money=(n:number)=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export default function OrderTracking({setCart}:{setCart:(update:(current:any[])=>any[])=>void}){
 const [payment,setPayment]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0),[copied,setCopied]=useState(false);
 useEffect(()=>{
  if(!payment?.paid)return;
  setCart(current=>sameOrderItems(current,payment)?[]:current);
  try{forgetPix(localStorage,payment.id);}catch{}
 },[payment?.id,payment?.paid,setCart]);
 useEffect(()=>{
  let id=new URLSearchParams(window.location.search).get('id');
  if(!id)try{id=localStorage.getItem('hana-last-order')||localStorage.getItem('hana-pix');}catch{}
  if(id&&!/^SB-[a-f0-9-]{36}$/i.test(id)){setError('Pedido não encontrado. Confira o link de acompanhamento.');setLoading(false);return;}
  let current=true,running=false,finished=false;const controller=new AbortController();
  async function refresh(){
   if(running||finished)return;running=true;
   const timeout=setTimeout(()=>controller.abort(),10000);
   try{
    if(!id){
     const latest=await fetch('/api/latest-order',{signal:controller.signal,cache:'no-store'});
     if(!latest.ok)throw new Error('Não foi possível consultar seus pedidos agora.');
     const result:any=await latest.json();id=result.order?.id;
     if(!id){finished=true;throw new Error('Nenhum pedido encontrado neste navegador.');}
    }
    const response=await fetch('/api/pix-status?id='+encodeURIComponent(id!),{signal:controller.signal,cache:'no-store'});
    if(response.status===404){finished=true;throw new Error('Pedido não encontrado. Abra o acompanhamento no mesmo navegador usado para fazer o pedido.');}
    if(!response.ok)throw new Error('Não foi possível atualizar agora. Tente novamente.');
    const data:any=await response.json();if(data.id!==id)throw new Error('Não foi possível conferir este pedido.');
    if(current){setPayment(data);setError(data.checking?'A operadora está indisponível. Exibindo a última situação confirmada.':'');try{localStorage.setItem('hana-last-order',id!);}catch{}}
    finished=data.fulfillment?.status==='delivered'||['failed','canceled','refused','refunded','chargedback'].includes(data.status);
   }catch(failure:any){if(controller.signal.aborted)finished=true;if(current)setError(controller.signal.aborted?'A consulta demorou. Toque em atualizar para tentar novamente.':failure.message);}
   finally{clearTimeout(timeout);running=false;if(current)setLoading(false);}
  }
  refresh();const timer=setInterval(refresh,12000);
  return()=>{current=false;controller.abort();clearInterval(timer);};
 },[retry]);
 const state=pixState(payment);
 return <main className="tracking-page"><header className="tracking-heading"><p className="eyebrow">HANA SUSHI</p><h1>Acompanhe seu pedido</h1><p>Do pagamento até a entrega.</p></header>
  {loading&&!payment?<p role="status">Consultando seu pedido…</p>:payment?<>
   <OrderProgress payment={payment}/>
   <section className="tracking-receipt"><div><h2>Seu pedido</h2><strong>{money(payment.amount)}</strong></div><p className="order-id">{payment.id}</p><ul>{payment.order?.items?.map((item:any)=><li key={item.id}><span>{item.qty} × {item.title}</span><b>{money(item.qty*item.price)}</b></li>)}</ul><p className="green">Entrega grátis</p></section>
   {state==='pending'&&<section className="tracking-payment"><h2>Pagamento por Pix</h2>{payment.qrcode?<><p>Copie o código e pague no aplicativo do seu banco.</p><textarea readOnly aria-label="Código Pix" value={payment.qrcode}/><button className="primary" onClick={async()=>{try{await navigator.clipboard.writeText(payment.qrcode);setCopied(true);}catch{setError('Selecione o código e copie manualmente.');}}}>{copied?'Código copiado!':'Copiar código Pix'}</button></>:<p>Estamos consultando a operadora. Aguarde a confirmação antes de gerar outro pagamento.</p>}</section>}
  </>:null}
  {error&&<p className="notice" role="status">{error}</p>}
  <div className="tracking-actions"><button type="button" className="text-action" onClick={()=>{setLoading(true);setRetry(value=>value+1);}}>Atualizar pedido</button><a href="/">Voltar ao cardápio</a></div>
 </main>;
}
