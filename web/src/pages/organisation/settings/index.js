import React from 'react';
import SettingsList from '../../../components/Settings';

export default function OrganisationSettings({ orgID }) {
  return (
    <div>
      <SettingsList type="organisation" orgID={orgID} />
    </div>
  );
}
