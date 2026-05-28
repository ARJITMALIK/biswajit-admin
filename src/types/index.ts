// ─── API Response Types ─────────────────────────────────────────
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

export interface FamilyMember {
    id: string;
    user_id: number;
    name: string;
    relationship?: string;
    age?: number;
    gender?: string;
    phone_number?: string;
    mobile_number?: string;
    photo_url?: string;
    voter_id?: string;
    date_of_birth?: string;
    occupation?: string;
    marital_status?: string;
    children_count?: number;
    religion?: string;
    caste?: string;
    education_level?: string;
    monthly_income?: string;
    favorite_mla?: string;
    location?: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    status: 'success' | 'error';
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─── User ───────────────────────────────────────────────────────
export interface User {
    user_id: number;
    user_name: string;
    email: string;
    mobile: string;
    role_id: number;
    status: number;
    reward_points: number;
    current_tag?: string;
    constituency?: string;
    booth_name?: string;
    latitude?: number;
    longitude?: number;
    followed_party?: string;
    profession?: string;
    voter_id?: string;
    interests?: any;
    is_profile_rewarded?: boolean;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    children_count?: number;
    religion?: string;
    caste?: string;
    education_level?: string;
    family_members_count?: number;
    monthly_income?: string;
    favorite_mla?: string;
    occupation?: string;
    created_at: string;
    updated_at: string;
    total_interactions?: number;
    family_members?: FamilyMember[];
}

export interface UserEngagement {
    userId: number;
    userName: string;
    mobile?: string | null;
    stats: {
        profile_completion: {
            percentage: number;
            breakdown: Array<{
                key: string;
                label: string;
                weight: number;
                isComplete: boolean;
            }>;
        };
        news: { likes: number; comments: number; views: number };
        currents: { likes: number; comments: number; views: number; shares: number };
        podcasts: { likes: number; plays: number; comments: number };
        polls: { votes: number };
        green: { joined: number; verified: number; impact: number };
        grievances: { complaints: number; letters: number };
        totalInteractions: number;
    };
}

// ─── News ───────────────────────────────────────────────────────
export interface News {
    id: string;
    title: string;
    description: string;
    short_description: string | null;
    thumbnail: string;
    category: string;
    author_name: string | null;
    author_image: string | null;
    source_name: string | null;
    source_url: string | null;
    views_count: number;
    shares_count: number;
    reading_time: string | null;
    tags: string[];
    is_featured: boolean;
    is_trending: boolean;
    video_url: string | null;
    seo_title: string | null;
    seo_description: string | null;
    slug: string | null;
    language: string;
    images: string[];
    rich_content: any[];
    is_published: boolean;
    likes: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}


// ─── Job ────────────────────────────────────────────────────────
export interface Job {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string;
    benefits: string;
    salary: string;
    location: string;
    type: string;
    category: string;
    notification_no: string | null;
    department: string | null;
    pay_scale: string | null;
    age_limit: string | null;
    vacancies: number;
    qualification: string | null;
    experience: string | null;
    last_date: string | null;
    application_url: string | null;
    views_count: number;
    applications_count: number;
    is_featured: boolean;
    tags: string[];
    is_active: boolean;
    job_class: 'Government' | 'Private' | 'Semi-Government' | null;
    apply_method: 'Official Website' | 'Walk-in / Offline' | null;
    apply_address: string | null;
    success_count: number;
    posted_at: string;
    created_at: string;
    updated_at: string;
}

export interface JobSuccessClaim {
    id: string;
    job_id: string;
    user_id: number;
    claimed_at: string;
    status: 'pending' | 'verified' | 'rejected';
    proof_url: string | null;
    admin_remark: string | null;
    job_title?: string;
    user_name?: string;
    mobile?: string;
}


export interface JobApplication {
    id: string;
    job_id: string;
    user_id: number;
    status: string;
    applied_at: string;
    created_at: string;
    updated_at: string;
}

export interface AdminJobApplication {
    id: string;
    status: string;
    applied_at: string;
    resume_url: string | null;
    cover_letter: string | null;
    documents: any[] | null;
    admin_notes: string | null;
    applicant_name: string | null;
    applicant_email: string | null;
    applicant_phone: string | null;
    job_id: string;
    job_title: string;
    job_company: string;
    job_department: string | null;
    user_id: number;
    user_name: string;
    email: string | null;
    mobile: string | null;
}


// ─── Current ────────────────────────────────────────────────────
export interface Current {
    id: string;
    title: string;
    description: string;
    video_url: string;
    thumbnail_url: string | null;
    is_published: boolean;
    likes: number;
    shares_count: number;
    views_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
}

// ─── Letter ─────────────────────────────────────────────────────
export interface Letter {
    id: string;
    user_id: number;
    subject: string;
    message: string;
    attachments: any;
    status: string;
    response: string | null;
    user_name?: string;
    mobile?: string;
    created_at: string;
    updated_at: string;
}

// ─── Podcast ────────────────────────────────────────────────────
export interface Podcast {
    id: string;
    title: string;
    host: string;
    audio_url: string;
    thumbnail_url: string | null;
    duration: string | null;
    description: string | null;
    transcript: string | null;
    likes_count: number | null;
    comments_count: number | null;
    plays_count: number | null;
    created_at: string;
    updated_at: string;
}

// ─── Poll ───────────────────────────────────────────────────────
export interface PollOption {
    id: string;
    poll_id: string;
    option_text: string;
    votes_count: number;
    created_at: string;
    updated_at: string;
}

export interface Poll {
    id: string;
    question: string;
    end_date: string;
    is_active: boolean;
    options: PollOption[];
    voted_option_id?: string;
    created_at: string;
    updated_at: string;
}

// ─── Development Project ────────────────────────────────────────
export interface ProjectMilestone {
    id: string;
    project_id: string;
    title: string;
    description: string;
    status: string;
    milestone_date: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProjectImage {
    id: string;
    project_id: string;
    image_url: string;
    caption: string | null;
    is_main: boolean;
    created_at: string;
}

export interface DevelopmentProject {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    budget: string | null;
    location: string;
    image_url: string | null;
    start_date: string | null;
    end_date: string | null;
    type: string;
    beneficiaries: number;
    assigned_department: string | null;
    contractor_name: string | null;
    tags: string[];
    milestones?: ProjectMilestone[];
    images?: ProjectImage[];
    created_at: string;
    updated_at: string;
}

// ─── Role Mapping ───────────────────────────────────────────────
export const ROLE_MAP: Record<number, string> = {
    1: 'Admin',
    2: 'Editor',
    3: 'User',
};

export const STATUS_MAP: Record<number, string> = {
    0: 'Inactive',
    1: 'Active',
    2: 'Suspended',
};

// ─── Complaint ──────────────────────────────────────────────────
export interface Complaint {
    id: string;
    user_id: number;
    category: string;
    subject: string;
    details: string;
    images: string[] | any;
    status: string;
    priority: string;
    assigned_department: string | null;
    official_remark: string | null;
    location_text: string | null;
    latitude: number | null;
    longitude: number | null;
    resolution_date: string | null;
    is_anonymous: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    applicant_name?: string;
    applicant_mobile?: string;
    applicant_email?: string;
}

// ─── Fake News Report ───────────────────────────────────────────
export interface FakeNewsReport {
    id: string;
    user_id: number;
    title: string;
    description: string;
    source_url: string | null;
    image_url: string | null;
    status: string;
    priority: string;
    category: string;
    official_verdict: string | null;
    fact_checked_at: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    reporter_name?: string;
    reporter_mobile?: string;
    reporter_email?: string;
}

// ─── Green Challenge ────────────────────────────────────────────
export interface GreenChallenge {
    id: string;
    title: string;
    subtitle?: string | null;
    category?: string | null;
    difficulty?: string | null;
    impact_metric?: string | null;
    impact_value_goal?: number | null;
    description: string | null;
    points: number;
    image_url: string | null;
    target_people: number;
    people_joined: number;
    start_date?: string | null;
    end_date?: string | null;
    created_at: string;
    updated_at: string;

