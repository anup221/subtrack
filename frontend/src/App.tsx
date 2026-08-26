import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function App() {
  const [status, setStatus] = useState("checking...")

  useEffect(() => {
    fetch("http://localhost:8080/health")
      .then((res) => res.text())
      .then(setStatus)
      .catch(() => setStatus("backend unreachable"))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="glow-border w-80 text-center space-y-4">
        <h1 className="text-xl font-semibold">SubTrack</h1>
        <p className="text-sm text-[#8b8b9c]">Backend status: {status}</p>
        <Button>Get Started</Button>
      </Card>
    </div>
  )
}

export default App