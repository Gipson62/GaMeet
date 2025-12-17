import { Form, Input, Button, Space } from 'antd';

const TagForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item
        label="Nom"
        name="name"
        rules={[{ required: true, message: 'Veuillez entrer le nom du tag' }]}
      >
        <Input placeholder="Nom du tag" />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit">
          Soumettre
        </Button>
      </Space>
    </Form>
  );
};

export default TagForm;
