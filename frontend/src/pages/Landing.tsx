import { Link } from 'react-router-dom'
import { Scissors, MapPin, Clock, Star, ArrowRight, Zap } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const features = [
  { icon: MapPin, title: 'Find Nearby Salons', desc: 'Browse verified salons in your area, filtered by location and category.' },
  { icon: Clock, title: 'Book a Slot Instantly', desc: 'Pick your service, choose a time slot, and confirm in under 60 seconds.' },
  { icon: Star, title: 'No More Waiting', desc: 'Walk in at your exact time. No queue, no surprise delays.' },
  { icon: Zap, title: 'For Salon Owners', desc: 'Register your salon, manage services, slots, and bookings all in one place.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-chair-card border border-chair-border rounded-full px-4 py-1.5 text-sm text-gray-400 mb-8">
          <Scissors size={14} className="text-chair-accent" />
          Chennai's Salon Booking Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Book Your{' '}
          <span className="text-chair-accent">Chair</span>
          <br />in Seconds
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Skip the queue. Browse salons, pick a slot, and walk in at your time.
          TheChair connects you to the best local salons — effortlessly.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/salons"
            className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
          >
            Find Salons <ArrowRight size={18} />
          </Link>
          <Link
            to="/register"
            className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5"
          >
            Register Your Salon
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[['500+', 'Salons'], ['10k+', 'Bookings'], ['Chennai', 'First']].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-chair-accent">{num}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-chair-surface border-t border-chair-border">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-14">
            Everything you need, <span className="text-chair-accent">nothing you don't</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:border-chair-accent/40 transition-colors">
                <div className="w-10 h-10 bg-chair-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-chair-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Own a salon in Chennai?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Join TheChair and get discovered by thousands of customers looking to book today.
          Free to register, no monthly fee.
        </p>
        <Link to="/register" className="btn-primary text-base px-8 py-3.5">
          Register Your Salon — It's Free
        </Link>
      </section>

      <footer className="border-t border-chair-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Scissors size={16} className="text-chair-accent" />
            <span>TheChair © 2025</span>
          </div>
          <span>Made in Chennai</span>
        </div>
      </footer>
    </div>
  )
}
