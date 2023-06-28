import { configure } from 'enzyme';
import '@testing-library/jest-dom/extend-expect';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });

global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
  takeRecords() {
    return [];
  }
};
global.document.getSelection = function () {};
