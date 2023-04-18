import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Select, Avatar } from 'antd';
import { setSelectedOrganisation } from './../../actions/organisations';

function OrganisationSelector() {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const { organisations, selectedOrg } = useSelector((state) => {
    const organisationIds = state.profile.details?.organisations || [];
    return {
      organisations:
        organisationIds?.map((id) => ({
          ...state.organisations.details[id],
          medium: state.media.details?.[state.organisations.details[id].featured_medium_id],
        })) || [],
      selectedOrg: state.organisations?.details[state.organisations?.selected]?.title,
    };
  });

  React.useEffect(() => {}, []);

  const handleOrganisationChange = (id) => {
    dispatch(setSelectedOrganisation(id));
    if (pathSnippets.includes('edit')) {
      history.push('/organisation');
    }
  };
  const getInitial = (title) => {
    return title?.charAt(0);
  };

  return organisations.length > 0 ? (
    <Select
      value={selectedOrg}
      style={{ background: '#F1F1F1', border: 'none' }}
      onChange={handleOrganisationChange}
      bordered={false}
    >
      {organisations.map((organisation) => {
        return (
          <Select.Option key={'organisation-' + organisation.id} value={organisation.id}>
            {organisation?.medium ? (
              <Avatar
                size="small"
                src={
                  window.REACT_APP_ENABLE_IMGPROXY
                    ? organisation?.medium?.url?.proxy
                    : organisation?.medium?.url?.raw
                }
              />
            ) : (
              <Avatar size="small">{getInitial(organisation.title)}</Avatar>
            )}
            {organisation.title}
          </Select.Option>
        );
      })}
    </Select>
  ) : null;
}

export default OrganisationSelector;
