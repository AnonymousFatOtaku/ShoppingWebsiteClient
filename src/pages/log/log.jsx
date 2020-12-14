// 日志管理路由
import React, {Component} from "react";
import {Button, Card, Table, Select, Input, DatePicker, Space, ConfigProvider,} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
import {formateDate} from "../../utils/dateUtils"
import {reqAddLog, reqLogs, reqSearchLogs} from "../../api/index";
import cookieUtils from "../../utils/cookieUtils";

const {RangePicker} = DatePicker;

export default class Order extends Component {

  state = {
    logs: [], // 所有订单列表
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'logId', // 根据哪个字段搜索
    date: null, // 日期
    current: 1, // 当前页码
    buttonLoading: false, // 按钮是否转圈
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
        render: (operate_type) => {
          if (operate_type === 0) {
            return <span>添加</span>
          } else if (operate_type === 1) {
            return <span>删除</span>
          } else if (operate_type === 2) {
            return <span>修改</span>
          } else if (operate_type === 3) {
            return <span>查询</span>
          } else if (operate_type === 4) {
            return <span>登录</span>
          } else if (operate_type === 5) {
            return <span>注册</span>
          } else if (operate_type === 6) {
            return <span>退出</span>
          }
        }
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

      this.setState({
        buttonLoading: true
      })

      let startTime, endTime
      if (date) {
        // 格式化时间
        startTime = date[0].format('YYYY-MM-DD')
        endTime = date[1].format('YYYY-MM-DD')
        console.log(startTime, endTime)
      }
      console.log(searchName, searchType, startTime, endTime)
      result = await reqSearchLogs({searchName, searchType, startTime, endTime})
      if (searchName && !date) { // 仅根据关键字搜索
        if (searchType === 'logId') {
          const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了日志id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
        } else if (searchType === 'operateType') {
          const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了操作类型为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
        } else if (searchType === 'userId') {
          const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了操作人id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
        }
      } else if (date && !searchName) { // 仅根据日期搜索
        if (startTime === endTime) {
          const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '的日志', cookieUtils.getUserCookie().pk_user_id)
        } else {
          const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '至' + endTime + '之间的日志', cookieUtils.getUserCookie().pk_user_id)
        }
      } else { // 同时根据关键字和日期搜索
        if (startTime === endTime) {
          if (searchType === 'logId') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '日志id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          } else if (searchType === 'operateType') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '操作类型为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          } else if (searchType === 'userId') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '操作人id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          }
        } else {
          if (searchType === 'logId') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '至' + endTime + '日志id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          } else if (searchType === 'operateType') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '至' + endTime + '操作类型为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          } else if (searchType === 'userId') {
            const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了' + startTime + '至' + endTime + '操作人id为' + searchName + '的日志', cookieUtils.getUserCookie().pk_user_id)
          }
        }
      }

      this.setState({
        buttonLoading: false
      })
    } else {
      result = await reqLogs()
      const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了全部日志', cookieUtils.getUserCookie().pk_user_id)
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

  onChange = page => {
    console.log(page);
    this.setState({
      current: page,
    });
  };

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getLogs()
  }

  render() {

    // 取出状态数据
    const {loading, logs, searchType, searchName, date, buttonLoading} = this.state
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
        <Button type='primary' onClick={() => this.getLogs()} loading={buttonLoading}>搜索</Button>
      </span>
    )

    return (
      <ConfigProvider locale={locale}>
        <Card title={title}>
          <Table columns={this.columns} dataSource={logs} bordered rowKey='pk_log_id' loading={loading}
                 style={{height: 613}}
                 pagination={{
                   current: this.state.current, showQuickJumper: true, onChange: this.onChange
                 }}/>
        </Card>
      </ConfigProvider>
    )
  }
}