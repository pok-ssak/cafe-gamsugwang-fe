"use client"

import { Home, Telescope, User, Newspaper } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    
    { href: "/explore", icon: Telescope, label: "탐색" },
    { href: "/", icon: Home, label: "홈" },
    { href: "/profile", icon: User, label: "프로필" },
    { href: "/feed", icon: Newspaper, label: "피드" },
  ]

  const checkIsActive = (path: string) => {
    if (path === '/profile') {
      return pathname.startsWith('/profile')
    }
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <nav className="max-w-2xl mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = checkIsActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-orange-400" : "text-gray-500",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
