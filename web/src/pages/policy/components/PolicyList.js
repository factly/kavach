import { Form, Select, Table, Popconfirm, Button, Tag } from 'antd';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getApplicationPolicy,
  getOrganisationPolicy,
  getSpacePolicy,
  deleteApplicationPolicy,
  deleteOrganisationPolicy,
  deleteSpacePolicy,
} from '../../../actions/policy';
import { getOrganisationRoles, getApplicationRoles, getSpaceRoles } from '../../../actions/roles';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function PolicyList({ type }) {
  const dispatch = useDispatch();
  const [appID, setAppID] = React.useState(null);
  const [spaceID, setSpaceID] = React.useState(null);
  const { applications, loadingApps, spaces, loadingSpaces, userRole, orgID } = useSelector(
    (state) => {
      return {
        applications: state.organisations.details[state.organisations.selected].applications.map(
          (id) => state.applications.details[id],
        ),
        loadingApps: state.organisations.loading,
        spaces:
          appID === null
            ? []
            : state.applications.details[appID].spaces.map((id) => state.spaces.details[id]),
        loadingSpaces: state.applications.loading,
        userRole: state.organisations.details[state.organisations.selected].role,
        orgID: state.organisations.selected,
      };
    },
  );

  const fetchRoles = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationRoles());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationRoles(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpaceRoles(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const { policy, loading } = useSelector((state) => {
    var policyIDs = [];
    switch (type) {
      case 'organisation':
        policyIDs = state.organisations.details[state.organisations.selected]?.policyIDs || [];
        return {
          policy: policyIDs.map(
            (id) => state.policy.organisation[state.organisations.selected][id],
          ),
          loading: state.policy.loading,
        };
      case 'application':
        policyIDs = state.applications.details[appID]?.policyIDs || [];
        return {
          policy: policyIDs.map((id) => state.policy.application[appID][id]),
          loading: state.policy.loading,
        };
      case 'space':
        policyIDs = state.spaces.details[spaceID]?.policyIDs || [];
        return {
          policy: policyIDs.map((id) => state.policy.space[spaceID][id]),
          loading: state.policy.loading,
        };
      default:
        return {
          policy: [],
          loading: true,
        };
    }
  });

  const onAppChange = (value) => {
    setAppID(value);
  };

  const onSpaceChange = (value) => {
    setSpaceID(value);
  };


  const fetchPolicy = () => {
    switch (type) {
      case 'organisation':
        dispatch(getOrganisationPolicy());
        break;
      case 'application':
        if (appID) {
          dispatch(getApplicationPolicy(appID));
        }
        break;
      case 'space':
        if (spaceID) {
          dispatch(getSpacePolicy(appID, spaceID));
        }
        break;
      default:
        return;
    }
  };

  const onDelete = (id) => {
    switch (type) {
      case 'organisation':
        dispatch(deleteOrganisationPolicy(id)).then(() => dispatch(getOrganisationPolicy()));
        break;
      case 'application':
        dispatch(deleteApplicationPolicy(appID, id)).then(() =>
          dispatch(getApplicationPolicy(appID)),
        );
        break;
      case 'space':
        dispatch(deleteSpacePolicy(id, appID, spaceID)).then(() =>
          dispatch(getSpacePolicy(appID, spaceID)),
        );
        break;
      default:
        return;
    }
  };

  function getPathfromType(type, id) {
    switch (type) {
      case 'organisation':
        return `/organisations/${orgID}/policy/${id}/edit`;
      case 'application':
        return `/organisations/${orgID}/applications/${appID}/policy/${id}/edit`;
      case 'space':
        return `/organisations/${orgID}/applications/${appID}/spaces/${spaceID}/policy/${id}/edit`;
      default:
        return null;
    }
  }

  const nestedTableColumns = [
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (_, record) => {
        return record.actions.map((action) => {
          return (
            <Tag key={action} color="blue">
              {action}
            </Tag>
          );
        });
      },
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      width: '40%',
      render: (_, record) => {
        return (
          <Table
            columns={nestedTableColumns}
            dataSource={record?.permissions}
            rowKey={'id'}
            loading={loading}
            pagination={false}
            style={{ display: 'flex' }}
          />
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '15%',
      render: (_, record) => {
        return (
          <div>
            <Link
              to={{
                pathname: getPathfromType(type, record?.id),
                state: type,
              }}
            >
              <Button icon={<EditOutlined />} />
            </Link>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record. id)}>
              <Button danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    fetchPolicy();
    fetchRoles();
    // eslint-disable-next-line
  }, [dispatch, spaceID, appID, type]);

  React.useEffect(() => {
    setAppID(applications[0]?.id);
    setSpaceID(spaces[0]?.id);
    // eslint-disable-next-line
  }, [type]);

  return (
    <div>
      <Form>
        {(type === 'application' || type === 'space') && !loadingApps ? (
          <Form.Item
            label="Application"
            name="application"
            rules={[
              {
                required: true,
                message: 'Please input application name!',
              },
            ]}
            style={{
              width: 300,
            }}
          >
            <Select onChange={onAppChange} defaultValue={applications[0]?.id}>
              {applications.map((app) => {
                return (
                  <Select.Option key={app.id} value={app.id}>
                    {app.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        ) : null}
        {type === 'space' && !loadingSpaces ? (
          <Form.Item
            label="Space"
            name="space"
            rules={[
              {
                required: true,
                message: 'Please input space name!',
              },
            ]}
            style={{
              width: 300,
            }}
          >
            <Select onChange={onSpaceChange}>
              {spaces.map((space) => {
                return (
                  <Select.Option key={space.id} value={space.id}>
                    {space.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        ) : null}
      </Form>
      <Table bordered columns={columns} dataSource={policy} rowKey={'id'} loading={loading} />
    </div>
  );
}

// const { policy, loading } = useSelector((state) => {
//   var policyIDs = [];
//   switch (type) {
//     case 'organisation':
//       policyIDs = state.organisations.details[state.organisations.selected]?.policyIDs || [];

//       return {
//         policy: policyIDs.map(
//           (id) => ({
//             ...state.policy.organisation[state.organisations.selected][id],
//             roles:
//               state.policy.organisation[state.organisations.selected][id]?.roles.map((id)=>(state.roles.organisation[state.organisations.selected][id])) || [],
//           })
//         ),
//         loading: state.policy.loading,
//       };
//     case 'application':
//       policyIDs = state.applications.details[appID]?.policyIDs || [];
//       return {
//         policy: policyIDs.map((id) => (
//           {
//             ...state.policy.application[appID][id],
//             roles:
//               state.policy.application[appID][id]?.roles.map((id)=>(state.roles.application[appID][id])) || [],
//           }
//         )),
//         loading: state.policy.loading,
//       };
//     case 'space':
//       policyIDs = state.spaces.details[spaceID]?.policyIDs || [];
//       return {
//         policy: policyIDs.map((id) => ({
//           ...state.policy.space[spaceID][id],
//           roles:
//             state.policy.space[spaceID][id]?.roles.map((id)=>(state.roles.space[spaceID][id])) || [],
//         })),
//         loading: state.policy.loading,
//       };
//     default:
//       return {
//         policy: [],
//         loading: true,
//       };
//   }
// });
