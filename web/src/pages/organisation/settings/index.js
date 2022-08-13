import React from 'react';
import { useSelector } from 'react-redux';
import SettingsList from '../../../components/Settings';
import { Skeleton } from 'antd';
export default function OrganisationSettings({ orgID }) {
  const { role, loading } = useSelector((state) => {
    return {
      role: state.profile.roles[state.organisations.selected],
      loading: state.profile.loading,
    };
  });
  return (
    <div>
      {
      (loading) ? <Skeleton/> :<SettingsList type="organisation" orgID={orgID} role={role}/>
      }
    </div>
  );
}
