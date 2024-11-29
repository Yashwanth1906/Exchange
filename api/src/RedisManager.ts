
import {RedisClientType,createClient} from "redis";

export class RedisManager{                         // This class creates two redisClient, One is used as queues and another one is used as pub/sub. Publisher is the client that is used as queues and 
    private client : RedisClientType;              // And Client is used as pub/sub
    private publisher: RedisClientType;            // Instance is the object of the RedisManager class itself which is used to pass the particular client's object.
    private static instance : RedisManager;
    private constructor(){
        // this.client = createClient();
        // try{
        this.client = createClient();
        this.client.connect();
        this.publisher = createClient();
        this.publisher.connect();
    }

    public static getInstance(){                            // It is used to create and assign a instance of class and return it to the api.
        if(!this.instance){
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    public sendAndAwait(message : any){                   // This sendAndAwait function is used to put the message frm a client in the queue and also connect to pub/sub to receive the msg from engine which 
        return new Promise((resolve)=>{                   // process the data and published the result in pub/sub which is then returned as promise in this function.
            const id = this.getRandomClientId();
            this.client.subscribe(id,(mess)=>{
                this.client.unsubscribe(id);
                resolve(JSON.parse(mess));
            });
            console.log(message)
            this.publisher.lPush("messages",JSON.stringify({clientId:id,message}))
        })
    }
    
    public getRandomClientId(){
        return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15); // Random shit number generating.
    }
}