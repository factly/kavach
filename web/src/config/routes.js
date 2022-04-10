import {
  SettingOutlined,
  AppstoreOutlined,
  UserOutlined,
  SecurityScanOutlined,
  ProfileOutlined,
  SendOutlined,
  ApartmentOutlined,
  PoundCircleOutlined,
  UsergroupAddOutlined,
  FileProtectOutlined,
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
import InvitationComponent from '../pages/profile/invitation';
import CreateSpace from '../pages/application/spaces/CreateSpace';
import EditSpace from '../pages/application/spaces/EditSpace';
import Spaces from '../pages/application/spaces/index';
import SpaceUser from '../pages/application/spaces/users';
import Token from '../pages/tokens';
import Roles from '../pages/roles';
import Policy from '../pages/policy';
import EditRoles from '../pages/roles/components/EditRoles';
import EditPolicy from '../pages/policy/components/EditPolicy';
import ViewPolicy from '../pages/policy/components/ViewPolicy';

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
    path: '/applications/:id/users',
    Component: ApplicationUsers,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Application Users',
  },
  {
    path: '/applications/spaces',
    Component: Spaces,
    enableNavigation: true,
    enableBreadcrumb: true,
    title: 'Spaces',
    Icon: ApartmentOutlined,
  },
  {
    path: '/applications/:id/spaces/create',
    Component: CreateSpace,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'New Space',
  },
  {
    path: '/applications/:id/spaces/:id/edit',
    Component: EditSpace,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'New Space',
  },
  {
    path: '/profile/invite',
    Component: InvitationComponent,
    enableNavigation: true,
    Icon: SendOutlined,
    title: 'Invitations',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/spaces/:id/users',
    Component: SpaceUser,
    enableNavigation: false,
    title: 'SpaceUsers',
    enableBreadcrumb: true,
  },
  {
    path: '/tokens',
    Component: Token,
    enableNavigation: true,
    title: 'Tokens',
    enableBreadcrumb: true,
    Icon: PoundCircleOutlined,
  },
  {
    path: '/roles',
    Component: Roles,
    enableNavigation: true,
    title: 'Roles',
    enableBreadcrumb: true,
    Icon: UsergroupAddOutlined,
  },
  {
    path: '/policies',
    Component: Policy,
    enableNavigation: true,
    title: 'Policy',
    enableBreadcrumb: true,
    Icon: FileProtectOutlined,
  },
  {
    path: '/organisations/:orgID/roles/:id/edit',
    Component: EditRoles,
    enableNavigation: false,
    title: 'Edit Organistion Role',
    enableBreadcrumb: true,
  },
  {
    path: '/organisations/:orgID/applications/:appID/roles/:id/edit',
    Component: EditRoles,
    enableNavigation: false,
    title: 'Edit Application Role',
    enableBreadcrumb: true,
  },
  {
    path: '/organisations/:orgID/applications/:appID/spaces/:spaceID/roles/:id/edit',
    Component: EditRoles,
    enableNavigation: false,
    title: 'Edit Space Role',
    enableBreadcrumb: true,
  },
  {
    path: '/organisations/:orgID/policy/:id/edit',
    Component: EditPolicy,
    enableNavigation: false,
    title: 'Edit Organistion Policy',
    enableBreadcrumb: true,
  },
  {
    path: '/organisations/:orgID/applications/:appID/policy/:id/edit',
    Component: EditPolicy,
    enableNavigation: false,
    title: 'Edit Application Policy',
    enableBreadcrumb: true,
  },
  {
    path: '/organisations/:orgID/applications/:appID/spaces/:spaceID/policy/:id/edit',
    Component: EditPolicy,
    enableNavigation: false,
    title: 'Edit Space Policy',
    enableBreadcrumb: true,
  },
  {
    path: '/policies/view',
    Component: ViewPolicy,
    enableNavigation: false,
    title: 'View Policy',
    enableBreadcrumb: true,
  },
];
