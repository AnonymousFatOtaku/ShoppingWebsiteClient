// 角色管理路由
import React, {Component} from "react";
import {Button, Card, Table, Modal, Form, Input, message} from 'antd';
import {reqRoles, reqAddRole, reqUpdateRole} from '../../api'
import memoryUtils from "../../utils/memoryUtils"
import {formateDate} from '../../utils/dateUtils'
import storageUtils from "../../utils/storageUtils";
import AuthForm from './auth-form'

export default class Role extends Component {

  state = {
    roles: [], // 所有角色的列表
    role: {}, // 选中的role
    isShowAdd: false, // 是否显示添加界面
    isShowAuth: false, // 是否显示设置权限界面
  }

  formRef = React.createRef();

  constructor(props) {
    super(props)
    this.auth = React.createRef()
  }


  // 初始化table所有列
  initColumn = () => {
    this.columns = [
      {
        title: '角色ID',
        dataIndex: 'pk_role_id'
      },
      {
        title: '父级角色ID',
        dataIndex: 'parent_role_id'
      },
      {
        title: '角色名称',
        dataIndex: 'name'
      },
      {
        title: '角色描述',
        dataIndex: 'description'
      },
      {
        title: '创建时间',
        dataIndex: 'gmt_create',
        render: (create_time) => formateDate(create_time)
      },
      {
        title: '修改时间',
        dataIndex: 'gmt_modified',
        render: formateDate
      },
    ]
  }

  // 获取所有角色
  getRoles = async () => {
    const result = await reqRoles()
    if (result.status === 0) {
      const roles = result.data
      this.setState({
        roles
      })
    }
  }

  // 点击行时获取选中的角色
  onRow = (role) => {
    return {
      onClick: event => {
        this.setState({
          role
        })
      },
    }
  }

  // 添加角色
  // addRole = async () => {
  //   // 隐藏确认框
  //   this.setState({
  //     isShowAdd: false
  //   })
  //   // 收集输入数据
  //   const {roleName} = this.formRef.current.getFieldsValue({roleName: String})
  //   // console.log(roleName)
  //
  //   // 判断角色名是否为空或以空格开头
  //   if (roleName === null || roleName === undefined || roleName.indexOf(' ') === 0 || roleName === "") {
  //     message.error('角色名不能为空或以空格开头');
  //     return
  //   }
  //
  //   // 判断角色名是否重名
  //   let {roles} = this.state
  //   for (let i = 0; i < roles.length; i++) {
  //     // console.log(roles[i].name)
  //     if (roleName === roles[i].name) {
  //       message.error('该角色已存在');
  //       return
  //     }
  //   }
  //
  //   // 请求添加
  //   const result = await reqAddRole(roleName)
  //   // 根据结果提示/更新列表显示
  //   if (result.status === 0) {
  //     message.success('添加角色成功')
  //     // 新产生的角色
  //     const role = result.data
  //     // 基于原本状态数据更新roles状态
  //     this.setState(state => ({
  //       roles: [...state.roles, role]
  //     }))
  //   } else {
  //     message.error('添加角色失败')
  //   }
  // }

  // 更新角色
  // updateRole = async () => {
  //   // 隐藏确认框
  //   this.setState({
  //     isShowAuth: false
  //   })
  //   const role = this.state.role
  //   // console.log(role.name)
  //   if (role.name === "超级管理员") {
  //     message.error('不能修改超级管理员权限');
  //   } else {
  //     // 得到最新的menus
  //     const menus = this.auth.current.getMenus()
  //     // console.log(menus)
  //     role.menus = menus
  //     role.auth_time = Date.now()
  //     role.auth_name = memoryUtils.user.username
  //     // 请求更新
  //     const result = await reqUpdateRole(role)
  //     if (result.status === 0) {
  //       // 如果当前更新的是自己角色的权限强制退出
  //       if (role._id === memoryUtils.user.role_id) {
  //         memoryUtils.user = {}
  //         storageUtils.removeUser()
  //         this.props.history.replace('/login')
  //         message.success('当前用户角色权限成功')
  //       } else {
  //         message.success('设置角色权限成功')
  //         this.setState({
  //           roles: [...this.state.roles]
  //         })
  //       }
  //     }
  //   }
  // }

  componentWillMount() {
    this.initColumn()
  }

  componentDidMount() {
    this.getRoles()
  }

  onCancel = () => {
    this.setState({
      isShowAdd: false,
      isShowAuth: false,
    })
  }

  render() {

    const {roles, role, isShowAdd, isShowAuth} = this.state

    console.log(roles)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary' onClick={() => this.setState({isShowAdd: true})}>创建角色</Button>&nbsp;&nbsp;&nbsp;&nbsp;
        <Button type='primary' disabled={!role._id} onClick={() => this.setState({isShowAuth: true})}>设置角色权限</Button>
      </div>
    )

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={roles} bordered rowKey='pk_role_id' pagination={{defaultPageSize: 8}}
               rowSelection={{
                 type: 'radio',
                 selectedRowKeys: [role.pk_role_id],
                 onSelect: (role) => { // 选择某个radio时回调
                   this.setState({
                     role
                   })
                 }
               }}
               onRow={this.onRow} style={{height: 613}}/>
        <Modal title="添加角色" visible={isShowAdd} onOk={this.addRole} onCancel={this.onCancel} destroyOnClose>
          <Form preserve={false} ref={this.formRef}>
            <Form.Item name='roleName' label='角色名称'>
              <Input placeholder='请输入角色名称'/>
            </Form.Item>
          </Form>
        </Modal>
        <Modal title="设置角色权限" visible={isShowAuth} onOk={this.updateRole} onCancel={this.onCancel} destroyOnClose>
          <AuthForm ref={this.auth} role={role} preserve={false}/>
        </Modal>
      </Card>
    )
  }
}