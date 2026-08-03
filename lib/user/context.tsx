"use client"

import { createContext, useContext } from "react"
import { User, UserState } from "./types"

export interface UserContextType extends UserState {
  fetchUser: () => Promise<User | null>
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within UserProvider")
  }
  return context
}
