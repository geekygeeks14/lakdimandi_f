
console.log(" window location", window.location.origin.includes("localhost"))
//let api_url= 'https://yaduwanshi.cyclic.app/api/'
//let api_url= 'https://yaduwanshiback.cyclic.app/api/'
let api_url= window.location.origin.includes("localhost")?"http://localhost:3010/api/":"https://yaduwanshiback.cyclic.app/api/"
export const SETTING = {
    APP_CONSTANT : {
    //    API_URL: process.env.REACT_APP_API_URL,
    //    IMAGE_URL: process.env.REACT_APP_IMAGE_URL
       //API_URL: "http://localhost:3010/api/",
    API_URL:api_url,
    },
    HEADER_PARAMETERS: {
        'Accept': '*/*',
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': '*'
    },
    token: localStorage.getItem('token'),
}
