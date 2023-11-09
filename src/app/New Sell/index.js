import Axios from "axios";
import React, { Component } from "react";
import ReactTable from "react-table";
import _ from "lodash";
import { toast } from "react-toastify";
import { SETTING } from "../app-config/cofiguration";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Col, Container, Form, FormGroup, Modal, Row } from "react-bootstrap";
import BlockUi from "react-block-ui";
import Spinner from "../shared/Spinner";
import DatePicker from "react-datepicker";
import { AvField, AvForm } from "availity-reactstrap-validation";
import Select from 'react-select';
import 'react-block-ui/style.css';
import { capitalize, logoutFunc, encryptAES, saveSecurityLogs, unitOption } from "../util/helper";
import { Link } from "react-router-dom/cjs/react-router-dom";
toast.configure();
// const paymentMode=['Cash','Gpay','phonePay','Axis Bank']
const paymentOption =[
  {value:'Gpay',label:'Gpay (Old Data)'},
  {value:'Paytm',label:'Paytm (Old Data)'},
  {value:'phonePay',label:'phonePay (Old Data)'},
  {value:'Axis Bank',label:'Axis Bank (Old Data)'},
]

const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const ROLE = (USER && USER.userInfo.roleName)?USER.userInfo.roleName:''
const menuUrl = window.location.href
let flWtValue=null //fluctualateWeightValue
export class Sell extends Component {
    constructor(props) {
        super(props);
        this.state = {
          allSell: [],
          productData:[],
          loading:false,
          sellModal:false,
          loading2:false,
          deleteSellModal:false,
          showProductModal:false,
          loading3:false,
          totalAmount:0,
          dueAmount:0,
          totalPaidAmount:0,
          totalWeight:0,
          loadingCharge:0,
          oldDueAmount:0,
          userPurchaseHistory:[],
          selectedCell:{},
          paymentList:[{}],
          allProductCode:[],
          allProductName:[],
          allProductCodeData:[],
          allProductNameData:[],
          uniqueSellsList:[],
          suggestions:[],
          editSellModal:false,
          loading4:false,
          allCompany:[],
          selectedProductNameId:'',
          selectedProductCodeId:'',
          selectedLength: '',
          selectedBreadth : '',
          selectedHeight:'',
          selectedCompnay:'All',
          sizeRequired:true,
          allPayOptions:[],
          inventoryData:[],
          selectedPhone:'',
          showSellHistoryModal:false,
          sellProductList:[{productNameId:'',productCodeId:'',inventoryId:'', length:'',breadth:'',height:'',weight:'', weighted:'',unit:'',qty:'', rate:''}]
     
        };
      }

      componentDidMount() {
        this.getAllSell();
        this.getAllInventory();
        this.getAllProductCode()
        this.getAllProductName()
        this.getAllPayOptions()
        this.getFluctionWeight()
   
        if(ROLE && ROLE==='SUPER_ADMIN')this.getCompanyDetail()
        saveSecurityLogs(menuUrl, 'Menu Log')
      }

