'use client';
import {useEffect,type Dispatch,type SetStateAction} from 'react';
import {readLocation} from './location.mjs';
export type CheckoutData={name:string;email:string;cpf:string;phone:string;cep:string;street:string;number:string;comp:string;district:string;city:string;uf:string};
const states='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
export default function DeliveryFields({form,setForm}:{form:CheckoutData;setForm:Dispatch<SetStateAction<CheckoutData>>;onLoading?:(loading:boolean)=>void}) {
 useEffect(()=>{
  let saved;try{saved=readLocation(localStorage);}catch{}
  if(saved)setForm(current=>!current.city&&!current.uf?{...current,city:saved.city,uf:saved.state}:current);
 },[setForm]);
 function field(name:keyof CheckoutData,label:string,props:React.InputHTMLAttributes<HTMLInputElement>={}){
  return <label>{label}<input name={name} value={form[name]} onChange={event=>{const value=event.target.value;setForm(current=>({...current,[name]:value,cep:''}));}} required {...props}/></label>;
 }
 return <div className="address-fields">
  {field('street','Rua',{autoComplete:'address-line1',minLength:3,maxLength:150,placeholder:'Nome da sua rua'})}
  <div className="form-grid number-complement">{field('number','Número',{autoComplete:'off',maxLength:20,placeholder:'123 ou s/n'})}{field('comp','Complemento',{autoComplete:'address-line2',required:false,maxLength:100,placeholder:'Apto, bloco (opcional)'})}</div>
  {field('district','Bairro',{minLength:2,maxLength:100,placeholder:'Seu bairro'})}
  <div className="form-grid city-uf">{field('city','Cidade',{autoComplete:'address-level2',minLength:3,maxLength:100})}<label>Estado<select name="uf" value={form.uf} required autoComplete="address-level1" onChange={event=>{const value=event.target.value;setForm(current=>({...current,uf:value,cep:''}));}}><option value="">UF</option>{states.map(state=><option key={state} value={state}>{state}</option>)}</select></label></div>
 </div>;
}
