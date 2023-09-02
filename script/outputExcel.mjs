import { resolve } from "path"; // 导入 Node.js 的 path 模块中的 resolve 函数，用于处理文件路径
import fs from "fs"; // 导入 Node.js 的 fs 模块，用于文件操作
import requireContext from "require-context"; // 导入 require-context 模块，用于在指定目录下加载模块
import xlsx from "node-xlsx"; // 导入 node-xlsx 模块，用于处理 Excel 文件
import chineseS2t from "chinese-s2t"; // 导入 chinese-s2t 模块，用于中文转换

const s2t = chineseS2t.s2t; // 获取 chinese-s2t 模块中的 s2t 函数，用于简体中文转繁体中文
// D:\tof-operate-platform-pc/packages/obg-admin/src/i18n/config/personal/edit
// /tof-operate-platform-pc/packages/obg-portal/src/i18n/portal/order/delivery/dispatch
// d读取模块   package.json 要设置"type": "module";
const excelName = `../../tof-operate-platform-pc/packages/obg-admin/src/i18n/config/personal/edit`; // 设置 excelName 变量为指定路径的字符串
const filePath = resolve(excelName); // 使用 resolve 函数将 excelName 转换为绝对路径
const regex = /i18n\/(.+)/; // 正则表达式，用于匹配路径中的 "i18n" 目录后的内容
const match = excelName.match(regex); // 使用正则表达式匹配 excelName 中的内容
const xlsxName = match[1].replace(/[^A-Za-z_]/g, "_"); // 提取匹配到的内容，并将非字母和下划线的字符替换为下划线
const writeFileName = resolve(
  process.env.HOME,
  "Desktop",
  "国际化",
  `${xlsxName}.xlsx`
); // 使用 resolve 函数创建写入文件的绝对路径

const firstData = [
  "*编码",
  "*类型",
  "*分组",
  "*内容(zh_CN)",
  "*内容(hk_CN)",
  "*内容(en_US)",
]; // 定义第一行数据的内容
const defaultType = "front"; // 设置默认类型为 "front"

let requireZHFile = requireContext(filePath, true, /\zh-CN.js$/); // 使用 require-context 加载指定路径下的模块，并将结果赋值给 requireZHFile
generateMessage(requireZHFile); // 调用 generateMessage 函数，传入 requireZHFile 变量作为参数

function getCurrentPath(fileName) {
  return resolve(filePath, fileName); // 返回指定文件名的绝对路径
}

function exportExcel(excelData) {
  const sheet = "多语言"; // 定义 sheet 的名称为 "多语言"
  const xls = xlsx.build([{ name: sheet, data: excelData }]); // 使用 xlsx.build 函数构建 Excel 文件内容
  console.log(writeFileName, ">>>>>>>module_type<<<<<<<<<<<<<"); // 打印写入文件的路径和 ">>>>>>>module_type<<<<<<<<<<<<<"

  // 创建目录
  fs.mkdirSync(resolve(process.env.HOME, "Desktop", "国际化"), {
    recursive: true,
  }); // 使用 mkdirSync 函数创建目录，如果目录已存在则不会报错

  fs.writeFileSync(writeFileName, xls, { flag: "w" }); // 将 xls 数据写入指定文件
}

async function generateMessage(files) {
  let contentFile = [firstData]; // 定义 contentFile 数组，初始值为第一行数据

  const fileArray = files.keys(); // 获取 files 中模块的键名数组
  for (let i = 0, len = fileArray.length; i < len; i++) {
    let fileName = fileArray[i]; // 获取文件名
    const pathArray = fileName.split("/"); // 将文件名按 "/" 分割为数组
    pathArray.pop(); // 移除最后一个元素（文件名）
    const extraPath = xlsxName + pathArray.join("_").replace(/-/g, "_"); // 将路径拼接为字符串，并将 "-" 替换为 "_"

    const fileData = await import(`file://${getCurrentPath(fileName)}`); // 动态导入文件，并将结果赋值给 fileData
    const content = fileData.default; // 获取导入模块的 default 导出
    for (let key in content) {
      if (content.hasOwnProperty(key)) {
        // 使用 chinese-s2t 库将简体中文转换为繁体中文
        const traditionalContent = s2t(content[key]);
        const fullContent = [
          `${extraPath}_${key}`,
          defaultType,
          extraPath,
          content[key],
          traditionalContent,
          key,
        ]; // 构建完整的内容数组
        contentFile.push(fullContent); // 将完整的内容数组添加到 contentFile 数组中
      }
    }
  }

  exportExcel(contentFile); // 调用 exportExcel 函数，传入 contentFile 数组作为参数
}
