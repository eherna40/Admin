import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import list from './list';

export default ({ match }) => (
    <Switch>
        <Redirect exact from={`${match.url}/`} to={`${match.url}/all`} />
        <Route path={`${match.url}/all`} component={list} />
        <Redirect to="/error" />
    </Switch>
);