import React from 'react';
import { Descriptions, Tag, Table, Skeleton, Button, Divider } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { getSpacePolicyByID } from '../../../../../../../actions/policy';
import { useSelector } from 'react-redux';

export default function ViewSpacePolicy() {
  const { policyID, appID, spaceID } = useParams();
  const span = 2;
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
        return record.actions?.map((action) => {
          return (
            <Tag key={action} color="blue">
              {action}
            </Tag>
          );
        });
      },
    },
  ];

  const { policy, loading } = useSelector((state) => {
    return {
      policy: {
        ...state.policy.space?.[spaceID]?.[policyID],
        roles:
          state.policy.space[spaceID][policyID]?.roles?.map((rId) => ({
            ...state.roles.space[spaceID]?.[rId],
          })) || [],
      },
      loading: state.policy.loading,
    };
  });

  const fetchPolicy = () => {
    getSpacePolicyByID(appID, spaceID, policyID);
  };

  React.useEffect(() => {
    fetchPolicy();
    //eslint-disable-next-line
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <Link key="1" to={`/applications/${appID}/settings/spaces/${spaceID}/settings/policies`}>
        <Button type="primary">Back to Policies</Button>
      </Link>
      <h2> Policy Details </h2>
      {loading ? (
        <Skeleton />
      ) : (
        <Descriptions bordered>
          <Descriptions.Item label="Name" span={span}>
            {policy?.name}
          </Descriptions.Item>
          <br />
          <Descriptions.Item label="Description" span={span}>
            {policy?.description}
          </Descriptions.Item>
          <br />
          <Descriptions.Item label="Roles" span={span}>
            {policy?.roles.map((role) => {
              return (
                <Tag key={role.id} color="blue">
                  {role?.name}
                </Tag>
              );
            })}
          </Descriptions.Item>
        </Descriptions>
      )}
      <Divider />
      <h3> Permissions </h3>
      <Table
        bordered={true}
        columns={nestedTableColumns}
        dataSource={policy?.permissions}
        rowKey={'id'}
        pagination={true}
      />
    </div>
  );
}
