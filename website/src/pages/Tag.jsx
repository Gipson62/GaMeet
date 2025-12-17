import { useEffect, useState } from 'react';
import { Card, message, Modal } from 'antd';
import TagsHeader from '../components/TagsHeader';
import TagsTable from '../components/TagsTable';
import TagForm from '../components/TagForm';
import { fetchTags, addTag, deleteTag } from '../api/api';

const TagPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await fetchTags(localStorage.getItem('token'));
      setTags(data);
    } catch (err) {
      message.error(err.message || 'Erreur lors du chargement des tags');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (values) => {
    try {
      await addTag(values, localStorage.getItem('token'));
      message.success('Tag créé');
      setOpen(false);
      loadTags();
    } catch (err) {
      message.error(err.message || 'Erreur lors de la création du tag');
    }
  };

  const handleDeleteTag = async (name) => {
    try {
      await deleteTag(name, localStorage.getItem('token'));
      setTags(prev => prev.filter(t => t.name !== name));
      message.success('Tag supprimé');
    } catch (err) {
      message.error(err.message || 'Suppression impossible');
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <Card style={{ margin: 24 }}>
      <TagsHeader
        onRefresh={loadTags}
        onAdd={() => setOpen(true)}
      />

      <TagsTable
        tags={tags}
        loading={loading}
        onDelete={handleDeleteTag}
      />

      <Modal
        title="Ajouter un tag"
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <TagForm onSubmit={handleAddTag} />
      </Modal>
    </Card>
  );
};

export default TagPage;
