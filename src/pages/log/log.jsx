// 日志管理路由
import React, {Component} from "react";
import {Button, Card, Table, Select, Input, DatePicker, Space, ConfigProvider,} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
import {formateDate} from "../../utils/dateUtils"
import {reqLogs, reqSearchLogs} from "../../api/index";

const {RangePicker} = DatePicker;

export default class Order extends Component {

  state = {
    logs: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'logId', // 根据哪个字段搜索
    date: null, // 日期
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
    const {searchName, searchType, date} = this.state
    console.log(searchName, searchType, date)

    let result
    if (searchName || date) { // 如果搜索关键字有值说明要做搜索
      let startTime, endTime
      if (date) {
        // 格式化时间
        startTime = date[0].format('YYYY-MM-DD')
        endTime = date[1].format('YYYY-MM-DD')
        console.log(startTime, endTime)
      }
      console.log(searchName, searchType, startTime, endTime)
      result = await reqSearchLogs({searchName, searchType, startTime, endTime})
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
    const {loading, logs, searchType, searchName, date} = this.state
    const {Option} = Select;

    // 设置默认的起始日期
    const disabledDate = (current) => {
      console.log(current)
      return current > moment().endOf('day');
    }

    // 顶部左侧搜索栏
    const title = (
      <span>
        <Select style={{width: 200, marginRight: 20}} value={searchType}
                onChange={value => this.setState({searchType: value})}>
          <Option value='logId'>根据日志id搜索</Option>
          <Option value='operateType'>根据操作类型搜索</Option>
          <Option value='userId'>根据操作人id搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        <RangePicker disabledDate={disabledDate} value={date}
                     onChange={value => this.setState({date: value})}/>&nbsp;&nbsp;&nbsp;&nbsp;
        <Button type='primary' onClick={() => this.getLogs()}>搜索</Button>
      </span>
    )

    return (
      <ConfigProvider locale={locale}>
        <Card title={title}>
          <Table columns={this.columns} dataSource={logs} bordered rowKey='pk_log_id' loading={loading}
                 style={{height: 613}}
                 pagination={{
                   current: this.pageNum, defaultPageSize: 8, showQuickJumper: true, onChange: this.getOrders
                 }}/>
        </Card>
      </ConfigProvider>
    )
  }
}