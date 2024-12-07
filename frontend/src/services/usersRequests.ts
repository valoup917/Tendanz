import api from './axios'

/* Models */
import { LoginRequestModel } from './models/AuthRequestModel'

/* Utils */
import { formatErrorResponse } from '@/lib/axiosRequestLib'

const URL = process.env.NEXT_PUBLIC_URL as string;

const LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT as string;

export const userLoginRequest = async (payload: LoginRequestModel): Promise<string> => {
    try {
        const response = await api.post(
            URL + LOGIN_ENDPOINT,
            payload
        );
        const jwt = response.data.access_token;
        return jwt;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const getAllUsersRequest = async (): Promise<any> => {
    try {
        const response = await api.get(
            URL + "/users"
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const getContractsFromUsersRequest = async (userId: number): Promise<any> => {
    try {
        const response = await api.get(
            URL + `/contracts?owner_id=${userId}`
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const postContractForUserRequest = async (payload: any): Promise<any> => {
    try {
        const response = await api.post(
            URL + `/contracts`,
            payload
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}

export const deleteContractRequest = async (contractId: number): Promise<any> => {
    try {
        const response = await api.delete(
            URL + `/contracts?id=${contractId}`
        );
        return response.data;
    } catch (error: any) { throw formatErrorResponse(error) }
}