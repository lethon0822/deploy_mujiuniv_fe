<script setup>
import { ref, watch, computed } from 'vue'
import { getSchedulesByMonth } from '@/services/scheduleService'
import { TYPE_ORDER, TYPE_META } from '@/constants/scheduleTypes'

const props = defineProps({
  date: { type: Date, required: true },
  selectedYmd: { type: String, default: '' },
  selectedTypes: { type: Array, default: () => [] },
  flat: { type: Boolean, default: false },
})
const emit = defineEmits(['add-click', 'edit-click'])

const items = ref([])

const monthKey = computed(() => ({
  year: props.date.getFullYear(),
  month: props.date.getMonth() + 1,
}))

const fetchMonth = async () => {
  try {
    const arr = await getSchedulesByMonth(monthKey.value.year, monthKey.value.month)
    // 서비스에서 이미 배열 보장하지만, 혹시 몰라 한 번 더 가드
    items.value = Array.isArray(arr) ? arr : []
  } catch (e) {
    console.error('[schedule] month fetch fail', e)
    items.value = []
  }
}
watch(monthKey, fetchMonth, { immediate: true })

// 날짜 + 타입 필터
const baseFiltered = computed(() => {
  const src = Array.isArray(items.value) ? items.value : []
  let arr = src
  if (props.selectedYmd) {
    const d = new Date(props.selectedYmd)
    arr = arr.filter(it => new Date(it.startDate) <= d && d <= new Date(it.endDate))
  }
  if (props.selectedTypes?.length) {
    arr = arr.filter(it => props.selectedTypes.includes(it.scheduleType))
  }
  return arr
})

// 타입별 그룹핑
const groups = computed(() => {
  const map = {}
  TYPE_ORDER.forEach(t => (map[t] = []))
  // baseFiltered가 항상 배열이므로 안전
  baseFiltered.value.forEach(it => {
    (map[it.scheduleType] ||= []).push(it)
  })
  return map
})
</script>
  <template>
    <div class="panel" :class="{ flat: props.flat }">  <!-- ✅ 변경 -->
      <div class="hdr">
        <div class="title">학사일정 목록</div>
        <button class="add" @click="$emit('add-click')">+ 일정 추가</button>
      </div>

      <div class="groups">
        <template v-for="t in TYPE_ORDER" :key="t">
          <div v-if="groups[t] && groups[t].length" class="group">
            <div class="g-title">
              <i class="g-dot" :style="{ background: TYPE_META[t]?.color }"></i>{{ t }}
            </div>
            <ul class="list">
              <li v-for="it in groups[t]" :key="it.id" class="card" @click="$emit('edit-click', it)">
                <div class="row1">
                  <span
                    class="badge"
                    :style="{ background: TYPE_META[it.scheduleType]?.color || '#e7f6ff', color: '#fff' }"
                  >{{ it.scheduleType }}</span>
                  <!-- 학기 ID 노출 제거 -->
                </div>
                <div class="row2">{{ it.startDate }} ~ {{ it.endDate }}</div>
              </li>
            </ul>
          </div>
        </template>

        <div v-if="!baseFiltered.length" class="empty">선택한 조건에 해당하는 일정이 없습니다.</div>
      </div>
    </div>
  </template>

  <style scoped>
  /* ✅ 루트: 고정폭/최소높이 제거, 플렉스로 내부 스크롤 계산 */
  .panel{
    display:flex;
    flex-direction:column;
    width:100%;                 /* 380px → 100% */
    height:100%;                /* 오른쪽 컬럼 높이 채움 */
    border-radius:20px;
    background:#fff;
    border:1px solid #dedede;
    box-shadow:0 0 10px rgba(0,0,0,.08);
  }

  /* ✅ flat 모드: 카드 제거(투명), 여백만 간단히 */
  .panel.flat{
    background:transparent;
    border:none;
    box-shadow:none;
    border-radius:0;
  }

  /* 헤더 */
  .hdr{
    display:flex;justify-content:space-between;align-items:center;
    padding:16px 24px;          /* 칩과 라인 맞추기: 좌우 24px */
    border-bottom:1px solid #f1f1f1;
    color:#343A40;
  }
  .title{font-weight:700}
  .add{background:#3BBEFF;border:none;color:#fff;border-radius:20px;padding:8px 12px;cursor:pointer;font-weight:700}

  /* 본문: 플렉스 남는 영역 스크롤 */
  .groups{
    flex:1;                     /* ✅ 남는 높이 채움 */
    overflow:auto;              /* 내용 많으면 내부 스크롤 */
    padding:12px 24px 18px;     /* 칩/헤더와 좌우 라인 일치 */
  }

  .group{margin-bottom:12px}
  .g-title{display:flex;align-items:center;gap:8px;font-weight:700;margin:6px 0}
  .g-dot{width:10px;height:10px;border-radius:50%}

  .list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
  .card{background:#f9f9ff;border:1px solid #eef0ff;border-radius:14px;padding:12px 14px;cursor:pointer}
  .card:hover{background:#f2f8ff}
  .row1{display:flex;gap:8px;align-items:center;margin-bottom:6px}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;font-weight:700;font-size:12px;color:#fff}
  .row2{color:#555;font-size:13px}
  .empty{padding:30px 12px;color:#777}
  </style>