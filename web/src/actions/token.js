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
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { ADD_APPLICATION_TOKEN_IDS } from '../constants/application';
import { addSpaceTokenIDs } from './space';
import { addOrganisationTokenIDs } from './organisations';

export const addApplicationToken = (appID, data, setToken, setShowModal) => {
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
        dispatch(addSuccessNotification('Token Added'));
        setToken(res.data.token);
        setShowModal(true);
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
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

export const addOrganisationTokens = (orgID, tokenData) => {
  return {
    type: ADD_ORGANISATION_TOKENS,
    payload: {
      id: orgID,
      data: buildObjectOfItems(tokenData),
    },
  };
};
export const addApplicationTokens = (appID, tokenData) => ({
  type: ADD_APPLICATION_TOKENS,
  payload: {
    id: appID,
    data: buildObjectOfItems(tokenData),
  },
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

const addSpaceTokens = (spaceID, data) => ({
  type: ADD_SPACE_TOKENS,
  payload: {
    spaceID: spaceID,
    data: data,
  },
});

export const getOrganisationTokens = () => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/tokens`)
      .then((res) => {
        deleteKeys(res.data, ['organisation']);
        if (res.data?.length) {
          dispatch(addOrganisationTokens(getState().organisations.selected, res.data));
          dispatch(addOrganisationTokenIDs(getIds(res.data)));
        }
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const addOrganisationToken = (data, setToken, setShowModal) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}/tokens`, data)
      .then((res) => {
        dispatch(addSuccessNotification('Token Added Successfully'));
        setToken(res.data.token);
        setShowModal(true);
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

export const getSpaceTokens = (appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/tokens`,
      )
      .then((res) => {
        deleteKeys(res.data, ['space']);
        dispatch(addSpaceTokens(spaceID, buildObjectOfItems(res.data)));
        dispatch(addSpaceTokenIDs(spaceID, getIds(res.data)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const addSpaceToken = (appID, spaceID, data, setToken, setShowModal) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/tokens`,
        {
          name: data.name,
          description: data.description,
        },
      )
      .then((res) => {
        setToken(res.data.token);
        setShowModal(true);
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

export const deleteSpaceToken = (id, appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/tokens/${id}`,
      )
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

const addApplicationTokenIDs = (appID, data) => {
  return {
    type: ADD_APPLICATION_TOKEN_IDS,
    payload: {
      id: appID,
      data: data,
    },
  };
};

export const getApplicationTokens = (appID) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/tokens`)
      .then((res) => {
        deleteKeys(res.data.nodes, ['application']);
        dispatch(addApplicationTokens(appID, res.data.nodes));
        dispatch(addApplicationTokenIDs(appID, getIds(res.data.nodes)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopTokenLoading());
      });
  };
};

export const deleteApplicationToken = (appID, id) => {
  return (dispatch, getState) => {
    dispatch(loadingTokens());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/tokens/${id}`,
      )
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
