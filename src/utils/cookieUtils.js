import cookie from 'react-cookies'

export default {

  // 获取当前用户cookie
  getUserCookie() {
    return cookie.load('userInfo')
  },

  // 用户登录，保存cookie
  saveUserCookie(user) {
    cookie.save('userInfo', user, {path: '/'})
  },

  // 用户登出，删除cookie
  removeUserCookie() {
    cookie.remove('userInfo')
    window.location.href = '/AdminLogin'
  }

}