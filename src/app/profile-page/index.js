import React, { Component } from 'react';
import bsCustomFileInput from 'bs-custom-file-input'
import Axios from "axios";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { AvField, AvForm } from "availity-reactstrap-validation";
import 'react-block-ui/style.css';
import { logoutFunc,saveSecurityLogs} from "../util/helper";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl ="profile"

export class Profile extends Component {

  constructor(props) {
    super(props);
    this.state={
        loading:false,
        resetModal:false,
    }
  }
  componentDidMount() {
    bsCustomFileInput.init()
    saveSecurityLogs(menuUrl,"Menu Log")
  }
  resetPasswordModel=()=>{
    this.setState({
      resetModal:true
    })
  }
  resetPasswordHandle=async(e, values)=>{
      this.setState({
        loading:true
      })
      const payLoad={
        newPassword: values.newPassword
      }
      let options = SETTING.HEADER_PARAMETERS;
      options['Authorization'] = localStorage.getItem("token")
      await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/resetPassword/`+USER._id,payLoad,{headers: options})
      .then((res) => {
        this.setState({
          loading:false,
          resetModal:false
        })
        if (res && res.data.success) {
          toast["success"](res.data.message);
          saveSecurityLogs(menuUrl,"Update")
          setTimeout(() => {
            localStorage.clear()
            window.location.href = '/login'
          },200); 
        } else {
          toast["error"](res.data.message);
        } 
      })
      .catch((err) =>{
        this.setState({
          loading:false,
          resetModal:false
        })
        if(err && err.success===false  ){
          toast["error"](err.message? err.message: "Error while password reset");
          saveSecurityLogs(menuUrl,"Error Log",err.message)
        }else{
          logoutFunc(err)
          saveSecurityLogs(menuUrl,"Logout",err)
        }
      });
  }
  handleClose=()=>{
      this.setState({
        resetModal:false
      })
  }
  render() {
    return (
      <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="page-header">
          <h3 className="page-title"> Profile </h3>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="!#" onClick={event => event.preventDefault()}>Profile Data</a></li>
            </ol>
          </nav>
        </div>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
              <div className="row">
                  <div className="col-md-9">
                    <h4 className="card-title">User ID: {USER && USER.userInfo.userId} ({USER && USER.userInfo.roleName}) </h4>
                  </div>
                  <div className="col-md-3">
                    <button type="button" className="btn btn-gradient-success btn-fw"
                    onClick={()=>this.resetPasswordModel()}
                    >Reset Password</button>
                </div>
              </div>
                <form className="form-sample">
                  <p className="card-description"> Personal info </p>
                  <div className="row">
                    <div className="col-md-8">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Full Name</label>
                        <div className="col-sm-9">
                        <Form.Control  type="text" value={USER && USER.userInfo.fullName} disabled />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-4">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Role</label>
                        <div className="col-sm-9">
                        <Form.Control  type="text" value={USER && USER.userInfo.roleName} disabled />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                    <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Company Name</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.companyName} disabled  />
                        </div>
                      </Form.Group>
                    </div>
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Mother Name</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.motherName} disabled />
                        </div>
                      </Form.Group>
                    </div> */}
                  </div>
                  <div className="row">
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Gender</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.gender && (USER.userInfo.gender.charAt(0).toUpperCase() + USER.userInfo.gender.substring(1))} disabled />
                        </div>
                      </Form.Group>
                    </div> */}
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Date of Birth</label>
                        <div className="col-sm-9">
                        <DatePicker className="form-control w-100"
                          disabled
                          dateFormat="dd/MM/yyyy"
                          selected={USER && new Date(USER.userInfo.dob)}
                        />
                        </div>
                      </Form.Group>
                    </div> */}
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Phone Number 1</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.phoneNumber1} disabled />
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Phone Number 2</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.phoneNumber2} disabled />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="row">
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Category</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.category} disabled />
                        </div>
                        </Form.Group>
                    </div> */}
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Aadhar Number</label>
                        <div className="col-sm-9">
                        <Form.Control type="text" value={USER && USER.userInfo.aadharNumber} disabled />
                        </div>
                        </Form.Group>
                    </div> */}
                    {/* <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Membership</label>
                        <div className="col-sm-4">
                        <div className="form-check">
                          <label className="form-check-label">
                            <input type="radio" className="form-check-input" name="ExampleRadio4" id="membershipRadios1" defaultChecked /> Free 
                            <i className="input-helper"></i>
                          </label>
                        </div>
                        </div>
                        <div className="col-sm-5">
                        <div className="form-check">
                          <label className="form-check-label">
                            <input type="radio" className="form-check-input" name="ExampleRadio4" id="membershipRadios2" /> Proffessional 
                            <i className="input-helper"></i>
                          </label>
                        </div>
                        </div>
                      </Form.Group>
                    </div> */}
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <Form.Group className="row">
                        <label className="col-sm-2 col-form-label">Address</label>
                        <div className="col-sm-9">
                        <Form.Control  type="text" value={USER && USER.userInfo.address?USER.userInfo.address:''} disabled />
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  {/* <p className="card-description"> Address </p>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Address 1</label>
                        <div className="col-sm-9">
                        <Form.Control type="text"/>
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">State 1</label>
                        <div className="col-sm-9">
                        <Form.Control type="text"/>
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Address 2</label>
                        <div className="col-sm-9">
                        <Form.Control type="text"/>
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Postcode</label>
                        <div className="col-sm-9">
                        <Form.Control type="text"/>
                        </div>
                      </Form.Group>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="row">
                        <label className="col-sm-3 col-form-label">Cirt</label>
                        <div className="col-sm-9">
                        <Form.Control type="text"/>
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="row">  
                        <label className="col-sm-3 col-form-label">Country</label>
                        <div className="col-sm-9">
                          <select className="form-control">
                            <option>America</option>
                            <option>Italy</option>
                            <option>Russia</option>
                            <option>Britain</option>
                          </select>
                        </div>
                      </Form.Group>
                    </div>
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
        </BlockUi>
        <Modal
            show={this.state.resetModal}
            size={"md"}
            onHide={this.handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title> Reset Password </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm 
                onValidSubmit={this.resetPasswordHandle}
                >
                    <Col>
                        <AvField name="newPassword" label="New Password" placeholder="Enter New Password"
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'Required'
                            },
                          }} 
                      />
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
      </div>
    )
  }
}

export default Profile
