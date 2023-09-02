import { readFile, writeFile } from "fs/promises"; // 导入 fs/promises 模块中的 readFile 和 writeFile 函数，用于文件读写
import { exec } from "child_process"; // 导入 child_process 模块中的 exec 函数，用于执行子进程
import * as util from "util"; // 导入 util 模块，用于工具函数
import { join } from "path"; // 导入 path 模块中的 join 函数，用于处理文件路径

export const promiseExec = util.promisify(exec); // 使用 util.promisify 将 exec 函数转换为返回 Promise 的函数
const jsonPath = join(process.cwd(), "package.json"); // 使用 join 函数将当前工作目录和 'package.json' 拼接为文件路径的字符串
console.log("🚀 ~ file: setModule.mjs:8 ~ jsonPath:", jsonPath); // 打印 jsonPath 变量的值
readFile(jsonPath, "utf8").then(async (file) => {
  // 使用 readFile 函数读取文件内容，返回一个 Promise
  const jsonData = JSON.parse(file); // 将读取的文件内容解析为 JSON 对象
  jsonData.type = "module"; // 修改 jsonData 对象的 type 属性为 'module'
  await writeFile(jsonPath, JSON.stringify(jsonData)); // 使用 writeFile 函数将修改后的 jsonData 对象写入文件
  try {
    await promiseExec("npm run output", {
      // 使用 promiseExec 函数执行 'npm run output' 命令
      cwd: process.cwd(), // 设置子进程的当前工作目录为当前工作目录
    });
  } catch (error) {
    process.exit(); // 如果发生错误，退出当前进程
    console.log(error); // 打印错误信息
  } finally {
    writeFile(jsonPath, file); // 在 finally 块中使用 writeFile 函数将原始文件内容写回文件
  }
});
