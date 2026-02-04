import { useFetch } from "../general"

export const  useGetUserSessions =  () => {

    const {data:userSessions , isLoading , error} = useFetch<Session[]>("/api/users/sessions", {key:"user-sessions"})
    return {userSessions , isLoading , error}
}

interface Session {
  id: string
  userId: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  city: string
          country: string
  deviceFingerprint: string
  isCurrent: boolean
  lastActiveAt: string
  createdAt: string
}