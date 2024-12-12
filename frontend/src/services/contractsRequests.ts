import api from './axios'

/* Utils */
import { formatErrorResponse } from '@/lib/axiosRequestLib'

const URL = process.env.NEXT_PUBLIC_URL as string;

const CONTRACTS_ENDPOINT = process.env.NEXT_PUBLIC_CONTRACTS_ENDPOINT as string;

export const getContractsFromUsersRequest = async (userId: number): Promise<any> => {
    try {
        const response = await api.get(
            URL + CONTRACTS_ENDPOINT + `?owner_id=${userId}`
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const postContractForUserRequest = async (payload: any): Promise<any> => {
    try {
        const response = await api.post(
            URL + CONTRACTS_ENDPOINT,
            payload
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const updateContractForUserRequest = async (payload: any, contractId : number): Promise<any> => {
    try {
        const response = await api.put(
            URL + CONTRACTS_ENDPOINT + `?id=${contractId}`,
            payload
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const deleteContractRequest = async (contractId: number): Promise<any> => {
    try {
        const response = await api.delete(
            URL + CONTRACTS_ENDPOINT + `?id=${contractId}`
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}