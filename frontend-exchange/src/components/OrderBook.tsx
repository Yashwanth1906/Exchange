interface OrderBookEntry {
    price: number
    size: number
    total: number
  }
  
  export function OrderBook() {
    const asks: OrderBookEntry[] = [
      { price: 3602.07, size: 14.4321, total: 28.9194 },
      { price: 3602.09, size: 6.1065, total: 14.4873 },
      { price: 3602.36, size: 0.7861, total: 8.3808 },
      // Add more ask orders...
    ]
  
    const bids: OrderBookEntry[] = [
      { price: 3597.36, size: 2.7761, total: 7.5947 },
      { price: 3597.13, size: 2.7765, total: 4.8186 },
      { price: 3596.92, size: 0.6000, total: 2.0423 },
      // Add more bid orders...
    ]
  
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
              <div>{ask.price}</div>
              <div>{ask.size}</div>
              <div>{ask.total}</div>
            </div>
          ))}
        </div>
        <div className="my-2 text-2xl font-bold">
          3,597.36
        </div>
        <div className="space-y-1">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-sm text-green-500">
              <div>{bid.price}</div>
              <div>{bid.size}</div>
              <div>{bid.total}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  