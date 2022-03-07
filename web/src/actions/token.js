import axios from 'axios';
import { ORGANISATIONS_API } from '../constants/organisations';
import {
  ADD_TOKEN,
  ADD_TOKENS,
  ADD_TOKENS_REQUEST,
  SET_TOKENS_LOADING,
  RESET_TOKENS,
  ADD_APPLICATION_TOKENS,
  ADD_ORGANISATION_TOKENS,
  ADD_SPACE_TOKENS,
} from '../constants/token';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const addToken = (data, appID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(
        ORGANISATIONS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/tokens',
        data,
      )
      .then((res) => {
        dispatch(resetTokens());
        dispatch(addSuccessNotification('Token Added'));
        return res.data;
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
      .delete(
        ORGANISATIONS_API +
          '/' +
          getState().organisations.selected +
          '/applications/' +
          appID +
          '/tokens/' +
          id,
      )
      .then(() => {
        dispatch(resetTokens());
        dispatch(addSuccessNotification('Token Deleted'));
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

const addSpaceTokens = (data) => ({
  type: ADD_SPACE_TOKENS,
  payload: data,
});

export const getOrganisationTokens = () => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/tokens`)
      .then((res) => {
        dispatch(addOrganisationTokens(res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const addOrganisationToken = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}/tokens`, data)
      .then((res) => {
        dispatch(addSuccessNotification('Token Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const deleteOrganisationToken = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(`${ORGANISATIONS_API}/${getState().organisations.selected}/tokens/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Token Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const addOrganisationTokens = (data) => ({
  type: ADD_ORGANISATION_TOKENS,
  payload: data,
});

export const getSpaceTokens = (appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/spaces/${spaceID}/tokens`)
      .then((res) => {
        dispatch(addSpaceTokens(res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  }
}

export const addSpaceToken = (data, appID, spaceID)=>{
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/spaces/${spaceID}/tokens`,data)
      .then(() => {
        dispatch(addSuccessNotification('Token Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  }
}

export const deleteSpaceToken = (id, appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/spaces/${spaceID}/tokens/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Token Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const addApplicationToken = (appID, data)=>{
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/tokens`, data)
      .then(() => {
        dispatch(addSuccessNotification('Token Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
}

const addApplicationTokens = (data)=>{
  return {
    type: ADD_APPLICATION_TOKENS,
    payload: data,
  }
}
export  const getApplicationsTokens = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/tokens`)
      .then((res) => {
        dispatch(addApplicationTokens(res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  }
}

export const deleteApplicationToken = (appID, id) =>{
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/tokens/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Token Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
}
