import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEventById, deleteEvent, updateEvent, addParticipant, removeParticipant, deleteReview } from '../api/api';
import { Spin, message, Modal } from 'antd';
import dayjs from 'dayjs';

import EventHeader from '../components/EventHeader';
import EventInfo from '../components/EventInfo';
import EventPhotos from '../components/EventPhotos';
import EventGames from '../components/EventGames';
import EventParticipants from '../components/EventParticipants';
import EventReviews from '../components/EventReviews';
import EventForm from '../components/EventForm';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const token = localStorage.getItem('token');
  const getPhotoUrl = (photoId) => `http://localhost:3001/v1/photo/${photoId}`;

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await fetchEventById(id, token);
      setEvent(data);
      setReviews(data.review || []); // Charge aussi les reviews
    } catch {
      message.error('Impossible de charger l’événement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleDeleteEvent = () => {
    Modal.confirm({
      title: 'Supprimer cet événement ?',
      content: 'Cette action est définitive.',
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: async () => {
        await deleteEvent(id, token);
        message.success('Événement supprimé');
        navigate('/event');
      },
    });
  };

  const handleEditSubmit = async (eventData) => {
    setEditSaving(true);
    try {
      await updateEvent(id, eventData, token);
      message.success('Événement modifié');
      setEditOpen(false);
      await loadEvent();
    } catch (err) {
      message.error(err.message || 'Modification impossible');
    } finally {
      setEditSaving(false);
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      await addParticipant(event.id, userId, token);
      message.success('Participant ajouté');
      await loadEvent();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    try {
      await removeParticipant(event.id, userId, token);
      message.success('Participant retiré');
      await loadEvent();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId, token);
      setReviews(prev => prev.filter(r => r.id !== reviewId)); // Mise à jour locale
      message.success('Review supprimé avec succès');
    } catch (err) {
      console.error(err);
      message.error('Impossible de supprimer le review');
    }
  };

  if (loading || !event) return <Spin />;

  return (
    <div style={{ padding: 24 }}>
      <EventHeader
        name={event.name}
        date={event.scheduled_date}
        location={event.location}
        author={event.User}
        onEdit={() => setEditOpen(true)}
        onDelete={handleDeleteEvent}
      />

      <EventInfo
        name={event.name}
        date={event.scheduled_date}
        location={event.location}
        description={event.description}
        capacity={event.max_capacity}
        participantsCount={event._count.participant}
      />

      <EventPhotos photos={event.event_photo.map(ep => ({
        ...ep.photo,
        url: getPhotoUrl(ep.photo.id),
      }))} />

      <EventGames games={event.event_game.map(eg => eg.game)} />

      <EventParticipants
        participants={event.participant.map(p => p.User)}
        onDelete={handleRemoveParticipant}
        onAdd={handleAddParticipant}
      />

      <EventReviews
        reviews={reviews}
        onAdd={() => message.info('Ajouter review à implémenter')}
        onDelete={handleDeleteReview}
      />

      <Modal
        title="Modifier l’événement"
        open={editOpen}
        footer={null}
        onCancel={() => setEditOpen(false)}
      >
        <EventForm
          onSubmit={handleEditSubmit}
          initialValues={{
            name: event.name,
            scheduled_date: event.scheduled_date ? dayjs(event.scheduled_date) : null,
            location: event.location,
            description: event.description,
            max_capacity: event.max_capacity,
            game_id: event.event_game.map(eg => eg.game.id),
            photo_id: event.event_photo.map(ep => ep.photo.id),
          }}
        />
        {editSaving && <Spin />}
      </Modal>
    </div>
  );
};

export default EventDetails;
