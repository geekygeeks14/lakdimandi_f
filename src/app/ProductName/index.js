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
import { capitalize, logoutFunc,saveSecurityLogs } from "../util/helper";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl=window.location.href

export class ProductName extends Component {
    constructor(props) {
        super(props);
        this.state = {
          allProductName: [],
          loading:false,
          productNameModel:false,
          loading2:false,
          deleteProductNameModal:false,
          loading3:false,
          selectedCell:{},
          edit:false,
        };
      }

      componentDidMount() {
        this.getAllProductName();
        saveSecurityLogs(menuUrl,"Menu Log")
      }
      async getAllProductName(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllProductName`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allProductName: res.data.productNameData,
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
            toast["error"](err.message? err.message: 'Error while getting all Product Name.');
            saveSecurityLogs(menuUrl,"Error Log",err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl,"Logout",err)
          }
        });
       }

       handleSubmit = async(e, values)=>{
        this.setState({
          loading2:true
        })
        let payload={
          productName: values.productName? capitalize(values.productName.trim()):''
        }
        let url ='admin/createProductName'
        if(this.state.edit){
          url = 'admin/updateProductNameById'
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
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: `Error while ${this.state.edit?'updating':'creating'} product Name.`);
            saveSecurityLogs(menuUrl,"Error Log",err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl,"Logout",err)
          }
          this.handleClose()
        });
       }
     
       productNameModelOpen=()=>{
        this.setState({
            productNameModel:true
        })
       }
       productNameModelClose=()=>{
        this.setState({
            productNameModel:false
        })
       }

       handleClose=()=>{
        this.setState({
            productNameModel:false,
            loading:false,
            loading2:false,
            deleteProductNameModal: false,
            selectedCell:{},
            loading3:false,
            edit:false,
        },()=> this.getAllProductName())
       }
       editToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          edit:true,
          productNameModel:true
        })
       }
       deleteToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          deleteProductNameModal:true
        })
       }
       deleteProductNameModelClose=()=>{
        this.setState({
          deleteProductNameModal:false
        })
       }
  
       deleteHandle = async()=>{
        this.setState({
          loading3:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
         await Axios.delete(SETTING.APP_CONSTANT.API_URL+`admin/deleteProductNameById/`+this.state.selectedCell._id,{headers: options})
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
          toast["error"]("Error while deleting product Name.");
          logoutFunc(err)
          saveSecurityLogs(menuUrl,"Logout",err)
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
        Header: "Product Name",
        accessor: "productName",
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
                <p className="card-title">All Product Name</p>
                <p className="card-title2">Total Product Name Count: {this.state.allProductName.length}</p>
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                  onClick={this.productNameModelOpen}
                  >Add Product Name</Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.allProductName}
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
            show={this.state.productNameModel}
            // size={"sm"}
            onHide={this.productNameModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Product Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleSubmit}>
                    <Row>
                    <Col>
                    <AvField name="productName" label="Add Product Name" placeholder="Add Product Name"
                        value={this.state.edit && this.state.selectedCell && this.state.selectedCell.productName}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        // minLength: {
                        //   value: 2,
                        //   errorMessage: 'This field is required'
                        // },
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
                          <Button variant="dark" className="d-flex justify-content-center mt-3" onClick={this.productNameModelClose} >Cancel</Button>
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
            show={this.state.deleteProductNameModal}
            // size={"lg"}
            onHide={this.deleteProductNameModelClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Product Name Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               Are you want sure delete this product Name detail?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.deleteProductNameModelClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.deleteHandle}>Delete</Button>
            </Modal.Footer>
          </Modal>
        </div>
    )
  }
}

export default ProductName