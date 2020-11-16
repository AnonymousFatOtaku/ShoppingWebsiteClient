import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Input,
  Tree
} from 'antd'
import menuList from '../../utils/menuUtils'

const {TreeNode} = Tree;

// 设置角色权限的form组件
export default class AuthForm extends PureComponent {

  static propTypes = {
    role: PropTypes.object
  }

  constructor(props) {
    super(props)
    // 根据传入角色的menus生成初始状态
    const {menus} = this.props.role
    this.state = {
      checkedKeys: menus
    }
  }

  // 为父组件提交获取最新menus数据的方法
  getMenus = () => this.state.checkedKeys

  // 获取所有子节点
  getTreeNodes = (menuList) => {
    return menuList.reduce((pre, item) => {
      pre.push(
        <TreeNode title={item.name} key={item.path} disabled={item.path === '/home'}>
          {item.children ? this.getTreeNodes(item.children) : null}
        </TreeNode>
      )
      return pre
    }, [])
  }

  // 选中某个node时的回调
  onCheck = checkedKeys => {
    // console.log('onCheck', checkedKeys);
    this.setState({checkedKeys});
  };

  componentWillMount() {
    this.treeNodes = this.getTreeNodes(menuList)
  }

  // 根据新传入的role来更新checkedKeys状态，当组件接收到新的属性时自动调用
  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps()', nextProps)
    const menus = nextProps.role.menus
    this.setState({
      checkedKeys: menus
    })
  }

  render() {
    const {role} = this.props
    let {checkedKeys} = this.state
    if (checkedKeys.indexOf("/home") === -1) {
      checkedKeys.push('/home')
    }
    console.log(checkedKeys, checkedKeys.length)

    return (
      <div>
        <Form.Item label='角色名称'>
          <Input value={role.name} disabled/>
        </Form.Item>
        <Tree checkable defaultExpandAll={true} checkedKeys={checkedKeys} onCheck={this.onCheck}>
          <TreeNode title="平台权限" key="all">
            {this.treeNodes}
          </TreeNode>
        </Tree>
      </div>
    )
  }
}