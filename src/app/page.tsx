
"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS, Salon } from "@/app/lib/mock-data";
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
import { MapPin, Star, Scissors, Info, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const states = useMemo(() => Array.from(new Set(MOCK_SALONS.map(s => s.state))), []);
  const cities = useMemo(() => {
    const filteredByState = stateFilter === "all" ? MOCK_SALONS : MOCK_SALONS.filter(s => s.state === stateFilter);
    return Array.from(new Set(filteredByState.map(s => s.city)));
  }, [stateFilter]);

  const filteredSalons = MOCK_SALONS.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(search.toLowerCase()) || 
                         salon.city.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || salon.state === stateFilter;
    const matchesCity = cityFilter === "all" || salon.city === cityFilter;
    return matchesSearch && matchesState && matchesCity && salon.isAuthorized && salon.isPaid;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center bg-primary/5">
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
            Discover top-rated salons, view service menus, and book appointments instantly.
          </p>
          
          <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-xl bg-card p-4 shadow-xl sm:flex-row">
            <div className="flex-1">
              <Input 
                placeholder="Search by name or locality..." 
                className="h-12 border-none bg-muted/50 focus-visible:ring-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:w-1/2">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="h-12 border-none bg-muted/50">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-12 border-none bg-muted/50">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Available Salons</h2>
            <p className="text-muted-foreground">Showing {filteredSalons.length} professional outlets in your area</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1">Featured</Badge>
            <Badge variant="outline" className="px-3 py-1">Newest</Badge>
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
                  {salon.landmark}, {salon.city}
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
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <Scissors className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-semibold">No salons found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search keywords.</p>
              <Button variant="link" onClick={() => { setSearch(""); setStateFilter("all"); setCityFilter("all"); }}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 font-headline text-2xl font-bold text-primary mb-6">
            <Scissors className="h-6 w-6 text-primary" />
            SalonVerse
          </div>
          <p className="text-muted-foreground mb-8">Empowering local salons with digital booking solutions.</p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">About Us</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/owner/dashboard" className="text-primary font-medium">For Salon Owners</Link>
          </div>
          <div className="mt-8 pt-8 border-t text-xs text-muted-foreground">
            © 2024 SalonVerse Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
