import React from 'react'
import { Result, Button } from 'antd'
import {Link} from 'react-router-dom'
function OrganisationNotCreated(){
    return (
        <Result
            status="500"
            title="To access this page please create an organisation"
            extra={<Link to="/organisation"><Button type="primary">Create Organisation</Button></Link>}
        />
    )
} 

export default OrganisationNotCreated