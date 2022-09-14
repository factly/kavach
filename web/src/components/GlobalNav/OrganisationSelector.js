import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar } from 'antd';
import { setSelectedOrganisation } from './../../actions/organisations';

function OrganisationSelector() {
  const { organisations, selectedOrg } = useSelector((state) => {
    const organisationIds = state.profile.details?.organisations || [];
    // unique
    return {
      organisations: organisationIds?.map((id) => state.organisations.details[id]) || [],
      selectedOrg: state.organisations?.details[state.organisations?.selected]?.title,
    };
  });

  React.useEffect(() => {}, []);

  const dispatch = useDispatch();

  const handleOrganisationChange = (id) => {
    dispatch(setSelectedOrganisation(id));
  };
  const getInitial = (title) => {
    return title?.charAt(0);
  };

  return organisations.length > 0 ? (
    <Select
      value={selectedOrg}
      style={{ width: '200px' }}
      onChange={handleOrganisationChange}
      bordered={false}
    >
      {organisations.map((organisation) => (
        <Select.Option key={'organisation-' + organisation.id} value={organisation.id}>
          {organisation.medium ? (
            <Avatar size="small" src={(window.ENABLE_IMGPROXY) ? organisation?.medium?.url?.proxy : organisation?.medium?.url?.raw} />
          ) : (
            <Avatar size="small">{getInitial(organisation.title)}</Avatar>
          )}{' '}
          {organisation.title}
        </Select.Option>
      ))}
    </Select>
  ) : null;
}

export default OrganisationSelector;
