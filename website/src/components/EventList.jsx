import React, { useEffect, useState } from "react";
import { fetchEvents } from "../src/services/eventService";

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      const data = await fetchEvents();
      setEvents(data);
    };
    getEvents();
  }, []);
  
  return (
    <div>
      <h2>Liste des événements</h2>
      {events.map((event) => (
        <div key={event.id}>{event.id} : {event.name}</div>
      ))}
    </div>
  );
};

export default EventList;
