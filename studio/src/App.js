import React from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import 'antd/dist/antd.css';
import BasicLayout from './layout/basic';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <BasicLayout></BasicLayout>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
