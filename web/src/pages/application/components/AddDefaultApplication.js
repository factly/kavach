import React from 'react';
import { Card, Skeleton, Avatar, Switch, Row, List } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  getDefaultApplications,
  getApplications,
  addDefaultApplication,
  removeDefaultApplication,
} from '../../../actions/application';
import { getIds } from '../../../utils/objects';

export const AddDefaultApplication = () => {
  const dispatch = useDispatch();
  const fetchDefaultApplication = () => {
    dispatch(getDefaultApplications());
    dispatch(getApplications());
  };

  var { defaultApplications, loading, defaultApplicationActivated, loadingApps } =
    useSelector((state) => {
      const defaultApplications = state.defaultapplications.applications;
      const defaultApplicationIds = getIds(defaultApplications);
      const applicationIds = state.organisations.details[state.organisations.selected]?.applications
        ? state.organisations.details[state.organisations.selected]?.applications
        : [];
      const defaultApplicationActivatedIds = defaultApplicationIds.map((appID) => {
        if (applicationIds.includes(appID)) {
          return appID;
        }
        return 
      });
      return {
        defaultApplications: defaultApplications,
        loading: state.defaultapplications.loading,
        defaultApplicationActivated: defaultApplicationActivatedIds,
        loadingApps: state.applications.loading,
      };
    });

  React.useEffect(() => {
    fetchDefaultApplication();
    //eslint-disable-next-line
  }, []);

  function AppItem({ appID, name, description, checked }) {
    const handleActivate = (appID, value) => {
      if (value) {
        dispatch(addDefaultApplication(appID)).then(() => fetchDefaultApplication());
      } else {
        dispatch(removeDefaultApplication(appID)).then(() => fetchDefaultApplication());
      }
    };

    return (
      <Row
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'flex-start',
            gap: '16px',
          }}
        >
          <Avatar size="large">{name?.charAt(0)}</Avatar>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h1>{name}</h1>
            <p style={{ maxWidth: 600 }}>{description}</p>
          </div>
        </div>
        <Switch checked={checked} onClick={(value) => handleActivate(appID, value)}></Switch>
      </Row>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {loading || loadingApps ? (
        <Skeleton />
      ) : (
        <Card
          title="Default Application List"
          style={{
            minWidth: 800,
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={defaultApplications}
            renderItem={(item) => {
              return (
                <List.Item>
                  <AppItem
                    appID={item.id}
                    name={item.name}
                    description={item.description}
                    checked={defaultApplicationActivated?.includes(item.id)}
                  />
                </List.Item>
              );
            }}
          ></List>
        </Card>
      )}
    </div>
  );
};
