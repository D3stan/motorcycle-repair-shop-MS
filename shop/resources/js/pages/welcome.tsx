import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Head, Link } from '@inertiajs/react';
import { X as CloseIcon, Menu as MenuIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';

// Placeholder video background component
function VideoHero() {
    return (
        <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                {/* Replace with actual video source */}
                <video className="h-full w-full object-cover opacity-60" autoPlay loop muted playsInline poster="/images/dealer.jpg">
                    <source src="/videos/landing.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center">
                <h1 className="mb-4 text-center text-5xl font-bold text-white drop-shadow-lg md:text-7xl">[Shop Name Placeholder]</h1>
                <p className="mb-8 max-w-2xl text-center text-xl text-white drop-shadow-lg md:text-2xl">
                    Your one-stop solution for motorcycle workshop management
                </p>
                <Button asChild size="lg" className="bg-white font-semibold text-black shadow-lg hover:bg-gray-100">
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
    const hoverColor = scrolled ? 'hover:text-primary' : 'hover:text-gray-900';

    return (
        <nav className={`fixed top-0 left-0 z-50 w-full transition-all ${navBg}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    {/* Placeholder for logo */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-black`}>M</div>
                    <span className={`ml-2 text-lg font-semibold ${textColor}`}>[Shop Name]</span>
                </div>
                {/* Desktop nav */}
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink href="#services" className={`px-4 py-2 ${textColor} ${hoverColor} transition-colors`}>
                                Services
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink href={route('login')} className={`px-4 py-2 ${textColor} ${hoverColor} transition-colors`}>
                                Login
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Button
                                asChild
                                size="sm"
                                className={`ml-2 ${scrolled ? '' : 'border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-black'}`}
                            >
                                <Link href={route('register')}>Register</Link>
                            </Button>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                {/* Mobile nav */}
                <div className="md:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button aria-label="Open menu" className="focus:ring-primary text-white focus:ring-2 focus:outline-none">
                                <MenuIcon size={32} className={textColor} />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="flex flex-col bg-white p-0 text-gray-900">
                            <div className="flex items-center justify-between border-b px-6 py-4">
                                <span className="text-xl font-bold">[Shop Name]</span>
                                <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-gray-900">
                                    <CloseIcon size={28} />
                                </button>
                            </div>
                            <nav className="flex flex-col gap-2 px-6 py-8 text-lg">
                                <a href="#services" onClick={() => setOpen(false)} className="rounded px-2 py-3 transition-colors hover:bg-gray-100">
                                    Services
                                </a>
                                <a
                                    href={route('login')}
                                    onClick={() => setOpen(false)}
                                    className="rounded px-2 py-3 transition-colors hover:bg-gray-100"
                                >
                                    Login
                                </a>
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
                <svg className="text-primary/80 h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
            ),
        },
        {
            title: 'Job Tracking',
            description: "Track the status of your motorcycle's work and access service history and invoices.",
            image: '/images/dealer.jpg', // placeholder path
            icon: (
                <svg className="text-primary/80 h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4m-5 4h18" />
                </svg>
            ),
        },
        {
            title: 'Inventory Management',
            description: 'Manage spare parts, suppliers, and mechanics with ease from your dashboard.',
            image: '/images/dealer.jpg', // placeholder path
            icon: (
                <svg className="text-primary/80 h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v6H3V3zm0 6v12h18V9" />
                </svg>
            ),
        },
    ];

    return (
        <section id="services" className="flex min-h-screen flex-col items-center bg-gray-50 py-40">
            <div className="mt-8 mb-16 flex flex-col items-center">
                <h2 className="mb-6 text-center text-6xl font-extrabold tracking-tight text-gray-900">Our Services</h2>
                <p className="mb-8 max-w-2xl text-center text-2xl text-gray-600">
                    Discover how our platform streamlines your motorcycle workshop experience. From easy appointment booking to real-time job tracking
                    and inventory management, we provide everything you need for a modern, efficient garage.
                </p>
            </div>
            <div className="grid w-full max-w-[1600px] grid-cols-1 gap-16 px-8 md:grid-cols-3">
                {services.map((service, idx) => (
                    <Card
                        key={service.title}
                        className="group hover:shadow-3xl hover:ring-primary/30 relative flex min-h-[600px] transform-gpu flex-col overflow-hidden border bg-white shadow-2xl ring-0 transition-all duration-300 hover:-translate-y-2 hover:scale-105 hover:bg-gray-50 hover:ring-8"
                        style={{ minHeight: 600 }}
                    >
                        <div className="relative h-80 w-full overflow-hidden">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="h-full w-full scale-100 object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-90" />
                            {/* Fancy floating icon overlay */}
                            <div className="absolute top-6 right-6 z-20 text-white opacity-90 drop-shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:opacity-100">
                                {service.icon}
                            </div>
                            {/* Subtle pattern overlay */}
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        </div>
                        <CardHeader className="relative z-10 mt-8">
                            <CardTitle className="group-hover:text-primary text-4xl font-extrabold tracking-tight text-gray-900 transition-colors">
                                {service.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 flex flex-1 items-center text-2xl font-medium text-gray-700 group-hover:text-gray-900">
                            {service.description}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function LandingFooter() {
    return (
        <footer className="mt-24 bg-black px-4 pt-16 pb-6 text-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start md:justify-between">
                {/* Logo and Socials */}
                <div className="flex flex-1 flex-col items-center md:items-start">
                    <div className="mb-2">
                        {/* Placeholder logo */}
                        <div className="text-3xl font-extrabold tracking-widest">[LOGO]</div>
                        <div className="mt-1 text-sm tracking-widest">EXCLUSIVE SERVICES</div>
                    </div>
                    <div className="mt-4 mb-2 flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">
                            <FaFacebookF size={24} />
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            <FaInstagram size={24} />
                        </a>
                    </div>
                </div>
                {/* Menu */}
                <div className="flex flex-1 flex-col items-center md:items-start">
                    <div className="mb-2 text-lg font-bold">Menu</div>
                    <ul className="space-y-1 text-base">
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Our Location
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Claims Management
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Rent Service
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Contacts
                            </a>
                        </li>
                    </ul>
                </div>
                {/* Services */}
                <div className="flex flex-1 flex-col items-center md:items-start">
                    <div className="mb-2 text-lg font-bold">Services</div>
                    <ul className="space-y-1 text-base">
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Body Shop
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Workshop
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Tire Service
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-primary transition-colors">
                                Car Rental
                            </a>
                        </li>
                    </ul>
                </div>
                {/* Contacts */}
                <div className="flex flex-1 flex-col items-center md:items-start">
                    <div className="mb-2 text-lg font-bold">Contacts</div>
                    <ul className="space-y-1 text-base">
                        <li>Tel: 0123 456789</li>
                        <li>Whatsapp: 123 45 67 890</li>
                        <li>Email: info@placeholder.com</li>
                        <li>Address: 123 Placeholder St, City</li>
                    </ul>
                </div>
            </div>
            <div className="mt-10 border-t border-white/20 pt-4 text-center text-sm text-white/70">
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
                <LandingFooter />
            </main>
        </>
    );
}
