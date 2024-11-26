import { BASE_CURRENCY } from "./Engine";


export interface Fill{
    price:string,
    quatity:number,
    tradeId:number,
    otherUserId:string,
    makerOrderId:string
}

export interface Order{
    price:number,
    quantity:number,
    orderId:string,
    filled: number,
    side: "buy" | "sell",
    userId: string
}

export class OrderBook{
    bids: Order[];
    asks: Order[];
    baseAsset: string;
    quoteAsset: string = BASE_CURRENCY;
    lastTradeId : number;
    currentPrice : number;

    constructor(baseAsset: string, bids: Order[], asks: Order[], lastTradeId: number, currentPrice: number){
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice ||0;
    }

    ticker(){
        return `${this.baseAsset}_${this.quoteAsset}`;  // this returns the current price of the last Trade happened
    }

    getSnapShot(){
        return{
            baseAssest: this.baseAsset,
            bids:this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }
    addOrder(order: Order): {executedQty : number, fills: Fill[]}{
        if(order.side === "buy"){
            const {executedQty,fills} = this.matchBid(order);
            order.filled = executedQty;
            if(executedQty == order.quantity){
                return {
                    executedQty,fills
                }
            }
            this.bids.push(order);
            return {
                executedQty,fills
            }
        } else {
            const {executedQty,fills} = this.matchAsk(order);
            order.filled =executedQty;
            if(executedQty == order.quantity){
                return { executedQty,fills}
            }
            this.asks.push(order);
            return { executedQty,fills }
        }
    }
    matchBid(order:Order) : {executedQty : number, fills: Fill[]}{
        const fills: Fill[] = [];
        let exec = 0;
        this.asks.sort();
        console.log(this.asks);
        for(let i=0;i < this.asks.length ; i++){
            if (this.asks[i].price <= order.price && exec < order.quantity){
                const filledQty = Math.min(this.asks[i].quantity,(order.quantity - exec));
                exec+=filledQty;
                this.asks[i].filled+=filledQty;
                fills.push({
                    price: this.asks[i].price.toString(),
                    quatity: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId : this.asks[i].userId,
                    makerOrderId: this.asks[i].orderId
                })
            }
        }
        for(let i=0;i < this.asks.length ; i++){
            if(this.asks[i].filled === this.asks[i].quantity){
                this.asks.splice(i,1);
                i--;
            }
        }
        return {
            fills,executedQty : exec
        }
    }

    matchAsk(order: Order) : {executedQty : number,fills: Fill[]}{
        const fills: Fill[] = [];
        let executedQty = 0;
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].price >= order.price && executedQty < order.quantity) {
                const amountRemaining = Math.min(order.quantity - executedQty, this.bids[i].quantity);
                executedQty += amountRemaining;
                this.bids[i].filled += amountRemaining;
                fills.push({
                    price: this.bids[i].price.toString(),
                    quatity: amountRemaining,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.bids[i].userId,
                    makerOrderId: this.bids[i].orderId
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].filled === this.bids[i].quantity) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        };
    }


    getDepth(){
        const bids : [string,string][] = [];
        const asks : [string,string][] = [];
        const bidObj : {[key: string] : number} = {};
        const askObj : {[key: string] : number} = {};

        for(let i = 0; i < this.bids.length ; i++){
            const order = this.bids[i];
            if(!bidObj[order.price]){
                bidObj[order.price] = 0;
            }
            bidObj[order.price] += order.quantity;
        }

        for(let i = 0; i < this.asks.length ; i++){
            const order = this.asks[i];
            if(!askObj[order.price]){
                askObj[order.price] = 0;
            }
            askObj[order.price] += order.quantity;
        }
        for(const price in bidObj){
            bids.push([price,bidObj[price].toString()]);
        }
        for(const price in askObj){
            asks.push([price,askObj[price].toString()]);
        }
        return {bids,asks}
    }

    getOpenOrders(userId:string):Order[]{
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.bids.filter(x => x.userId === userId);
        console.log(...asks);
        return [...asks,...bids]
    }

    cancelBid(order: Order){
        const index = this.bids.findIndex(x => x.orderId === order.orderId);
        if(index != -1){
            const price = this.bids[index].price;
            this.bids.splice(index,1);
            return price;
        }
    }

    cancelAsk(order: Order){
        const index = this.asks.findIndex(x => x.orderId === order.orderId);
        if(index != -1){
            const price = this.bids[index].price;
            this.asks.splice(index,1);
            return price;
        }
    }
}