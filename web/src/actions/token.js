import axios from 'axios';
import { ORGANISATIONS_API } from '../constants/organisations';
import {
  ADD_TOKEN,
  ADD_TOKENS,
  ADD_TOKENS_REQUEST,
  SET_TOKENS_LOADING,
  RESET_TOKENS,
} from '../constants/token';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const addToken = (data, appID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications/' + appID + '/tokens', data)
      .then((res) => {
        dispatch(resetTokens());
        dispatch(addSuccessNotification('Token Added')) 
        return res.data
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteToken = (id, appID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(ORGANISATIONS_API + '/' + getState().organisations.selected + '/applications/' + appID + '/tokens/' + id)
      .then(() => {
        dispatch(resetTokens());
        dispatch(addSuccessNotification('Token Deleted')) 
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};


export const loadingTokens = () => ({
  type: SET_TOKENS_LOADING,
  payload: true,
});

export const stopTokenLoading = () => ({
  type: SET_TOKENS_LOADING,
  payload: false,
});

export const getTokenByID = (data) => ({
  type: ADD_TOKEN,
  payload: data,
});

export const addTokensList = (data) => ({
  type: ADD_TOKENS,
  payload: data,
});

export const addTokensRequest = (data) => ({
  type: ADD_TOKENS_REQUEST,
  payload: data,
});

export const resetTokens = () => ({
  type: RESET_TOKENS,
});