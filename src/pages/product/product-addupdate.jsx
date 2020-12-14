// 商品添加、修改路由
import React, {Component} from 'react'
import {Card, Input, Form, Cascader, message, Button} from 'antd';
import {ArrowLeftOutlined,} from '@ant-design/icons';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import PicturesWall from './pictures-wall'
import RichTextEditor from './rich-text-editor'
import {reqCategorys, reqAddOrUpdateProduct, reqCategory, reqAddLog} from '../../api'
import cookieUtils from "../../utils/cookieUtils";

export default class ProductAddUpdate extends Component {

  state = {
    options: [],
    buttonLoading: false, // 按钮是否转圈
  };

  constructor(props) {
    super(props)
    // 创建用来保存ref标识的标签对象的容器
    this.pw = React.createRef()
    this.editor = React.createRef()
  }

  // 初始化商品分类菜单
  initOptions = async (categorys) => {
    console.log(categorys)
    // 根据分类生成options数组
    const options = categorys.map(c => ({
      value: c.pk_category_id,
      label: c.name,
      isLeaf: false, // 通过isLeaf判断是否有子集
    }))
    // 如果是一个二级分类商品的更新
    const {isUpdate, product} = this
    console.log(isUpdate, product)
    const {fk_category_id} = product
    if (isUpdate) {
      const result = await reqCategory(fk_category_id)
      console.log(result.data[0].parent_category_id)
      if (result.data[0].parent_category_id !== 0) {
        // 获取对应的二级分类列表
        const subCategorys = await this.getCategorys(result.data[0].parent_category_id)
        // 生成二级下拉列表的options
        const childOptions = subCategorys.map(c => ({
          value: c.pk_category_id,
          label: c.name,
          isLeaf: true
        }))
        // 找到当前商品对应的一级option对象
        const targetOption = options.find(option => option.value === result.data[0].parent_category_id)
        // 关联对应的一级option上
        targetOption.children = childOptions
      }
    }
    // 更新options状态
    this.setState({
      options
    })
  }

  // 异步获取一级/二级分类列表并显示，async函数的返回值是一个新的promise对象，promise的结果和值由async的结果来决定
  getCategorys = async (parentId) => {
    const result = await reqCategorys(parentId)
    if (result.status === 0) {
      const categorys = result.data
      if (parentId === 0) { // 如果是一级分类列表
        this.initOptions(categorys)
      } else { // 二级列表
        return categorys  // 返回二级列表，当前async函数返回的promsie就会成功且value为categorys
      }
    }
  }

  // 加载下一级列表的回调函数
  loadData = async selectedOptions => {
    // 得到选择的option对象
    const targetOption = selectedOptions[0]
    // 显示loading
    targetOption.loading = true
    // 根据选中的分类，请求获取二级分类列表
    const subCategorys = await this.getCategorys(targetOption.value)
    // 隐藏loading
    targetOption.loading = false
    // 二级分类数组有数据
    if (subCategorys && subCategorys.length > 0) {
      // 生成一个二级列表的options
      const childOptions = subCategorys.map(c => ({
        value: c.pk_category_id,
        label: c.name,
        isLeaf: true
      }))
      // 关联到当前option上
      targetOption.children = childOptions
    } else { // 当前选中的分类没有二级分类
      targetOption.isLeaf = true
    }
    // 更新options状态
    this.setState({
      options: [...this.state.options],
    })
  }

  // 执行异步任务：发异步ajax请求
  componentDidMount() {
    // 异步获取一级/二级分类列表并显示
    this.getCategorys(0)
  }

  // 为第一次render()准备数据
  componentWillMount() {
    // 取出携带的state
    const product = this.props.location.state  // 添加无值修改有值
    // 保存是否是更新的标识
    this.isUpdate = !!product
    // 保存商品(如果没有保存为{})
    this.product = product || {}
  }

