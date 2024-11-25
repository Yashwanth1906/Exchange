import express from "express"
import { RedisManager } from "../RedisManager";

export const orderRouter = express.Router();

orderRouter.post("/",async(req,res)=>{                      // creating an order
    const {market,price,quantity,side,userId} = req.body; 

    const result : any = await RedisManager.getInstance().sendAndAwait({
        type:"CREATE_ORDER",
        data:{
            market,price,quantity,side,userId
        }
    })
    res.json(result.payLoad);
})

orderRouter.delete("/",async(req,res)=>{
    const {orderId,symbol} = req.query;                    //Deleting a particular order with the orderId

    const result : any= await RedisManager.getInstance().sendAndAwait({
        type:"DELETE_ORDER",
        data:{
            orderId,symbol
        }
    })
    res.json(result.payLoad);
})


orderRouter.get("/open",async(req,res)=>{               // Geting all the openOrders of the particular user in that market
    const {symbol,userId} = req.query;

    const result : any = await RedisManager.getInstance().sendAndAwait({
        type:"GET_OPEN_ORDERS",
        data:{
            userId,
            market: symbol
        }
    })
    res.json(result.payLoad);
})