import React, { Component } from "react";
import Axios from "axios";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { capitalize, logoutFunc } from "../util/helper";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import 'react-block-ui/style.css';
import { Link } from "react-router-dom/cjs/react-router-dom";
import { AvField, AvForm, AvRadio, AvRadioGroup } from "availity-reactstrap-validation";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const ROLE = (USER && USER.userInfo.roleName)?USER.userInfo.roleName:''
const payOptionOption =[
  {value:'Cash',label:'Cash'},
  {value:'Gpay',label:'Gpay'},
  {value:'Paytm',label:'Paytm'},
  {value:'phonePay',label:'phonePay'},
  {value:'Axis Bank',label:'Axis Bank'},
]
const UPITypeList  =[
  {value:'Gpay',label:'Gpay'},
  {value:'Paytm',label:'Paytm'},
  {value:'PhonePay',label:'PhonePay'},
  {value:'BharatPay',label:'BharatPay'}
]

const payMethodList=[
  {value:'UPI',label:'UPI'},
  {value:'BANK',label:'BANK'},
]

class PayOptions extends Component {
    constructor(props){
        super(props)
        this.state={
            loading:false,
            payOptionModal:false,
            selectedCell:{},
            allPayOptions:[],
            payMethod:''
        }
    }

    componentDidMount(){
        this.getAllPayOptions()
    }

    async getAllPayOptions(){
        this.setState({
          loading:true
        })
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+'admin/getAllPayOptions')

