import { useEffect, useState } from 'react';
import { fetchGameById, buildPhotoUrl, fetchTagsByGame, deleteGame, updateGame, uploadPhoto, fetchEventById, updateEvent, addTagToGame, deleteTagFromGame } from '../api/api';
import GameHeader from '../components/GameHeader';
import GameInfo from '../components/GameInfo';
// GameVisuals removed from the middle section to avoid duplication with hero
import GamePlatforms from '../components/GamePlatforms';
import GameTags from '../components/GameTags';
import GameEvents from '../components/GameEvents';
import GameForm from '../components/GameForm';
import { useParams } from 'react-router-dom';
import { Spin, message, Modal, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const navigate = useNavigate();

  const enrichGameData = async (data, token) => {
    data.photo_game_banner_idTophoto = data.banner_id ? { url: buildPhotoUrl(data.banner_id) } : null;
    data.photo_game_logo_idTophoto = data.logo_id ? { url: buildPhotoUrl(data.logo_id) } : null;
    data.photo_game_grid_idTophoto = data.grid_id ? { url: buildPhotoUrl(data.grid_id) } : null;

    const tags = await fetchTagsByGame(id, token);
    data.game_tag = tags;

    const links = Array.isArray(data.event_game) ? data.event_game : [];
    if (links.length > 0) {
      const eventIds = links
        .map(l => (l.event?.id ?? l.event_id))
        .filter(Boolean);
      const uniqueIds = [...new Set(eventIds)];
      const events = await Promise.all(uniqueIds.map(eid => fetchEventById(eid, token)));
      const byId = new Map(events.map(ev => [ev.id, ev]));
      data.event_game = eventIds
        .map(eid => ({ event: byId.get(eid) }))
        .filter(x => x.event);
    } else {
      data.event_game = [];
    }

    return data;
  };

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const data = await fetchGameById(id, token);
        const enriched = await enrichGameData(data, token);
        setGame(enriched);
      } catch (err) {
        console.error(err);
        message.error('Erreur lors du chargement des détails du jeu');
      } finally {
        setLoading(false);
      }
    };
    loadGame();
  }, [id]);

  if (loading || !game) return <Spin />;

  const handleDelete = () => {
    Modal.confirm({
      title: 'Supprimer ce jeu ?',
      content: 'Cette action est définitive.',
      okText: 'Supprimer',
      okButtonProps: { danger: true },
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await deleteGame(id, localStorage.getItem('token'));
          message.success('Jeu supprimé');
          navigate('/game');
        } catch (err) {
          message.error(err.message || 'Suppression impossible');
        }
      }
    });
  };

  const handleEdit = () => setEditOpen(true);

  const handleAddTag = async (tagName) => {
    try {
      const token = localStorage.getItem('token');
      await addTagToGame(id, tagName, token);
      const tags = await fetchTagsByGame(id, token);
      setGame(prev => ({ ...prev, game_tag: tags }));
      message.success('Tag ajouté');
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Impossible d’ajouter le tag');
    }
  };

  const handleRemoveTag = async (idx) => {
    try {
      const token = localStorage.getItem('token');
      const tagObj = game.game_tag[idx];
      const tagName = tagObj?.tag_name || tagObj?.name || tagObj;
      if (!tagName) return;
      await deleteTagFromGame(id, tagName, token);
      const tags = await fetchTagsByGame(id, token);
      setGame(prev => ({ ...prev, game_tag: tags }));
      message.success('Tag supprimé');
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Impossible de supprimer le tag');
    }
  };

  const handleUnlink = async (eventLink) => {
    try {
      const token = localStorage.getItem('token');
      const eventId = eventLink.event.id;

      // Charger l'événement pour obtenir sa liste complète de jeux
      const event = await fetchEventById(eventId, token);
      const currentGameIds = (event.event_game || []).map(eg => eg.game_id);
      const newGameIds = currentGameIds.filter(gid => gid !== Number(id));

      // Mettre à jour l'événement en supprimant l'association avec ce jeu
      await updateEvent(eventId, { game_id: newGameIds }, token);
      message.success('Événement dissocié du jeu');

      // Recharger les données du jeu pour refléter la dissociation
      const data = await fetchGameById(id, token);
      const enriched = await enrichGameData(data, token);
      setGame(enriched);
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Impossible de dissocier');
    }
  };

  const handleEditSubmit = async (values) => {
    setEditSaving(true);
    try {
        console.log('Submitting edit with values:', values);
        
        // Upload new photos if changed, otherwise keep existing photo IDs
        let banner_id = game.banner_id;
        let logo_id = game.logo_id;
        let grid_id = game.grid_id;

        const token = localStorage.getItem('token');

        // Upload new banner if changed
        if (values.bannerChanged && values.bannerFile) {
          const bannerPhotoId = await uploadPhoto(values.bannerFile, token);
          banner_id = bannerPhotoId;
        }

        // Upload new logo if changed
        if (values.logoChanged && values.logoFile) {
          const logoPhotoId = await uploadPhoto(values.logoFile, token);
          logo_id = logoPhotoId;
        }

        // Upload new grid if changed
        if (values.gridChanged && values.gridFile) {
          const gridPhotoId = await uploadPhoto(values.gridFile, token);
          grid_id = gridPhotoId;
        }

        const updated_data = {
            name: values.name,
            studio: values.studio,
            publisher: values.publisher,
            description: values.description,
            release_date: values.release_date ? values.release_date : null,
            platforms: values.platforms,
            is_approved: values.is_approved || false,
            banner_id,
            logo_id,
            grid_id,
        }
        console.log('Updating game with data:', updated_data);
      await updateGame(id, updated_data, token);
      message.success('Jeu mis à jour');
      setEditOpen(false);
      // reload fresh data
      const data = await fetchGameById(id, token);
      const enriched = await enrichGameData(data, token);
      setGame(enriched);
    } catch (err) {
      message.error(err.message || 'Mise à jour impossible');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {game.photo_game_banner_idTophoto && (
        <div className="game-hero">
          <div className="ratio-box ratio-banner">
            <img src={game.photo_game_banner_idTophoto.url} alt={game.name} />
          </div>
          {game.photo_game_grid_idTophoto && (
            <div className="game-hero__cover">
              <div className="ratio-box ratio-grid">
                <img src={game.photo_game_grid_idTophoto.url} alt={`${game.name} cover`} />
              </div>
            </div>
          )}
          <div className="game-hero__overlay" />
          <div className="game-hero__content">
            {game.photo_game_logo_idTophoto && (
              <div className="logo-box game-hero__logo">
                <img src={game.photo_game_logo_idTophoto.url} alt={`${game.name} logo`} />
              </div>
            )}
            <h2 className="game-hero__title">{game.name}</h2>
          </div>
        </div>
      )}
      <GameHeader 
        name={game.name}
        studio={game.studio}
        publisher={game.publisher}
        is_approved={game.is_approved}
        onEdit={handleEdit}
        onDelete={handleDelete}
        compact
      />

      {/* Two-column layout: About on right, main on left */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <GamePlatforms 
            platforms={game.platforms ? game.platforms.split(',') : []}
          />
          <GameTags 
            tags={game.game_tag}
            onAdd={handleAddTag}
            onRemove={handleRemoveTag}
          />
          <GameEvents 
            events={game.event_game}
            onUnlink={handleUnlink}
          />
        </Col>
        <Col xs={24} lg={8}>
          <GameInfo 
            description={game.description}
            releaseDate={game.release_date}
            studio={game.studio}
            publisher={game.publisher}
          />
        </Col>
      </Row>

      <Modal
        title="Modifier le jeu"
        open={editOpen}
        footer={null}
        onCancel={() => setEditOpen(false)}
      >
        <GameForm
          onSubmit={handleEditSubmit}
          initialValues={{
            ...game,
            release_date: game.release_date ? dayjs(game.release_date) : null,
          }}
        />
        {editSaving && <Spin />}
      </Modal>
    </div>
  );
};

export default GameDetails;
