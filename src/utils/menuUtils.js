// 保存菜单列表的工具模块
const menuUtils = [
  {
    name: '首页', // 菜单标题
    path: '/home', // 菜单路径
    rightId: 1,
  },
  {
    name: '商品',
    path: '/products',
    rightId: 3,
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
    rightId: 8,
  },
  {
    name: '角色管理',
    path: '/role',
    rightId: 13,
  },
  {
    name: '订单管理',
    path: '/order',
    rightId: 18,
  },
  {
    name: '活动管理',
    path: '/promotion',
    rightId: 23,
  },
  {
    name: '日志管理',
    path: '/log',
    rightId: 28,
  },
]

export default menuUtils