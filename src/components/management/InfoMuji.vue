<script setup>
import { ref, onMounted } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'
import { newStudents, findGraduationCandidates } from '@/services/memberService';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const chartRef = ref(null) 
const now = new Date();
const year = now.getFullYear();

onMounted(async() => {
    const label = []
    const data = []
    const res = await newStudents();
    for(let item of res.result){
        label.push(item.deptName)
        data.push(item.user)
    }

    new Chart(chartRef.value, {
        type: 'doughnut',
        data: {
        labels: label,
        datasets: [
            {
            data: data,
            // backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            backgroundColor:['#00664F','#009688','#00BFA5','#FFB300','#FFC107','#FF7043','#8BC34A','#4CAF50','#1976D2','#673AB7']




            }
        ]
        },
        options: {
        responsive: true,
        plugins:{
            legend:{
                display: false // 범례 숨김
            }
        }
        }
    })


})

</script>

<template>
    <div class="info-cover">
        <div>
            <div>{{year}}학년도 신입생</div>
            <div class="chart">
                <div class="count">000<span>명</span></div>
                <canvas ref="chartRef"></canvas>
            </div>
        </div>
        <div>
            <div>{{year}}학년도 졸업예정자</div>
        </div>
    </div>
</template>

<style scoped>
.info-cover{
    display: flex;
}
.chart{
    max-width: 300px;
    max-height: 300px;
    padding: 20px;
    position: relative;
}

.count{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2.5rem;
}

.count > span{
    font-size:20px;
}

</style>