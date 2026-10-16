import {pixState} from './pix-session.mjs';
export const ORDER_STEPS=[
 {id:'awaiting_payment',title:'Aguardando pagamento',description:'Seu pedido foi recebido. Pague o Pix para iniciar o preparo.'},
 {id:'preparing',title:'Pedido em preparo',description:'Pagamento confirmado! Seu pedido entrou em preparo.'},
 {id:'out_for_delivery',title:'Saiu para entrega',description:'Seu pedido está a caminho do endereço informado.'},
 {id:'delivered',title:'Pedido entregue',description:'Entrega concluída. Bom apetite!'}
];
export function orderProgress(payment){
 const state=pixState(payment);
 if(state==='expired')return {index:-1,title:'Pix vencido',description:'O prazo deste Pix terminou. Confira o pagamento antes de iniciar outro pedido.'};
 if(state==='closed')return {index:-1,title:({refunded:'Pagamento reembolsado',chargedback:'Pagamento contestado',canceled:'Pagamento cancelado',refused:'Pagamento recusado'})[payment.status]||'Pagamento não concluído',description:'Este pedido não está liberado para preparo e entrega.'};
 const index=state==='paid'?Math.max(1,ORDER_STEPS.findIndex(step=>step.id===payment.fulfillment?.status)):0;
 return {...ORDER_STEPS[index],index};
}
