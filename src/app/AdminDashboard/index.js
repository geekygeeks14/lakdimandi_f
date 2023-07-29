import React, { Component } from "react";
import Spinner from "../shared/Spinner";
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { SETTING } from "../app-config/cofiguration";
import Axios  from "axios";
import { logoutFunc } from "../util/helper";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
toast.configure();
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardData:{},
      loading:false,
    };

  }
  componentDidMount() {
    this.getDashboardData()
    window.scrollTo(0,0)
  }

  async getDashboardData(){
    this.setState({
      loading:true
    })
    let options = SETTING.HEADER_PARAMETERS;
    options['Authorization'] = localStorage.getItem("token")
    const todayDate = new Date().toISOString()
    await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getDashboardData?todayDate=${todayDate}`, {headers: options})
    .then((res) => {
      this.setState({
        loading:false
      })
      if (res && res.data.success) {
          this.setState({
            dashboardData:res.data.dashboardData
          })
      } else {
        // toast["error"](res.data.message);
      }
    })
    .catch((err) =>{
      this.setState({
        loading:false
      })
      if(err && err.success===false  ){
        toast["error"](err.message? err.message: "Error while getting data.");
      }else{
        logoutFunc(err)
      }
     
    });
  }

  toggleProBanner() {
    document.querySelector(".proBanner").classList.toggle("hide");
  }

  render() {
    const {dashboardData} = this.state
    return (
    
      <div>
          <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
       
        {/* 
          <div className="proBanner">
            <div>
              <span className="d-flex align-items-center purchase-popup">
                <p>Banner</p>
                  <a
                    href="https://www.bmmschool.in"
                    rel="noopener noreferrer"
                    target="_blank"
                    className="btn btn-sm purchase-button ml-auto"
                  >
                  BMMS
                 </a>
                <i
                  className="mdi mdi-close bannerClose"
                  onClick={this.toggleProBanner}
                ></i>
              </span>
            </div>
          </div> 
        */}
        <div className="page-header">
          <h3 className="page-title">
            <span className="page-title-icon bg-gradient-primary text-white mr-2">
              <i className="mdi mdi-home"></i>
            </span>{" "}
            Dashboard
          </h3>
          <nav aria-label="breadcrumb">
            <ul className="breadcrumb">
              <li className="breadcrumb-item active" aria-current="page">
                <span></span>Overview{" "}
                <i className="mdi mdi-alert-circle-outline icon-sm text-primary align-middle"></i>
              </li>
            </ul>
          </nav>
        </div>
        <div className="row">
          <div className="col-md-4 stretch-card grid-margin">
            <div className="card bg-gradient-danger card-img-holder text-white">
              <div className="card-body">
                <img
                  src={require("../../assets/images/dashboard/circle.svg")}
                  className="card-img-absolute"
                  alt="circle"
                />
                <h4 className="font-weight-normal mb-3">
                  Today Total Sells Amount{" "}
                  <i className="mdi mdi-chart-line mdi-24px float-right"></i>
                </h4>
                <h2 className="mb-5">{dashboardData.todaySell?<>&#x20B9; {parseFloat(dashboardData.todaySell).toFixed(2)}</>:'loading...'}</h2>
                {/* <h6 className="card-text">Data N/A</h6> */}
              </div>
            </div>
          </div>
          <div className="col-md-4 stretch-card grid-margin">
            <div className="card bg-gradient-info card-img-holder text-white">
              <div className="card-body">
                <img
                  src={require("../../assets/images/dashboard/circle.svg")}
                  className="card-img-absolute"
                  alt="circle"
                />
                <h4 className="font-weight-normal mb-3">
                Today Total Paid Amount{" "}
                  <i className="mdi mdi-bookmark-outline mdi-24px float-right"></i>
                </h4>
                <h2 className="mb-5">{dashboardData.todayPaid?<>&#x20B9; {parseFloat(dashboardData.todayPaid).toFixed(2)}</>:'loading...'}</h2>
                {/* <h6 className="card-text">Data N/A</h6> */}
              </div>
            </div>
          </div>
          <div className="col-md-4 stretch-card grid-margin">
            <div className="card bg-gradient-success card-img-holder text-white">
              <div className="card-body">
                <img
                  src={require("../../assets/images/dashboard/circle.svg")}
                  className="card-img-absolute"
                  alt="circle"
                />
                <h4 className="font-weight-normal mb-3">
                Today Total Due Amount {" "}
                  <i className="mdi mdi-diamond mdi-24px float-right"></i>
                </h4>
                <h2 className="mb-5">{dashboardData.todayDue?<>&#x20B9; {parseFloat(dashboardData.todayDue).toFixed(2)}</>:'loading...'}</h2>
                {/* <h6 className="card-text">Data N/A</h6> */}
              </div>
            </div>
          </div>
        </div>
        </BlockUi>
      </div>
    );
  }
}
const ListItem = (props) => {
  return (
    <li className={props.isCompleted ? "completed" : null}>
      <div className="form-check">
        <label htmlFor="" className="form-check-label">
          <input
            className="checkbox"
            type="checkbox"
            checked={props.isCompleted}
            onChange={props.changed}
          />{" "}
          {props.children} <i className="input-helper"></i>
        </label>
      </div>
      <i
        className="remove mdi mdi-close-circle-outline"
        onClick={props.remove}
      ></i>
    </li>
  );
};
export default AdminDashboard;
