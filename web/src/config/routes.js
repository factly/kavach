import {
  AppstoreOutlined,
  SecurityScanOutlined,
  ProfileOutlined,
  SendOutlined,
  BankOutlined,
} from '@ant-design/icons';

//Pages
import Profile from '../pages/profile';
import Password from '../pages/password';
import OrganisationCreate from '../pages/organisation/components/OrganisationForm';
import Application from '../pages/application';
import CreateApplication from '../pages/application/CreateApplication';
import EditApplication from '../pages/application/EditApplication';
import ApplicationUsers from '../pages/application/users/index';
import InvitationComponent from '../pages/profile/invitation';
import ApplicationSettings from '../pages/application/settings';
import ApplicationTokens from '../pages/application/settings/token';
import CreateApplicationTokenForm from '../pages/application/settings/token/components/CreateTokenForm';
import CreateApplicationRoleForm from '../pages/application/settings/roles/components/CreateRoleForm';
import ApplicationRoles from '../pages/application/settings/roles';
import EditApplicationRole from '../pages/application/settings/roles/components/EditRole';
import ApplicationRoleUsers from '../pages/application/settings/roles/users';
import ApplicationPolicies from '../pages/application/settings/policies';
import CreateApplicationPolicyForm from '../pages/application/settings/policies/components/CreateApplicationPolicy';
import ViewApplicationPolicy from '../pages/application/settings/policies/components/ViewApplicationPolicy';
import EditApplicationPolicy from '../pages/application/settings/policies/components/EditApplicationPolicy';
import ApplicationSpaces from '../pages/application/settings/spaces';
import CreateSpace from '../pages/application/settings/spaces/components/SpaceForm';
import SpaceSettings from '../pages/application/settings/spaces/settings';
import SpaceUser from '../pages/application/settings/spaces/settings/users';
import SpaceTokens from '../pages/application/settings/spaces/settings/tokens';
import CreateSpaceTokenForm from '../pages/application/settings/spaces/settings/tokens/components/CreateSpaceToken';
import CreateSpaceRoleForm from '../pages/application/settings/spaces/settings/roles/components/CreateRoleForm';
import SpaceRoles from '../pages/application/settings/spaces/settings/roles';
import SpaceRoleUsers from '../pages/application/settings/spaces/settings/roles/users';
import SpacePolicies from '../pages/application/settings/spaces/settings/policies';
import CreateSpacePolicyForm from '../pages/application/settings/spaces/settings/policies/components/CreateSpacePolicy';
import ViewSpacePolicy from '../pages/application/settings/spaces/settings/policies/components/ViewSpacePolicy';
import EditSpacePolicy from '../pages/application/settings/spaces/settings/policies/components/EditSpacePolicy';
import OrganisationDetails from '../pages/organisation';
import OrganisationEdit from '../pages/organisation/components/EditOrganisation';
import OrganisationUsers from '../pages/organisation/settings/users';
import NewOrganisationUser from '../pages/organisation/settings/users/components/NewUser';
import OrganisationTokens from '../pages/organisation/settings/tokens';
import CreateOrganisationToken from '../pages/organisation/settings/tokens/components/CreateTokenForm';
import OrganisationPolicies from '../pages/organisation/settings/policies';
import CreateOrganisationPolicyForm from '../pages/organisation/settings/policies/components/CreateOrganisationPolicy';
import ViewOrganisationPolicy from '../pages/organisation/settings/policies/components/ViewOrganisationPolicy';
import EditOrganisationPolicy from '../pages/organisation/settings/policies/components/EditOrganistionPolicy';
import OrganisationRoles from '../pages/organisation/settings/roles';
import CreateOrganisationRoleForm from '../pages/organisation/settings/roles/components/CreateRoleForm';
import EditOrganisationRole from '../pages/organisation/settings/roles/components/EditRole';
import OrganisationRoleUsers from '../pages/organisation/settings/roles/users';
import EditSpace from '../pages/application/settings/spaces/components/editspace';
import SpaceDetails from '../pages/application/settings/spaces/components/editspace/components/SpaceDetails';
import SpaceLogoForm from '../pages/application/settings/spaces/components/editspace/components/SpaceLogoform';
import SpaceMetadata from '../pages/application/settings/spaces/components/editspace/components/SpaceMetadata';

