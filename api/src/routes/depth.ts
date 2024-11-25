import express from "express"
import { RedisManager } from "../RedisManager";


export const depthRouter = express.Router();


depthRouter.get("/",async(req,res)=>{
    const {symbol} = req.query;
    
    const result : any = await RedisManager.getInstance().sendAndAwait({
        type:"GET_DEPTH",
        data:{
            market: symbol
        }
    })

    res.json(result.payLoad);
})