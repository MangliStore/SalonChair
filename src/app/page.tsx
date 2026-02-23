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
return query(collection(db, "salons"), where("isPaid", "==", true));
}, [db]);

const { data: dbSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);

const allSalons = useMemo(() => {
const real = dbSalons || [];
return [...real, ...MOCK_SALONS];
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
const isVisible = salon.isPaid;
return matchesSearch && matchesState && matchesCity && isVisible;
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

);
}
