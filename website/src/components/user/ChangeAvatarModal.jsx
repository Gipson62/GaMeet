import { useState } from "react";
import { Modal, Upload, Button, Space, Image, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { updateUserAvatar } from "../../api/api.js";

const ChangeAvatarModal = ({ open, onClose, userId, token, onUpdated }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleCancel = () => {
        reset();
        onClose?.();
    };

    const beforeUpload = (f) => {
        const isImage = f.type?.startsWith("image/");
        if (!isImage) {
            message.error("Veuillez sélectionner une image.");
            return Upload.LIST_IGNORE;
        }
        const isLt5MB = f.size / 1024 / 1024 < 5;
        if (!isLt5MB) {
            message.error("Image trop lourde (max 5MB).");
            return Upload.LIST_IGNORE;
        }

        setFile(f);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(f));

        return false; // ✅ pas d'upload auto
    };

    const submit = async () => {
        if (!file) {
            message.warning("Choisis une image d'abord.");
            return;
        }
        try {
            setLoading(true);
            await updateUserAvatar(userId, file, token);
            message.success("Avatar mis à jour");
            reset();
            onClose?.();
            onUpdated?.(); // refresh user
        } catch (e) {
            message.error(e.message || "Erreur avatar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Changer l'avatar"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnHidden
        >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <Upload maxCount={1} listType={"picture"} beforeUpload={beforeUpload} onRemove={() => { reset(); return true; }}>
                    <Button icon={<UploadOutlined />}>Sélectionner une image</Button>
                </Upload>

                {previewUrl && (
                    <Image
                        src={previewUrl}
                        alt="Aperçu"
                        style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 8 }}
                    />
                )}

                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button onClick={handleCancel}>Annuler</Button>
                    <Button type="primary" onClick={submit} loading={loading}>
                        Enregistrer
                    </Button>
                </Space>
            </Space>
        </Modal>
    );
}
export default ChangeAvatarModal;
