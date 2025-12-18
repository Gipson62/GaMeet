import { useEffect, useState } from 'react';
import { Card, message, Modal, Table, Button, Space, Spin, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchGames, deleteGame, addGame, uploadPhoto } from '../api/api';
import GameForm from '../components/GameForm';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await fetchGames(localStorage.getItem('token'));
      setGames(data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (values) => {
    const token = localStorage.getItem('token');
    setUploading(true);
    
    try {
      // Upload les 3 photos d'abord
      if (!values.bannerFile || !values.logoFile || !values.gridFile) {
        message.error('Les 3 photos sont requises');
        setUploading(false);
        return;
      }

      const bannerResult = await uploadPhoto(values.bannerFile, token);
      const logoResult = await uploadPhoto(values.logoFile, token);
      const gridResult = await uploadPhoto(values.gridFile, token);

      // Créer le jeu avec les IDs des photos
      const payload = {
        name: values.name,
        description: values.description,
        publisher: values.publisher,
        studio: values.studio,
        release_date: values.release_date || null,
        platforms: values.platforms,
        is_approved: values.is_approved || false,
        banner_id: bannerResult.photo.id,
        logo_id: logoResult.photo.id,
        grid_id: gridResult.photo.id,
      };

      await addGame(payload, token);
      message.success('Jeu créé avec les photos !');
      setOpen(false);
      loadGames();
    } catch (err) {
      message.error(err.message || 'Erreur lors de la création');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      await deleteGame(id, localStorage.getItem('token'));
      setGames(prev => prev.filter(g => g.id !== id));
      message.success('Jeu supprimé');
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
        title: 'Logo',
        dataIndex: 'logo_id',
        key: 'logo_id',
        render: (logo_id) => logo_id ? <img src={`http://localhost:3001/v1/photo/${logo_id}`} alt="Logo Not Found" style={{ width: 50 }} /> : 'N/A',
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Studio',
      dataIndex: 'studio',
      key: 'studio',
    },
    {
      title: 'Éditeur',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
        title: 'Date de sortie',
        dataIndex: 'release_date',
        key: 'release_date',
        render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
        title: 'Plateformes',
        dataIndex: 'platforms',
        key: 'platforms',
        render: (platforms) => platforms || 'N/A',
    },
    {
      title: 'Approuvé',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (approved) => approved ? '✓' : '✗',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/game/${record.id}`)}
          >
            Voir
          </Button>
          <Popconfirm
            title="Voulez-vous vraiment supprimer cet événement ?"
            onConfirm={() => handleDeleteGame(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    loadGames();
  }, []);

  return (
    <Card style={{ margin: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Ajouter un jeu
        </Button>

        <Table
          dataSource={games}
          columns={columns}
          loading={loading}
          rowKey="id"
        />
      </Space>

      <Modal
        title="Ajouter un jeu"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        {uploading ? <Spin tip="Upload en cours..." /> : <GameForm onSubmit={handleAddGame} />}
      </Modal>
    </Card>
  );
};

export default Game;
