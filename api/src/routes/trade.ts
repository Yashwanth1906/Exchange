import express from "express"
import { RedisManager } from "../RedisManager";

export const tradeRouter = express.Router();


tradeRouter.get("/",async(req,res)=>{
    res.json({});
})