  render() {
    const {isUpdate, product} = this
    const {image, description, pk_product_id, fk_category_id} = product
    const {options, buttonLoading} = this.state;

    console.log(isUpdate, product)
    // console.log(image, description, pk_product_id, fk_category_id)
    // console.log(options)

    let pCategoryId = 0, categoryId = fk_category_id
    for (let i = 0; i < options.length; i++) {
      if (options[i].children) {
        console.log(options[i].value)
        pCategoryId = options[i].value
      }
    }
    console.log(pCategoryId, categoryId)

    // console.log(this.getCategorysName(pCategoryId, categoryId))

    // 用来接收级联分类ID的数组
    const categoryIds = []

    if (isUpdate) {
      if (pCategoryId === 0) { // 商品是一个一级分类的商品
        categoryIds.push(categoryId)
      } else { // 商品是一个二级分类的商品
        categoryIds.push(pCategoryId)
        categoryIds.push(categoryId)
      }
    }

    console.log(categoryIds)

    // 顶部左侧标题
    const title = (
      <span>
          <ArrowLeftOutlined style={{color: "green", marginRight: 20}} onClick={() => this.props.history.goBack()}/>
        <span>{isUpdate ? '修改商品' : '添加商品'}</span>
      </span>
    )

    // 提交
    const onFinish = async values => {
      this.setState({buttonLoading: true})
      // console.log('Success:', values);
      // 收集输入的数据
      let {name, price, categoryIds} = values
      console.log(this.product)
      if (this.product) { // 判定是否是修改，如果是修改则要给未改动的参数赋原值
        // console.log(this.product)
        if (name === undefined) {
          name = this.product.name
        }
        if (price === undefined) {
          price = this.product.price
        }
        if (categoryIds === undefined) {
          categoryIds = this.product.categoryIds
        }
      }
      console.log(name, price, categoryIds)
      const imgs = this.pw.current.getImgs()
      const detail = this.editor.current.getDetail()
      console.log(imgs, detail)

      let nameReg = /^[\u4e00-\u9fa5_a-zA-Z0-9_]{3,12}$/
      let priceReg = /^[0-9]{1,12}$/
      // 对所有输入内容依次进行验证，验证不通过弹出提示且不执行任何操作
      if (!nameReg.test(name) || name === undefined) {
        message.error('商品名称只能由3-12个汉字、英文、数字或下划线组成');
      } else if (!priceReg.test(price) || price === undefined) {
        message.error('商品价格只能由1-12个数字组成');
      } else if (categoryIds === undefined) {
        message.error('请选择商品分类');
      } else {
        // 获取商品分类
        let categoryId = categoryIds[categoryIds.length - 1]
        console.log(categoryId)

        // 将收集到的数据封装成product对象
        const product = {name, price, categoryId, imgs, detail}
        // 如果是更新则需要添加id
        if (this.isUpdate) {
          product.pk_product_id = this.product.pk_product_id
        }
        console.log(product);
        // 调用接口请求函数去添加/更新
        const result = await reqAddOrUpdateProduct(product)
        if (product.pk_product_id) {
          await reqAddLog(2, cookieUtils.getUserCookie().username + '修改了id为' + product.pk_product_id + '的商品', cookieUtils.getUserCookie().pk_user_id)
        } else {
          await reqAddLog(0, cookieUtils.getUserCookie().username + '新增了商品' + name, cookieUtils.getUserCookie().pk_user_id)
        }
        // 根据结果提示
        if (result.status === 0) {
          message.success(`${this.isUpdate ? '更新' : '添加'}商品成功`)
          this.props.history.goBack()
        } else {
          message.error(`${this.isUpdate ? '更新' : '添加'}商品失败`)
        }
        this.setState({buttonLoading: false})
      }
    };

    return (
      <Card title={title} style={{height: 800}}>
        {options.length > 0 ? <Form ref={this.formRef} onFinish={onFinish} initialValues={
          isUpdate ? (pCategoryId === 0 ? {categoryIds: [categoryId]} : {categoryIds: [pCategoryId, categoryId]}) : null
        }>
          <Form.Item name="name" label="商品名称：" rules={[
            {pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9_]{3,12}$/, message: '商品名称只能由3-12个汉字、英文、数字或下划线组成'},
          ]}>
            <Input placeholder="请输入商品名称" style={{width: 400}} defaultValue={product.name} maxLength={12}/>
          </Form.Item>
          <Form.Item name="price" label="商品价格：" rules={[
            {pattern: /^[0-9]{1,12}$/, message: '商品价格只能由1-12个数字组成'},
          ]}>
            <Input placeholder="请输入商品价格" style={{width: 400}} addonAfter="分" defaultValue={product.price}
                   maxLength={12}/>
          </Form.Item>
          <Form.Item name="categoryIds" label="商品分类：">
            <Cascader options={options} loadData={this.loadData} placeholder="请选择商品分类" style={{width: 400}}/>
          </Form.Item>
          <Form.Item label="商品图片：">
            <PicturesWall ref={this.pw} imgs={image}/>
          </Form.Item>
          <Form.Item label="商品详情：">
            <div>
              <RichTextEditor ref={this.editor} detail={description}/>
            </div>
          </Form.Item>
          <Form.Item style={{marginTop: 50, textAlign: "center"}}>
            <Button type='primary' htmlType="submit" loading={buttonLoading}>提交</Button>
          </Form.Item>
        </Form> : null}
      </Card>
    )
  }
}