export default [
  {
    path: '/organisation',
    Component: OrganisationDetails,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: BankOutlined,
    title: 'Organisation',
  },
  {
    path: '/organisation/create',
    Component: OrganisationCreate,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation',
  },
  {
    path: '/organisation/edit',
    Component: OrganisationEdit,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Organisation',
  },
  {
    path: '/organisation/:orgID/settings/users',
    Component: OrganisationUsers,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation User',
  },
  {
    path: '/organisation/:orgID/settings/users/new',
    Component: NewOrganisationUser,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation User',
  },
  {
    path: '/organisation/:orgID/settings/tokens',
    Component: OrganisationTokens,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation Token',
  },
  {
    path: '/organisation/:orgID/settings/tokens/create',
    Component: CreateOrganisationToken,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation Token',
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
    path: '/profile/invite',
    Component: InvitationComponent,
    enableNavigation: true,
    Icon: SendOutlined,
    title: 'Invitations',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings',
    Component: ApplicationSettings,
    enableNavigation: false,
    title: 'Application Settings',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/users',
    Component: ApplicationUsers,
    enableNavigation: false,
    title: 'Application Users',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/tokens',
    Component: ApplicationTokens,
    enableNavigation: false,
    title: 'Application Tokens',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/tokens/create',
    Component: CreateApplicationTokenForm,
    enableNavigation: false,
    title: 'New Application Token',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/roles',
    Component: ApplicationRoles,
    enableNavigation: false,
    title: 'Application Roles',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/roles/create',
    Component: CreateApplicationRoleForm,
    enableNavigation: false,
    title: 'New Application Role',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/roles/:roleID/edit',
    Component: EditApplicationRole,
    enableNavigation: false,
    title: 'Update Application Role',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/roles/:roleID/users',
    Component: ApplicationRoleUsers,
    enableNavigation: false,
    title: 'Add Application Role User',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/policies',
    Component: ApplicationPolicies,
    enableNavigation: false,
    title: 'Application Policies',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/policies/create',
    Component: CreateApplicationPolicyForm,
    enableNavigation: false,
    title: 'Create Application Policy',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/policies/:policyID/view',
    Component: ViewApplicationPolicy,
    enableNavigation: false,
    title: 'View application policy',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/policies/:policyID/edit',
    Component: EditApplicationPolicy,
    enableNavigation: false,
    title: 'Edit application policy',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces',
    Component: ApplicationSpaces,
    enableNavigation: false,
    title: 'Spaces',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/create',
    Component: CreateSpace,
    enableNavigation: false,
    title: 'Create space',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/edit',
    Component: EditSpace,
    title: 'Edit space',
    enableNavigation: false,
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/edit/details',
    Component: SpaceDetails,
    title: 'Edit Space Basic Details',
    enableNavigation: false,
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/edit/logos',
    Component: SpaceLogoForm,
    title: 'Edit Space Metadata Details',
    enableNavigation: false,
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/edit/metadata',
    Component: SpaceMetadata,
    title: 'Edit Space Basic Details',
    enableNavigation: false,
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings',
    Component: SpaceSettings,
    enableNavigation: false,
    title: 'Space Settings',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/users',
    Component: SpaceUser,
    enableNavigation: false,
    title: 'Space users',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/tokens',
    Component: SpaceTokens,
    enableNavigation: false,
    title: 'Space Tokens',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/tokens/create',
    Component: CreateSpaceTokenForm,
    enableNavigation: false,
    title: 'New Space Token',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/roles/create',
    Component: CreateSpaceRoleForm,
    enableNavigation: false,
    title: 'New Space Role',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/roles',
    Component: SpaceRoles,
    enableNavigation: false,
    title: 'Space Roles',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/roles/:roleID/users',
    Component: SpaceRoleUsers,
    enableNavigation: false,
    title: 'Add Application Role User',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:id/settings/spaces/:spaceID/settings/policies',
    Component: SpacePolicies,
    enableNavigation: false,
    title: 'Application Policies',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/policies/create',
    Component: CreateSpacePolicyForm,
    enableNavigation: false,
    title: 'Create Application Policy',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settingsc/spaces/:spaceID/settings/policies/:policyID/view',
    Component: ViewSpacePolicy,
    enableNavigation: false,
    title: 'View application policy',
    enableBreadcrumb: true,
  },
  {
    path: '/applications/:appID/settings/spaces/:spaceID/settings/policies/:policyID/edit',
    Component: EditSpacePolicy,
    enableNavigation: false,
    title: 'Edit space policy',
    enableBreadcrumb: true,
  },
  {
    path: '/organisation/:orgID/settings/roles',
    Component: OrganisationRoles,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation Roles',
  },
  {
    path: '/organisation/:orgID/settings/roles/create',
    Component: CreateOrganisationRoleForm,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Create Organisation Role',
  },
  {
    path: '/organisation/:orgID/settings/roles/:roleID/edit',
    Component: EditOrganisationRole,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Organisation Role',
  },
  {
    path: '/organisation/:orgID/settings/roles/:roleID/users',
    Component: OrganisationRoleUsers,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Add Organisation Role User',
  },
  {
    path: '/organisation/:orgID/settings/policies',
    Component: OrganisationPolicies,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Add Organisation Policy',
  },
  {
    path: '/organisation/:orgID/settings/policies',
    Component: OrganisationPolicies,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Organisation Policy',
  },
  {
    path: '/organisation/:orgID/settings/policies/create',
    Component: CreateOrganisationPolicyForm,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Add Organisation Policy',
  },
  {
    path: '/organisation/:orgID/settings/policies/:policyID/edit',
    Component: EditOrganisationPolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'Edit Organisation Policy',
  },
  {
    path: 'organisation/:orgID/settings/policies/:policyID/view',
    Component: ViewOrganisationPolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    title: 'View Organisation Policy',
  },
];
