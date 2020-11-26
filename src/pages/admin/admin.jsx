// 后台管理主路由组件
import React, {Component} from "react";
import {Route, Switch, Redirect} from 'react-router-dom';
import {Layout} from 'antd';
import AdminSider from "../../components/admin-sider/admin-sider";
import AdminHeader from "../../components/admin-header/admin-header";
import Home from "../home/home";
import Category from "../category/category";
import Product from "../product/index";
import Role from "../role/role";
import User from "../user/user";
import Promotion from "../promotion/promotion";
// import Order from "../order/order";
// import UserOrder from "../user-order/user-order";
// import UserProduct from "../user-product/user-product";
import memoryUtils from "../../utils/memoryUtils";
import ProductInfo from '../product/product-info'
// import NotFound from '../not-found/not-found'
import './admin.less';
import {reqRoles} from "../../api";
import cookieUtils from "../../utils/cookieUtils";

const {Header, Footer, Sider, Content} = Layout;

export default class Admin extends Component {

  state = {
    menus: [], // 登录用户的权限数组
  }

  // 获取登录用户的权限数组
  /*getMenus = async () => {
    const result = await reqRoles()
    if (result.status === 0) {
      const roles = result.data
      for (let i = 0; i < roles.length; i++) {
        // console.log(roles[i]._id)
        if (memoryUtils.user.role_id === roles[i]._id) {
          this.setState({
            menus: roles[i].menus
          })
        }
      }
    }
  }*/

  componentDidMount() {
    // this.getMenus()
  }

  render() {
    const user = cookieUtils.getUserCookie()
    // console.log(user)
    // 如果内存没有存储user代表当前没有登录，自动跳转到登录(在render()中)
    if (!user || !user.pk_user_id) {
      return <Redirect to='/AdminLogin'/>
    }

    // const {menus} = this.state

    // console.log(user)
    // console.log(menus)

    return (
      <Layout className="admin">
        <Sider>
          <AdminSider/>
        </Sider>
        <Layout>
          <Header>
            <AdminHeader/>
          </Header>
          <Content className="adminContent">
            <Switch>
              <Redirect from='/' exact to='/home'/>
              <Route path='/home' component={Home}/>
              <Route path='/category' component={Category}>
                {/*  {menus.indexOf("/category") === -1 ? <Redirect to="/home"/> : null}*/}
              </Route>
              <Route path='/product' component={Product}>
                {/*  {menus.indexOf("/product") === -1 ? <Redirect to="/home"/> : null}*/}
              </Route>
              <Route path='/user' component={User}>
                {/*  {menus.indexOf("/user") === -1 ? <Redirect to="/home"/> : null}*/}
              </Route>
              <Route path='/role' component={Role}>
                {/*  {menus.indexOf("/role") === -1 ? <Redirect to="/home"/> : null}*/}
              </Route>
              <Route path='/promotion' component={Promotion}></Route>
              {/*<Route path="/bar" component={Bar}>*/}
              {/*  {menus.indexOf("/bar") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              {/*<Route path="/pie" component={Pie}>*/}
              {/*  {menus.indexOf("/pie") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              {/*<Route path="/line" component={Line}>*/}
              {/*  {menus.indexOf("/line") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              {/*<Route path="/order" component={Order}>*/}
              {/*  {menus.indexOf("/order") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              {/*<Route path="/userProduct" component={UserProduct}>*/}
              {/*  {menus.indexOf("/userProduct") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              {/*<Route path="/userOrder" component={UserOrder}>*/}
              {/*  {menus.indexOf("/userOrder") === -1 ? <Redirect to="/home"/> : null}*/}
              {/*</Route>*/}
              <Route path="/ProductInfo" component={ProductInfo}> </Route>
              {/*<Route component={NotFound}/>*/}
            </Switch>
          </Content>
          <Footer className="adminFooter">欢迎使用后台管理系统</Footer>
        </Layout>
      </Layout>
    )
  }
}