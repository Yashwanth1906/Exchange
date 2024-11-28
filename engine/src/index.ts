import {createClient} from "redis"
import { Engine } from "./businessLogic/Engine"

async function main(){
    const engine = new Engine();
    console.log("HI");
    try{
        // const redisClient = createClient();
        const redisClient = createClient({
            legacyMode: true,
            url: "redis://127.0.0.1:6379",
            pingInterval: 1000,
          });
        redisClient.connect();
        while(true){
            const res = await redisClient.rPop("messages" as string)
            if(!res){
                console.log("No data came from redis")
                continue;
            } else {
                engine.process(JSON.parse(res));
            }
        }
    } catch(e){
        console.log("Error")
        console.log(e)
    }
    
}

main();