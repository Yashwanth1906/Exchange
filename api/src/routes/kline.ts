import express from "express"
import { RedisManager } from "../RedisManager";
import {Client} from "pg"

export const kLineRouter = express.Router();

const pgClinet = new Client({
    user:"yashwanth",                   // Connecting to pg-client always remember starting docker container with these -e injected into it.
    host:"localhost",
    password:"123",
    database:"yashwanthDB",
    port:5432
});
pgClinet.connect();

kLineRouter.get("/", async(req : any,res :any)=>{
    const {market,interval,startTime,endTime} = req.query;
    let query;
    switch(interval){
        case "1m":
            query = "SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2";
            break;
        case "1h":
            query = "SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2";
            break;
        case "1w":
            query = "SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2";
            break;
        default:
            return res.status(400).send("Invalid interval");
    }
    try{
        const result = await pgClinet.query(query,[new Date((startTime*1000) as unknown as string),new Date(endTime*1000 as unknown as string)]);
        res.json(result.rows.map(x =>({
            close : x.close,
            end: x.bucket,
            high : x.high,
            low: x.low,
            open : x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume
        })))
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
})