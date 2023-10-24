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
import { logoutFunc, saveSecurityLogs } from "../util/helper";
toast.configure();



const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl = window.location.href

export class ProductCode extends Component {
    constructor(props) {
        super(props);
        this.state = {
          allProductCode: [],
          loading:false,
          productCodeModel:false,
          loading2:false,
          deleteProductCodeModal:false,
          loading3:false,
          selectedCell:{},
          edit:false,
        };
      }

      componentDidMount() {
        this.getAllProductCode();
        saveSecurityLogs(menuUrl,"Menu Log")
      }

      async getAllProductCode(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllProductCode`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allProductCode: res.data.productCodeData,
            })

        saveSecurityLogs(menuUrl,"Event Log")
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting all Product Code.");
            saveSecurityLogs(menuUrl,"Error Log",err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl,"Logout")
          }
        });
       }

       handleSubmit = async(e, values)=>{
        this.setState({
          loading2:true
        })
        let payload={
          productCode: values.productCode,
        }
        let url ='admin/createProductCode'
        if(this.state.edit){
          url = 'admin/updateProductCodeById'
          payload={
            ...payload,
            id: this.state.selectedCell._id
          }
        }else{
          payload={
            ...payload,
            companyId: USER && USER.userInfo.companyId,
          }
        }
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url,payload,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
            saveSecurityLogs(menuUrl,"Create/Add")
          } else {
            toast["error"](res.data.message);
          } 
          this.handleClose()
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: `Error while ${this.state.edit?'updating':'creating'} product code.`);
            saveSecurityLogs(menuUrl,"Error Log",err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl,"Logout")
          }
        });
       }
     
       productCodeModelOpen=()=>{
        this.setState({
            productCodeModel:true
        })
       }
       productCodeModelClose=()=>{
        this.setState({
            productCodeModel:false
        })
       }

       handleClose=()=>{
        this.setState({
            productCodeModel:false,
            loading:false,
            loading2:false,
            deleteProductCodeModal: false,
            selectedCell:{},
            loading3:false,
            edit:false,
        },()=> this.getAllProductCode())
       }
       editToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          edit:true,
          productCodeModel:true
        })
       }
       deleteToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          deleteProductCodeModal:true
        })
       }
       deleteProductCodeModelClose=()=>{
        this.setState({
          deleteProductCodeModal:false
        })
       }
    
       deleteHandle=async()=>{
        this.setState({
          loading3:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
         await Axios.delete(SETTING.APP_CONSTANT.API_URL+`admin/deleteProductCodeById/`+this.state.selectedCell._id,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
            saveSecurityLogs(menuUrl,"Delete")
          } else {
            toast["error"](res.data.message);
          }
          this.handleClose()
        })
        .catch((err) =>{
          this.handleClose()
          toast["error"]("Error while deleting product code.");
          logoutFunc(err)
          saveSecurityLogs(menuUrl,"Error Log",err.message)
        });
       }
     
  render() {
    
    const columns = [
      {
        Header: "Date/Time",
        accessor: "created",
        Cell: (cell) => {
          return  new Date(cell.original.created).toLocaleDateString("en-GB")
        },
      },
      {
        Header: "Product Code",
        accessor: "productCode",
        // Cell: (cell) => {
        //       return  cell.original.buyerDetail &&  cell.original.buyerDetail.buyerName?cell.original.buyerDetail.buyerName:'NA'
        // },
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
                  {/* <a  href="#/" title='Edit' id={'edit'}
                    className="mb-2 badge" 
                      onClick={e=>this.editToggle(cell.original)
                    }>
                      <i className="mdi mdi-lead-pencil mdi-18px"></i>
                  </a> */}
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
                <p className="card-title">All Product Code</p>
                <p className="card-title2">Total Product code Count: {this.state.allProductCode.length}</p>
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                  onClick={this.productCodeModelOpen}
                  >Add Product Code</Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.allProductCode}
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
            show={this.state.productCodeModel}
            // size={"sm"}
            onHide={this.productCodeModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Product Code</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleSubmit}>
                    <Row>
                    <Col>
                    <AvField name="productCode" label="Add Product Code" placeholder="Add Product Code"
                        value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productCode}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        minLength: {
                          value: 2,
                          errorMessage: 'This field is required'
                        },
                        maxLength: {
                          value: 35,
                          errorMessage: 'This field is required'
                        },
                        // pattern: {
                        //   value:  /^[a-zA-Z][a-zA-Z\s]*$/,
                        //   errorMessage: `Invalid Purchase name.`
                        // }
                    }} 
                    />
                     </Col>
                     </Row>
                     <Row>
                     <Col>
                        <div className="d-flex justify-content-center">
                          <Button variant="dark" className="d-flex justify-content-center mt-3" onClick={this.productCodeModelClose} >Cancel</Button>
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
          </Modal>

          <Modal
            show={this.state.deleteProductCodeModal}
            // size={"lg"}
            onHide={this.deleteProductCodeModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Product code Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               Are you want sure delete this product code detail?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.deleteProductCodeModelClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.deleteHandle}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </div>
    )
  }
}

export default ProductCode