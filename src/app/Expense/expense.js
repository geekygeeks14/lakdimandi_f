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
import { capitalize, logoutFunc } from "../util/helper";
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export class Expense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleData: [],
      modalShow:false,
      loading:false,
    };
    // this.handleSubmit = this.handleSubmit.bind(this)
    // this.openModal = this.openModal.bind(this)
  }

  render() {
    return (
      <div>
    <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title">Assest earning and expense</p>
                <p className="card-title2">Total :</p>
{/*                
                <ReactTable
                // data={this.state.allProductCode}
                className='-striped -highlight'
                // className='-highlight'
                // columns={columns}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={10}
                showPageSizeOptions={false}
                showPageJump={false}
              /> */}
              </div>
            </div>
          </div>
        </div>
        </BlockUi>    
          {/* <Modal
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
          </Modal> */}
        </div>
      </div>
    );
  }
}
export default Expense;