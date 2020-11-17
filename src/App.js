import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import 'antd/dist/antd.css';
import BasicLayout from './layout/basic';

import Auth from './components/Auth';

//Routes
import routes from './config/routes';

function App() {
  return (
    <div className="App">
      <Router basename={window.PUBLIC_URL}>
        <Switch>
          <Route path="/auth/login" component={(props) => <Auth {...props} flow={'login'} />} />
          <Route
            path="/auth/registration"
            component={(props) => <Auth {...props} flow={'registration'} />}
          />
          <BasicLayout>
            <Switch>
              {routes.map((route) => (
                <Route key={route.path} exact path={route.path} component={route.Component} />
              ))}
            </Switch>
          </BasicLayout>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
