// 商品管理主界面路由
import React, {Component} from "react";
import {Button, Card, Table, Select, Input, message, Modal} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {
  reqProducts,
  reqUpdateStatus,
  reqSearchProducts,
  reqAddLog,
  reqDeleteProduct,
  reqAllCategorys,
} from '../../api'
import {formateDate} from "../../utils/dateUtils";
import cookieUtils from "../../utils/cookieUtils";
import './product.less'

export default class Product extends Component {

  state = {
    total: 0, // 商品的总数量
    products: [], // 商品的数组
    loading: false, // 是否正在加载中
    searchName: '', // 搜索的关键字
    searchType: 'productName', // 根据哪个字段搜索
    categorys: [], // 所有分类列表
    buttonLoading: false, // 按钮是否转圈
    disabled: false, // 上下架按钮是否disabled
  }

  // 初始化table所有列
  initColumns = () => {
    this.columns = [
      {
        title: '商品id',
        dataIndex: 'pk_product_id',
      },
      {
        title: '商品分类',
        render: (product) => {
          // console.log(product.fk_category_id, this.state.categorys)
          for (let i = 0; i < this.state.categorys.length; i++) {
            if (product.fk_category_id === this.state.categorys[i].pk_category_id) {
              return (<span>{this.state.categorys[i].name}</span>)
            }
          }
        }
      },
      {
        title: '商品名',
        dataIndex: 'name',
      },
      {
        title: '商品售价',
        dataIndex: 'price',
        render: (price) => '¥' + price / 100  // 当前指定了对应的属性，传入的是对应的属性值
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
          const {disabled} = this.state
          const {saleable, pk_product_id} = product
          const newStatus = saleable === 0 ? 1 : 0
          return (
            <div style={{textAlign: "center"}}>
              <Button type='primary' onClick={() => this.updateStatus(pk_product_id, newStatus)}
                      disabled={disabled}>
                {saleable === 1 ? '下架' : '上架'}
              </Button>
              <br/>
              <span>{saleable === 1 ? '在售' : '已下架'}</span>
            </div>
          )
        }
      },
      {
        width: 150,
        title: '操作',
        render: (product) => {
          return (
            <span>
              <a onClick={async () => {
                this.props.history.push('/product/info', {product})
                await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了id为' + product.pk_product_id + '的商品详情', cookieUtils.getUserCookie().pk_user_id)
              }}>详情&nbsp;&nbsp;</a>
              <a onClick={() => this.props.history.push('/product/addupdate', product)}>修改&nbsp;&nbsp;</a>
              <a onClick={() => this.deleteProduct(product)}>删除</a>
            </span>
          )
        }
      },
    ];
  }

  // 删除指定商品
  deleteProduct = (product) => {
    console.log(product)
    Modal.confirm({
      title: `确认删除商品'${product.name}'吗?`,
      onOk: async () => {
        if (product.saleable === 1) {
          message.error('不能删除上架商品，请将商品下架后再删除')
        } else {
          const result = await reqDeleteProduct(product.pk_product_id)
          reqAddLog(1, cookieUtils.getUserCookie().username + '删除了id为' + product.pk_product_id + '的商品', cookieUtils.getUserCookie().pk_user_id)
          if (result.status === 0) {
            message.success('删除商品成功')
            this.getProducts()
          }
        }
      }
    })
  }

  // 获取指定页码的列表数据显示
  getProducts = async () => {
    this.setState({loading: true}) // 显示loading
    const {searchName, searchType} = this.state
    let result
    if (searchName) { // 如果搜索关键字有值说明要做搜索
      this.setState({buttonLoading: true})
      result = await reqSearchProducts({searchName, searchType})
      if (searchType === 'productName') {
        await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了商品名为' + searchName + '的商品', cookieUtils.getUserCookie().pk_user_id)
      } else if (searchType === 'categoryName') {
        await reqAddLog(3, cookieUtils.getUserCookie().username + '搜索了分类名称为' + searchName + '的商品', cookieUtils.getUserCookie().pk_user_id)
      }
    } else { // 一般分页请求
      result = await reqProducts()
      await reqAddLog(3, cookieUtils.getUserCookie().username + '查看了全部商品', cookieUtils.getUserCookie().pk_user_id)
    }
    console.log(result)
    this.setState({loading: false}) // 隐藏loading
    if (result.status === 0) {
      // 取出分页数据，更新状态，显示分页列表
      const {total, list} = result.data
      this.setState({
        total,
        products: result.data,
        buttonLoading: false
      })
    }
  }

  // 更新指定商品的状态
  updateStatus = async (productId, status) => {

    this.setState({
      disabled: true
    })

    const result = await reqUpdateStatus(productId, status)
    await reqAddLog(2, cookieUtils.getUserCookie().username + '更新了id为' + productId + '的商品状态', cookieUtils.getUserCookie().pk_user_id)
    if (result.status === 0) {
      message.destroy();
      message.success('更新商品状态成功')
      this.getProducts()
    }

    this.setState({
      disabled: false
    })
  }

  // 异步获取分类列表显示
  getCategorys = async () => {
    // 发异步ajax请求获取数据
    const result = await reqAllCategorys()
    console.log(result)
    // 根据执行结果返回的状态判定是否成功
    const categorys = result.data
    this.setState({
      categorys
    })
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
    this.getCategorys()
  }

  render() {

    // 取出状态数据
    const {products, total, loading, searchType, searchName, buttonLoading} = this.state
    const {Option} = Select;

    // 顶部左侧搜索栏
    const title = (
      <span>
        <Select style={{width: 200, marginRight: 20}} value={searchType}
                onChange={value => this.setState({searchType: value})}>
          <Option value='productName'>按名称搜索</Option>
          <Option value='categoryName'>按分类名称搜索</Option>
        </Select>
        <Input placeholder='关键字' style={{width: 200, marginRight: 20}} value={searchName}
               onChange={event => this.setState({searchName: event.target.value})}/>
        <Button type='primary' onClick={() => this.getProducts(1)} loading={buttonLoading}>搜索</Button>
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
        <Table bordered rowKey='pk_product_id' loading={loading} dataSource={products} columns={this.columns}
               pagination={{current: this.pageNum, total, showQuickJumper: true, onChange: this.getProducts}}
               style={{height: 613}}/>
      </Card>
    )
  }
}