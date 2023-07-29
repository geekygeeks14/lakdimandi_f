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
import { AvField, AvForm, Label } from "availity-reactstrap-validation";
import 'react-block-ui/style.css';
import {logoutFunc } from "../util/helper";
import "react-datepicker/dist/react-datepicker.css";
import stateCityList from "../util/stateCityList.json"
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export class Worker extends Component {
    constructor(props) {
        super(props);
        this.state = {
          roleList: [],
          userData:[],
          loading:false,
          workerDetailModel:false,
          loading2:false,
          deleteWorkerDetailModal:false,
          loading3:false,
          selectedCell:{},
          edit:false,
          selectedState:null,
        };
      }

      componentDidMount() {
        this.getRole();
        this.getAllWorker()
      }
      getRole = async()=>{
        this.setState({
          loading:true
        })
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`role/getAllRoles`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              roleList: res.data.data && res.data.data.length>0?res.data.data.filter(data=> data.roleName==='WORKER'):[]
            })
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false,
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting user");
          }else{
            logoutFunc(err)
          }
        });
      }
      getAllWorker = async()=>{
        this.setState({
          loading:true
        })
      
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getUser?userType=WORKER`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              userData: res.data.users,
            })
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false,
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting user");
          }else{
            logoutFunc(err)
          }
        });
      }

      handleSubmit= async(e, values)=>{
        this.setState({
          loading:true
        })
        let payLoad={
          roleId: values.roleId,
          roleName: this.state.roleList.find(data=> data._id.toString()===values.roleId).roleName,
          firstName: values.firstName,
          lastName : values.lastName,
          companyName: USER && USER.userInfo.companyName,
          phoneNumber1: values.phoneNumber1,
          address: values.address,
          state : values.state,
          city: values.city,
          parentUserId: USER && USER.userInfo.userId,
          companyId: USER && USER.userInfo.companyId,
        }
        let url = this.state.edit? `admin/updateUser/`+this.state.selectedCell._id : `admin/addUser`
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url,payLoad,{headers: options})
        .then((res) => {
          this.setState({
            loading:false,
            registerModal:false,
            edit:false,
            selectedCell:{}
          })
          if (res && res.data.success) {
            this.getAllUser()
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while submitting value");
          }else{
            logoutFunc(err)
          }
        });
      }

      handleDelete = async()=>{
        this.setState({
          loading:true
        })
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.delete(SETTING.APP_CONSTANT.API_URL+`admin/deleteUser/`+this.state.selectedCell._id,{headers: options})
        .then((res) => {
          this.setState({
            loading:false,
            deleteModal:false,
            selectedCell:{}
          })
          if (res && res.data.success) {
            this.getAllUser()
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.response && err.response.data &&  err.response.data.success===false){
            toast["error"]( err.response.data.message?  err.response.data.message: "Error while getting user");
          }else{
            logoutFunc(err)
          }
        });
      }
      onChangeStateName=(e)=>{
        this.setState({
          selectedState: e.target.value,
        })
       }
     
       workerModelOpen=()=>{
        this.setState({
            workerDetailModel:true
        })
       }
       workerModelClose=()=>{
        this.setState({
            workerDetailModel:false
        })
       }

       handleClose=()=>{
        this.setState({
            workerDetailModel:false,
            loading:false,
            loading2:false,
            deleteWorkerDetailModal: false,
            selectedCell:{},
            loading3:false,
            edit:false,
        },()=> this.getAllWorker())
       }
       editToggle=(cell)=>{
        this.setState({
          selectedCell: cell,
          workerDetailModel: true,
          edit: true,
          selectedState: cell.userInfo.state
        })
       }
       deleteToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          deleteWorkerDetailModal:true
        })
       }
       deleteWorkerDetailModelClose=()=>{
        this.setState({
            deleteWorkerDetailModal:false
        })
       }
     
  render() {
    const {selectedCell} = this.state
    const formData=this.state.edit? {...selectedCell.userInfo}:{}
    const columns = [
      {
        Header: "Date/Time",
        accessor: "created",
        width: 155,
        Cell: (cell) => {
          return new Date(cell.original.created)
            .toLocaleString("en-GB", {
              hour12: true,
            })
            .toUpperCase();
        },
      },
      {
        Header: "Full Name",
        accessor: "userInfo.fullName",
      }, 
      {
        Header: "Role",
        accessor: "userInfo.roleName",
      },
      {
        Header: "Phone Number",
        accessor: "userInfo.phoneNumber1",
      },
      {
        Header: "Company Name",
        accessor: "userInfo.companyName",
      },
      {
        Header: "Address",
        accessor: "userInfo.address",
      },
      // {
      //   Header: "State",
      //   accessor: "userInfo.state",
      // },
      {
        Header: "City",
        accessor: "userInfo.city",
      },
      {
        Header: "Action",
        // show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
        Cell:cell=>{
          return(
              <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                  <a href="#/" title='Delete' id={'delete'}
                    className="mb-2 badge" 
                      onClick={e=>this.deleteToggle(cell.original)
                    }>
                      <i className="mdi mdi-delete mdi-18px"></i>
                  </a>
                  <a  href="#/" title='Edit' id={'edit'}
                    className="mb-2 badge" 
                      onClick={e=>this.editToggle(cell.original)
                    }>
                      <i className="mdi mdi-lead-pencil mdi-18px"></i>
                  </a>
              </Row>
          )
        }
      }

      
    ];
    return (
        <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title">All Worker</p>
                <p className="card-title2">Total Worker Count: {this.state.userData.length}</p>
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                  onClick={this.workerModelOpen}
                  >Add New Worker</Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.userData}
                className='-striped -highlight'
                // className='-highlight'
                columns={columns}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={10}
                showPageSizeOptions={false}
                showPageJump={false}
              />
              </div>
            </div>
          </div>
        </div>
        </BlockUi>    
          <Modal
            show={this.state.workerDetailModel}
            //size={"lg"}
            onHide={this.workerModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Worker Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm 
                onValidSubmit={this.handleSubmit}
                model={formData}
                >
                  {/* <h3 className="text-dark d-flex justify-content-center">Registration Form</h3> */}
                      <Col>
                        <AvField
                          type='select' name='roleId'  label ="Select Role" placeholder="Choose Role"
                          disabled={this.state.edit}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                        }} 
                        >
                        <option value=''>Choose Role</option>
                        {this.state.roleList.length>0 && this.state.roleList.map((data, index)=> {return (<option key={`${index}_role`} value={data._id} style={{color:"black"}}>{data.roleName}</option>)} )}
                        </AvField>  
                      </Col>
                      <Col>
                          <AvField name="firstName" label="First Name" placeholder="Enter First Name"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        />
                      </Col>
                      <Col>
                          <AvField name="lastName" label="Last Name" placeholder="Enter Last Name"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        />
                      </Col>
                      <Col>
                          <AvField name="phoneNumber1" label="Phone" placeholder="Enter Phone Number"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        />
                      </Col>
                      <Col>
                          <AvField name="address" label="Full Address" placeholder="Enter Full Address"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        />
                      </Col>
                      <Col>
                          <AvField name="state" type='select' label="State" placeholder="State"
                            onChange={this.onChangeStateName}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        >
                        <option value=''>Choose State</option>
                       
                        {Object.keys(stateCityList).map((data, index)=> {return (<option key={`${index}_state`} value={data} style={{color:"black"}}>{data}</option>)} )}
                        </AvField>
                      </Col>
                      <Col>
                          <AvField name="city" type='select' label="City" placeholder="City"
                          disabled={!this.state.selectedState && !this.state.edit}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        >
                           <option value=''>Choose City</option>
                         {this.state.selectedState&&stateCityList[this.state.selectedState].sort((a, b) => a.value - b.value).map((data, index)=> {return (<option key={`${index}_state`} value={data} style={{color:"black"}}>{data}</option>)} )}
                         </AvField>
                      </Col>
                    <Row>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button variant="dark" 
                        onClick={this.handleClose}
                         >Cancel</Button>
                        </div>
                    </Row>
                 </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal>

          <Modal
            show={this.state.deleteWorkerDetailModal}
            // size={"lg"}
            onHide={this.deleteWorkerDetailModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Remove Worker</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               Are you want sure remove this worker?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.deleteWorkerDetailModelClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.handleDelete}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </div>
    )
  }
}

export default Worker