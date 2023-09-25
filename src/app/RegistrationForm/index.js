import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { AvCheckbox, AvCheckboxGroup, AvField, AvForm } from "availity-reactstrap-validation";
import 'react-block-ui/style.css';
import { logoutFunc, saveSecurityLogs } from "../util/helper";
import stateCityList from "../util/stateCityList.json"
import SideMenuList from "../app-config/menu.json"
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl = window.location.href
export class Index extends Component {
    constructor(props) {
        super(props);
        this.state={
            loading:false,
            loading2:false,
            userData:[],
            registerModal:false,
            edit: false,
            selectedCell:{},
            handleCloseWeightModel:false,
            roleList:[],
            selectedState:null,
            deleteModal:false,
            passwordInfo:{},
            rules:[],
            showPermission:true,
            selectedRole:{}
        }
      }
     componentDidMount(){
      this.getRole()
      this.getAllUser()
      saveSecurityLogs(menuUrl, 'Menu Log')
     } 
     getAllPermissionsList=(roleName)=>{
        const permissionList=  SideMenuList.filter(data=> 
          data.role.includes(roleName)
        )
         this.setState({
           rules: permissionList
         })
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
              roleList: res.data &&  res.data.data && res.data.data.length>0 ? res.data.data.filter(data=> data.roleName!=='WORKER'):[],
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
      getAllUser = async()=>{
        this.setState({
          loading:true
        })
      
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getUser`,{headers: options})
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
          roleName: this.state.selectedRole.roleName,
          firstName: values.firstName,
          lastName : values.lastName,
          companyName: values.companyName,
          phoneNumber1: values.phoneNumber1,
          address: values.address,
          state : values.state,
          city: values.city,
          permissions:values.permissions
        }
        if(payLoad.roleName!=='INSTANCE ADMIN'){
          payLoad= {
            ...payLoad,
            parentUserId: USER && USER.userInfo.userId,
            companyId: USER && USER.userInfo.companyId,
            companyName: USER && USER.userInfo.companyName,
          }
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
            saveSecurityLogs(menuUrl, 'Create/Add')
          } else {
            toast["error"](res.data.message);
            saveSecurityLogs(menuUrl, 'Error Log',res.data.message)
          } 
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while submitting value");
            saveSecurityLogs(menuUrl, 'Error Log',err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl, 'Logout')
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
            saveSecurityLogs(menuUrl, 'Menu Log')
          } else {
            toast["error"](res.data.message);
            saveSecurityLogs(menuUrl, 'Error Log',res.data.message)
          } 
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.response && err.response.data &&  err.response.data.success===false){
            toast["error"]( err.response.data.message?  err.response.data.message: "Error while getting user");
            saveSecurityLogs(menuUrl, 'Error Log',err.response.data.messagee)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl, 'Logout')
          }
        });
      }

      getPassword= async(cell)=>{
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getPasswordById/`+cell._id,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              passwordInfo: res.data.data,
              selectedCell: cell,
              passwordModal:true
            })
          } else {
            toast["error"](res.data.message);
            saveSecurityLogs(menuUrl, 'Error Log',res.data.message)
          } 
        })
        .catch((err) =>{
          this.handleClose()
          logoutFunc(err)
          saveSecurityLogs(menuUrl, 'Error Log',err.response)
          if(err && err.response && err.response.data &&  err.response.data.success===false  ){
            toast["error"]( err.response.data.message?  err.response.data.message: 'Error while getting password detail.');
          }else{
            toast["error"]('Error while getting password detail.');
          } 
        });
       }

      registrationModelOpen=()=>{
        this.setState({
            registerModal:true
        })
       }
       changeRole=(e)=>{
        if(e.target.value){
          const roleData= this.state.roleList.find(data=> data._id=== e.target.value)
          this.setState({
              selectedRole: roleData
          },()=>this.getAllPermissionsList(roleData.roleName))
        }
       }

       handleClose=()=>{
        this.setState({
            loading:false,
            registerModal:false,
            selectedState:null,
            selectedCell:{},
            edit:false,
            passwordModal:false,
            rules:[],
            showPermission: false
        })
       }
       onChangeStateName=(e)=>{
        this.setState({
          selectedState: e.target.value,
        })
       }
       deleteToggle=(cell)=>{
        this.setState({
          selectedCell: cell,
          deleteModal:true
        })
       }
       editToggle=(cell)=>{
        this.setState({
          selectedCell: cell,
          registerModal: true,
          edit: true,
          selectedState: cell.userInfo.state,
          showPermission: true,
        },()=>this.getAllPermissionsList(cell.userInfo.roleName))
       }
  render() {
    const {selectedCell} = this.state
    const formData=this.state.edit? {
      ...selectedCell.userInfo,
      permissions:selectedCell.permissions
    }:{}
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
        //show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
        widhth: 250,
        Cell:cell=>{
          return(
              <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                  <a href="#/" title='delete' id={'delete'}
                    className="mb-2 badge" 
                      onClick={e=>this.deleteToggle(cell.original)}
                    >
                      <i className="mdi mdi-delete mdi-18px"></i>
                  </a>
                  <a href="#/" title='Edit' id={'edit'}
                    className="mb-2 badge" 
                      onClick={e=>this.editToggle(cell.original)}
                    >
                      <i className=" mdi mdi-lead-pencil mdi-18px"></i>
                  </a>
                  <a href="#/" title='Password' id={'password'}
                    className="mb-2 badge" 
                      onClick={e=>this.getPassword(cell.original)}
                    >
                      <i className=" mdi mdi-eye mdi-18px"></i>
                  </a>
              </Row>
          )
        }
      }
    ];

    return (
     <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}></BlockUi>
      <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title">User Registration</p>
                {/* <p className="card-title2">Fluctuation Weight value in Percentage</p> */}
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                     onClick={this.registrationModelOpen}
                  >New Registration</Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.userData?this.state.userData:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={columns}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={5}
                showPageSizeOptions={false}
                showPageJump={false}
              />
              </div>
            </div>
          </div>
        </div>
        <BlockUi/>
          <Modal
            show={this.state.registerModal}
            size={"xl"}
            onHide={this.handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title> {this.state.edit?'Update Vendor' : 'Registration Form'} </Modal.Title>
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
                      <Col md={6}>
                        <AvField
                          type='select' name='roleId'  label ="Select Role" placeholder="Choose Role"
                          disabled={this.state.edit}
                          onChange={this.changeRole}
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
                      <Row>
                        <Col md={3}>
                            <AvField name="firstName" label="First Name" placeholder="Enter First Name"
                              validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'Required'
                                },
                              }} 
                          />
                        </Col>
                        <Col md={3}>
                            <AvField name="lastName" label="Last Name" placeholder="Enter Last Name"
                              validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'Required'
                                },
                              }} 
                          />
                        </Col>
                        <Col md={3}>
                          <AvField name="phoneNumber1" label="Phone" placeholder="Enter Phone Number"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                            }} 
                        />
                      </Col>
                      {this.state.selectedRole && this.state.selectedRole.roleName==='INSTANCE ADMIN' && 
                        <Col md={3}>
                            <AvField name="companyName" label="Company Name" placeholder="Enter Company Name"
                              validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'Required'
                                },
                              }} 
                          />
                        </Col>
                      }
                      </Row>
                      <Row>
                        <Col md={3}>
                            <AvField name="address" label="Full Address" placeholder="Enter Full Address"
                              validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'Required'
                                },
                              }} 
                          />
                        </Col>
                        <Col md={3}>
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
                        <Col md={3}>
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
                      </Row>

                      {this.state.showPermission && this.state.rules.length>0 && (
                          <Col md="12">
                              <Row>
                                  <Col md="12">
                                      <p className={"menu-header-title text-capitalize mb-2 mt-2"}>Permissions</p>
                                  </Col>
                                  <Col md="12">
                                      <AvCheckboxGroup name="permissions" label=""  key={'checked group key'}
                                       required>
                                          {
                                              this.state.rules.map((item,index)=>{
                                                  return (
                                                      item.children ? 
                                                      <div key={`${item.path[index][index+1]}`} style={{marginLeft:'20px'}}>
                                                        <AvCheckbox  key={`${item.path[index]}`} label={item.title} value={item.path} />
                                                      </div> 
                                                        : 
                                                      <div key={`${item.path[index]}_${index}`}>
                                                        <AvCheckbox 
                                                        key={`${item.path[index]}`} 
                                                        label={item.title} 
                                                        value={item.path} 
                                                        />
                                                      </div>
                                                  )
                                              })
                                          }
                                      </AvCheckboxGroup>
                                  </Col>
                              </Row>
                          </Col>
                      )}
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
            show={this.state.deleteModal}
            size={"md"}
            onHide={this.handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title> Delete confirm </Modal.Title>
            </Modal.Header>
          
              <Modal.Body>
              <Card>
              <Card.Title>{ selectedCell &&  selectedCell.userInfo && selectedCell.userInfo.fullName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Are you want to sure delete this user ?</Card.Subtitle>
              <Card.Body></Card.Body>
            </Card>
            </Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading}  className="block-overlay-dark"  loader={<Spinner/>}>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose} >Class</Button>
              <Button variant="primary" onClick={this.handleDelete}>Yes</Button>
            </Modal.Footer>
            </BlockUi>
          </Modal>
              <Modal 
                show={this.state.passwordModal}
                //size={"md"}
                onHide={this.handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                animation="true"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title> Password Info</Modal.Title>
                </Modal.Header>
                <Modal.Body>        
                  <h4>Name: </h4><p>{this.state.passwordInfo.fullName}</p>
                  <h4>Role: </h4><p>{this.state.passwordInfo.roleName}</p> 
                  <h4>User Name: </h4><p>{this.state.passwordInfo.userId}</p>
                  <h4>Password: </h4><p>{this.state.passwordInfo.password}</p>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={this.handleClose}>
                Close
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
  }
}

export default Index