      async getAllSell(){
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+'admin/getAllSell')
        url.searchParams.set('productNameId', this.state.selectedProductNameId)
        url.searchParams.set('productCodeId', this.state.selectedProductCodeId)
        url.searchParams.set('length', this.state.selectedLength)
        url.searchParams.set('breadth', this.state.selectedBreadth)
        url.searchParams.set('height', this.state.selectedHeight)
        url.searchParams.set('phone', this.state.selectedPhone)
        if(this.state.selectedCompnay && ROLE && ROLE==='SUPER_ADMIN'){
          url.searchParams.set('companyId', this.state.selectedCompnay)
        }
        await Axios.get(url,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allSell: res.data.sellData,
              uniqueSellsList: [...new Map(res.data.sellData.map(item =>[item.buyerDetail.phoneNumber1, item])).values()]
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
            const errorMessage= "Error while getting all Sell data."
            toast["error"](err.message? err.message: errorMessage);
            saveSecurityLogs(menuUrl, 'Error Logs',  errorMessage)
          }else{
            logoutFunc(err)
          }
        });
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
              if(res.data && res.data.data && res.data.data.inventoryData && res.data.data.inventoryData.length>0){
                this.setState({
                  inventoryData: res.data.data.inventoryData.map(data=> {
                    if(data.freeSize){
                      return{
                        ...data,
                        label: `${data.productName}(Free size)`,
                        value : data._id 
                      }
                    }else{
                      return{
                        ...data,
                        label: `${data.productName}(L=${data.length},B=${data.breadth},H=${data.height})`,
                        value : data._id 
                      }
                    }
                  })
                })
              }else{
                this.setState({
                  inventoryData: [],
                })
              }
          
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
            toast["error"](err.message? err.message: "Error while getting all Product Code.");
          }else{
            logoutFunc(err)
          }
        });
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
              allProductNameData: res.data.allProductNameData
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
            toast["error"](err.message? err.message: "Error while getting all Product Name.");
          }else{
            logoutFunc(err)
          }
        });
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
      
            flWtValue= res.data.data && res.data.data[0] && res.data.data[0].fluctualateWeightValue && parseFloat(res.data.data[0].fluctualateWeightValue)>0? parseFloat(res.data.data[0].fluctualateWeightValue):null
          
          } else {
            //toast["error"](res.data.message);
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

       async getCompanyDetail(){
        this.setState({
          loading:true
        })
       
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.get(SETTING.APP_CONSTANT.API_URL+`admin/getCompany`,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            this.setState({
              allCompany: res.data.data,
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
            toast["error"](err.message? err.message: 'Error while getting all Copmpany data.');
          }else{
            logoutFunc(err)
          }
        });
       }
       async getAllPayOptions(){
        this.setState({
          loading:true
        })
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+'admin/getAllPayOption')

        await Axios.get(url,{headers: options})
        .then((res) => {
          this.setState({
            loading:false
          })
          if (res && res.data.success) {
            const  allPayOptions = res.data.data.filter((val)=>!val.deleted) 
             this.setState({
              allPayOptions:allPayOptions              
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
            toast["error"](err.message? err.message: "Error while getting all Pay Option");
          }else{
            logoutFunc(err)
          }
        });
       }

     

       handleSubmit = async(e, values)=>{
        console.log("eeeeeeeeeeeeee", values)
        console.log("eeeeeeeeeeeeee", this.state.sellProductList)
        // this.setState({
        //   loading2:true
        // })
        const buyerDetail={
          phoneNumber1: values.phoneNumber1,
          phoneNumber2: '',
          buyerName: values.buyerName? capitalize(values.buyerName.trim()):'',
          companyName: values.companyName? values.companyName.trim():'',
          address: values.address?  values.address.trim():'',
          natureOfBussiness: values.natureOfBussiness?values.natureOfBussiness.trim():'',
        }
        // if(values.payment && values.payment.length>0){
        //   paidAmount = values.payment.reduce((acc, curr)=>parseFloat(acc.amount)+ parseFloat(curr.amount),0)
            
        // } 
        // const payInfo= {
        //     payMode: values.payMode,
        //     payBy:'',
        //     amount: parseFloat(values.totalAmount),
        // }
        const vehicleDetail = [{
          vehicleType: 'other',
          vehicleNumber: values.vehicleNumber,
          fare:0,
        }]

        const payload={
          buyerDetail,
          sellInfo:this.state.sellProductList,
          payInfo: values.payment,
          totalWeight:values.totalWeight,
          vehicleInfo:vehicleDetail,
          discountAmount: values.discountAmount?values.discountAmount:0,
          paidAmount: values.totalPaidAmount,
          dueAmount: values.dueAmount,
          totalAmount: values.totalAmount,
          loadingCharge: values.loadingCharge,
          insertedBy : USER && USER._id,
          companyId: USER && USER.userInfo.companyId
        }
        console.log("payloadpayload", payload)
        
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/submitSellData`,payload,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
           
          } else {
            toast["error"](res.data.message);
          } 
          saveSecurityLogs(menuUrl, 'Create/Add')
          this.handleClose()
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while submitting Sell data.");
            saveSecurityLogs(menuUrl, 'Error Logs',  err.message)
          }else{
            logoutFunc(err)
          }
        });
       }

       handleEditSubmit = async(e, values)=>{
        //console.log("eeeeeeeeeeeeee", this.state.paymentList)
        this.setState({
          loading4:true
        })
        const buyerDetail={
          phoneNumber1: values.phoneNumber1,
          phoneNumber2: '',
          buyerName: values.buyerName? capitalize(values.buyerName.trim()):'',
          companyName: values.companyName? values.companyName.trim():'',
          address: values.address?  values.address.trim():'',
          natureOfBussiness: values.natureOfBussiness?values.natureOfBussiness.trim():''
        }
        const vehicleDetail = [{
          vehicleType: 'other',
          vehicleNumber: values.vehicleNumber,
          fare:0,
        }]

        const payload={
          buyerDetail,
          sellInfo:values.sellProduct,
          payInfo: this.state.paymentList,
          totalWeight:values.totalWeight,
          vehicleInfo:vehicleDetail,
          discountAmount: values.discountAmount?values.discountAmount:0,
          paidAmount: values.totalPaidAmount,
          dueAmount: values.dueAmount,
          loadingCharge: values.loadingCharge,
          totalAmount: values.totalAmount,
          actionPassword: (ROLE && ROLE==='ADMIN')? encryptAES(values.actionPassword): undefined
        }
        
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/updateSellData/`+this.state.selectedCell._id,payload,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
            this.handleClose()
            saveSecurityLogs(menuUrl, 'Update')
          } else {
            if(res?.data?.actionPassword){
              this.setState({loading4:false})
              toast["error"](res.data.message);
              saveSecurityLogs(menuUrl, 'Error Logs',  res.data.message)
            }else{
              toast["error"](res.data.message);
              saveSecurityLogs(menuUrl, 'Error Logs',  res.data.message)
              this.handleClose()
            }
          } 
        })
        .catch((err) =>{
          this.handleClose()
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while submitting Sell data.");
          }else{
            logoutFunc(err)
          }
        });
       }

       handleCompany=(e)=>{
        const value = e.target.value
        this.setState({
          selectedCompnay: value
        },()=>this.getAllSell())

       }
       addMoreRow=()=>{
        const newRow={
          productNameId:'',
          productCodeId:'',
          length:'',
          breadth:'',
          height:'',
          weight:'',
          unit:'',
          qty:'',
          rate:''
        }

        // let list= this.state.productList
        // list.push(newRow)
        this.setState({sellProductList:[...this.state.sellProductList,newRow]})
       }

      removeRow = (index)=>()=> {
        let sellProductList = [...this.state.sellProductList];
        if(sellProductList.length>1){
          sellProductList.splice(index, 1);
          this.setState({sellProductList},()=>this.calculateAmount())
        }else{
          toast["error"]('This is required row.');
        }
      }

      SellModelOpen=()=>{
        this.setState({
            sellModal:true,
            sizeRequired:true,
        })
       }

       handleClose=()=>{
        this.setState({
            text:'',
            sellModal:false,
            loading:false,
            loading2:false,
            deleteSellModal: false,
            showProductModal:false,
            selectedCell:{},
            loading3:false,
            loading4:false,
            paymentList:[{}],
            totalAmount:0,
            dueAmount:0,
            discountAmount:0,
            totalWeight:0,
            totalPaidAmount:0,
            selectedPurchaser:{},
            editSellModal:false,
            sellProductList:[{productNameId:'',productCodeId:'',inventoryId:'',length:'',breadth:'',height:'',weight:'',unit:'', qty:'',rate:''}]
        },()=> this.getAllSell())
       }

       handleCloseDeleteModel=()=>{
        this.setState({
          deleteSellModal:false,
          selectedCell:{},
        })
      }
      handleCloseSellEditModel=()=>{
        this.setState({
          text:'',
          editSellModal:false,
          selectedCell:{},
          paymentList:[{}],
          totalAmount:0,
          dueAmount:0,
          discountAmount:0,
          totalWeight:0,
          totalPaidAmount:0,
          suggestions:[],
          selectedPurchaser:{}, 
          sellProductList:[{productNameId:'',productCodeId:'',inventoryId:'',length:'',breadth:'',height:'',weight:'',unit:'', qty:'',rate:''}]
        })
      }

      handleCloseSellModel=()=>{
        this.setState({
          text:'',
          editSellModal:false,
          selectedCell:{},
          paymentList:[{}],
          totalAmount:0,
          dueAmount:0,
          discountAmount:0,
          totalWeight:0,
          totalPaidAmount:0,
          suggestions:[],
          selectedPurchaser:{}, 
          sellModal:false,
          sellProductList:[{productNameId:'',productCodeId:'',inventoryId:'',length:'',breadth:'',height:'',weight:'',unit:'', qty:'',rate:''}]
        })
      }

      addMorePayment=()=>{
        this.setState({
          paymentList:[...this.state.paymentList,{}],
        })
      }

      removePaymentRow = (index) => {
        let paymentList = [...this.state.paymentList];
        if(paymentList.length>1){
          paymentList.splice(index, 1);
          this.setState({paymentList},()=>this.calculatePaymentAmount())
        }else{
          toast["error"]('This is required row.');
        }
        
      }
       deleteToggle =(cell)=>{
        this.setState({
          selectedCell: cell,
          deleteSellModal:true
        })
       }

       deleteHandle=async(err, values)=>{
        this.setState({
          loading3:true
        })
        const actionPassword=   encryptAES(values.actionPassword)
        let options = SETTING.HEADER_PARAMETERS;
        options['Authorization'] = localStorage.getItem("token")
        const url = new URL(SETTING.APP_CONSTANT.API_URL+`admin/deleteSellData/`+this.state.selectedCell._id)
        if(ROLE && ROLE==='ADMIN'){
          url.searchParams.set('actionPassword', actionPassword)
        }
         await Axios.delete(url,{headers: options})
        .then((res) => {
          if (res && res.data.success) {
            toast["success"](res.data.message);
            saveSecurityLogs(menuUrl, 'Delete')
            this.handleClose()
          } else {
            if(res?.data?.actionPassword){
              this.setState({loading3:false})
              toast["error"](res.data.message);
              saveSecurityLogs(menuUrl, 'Error Logs', res.data.message)
            }else{
              toast["error"](res.data.message);
              saveSecurityLogs(menuUrl, 'Error Logs', res.data.message)
              this.handleClose()
            }
          }
        })
        .catch((err) =>{
          this.handleClose()  
          if(err && err.success===false  ){
            toast["error"](err.message? err.message: "Error while deleting sell data.");
            saveSecurityLogs(menuUrl, 'Error Logs',err.message)
          }else{
            logoutFunc(err)
          }
        });
       }

      //  delete=async(cell)=>{
      //   this.setState({
      //     loading:true
      //   })
      //   const payload={
      //     id:cell._id,
      //     modelName:'sell'
      //   }
       
      //   let options = SETTING.HEADER_PARAMETERS;
      //   options['Authorization'] = localStorage.getItem("token")
      //   await Axios.post(SETTING.APP_CONSTANT.API_URL+`admin/permanentDelete`,payload,{headers: options})
      //   .then((res) => {
      //     if (res && res.data.success) {
      //       // toast["success"](res.data.message);
           
      //     } else {
      //       toast["error"](res.data.message);
      //     }
      //     this.handleClose()
      //   })
      //   .catch((err) =>{
      //     this.handleClose()
      //     toast["error"]("Error while deleting sell data.");
      //   });
      //  }
     
      ShowProduct=(cell)=>{
          this.setState({
            showProductModal:true,
            selectedCell:cell
          })
      }
      showProductClose =()=>{
        this.setState({
          showProductModal:false,
          selectedCell:{}
        })
      }

      purchaseHistory=(phoneNumber)=>{
        const  uniqueSellDataByNumber = this.state.allSell.filter((val)=>val.buyerDetail.phoneNumber1===phoneNumber) 
        if(uniqueSellDataByNumber && uniqueSellDataByNumber.length>0){
          const oldDueAmount =parseFloat(uniqueSellDataByNumber.reduce((acc, curr)=> acc+ parseFloat(curr.dueAmount),0)).toFixed(2)
          // const userPurchaseHistoryData= (Object.entries(uniqueSellDataByNumber).map(([key, value]) => ({ key, value }))).map(data=>{
          //   return{
          //     ...data,
          //     oldDueAmount : parseFloat(data.value.reduce((acc, curr)=> acc+ parseFloat(curr.dueAmount),0)).toFixed(2)
          //   }
          // }) 
          this.setState({
          userPurchaseHistory: uniqueSellDataByNumber,
          oldDueAmount: oldDueAmount
          })
        }else{
          this.setState({
            userPurchaseHistory: [],
            oldDueAmount: 0
          })
        }
      }
  calculateAmount = () => {
        let grandTotal = this.state.loadingCharge?parseFloat(this.state.loadingCharge):0
        let totalWeight =0;
        this.state.sellProductList.forEach((it)=>{
            if(!!it.lineTotal && parseFloat (it.lineTotal) > 0){
              grandTotal += parseFloat(it.lineTotal);
            }
            if(!!it.weighted && parseFloat (it.weighted) > 0){
              totalWeight += parseFloat(it.weighted);
            }
        });
        this.setState({ totalAmount: (grandTotal).toFixed(2),totalWeight:totalWeight.toFixed(2) },()=>this.calculatePaymentAmount())
  };
  updateField = (rowIndex, key) => e => {
      let data = [...this.state.sellProductList];
      data[rowIndex][key] = e.target.value;
    this.setState({ sellProductList:data },
      //()=>{this.calculateAmount()}
      );
   };
  calculateField = (e, rowIndex) => { 
    let data = [...this.state.sellProductList]; 
    console.log("datadatadata", data)
    let num1 = !!data[rowIndex].rate ? parseFloat(data[rowIndex].rate) : 0; 
    let num2 = !!data[rowIndex].qty ? parseFloat(data[rowIndex].qty) : 0;
    let num3 = !!data[rowIndex].weighted ? parseFloat(data[rowIndex].weighted) : 0;
    let num4 = !!data[rowIndex].weight ? parseFloat(data[rowIndex].weight) : 0;
    let lineTotalWeight= (num2 * num4 ).toFixed(2);  
    data[rowIndex]['lineTotal'] = (num1 * num3 ).toFixed(2);
    data[rowIndex]['lineTotalWeight']= lineTotalWeight
    const color= flWtValue ? 
    !!lineTotalWeight  && !!num3 && (parseFloat(lineTotalWeight)<= (parseFloat(num3) + parseFloat(num3)*flWtValue/100) &&  parseFloat(lineTotalWeight)>= (parseFloat(num3) - parseFloat(num3)*flWtValue/100)) ?'green': 'red': null;
    data[rowIndex]['weightColor'] = color 
    this.setState({ sellProductList:data}, ()=>{this.calculateAmount()});
  };

  calculatePaymentAmount = () => {
    let paidAmount = 0;
    let dueAmount =0;
    let discountAmount= this.state.discountAmount?parseFloat(this.state.discountAmount):0
    let totalAmount = this.state.totalAmount?parseFloat(this.state.totalAmount):0
      this.state.paymentList.forEach((it)=>{
          if(!!it.amount && parseFloat (it.amount) > 0){
            paidAmount += parseFloat(it.amount);
          }
      });
      dueAmount = totalAmount - paidAmount - discountAmount
      totalAmount = totalAmount - discountAmount
    this.setState({ totalPaidAmount: paidAmount.toFixed(2) , dueAmount: dueAmount.toFixed(2), discountAmount, totalAmount})
  };
  updatePaymentField = (rowIndex, key) => e => {
    let data = [...this.state.paymentList];
    data[rowIndex][key] = e.target.value;
    this.setState({ paymentList:data },
      // ()=>{this.calculatePaymentAmount()}
      );
  };
  calculatePaymentField = (e, rowIndex) => {
    let data = [...this.state.paymentList]; 
    let num1 = !!data[rowIndex].amount ? parseFloat(data[rowIndex].amount) : 0; 
    this.setState({ paymentList:data }, ()=>{this.calculateAmount()});
  };
  calculateDiscountAmount = (e) => {
    this.setState({ discountAmount: e.target.value }, ()=>{this.calculateAmount()});
  };
  calculateLoadingCharge = (e) => {
    this.setState({ loadingCharge: e.target.value }, ()=>{this.calculateAmount()});
  };

  changeSellSelectOption = (rowIndex, e, key) => {
    console.log("rowIndexrowIndex", rowIndex, "eee", e, 'keyyyy',key)
    const {inventoryData} = this.state
    let data = [...this.state.sellProductList];
    if(key && key==='inventoryId' && e.value){
      const productData = inventoryData.find(iData=> iData._id===e.value)
      data[rowIndex][key] = e.value
      data[rowIndex]['productNameId'] = productData.productNameId 
      data[rowIndex]['productCodeId'] = productData.productCodeId
      data[rowIndex]['length'] = productData.length
      data[rowIndex]['breadth'] = productData.breadth
      data[rowIndex]['height'] = productData.height
      data[rowIndex]['unit'] = productData.unit?productData.unit:''
      data[rowIndex]['weight'] = productData.perUnitWeight?productData.perUnitWeight:0
    }else{
      data[rowIndex][key] = e.target.value;
    }
  this.setState({ sellProductList:data });
 };

 changePaymentOption = (rowIndex, e, key) => {
  
  if(e.target.value && e.target.value!=='createNewPayment'){
    let data = [...this.state.paymentList];
    data[rowIndex][key] = e.target.value;
    this.setState({ paymentList:data });
  }else if(e.target.value && e.target.value==='createNewPayment'){
    window.location.href="pay-option?createNewPayment"
  }
};
clearSearch = (e) => {
  this.setState({
      text:"",
      //searchInput:"",
      suggestions:[],
      selectedPurchaser: {},
      userPurchaseHistory:[]
  })
}
handleSearchChange = (e) => {
  const value = e.target.value;
  let suggestions = [];
  this.setState({selectedPurchaser:null, suggestions:[], userPurchaseHistory:[]})
  if(value.length > 0){
      //this.setState({disableClear:false})
      suggestions = this.state.uniqueSellsList.filter(item => {
        if(item.buyerDetail){
          if (item.buyerDetail.phoneNumber1 === undefined) {
            item.buyerDetail.phoneNumber1 = "";
          }
          if (item.buyerDetail.buyerName === undefined) {
              item.buyerDetail.buyerName = "";
          }
          return  item.buyerDetail.phoneNumber1.toString().toLowerCase().includes(e.target.value.toLowerCase().trim())
              // || item.buyerDetail.buyerName.toString().toLowerCase().includes(e.target.value.toLowerCase().trim())
        }else{
          return ''
        }

      });
  }else {
      this.clearSearch()
  }
  this.setState(() => ({
      suggestions,
      text: value,
  }))
}

 selectedText = async(value)=> {
  this.setState(() => ({
      text: value.buyerDetail.phoneNumber1,
      selectedPurchaser: value,
      suggestions: [],
  }),()=> this.purchaseHistory(value.buyerDetail.phoneNumber1))
}

