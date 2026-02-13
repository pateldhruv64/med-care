import {
    Home,
    Users,
    Calendar,
    FileText,
    Activity,
    Settings,
    Briefcase,
    FlaskConical,
    BarChart3,
    BedDouble,
    Bell,
    ClipboardList,
    AlertTriangle,
    Clock,
    Star,
    CalendarDays,
    MessageSquare
} from 'lucide-react';

export const getSidebarItems = (role) => {
    const common = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Messages', icon: MessageSquare, path: '/chat' },
        { name: 'Notifications', icon: Bell, path: '/notifications' },
    ];

    const roleSpecific = {
        Admin: [
            { name: 'Doctors', icon: Users, path: '/doctors' },
            { name: 'Patients', icon: Users, path: '/patients' },
            { name: 'Appointments', icon: Calendar, path: '/appointments' },
            { name: 'Schedule', icon: Calendar, path: '/schedule' },
            { name: 'Lab Reports', icon: FlaskConical, path: '/lab-reports' },
            { name: 'Billing', icon: FileText, path: '/billing' },
            { name: 'Pharmacy', icon: Briefcase, path: '/pharmacy' },
            { name: 'Beds', icon: BedDouble, path: '/beds' },
            { name: 'Reports', icon: BarChart3, path: '/reports' },
            { name: 'Activity Log', icon: ClipboardList, path: '/activity-log' },
            { name: 'Inventory Alerts', icon: AlertTriangle, path: '/inventory-alerts' },
            { name: 'Attendance', icon: Clock, path: '/attendance' },
            { name: 'Leaves', icon: CalendarDays, path: '/leaves' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ],
        Doctor: [
            { name: 'My Patients', icon: Users, path: '/patients' },
            { name: 'Appointments', icon: Calendar, path: '/appointments' },
            { name: 'Schedule', icon: Calendar, path: '/schedule' },
            { name: 'Prescriptions', icon: FileText, path: '/prescriptions' },
            { name: 'Lab Reports', icon: FlaskConical, path: '/lab-reports' },
            { name: 'Attendance', icon: Clock, path: '/attendance' },
            { name: 'Leaves', icon: CalendarDays, path: '/leaves' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ],
        Patient: [
            { name: 'My Appointments', icon: Calendar, path: '/appointments' },
            { name: 'Lab Reports', icon: FlaskConical, path: '/lab-reports' },
            { name: 'Medical Records', icon: Activity, path: '/records' },
            { name: 'Bills', icon: FileText, path: '/bills' },
            { name: 'My Reviews', icon: Star, path: '/doctors' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ],
        Receptionist: [
            { name: 'Appointments', icon: Calendar, path: '/appointments' },
            { name: 'Schedule', icon: Calendar, path: '/schedule' },
            { name: 'Patients', icon: Users, path: '/patients' },
            { name: 'Billing', icon: FileText, path: '/billing' },
            { name: 'Beds', icon: BedDouble, path: '/beds' },
            { name: 'Attendance', icon: Clock, path: '/attendance' },
            { name: 'Leaves', icon: CalendarDays, path: '/leaves' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ],
        Pharmacist: [
            { name: 'Inventory', icon: Briefcase, path: '/pharmacy' },
            { name: 'Prescriptions', icon: FileText, path: '/prescriptions' },
            { name: 'Inventory Alerts', icon: AlertTriangle, path: '/inventory-alerts' },
            { name: 'Attendance', icon: Clock, path: '/attendance' },
            { name: 'Settings', icon: Settings, path: '/settings' },
        ],
    };

    return [...common, ...(roleSpecific[role] || [])];
};
