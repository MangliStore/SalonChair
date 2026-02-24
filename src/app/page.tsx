
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
    // Show only salons that are PAID and AUTHORIZED by admin
    return query(
      collection(db, "salons"), 
      where("isPaid", "==", true),
      where("isAuthorized", "==", true)
    );
  }, [db]);

  const { data: dbSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);

  const allSalons = useMemo(() => {
    const real = dbSalons || [];
    // Only include mock salons if authorized and paid (they are in the mock file)
    return [...real, ...MOCK_SALONS.filter(s => s.isAuthorized && s.isPaid)];
  }, [dbSalons]);

  const cities = useMemo(() => {
    if (stateFilter === "all") return [];
    return INDIA_DATA[stateFilter] || [];
  }, [stateFilter]);

  const filteredSalons = allSalons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(search.toLowerCase()) || 
                         salon.city.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || salon.state === stateFilter;
    const matchesCity = cityFilter === "all" || salon.city === cityFilter;
    return matchesSearch && matchesState && matchesCity;
  });

  const handleStateChange = (val: string) => {
    setStateFilter(val);
    setCityFilter("all");
  };

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative w-full flex items-center justify-center bg-zinc-900 py-20">
        <div className="container px-4 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Find Your Perfect Style
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10">
            Discover verified professional salons across India. Only certified outlets are listed here.
          </p>
          
          <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-xl bg-card p-4 shadow-2xl sm:flex-row items-center border">
            <div className="w-full sm:flex-1">
              <Input 
                placeholder="Search salon names..." 
                className="h-12"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
              <Select value={stateFilter} onValueChange={handleStateChange}>
                <SelectTrigger className="h-12 w-full sm:w-[200px]">
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
                <SelectTrigger className="h-12 w-full sm:w-[200px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Button className="h-12 px-8 font-bold">Search</Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Verified Salons</h2>
          <p className="text-muted-foreground">
            {isSalonsLoading ? "Refreshing..." : `${filteredSalons.length} outlets currently live`}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => (
            <Card key={salon.id} className="group overflow-hidden">
              <div className="relative h-56 w-full">
                <Image 
                  src={salon.imageUrl || "https://picsum.photos/seed/salon1/600/400"} 
                  alt={salon.name} 
                  fill 
                  className="object-cover"
                />
                <Badge className="absolute left-4 top-4 bg-green-500 text-white">Verified</Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{salon.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {salon.city}, {salon.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {salon.services?.slice(0, 3).map((s: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[10px]">{s.name}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 border-t bg-muted/20 px-6 py-4 flex justify-between items-center">
                 <span className="text-lg font-bold">₹{salon.services?.[0]?.price || 0}+</span>
                 <Link href={`/salons/${salon.id}`}>
                    <Button>Book Now</Button>
                 </Link>
              </CardFooter>
            </Card>
          ))}
          {filteredSalons.length === 0 && !isSalonsLoading && (
            <div className="col-span-full py-20 text-center">
              <SearchX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">No active salons found</h3>
              <p className="text-muted-foreground">Either no salons match your criteria or they are awaiting admin verification.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
