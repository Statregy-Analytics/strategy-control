<template>
  <span class="information-icon" aria-hidden="true"
    ><img src="/icons/contracts/information-glyph.svg" alt=""
  /></span>
</template>
<script>
export default { name: 'InformationIcon' }
</script>
<style scoped>
.information-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border: 1px solid #ffffff99;
  border-radius: 50%;
  background: transparent;
}
.information-icon img {
  width: 18px;
  height: 18px;
}
</style>
