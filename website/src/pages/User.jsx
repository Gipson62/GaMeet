import { useEffect, useMemo, useState } from "react";
import { Card, Table, message } from "antd";
import { useNavigate } from "react-router-dom";

import UsersHeader from "../components/user/UsersHeader.jsx";
import UserForm from "../components/user/UserForm.jsx";
import { buildUsersColumns } from "../components/user/UsersColumns.jsx";
import { fetchUsers, deleteUser } from "../api/api.js";


export default function UsersPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [q, setQ] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchUsers(token);
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) {
            message.error(e.message || "Erreur lors du chargement des utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
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

    const columns = useMemo(
        () =>
            buildUsersColumns({
                onView: (u) => navigate(`/user/${u.id}`),
                onEdit: (u) => navigate(`/user/${u.id}?edit=1`),
                onDelete: async (u) => {
                    try {
                        await deleteUser(u.id, token);
                        message.success("Utilisateur supprimé");
                        loadUsers();
                    } catch (e) {
                        message.error(e.message || "Suppression impossible");
                    }
                },
            }),
        [navigate, token]
    );

    return (
        <Card style={{ borderRadius: 8 }}>
            <UsersHeader
                title="GaMeet Admin — Utilisateurs"
                searchValue={q}
                onSearchChange={setQ}
                onRefresh={loadUsers}
                onAdd={() => setIsAddOpen(true)}
            />

            <Table
                rowKey="id"
                loading={loading}
                dataSource={filteredUsers}
                columns={columns}
                pagination={{ pageSize: 6 }}
            />

            <UserForm
                open={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                token={token}
                onCreated={loadUsers}
            />
        </Card>
    );
}
