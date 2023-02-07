import axios from 'axios';

import {
  ROLES_API,
  ROLES_LOADING,
  ADD_APPLICATION_ROLES,
  ADD_ORGANISATION_ROLES,
  ADD_SPACE_ROLES,
  ADD_ORGANISATION_ROLE_BY_ID,
  ADD_APPLICATION_ROLE_BY_ID,
  ADD_SPACE_ROLE_BY_ID,
  ADD_ORGANISATION_ROLE_USERS,
  ADD_APPLICATION_ROLE_USERS,
  ADD_SPACE_ROLE_USERS,
} from '../constants/roles';

import { addErrorNotification, addSuccessNotification } from './notifications';
import { buildObjectOfItems, deleteKeys, getIds } from '../utils/objects';
import { ADD_ORGANISATION_ROLE_IDS, ORGANISATIONS_API } from '../constants/organisations';
import { ADD_APPLICATION_ROLE_IDS } from '../constants/application';
import { ADD_SPACE_ROLE_IDS } from '../constants/space';
import { addUsersList } from './users';

export const stopLoadingRoles = () => ({
  type: ROLES_LOADING,
  payload: false,
});

export const startLoadingRoles = () => ({
  type: ROLES_LOADING,
  payload: true,
});

export const addOrganisationRoles = (orgID, data) => ({
  type: ADD_ORGANISATION_ROLES,
  payload: {
    id: orgID,
    data: data,
  },
});

export const addApplicationRoles = (appID, data) => ({
  type: ADD_APPLICATION_ROLES,
  payload: {
    id: appID,
    data: data,
  },
});

export const addSpaceRoles = (spaceID, data) => ({
  type: ADD_SPACE_ROLES,
  payload: {
    id: spaceID,
    data: data,
  },
});

export const addOrganisationRoleIDs = (data) => ({
  type: ADD_ORGANISATION_ROLE_IDS,
  payload: data,
});

export const addApplicationRoleIDs = (appID, data) => ({
  type: ADD_APPLICATION_ROLE_IDS,
  payload: {
    id: appID,
    data: data,
  },
});

export const addSpaceRoleIDs = (spaceID, data) => ({
  type: ADD_SPACE_ROLE_IDS,
  payload: {
    id: spaceID,
    data: data,
  },
});

export const addOrganisationRoleByID = (orgID, roleID, data) => ({
  type: ADD_ORGANISATION_ROLE_BY_ID,
  payload: {
    orgID: orgID,
    roleID: roleID,
    data: data,
  },
});

export const addApplicationRoleByID = (appID, roleID, data) => ({
  type: ADD_APPLICATION_ROLE_BY_ID,
  payload: {
    appID: appID,
    roleID: roleID,
    data: data,
  },
});

