import { Form, Select } from 'antd';
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
        return `/organisations/${orgID}/roles/${id}/edit`;
      case 'application':
        return `/organisations/${orgID}/applications/${appID}/roles/${id}/edit`;
      case 'space':
        return `/organisations/${orgID}/applications/${appID}/spaces/${spaceID}/roles/${id}/edit`;
      default:
        return null;
    }
  }
  React.useEffect(() => {
    fetchPolicy();
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
    </div>
  );
}
