// 包含多个接口请求函数的模块，每个函数返回promise
import ajax from './ajax'

// 用户登录
export const reqUserLogin = (username, password) => ajax('/user/userLogin', {username, password}, 'POST')
// 管理员登录
export const reqAdminLogin = (username, password) => ajax('/admin/adminLogin', {username, password}, 'POST')
// 用户注册
export const reqRegister = (username, password, phone, email) => ajax('/user/addUser', {
  username,
  password,
  phone,
  email
}, 'POST')