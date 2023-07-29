import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import routes from './routeAuth.json';
let USER

const performValidationHere = (props) => {
    const JWT_AUTH_TOKEN = localStorage.getItem("token");
    USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
    const roleName= USER && USER.userInfo && USER.userInfo.roleName
    return JWT_AUTH_TOKEN &&
        routes.find(res => res.path === props.path && res.roles &&
            res.roles.find(role => role === roleName));
}

const  PrivateRoute= (props) => {
    let  condition = performValidationHere(props);
    return  condition ? (<Route  path={props.path}  exact={props.exact} component={props.component} />):<Redirect to='/'/>
};

export default PrivateRoute;
