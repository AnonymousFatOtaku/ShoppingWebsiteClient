import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {EditorState, convertToRaw, ContentState} from 'draft-js'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import MediaComponent from './media-component'

function myBlockRenderer(contentBlock) {
  const type = contentBlock.getType();
  // 图片类型转换为mediaComponent
  if (type === 'atomic') {
    return {
      component: MediaComponent,
      editable: false,
      props: {
        foo: 'bar',
      },
    };
  }
}

// 用来指定商品详情的富文本编辑器组件
export default class RichTextEditor extends Component {

  static propTypes = {
    detail: PropTypes.string
  }

  state = {
    editorState: EditorState.createEmpty(), // 创建一个没有内容的编辑对象
  }

  constructor(props) {
    super(props)
    const html = this.props.detail
    if (html) { // 如果有值根据html格式字符串创建一个对应的编辑对象
      const contentBlock = htmlToDraft(html)
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
      const editorState = EditorState.createWithContent(contentState)
      this.state = {
        editorState,
      }
    } else {
      this.state = {
        editorState: EditorState.createEmpty(), // 创建一个没有内容的编辑对象
      }
    }
  }

  // 输入过程中实时的回调
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    })
  }

  getDetail = () => {
    // 返回输入数据对应的html格式的文本
    return draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
  }

  uploadImageCallBack = (file) => {
    console.log(file)
    return new Promise(
      (resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/upload/uploadImage')
        // 设置请求头
        xhr.setRequestHeader('Token', localStorage.getItem('token'));
        const data = new FormData()
        data.append('image', file)
        xhr.send(data)
        console.log(xhr)
        xhr.addEventListener('load', () => {
          const response = JSON.parse(xhr.responseText)
          console.log(response)
          const url = response.data.url // 获取图片的url
          resolve({data: {link: url}})
        })
        xhr.addEventListener('error', () => {
          const error = JSON.parse(xhr.responseText)
          reject(error)
        })
      }
    )
  }

  render() {
    const {editorState} = this.state
    return (
      <Editor
        editorState={editorState}
        editorStyle={{border: '1px solid black', minHeight: 250, maxHeight: 250, paddingLeft: 10}}
        onEditorStateChange={this.onEditorStateChange}
        blockRendererFn={myBlockRenderer}
      />
    )
  }
}