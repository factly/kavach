import layout from '../config/layout';
import rootReducer from './index';

const initialState = {
  settings: {
    ...layout,
    sider: {
      collapsed: true,
    },
  },
  organisations: {
    ids: [],
    details: {},
    loading: true,
    selected: 0,
  },
  users: {
    details: {},
    loading: true,
  },
  media: {
    req: [],
    details: {},
    loading: true,
  },
  applications: {
    details: {},
    loading: true,
  },
  notifications: {
    type: null,
    message: null,
    description: null,
    time: null,
  },
  profile: {
    details: {},
    roles: {},
    invitations: [],
    loading: true,
  },
  sidebar: {
    collapsed: false,
  },
  spaces: {
    details: {},
    loading: true,
  },
  tokens: {
    organisation: {},
    application: {},
    space: {},
    loading: true,
  },
  roles: {
    organisation: {},
    application: {},
    space: {},
    loading: true,
  },
  policy: {
    organisation: {},
    application: {},
    space: {},
    loading: true,
  },
  defaultapplications: {
    applications: [],
    loading: true,
  },
};

describe('rootReducer', () => {
  it('should return the initial state', () => {
    expect(rootReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle TOGGLE_SIDER', () => {
    expect(
      rootReducer(initialState, {
        type: 'TOGGLE_SIDER',
      }),
    ).toEqual({
      ...initialState,
      settings: {
        ...initialState.settings,
        sider: {
          collapsed: !initialState.settings.sider.collapsed,
        },
      },
    });
  });
});
