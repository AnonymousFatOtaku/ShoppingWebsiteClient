// 用户登录的路由组件
import React, {Component} from 'react'
import {Redirect} from 'react-router-dom'
import {Form, Input, Button, message} from 'antd';
import {UserOutlined, LockOutlined} from '@ant-design/icons';
import logo from '../../assets/images/logo.gif'
import './admin_login.less'
import {reqAdminLogin} from '../../api/index'

export default class Login extends Component {

  componentDidMount() {
    document.title = "管理员登录"
  }

  render() {

    // onFinish为提交表单且数据验证成功后的回调事件，values即表单数据，分别在输入过程中和点击登录按钮时进行验证
    const onFinish = async values => {
      const result = await reqAdminLogin(values.username, values.password)
      if (result.status === 0) { // 登录成功
        // 提示登录成功
        message.success('登录成功')
      } else { // 登录失败
        // 提示错误信息
        message.error(result.msg)
      }
    };

    return (
      <div className='login'>
        <header className='login-header'>
          <img src={logo} alt="logo"/>
          <h1>欢迎登录</h1>
        </header>
        <section className='login-content'>
          <h2>用户登录</h2>
          {/* 登录表单 */}
          <Form name="normal_login" className="login-form" initialValues={{remember: false}} onFinish={onFinish}>
            {/* 用户名输入框，配置对象:属性名是特定的一些名称 */}
            <Form.Item name="username">
              <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="用户名/手机号/邮箱"/>
            </Form.Item>
            {/* 密码输入框，Input没有可见切换按钮，Input.Password有 */}
            <Form.Item name="password" rules={[
              {required: true, message: '请输入密码'},
              {min: 3, max: 12, message: '密码长度应为3-12个字符'},
              {pattern: /^[a-zA-Z0-9_]+$/, message: '密码只能由英文、数字或下划线组成'},
            ]}>
              <Input.Password prefix={<LockOutlined className="site-form-item-icon"/>} type="password"
                              placeholder="密码"/>
            </Form.Item>
            <Form.Item style={{height: 50}}>
              <Button type="primary" htmlType="submit" className="login-form-button">
                登录
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" className="login-form-button">
                注册
              </Button>
            </Form.Item>
          </Form>
        </section>
      </div>
    )
  }
}