import { WebSocket } from "ws";
import { User } from "./Users";


export class UserManager{
    private static instance : UserManager;
    private users : Map<string,User> = new Map();
    private constructor(){

    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new UserManager;
        }
        return this.instance;
    }

    public addUser(ws : WebSocket){
        const id = this.getRandomId();
        console.log("Check in addUser")
        const user = new User(ws,id);
        this.users.set(id,user);
        this.registerOnClose(ws,id);
        return user;
    }

    public registerOnClose(ws: WebSocket,id : string){
        ws.on("close",()=>{
            this.users.delete(id);
        })
    }

    public getUser(id : string){
        return this.users.get(id);
    }
    

    private getRandomId(){
        return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
    }
}