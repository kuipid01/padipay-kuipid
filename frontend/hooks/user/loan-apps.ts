

import { useFetch } from "../general"

export const  useGetUserLoanApps =  () => {

    const {data:loanApps , isLoading , error} = useFetch<{
loanApps:LoanApp[]
}>("/api/loan-apps", {key:"user-loan-apps"})
    return {loanApps , isLoading , error}
}


interface LoanApp {

            id: string
            ownerId: string
            name: string
            slug: string
            defaultInterestRate: string
            defaultDurationMonths: number
            isActive: boolean
            createdAt: string
        
}