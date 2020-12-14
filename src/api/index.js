// 包含多个接口请求函数的模块，每个函数返回promise
import ajax from './ajax'
import jsonp from 'jsonp'
import {message} from 'antd'

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
// 根据用户id获取用户权限列表
export const reqRights = (pk_user_id) => ajax('/right/getRightsByUserId', {pk_user_id})
// 获取所有角色的列表
export const reqRoles = () => ajax('/role/getAllRoles')
// 添加角色
export const reqAddRole = (parent_role_id, name, description) => ajax('/role/addRole', {
  parent_role_id,
  name,
  description
}, 'POST')
// 根据角色id获取角色权限列表
export const reqRightsByRoleId = (pk_role_id) => ajax('/right/getRightsByRoleId', {pk_role_id})
// 更新角色拥有的权限
export const reqUpdateRoleRights = (pk_role_id, menus) => ajax('/role/updateRoleRights', {pk_role_id, menus}, 'POST')
// 根据用户id获取用户角色
export const reqUserRole = (pk_user_id) => ajax('/role/getRoleByUserId', {pk_user_id})
// 获取所有用户的列表
export const reqUsers = () => ajax('/user/getAllUsers')
// 获取用户角色关联信息
export const reqUserRoles = () => ajax('/role/getUserRoles')
// 删除一个角色
export const reqDeleteRole = (pk_role_id) => ajax('/role/deleteRole', {pk_role_id}, 'POST')
// 根据角色id获取所属用户
export const reqUsersByRoleId = (fk_role_id) => ajax('/role/getUsersByRoleId', {fk_role_id},)
// 删除指定用户
export const reqDeleteUser = (pk_user_id) => ajax('/user/deleteUser', {pk_user_id}, 'POST')
// 添加/更新用户
export const reqAddOrUpdateUser = (user) => ajax('/user/' + (user.pk_user_id ? 'updateUser' : 'addUser'), user, 'POST')
// 修改用户权限
export const reqUpdateUserRole = (user) => ajax('/user/updateUserRole', user, 'POST')
// 根据信息获取用户
export const reqUserByUsernameAndPhoneAndEmail = (username, phone, email) => ajax('/user/getUserByUsernameAndPhoneAndEmail', {
  username,
  phone,
  email
})
// 修改用户密码
export const reqUpdateUserPassword = (password, pk_user_id) => ajax('/user/updateUserPassword', {
  password,
  pk_user_id
}, 'POST')
// 获取一级/二级分类的列表
export const reqCategorys = (parent_category_id) => ajax('/category/getCategoriesByParentId', {parent_category_id})
// 添加分类
export const reqAddCategory = (parent_category_id, name, description) => ajax('/category/addCategory', {
  parent_category_id,
  name,
  description
}, 'POST')
// 更新分类
export const reqUpdateCategory = ({categoryName, categoryDescription, categoryId}) => ajax('/category/updateCategory', {
  categoryName,
  categoryDescription,
  categoryId
}, 'POST')
// 获所有分类的列表
export const reqAllCategorys = () => ajax('/category/getAllCategories')
// 添加/修改商品
export const reqAddOrUpdateProduct = (product) => ajax('/product/' + (product.pk_product_id ? 'updateProduct' : 'addProduct'), product, 'POST')
// 获取商品分页列表
export const reqProducts = () => ajax('/product/getAllProducts')
// 更新商品的状态(上架/下架)
export const reqUpdateStatus = (productId, status) => ajax('/product/updateStatus', {productId, status}, 'POST')
// 根据商品名称/商品描述搜索商品分页列表，搜索的类型：productName/categoryName
export const reqSearchProducts = ({searchName, searchType}) => ajax('/product/searchProducts', {searchName, searchType})
// 删除一个商品
export const reqDeleteProduct = (pk_product_id) => ajax('/product/deleteProduct', {pk_product_id}, 'POST')
// 获取一个分类
export const reqCategory = (categoryId) => ajax('/category/getCategoryById', {categoryId})
// 删除一个分类
export const reqDeleteCategory = (pk_category_id) => ajax('/category/deleteCategory', {pk_category_id}, 'POST')
// 获取所有活动的列表
export const reqPromotions = () => ajax('/promotion/getAllPromotions')
// 添加/更新活动
export const reqAddOrUpdatePromotion = (promotion) => ajax('/promotion/' + (promotion.pk_promotion_id ? 'updatePromotion' : 'addPromotion'), promotion, 'POST')
// 删除指定活动
export const reqDeletePromotion = (pk_promotion_id) => ajax('/promotion/deletePromotion', {pk_promotion_id}, 'POST')
// 获取活动商品列表
export const reqPromotionProducts = (fk_promotion_id) => ajax('/promotion/getPromotionProducts', {fk_promotion_id})
// 设置活动商品列表
export const reqSetPromotionProducts = (products, pk_promotion_id) => ajax('/promotion/setPromotionProducts', {
  products,
  pk_promotion_id
}, 'POST')
// 获取活动商品列表
export const reqAllPromotionProducts = () => ajax('/promotion/getAllPromotionProducts')
// 获取订单分页列表
export const reqOrders = () => ajax('/order/getAllOrders')
// 删除指定名称的图片
export const reqDeleteImg = (name) => ajax('/manage/img/delete', {name}, 'POST')
// 根据商品id/用户id搜索订单列表
export const reqSearchOrders = ({searchName, searchType}) => ajax('/order/searchOrders', {searchName, searchType})
// 删除指定活动
export const reqDeleteOrder = (pk_order_id) => ajax('/order/deleteOrder', {pk_order_id}, 'POST')
// 更新指定活动
export const reqUpdateOrder = (name, phone, address, payment, pk_order_id) => ajax('/order/updateOrder', {
  name,
  phone,
  address,
  payment,
  pk_order_id
}, 'POST')
// 根据订单id获取订单详情
export const reqOrderInfo = (fk_order_id) => ajax('/order/getOrderInfoByOrderId', {fk_order_id})
// 获取日志列表
export const reqLogs = () => ajax('/log/getAllLogs')
// 添加日志
export const reqAddLog = (operateType, operate_content, pk_user_id) => ajax('/log/addLog', {
  operateType,
  operate_content,
  pk_user_id
}, 'POST')
// 根据条件搜索日志列表
export const reqSearchLogs = ({searchName, searchType, startTime, endTime}) => ajax('/log/searchLogs', {
  searchName,
  searchType,
  startTime,
  endTime
})
// 获取当前IP所在地天气
export const reqWeather = () => {
  return new Promise((resolve, reject) => {
    const url = `https://v0.yiketianqi.com/api?version=v61&appid=49951693&appsecret=ZPVM6jNp`
    // 发送jsonp请求
    jsonp(url, {}, (err, data) => {
      if (!err && data) { // 如果没有错误且有获取到数据
        // 取出需要的数据
        const wea = data.wea
        const city = data.city
        const tem = data.tem
        resolve({wea, city, tem})
      } else {
        message.error('获取天气信息失败')
      }
    })
  })
}