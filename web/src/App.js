import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import 'antd/dist/antd.css';
import BasicLayout from './layout/basic';
import Auth from './components/Auth';
//Routes
import routes from './config/routes';
import Recovery from './pages/recovery';
import Verification from './pages/verification';
import OrganisationNotCreated from '../src/components/ErrorsAndImage/OrganisationNotCreated'
function App() {
  const [orgCount , setOrgCount] = useState(0)
  const {count} = useSelector((state)=>{
    return {
        count: (state.organisations && state.organisations.ids) ? state.organisations.ids.length : 0
      }
  })
  console.log(count)
  React.useEffect(()=>{
    setOrgCount(count)
  },[count])
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/auth/login" component={(props) => <Auth {...props} flow={'login'} />} />
          <Route
            path="/auth/registration"
            component={(props) => <Auth {...props} flow={'registration'} />}
          />
          <Route path="/auth/recovery" component={() => <Recovery />} />
          <Route path="/auth/verification" component={() => <Verification />} />
          <BasicLayout>
            <Switch>
              {routes.map((route) => {
                return (
                <Route key={route.path} exact path={route.path} component={(orgCount!=0) ? route.Component : (route.path==="/password" || route.path==="/profile" || route.path==="/organisation")? route.Component : OrganisationNotCreated} />
              )})}
            </Switch>
          </BasicLayout>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
