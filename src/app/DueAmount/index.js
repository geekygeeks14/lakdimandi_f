import React, { Component } from "react";
import Axios from "axios";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { capitalize, encryptAES, logoutFunc } from "../util/helper";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import 'react-block-ui/style.css';
import { Link } from "react-router-dom/cjs/react-router-dom";
import { AvField, AvForm } from "availity-reactstrap-validation";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const ROLE = (USER && USER.userInfo.roleName)?USER.userInfo.roleName:''
const paymentOption =[
  {value:'Cash',label:'Cash'},
  {value:'Gpay',label:'Gpay'},
  {value:'Paytm',label:'Paytm'},
  {value:'phonePay',label:'phonePay'},
  {value:'Axis Bank',label:'Axis Bank'},
]
const sellDueFilterOption=[
  {value:'all', label:'All'},
  {value:'today', label:'Today'}
]

class DueAmount extends Component {
    constructor(props){
        super(props)
        this.state={
            loading:false,
            allCompany:[],
            allSell:[],
            uniqueSellData:[],
            dueDetails:[],
            paymentModal:false,
            totalDueAmount:0,
            selectedCell:{},
            paymentList:[{}],
            detailModal: false,
            duePaidAmount:0,
            restDueAmount:0,
            dueAmount:0,
            selectedSellId:'',
            selectedFilter: 'all'
        }
    }

    componentDidMount(){
      if(window.location.href.includes('today')){
        this.setState({
          selectedFilter:'today'
        },()=> this.getAllSell(),window.history.pushState('', '',  window.location.pathname))
      }else{
        this.getAllSell()
      }
    }

    async getAllSell(){
        this.setState({
          loading:true
        })
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+'admin/getAllSell')
        if(this.state.selectedFilter && this.state.selectedFilter==='today'){
          const toDate= new Date()
          const fromDate = new Date()
          let dateFrom = new Date(fromDate.toString()).toISOString().split("T")[0]
          let dateTo = new Date(toDate.toString()).toISOString().split("T")[0]
          url.searchParams.set('dateFilter', this.state.selectedFilter)
          url.searchParams.set('fromDate', dateFrom)
          url.searchParams.set('toDate', dateTo)
        }
      
