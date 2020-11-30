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
  ConfigProvider,
  Transfer
} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import locale from 'antd/lib/locale/zh_CN';
import {formateDate} from "../../utils/dateUtils"
import {
  reqPromotions,
  reqAddOrUpdatePromotion,
  reqDeletePromotion,
  reqPromotionProducts,
  reqProducts,
  reqSetPromotionProducts,
} from "../../api/index";
import './promotion.less'

const {TextArea} = Input;
const {RangePicker} = DatePicker;

export default class User extends Component {

  state = {
    promotions: [], // 所有活动列表
    visible: false, // 添加/修改窗口是否可见
    visibleProducts: false, // 活动商品窗口是否可见
    mockData: [],
    targetKeys: [],
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
        title: '活动状态',
        render: (promotion) => {
          let curDate = new Date();
          curDate = formateDate(curDate)
          let startTime = formateDate(promotion.start_time), endTime = formateDate(promotion.end_time)
          // console.log(startTime, endTime, curDate)
          if (startTime > curDate) { // 开始时间晚于当前时间
            return (<span>未开始</span>)
          }
          if (endTime < curDate) { // 结束时间早于当前时间
            return (<span style={{color: "red"}}>已结束</span>)
          }
          return (<span style={{color: "green"}}>进行中</span>)
        }
      },
      {
        title: '操作',
        render: (promotion) => (
          <span>
            <a onClick={() => this.showUpdate(promotion)}>修改活动&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.showProducts(promotion)}>设置活动商品&nbsp;&nbsp;&nbsp;&nbsp;</a>
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

  // 显示活动商品界面
  showProducts = (promotion) => {
    this.promotion = promotion
    this.setState({
      visibleProducts: true
    })
    this.getMock(promotion)
  }

  handleCancel = () => {
    // 重置表单所有内容
    this.formRef.current.resetFields()
    this.setState({
      visible: false,
      visibleProducts: false,
    })
  }

  // 添加/修改活动
  addOrUpdatePromotion = async () => {
    // 收集输入数据
    let {name, description, discount, time} = this.formRef.current.getFieldsValue({promotion: Object})
    console.log(name, description, discount, time)

    // 如果是修改则对未修改参数赋初始值
    if (this.promotion) {
      console.log(this.promotion)
      if (name === undefined) {
        name = this.promotion.name
      }
      if (description === undefined) {
        description = this.promotion.description
      }
      if (discount === undefined) {
        discount = this.promotion.discount
      }
      if (time === undefined) {
        time = "未修改"
      }
    }
    console.log(name, description, discount, time)

    if (time === undefined || time === null) {
      message.error('活动时间不能为空');
      return
    }
    let start_time, end_time
    if (time !== "未修改") {
      start_time = time[0].format('YYYY-MM-DD HH:mm:ss')
      end_time = time[1].format('YYYY-MM-DD HH:mm:ss')
    } else {
      start_time = formateDate(this.promotion.start_time)
      end_time = formateDate(this.promotion.end_time)
    }
    console.log(name, description, discount, start_time, end_time)

    // 新增之前先判定新增的活动是否已存在
    if (!this.promotion) {
      const {promotions} = this.state
      for (let i = 0; i < promotions.length; i++) {
        if (name === promotions[i].name) {
          message.error('该活动已存在');
          return
        }
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
    if (this.promotion) {
      promotion.pk_promotion_id = this.promotion.pk_promotion_id
    }
    // 重置所有输入内容
    this.formRef.current.resetFields()
    // 提交添加/修改的请求
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

  // 删除指定活动
  deletePromotion = (promotion) => {
    Modal.confirm({
      title: `确认删除${promotion.name}活动吗?`,
      onOk: async () => {
        const result = await reqDeletePromotion(promotion.pk_promotion_id)
        if (result.status === 0) {
          message.success('删除活动成功')
          this.getPromotions()
        }
      }
    })
  }

  // 获取设置穿梭框数据源
  getMock = async (promotion) => {
    console.log(promotion)
    const targetKeys = [];
    const mockData = [];

    // 获取所有商品和参加选中活动的商品
    const promotionProductsResult = await reqPromotionProducts(promotion.pk_promotion_id)
    const productsResult = await reqProducts()
    console.log(promotionProductsResult.data, productsResult.data)

    // 将参加选中活动的商品id单独保存到数组中方便比对
    let promotionProducts = []
    for (let i = 0; i < promotionProductsResult.data.length; i++) {
      promotionProducts.push(promotionProductsResult.data[i].fk_product_id)
    }
    console.log(promotionProducts)

    // 将所有商品添加到穿梭框中，如果商品id出现在参加选中活动的商品id数组中则默认选中该商品
    for (let i = 0; i < productsResult.data.length; i++) {
      const data = {
        key: productsResult.data[i].pk_product_id,
        title: productsResult.data[i].name,
        chosen: promotionProducts.indexOf(productsResult.data[i].pk_product_id) != -1,
      };
      if (data.chosen) {
        targetKeys.push(data.key);
      }
      mockData.push(data);
    }
    this.setState({mockData, targetKeys});
  };

  filterOption = (inputValue, option) => option.description.indexOf(inputValue) > -1;

  handleChange = targetKeys => {
    this.setState({targetKeys});
  };

  handleSearch = (dir, value) => {
    console.log('search:', dir, value);
  };

  // 设置活动商品
  setPromotionProducts = async () => {
    // 收集输入数据
    let products = this.formRef.current.getFieldsValue({products: Object})
    // console.log(products, products.products)
    // console.log(this.promotion)

    // undefined为未作修改，需获取当前活动商品列表
    if (products.products === undefined) {
      // 获取参加选中活动的商品
      let promotionProductsResult = await reqPromotionProducts(this.promotion.pk_promotion_id)
      // console.log(promotionProductsResult.data)
      // 将参加选中活动的商品id单独保存到数组中
      let promotionProducts = []
      for (let i = 0; i < promotionProductsResult.data.length; i++) {
        promotionProducts.push(promotionProductsResult.data[i].fk_product_id)
      }
      // console.log(promotionProducts)
      products = promotionProducts
    }

    // console.log(products)
    let data = await reqSetPromotionProducts(products, this.promotion.pk_promotion_id)
    message.success('设置活动商品成功')

    this.setState({
      visibleProducts: false
    })
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getPromotions()
  }

  render() {

    let {promotions, visible, visibleProducts} = this.state
    console.log(promotions)

    let promotion = this.promotion || {}
    console.log(promotion)

    // 格式化时间
    let startTime = formateDate(promotion.start_time)
    let endTime = formateDate(promotion.end_time)
    console.log(startTime, endTime)

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
                <Input placeholder="请输入活动名(15字以内)" maxLength={15} defaultValue={promotion.name}/>
              </Form.Item>
              <Form.Item name="description" label="活动描述：">
                <TextArea rows={4} placeholder="请输入活动描述(100字以内)" maxLength={100} defaultValue={promotion.description}/>
              </Form.Item>
              <Form.Item name="discount" label="折扣：">
                <InputNumber min={0} max={99} formatter={value => `${value}%`} parser={value => value.replace('%', '')}
                             style={{width: 402}} defaultValue={promotion.discount}/>
              </Form.Item>
              <Form.Item name="time" label="活动时间：">
                <RangePicker showTime style={{width: 402}} disabledDate={disabledDate}
                             defaultValue={promotion.start_time === undefined ? null : [moment(startTime), moment(endTime)]}/>
              </Form.Item>
            </Form>
          </Modal>
          <Modal title={'设置活动商品'} visible={visibleProducts} onOk={this.setPromotionProducts}
                 onCancel={this.handleCancel} destroyOnClose>
            <Form preserve={false} ref={this.formRef}>
              <Form.Item name="products">
                <Transfer
                  dataSource={this.state.mockData}
                  showSearch
                  filterOption={this.filterOption}
                  targetKeys={this.state.targetKeys}
                  onChange={this.handleChange}
                  onSearch={this.handleSearch}
                  render={item => item.title}
                  listStyle={{
                    width: 300,
                    height: 300,
                  }}
                />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      </ConfigProvider>
    )
  }
}