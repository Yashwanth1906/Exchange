import { WebSocketServer } from "ws";
import { UserManager } from "./UserManager";

const wss = new WebSocketServer({
    port:3001
});

wss.on('connection',(ws)=>{
    console.log("One Client connected")
    UserManager.getInstance().addUser(ws);
});