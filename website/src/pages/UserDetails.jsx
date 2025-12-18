import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Space, Spin, message, Button } from "antd";
import { ReloadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { fetchUserById, fetchMe } from "../api/api.js";

import UserHeaderCard from "../components/user/UserHeader";
import UserEventsCard from "../components/user/UserEvents";
import UserReviewsCard from "../components/user/UserReviews";
import UserAvatarCard from "../components/user/UserAvatar";

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const loadUser = async () => {
        try {
            setLoading(true);
            const data = id
                ? await fetchUserById(id, token)
                : await fetchMe(token); // profil connecté
            setUser(data);
        } catch (e) {
            message.error(e.message || "Erreur chargement utilisateur");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [id]);

    if (loading) return <Spin size="large" />;
    if (!user) return null;

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                <Button icon={<ReloadOutlined />} onClick={loadUser}>
                    Actualiser
                </Button>
                <Button icon={<EditOutlined />} type="primary">
                    Modifier
                </Button>
                <Button icon={<DeleteOutlined />} danger>
                    Supprimer
                </Button>
            </Space>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Space direction="vertical" size={16}>
                    <UserHeaderCard user={user} />
                    <UserEventsCard
                        title="Événements organisés"
                        events={user.event}
                        navigate={navigate}
                    />
                    <UserEventsCard
                        title="Événements auxquels il a participé"
                        events={user.participant}
                        navigate={navigate}
                        emptyText
                    />
                    <UserReviewsCard reviews={user.review} />
                </Space>

                <UserAvatarCard
                    photo={user.photo}
                    userId={user.id}
                    token={token}
                    onAvatarUpdated={loadUser}
                />
            </div>
        </Space>
    );
}
