import React from 'react';
import { Popconfirm, Skeleton, Avatar, Card, Row } from 'antd';
import { ExportOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getApplications, deleteApplication } from '../../../actions/application';
import { getOrganisations } from '../../../actions/organisations';
import { Link } from 'react-router-dom';

function ApplicationList() {
  const dispatch = useDispatch();
  const { applications, loading } = useSelector((state) => {
    const node = state.applications.req[0];

    if (node)
      return {
        applications: node.data.map((element) => state.applications.details[element]),
        loading: state.applications.loading,
        total: node.total,
      };
    return { applications: [], loading: state.applications.loading, total: 0 };
  });

  React.useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const fetchApplications = () => {
    dispatch(getApplications());
  };
  let applicationList = [];
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
          </Popconfirm>,
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

  const ApplicationRow = (props) => {
    return (
      <Row style={{ display: 'flex', justifyContent: 'flex-start', gap: '2rem' }}>
        {props.applications.map((application, index) => (
          <ApplicationCard key={index} application={application}></ApplicationCard>
        ))}
      </Row>
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
