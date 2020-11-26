// 用户管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form, message} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqPromotions} from "../../api/index";
import './promotion.less'

export default class User extends Component {

  state = {
    promotions: [], // 所有活动列表
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
        render: () => (
          <span>
            <a>修改活动&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a>删除活动</a>
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

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getPromotions()
  }

  render() {

    let {promotions} = this.state
    console.log(promotions)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary'>新增活动</Button>
      </div>
    )

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={promotions} bordered style={{height: 613}}
               pagination={{defaultPageSize: 8}}/>
      </Card>
    )
  }
}