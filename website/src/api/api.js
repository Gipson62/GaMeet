// website/src/api/api.js
const API_BASE_URL = "http://localhost:3001/v1"; 
const API_URL_EVENT = API_BASE_URL + '/event';

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
