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
const menuUrl= window.location.href
export default class CronJobReport extends Component{
    constructor(props) {
        super(props)
        this.state={
            loading:false,
            data:[]
        }
    }
    componentDidMount() {
        this.getAllCronJobs();
        saveSecurityLogs(menuUrl, "Menu Log")
      }

    async getAllCronJobs(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllCronJob`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            toast["success"](res.data.message);
       
            this.setState({
              data: res.data.data,
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
            toast["error"](err.message? err.message: 'Error while getting all cron job data.');
            saveSecurityLogs(menuUrl, "Error Log", err.message)
          }else{
            logoutFunc(err)
            saveSecurityLogs(menuUrl, "Logout")
          }
        });
       }

    render(){
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
                Header:"Cron Time",
                accessor: "scheduleTime",
                width: 90,
              
            },
            {
                Header:"Job",
                accessor:"jobPerform",
                width: 170,
            },
            {
                Header:"Status",
                accessor:"status",
                width: 80,
                Cell: (cell) => {
                    return cell.original.status==='Success'? <span style={{color:"green"}}>Success</span>:cell.original.status==='Fail'?  <span style={{color:"red"}}>Fail</span>:cell.original.status
                  },
            },
            {
                Header:"Detail",
                accessor:"detail"
            },
     
            
        ]
        return(
            <div>
            <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
            <div className="row">
              <div className="col-12 grid-margin">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Cron Jobs Report</p>
                 
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