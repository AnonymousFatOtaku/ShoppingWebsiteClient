// 保存菜单列表的工具模块
const menuUtils = [
  {
    name: '首页', // 菜单标题
    path: '/home', // 菜单路径
  },
  {
    name: '商品',
    path: '/products',
    children: [ // 子菜单列表
      {
        name: '品类管理',
        path: '/category',
      },
      {
        name: '商品管理',
        path: '/product',
      },
    ]
  },
  {
    name: '用户管理',
    path: '/user',
  },
  {
    name: '角色管理',
    path: '/role',
  },
  {
    name: '图形图表',
    path: '/charts',
    children: [
      {
        name: '柱形图',
        path: '/bar',
      },
      {
        name: '折线图',
        path: '/line',
      },
      {
        name: '饼图',
        path: '/pie',
      },
    ]
  },
  {
    name: '订单管理',
    path: '/order',
  },
  {
    name: '商品列表',
    path: '/userProduct',
  },
  {
    name: '我的订单',
    path: '/userOrder',
  },
]

export default menuUtils