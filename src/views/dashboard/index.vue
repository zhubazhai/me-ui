<template>
  <div class="dashboard-container">
    <div class="dashboard-text">{{ name }}</div>
    <el-upload
      class="upload-demo"
      action
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handle"
    >
      <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
  </div>
</template>

<script>
export default {};
</script>
