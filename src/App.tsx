import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewsListPage from './pages/news/NewsListPage';
import NewsFormPage from './pages/news/NewsFormPage';
import JobsListPage from './pages/jobs/JobsListPage';
import JobFormPage from './pages/jobs/JobFormPage';
import JobApplicationsPage from './pages/jobs/JobApplicationsPage';
import SuccessClaimsPage from './pages/jobs/SuccessClaimsPage';
import CurrentsListPage from './pages/currents/CurrentsListPage';
import CurrentFormPage from './pages/currents/CurrentFormPage';
import LettersListPage from './pages/letters/LettersListPage';
import PodcastsListPage from './pages/podcasts/PodcastsListPage';
import PodcastFormPage from './pages/podcasts/PodcastFormPage';
import PollsListPage from './pages/polls/PollsListPage';
import PollFormPage from './pages/polls/PollFormPage';
import ProjectsListPage from './pages/projects/ProjectsListPage';
import ProjectFormPage from './pages/projects/ProjectFormPage';
// @ts-ignore
import ProjectDetailsPage from './pages/projects/ProjectDetailsPage';
import UsersListPage from './pages/users/UsersListPage';
// @ts-ignore
import RolesPage from './pages/roles/RolesPage';
// @ts-ignore
import EmployeesPage from './pages/employees/EmployeesPage';
import SettingsPage from './pages/SettingsPage';
import ComplaintsListPage from './pages/complaints/ComplaintsListPage';
// @ts-ignore
import ComplaintDetailsPage from './pages/complaints/ComplaintDetailsPage';
import FakeNewsListPage from './pages/fake-news/FakeNewsListPage';
// @ts-ignore
import FakeNewsDetailsPage from './pages/fake-news/FakeNewsDetailsPage';
// @ts-ignore
import GreenChallengesListPage from './pages/green/GreenChallengesListPage';
// @ts-ignore
import GreenChallengeDetailsPage from './pages/green/GreenChallengeDetailsPage';
import GreenChallengeFormPage from './pages/green/GreenChallengeFormPage';
import IdeasListPage from './pages/ideas/IdeasListPage';
// @ts-ignore
import IdeaDetailsPage from './pages/ideas/IdeaDetailsPage';
import MasterDataPage from './pages/master/MasterDataPage';
import RewardsListPage from './pages/rewards/RewardsListPage';
import RewardSettingsPage from './pages/rewards/RewardSettingsPage';
import YouthEventsListPage from './pages/youth/YouthEventsListPage';
import YouthEventFormPage from './pages/youth/YouthEventFormPage';
import YouthEventDetailsPage from './pages/youth/YouthEventDetailsPage';
import YouthInternshipsListPage from './pages/youth/YouthInternshipsListPage';
import YouthInternshipFormPage from './pages/youth/YouthInternshipFormPage';
import YouthInternshipDetailsPage from './pages/youth/YouthInternshipDetailsPage';
import SocialEngagementPage from './pages/social/SocialEngagementPage';
import SocialAnalyticsDashboard from './pages/social/SocialAnalyticsDashboard';
import ReportsPage from './pages/reports/ReportsPage';
import ResultsPage from './pages/results/ResultsPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DashboardPage />} />
                        {/* News */}
                        <Route path="news" element={<NewsListPage />} />
                        <Route path="news/new" element={<NewsFormPage />} />
                        <Route path="news/edit/:id" element={<NewsFormPage />} />
                        {/* Jobs */}
                        <Route path="jobs" element={<JobsListPage />} />
                        <Route path="jobs/new" element={<JobFormPage />} />
                        <Route path="jobs/edit/:id" element={<JobFormPage />} />
                        <Route path="jobs/applications" element={<JobApplicationsPage />} />
                        <Route path="jobs/success-claims" element={<SuccessClaimsPage />} />
                        {/* Currents */}
                        <Route path="currents" element={<CurrentsListPage />} />
                        <Route path="currents/new" element={<CurrentFormPage />} />
                        <Route path="currents/edit/:id" element={<CurrentFormPage />} />
                        {/* Letters */}
                        <Route path="letters" element={<LettersListPage />} />
                        {/* Podcasts */}
                        <Route path="podcasts" element={<PodcastsListPage />} />
                        <Route path="podcasts/new" element={<PodcastFormPage />} />
                        <Route path="podcasts/edit/:id" element={<PodcastFormPage />} />
                        {/* Polls */}
                        <Route path="polls" element={<PollsListPage />} />
                        <Route path="polls/new" element={<PollFormPage />} />
                        {/* Projects */}
                        <Route path="projects" element={<ProjectsListPage />} />
                        <Route path="projects/new" element={<ProjectFormPage />} />
                        <Route path="projects/:id" element={<ProjectDetailsPage />} />
                        <Route path="projects/edit/:id" element={<ProjectFormPage />} />
                        {/* RBAC & Users */}
                        <Route path="users" element={<UsersListPage />} />
                        <Route path="roles" element={<RolesPage />} />
                        <Route path="employees" element={<EmployeesPage />} />
                        {/* Complaints */}
                        <Route path="complaints" element={<ComplaintsListPage />} />
                        <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
                        {/* Fake News */}
                        <Route path="fake-news" element={<FakeNewsListPage />} />
                        <Route path="fake-news/:id" element={<FakeNewsDetailsPage />} />
                        {/* Green Challenges */}
                        <Route path="green" element={<GreenChallengesListPage />} />
                        <Route path="green/new" element={<GreenChallengeFormPage />} />
                        <Route path="green/:id" element={<GreenChallengeDetailsPage />} />
                        <Route path="green/edit/:id" element={<GreenChallengeFormPage />} />
                        {/* Ideas */}
                        <Route path="ideas" element={<IdeasListPage />} />
                        <Route path="ideas/:id" element={<IdeaDetailsPage />} />
                        {/* Master Data */}
                        <Route path="master" element={<MasterDataPage />} />
                        {/* Rewards */}
                        <Route path="rewards" element={<RewardsListPage />} />
                        <Route path="rewards/settings" element={<RewardSettingsPage />} />
                        {/* Youth Events */}
                        <Route path="youth/events" element={<YouthEventsListPage />} />
                        <Route path="youth/events/new" element={<YouthEventFormPage />} />
                        <Route path="youth/events/edit/:id" element={<YouthEventFormPage />} />
                        <Route path="youth/events/:id/manage" element={<YouthEventDetailsPage />} />
                        {/* Youth Internships */}
                        <Route path="youth/internships" element={<YouthInternshipsListPage />} />
                        <Route path="youth/internships/new" element={<YouthInternshipFormPage />} />
                        <Route path="youth/internships/edit/:id" element={<YouthInternshipFormPage />} />
                        <Route path="youth/internships/:id/manage" element={<YouthInternshipDetailsPage />} />
                        {/* Social Engagement */}
                        <Route path="social" element={<SocialEngagementPage />} />
                        <Route path="social/analytics/:platformId" element={<SocialAnalyticsDashboard />} />
                        <Route path="reports" element={<ReportsPage />} />
                        {/* Results */}
                        <Route path="results" element={<ResultsPage />} />
                        {/* Settings */}
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #fed7aa',
                        borderRadius: '12px',
                        fontSize: '14px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    },
                    success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
                }}
            />
        </AuthProvider>
    );
}
