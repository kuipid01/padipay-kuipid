import { UseQueryResult, useQuery } from "@tanstack/react-query"
interface RequestInit {
    key?:string,
    
}
export const useFetch = <T>(url:string, options?:RequestInit) : UseQueryResult<T> => {
    const query = useQuery<T>({
        queryKey:[options?.key],
            queryFn: async () => {
                const res = await fetch(url)
                if (!res.ok) throw new Error("Failed to fetch data")
                return res.json()
            }   
    })
    return query
}