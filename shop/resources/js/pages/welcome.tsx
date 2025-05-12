import { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const navBg = scrolled ? 'bg-white/90 shadow-md backdrop-blur' : 'bg-transparent';
  const textColor = scrolled ? 'text-gray-900' : 'text-white';
  const hoverColor = scrolled ? 'hover:text-primary' : 'hover:text-primary-100';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Placeholder for logo */}
          <div className={`w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-lg ${textColor}`}>M</div>
          <span className={`ml-2 font-semibold text-lg ${textColor}`}>[Shop Name]</span>
        </div>
        {/* Desktop nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#services" className={`px-4 py-2 ${textColor} ${hoverColor} transition-colors`}>Services</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#contacts" className={`px-4 py-2 ${textColor} ${hoverColor} transition-colors`}>Contacts</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href={route('login')} className={`px-4 py-2 ${textColor} ${hoverColor} transition-colors`}>Login</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button asChild size="sm" className={`ml-2 ${scrolled ? '' : 'bg-white/20 text-white border-white/30 hover:bg-white/40 hover:text-black'}`}>
                <Link href={route('register')}>Register</Link>
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="text-white focus:outline-none focus:ring-2 focus:ring-primary">
                <MenuIcon size={32} className={textColor}/>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background text-foreground flex flex-col p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <span className="font-bold text-xl">[Shop Name]</span>
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-foreground">
                  <CloseIcon size={28} />
                </button>
              </div>
              <nav className="flex flex-col gap-2 px-6 py-8 text-lg">
                <a href="#services" onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-accent transition-colors">Services</a>
                <a href="#contacts" onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-accent transition-colors">Contacts</a>
                <a href={route('login')} onClick={() => setOpen(false)} className="py-3 px-2 rounded hover:bg-accent transition-colors">Login</a>
                <Button asChild className="mt-4 w-full">
                  <Link href={route('register')}>Register</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function ServicesSection() {
  // Example service data, replace image paths with your own
  const services = [
    {
      title: 'Book Appointments',
      description: 'Easily schedule maintenance or performance testing sessions for your motorcycle.',
      image: '/images/dealer.jpg', // placeholder path
      icon: (
        <svg className="w-12 h-12 text-primary/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
      ),
    },
    {
      title: 'Job Tracking',
      description: "Track the status of your motorcycle's work and access service history and invoices.",
      image: '/images/dealer.jpg', // placeholder path
      icon: (
        <svg className="w-12 h-12 text-primary/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4m-5 4h18" /></svg>
      ),
    },
    {
      title: 'Inventory Management',
      description: 'Manage spare parts, suppliers, and mechanics with ease from your dashboard.',
      image: '/images/dealer.jpg', // placeholder path
      icon: (
        <svg className="w-12 h-12 text-primary/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v6H3V3zm0 6v12h18V9" /></svg>
      ),
    },
  ];

  return (
    <section id="services" className="py-40 bg-background flex flex-col items-center min-h-screen">
      <div className="mb-16 mt-8 flex flex-col items-center">
        <h2 className="text-6xl font-extrabold mb-6 text-center tracking-tight">Our Services</h2>
        <p className="text-2xl text-muted-foreground max-w-2xl text-center mb-8">
          Discover how our platform streamlines your motorcycle workshop experience. From easy appointment booking to real-time job tracking and inventory management, we provide everything you need for a modern, efficient garage. [Add your own subtitle here!]
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-[1600px] w-full px-8">
        {services.map((service, idx) => (
          <Card
            key={service.title}
            className="group relative overflow-hidden shadow-2xl hover:shadow-3xl transition-all border-0 bg-muted/60 hover:bg-muted/80 min-h-[600px] flex flex-col transform-gpu hover:scale-105 hover:-translate-y-2 duration-300 ring-0 hover:ring-8 hover:ring-primary/30"
            style={{ minHeight: 600 }}
          >
            <div className="relative h-80 w-full overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-90" />
              {/* Fancy floating icon overlay */}
              <div className="absolute top-6 right-6 z-20 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 drop-shadow-xl">
                {service.icon}
              </div>
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
            <CardHeader className="z-10 relative mt-8">
              <CardTitle className="text-4xl text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] group-hover:text-primary transition-colors font-extrabold tracking-tight">
                {service.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="z-10 relative text-2xl text-white/90 group-hover:text-white flex-1 flex items-center font-medium">
              {service.description}
            </CardContent>
          </Card>
        ))}
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

function LandingFooter() {
  return (
    <footer className="bg-black text-white pt-16 pb-6 px-4 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-12">
        {/* Logo and Socials */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <div className="mb-2">
            {/* Placeholder logo */}
            <div className="text-3xl font-extrabold tracking-widest">[LOGO]</div>
            <div className="text-sm tracking-widest mt-1">EXCLUSIVE SERVICES</div>
          </div>
          <div className="flex gap-6 mt-4 mb-2">
            <a href="#" className="hover:text-primary transition-colors"><FaFacebookF size={24} /></a>
            <a href="#" className="hover:text-primary transition-colors"><FaInstagram size={24} /></a>
          </div>
        </div>
        {/* Menu */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <div className="font-bold text-lg mb-2">Menu</div>
          <ul className="space-y-1 text-base">
            <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Our Location</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Claims Management</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Rent Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contacts</a></li>
          </ul>
        </div>
        {/* Services */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <div className="font-bold text-lg mb-2">Services</div>
          <ul className="space-y-1 text-base">
            <li><a href="#" className="hover:text-primary transition-colors">Body Shop</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Workshop</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Tire Service</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Car Rental</a></li>
          </ul>
        </div>
        {/* Contacts */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <div className="font-bold text-lg mb-2">Contacts</div>
          <ul className="space-y-1 text-base">
            <li>Tel: 0123 456789</li>
            <li>Whatsapp: 123 45 67 890</li>
            <li>Email: info@placeholder.com</li>
            <li>Address: 123 Placeholder St, City</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 mt-10 pt-4 text-center text-sm text-white/70">
        © Copyright [Your Company] | P.IVA 00000000000 |
      </div>
    </footer>
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
        <LandingFooter />
      </main>
    </>
  );
}
