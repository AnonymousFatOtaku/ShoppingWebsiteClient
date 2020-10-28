// 入口js
import React from "react";
// 要渲染必须引入ReactDom
import ReactDom from "react-dom";
// 引入要渲染的组件
import App from "./App.js";

// 将App组件标签渲染到index页面id为root的div上
ReactDom.render(<App/>, document.getElementById('root'));