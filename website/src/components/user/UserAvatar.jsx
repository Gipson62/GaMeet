import { useState } from "react";
import { Card, Avatar, Button, message } from "antd";
import ChangeAvatarModal from "./ChangeAvatarModal";

const API_PHOTO_URL = "http://localhost:3001/v1/photo";

const UserAvatarCard = ({ photo, userId, token, onAvatarUpdated }) => {
    const [open, setOpen] = useState(false);

    const src = photo?.id ? `${API_PHOTO_URL}/${photo.id}` : undefined;

    return (
        <Card title="Photo de profil" style={{ textAlign: "center" }}>
            <Avatar src={src} size={240} style={{ marginBottom: 16 }} />
            <br />
            <Button onClick={() => setOpen(true)}>Changer la photo</Button>

            <ChangeAvatarModal
                open={open}
                onClose={() => setOpen(false)}
                userId={userId}
                token={token}
                onUpdated={() => {
                    message.success("Avatar mis à jour");
                    onAvatarUpdated?.();
                }}
            />
        </Card>
    );
}
export default UserAvatarCard;
