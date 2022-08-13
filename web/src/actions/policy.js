import axios from 'axios';

import {
  POLICY_API,
  POLICY_LOADING,
  ADD_APPLICATION_POLICY,
  ADD_ORGANISATION_POLICY,
  ADD_SPACE_POLICY,
  ADD_ORGANISATION_POLICY_BY_ID,
  ADD_APPLICATION_POLICY_BY_ID,
  ADD_SPACE_POLICY_BY_ID,
} from '../constants/policy';

import { addErrorNotification, addSuccessNotification } from './notifications';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { ADD_ORGANISATION_POLICY_IDS, ORGANISATIONS_API } from '../constants/organisations';
import { ADD_APPLICATION_POLICY_IDS } from '../constants/application';
import { ADD_SPACE_POLICY_IDS } from '../constants/space';
import { addApplicationRoleByID, addOrganisationRoles } from './roles';

export const stopLoadingPolicy = () => ({
  type: POLICY_LOADING,
  payload: false,
});

export const startLoadingPolicy = () => ({
  type: POLICY_LOADING,
  payload: true,
});

export const addOrganisationPolicy = (orgID, data) => (dispatch) => {
  data.forEach((policy) => {
    if (policy.roles?.length) {
      policy.roles.forEach((role) => {
        role.users = getIds(role.users);
      });
    }
    dispatch(addOrganisationRoles(orgID, buildObjectOfItems(policy.roles)));
    policy.roles = getIds(policy.roles);
  });

  dispatch({
    type: ADD_ORGANISATION_POLICY,
    payload: {
      id: orgID,
      data: buildObjectOfItems(data),
    },
  });
};

export const addApplicationPolicy = (appID, data) => ({
  type: ADD_APPLICATION_POLICY,
  payload: {
    id: appID,
    data: data,
  },
});

export const addSpacePolicy = (spaceID, data) => ({
  type: ADD_SPACE_POLICY,
  payload: {
    id: spaceID,
    data: data,
  },
});

export const addOrganisationPolicyIDs = (data) => ({
  type: ADD_ORGANISATION_POLICY_IDS,
  payload: data,
});

export const addApplicationPolicyIDs = (appID, data) => ({
  type: ADD_APPLICATION_POLICY_IDS,
  payload: {
    id: appID,
    data: data,
  },
});

export const addSpacePolicyIDs = (spaceID, data) => ({
  type: ADD_SPACE_POLICY_IDS,
  payload: {
    id: spaceID,
    data: data,
  },
});

export const addOrganisationPolicyByID = (orgID, roleID, data) => ({
  type: ADD_ORGANISATION_POLICY_BY_ID,
  payload: {
    orgID: orgID,
    roleID: roleID,
    data: data,
  },
});

export const addApplicationPolicyByID = (appID, roleID, data) => ({
  type: ADD_APPLICATION_POLICY_BY_ID,
  payload: {
    appID: appID,
    roleID: roleID,
    data: data,
  },
});

export const addSpacePolicyByID = (spaceID, roleID, data) => ({
  type: ADD_SPACE_POLICY_BY_ID,
  payload: {
    roleID: roleID,
    spaceID: spaceID,
    data: data,
  },
});
export const getOrganisationPolicy = () => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}${POLICY_API}`)
      .then((res) => {
        dispatch(addOrganisationPolicy(getState().organisations.selected, res.data));
        const policyIDs = getIds(res.data);
        dispatch(addOrganisationPolicyIDs(policyIDs));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const createOrganisationPolicy = (data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}${POLICY_API}`, data)
      .then(() => {
        dispatch(addSuccessNotification('Policy Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const deleteOrganisationPolicy = (id) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .delete(`${ORGANISATIONS_API}/${getState().organisations.selected}/policy/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Policy Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const updateOrganisationPolicy = (id, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .put(`${ORGANISATIONS_API}/${getState().organisations.selected}/policy/${id}`, data)
      .then(() => {
        dispatch(addSuccessNotification('Policy Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const getOrganisationPolicyByID = (id) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/policy/${id}`)
      .then((res) => {
        deleteKeys([res.data], ['organisation']);
        res.data.roles = getIds(res.data.roles);
        dispatch(addOrganisationPolicyByID(getState().organisations.selected, id, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const getApplicationPolicy = (appID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/policy`)
      .then((res) => {
        deleteKeys(res.data, ['application']);
        res.data.forEach((policy) => {
          dispatch(addApplicationRoleByID(appID));
          policy.roles = getIds(policy.roles);
        });
        dispatch(addApplicationPolicy(appID, buildObjectOfItems(res.data)));
        const policyIDs = getIds(res.data);
        dispatch(addApplicationPolicyIDs(appID, policyIDs));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const createApplicationPolicy = (appID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .post(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/policy`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const deleteApplicationPolicy = (appID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/policy/${roleID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const getApplicationPolicyByID = (appID, policyID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/policy/${policyID}`,
      )
      .then((res) => {
        deleteKeys([res.data], ['application']);
        res.data.roles = getIds(res.data.roles);
        dispatch(addApplicationPolicyByID(appID, policyID, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const updateApplicationPolicy = (appID, policyID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .put(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/policy/${policyID}`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const getSpacePolicy = (appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/policy`,
      )
      .then((res) => {
        deleteKeys(res.data, ['space']);
        res.data.forEach((policy) => {
          policy.roles = getIds(policy.roles);
        });
        dispatch(addSpacePolicy(spaceID, buildObjectOfItems(res.data)));
        const policyIDs = getIds(res.data);
        dispatch(addSpacePolicyIDs(spaceID, policyIDs));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const createSpacePolicy = (appID, spaceID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/policy`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const deleteSpacePolicy = (appID, spaceID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/policy/${roleID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const getSpacePolicyByID = (appID, spaceID, policyID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/policy/${policyID}`,
      )
      .then((res) => {
        deleteKeys([res.data], ['space']);
        res.data.roles = getIds(res.data.roles);
        dispatch(addSpacePolicyByID(spaceID, policyID, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};

export const updateSpacePolicy = (id, appID, spaceID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingPolicy());
    return axios
      .put(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/policy/${id}`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Policy Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingPolicy());
      });
  };
};
