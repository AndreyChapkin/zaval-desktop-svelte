import axios, { type AxiosResponse } from "axios";

function asEncodedParams(params: Record<string, any> | null): Record<string, any> | null {
    if (params) {
        let encodedParams = {} as Record<string, any>;
        Object.entries(params).forEach(([key, value]) => {
            encodedParams[key] = encodeURI(value);
        });
        return encodedParams;
    }
    return null;
}

export async function callGet<T>(url:string, params: Record<string, any> | null = null) {
    return await axios.get<T>(url, {
        params: asEncodedParams(params),
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