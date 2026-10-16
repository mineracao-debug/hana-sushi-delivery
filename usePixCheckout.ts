'use client';
import {useEffect,useState} from 'react';
import {forgetPix,pixState,sameOrderItems} from './pix-session.mjs';

export function usePixCheckout(enabled:boolean,setCart:(update:(current:any[])=>any[])=>void){
 const [pix,setPix]=useState<any>(null);
 // Checkout always starts empty. Only payments generated in this mounted checkout are shown.

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
  setPix(payment);
 }
 function backToCheckout(){
  setPix(null);
 }
 function newOrder(){
  try{sessionStorage.removeItem('hana-attempt');}catch{}
  setPix(null);
 }
 return {pix,blocked:false,acceptPayment,backToCheckout,newOrder};
}
