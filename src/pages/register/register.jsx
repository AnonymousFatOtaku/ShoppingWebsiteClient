// 用户登录的路由组件
import React, {Component} from 'react'
import {Form, Input, Button, message} from 'antd';
import logo from '../../assets/images/logo.gif'
import './register.less'
import {reqRegister} from '../../api/index'

export default class Login extends Component {

  componentDidMount() {
    document.title = "用户注册"
  }

  render() {

    // onFinish为提交表单且数据验证成功后的回调事件，values即表单数据，分别在输入过程中和点击登录按钮时进行验证
    const onFinish = async values => {
      // console.log(values)
      const result = await reqRegister(values.username, values.password, values.phone, values.email)
      // console.log(result)
      if (result.status === 0) { // 注册成功
        // 提示注册成功
        message.success('注册成功')
      } else { // 注册失败
        // 提示错误信息
        message.error(result.msg)
      }
    };

    return (
      <div className='register-page'>
        <header className='login-header'>
          <img src={logo} alt="logo"/>
          <h1>欢迎登录</h1>
        </header>
        <section className='login-section'>
          <div className='login-photo'></div>
          <div className='login-content'>
            <h2>用户注册</h2>
            <Form name="normal_login" className="login-form" initialValues={{remember: false}} onFinish={onFinish}>
              <Form.Item name="username" label="用户名：" rules={[
                {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '用户名只能由3-12个英文、数字或下划线组成'},
              ]}>
                <Input placeholder="请输入用户名" style={{width: 260, float: "right"}}/>
              </Form.Item>
              <Form.Item name="password" label="密码：" rules={[
                {pattern: /^[a-zA-Z0-9_]{3,12}$/, message: '密码只能由3-12个英文、数字或下划线组成'},
              ]}>
                <Input.Password type='password' placeholder="请输入密码" style={{width: 260, float: "right"}}/>
              </Form.Item>
              <Form.Item name="phone" label="手机号：" rules={[
                {min: 11, max: 11, message: '手机号长度应为11位'},
                {pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确'},
              ]}>
                <Input placeholder="请输入手机号" style={{width: 260, float: "right"}}/>
              </Form.Item>
              <Form.Item name="email" label="邮箱：" rules={[
                {
                  pattern: /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
                  message: '邮箱格式不正确'
                },
              ]}>
                <Input placeholder="请输入邮箱" style={{width: 260, float: "right"}}/>
              </Form.Item>
              <Form.Item style={{height: 50}}>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  注册
                </Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" className="login-form-button"
                        onClick={() => this.props.history.push('/UserLogin')}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
        <footer className='login-footer'>
          欢迎使用XX商城
        </footer>
      </div>
    )
  }
}