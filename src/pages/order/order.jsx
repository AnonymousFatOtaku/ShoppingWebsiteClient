// 订单管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqOrders, reqSearchOrders} from "../../api/index";

export default class Order extends Component {

  state = {
    orders: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'productName', // 根据哪个字段搜索
  };

  initColumns = () => {
    this.columns = [
      {
        title: '订单id',
        dataIndex: 'pk_order_id',
      },
      {
        title: '用户id',
        dataIndex: 'fk_user_id',
      },
      {
        title: '买家名字',
        dataIndex: 'name',
      },
      {
        title: '买家电话',
        dataIndex: 'phone',
      },
      {
        title: '买家地址',
        dataIndex: 'address',
      },
      {
        title: '订单总价',
        dataIndex: 'payment',
      },
      {
        title: '订单状态',
        dataIndex: 'status',
      },
      {
        title: '下单时间',
        dataIndex: 'order_time',
        render: (orderTime) => formateDate(orderTime)
      },
      {
        title: '创建时间',
        dataIndex: 'gmt_create',
        render: (orderTime) => formateDate(orderTime)
      },
      {
        title: '修改时间',
        dataIndex: 'gmt_modified',
        render: (orderTime) => formateDate(orderTime)
      },
    ];
  }

  // 获取指定页码的订单列表数据显示
  getOrders = async (pageNum) => {
    this.pageNum = pageNum // 保存pageNum
    this.setState({loading: true}) // 显示loading
    const {searchName, searchType} = this.state
    let result
    if (searchName) { // 如果搜索关键字有值说明要做搜索分页
      result = await reqSearchOrders({pageNum, pageSize: 9, searchName, searchType})
    } else { // 一般分页请求
      result = await reqOrders()
    }
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result.status === 0) {
      // 取出分页数据，更新状态，显示分页列表
      const orders = result.data
      this.setState({
        orders: orders
      })
    }
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getOrders(1)
  }

  render() {

    // 取出状态数据
    const {loading, orders, searchType, searchName} = this.state
    const {Option} = Select;

    // 顶部左侧搜索栏
    const title = (
      <span>
        <Select style={{width: 200, marginRight: 20}} value={searchType}
                onChange={value => this.setState({searchType: value})}>
          <Option value='productName'>按名称搜索</Option>
          <Option value='username'>按用户搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        {/*<Button type='primary' onClick={() => this.getOrders(1)}>搜索</Button>*/}
      </span>
    )

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={orders} bordered rowKey='pk_order_id' loading={loading}
               style={{height: 613}}
               pagination={{
                 current: this.pageNum, defaultPageSize: 9, showQuickJumper: true, onChange: this.getOrders
               }}/>
      </Card>
    )
  }
}