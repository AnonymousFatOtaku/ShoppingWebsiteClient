// 用户管理路由
import React, {Component} from "react";
import {
  Button,
  Card,
  Space,
  Table,
  Modal,
  Select,
  Input,
  Form,
  message,
  InputNumber,
  DatePicker,
  ConfigProvider
} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
import {formateDate} from "../../utils/dateUtils"
import {reqPromotions, reqAddOrUpdatePromotion} from "../../api/index";
import './promotion.less'

const {TextArea} = Input;
const {RangePicker} = DatePicker;

export default class User extends Component {

  state = {
    promotions: [], // 所有活动列表
    visible: false, // 添加/修改窗口是否可见
  };

  formRef = React.createRef();

  // 初始化列
  initColumns = () => {
    this.columns = [
      {
        title: '活动ID',
        dataIndex: 'pk_promotion_id'
      },
      {
        title: '活动名',
        dataIndex: 'name'
      },
      {
        title: '活动描述',
        dataIndex: 'description'
      },
      {
        title: '折扣',
        dataIndex: 'discount',
        render: (discount) => discount + '%'
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        render: formateDate
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        render: formateDate
      },
      {
        title: '创建时间',
        dataIndex: 'gmt_create',
        render: formateDate
      },
      {
        title: '修改时间',
        dataIndex: 'gmt_modified',
        render: formateDate
      },
      {
        title: '操作',
        render: (promotion) => (
          <span>
            <a onClick={() => this.showUpdate(promotion)}>修改活动&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.deletePromotion(promotion)}>删除活动</a>
          </span>
        )
      },
    ]
  }

  // 获取所有活动
  getPromotions = async () => {
    const result = await reqPromotions()
    console.log(result)
    if (result.status === 0) {
      const promotions = result.data
      this.setState({
        promotions
      })
    }
  }

  // 显示添加界面
  showAdd = () => {
    this.promotion = null
    this.setState({
      visible: true
    })
  }

  // 显示修改界面
  showUpdate = (promotion) => {
    this.promotion = promotion
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    // 重置表单所有内容
    this.formRef.current.resetFields()
    this.setState({
      visible: false,
    })
  }

  // 添加/修改活动
  addOrUpdatePromotion = async () => {
    // 收集输入数据
    let {name, description, discount, time} = this.formRef.current.getFieldsValue({promotion: Object})
    if (time === undefined) {
      message.error('活动时间不能为空');
      return
    }
    let start_time = time[0].format('YYYY-MM-DD HH:MM:SS'), end_time = time[1].format('YYYY-MM-DD HH:MM:SS')
    console.log(name, description, discount, start_time, end_time)

    // 新增之前先判定新增的活动是否已存在
    const {promotions} = this.state
    for (let i = 0; i < promotions.length; i++) {
      if (name === promotions[i].name) {
        message.error('该活动已存在');
        return
      }
    }

    // 校验活动名格式
    if (name === null || name === undefined || name.indexOf(' ') === 0 || name === "") {
      message.error('活动名不能为空或以空格开头');
      return
    }
    // 校验折扣格式
    if (discount === null || discount === undefined || discount === "") {
      message.error('折扣格式不正确');
      return
    }
    if (description === undefined) {
      description = ""
    }
    // 校验开始/结束时间格式
    let timeReg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    if (!timeReg.test(start_time) || start_time === undefined) {
      message.error('开始时间格式不正确');
      return
    }
    if (!timeReg.test(end_time) || end_time === undefined) {
      message.error('结束时间格式不正确');
      return
    }

    let promotion = {name, description, discount, start_time, end_time}
    // 重置所有输入内容
    this.formRef.current.resetFields()
    // 提交添加的请求
    const result = await reqAddOrUpdatePromotion(promotion)
    // 若添加成功则刷新列表显示
    if (result.status === 0) {
      message.success(`${this.promotion ? '修改' : '添加'}活动成功`)
      this.getPromotions()
    }

    this.setState({
      visible: false
    })
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getPromotions()
  }

  render() {

    let {promotions, visible} = this.state
    console.log(promotions)

    let promotion = this.promotion || {}
    console.log(promotion)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary' onClick={this.showAdd}>新增活动</Button>
      </div>
    )

    // 设置默认的起始日期
    const disabledDate = (current) => {
      // console.log(current)
      return current < moment().startOf('second');
    }

    return (
      <ConfigProvider locale={locale}>
        <Card title={title}>
          <Table columns={this.columns} dataSource={promotions} bordered style={{height: 613}}
                 pagination={{defaultPageSize: 8}}/>
          <Modal title={promotion.pk_promotion_id ? '修改活动' : '新增活动'} visible={visible} onOk={this.addOrUpdatePromotion}
                 onCancel={this.handleCancel} destroyOnClose>
            <Form preserve={false} ref={this.formRef}>
              <Form.Item name="name" label="活动名：">
                <Input placeholder="请输入活动名(15字以内)" maxLength={15}/>
              </Form.Item>
              <Form.Item name="description" label="活动描述：">
                <TextArea rows={4} placeholder="请输入活动描述(100字以内)" maxLength={100}/>
              </Form.Item>
              <Form.Item name="discount" label="折扣：">
                <InputNumber min={0} max={99} formatter={value => `${value}%`} parser={value => value.replace('%', '')}
                             style={{width: 402}}/>
              </Form.Item>
              <Form.Item name="time" label="活动时间：">
                <RangePicker showTime style={{width: 402}} disabledDate={disabledDate}/>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </ConfigProvider>
    )
  }
}