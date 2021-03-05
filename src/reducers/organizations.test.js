import reducer from './organisations';
import * as types from '../constants/organisations';

const initialState = {
  ids: [],
  details: {},
  loading: true,
  selected: 0,
};

describe('organisations reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should return the state for default case', () => {
    expect(
      reducer({
        ids: [1],
        details: { 1: { id: 1, name: 'organisation' } },
        loading: false,
        selected: 1,
      }),
    ).toEqual({
      ids: [1],
      details: { 1: { id: 1, name: 'organisation' } },
      loading: false,
      selected: 1,
    });
  });
  it('should handle RESET_ORGANISATIONS', () => {
    expect(
      reducer(
        {
          ids: [1],
          details: [{ id: 1, name: 'organisation' }],
          loading: false,
          selected: 1,
        },
        {
          type: types.RESET_ORGANISATIONS,
          payload: {},
        },
      ),
    ).toEqual(initialState);
  });
  it('should handle SET_ORGANISATIONS_LOADING', () => {
    expect(
      reducer(initialState, {
        type: types.SET_ORGANISATIONS_LOADING,
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
        type: types.SET_ORGANISATIONS_LOADING,
        payload: false,
      }),
    ).toEqual({
      ids: [],
      details: {},
      loading: false,
      selected: 0,
    });
  });
  it('should handle ADD_ORGANISATIONS', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATIONS,
        payload: [
          { id: 1, name: 'organisation 1' },
          { id: 2, name: 'organisation 2' },
        ],
      }),
    ).toEqual({
      ids: [1, 2],
      details: { 1: { id: 1, name: 'organisation 1' }, 2: { id: 2, name: 'organisation 2' } },
      loading: true,
      selected: 1,
    });
  });
  it('should handle ADD_ORGANISATION', () => {
    expect(
      reducer(initialState, {
        type: types.ADD_ORGANISATION,
        payload: { id: 1, name: 'organisation 1' },
      }),
    ).toEqual({
      ids: [1],
      details: { 1: { id: 1, name: 'organisation 1' } },
      loading: true,
      selected: 0,
    });
  });
  it('should handle ADD_ORGANISATION when details is non-empty', () => {
    expect(
      reducer(
        {
          ids: [1],
          details: { 1: { id: 1, name: 'existing organisation' } },
          loading: false,
          selected: 1,
        },
        {
          type: types.ADD_ORGANISATION,
          payload: { id: 2, name: 'new organisation' },
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'existing organisation' },
        2: { id: 2, name: 'new organisation' },
      },
      loading: false,
      selected: 1,
    });
  });
  it('should handle ADD_ORGANISATION when already exists', () => {
    expect(
      reducer(
        {
          ids: [1, 2],
          details: {
            1: { id: 1, name: 'existing organisation' },
            2: { id: 2, name: 'new organisation' },
          },
          loading: false,
          selected: 1,
        },
        {
          type: types.ADD_ORGANISATION,
          payload: { id: 2, name: 'updated organisation' },
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'existing organisation' },
        2: { id: 2, name: 'updated organisation' },
      },
      loading: false,
      selected: 1,
    });
  });
  it('should handle SET_SELECTED_ORGANISATION', () => {
    expect(
      reducer(
        {
          ids: [1, 2],
          details: {
            1: { id: 1, name: 'existing organisation' },
            2: { id: 2, name: 'new organisation' },
          },
          loading: false,
          selected: 1,
        },
        {
          type: types.SET_SELECTED_ORGANISATION,
          payload: 2,
        },
      ),
    ).toEqual({
      ids: [1, 2],
      details: {
        1: { id: 1, name: 'existing organisation' },
        2: { id: 2, name: 'new organisation' },
      },
      loading: false,
      selected: 2
    });
  });
});
