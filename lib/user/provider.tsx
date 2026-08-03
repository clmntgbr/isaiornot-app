"use client"

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
    void fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider
      value={{
        ...state,
        fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
