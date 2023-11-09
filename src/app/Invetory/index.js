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
import { capitalize, logoutFunc,saveSecurityLogs, unitOption} from "../util/helper";
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
            loading2: false,
            freeSize: false,
            inventoryData:[],
            productNameData:[],
            productCodeData:[],
            productList:[{productNameId:'',productCodeId:'', qty:0, unit:'', length:0, breadth:0, height:0, perUnitWeight:0}]
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

       addNewIventory=()=>{
          this.setState({
             addNewInventoryModal:true
          })
       }
       closeAddInventoryModel=()=>{
        this.setState({
          addNewInventoryModal: false
        })
       }

       updateProductField=(rowIndex,key) => e=>{
        if(e.target.value==='new_create'){
          this.setState({
            productNameModel:true
          })
        }else{
          let data = [...this.state.productList];
          data[rowIndex][key] = e.target.value;
          this.setState({ productList:data });    
        } 
      }
      calculateField = (e, rowIndex) => { 
        let data = [...this.state.productList]; 
        let num1 = !!data[rowIndex].perUnitWeight ? parseFloat(data[rowIndex].perUnitWeight) : 0; 
        let num2 = !!data[rowIndex].qty ? parseFloat(data[rowIndex].qty) : 0;
        let lineTotalWeight= (num1 * num2 ).toFixed(2);  
        data[rowIndex]['rowWeight'] = lineTotalWeight;
        this.setState({ productList:data});
      };
      addMoreProduct=()=>{
        const newRow=[{productNameId:'',productCodeId:'', qty:0, unit:'', length:0, breadth:0, height:0, perUnitWeight:0}]
        this.setState({productList:[...this.state.productList, ...newRow]})
       }
       handleRequiredSize=()=>{
        this.setState({
          freeSize: !this.state.freeSize
        })
       }
      handleSubmit = async(e, values)=>{
        console.log("valuesvalues", values)
        this.setState({
          loading2:true
        })
       const {freeSize}= this.state
        values.invetoryProduct =  values.invetoryProduct.map((data)=> {
          return{
            ...data,
            freeSize: freeSize,
            productCodeId:values.productCodeId,
            companyId: USER && USER.userInfo && USER.userInfo.companyId
          }
        })
        let payload={
          productList: values.invetoryProduct
        }
        console.log("newproductListnewproductList", values.invetoryProduct)
        let url ='admin/addNewInventory'
   
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url, payload,{headers: options})
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
            toast["error"](err.message? err.message: `Error while adding new inventory.`);
            saveSecurityLogs(menuUrl,"Error Log",err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl,"Logout")
          }
          this.handleClose()
        });
       }

       handleClose=()=>{
          this.setState({
            freeSize: false,
            addNewInventoryModal: false,
            productList:[{productNameId:'',productCodeId:'', qty:0, unit:'', length:0, breadth:0, height:0, perUnitWeight:0}],
            loading2: false
          },()=> this.getAllInventory())
       }

    render(){
      const {productCodeData, productNameData, freeSize}= this.state
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
              Header:"Free Size",
              accessor:"freeSize",
              width: 70,
              Cell: (cell)=>{
                return cell.original.freeSize? 'Yes': 'No'
              }
            },
            {
              Header:"Unit",
              accessor:"unit",
              width: 70,
              Cell: (cell)=>{
                return cell.original.unit? cell.original.unit: 'N/A'
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
              Header:"Unit/Weight",
              accessor:"unit",
              width: 70,
              Cell: (cell)=>{
                return cell.original.perUnitWeight? cell.original.perUnitWeight: 'N/A'
              }
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
                      <p className="card-title2">Total Inventory Count: {this.state.inventoryData.length}</p>
                        <Row>
                          <Col md={4}>
                          <Form.Group>
                            <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                            onClick={this.addNewIventory}
                            >Add New Inventory</Button>
                            </Form.Group>
                          </Col>
                        </Row>
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
            <Modal
              show={this.state.addNewInventoryModal}
              size={"lg"}
              onHide={this.closeAddInventoryModel}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
            <Modal.Header closeButton>
              <Modal.Title>Add New Inventory</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2} className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleSubmit}>
                    <h3 className="text-dark d-flex justify-content-center p-3">Product Details</h3>
                    <Form>
                      <Form.Check 
                        type="switch"
                        id='sizeRequired'
                        label={this.state.freeSize===true?'Free Size':'Size Required'}
                        checked={this.state.freeSize}
                        onChange={this.handleRequiredSize}
                      />
                    </Form>
                    <Row>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                            <AvField type='select' name= 'productCodeId' label ="Select Product Code" className="mt-1"
                              validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'This field is required.'
                                }
                            }} 
                            >
                            <option value=''>Select Product Code </option>
                            {this.state.productCodeData.length>0 && this.state.productCodeData.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productCode}</option>)} )}
                            </AvField>  
                      </Col>
                    </Row>
                    {this.state.productList.map((data,numIndex)=>
                      <>
                      <Row >
                        <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                          <AvField type='select' name= {`invetoryProduct[${numIndex}].productNameId`} label ="Select Product Name" className="mt-1"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} 
                          >
                          <option value=''>Select Product </option>
                          {this.state.productNameData.length>0 && this.state.productNameData.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                          </AvField>  
                      </Col>
                      <Col  style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`invetoryProduct[${numIndex}].qty`}  label ="Qty" placeholder="Qty"
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
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <AvField 
                            type="select" name={`invetoryProduct[${numIndex}].unit`} label="Unit" 
                            value={data.unit}
                            onChange={this.updateProductField(numIndex,'unit')}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose unit</option>
                        {unitOption.map((data, ind)=> {return (<option key={ind} style={{color:"black"}}>{data.label}</option>)} )}
                        </AvField>
                      </Col>
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`invetoryProduct[${numIndex}].length`}  label ="Length" placeholder="00" key={`${numIndex}_length `}
                        value={data.length}
                        onChange={this.updateProductField(numIndex,'length' )}
                          min={0}
                          max={200}
                          disabled={freeSize}
                          validate={{
                            required: {
                                value: !freeSize,
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
                        <AvField name= {`invetoryProduct[${numIndex}].breadth`}  label ="Breadth" placeholder="00" key={`${numIndex}_breadth`}
                        value={data.breadth}
                        onChange={this.updateProductField(numIndex,'breadth' )}
                          min={0}
                          max={200}
                          disabled={freeSize}
                          validate={{
                            required: {
                                value: !freeSize,
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
                        <AvField name= {`invetoryProduct[${numIndex}].height`}  label ="Height" placeholder="00" key={`${numIndex}_height`}
                        value={data.height}
                        onChange={this.updateProductField(numIndex,'height' )}
                          min={0}
                          max={200}
                          disabled={freeSize}
                          validate={{
                            required: {
                                value: !freeSize,
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
                        <AvField name= {`invetoryProduct[${numIndex}].perUnitWeight`}  label ="Per Unit Weight" placeholder="00" key={`${numIndex}_Unit/Weight`}
                        value={data.perUnitWeight}
                        onChange={this.updateProductField(numIndex,'perUnitWeight' )}
                        onKeyUp={  e => this.calculateField(e, numIndex) }
                        min={0}
                        disabled={freeSize}
                        // max={20}
                        validate={{
                          required: {
                              value: !freeSize,
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
                          <AvField type="text" name={`invetoryProduct[${numIndex}].rowWeight`} label="Total Weight" key={`${numIndex}_rowWeight`}
                              value={data.rowWeight} 
                              disabled={true}
                              // validate={{
                              // required: {
                              //     value: true,
                              //     errorMessage: 'This field is required.'
                              //   }
                              // }} 
                          />
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
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={this.addMoreProduct}>
                          Add More
                        </button>
                    </div>
                    <Row className="mt-3">
                        <div className="col-md-6 d-flex justify-content-end">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6">
                        <Button variant="dark" 
                        onClick={this.closeAddInventoryModel}
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