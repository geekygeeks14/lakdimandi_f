const CryptoJS = require('crypto-js');

export const logoutFunc=(errData)=>{
    if(errData && errData.response && errData.response.data && errData.response.data.message && 
        (   errData.response.data.message==='LOGOUT'
            || errData.response.data.message==='Not Authorized' 
            || errData.response.data.message ==='jwt expired'
        )
    ){
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