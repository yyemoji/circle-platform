import{Inject}from'@nestjs/common';import{JwtService}from'@nestjs/jwt';import{ConnectedSocket,MessageBody,OnGatewayConnection,SubscribeMessage,WebSocketGateway,WebSocketServer}from'@nestjs/websockets';import{Server,Socket}from'socket.io';import type{AuthSecrets}from'../auth/auth.service';import{AUTH_SECRETS}from'../auth/auth.tokens';
@WebSocketGateway({namespace:'/chat',cors:{origin:true,credentials:true}})
export class ChatGateway implements OnGatewayConnection{
  @WebSocketServer()server!:Server;
  constructor(@Inject(JwtService)private jwt:JwtService,@Inject(AUTH_SECRETS)private secrets:AuthSecrets){}
  async handleConnection(client:Socket){const token=client.handshake.auth.token as string|undefined;if(!token){client.disconnect(true);return;}try{client.data.user=await this.jwt.verifyAsync(token,{secret:this.secrets.accessSecret});}catch{client.disconnect(true);}}
  @SubscribeMessage('room:join')join(@ConnectedSocket()client:Socket,@MessageBody()body:{roomId:string}){if(!client.data.user||!body.roomId)return{joined:false};void client.join(body.roomId);return{joined:true};}
  @SubscribeMessage('message:send')message(@ConnectedSocket()client:Socket,@MessageBody()body:{roomId:string;text:string}){if(!client.data.user||!client.rooms.has(body.roomId)||!body.text?.trim())return{accepted:false};const message={id:`${Date.now()}-${client.id}`,senderId:client.data.user.sub,roomId:body.roomId,text:body.text.trim(),sentAt:new Date().toISOString()};this.server.to(body.roomId).emit('message:new',message);return{accepted:true,message};}
}
