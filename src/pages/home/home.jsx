// 首页路由
import React, {Component} from 'react'
import {
  Card,
  Statistic,
  DatePicker,
  Timeline
} from 'antd'
import {
  QuestionCircleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import moment from 'moment'

import Line from './home-line'
import Bar from './home-bar'
import './home.less'

const dateFormat = 'YYYY/MM/DD'
const {RangePicker} = DatePicker

export default class Home extends Component {

  state = {
    selected: true // 判断选中的菜单栏，true为访问量，false为销售量
  }

  handleChange = (selected) => {
    return () => this.setState({selected})
  }

  componentDidMount() {
    document.title = "后台主页"
  }

  render() {
    const {selected} = this.state

    // 下方整体框架顶部左侧点击菜单
    const hcTitle = (
      <div className="home-bottom-menu">
        <span className={selected ? "home-bottom-menu-selected" : ""} onClick={this.handleChange(true)}
              style={{marginRight: 40}}>访问量</span>
        <span className={selected ? "" : "home-bottom-menu-selected"} onClick={this.handleChange(false)}>销售量</span>
      </div>
    )

    // 下方整体框架顶部右侧时间选择框
    const hcExtra = (
      <RangePicker defaultValue={[moment('2020/01/01', dateFormat), moment('2020/12/31', dateFormat)]}
                   format={dateFormat}/>
    )

    return (
      <div className='home'>
        {/* 顶部左侧商品总量 */}
        <Card className="home-top-card" title="商品总量" extra={<QuestionCircleOutlined/>}
              headStyle={{color: 'grey'}}>
          <Statistic value={1128163} suffix="个" style={{fontWeight: 'bolder'}}/>
          <Statistic value={15} valueStyle={{fontSize: 16}} prefix={'周同比'}
                     suffix={<div>%<ArrowDownOutlined style={{color: 'red'}}/></div>}/>
          <Statistic value={10} valueStyle={{fontSize: 16}} prefix={'日同比'}
                     suffix={<div>%<ArrowUpOutlined style={{color: 'green'}}/></div>}/>
        </Card>
        {/* 顶部右侧折线图 */}
        <Line/>
        {/* 下方整体框架 */}
        <Card className="home-bottom-card" title={hcTitle} extra={hcExtra}>
          {/* 下方左侧柱状图 */}
          <Card className="home-bottom-card-left" title={selected ? '访问趋势' : '销售趋势'}
                bodyStyle={{padding: 0, height: 352}} extra={<ReloadOutlined/>}>
            <Bar/>
          </Card>
          {/* 下方右侧时间轴 */}
          <Card title='任务' extra={<ReloadOutlined/>} className="home-bottom-card-right">
            <Timeline>
              <Timeline.Item color="green">新版本迭代会</Timeline.Item>
              <Timeline.Item color="green">完成网站设计初版</Timeline.Item>
              <Timeline.Item color="red">
                <p>联调接口</p>
                <p>功能验收</p>
              </Timeline.Item>
              <Timeline.Item>
                <p>登录功能设计</p>
                <p>权限验证</p>
                <p>页面排版</p>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Card>
      </div>
    )
  }
}