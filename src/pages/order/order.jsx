// 订单管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form, message} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqDeleteOrder, reqOrders, reqSearchOrders} from "../../api/index";
import cookieUtils from "../../utils/cookieUtils";

export default class Order extends Component {

  state = {
    orders: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'productId', // 根据哪个字段搜索
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
      {
        title: '操作',
        render: (order) => (
          <span>
            <a>查看详情&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a>修改订单&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.deleteOrder(order)}>删除订单</a>
          </span>
        )
      },
    ];
  }

  // 获取订单列表数据显示
  getOrders = async () => {
    this.setState({loading: true}) // 显示loading
    const {searchName, searchType} = this.state
    console.log(searchName, searchType)
    let result
    if (searchName) { // 如果搜索关键字有值说明要做搜索
      result = await reqSearchOrders({searchName, searchType})
    } else {
      result = await reqOrders()
    }
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result != undefined && result.status === 0) {
      // 取出数据，更新状态，显示列表
      const orders = result.data
      this.setState({
        orders: orders
      })
    }
  }

  // 删除订单
  deleteOrder = (order) => {
    console.log(order)
    Modal.confirm({
      title: `确认删除编号为${order.pk_order_id}的订单吗?`,
      onOk: async () => {
        const result = await reqDeleteOrder(order.pk_order_id)
        if (result.status === 0) {
          message.success('删除订单成功')
          this.getOrders()
        }
      }
    })
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
          <Option value='productId'>根据订单id搜索</Option>
          <Option value='userId'>根据用户id搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        <Button type='primary' onClick={() => this.getOrders()}>搜索</Button>
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