export const addSpaceRoleByID = (spaceID, roleID, data) => ({
  type: ADD_SPACE_ROLE_BY_ID,
  payload: {
    roleID: roleID,
    spaceID: spaceID,
    data: data,
  },
});
export const getOrganisationRoles = (orgID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(`${ORGANISATIONS_API}/${orgID}${ROLES_API}`)
      .then((res) => {
        deleteKeys(res.data, ['organisation']);
        res.data.forEach((role) => {
          dispatch(addUsersList(role.users));
          role.users = getIds(role.users);
        });
        dispatch(addOrganisationRoles(orgID, buildObjectOfItems(res.data)));
        const roleIDs = getIds(res.data);
        dispatch(addOrganisationRoleIDs(roleIDs));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const createOrganisationRole = (data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}${ROLES_API}`, data)
      .then(() => {
        dispatch(addSuccessNotification('Role Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteOrganisationRole = (id) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(`${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${id}`)
      .then(() => {
        dispatch(addSuccessNotification('Role Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const updateOrganisationRole = (id, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .put(`${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${id}`, data)
      .then(() => {
        dispatch(addSuccessNotification('Role Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getOrganisationRoleByID = (id) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${id}`)
      .then((res) => {
        deleteKeys([res.data], ['organisation']);
        res.data.users = getIds(res.data.users);
        dispatch(addOrganisationRoleByID(getState().organisations.selected, id, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getApplicationRoles = (appID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/roles`)
      .then((res) => {
        deleteKeys(res.data, ['application']);
        res.data.forEach((role) => {
          role.users = getIds(role.users);
        });
        dispatch(addApplicationRoles(appID, buildObjectOfItems(res.data)));
        const roleIDs = getIds(res.data);
        dispatch(addApplicationRoleIDs(appID, roleIDs));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const createApplicationRole = (appID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/applications/${appID}/roles`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteApplicationRole = (appID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${roleID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getApplicationRoleByID = (appID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${roleID}`,
      )
      .then((res) => {
        deleteKeys([res.data], ['application']);
        res.data.users = getIds(res.data.users);
        dispatch(addApplicationRoleByID(appID, roleID, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const updateApplicationRole = (id, appID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .put(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${id}`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getSpaceRoles = (appID, spaceID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles`,
      )
      .then((res) => {
        deleteKeys(res.data, ['space']);
        res.data.forEach((role) => {
          role.users = getIds(role.users);
        });
        dispatch(addSpaceRoles(spaceID, buildObjectOfItems(res.data)));
        const roleIDs = getIds(res.data);
        dispatch(addSpaceRoleIDs(spaceID, roleIDs));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const createSpaceRole = (appID, spaceID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteSpaceRole = (appID, spaceID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${roleID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getSpaceRoleByID = (appID, spaceID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${roleID}`,
      )
      .then((res) => {
        deleteKeys([res.data], ['space']);
        res.data.users = getIds(res.data.users);
        dispatch(addSpaceRoleByID(spaceID, roleID, res.data));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const updateSpaceRole = (id, appID, spaceID, data) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .put(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${id}`,
        data,
      )
      .then(() => {
        dispatch(addSuccessNotification('Role Updated Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteOrganisationRoleUserByID = (roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${roleID}/users/${userID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('User Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteApplicationRoleUserByID = (appID, roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${roleID}/users/${userID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('User Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const deleteSpaceRoleUserByID = (appID, spaceID, roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .delete(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users/${userID}`,
      )
      .then(() => {
        dispatch(addSuccessNotification('User Deleted Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const addOrganisationRoleUserByID = (roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(`${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${roleID}/users`, {
        user_id: userID,
      })
      .then(() => {
        dispatch(addSuccessNotification('User Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const addApplicationRoleUserByID = (appID, roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${roleID}/users`,
        { user_id: userID },
      )
      .then(() => {
        dispatch(addSuccessNotification('User Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const addSpaceRoleUserByID = (appID, spaceID, roleID, userID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .post(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`,
        { user_id: userID },
      )
      .then(() => {
        dispatch(addSuccessNotification('User Added Successfully'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

const addOrganisationRoleUsers = (orgID, roleID, data) => ({
  type: ADD_ORGANISATION_ROLE_USERS,
  payload: {
    orgID: orgID,
    roleID: roleID,
    data: data,
  },
});

const addApplicationRoleUsers = (appID, roleID, data) => ({
  type: ADD_APPLICATION_ROLE_USERS,
  payload: {
    appID: appID,
    roleID: roleID,
    data: data,
  },
});

const addSpaceRoleUsers = (spaceID, roleID, data) => ({
  type: ADD_SPACE_ROLE_USERS,
  payload: {
    spaceID: spaceID,
    roleID: roleID,
    data: data,
  },
});

export const getOrganisationRoleUsers = (roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(`${ORGANISATIONS_API}/${getState().organisations.selected}/roles/${roleID}/users`)
      .then((res) => {
        dispatch(addUsersList(res.data));
        dispatch(
          addOrganisationRoleUsers(getState().organisations.selected, roleID, getIds(res.data)),
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getApplicationRoleUsers = (appID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/roles/${roleID}/users`,
      )
      .then((res) => {
        dispatch(addApplicationRoleUsers(appID, roleID, getIds(res.data)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};

export const getSpaceRoleUsers = (appID, spaceID, roleID) => {
  return (dispatch, getState) => {
    dispatch(startLoadingRoles());
    return axios
      .get(
        `${ORGANISATIONS_API}/${
          getState().organisations.selected
        }/applications/${appID}/spaces/${spaceID}/roles/${roleID}/users`,
      )
      .then((res) => {
        dispatch(addSpaceRoleUsers(spaceID, roleID, getIds(res.data)));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      })
      .finally(() => {
        dispatch(stopLoadingRoles());
      });
  };
};
