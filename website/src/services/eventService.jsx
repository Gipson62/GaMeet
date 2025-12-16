const API_URL = "http://localhost:3001/v1/event";

export async function fetchEvents() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erreur lors du chargement des events");
    return await res.json();
  } catch (err) {
    console.error(" getEvents error:", err);
    throw err;
  }
}

export async function fetchEvent(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Event introuvable");
    return await res.json();
  } catch (err) {
    console.error(` getEvent(${id}) error:`, err);
    throw err;
  }
}

export async function createEvent(data) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la création");
    return await res.json();
  } catch (err) {
    console.error(" createEvent error:", err);
    throw err;
  }
}

export async function updateEvent(id, data) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur lors de la modification");
    return await res.json();
  } catch (err) {
    console.error(` updateEvent(${id}) error:`, err);
    throw err;
  }
}

export async function deleteEvent(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur lors de la suppression");
    return true;
  } catch (err) {
    console.error(` deleteEvent(${id}) error:`, err);
    throw err;
  }
}
