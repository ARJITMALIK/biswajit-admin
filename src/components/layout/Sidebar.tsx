import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome,
    HiOutlineNewspaper,
    HiOutlineBriefcase,
    HiOutlineDocumentText,
    HiOutlineVideoCamera,
    HiOutlineEnvelope,
    HiOutlineMicrophone,
    HiOutlineChartBar,
    HiOutlineBuildingOffice,
    HiOutlineUsers,
    HiOutlineCog6Tooth,
    HiOutlineExclamationCircle,
    HiOutlineFlag,
    HiOutlineShieldExclamation,
    HiOutlineSparkles,
    HiOutlineLightBulb,
    HiOutlineCircleStack,
    HiOutlineGift,
    HiOutlineCalendarDays,
    HiOutlineIdentification,
    HiOutlineUserGroup,
    HiOutlineGlobeAlt,
} from 'react-icons/hi2';

const navItems = [
    { label: 'Dashboard', icon: HiOutlineHome, path: '/', module: 'dashboard' },
    { label: 'News', icon: HiOutlineNewspaper, path: '/news', module: 'news' },
    { label: 'Jobs', icon: HiOutlineBriefcase, path: '/jobs', module: 'jobs' },
    { label: 'Job Applications', icon: HiOutlineDocumentText, path: '/jobs/applications', module: 'jobs' },
    { label: 'Currents', icon: HiOutlineVideoCamera, path: '/currents', module: 'currents' },
    { label: 'Letters', icon: HiOutlineEnvelope, path: '/letters', module: 'letters' },
    { label: 'Podcasts', icon: HiOutlineMicrophone, path: '/podcasts', module: 'podcasts' },
    { label: 'Polls', icon: HiOutlineChartBar, path: '/polls', module: 'polls' },
    { label: 'Projects', icon: HiOutlineBuildingOffice, path: '/projects', module: 'projects' },
    { label: 'Complaints', icon: HiOutlineExclamationCircle, path: '/complaints', module: 'complaints' },
    { label: 'Fake News', icon: HiOutlineShieldExclamation, path: '/fake-news', module: 'fake_news' },
    { label: 'Green Challenges', icon: HiOutlineSparkles, path: '/green', module: 'green_challenges' },
    { label: 'Ideas', icon: HiOutlineLightBulb, path: '/ideas', module: 'ideas' },
    { label: 'Reports', icon: HiOutlineFlag, path: '/reports', module: 'users' }, // Using 'users' module for permission fallback
    { label: 'Master Data', icon: HiOutlineCircleStack, path: '/master', module: 'master_data' },
    { label: 'Rewards', icon: HiOutlineGift, path: '/rewards', module: 'rewards' },
    { label: 'Youth Events', icon: HiOutlineCalendarDays, path: '/youth/events', module: 'youth_events' },
    { label: 'Youth Interns', icon: HiOutlineBriefcase, path: '/youth/internships', module: 'youth_internships' },
    { label: 'Social Metrics', icon: HiOutlineGlobeAlt, path: '/social', module: 'rewards' },
    { label: 'Users', icon: HiOutlineUsers, path: '/users', module: 'users' },
    { label: 'Roles', icon: HiOutlineIdentification, path: '/roles', module: 'roles' },
    { label: 'Employees', icon: HiOutlineUserGroup, path: '/employees', module: 'employees' },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const { isSuperAdmin, hasPermission } = useAuth();
    const location = useLocation();

    // Filter items based on whether user has 'can_read' permissions for that module
    const filteredNavItems = navItems.filter(item => 
        isSuperAdmin || hasPermission(item.module, 'can_read')
    );

    const renderNavLink = (item: { label: string; icon: any; path: string; module?: string }) => {
        const isActive =
            item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

        return (
            <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive
                    ? 'bg-brand-50 text-brand-600 shadow-sm border border-brand-100'
                    : 'text-slate-500 hover:text-brand-600 hover:bg-brand-50'
                    }`}
            >
                <item.icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-brand-500'
                        }`}
                />
                {!collapsed && (
                    <span className="animate-fade-in truncate tracking-tight">{item.label}</span>
                )}
                {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                )}
            </NavLink>
        );
    };

    return (
        <aside
            className={`fixed top-0 left-0 h-screen glass-strong z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
                    <span className="text-white font-bold text-sm">VD</span>
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="text-sm font-bold text-slate-800 leading-tight">Voice of Daimary</h1>
                        <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Admin Panel</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
                <div className="space-y-1">
                    {filteredNavItems.map(renderNavLink)}
                </div>
            </nav>

            {/* Bottom Section */}
            {(isSuperAdmin || hasPermission('settings', 'can_read')) && (
                <div className="px-3 pb-6 pt-4 border-t border-slate-100">
                    {renderNavLink({ label: 'Settings', icon: HiOutlineCog6Tooth, path: '/settings', module: 'settings' })}
                </div>
            )}
        </aside>
    );
}
