import React, { Component, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Spinner from "../app/shared/Spinner";
import PrivateRoute from "./app-config/PrivateRoute";

const TopAdminDashboard = lazy(() => import("./TopAdminDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const Purchase = lazy(()=> import("./Purchase"))
const Sell = lazy(()=> import("./Sell"))
const FluctuationWeight = lazy(()=> import("./fluctuationWeight"))
const ProductName = lazy(()=>import("./ProductName"))
const RegisterForm = lazy(()=>import("./RegistrationForm"))
const ProductCode = lazy(()=> import("./ProductCode"))
const CompanyName = lazy(()=> import("./CompanyDetail"))
const Worker = lazy(()=> import("./Worker"))
const WorkDetail = lazy(()=> import("./WorkDetail"))
const UserRole = lazy(()=> import("./Role"))
const Buttons = lazy(() => import("./basic-ui/Buttons"));
const Dropdowns = lazy(() => import("./basic-ui/Dropdowns"));
const Typography = lazy(() => import("./basic-ui/Typography"));
const BasicElements = lazy(() => import("./form-elements/BasicElements"));
const BasicTable = lazy(() => import("./tables/BasicTable"));
const Mdi = lazy(() => import("./icons/Mdi"));
const ChartJs = lazy(() => import("./charts/ChartJs"));
const Error404 = lazy(() => import("./error-pages/Error404"));
const Error500 = lazy(() => import("./error-pages/Error500"));
const Login = lazy(() => import("./user-pages/Login"));
const Lockscreen = lazy(() => import("./user-pages/Lockscreen"));
const BlankPage = lazy(() => import("./general-pages/BlankPage"));
const Profile = lazy (()=>import("./profile-page"))
const Expense = lazy(()=>import("./Expense/expense"));
const DueAmount = lazy(()=>import("./DueAmount"));
const PayOption = lazy(()=> import("./PayOptions"))
const Security = lazy(()=>import("./securitylog/security"))
const CronJobReport = lazy(()=>import("./cronJobReport"))


class AppRoutes extends Component {
  render() {
    return (
      <Suspense fallback={<Spinner />}> 
        <Switch>
          <Route exact path='/' component={BlankPage}/>
          <Route exact path='/login' component={Login}/>
          {/* <Route exact path='/emailVerification/:email/:token' component={CreatePassword}/> */}
          <PrivateRoute path="/dashboard" component={TopAdminDashboard} exact/>
          <PrivateRoute path="/adminDashboard" component={AdminDashboard} exact/>
          <PrivateRoute path="/basic-ui/buttons" component={Buttons} exact/>
          <PrivateRoute path="/basic-ui/dropdowns" component={Dropdowns} exact/>
          <PrivateRoute path="/basic-ui/typography" component={Typography} exact />
          <PrivateRoute path="/form-Elements/basic-elements" component={BasicElements} exact/>
          <PrivateRoute path="/tables/basic-table" component={BasicTable} exact/>
          <PrivateRoute path="/icons/mdi" component={Mdi} exact/>
          <PrivateRoute path="/charts/chart-js" component={ChartJs} exact/>
          <PrivateRoute path="/profile" component={Profile} exact/>
          <PrivateRoute path="/purchase" component={Purchase} exact/>
          <PrivateRoute path="/sell" component={Sell} exact/>
          <PrivateRoute path="/security" component={Security} exact/> 
          <PrivateRoute path="/weight" component={FluctuationWeight} exact/>
          <PrivateRoute path="/register" component={RegisterForm} exact/>
          <PrivateRoute path="/addProduct" component={ProductName} exact/>
          <PrivateRoute path="/productCode" component={ProductCode} exact/>
          <PrivateRoute path="/company" component={CompanyName} exact/>
          <PrivateRoute path="/workers" component={Worker} exact/>
          <PrivateRoute path="/expense" component={Expense} exact/>
          <PrivateRoute path="/worklog" component={WorkDetail} exact/>
          <PrivateRoute path="/roles" component={UserRole} exact/>
          <PrivateRoute path="/due-amount" component={DueAmount} exact/>
          <PrivateRoute path="/pay-option" component={PayOption} exact/>
          <PrivateRoute path="/cronJob-report" component={CronJobReport} exact/>
          {/* <PrivateRoute path="/user-pages/lockscreen" component={Lockscreen} exact/> */}
          <PrivateRoute path="/error-pages/error-404" component={Error404} exact/>
          <PrivateRoute path="/error-pages/error-500" component={Error500} exact/>
          {/* <PrivateRoute path="/general-pages/blank-page" component={BlankPage} exact/> */}
            
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;
