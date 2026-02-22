
"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS, Salon } from "@/app/lib/mock-data";
import { INDIA_DATA, INDIA_STATES } from "@/app/lib/india-data";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Scissors, Info, Clock, SearchX, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const cities = useMemo(() => {
    if (stateFilter === "all") return [];
    return INDIA_DATA[stateFilter] || [];
  }, [stateFilter]);

  const filteredSalons = MOCK_SALONS.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(search.toLowerCase()) || 
                         salon.city.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || salon.state === stateFilter;
    const matchesCity = cityFilter === "all" || salon.city === cityFilter;
    return matchesSearch && matchesState && matchesCity && salon.isAuthorized && salon.isPaid;
  });

  const handleStateChange = (val: string) => {
    setStateFilter(val);
    setCityFilter("all");
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden flex items-center justify-center bg-primary/5">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/seed/hero/1200/600" 
            alt="Salon Hero" 
            fill 
            className="object-cover opacity-20"
            data-ai-hint="luxury salon"
          />
        </div>
        <div className="container relative z-10 px-4 text-center">
          <h1 className="mb-6 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Find Your Perfect Style
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Discover top-rated salons across India, view service menus, and book appointments instantly.
          </p>
          
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl bg-card p-4 shadow-2xl sm:flex-row items-center">
            <div className="w-full sm:flex-1">
              <Input 
                placeholder="Search salon names..." 
                className="h-12 border-none bg-muted/50 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
              <Select value={stateFilter} onValueChange={handleStateChange}>
                <SelectTrigger className="h-12 w-full sm:w-[200px] border-none bg-muted/50">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {INDIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select 
                value={cityFilter} 
                onValueChange={setCityFilter}
                disabled={stateFilter === "all"}
              >
                <SelectTrigger className="h-12 w-full sm:w-[200px] border-none bg-muted/50">
                  <SelectValue placeholder={stateFilter === "all" ? "Choose State First" : "Select City"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Button className="h-12 px-8 bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Available Salons</h2>
            <p className="text-muted-foreground">
              {filteredSalons.length > 0 
                ? `Showing ${filteredSalons.length} professional outlets` 
                : "No salons matching your criteria"}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-white">Featured</Badge>
            <Badge variant="outline" className="px-3 py-1 bg-white">Top Rated</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => (
            <Card key={salon.id} className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="relative h-56 w-full">
                <Image 
                  src={salon.imageUrl} 
                  alt={salon.name} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105"
                  data-ai-hint="salon front"
                />
                <Badge className="absolute left-4 top-4 bg-primary text-white hover:bg-primary shadow-lg">
                  Verified
                </Badge>
                <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md hover:bg-accent hover:text-white transition-colors cursor-pointer">
                   <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{salon.name}</CardTitle>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {salon.landmark}, {salon.city}, {salon.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="mb-4 flex flex-wrap gap-2">
                  {salon.services.slice(0, 3).map((s, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-muted text-[10px] font-normal">
                      {s.name}
                    </Badge>
                  ))}
                  {salon.services.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{salon.services.length - 3} more</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Closes at 9:00 PM
                </p>
              </CardContent>
              <CardFooter className="pt-0 border-t bg-muted/20 mt-4 px-6 py-4 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium">Starts from</span>
                    <span className="text-lg font-bold text-foreground">₹{Math.min(...salon.services.map(s => s.price))}</span>
                 </div>
                 <Link href={`/salons/${salon.id}`}>
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                      Book Now
                    </Button>
                 </Link>
              </CardFooter>
            </Card>
          ))}
          
          {filteredSalons.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <SearchX className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-semibold">No salons found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any salons in {cityFilter !== 'all' ? cityFilter : stateFilter !== 'all' ? stateFilter : 'this area'}. Try broadening your search.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setStateFilter("all"); setCityFilter("all"); }}>
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-headline text-2xl font-bold text-primary mb-6">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
                Salon Chair
              </div>
              <p className="text-muted-foreground max-w-md">
                Empowering Indian salons with a modern digital booking platform. Find local experts and book your next style transformation in seconds.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Find Salons</Link></li>
                <li><Link href="/owner/dashboard" className="hover:text-primary transition-colors">For Shop Owners</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-xs text-muted-foreground">
            © 2024 Salon Chair Marketplace. Built for the modern grooming industry.
          </div>
        </div>
      </footer>
    </div>
  );
}
