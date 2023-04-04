import React from 'react';
import { useSelector } from 'react-redux';
import { Layout, Button, Popover, List, Avatar } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SettingsIcon from '../Settings/img.svg';
import AccountMenu from './AccountMenu';
import OrganisationSelector from './OrganisationSelector';
import { Link } from 'react-router-dom';

function Header() {
  const { apps, organisationCount } = useSelector((state) => {
    const appIDs = state.organisations.details[state.organisations.selected]?.applications || [];
    return {
      apps:
        state.organisations.selected > 0
          ? appIDs.map((id) => ({
              ...state.applications.details[id],
              medium: state.media.details?.[state.applications.details[id]?.medium_id],
            }))
          : [],
      organisationCount: state.organisations.ids ? state.organisations.ids.length : 0,
    };
  });
  return (
    <Layout.Header className="layout-header">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'flex', height: '32px', gap: '14px' }}>
          {window.REACT_APP_ENABLE_MULTITENANCY === 'true' ? (
            <>
              <Link style={{ display: 'flex' }} to="/organisation/create">
                <Button icon={<PlusOutlined />} style={{ background: '#F1F1F1', border: 'none' }}>
                  New Organisation
                </Button>
              </Link>
              <OrganisationSelector />
            </>
          ) : organisationCount < 1 ? (
            <Link to="/organisation/create">
              <Button icon={<PlusOutlined />} style={{ background: '#F1F1F1', border: 'none' }}>
                New Organisation
              </Button>
            </Link>
          ) : null}
          {apps.length > 0 ? (
            <>
              <Popover
                placement="bottom"
                content={
                  <List
                    grid={{
                      gutter: 16,
                      xs: 1,
                      sm: 2,
                      md: 4,
                      lg: 4,
                      xl: 6,
                      xxl: 3,
                    }}
                    dataSource={apps}
                    renderItem={(item) => (
                      <List.Item>
                        <a
                          href={item.url}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.medium && item.medium.url ? (
                            <img
                              alt="logo"
                              className="menu-logo"
                              src={
                                window.REACT_APP_ENABLE_IMGPROXY
                                  ? item.medium.url.proxy
                                  : item.medium.url?.raw
                              }
                            />
                          ) : (
                            <Avatar shape="square" size={35}>
                              {item.name?.charAt(0)}
                            </Avatar>
                          )}
                          <p>{item.name}</p>
                        </a>
                      </List.Item>
                    )}
                  />
                }
                trigger="click"
              >
                <img src={SettingsIcon} alt="icon" />
              </Popover>
            </>
          ) : null}
        </div>
        <AccountMenu style={{ float: 'right' }} />
      </div>
    </Layout.Header>
  );
}

export default Header;
