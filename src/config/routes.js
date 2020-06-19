import { PieChartOutlined } from '@ant-design/icons';

//Pages
import Organizations from '../pages/organizations';
import Profile from '../pages/profile';
import Password from '../pages/password';

export default [
  {
    path: '/organizations',
    Component: Organizations,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Organizations',
  },
  {
    path: '/password',
    Component: Password,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Password',
  },
  {
    path: '/profile',
    Component: Profile,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Profile',
  }
];
