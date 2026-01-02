import axios from "axios";
import { API_URL } from "../config";

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
};

// ------- Calls API -------

export async function registerUser({ pseudo, birth_date, email, password }) {
    const res = await api.post("/user/register", {
        pseudo,
        birth_date,
        email,
        password,
    });
    return res.data;
}

export async function loginUserApi({ email, password }) {
    const res = await api.post("/user/login", {
        email,
        password,
    });
    return res.data;
}

export async function fetchMe() {
    const res = await api.get("/user/");
    return res.data;
}

export async function deleteMyAccount() {
    const res = await api.delete("/user/");
    return res.data;
}
