 const localhost = window.location.host.includes("localhost")
 const PROD_API_URL = process.env.REACT_APP_API_URL_PROD
 const LOCAL_API_URL = process.env.REACT_APP_API_URL_LOCAL

export const SETTING = {
    APP_CONSTANT : {
    API_URL:localhost?LOCAL_API_URL:PROD_API_URL,
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
