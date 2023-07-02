import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as types from '../constants/sidebar';
import * as actions from './sidebar';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {};

describe('sidebar actions', () => {
  it('should create actions for collapsing sidebar', () => {
    const expectedactions = {
      type: types.SET_COLLAPSE,
      payload: true,
    };
    const store = mockStore({ initialState });
    store.dispatch(actions.setCollapse(true));
    expect(store.getActions()[0]).toEqual(expectedactions);
  });
  it('should create actions for collapsing sidebar', () => {
    const expectedactions = {
      type: types.SET_COLLAPSE,
      payload: false,
    };
    const store = mockStore({ initialState });
    store.dispatch(actions.setCollapse(false));
    expect(store.getActions()[0]).toEqual(expectedactions);
  });
});
