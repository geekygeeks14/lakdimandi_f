import React, { Component } from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { encryptAES } from "../util/helper";
import Spinner from "../shared/Spinner";
import { SETTING } from "../app-config/cofiguration";
import { AvField, AvForm, AvInput } from "availity-reactstrap-validation";
import { Button, Col, Container, Form, FormGroup, Modal, Row } from "react-bootstrap";
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import './login.css';
import { encryptAES } from "../util/helper";

toast.configure();
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
export class Login extends Component {
  
  constructor(props) {
    //this.handleClose = this.handleColse.bind(this);
    super(props);
    this.state = {
      loading: false,
      userName:'',
      password:''
    };
  }
  componentDidMount(){
    //eslint-disable-next-line no-unused-expressions
    if(USER){
      const roleName= USER.userInfo.roleName
      if(roleName==='TOPADMIN')window.location.href="/dashboard"
      if(roleName!=='TOPADMIN')window.location.href="/adminDashboard"
    }
  }


  userNameHandle=(e)=>{
    console.log(" eeeeee", e.target.value)
    this.setState({userName:e.target.value})
  }
  passwordHandle=(e)=>{
    //console.log(" eeeeee", e.target.value)
    this.setState({password:e.target.value})
  }

     handleSubmit=async(e,values)=>{
      this.setState({
          loading:true
      })
      // let dataToSend = {
      // userId: this.state.userName,
      // password: this.state.password,
      // };

      let dataToSend = {
        userId: values.userName,
        password: encryptAES(values.password),
      };
    
      await Axios.post(SETTING.APP_CONSTANT.API_URL+`public/userlogin`, dataToSend)
      .then((res) => {
        this.setState({
          loading:false
      })
        if (res && res.data.success) {
          const user = res.data.data.user
          localStorage.setItem("userInformation", JSON.stringify(res.data.data.user))
          localStorage.setItem("token", JSON.stringify(res.data.data.token))
          toast["success"]("Logged in successfully");
            const roleName= user.userInfo.roleName
            if(roleName==='TOPADMIN')window.location.href="/dashboard"
            if(roleName!=='TOPADMIN')window.location.href="/adminDashboard"
        } else {
          toast["error"](res && res.data && res.data.message? res.data.message:"user name or Password is wrong Please try again");
        }
      })
      .catch((err) =>{
        this.setState({
          loading:false
      })
        toast["error"]("Something went wrong.");
      });
    }
  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.loading}  className="block-overlay-dark" loader={<Spinner/>}>
          <section className='login py-5 bg-light'>
              <div className='container'>
                <div className='row g-0' style={{background:'white', borderRadius:'30px', boxShadow:'12px 12px 22px'}}>
                  <div className='col-lg-5 m-2'>
                      <img src="./pankh.jpg" alt="" className='img-fluid'/>
                  </div>
                  <div className='col-lg-5 text-center py-5'>
                      <h1 className="text-primary">
                          Sign In
                      </h1>
                      {/* <form>
                          <div className='form-row py-2 pt-5'>
                              <div className='offset-1 col-lg-10'>
                                  <input type='text' name="userName" placeholder='User Name' className='inp px-3'
                                  onChange={this.userNameHandle}
                                  />
                                  
                              </div>
                          </div>
                          <div className='form-row py-3'>
                              <div className='offset-1 col-lg-10'>
                                  <input type='password' name="password" placeholder='Password'className='inp px-3'
                                  onChange={this.passwordHandle}
                                  />
                              </div>
                          </div>
                          <div className='form-row'>
                              <div className='offset-1 col-lg-10'>
                                  <button type="button" className='btn1'
                                  onClick={this.handleSubmit}
                                  >Sign In
                                  </button>
                              </div>
                          </div>
                      </form> */}
                      <AvForm className='mt-5 ml-2' onValidSubmit={this.handleSubmit}>
                      <AvField name="userName" placeholder="User Name" className="inp px-3 ml-5"
                        validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          },
                          minLength: {
                            value: 4,
                            errorMessage: 'Invalid user Name.'
                          },
                          maxLength: {
                            value: 35,
                            errorMessage: 'Invalid user Name.'
                          },
                          pattern: {
                            value:  /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                            errorMessage: `Invalid user Name.`
                          }
                      }} 
                      />
                      <AvField name="password" placeholder="Password" 
                      type="password"
                      className="inp px-3 ml-5 mt-2"
                        validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          }
                      }} 
                      />
                       <Button type="submit" className="btn1 mt-4">Sign In</Button>
                      </AvForm>
                    </div>
                </div>
              </div>    
          </section>
        </BlockUi>
      </div>
    );
  }
}

export default Login;
