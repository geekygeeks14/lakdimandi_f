import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Col, Container, Form, FormGroup, InputGroup, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import DatePicker from "react-datepicker";
import FilterDateComponent from '../dateFilter'
import Select from 'react-select';
import 'react-block-ui/style.css';
import { logoutFunc } from "../util/helper";

let dateFilter = [
    {label:'Till Now',value:''},
    {label:'Today',value:'today'},
    {label:'Yesterday',value:'yesterday'},
    {label:'This Week',value:'this_week'},
    {label:'This Month',value:'this_month'},
    {label:'This Quarter',value:'this_quarter'},
    {label:'Last Week',value:'last_week'},
    {label:'Last Month',value:'last_month'},
    {label:'Last Quarter',value:'last_quarter'},
]


let MenuLog =[
    {label:'All Log',value:''},
    {label:'Login',value:'Login'},
    {label:'Logout',value:'Logout'},
    {label:'Update',value:'Update'},
    {label:'Create',value:'Create'},
    {label:'Delete',value:'Delete'},
    {label:'Menu Log',value:'Menu Log'},
    {label:'Event Log',value:'Event Log'},
    {label:'Status Change',value:'Status Change'},
    {label:'Suspended company',value:'Suspended company'},
    {label:'Error Log',value:'Error Log'},

]

