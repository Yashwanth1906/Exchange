interface MarketStatsProps {
    price: number
    change: number
    high: number
    low: number
    volume: number
  }
  
  export function MarketStats({ price, change, high, low, volume }: MarketStatsProps) {
    return (
      <div className="border-b">
        <div className="container flex h-16 items-center space-x-8">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-medium">${price.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">24h Change</p>
            <p className={change >= 0 ? "text-green-500" : "text-red-500"}>
              {change >= 0 ? "+" : ""}{change}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">24h High</p>
            <p className="font-medium">${high.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">24h Low</p>
            <p className="font-medium">${low.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">24h Volume (USDC)</p>
            <p className="font-medium">{volume.toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }