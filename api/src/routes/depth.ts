import express from "express"
import { RedisManager } from "../RedisManager";
import { GET_DEPTH } from "../types/types";


export const depthRouter = express.Router();


depthRouter.get("/",async(req,res)=>{
    const {symbol} = req.query;
    
    const result : any = await RedisManager.getInstance().sendAndAwait({
        type: GET_DEPTH,
        data:{
            market: symbol
        }
    })

    res.json(result.payLoad);
})