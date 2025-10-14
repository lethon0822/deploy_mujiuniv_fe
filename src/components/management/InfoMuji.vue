<script setup>
import { ref, onMounted, reactive} from 'vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { newStudents, findGraduationCandidates, countUser } from '@/services/memberService';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const chartRef = ref(null) 
const countSum = ref(null)
const now = new Date();
const year = now.getFullYear();

const state = reactive({
    data:{
        student: [],
        professor: 0,
        graduation: 0,
        sum: 0
    }
})

onMounted(async() => {
    countUserSum();
    const label = []
    const data = []
    const res = await newStudents();
    for(let item of res.result){
        label.push(item.type)
        data.push(item.user)
    }
    countSum.value = data.reduce((acc, cur) => acc + cur, 0);

    new Chart(chartRef.value, {
        type: 'doughnut',
        data: {
        labels: label,
        datasets: [
            {
            data: data,
            //backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            backgroundColor:['#348a76','#60aba4','#ede4f8']

            }
        ]
        },
        options: {
        responsive: true,
        devicePixelRatio: 2, 
        plugins: {
        legend: {
          position: 'top', // 'top', 'bottom', 'left', 'right' 가능
          labels: {
            font: {
              size: 12, // 🔹 글자 크기 줄이기
              weight: '500'
            },
            boxWidth: 15, // 🔹 색상 박스 크기 조절
            boxHeight: 15,
            padding: 15, // 🔹 각 항목 간 간격
            color: '#333' // 🔹 글자 색상 변경
          }
        },
        title: {
          display: false
        }
      }
    }
  });

});

const countUserSum = async() =>{
    const res1 = await findGraduationCandidates();
    const res2 = await countUser();
    state.data.professor = res2.data.professor;
    state.data.student = res2.data.students;
    state.data.graduation = res1
    state.data.sum = state.data.student.reduce((acc,cur) => acc + cur, 0);
}

</script>

<template>
    <div class="info-cover">
        <div>
            <div class="title">{{year}}학년도 신입생</div>
            <div class="chart">
                <div class="count">{{ countSum }}<span>명</span></div>
                <canvas ref="chartRef"></canvas>
            </div>
        </div>
        <div class="count-result">
            <div>
                <div class="title">{{year}}학년도 인원현황</div>
                <div class="mt-5">
                    <div class="count-card">
                        <span>학생</span>
                        <span>{{ state.data.sum }}명</span>
                    </div>
                    <div class="count-card">
                        <span>교수</span>
                        <span>{{ state.data.professor }}명</span>
                    </div>
                    <div class="count-card">
                        <span>졸업예정자</span>
                        <span>{{ state.data.graduation }}명</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-cover{
    display: flex;
}

.title{
    display: flex;
    justify-content: center;
    font-size: 16px;
    padding: 5px;
}
.chart{
    max-width: 300px;
    max-height: 300px;
    aspect-ratio: 1 / 1; /*정사각형 비율 고정 */
    position: relative;
    padding: 10px;
}

.chart canvas {
    width: 100%;               /* ✅ 부모 비율에 맞춰 자동 축소 */
    height: 100%;
    display: block;
}

.count{
    position: absolute;
    top: 58%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
}

.count > span{
    font-size:20px;
}

.count-result{
    display: flex;
    flex:1;
    justify-content: center;
    
    
}

.count-card{
    border: 1px solid #5ba666;
    min-width: 300px;
    height: 50px;
    border-radius: 10px;   
    padding: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    align-items: center;
    margin: 20px 0 ;
}

</style>