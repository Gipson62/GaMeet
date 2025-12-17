import { useEffect, useState } from 'react';
import { Card, message, Modal } from 'antd';
import EventsHeader from '../components/EventsHeader';
import EventsTable from '../components/EventsTable';
import AddEventForm from '../components/EventForm';
import { fetchEvents, deleteEvent, addEvent } from '../api/api';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
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

async function handleAddEvent(values) {
  // pas de quotes autour des valeurs
  const payload = {
    name: values.name,
    scheduled_date: values.scheduled_date, // string ISO ok
    location: values.location,
    description: values.description,
    max_capacity: values.max_capacity
  };

  try {
    const result = await addEvent(payload, localStorage.getItem('token'));
    console.log('Event créé !', result);
    setOpen(false);       // fermer le modal
    loadEvents();         // rafraîchir la liste
  } catch (err) {
    console.error('Erreur création event :', err.message);
    message.error(err.message);
  }
}




  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id,localStorage.getItem('token'));
      setEvents(prev => prev.filter(e => e.id !== id));
      message.success('Événement supprimé');
    } catch (err) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <Card style={{ margin: 24 }}>
      <EventsHeader
        onRefresh={loadEvents}
        onAdd={() => setOpen(true)}
      />

      <EventsTable
        events={events}
        loading={loading}
        onDelete={handleDeleteEvent}
      />

      <Modal
        title="Ajouter un événement"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <AddEventForm onSubmit={handleAddEvent} />
      </Modal>
    </Card>
  );
};

export default AdminEvents;
