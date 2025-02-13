```yaml
title:
  zh-CN: 消息提示
  en-US: Notice
```

## zh-CN

有**info**, **success**, **warning**, **error**四种类型的消息提示，仅提供一个确认按钮用于关闭消息提示对话框。

---

## en-US

There are four types of notice: **info**, **success**, **warning**, **error**, and only a confirmation button is provided to close the notice.

---

```vue
<template>
  <a-space>
    <a-button @click="handleClickInfo">Info</a-button>
    <a-button @click="handleClickSuccess" status="success">Success</a-button>
    <a-button @click="handleClickWarning" status="warning">Warning</a-button>
    <a-button @click="handleClickError" status="danger">Error</a-button>
  </a-space>
</template>

<script>
export default {
  methods:{
    handleClickInfo() {
      this.$modal.info({
        title: 'Info Notification',
        content: 'This is an info description which directly indicates a neutral informative change or action.'
      });
    },
    handleClickSuccess(){
      this.$modal.success({
        title: 'Success Notification',
        content: 'This is a success notification'
      });
    },
    handleClickWarning(){
      this.$modal.warning({
        title: 'Warning Notification',
        content: 'This is a warning description which directly indicates a warning that might need attention.'
      });
    },
    handleClickError(){
      this.$modal.error({
        title: 'Error Notification',
        content: 'This is an error description which directly indicates a dangerous or potentially negative action.'
      });
    }
  }
}
</script>
```
