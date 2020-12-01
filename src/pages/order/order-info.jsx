// 订单管理路由
import React, {Component} from "react";
import {Card, Table,} from 'antd';
import {ArrowLeftOutlined,} from '@ant-design/icons';
import {formateDate} from "../../utils/dateUtils"
import {reqOrderInfo} from "../../api/index";

export default class OrderInfo extends Component {

  state = {
    orderProducts: [], // 所有订单商品列表
    loading: false, // 是否正在加载中
  };

  formRef = React.createRef();

  initColumns = () => {
    this.columns = [
      {
        title: '订单商品id',
        dataIndex: 'pk_order_detail_id',
      },
      {
        title: '订单id',
        dataIndex: 'fk_order_id',
      },
      {
        title: '商品id',
        dataIndex: 'fk_product_id',
      },
      {
        title: '商品名',
        dataIndex: 'name',
      },
      {
        title: '商品单价',
        dataIndex: 'price',
      },
      {
        title: '商品数量',
        dataIndex: 'quantity',
      },
      {
        title: '商品总价',
        dataIndex: 'total_price',
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

  // 获取订单列表数据显示
  getOrders = async (orderId) => {
    this.setState({loading: true}) // 显示loading
    let result = await reqOrderInfo(orderId)
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result != undefined && result.status === 0) {
      // 取出数据，更新状态，显示列表
      const orderProducts = result.data
      this.setState({
        orderProducts: orderProducts
      })
    }
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    let order = this.props.location.state.order
    console.log(order)
    this.getOrders(order.pk_order_id)
  }

  render() {

    // 取出状态数据
    const {loading, orderProducts} = this.state
    console.log(orderProducts)

    const title = (
      <span>
          <ArrowLeftOutlined style={{color: "green", marginRight: 20}} onClick={() => this.props.history.goBack()}/>
        <span>订单详情</span>
      </span>
    )

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={orderProducts} bordered rowKey='pk_order_detail_id' loading={loading}
               style={{height: 620}}
               pagination={{
                 current: this.pageNum, defaultPageSize: 9, showQuickJumper: true, onChange: this.getOrders
               }}/>
      </Card>
    )
  }
}