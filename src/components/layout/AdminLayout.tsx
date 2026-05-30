import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-900">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
                <main className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.99 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <Outlet context={{ setCollapsed }} />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
