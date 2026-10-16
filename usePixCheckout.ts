'use client';
import {useEffect,useRef,useState} from 'react';
import {forgetPix,pixState,recoverPix,sameOrderItems} from './pix-session.mjs';

export function usePixCheckout(enabled:boolean,setCart:(update:(current:any[])=>any[])=>void){
 const [pix,setPix]=useState<any>(null),[previous,setPrevious]=useState<any>(null);
 const [checking,setChecking]=useState(enabled),[recoveryError,setRecoveryError]=useState(''),[message,setMessage]=useState(''),[retry,setRetry]=useState(0);
 const savedId=useRef('');
 useEffect(()=>{
  if(!enabled)return;
  let id='';try{id=localStorage.getItem('hana-pix')||'';}catch{}
  savedId.current=id;
  try{if(id)localStorage.setItem('hana-last-order',id);}catch{}
  if(!id){setChecking(false);return;}
  let current=true;const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  setChecking(true);setRecoveryError('');
  recoverPix(id,{signal:controller.signal}).then(result=>{
   if(!current)return;
   if(result.kind==='offer')setPrevious(result.payment);
   else{
    forgetPix(localStorage,id);savedId.current='';
    setMessage(result.state==='paid'?'O pagamento anterior já foi confirmado. Este checkout é para um novo pedido.':result.state?'O Pix anterior foi encerrado ou venceu. Você pode continuar com seu pedido.':'');
   }
  }).catch(()=>{if(current)setRecoveryError('Não foi possível consultar o Pix anterior. Tente novamente antes de gerar outro pagamento.');})
  .finally(()=>{clearTimeout(timeout);if(current)setChecking(false);});
  return()=>{current=false;clearTimeout(timeout);controller.abort();};
 },[enabled,retry]);

 useEffect(()=>{
  if(!pix?.id)return;
  const state=pixState(pix);
  if(state!=='pending')forgetPix(localStorage,pix.id);
  if(state==='paid'){
   setCart(current=>sameOrderItems(current,pix)?[]:current);
  }
  if(pix.fulfillment?.status==='delivered')return;
  if(state==='closed')return;
  // Continue checking a code that has just expired in case payment was made at expiry.
  let current=true;const controller=new AbortController();let running=false;
  const refresh=async()=>{
   if(running)return;running=true;
   try{
    const response=await fetch('/api/pix-status?id='+encodeURIComponent(pix.id),{signal:controller.signal,cache:'no-store'});
    const data:any=await response.json();
    if(current&&response.ok&&data.id===pix.id)setPix(data);
   }catch{}finally{running=false;}
  };
  refresh();
  const timer=setInterval(refresh,12000);
  return()=>{current=false;controller.abort();clearInterval(timer);};
 },[pix?.id,pix?.status,pix?.paid,pix?.expirationDate,pix?.fulfillment?.status,setCart]);

 function acceptPayment(payment:any){
  setPix(payment);setPrevious(null);setMessage('');
  savedId.current=payment.id||'';
  try{if(payment.id)localStorage.setItem('hana-last-order',payment.id);}catch{}
  try{if(payment.id&&pixState(payment)==='pending')localStorage.setItem('hana-pix',payment.id);}catch{}
 }
 function backToCheckout(){
  if(pixState(pix)==='pending')setPrevious(pix);
  else{forgetPix(localStorage,pix?.id);savedId.current='';}
  setPix(null);setMessage('');
 }
 function newOrder(){
  forgetPix(localStorage,savedId.current);savedId.current='';
  try{sessionStorage.removeItem('hana-attempt');}catch{}
  setPix(null);setPrevious(null);setRecoveryError('');setMessage('');
 }
 return {pix,previous,checking,recoveryError,message,blocked:checking||!!previous||!!recoveryError,
  retry:()=>setRetry(value=>value+1),resume:()=>{setPix(previous);setPrevious(null);setMessage('');},
  acceptPayment,backToCheckout,newOrder};
}
