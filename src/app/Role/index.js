import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { AvField, AvForm } from "availity-reactstrap-validation";
import 'react-block-ui/style.css';
import { capitalize, logoutFunc } from "../util/helper";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export class Role extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleData: [],
      modalShow:false
    };
    this.handleSubmit = this.handleSubmit.bind(this)
    this.openModal = this.openModal.bind(this)
  }
  componentDidMount() {
    this.getRole();
  }
  async getRole() {
    let options = SETTING.HEADER_PARAMETERS;
     options['Authorization'] = localStorage.getItem("token")
      await Axios.get(SETTING.APP_CONSTANT.API_URL+`role/getAllRoles`,{headers: options})
      .then((res) => {
        if (res && res.data.success) {
          this.setState({
            roleData: res.data.data
          })
          toast["success"](res.data.message);
        }else{
          toast["error"](res.data.message);
        }
      })
      .catch((err) => {
        toast["error"](err && err.response.data && err.response.data.message?err.response.data.message:"Error while getting role.")
      });
  }
  async handleSubmit(err, values) {
    let dataToSend = {
    roleName: values.roleName,
    };
    await Axios.post(SETTING.APP_CONSTANT.API_URL+`role`, dataToSend)
    .then((res) => {
      this.getRole()
      this.setState({
        modalShow:false
      })
      if (res && res.data.success) {
        toast["success"](res.data.message);
      } else {
        toast["error"](res && res.data && res.data.message? res.data.message:"Error while creating role ");
      }
    })
    .catch((err) =>{
      this.setState({
        modalShow:false
      })
      this.getRole()
      toast["error"]("Something went wrong.");
    });
  }
  openModal(){
    this.setState({
      modalShow: !this.state.modalShow
    })
  }
  // async getAllData() {
  //   let token = "A53YRGVU50UVM7YH06XAISJ1TPS0LRDX";
  //   let options = {
  //     Authorization: token,
  //   };
  //   const Axios1 = Axios.create({
  //     baseURL: "https://bmmschool.in/backend/",
  //   });
  //   await Axios1.get(`getAll.php`, { headers: options })
  //     .then((res) => {
  //       console.log(res);
  //       console.log(JSON.parse(res.data.split("Connected")[1]));
  //       let respData = JSON.parse(res.data.split("Connected")[1]);
  //       if (respData.success) {
  //         toast["success"]("Get successfully");
  //         console.log("ggggg", respData.fetchusers);
  //         this.setState({
  //           allData: respData.fetchusers,
  //         });
  //       } else {
  //         toast["error"]("somethimg went wrong");
  //       }
  //     })
  //     .catch((err) => {
  //       //something here
  //     });
  // }

  render() {
    return (
      <div>
        <div className="page-header">
          <h3 className="page-title"> Basic Tables </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="!#" onClick={(event) => event.preventDefault()}>
                 Role
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Edit Role
              </li>
            </ol>
          </nav>
        </div>
        <div className="row">
          <div className="col-lg-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <button type="button" className="btn btn-gradient-info btn-fw" onClick={this.openModal} >Create New Role</button>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>    
                        <th> Created </th>
                        <th> Role </th>
                        <th> Action </th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.roleData.map((data, index)=>               
                      <tr key={index}>
                        <td> {new Date(data.created).toLocaleString("en-GB", {hour12: true}).toUpperCase()}</td>
                        <td> {data.roleName}</td>
                        <td>Action</td>
                      </tr>
                      )}
       
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal show={this.state.modalShow} onHide={this.openModal}>
        <Modal.Header closeButton>
          <Modal.Title>Craete New Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AvForm onValidSubmit={this.handleSubmit}>
            <AvField name="roleName" placeholder="Role Name" type="text" required />
            <Button variant="secondary" onClick={this.openModal}> Close </Button>
            <Button variant="primary" type="Submit"> Create  </Button>
          </AvForm>

        </Modal.Body>
      </Modal>
      </div>
    );
  }
}
export default Role;