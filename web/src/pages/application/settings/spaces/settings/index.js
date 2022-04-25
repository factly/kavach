import React from 'react';
import { useParams } from 'react-router-dom';
import SettingsList from '../../../../../components/Settings';

export default function SpaceSettings() {
  const { appID, spaceID } = useParams();
  return <SettingsList type="space" appID={appID} spaceID={spaceID} />;
}
