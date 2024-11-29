import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, DEPTH, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, ON_RAMP, OPEN_ORDERS, ORDER_CANCELLED, ORDER_PLACED, ORDER_UPDATE, TRADE_ADDED } from "../types/types";
import { Fill, Order, OrderBook } from "./OrderBook";
import fs from "fs"

export const BASE_CURRENCY = "INR";

interface UserBalance {
    [key:string]:{
        available: number,
        locked: number
    }
}

export class Engine{
    private orderbooks : OrderBook[] = [];
    private balances : Map<string,UserBalance> = new Map();

    constructor(){
        let snapshot = null;
        try{
            snapshot = fs.readFileSync("./snapshot.json");
        }catch(e){
            console.log("No snapshot found");
        }
        if(snapshot){
            const sp = JSON.parse(snapshot.toString());
            console.log(sp);
            this.orderbooks = sp.orderbooks.map((o:any)=>new OrderBook("TATA",o.bids,o.asks,o.lastTradeId,o.currentPrice))
            this.balances = new Map(sp.balances);
        } else {
            this.orderbooks = [new OrderBook("TATA",[],[],0,0)];
            this.setBaseBalance();
        }
        setInterval(()=>{
            this.saveSnapShot();
        },1000*3)
    }
    saveSnapShot(){
        const sp = {
            orderbooks: this.orderbooks.map(o => o.getSnapShot()),
            balances: Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot.json", JSON.stringify(sp));
    }
    setBaseBalance(){
        this.balances.set("1", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("2", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("5", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
    }
    process({message,clientId} : {message: MessageFromApi,clientId : string}){
        switch(message.type){
            case CREATE_ORDER:
                try{
                    const {executedQty,fills,orderId} = this.createOrder(message.data.market,message.data.price,message.data.quantity,message.data.side,message.data.userId);
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type: ORDER_PLACED,
                        payLoad:{
                            orderId,executedQty,fills
                        }
                    })
                } catch(e) {
                    console.log(e);
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type: ORDER_CANCELLED,
                        payLoad:{
                            orderId : "",
                            executedQty : 0,
                            remaininyQty: 0
                        }
                    })
                }
                break;
            case CANCEL_ORDER:
                try{
                    const orderId = message.data.orderId;
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.ticker() === market);
                    const quoteAsset = market.split("_")[1];
                    if(!orderbook){
                        throw new Error("No orderbook found for that market");
                    }
                    const order = orderbook.asks.find(o => o.orderId === orderId) || orderbook.bids.find(o => o.orderId === orderId);
                    if(!order){
                        throw new Error("No order found with that orderId");
                    }
                    if(order.side === "buy"){
                        const price = orderbook.cancelBid(order);
                        const leftAmount = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].available += leftAmount;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].locked -= leftAmount;
                        if(price){
                            this.sendUpdatedDepthAt(price.toString(),market);
                        }
                    } else {
                        const price = orderbook.cancelAsk(order);
                        const leftAmount = (order.quantity - order.filled);
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftAmount;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftAmount;
                        if(price){
                            this.sendUpdatedDepthAt(price.toString(),market);
                        }
                    }
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type: ORDER_CANCELLED,
                        payLoad:{
                            orderId,executedQty: 0, remainingQty: 0
                        }
                    })
                }
                catch(e){
                    console.log(e);
                }
                break;
            case GET_OPEN_ORDERS:
                try{
                    const orderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if(!orderbook){
                        throw new Error("No orderbook is found in get-open-orders");
                    }
                    const openOrders = orderbook.getOpenOrders(message.data.userId);
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type: OPEN_ORDERS,
                        payLoad: openOrders
                    })
                } catch(e){
                    console.log(e);
                }
                break;
            case ON_RAMP:
                const userId = message.data.userId;
                const amount = message.data.amount;
                this.onRamp(userId,amount);
                break;
            case GET_DEPTH:
                try{
                    const orderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if(!orderbook){
                        throw new Error("No orderbook is found in getDepth");
                    }
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type:DEPTH,
                        payLoad: orderbook.getDepth()
                    })
                } catch(e){
                    console.log(e)
                    RedisManager.getInstance().sendToAPI(clientId,{
                        type:DEPTH,
                        payLoad:{
                            bids:[],
                            asks:[]
                        }
                    })
                }
                break;
        }
    }

    sendUpdatedDepthAt(price: string,market: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if(!orderbook){
            throw new Error("the orderBook is not found for the market");
        }
        const depth = orderbook.getDepth();
        const updateBids = depth.bids.filter(o => o[0] === price);
        const updateAsks = depth.asks.filter(o => o[0] === price);
        RedisManager.getInstance().publicMessage(`depth@${market}`,{
            stream : `depth@${market}`,
            data:{
                a : updateAsks.length ? updateAsks : [[price,"0"]],
                b : updateBids.length ? updateBids : [[price,"0"]],
                e : "Depth"
            }
        })
    }

    onRamp(userId: string,amount : string){
        const userBalance = this.balances.get(userId);
        if(!userBalance){
            this.balances.set(userId,{
                [BASE_CURRENCY]:{
                    available:Number(amount),
                    locked: 0
                }
            })
        } else {
            userBalance[BASE_CURRENCY].available+= Number(amount);
        }
    }


    createOrder(market: string,price: string, quantity: string, side: "buy"|"sell" , userId: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];
        if(!orderbook){
            throw new Error("No orderbook is found to create an order");
        }
        this.checkAndLockFund(baseAsset,quoteAsset,side,userId,price,quantity);
        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15),
            filled:0,
            side,
            userId
        }
        const {fills,executedQty} = orderbook.addOrder(order);
        this.updateBalance(userId,baseAsset,quoteAsset,side,fills,executedQty);
        this.createDbTrades(fills,market,userId);
        this.publishWSDepthUpdates(fills,price,side,market);
        this.publishWsTrades(fills,userId,market);
        this.updateDbOrders(order,executedQty,fills,market);
        return {executedQty,fills,orderId: order.orderId};
    }
    publishWsTrades(fills:Fill[],userId:string,market:string){
        fills.forEach(x =>{
            RedisManager.getInstance().publicMessage(`trade@${market}`,{
                stream : `trade@${market}`,
                data:{
                    e : "trade",
                    t : x.tradeId,
                    m : x.otherUserId === userId,
                    p : x.price,
                    q : x.quatity.toString(),
                    s : market
                }
            })
        })
    }

    updateDbOrders(order: Order,executedQty: number,fills: Fill[],market: string){
        RedisManager.getInstance().pushMessage({
            type: ORDER_UPDATE,
            data:{
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side
            }
        })
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: ORDER_UPDATE,
                data: {
                    orderId: fill.makerOrderId,
                    executedQty: fill.quatity
                }
            });
        });
    }
    publishWSDepthUpdates(fills: Fill[],price: string,side: "buy"| "sell", market: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if(!orderbook){
            throw new Error("No order book is found with that market stamp");
        }
        const depth = orderbook.getDepth();
        if(side === "buy"){
            const updatedAsks = depth.asks.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updateBids = depth.bids.find(x => x[0] === price);
            RedisManager.getInstance().publicMessage(`depth@${market}`,{
                stream: `depth@${market}`,
                data:{
                    a: updatedAsks,
                    b: updateBids ? [updateBids] : [],
                    e: "depth"
                }
            })
        } else {
            const updatedBids = depth.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updatedAsks = depth.asks.find(x => x[0] === price);
            RedisManager.getInstance().publicMessage(`depth@${market}`,{
                stream: `depth@${market}`,
                data:{
                    a: updatedAsks ? [updatedAsks] : [],
                    b: updatedBids,
                    e: "depth"
                }
            })
        }
    }

    createDbTrades(fills:Fill[],market:string,userId:string){
        fills.forEach(o => {
            RedisManager.getInstance().pushMessage({
                type: TRADE_ADDED,
                data:{
                    market,
                    id: o.tradeId.toString(),
                    isBuyerMaker: o.otherUserId === userId,
                    price: o.price,
                    quantity: o.quatity.toString(),
                    quoteQuantity: (o.quatity * Number(o.price)).toString(),
                    timeStamp: Date.now()
                }
            })
        })
    }

    updateBalance(userId:string,baseAsset:string,quoteAsset: string,side:"buy" | "sell",fills: Fill[],executedQty:number){
        if(side === "buy"){
            fills.forEach(o =>{
                //@ts-ignore
                this.balances.get(o.otherUserId)[quoteAsset].available = this.balances.get(o.otherUserId)[quoteAsset].available + (o.quatity*o.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)[quoteAsset].locked - (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(o.otherUserId)[baseAsset].locked = this.balances.get(o.otherUserId)[baseAsset].locked - o.quatity;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + o.quatity;
            })
        } else {
            fills.forEach(o =>{
                //@ts-ignore
                this.balances.get(o.otherUserId)[quoteAsset].locked = this.balances.get(o.otherUserId)[quoteAsset].locked - (o.quatity*o.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].available + (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(o.otherUserId)[baseAsset].available = this.balances.get(o.otherUserId)[baseAsset].available + o.quatity;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)[baseAsset].locked - o.quatity;
            })
        }
    }




    checkAndLockFund(baseAsset: string,quoteAsset: string,side: "buy" | "sell",userId:string,price:string,quantity:string){
        if(side === "buy"){
            if((this.balances.get(userId)?.[quoteAsset].available || 0) <Number(quantity)*Number(price)){
                throw new Error("Insufficient balance");
            }
            //@ts-ignore
            this.balances.get(userId)?.[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available - (Number(quantity)*Number(price));
            //@ts-ignore
            this.balances.get(userId)?.[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked + (Number(quantity)*Number(price));
        } else {
            if((this.balances.get(userId)?.[baseAsset].available || 0) <Number(quantity)){
                throw new Error("Insufficient balance");
            }
            //@ts-ignore
            this.balances.get(userId)?.[baseAsset].available = this.balances.get(userId)?.[baseAsset].available - (Number(quantity));
            //@ts-ignore
            this.balances.get(userId)?.[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked + (Number(quantity));
        }
    }
}