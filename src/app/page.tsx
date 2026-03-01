
"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { MOCK_SALONS } from "@/app/lib/mock-data";
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
import { MapPin, Star, Scissors, Clock, SearchX, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const salonsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "salons"), where("isPaid", "==", true), where("isAuthorized", "==", true));
  }, [db]);

  const { data: dbSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);

  const allSalons = useMemo(() => {
    const real = dbSalons || [];
    return [...real, ...MOCK_SALONS.filter(s => s.isAuthorized && s.isPaid)];
  }, [dbSalons]);

  const cities = useMemo(() => {
    if (stateFilter === "all") return [];
    return INDIA_DATA[stateFilter] || [];
  }, [stateFilter]);

  const filteredSalons = allSalons.filter(salon => {
    const name = salon.name || "";
    const city = salon.city || "";
    const state = salon.state || "";

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                         city.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || state === stateFilter;
    const matchesCity = cityFilter === "all" || city === cityFilter;
    return matchesSearch && matchesState && matchesCity;
  });

  const handleStateChange = (val: string) => {
    setStateFilter(val);
    setCityFilter("all");
  };

  const heroImageData = PlaceHolderImages.find(img => img.id === 'hero');

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
      
      <section className="relative w-full overflow-hidden flex items-center justify-center bg-black min-h-[400px] md:min-h-[600px]">
        <div className="absolute inset-0 z-0">
          <Image 
            src={heroImageData?.imageUrl || "https://picsum.photos/seed/salonhero/1200/600"} 
            alt="Salon Hero" 
            fill 
            className="object-cover opacity-60"
            priority
            data-ai-hint={heroImageData?.imageHint || "salon hero"}
          />
        </div>
        
        <div className="container relative z-10 px-4 py-20 text-center">
          <div className="inline-block bg-black/60 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/10 shadow-2xl">
            <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-white sm:text-6xl drop-shadow-2xl">
              Find Your Perfect Style
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90 font-medium">
              Discover top-rated salons across India, view service menus, and book appointments instantly.
            </p>
          </div>
          
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl bg-card p-4 shadow-2xl sm:flex-row items-center border border-primary/10">
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
              
              <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-all active:scale-95">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Available Salons</h2>
            <p className="text-muted-foreground">
              {isSalonsLoading ? "Refreshing listings..." : `Showing ${filteredSalons.length} professional outlets`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => (
            <Link key={salon.id} href={`/salons/${salon.id}`} className="block group">
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-[2rem] border-primary/5">
                <div className="relative h-56 w-full">
                  <Image 
                    src={salon.imageUrl || "https://picsum.photos/seed/salon1/600/400"} 
                    alt={salon.name || "Salon"} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint="salon"
                  />
                  <Badge className="absolute left-4 top-4 bg-primary text-white hover:bg-primary shadow-lg rounded-full px-3">
                    Verified
                  </Badge>
                  <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-md">
                     <Star className="h-4 w-4 fill-current text-yellow-500" />
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors font-bold">{salon.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    {salon.landmark ? `${salon.landmark}, ` : ""}{salon.city}, {salon.state}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {salon.services?.slice(0, 3).map((s: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-muted text-[10px] font-medium rounded-lg">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Closes at 9:00 PM
                  </p>
                </CardContent>

                <CardFooter className="pt-0 border-t bg-muted/20 mt-auto px-6 py-4 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Starts from</span>
                      <span className="text-lg font-black text-primary">
                        {salon.services && salon.services.length > 0 
                          ? `₹${Math.min(...salon.services.map((s: any) => s.price))}`
                          : "Price on request"}
                      </span>
                   </div>
                   <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl font-bold">
                     Book Now
                   </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
          {filteredSalons.length === 0 && (
            <div className="col-span-full py-20 text-center bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">No salons found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-white mt-20 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 font-headline text-2xl font-bold text-primary mb-6">
            <Scissors className="h-6 w-6 text-primary" />
            Salon Chair
          </div>
          <p className="text-muted-foreground mb-8">© 2026 Salon Chair Marketplace. Built for style.</p>
        </div>
      </footer>
    </div>
  );
}
