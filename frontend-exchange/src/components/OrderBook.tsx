import { BACKEND_URL } from "@/constants/constants"
import axios from "axios"
import { useEffect, useState } from "react"

// interface OrderBookEntry {
//     price: number
//     size: number
//     total: number
//   }
  
  export function OrderBook() {
    const [asks,setAsks] = useState([]);
    const [bids,setBids]  = useState([])
  
    useEffect(() => {
      const fetchOrderBook = async () => {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/v1/depth?symbol=TATA_INR`);
          console.log(res.data)
          setAsks(res.data.asks);
          setBids(res.data.bids);
        } catch (error) {
          console.error("Failed to fetch order book:", error);
        }
      };
      fetchOrderBook();
    }, []);
    return (
      <div className="h-full rounded-lg border p-4">
        <div className="mb-4">
          <h3 className="font-semibold">Order Book</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
          <div>Price</div>
          <div>Size</div>
          <div>Total</div>
        </div>
        <div className="mt-2 space-y-1">
          {asks.map((ask, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm text-red-500">
              <div>{ask[0]}</div>
              <div>{ask[1]}</div>
              <div>{ask[2]}</div>
            </div>
          ))}
        </div>
        <div className="my-2 text-2xl font-bold">
          
        </div>
        <div className="space-y-1">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm text-green-500">
              <div>{bid[0]}</div>
              <div>{bid[1]}</div>
              <div>{bid[2]}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  