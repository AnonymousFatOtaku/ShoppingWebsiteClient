// 角色管理路由
import React, {Component} from "react";
import {Button, Card, Table, Modal, Form, Input, message, Select} from 'antd';
import {
  reqRoles,
  reqAddRole,
  reqUpdateRoleRights,
  reqUserRole,
  reqAddLog,
  reqDeleteRole,
  reqUsersByRoleId, reqCategorys,
} from '../../api'
import {formateDate} from '../../utils/dateUtils'
import AuthForm from './auth-form'
import cookieUtils from "../../utils/cookieUtils";

const {TextArea} = Input;

export default class Role extends Component {

  state = {
    roles: [], // 所有角色的列表
    role: {}, // 选中的role
    isShowAdd: false, // 是否显示添加界面
    isShowAuth: false, // 是否显示设置权限界面
    parentId: '0', // 当前需要显示的分类列表的父分类ID
    confirmLoading: false, // 表单按钮是否转圈
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
        title: '父级角色',
        dataIndex: 'parent_role_id',
        render: (parent_role_id) => parent_role_id ? '超级管理员' : '无'
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
    console.log(role)
    return {
      onClick: event => {
        this.setState({
          role
        })
      },
    }
  }

  // 添加角色
  addRole = async () => {

    // 收集输入数据
    const {roleName, roleDescription} = this.formRef.current.getFieldsValue({roleName: String, roleDescription: String})
    console.log(this.parentId, roleName, roleDescription)

    // 判断角色名是否为空或以空格开头
    if (roleName === null || roleName === undefined || roleName.indexOf(' ') === 0 || roleName === "") {
      message.error('角色名不能为空或以空格开头');
      return
    }

    // 判断角色名是否重名
    let {roles} = this.state
    for (let i = 0; i < roles.length; i++) {
      // console.log(roles[i].name)
      if (roleName === roles[i].name) {
        message.error('该角色已存在');
        return
      }
    }

    // 判断角色描述是否为空或以空格开头
    if (roleDescription === null || roleDescription === undefined || roleDescription.indexOf(' ') === 0 || roleDescription === "") {
      message.error('角色描述不能为空或以空格开头');
      return
    }

    this.setState({
      confirmLoading: true
    })

    // 请求添加
    const result = await reqAddRole(this.parentId, roleName, roleDescription)
    const logResult = await reqAddLog(0, cookieUtils.getUserCookie().username + '创建了名为' + roleName + '的角色', cookieUtils.getUserCookie().pk_user_id)
    // 根据结果提示/更新列表显示
    if (result.status === 0) {
      message.success('添加角色成功')
      // 新产生的角色
      const role = result.data
      // 基于原本状态数据更新roles状态
      this.setState(state => ({
        roles: [...state.roles, role]
      }))
      // 隐藏确认框
      this.setState({
        isShowAdd: false,
        confirmLoading: false,
      })
      // 重新加载角色列表
      this.getRoles()
    } else {
      message.error('添加角色失败')
    }
  }

  // 更新角色
  updateRole = async () => {
    const role = this.state.role
    // console.log(role.name)
    if (role.name === "超级管理员") {
      message.error('不能修改超级管理员权限');
    } else {

      this.setState({
        isShowAuth: false,
        confirmLoading: true
      })

      // 得到最新的menus
      let menus = this.auth.current.getMenus()
      if (menus.indexOf("all") != -1) {
        menus.splice(menus.indexOf("all"), 1)
      }
      console.log(role.pk_role_id, menus)
      // 请求更新
      const result = await reqUpdateRoleRights(role.pk_role_id, menus)
      const logResult = await reqAddLog(2, cookieUtils.getUserCookie().username + '更新了id为' + role.pk_role_id + '的角色权限', cookieUtils.getUserCookie().pk_user_id)
      console.log(result)
      if (result.status === 0) {
        let userRole = await reqUserRole(cookieUtils.getUserCookie().pk_user_id)
        console.log(role.pk_role_id, userRole.data[0].fk_role_id)
        // 如果当前更新的是自己角色的权限强制退出
        if (role.pk_role_id === userRole.data[0].fk_role_id) {
          // 删除保存的user数据和token
          cookieUtils.removeUserCookie()
          localStorage.removeItem('token')
          this.props.history.replace('/AdminLogin')
          message.success('当前用户角色权限成功')
        } else {
          message.success('设置角色权限成功')
          this.setState({
            roles: [...this.state.roles],
            confirmLoading: false,
          })
        }
      }
    }
  }

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

