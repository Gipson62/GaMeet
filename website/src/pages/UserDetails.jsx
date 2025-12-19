import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Space, Spin, message, Modal, Card, Avatar, Tag, Typography } from "antd";

import { fetchUserById, fetchMe, deleteUser, updateUser } from "../api/api.js";

import UserEventsCard from "../components/user/UserEvents";
import UserReviewsCard from "../components/user/UserReviews";
import UserForm from "../components/user/UserForm";
import UserHeader from "../components/user/UserHeader";
import dayjs from "dayjs";

const API_PHOTO_URL = "http://localhost:3001/v1/photo";

const { Title, Text } = Typography;

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);

    const [editOpen, setEditOpen] = useState(false);
    const [editSaving, setEditSaving] = useState(false);

    const token = localStorage.getItem("token");


    const load = async () => {
        try {
            setLoading(true);
            const [meData, userData] = await Promise.all([
                fetchMe(token),
                id ? fetchUserById(id, token) : fetchMe(token),
            ]);
            setMe(meData);
            setUser(userData);
        } catch (e) {
            message.error(e.message || "Erreur chargement utilisateur");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        load();
    }, [id, token]);

    const handleDelete = () => {
        if (!user) return;

        Modal.confirm({
            title: "Supprimer l'utilisateur",
            content: "Cette action est irréversible.",
            okText: "Supprimer",
            okType: "danger",
            cancelText: "Annuler",
            async onOk() {
                try {
                    await deleteUser(user.id, token);
                    message.success("Utilisateur supprimé");

                    // auto-suppression -> logout
                    if (me && user.id === me.id) {
                        localStorage.removeItem("token");
                        navigate("/login");
                        return;
                    }

                    navigate("/users");
                } catch (e) {
                    message.error(e.message || "Suppression impossible");
                }
            },
        });
    };

    const handleEditClick = () => {
        if (!me || !user) return;

        // admin → autre admin = interdit
        if (me.is_admin && user.is_admin && me.id !== user.id) {
            message.error("Impossible de modifier le profil d’un autre administrateur");
            return;
        }

        // sinon OK
        setEditOpen(true);
    };

    const handleEditSubmit = async (payload) => {
        try {
            setEditSaving(true);
            console.log("Submitting edit:", payload);
            console.log("User ID:", user.id);
            await updateUser(user.id, payload, token);
            message.success("Profil modifié");
            setEditOpen(false);
            await load();
        } catch (e) {
            message.error(e.message || "Modification impossible");
        } finally {
            setEditSaving(false);
        }
    };

    if (loading) return <Spin size="large" />;
    if (!user) return null;


    const photoSrc = user.photo?.id ? `${API_PHOTO_URL}/${user.photo.id}` : undefined;

    return (
        <div style={{ padding: 24 }}>
            <UserHeader
                onEdit={handleEditClick}
                onDelete={handleDelete}
            />

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Space direction="vertical" size={16}>
                    <Card>
                        <Space direction="vertical" size={4}>
                            <Space align="center">
                                <Title level={3} style={{ margin: 0 }}>{user.pseudo}</Title>
                                <Tag color="blue">{user.is_admin ? "Administrateur" : "Utilisateur"}</Tag>
                            </Space>
                            <Text type="secondary">{user.email}</Text>
                            <Text>{user.bio}</Text>
                            <Text type="secondary">Membre depuis : {dayjs(user.creation_date).format("DD/MM/YYYY")}</Text>
                        </Space>
                    </Card>

                    <UserEventsCard
                        title="Événements organisés"
                        events={user.event || []}
                        navigate={navigate}
                    />

                    <UserEventsCard
                        title="Participations"
                        events={(user.participant || []).map((p) => p.event)}
                        navigate={navigate}
                        emptyText
                    />

                    <UserReviewsCard reviews={user.review || []} />
                </Space>

                <Card title="Photo de profil" style={{ textAlign: "center" }}>
                    <Avatar src={photoSrc} size={240} style={{ marginBottom: 16 }} />
                </Card>
            </div>

            <Modal
                title="Modifier l’utilisateur"
                open={editOpen}
                footer={null}
                onCancel={() => setEditOpen(false)}
            >
                <UserForm mode="edit" initialValues={user} onSubmit={handleEditSubmit} />
            </Modal>
        </div>
    );
}
