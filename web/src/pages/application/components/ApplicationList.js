import React from 'react';
import { Popconfirm, Skeleton, Avatar, Card, Tooltip } from 'antd';
import { ExportOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { getOrganisations } from '../../../actions/organisations';
import { Link } from 'react-router-dom';

function ApplicationList({ applicationList, permission, loading }) {
  const dispatch = useDispatch();
  const fetchApplications = () => {
    dispatch(getApplications());
  };

  const { orgID, loadingOrg } = useSelector((state) => {
    return {
      orgID: state.organisations.selected,
      loadingOrg: state.organisations.loading
    };
  });

  const iconSize = '150%';
  const ApplicationCard = ({ application }) => {
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
                application?.medium && application.medium_id
                  ? application.medium?.url?.proxy
                  : 'https://cdn5.vectorstock.com/i/thumb-large/99/49/bold-mid-century-abstract-drawing-vector-28919949.jpg'
              }
            ></Avatar>
          )
        }
        actions={[
          <Link
            to={loading ? '' : `/applications/${application.id}/edit`}
            className="ant-dropdown-link"
          >
            <EditOutlined key="edit" style={{ fontSize: iconSize }} />
          </Link>,
          permission && orgID === 1? (
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteApplication(application.id)).then(() => {
                  dispatch(getOrganisations());
                  fetchApplications();
                })
              }
            >
              <Link to="" className="ant-dropdown-link">
                <DeleteOutlined style={{ fontSize: iconSize }} />
              </Link>
            </Popconfirm>
          ) : (
            <Tooltip
              title="You don't have permission to delete an application"
              trigger="click"
              color="red"
            >
              <DeleteOutlined style={{ fontSize: iconSize }} />
            </Tooltip>
          ),
          <a href={application.url}>
            <ExportOutlined style={{ fontSize: iconSize }} />
          </a>,
          <Link to={`/applications/${application.id}/settings`} className="ant-dropdown-link">
            <SettingOutlined style={{ fontSize: iconSize }} />
          </Link>,
        ]}
      >
        <Card.Meta
          title={loading ? '' : application.name}
          description={loading ? '' : application.description || <div> </div>}
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
    {
      loadingOrg ? <Skeleton/> :
      applicationList.map((application, index) => (
        <ApplicationCard key={index} application={application}></ApplicationCard>
      ))
    }
    </div>
  );
}
export default ApplicationList;
