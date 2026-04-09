import { createBrowserRouter } from 'react-router';
import { Login } from './pages/Login';
import { StudentLayout } from './components/StudentLayout';
import { AdminLayout } from './components/AdminLayout';
import { CourseCatalog } from './pages/student/CourseCatalog';
import { MySchedule } from './pages/student/MySchedule';
import { MyRegistrations } from './pages/student/MyRegistrations';
import { StudentProfile } from './pages/student/StudentProfile';
import { AdminOverview } from './pages/admin/AdminOverview';
import { ManageCourses } from './pages/admin/ManageCourses';
import { ManageRegistrations } from './pages/admin/ManageRegistrations';
import { AdminProfile } from './pages/admin/AdminProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/student',
    Component: StudentLayout,
    children: [
      { index: true, Component: CourseCatalog },
      { path: 'schedule', Component: MySchedule },
      { path: 'registrations', Component: MyRegistrations },
      { path: 'profile', Component: StudentProfile },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverview },
      { path: 'courses', Component: ManageCourses },
      { path: 'registrations', Component: ManageRegistrations },
      { path: 'profile', Component: AdminProfile },
    ],
  },
]);