import { useEffect, useRef } from "react"
import { createChart } from "lightweight-charts"

export function TradingViewChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(255, 255, 255, 0.9)",
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.1)" },
          horzLines: { color: "rgba(255, 255, 255, 0.1)" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      })

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      })

      // Sample data - replace with real data
      candlestickSeries.setData([
        { time: "2023-01-01", open: 3500, high: 3600, low: 3300, close: 3400 },
        { time: "2023-01-02", open: 3400, high: 3700, low: 3350, close: 3650 },
        // Add more data points...
      ])

      chartRef.current = chart

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth })
        }
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        chart.remove()
      }
    }
  }, [])

  return <div ref={chartContainerRef} />
}

