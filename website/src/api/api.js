// website/src/api/api.js
const API_BASE_URL = "http://localhost:3001/v1"; // URL de ton backend

export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/event/`); // Exemple de route
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des événements");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};
