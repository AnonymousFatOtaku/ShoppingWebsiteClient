// 订单管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form, message, InputNumber} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqLogs} from "../../api/index";

export default class Order extends Component {

  state = {
    logs: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'productId', // 根据哪个字段搜索
  };

  formRef = React.createRef();

  initColumns = () => {
    this.columns = [
      {
        title: '日志ID',
        dataIndex: 'pk_log_id',
      },
      {
        title: '操作类型',
        dataIndex: 'operate_type',
      },
      {
        title: '操作内容',
        dataIndex: 'operate_content',
      },
      {
        title: '操作人id',
        dataIndex: 'fk_user_id',
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
  getLogs = async () => {
    this.setState({loading: true}) // 显示loading
    const {searchName, searchType} = this.state
    console.log(searchName, searchType)
    let result
    if (searchName) { // 如果搜索关键字有值说明要做搜索
      // result = await reqSearchOrders({searchName, searchType})
    } else {
      result = await reqLogs()
    }
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result != undefined && result.status === 0) {
      // 取出数据，更新状态，显示列表
      const logs = result.data
      this.setState({
        logs: logs
      })
    }
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getLogs()
  }

  render() {

    // 取出状态数据
    const {loading, logs, searchType, searchName} = this.state
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
        <Table columns={this.columns} dataSource={logs} bordered rowKey='pk_log_id' loading={loading}
               style={{height: 613}}
               pagination={{
                 current: this.pageNum, defaultPageSize: 8, showQuickJumper: true, onChange: this.getOrders
               }}/>
      </Card>
    )
  }
}