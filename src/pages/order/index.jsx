// 订单管理路由
import React, {Component} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'

import Order from './order'
import OrderInfo from './order-info'

export default class Index extends Component {
  render() {
    return (
      <Switch>
        <Route path='/order' component={Order} exact/>
        <Route path='/order/info' component={OrderInfo}/>
        <Redirect to='/order'/>
      </Switch>
    )
  }
}