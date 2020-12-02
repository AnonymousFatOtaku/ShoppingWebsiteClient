// 商品管理主界面路由
import React, {Component} from "react";
import {Button, Card, Table, Select, Input, message} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {reqProducts, reqUpdateStatus, reqSearchProducts, reqAddLog} from '../../api'
import {formateDate} from "../../utils/dateUtils";
import cookieUtils from "../../utils/cookieUtils";

export default class Product extends Component {

  state = {
    total: 0, // 商品的总数量
    products: [], // 商品的数组
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'productName', // 根据哪个字段搜索
  }

  // 初始化table所有列
  initColumns = () => {
    this.columns = [
      {
        title: '商品id',
        dataIndex: 'pk_product_id',
      },
      {
        title: '商品分类id',
        dataIndex: 'fk_category_id',
      },
      {
        title: '商品名',
        dataIndex: 'name',
      },
      {
        title: '商品售价',
        dataIndex: 'price',
        render: (price) => '¥' + price  // 当前指定了对应的属性，传入的是对应的属性值
      },
      {
        title: '创建时间',
        dataIndex: 'gmt_create',
        render: formateDate,
      },
      {
        title: '修改时间',
        dataIndex: 'gmt_modified',
        render: formateDate,
      },
      {
        width: 120,
        title: '状态',
        render: (product) => {
          const {saleable, pk_product_id} = product
          const newStatus = saleable === 0 ? 1 : 0
          return (
            <div style={{textAlign: "center"}}>
              <Button type='primary' onClick={() => this.updateStatus(pk_product_id, newStatus)}>
                {saleable === 1 ? '下架' : '上架'}
              </Button>
              <br/>
              <span>{saleable === 1 ? '在售' : '已下架'}</span>
            </div>
          )
        }
      },
      {
        width: 100,
        title: '操作',
        render: (product) => {
          return (
            <span>
              <a onClick={async () => {
                this.props.history.push('/product/info', {product})
                const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了id为' + product.pk_product_id + '的商品详情', cookieUtils.getUserCookie().pk_user_id)
              }}>详情&nbsp;&nbsp;</a>
              <a onClick={() => this.props.history.push('/product/addupdate', product)}>修改</a>
            </span>
          )
        }
      },
    ];
  }

  // 获取指定页码的列表数据显示
  getProducts = async (pageNum) => {
    this.pageNum = pageNum // 保存pageNum
    this.setState({loading: true}) // 显示loading
    const {searchName, searchType} = this.state
    let result
    if (searchName) { // 如果搜索关键字有值说明要做搜索分页
      result = await reqSearchProducts({searchName, searchType})
      if (searchType === 'productName') {
        const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了商品名为' + searchName + '的商品', cookieUtils.getUserCookie().pk_user_id)
      } else if (searchType === 'categoryId') {
        const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了分类id为' + searchName + '的商品', cookieUtils.getUserCookie().pk_user_id)
      }
    } else { // 一般分页请求
      result = await reqProducts()
      const logResult = await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了全部商品', cookieUtils.getUserCookie().pk_user_id)
    }
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result.status === 0) {
      // 取出分页数据，更新状态，显示分页列表
      const {total, list} = result.data
      this.setState({
        total,
        products: result.data
      })
    }
  }

  // 更新指定商品的状态
  updateStatus = async (productId, status) => {
    const result = await reqUpdateStatus(productId, status)
    const logResult = await reqAddLog(2, cookieUtils.getUserCookie().username + '更新了id为' + productId + '的商品状态', cookieUtils.getUserCookie().pk_user_id)
    if (result.status === 0) {
      message.success('更新商品状态成功')
      this.getProducts(this.pageNum)
    }
  }

  // 为第一次render()准备数据
  componentWillMount() {
    // 初始化table所有列
    this.initColumns()
  }

  // 执行异步任务：发异步ajax请求
  componentDidMount() {
    // 获取显示商品列表第一页
    this.getProducts(1)
  }

  render() {

    // 取出状态数据
    const {products, total, loading, searchType, searchName} = this.state
    const {Option} = Select;

    // 顶部左侧搜索栏
    const title = (
      <span>
        <Select style={{width: 200, marginRight: 20}} value={searchType}
                onChange={value => this.setState({searchType: value})}>
          <Option value='productName'>按名称搜索</Option>
          <Option value='categoryId'>按分类id搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        <Button type='primary' onClick={() => this.getProducts(1)}>搜索</Button>
      </span>
    )

    // 顶部右侧按钮
    const extra = (
      <Button type='primary' icon={<PlusOutlined/>} onClick={() => this.props.history.push('/product/addupdate')}>
        添加商品
      </Button>
    )

    return (
      <Card title={title} extra={extra}>
        <Table bordered rowKey='_id' loading={loading} dataSource={products} columns={this.columns} pagination={{
          current: this.pageNum, total, defaultPageSize: 5, showQuickJumper: true, onChange: this.getProducts
        }} style={{height: 613}}/>
      </Card>
    )
  }
}