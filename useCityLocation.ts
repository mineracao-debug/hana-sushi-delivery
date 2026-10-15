'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {detectCity,normalizeLocation,readLocation,saveLocation} from './location.mjs';
type Selection={city:string;state:string;source:string};

export function useCityLocation(enabled:boolean){
 const [selection,setSelection]=useState<Selection|null>(null);
 const [locating,setLocating]=useState(false),[locationError,setLocationError]=useState('');
 const pending=useRef<AbortController|null>(null);
 const detect=useCallback(async()=>{
  pending.current?.abort();
  const controller=new AbortController();pending.current=controller;
  setLocating(true);setLocationError('');
  try{
   const result=await detectCity({signal:controller.signal});
   if(controller.signal.aborted)return false;
   let saved={...result,source:'auto'};
   try{saved=saveLocation(localStorage,result,'auto');}catch{}
   setSelection(saved);return true;
  }catch{
   if(!controller.signal.aborted)setLocationError('Não conseguimos identificar sua cidade. Escolha abaixo.');
   return false;
  }finally{if(!controller.signal.aborted)setLocating(false);}
 },[]);
 const choose=useCallback((city:string,state:string)=>{
  const value=normalizeLocation({city,region_code:state,country_code:'BR'});
  if(!value){setLocationError('Informe uma cidade e um estado válidos.');return false;}
  pending.current?.abort();setLocating(false);setLocationError('');
  let saved={...value,source:'manual'};
  try{saved=saveLocation(localStorage,value,'manual');}catch{}
  setSelection(saved);return true;
 },[]);
 useEffect(()=>{
  if(!enabled)return;
  let saved=null;try{saved=readLocation(localStorage);}catch{}
  if(saved)setSelection(saved);else void detect();
  return()=>pending.current?.abort();
 },[enabled,detect]);
 return {selection,locating,locationError,detect,choose};
}
