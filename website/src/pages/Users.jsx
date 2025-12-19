import { useEffect, useMemo, useState } from "react";
import { Card, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";

import UsersHeader from "../components/user/UsersHeader.jsx";
import UsersTable from "../components/user/UsersTable.jsx";
import UserForm from "../components/user/UserForm.jsx";

import { fetchUsers, deleteUser, addUser } from "../api/api.js";

export default function UsersPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchUsers(token);
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            message.error(err.message || "Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return users;

        return users.filter((u) => {
            const pseudo = (u.pseudo || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            return pseudo.includes(query) || email.includes(query);
        });
    }, [users, q]);

    const handleAddUser = async (payloadFromForm) => {
        try {
            const { avatarFile, ...userData } = payloadFromForm;

            await addUser(userData, avatarFile, token);

            message.success("Utilisateur ajouté !");
            setOpen(false);
            loadUsers();
        } catch (err) {
            message.error(err.message || "Erreur création utilisateur");
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId, token);
            message.success("Utilisateur supprimé");
            await loadUsers();
        } catch (err) {
            message.error(err.message || "Suppression impossible");
        }
    };

    return (
        <Card style={{ margin: 24 }}>
            <UsersHeader
                q={q}
                onSearchChange={setQ}
                onRefresh={loadUsers}
                onAdd={() => setOpen(true)}
            />

            <UsersTable
                users={filteredUsers}
                loading={loading}
                onDelete={handleDeleteUser}
                onView={(u) => navigate(`/user/${u.id}`)}
            />

            <Modal
                title="Ajouter un utilisateur"
                open={open}
                footer={null}
                onCancel={() => setOpen(false)}
                destroyOnHidden
            >
                <UserForm mode="create" onSubmit={handleAddUser} />
            </Modal>
        </Card>
    );
}
