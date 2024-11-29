import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { BACKEND_URL } from "@/constants/constants"
import axios from "axios"
import { stringify } from "querystring"
import { useState } from "react"
import { data } from "react-router-dom"

interface TradeFormProps {
  type: "buy" | "sell"
}

export function TradeForm({ type }: TradeFormProps) {
  const [amount, setAmount] = useState("")
  const [price, setPrice] = useState("3597.36")
  const [percentage, setPercentage] = useState([0])
  
  const handleClick = async() =>{
    console.log("clicked")
    console.log(amount)
    console.log(price)
    await axios.post(`${BACKEND_URL}/api/v1/order`,{
        market:"TATA_INR",
        price:price,
        quantity: amount,
        side: type,
        userId: "1"
    }).then((res)=>{
      console.log(res);
      alert("Order placed successfully")
    }).catch((e)=>{
      console.log(e);
      alert(e);
    })
    
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className={type === "buy" ? "text-green-500" : "text-red-500"}>
          {type === "buy" ? "Buy" : "Sell"} ETH
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Price</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Percentage</label>
          <Slider
            value={percentage}
            onValueChange={setPercentage}
            max={100}
            step={1}
          />
        </div>
        <Button className="w-full" variant={type === "buy" ? "default" : "destructive"} onClick={handleClick}>
          {type === "buy" ? "Buy" : "Sell"} ETH
        </Button>
      </CardContent>
    </Card>
  )
}
