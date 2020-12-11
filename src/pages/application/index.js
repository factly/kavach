import React from 'react';
import ApplicationList from './components/ApplicationList';
import {Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Application() {
    return (
        <Space direction="vertical">
            <Link key="1" to="/application/create">
                <Button>
                    Create New
                </Button>
            </Link>
            <ApplicationList />
        </Space>
    );
}

export default Application;