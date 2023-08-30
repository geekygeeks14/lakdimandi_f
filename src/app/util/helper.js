import { SETTING } from "../app-config/cofiguration";
import Axios from "axios";
const CryptoJS = require('crypto-js');
const os = require('os');
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
const activityTypeList =['Login', 'Logout', 'Update','Create/Add','Delete','Menu Log','Event Log','Status Change','Suspended company', 'Error Log']

const getIpAdress= ()=>{
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      const ipAddress = data.ip;
     return ipAddress
    })
    .catch(error => {
      console.error('ipAddress Error:', error);
      return 'N/A'
    });
}
const getDevice=()=>{
  const platform = os.platform();

  console.log('Platform:', platform);

  // Get the operating system type (e.g., 'Windows_NT', 'Linux', 'Darwin')
  const osType = os.type();
  console.log('Operating System Type:', osType);

  // Get the operating system release version (e.g., '10.0.19043', '5.4.0-84-generic', '20.6.0')
  const release = os.release();
  console.log('Release Version:', release);

  // Get the CPU architecture (e.g., 'x64', 'arm64')
  const arch = os.arch();
  console.log('CPU Architecture:', arch);

  // Get information about the available CPUs
  const cpus = os.cpus();
  console.log('CPU Information:', cpus);

  // Get the total memory (in bytes) on the system
  const totalMemory = os.totalmem();
  console.log('Total Memory:', totalMemory, 'bytes');

  // Get the free memory (in bytes) on the system
  const freeMemory = os.freemem();
  console.log('Free Memory:', freeMemory, 'bytes');

  // Get the hostname of the system
  const hostname = os.hostname();
  console.log('Hostname:', hostname);

  return release

}

export const logoutFunc=(errData)=>{
    if(errData.response && errData.response.status===401){
        localStorage.clear()
        window.location.href = '/login'
    }
    // else if(!errData || !errData.response || !errData.response.data || !errData.response.data.message){
    //     window.location.href = '/login'
    // }
}

export const capitalize=(sentance)=>{ 
    sentance = sentance.replace(/ +(?= )/g,'')
     if(sentance.length===0) return ""
    const words = sentance.split(" "); 
    const capitalizeWord = words.map((word) => { 
        if(word.trim().length>0) return word[0].toUpperCase() + (word.substring(1)? word.substring(1).trim().length>0 ? word.substring(1).trim().toLowerCase():'':''); 
    }).join(" "); 
    return capitalizeWord
 }

 export const encryptAES = (text, SECRET_MSG) => {
    return CryptoJS.AES.encrypt(text, SECRET_MSG).toString();
  }

  export const convertMilliSecToHrMints=(milliseconds=0)=> {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const formattedHours = ("0" + hours).slice(-2); // Ensures a leading zero if needed
    const formattedMinutes = ("0" + minutes).slice(-2); // Ensures a leading zero if needed
    return formattedHours + ":" + formattedMinutes;
}

export const groupedData =(data, key) => {
    console.log("data", key)
    data.reduce((acc, obj) => {
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export const saveSecuirityLogs= async(menuUrl, activityType, message='')=>{
  let dataToSend={
    message: message,
    menuUrl: menuUrl,
    activity_type: activityType, 
    userId: USER._id, 
    ipAdress: getIpAdress(),
    device: getDevice()
  }

  let options = SETTING.HEADER_PARAMETERS;
  options['Authorization'] = localStorage.getItem("token")
  await Axios.post(SETTING.APP_CONSTANT.API_URL+`secuirity/save`,dataToSend,{headers: options})
  .then((res) => {
     // console.log("resss", res)
  })
  .catch((err) =>{
    console.log("errror", err)
  });

}


