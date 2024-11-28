"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.BASE_CURRENCY = void 0;
const RedisManager_1 = require("../RedisManager");
const types_1 = require("../types/types");
const OrderBook_1 = require("./OrderBook");
const fs_1 = __importDefault(require("fs"));
exports.BASE_CURRENCY = "INR";
class Engine {
    constructor() {
        this.orderbooks = [];
        this.balances = new Map();
        let snapshot = null;
        try {
            snapshot = fs_1.default.readFileSync("./snapshot.json");
        }
        catch (e) {
            console.log("No snapshot found");
        }
        if (snapshot) {
            const sp = JSON.parse(snapshot.toString());
            this.orderbooks = sp.orderbooks.map((o) => new OrderBook_1.OrderBook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(sp.balances);
        }
        else {
            this.orderbooks = [new OrderBook_1.OrderBook("TATA", [], [], 0, 0)];
            this.setBaseBalance();
        }
        setInterval(() => {
            this.saveSnapShot();
        }, 1000 * 3);
    }
    saveSnapShot() {
        const sp = {
            orderbooks: this.orderbooks.map(o => o.getSnapShot()),
            balances: Array.from(this.balances.entries())
        };
        fs_1.default.writeFileSync("./snapshot.json", JSON.stringify(sp));
    }
    setBaseBalance() {
        this.balances.set("1", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("2", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("5", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
    }
    process({ message, clientId }) {
        switch (message.type) {
            case types_1.CREATE_ORDER:
                try {
                    const { executedQty, fills, orderId } = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.ORDER_PLACED,
                        payLoad: {
                            orderId, executedQty, fills
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.ORDER_CANCELLED,
                        payLoad: {
                            orderId: "",
                            executedQty: 0,
                            remaininyQty: 0
                        }
                    });
                }
                break;
            case types_1.CANCEL_ORDER:
                try {
                    const orderId = message.data.orderId;
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.ticker() === market);
                    const quoteAsset = market.split("_")[1];
                    if (!orderbook) {
                        throw new Error("No orderbook found for that market");
                    }
                    const order = orderbook.asks.find(o => o.orderId === orderId) || orderbook.bids.find(o => o.orderId === orderId);
                    if (!order) {
                        throw new Error("No order found with that orderId");
                    }
                    if (order.side === "buy") {
                        const price = orderbook.cancelBid(order);
                        const leftAmount = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].available += leftAmount;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].locked -= leftAmount;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), market);
                        }
                    }
                    else {
                        const price = orderbook.cancelAsk(order);
                        const leftAmount = (order.quantity - order.filled);
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftAmount;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftAmount;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), market);
                        }
                    }
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.ORDER_CANCELLED,
                        payLoad: {
                            orderId, executedQty: 0, remainingQty: 0
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case types_1.GET_OPEN_ORDERS:
                try {
                    const orderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if (!orderbook) {
                        throw new Error("No orderbook is found in get-open-orders");
                    }
                    const openOrders = orderbook.getOpenOrders(message.data.userId);
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.OPEN_ORDERS,
                        payLoad: openOrders
                    });
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case types_1.ON_RAMP:
                const userId = message.data.userId;
                const amount = message.data.amount;
                this.onRamp(userId, amount);
                break;
            case types_1.GET_DEPTH:
                try {
                    const orderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if (!orderbook) {
                        throw new Error("No orderbook is found in getDepth");
                    }
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.DEPTH,
                        payLoad: orderbook.getDepth()
                    });
                }
                catch (e) {
                    console.log(e);
                    RedisManager_1.RedisManager.getInstance().sendToAPI(clientId, {
                        type: types_1.DEPTH,
                        payLoad: {
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
        }
    }
    sendUpdatedDepthAt(price, market) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            throw new Error("the orderBook is not found for the market");
        }
        const depth = orderbook.getDepth();
        const updateBids = depth.bids.filter(o => o[0] === price);
        const updateAsks = depth.asks.filter(o => o[0] === price);
        RedisManager_1.RedisManager.getInstance().publicMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updateAsks.length ? updateAsks : [[price, "0"]],
                b: updateBids.length ? updateBids : [[price, "0"]],
                e: "Depth"
            }
        });
    }
    onRamp(userId, amount) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [exports.BASE_CURRENCY]: {
                    available: Number(amount),
                    locked: 0
                }
            });
        }
        else {
            userBalance[exports.BASE_CURRENCY].available += Number(amount);
        }
    }
    createOrder(market, price, quantity, side, userId) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];
        if (!orderbook) {
            throw new Error("No orderbook is found to create an order");
        }
        this.checkAndLockFund(baseAsset, quoteAsset, side, userId, price, quantity);
        const order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId
        };
        const { fills, executedQty } = orderbook.addOrder(order);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);
        this.createDbTrades(fills, market, userId);
        this.publishWSDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);
        this.updateDbOrders(order, executedQty, fills, market);
        return { executedQty, fills, orderId: order.orderId };
    }
    publishWsTrades(fills, userId, market) {
        fills.forEach(x => {
            RedisManager_1.RedisManager.getInstance().publicMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: x.tradeId,
                    m: x.otherUserId === userId,
                    p: x.price,
                    q: x.quatity.toString(),
                    s: market
                }
            });
        });
    }
    updateDbOrders(order, executedQty, fills, market) {
        RedisManager_1.RedisManager.getInstance().pushMessage({
            type: types_1.ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side
            }
        });
        fills.forEach(fill => {
            RedisManager_1.RedisManager.getInstance().pushMessage({
                type: types_1.ORDER_UPDATE,
                data: {
                    orderId: fill.makerOrderId,
                    executedQty: fill.quatity
                }
            });
        });
    }
    publishWSDepthUpdates(fills, price, side, market) {
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if (!orderbook) {
            throw new Error("No order book is found with that market stamp");
        }
        const depth = orderbook.getDepth();
        if (side === "buy") {
            const updatedAsks = depth.asks.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updateBids = depth.bids.find(x => x[0] === price);
            RedisManager_1.RedisManager.getInstance().publicMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks,
                    b: updateBids ? [updateBids] : [],
                    e: "depth"
                }
            });
        }
        else {
            const updatedBids = depth.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updatedAsks = depth.asks.find(x => x[0] === price);
            RedisManager_1.RedisManager.getInstance().publicMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updatedAsks ? [updatedAsks] : [],
                    b: updatedBids,
                    e: "depth"
                }
            });
        }
    }
    createDbTrades(fills, market, userId) {
        fills.forEach(o => {
            RedisManager_1.RedisManager.getInstance().pushMessage({
                type: types_1.TRADE_ADDED,
                data: {
                    market,
                    id: o.tradeId.toString(),
                    isBuyerMaker: o.otherUserId === userId,
                    price: o.price,
                    quantity: o.quatity.toString(),
                    quoteQuantity: (o.quatity * Number(o.price)).toString(),
                    timeStamp: Date.now()
                }
            });
        });
    }
    updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty) {
        if (side === "buy") {
            fills.forEach(o => {
                //@ts-ignore
                this.balances.get(o.otherUserId)[quoteAsset].available = this.balances.get(o.otherUserId)[quoteAsset].available + (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)[quoteAsset].locked - (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(o.otherUserId)[baseAsset].locked = this.balances.get(o.otherUserId)[baseAsset].locked - o.quatity;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + o.quatity;
            });
        }
        else {
            fills.forEach(o => {
                //@ts-ignore
                this.balances.get(o.otherUserId)[quoteAsset].locked = this.balances.get(o.otherUserId)[quoteAsset].locked - (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].available + (o.quatity * o.price);
                //@ts-ignore
                this.balances.get(o.otherUserId)[baseAsset].available = this.balances.get(o.otherUserId)[baseAsset].available + o.quatity;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)[baseAsset].locked - o.quatity;
            });
        }
    }
    checkAndLockFund(baseAsset, quoteAsset, side, userId, price, quantity) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (side === "buy") {
            if ((((_a = this.balances.get(userId)) === null || _a === void 0 ? void 0 : _a[quoteAsset].available) || 0) < Number(quantity) * Number(price)) {
                throw new Error("Insufficient balance");
            }
            //@ts-ignore
            (_b = this.balances.get(userId)) === null || _b === void 0 ? void 0 : _b[quoteAsset].available = ((_c = this.balances.get(userId)) === null || _c === void 0 ? void 0 : _c[quoteAsset].available) - (Number(quantity) * Number(price));
            //@ts-ignore
            (_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[quoteAsset].locked = ((_e = this.balances.get(userId)) === null || _e === void 0 ? void 0 : _e[quoteAsset].locked) + (Number(quantity) * Number(price));
        }
        else {
            if ((((_f = this.balances.get(userId)) === null || _f === void 0 ? void 0 : _f[baseAsset].available) || 0) < Number(quantity)) {
                throw new Error("Insufficient balance");
            }
            //@ts-ignore
            (_g = this.balances.get(userId)) === null || _g === void 0 ? void 0 : _g[baseAsset].available = ((_h = this.balances.get(userId)) === null || _h === void 0 ? void 0 : _h[baseAsset].available) - (Number(quantity));
            //@ts-ignore
            (_j = this.balances.get(userId)) === null || _j === void 0 ? void 0 : _j[baseAsset].locked = ((_k = this.balances.get(userId)) === null || _k === void 0 ? void 0 : _k[baseAsset].locked) + (Number(quantity));
        }
    }
}
exports.Engine = Engine;
