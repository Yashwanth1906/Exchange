import express from "express"
import { depthRouter } from "./routes/depth";
import { kLineRouter } from "./routes/kline";
import { tickerRouter } from "./routes/ticker";
import { tradeRouter } from "./routes/trade";
import { orderRouter } from "./routes/order";
import cors from "cors"

const app = express();

app.use(express.json());
app.use(cors())
app.use("api/v1/depth",depthRouter)
app.use("api/v1/klines",kLineRouter)
app.use("api/v1/tickers",tickerRouter)
app.use("api/v1/trades",tradeRouter)
app.use("api/v1/order",orderRouter)


app.listen(6969,()=>{
    console.log("API server running in port 6969")
})