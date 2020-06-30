import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from 'antd';
import { setSelectedOrganization } from './../../actions/organizations';

function OrganizationSelector() {
  const { organizations, selected } = useSelector((state) => {
    return {
      organizations: state.organizations.ids.map((id) => state.organizations.details[id]),
      selected: state.organizations.selected,
    };
  });

  const dispatch = useDispatch();

  const handleOrganizationChange = (id) => {
    dispatch(setSelectedOrganization(id));
  };

  return (
    <Select
      value={selected}
      style={{ width: '200px' }}
      onChange={handleOrganizationChange}
      bordered={false}
    >
      {organizations.map((organization) => (
        <Select.Option key={'organization-' + organization.id} value={organization.id}>
          {organization.title}
        </Select.Option>
      ))}
    </Select>
  );
}

export default OrganizationSelector;
