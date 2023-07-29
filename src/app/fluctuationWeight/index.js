import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Col, Container, Form, FormGroup, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import DatePicker from "react-datepicker";
import { AvField, AvForm } from "availity-reactstrap-validation";
import Select from 'react-select';
import 'react-block-ui/style.css';
import { capitalize, logoutFunc } from "../util/helper";
import { Link } from "react-router-dom/cjs/react-router-dom";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export class FluctuationWeight extends Component {
    constructor(props) {
        super(props);
        this.state={
            loading:false,
            loading2:false,
            data:[],
            weightModal:false,
            edit: false,
            selectedCell:{},
            handleCloseWeightModel:false
        }
      }
      componentDidMount=()=>{
         this.getFluctionWeight()
      }
      getFluctionWeight=async()=>{
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getFluctualWeight`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              data: res.data.data,
            })
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false,
            weightModal:false
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting value");
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
          fluctualateWeightValue: values.fluctualateWeightValue,
        }
        
         let url =`admin/createFluctualWeight`
         if(this.state.edit){
            url= `admin/updateFluctualWeight/`+this.state.selectedCell._id 
         }else{
          payLoad={
            ...payLoad,
            compnayId: USER && USER.userInfo.compnayId,
          }
         }
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url,payLoad,{headers: options})
        .then((res) => {
          this.setState({
            loading:false,
            weightModal:false
          })
          if (res && res.data.success) {
            this.getFluctionWeight()
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false,
            weightModal:false
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while submitting value");
          }else{
            logoutFunc(err)
          }
        });
       }

      WeightModelOpen=()=>{
        this.setState({
            weightModal:true
        })
       }

       handleCloseWeightModel=()=>{
        this.setState({
            weightModal:false
        })
       }
       editToggle=(cell)=>{
        this.setState({
          edit:true,
          weightModal: true,
          selectedCell: cell
        })
       }
     
  render() {
    const formData = this.state.edit? this.state.selectedCell: ''
    
    const columns = [
      {
        Header: "Date/Time",
        accessor: "created",
        Cell: (cell) => {
          return new Date(cell.original.created)
            .toLocaleString("en-GB", {
              hour12: true,
            })
            .toUpperCase();
        },
      },
      {
        Header: "Fluctualation Weight value (%)",
        //accessor: "fluctualateWeightValue",
        Cell: (cell) => {
          return cell.original.fluctualateWeightValue? `${parseFloat(cell.original.fluctualateWeightValue).toFixed(2)}%`:'0.00%'
        },
      },
      {
        Header: "Action",
        //show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
        widhth: 150,
        Cell:cell=>{
          return(
              <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                  {/* <a href="#/" title='delete' id={'delete'}
                    className="mb-2 badge" 
                      onClick={e=>this.deleteToggle(cell.original)}
                    >
                      <i className="mdi mdi-delete mdi-18px"></i>
                  </a> */}
                      <a href="#/" title='Edit' id={'edit'}
                      className="mb-2 badge" 
                        onClick={e=>this.editToggle(cell.original)}
                      >
                        <i className=" mdi mdi-lead-pencil mdi-18px"></i>
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
                <p className="card-title">Fluctuation Weight Report</p>
                <p className="card-title2">Fluctuation Weight value in Percentage</p>
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                    onClick={this.WeightModelOpen}
                  >New Fluctuation Weight</Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.data?this.state.data:[]}
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
            show={this.state.weightModal}
            //size={"lg"}
            onHide={this.handleCloseWeightModel}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title> {this.state.edit?'Edit Fluctuation Weight Value' : 'Fluctuation Weight Value Enter'} </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm 
                onValidSubmit={this.handleSubmit}
                model={formData}
                >
                  <h3 className="text-dark d-flex justify-content-center">Fluctuation weight value in percentage</h3>
                    <Row>
                      <Col>
                          <AvField name="fluctualateWeightValue" label="Fluctuation Weight" placeholder="0.00"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'Required'
                              },
                              pattern: {
                                value:'^[0-9]+(\\.[0-9]{2})?$',
                                errorMessage: `Inavlid percentage`
                              }
                            }} 
                        />
                      </Col>
                    </Row>
                    <Row>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button variant="dark" 
                        onClick={this.handleCloseWeightModel}
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

export default FluctuationWeight

