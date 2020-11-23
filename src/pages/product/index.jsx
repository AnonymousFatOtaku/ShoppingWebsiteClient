// 商品管理路由
import React, {Component} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'

import Product from './product'
import ProductInfo from './product-info'
import ProductAddUpdate from './product-addupdate'

export default class Index extends Component {
  render() {
    return (
      <Switch>
        <Route path='/product' component={Product} exact/>
        <Route path='/product/info' component={ProductInfo}/>
        <Route path='/product/addupdate' component={ProductAddUpdate}/>
        <Redirect to='/product'/>
      </Switch>
    )
  }
}