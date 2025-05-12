import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

// Placeholder video background component
function VideoHero() {
  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        {/* Replace with actual video source */}
        <video
          className="w-full h-full object-cover opacity-60"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/dealer.jpg"
        >
          <source src="/videos/landing.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 text-center">
          [Shop Name Placeholder]
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-8 text-center max-w-2xl">
          Your one-stop solution for motorcycle workshop management
        </p>
        <Button asChild size="lg" className="bg-white/90 text-black font-semibold hover:bg-white">
          <Link href={route('register')}>Get Started</Link>
        </Button>
      </div>
    </div>
  );
}

// Transparent, sticky navbar that becomes solid on scroll
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all ${scrolled ? 'bg-white/90 shadow-md backdrop-blur' : 'bg-transparent'} `}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Placeholder for logo */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg text-gray-700">M</div>
          <span className="ml-2 font-semibold text-lg text-gray-900">[Shop Name]</span>
        </div>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#services" className="px-4 py-2 text-gray-700 hover:text-black">Services</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#contacts" className="px-4 py-2 text-gray-700 hover:text-black">Contacts</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href={route('login')} className="px-4 py-2 text-gray-700 hover:text-black">Login</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button asChild size="sm" className="ml-2">
                <Link href={route('register')}>Register</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-8 text-center">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Book Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            Easily schedule maintenance or performance testing sessions for your motorcycle.
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Job Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            Track the status of your motorcycle's work and access service history and invoices.
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
          </CardHeader>
          <CardContent>
            Manage spare parts, suppliers, and mechanics with ease from your dashboard.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ContactsSection() {
  return (
    <section id="contacts" className="py-24 bg-muted flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-8 text-center">Contact Us</h2>
      <div className="w-full max-w-2xl px-4">
        <Card className="p-8">
          <CardHeader>
            <CardTitle>Ready to join?</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input type="text" placeholder="Your Name" required />
              <Input type="email" placeholder="Your Email" required />
              <Input type="text" placeholder="Phone (optional)" />
              <Button type="submit" className="w-full">Register Now</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function Welcome() {
  return (
    <>
      <Head title="Welcome" />
      <LandingNavbar />
      <main className="flex flex-col">
        <VideoHero />
        <ServicesSection />
        <div className="flex justify-center">
          <Separator className="w-1/2 my-12" />
        </div>
        <ContactsSection />
      </main>
    </>
  );
}
