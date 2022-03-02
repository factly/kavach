import axios from 'axios';
import { stopLoadingSpaces, loadingSpaces } from './space';
import { ORGANISATIONS_API } from '../constants/organisations';
import { SPACES_API } from '../constants/space';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const addSpaceUser = (appID, spaceID, data) => {
  return (dispatch, getState) => {
    dispatch(loadingSpaces());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}${SPACES_API}/${spaceID}/users`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Space user added successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingSpaces());
      });
  };
};

export const deleteSpaceUser = (appID, spaceID, userID) => {
  return (dispatch, getState) => {
    dispatch(loadingSpaces());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}${SPACES_API}/${spaceID}/users/${userID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Space user deleted successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingSpaces());
      });
  };
};
