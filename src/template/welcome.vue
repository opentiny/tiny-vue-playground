<script lang="tsx">
// 引入 @opentiny/vue 组件
import { Button, Link } from '@opentiny/vue'

export default {
  components: {
    TinyButton: Button,
    TinyLink: Link
  },
  data() {
    return {
      msg: 'hello world!'
    }
  }
}
</script>

<template>
  <TinyButton>确定</TinyButton>
  <h1>{{ msg }}</h1>
  <div class="tinyvue">
    <div class="tinyvue-page">
      tinyvue
      <tiny-link type="success" href='https://github.com/opentiny/tiny-vue'>
        tinyvue
      </tiny-link>
    </div>
  </div>
</template>

<style lang="less" scoped>
  h1{
    color:#5e7ce0;
  }
  .tinyvue{
    font-size: 18xp;
    &-page{
      color:#5e7ce0;
    }
  }
</style>
