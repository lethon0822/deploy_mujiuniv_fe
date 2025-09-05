<script setup>
import { ref, onMounted, computed } from 'vue'
import { getSchedulesByMonth } from '@/services/scheduleService'
import { fmt2 } from '@/utils/date'

const today = new Date()
const y = today.getFullYear(), m = today.getMonth()+1
const items = ref([])
const selected = ref(today)

onMounted(async () => {
  const { data } = await getSchedulesByMonth(y, m)
  items.value = data
})

const ymd = (d) => `${d.getFullYear()}-${fmt2(d.getMonth()+1)}-${fmt2(d.getDate())}`
const inRange = (it, d) => new Date(it.startDate) <= d && d <= new Date(it.endDate)
const todayList = computed(() => items.value.filter(it => inRange(it, selected.value)))
</script>

<template>
  <div class="widget">
    <div class="head">
      <b>{{ y }}년 {{ m }}월</b>
      <span class="right">{{ ymd(selected) }} ({{ ['일','월','화','수','목','금','토'][selected.getDay()] }})</span>
    </div>
    <div class="mini">
      <!-- 간단한 날짜 스와이퍼 느낌 -->
      <button class="nav" @click="selected = new Date(selected.setDate(selected.getDate()-1))">‹</button>
      <div class="days">
        <span class="d" v-for="i in 7" :key="i"
              :class="{sel: i===4}"
        >{{ new Date(y, m-1, today.getDate()+i-4).getDate() }}</span>
      </div>
      <button class="nav" @click="selected = new Date(selected.setDate(selected.getDate()+1))">›</button>
    </div>

    <ul class="list" v-if="todayList.length">
      <li v-for="it in todayList" :key="it.id" class="li">
        <span class="dot"></span>
        <div class="txt">
          <div class="t">{{ it.scheduleType }}</div>
          <div class="d">{{ it.startDate }} ~ {{ it.endDate }}</div>
        </div>
      </li>
    </ul>
    <div class="empty" v-else>등록된 일정이 없습니다.</div>
  </div>
</template>

<style scoped>
.widget{width:340px;background:#fff;border:1px solid #eee;border-radius:16px;box-shadow:0 0 10px rgba(0,0,0,.06);padding:14px}
.head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.head b{font-size:14px}
.right{font-size:12px;color:#666}
.mini{display:flex;align-items:center;justify-content:space-between;margin:6px 0 10px}
.nav{background:#f2f6ff;border:none;border-radius:8px;padding:4px 8px;cursor:pointer}
.days{display:flex;gap:8px}
.d{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#f7f9ff}
.sel{background:#3BBEFF;color:#fff}
.list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;max-height:180px;overflow:auto}
.li{display:flex;gap:10px;align-items:flex-start;background:#f9f9ff;border:1px solid #eef0ff;border-radius:12px;padding:8px}
.dot{width:8px;height:8px;border-radius:50%;background:#27c161;margin-top:6px}
.t{font-weight:700}
.d{font-size:12px;color:#777}
.empty{color:#888;background:#fafafa;border:1px dashed #e5e7eb;border-radius:12px;padding:14px;text-align:center}
</style>