
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scissors, User, MessageSquareText, LogOut, LayoutDashboard } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { ChairIcon } from "@/components/chair-icon"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const isOwner = pathname.startsWith('/owner')
  
  const handleFeedback = () => {
    const subject = encodeURIComponent("Salon Chair - Feedback/Suggestion")
    const body = encodeURIComponent("To the Salon Chair Team,\n\nI would like to suggest/report the following:\n\n")
    window.location.href = `mailto:support@salonchair.com?subject=${subject}&body=${body}`
  }

  const handleSignOut = () => {
    signOut(auth).then(() => {
      router.push('/')
    })
  }

  return (
    <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-md ${isOwner ? 'bg-background/90 border-border' : 'bg-background/80 border-border/40'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Scissors className="h-6 w-6 text-primary" />
          <div className="flex items-center gap-1">
            <span className="font-headline text-xl font-bold tracking-tight text-foreground">Salon Chair</span>
            <ChairIcon className="h-5 w-5 text-primary" />
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleFeedback} className="hidden lg:flex gap-2">
            <MessageSquareText className="h-4 w-4" />
            Feedback
          </Button>
          
          <Link href="/my-bookings" className="hidden sm:block">
            <Button variant="ghost" size="sm">My Bookings</Button>
          </Link>
          
          {!isOwner && (
            <Link href="/owner/dashboard" className="hidden md:block">
              <Button variant="outline" size="sm" className="font-semibold">
                Salon Owner
              </Button>
            </Link>
          )}
          
          {isUserLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/owner/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Owner Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