class Security extends Component{
    constructor(props) {
        super(props);
        this.state = {
          loading:false,   
          securityData:[],
          searchValue:"",
          logValue:"",
          dateOption:'',
          pageNumber:0,
          pageSize:10,
          count:0   
        }
      }
       componentDidMount(){
            this.getSecurityLogs()
       }
       getSecurityLogs=async()=>{ 
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+`security/getLogs`)
        // url.searchParams.set('searchValue', this.state.searchValue)
        if(this.state.logValue){
            url.searchParams.set('logType', this.state.logValue)
        }
        if(this.state.startDate){
            url.searchParams.set('startDate', this.state.startDate)
        }
        if(this.state.endDate){
            url.searchParams.set('endDate', this.state.endDate)
        }
        url.searchParams.set('pageNumber', this.state.pageNumber)
        await Axios.get(url,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
        
          if (res && res.data.success) {
             this.setState({
                securityData:res.data.data,
                pageSize: res.data.pageSize,
                count: res.data.count
             })
          } else {
            this.setState({
                securityData:[],
                pageSize: 0,
                count: 0
             })
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false,
          })
          if(err && err.success===false  ){
            const errorMessage= "Error while getting secuirity logs"
            toast["error"](err.message? err.message: errorMessage);
            //saveSecurityLogs()
          }else{
            logoutFunc(err)
          }
        });
       }

       clearFilter =()=>{
            this.setState({
             logValue:"",
             startDate:'',
             endDate:'',
             dateOption:'',
             pageNumber:0
            },()=>this.getSecurityLogs())
       }
       onDateChange=(e, start, end)=>{
            this.setState({dateOption: e.value, startDate: start, endDate: end, pageNumber:0},()=>this.getSecurityLogs())
       }
       handleDateChange = (key, value) => {
        if(key==='startDate'){
            this.setState({[key]: value, endDate:'', pageNumber:0}, () => this.getSecurityLogs())
        }else{
            this.setState({[key]: value, pageNumber:0}, () => this.getSecurityLogs())
        }
       }   
       
       getPageIndex=(pageIndex)=>{
        this.setState({pageNumber:pageIndex},()=>this.getSecurityLogs())
       }
       filterLogType=(e)=>{
        this.setState({logValue:e.target.value, pageNumber:0},()=>this.getSecurityLogs())
       }
    render(){
        const columns =[
            {
                Header:"Time Stamp",
                accessor:"activity_date_time",
                width: 100,
                Cell :(cell)=>{
                    return  new Date(cell.original.created).toLocaleDateString("en-GB")
                }
            },
            {
                Header:"User Role",
                accessor:"name",
                width: 100,
                Cell :(cell)=>{
                    return cell.original.name?cell.original.name:"NA"
                }
            },
            {
                Header:"Page URL",
                accessor:"menu_url",
                width: 100,
                Cell :(cell)=>{
                    return cell.original.menu_url?cell.original.menu_url:"NA"
                }
            },
            {
                Header:"Log Type",
                accessor:"activity_type",
                width: 100,
                Cell :(cell)=>{
                    return cell.original.activity_type?cell.original.activity_type:"NA"
                }
            },
            {
                Header:"IP Address",
                accessor:"ipAdress",
                width: 100,
                Cell :(cell)=>{
                    return cell.original.ipAdress?cell.original.ipAdress:"NA"
                }
            },
            {
                Header:"Description",
                accessor:"desc",
                Cell :(cell)=>{
                    return cell.original.desc?cell.original.desc:"NA"
                }
            },
        ]
    return(
        <div>
             <BlockUi tag="div"  
             blocking={this.state.loading} 
             className="block-overlay-dark" loader={<Spinner/>}>
                <div className="row">
                    <div className="col-12 grid-margin">
                        <div className="card">
                            <div className="card-body">
                                <p className="card-title font-weight-bold">Security Log</p>
                                <Row>
                                   {/* <Col md={3}>
                                   <Form.Group>
                                   <label htmlFor="exampleFormControlSelect3">Search</label>
                                        <input className="form-control form-control-sm" id="exampleForm"
                                        // value={this.state.selectedLength? this.state.selectedLength:''}
                                        onChange={this.handleSearch}
                                    />
                                    </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                   <Form.Group>
                                   <label htmlFor="exampleFormControlSelect3">Date</label>
                                   <select className="form-control form-control-sm" id="exampleForm"
                                        // value={this.state.selectedProductCodeId? this.state.selectedProductCodeId:''}
                                        // onChange={this.filterProductCode}
                                    >
                                    {dateFilter.map((data,ind)=>{return(<option key={data.ind} value={data.value}>{data.label}</option>)})}
                                    </select>
                                    </Form.Group>
                                   </Col> */}
                                   <Col md={3}>
                                   <Form.Group>
                                   <label htmlFor="exampleFormControlSelect3">Log Type</label>
                                    <select className="form-control form-control-sm" id="exampleForm"
                                            value={this.state.logValue}
                                            onChange={this.filterLogType}
                                        >
                                        {MenuLog.map((data,ind)=>{return(<option key={data.ind} value={data.value}>{data.label}</option>)})}
                                    </select>
                                    </Form.Group>
                                   </Col>
                                   <Col md={3}>
                                   <label style={{fontSize:'smaller'}}>Log Type</label>
                                        <Form.Group>
                                            <FilterDateComponent
                                                value={this.state.dateOption}
                                                onDateChange={this.onDateChange}
                                                extraOption={{value: 'customDate', label: 'Custom Date Range'}}
                                            />
                                        </Form.Group>
                                   </Col>

                                {
                                    this.state.dateOption === 'customDate' ? <>
                                        <Col md={2}>
                                            <FormGroup>
                                                <label for="exampleEmail" className="mr-sm-2">
                                                    Start Date
                                                </label>
                                                <InputGroup>
                                                    {/* <InputGroupAddon addonType="prepend">
                                                        <div className="input-group-text">
                                                            <FontAwesomeIcon icon={faCalendarAlt}/>
                                                        </div>
                                                    </InputGroupAddon> */}
                                                    <DatePicker
                                                        selectsStart
                                                        className="form-control"
                                                        selected={this.state.startDate}
                                                        startDate={this.state.startDate}
                                                        endDate={this.state.endDate}
                                                        onChange={date => this.handleDateChange('startDate', date)}
                                                    />
                                                </InputGroup>
                                            </FormGroup>
                                        </Col>
                                        <Col md={2}>
                                            <FormGroup>
                                                <label for="examplePassword" className="mr-sm-2">End Date</label>
                                                <DatePicker
                                                    selectsEnd
                                                    className="form-control"
                                                    disabled={!this.state.startDate}
                                                    minDate={this.state.startDate}
                                                    selected={this.state.endDate}
                                                    endDate={this.state.endDate}
                                                    startDate={this.state.startDate}
                                                    onChange={date => this.handleDateChange('endDate', date)}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </> : null
                                }
                                   <Col md={4}>
                                   <Form.Group>
                                        <Button type="button" className="btn btn-warning text-dark mt-3" onClick={this.clearFilter}>Clear Filter</Button>
                                    </Form.Group>
                                   </Col>
                                </Row>
                               
                                
                                <p className="card-title2">Security Log Count : {this.state.count}</p>
                                <ReactTable
                                    manual
                                    data={this.state.securityData.length>0?this.state.securityData:[]}
                                    className='-striped -highlight'
                                    // className='-highlight'
                                    columns={columns}
                                    defaultSorted={[{ id: "created", desc: true }]}
                                    //pageSize={10}
                                    showPageSizeOptions={false}
                                    showPageJump={false}
                                    pageSize={this.state.securityData.length? this.state.securityData.length:0}
                                    page={this.state.pageNumber}
                                    onPageChange={(pageIndex)=>this.getPageIndex(pageIndex)}
                                    pages={this.state.pageSize}
                                />
                            </div>
                        </div>
                    </div>
              </div>
             </BlockUi>
        </div>
    )
}
}
export default Security;