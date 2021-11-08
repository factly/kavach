import {
  SettingOutlined,
  AppstoreOutlined,
  UserOutlined,
  SecurityScanOutlined,
  ProfileOutlined,
} from '@ant-design/icons';

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
import ApplicationUsers from '../pages/application/users/index';
import GetApplication from '../pages/application/GetApplication';
import KratosError from '../pages/error';
export default [
  {
    path: '/settings',
    Component: Settings,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: SettingOutlined,
    title: 'Settings',
  },
  {
    path: '/organisation',
    Component: OrganisationCreate,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UserOutlined,
    title: 'Organisation',
  },
  {
    path: '/users',
    Component: Users,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: UserOutlined,
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
    Icon: SecurityScanOutlined,
    title: 'Password',
  },
  {
    path: '/profile',
    Component: Profile,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: ProfileOutlined,
    title: 'Profile',
  },
  {
    path: '/applications',
    Component: Application,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: AppstoreOutlined,
    title: 'Applications',
  },
  {
    path: '/applications/create',
    Component: CreateApplication,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'New Application',
  },
  {
    path: '/applications/:id/edit',
    Component: EditApplication,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Application',
  },
  {
    path: '/applications/:id/detail',
    Component: GetApplication,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Application',
  },
  {
    path: '/applications/:id/users',
    Component: ApplicationUsers,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Application Users',
  },
  // {
  //   path: '/errors',
  //   Component: KratosError,
  //   enableNavigation: false,
  //   enableBreadcrumb: false,
  //   title: 'Error',
  // },
];