        await Axios.get(url,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            const  allPayOptions = res.data.sellData.filter((val)=>!val.deleted) 
             this.setState({
              allPayOptions:allPayOptions              
            })
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting all Pay Option");
          }else{
            logoutFunc(err)
          }
        });
       }
       payOptionSubmit=async(error, values)=>{
        let payOptionInfo={}
        if(values.type==='BANK'){
          payOptionInfo={
            ifscCode: values.IFCCode,
            accountNumber: values.accountNumber
          }
        }
        if(values.type==='UPI'){
          payOptionInfo={
            upiId: values.IFCCode,
          }
        }
        const payload={
          name: values.name,
          type: values.type,
          payOptionInfo: payOptionInfo,
          companyId: USER && USER.userInfo.companyId,
          insertedBy : USER && USER._id,
        }
        
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        // await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/updateSellData/`+this.state.selectedSellId,payload,{headers: options})
        // .then((res) => {
        //   if (res && res.data.success) {
        //     toast["success"](res.data.message); 
        //     this.getAllSell() 
        //     this.handleClosePayOptioneModel()     
        //     this.setState({
        //       selectedCell: {},
        //       detailModal: false,
        //       totalDueAmount: 0,
        //       dueDetails: [],
        //     })
            
        //   } else {
        //     if(res?.data?.actionPassword){
        //       this.setState({loading4:false})
        //       toast["error"](res.data.message);
        //     }else{
        //       toast["error"](res.data.message);
        //       this.handleClosePayOptioneModel();
        //     }
        //   } 
        // })
        // .catch((err) =>{
        //   this.handleClosePayOptioneModel()
        //   if(err && err.success===false  ){
        //     toast["error"](err.message? err.message: "Error while submitting pay option data.");
        //   }else{
        //     logoutFunc(err)
        //   }
        // });
       }

       editToggle=(cell)=>{
          this.setState({
              selectedCell: cell,
              payOptionModal: true,
          })
       }
 
       handleClosePayOptioneModel=()=>{
        this.setState({
          selectedCell:{},
          payOptionModal: false,
        })
       }
       openPayOptioneModel=()=>{
        this.setState({
          payOptionModal: true,
        })
       }

       onChangePayMethod=(e)=>{
        this.setState({
          payMethod: e.target.value
        })
       }



    render(){
      const columns = [
            {
              Header: "Date/Time",
              accessor: "created",
              width: 180,
              Cell: (cell) => {
                return new Date(cell.original.created)
                  .toLocaleString("en-GB", {
                    hour12: true,
                  })
                  .toUpperCase();
              },
            },
            {
                Header: "Name",
                accessor: "name",
              },
              {
                Header: "Type",
                accessor: "type",
                Cell: (cell) => {
                  return  cell.original.type &&  cell.original.type.toUpperCase()
                 },
              },
              // {
              //   Header: "other Info",
              //   accessor: "payOptionInfo",
              //   Cell: (cell) => {
              //     return  cell.original.payOptionInfo &&  cell.original.buyerDetail.phoneNumber1?cell.original.buyerDetail.phoneNumber1:'NA'
              //    },
              // },
              {
                Header: "Action",
                //show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
                width: 150,
                Cell:cell=>{
                  return(
                      <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                          <a href="#/" title='Pay' id={'pay'}
                          className="mb-2 badge" 
                          onClick={e=>this.editToggle(cell.original)}
                          >
                          <i className="mdi mdi-cash-multiple mdi-18px"></i>
                          </a>
                      </Row>
                  )
                }
              }
        ]

  return(
      <>
        <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title2">Total Pay Option: {this.state.allPayOptions.length}</p>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                      onClick={this.openPayOptioneModel}
                      >New Pay Option 
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
                <ReactTable
                data={this.state.allPayOptions?this.state.allPayOptions:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={columns}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={15}
                showPageSizeOptions={false}
                showPageJump={false}
              />
              </div>
            </div>
          </div>
        </div>
        </BlockUi>    
        <Modal
            show={this.state.payOptionModal}
            // size={"lg"}
            onHide={this.handleClosePayOptioneModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Pay Option Method</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Card>
                <Card.Body>
                  <AvForm ref={c=>(this.form= c)}  onValidSubmit={this.payOptionSubmit}>
                    
                        <Col>
                          <AvField name="payMethod"  type='select' label="Choose Pay Method" placeholder=""
                            onChange={this.onChangePayMethod} 
                            validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                              }
                            }} 
                          >
                            <option value='' key='paymethodKey'>select Pay Method </option>
                            {payMethodList.map((data, index)=> <option value={data.value} key ={`${index}_payMethod`}>{data.label}</option>)}
                          </AvField>
                        </Col>
                        {this.state.payMethod && this.state.payMethod==='UPI' && 
                        <>
                          <Col>
                            <AvField name="UPIType"  type='select' label="Choose UPI Type" placeholder=""
                              //onChange={this.onChangePayMethod} 
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                                }
                              }} 
                            >
                              <option value='' key='upiTypeKey'>select UPI Type </option>
                              {UPITypeList.map((data, index)=> <option value={data.value} key ={`${index}_upiTypeKey`}>{data.label}</option>)}
                            </AvField>
                          </Col>
                        <Col >
                          <AvField 
                              name={`upiId`}  label ="UPI ID" placeholder=""
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                          }} 
                          />
                        </Col>
                        </>
                        }
                      {this.state.payMethod && this.state.payMethod==='BANK' && 
                      <>
                      <Col>
                        <AvField 
                              type="text" name={`name`} label="Bank Name" 
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        </AvField>
                      </Col>
                      <Col >
                          <AvField 
                              name={`accountNumber`}  label ="Account Number" placeholder=""
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                          }} 
                          />
                      </Col>
                      <Col >
                        <AvField  name="ifscCode" label="IFSC Code" placeholder="SBI000242342"
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                            },
                          }} 
                          />
                      </Col>
                      </>
                      }
                  <Row>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button  variant="info"  type="submit"
                       >Submit</Button>
                      </div>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button variant="dark" 
                        onClick={this.handleClosePayOptioneModel}
                       >Cancel</Button>
                      </div>
                  </Row>
                </AvForm>
                </Card.Body>
              </Card>
            </Modal.Body>
          </Modal>
        </div>
        </>
        )
    }
}
export default PayOptions;