  // 删除指定角色
  deleteRole = (role) => {
    console.log(role)
    Modal.confirm({
      title: `确认删除分类'${role.name}'吗?`,
      onOk: async () => {
        const usersResult = await reqUsersByRoleId(role.pk_role_id)
        console.log(usersResult.data)
        if (usersResult.data.length > 0) {
          message.error('不能删除仍有用户所属的角色')
        } else {
          const result = await reqDeleteRole(role.pk_role_id)
          reqAddLog(1, cookieUtils.getUserCookie().username + '删除了id为' + role.pk_role_id + '的角色', cookieUtils.getUserCookie().pk_user_id)
          if (result.status === 0) {
            message.success('删除角色成功')
            this.getRoles()
          }
        }
      }
    })
  }

  render() {

    const {roles, role, isShowAdd, isShowAuth, confirmLoading} = this.state
    // 初始化父级角色ID
    this.parentId = '0'
    // console.log(role)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary' onClick={() => this.setState({isShowAdd: true})}>创建角色</Button>&nbsp;&nbsp;&nbsp;&nbsp;
        <Button type='primary' disabled={!role.pk_role_id || role.pk_role_id === 1 || role.pk_role_id === 6}
                onClick={() => this.setState({isShowAuth: true})}>设置角色权限</Button>&nbsp;&nbsp;&nbsp;&nbsp;
        <Button type='primary' disabled={!role.pk_role_id || role.pk_role_id === 1 || role.pk_role_id === 6}
                onClick={() => this.deleteRole(role)}>删除角色</Button>
      </div>
    )

    const {Option} = Select;

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={roles} bordered rowKey='pk_role_id'
               rowSelection={{
                 type: 'radio',
                 selectedRowKeys: [role.pk_role_id],
                 onSelect: (role) => { // 选择某个radio时回调
                   this.setState({
                     role
                   })
                 },
               }}
               onRow={this.onRow} style={{height: 613}}/>
        <Modal title="添加角色" visible={isShowAdd} onOk={this.addRole} onCancel={this.onCancel} destroyOnClose
               confirmLoading={confirmLoading}>
          <Form preserve={false} ref={this.formRef} style={{height: 200}}>
            <Form.Item label="父角色ID：" style={{float: "right"}}>
              <Select defaultValue="0" style={{width: 389}} placeholder="请选择父级角色ID" onSelect={(value) => {
                this.parentId = value
                // console.log(this.parentId)
              }}>
                <Option value='0'>0</Option>
                {/* 遍历角色列表 */}
                {
                  roles.map(role => <Option value={role.pk_role_id}
                                            key={role.pk_role_id}>{role.pk_role_id}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name='roleName' label='角色名称' style={{float: "right"}}>
              <Input placeholder='请输入角色名称(15字以内)' style={{width: 389, float: "right"}} maxLength={15}/>
            </Form.Item>
            <Form.Item name='roleDescription' label='角色描述' style={{float: "right"}}>
              <TextArea maxLength={100} rows={4} placeholder='请输入角色描述(100字以内)' style={{width: 389, float: "right"}}/>
            </Form.Item>
          </Form>
        </Modal>
        <Modal title="设置角色权限" visible={isShowAuth} onOk={this.updateRole} onCancel={this.onCancel} destroyOnClose
               confirmLoading={confirmLoading}>
          <AuthForm ref={this.auth} role={role} preserve={false}/>
        </Modal>
      </Card>
    )
  }
}