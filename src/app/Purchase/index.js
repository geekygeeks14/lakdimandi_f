import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _, { result, values } from "lodash";
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
import { capitalize, convertMilliSecToHrMints, logoutFunc } from "../util/helper";
import { Link } from "react-router-dom/cjs/react-router-dom";
toast.configure();


const paymentOption =[
  {value:'Cash',label:'Cash'},
  {value:'Gpay',label:'Gpay'},
  {value:'Paytm',label:'Paytm'},
  {value:'phonePay',label:'phonePay'},
  {value:'Axis Bank',label:'Axis Bank'},
]

const unitList =[
  {value:'Sqf',label:'Sqf'},
  {value:'Cfs',label:'Cfs'},
  {value:'Pcs',label:'Pcs'},
  {value:'Kg',label:'Kg'},
]
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
export class Purchase extends Component {
    constructor(props) {
        super(props);
        this.state = {
          cmpName:'',
          cmpAdd:'',
          newProductCode:'',
          allPurchase: [],
          productData:[],
          loading:false,
          purchaseModal:false,
          loading2:false,
          deletePurchaseModal: false,
          showProductModal:false,
          selectedCell:{},
          loading3:false,
          purchaseEditModal:false,
          loading4:false,
          totalAmount:0,
          dueAmount:0,
          allWorker:[],
          allReciever:[],
          unLoadingWorkerList:[{workerId:''}],
          loadingWorkerList:[{workerId:''}],
          recieverModel: false,
          allProductCode:[],
          allProductName:[],
          allProductCodeData:[],
          allProductNameData:[],
          paymentList:[{}],
          unLoadingRowTime:0,
          loadingRowTime:0,
          grossWeight:0,
          tareWeight: 0,
          unLoadingDateTime:{date: new Date(),startTime: new Date(),endTime: new Date()},
          loadingDateTime:{date: new Date(),startTime: new Date(),endTime: new Date()},
          purchaseProductList:[{productNameId:'',image:'', qty:0, length:0, breadth:0, height:0, perUnitWeight:0}]
        };
      }

      componentDidMount() {
        this.getAllPurchase();
        this.getAllProductCode()
        this.getAllProductName()
        this.getAllReciever()
        this.getAllWorker()
      }

