import { WebSocket } from "ws";
import { IncomingMessage, SUBSCRIBE, UNSUBSCRIBE } from "./types/types";
import { SubscriptionManager } from "./Subscription";

export class User{
    private id : string;
    private ws : WebSocket;
    constructor(ws: WebSocket,id : string){
        this.id = id;
        this.ws = ws;
        console.log("User construtor check")
        this.addEventListeners();
    }
    public emit(message: string){
        this.ws.send(JSON.stringify(message));
    }

    private addEventListeners(){
        console.log("AddevenListener")
        this.ws.on("message",(x : string) =>{
            const parsed : IncomingMessage = JSON.parse(x);
            console.log("Check1")
            if(parsed.method === SUBSCRIBE){
                console.log("CheckInside")
                parsed.params.forEach(s => SubscriptionManager.getInstance().subscribe(this.id,s));
            }
            if(parsed.method === UNSUBSCRIBE){
                parsed.params.forEach(s => SubscriptionManager.getInstance().unSubcribe(this.id,s));
            }
        })
    }
}