import { useState } from 'react';

export default function EventForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
        name,
        scheduled_date: date,
        location,
        description,
        max_capacity: capacity ? parseInt(capacity, 10) : undefined
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Nom</label>
      <input value={name} onChange={e => setName(e.target.value)} required />

      <label>Date</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

      <label>Lieu</label>
      <input value={location} onChange={e => setLocation(e.target.value)} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} />

      <label>Capacité</label>
      <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />

      <button type="submit">Créer l’événement</button>
    </form>
  );
}