      async getAllPurchase(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllPurchase`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            // toast["success"](res.data.message);
       
            this.setState({
              allPurchase: res.data.purchaseData,
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
            toast["error"](err.message? err.message: 'Error while getting all purchase data.');
          }else{
            logoutFunc(err)
          }
        });
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
              allProductCodeData: res.data.allProductCodeData
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
            toast["error"](err.message? err.message: 'Error while getting all Product Code.');
          }else{
            logoutFunc(err)
          }
        });
       }
       async getAllProductName(){
        this.setState({
          loading2:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getAllProductName`,{headers: options})
        .then((res) => {
          this.setState({
            loading2:false,
          })
          if (res && res.data.success) {
            this.setState({
              allProductName: res.data.productNameData,
              allProductNameData: res.data.allProductNameData
            })
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading2:false,
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: 'Error while getting all Product Name.');
          }else{
            logoutFunc(err)
          }
        });
       }

       async getAllReciever(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getReciver`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allReciever: res.data.data,
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
            toast["error"](err.message? err.message: 'Error while getting all reciever list');
          }else{
            logoutFunc(err)
          }
        });
       }
       getAllWorker = async()=>{
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
            loading:false,
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while getting worker");
          }else{
            logoutFunc(err)
          }
        });
      }


        addNewReciever=async(e, values)=>{
        this.setState({
          loading:true
        })

        const sendToData={
          recieverName: values.recieverName,
          phoneNumber: values.phoneNumber,
          companyId: USER && USER.userInfo && USER.userInfo.companyId? USER.userInfo.companyId: ''
        }
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/addReciever`,sendToData,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              recieverModel: false,
            },()=>  this.getAllReciever())
          } else {
            toast["error"](res.data.message);
          } 
        })
        .catch((err) =>{
          this.setState({
            loading:false
          })
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: 'Error while adding reciever');
          }else{
            logoutFunc(err)
          }
        });
       }

       submitNewProductName = async(e, values)=>{
        this.setState({
          loading2:true
        })
        let payload={
          productName: values.productName? capitalize(values.productName.trim()):'',
          companyId: USER && USER.userInfo.companyId,
        }
        let url ='admin/createProductName'
        
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+url,payload,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            this.setState({
               productNameModel: false
            },()=> this.getAllProductName())
            //toast["success"](res.data.message);
          } else {
            toast["error"](res.data.message);
          } 
          
        })
        .catch((err) =>{
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: `Error while ${this.state.edit?'updating':'creating'} product Name.`);
          }else{
            logoutFunc(err)
          }
        });
       }

        handleSubmit = async(e, values)=>{

          // this.setState({
          //   loading2:true
          // })
          const companyId= (USER && USER.userInfo.companyId)?USER.userInfo.companyId:USER._id
          const unLoadingWorkDetail={
            unLoadingWorker: values.unLoadingWorker,
            startTime: this.state.unLoadingDateTime.startTime,
            endTime: this.state.unLoadingDateTime.endTime,
            parentUserId: USER && USER.userInfo.userId,
            note: 'Unloading',
            truck:true,
            rowTime: new Date(this.state.unLoadingDateTime.endTime) - new Date(this.state.unLoadingDateTime.startTime),
            dateOfWork : this.state.unLoadingDateTime.date.toLocaleDateString()
          }
          const loadingWorkDetail={
            loadingWorker: values.loadingWorker,
            startTime: this.state.loadingDateTime.startTime,
            endTime: this.state.loadingDateTime.endTime,
            parentUserId: USER && USER.userInfo.userId,
            note: 'Loading',
            truck:true,
            rowTime: new Date(this.state.loadingDateTime.endTime) - new Date(this.state.loadingDateTime.startTime),
            dateOfWork : this.state.loadingDateTime.date.toLocaleDateString()
          }
          const purchaseBasicInfo={
            companyName: values.companyName,
            companyAdress: values.companyAdress,
            vehicleNumber: values.vehicleNumber,
            kantaName: values.kantaName,
            kantaNo :values.kantaNo,
            grossWeight: values.grossWeight,
            tareWeight: values.tareWeight,
            netWeight: values.netWeight,
            recieverId: values.recieverId,
            materialName: values.materialName,
            frontImage:'',
            backImage:'',
            leftImage:'',
            rightImage:'',
          }
          const purchaseProduct=values.purchaseProduct.map(data=> {
            return{
              ...data,
              productCode:values.productCode,
              image: ''
            }
          })
        
          const payload={
            unLoadingWorkDetail: unLoadingWorkDetail,
            loadingWorkDetail: loadingWorkDetail,
            purchaseBasicInfo: purchaseBasicInfo,
            purchaseProduct: purchaseProduct,
            totalWeight:values.totalWeight,
            actualWeght: values.actualWeght,
            insertedBy : USER && USER._id,
            companyId: companyId,
            date: this.state.unLoadingDateTime.date,
            productCode : values.productCode
          }
  
          let options = SETTING.HEADER_PARAMETERS;
          options['Authorization'] = localStorage.getItem("token")
          await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/submitPurchaseData`,payload,{headers: options})
          .then((res) => {
            if (res && res.data.success) {
              toast["success"](res.data.message);
              this.setState({
                allSell: res.data.data,
              })
             
            } else {
              toast["error"](res.data.message);
            } 
            //this.handleClose()
          })
          .catch((err) =>{
            //this.handleClose()
            if(err && err.success===false  ){
              toast["error"](err.message? err.message: 'Error while getting all Sell data.');
            }else{
              logoutFunc(err)
            }
          });
      }

      addMoreRow=()=>{
        const newRow=[{productNameId:'',image:'', qty:0, length:0, breadth:0, height:0, perUnitWeight:0}]

        this.setState({purchaseProductList:[...this.state.purchaseProductList,...newRow]})
       }
       
       purchaseModelOpen=()=>{
        this.setState({
            purchaseModal:true
        })
       }
       handleClose=()=>{
        this.setState({
            purchaseModal:false,
            loading:false,
            loading2:false,
            deletePurchaseModal:false,
            showProductModal:false,
            selectedCell:{},
            loading3:false,
            loading4:false,
            totalAmount:0,
            dueAmount:0,
            purchaseEditModal:false,
            unLoadingWorkerList:[{workerId:''}],
            loadingWorkerList:[{workerId:''}],
            paymentList:[{}],
            purchaseProductList:[{productNameId:'',image:'', qty:0, length:0, breadth:0, height:0, perUnitWeight:0}]
        },()=> this.getAllPurchase())
       }

       handleCloseDeleteModel=()=>{
          this.setState({
            deletePurchaseModal:false,
            selectedCell:{},
          })
       }
       handleCloseEditModel=()=>{
        this.setState({
          purchaseEditModal:false,
          selectedCell:{},
        })
       }

       handleClosePuchaseModel=()=>{
        this.setState({
          purchaseModal:false,
          loading:false,
          loading2:false,
          deletePurchaseModal:false,
          showProductModal:false,
          selectedCell:{},
          loading3:false,
          loading4:false,
          totalAmount:0,
          dueAmount:0,
          purchaseEditModal:false,
          unLoadingWorkerList:[{workerId:''}],
          loadingWorkerList:[{workerId:''}],
          paymentList:[{}],
          purchaseProductList:[{productNameId:'',image:'', qty:0, length:0, breadth:0, height:0, perUnitWeight:0}]
        })
       }

       deleteToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          deletePurchaseModal:true
        })
       }

       editToggle=(cell)=>{
        this.setState({
          selectedCell: cell,
          purchaseEditModal:true
        })
       }
       deleteHandle=async()=>{
        this.setState({
          loading3:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
         await Axios.delete(SETTING.APP_CONSTANT.API_URL+`admin/deletePurchaseData/`+this.state.selectedCell._id,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            // toast["success"](res.data.message);
           
          } else {
            toast["error"](res.data.message);
          }
          this.handleClose()
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: 'Error while deleting purchase data.');
          }else{
            logoutFunc(err)
          }
        });
       }

       ShowProduct=(cell)=>{
        this.setState({
          showProductModal:true,
          selectedCell: cell
        })
      }
      showProductClose =(cell)=>{
        this.setState({
          showProductModal:false,
          selectedCell:cell
        })
      }
      addMorePayment=()=>{
        this.setState({
          paymentList:[...this.state.paymentList,{}],
        })
      }
      calculateTotalWeight = () => {
        let totalWeight =0;
        this.state.purchaseProductList.forEach((it)=>{
            if(!!it.rowWeight && parseFloat (it.rowWeight) > 0){
              totalWeight += parseFloat(it.rowWeight);
            }
        });
        this.setState({ totalWeight:totalWeight.toFixed(2) })
      };

      calculateField = (e, rowIndex) => { 
        let data = [...this.state.purchaseProductList]; 
        let num1 = !!data[rowIndex].perUnitWeight ? parseFloat(data[rowIndex].perUnitWeight) : 0; 
        let num2 = !!data[rowIndex].qty ? parseFloat(data[rowIndex].qty) : 0;
        let lineTotalWeight= (num1 * num2 ).toFixed(2);  
        data[rowIndex]['rowWeight'] = lineTotalWeight;
        this.setState({ purchaseProductList:data}, 
          ()=>{this.calculateTotalWeight()}
          );
      };

      onChangeReciever=(e)=>{
         if(e.target.value ==='create_new'){
            this.setState({
              recieverModel: true
            })
         }
      }
      handleCloseRecieverModel=()=>{
        this.setState({
          recieverModel: false
        })
      }
      updateWorkerField=(rowIndex, workType) => e=>{
        let data = [...this.state[`${workType}WorkerList`]];
        data[rowIndex]['workerId'] = e.target.value;
        this.setState({ [`${workType}WorkerList`]:data },
          // ()=>{this.calculatePaymentAmount()}
          );        

      }
      addMoreWoker=(workType)=>{
        const newRow=[{workerId:''}]
        this.setState({[`${workType}WorkerList`]:[...this.state[`${workType}WorkerList`], ...newRow]})
       }
      removeRow = (index, workType)=> {
        let workerList = this.state[`${workType}WorkerList`]
        if(workerList.length>1){
          workerList.splice(index, 1);
          this.setState({
            [`${workType}WorkerList`]: workerList
          })
        }else{
          toast["error"]('This is required row.');
        }
      }
      addMoreRowPurchaseProduct=()=>{
        const newRow=[{productNameId:'',image:'', qty:0, length:0, breadth:0, height:0, perUnitWeight:0}]
        this.setState({purchaseProductList:[...this.state.purchaseProductList, ...newRow]})
       }
      updateProductField=(rowIndex,key) => e=>{
        if(e.target.value==='new_create'){
          this.setState({
            productNameModel:true
          })
        }else{
          let data = [...this.state.purchaseProductList];
          data[rowIndex][key] = e.target.value;
          this.setState({ purchaseProductList:data });    
        }
           
      }
      removeRowProduct = (index)=> {
        let purchaseProductList = this.state.purchaseProductList
        if(purchaseProductList.length>1){
          purchaseProductList.splice(index, 1);
          this.setState({purchaseProductList})
        }else{
          toast["error"]('This is required row.');
        }
      }

      productNameModelClose=()=>{
        this.setState({
          productNameModel:false
        })
      }
      handleDate=(timeDate, action, workType)=>{
        let workDateTime = this.state[`${workType}DateTime`]
        if(action==='date'){
          workDateTime.date = timeDate
          this.setState({
            [`${workType}DateTime`]: workDateTime
          })
        }
        if(action==='startTime'){
          workDateTime.startTime = timeDate
          this.setState({
            [`${workType}DateTime`]: workDateTime
          },()=>this.calculateRowTime(workType))
        }
        if(action==='endTime'){
          workDateTime.endTime = timeDate
          this.setState({
            [`${workType}DateTime`]: workDateTime
          },()=>this.calculateRowTime(workType))
        }
      }
      calculateRowTime=(workType)=>{
      let  workDateTime = this.state[`${workType}DateTime`]
            if(workDateTime.startTime && workDateTime.endTime && workDateTime.endTime>workDateTime.startTime ){
                this.setState({
                  [`${workType}RowTime`]: new Date (workDateTime.endTime)- new Date(workDateTime.startTime)
                })
            }else{
              this.setState({
                [`${workType}RowTime`]: 0
              })
            }
      }
      onChangeCmpName=(e)=>{
        this.setState({
          cmpName: e.target.value
        },()=>this.uniqueProductCodeGen())
      }
      onChangeCmpAdd=(e)=>{
        this.setState({
          cmpAdd: e.target.value
        },()=> this.uniqueProductCodeGen())
      }

      generateRandomName=(strings, fixedLength) =>{
        // Convert the input strings into an array
        const stringArray = strings.split(' ');
      
        // Calculate the available length for each part (prefix, middle, suffix)
        const availableLength = fixedLength / 3;
      
        // Generate a random prefix, middle part, and suffix from the input strings
        const prefix = this.getRandomPart(stringArray, availableLength);
        const suffix = this.getRandomPart(stringArray, availableLength);
        const middlePartLength = fixedLength - prefix.length - suffix.length;
        const middlePart = this.getRandomPart(stringArray, middlePartLength);
      
        // Concatenate the prefix, middle part, and suffix to form the final name
        const randomName = prefix + middlePart + suffix;
      
        // Truncate or pad the name to fit the fixed length
        if (randomName.length > fixedLength) {
          return randomName.slice(0, fixedLength);
        } else if (randomName.length < fixedLength) {
          const padding = 'X'.repeat(fixedLength - randomName.length);
          return randomName + padding;
        }
      
        return randomName;
      }
      
       getRandomPart=(partsArray, length)=> {
        let randomPart = '';
        while (randomPart.length < length) {
          randomPart += partsArray[Math.floor(Math.random() * partsArray.length)];
        }
      
        // Truncate or pad the part to fit the available length
        randomPart = randomPart.slice(0, length);
        return randomPart;
      }

      uniqueProductCodeGen =()=>{

        const cmpAdd=  this.state.cmpAdd
        const cmpName=  this.state.cmpName
        const inputStrings = cmpAdd+' '+ cmpName;
        const fixedLength = 12;
        let randomName1 =''
        let randomName2 =''
        if(cmpName.length>0){
           randomName1 = this.generateRandomName(inputStrings, fixedLength);
        }
        // if(cmpName.length>0){
        //    randomName2 = this.generateRandomName(inputStrings, fixedLength)
        // }
   
      const randomName= (randomName1+ randomName2).toUpperCase()
        this.setState({
          newProductCode:randomName
        })
      }


      
      // Example usage:
     




  render() {
    const {selectedCell, unLoadingDateTime, loadingDateTime}= this.state
    const productColumn =[
      {
        Header: "Product Name",
        accessor: "productName",
        Cell: (cell) => {
          if(cell.original.productNameId){
            const productNameFound= this.state.allProductNameData.find(data=>data._id === cell.original.productNameId)
            return productNameFound && productNameFound.productName ? productNameFound.productName:'N/A'
          }else{
            return  'N/A'
          }
        }
      },
      {
        Header: "No of Units",
        accessor: "No of Units",
        Cell: (cell) => {
          return cell.original.qty ? cell.original.qty:'N/A'
        }
      },
      {
        Header: "Length",
        accessor: "length",
        Cell: (cell) => {
          return cell.original.length ? cell.original.length:'N/A'
        }
      },
      {
        Header: "Breadth",
        accessor: "breadth",
        Cell: (cell) => {
          return cell.original.breadth ? cell.original.breadth:'N/A'
        }
      },
      {
        Header: "Height",
        accessor: "height",
        Cell: (cell) => {
          return cell.original.height ? cell.original.height:'N/A'
        }
      },
      {
        Header: "Weight",
        accessor: "weight",
        Cell: (cell) => {
          return cell.original.weight ? cell.original.weight:'N/A'
        }
      },
      {
        Header: "Rate",
        accessor: "rate",
        Cell: (cell) => {
          return cell.original.rate ? cell.original.rate:'N/A'
        }
      },
      {
        Header: "Unit",
        accessor: "unit",
        Cell: (cell) => {
          return cell.original.unit ? cell.original.unit:'N/A'
        }
      },
    ]
    
    const columns = [
        {
          Header: "Date/Time",
          accessor: "created",
          width: 155,
          // Cell: (cell) => {
          //   return  new Date(cell.original.created).toLocaleDateString("en-GB")
          // },
          Cell: (cell) => {
            return new Date(cell.original.created)
              .toLocaleString("en-GB", {
                hour12: true,
              })
              .toUpperCase();
          },
        },
        {
          Header: "Company Name",
          accessor: "companyName",
          Cell: (cell) => {
            return  cell.original.purchaseBasicInfo &&  cell.original.purchaseBasicInfo.companyName?cell.original.purchaseBasicInfo.companyName:'NA'
          },
        },
        {
          Header: "Net Weight",
          accessor: "netWeight",
          Cell: (cell) => {
            return  cell.original.purchaseBasicInfo &&  cell.original.purchaseBasicInfo.netWeight?cell.original.purchaseBasicInfo.netWeight:'NA'
          },
        },
        {
          Header: "Product Name",
          accessor: "productName",
          Cell: (cell) => {
            return  (
              <Link to="#" onClick={()=>this.ShowProduct(cell.original)}>Product Detail</Link>
            )}
        },
        // {
        //   Header: "vehicle Number",
        //   accessor: "vehicleNumber",
        //   Cell: (cell) => {
        //     return cell.original.vehicleInfo &&  cell.original.vehicleInfo.length>0? cell.original.vehicleInfo[0].vehicleNumber:'N/A'
        //   }
        // },
        // {
        //   Header: "Total Amount",
        //   accessor: "amount",
        //   Cell: (cell) => {
        //     return  cell.original.totalAmount? cell.original.totalAmount:'0.00'
        //   }
        // },
        // {
        //   Header: "Mode Payment",
        //   accessor: "payInfo",
        //   Cell: (cell) => {
        //     return cell.original.payInfo && cell.original.payInfo.length>0?cell.original.payInfo[0].payMode:'N/A'
        //   }
        // },
        {
          Header: "Action",
          // show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:true,
          width: 150,
          Cell:cell=>{
            return(
  
                <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
               
                    <a href="#/" title='Delete' id={'delete'}
                      className="mb-2 badge" 
                        onClick={e=>this.deleteToggle(cell.original)
                      }>
                        <i className=" mdi mdi-delete mdi-18px"></i>
                    </a>
                    {/* <a title='Edit' id={'edit'}
                      className="mb-2 badge" 
                        onClick={e=>this.editToggle(cell.original)
                      }>
                        <i className=" mdi mdi-lead-pencil mdi-18px"></i>
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
                <p className="card-title">All Purchase</p>
                <p className="card-title2">Total Purchase Count: {this.state.allPurchase.length}</p>
                <Row>
                <Col md={4}>
                <Form.Group>
                  <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"200"}}
                  onClick={this.purchaseModelOpen}
                  >New Purchase Entry </Button>
                   </Form.Group>
                </Col>
                </Row>
                <ReactTable
                data={this.state.allPurchase}
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
            show={this.state.purchaseModal}
            size={"lg"}
            onHide={this.handleClosePuchaseModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Purchase Details Enter</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleSubmit}>
                <h3 className="text-dark d-flex justify-content-center">Purchase Details</h3>
                    <Row>
                          <Col md={6}>
                          <AvField name="companyName" label="Company Name" placeholder="Company Name"
                            onChange={ this.onChangeCmpName}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                              // maxLength: {
                              //   value: 10,
                              //   errorMessage: 'Invalid phone number'
                              // },
                              // minLength: {
                              //   value: 10,
                              //   errorMessage: 'Invalid phone number'
                              // },
                              // pattern: {
                              //   value:/^[0-9]+$/,
                              //   errorMessage: `Invalid phone number.`
                              // }
                            }} 
                        />
                    </Col>
                    <Col md={6}>
                    <AvField name="companyAdress" label="Company Adress" placeholder="Company Adress"
                        onChange={ this.onChangeCmpAdd}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        // minLength: {
                        //   value: 4,
                        //   errorMessage: 'Invalid Purchase name.'
                        // },
                        // maxLength: {
                        //   value: 35,
                        //   errorMessage: 'Invalid Purchase name.'
                        // },
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
                      <AvField name="vehicleNumber" label="Vehicle Number" placeholder="Vehicle Number" 
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                          }
                        }} 
                      />
                     </Col>
                     <Col>
                      <AvField name="kantaName" label="Kanta Name" placeholder="Kanta Name" 
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                          }
                        }} 
                      />
                     </Col>
                     <Col>
                      <AvField name="kantaNo" label="Kanta Number" placeholder="DHR3123" 
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          }
                      }} />
                     </Col>
                     </Row>
                     <Row>
                     <Col>
                      <AvField name="grossWeight" label="Gross Weight(Kg)" placeholder="Weight" 
                        onChange={(e)=>
                          //console.log("eeee", e.target.value)
                          this.setState({
                          grossWeight: e.target.value
                        })
                      }
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          }
                      }} />
                     </Col>
                     <Col>
                      <AvField name="tareWeight" label="Tare Weight(Kg)" placeholder="Weight"
                        onChange={(e)=>this.setState({
                          tareWeight: e.target.value
                        })} 
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          }
                      }} />
                     </Col>
                     <Col>
                      <AvField name="netWeight" label="Net Weight(Kg)" placeholder="Weight"
                          value={parseFloat(this.state.grossWeight)- parseFloat(this.state.tareWeight)} 
                          disabled={true}
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          }
                      }} />
                     </Col>
                     </Row>
                     <Row>
                     <Col>
                      <AvField name="materialName" label="Material Name" placeholder="Material Name" 
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                          }
                        }} 
                      />
                     </Col>
                     <Col>
                      <AvField name="recieverId"  type='select' label="Reciever Name" placeholder="Reciever Name"
                        onChange={this.onChangeReciever} 
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                          }
                        }} 
                      >
                        <option value='' key='recieverKey'>select Reciever </option>
                        {this.state.allReciever.map((data, index)=> <option value={data._id} key ={`${index}_reciever`}>{data.recieverName}</option>)}
                        <option value='create_new'key={'create_new'}>New Reciever </option>
                      </AvField>
                     </Col>
                     </Row>
                     <Row>
                        <Col md={3}>
                          <div>
                            <label >Loading Date</label>
                          </div>
                          <DatePicker
                              selected={new Date(loadingDateTime.date)}
                              onChange={(date) => this.handleDate(date, 'date', 'loading')}
                              //showTimeSelect
                              //showTimeSelectOnly
                              //timeIntervals={30}
                              //timeCaption="Time"
                              dateFormat="dd/MM/yyyy"
                          />
                        </Col>
                        <Col md={3}>
                          <div>
                            <label >Start Time</label>
                          </div>
                          <DatePicker
                              selected={new Date(loadingDateTime.startTime)}
                              onChange={(startTime) => this.handleDate(startTime, 'startTime', 'loading')}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                          />
                        </Col>
                        <Col md={3}>
                          <div>
                            <label >End Time</label>
                          </div>
                          <DatePicker
                              selected={new Date(loadingDateTime.endTime)}
                              onChange={(endTime) => this.handleDate(endTime, 'endTime','loading')}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                          />
                        </Col>
                        <Col md={3}>
                        <AvField name="unloadTime"  label ="Load Time" placeholder="00:00"
                            disabled={true}
                            value={convertMilliSecToHrMints(this.state.loadingRowTime)}
                        />
                        </Col>
                     </Row>
                     {this.state.loadingWorkerList.map((data, indexNum)=>
                        <Row>
                        <Col md={4}>
                         <AvField name={`loadingWorker[${indexNum}].userId`} type='select' label="Unloaded By" placeholder="Unloaded By"  key={`${indexNum}workerId`}
                           value={data.workerId}
                           onChange={ this.updateWorkerField(indexNum, 'loading') }
                           validate={{
                           required: {
                               value: true,
                               errorMessage: 'This field is required.'
                             }
                           }} 
                         >
                           <option value='' key='workerKey'>Select Worker</option>
                           {this.state.allWorker.map((data, index)=> <option value={data.userInfo && data.userInfo.userId} key={`${index}_workerkey`}>{data.userInfo && data.userInfo.fullName}</option>)}
                           </AvField>
                        </Col>
                        <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" key={`${indexNum}_remove`}className="btn btn-gradient-danger btn-sm" onClick={()=>this.removeRow(indexNum, 'loading')}>
                            Remove 
                        </button>
                        </Form.Group>
                      </Col>
                       </Row>
                     )}
                      <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreWoker('loading')}>
                          Add More worker for loading
                        </button>
                    </div>
                     <Row>
                        <Col md={3}>
                          <div>
                            <label >Unloading Date</label>
                          </div>
                          <DatePicker
                              selected={new Date(unLoadingDateTime.date)}
                              onChange={(date) => this.handleDate(date, 'date', 'unLoading')}
                              //showTimeSelect
                              //showTimeSelectOnly
                              //timeIntervals={30}
                              //timeCaption="Time"
                              dateFormat="dd/MM/yyyy"
                          />
                        </Col>
                        <Col md={3}>
                          <div>
                            <label >Start Time</label>
                          </div>
                          <DatePicker
                              selected={new Date(unLoadingDateTime.startTime)}
                              onChange={(startTime) => this.handleDate(startTime, 'startTime', 'unLoading')}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                          />
                        </Col>
                        <Col md={3}>
                          <div>
                            <label >End Time</label>
                          </div>
                          <DatePicker
                              selected={new Date(unLoadingDateTime.endTime)}
                              onChange={(endTime) => this.handleDate(endTime, 'endTime','unLoading')}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={30}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                          />
                        </Col>
                        <Col md={3}>
                        <AvField name="unloadTime"  label ="Unload Time" placeholder="00:00"
                            disabled={true}
                            value={convertMilliSecToHrMints(this.state.unLoadingRowTime)}
                        />
                        </Col>
                     </Row>
                     {this.state.unLoadingWorkerList.map((data, indexNum)=>
                        <Row>
                        <Col md={4}>
                         <AvField name={`unLoadingWorker[${indexNum}].userId`} type='select' label="Unloaded By" placeholder="Unloaded By"  key={`${indexNum}workerId`}
                           value={data.workerId}
                           onChange={ this.updateWorkerField(indexNum, 'unLoading') }
                           validate={{
                           required: {
                               value: true,
                               errorMessage: 'This field is required.'
                             }
                           }} 
                         >
                           <option value='' key='workerKey'>Select Worker</option>
                           {this.state.allWorker.map((data, index)=> <option value={data.userInfo && data.userInfo.userId} key={`${index}_workerkey`}>{data.userInfo && data.userInfo.fullName}</option>)}
                           </AvField>
                        </Col>
                        <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" key={`${indexNum}_remove`}className="btn btn-gradient-danger btn-sm" onClick={()=>this.removeRow(indexNum, 'unLoading')}>
                            Remove 
                        </button>
                        </Form.Group>
                      </Col>
                       </Row>
                     )}
                      <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={()=>this.addMoreWoker('unLoading')}>
                          Add More worker for unloading
                        </button>
                    </div>


                   
                    <Row>
                      <Col>
                           <label>Front Image </label>
                           <input
                             type="file"
                             className="form-control"
                             multiple
                             name="file"
                             onChange={this.handleInputChange}
                             required
                           />
                     </Col>
                     <Col>
                      <label>Back Image </label>
                             <input
                               type="file"
                               className="form-control"
                               multiple
                               name="file"
                               onChange={this.handleInputChange}
                               required
                             />
                     </Col>
                    </Row>
                    <h3 className="text-dark d-flex justify-content-center">Product Details</h3>
                    <Col>
                      <AvField name="productCode" label="Product Code" placeholder="Product Code" 
                        value={this.state.newProductCode}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                          }
                        }} 
                      />
                     </Col>
                    {this.state.purchaseProductList.map((data,numIndex)=>
                      <>
                      <Row >
                        <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField type='select' name= {`purchaseProduct[${numIndex}].productNameId`}
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
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                      <label>Select Image </label>
                          <input
                            type="file"
                            className="form-control"
                            multiple
                            name="file"
                            onChange={this.handleInputChange}
                            required
                          />
                     </Col>
                      {/* <Col style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField name={`purchaseProduct[${index}].productImage`}  label ="Product Image" placeholder="Product Image"
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            // pattern: {
                            //   value:/^[0-9]+.+$/,
                            //   errorMessage: `Invalid Unit number.`
                            // }
                        }} 
                        />
                      </Col> */}
                      <Col  style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].qty`}  label ="Qty" placeholder="Qty"
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
                            // pattern: {
                            //   value:/^[0-9]+.+$/,
                            //   errorMessage: `Invalid length number.`
                            // }
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
                      <Col style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField name= {`purchaseProduct[${numIndex}].perUnitWeight`}  label ="Unit/Weight" placeholder="00" key={`${numIndex}_Unit/Weight`}
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
                    <Row>
                      <Col md={3}>
                        <AvField name="totalWeight"  label ="Total Weight" placeholder="Total Weight"
                        value={this.state.totalWeight}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid Weight number.`
                            }
                        }} 
                        />
                      </Col>
                       
                      <Col md={3}>
                        <AvField name="short"  label ="Short" placeholder="short"
                        />
                      </Col>
                      <Col md={3}>
                        <AvField name="Actual"  label ="Actual" placeholder="Actual"
                         value={this.state.totalWeight}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid Amount number.`
                            }
                        }} 
                        />
                      </Col>
                  
                    </Row>
                    <Row>
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
          </Modal>
          <Modal
            show={this.state.purchaseEditModal}
            size={"lg"}
            onHide={this.handleCloseEditModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Purchase Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading4}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.handleEditSubmit}>
                <h3 className="text-dark d-flex justify-content-center">Purchase Details</h3>
                    <Row>
                          <Col md={3}>
                          <AvField name="phoneNumber1" label="Phone Number" placeholder="Phone Number"
                            value={selectedCell && selectedCell.sellerDetail && selectedCell.sellerDetail.phoneNumber1?selectedCell.sellerDetail.phoneNumber1:''}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                              maxLength: {
                                value: 10,
                                errorMessage: 'Invalid phone number'
                              },
                              minLength: {
                                value: 10,
                                errorMessage: 'Invalid phone number'
                              },
                              pattern: {
                                value:/^[0-9]+$/,
                                errorMessage: `Invalid phone number.`
                              }
                            }} 
                        />
                    </Col>
                    <Col md={3}>
                    <AvField name="sellerName" label="Seller Name" placeholder="Seller Name"
                      value={selectedCell && selectedCell.sellerDetail && selectedCell.sellerDetail.sellerName?selectedCell.sellerDetail.sellerName:''}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        minLength: {
                          value: 4,
                          errorMessage: 'Invalid Purchase name.'
                        },
                        maxLength: {
                          value: 35,
                          errorMessage: 'Invalid Purchase name.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z\s]*$/,
                          errorMessage: `Invalid Purchase name.`
                        }
                    }} 
                    />
                     </Col>
                    <Col md={3}>
                    <AvField name="companyName" label="Company Name" placeholder="Company Name" 
                      value={selectedCell && selectedCell.sellerDetail && selectedCell.sellerDetail.companyName?selectedCell.sellerDetail.companyName:''}

                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                    }} />
                     </Col>
                     <Col md={3}>
                     <AvField name="address" label="Address" placeholder="Address" 
                      value={selectedCell && selectedCell.sellerDetail && selectedCell.sellerDetail.address?selectedCell.sellerDetail.address:''}

                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                    }} />
                     </Col>
                    </Row>

                    <h3 className="text-dark d-flex justify-content-center">Product Details</h3>
                    {selectedCell && selectedCell.purchaseInfo && selectedCell.purchaseInfo.length>0 && selectedCell.purchaseInfo.map((purchaseProduct,index)=>
                      <>
                      <Row key={`index_${index}`}>
                      <Col >
                        <AvField name= {`purchaseProduct[${index}].productName`}  label ="Product Name" placeholder="Product Name"
                          value={purchaseProduct.productName? purchaseProduct.productName:''}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                        }} 
                        />
                      </Col>
                      <Col >
                        <AvField name= {`purchaseProduct[${index}].length`}  label ="Length" placeholder="Length"
                          value={purchaseProduct.length? purchaseProduct.length:''}
                          min={0}
                          max={400}
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
                        <Col>
                        <AvField name= {`purchaseProduct[${index}].breadth`}  label ="Breadth" placeholder="Breadth"
                          value={purchaseProduct.breadth? purchaseProduct.breadth:''}
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
                      <Col >
                        <AvField name= {`purchaseProduct[${index}].height`}  label ="Height" placeholder="Height"
                          value={purchaseProduct.height? purchaseProduct.height:''}
                          min={0}
                          max={20}
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
                      <Col >
                          <AvField type="select" name={`purchaseProduct[${index}].unit`} label="Unit" 
                           value={purchaseProduct.unit? purchaseProduct.unit:''}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose unit</option>
                        {unitList.map((data, index)=> {return (<option key={index} style={{color:"black"}}>{data.label}</option>)} )}
                        </AvField>
                      </Col>
                      <Col >
                        <AvField name={`purchaseProduct[${index}].qty`}  label ="Qty" placeholder="Qty"
                         value={purchaseProduct.qty? purchaseProduct.qty:''}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid qty number.`
                            }
                        }} 
                        />
                      </Col>

                      <Col >
                        <AvField name={`purchaseProduct[${index}].weight`}  label ="Material Weight" placeholder="Material Weight"
                         value={purchaseProduct.weight? purchaseProduct.weight:''}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid weight number.`
                            }
                        }} 
                        />
                      </Col>
                        <Col >
                        <AvField name={`purchaseProduct[${index}].rate`}  label ="Rate" placeholder="Rate"
                        value={purchaseProduct.rate? purchaseProduct.rate:''}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid rate number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2}>
                        <AvField name="Amount"  label ="Amount" placeholder="Amount"
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid Amount`
                            }
                        }} 
                        />
                      </Col>
                    </Row>
                      </>
                    )}
                    <Col md={12} className="text-centre">
                        <button type="button" className="btn btn-inverse-primary btn-rounded btn-rounded btn-icon" onClick={this.addMoreRow}>
                          <i className="mdi mdi-plus-circle"></i>
                        </button>
                    </Col>
                    {this.state.paymentList.map((data,index)=>
                      <>
                       <Row>
                       <Col md={2}>
                          <AvField type="select" name={`payment[${index}].payMode`} label="Select Pay" 
                              //onClick={this.handlePyment}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose pay</option>
                        {paymentOption.map((data, index)=> {return (<option key={index} style={{color:"black"}}>{data.label}</option>)} )}
                        </AvField>
                      </Col>
                      <Col md={2}>
                        <AvField name={`payment[${index}].amount`}  label ="Enter amount" placeholder="0.00"
                          //onKeyUp={e=> this.calculatePaidAmount(e, index)}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid amount number.`
                            }
                        }} 
                        />
                      </Col>
                      </Row>
                      </>
                      )}
                      <Col md={3} className="text-centre">
                        <button type="button" className="btn btn-inverse-primary btn-rounded btn-rounded btn-icon" onClick={this.addMorePayment}>
                          <i className="mdi mdi-plus-circle"></i>
                        </button>
                      </Col>
                    <Row>
                      <Col md={3}>
                        <AvField name="totalWeight"  label ="Total Weight" placeholder="Total Weight"
                         value={selectedCell && selectedCell.totalWeight?selectedCell.totalWeight:'0.00'}

                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid Weight number.`
                            }
                        }} 
                        />
                      </Col>
                       
                      <Col md={3}>
                        <AvField name="vehicleNumber"  label ="Vehical Detail" placeholder="Vehical Detail"
                          //value={selectedCell && selectedCell.totalWeight?selectedCell.totalWeight:'0.00'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                        }} 
                        />
                      </Col>
                      <Col md={3}>
                        <AvField name="totalAmount"  label ="Total Amount" placeholder="Total Amount"
                        value={selectedCell && selectedCell.amount?selectedCell.amount:'0.00'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:/^[0-9]+.+$/,
                              errorMessage: `Invalid Amount number.`
                            }
                        }} 
                        />
                      </Col>
                      {/* <Col md={3}>
                          <AvField type="select" name="payMode" label="Select Pay" 
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose pay</option>
                        {paymentList.map((data, index)=> {return (<option key={index} style={{color:"black"}}>{data.label}</option>)} )}
                        </AvField>
                      </Col> */}
                    </Row>
                    <Row>
                        <div className="col-md-6 d-flex justify-content-end">
                        <Button type="submit">Update</Button>
                        </div>
                        <div className="col-md-6">
                        <Button variant="dark" 
                        onClick={this.handleCloseEditModel}
                         >Cancel</Button>
                        </div>
                    </Row>
                  </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal>
          <Modal
            show={this.state.deletePurchaseModal}
            // size={"lg"}
            onHide={this.handleCloseDeleteModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Purchase Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               Are you want sure delete this purchase detail?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.handleCloseDeleteModel}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.deleteHandle}>Delete</Button>
            </Modal.Footer>
          </Modal>

          {/* Purchaser order details */}
          <Modal
            show={this.state.showProductModal}
            // size={"lg"}
            onHide={this.showProductClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Product Detail Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ReactTable
                data={this.state.selectedCell && this.state.selectedCell.purchaseProduct && this.state.selectedCell.purchaseProduct.length>0?this.state.selectedCell.purchaseProduct:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={productColumn}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={10}
                showPageSizeOptions={false}
                showPageJump={false}
              />
            </Modal.Body>
          </Modal>
          <Modal
            show={this.state.recieverModel}
            //size={"sm"}
            onHide={this.handleCloseRecieverModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add New Reciever</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading4}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm onValidSubmit={this.addNewReciever}>
                {/* <h3 className="text-dark d-flex justify-content-center">Purchase Details</h3> */}
                    {/* <Row> */}
                      
                    <Col >
                    <AvField name="recieverName" label="Reciever Name" placeholder="Reciever Name"
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        minLength: {
                          value: 4,
                          errorMessage: 'Invalid Reciever name.'
                        },
                        maxLength: {
                          value: 35,
                          errorMessage: 'Invalid Reciever name.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z\s]*$/,
                          errorMessage: `Invalid Reciever name.`
                        }
                    }} 
                    />
                     </Col>
                     <Col >
                          <AvField name="phoneNumber" label="Phone Number" placeholder="Phone Number"
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                              maxLength: {
                                value: 10,
                                errorMessage: 'Invalid phone number'
                              },
                              minLength: {
                                value: 10,
                                errorMessage: 'Invalid phone number'
                              },
                              pattern: {
                                value:/^[0-9]+$/,
                                errorMessage: `Invalid phone number.`
                              }
                            }} 
                        />
                    </Col>
                    {/* </Row> */}
                    <Row>
                        <div className="col-md-6 d-flex justify-content-end">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6">
                        <Button variant="dark" 
                        onClick={this.handleCloseRecieverModel}
                         >Cancel</Button>
                        </div>
                    </Row>
                  </AvForm>
                </div>
              </div>
              </BlockUi>
            </Modal.Body>
          </Modal>
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
                <AvForm onValidSubmit={this.submitNewProductName}>
                    <Row>
                    <Col>
                    <AvField name="productName" label="Add Product Name" placeholder="Add Product Name"
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
        </div>
    )
  }
}

export default Purchase