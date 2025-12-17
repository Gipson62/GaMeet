import { useEffect, useState } from 'react';
import { Card, message, Modal } from 'antd';
import EventsHeader from '../components/EventsHeader';
import EventsTable from '../components/EventsTable';
import EventForm from '../components/EventForm';
import { fetchEvents, deleteEvent, addEvent } from '../api/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents(localStorage.getItem('token'));
      setEvents(
        data.map(e => ({
          id: e.id,
          name: e.name,
          date: e.scheduled_date,
          location: e.location,
          capacity: e.max_capacity,
          participants: e._count?.participant || 0,
          games: e.event_game?.map(eg => eg.game.name) || [],
        }))
      );
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // 🔹 Gestion création event
  const handleAddEvent = async (eventData) => {
    try {
      const result = await addEvent(eventData, localStorage.getItem('token'));
      console.log('Event créé !', result);
      setOpen(false);
      loadEvents();
      message.success('Événement ajouté !');
    } catch (err) {
      console.error('Erreur création event :', err.message);
      message.error(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id, localStorage.getItem('token'));
      setEvents(prev => prev.filter(e => e.id !== id));
      message.success('Événement supprimé');
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <Card style={{ margin: 24 }}>
      <EventsHeader onRefresh={loadEvents} onAdd={() => setOpen(true)} />
      <EventsTable events={events} loading={loading} onDelete={handleDeleteEvent} />

      <Modal
        title="Ajouter un événement"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <EventForm onSubmit={handleAddEvent} />
      </Modal>
    </Card>
  );
};

export default AdminEvents;
