<script setup>
import axios from "axios";
import config from "~/config";
import Swal from "sweetalert2";
import dayjs from "dayjs";
definePageMeta({
    layout: "admin",
});

const productPlans = ref([]);
const isShowModal = ref(false);
const productionPlanId = ref("");
const productName = ref("");
const productId = ref("");
const quantity = ref(0);
const remark = ref("");

//modal Production
const isShowModalProduction = ref(false);
const productionId = ref("");
const productionQuantity = ref(0);
const productionRemark = ref("");
const productions = ref([]);
const selectedProductionPlanId = ref("");
const selectedProductionName = ref("");

onMounted(async () => {
    await fetchProductionPlans();
});

const openModal = (plan) => {
    isShowModal.value = true;
    productionPlanId.value = plan.id;
    productName.value = plan.Product?.name || "";
    productId.value = plan.Product?.id || "";
};

const closeModal = () => {
    isShowModal.value = false;
};

const fetchProductionPlans = async () => {
    try {
        const res = await axios.get(`${config.apiServer}/productionPlan/list`);
        productPlans.value = res.data.results;

        for (const productionPlan of productPlans.value) {
            let sum = 0;
            for (const production of productionPlan.Production) {
                sum += production.quantity;
            }
            productionPlan.sumAmount = sum;
            productionPlan.currentPercent = ((sum / productionPlan.quantity) * 100).toFixed(2);
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const save = async () => {
    try {
        if (quantity.value <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "กรุณาระบุจำนวนที่ผลิตมากกว่า 0",
            });
            return;
        }

        const data = {
            productionPlanId: productionPlanId.value,
            quantity: quantity.value,
            remark: remark.value,
        };

        await axios.post(`${config.apiServer}/production/create`, data);

        Swal.fire({
            icon: "success",
            title: "Success",
            text: "บันทึกข้อมูลเรียบร้อย",
        });

        closeModal();
        await fetchProductionPlans();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const openModalProduction = async (plan) => {
    isShowModalProduction.value = true;
    selectedProductionPlanId.value = plan.id;
    selectedProductionName.value = plan.Product?.name || "";

    await fetchDataProductions();
};

const closeModalProduction = () => {
    isShowModalProduction.value = false;
};

const fetchDataProductions = async () => {
    try {
        const res = await axios.get(
            `${config.apiServer}/production/list/${selectedProductionPlanId.value}`
        );
        productions.value = res.data.results;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const removeProduction = async (productionId) => {
    try {
        const button = await Swal.fire({
            title: "ยืนยันการลบข้อมูล?",
            text: "คุณต้องการลบข้อมูลนี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "ใช่, ฉันต้องการลบ!",
            cancelButtonText: "ยกเลิก",
        });

        if (button.isConfirmed) {
            await axios.delete(`${config.apiServer}/production/remove/${productionId}`);

            await fetchDataProductions();
            await fetchProductionPlans();
        }
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
    <div class="title">บันทึกการผลิต</div>
    <div class="p-4">
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left" width="250px">ชื่อสินค้า</th>
                    <th class="text-left" width="100px">ประเภทสินค้า</th>
                    <th class="text-left" width="115px">บรรจุภัณฑ์</th>
                    <th class="text-right" width="100px">จำนวน</th>
                    <th class="text-right" width="120px">ผลิตได้ (ถ้ามี)</th>
                    <th class="text-right" width="110px">ผลิตได้ (%)</th>
                    <th class="text-center" width="120px">สถานะ</th>
                    <th width="170px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="plan in productPlans" :key="plan.id">
                    <td>
                        <div>{{ plan.Product.name }}</div>
                        <div v-if="plan.remark" class="text-sm text-red-500">
                            *** {{ plan.remark }}
                        </div>
                    </td>
                    <td>{{ plan.Product.ProductType.name }}</td>
                    <td>{{ plan.Product.Packaging.name }}</td>
                    <td class="text-right">{{ plan.quantity }}</td>
                    <td class="text-right">{{ plan.sumAmount }}</td>
                    <td class="text-right">{{ plan.currentPercent }}</td>
                    <td class="text-center">
                        <span v-if="plan.currentPercent < 100" class="text-red-600">
                            <i class="fa fa-check-circle"></i>กำลังผลิต
                        </span>
                        <span v-else class="text-green-600">
                            <i class="fa fa-check-circle"></i>ผลิตเสร็จ
                        </span>
                    </td>

                    <td class="text-center">
                        <div class="flex">
                            <button class="btn mr-1" @click="openModal(plan)">
                                <i class="fa fa-plus"></i> บันทึกการผลิต
                            </button>
                            <button class="btn btn-sm btn-primary" @click="openModalProduction(plan)">
                                <i class="fa fa-solid fa-pencil"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <Modal v-if="isShowModal" @close="closeModal">
        <div>สินค้า</div>
        <div class="bg-gray-200 p-2 ps-3 rounded-lg">{{ productName }}</div>

        <div class="mt-3">จำนวนที่ผลิตได้</div>
        <input type="number" v-model="quantity" class="form-control" placeholder="ระบุจำนวนที่ผลิตได้" min="0" />
        <div class="mt-3">หมายเหตุ (ถ้ามี)</div>
        <input type="text" v-model="remark" class="form-control" placeholder="ระบุหมายเหตุ (ถ้ามี)" />

        <button class="btn mt-3" @click="save">
            <i class="fa fa-save"></i> บันทึกข้อมูล
        </button>
    </Modal>

    <Modal v-if="isShowModalProduction" @close="closeModalProduction" size="lg">
        <div class="mb-3 text-center font-bold text-gray-700">
            สินค้า {{ selectedProductionName }}
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th class="text-left" width="170px">วันที่</th>
                    <th class="text-right" width="100px">จำนวน</th>
                    <th class="text-left" width="170px">หมายเหตุ</th>
                    <th width="110px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="prod in productions" :key="prod.id">
                    <td class="text-left">{{ dayjs(prod.createAt).format("DD/MM/YYYY") }}</td>
                    <td class="text-right">{{ prod.quantity }}</td>
                    <td class="text-left">{{ prod.remark }}</td>
                    <td class="text-center">
                        <button class="btn btn-danger" @click="removeProduction(prod.id)">
                            <i class="fa fa-solid fa-times"></i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </Modal>
</template>
