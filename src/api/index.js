// 包含多个接口请求函数的模块，每个函数返回promise
import ajax from './ajax'

// 登录
export const reqLogin = (username, password) => ajax('/user/login', {username, password}, 'POST')