"use client"

import { Map, Telescope, List, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    
    { href: "/explore", icon: Telescope, label: "탐색" },
    { href: "/list", icon: List, label: "목록" },
    { href: "/", icon: Map, label: "지도" },
    { href: "/profile", icon: User, label: "프로필" },
    { href: "/settings", icon: Settings, label: "설정" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
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
