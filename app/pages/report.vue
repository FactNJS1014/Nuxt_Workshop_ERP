<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";
import dayjs from "dayjs";

definePageMeta({
    layout: "admin",
});

const fromDate = ref(dayjs().format("YYYY-MM-DD"));
const toDate = ref(dayjs().format("YYYY-MM-DD"));
const productions = ref([]);

onMounted(async () => {
    await search();
});

const search = async () => {
    try {
        const payload = {
            fromDate: fromDate.value,
            toDate: toDate.value,
        };
        const res = await axios.post(`${config.apiServer}/api/report/production`, payload);
        productions.value = res.data.results;
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
    <div class="title">รายงานการผลิต</div>
    <div class="p-4">
        <div class="flex">
            <span class="from-date">จากวันที่</span>
            <input type="date" v-model="fromDate" class="form-control-report" />

            <span class="to-date">ถึงวันที่</span>
            <input type="date" v-model="toDate" class="form-control-report" />
            <button class="btn" @click="search">
                <i class="fa fa-search me-2"></i>
                ค้นหา
            </button>
        </div>
        <table class="table mt-3">
            <thead>
                <tr>
                    <th class="text-left" width="150px">วันที่</th>
                    <th class="text-left">สินค้า</th>
                    <th class="text-right" width="150px">จำนวนการผลิต</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="production in productions" :key="production.id">
                    <td class="text-left">
                        {{ dayjs(production.createAt).format("DD/MM/YYYY HH:mm") }}
                    </td>
                    <td class="text-left">{{ production.ProductionPlan.Product.name }}</td>
                    <td class="text-right">{{ production.quantity }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style>
.from-date {
    @apply text-left w-[63px] py-2;
}

.to-date {
    @apply text-right w-[100px] pr-2 py-2;
}

.form-control-report {
    @apply w-[200px];
}
</style>
