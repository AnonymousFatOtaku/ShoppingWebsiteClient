// 订单管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form, message, InputNumber} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqAddLog, reqDeleteOrder, reqOrders, reqSearchOrders, reqUpdateOrder} from "../../api/index";
import cookieUtils from "../../utils/cookieUtils";

export default class Order extends Component {

  state = {
    orders: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'orderId', // 根据哪个字段搜索
    visible: false,
    buttonLoading: false, // 按钮是否转圈
    confirmLoading: false, // 表单按钮是否转圈
  };

  formRef = React.createRef();

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
            <a onClick={async () => {
              this.props.history.push('/order/info', {order})
              await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了id为' + order.pk_order_id + '的订单详情', cookieUtils.getUserCookie().pk_user_id)
            }}>查看详情&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.showUpdate(order)}>修改订单&nbsp;&nbsp;&nbsp;&nbsp;</a>
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
      this.setState({
        buttonLoading: true
      })
      result = await reqSearchOrders({searchName, searchType})
      if (searchType === 'orderId') {
        await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了订单id为' + searchName + '的订单', cookieUtils.getUserCookie().pk_user_id)
      } else if (searchType === 'userId') {
        await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了用户id为' + searchName + '的订单', cookieUtils.getUserCookie().pk_user_id)
      }
      this.setState({
        buttonLoading: false
      })
    } else {
      result = await reqOrders()
      await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了全部订单', cookieUtils.getUserCookie().pk_user_id)
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
        await reqAddLog(1, cookieUtils.getUserCookie().username + '删除了id为' + order.pk_order_id + '的订单', cookieUtils.getUserCookie().pk_user_id)
        if (result.status === 0) {
          message.success('删除订单成功')
          this.getOrders()
        }
      }
    })
  }

  // 显示修改界面
  showUpdate = (order) => {
    this.order = order // 保存order
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    // 重置表单所有内容
    this.formRef.current.resetFields()
    this.setState({
      visible: false,
    });
  };

  // 修改订单
  updateOrder = async () => {
    // 收集输入数据
    const order = this.formRef.current.getFieldsValue({order: Object})

    // 判定是否是修改，如果是修改则要给未改动的参数赋原值
    if (this.order) {
      if (order.name === undefined) {
        order.name = this.order.name
      }
      if (order.phone === undefined) {
        order.phone = this.order.phone
      }
      if (order.address === undefined) {
        order.address = this.order.address
      }
      if (order.payment === undefined) {
        order.payment = this.order.payment
      }
      if (order.pk_order_id === undefined) {
        order.pk_order_id = this.order.pk_order_id
      }
    }
    console.log(order, this.order)

    let phoneReg = /^1[3456789]\d{9}$/
    // 对所有输入内容依次进行验证，验证不通过不关闭窗口且不执行任何操作
    if (!phoneReg.test(order.phone)) {
      message.error('手机号格式不正确');
      this.setState({
        visible: true
      })
    } else if (order.payment === null) {
      message.error('请输入订单总价');
      this.setState({
        visible: true
      })
    } else if (order.payment < 0 || order.payment > 100000000) {
      message.error('订单总价不能小于0或大于1亿');
      this.setState({
        visible: true
      })
    } else { // 所有验证都通过才执行修改操作

      this.setState({
        confirmLoading: true
      })

      // 重置所有输入内容
      this.formRef.current.resetFields()
      // 提交添加的请求
      const result = await reqUpdateOrder(order.name, order.phone, order.address, order.payment, order.pk_order_id)
      await reqAddLog(2, cookieUtils.getUserCookie().username + '修改了id为' + order.pk_order_id + '的订单', cookieUtils.getUserCookie().pk_user_id)
      // 刷新列表显示
      if (result.status === 0) {
        message.success(`订单${order.pk_order_id}修改成功`)
        this.getOrders()
      }
      this.setState({
        visible: false,
        confirmLoading: false,
      })
    }
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getOrders()
  }

  render() {

    // 取出状态数据
    const {loading, orders, searchType, searchName, visible, buttonLoading, confirmLoading} = this.state
    let order = this.order || {}
    console.log(order)
    const {Option} = Select;

    // 顶部左侧搜索栏
    const title = (
      <span>
        <Select style={{width: 200, marginRight: 20}} value={searchType}
                onChange={value => this.setState({searchType: value})}>
          <Option value='orderId'>根据订单id搜索</Option>
          <Option value='userId'>根据用户id搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        <Button type='primary' onClick={() => this.getOrders()} loading={buttonLoading}>搜索</Button>
      </span>
    )

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={orders} bordered rowKey='pk_order_id' loading={loading}
               style={{height: 613}}
               pagination={{
                 current: this.pageNum, showQuickJumper: true, onChange: this.getOrders
               }}/>
        <Modal title='修改订单' visible={visible} onOk={this.updateOrder} onCancel={this.handleCancel} destroyOnClose
               confirmLoading={confirmLoading}>
          <Form preserve={false} ref={this.formRef}>
            <Form.Item name="name" label="买家名字：">
              <Input placeholder="请输入买家名字" style={{width: 400, float: "right"}} defaultValue={order.name}
                     maxLength={15}/>
            </Form.Item>
            <Form.Item name="phone" label="买家电话：" rules={[
              {min: 11, max: 11, message: '手机号长度应为11位'},
              {pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确'},
            ]}>
              <Input placeholder="请输入买家电话" style={{width: 400, float: "right"}} defaultValue={order.phone}
                     maxLength={11}/>
            </Form.Item>
            <Form.Item name="address" label="买家地址：">
              <Input placeholder="请输入买家地址" style={{width: 400, float: "right"}} defaultValue={order.address}
                     maxLength={100}/>
            </Form.Item>
            <Form.Item name="payment" label="订单总价：">
              <InputNumber placeholder="请输入订单总价" style={{width: 400, float: "right"}} defaultValue={order.payment}
                           maxLength={12}/>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    )
  }
}