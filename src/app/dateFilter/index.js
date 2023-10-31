import React from "react";
import Select from "react-select";

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default class DateFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dateOptions: []
        };
    }
    static getDerivedStateFromProps(props, state) {
        const dateOptions = [
            {label:'Till Now', value:''},
            {label:'Today', value:'today'},
            {label:'Yesterday', value:'yesterday'},
            {label:'This Week', value:'this_week'},
            {label:'This Month', value:'this_month'},
            {label:'This Quarter', value:'this_quarter'},
            {label:'Last Week', value:'last_week'},
            {label:'Last Month', value:'last_month'},
            {label:'Last Quarter', value:'last_quarter'},
        ]
        if (props.extraOption) {
            dateOptions.splice(1, 0, props.extraOption)
        }
        let date = new Date(); 
        for(let i= 25; i>0; i--) { 
            let d = new Date(date.setMonth(date.getMonth()-1));
             let fromDate = new Date(d.getFullYear(), d.getMonth(), 1); 
             let toDate = new Date(d.getFullYear(), d.getMonth()+1, 1); 
             let newFilterObject = {label: monthNames[d.getMonth()]+" "+d.getFullYear(), value: "monthlyWise24_"+fromDate.getTime()+"_"+toDate.getTime()} 
             dateOptions.push(newFilterObject); date = d; 
            
        } 
        return {
             dateOptions 
        }
    }
    onChange = e => {
        let selected = e.value.toLowerCase();
        let start = null, end = null;
        if (e.value !== '') {
            start = new Date()
            end = new Date();
            if(selected == 'today') {
                end.setDate(end.getDate() + 1)
            } else if(selected == 'yesterday') {
                start.setDate(start.getDate() - 1)
            } else if(selected == 'this_week') {
                start.setDate(start.getDate() - start.getDay())
                end.setDate(end.getDate() + (7 - end.getDay()))
            } else if(selected == 'this_month') {
                start.setDate(1);
                end.setMonth(end.getMonth() + 1)
                end.setDate(1);
            } else if(selected == 'this_quarter') {
                let quarter = Math.floor((start.getMonth() + 3) / 3);
                start = new Date(start.getFullYear(), (quarter - 1) * 3);
                end = new Date(start.getFullYear(), quarter * 3, 1);
            } else if(selected == 'last_week') {
                let day = start.getDay()
                start = new Date(start.getTime() - 60 * 60 * 24 * 7 * 1000);
                end = new Date(end.getTime() - 60 * 60 * 24 * 7 * 1000);
                start.setDate(start.getDate() - day)
                end.setDate(end.getDate() + (7 - day))
            } else if(selected == 'last_month') {
                start = new Date(start.getFullYear(), start.getMonth() - 1, 1);
                end = new Date(end.getFullYear(), end.getMonth(), 1);
            } else if(selected == 'last_quarter') {
                let quarter = Math.floor((start.getMonth() + 3) / 3) - 1;
                start = new Date(start.getFullYear(), (quarter - 1) * 3);
                end = new Date(end.getFullYear(), quarter * 3, 1);
            } else if(selected.includes("monthlywise24")) {
                let [v, sd, ed] = selected.split("_");
                start = new Date(Number(sd));
                end = new Date(Number(ed));
            }else {
                start = null
                end = null
            }
            if (start && end) {
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
                start.setMilliseconds(0);
        
                end.setHours(0);
                end.setMinutes(0);
                end.setSeconds(0);
                end.setMilliseconds(0);
            }
        }
        this.props.onDateChange && this.props.onDateChange(e, start, end)
    }

    render() {
        const { dateOptions } = this.state
        return (
            <Select 
                style={{"display": "block","marginLeft": "9.5px",'float':'right',menu: provided => ({ ...provided, zIndex: 999999 })}}
                placeholder="Select date"
                options={dateOptions}
                maxMenuHeight={150}
                value={dateOptions.filter((item) => item.value === this.props.value)}
                onChange={this.onChange}
            />
        )
    }
}