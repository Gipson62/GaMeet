import { useState } from "react";
import { Modal, Form, Input, Button, Space, DatePicker, message, Upload, Image} from "antd";
import { addUser, uploadPhoto } from "../../api/api.js";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

const UserForm = ({ open, onClose, token, onCreated }) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleCancel = () => {
        form.resetFields();
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        onClose?.();
    };

    const beforeUpload = (file) => {
        const isImage = file.type?.startsWith("image/");
        if (!isImage) {
            message.error("Veuillez sélectionner une image.");
            return Upload.LIST_IGNORE;
        }
        const isLt5MB = file.size / 1024 / 1024 < 5;
        if (!isLt5MB) {
            message.error("Image trop lourde (max 5MB).");
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const onFinish = async (values) => {
        try {
            setSubmitting(true);

            const payload = {
                pseudo: values.pseudo,
                email: values.email,
                password: values.password,
                birth_date: values.birth_date.format("YYYY-MM-DD"),
                bio: values.bio || null,
                photo_id: values.photo_id ?? null,
            };
            // upload photo UNIQUEMENT au submit
            if (selectedFile) {
                const uploaded = await uploadPhoto(selectedFile, token); // => { id, url }
                payload.photo_id = uploaded.id;
            }
            await addUser(payload, token);

            message.success("Utilisateur ajouté");
            form.resetFields();
            onClose?.();
            onCreated?.(); // refresh de la table
        } catch (e) {
            message.error(e.message || "Impossible d'ajouter l'utilisateur");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Ajouter un utilisateur"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={480}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Pseudo"
                    name="pseudo"
                    rules={[
                        { required: true, message: "Le pseudo est requis." },
                        { min: 3, message: "Minimum 3 caractères." },
                        { max: 64, message: "Maximum 64 caractères." },
                    ]}
                >
                    <Input placeholder="Pseudo" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "L'email est requis." },
                        { type: "email", message: "Email invalide." },
                    ]}
                >
                    <Input placeholder="email@exemple.com" />
                </Form.Item>

                <Form.Item
                    label="Mot de passe"
                    name="password"
                    rules={[
                        { required: true, message: "Le mot de passe est requis." },
                        { min: 8, message: "Minimum 8 caractères." },
                        { max: 25, message: "Maximum 25 caractères." },
                    ]}
                >
                    <Input.Password placeholder="Mot de passe" />
                </Form.Item>

                <Form.Item
                    label="Date de naissance"
                    name="birth_date"
                    rules={[
                        { required: true, message: "La date de naissance est requise." },
                    ]}
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabledDate={(current) =>
                            current && current > dayjs().endOf("day")
                        }
                        placeholder="Sélectionner une date"
                    />
                </Form.Item>

                <Form.Item label="Bio" name="bio">
                    <TextArea rows={4} placeholder="Bio (optionnel)" />
                </Form.Item>

                <Form.Item label="Photo (optionnelle)">
                    <Space orientation="vertical" style={{ width: "100%" }} size={12}>
                        <Upload
                            maxCount={1}
                            showUploadList={{ showRemoveIcon: true }}
                            beforeUpload={(file) => {
                                const isImage = file.type?.startsWith("image/");
                                if (!isImage) {
                                    message.error("Veuillez sélectionner une image.");
                                    return Upload.LIST_IGNORE;
                                }

                                const isLt5MB = file.size / 1024 / 1024 < 5;
                                if (!isLt5MB) {
                                    message.error("Image trop lourde (max 5MB).");
                                    return Upload.LIST_IGNORE;
                                }

                                setSelectedFile(file);

                                if (previewUrl) URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(URL.createObjectURL(file));

                                return false; // empêche upload automatique
                            }}
                            onRemove={() => {
                                setSelectedFile(null);
                                if (previewUrl) URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                            }}
                        >
                            <Button icon={<UploadOutlined />}>
                                Sélectionner une photo
                            </Button>
                        </Upload>

                        {previewUrl && (
                            <Image
                                src={previewUrl}
                                alt="Aperçu"
                                style={{
                                    width: "100%",
                                    maxHeight: 220,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                }}
                            />
                        )}
                    </Space>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button onClick={handleCancel}>Annuler</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            Soumettre
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};
export default UserForm;
