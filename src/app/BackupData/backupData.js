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
toast.configure();

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));

export default class BackupData extends Component{
    constructor(props) {
        super(props)
        this.state={
            loading:false,
            data:[]
        }
    }

    render(){
        const columns =[
            {
                Header:"Date",
                accessor:"date"
            },
            {
                Header:"Name",
                accessor:"name"
            },
            {
                Header:"Description",
                accessor:"desc"
            },
        ]
        return(
            <div>
            <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
            <div className="row">
              <div className="col-12 grid-margin">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Backup Data Details</p>
                 
                    <ReactTable
                    data={this.state.data?this.state.data:[]}
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
    
            </div>
        )
    }
}