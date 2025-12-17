import { useEffect, useState } from 'react';
import { fetchEventById } from '../api/api';
import EventHeader from '../components/EventHeader';
import EventInfo from '../components/EventInfo';
import EventPhotos from '../components/EventPhotos';
import EventGames from '../components/EventGames';
import EventParticipants from '../components/EventParticipants';
import EventReviews from '../components/EventReviews';
import { useParams } from 'react-router-dom';
import { Spin, message } from 'antd';

const EventDetails = () => {
  const { id } = useParams(); // id de l'événement dans l'URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const data = await fetchEventById(id, localStorage.getItem('token'));
        setEvent(data);
      } catch (err) {
        console.error(err);
        message.error('Impossible de charger l’événement');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  if (loading || !event) return <Spin />;

  return (
    <div style={{ padding: 24 }}>
      <EventHeader 
        name={event.name} 
        date={event.scheduled_date} 
        location={event.location} 
        author={event.User} 
      />
      <EventInfo 
        description={event.description} 
        capacity={event.max_capacity} 
        participantsCount={event._count.participant} 
      />
      <EventPhotos photos={event.event_photo.map(ep => ep.photo)} />
      <EventGames games={event.event_game.map(eg => eg.game)} />
      <EventParticipants participants={event.participant.map(p => p.User)} />
      <EventReviews reviews={event.review} />
    </div>
  );
};

export default EventDetails;
