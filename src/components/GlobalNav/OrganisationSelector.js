import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from '../../pages/organisation/node_modules/antd';
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

  return (
    <Select
      value={selected}
      style={{ width: '200px' }}
      onChange={handleOrganisationChange}
      bordered={false}
    >
      {organisations.map((organisation) => (
        <Select.Option key={'organisation-' + organisation.id} value={organisation.id}>
          {organisation.title}
        </Select.Option>
      ))}
    </Select>
  );
}

export default OrganisationSelector;
