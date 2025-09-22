<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";

definePageMeta({
    layout: "admin",
});

const products = ref([]);

onMounted(async () => {
    try {
        const res = await axios.get(`${config.apiServer}/api/report/productCost`);
        products.value = res.data.results;

        products.value.forEach((product) => {
            let totalCost = 0;

            for (const material of product.ProductFormular) {
                totalCost += material.quantity * material.Material.price;
            }

            product.totalCost = totalCost;
        });
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
});
</script>

<template>
    <div class="title">ต้นทุนการผลิต</div>
    <div class="p-4">
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left">สินค้า</th>
                    <th class="text-right" width="150px">ต้นทุนการผลิต (บาท)</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in products" :key="product.id">
                    <td class="flex items-start">{{ product.name }}</td>
                    <td class="text-start">
                        <div v-if="product.ProductFormular.length > 0">
                            <div class="flex justify-between">
                                <div>ส่วนผสม</div>
                                <div class="text-right font-bold mr-1">
                                    {{ product.totalCost.toLocaleString("th-TH") }}
                                </div>
                            </div>
                            <table class="table mt-2">
                                <tbody>
                                    <tr></tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
