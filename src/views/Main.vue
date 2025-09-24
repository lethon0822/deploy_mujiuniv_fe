<script setup>
import { useUserStore } from '@/stores/account';

const u = useUserStore();

console.log(u.state.signedUser)

</script>

<template>
<h1>메인화면</h1>
</template>

<style scoped>

</style>