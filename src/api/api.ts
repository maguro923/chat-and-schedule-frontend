import axios from 'axios';
import {URL} from './config';

export interface LoginJsonInterface {
    email: string;
    password: string;
    deviceid: string;
    fcmtoken: string;
}

export interface RegisterJsonInterface {
    username: string;
    email: string;
    password: string;
    deviceid: string;
    fcmtoken: string;
}

export interface DeleteUserInterface {
    id: string;
    password: string;
    access_token: string;
    deviceid: string;
}

export interface RefreshJsonInterface {
    refresh_token: string;
    device_id: string;
}

/*export interface LoginResponseInterface {
    detail: string;
    access_token: string;
    access_token_expires: string;
    refresh_token: string;
    refresh_token_expires: string;
}*/

export async function login(userdata: LoginJsonInterface) {
    const [status,res] = await axios.post(
        `${URL}/auth/login`,
        userdata,
        {headers: {
            'Content-Type': 'application/json',
        }}
    )
        .then(res => {
            return [res.status,res.data];
        })
        .catch(error => {
            if (error.response === undefined) {
                console.error("Error:",error);
                return [-1, {"detail": "AxiosError"}];
            }else{
                return [error.response.status, error.response.data];
            }
        });
    return [status,res];
}

export async function register(userdata: RegisterJsonInterface) {
    const [status,res] = await axios.post(
        `${URL}/users`,
        userdata,
        {headers: {
            'Content-Type': 'application/json',
        }}
    )
        .then(res => {
            return [res.status,res.data];
        })
        .catch(error => {
            if (error.response === undefined) {
                console.error("Error:",error);
                return [-1, {"detail": "AxiosError"}];
            }else{
                return [error.response.status, error.response.data];
            }
        });
    return [status,res];
}

export async function deluser(userdata: DeleteUserInterface) {
    const [status,res] = await axios.delete(
        `${URL}/users/${userdata.id}`,
        {headers: {
            'Content-Type': 'application/json',
            'Access-Token': userdata.access_token,
            'Password': userdata.password,
            'Device-id': userdata.deviceid
        }}
    )
        .then(res => {
            return [res.status,res.headers];
        })
        .catch(error => {
            if (error.response === undefined) {
                console.error("Error:",error);
                return [-1, {"detail": "AxiosError"}];
            }else{
                return [error.response.status, error.response.data];
            }
        });
    return [status,res];
}

export async function refresh(userdata: RefreshJsonInterface) {
    const [status,res] = await axios.post(
        `${URL}/auth/refresh`,
        {},
        {headers: {
            'Content-Type': 'application/json',
            'refresh-token': userdata.refresh_token,
            'device-id': userdata.device_id
        }}
    )
        .then(res => {
            return [res.status,res.data];
        })
        .catch(error => {
            if (error.response === undefined) {
                console.error("Error:",error);
                return [-1, {"detail": "AxiosError"}];
            }else{
                return [error.response.status, error.response.data];
            }
        });
    return [status,res];
}

export async function get_usersinfo(access_token: string, user_id: string,participants: string[]) {
    console.log("get_usersinfo",participants,JSON.stringify(participants));
    const [status,res] = await axios.get(
        `${URL}/users`,
        {headers: {
            'Content-Type': 'application/json',
            'access-token': access_token,
            'user-id': user_id,
            'participants-id': JSON.stringify(participants)
        }}
    )
        .then(res => {
            return [res.status,res.data];
        })
        .catch(error => {
            if (error.response === undefined) {
                console.error("Error:",error);
                return [-1, {"detail": "AxiosError"}];
            }else{
                return [error.response.status, error.response.data];
            }
        });
    return [status,res];
}