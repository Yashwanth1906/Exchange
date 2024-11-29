import express from "express"
import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types/types";

export const orderRouter = express.Router();

orderRouter.post("/",async(req,res)=>{                      // creating an order
    const {market,price,quantity,side,userId} = req.body; 

    const result : any = await RedisManager.getInstance().sendAndAwait({
        type:CREATE_ORDER,
        data:{
            market,price,quantity,side,userId
        }
    })
    console.log("Result : ",result)
    res.json(result.payLoad);
})

orderRouter.delete("/",async(req,res)=>{
    const {orderId,symbol} = req.query;                    //Deleting a particular order with the orderId

    const result : any= await RedisManager.getInstance().sendAndAwait({
        type:CANCEL_ORDER,
        data:{
            orderId,
            market: symbol
        }
    })
    res.json(result.payLoad);
})


orderRouter.get("/open",async(req,res)=>{               // Geting all the openOrders of the particular user in that market
    const {symbol,userId} = req.query;

    const result : any = await RedisManager.getInstance().sendAndAwait({
        type:GET_OPEN_ORDERS,
        data:{
            userId,
            market: symbol
        }
    })
    res.json(result.payLoad);
})