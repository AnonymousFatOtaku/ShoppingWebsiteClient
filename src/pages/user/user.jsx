// 用户管理路由
import React, {Component} from "react";
import {Button, Card, Table, Modal, Select, Input, Form, message} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {
  reqDeleteUser,
  reqUsers,
  reqAddOrUpdateUser,
  reqRoles,
  reqUserRole,
  reqUserRoles,
  reqUpdateUserRole,
  reqAddLog,
  reqUserByUsernameAndPhoneAndEmail,
  reqUpdateUserPassword,
} from "../../api/index";
import cookieUtils from "../../utils/cookieUtils";
import './user.less'

export default class User extends Component {

  state = {
    users: [], // 所有用户列表
    roles: [], // 所有角色列表
    visible: false,
    visiblePassword: false,
    userRoles: [],
    confirmLoading: false, // 表单按钮是否转圈
  };

  formRef = React.createRef();

  // 初始化列
  initColumns = () => {
    this.columns = [
      {
        title: '用户ID',
        dataIndex: 'pk_user_id'
      },
      {
        title: '用户名',
        dataIndex: 'username'
      },
      {
        title: '手机号',
        dataIndex: 'phone'
      },
      {
        title: '邮箱',
        dataIndex: 'email'
      },
      {
        title: '登录时间',
        dataIndex: 'login_time',
        render: formateDate
      },
      {
        title: '上次登录时间',
        dataIndex: 'last_login_time',
        render: formateDate
      },
      {
        title: '登录次数',
        dataIndex: 'login_count'
      },
      {
        title: '用户权限',
        render: (user) => {
          let {roles, userRoles} = this.state

          let roleId
          if (user != {}) {
            for (let i = 0; i < userRoles.length; i++) {
              if (user.pk_user_id === userRoles[i].fk_user_id) {
                roleId = userRoles[i].fk_role_id
              }
            }
          }

          let roleName
          if (roles) {
            for (let i = 0; i < roles.length; i++) {
              if (roleId === roles[i].pk_role_id) {
                roleName = roles[i].name
              }
            }
          }
          console.log(roleId, roleName)
          return <span>{roleName}</span>
        }
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
        render: (user) => (
          <span>
            <a onClick={() => this.showUpdate(user)}>修改资料&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.showPasswordUpdate(user)}>修改密码&nbsp;&nbsp;&nbsp;&nbsp;</a>
            <a onClick={() => this.deleteUser(user)}>删除</a>
          </span>
        )
      },
    ]
  }

  // 显示添加界面
  showAdd = () => {
    this.user = null // 去除前面保存的user
    this.setState({
      visible: true
    })
  }

  // 显示修改界面
  showUpdate = (user) => {
    this.user = user // 保存user
    this.setState({
      visible: true
    })
  }

  // 显示密码修改界面
  showPasswordUpdate = (user) => {
    this.user = user // 保存user
    this.setState({
      visiblePassword: true
    })
  }

  // 密码修改
  passwordUpdate = async () => {

    // 收集输入数据
    const user = this.formRef.current.getFieldsValue({user: Object})

    // 给user指定id
    if (user.pk_user_id === undefined) {
      user.pk_user_id = this.user.pk_user_id
    }
    console.log(user, this.user)

    let uapReg = /^[a-zA-Z0-9_]{3,12}$/
    if (!uapReg.test(user.newPassword) || user.newPassword === undefined) {
      message.error('新密码只能由3-12个英文、数字或下划线组成');
    } else if (!uapReg.test(user.confirmPassword) || user.confirmPassword === undefined) {
      message.error('确认密码只能由3-12个英文、数字或下划线组成');
    } else if (user.confirmPassword !== user.newPassword) {
      message.error('新密码与确认密码不一致，请检查后重新输入');
    } else {

      this.setState({
        confirmLoading: true
      })

      // 重置所有输入内容
      this.formRef.current.resetFields()
      // 提交修改权限的请求
      const result = await reqUpdateUserPassword(user.newPassword, user.pk_user_id)
      if (result.status === 0) {
        await reqAddLog(2, cookieUtils.getUserCookie().username + '修改了id为' + user.pk_user_id + '的用户密码', cookieUtils.getUserCookie().pk_user_id)
        // 如果修改的是当前登录用户的密码则强制退出重新登录
        if (user.pk_user_id === cookieUtils.getUserCookie().pk_user_id) {
          // 删除保存的user数据和token
          cookieUtils.removeUserCookie()
          localStorage.removeItem('token')
          message.success('当前用户密码修改成功，请重新登录')
          this.props.history.replace('/AdminLogin')
        } else {
          message.success('修改用户密码成功')
          this.setState({
            visiblePassword: false,
            confirmLoading: true,
          })
          window.location.reload(true)
        }
      }
    }
  }

  // 删除指定用户
  deleteUser = (user) => {
    console.log(cookieUtils.getUserCookie(), user)
    if (cookieUtils.getUserCookie().pk_user_id === user.pk_user_id) {
      message.warning('不能删除当前登录的用户');
    } else {
      if (user.type === 1) {
        message.warning('不能删除管理员');
      } else {
        Modal.confirm({
          title: `确认删除${user.username}吗?`,
          onOk: async () => {
            const result = await reqDeleteUser(user.pk_user_id)
            const logResult = await reqAddLog(1, cookieUtils.getUserCookie().username + '删除了id为' + user.pk_user_id + '的用户', cookieUtils.getUserCookie().pk_user_id)
            if (result.status === 0) {
              message.success('删除用户成功')
              this.getUsers()
            }
          }
        })
      }
    }
  }

  // 添加/修改用户
  addOrUpdateUser = async () => {

    // 收集输入数据
    const user = this.formRef.current.getFieldsValue({user: Object})

    // 判定是否是修改，如果是修改则要给未改动的参数赋原值
    let roleId
    if (this.user) {
      if (user.username === undefined) {
        user.username = this.user.username
      }
      if (user.phone === undefined) {
        user.phone = this.user.phone
      }
      if (user.email === undefined) {
        user.email = this.user.email
      }
      if (user.pk_user_id === undefined) {
        user.pk_user_id = this.user.pk_user_id
      }
      let result = await reqUserRole(user.pk_user_id)
      roleId = result.data[0].fk_role_id
      if (user.role_id === undefined) {
        user.role_id = roleId
      }
    }
    console.log(user, this.user)

    let uapReg = /^[a-zA-Z0-9_]{3,12}$/
    let phoneReg = /^1[3456789]\d{9}$/
    let emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
    // 对所有输入内容依次进行验证，验证不通过不关闭窗口且不执行任何操作
    if (!uapReg.test(user.username) || user.username === undefined) {
      message.error('用户名只能由3-12个英文、数字或下划线组成');
      this.setState({
        visible: true
      })
    } else if (!this.user && (!uapReg.test(user.password) || user.password === undefined)) {
      message.error('密码只能由3-12个英文、数字或下划线组成');
      this.setState({
        visible: true
      })
    } else if (!phoneReg.test(user.phone)) {
      message.error('手机号格式不正确');
      this.setState({
        visible: true
      })
    } else if (!emailReg.test(user.email)) {
      message.error('邮箱格式不正确');
      this.setState({
        visible: true
      })
    } else if (user.role_id === undefined) {
      message.error('请选择角色');
    } else if (this.user && roleId === 1 && user.role_id != 1) {
      message.error('不能修改超级管理员角色');
    } else { // 所有验证都通过才执行添加/修改操作

      this.setState({
        confirmLoading: true
      })

      const {users} = this.state
      // console.log(users, typeof users, users.length, users[0])
      // 新增之前先判定新增的用户是否已存在
      if (!this.user) {
        for (let i = 0; i < users.length; i++) {
          // console.log(users[i].username)
          if (user.username === users[i].username) {
            message.error('该用户已存在');
            return
          }
        }
      }
      // 重置所有输入内容
      this.formRef.current.resetFields()
      // 提交添加的请求
      const result = await reqAddOrUpdateUser(user)
      if (result.status === 0) {
        // 新用户添加后先获取id再添加权限
        if (!this.user) {
          const userResult = await reqUserByUsernameAndPhoneAndEmail(user.username, user.phone, user.email)
          console.log(userResult.data[0].pk_user_id)
          user.pk_user_id = userResult.data[0].pk_user_id
        }
        const roleResult = await reqUpdateUserRole(user)
        if (this.user) {
          await reqAddLog(2, cookieUtils.getUserCookie().username + '修改了id为' + user.pk_user_id + '的用户', cookieUtils.getUserCookie().pk_user_id)
        } else {
          await reqAddLog(0, cookieUtils.getUserCookie().username + '新增了名为' + user.username + '的用户', cookieUtils.getUserCookie().pk_user_id)
        }
        // 刷新列表显示
        if (roleResult.status === 0) {
          message.success(`${this.user ? '修改' : '添加'}用户成功`)
          this.getUsers()
        }
        this.setState({
          visible: false,
          confirmLoading: false
        })
        // 新增/修改用户后强制刷新整个页面
        window.location.reload(true)
      } else if (result.status === 1) {
        message.error('用户信息已存在');
      }
    }
  }

  // 获取所有用户
  getUsers = async () => {
    const result = await reqUsers()
    console.log(result)
    if (result.status === 0) {
      const users = result.data
      this.setState({
        users
      })
    }
  }

  // 获取所有角色
  getRoles = async () => {
    const result = await reqRoles()
    console.log(result)
    if (result.status === 0) {
      const roles = result.data
      this.setState({
        roles
      })
    }
  }

  // 获取用户的角色
  getUserRoles = async () => {
    const userRoles = await reqUserRoles()
    console.log(userRoles)
    this.setState({
      userRoles: userRoles.data
    });
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getUsers()
    this.getRoles()
    this.getUserRoles()
  }

  handleCancel = () => {
    // 重置表单所有内容
    this.formRef.current.resetFields()
    this.setState({
      visible: false,
      visiblePassword: false,
    });
  };

  render() {

    let {users, roles, visible, visiblePassword, userRoles, confirmLoading} = this.state
    let user = this.user || {}
    console.log(users, user)
    console.log(roles)
    console.log(userRoles)

    let roleId
    if (user != {}) {
      for (let i = 0; i < userRoles.length; i++) {
        if (user.pk_user_id === userRoles[i].fk_user_id) {
          roleId = userRoles[i].fk_role_id
        }
      }
    }

    let roleName
    if (roles) {
      for (let i = 0; i < roles.length; i++) {
        if (roleId === roles[i].pk_role_id) {
          roleName = roles[i].name
        }
      }
    }
    console.log(roleId, roleName)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary' onClick={this.showAdd}>创建用户</Button>
      </div>
    )

    const {Option} = Select;

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={users} bordered style={{height: 613}}/>
        <Modal title={user.pk_user_id ? '修改用户' : '添加用户'} visible={visible} onOk={this.addOrUpdateUser}
               onCancel={this.handleCancel} destroyOnClose confirmLoading={confirmLoading}>
          <Form preserve={false} ref={this.formRef}>
            <Form.Item name="username" label="用户名：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '用户名只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input placeholder="请输入用户名" style={{width: 400, float: "right"}} defaultValue={user.username}
                     maxLength={12}/>
            </Form.Item>
            {this.user ? null : <Form.Item name="password" label="密码：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '密码只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input.Password type='password' placeholder="请输入密码" style={{width: 400, float: "right"}} maxLength={12}/>
            </Form.Item>}
            <Form.Item name="phone" label="手机号：" rules={[
              {min: 11, max: 11, message: '手机号长度应为11位'},
              {pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确'},
            ]}>
              <Input placeholder="请输入手机号" style={{width: 400, float: "right"}} defaultValue={user.phone}
                     maxLength={11}/>
            </Form.Item>
            <Form.Item name="email" label="邮箱：" rules={[
              {
                pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                message: '邮箱格式不正确'
              },
            ]}>
              <Input placeholder="请输入邮箱" style={{width: 400, float: "right"}} defaultValue={user.email}/>
            </Form.Item>
            <Form.Item name="role_id" label="角色：">
              <Select placeholder="请选择角色" style={{width: 400, marginLeft: 2}} defaultValue={roleName}>
                {
                  roles.map(role => <Option key={role.pk_role_id} value={role.pk_role_id}>{role.name}</Option>)
                }
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        <Modal title='修改密码' visible={visiblePassword} onOk={this.passwordUpdate} onCancel={this.handleCancel}
               destroyOnClose confirmLoading={confirmLoading}>
          <Form preserve={false} ref={this.formRef}>
            <Form.Item name="newPassword" label="新密码：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '密码只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input.Password type='password' placeholder="请输入新密码" style={{width: 400, float: "right"}} maxLength={12}/>
            </Form.Item>
            <Form.Item name="confirmPassword" label="确认密码：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '密码只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input.Password type='password' placeholder="请再次输入新密码" style={{width: 400, float: "right"}}
                              maxLength={12}/>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    )
  }
}