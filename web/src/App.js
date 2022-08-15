import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'antd/dist/antd.css';
import BasicLayout from './layout/basic';
import Auth from './components/Auth';
import posthog from 'posthog-js';
//Routes
import routes from './config/routes';
import Recovery from './pages/recovery';
import Verification from './pages/verification';
import ErrorComponent from './components/ErrorsAndImage/ErrorComponent';
import VerificationAfterRegistration from './pages/verification/after-regisration';
import KratosError from './pages/error';

function App() {
  const disableRegistration = window.REACT_APP_DISABLE_REGISTRATION || false;
  const { orgCount } = useSelector((state) => {
    return {
      orgCount: state.organisations && state.organisations.ids ? state.organisations.ids.length : 0,
    };
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      posthog.init(process.env.REACT_APP_POSTHOG_API_KEY, {
        api_host: process.env.REACT_APP_POSTHOG_URL,
      });
    }
  }, []);
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/auth/login" component={(props) => <Auth {...props} flow={'login'} />} />
          {disableRegistration === false ? (
            <Route
              path="/auth/registration"
              component={(props) => <Auth {...props} flow={'registration'} />}
            />
          ) : (
            <Route
              path="/auth/registration"
              component={() => (
                <ErrorComponent
                  status="404"
                  title="Sorry, the page you visited does not exist."
                  link="/auth/login"
                  message="Goto login!"
                />
              )}
            />
          )}
          <Route path="/auth/recovery" component={() => <Recovery />} />
          <Route path="/auth/verification" component={() => <Verification />} />
          <Route path="/verification" component={() => <VerificationAfterRegistration />} />
          <Route path="/error" component={() => <KratosError />} />
          <BasicLayout>
            <Switch>
              {routes.map((route) => {
                return (
                  <Route
                    key={route.path}
                    exact
                    path={route.path}
                    component={
                      orgCount !== 0
                        ? route.Component
                        : route.path === '/password' ||
                          route.path === '/profile' ||
                          route.path === '/organisation' ||
                          route.path === '/profile/invite' ||
                          route.path === '/organisation/create'
                        ? route.Component
                        : () =>
                            ErrorComponent({
                              status: '500',
                              title: 'To access this page please create an organisation',
                              link: '/organisation',
                              message: 'Create Organisation',
                            })
                    }
                  />
                );
              })}
            </Switch>
          </BasicLayout>
          <Route
            path="*"
            exact={true}
            component={() => (
              <ErrorComponent
                status="404"
                title="Sorry, the page you visited does not exist."
                link="/auth/login"
                message="Goto login!"
              />
            )}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
