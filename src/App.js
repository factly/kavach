import React from "react";
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";

import "antd/dist/antd.css";
import Login from "./pages/login";
import Registration from "./pages/registration";
import Dashboard from "./pages/dashboard";

function App() {
  return (
    <div className="App">
      <Router basename={process.env.PUBLIC_URL}>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/registration" component={Registration} />
        <Route path="/dashboard" component={Dashboard} />
      </Router>
    </div>
  );
}

export default App;
