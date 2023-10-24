import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Axios from "axios";
import { SETTING } from "../app-config/cofiguration";
import { saveSecurityLogs } from "../util/helper";
toast.configure();
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl =window.location.href
class Navbar extends Component {

  constructor(props) {
    //this.handleClose = this.handleColse.bind(this);
    super(props);
    this.state = {
      show: false,
      random:Math.random()
    };
    this.handleSubmit= this.handleSubmit.bind(this)
  }
  componentDidMount(){
    this.setState({
      random:Math.random()
    })
  }

  async handleSubmit(event) {
    event.preventDefault();
   
    let options = SETTING.HEADER_PARAMETERS;
    options['Authorization'] = localStorage.getItem("token")

    await Axios.post(SETTING.APP_CONSTANT.API_URL+`authorize/logout`, {},{headers: options})
      .then((res) => {

        if (res && res.data.success) {

          saveSecurityLogs(menuUrl,"Logout")
          localStorage.clear();
          toast["success"]("Logged out successfully.");
          setTimeout(()=>{
            window.location.href = "/login"
            },300)
        
        } else {
          if(res && res.data && res.data.message==="Session Expired."){
            localStorage.clear();
            toast["success"]("Logged out successfully.");
            setTimeout(()=>{
              window.location.href = "/login"
              },300)
          }else{
            toast["error"](res && res.data && res.data.message? res.data.message:"Try Again.");
          }
         
        }
      })
      .catch((err) =>{
        if(err && err.response.data && err.response.data.message==="jwt expired"){
          localStorage.clear();
          toast["success"]("Logged out successfully.");
          setTimeout(()=>{
            window.location.href = "/login"
            },300)
        }else{
          toast["error"]("Error while logout.");
        }
      });
  }
  toggleOffcanvas() {
    document.querySelector(".sidebar-offcanvas").classList.toggle("active");
  }
  toggleRightSidebar() {
    document.querySelector(".right-sidebar").classList.toggle("open");
  }
  render() {
    return (
      <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row" >
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center" >
          <Link className="navbar-brand brand-logo" to="/">
            {/* <img src={require("../../assets/images/favicon.png")} alt="logo" />{" "} */}
           <h4 className="text-primary">Yadhuwanshi Enterprises</h4> 
          </Link>
          <Link className="navbar-brand brand-logo-mini" to="/dashboard">
            {" "}
            {/* <img
              src={require("../../assets/images/favicon.png")}
              alt="logo"
            /> */}
            {" "}
            <h4 className="text-primary">YE</h4>
          </Link>
        </div>
        <div className="navbar-menu-wrapper d-flex align-items-stretch">
          <button
            className="navbar-toggler navbar-toggler align-self-center"
            type="button"
            onClick={() => document.body.classList.toggle("sidebar-icon-only")}
          >
            <span className="mdi mdi-menu"></span>
          </button>
          <div className="search-field d-none d-md-block">
            {/* <form className="d-flex align-items-center h-100" action="#">
              <div className="input-group">
                <div className="input-group-prepend bg-transparent">
                  <i className="input-group-text border-0 mdi mdi-magnify"></i>
                </div>
                <input
                  type="text"
                  className="form-control bg-transparent border-0"
                  placeholder="Search projects"
                />
              </div>
            </form> */}
          </div>
          <ul className="navbar-nav navbar-nav-right">
            <li className="nav-item nav-profile">
              <Dropdown alignRight>
                <Dropdown.Toggle className="nav-link">
                  <div className="nav-profile-img">
                    <img
                      src={require("../../assets/images/faces/face.png")}
                      //src={!!USER && `${imageBaseUrl}${USER._id}_stPhoto.jpeg?n=${this.state.random}`}
                      //onError={e => { e.currentTarget.src = require("../../assets/images/faces/face.png")}}
                      alt=""
                    />
                    <span className={USER && USER.isApproved?"availability-status online":"availability-status offline"}></span>
                  </div>
                  <div className="nav-profile-text">
                    <p className="mb-1 text-black">
                     { USER && USER.userInfo.fullName}
                    </p>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="navbar-dropdown">
                  {/* <Dropdown.Item
                    href="!#"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <i className="mdi mdi-cached mr-2 text-success"></i>
                   Activity Log
                  </Dropdown.Item> */}
                  <Dropdown.Item
                    href="!#"
                    onClick={this.handleSubmit}
                  >
                    <i className="mdi mdi-logout mr-2 text-primary"></i>
                   Signout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </li>
            {/* <li className="nav-item">
              <Dropdown alignRight>
                <Dropdown.Toggle className="nav-link count-indicator">
                  <i className="mdi mdi-email-outline"></i>
                  <span className="count-symbol bg-warning"></span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="preview-list navbar-dropdown">
                  <h6 className="p-3 mb-0">
                   Messages
                  </h6>
                  <div className="dropdown-divider"></div>
                  <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <img
                        src={require("../../assets/images/faces/face.png")}
                        alt="user"
                        className="profile-pic"
                      />
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject ellipsis mb-1 font-weight-normal">
                       Mark send you a message
                      </h6>
                      <p className="text-gray mb-0">
                        1Minutes ago
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <img
                        src={require("../../assets/images/faces/face.png")}
                        alt="user"
                        className="profile-pic"
                      />
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject ellipsis mb-1 font-weight-normal">
                       Cregh send you a message
                      </h6>
                      <p className="text-gray mb-0">
                        15Minutes ago
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <img
                        src={require("../../assets/images/faces/face.png")}
                        alt="user"
                        className="profile-pic"
                      />
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject ellipsis mb-1 font-weight-normal">
                       Profile picture updated
                      </h6>
                      <p className="text-gray mb-0">
                        18Minutes ago
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <h6 className="p-3 mb-0 text-center cursor-pointer">
                    4new messages
                  </h6>
                </Dropdown.Menu>
              </Dropdown>
            </li> */}
            <li className="nav-item">
              <Dropdown alignRight>
                <Dropdown.Toggle className="nav-link count-indicator">
                  <i className="mdi mdi-bell-outline"></i>
                  <span className="count-symbol bg-danger"></span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu navbar-dropdown preview-list">
                  <h6 className="p-3 mb-0">
                   Notifications
                  </h6>
                  <div className="dropdown-divider"></div>
                  {/* <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <div className="preview-icon bg-success">
                        <i className="mdi mdi-calendar"></i>
                      </div>
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject font-weight-normal mb-1">
                       Event today
                      </h6>
                      <p className="text-gray ellipsis mb-0">
                       
                          Just a reminder that you have an event today
                        
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <div className="preview-icon bg-warning">
                        <i className="mdi mdi-settings"></i>
                      </div>
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject font-weight-normal mb-1">
                       Settings
                      </h6>
                      <p className="text-gray ellipsis mb-0">
                       Update dashboard
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <Dropdown.Item
                    className="dropdown-item preview-item"
                    onClick={(evt) => evt.preventDefault()}
                  >
                    <div className="preview-thumbnail">
                      <div className="preview-icon bg-info">
                        <i className="mdi mdi-link-variant"></i>
                      </div>
                    </div>
                    <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                      <h6 className="preview-subject font-weight-normal mb-1">
                       Launch Admin
                      </h6>
                      <p className="text-gray ellipsis mb-0">
                       New admin wow!
                      </p>
                    </div>
                  </Dropdown.Item>
                  <div className="dropdown-divider"></div>
                  <h6 className="p-3 mb-0 text-center cursor-pointer">
                   See all notifications
                  </h6> */}
                </Dropdown.Menu>
              </Dropdown>
            </li>
            {/* <li className="nav-item nav-logout d-none d-lg-block">
              <a className="nav-link" href="!#" onClick={event => event.preventDefault()}>
                <i className="mdi mdi-power"></i>
              </a>
            </li> */}
          </ul>
          <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" onClick={this.toggleOffcanvas}>
            <span className="mdi mdi-menu"></span>
          </button>
        </div>
      </nav>
    );
  }
  
}

export default Navbar;
