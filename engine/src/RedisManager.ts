import {createClient,RedisClientType} from "redis"


export class RedisManager{
    private client: RedisClientType;
    private  static instance: RedisManager;

    constructor(){
        this.client = createClient();
        this.client.connect();    
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public pushMessage(message : any){
        this.client.lPush("db_processor",JSON.stringify(message))
    }

    public publicMessage(channel : any,message : any){
        this.client.publish(channel,JSON.stringify(message))
    }

    public sendToAPI(clientId:any,message:any){
        this.client.publish(clientId,JSON.stringify(message))
    }
}