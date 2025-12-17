import { Form, Input, InputNumber, DatePicker, Button, Upload, message, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { uploadPhoto, fetchGames } from '../api/api';

export default function EventForm({ onSubmit, initialValues }) {
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  const [photoFile, setPhotoFile] = useState(null);
  const [gamesOptions, setGamesOptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔹 Récupérer tous les jeux
  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchGames(token);
        setGamesOptions(data.map(g => ({ label: g.name, value: g.id })));
      } catch (err) {
        console.error('Erreur récupération jeux:', err);
        message.error('Impossible de charger les jeux');
      }
    };
    loadGames();
  }, [token]);

  const handleFinish = async (values) => {
    try {
      setUploading(true);

      let photoIds = [];
      if (photoFile) {
        const uploaded = await uploadPhoto(photoFile, token);
        if (uploaded?.photo?.id) photoIds.push(uploaded.photo.id);
      }

      const eventData = {
        name: values.name,
        scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : null,
        location: values.location || null,
        description: values.description || null,
        max_capacity: values.max_capacity || null,
        photo_id: photoIds,
        game_id: values.games || [], // <-- les IDs des jeux sélectionnés
      };

      await onSubmit(eventData);

      form.resetFields();
      setPhotoFile(null);
      message.success('Événement créé avec succès !');
    } catch (err) {
      console.error(err);
      message.error('Erreur lors de la création de l’événement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialValues || {}}>
      <Form.Item label="Nom de l’événement" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Date" name="scheduled_date" rules={[{ required: true }]}>
        <DatePicker
          style={{ width: '100%' }}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
        />
      </Form.Item>

      <Form.Item label="Lieu" name="location">
        <Input />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item label="Capacité maximale" name="max_capacity">
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Image">
        <Upload
          maxCount={1}
          beforeUpload={(file) => { setPhotoFile(file); return false; }}
          listType="picture"
          onRemove={() => setPhotoFile(null)}
        >
          <Button icon={<PlusOutlined />}>Choisir une image</Button>
        </Upload>
      </Form.Item>

      {/* 🔹 Sélection des jeux */}
      <Form.Item label="Jeux" name="games">
        <Select
          mode="multiple"
          placeholder="Sélectionnez les jeux associés"
          options={gamesOptions}
        />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" block disabled={uploading}>
          {uploading ? "Création en cours..." : "Créer l’événement"}
        </Button>
      </Space>
    </Form>
  );
}
