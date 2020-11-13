// 后台管理主路由头部组件
import React, {Component} from "react";
import {withRouter} from 'react-router-dom'
import {Modal} from 'antd'
import {formateDate} from '../../utils/dateUtils'
import {reqWeather} from '../../api'
import menuUtils from "../../utils/menuUtils";
import cookieUtils from "../../utils/cookieUtils";
import './admin-header.less';

class AdminHeader extends Component {

  state = {
    currentTime: formateDate(Date.now()), // 当前时间字符串
    wea: '', // 天气
    city: '', // 城市
    tem: '', // 温度
  }

  // 根据当前路径获取顶部标题
  getTitle = () => {
    // 得到当前请求路径
    const path = this.props.location.pathname
    let title
    menuUtils.forEach(item => {
      if (item.path === path) { // 如果当前item对象的path和当前路径一样说明item的name就是需要显示的title
        title = item.name
      } else if (item.children) {// 如果有子菜单则在所有子item中查找匹配的path
        const cItem = item.children.find(cItem => path.indexOf(cItem.path) === 0)
        if (cItem) {// 如果有值说明有匹配的
          title = cItem.name
        }
      }
    })
    return title
  }

  // 获取当前天气
  getWeather = async () => {
    // 调用接口请求异步获取数据
    const {wea, city, tem} = await reqWeather()
    // 更新状态
    this.setState({wea, city, tem})
  }

  // 获取当前时间
  getTime = () => {
    // 每隔1s获取当前时间并更新状态数据currentTime
    this.intervalId = setInterval(() => {
      const currentTime = formateDate(Date.now())
      this.setState({currentTime})
    }, 1000)
  }

  // 退出登录
  logout = () => {
    // 显示确认框
    Modal.confirm({
      content: '是否确认退出?',
      onOk: () => {
        // 删除保存的user数据和token
        cookieUtils.removeUserCookie()
        localStorage.removeItem('token')
        console.log(localStorage.getItem('token'))
        // 跳转到login
        this.props.history.replace('/AdminLogin')
      }
    })
  }

  // 第一次render()之后执行一次，一般在此执行异步操作：发ajax请求/启动定时器
  componentDidMount() {
    // 获取当前时间
    this.getTime()
    // 获取当前天气
    this.getWeather()
  }

  // 当前组件卸载之前调用
  componentWillUnmount() {
    // 清除定时器
    clearInterval(this.intervalId)
  }

  render() {

    const {currentTime, wea, city, tem} = this.state
    const username = cookieUtils.getUserCookie().username
    const title = this.getTitle()

    return (
      <div className="adminHeader">
        <div className="adminHeader-userInfo">
          <span>欢迎，{username}</span>
          <a onClick={this.logout}>退出</a>
        </div>
        <div className="adminHeader-pageInfo">
          <div className="adminHeader-pageInfo-title">{title}</div>
          <div className="adminHeader-pageInfo-time">
            <span>{currentTime}</span>
            <span style={{marginLeft: 10, marginRight: 10}}>{city}</span>
            <span>{wea}</span>
            <span style={{marginLeft: 10, marginRight: 10}}>{tem}°</span>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(AdminHeader)