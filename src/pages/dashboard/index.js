import React from "react";
import OrganizationCard from "../../components/organizationCard"
import { List } from 'antd';
function Dashboard() {

  const [organizations, setOrganizations] = React.useState([])
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    fetch(process.env.REACT_APP_API_URL+"/users/me")
    .then((res) => {
      if (res.status === 200){
        return res.json()
      } else {
        throw new Error(res.status)
      }
    })
    .then((res) => setUser(res))
    .catch((err) => {
      console.log(err)
    });


    fetch(process.env.REACT_APP_API_URL+"/organizations")
    .then((res) => {
      if (res.status === 200){
        return res.json()
      } else {
        throw new Error(res.status)
      }
    })
    .then((res) => setOrganizations(res))
    .catch((err) => {
      console.log(err)
    });
  }, [])

  return (
    <div className="content">
       <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={organizations}
        renderItem={item => (
          <List.Item>
            <OrganizationCard organization={item} me={user} />
          </List.Item>
        )}
      />
    </div>
  );
}

export default Dashboard;
