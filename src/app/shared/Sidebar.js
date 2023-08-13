import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Collapse } from "react-bootstrap";
import SideMenu from "../app-config/menu.json"
//import {imageBaseUrl} from "../util/helper";
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //random:Math.random()
    };
  }

  toggleMenuState(menuState) {
    if (this.state[menuState]) {
      this.setState({ [menuState]: false });
    } else if (Object.keys(this.state).length === 0) {
      this.setState({ [menuState]: true });
    } else {
      Object.keys(this.state).forEach((i) => {
        this.setState({ [i]: false });
      });
      this.setState({ [menuState]: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    document.querySelector("#sidebar").classList.remove("active");
    Object.keys(this.state).forEach((i) => {
      this.setState({ [i]: false });
    });

    SideMenu.forEach((obj) => {
      if (this.isPathActive(obj.path)) {
        this.setState({ [obj.state]: true });
      }
    });
  }

  render() {

    let menuData = USER.permissions && USER.permissions.length>0?SideMenu.filter(item => USER.permissions.includes(item.path)): SideMenu.filter(data => data.role.find(res => res === USER.userInfo.roleName)).map(res => res);

    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <ul className="nav">
          <li className="nav-item nav-profile">
            <a
              href="!#"
              className="nav-link"
              onClick={(evt) => evt.preventDefault()}
            >
              <div className="nav-profile-image">
                <img
                  src={require("../../assets/images/faces/face.png")}
                  //src={!!USER && `${imageBaseUrl}${USER._id}_stPhoto.jpeg?n=${new Date()}`}
                  onError={e => { e.currentTarget.src = require("../../assets/images/faces/face.png")}}
                  alt="profile"
                />
                <span className="login-status online"></span>
                {/* change to offline or busy as needed */}
              </div>
              <div className="nav-profile-text">
                <span className="font-weight-bold mb-2">
                 {USER && USER.userInfo.fullName}
                </span>
                <span className="text-small" style={{color:"#6c5a5a"}}>
                  {USER && USER.userInfo.roleName}
                </span>
              </div>
              <i className={USER && USER.isApproved?"mdi mdi-bookmark-check text-success nav-profile-badge":"mdi mdi-bookmark-check text-danger nav-profile-badge"}></i>
            </a>
          </li>
          <li className={( this.isPathActive('/dashboard') || this.isPathActive('/adminDashboard'))  ? 'nav-item active' : 'nav-item' }>
            <Link className="nav-link" to={USER && USER.userInfo.roleName==='TOPADMIN'?"/dashboard":'adminDashboard'}>
              <span className="menu-title">Dashboard</span>
              <i className="mdi mdi-home menu-icon"></i>
            </Link>
          </li>
     
          {menuData.map((data,index)=>
            data.children?
                <li key={index} className={this.isPathActive(data.path) ? "nav-item active" : "nav-item"}>
                    <div   className={  this.state[data.state] ? "nav-link menu-expanded" : "nav-link" }
                              onClick={() => this.toggleMenuState(data.state)}
                              data-toggle="collapse"  >
                      <span className="menu-title">
                        {data.title}
                      </span>
                      {data.children?<i className="menu-arrow"></i>:null}
                      <i className={data.icon}></i>
                    </div>
                      {data.children && data.children.map((childData, index)=>
                        <Collapse in={this.state[data.state]} key={`#${index}`} >
                          <ul className="nav flex-column sub-menu">
                            <li className="nav-item">
                              <Link  className={ this.isPathActive(childData.path) ? "nav-link active" : "nav-link"}
                                  to={childData.path}  >
                                  {childData.title}
                              </Link>
                            </li>
                          </ul>
                      </Collapse>
                    )}
                  </li>
                  :
                  <li  key={index}className={ this.isPathActive(data.path) ? "nav-item active" : "nav-item" }>
                  <Link className="nav-link" to={data.path}>
                    <span className="menu-title">{data.title}</span>
                    <i className={data.icon}></i>
                  </Link>
                </li>

          )}

          {/* <li className="nav-item">
            <a
              className="nav-link"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="menu-title">
                Documentation
              </span>
              <i className="mdi mdi-file-document-box menu-icon"></i>
            </a>
          </li> */}
        </ul>
      </nav>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }

  componentDidMount() {
    // this.setState({
    //   random:Math.random()
    // })
    this.onRouteChanged();
    // add class 'hover-open' to sidebar navitem while hover in sidebar-icon-only menu
    const body = document.querySelector("body");
    document.querySelectorAll(".sidebar .nav-item").forEach((el) => {
      el.addEventListener("mouseover", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.add("hover-open");
        }
      });
      el.addEventListener("mouseout", function () {
        if (body.classList.contains("sidebar-icon-only")) {
          el.classList.remove("hover-open");
        }
      });
    });
  }
}

export default withRouter(Sidebar);

