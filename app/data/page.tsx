"use client"

import { useAuth } from "@/hooks/useAuth"

export default function Data() {
  const { isAuthenticated } = useAuth()

  return (
    // ... existing code ...
  )
} 