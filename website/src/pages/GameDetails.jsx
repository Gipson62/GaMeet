import { useEffect, useState } from 'react';
import { fetchGameById, buildPhotoUrl, fetchTagsByGame, deleteGame, updateGame, uploadPhoto } from '../api/api';
import GameHeader from '../components/GameHeader';
import GameInfo from '../components/GameInfo';
import GameVisuals from '../components/GameVisuals';
import GamePlatforms from '../components/GamePlatforms';
import GameTags from '../components/GameTags';
import GameEvents from '../components/GameEvents';
import GameForm from '../components/GameForm';
import { useParams } from 'react-router-dom';
import { Spin, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const GameDetails = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const data = await fetchGameById(id, token);
        // Map ids to direct photo URLs (API streams file, not JSON)
        data.photo_game_banner_idTophoto = data.banner_id ? { url: buildPhotoUrl(data.banner_id) } : null;
        data.photo_game_logo_idTophoto = data.logo_id ? { url: buildPhotoUrl(data.logo_id) } : null;
        data.photo_game_grid_idTophoto = data.grid_id ? { url: buildPhotoUrl(data.grid_id) } : null;
        // Fetch tags separately (game endpoint doesn't include them)
        const tags = await fetchTagsByGame(id, token);
        data.game_tag = tags;
        setGame(data);
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
      data.photo_game_banner_idTophoto = data.banner_id ? { url: buildPhotoUrl(data.banner_id) } : null;
      data.photo_game_logo_idTophoto = data.logo_id ? { url: buildPhotoUrl(data.logo_id) } : null;
      data.photo_game_grid_idTophoto = data.grid_id ? { url: buildPhotoUrl(data.grid_id) } : null;
      const tags = await fetchTagsByGame(id, token);
      data.game_tag = tags;
      setGame(data);
    } catch (err) {
      message.error(err.message || 'Mise à jour impossible');
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <GameHeader 
        name={game.name}
        studio={game.studio}
        publisher={game.publisher}
        is_approved={game.is_approved}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <GameInfo 
        description={game.description}
        releaseDate={game.release_date}
        studio={game.studio}
        publisher={game.publisher}
      />
      <GameVisuals
        banner={game.photo_game_banner_idTophoto}
        grid={game.photo_game_grid_idTophoto}
        logo={game.photo_game_logo_idTophoto}
      />
      <GamePlatforms 
        platforms={game.platforms ? game.platforms.split(',') : []}
      />
      <GameTags 
        tags={game.game_tag}
      />
      <GameEvents 
        events={game.event_game}
      />

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
