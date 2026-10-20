import type { PaymentState } from '../payments/payment-state-machine';
export type ProductType = 'COIN_PACKAGE' | 'MEMBERSHIP' | 'GOODS';
export interface ProductRecord { id:string; name:string; type:ProductType; price:number; coinAmount:number|null; planDays:number|null; stock:number|null; active:boolean }
export interface PlanRecord { id:string; name:string; days:number; price:number; benefits:string[]; active:boolean }
export interface OrderRecord { id:string; userId:string; productId:string; quantity:number; totalAmount:number; status:PaymentState; idempotencyKey:string; createdAt:Date }
export interface MembershipRecord { id:string; userId:string; productId:string; active:boolean; startsAt:Date; expiresAt:Date }
export abstract class CommerceStore {
  abstract products():Promise<ProductRecord[]>; abstract plans():Promise<PlanRecord[]>; abstract product(id:string):Promise<ProductRecord|null>;
  abstract createAddress(userId:string,data:{recipient:string;phone:string;detail:string}):Promise<unknown>;
  abstract createOrder(data:Omit<OrderRecord,'id'|'status'|'createdAt'>):Promise<OrderRecord>; abstract order(id:string):Promise<OrderRecord|null>; abstract orders(userId:string):Promise<OrderRecord[]>; abstract setOrderStatus(id:string,status:PaymentState):Promise<OrderRecord>;
  abstract claimPaymentEvent(eventId:string,orderId:string,success:boolean):Promise<boolean>; abstract grantMembership(userId:string,productId:string,days:number):Promise<MembershipRecord>; abstract membership(userId:string):Promise<MembershipRecord|null>; abstract revokeMembership(userId:string,productId:string):Promise<void>;
}
