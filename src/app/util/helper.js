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