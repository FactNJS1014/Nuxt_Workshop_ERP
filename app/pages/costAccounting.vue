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
        const res = await axios.get(`${config.apiServer}/report/productsAndCost`);
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
                    <th class="text-left" width="200px">สินค้า</th>
                    <th class="text-right">ต้นทุนการผลิต (บาท)</th>
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
                                    <tr>
                                        <td class="text-left bg-gray-200 font-bold">วัตถุดิบ</td>
                                        <td class="text-right bg-gray-200 font-bold" width="80">สัดส่วน</td>
                                        <td class="text-right bg-gray-200 font-bold" width="90">ราคา</td>
                                        <td class="text-right bg-gray-200 font-bold border-gray-100" width="100">
                                            มูลค่าทุน
                                        </td>
                                    </tr>

                                    <tr v-for="material in product.ProductFormular" :key="material.id">
                                        <td class="text-left">{{ material.Material.name }}</td>
                                        <td class="text-right">
                                            {{ material.quantity }}
                                        </td>
                                        <td class="text-right">
                                            {{ material.Material.price.toLocaleString("th-TH") }}
                                        </td>
                                        <td class="text-right border-gray-100 border-t-2 bg-gray-300">
                                            {{
                                                (material.quantity * material.Material.price).toLocaleString(
                                                    "th-TH"
                                                )
                                            }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
