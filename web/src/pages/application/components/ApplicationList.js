import React from 'react';
import { Popconfirm, Skeleton, Avatar, Card, Tooltip } from 'antd';
import { ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { getOrganisations } from '../../../actions/organisations';
import { Link } from 'react-router-dom';

function ApplicationList({ applicationList, permission }) {
  const dispatch = useDispatch();
  const node = applicationList.req[0];
  const applications = node.data.map((element) => applicationList.details[element]);
  const loading = applicationList.loading;
  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const ApplicationCard = (props) => {
    return (
      <Card
        hoverable
        loading={loading}
        style={{
          width: 280,
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        cover={
          loading ? (
            <Card loading={true}></Card>
          ) : (
            <Avatar
              shape="square"
              size={200}
              style={{ width: '100%', objectFit: 'cover' }}
              src={
                props.application.medium && props.application.medium_id
                  ? props.application.medium?.url?.proxy
                  : 'https://cdn5.vectorstock.com/i/thumb-large/99/49/bold-mid-century-abstract-drawing-vector-28919949.jpg'
              }
            >
              {props.application.medium && props.application.medium_id
                ? null
                : props.application.name.charAt(0)}
            </Avatar>
          )
        }
        actions={[
          <Link
            to={loading ? '' : `/applications/${props.application.id}/edit`}
            className="ant-dropdown-link"
          >
            <EditOutlined key="edit" style={{ fontSize: '150%' }} />
          </Link>,
          permission ? (
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteApplication(props.application.id)).then(() => {
                  dispatch(getOrganisations());
                  fetchApplications();
                })
              }
            >
              <Link to="" className="ant-dropdown-link">
                <DeleteOutlined style={{ fontSize: '150%' }} />
              </Link>
            </Popconfirm>
          ) : (
            <Tooltip
              title="You don't have permission to delete an application"
              trigger="click"
              color="red"
            >
              <DeleteOutlined style={{ fontSize: '150%' }} />
            </Tooltip>
          ),
          <a href={props.application.url}>
            <ExportOutlined style={{ fontSize: '150%' }} />
          </a>,
        ]}
      >
        <Card.Meta
          title={loading ? '' : props.application.name}
          description={loading ? '' : props.application.description || <div> </div>}
          style={{ textAlign: 'center' }}
        />
      </Card>
    );
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
      {applications.map((application, index) => (
        <ApplicationCard key={index} application={application}></ApplicationCard>
      ))}
    </div>
  );
}
export default ApplicationList;
