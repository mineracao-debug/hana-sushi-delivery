'use client';
import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {cepDigits,formatCEP,createCEPLookup} from './cep.mjs';

export type CheckoutData={name:string;email:string;cpf:string;phone:string;cep:string;street:string;number:string;comp:string;district:string;city:string;uf:string};
const emptyAddress={street:'',district:'',city:'',uf:'',number:'',comp:''};
export default function DeliveryFields({form,setForm,onLoading}:{form:CheckoutData;setForm:Dispatch<SetStateAction<CheckoutData>>;onLoading:(loading:boolean)=>void}) {
 const [lookup]=useState(()=>createCEPLookup());
 const [status,setStatus]=useState<'idle'|'loading'|'ready'|'error'>('idle');
 const [message,setMessage]=useState('');
 const [manual,setManual]=useState(false);
 const [retry,setRetry]=useState(0);
 const cep=cepDigits(form.cep);
 useEffect(()=>{
  if(cep.length!==8||manual)return;
  let current=true;
  setStatus('loading');setMessage('Buscando seu endereço…');onLoading(true);
  const timer=setTimeout(async()=>{
   try {
    const address=await lookup.lookup(cep);if(!address||!current)return;
    setForm(current=>cepDigits(current.cep)===cep?{...current,...address}:current);
    setStatus('ready');setMessage(address.street&&address.district?'Endereço encontrado. Falta só o número.':'Complete a rua e o bairro abaixo.');
    if(!address.street||!address.district)setManual(true);
   }catch(error:any){if(current){setStatus('error');setMessage(error.message);setManual(true);}}
   finally{if(current)onLoading(false);}
  },300);
  return()=>{current=false;clearTimeout(timer);lookup.cancel();onLoading(false);};
 },[cep,manual,retry,lookup,setForm,onLoading]);
 function changeCEP(value:string){
  const next=formatCEP(value);
  if(cepDigits(next)!==cep){lookup.cancel();setStatus('idle');setMessage('');setManual(false);setForm(current=>({...current,...emptyAddress,cep:next}));}
  else setForm(current=>({...current,cep:next}));
 }
 function editAddress(){lookup.cancel();setManual(true);setStatus('idle');setMessage('Preencha ou corrija seu endereço.');onLoading(false);}
 function field(name:keyof CheckoutData,label:string,props:React.InputHTMLAttributes<HTMLInputElement>={}){
  return <label>{label}<input name={name} value={form[name]} onChange={e=>{const value=name==='uf'?e.target.value.toUpperCase():e.target.value;setForm(current=>({...current,[name]:value}));}} required {...props}/></label>;
 }
 return <>
  <label htmlFor="delivery-cep">CEP</label>
  <div className="cep-input"><input id="delivery-cep" name="cep" aria-label="CEP" value={form.cep} onChange={e=>changeCEP(e.target.value)} onBlur={e=>{changeCEP(e.target.value);if(cepDigits(e.target.value).length!==8)setMessage('Digite os 8 números do CEP.');}} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" pattern="[0-9]{5}-[0-9]{3}" maxLength={9} required aria-describedby="cep-status"/>{status==='loading'&&<span className="cep-spinner" aria-hidden="true"/>}</div>
  <p id="cep-status" className={'field-help '+(status==='error'?'field-error':'')} role="status">{message||'Digite o CEP para preencher o endereço.'}</p>
  {status==='error'&&<button className="text-action" type="button" onClick={()=>{setManual(false);setRetry(n=>n+1);}}>Tentar buscar novamente</button>}
  {status==='ready'&&!manual&&<div className="address-found"><div><b>{form.street}</b><p>{form.district} · {form.city} / {form.uf}</p></div><button type="button" className="text-action" onClick={editAddress}>Editar</button>{(['street','district','city','uf'] as const).map(key=><input key={key} type="hidden" name={key} value={form[key]}/>)}</div>}
  {manual&&<div className="address-fields">
   {field('street','Rua',{autoComplete:'address-line1',minLength:2,maxLength:150})}
   {field('district','Bairro',{minLength:2,maxLength:100})}
   <div className="form-grid city-uf">{field('city','Cidade',{autoComplete:'address-level2',minLength:2,maxLength:100})}{field('uf','UF',{autoComplete:'address-level1',minLength:2,maxLength:2,pattern:'[A-Za-z]{2}'})}</div>
  </div>}
  {(status==='ready'||manual)&&<div className="form-grid number-complement">{field('number','Número',{autoComplete:'off',maxLength:20,placeholder:'123 ou s/n'})}{field('comp','Complemento',{autoComplete:'address-line2',required:false,maxLength:100,placeholder:'Apto, bloco (opcional)'})}</div>}
  {!manual&&status!=='ready'&&<button className="text-action" type="button" onClick={editAddress}>Preencher endereço manualmente</button>}
 </>;
}
