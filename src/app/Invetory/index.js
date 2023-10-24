import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import 'react-block-ui/style.css';
import { capitalize, logoutFunc,saveSecurityLogs} from "../util/helper";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { AvField, AvForm } from "availity-reactstrap-validation";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const menuUrl= window.location.href
export default class Inventory extends Component{
    constructor(props) {
        super(props)
        this.state={
            loading:false,
            inventoryData:[],
            productNameData:[],
            productCodeData:[]
        }
    }
    componentDidMount() {
        this.getAllInventory();
        saveSecurityLogs(menuUrl, "Menu Log")
      }

    async getAllInventory(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllInventory`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            toast["success"](res.data.message);
       
            this.setState({
              productNameData: res.data.data.productNameData,
              productCodeData: res.data.data.productCodeData,
              inventoryData: res.data.data.inventoryData,
             
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
            toast["error"](err.message? err.message: 'Error while getting all inventory data.');
            saveSecurityLogs(menuUrl, "Error Log", err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl, "Logout")
          }
        });
       }

    render(){
      const {productCodeData, productNameData}= this.state
        const columns =[
            {
                Header:"Date/Time",
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
                Header:"Product Name",
                accessor: "productNameId",
                width: 180,
                Cell: (cell)=>{
                  const foundProductName= productNameData.length>0 && productNameData.find(data=> data._id===cell.original.productNameId)
                  return foundProductName && foundProductName.productName? foundProductName.productName:'N/A'
                }
              
            },
            {
                Header:"Product Code",
                accessor:"productCodeId",
                width: 180,
                Cell: (cell)=>{
                  const foundProductCode= productCodeData.length>0 && productCodeData.find(data=> data._id===cell.original.productCodeId)
                  return foundProductCode && foundProductCode.productCode?  foundProductCode.productCode:'N/A'
                }
            },
            {
              Header:"Length",
              accessor:"length",
              width: 70
            },
            {
              Header:"Breadth",
              accessor:"breadth",
              width: 80
            },
            {
              Header:"Height",
              accessor:"height",
              width: 70
            },
            {
              Header:"Qty",
              accessor:"qty",
              width: 50
            },
        ]
        return(
          <div>
            <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
              <div className="row">
                <div className="col-12 grid-margin">
                  <div className="card">
                    <div className="card-body">
                      <p className="card-title">Inventory Report</p>
                        <ReactTable
                          data={this.state.inventoryData?this.state.inventoryData:[]}
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
            {/* <Modal
              show={this.state.purchaseModal_product}
              size={"lg"}
              onHide={this.handleClosePuchaseModel}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
            <Modal.Header closeButton>
              <Modal.Title>Add new products {this.state.selectedProductCode && `[Product Code: ${this.state.selectedProductCode.productCode}]`}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2} className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleSubmit}>
                    <h3 className="text-dark d-flex justify-content-center p-3">Product Details</h3>
                    {this.state.purchaseProductList.map((data,numIndex)=>
                      <>
                      <Row >
                        <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                          <AvField type='select' name= {`purchaseProduct[${numIndex}].productNameId`} label ="Select Product Name" className="mt-1"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} 
                          >
                          <option value=''>Select Product </option>
                          {this.state.allProductName.length>0 && this.state.allProductName.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                          <option key={'new_create'} value={'new_create'}> New Product Create</option>
                          </AvField>  
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                          <AvField type='select' name= {`purchaseProduct[${numIndex}].productNameId`} label ="Select Product Name" className="mt-1"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} 
                          >
                          <option value=''>Select Product </option>
                          {this.state.allProductName.length>0 && this.state.allProductName.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                          <option key={'new_create'} value={'new_create'}> New Product Create</option>
                          </AvField>  
                      </Col>
                      <Col  style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].qty`}  label ="Qty" placeholder="Qty"
                            type='number'
                           value={data.qty}
                           onChange={this.updateProductField(numIndex,'qty' )}
                           onKeyUp={  e => this.calculateField(e, numIndex) }
                          min={0}
                          max={400}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                        }} 
                        />
                      </Col>
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].length`}  label ="Length" placeholder="00" key={`${numIndex}_length `}
                        value={data.length}
                        onChange={this.updateProductField(numIndex,'length' )}
                          min={0}
                          max={200}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }, 
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid length number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].breadth`}  label ="Breadth" placeholder="00" key={`${numIndex}_breadth`}
                        value={data.breadth}
                        onChange={this.updateProductField(numIndex,'breadth' )}
                          min={0}
                          max={200}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }, 
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid breadth number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].height`}  label ="Height" placeholder="00" key={`${numIndex}_height`}
                        value={data.height}
                        onChange={this.updateProductField(numIndex,'height' )}
                          min={0}
                          max={200}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }, 
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid height number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col  style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].perUnitWeight`}  label ="Per Unit Weight" placeholder="00" key={`${numIndex}_Unit/Weight`}
                        value={data.perUnitWeight}
                        onChange={this.updateProductField(numIndex,'perUnitWeight' )}
                        onKeyUp={  e => this.calculateField(e, numIndex) }
                        min={0}
                        // max={20}
                        validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          },
                          pattern: {
                            value:/^[0-9]+.+$/,
                            errorMessage: `Invalid number.`
                          }
                        }} 
                        />
                      </Col>
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                          <AvField type="text" name={`purchaseProduct[${numIndex}].rowWeight`} label="Total Weight" key={`${numIndex}_rowWeight`}
                              value={data.rowWeight} 
                              disabled={true}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" key={`remove_${numIndex}`}className="btn btn-gradient-danger btn-sm" onClick={()=>this.removeRowProduct(numIndex)}>
                            Remove 
                        </button>
                        </Form.Group>
                      </Col>
                    </Row>
                      </>
                    )}
                      <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={this.addMoreRowPurchaseProduct}>
                          Add More
                        </button>
                    </div>
                    <Row className="mt-3">
                        <div className="col-md-6 d-flex justify-content-end">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6">
                        <Button variant="dark" 
                        onClick={this.handleClosePuchaseModel}
                         >Cancel</Button>
                        </div>
                    </Row>
                  </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal> */}
          </div>
        )
    }
}