import { PieChartOutlined, AppstoreOutlined } from '@ant-design/icons';

//Pages
import Settings from '../pages/settings';
import Users from '../pages/users';
import Profile from '../pages/profile';
import Password from '../pages/password';
import OrganisationCreate from '../pages/organisation';
import Application from '../pages/application';
import CreateApplication from '../pages/application/CreateApplication';
import EditApplication from '../pages/application/EditApplication';
import NewUser from '../pages/users/NewUser';

export default [
  {
    path: '/settings',
    Component: Settings,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Settings',
  },
  {
    path: '/organisation',
    Component: OrganisationCreate,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Organisation',
  },
  {
    path: '/users',
    Component: Users,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Users',
  },
  {
    path: '/users/new',
    Component: NewUser,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'New User',
  },
  {
    path: '/password',
    Component: Password,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Password',
  },
  {
    path: '/profile',
    Component: Profile,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Profile',
  },
  {
    path: '/application',
    Component: Application,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: AppstoreOutlined,
    title: 'Application',
  },
  {
    path: '/application/create',
    Component: CreateApplication,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Create Application',
  },
  {
    path: '/application/:id/edit',
    Component: EditApplication,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Application',
  },
];
