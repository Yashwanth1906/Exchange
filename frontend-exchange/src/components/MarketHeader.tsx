import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function MarketHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="font-bold">Exchange</Link>
          <nav className="flex items-center space-x-4">
            <Link to="/markets" className="text-muted-foreground hover:text-foreground">
              Markets
            </Link>
            <Link to="/trade" className="text-muted-foreground hover:text-foreground">
              Trade
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">Sign In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  )
}