renderSuggestions = () => {
  let { suggestions } = this.state;
  if(suggestions.length === 0){
      return null;
  }
  return (
      <ul className="ul" style={{'height':'auto', 'maxHeight':'120px','zIndex':'10000', 'overflowX':'hidden','overflowY':'scroll'}} >
          {
              suggestions.map((item, index) => (<div className="dropdown-content"><a  href="#/"  key={index} onClick={() => 
              this.selectedText(item)}>{item.buyerDetail.phoneNumber1 }
              {/* -{item.buyerDetail.buyerName} */}
              </a></div>))
          }
      </ul>
  );
}

editToggle=(cell)=>{
  this.setState({
    selectedCell: cell,
    sellProductList: (cell.sellInfo && cell.sellInfo.length>0)?cell.sellInfo.map(data=> {return {...data, weighted: data.weighted?data.weighted: data.weight, lineTotal:   parseFloat(data.weighted?data.weighted:data.weight) * parseFloat(data.rate)}}):[],
    paymentList : (cell.payInfo && cell.payInfo.filter(x => x).join(', ').length>0 )?cell.payInfo:[],
    totalWeight: (cell.sellInfo && cell.sellInfo.length>0)?cell.sellInfo.reduce((sum, curr)=> sum +parseFloat(curr.weight), 0):'0.00',
    totalPaidAmount:cell.paidAmount,
    dueAmount:cell.dueAmount,
    totalAmount:cell.totalAmount,
    editSellModal:true
  })
 }
 
 filterProductName=(e)=>{
    this.setState({
      selectedProductNameId: e.target.value
    },()=> this.getAllSell())
 }
 filterProductCode=(e)=>{
  this.setState({
    selectedProductCodeId: e.target.value
  },()=> this.getAllSell())
 }
 filterByLength=(e)=>{
  this.setState({
    selectedLength :e.target.value,
    selectedBreadth :'',
    selectedHeight :''
  },()=>this.getAllSell())
 }
 filterByBreadth=(e)=>{
  this.setState({
    selectedBreadth :e.target.value,
    selectedLength:'',
    selectedHeight:''
  },()=> this.getAllSell())
 }
 filterByHeight=(e)=>{
  this.setState({
    selectedHeight :e.target.value,
    selectedLength:'',
    selectedBreadth:''
  },()=>this.getAllSell())
 }

 filterByPhoneNumber=(e)=>{
    this.setState({
      selectedPhone:e.target.value
    },()=>this.getAllSell())
 }

 clearFilter=()=>{
   this.setState({
    selectedProductNameId:'',
    selectedCompnay:'',
    selectedProductCodeId:'',
    selectedLength:'',
    selectedBreadth:'',
    selectedHeight:'',
    selectedPhone:'',
    text:'',
    suggestions:[],
    selectedPurchaser:{}
   })
 }
 handleRequiredSize=()=>{
    this.setState({
      sizeRequired:!this.state.sizeRequired
    })
 }

 togleSellHistory=()=>{
  this.setState({
    showSellHistoryModal:!this.state.showSellHistoryModal
  })
 }


  render() {
    const {selectedPurchaser, selectedCell, editSellModal, allCompany}= this.state
    let formData={}
    if(editSellModal){
      formData={
        phoneNumber1: selectedCell.buyerDetail.phoneNumber1,
        buyerName: selectedCell.buyerDetail.buyerName,
        companyName: selectedCell.buyerDetail.companyName,
        natureOfBussiness: selectedCell.buyerDetail.natureOfBussiness,
        address: selectedCell.buyerDetail.address,
        // sellProductList: selectedCell.sellInfo,
        vehicleNumber:selectedCell.vehicleInfo[0].vehicleNumber,
        //totalWeight: '',
        //totalPaidAmount: selectedCell.paidAmount,
        //dueAmount: selectedCell.dueAmount,
        discountAmount: selectedCell.discountAmount,
        //totalAmount: selectedCell.totalAmount,
        // paymentList:[],
      }
    }
    //console.log("sdsadfsdad", this.state.sellProductList)
    // console.log("form dattata", formData)
    const productColumn =[
      {
        Header: "Product Name",
        accessor: "productName",
        width: 250,
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
        Header: "Product Code",
        accessor: "productCode",
        width: 250,
        Cell: (cell) => {
          if(cell.original.productCodeId){
            const productCodeFound= this.state.allProductCodeData.find(data=>data._id === cell.original.productCodeId)
            return productCodeFound && productCodeFound.productCode ? productCodeFound.productCode:'N/A'
          }else{
            return  'N/A'
          }
        }
      },
      {
        Header: "No of Units",
        accessor: "No of Units",
        width: 85,
        Cell: (cell) => {
          return cell.original.qty ? cell.original.qty:'N/A'
        }
      },
      {
        Header: "Length",
        accessor: "length",
        width: 85,
        Cell: (cell) => {
          return cell.original.length ? cell.original.length:'N/A'
        }
      },
      {
        Header: "Breadth",
        accessor: "breadth",
        width: 85,
        Cell: (cell) => {
          return cell.original.breadth ? cell.original.breadth:'N/A'
        }
      },
      {
        Header: "Height",
        accessor: "height",
        width: 85,
        Cell: (cell) => {
          return cell.original.height ? cell.original.height:'N/A'
        }
      },
      {
        Header: "Weight",
        accessor: "weight",
        width: 85,
        Cell: (cell) => {
          return cell.original.weight ? cell.original.weight:'N/A'
        }
      },
      {
        Header: "Total Weight",
        accessor: "weighted",
        width: 150,
        Cell: (cell) => {
          return cell.original.weighted ? cell.original.weighted:'N/A'
        }
      },
      {
        Header: "Rate",
        accessor: "rate",
        width: 85,
        Cell: (cell) => {
          return cell.original.rate ? cell.original.rate:'N/A'
        }
      },
      {
        Header: "Unit",
        accessor: "unit",
        width: 85,
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
        Header: "Buyer Name",
        accessor: "buyerName",
        Cell: (cell) => {
              return  cell.original.buyerDetail &&  cell.original.buyerDetail.buyerName?cell.original.buyerDetail.buyerName:'NA'
        },
      },
      {
        Header: "Company Name",
        accessor: "companyName",
        Cell: (cell) => {
          return  cell.original.buyerDetail &&  cell.original.buyerDetail.companyName?cell.original.buyerDetail.companyName:'NA'
         },
      },
      {
        Header: "Phone Number",
        accessor: "phoneNumber1",
        Cell: (cell) => {
          return  cell.original.buyerDetail &&  cell.original.buyerDetail.phoneNumber1?cell.original.buyerDetail.phoneNumber1:'NA'
         },
      },
      {
        Header: "Product Detail",
        accessor: "productName",
        Cell: (cell) =>{
        return  (
          <Link to="#" onClick={()=>this.ShowProduct(cell.original)}>Product Detail</Link>
        )}
      },
      {
        Header: "vehicle Number",
        accessor: "vehicleNumber",
        Cell: (cell) => {
          return cell.original.vehicleInfo &&  cell.original.vehicleInfo.length>0? cell.original.vehicleInfo[0].vehicleNumber:'N/A'
        }
      },
      {
        Header: "Total Amt.",
        accessor: "totalAmount",
        Cell: (cell) => {
          return  cell.original.totalAmount? cell.original.totalAmount:'0.00'
        }
      },
      {
        Header: "Paid Amt.",
        accessor: "paidAmount",
        Cell: (cell) => {
          return  cell.original.paidAmount? cell.original.paidAmount:'0.00'
        }
      },
      {
        Header: "Due Amt.",
        accessor: "dueAmount",
        Cell: (cell) => {
          return  cell.original.dueAmount? cell.original.dueAmount:'0.00'
        }
      },
      {
        Header: "Mode Payment",
        accessor: "payInfo",
        Cell: (cell) => {
          return cell.original.payInfo && cell.original.payInfo.length>0 && cell.original.payInfo[0]!==null?cell.original.payInfo[0].payMode:'N/A'
        }
      },
      {
        Header: "Action",
        //show:USER && USER.userInfo && USER.userInfo.role && USER.userInfo.role==='TOPADMIN'?true:false,
        width: 150,
        Cell:cell=>{
          return(
              <Row style={{marginLeft:"0.1rem", marginTop:"0px"}}>
                {ROLE && ROLE!=='SUPER_ADMIN'?<>     
                    <a href="#/" title='delete' id={'delete'}
                    className="mb-2 badge" 
                      onClick={e=>this.deleteToggle(cell.original)
                    }>
                      <i className="mdi mdi-delete mdi-18px"></i>
                  </a></>:<></>}
                 {ROLE && ROLE==='SUPER_ADMIN'}
                      <a href="#/" title={ROLE && ROLE!=='SUPER_ADMIN'?'Edit':'View'} id={'edit'}
                      className="mb-2 badge" 
                        onClick={e=>this.editToggle(cell.original)
                      }>
                        <i className={ROLE && ROLE!=='SUPER_ADMIN'?"mdi mdi-lead-pencil mdi-18px":"mdi mdi-eye mdi-18px"}></i>
                    </a>
              </Row>
          )
        }
      }
    ]
    const sellHistoryColumn=[
      {
        Header: "Date/Time",
        accessor: "created",
        width: 180,
        Cell: (cell) => {
          return new Date(cell.original.created)
            .toLocaleString("en-GB", {
              hour12: true,
            })
            .toUpperCase();
        },
      },
      {
          Header: "Buyer Name",
          accessor: "buyerName",
          Cell: (cell) => {
                return  cell.original.buyerDetail &&  cell.original.buyerDetail.buyerName?cell.original.buyerDetail.buyerName:'NA'
          },
        },
        {
          Header: "Company Name",
          accessor: "companyName",
          Cell: (cell) => {
            return  cell.original.buyerDetail &&  cell.original.buyerDetail.companyName?cell.original.buyerDetail.companyName:'NA'
           },
        },
        {
          Header: "Phone Number",
          accessor: "phoneNumber1",
          Cell: (cell) => {
            return  cell.original.buyerDetail &&  cell.original.buyerDetail.phoneNumber1?cell.original.buyerDetail.phoneNumber1:'NA'
           },
        },
        {
          Header: "Total Amt.",
          accessor: "totalAmount",
          Cell: (cell) => {
            return  cell.original.totalAmount? cell.original.totalAmount:'0.00'
          }
        },
        {
          Header: "Paid Amt.",
          accessor: "paidAmount",
          Cell: (cell) => {
            return  cell.original.paidAmount? cell.original.paidAmount:'0.00'
          }
        },
        {
          Header: "Due Amt.",
          accessor: "dueAmount",
          Cell: (cell) => {
            return  cell.original.dueAmount? cell.original.dueAmount:'0.00'
          }
        },
    ]

    return (
     <div>
        <BlockUi tag="div"  blocking={this.state.loading} className="block-overlay-dark" loader={<Spinner/>}>
        <div className="row">
          <div className="col-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <p className="card-title">All Sell</p>
                <p className="card-title2">Total Sell Count: {this.state.allSell.length}</p>
                <Row>
                 {ROLE && ROLE==='SUPER_ADMIN'?
                  <Col md={4}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Select Company / Vendor</label>
                        <select className="form-control form-control-sm" id="exampleFormControlSelect3"
                        onChange={this.handleCompany}
                      //value={this.state.selectedClass? this.state.selectedClass:''}
                      >
                      <option value='All'>All</option>
                      {allCompany.map((data, index)=> 
                      <option key={index} value={data.userInfo.companyId}> {`${data.userInfo.fullName}-(${data.userInfo.companyName})`}</option>
                      )}
                      </select>
                    </Form.Group>
                  </Col>
                 :
                  <Col md={2}>
                  <Form.Group>
                    <Button className="btn btn-primary text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                    onClick={this.SellModelOpen}
                    >New Sell Entry </Button>
                    </Form.Group>
                  </Col>
                  }
                  </Row>
                  <Row>
                  <Col md={2}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Product Name</label>
                        <select className="form-control form-control-sm" id="exampleForm"
                        value={this.state.selectedProductNameId? this.state.selectedProductNameId:''}
                        onChange={this.filterProductName}
                        
                      >
                      <option value=''>Choose product name</option>
                      {this.state.allProductName.length>0 && this.state.allProductName.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                      </select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Product Code</label>
                        <select className="form-control form-control-sm" id="exampleForm"
                         value={this.state.selectedProductCodeId? this.state.selectedProductCodeId:''}
                          onChange={this.filterProductCode}
                      >
                      <option value=''>Choose product code</option>
                        {this.state.allProductCode.length>0 && this.state.allProductCode.map((data, index)=> {return (<option key={`${index}_prodcode`} value={data._id} style={{color:"black"}}>{data.productCode}</option>)} )}
                      </select>
                    </Form.Group>
                  </Col> 
                  <Col md={1}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Length</label>
                        <input className="form-control form-control-sm" id="exampleForm"
                         value={this.state.selectedLength? this.state.selectedLength:''}
                        onChange={this.filterByLength}
                      >
                      </input>
                    </Form.Group>
                  </Col>  
                  <Col md={1}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Breadth</label>
                        <input className="form-control form-control-sm" id="exampleForm"
                         value={this.state.selectedBreadth? this.state.selectedBreadth:''}
                         onChange={this.filterByBreadth}
                      >
                      </input>
                    </Form.Group>
                  </Col> 
                  <Col md={1}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Height</label>
                        <input className="form-control form-control-sm" id="exampleForm"
                         value={this.state.selectedHeight? this.state.selectedHeight:''}
                         onChange={this.filterByHeight}
                      >
                      </input>
                    </Form.Group>
                  </Col> 
                  <Col md={2}>
                    <Form.Group>
                      <label htmlFor="exampleFormControlSelect3">Phone Number</label>
                        <input className="form-control form-control-sm" id="exampleForm"
                        placeholder="Enter phone number"
                         value={this.state.selectedPhone? this.state.selectedPhone:''}
                         onChange={this.filterByPhoneNumber}
                      >
                      </input>
                    </Form.Group>
                  </Col>  
                  <Col md={2}>
                  <Form.Group>
                    <Button className="btn btn-warning text-white btn-sm mb-3 py-2" style={{fontWeight:"100", color:"black"}}
                    onClick={this.clearFilter}
                    >Clear Filter </Button>
                    </Form.Group>
                  </Col>
                </Row>
                <ReactTable
                data={this.state.allSell}
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
            show={this.state.sellModal}
            size={"lg"}
            onHide={this.handleCloseSellModel}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Sell Details Enter </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading2}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                {this.state.userPurchaseHistory.length>0?<h5 onClick={this.togleSellHistory} style={{ cursor: 'pointer' }} className="text-dark d-flex justify-content-left">See History</h5>:null}
                <AvForm onValidSubmit={this.handleSubmit}>
                  <h3 className="text-dark d-flex justify-content-center">Customer Details</h3>
                    <Row>
                          <Col md={3}>
                          <AvField name="phoneNumber1" label="Phone Number" placeholder="Phone Number"
                              onChange={this.handleSearchChange} value={this.state.text}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: ' '
                              },
                              maxLength: {
                                value: 10,
                                errorMessage: ' '
                              },
                              minLength: {
                                value: 10,
                                errorMessage: ' '
                              },
                              pattern: {
                                value:/^[0-9]+$/,
                                errorMessage: ` `
                              }
                            }} 
                        />
                         {this.renderSuggestions()}
                    </Col>
                    <Col md={3}>
                    <AvField name="buyerName" label="Buyer Name" placeholder="Buyer Name"
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.buyerName) ?selectedPurchaser.buyerDetail.buyerName:'' }
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
                    <Col md={2}>
                    <AvField name="companyName" label="Company Name" placeholder="Company Name" 
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.companyName)?selectedPurchaser.buyerDetail.companyName:'' }
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        minLength: {
                          value: 4,
                          errorMessage: 'Invalid Company name.'
                        },
                        maxLength: {
                          value: 35,
                          errorMessage: 'Invalid Company name.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z\s]*$/,
                          errorMessage: `Invalid Company name.`
                        }
                    }} />
                     </Col>
                     <Col md={2}>
                    <AvField name="natureOfBussiness" label="Nature of Bussiness" placeholder="Nature of Bussiness"
                     value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.natureOfBussiness)?selectedPurchaser.buyerDetail.natureOfBussiness:'' }  
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z-0-9\s]*$/,
                          errorMessage: `Invalid Nature of Bussiness.`
                        }
                    }} />
                     </Col>
                     <Col md={2}>
                    <AvField name="address" label="Address" placeholder="Address"
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.address)?selectedPurchaser.buyerDetail.address:'' }   
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                  
                        }} />
                     </Col>
                     {/* <Col>
                     <AvField type="select" name="productCodeId" label="Product Code" placeholder="Product Code" 
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                    }} >
                      <option value=''>Choose product code</option>
                        {this.state.allProductCode.length>0 && this.state.allProductCode.map((data, index)=> {return (<option key={`${index}_prodcode`} value={data._id} style={{color:"black"}}>{data.productCode}</option>)} )}
                      </AvField>
                     </Col> */}
                    </Row>

                    <h3 className="text-dark d-flex justify-content-center">Product Details</h3>
                    <Form>
                      <Form.Check 
                        type="switch"
                        id='sizeRequired'
                        label={this.state.sizeRequired===true?'Size Required':'Size Not Required'}
                        checked={this.state.sizeRequired}
                        onChange={this.handleRequiredSize}
                      />
                    </Form>
                    {this.state.sellProductList.map((productData,index)=>
                      <>
                      <Row key={`sellProductIndex_${index}`}>
                      <Col md={4} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        {/* <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          type='select' name= {`sellProduct[${index}].productNameId`}  label ="Product Name" placeholder="Product Name"
                          value={!!productData && !!productData.productNameId? productData.productNameId: null}
                          onChange={(e)=>this.changeSellSelectOption(index, e, 'productNameId')}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                          }} 
                          >
                        <option value=''>Choose product name</option>
                        {this.state.inventoryData.length>0 && this.state.inventoryData.map((data, index)=> {return (<option key={`${index}_prodname`} value={data.productNameId} style={{color:"black"}}>{data.productNameId}-{data.unit}-{data.length}</option>)} )}
                        </AvField> */}
                        <Select 
                            //style={{"display": "block","marginLeft": "9.5px",'float':'right',menu: provided => ({ ...provided, zIndex: 999999 })}}
                            placeholder="Product Name"
                            options={this.state.inventoryData}
                            maxMenuHeight={150}
                            value={this.state.inventoryData.length>0?this.state.inventoryData.find(it=>it._id===productData.inventoryId):''}
                            onChange={(e)=>this.changeSellSelectOption(index, e, 'inventoryId')}
                        />  
                      </Col>
                      {/* <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          type='select' name= {`sellProduct[${index}].productNameId`}  label ="Product Name" placeholder="Product Name"
                          value={!!productData && !!productData.productNameId? productData.productNameId: null}
                          onChange={(e)=>this.changeSellSelectOption(index, e, 'productNameId')}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                        }} 
                        >
                        <option value=''>Choose product name</option>
                        {this.state.allProductName.length>0 && this.state.allProductName.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                        </AvField>  
                      </Col> */}
                      {/* <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                     <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                      type="select" name={`sellProduct[${index}].productCodeId`} label="Product Code" placeholder="Product Code"
                      value={!!productData && !!productData.productCodeId? productData.productCodeId: null}
                      onChange={(e)=>this.changeSellSelectOption(index, e, 'productCodeId')}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                    }} >
                      <option value=''>Choose product code</option>
                        {this.state.allProductCode.length>0 && this.state.allProductCode.map((data, index)=> {return (<option key={`${index}_prodcode`} value={data._id} style={{color:"black"}}>{data.productCode}</option>)} )}
                      </AvField>
                     </Col> */}
                     </Row>
                     <Row>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].qty`}  label ="No of Units" placeholder="No of Units"
                          value={!!productData && !!productData.qty? productData.qty:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'qty') }
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+$',
                              errorMessage: `Invalid qty number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name= {`sellProduct[${index}].length`}  label ="Length" placeholder="0.00"
                        value={!!productData && !!productData.length? productData.length:0.00}
                        min={0}
                        max={400}
                        disabled={true}
                        //   validate={{
                        //     required: {
                        //         value: this.state.sizeRequired,
                        //         errorMessage: 'This field is required.'
                        //     }, 
                        //     pattern: {
                        //       value:'^[0-9]+(\\.[0-9]{2})?$',
                        //       errorMessage: `Invalid length number.`
                        //     }
                        // }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name= {`sellProduct[${index}].breadth`}  label ="Breadth" placeholder="0.00"
                          value={!!productData && !!productData.breadth? productData.breadth:0.00}
                          min={0}
                          max={200}
                          disabled={true}
                        //   validate={{
                        //     required: {
                        //         value: this.state.sizeRequired,
                        //         errorMessage: 'This field is required.'
                        //     }, 
                        //     pattern: {
                        //       value:'^[0-9]+(\\.[0-9]{2})?$',
                        //       errorMessage: `Invalid breadth number.`
                        //     }
                        // }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}}  >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name= {`sellProduct[${index}].height`}  label ="Height" placeholder="0.00"
                        value={!!productData && !!productData.height? productData.height:0.00}
                        min={0}
                        max={20}
                        disabled={true}
                        //   validate={{
                        //     required: {
                        //         value: this.state.sizeRequired,
                        //         errorMessage: 'This field is required.'
                        //     },
                        //     pattern: {
                        //       value:'^[0-9]+(\\.[0-9]{2})?$',
                        //       errorMessage: `Invalid height number.`
                        //     }
                        // }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                            type="text" name={`sellProduct[${index}].unit`} label="Unit" 
                            value={!!productData && !!productData.unit? productData.unit:''}
                            onChange={(e)=>this.changeSellSelectOption(index, e, 'unit')}
                            disabled={true}
                          //     validate={{
                          //     required: {
                          //         value: true,
                          //         errorMessage: 'This field is required.'
                          //     }
                          // }} 
                          >
                        {/* <option value=''>Choose unit</option>
                        {unitOption.map((data, ind)=> {return (<option key={ind} style={{color:"black"}}>{data.label}</option>)} )} */}
                        </AvField>
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].weight`}  label ="Per Unit Weight" placeholder="0.00"
                          value={!!productData && !!productData.weight? productData.weight:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          //disabled={true}
                          onChange={ this.updateField(index, 'weight') }
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid weight`
                            },
                        }} 
                        />
                      </Col >
                      <Col md={2} style={{color: productData.weightColor?productData.weightColor:null,paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].weighted`}  label ="Actual Total Weight" placeholder="0.00"
                          value={!!productData && !!productData.weighted? productData.weighted:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'weighted') }
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid weight.`
                            }
                        }} 
                        />
                      </Col >
                        <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField  style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].rate`}  label ="Rate" placeholder="0.00"
                          value={!!productData && !!productData.rate? productData.rate:0.00}
                          onKeyUp={ e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'rate') }
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid rate number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField  style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].lineAmount`}  label ="Amount" placeholder="Amount"
                          //value={this.state[`lineAmount${index}`]}
                          value={!!productData && !!productData.lineTotal? productData.lineTotal:0.00}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount`
                            }
                          }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" onClick={this.removeRow(index)}>
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                    </Row>
                      </>
                    )}
                    <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={this.addMoreRow}>
                          Add More
                        </button>
                    </div>
                      <Row>
                      <Col md={2}>
                        <AvField name="vehicleNumber"  label ="Vehical Detail" placeholder="Vehical Detail"
                        />
                      </Col>
                      <Col md={2}>
                        <AvField name="totalWeight"  label ="Total Weight" placeholder="Total Weight"
                          value={parseFloat(this.state.totalWeight).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Weight .`
                            }
                        }} 
                        />
                      </Col>
                      {this.state.oldDueAmount && Number(this.state.oldDueAmount)>0 &&
                        <Col md={2}>
                        <AvField name="oldDueAmount"  label ="Old Due Amount" placeholder="Old Due Amount"
                          className='text-danger'
                          style={{'textWeight':900}}
                          value={parseFloat(this.state.oldDueAmount).toFixed(2)}
                          disabled={true}
                          // validate={{
                          //   required: {
                          //       value: true,
                          //       errorMessage: 'This field is required.'
                          //   },
                          //   pattern: {
                          //     value:'^[0-9]+(\\.[0-9]{2})?$',
                          //     errorMessage: `Invalid Weight .`
                          //   }
                          // }} 
                        />
                        </Col>
                      }
                      </Row>
                    <Row>
                    <Col md={3} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name="Select payment option"  label ="&nbsp;&nbsp;&nbsp;" placeholder="Select Payment Option"
                          disabled={true}
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                         name="totalPaidAmount"  label ="Total Paid Amount" placeholder="Total Paid Amount"
                          value={parseFloat(this.state.totalPaidAmount).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="dueAmount"  label ="Due Amount" placeholder="0.00"
                        value={parseFloat(this.state.dueAmount).toFixed(2)}
                        disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="discountAmount"  label ="Discount Amount" placeholder="0.00"
                        //value={this.state.dueAmount}
                        onKeyUp={this.calculateDiscountAmount}
                          validate={{
                            // required: {
                            //     value: true,
                            //     errorMessage: 'This field is required.'
                            // },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="loadingCharge"  label ="Loading Charge" placeholder="0.00"
                        //value={this.state.dueAmount}
                        onKeyUp={this.calculateLoadingCharge}
                          validate={{
                            // required: {
                            //     value: true,
                            //     errorMessage: 'This field is required.'
                            // },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="totalAmount"  label ="Grand Total Amount" placeholder="0.0"
                          value={parseFloat(this.state.totalAmount).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                    </Row>
                    {this.state.paymentList.map((paymentData,index)=>
                      <>
                       <Row>
                       <Col md={4}>
                          <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                              type="select" name={`payment[${index}].payMode`} label="Select Pay" 
                              value={!!paymentData && !!paymentData.payMode? paymentData.payMode:null}
                              onChange={(e)=>this.changePaymentOption(index, e, 'payMode')}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose pay</option>
                        <option style={{color:"black"}} value='Cash'>Cash</option>
                        {this.state.allPayOptions.map((data, index)=> {return (<option key={index} value={data._id} style={{color:"black"}}>
                          {data.payMethod==='BANK'?`${data.payOptionInfo.bankName} (${data.payOptionInfo.accountNumber})` :`${data.payOptionInfo.upiType} (${data.payOptionInfo.upiId})`}
                          </option>)} )}
                        <option style={{color:"green"}} value='createNewPayment'>New Payment</option>
                        </AvField>
                      </Col>
                      <Col md={2}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                            name={`payment[${index}].amount`}  label ="Enter amount" placeholder="0.00"
                            value={!!paymentData && !!paymentData.amount? paymentData.amount:0.00}
                            onKeyUp={ e => this.calculatePaymentField(e, index) }
                            onChange={ this.updatePaymentField(index, 'amount') }
                            validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid amount number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={3} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                      <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                          <button type="button" className="btn btn-gradient-danger btn-sm" onClick={()=>this.removePaymentRow(index)}>
                          Remove Payment Row
                        </button>
                        </Form.Group>
                      </Col>
                      </Row>
                      </>
                      )}
                        <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-success btn-sm" onClick={this.addMorePayment}>
                          Add More Payment
                        </button>
                      </div>
                    <Row>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button type="submit">Submit</Button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button variant="dark" 
                        onClick={this.handleCloseSellModel}
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
            show={this.state.editSellModal}
            size={"lg"}
            onHide={this.handleCloseSellEditModel}
            aria-labelledby="contained-modal-title-vcenter"
            animation="true"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>{ROLE && ROLE==='SUPER_ADMIN'?'View':'EDit'} Sell Details </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <BlockUi tag="div" blocking={this.state.loading4}  className="block-overlay-dark"  loader={<Spinner/>}>
            <div className="card">
                <div className="card-body">
                <AvForm ref={c=>(this.form= c)} model={formData} onValidSubmit={this.handleEditSubmit}>
                  <h3 className="text-dark d-flex justify-content-center">Customer Details</h3>
                    <Row>
                          <Col md={3}>
                          <AvField name="phoneNumber1" label="Phone Number" placeholder="Phone Number"
                              onChange={this.handleSearchChange} value={this.state.text}
                              disabled={ROLE && ROLE==='SUPER_ADMIN'}
                            validate={{
                              required: {
                                  value: true,
                                  errorMessage: ' '
                              },
                              maxLength: {
                                value: 10,
                                errorMessage: ' '
                              },
                              minLength: {
                                value: 10,
                                errorMessage: ' '
                              },
                              pattern: {
                                value:/^[0-9]+$/,
                                errorMessage: ` `
                              }
                            }} 
                        />
                         {this.renderSuggestions()}
                    </Col>
                    <Col md={3}>
                    <AvField name="buyerName" label="Buyer Name" placeholder="Buyer Name"
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.buyerName) ?selectedPurchaser.buyerDetail.buyerName:'' }
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
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
                    <Col md={2}>
                    <AvField name="companyName" label="Company Name" placeholder="Company Name" 
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.companyName)?selectedPurchaser.buyerDetail.companyName:'' }
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        minLength: {
                          value: 4,
                          errorMessage: 'Invalid Company name.'
                        },
                        maxLength: {
                          value: 35,
                          errorMessage: 'Invalid Company name.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z\s]*$/,
                          errorMessage: `Invalid Company name.`
                        }
                    }} />
                     </Col>
                     <Col md={2}>
                    <AvField name="natureOfBussiness" label="Nature of Bussiness" placeholder="Nature of Bussiness"
                     value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.natureOfBussiness)?selectedPurchaser.buyerDetail.natureOfBussiness:'' }  
                     disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                        pattern: {
                          value:  /^[a-zA-Z][a-zA-Z-0-9\s]*$/,
                          errorMessage: `Invalid Nature of Bussiness.`
                        }
                    }} />
                     </Col>
                     <Col md={2}>
                    <AvField name="address" label="Address" placeholder="Address"
                        value={(selectedPurchaser && selectedPurchaser.buyerDetail && selectedPurchaser.buyerDetail.address)?selectedPurchaser.buyerDetail.address:'' }   
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        },
                  
                    }} />
                     </Col>
                    </Row>
                    <h3 className="text-dark d-flex justify-content-center">Product Details</h3>
                    {this.state.sellProductList.map((productData,index)=>
                      <>
                      <Row key={`sellProductIndex_${index}`}>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          type='select' name= {`sellProduct[${index}].productNameId`}  label ="Product Name" placeholder="Product Name"
                          value={!!productData && !!productData.productNameId? productData.productNameId: null}
                          onChange={(e)=>this.changeSellSelectOption(index, e, 'productNameId')}
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            }
                        }} 
                        >
                        <option value=''>Choose product name</option>
                        {this.state.allProductNameData.length>0 && this.state.allProductNameData.map((data, index)=> {return (<option key={`${index}_prodname`} value={data._id} style={{color:"black"}}>{data.productName}</option>)} )}
                        </AvField>  
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                     <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                      type="select" name={`sellProduct[${index}].productCodeId`} label="Product Code" placeholder="Product Code"
                      value={!!productData && !!productData.productCodeId? productData.productCodeId: null}
                      onChange={(e)=>this.changeSellSelectOption(index, e, 'productCodeId')}
                      disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        validate={{
                        required: {
                            value: true,
                            errorMessage: 'This field is required.'
                        }
                    }} >
                      <option value=''>Choose product code</option>
                        {this.state.allProductCodeData && this.state.allProductCodeData.length>0 && this.state.allProductCodeData.map((data, index)=> {return (<option key={`${index}_prodcode`} value={data._id} style={{color:"black"}}>{data.productCode}</option>)} )}
                      </AvField>
                     </Col>
                     </Row>
                     <Row>
                     <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].qty`}  label ="No of Units" placeholder="No of Units"
                          value={!!productData && !!productData.qty? productData.qty:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'qty') }
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+$',
                              errorMessage: `Invalid qty number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name= {`sellProduct[${index}].length`}  label ="Length" placeholder="0.00"
                        value={!!productData && !!productData.length? productData.length:0.00}
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        min={0}
                        max={400}
                          validate={{
                            required: {
                                value: this.state.sizeRequired,
                                errorMessage: 'This field is required.'
                            }, 
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid length number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name= {`sellProduct[${index}].breadth`}  label ="Breadth" placeholder="0.00"
                          value={!!productData && !!productData.breadth? productData.breadth:0.00}
                          min={0}
                          max={200}
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: this.state.sizeRequired,
                                errorMessage: 'This field is required.'
                            }, 
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid breadth number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}}  >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name= {`sellProduct[${index}].height`}  label ="Height" placeholder="0.00"
                        value={!!productData && !!productData.height? productData.height:0.00}
                        min={0}
                        max={20}
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: this.state.sizeRequired,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid height number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                            type="select" name={`sellProduct[${index}].unit`} label="Unit" 
                            value={!!productData && !!productData.unit? productData.unit:null}
                            onChange={(e)=>this.changeSellSelectOption(index, e, 'unit')}
                            disabled={ROLE && ROLE==='SUPER_ADMIN'}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              }
                          }} >
                        <option value=''>Choose unit</option>
                        {unitOption.map((data, index)=> {return (<option key={index} style={{color:"black"}}>{data.label}</option>)} )}
                        </AvField>
                      </Col>
                      <Col md={2} style={{ paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].weight`}  label ="Per Unit Weight" placeholder="0.00"
                          value={!!productData && !!productData.weight? productData.weight:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'weight') }
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid weight number.`
                            }
                        }} 
                        />
                      </Col >
                      <Col md={2} style={{color: productData.weightColor?productData.weightColor:null,paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].weighted`}  label ="Actual Total Weight" placeholder="0.00"
                          value={!!productData && !!productData.weighted? productData.weighted:0.00}
                          onKeyUp={  e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'weighted') }
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid weight.`
                            }
                        }} 
                        />
                      </Col >
                        <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField  style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].rate`}  label ="Rate" placeholder="0.00"
                          value={!!productData && !!productData.rate? productData.rate:0.00}
                          onKeyUp={ e => this.calculateField(e, index) }
                          onChange={ this.updateField(index, 'rate') }
                          disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid rate number.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <AvField  style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                          name={`sellProduct[${index}].lineAmount`}  label ="Amount" placeholder="Amount"
                          //value={this.state[`lineAmount${index}`]}
                          value={!!productData && !!productData.lineTotal? productData.lineTotal:0.00}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount`
                            }
                          }} 
                        />
                      </Col>
                      <Col md={1} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                          <Form.Group>
                            <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" onClick={this.removeRow(index)}
                            disabled={ROLE && ROLE==='SUPER_ADMIN'}
                            >
                            Remove
                        </button>
                        </Form.Group>
                      </Col>
                    </Row>
                      </>
                    )}
                    <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-primary btn-sm" onClick={this.addMoreRow}
                         disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        >
                          Add More
                        </button>
                    </div>
                      <Row>
                      <Col md={2}>
                        <AvField name="vehicleNumber"  label ="Vehical Detail" placeholder="Vehical Detail"
                        />
                      </Col>
                      <Col md={2}>
                        <AvField name="totalWeight"  label ="Total Weight" placeholder="Total Weight"
                          value={parseFloat(this.state.totalWeight).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Weight .`
                            }
                        }} 
                        />
                      </Col>
                      </Row>
                    <Row>
                    <Col md={3} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="Select payment options"  label ="&nbsp;&nbsp;&nbsp;" placeholder="Select Payment Options"
                          disabled={true}
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="totalPaidAmount"  label ="Total Paid Amount" placeholder="Total Paid Amount"
                          value={parseFloat(this.state.totalPaidAmount).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={1}style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="dueAmount"  label ="Due Amount" placeholder="0.00"
                        value={parseFloat(this.state.dueAmount).toFixed(2)}
                        disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2}style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="discountAmount"  label ="Discount Amount" placeholder="0.00"
                        //value={this.state.dueAmount}
                        onKeyUp={this.calculateDiscountAmount}
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                          validate={{
                            // required: {
                            //     value: true,
                            //     errorMessage: 'This field is required.'
                            // },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2} style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="loadingCharge"  label ="Loading Charge" placeholder="0.00"
                        //value={this.state.dueAmount}
                        onKeyUp={this.calculateLoadingCharge}
                          validate={{
                            // required: {
                            //     value: true,
                            //     errorMessage: 'This field is required.'
                            // },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                      <Col md={2}style={{paddingLeft:'3px',paddingRight:'3px'}}>
                        <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                        name="totalAmount"  label ="Grand Total Amount" placeholder="0.0"
                          value={parseFloat(this.state.totalAmount).toFixed(2)}
                          disabled={true}
                          validate={{
                            required: {
                                value: true,
                                errorMessage: 'This field is required.'
                            },
                            pattern: {
                              value:'^[0-9]+(\\.[0-9]{2})?$',
                              errorMessage: `Invalid Amount.`
                            }
                        }} 
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={8}>
                        {this.state.paymentList.map((paymentData,index)=>
                        <>
                        <Row>
                        <Col md={5}>
                            <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                                type="select" name={`payment[${index}].payMode`} label="Select Pay" 
                                value={!!paymentData && !!paymentData.payMode? paymentData.payMode:null}
                                onChange={(e)=>this.changePaymentOption(index, e, 'payMode')}
                                disabled={ROLE && ROLE==='SUPER_ADMIN'}
                                validate={{
                                required: {
                                    value: true,
                                    errorMessage: 'This field is required.'
                                }
                            }} >
                          <option value=''>Choose pay</option>
                          <option style={{color:"black"}} value='Cash'>Cash</option>
                          {paymentOption.map((data, index)=>{return (<option key={`old${index}`} value={data.value} >{data.label}</option>)})}
                            {this.state.allPayOptions.map((data, index)=> {return (
                          <option key={index} value={data._id} style={{color:"black"}}>
                            {data.payMethod==='BANK'?`${data.payOptionInfo.bankName} (${data.payOptionInfo.accountNumber})` :`${data.payOptionInfo.upiType} (${data.payOptionInfo.upiId})`}
                          </option>)} )}
                          </AvField>
                        </Col>
                        <Col md={3}>
                          <AvField style={{paddingLeft:'6px',paddingRight:'6px', paddingTop:'4px', paddingBottom:'4px'}}
                              name={`payment[${index}].amount`}  label ="Enter amount" placeholder="0.00"
                              value={!!paymentData && !!paymentData.amount? paymentData.amount:0.00}
                              onKeyUp={ e => this.calculatePaymentField(e, index) }
                              onChange={ this.updatePaymentField(index, 'amount') }
                              disabled={ROLE && ROLE==='SUPER_ADMIN'}
                              validate={{
                              required: {
                                  value: true,
                                  errorMessage: 'This field is required.'
                              },
                              pattern: {
                                value:'^[0-9]+(\\.[0-9]{2})?$',
                                errorMessage: `Invalid amount number.`
                              }
                          }} 
                          />
                        </Col>
                        <Col md={4} style={{paddingLeft:'3px',paddingRight:'3px'}} >
                        <Form.Group>
                              <label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                            <button type="button" className="btn btn-gradient-danger btn-sm" onClick={()=>this.removePaymentRow(index)}
                            disabled={ROLE && ROLE==='SUPER_ADMIN'}
                            >
                            Remove Payment Row
                          </button>
                          </Form.Group>
                        </Col>
                        </Row>
                        </>
                        )}
                      </Col>
                      {ROLE && ROLE==='ADMIN' &&       
                      <Col md={4}>
                        <AvField type='password' name="actionPassword" label="Password" placeholder="Password"
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                            },
                          }} 
                          />
                      </Col>
                      }
                    </Row>
                        <div className="d-flex mb-3">
                        <button type="button" className="btn btn-gradient-success btn-sm" onClick={this.addMorePayment}
                        disabled={ROLE && ROLE==='SUPER_ADMIN'}
                        >
                          Add More Payment
                        </button>
                      </div>
                    <Row>
                      
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button type="submit"
                         disabled={ROLE && ROLE==='SUPER_ADMIN'}
                         >Submit</Button>
                        </div>
                        <div className="col-md-6 d-flex justify-content-center">
                        <Button variant="dark" 
                        onClick={this.handleCloseSellEditModel}
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
            show={this.state.deleteSellModal}
            // size={"lg"}
            onHide={this.handleCloseDeleteModel}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Delete Sell Detail</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Card>
                <Card.Body>
                  <Card.Text>Are you want to sure delete this sell detail?
                  </Card.Text>
                  <AvForm ref={c=>(this.form= c)}  onValidSubmit={this.deleteHandle}>
                    {ROLE && ROLE==='ADMIN'  &&
                      <AvField type='password' name="actionPassword" label="Password" placeholder="Password"
                          validate={{
                          required: {
                              value: true,
                              errorMessage: 'This field is required.'
                          },
                        }} 
                      />
                    }
                  <Row>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button  variant="danger"  type="submit"
                       >Delete</Button>
                      </div>
                      <div className="col-md-6 d-flex justify-content-center">
                      <Button variant="dark" 
                        onClick={this.handleCloseDeleteModel}
                       >Cancel</Button>
                      </div>
                  </Row>
                </AvForm>
                </Card.Body>
              </Card>
            </Modal.Body>
          </Modal>

          {/* Product detail model */}
          <Modal
            show={this.state.showProductModal}
            size={"lg"}
            onHide={this.showProductClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Product Detail Report</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                 <ReactTable
                data={this.state.selectedCell.sellInfo && this.state.selectedCell.sellInfo.length>0?this.state.selectedCell.sellInfo:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={productColumn}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={5}
                showPageSizeOptions={false}
                showPageJump={false}
              />
            </Modal.Body>
          </Modal>
          <Modal
            show={this.state.showSellHistoryModal}
            size={"lg"}
            onHide={this.togleSellHistory}
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>USer Purchase History Report (Previous Purchase Due Amount= {this.state.oldDueAmount})</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                 <ReactTable
                data={this.state.userPurchaseHistory && this.state.userPurchaseHistory.length>0?this.state.userPurchaseHistory:[]}
                className='-striped -highlight'
                // className='-highlight'
                columns={sellHistoryColumn}
                defaultSorted={[{ id: "created", desc: true }]}
                pageSize={5}
                showPageSizeOptions={false}
                showPageJump={false}
              />
            </Modal.Body>
          </Modal>
        </div>
    )
  }
}

export default Sell