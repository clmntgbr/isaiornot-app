"use client"

import { useAuth } from "@clerk/nextjs"
import { useCallback, useEffect, useReducer } from "react"
import { getUser } from "./api"
import { UserContext } from "./context"
import { userReducer } from "./reducer"
import { User, UserState } from "./types"

const initialState: UserState = {
  user: null,
  isLoading: true,
  error: null,
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const [state, dispatch] = useReducer(userReducer, initialState)

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      dispatch({ type: "GET_USER_LOADING", payload: true })
      const user = await getUser()
      dispatch({ type: "GET_USER", payload: user })
      return user
    } catch {
      dispatch({ type: "GET_USER_ERROR", payload: "Failed to fetch user" })
      return null
    } finally {
      dispatch({ type: "GET_USER_LOADING", payload: false })
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      dispatch({ type: "CLEAR_USER" })
      return
    }

    void fetchUser()
  }, [isLoaded, isSignedIn, fetchUser])

  return (
    <UserContext.Provider
      value={{
        ...state,
        isLoading: !isLoaded || (Boolean(isSignedIn) && state.isLoading),
        user: isSignedIn ? state.user : null,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
