import reducer from './organizations';
import * as types from '../constants/organizations';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
};

describe('organizations reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        ids: [1],
        details: { 1: { id: 1, name: 'organization' } },
        loading: false,
        selected: 1,
      }),
    ).toEqual({
      ids: [1],
      details: { 1: { id: 1, name: 'organization' } },
      loading: false,
      selected: 1,
    });
  });
  it('should handle RESET_ORGANIZATIONS', () => {
    expect(
      reducer(
        {
          ids: [1],
          details: [{ id: 1, name: 'organization' }],
          loading: false,
          selected: 1,
        },
        {
          type: types.RESET_ORGANIZATIONS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_ORGANIZATIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: true,
      }),
    ).toEqual({
      ids: [],
      details: {},
      loading: true,
      selected: 0,
    });
    expect(
      reducer(initialState, {
        type: types.SET_ORGANIZATIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      ids: [],
      details: {},
      loading: false,
      selected: 0,
    });
  });
  it('should handle ADD_ORGANIZATIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANIZATIONS,
        payload: [
          { id: 1, name: 'organization 1' },
          { id: 2, name: 'organization 2' },
        ],
      }),
    ).toEqual({
      ids: [1, 2],
      details: { 1: { id: 1, name: 'organization 1' }, 2: { id: 2, name: 'organization 2' } },
      loading: true,
      selected: 1,
    });
  });
  it('should handle ADD_ORGANIZATION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANIZATION,
        payload: { id: 1, name: 'organization 1' },
      }),
    ).toEqual({
      ids: [1],
      details: { 1: { id: 1, name: 'organization 1' } },
      loading: true,
      selected: 0,
    });
  });
  it('should handle ADD_ORGANIZATION when details is non-empty', () => {
    expect(
      reducer(
        {
          ids: [1],
          details: { 1: { id: 1, name: 'existing organization' } },
          loading: false,
          selected: 1,
        },
        {
          type: types.ADD_ORGANIZATION,
          payload: { id: 2, name: 'new organization' },
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'existing organization' },
        2: { id: 2, name: 'new organization' },
      },
      loading: false,
      selected: 1,
    });
  });
  it('should handle ADD_ORGANIZATION when already exists', () => {
    expect(
      reducer(
        {
          ids: [1, 2],
          details: {
            1: { id: 1, name: 'existing organization' },
            2: { id: 2, name: 'new organization' },
          },
          loading: false,
          selected: 1,
        },
        {
          type: types.ADD_ORGANIZATION,
          payload: { id: 2, name: 'updated organization' },
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'existing organization' },
        2: { id: 2, name: 'updated organization' },
      },
      loading: false,
      selected: 1,
    });
  });
});
