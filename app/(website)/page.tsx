import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Agendei Client Area</h1>
      <p className="text-muted-foreground">Find the best professionals.</p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Button>Book Now</Button>
      </div>
    </div>
  )
}