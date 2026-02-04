import { useFetch } from "../general"

export const  useGetUserSessions =  () => {

    const {data:userSessions , isLoading , error} = useFetch("api/settings", {key:"user-sessions"})
    return {userSessions , isLoading , error}
}