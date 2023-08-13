import React, { Component } from 'react'
const USER = localStorage.getItem("userInformation") && JSON.parse(localStorage.getItem("userInformation"));
export class BlankPage extends Component {
  componentDidMount(){
    // eslint-disable-next-line no-unused-expressions
    if(USER){
      const roleName= USER.userInfo.roleName
      if(roleName==='TOPADMIN')window.location.href="/dashboard"
      if(roleName!=='TOPADMIN')window.location.href="/adminDashboard"
   

    }else{
      window.location.href="/login"
    }
  }
  render() {
    return (
      <div>
      </div>
    )
  }
}

export default BlankPage
