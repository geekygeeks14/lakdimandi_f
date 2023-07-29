import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import './App.scss';
import AppRoutes from './AppRoutes';
import Navbar from './shared/Navbar';
import Sidebar from './shared/Sidebar';
import SettingsPanel from './shared/SettingsPanel';
import Footer from './shared/Footer';

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

class App extends Component {
  state = {}
  componentDidMount() {
    this.onRouteChanged();

  }
  render () {
    let navbarComponent = USER ? <Navbar/> : '';
    let sidebarComponent = USER ? <Sidebar/> : '';
    let SettingsPanelComponent = USER ? <SettingsPanel/> : '';
    let footerComponent = USER ? <Footer/> : '';
    return (
      <div className="container-scroller">
        { navbarComponent }
        <div className="container-fluid page-body-wrapper">
          { sidebarComponent }
          <div className="main-panel">
            <div className="content-wrapper">
              <AppRoutes/>
              { SettingsPanelComponent }
            </div>
            { footerComponent }
          </div>
        </div>
      </div>
    );
  }

  onRouteChanged() {
      if (!USER) {
        this.setState({
          isFullPageLayout: true
        })
        document.querySelector('.page-body-wrapper').classList.add('full-page-wrapper');
      } else {
        this.setState({
          isFullPageLayout: false
        })
        document.querySelector('.page-body-wrapper').classList.remove('full-page-wrapper');
      }
  }
}

export default  (withRouter(App));