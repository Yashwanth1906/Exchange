import {createClient} from "redis"
import { Engine } from "./businessLogic/Engine"

async function main(){
    const engine = new Engine();
    try{
        // const redisClient = createClient();
        const redisClient = createClient();
        redisClient.connect();
        while(true){
            const res = await redisClient.rPop("messages" as string)
            if(!res){
                continue;
            } else {
                console.log(res)
                engine.process(JSON.parse(res));
            }
        }
    } catch(e){
        console.log("Error")
        console.log(e)
    }
}

main();