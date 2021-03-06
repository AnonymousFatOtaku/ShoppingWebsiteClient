// 商品信息路由
import React, {Component} from 'react'
import {
  Card,
  List,
} from 'antd'
import {
  ArrowLeftOutlined,
} from '@ant-design/icons';
import {reqCategory} from '../../api'

export default class ProductInfo extends Component {

  state = {
    cName1: '', // 一级分类名称
    cName2: '', // 二级分类名称
  }

  // 执行异步任务：发异步ajax请求
  async componentDidMount() {
    // 得到当前商品的分类ID
    const {pk_product_id, fk_category_id} = this.props.location.state.product
    console.log(pk_product_id, fk_category_id)
    const resultOne = await reqCategory(fk_category_id)
    console.log(resultOne)
    if (resultOne.data[0].parent_category_id === 0) { // 一级分类下的商品
      this.setState({cName1: resultOne.data[0].name})
    } else { // 二级分类下的商品
      const resultTwo = await reqCategory(resultOne.data[0].parent_category_id)
      console.log(resultOne)
      this.setState({cName1: resultTwo.data[0].name, cName2: resultOne.data[0].name})
    }
  }

  render() {
    // 读取携带过来的state数据
    let {name, price, description, image} = this.props.location.state.product
    const {cName1, cName2} = this.state
    console.log(image)
    if (image) {
      image = image.split(",");
      console.log(image)
    }
    console.log(this.props.location.state.product)
    console.log(cName1, cName2, image)

    const title = (
      <span>
          <ArrowLeftOutlined style={{color: "green", marginRight: 20}} onClick={() => this.props.history.goBack()}/>
        <span>商品详情</span>
      </span>
    )

    return (
      <Card title={title} style={{minHeight: 727}}>
        <List>
          <List.Item>
            商品名称:&nbsp;&nbsp;
            <span>{name}</span>
          </List.Item>
          <List.Item>
            商品价格:&nbsp;&nbsp;
            <span>{price / 100}元</span>
          </List.Item>
          <List.Item>
            所属分类:&nbsp;&nbsp;
            <span>{cName1} {cName2 ? ' --> ' + cName2 : ''}</span>
          </List.Item>
          <List.Item>
            商品图片:&nbsp;&nbsp;
            <span>
              {
                image ? image.map(img => (
                  <img key={img} src={'http://localhost:8000/images/' + img} className="product-img" alt="img"
                       style={{height: 200, width: 200, marginRight: 20}}/>
                )) : null
              }
            </span>
          </List.Item>
          <List.Item>
            商品详情:&nbsp;&nbsp;
            <span dangerouslySetInnerHTML={{__html: description}}/>
          </List.Item>
        </List>
      </Card>
    )
  }
}