        await Axios.get(url,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            //let data =res.data.sellData.filter((val)=>val.dueAmount!==0)
            const  allSellData = res.data.sellData.filter((val)=>val.dueAmount!==0) 
             const  uniqueSellDataByNumber= allSellData.reduce((acc, obj) => {
              const key = obj.buyerDetail.phoneNumber1;
              if (!acc[key]) {
                acc[key] = [];
              }
              acc[key].push(obj);
              return acc;
            }, {});
            
            const allDue= (Object.entries(uniqueSellDataByNumber).map(([key, value]) => ({ key, value }))).map(data=>{
              return{
                ...data,
                totalDueAmount : parseFloat(data.value.reduce((acc, curr)=> acc+ parseFloat(curr.dueAmount),0)).toFixed(2)
              }
            }) 
            // console.log("UniqueSellData", allDue)
             this.setState({
              allSell: res.data.sellData.filter((val)=>val.dueAmount!==0),
              uniqueSellData:allDue              
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
            toast["error"](err.message? err.message: "Error while getting all Sell data.");
          }else{
            logoutFunc(err)
          }
        });
       }
       dueAmoutSubmit=async(error, values)=>{
          const payload={
            dueAmountSubmisions: true,
            payInfo: this.state.paymentList,
            //discountAmount: values.discountAmount?values.discountAmount:0,
            duePaidAmount: values.duePaidAmount,
            restDueAmount: values.restDueAmount,
            actionPassword: (ROLE && ROLE==='ADMIN')? encryptAES(values.actionPassword): undefined,
            insertedBy : USER && USER._id,
          }
          
          let options = SETTING.HEADER_PARAMETERS;
          options['Authorization'] = localStorage.getItem("token")
          await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/updateSellData/`+this.state.selectedSellId,payload,{headers: options})
          .then((res) => {
            if (res && res.data.success) {
              toast["success"](res.data.message); 
              this.getAllSell() 
              this.handleClosePaymenteModel()     
              this.setState({
                selectedCell: {},
                detailModal: false,
                totalDueAmount: 0,
                dueDetails: [],
              })
              
            } else {
              if(res?.data?.actionPassword){
                this.setState({loading4:false})
                toast["error"](res.data.message);
              }else{
                toast["error"](res.data.message);
                this.handleClosePaymenteModel();
              }
            } 
          })
          .catch((err) =>{
            this.handleClosePaymenteModel()
            if(err && err.success===false  ){
              toast["error"](err.message? err.message: "Error while submitting Sell data.");
            }else{
              logoutFunc(err)
            }
          });
       }

       payToggle=(cell)=>{
        console.log("cellcellcell", cell)
          this.setState({
              selectedSellId: cell._id,
              paymentModal: true,
              //totalDueAmount: cell.totalDueAmount,
              dueAmount: cell.dueAmount,
              restDueAmount:cell.dueAmount
          })
       }
       showDueDetails=(cell)=>{
        this.setState({
          selectedCell: cell,
          detailModal: true,
          totalDueAmount: cell.totalDueAmount,
          dueDetails: cell.value,
        })
       }
       handleClosePaymenteModel=()=>{
        this.setState({
          paymentModal: false,
          selectedSellId:'',
          dueAmount:0,
          restDueAmount:0,
          duePaidAmount:0,
          paymentList:[{}]
        })
       }
       calculatePaymentAmount = () => {
        let duePaidAmount = 0;
        // let discountAmount= this.state.discountAmount?parseFloat(this.state.discountAmount):0
        let actualDueAmount = this.state.dueAmount?parseFloat(this.state.dueAmount):0
          this.state.paymentList.forEach((it)=>{
              if(!!it.amount && parseFloat (it.amount) > 0){
                duePaidAmount += parseFloat(it.amount);
              }
          });
        let restDueAmount = actualDueAmount - duePaidAmount 
        this.setState({ duePaidAmount: duePaidAmount.toFixed(2) , restDueAmount: restDueAmount.toFixed(2)})
      };
       addMorePayment=()=>{
        this.setState({
          paymentList:[...this.state.paymentList,{}],
        })
      }

      removePaymentRow = (index) => {
        let paymentList = [...this.state.paymentList];
        if(paymentList.length>1){
          paymentList.splice(index, 1);
          this.setState({paymentList},()=>this.calculatePaymentAmount())
        }else{
          toast["error"]('This is required row.');
        }
      }
      updatePaymentField = (rowIndex, key) => e => {
        let data = [...this.state.paymentList];
        data[rowIndex][key] = e.target.value;
        this.setState({ paymentList:data },
           ()=>{this.calculatePaymentAmount()}
          );
      };

      detailModalClose=()=>{
        this.setState({
          selectedCell:{},
          detailModal: false,
          totalDueAmount: 0,
          dueDetails: [],
        })
      }

      changePaymentOption = (rowIndex, e, key) => {
        let data = [...this.state.paymentList];
        data[rowIndex][key] = e.target.value;
        this.setState({ paymentList:data });
      };
      filterSellDue=(e)=>{
        this.setState({
            selectedFilter: e.target.value
        },()=> this.getAllSell())
      }

    render(){
        const sellColumn = [
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
                Header: "Buyer Name",
                accessor: "buyerName",
                Cell: (cell) => {
                      return  cell.original.buyerDetail &&  cell.original.buyerDetail.buyerName?cell.original.buyerDetail.buyerName:'NA'
                },
              },
              {
                Header: "Company Name",
                accessor: "companyName",
                Cell: (cell) => {
                  return  cell.original.buyerDetail &&  cell.original.buyerDetail.companyName?cell.original.buyerDetail.companyName:'NA'
                 },
              },
              {
                Header: "Phone Number",
                accessor: "phoneNumber1",
                Cell: (cell) => {
                  return  cell.original.buyerDetail &&  cell.original.buyerDetail.phoneNumber1?cell.original.buyerDetail.phoneNumber1:'NA'
                 },
              },
              {
                Header: "Total Amt.",
                accessor: "totalAmount",
                Cell: (cell) => {
                  return  cell.original.totalAmount? cell.original.totalAmount:'0.00'
                }
              },
              {
                Header: "Paid Amt.",
                accessor: "paidAmount",
                Cell: (cell) => {
                  return  cell.original.paidAmount? cell.original.paidAmount:'0.00'
                }
              },
              {
                Header: "Due Amt.",
                accessor: "dueAmount",
                Cell: (cell) => {
                  return  cell.original.dueAmount? cell.original.dueAmount:'0.00'
                }
              },
              {
                Header: "Action",
                //show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
                width: 150,
                Cell:cell=>{
                  return(
                      <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                          <a href="#/" title='Pay' id={'pay'}
                          className="mb-2 badge" 
                          onClick={e=>this.payToggle(cell.original)}
                          >
                          <i className="mdi mdi-cash-multiple mdi-18px"></i>
                          </a>
                      </Row>
                  )
                }
              }
        ]
        const columns = [
          {
            Header: "Buyer Name",
            //accessor: "buyerName",
            Cell: (cell) => {
              const data= cell.original.value && cell.original.value.length>0 && cell.original.value[0]
              return data.buyerDetail &&  data.buyerDetail.buyerName?data.buyerDetail.buyerName:'NA'
            },
          },
          {
            Header: "Phone Number",
            //accessor: "buyerName",
            Cell: (cell) => {
              const data= cell.original.value && cell.original.value.length>0 && cell.original.value[0]
              return data.buyerDetail &&  data.buyerDetail.phoneNumber1?data.buyerDetail.phoneNumber1:'NA'
            },
          },
            {
              Header: "Company Name",
              accessor: "companyName",
              Cell: (cell) => {
                const data= cell.original.value && cell.original.value.length>0 && cell.original.value[0]
                return  data &&  data.buyerDetail.companyName?data.buyerDetail.companyName:'NA'
               },
            },
            {
              Header: "Due Amt.",
              accessor: "dueAmount",
              Cell: (cell) => {
                return  <Link to="#" onClick={()=>this.showDueDetails(cell.original)}>{cell.original.totalDueAmount? parseFloat(cell.original.totalDueAmount).toFixed(2):'0.00'}</Link>
              }
            
            },
            // {
            //   Header: "Action",
            //   width: 150,
            //   Cell:cell=>{
            //     return(
            //         <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
            //             <a href="#/" title='Pay' id={'pay'}
            //             className="mb-2 badge" 
            //             onClick={e=>this.payToggle(cell.original)}
            //             >
            //             <i className="mdi mdi-cash-multiple mdi-18px"></i>
            //             </a>
            //         </Row>
            //     )
            //   }
            // }
      ]
    return(
      <>
        <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title2">Total Due Amount Details: {this.state.uniqueSellData.length}</p>
                <Row>
                  <Col md={2}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Product Name</label>
                        <select className="form-control form-control-sm" id="exampleForm"
                        value={this.state.selectedFilter}
                        onChange={this.filterSellDue}
                      >
                      {sellDueFilterOption.map((data, index)=><option  key={`${index}${data.value}`}value={data.value}>{data.label}</option>)}
                      </select>
                    </Form.Group>
                  </Col>
                </Row>
                <ReactTable
                data={this.state.uniqueSellData?this.state.uniqueSellData:[]}
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
            show={this.state.paymentModal}
            // size={"lg"}
            onHide={this.handleClosePaymenteModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Due Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Card>
                <Card.Body>
                  {/* <Card.Text>Due Amount= {this.state.dueAmount}
                  </Card.Text> */}
                  <AvForm ref={c=>(this.form= c)}  onValidSubmit={this.dueAmoutSubmit}>
                  <Row>
                      {this.state.paymentList.map((paymentData,index)=>
                        <>
                        <Row>
                        <Col md={5}>
                            <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                                type="select" name={`payment[${index}].payMode`} label="Select Pay" 
                                key={`payment[${index}].payMode`}
                                value={!!paymentData && !!paymentData.payMode? paymentData.payMode:null}
                                onChange={(e)=>this.changePaymentOption(index, e, 'payMode')}
                                disabled={ROLE && ROLE==='SUPER_ADMIN'}
                                validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'This field is required.'
                                }
                            }} >
                          <option value=''>Choose pay</option>
                          {paymentOption.map((data, index)=> {return (<option key={index} style={{color:"black"}}>{data.label}</option>)} )}
                          </AvField>
                        </Col>
                        <Col md={4}>
                          <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                              name={`payment[${index}].amount`}  label ="Enter amount" placeholder="0.00"
                              key={`payment[${index}].amount`}
                              value={!!paymentData && !!paymentData.amount? paymentData.amount:0.00}
                              //onKeyUp={ e => this.calculatePaymentField(e, index) }
                              onChange={ this.updatePaymentField(index, 'amount') }
                              disabled={ROLE && ROLE==='SUPER_ADMIN'}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                              pattern: {
                                value:'^[0-9]+(\\.[0-9]{2})?$',
                                errorMessage: `Invalid amount number.`
                              }
                          }} 
                          />
                        </Col>
                        <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <Form.Group>
                              <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" key={`${index}removeButton`} className="btn btn-gradient-danger btn-sm" onClick={()=>this.removePaymentRow(index)}
                            >
                            Remove
                          </button>
                          </Form.Group>
                        </Col>
                        </Row>
                        </>
                        )}
                    </Row>
                      {ROLE && ROLE==='ADMIN' &&       
                      <Col md={4}>
                        <AvField type='password' name="actionPassword" label="Password" placeholder="Password"
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                            },
                          }} 
                          />
                      </Col>
                      }
                        <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-success btn-sm" onClick={this.addMorePayment}
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        >
                          Add More Payment
                        </button>
                      </div>
                      <Row>
                      <Col md={6}>
                        <AvField  name="restDueAmount" label="Due Amount" placeholder="00.00"
                        value={this.state.restDueAmount}
                        disabled={true}
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                            },
                          }} 
                          />
                      </Col>
                      <Col md={6}>
                        <AvField  name="duePaidAmount" label="Paid Amount" placeholder="00.00"
                          disabled={true}
                          value={this.state.duePaidAmount}
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                            },
                          }} 
                          />
                      </Col>
                    </Row>
                  <Row>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button  variant="info"  type="submit"
                       >Submit</Button>
                      </div>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button variant="dark" 
                        onClick={this.handleClosePaymenteModel}
                       >Cancel</Button>
                      </div>
                  </Row>
                </AvForm>
                </Card.Body>
              </Card>
            </Modal.Body>
          </Modal>
          <Modal
            show={this.state.detailModal}
            size={"lg"}
            onHide={this.detailModalClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Sell Detail Report (Total Due Amount= {this.state.totalDueAmount})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                 <ReactTable
                data={this.state.dueDetails && this.state.dueDetails.length>0?this.state.dueDetails:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={sellColumn}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={5}
                showPageSizeOptions={false}
                showPageJump={false}
              />
            </Modal.Body>
          </Modal>
       
        </div>
        </>
        )
    }
}
export default DueAmount;