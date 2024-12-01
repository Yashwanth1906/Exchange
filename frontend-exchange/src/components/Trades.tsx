import { useEffect, useState } from "react";

export function TradesView() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    // Set up WebSocket connection
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      // Subscribe to the trades stream for the specified market
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: ["trade@TATA_INR"], // Listening to trade events for TATA_INR
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Check if the message is for the trades stream
      if (message.stream === "trade@TATA_INR" && message.data) {
        const trade = message.data;
        console.log(trade);
        // Add the new trade to the top of the list
        //@ts-ignore
        setTrades((prevTrades) => [
          {
            price: trade.p, // Trade price
            quantity: trade.q, // Trade quantity
            side: trade.m ? "sell" : "buy", // Side based on 'm' flag (market maker flag)
            timestamp: new Date(), // Current timestamp for simplicity
          },
          ...prevTrades.slice(0, 49), // Keep only the latest 50 trades
        ]);
      }
    };

    // Clean up WebSocket connection on component unmount
    return () => ws.close();
  }, []);

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold">Recent Trades</h3>
      <div className="max-h-96 overflow-y-auto space-y-1">
        {trades.map((trade : any, index) => (
          <div
            key={index}
            className={`flex justify-between text-sm ${
              trade.side === "buy" ? "text-green-500" : "text-red-500"
            }`}
          >
            <span>{trade.price}</span>
            <span>{trade.quantity}</span>
            <span>{trade.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
