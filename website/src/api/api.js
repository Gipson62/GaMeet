

// website/src/api/api.js
const API_BASE_URL = "http://localhost:3001/v1"; 
const API_URL_EVENT = API_BASE_URL + '/event';
const API_URL_PHOTO = API_BASE_URL + '/photo';
const API_URL_TAG = API_BASE_URL + '/tag';
const API_URL_GAME = API_BASE_URL + '/game';

// Récupérer tous les événements
export const fetchEvents = async (token) => {
  const response = await fetch(API_URL_EVENT, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des événements');
  return response.json();
};

// Récupérer un événement par ID
export const fetchEventById = async (id, token) => {
  const response = await fetch(`${API_URL_EVENT}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement de l’événement');
  return response.json();
};

// Supprimer un événement
export const deleteEvent = async (id, token) => {
  const response = await fetch(`${API_URL_EVENT}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Impossible de supprimer l’événement');
  return true;
};

// ajouter un événement
export async function addEvent(eventData, token) {
  const res = await fetch('http://localhost:3001/v1/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
    
  });console.log('eventData:', eventData);
console.log(localStorage.getItem('token'));
  if (!res.ok) {
    const text = await res.text(); // texte brut en cas d'erreur
    throw new Error(text);
  }

  return res.json();
}
export async function updateEvent(id, eventData, token) {
  const res = await fetch(`${API_URL_EVENT}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return true;
}
// ========== GAMES ==========
// Récupérer tous les jeux
export const fetchGames = async (token) => {
  const response = await fetch(API_URL_GAME, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des jeux');
  return response.json();
};

// Récupérer un jeu par ID
export const fetchGameById = async (id, token) => {
  const response = await fetch(`${API_URL_GAME}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement du jeu');
  return response.json();
};

// Supprimer un jeu
export const deleteGame = async (id, token) => {
  const response = await fetch(`${API_URL_GAME}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Impossible de supprimer le jeu');
  return true;
};

// Ajouter un jeu
export async function addGame(gameData, token) {
  const res = await fetch(API_URL_GAME, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(gameData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Mettre à jour un jeu
export async function updateGame(id, gameData, token) {
  const res = await fetch(`${API_URL_GAME}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(gameData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return true;
}

// Construire une URL d'image à partir d'un id de photo (l'API renvoie directement le fichier)
export const buildPhotoUrl = (id) => `${API_URL_PHOTO}/${id}`;

// Tags d'un jeu
export const fetchTagsByGame = async (gameId, token) => {
  const response = await fetch(`${API_URL_TAG}/game/${gameId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des tags');
  return response.json();
};

// Liste de tous les tags
export const fetchTags = async (token) => {
  const response = await fetch(API_URL_TAG, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des tags');
  return response.json();
};

// Ajouter un tag
export async function addTag(tagData, token) {
  const res = await fetch(API_URL_TAG, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(tagData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

// Supprimer un tag par nom (l'API attend le paramètre comme identifiant)
export const deleteTag = async (name, token) => {
  const response = await fetch(`${API_URL_TAG}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Impossible de supprimer le tag");
  return true;
};

// ========== PHOTOS ==========
// Upload une photo
export async function uploadPhoto(file, token) {
  const formData = new FormData();
  formData.append('photo', file);
  
  const res = await fetch(API_URL_PHOTO, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: formData
});

const json = await res.json();
console.log('UPLOAD RESPONSE =', json);
return json;
}
/* ================= PARTICIPANTS ================= */

// Ajouter un participant à un event (admin)
export const addParticipant = async (eventId, userId, token) => {
  const res = await fetch(
    `http://localhost:3001/v1/event/${eventId}/participant`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id:userId }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Impossible d’ajouter le participant');
  }

  return true;
};

// Retirer un participant d’un event (admin)
export const removeParticipant = async (eventId, userId, token) => {
  const res = await fetch(
    `http://localhost:3001/v1/event/${eventId}/participant`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Impossible de retirer le participant');
  }

  return true;
};
export const fetchUsers = async (token) => {
  const res = await fetch('http://localhost:3001/v1/user/list', {
    
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Erreur récupération users');
  return res.json();
};


export const deleteReview  = async (reviewId, token) => {
  const res = await fetch(`http://localhost:3001/v1/review/${reviewId}`, {
    method: 'DELETE',
    headers: {  Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Impossible de supprimer le review');
  return true;
}