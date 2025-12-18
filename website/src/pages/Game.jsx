import { useEffect, useState, useMemo } from 'react';
import { Card, message, Modal, Table, Button, Space, Spin, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchGames, deleteGame, addGameWithPhotos } from '../api/api';
import GameForm from '../components/GameForm';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState('');
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
      // Vérifier les 3 photos obligatoires
      if (!values.bannerFile || !values.logoFile || !values.gridFile) {
        message.error('Les 3 photos sont requises');
        return;
      }

      // Appel de l'endpoint transactionnel multipart
      await addGameWithPhotos(values, token);

      message.success('Jeu créé avec les photos (transaction) !');
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

  const filteredGames = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return games;

    return games.filter((g) => {
      const name = (g.name || '').toLowerCase();
      const studio = (g.studio || '').toLowerCase();
      const publisher = (g.publisher || '').toLowerCase();
      const platforms = (g.platforms || '').toLowerCase();
      return (
        name.includes(query) ||
        studio.includes(query) ||
        publisher.includes(query) ||
        platforms.includes(query)
      );
    });
  }, [games, q]);

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
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div></div>
          <Space>
            <input
              type="text"
              placeholder="Rechercher un jeu..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                fontSize: '14px',
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setOpen(true)}
            >
              Ajouter un jeu
            </Button>
          </Space>
        </Space>

        <Table
          dataSource={filteredGames}
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
