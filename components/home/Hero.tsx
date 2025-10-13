import Link from 'next/link'
import { Button } from '../ui/button'
import HeroCarousal from './HeroCarousal'

function Hero() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div>
        <h1 className="max-w-2xl font-bold text-4xl tracking-tight sm:text-6xl">
          Tired of ordering cricket kits. If so, This is the right place 
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
          Your e-commerce site for all the cricket equipments. Need a proper bat, ball or knee pads, gloves. You name it we got it
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link href="/products"> Our Products</Link>
        </Button>
      </div>
      <HeroCarousal />
    </section>
  )
}

export default Hero
