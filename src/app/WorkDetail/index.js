import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _, { includes } from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import { AvField, AvForm } from "availity-reactstrap-validation";
import 'react-block-ui/style.css';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'
import { capitalize, convertMilliSecToHrMints, logoutFunc } from "../util/helper";
import DatePicker from "react-datepicker";
const ReactTableFixedColumns = withFixedColumns(ReactTable);

toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
export class WorkDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
          allWorkDetail: [],
          allWorker:[],
          loading:false,
          workDetailModel:false,
          loading2:false,
          formData:{},
          edit:false,
          daysInMonth:[],
          totalMilliSec:0,
          selectedWorkDetailId:'',
          selectedDate:'',
          dateOfWork:'',
          selectedMonthYear : new Date(),
          selectedMonth : new Date().getMonth()+1,
          selectedYear : new Date().getFullYear(),
          loadingWorkList:[],
          unLoadingWorkList:[],
          productionWorkList:[],
          otherWorkList:[]
        };
      }

      componentDidMount() {
        this.getAllWorkDetail();
        this.getAllWorker()
        this.getDaysInMonth()
      }
      async getAllWorker(){
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
              allWorker: res.data.users,
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
            toast["error"](err.message? err.message: 'Error while getting work detail.');
          }else{
            logoutFunc(err)
          }
        });
       }
      async getAllWorkDetail(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getWorkDetail`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allWorkDetail: res.data.data,
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
            toast["error"](err.message? err.message: 'Error while getting work detail.');
          }else{
            logoutFunc(err)
          }
        });
       }

       handleSubmit = async(e, values)=>{
        if(!(this.state.totalMilliSec>0)){
          toast['error']('Please add/select working time')
          return
        }
        this.setState({
          loading2:true
        })
        let payload={
          userId: this.state.formData.userId,
          loadingWorkList: this.state.loadingWorkList,
          unLoadingWorkList:  this.state.unLoadingWorkList,
          productionWorkList: this.state.productionWorkList,
          otherWorkList : this.state.otherWorkList,
          parentUserId: USER && USER.userInfo.userId,
          companyId: USER && USER.userInfo.companyId?USER.userInfo.companyId:USER.userInfo.userId,
          totalMilliSec: this.state.totalMilliSec,
          dateOfWork : this.state.dateOfWork
        }
        let url ='admin/addWorkDetail'
        if(this.state.selectedWorkDetailId){
          url = 'admin/updateWorkDetail'
          delete payload.userId
          delete payload.parentUserId
          delete payload.dateOfWork
          delete payload.companyId
          payload={
            ...payload,
            selectedWorkDetailId: this.state.selectedWorkDetailId
          }
        }
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url,payload,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
          } else {
            toast["error"](res.data.message);
          } 
          this.handleClose()
        })
        .catch((err) =>{
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: `Error while ${this.state.edit?'Updating':'Adding'} work detail.`);
          }else{
            logoutFunc(err)
          }
          this.handleClose()
        });
       }
     
       workDetailModelOpen=()=>{
        this.setState({
            workDetailModel:true
        })
       }
       workDetailModelClose=()=>{
        this.setState({
            workDetailModel:false
        })
       }

       handleClose=()=>{
        this.setState({
            edit:false,
            workDetailModel:false,
            loading:false,
            loading2:false,
            selectedWorkDetailId:'',
            loadingWorkList:[],
            unLoadingWorkList:[],
            productionWorkList:[],
            otherWorkList:[],
            selectedDate:'',
            dateOfWork:'',
            formData:{},
            totalMilliSec:0
        },()=> this.getAllWorkDetail())
       }

       changeMonthYear=(monthYear)=>{
        const month= monthYear.getMonth()+1
        const year = monthYear.getFullYear() 
          this.setState({
            selectedMonthYear : monthYear,
            selectedMonth: month,
            selectedYear: year
          },()=>this.getDaysInMonth(month, year))
       }

      // convertMilliSecToHrMints=(milliseconds=0)=> {
      //     const seconds = Math.floor(milliseconds / 1000);
      //     const hours = Math.floor(seconds / 3600);
      //     const minutes = Math.floor((seconds % 3600) / 60);
      //     const formattedHours = ("0" + hours).slice(-2); // Ensures a leading zero if needed
      //     const formattedMinutes = ("0" + minutes).slice(-2); // Ensures a leading zero if needed
      //     return formattedHours + ":" + formattedMinutes;
      // }

       calculateTotalTime=()=>{
        const allList = [...this.state.loadingWorkList,...this.state.unLoadingWorkList,...this.state.productionWorkList,...this.state.otherWorkList]
        const totalMilliSec = allList.reduce((acc, curr) => acc + parseInt(curr.rowTime?curr.rowTime:0),0);
        // allList.forEach(data=>{
        //   if(data.rowTime || data.rowTime || data.rowTime || data.rowTime){
        //       const time=   data.rowTime>0?data.rowTime: data.rowTime>0? data.rowTime: data.rowTime>0? data.rowTime: data.rowTime>0? data.rowTime:0
        //       totalMilliSec+= parseInt(time)
        //   }
        // })
        this.setState({
          totalMilliSec: totalMilliSec
          })
       }
      // getDaysInMonth=(year, month) =>{
      //   return new Date(year, month, 0).getDate();
      // }

      getDaysInMonth=(year, month)=>{
        const date = new Date();
        const yy = year || date.getFullYear();
        const mm = month || date.getMonth() + 1; // 👈️ months are 0-based

        const daysCount= new Date(yy, mm, 0).getDate()
        //console.log("daysCount",daysCount)
        this.setState({
          daysInMonth:Array(daysCount).fill('')
        })
       }
       getCellInfo=(dateSelected, workerId, dateOfWork)=>{
        const {allWorkDetail} = this.state
        const mm = this.state.selectedMonth
        const yyyy = this.state.selectedYear

        const selectedDate = new Date();
        selectedDate.setDate(dateSelected);
        selectedDate.setMonth(mm)
        selectedDate.setFullYear(yyyy)
        const selectedWorkDetailFound= allWorkDetail.find(data=> data.dateOfWork ===dateOfWork && data.userId===workerId)
        if(selectedWorkDetailFound){
          this.setState({  
            workDetailModel:true,
            dateOfWork,
            loadingWorkList :selectedWorkDetailFound.loadingWorkList,
            unLoadingWorkList : selectedWorkDetailFound.unLoadingWorkList,
            productionWorkList : selectedWorkDetailFound.productionWorkList,
            otherWorkList : selectedWorkDetailFound.otherWorkList,
            selectedWorkDetailId: selectedWorkDetailFound._id,
            totalMilliSec: selectedWorkDetailFound.totalMilliSec,
             formData:{
              userId: workerId,
            },
            selectedDate,
            edit:true
          })
        }else{
          this.setState({  
            loadingWorkList:[{note:'',startTime:selectedDate,endTime: selectedDate, rowTime:0}],
            unLoadingWorkList:[{note:'',startTime:selectedDate,endTime: selectedDate, rowTime:0}],
            productionWorkList:[{note:'',startTime:selectedDate,endTime: selectedDate, rowTime:0}],
            otherWorkList:[{note:'',startTime:selectedDate,endTime: selectedDate, rowTime:0}],
            workDetailModel:true,
            edit: false,
            dateOfWork,
            selectedWorkDetailId: '',
            totalMilliSec: 0,
            formData:{
              userId: workerId,
            },
            selectedDate
          })
        }
      }
      handleStartTime=(sTime, index, type)=>{
        let getList = this.state[`${type}WorkList`]
        let msec = new Date( getList[index][`endTime`]) - new Date (sTime)
        getList[index][`startTime`]=sTime
        getList[index][`rowTime`]= msec>0?msec:0
        this.setState({
          [`${type}WorkList`]:getList,
        },()=>this.calculateTotalTime())
     
      }
      handleEndTime=(eTime, index,type)=>{
        let getList = this.state[`${type}WorkList`]
        let msec = new Date(eTime) - new Date(getList[index][`startTime`]) 
        getList[index][`endTime`]=eTime
        getList[index][`rowTime`]= msec>0?msec:0
        this.setState({
          [`${type}WorkList`]:getList,
        },
        ()=>this.calculateTotalTime()
        )
     }
     removeRow = (type, index)=> {
    
      let list = this.state[`${type}WorkList`];
      if(list.length>1){
        list.splice(index, 1);
        this.setState({[`${type}WorkList`]: list},
          ()=>this.calculateTotalTime()
        )
      }else{
        toast["error"]('This is required row.');
      }
    }
     addMoreRow=(type)=>{
      const selectedDate = new Date(this.state.selectedDate)
      selectedDate.setMonth(this.state.selectedMonth)
      selectedDate.setFullYear(this.state.selectedYear)
      const newWorkList = [{note:'', startTime:selectedDate, endTime: selectedDate, rowTime:0}]
      const oldList = this.state[`${type}WorkList`]
      const newList = [...oldList, ...newWorkList]
      this.setState({[`${type}WorkList`]:newList})
      
     }
     updateField = (rowIndex, key, type) => e => {
      let data = [...this.state[`${type}WorkList`]];
      data[rowIndex][key] = e.target.value;
      this.setState({ [`${type}WorkList`]:data },
        // ()=>{this.calculateTotalTime()}
        );
    };
  render() {
    const {daysInMonth,formData, selectedMonth, selectedYear} = this.state
    const mm = selectedMonth
    const yyyy = selectedYear
    const todayDate = new Date().getDate();
    const todayMM = new Date().getMonth()+1;
    const todayYear = new Date().getFullYear();
  
    const columns =[
      {
        Header: "Worker Name",
        //accessor: "workerName",
        width: 170,
        Cell: (cell) => {
              return cell.original.userInfo.fullName
        },
        fixed: 'left'
      },
      ...daysInMonth.map((data,index)=>{
        let dateOfWork = new Date(yyyy, mm-1, index+1);
        dateOfWork = dateOfWork.toLocaleDateString()
        //console.log("dateOfWorkdateOfWork", dateOfWork)
          return(
            {
              Header: `${index+1}`,
              //accessor: "unloadingNote",
              width:50,
              Cell: (cell) => <span 
                  style={{cursor:`${(index+1>todayDate && mm===todayMM && yyyy===todayYear)?'':'pointer'}`, color:`${(index+1===todayDate && mm===todayMM && yyyy===todayYear)? 'green': (index+1>todayDate && mm===todayMM && yyyy===todayYear)?'#969696':''}`}} 
                  onClick={(index+1>todayDate && mm===todayMM && yyyy===todayYear)?null:()=>this.getCellInfo(index+1, cell.original.userInfo.userId, dateOfWork)}
                  >
                  {convertMilliSecToHrMints(this.state.allWorkDetail.find(data=> data.dateOfWork===dateOfWork && data.userId ===cell.original.userInfo.userId)?.totalMilliSec)}
                </span>
            }
          )
        })
      ]
    return (
        <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title">All Work Detail</p>
                {/* <p className="card-title2">Total Work Detail Count: {this.state.allWorkDetail.length}</p> */}
                <Row>
                {/* <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-md mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                   onClick={this.workDetailModelOpen}
                  >Add/Edit Work Detail</Button>
                   </Form.Group>
                </Col> */}
                <Col md={4}>
                <Form.Group>
                  <label>Select Month and Year</label>
                  <DatePicker
                    selected={this.state.selectedMonthYear}
                    onChange={(monthYear) => this.changeMonthYear(monthYear)}
                    showMonthYearPicker
                    maxDate={new Date()}
                    dateFormat="MMMM/yyyy"
                  />
                  </Form.Group>
                </Col>
                </Row>
                <ReactTableFixedColumns
                  data={this.state.allWorker}
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
            show={this.state.workDetailModel}
            size={"lg"}
            onHide={this.workDetailModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.state.edit?'Edit':'Add'} Work Detail 
               {
                formData && formData.userId &&
                this.state.allWorker && 
                this.state.allWorker.length>0 && 
                `(${this.state.allWorker.find(data=> data.userInfo.userId===formData.userId).userInfo.fullName})`
                }             
               </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
              <div className="card-body">
                <AvForm 
                ref={c=>(this.form= c)}
                onValidSubmit={this.handleSubmit}
                model={formData}
                >
                     <h4 className="text-dark d-flex justify-content-center">Loading Work Details</h4>
                     {this.state.loadingWorkList.map((loading, index)=>
                      <>
                      <Row>
                      <Col md={4}>
                        <AvField type="text" name={`loading[${index}].note`} label="Loading Note" placeholder="Add loading detail" 
                        value={(loading && loading.note)? loading.note:''}
                        onChange={this.updateField(index, 'note','loading')}  
                        validate={{
                          required: {
                              value: loading.rowTime>0?true:false,
                              errorMessage: 'This field is required.'
                          }
                        }} 
                        />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >Start Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(loading.startTime ? loading.startTime: new Date())}
                          onChange={(startTime) => this.handleStartTime(startTime, index,'loading' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >End Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(loading.endTime? loading.endTime: new Date())}
                          onChange={(endTime) => this.handleEndTime(endTime, index,'loading' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                    <Col md={2}>
                    <AvField name="totalHour" label="Total Hour" placeholder="Add Working Hour"
                        value={convertMilliSecToHrMints(loading.rowTime)}
                        disabled={true}
                   
                    />
                     </Col>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" 
                            onClick={()=>this.removeRow('loading',index)}
                            >
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                     </Row>
                     </>)}
                    
                     <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreRow('loading')}>
                          Add More
                        </button>
                    </div>

                     <h4 className="text-dark d-flex justify-content-center">Unloading Work Details</h4>
                     {this.state.unLoadingWorkList.map((unLoading, index)=>
                      <>
                      <Row>
                      <Col md={4}>
                        <AvField type="text" name={`unLoading[${index}].note`} label="UnLoading Note" placeholder="Add UnLoading detail" 
                        value={(unLoading && unLoading.note)? unLoading.note:''}
                        onChange={this.updateField(index, 'note','unLoading')}  
                        validate={{
                          required: {
                              value: unLoading.rowTime>0?true:false,
                              errorMessage: 'This field is required.'
                          }
                        }} 
                        />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >Start Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(unLoading.startTime ? unLoading.startTime: new Date())}
                          onChange={(startTime) => this.handleStartTime(startTime, index,'unLoading' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >End Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(unLoading.endTime? unLoading.endTime: new Date())}
                          onChange={(endTime) => this.handleEndTime(endTime, index,'unLoading' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                    <Col md={2}>
                    <AvField name="totalHour" label="Total Hour" placeholder="Add Working Hour"
                        value={convertMilliSecToHrMints(unLoading.rowTime)}
                        disabled={true}
                   
                    />
                     </Col>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" 
                            onClick={()=>this.removeRow('unLoading',index)}
                            >
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                     </Row>
                     </>)}
                    
                     <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreRow('unLoading')}>
                          Add More
                        </button>
                    </div>
                     <h4 className="text-dark d-flex justify-content-center">Production Work Details</h4>
                     {this.state.productionWorkList.map((production, index)=>
                      <>
                      <Row>
                      <Col md={4}>
                        <AvField type="text" name={`production[${index}].note`} label="Production Note" placeholder="Add production detail" 
                        value={(production && production.note)?production.note:''}
                        onChange={this.updateField(index, 'note','production')}  
                        validate={{
                          required: {
                              value: production.rowTime>0?true:false,
                              errorMessage: 'This field is required.'
                          }
                        }} 
                        />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >Start Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(production.startTime?production.startTime: new Date() )}
                          onChange={(startTime) => this.handleStartTime(startTime, index,'production' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >End Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(production.endTime? production.endTime: new Date())}
                          onChange={(endTime) => this.handleEndTime(endTime, index,'production' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                    <Col md={2}>
                    <AvField name="totalHour" label="Total Hour" placeholder="Add Working Hour"
                        value={convertMilliSecToHrMints(production.rowTime)}
                        disabled={true}
                   
                    />
                     </Col>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" 
                            onClick={()=>this.removeRow('production',index)}
                            >
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                     </Row>
                     </>)}
                    
                     <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreRow('production')}>
                          Add More
                        </button>
                    </div>
                     <h4 className="text-dark d-flex justify-content-center">Other Work Details</h4>
                     {this.state.otherWorkList.map((other, index)=>
                      <>
                      <Row>
                      <Col md={4}>
                        <AvField type="text" name={`other[${index}].note`} label="other work Note" placeholder="Add other work detail" 
                        value={(other && other.note)?other.note:''}
                        onChange={this.updateField(index, 'note','other')}  
                        validate={{
                          required: {
                              value: other.rowTime>0?true:false,
                              errorMessage: 'This field is required.'
                          }
                        }} 
                        />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >Start Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(other.startTime? other.startTime : new Date())}
                          onChange={(startTime) => this.handleStartTime(startTime, index,'other' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                      <Col md={2}>
                      <div>
                        <label >End Time</label>
                      </div>
                      <DatePicker
                          selected={new Date(other.endTime? other.endTime: new Date())}
                          onChange={(endTime) => this.handleEndTime(endTime, index,'other' )}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={30}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                      />
                      </Col>
                    <Col md={2}>
                    <AvField name="totalHour" label="Total Hour" placeholder="Add Working Hour"
                        value={convertMilliSecToHrMints(other.rowTime)}
                        disabled={true}
                   
                    />
                     </Col>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" 
                            onClick={()=>this.removeRow('other',index)}
                            >
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                     </Row>
                     </>)}
                    
                     <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreRow('other')}>
                          Add More
                        </button>
                    </div>
                     
                     <Row>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button variant="success" className="d-flex justify-content-center mt-3" >{convertMilliSecToHrMints(this.state.totalMilliSec).split(':')[0]} Hr {convertMilliSecToHrMints(this.state.totalMilliSec).split(':')[1]} Mint</Button>
                        </div>
                     </Col>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button variant="dark" className="d-flex justify-content-center mt-3" onClick={this.workDetailModelClose} >Cancel</Button>
                        </div>
                     </Col>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button type="submit" className="d-flex justify-content-center mt-3" >{this.state.edit?'Update':'Submit'}</Button>
                        </div>
                     </Col>
                    </Row>
                  </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal>  
          
          {/* <Modal
            show={this.state.workDetailModel}
            size={"lg"}
            onHide={this.workDetailModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add/Edit Work Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
              <div className="card-body">
                <AvForm 
                ref={c=>(this.form= c)}
                onValidSubmit={this.handleSubmit}
                model={formData}
                >
                    <Row>
                    <Col>
                        <AvField 
                          type='select' name="userId"  label ="Worker Name" placeholder="Choose Worker"
                          value={formData && formData.userId}
                          //onChange={(e)=>this.changeSellSelectOption()}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                          }} 
                        >
                        <option value=''>Choose Worker</option>
                        {this.state.allWorker && this.state.allWorker.length>0 && this.state.allWorker.map((data, index)=> {return (<option key={`${index}_user`} value={data.userInfo.userId} style={{color:"black"}}>{data.userInfo.fullName}</option>)} )}
                        </AvField>  
                      </Col>
                     <Col>
                        <div>
                        <label >Select Date</label>
                        </div>
                        <DatePicker 
                          selected={this.state.startDate} 
                          disabled={true}
                          onChange={(date) => this.setState({startDate:date})}
                          name="date"  
                          dateFormat="dd/MM/yyyy"
                        />
                     </Col>
                    <Col>
                    <AvField name="totalHour" label="Total Hour" placeholder="Add Working Hour"
                        // value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productName}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                      }} 
                    />
                     </Col>
                     </Row>
                     <Row>
                     <Col>
                      <AvField type="textarea" name="note" label="Loading Note" placeholder="Add loading detail"
                          // value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productName}
                      //     validate={{
                      //     required: {
                      //         value: true,
                      //         errorMessage: 'This field is required.'
                      //     }
                      // }} 
                      />
                     </Col>
                     <Col>
                        <AvField type="textarea" name="unloadingNote" label="Unloading Note" placeholder="Add Unloading detail."
                            // value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productName}
                        //     validate={{
                        //     required: {
                        //         value: true,
                        //         errorMessage: 'This field is required.'
                        //     }
                        // }} 
                        />
                     </Col>
                     <Col>
                      <AvField type="textarea" name="note" label="Production Note" placeholder="Add production detail"
                          // value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productName}
                      //     validate={{
                      //     required: {
                      //         value: true,
                      //         errorMessage: 'This field is required.'
                      //     }
                      // }} 
                      />
                     </Col>
                    </Row>
                     <Row>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button variant="dark" className="d-flex justify-content-center mt-3" onClick={this.workDetailModelClose} >Cancel</Button>
                        </div>
                     </Col>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button type="submit" className="d-flex justify-content-center mt-3" >Submit</Button>
                        </div>
                     </Col>
                    </Row>
                  </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal> */}
{/* 
          <Modal
            show={this.state.deleteWorkLogDetailModal}
            // size={"lg"}
            onHide={this.deleteWorkLogDetailModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete WorkLog Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               Are you want sure delete this WorkLog detail?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.deleteWorkLogDetailModelClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.deleteHandle}>Delete</Button>
            </Modal.Footer>
          </Modal> */}
        </div>
    )
  }
}

export default WorkDetail