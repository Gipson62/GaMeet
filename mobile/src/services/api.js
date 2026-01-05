import axios from "axios";
import { API_URL, BASE_URL } from "../config";

export const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
});

export const setAuthToken = (token) => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
};

export const buildPhotoUrl = (id) => `${API_URL}/photo/${id}`;
export const buildPhotoUploadUrl = (url) => `${BASE_URL}/uploads/${url}`;

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

export async function fetchGames() {
    const res = await api.get("/game");
    return res.data;
}

export async function fetchTags() {
    const res = await api.get("/tag");
    return res.data;
}

export const fetchTagsByGame = async (gameId) => {
  const res = await api.get(`/tag/game/${gameId}`);
  return res.data;
};

export const fetchGame = async (gameId) => {
    const res = await api.get(`/game/${gameId}`);
    return res.data;
}

export const addGameWithPhotos = async (gameData) => {
    const res = await api.post("/game/with-photos", gameData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export const addPhoto = async (photoData) => {
    const res = await api.post("/photo", photoData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export const updateEvent = async (eventData) => {
    const res = await api.patch(`/event/${eventData.id}`, eventData);
    return res.data;
}

export const addEvent = async (eventData) => {
    const res = await api.post("/event", eventData);
    return res.data;
}

export const fetchEvents = async () => {
    const res = await api.get("/event");
    return res.data;
}

export const fetchEventById = async (eventId) => {
    const res = await api.get(`/event/${eventId}`);
    return res.data;
}

export const joinEvent = async (eventId) => {
    const res = await api.post(`/event/${eventId}/join`);
    return res.data;
}

export const leaveEvent = async (eventId) => {
    const res = await api.delete(`/event/${eventId}/leave`);
    return res.data;
}

export const addReview = async (eventId, reviewData) => {
    const res = await api.post(`/event/${eventId}/review`, reviewData);
    return res.data;
}

export const deleteReview = async (reviewId) => {
    const res = await api.delete(`/review/${reviewId}`);
    return res.data;
}
