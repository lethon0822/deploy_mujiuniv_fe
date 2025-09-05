<script setup>

</script>

<template>
<div class="frame">
  <div class="top d-flex">
    <i class="fa-solid fa-xmark"></i>
  </div>
  <div class="comment">
    <p>뭐시기 저시기 테스트 입니다</p>
    <div class="button">
      <slot></slot>
    </div>
  </div>
</div>
</template>

<style scoped>
.frame{
  margin-left: 30px;
  width: 450px;
  height: 150px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
}

hr{
  margin-top: 0px;
}

.top{
  display: flex;
  justify-content: end;
}
.fa-xmark{
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0; 
  padding:6px 10px ;
}
.comment{
  border-top: 1px solid #E0E0E0;
  padding:25px;
}
p{
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 25px;
}

.button{
  display: flex;
  gap:30px;
  justify-content: center;
}

.btn{
  width: 60px;
  padding: 2px 9px
}
</style>