    // Computed / Joined fields
    progress?: number;
    user_status?: string;
    user_contribution?: string | null;
    user_image_proof?: string | null;
    user_impact_value?: number;
}

export interface GreenChallengeParticipant {
    id: string;
    user_id: number;
    challenge_id: string;
    status: string;
    contribution: string;
    image_proof_url?: string;
    impact_value?: number;
    admin_remark?: string;
    joined_at?: string;
    completed_at?: string;
    verified_at?: string;
    created_at: string;
    updated_at: string;
    participant_name?: string;
    participant_mobile?: string;
}

// ─── Community Idea ─────────────────────────────────────────────
export interface Vote {
    userId: number;
    userName: string;
    timestamp: string;
}

export interface CommunityIdea {
    id: string;
    authorId: number;
    title: string;
    description: string;
    category: string;
    status: string;
    impactScore: number;
    adminRemark?: string;
    locationTag?: string;
    isFeatured: boolean;
    officialUpdate?: string;
    budgetEstimate?: number;
    authorName?: string;
    authorMobile?: string;
    votes: Vote[];
    createdAt: string;
    updatedAt: string;
}

// ─── Master Data ────────────────────────────────────────────────
export interface Booth {
    id: string;
    booth_no: number;
    name: string;
    constituency_id: string;
    created_at: string;
    updated_at: string;
}

export interface Constituency {
    id: string;
    name: string;
    district_id: string;
    state: string;
    created_at: string;
    updated_at: string;
}

export interface District {
    id: string;
    name: string;
    state: string;
    created_at: string;
    updated_at: string;
}

export interface PoliticalPartyLeader {
    id: string;
    party_id: string;
    name: string;
    designation: string;
    photo_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface PoliticalParty {
    id: string;
    name: string;
    abbreviation: string;
    logo_url: string | null;
    color: string | null;
    flag_image_url: string | null;
    leaders?: PoliticalPartyLeader[];
    created_at: string;
    updated_at: string;
}

// ─── MLA ────────────────────────────────────────────────────────
export interface Mla {
    id: string;
    name: string;
    party_id: string;
    image_url: string | null;
    party_name?: string;
    party_abbreviation?: string;
    party_color?: string;
    party_flag_image_url?: string;
    created_at: string;
    updated_at: string;
}

// ─── Election Result ────────────────────────────────────────────
export interface ElectionResult {
    id: string;
    booth_id: string;
    mla_id: string;
    election_year: number;
    votes_gained: number;
    booth_name?: string;
    booth_no?: number;
    constituency_name?: string;
    latitude?: number;
    longitude?: number;
    mla_name?: string;
    mla_image_url?: string;
    party_name?: string;
    party_abbreviation?: string;
    party_color?: string;
    created_at: string;
    updated_at: string;
}

// ─── Reward Point History ───────────────────────────────────────
export interface RewardPointHistory {
    id: string;
    user_id: number;
    points: number;
    reason: string;
    created_at: string;
}

export interface RewardConfiguration {
    id: string;
    action_key: string;
    description: string;
    points: number;
    is_active: boolean;
    created_at: string;
}

export interface RewardMilestone {
    id: string;
    points_threshold: number;
    tag_name: string;
    reward_description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserMilestone {
    id: string;
    user_id: number;
    milestone_id: string | null;
    tier_key: string;
    points_at_unlock: number;
    unlocked_at: string;
    user_name?: string;
    mobile?: string;
    tag_name?: string;
    reward_description?: string;
}

export interface YouthEventRegistration {
    id: string;
    event_id: string;
    user_id: number;
    status: 'registered' | 'attended' | 'no_show' | 'cancelled';
    admin_remark?: string;
    attendance_marked_at?: string;
    registered_at: string;
    user_name?: string;
    mobile?: string;
}

export interface YouthInternshipApplication {
    id: string;
    internship_id: string;
    user_id: number;
    status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'interviewing';
    admin_remark?: string;
    reviewed_at?: string;
    user_name?: string;
    mobile?: string;
    email?: string;
    profession?: string;
    location?: string;
    applied_at?: string;
    political_experience?: {
        party: string;
        leader: string;
        role: string;
        timeline: string;
        responsibility: string;
    };
    work_experience?: {
        company: string;
        role: string;
        duration: string;
        description?: string;
    }[];
    work_proofs?: string[];
    created_at: string;
}

export interface YouthEventStats {
    totalEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
    totalAttended: number;
}

export interface YouthInternshipStats {
    totalInternships: number;
    openInternships: number;
    totalApplications: number;
    totalPlacements: number;
}

// ─── Youth ──────────────────────────────────────────────────────
export interface YouthEvent {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    date: string;
    time: string;
    location: string;
    organizer: string | null;
    capacity: number | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    registration_deadline: string | null;
    tags: any | null;
    registrations_count?: number;
    created_at: string;
    updated_at: string;
}

export interface YouthInternship {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    duration: string;
    salary: string | null;
    description: string | null;
    requirements: any | null;
    posted_date: string | null;
    openings: number | null;
    deadline: string | null;
    status: 'open' | 'closed' | 'filled' | 'cancelled';
    tags: any | null;
    applicants_count?: number;
    created_at: string;
    updated_at: string;
}
export interface SocialPlatform {
    id: string;
    name: string;
    icon_key: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SocialMetric {
    id: string;
    platform_id: string;
    platform_name?: string;
    icon_key?: string;
    followers_count: number;
    views_count: number;
    likes_count: number;
    comments_count: number;
    snapshot_date: string;
    created_at: string;
    followerGrowth?: number;
    engagementRate?: number;
}
