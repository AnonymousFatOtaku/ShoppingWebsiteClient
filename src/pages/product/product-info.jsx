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
    const {pCategoryId, categoryId} = this.props.location.state.product
    // console.log(pCategoryId,categoryId)
    // 根据ID获取到分类名称
    if (pCategoryId === '0') { // 一级分类下的商品
      const result = await reqCategory(categoryId)
      const cName1 = result.data.name
      // console.log(result)
      // console.log(cName1)
      this.setState({cName1})
    } else { // 二级分类下的商品
      // 一次性发送多个请求，只有都成功了才正常处理
      const results = await Promise.all([reqCategory(pCategoryId), reqCategory(categoryId)])
      const cName1 = results[0].data.name
      const cName2 = results[1].data.name
      // console.log(results)
      // console.log(cName1)
      // console.log(cName2)
      this.setState({
        cName1,
        cName2
      })
    }
  }

  render() {
    // 读取携带过来的state数据
    const {name, desc, price, detail, imgs} = this.props.location.state.product
    const {cName1, cName2} = this.state

    // console.log(detail, imgs)

    const title = (
      <span>
          <ArrowLeftOutlined style={{color: "green", marginRight: 20}} onClick={() => this.props.history.goBack()}/>
        <span>商品详情</span>
      </span>
    )

    return (
      <Card title={title} style={{height: 727}}>
        <List>
          <List.Item>
            商品名称:&nbsp;&nbsp;
            <span>{name}</span>
          </List.Item>
          <List.Item>
            商品描述:&nbsp;&nbsp;
            <span>{desc}</span>
          </List.Item>
          <List.Item>
            商品价格:&nbsp;&nbsp;
            <span>{price}元</span>
          </List.Item>
          <List.Item>
            所属分类:&nbsp;&nbsp;
            <span>{cName1} {cName2 ? ' --> ' + cName2 : ''}</span>
          </List.Item>
          <List.Item>
            商品图片:&nbsp;&nbsp;
            <span>
              {
                imgs.map(img => (
                  <img key={img} src={'http://localhost:5000/upload/' + img} className="product-img" alt="img"
                       style={{height: 200, width: 200, marginRight: 20}}/>
                ))
              }
            </span>
          </List.Item>
          <List.Item>
            商品详情:&nbsp;&nbsp;
            <span dangerouslySetInnerHTML={{__html: detail}}>
            </span>
          </List.Item>
        </List>
      </Card>
    )
  }
}