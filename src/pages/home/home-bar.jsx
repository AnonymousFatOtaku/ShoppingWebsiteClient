// 首页下方柱状图路由
import React from "react"
import {Chart, Interval} from 'bizcharts';

export default class HomeBar extends React.Component {
  render() {
    const data = [
      {year: '1951 年', sales: 38},
      {year: '1952 年', sales: 52},
      {year: '1956 年', sales: 61},
      {year: '1957 年', sales: 45},
      {year: '1958 年', sales: 48},
      {year: '1959 年', sales: 38},
      {year: '1960 年', sales: 38},
      {year: '1962 年', sales: 38},
    ];
    return (
      <div style={{width: '95%', margin: 20}}>
        <Chart height={330} autoFit data={data}>
          <Interval position="year*sales"/>
        </Chart>
      </div>
    )
  }
}