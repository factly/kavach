import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar } from 'antd';
import { setSelectedOrganisation } from './../../actions/organisations';

function OrganisationSelector() {
  const [selectorState, setSelectorState] = React.useState(false);
  const list = ['/edit', '/create'];
  const { organisations, selected } = useSelector((state) => {
    const organisationIds = state.profile.details?.organisations || [];
    return {
      organisations: organisationIds.map((id) => state.organisations.details[id]),
      selected: state.organisations.selected,
    };
  });

  React.useEffect(() => {
    setSelectorState(list.some((item) => window.location.pathname.includes(item)));
  }, [selectorState, list]);

  const dispatch = useDispatch();

  const handleOrganisationChange = (id) => {
    dispatch(setSelectedOrganisation(id));
  };
  const getInitial = (title) => {
    return title.charAt(0);
  };

  return organisations.length > 0 ? (
    <Select
      value={selected}
      style={{ width: '200px' }}
      onChange={handleOrganisationChange}
      bordered={false}
      disabled={selectorState}
    >
      {organisations.map((organisation) => (
        <Select.Option key={'organisation-' + organisation.id} value={organisation.id}>
          {organisation.medium ? (
            <Avatar size="small" src={organisation.medium.url.proxy} />
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
