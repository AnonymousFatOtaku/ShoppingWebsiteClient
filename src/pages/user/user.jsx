// 用户管理路由
import React, {Component} from "react";
import {Button, Card, Space, Table, Modal, Select, Input, Form, message} from 'antd';
import {formateDate} from "../../utils/dateUtils"
import {reqDeleteUser, reqUsers, reqAddOrUpdateUser} from "../../api/index";
import memoryUtils from '../../utils/memoryUtils'
import './user.less'

export default class User extends Component {

  state = {
    users: [], // 所有用户列表
    roles: [], // 所有角色列表
    visible: false,
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
        title: '用户权限标识',
        dataIndex: 'type'
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
        // render: (role_id) => this.roleNames[role_id]
      },
      {
        title: '操作',
        render: (user) => (
          <span>
            <a onClick={() => this.showUpdate(user)}>修改&nbsp;&nbsp;&nbsp;&nbsp;</a>
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

  // 删除指定用户
  deleteUser = (user) => {
    if (memoryUtils.user.username === user.username) {
      message.warning('不能删除当前登录的用户');
    } else {
      if (user.role_id === "5f74631c0e955025a8439b50") {
        message.warning('不能删除超级管理员');
      } else {
        Modal.confirm({
          title: `确认删除${user.username}吗?`,
          onOk: async () => {
            const result = await reqDeleteUser(user._id)
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
    this.setState({
      visible: false
    })
    // 收集输入数据
    const user = this.formRef.current.getFieldsValue({user: Object})

    // 判定是否是修改，如果是修改则要给未改动的参数赋原值
    if (this.user) {
      if (user.username === undefined) {
        user.username = this.user.username
      }
      if (user.password === undefined) {
        user.password = this.user.password
      }
      if (user.phone === undefined) {
        user.phone = this.user.phone
      }
      if (user.email === undefined) {
        user.email = this.user.email
      }
      if (user.role_id === undefined) {
        user.role_id = this.user.role_id
      }
    }
    // console.log(user, this.user)

    let uapReg = /^[a-zA-Z0-9_]{3,12}$/
    let phoneReg = /^1[3456789]\d{9}$/
    let emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/
    // 对所有输入内容依次进行验证，验证不通过不关闭窗口且不执行任何操作
    if (!uapReg.test(user.username) || user.username === undefined) {
      message.error('用户名只能由3-12个英文、数字或下划线组成');
      this.setState({
        visible: true
      })
    } else if (!uapReg.test(user.password) || user.password === undefined) {
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
      this.setState({
        visible: true
      })
    } else if (this.user && this.user.role_id === "5f74631c0e955025a8439b50" && user.role_id != "5f74631c0e955025a8439b50") {
      message.error('超级管理员不能修改自身权限');
      this.setState({
        visible: true
      })
    } else { // 所有验证都通过才执行添加/修改操作
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
      // 如果是更新需要给user指定_id属性
      if (this.user) {
        user._id = this.user._id
      }
      // 提交添加的请求
      const result = await reqAddOrUpdateUser(user)
      // 刷新列表显示
      if (result.status === 0) {
        message.success(`${this.user ? '修改' : '添加'}用户成功`)
        this.getUsers()
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
        users,
      })
    }
  }

  componentWillMount() {
    this.initColumns()
  }

  componentDidMount() {
    this.getUsers()
  }

  handleCancel = () => {
    // 重置表单所有内容
    this.formRef.current.resetFields()
    this.setState({
      visible: false,
    });
  };

  render() {

    const {users, visible} = this.state
    const user = this.user || {}
    console.log(users, user)

    // 顶部左侧按钮
    const title = (
      <div>
        <Button type='primary' onClick={this.showAdd}>创建用户</Button>
      </div>
    )

    const {Option} = Select;

    return (
      <Card title={title}>
        <Table columns={this.columns} dataSource={users} bordered style={{height: 613}}
               pagination={{defaultPageSize: 8}}/>
        <Modal title={user._id ? '修改用户' : '添加用户'} visible={visible} onOk={this.addOrUpdateUser}
               onCancel={this.handleCancel} destroyOnClose>
          <Form preserve={false} ref={this.formRef}>
            <Form.Item name="username" label="用户名：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '用户名只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input placeholder="请输入用户名" style={{width: 400, float: "right"}} defaultValue={user.username}/>
            </Form.Item>
            <Form.Item name="password" label="密码：" rules={[
              {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '密码只能由3-12个英文、数字或下划线组成'},
            ]}>
              <Input.Password type='password' placeholder="请输入密码" style={{width: 400, float: "right"}}/>
            </Form.Item>
            <Form.Item name="phone" label="手机号：" rules={[
              {min: 11, max: 11, message: '手机号长度应为11位'},
              {pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确'},
            ]}>
              <Input placeholder="请输入手机号" style={{width: 400, float: "right"}} defaultValue={user.phone}/>
            </Form.Item>
            <Form.Item name="email" label="邮箱：" rules={[
              {
                pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                message: '邮箱格式不正确'
              },
            ]}>
              <Input placeholder="请输入邮箱" style={{width: 400, float: "right"}} defaultValue={user.email}/>
            </Form.Item>
            {/*<Form.Item name="role_id" label="角色：">
              <Select defaultValue={user.role_id} placeholder="请选择角色" style={{width: 400, marginLeft: 2}}>
                {
                  roles.map(role => <Option key={role._id} value={role._id}>{role.name}</Option>)
                }
              </Select>
            </Form.Item>*/}
          </Form>
        </Modal>
      </Card>
    )
  }
}