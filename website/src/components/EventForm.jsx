import { Form, Input, InputNumber, DatePicker, Button, Upload, message, Space, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { uploadPhoto, fetchGames } from '../api/api';
import dayjs from 'dayjs';

export default function EventForm({ onSubmit, initialValues }) {
  const [form] = Form.useForm();
  const token = localStorage.getItem('token');

  const [existingPhotoIds, setExistingPhotoIds] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [gamesOptions, setGamesOptions] = useState([]);
  const [uploading, setUploading] = useState(false);

  const getPhotoUrl = (id) => `http://localhost:3001/v1/photo/${id}`;

  // Charger tous les jeux
  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await fetchGames(token);
        setGamesOptions(data.map(g => ({ label: g.name, value: g.id })));
      } catch (err) {
        message.error('Impossible de charger les jeux');
      }
    };
    loadGames();
  }, [token]);

  // Pré-remplir les photos existantes
  useEffect(() => {
    if (initialValues?.photo_id?.length > 0) {
      setExistingPhotoIds([...initialValues.photo_id]);
      setPhotoFiles(
        initialValues.photo_id.map((id) => ({
          uid: `existing-${id}`,
          name: `Photo ${id}`,
          url: getPhotoUrl(id),
        }))
      );
    }
  }, [initialValues]);

  const handleFinish = async (values) => {
    setUploading(true);
    try {
      // Upload nouvelles photos
      const uploadedPhotoIds = [];
      for (const file of photoFiles.filter(f => f.originFileObj)) {
        const uploaded = await uploadPhoto(file.originFileObj, token);
        // uploadPhoto returns the new photo id (number)
        if (typeof uploaded === 'number') {
          uploadedPhotoIds.push(uploaded);
        } else if (uploaded?.photo?.id) {
          // backward compatibility with older shape
          uploadedPhotoIds.push(uploaded.photo.id);
        }
      }

      const finalPhotoIds = [...existingPhotoIds, ...uploadedPhotoIds];

      const eventData = {
        name: values.name,
        scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : null,
        location: values.location || null,
        description: values.description || null,
        max_capacity: values.max_capacity || null,
        photo_id: finalPhotoIds,
        game_id: values.games || [],
      };

      await onSubmit(eventData);

      form.resetFields();
      setExistingPhotoIds([]);
      setPhotoFiles([]);
    } catch (err) {
      message.error('Erreur lors de l’envoi de l’événement');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = ({ fileList }) => setPhotoFiles(fileList);

  const handleRemovePhoto = (file) => {
    setPhotoFiles(prev => prev.filter(f => f.uid !== file.uid));
    if (file.uid.startsWith('existing-')) {
      const id = Number(file.uid.replace('existing-', ''));
      setExistingPhotoIds(prev => prev.filter(pid => pid !== id));
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        ...initialValues,
        scheduled_date: initialValues?.scheduled_date ? dayjs(initialValues.scheduled_date) : null,
        games: initialValues?.game_id || [],
      }}
    >
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

      <Form.Item label="Images">
        <Upload
          maxCount={5}
          listType="picture"
          fileList={photoFiles}
          beforeUpload={() => false}
          onChange={handlePhotoChange}
          onRemove={handleRemovePhoto}
        >
          <Button icon={<PlusOutlined />}>Ajouter une image</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Jeux" name="games">
        <Select
          mode="multiple"
          placeholder="Sélectionnez les jeux associés"
          options={gamesOptions}
        />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" loading={uploading}>
          Soumettre
        </Button>
      </Space>
    </Form>
  );
}
