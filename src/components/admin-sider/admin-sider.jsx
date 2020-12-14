// 后台管理主路由左侧导航组件
import React, {Component} from "react";
import {Link, Redirect, withRouter} from "react-router-dom";
import {Menu} from 'antd';
import {
  PieChartOutlined,
  BarChartOutlined,
  LineChartOutlined,
  AreaChartOutlined,
  BarsOutlined,
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  ContactsOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import memoryUtils from "../../utils/memoryUtils";
import {reqRights} from '../../api'
import logo from '../../assets/images/logo.gif';
import './admin-sider.less';
import cookieUtils from "../../utils/cookieUtils";


// 子菜单
const {SubMenu} = Menu;

class AdminSider extends Component {

  state = {
    menus: [], // 登录用户的权限数组
  }

  // 获取登录用户的权限数组
  getMenus = async () => {
    const result = await reqRights(cookieUtils.getUserCookie().pk_user_id)
    // console.log(result)
    if (result) {
      let menus = []
      for (let i = 0; i < result.length; i++) {
        menus.push(result[i].fk_right_id)
      }
      this.setState({
        menus: menus
      })
    }
  }

  componentDidMount() {
    this.getMenus()
  }

  render() {

    const {menus} = this.state
    // console.log(menus)

    // 获取当前请求的路由路径
    let path = this.props.location.pathname

    // 二级路由下保持选中一级路由
    if (path === "/product/info" || path === "/product/addupdate") {
      path = "/product"
    }
    if (path === "/order/info") {
      path = "/order"
    }

    // 在刷新后保持当前选中的子菜单项所在菜单列表为展开状态
    if (path === "/category" || path === "/product") {
      this.openKey = "/products"
    } else if (path === "/bar" || path === "/line" || path === "/pie") {
      this.openKey = "/charts"
    }

    return (
      <div className="adminSider">
        <Link to='/' className="adminSider-header">
          <img src={logo} alt="logo"/>
          <h3>{memoryUtils.user.role_id === "5f7463560e955025a8439b56" ? "维纳斯商城" : "管理后台"}</h3>
        </Link>
        <Menu selectedKeys={[path]} defaultOpenKeys={[this.openKey]} mode="inline" theme="dark">
          {menus.indexOf(1) != -1 ?
            <Menu.Item key="/home" icon={<HomeOutlined/>}>
              <Link to='/home'>
                首页
              </Link>
            </Menu.Item> : null}
          {menus.indexOf(3) != -1 ?
            <SubMenu key="/products" icon={<AppstoreOutlined/>} title="商品">
              <Menu.Item key="/category" icon={<DatabaseOutlined/>}>
                <Link to='/category'>
                  品类管理
                </Link>
              </Menu.Item>
              <Menu.Item key="/product" icon={<ShoppingCartOutlined/>}>
                <Link to='/product'>
                  商品管理
                </Link>
              </Menu.Item>
            </SubMenu> : null}
          {menus.indexOf(8) != -1 ?
            <Menu.Item key="/user" icon={<UserOutlined/>}>
              <Link to='/user'>
                用户管理
              </Link>
            </Menu.Item> : null}
          {menus.indexOf(13) != -1 ?
            <Menu.Item key="/role" icon={<ContactsOutlined/>}>
              <Link to='/role'>
                角色管理
              </Link>
            </Menu.Item> : null}
          {menus.indexOf(18) != -1 ?
            <Menu.Item key="/order" icon={<BarsOutlined/>}>
              <Link to='/order'>
                订单管理
              </Link>
            </Menu.Item> : null}
          {menus.indexOf(23) != -1 ?
            <Menu.Item key="/promotion" icon={<BarsOutlined/>}>
              <Link to='/promotion'>
                活动管理
              </Link>
            </Menu.Item> : null}
          {menus.indexOf(28) != -1 ?
            <Menu.Item key="/log" icon={<BarsOutlined/>}>
              <Link to='/log'>
                日志管理
              </Link>
            </Menu.Item> : null}
        </Menu>
      </div>
    )
  }
}

// withRouter是高阶组件，用来包装非路由组件返回一个新的组件，新的组件向非路由组件传递3个属性:history/location/match
export default withRouter(AdminSider)