<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="include" :exclude="exclude" :max="max">
      <component :is="Component"/>
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import {toRefs} from "vue";
import {useRouter} from "vue-router";
import {argsData, keepAliveOpt} from "./store";

export default {
  setup() {
    if (argsData.window.route) useRouter().replace(argsData.window.route);
    return {...toRefs(keepAliveOpt)};
  }
}
</script>
<style lang="scss">
@import "views/scss/color";
@import "views/scss/main";
</style>
