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
  
    useEffect( ()=> {
      const fetchTrades = async () => {
        try {
          const res = await axios.get("http://localhost:6969/api/v1/depth"); // Replace with your API endpoint
          console.log(res);
          setAsks(res.data.asks);
          setBids(res.data.bids);
        } catch (error) {
          console.error("Failed to fetch trades:", error);
        }
      };
      fetchTrades();
      const ws = new WebSocket("ws://localhost:3001");
      ws.onopen = () => {
        const message = {
          method: "SUBSCRIBE",
          params: ["depth@TATA_INR"]
        };
        ws.send(JSON.stringify(message));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.stream === "depth@TATA_INR" && data.data) {
          const { a: newAsks, b: newBids } = data.data;
          setAsks(newAsks);
          setBids(newBids);
        }
      };
      return () => {
        ws.close();
      };
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
  