<script setup>
import config from "~/config";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { Chart } from "chart.js/auto";

definePageMeta({
    layout: "admin",
});

const listMonth = ref([
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
]);

const listDays = ref([]);
const listYears = ref([]);
const selectedMonth = ref(dayjs().month());
const selectedYear = ref(dayjs().year());
const sumProductionPerDays = ref([]);
const sumProductionPerMonth = ref([]);
const sumProductionPlan = ref(0);
const sumProduction = ref(0);
const sumProductionWaiting = ref(0);
const sumPurchase = ref(0);

const chartMonth = ref(null);
const chartDays = ref(null);
const chartMonthDoughnut = ref(null);

onMounted(async () => {
    const totalDayInMonth = dayjs(
        `${selectedYear.value}-${selectedMonth.value}-01`
    ).daysInMonth();

    listYears.value = Array.from({ length: 5 }, (_, i) => dayjs().year() - i);
    listDays.value = Array.from({ length: totalDayInMonth }, (_, i) => i + 1);

    await fetchData();
});

const fetchData = async () => {
    sumProductionPerDays.value = [];

    await fetchDataSumProductionPlan();
    await fetchDataSumProduction();
    await fetchDataSumPurchase();

    renderChartMonth();
    renderChartDays();
};

const fetchDataSumProductionPlan = async () => {
    try {
        const payload = {
            month: selectedMonth.value + 1,
            year: selectedYear.value,
        };
        const res = await axios.post(
            `${config.apiServer}/report/sumProductionPlanPerYearAndMonth`,
            payload
        );

        sumProductionPlan.value = res.data.results;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const fetchDataSumProduction = async () => {
    try {
        const payload = {
            month: selectedMonth.value + 1,
            year: selectedYear.value,
        };
        const res = await axios.post(
            `${config.apiServer}/report/sumProductionPerYearAndMonth`,
            payload
        );

        sumProduction.value = res.data.results;

        sumProductionWaiting.value = sumProductionPlan.value - sumProduction.value;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const fetchDataSumPurchase = async () => {
    try {
        const payload = {
            month: selectedMonth.value + 1,
            year: selectedYear.value,
        };
        const res = await axios.post(
            `${config.apiServer}/report/sumPriceStockMaterial`,
            payload
        );

        sumPurchase.value = res.data.results;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const renderChartMonth = async () => {
    try {
        const payload = {
            year: selectedYear.value,
        };
        const res = await axios.post(
            `${config.apiServer}/report/sumProductionPerMonthAndYear`,
            payload
        );

        sumProductionPerMonth.value = res.data.results;
        sumProductionPerMonth.value = Array.from({ length: 12 }, () =>
            Math.floor(Math.random() * 100)
        );

        if (chartMonth.value) {
            chartMonth.value.destroy();
        }

        if (chartMonthDoughnut.value) {
            chartMonthDoughnut.value.destroy();
        }
        chartMonth.value = new Chart(document.getElementById("chartMonth"), {
            type: "bar",
            data: {
                labels: listMonth.value,
                datasets: [
                    {
                        data: sumProductionPerMonth.value,
                    },
                ],
            },
        });

        chartMonthDoughnut.value = new Chart(document.getElementById("chartMonthDoughnut"), {
            type: "doughnut",
            data: {
                labels: listMonth.value,
                datasets: [
                    {
                        data: sumProductionPerMonth.value,
                    },
                ],
            },
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const renderChartDays = async () => {
    try {
        const payload = {
            month: selectedMonth.value + 1,
            year: selectedYear.value,
        };
        const res = await axios.post(
            `${config.apiServer}/report/sumProductPerDayInMonthAndYear`,
            payload
        );

        sumProductionPerDays.value = res.data.results;
        sumProductionPerDays.value = Array.from({ length: 30 }, () =>
            Math.floor(Math.random() * 100)
        );

        if (chartDays.value) {
            chartDays.value.destroy();
        }
        chartDays.value = new Chart(document.getElementById("chartDays"), {
            type: "bar",
            data: {
                labels: listDays.value,
                datasets: [
                    {
                        data: sumProductionPerDays.value,
                    },
                ],
            },
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};
</script>

<template>
    <div class="title text-2xl font-bold">Dashboard</div>
    <div class="p-3">
        <div class="flex gap-2 items-center">
            <span>ปี</span>
            <select v-model="selectedYear" class="form-control-report" @change="fetchData">
                <option v-for="year in listYears" :key="year" :value="year">{{ year }}</option>
            </select>

            <span>เดือน</span>
            <select v-model="selectedMonth" class="form-control-report" @change="fetchData">
                <option v-for="(month, index) in listMonth" :key="index" :value="index">
                    {{ month }}
                </option>
            </select>

            <button class="btn" @click="fetchData">
                <i class="fa fa-magnifying-glass mr-1"></i>
                ค้นหา
            </button>
        </div>

        <div class="flex justify-between gap-2 mt-4">
            <div class="rounded-xl w-full bg-gradient-to-b from-indigo-700 to-indigo-400">
                <div class="text-white text-2xl px-8 py-5 rounded-t-xl">แผนการผลิต (รายการ)</div>
                <div class="text-white text-5xl px-8 pt-3 pb-8 py-5 rounded-b-xl">
                    {{ sumProductionPlan.toLocaleString("th-TH") }}
                </div>
            </div>
            <div class="rounded-xl w-full bg-gradient-to-b from-green-700 to-green-400">
                <div class="text-white text-2xl px-8 py-5 rounded-t-xl">ยอดการผลิต (รายการ)</div>
                <div class="text-white text-5xl px-8 pt-3 pb-8 py-5 rounded-b-xl">
                    {{ sumProduction.toLocaleString("th-TH") }}
                </div>
            </div>
            <div class="rounded-xl w-full bg-gradient-to-b from-yellow-700 to-yellow-400">
                <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                    สินค้ารอผลิต (รายการ)
                </div>
                <div class="text-white text-5xl px-8 pt-3 pb-8 py-5 rounded-b-xl">
                    {{ sumProductionWaiting.toLocaleString("th-TH") }}
                </div>
            </div>
            <div class="rounded-xl w-full bg-gradient-to-b from-red-700 to-red-400">
                <div class="text-white text-2xl px-8 py-5 rounded-t-xl">
                    ยอดซื้อวัตถุดิบ (บาท)
                </div>
                <div class="text-white text-5xl px-8 pt-3 pb-8 py-5 rounded-b-xl">
                    {{ sumPurchase.toLocaleString("th-TH") }}
                </div>
            </div>
        </div>
        <div class="grid grid-cols-12 gap-2 mt-4">
            <div class="col-span-6 bg-white p-4 rounded-xl shadow-lg shadow-gray-500">
                <div class="text-xl font-bold mb-3">
                    ยอดการผลิตรายเดือน (ปี {{ selectedYear }})
                </div>
                <canvas id="chartMonth" height="150"></canvas>
            </div>
            <div class="col-span-6 bg-white p-4 rounded-xl shadow-lg shadow-gray-500">
                <div class="text-xl font-bold mb-3">
                    ยอดการผลิตรายเดือน (ปี {{ selectedYear }})
                </div>
                <canvas id="chartMonthDoughnut" height="50"></canvas>
            </div>
        </div>
    </div>
    <div class="mt-5 pb-10">
        <div class="pl-5 pr-5 w-full">
            <div class="text-2xl text-center">ยอดการผลิตรายวัน</div>
            <canvas id="chartDays" height="100"></canvas>
        </div>
    </div>
</template>
