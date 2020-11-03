// 日期时间处理的工具函数模块
export function formateDate(time) { // 格式化日期
  if (!time) return ''
  let date = new Date(time)
  let finalMonth = date.getMonth() + 1;
  let finalDate = date.getDate();
  let finalHours = date.getHours();
  let finalMinutes = date.getMinutes();
  let finalSeconds = date.getSeconds();

  // 日期时间补零
  if (finalMonth < 10) {
    finalMonth = '0' + (date.getMonth() + 1);
  }
  if (finalDate < 10) {
    finalDate = '0' + date.getDate();
  }
  if (finalHours < 10) {
    finalHours = '0' + date.getHours();
  }
  if (finalMinutes < 10) {
    finalMinutes = '0' + date.getMinutes();
  }
  if (finalSeconds < 10) {
    finalSeconds = '0' + date.getSeconds();
  }

  return date.getFullYear() + '-' + finalMonth + '-' + finalDate + ' ' + finalHours + ':' + finalMinutes + ':' + finalSeconds
}