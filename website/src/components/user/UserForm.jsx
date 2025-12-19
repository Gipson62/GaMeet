import { Form, Input, DatePicker, Button, Upload, message, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function UserForm({ onSubmit, initialValues, mode = "create" }) {
    const [form] = Form.useForm();
    const [avatarFiles, setAvatarFiles] = useState([]);
    const [saving, setSaving] = useState(false);

    const isEdit = mode === "edit";

    useEffect(() => {
        form.resetFields();
        setAvatarFiles([]);

        if (!initialValues) return;

        form.setFieldsValue({
            pseudo: initialValues.pseudo ?? "",
            email: initialValues.email ?? "",
            bio: initialValues.bio ?? "",
            birth_date: initialValues.birth_date ? dayjs(initialValues.birth_date) : null,
        });
    }, [initialValues, form]);

    const disabledFutureDates = useMemo(() => {
        return (current) => current && current.isAfter(dayjs(), "day");
    }, []);

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
        return false; // pas d'upload auto
    };

    const onFinish = async (values) => {
        try {
            setSaving(true);

            const payload = {
                pseudo: values.pseudo,
                email: values.email,
                birth_date: values.birth_date.format("YYYY-MM-DD"),
                bio: values.bio || null,
                // password seulement en create
                ...(isEdit ? {} : { password: values.password }),
                // fichier optionnel
                avatarFile: avatarFiles[0]?.originFileObj ?? null,
            };

            await onSubmit(payload);

            // si create, on peut reset après submit
            if (!isEdit) {
                form.resetFields();
                setAvatarFiles([]);
            }
        } catch (err) {
            let msg = err?.message || "Erreur";
            try {
                const parsed = JSON.parse(msg);
                msg = parsed.message || msg;
            } catch { }
            message.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                label="Pseudo"
                name="pseudo"
                rules={[
                    { required: true, message: "Pseudo requis" },
                    { min: 3, message: "Minimum 3 caractères" },
                    { max: 64, message: "Maximum 64 caractères" },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    { required: true, message: "Email requis" },
                    { type: "email", message: "Email invalide" },
                ]}
            >
                <Input />
            </Form.Item>

            {!isEdit && (
                <Form.Item
                    label="Mot de passe"
                    name="password"
                    rules={[
                        { required: true, message: "Mot de passe requis" },
                        { min: 8, message: "Minimum 8 caractères" },
                        { max: 25, message: "Maximum 25 caractères" },
                    ]}
                >
                    <Input.Password />
                </Form.Item>
            )}

            <Form.Item
                label="Date de naissance"
                name="birth_date"
                rules={[{ required: true, message: "Date de naissance requise" }]}
            >
                <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledFutureDates}
                />
            </Form.Item>

            <Form.Item label="Bio" name="bio">
                <TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Avatar (optionnel)">
                <Upload
                    maxCount={1}
                    listType="picture"
                    fileList={avatarFiles}
                    beforeUpload={beforeUpload}
                    onChange={({ fileList }) => setAvatarFiles(fileList)}
                    onRemove={() => setAvatarFiles([])}
                >
                    <Button icon={<PlusOutlined />}>Choisir une image</Button>
                </Upload>
            </Form.Item>

            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button type="primary" htmlType="submit" loading={saving}>
                    {isEdit ? "Enregistrer" : "Créer"}
                </Button>
            </Space>
        </Form>
    );
}
