'use client';
import type {Dispatch,SetStateAction,RefObject,FormEvent,InputHTMLAttributes} from 'react';
import DeliveryFields,{type CheckoutData} from './DeliveryFields';
type Props={
 form:CheckoutData;setForm:Dispatch<SetStateAction<CheckoutData>>;
 phoneError:string;setPhoneError:(message:string)=>void;phoneInput:RefObject<HTMLInputElement|null>;
 checked:boolean;setChecked:(value:boolean)=>void;busy:boolean;paymentBlocked:boolean;cepLoading:boolean;pixEnabled:boolean;
 total:string;onLoading:(loading:boolean)=>void;onStage:(stage:number)=>void;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;
};
export default function CheckoutForm(props:Props){
 const {form,setForm,phoneError,setPhoneError,phoneInput,checked,setChecked,busy,paymentBlocked,cepLoading,pixEnabled,total,onLoading,onStage,onSubmit}=props;
 function field(name:keyof CheckoutData,label:string,options:InputHTMLAttributes<HTMLInputElement>={}){
  return <label>{label}<input name={name} value={form[name]} onChange={event=>{const value=event.target.value;setForm(current=>({...current,[name]:value}));if(name==='phone')setPhoneError('');}} required {...options} {...(name==='phone'?{ref:phoneInput}: {})}/>{name==='phone'&&phoneError&&<small id="phone-help" className="field-error" role="alert">{phoneError}</small>}</label>;
 }
 return <form className="simple-checkout-form" onSubmit={onSubmit}>
  <section className="form-panel" onFocusCapture={()=>onStage(0)}>
   <div className="section-heading"><span>1</span><h2>Seus dados</h2></div>
   {field('name','Nome completo',{autoComplete:'name',minLength:3,maxLength:100,placeholder:'Seu nome e sobrenome'})}
   {field('phone','Celular com DDD',{type:'tel',inputMode:'tel',autoComplete:'tel',maxLength:24,placeholder:'(11) 99999-9999','aria-invalid':!!phoneError,'aria-describedby':phoneError?'phone-help':undefined})}
   {field('email','E-mail',{type:'email',inputMode:'email',autoComplete:'email',maxLength:160,placeholder:'voce@exemplo.com'})}
   {field('cpf','CPF',{inputMode:'numeric',minLength:11,maxLength:14,placeholder:'000.000.000-00'})}
   <p className="field-help">Usamos seus dados para o pedido e a emissão do Pix.</p>
  </section>
  <section className="form-panel" onFocusCapture={()=>onStage(1)}>
   <div className="section-heading"><span>2</span><h2>Endereço de entrega</h2><b className="delivery-tag">Grátis</b></div>
   <DeliveryFields form={form} setForm={setForm} onLoading={onLoading}/>
  </section>
  <section className="form-panel payment-panel" onFocusCapture={()=>onStage(2)}>
   <div className="pix-choice"><img src="/images/pix-logo.webp" alt=""/><div><b>Pague com Pix</b><p>Confirmação automática</p></div><span aria-hidden="true">✓</span></div>
   {!pixEnabled&&<p className="warning">O pagamento está aguardando configuração da loja. Seu carrinho será mantido.</p>}
   <label className="terms-check"><input type="checkbox" checked={checked} onChange={event=>setChecked(event.target.checked)} required/><span>Li e aceito os <a href="/terms/" target="_blank">termos de uso</a> e a <a href="/privacy/" target="_blank">política de privacidade</a>.</span></label>
  </section>
  <div className="checkout-paybar"><div><span>Total com entrega grátis</span><strong>{total}</strong></div><button className="primary" type="submit" disabled={paymentBlocked||busy||cepLoading||!checked||!pixEnabled}>{paymentBlocked?'Confira o Pix anterior':busy?'Gerando Pix…':cepLoading?'Buscando CEP…':'Gerar Pix'}<span aria-hidden="true">→</span></button></div>
 </form>;
}
