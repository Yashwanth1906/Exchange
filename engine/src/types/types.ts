import { Order } from "../businessLogic/OrderBook";

export const CREATE_ORDER = "CREATE_ORDER";
export const CANCEL_ORDER = "CANCEL_ORDER";
export const ON_RAMP = "ON_RAMP";
export const GET_DEPTH = "GET_DEPTH";
export const GET_OPEN_ORDERS = "GET_OPEN_ORDERS";
export const TRADE_ADDED = "TRADE_ADDED";
export const ORDER_UPDATE = "ORDER_UPDATE";

export type MessageFromApi = {    //Message from API server
        type: typeof CREATE_ORDER,
        data : {
            market: string,
            price: string,
            quantity: string,
            side: "buy" | "sell",
            userId: string
        }
    } | {
        type: typeof CANCEL_ORDER,
        data: {
            orderId: string,
            market: string,
        }
    } | {
        type: typeof ON_RAMP,
        data: {
            amount: string,
            userId: string,
            txnId: string
        }
    } | {
        type: typeof GET_DEPTH,
        data: {
            market: string,
        }
    } | {
        type: typeof GET_OPEN_ORDERS,
        data: {
            userId: string,
            market: string,
        }
    }

export const ORDER_PLACED = "ORDER_PLACED";
export const ORDER_CANCELLED = "ORDER_CANCELLED";
export const OPEN_ORDERS = "OPEN_ORDERS";
export const DEPTH = "DEPTH";

export type MessageToApi = {    // The message that is been delivered to the api server
    type: typeof DEPTH,
    payload: {
        bids: [string, string][],
        asks: [string, string][],
    }
} | {
    type: typeof ORDER_PLACED,
    payload: {
        orderId: string,
        executedQty: number,
        fills: {
            price: string,
            qty: number,
            tradeId: number
        }[]
    }
} | {
    type: typeof ORDER_CANCELLED,
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
} | {
    type: typeof OPEN_ORDERS,
    payload: Order[]
}