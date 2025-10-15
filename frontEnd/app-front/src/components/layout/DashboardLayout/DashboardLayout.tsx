import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebard/Sidebard';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [currentRole, setCurrentRole] = useState<"admin" | "asignador">("admin");

    useEffect(() => {
        const savedRole = localStorage.getItem("currentRole") as "admin" | "asignador" | null;
        if (savedRole) setCurrentRole(savedRole);
    }, []);

    const handleRoleChange = (role: "admin" | "asignador") => {
        setCurrentRole(role);
        localStorage.setItem("currentRole", role);
    };

    return (
        <div className="dashboard-layout">
            <Header />
            <div className="dashboard-content-row">
                <aside className="dashboard-sidebar">
                    <Sidebar currentRole={currentRole} onRoleChange={handleRoleChange} />
                </aside>
                <main className="dashboard-main-content">{children}</main>
            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;