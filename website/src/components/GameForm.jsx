import { Form, Input, Button, DatePicker, Checkbox, Space, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';

const GameForm = ({ onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [gridFile, setGridFile] = useState(null);

  const handleSubmit = (values) => {
    const formattedValues = {
      ...values,
      release_date: values.release_date ? values.release_date.toISOString() : null,
      bannerFile,
      logoFile,
      gridFile,
    };
    onSubmit(formattedValues);
    form.resetFields();
    setBannerFile(null);
    setLogoFile(null);
    setGridFile(null);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues || {}}
    >
      <Form.Item
        label="Nom"
        name="name"
        rules={[{ required: true, message: 'Veuillez entrer le nom du jeu' }]}
      >
        <Input placeholder="Nom du jeu" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
      >
        <Input.TextArea placeholder="Description du jeu" rows={4} />
      </Form.Item>

      <Form.Item
        label="Studio"
        name="studio"
      >
        <Input placeholder="Studio de développement" />
      </Form.Item>

      <Form.Item
        label="Éditeur"
        name="publisher"
      >
        <Input placeholder="Éditeur du jeu" />
      </Form.Item>

      <Form.Item
        label="Date de sortie"
        name="release_date"
      >
        <DatePicker
          placeholder="Sélectionner une date"
          format="DD/MM/YYYY"
        />
      </Form.Item>

      <Form.Item
        label="Platformes (séparées par des virgules)"
        name="platforms"
      >
        <Input placeholder="PC, Switch, PlayStation..." />
      </Form.Item>

      <Form.Item
        label="Banner"
        name="banner"
        rules={[{ required: !initialValues, message: 'Veuillez sélectionner une image banner' }]}
      >
        <Upload
          beforeUpload={(file) => {
            setBannerFile(file);
            return false;
          }}
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Sélectionner Banner</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Logo"
        name="logo"
        rules={[{ required: !initialValues, message: 'Veuillez sélectionner un logo' }]}
      >
        <Upload
          beforeUpload={(file) => {
            setLogoFile(file);
            return false;
          }}
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Sélectionner Logo</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        label="Grid"
        name="grid"
        rules={[{ required: !initialValues, message: 'Veuillez sélectionner une image grid' }]}
      >
        <Upload
          beforeUpload={(file) => {
            setGridFile(file);
            return false;
          }}
          maxCount={1}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Sélectionner Grid</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="is_approved"
        valuePropName="checked"
      >
        <Checkbox>Approuvé</Checkbox>
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit">
          Soumettre
        </Button>
      </Space>
    </Form>
  );
};

export default GameForm;
