import { RedisClientType,createClient } from "redis";
import { UserManager } from "./UserManager";


export class SubscriptionManager{
    private static instance : SubscriptionManager;
    private subscriptions : Map<string,string[]> = new Map();  // Mapping userId to which actions of markets they have susbcribed.
    private reverseSubscriptions : Map<string,string[]> = new Map();   // Mapping each subscribe action like depth of particular market to userIds
    private redisClient : RedisClientType;


    private constructor(){
        this.redisClient = createClient();
        this.redisClient.connect();
    }
    public static getInstance(){
        if(!this.instance){
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }
    public subscribe(id: string, subscription: string){
        console.log(subscription)
        if(this.subscriptions.get(id)?.includes(subscription)) return;
        this.subscriptions.set(id,(this.subscriptions.get(id) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription,(this.reverseSubscriptions.get(subscription) || []).concat(id));
        console.log(this.reverseSubscriptions)
        if(this.reverseSubscriptions.get(subscription)?.length === 1){
            this.redisClient.subscribe(subscription,this.redisCallbackhandler.bind(this));  // passing a callback function for the subscribe event of redisClient.
        }
    }
    private redisCallbackhandler(message: string,channel : string){
        console.log("Callback from redis confirming the channel : "+channel)
        const parsed = JSON.parse(message);
        this.reverseSubscriptions.get(channel)?.forEach(s => UserManager.getInstance().getUser(s)?.emit(parsed))
    }
    public unSubcribe(id : string,subscription : string){
        const subscriptions = this.subscriptions.get(id);
        if(subscriptions){
            this.subscriptions.set(id,subscriptions.filter(s => s !== subscription))
        }
        const reverseSubscription = this.reverseSubscriptions.get(subscription);
        if(reverseSubscription){
            this.reverseSubscriptions.set(subscription,reverseSubscription.filter(s => s !== id))
            if(this.reverseSubscriptions.get(subscription)?.length === 0){
                this.reverseSubscriptions.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
    }
    public userLeft(id: string){
        this.subscriptions.get(id)?.forEach(s => this.unSubcribe(id,s));
    }
    public getSubscriptions(id :string){
        return this.subscriptions.get(id) || [];
    }
}