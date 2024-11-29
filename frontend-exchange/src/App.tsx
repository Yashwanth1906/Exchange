// import { useState } from 'react'
import './App.css'
import { MarketHeader } from './components/MarketHeader'
import { MarketStats } from './components/MarktetStats'
import { TradeForm } from './components/TradeForm'
import { OrderBook } from './components/OrderBook'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingViewChart } from './components/TradingViewChart'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketHeader />
      <MarketStats 
        price={3597.36}
        change={5.44}
        high={3682.57}
        low={3598.18}
        volume={452217.93}
      />
      <div className="grid flex-1 grid-cols-4 gap-4 p-4">
        <div className="col-span-3 space-y-4">
          <Tabs defaultValue="trading" className="w-full">
            <TabsList>
              <TabsTrigger value="trading">Trading View</TabsTrigger>
              <TabsTrigger value="depth">Depth</TabsTrigger>
            </TabsList>
            <TabsContent value="trading" className="border rounded-lg p-4">
              <TradingViewChart />
            </TabsContent>
            <TabsContent value="depth">Depth Chart Content</TabsContent>
          </Tabs>
          <div className="grid grid-cols-2 gap-4">
            <TradeForm type="buy" />
            <TradeForm type="sell" />
          </div>
        </div>
        <div className="col-span-1">
          <OrderBook />
        </div>
      </div>
    </div>
  )
}

export default App
