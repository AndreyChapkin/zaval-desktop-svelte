import axios, { type AxiosResponse } from "axios";

export async function callGet<T>(url:string, params: Record<string, any> | null = null) {
    return await axios.get<T>(url, {
        params: params,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}

export async function callPost<T = void>(url:string, body: any) {
    return await axios.post<T>(url, body, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}

export async function callPatch<T = void>(url:string, body: any) {
    return await axios.patch<T>(url, body, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}

export async function callDelete<T = void>(url:string, body: any = null) {
    return await axios.delete<T>(url, {
        data: body,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });
}