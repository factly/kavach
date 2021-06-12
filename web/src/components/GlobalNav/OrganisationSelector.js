import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar } from 'antd';
import { setSelectedOrganisation } from './../../actions/organisations';

function OrganisationSelector() {
  const { organisations, selected } = useSelector((state) => {
    return {
      organisations: state.organisations.ids.map((id) => state.organisations.details[id]),
      selected: state.organisations.selected,
    };
  });

  const dispatch = useDispatch();

  const handleOrganisationChange = (id) => {
    dispatch(setSelectedOrganisation(id));
  };
  const getInitial = (title) => {
    return title.charAt(0);
  };

  return (
    <Select
      value={selected}
      style={{ width: '200px' }}
      onChange={handleOrganisationChange}
      bordered={false}
    >
      {organisations.map((organisation) => (
        <Select.Option key={'organisation-' + organisation.id} value={organisation.id}>
          {organisation.medium ? (
            <Avatar size="small" src={organisation.medium.url.raw} />
          ) : (
            <Avatar size="small">{getInitial(organisation.title)}</Avatar>
          )}{' '}
          {organisation.title}
        </Select.Option>
      ))}
    </Select>
  );
}

export default OrganisationSelector;
