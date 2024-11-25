import express from "express"
import { RedisManager } from "../RedisManager";

export const tickerRouter = express.Router();


tickerRouter.get("/",async(req,res)=>{
    res.json({});
})