<script setup>
import Swal from "sweetalert2";
import config from "~/config";
import axios from "axios";
import dayjs from "dayjs";

definePageMeta({
    layout: "admin",
});

const productionPlans = ref([]);
const id = ref("");
const products = ref([]);
const selectedProductId = ref("");
const quantity = ref(0);
const remark = ref("");
const showModal = ref(false);

onMounted(async () => {
    await fetchProductionPlans();
});

const openModal = () => {
    showModal.value = true;

    fetchProducts();
};

const closeModal = () => {
    showModal.value = false;
    quantity.value = 0;
    remark.value = "";
};

const fetchProducts = async () => {
    try {
        if (products.value.length === 0) {
            const res = await axios.get(`${config.apiServer}/api/product/list`);
            products.value = res.data.results;
            selectedProductId.value = products.value[0].id;
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const fetchProductionPlans = async () => {
    try {
        const res = await axios.get(`${config.apiServer}/api/productionPlan/list`);
        productionPlans.value = res.data.results;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const saveProductionPlan = async () => {
    try {
        const payload = {
            productId: selectedProductId.value,
            quantity: quantity.value,
            remark: remark.value,
        };

        if (id.value === "") {
            await axios.post(`${config.apiServer}/api/productionPlan/create`, payload);
        } else {
            await axios.put(
                `${config.apiServer}/api/productionPlan/update/${id.value}`,
                payload
            );
            id.value = "";
        }

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

const editProductionPlan = (plan) => {
    id.value = plan.id;
    selectedProductId.value = plan.productId;
    quantity.value = plan.quantity;
    remark.value = plan.remark;
    openModal();
};

const deleteProductionPlan = async (planId) => {
    try {
        const button = await Swal.fire({
            title: "ยืนยันการลบ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยัน",
        });

        if (button.isConfirmed) {
            await axios.delete(`${config.apiServer}/api/productionPlan/remove/${planId}`);
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
    <div class="title">แผนการผลิต</div>
    <div class="p-4">
        <button class="btn btn-primary" @click="openModal">
            <i class="fa fa-plus me-1"></i>เพิ่มแผนการผลิต
        </button>
        <table class="table mt-3">
            <thead>
                <tr>
                    <th class="text-left" width="200px">สินค้า</th>
                    <th class="text-left" width="220px">จำนวน</th>
                    <th class="text-left">หมายเหตุ</th>
                    <th class="text-left">วันที่สร้าง</th>
                    <th width="110px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="plan in productionPlans" :key="plan.id">
                    <td>{{ plan.Product?.name }}</td>
                    <td>{{ plan.quantity }}</td>
                    <td>{{ plan.remark }}</td>
                    <td>{{ dayjs(plan.createAt).format("DD/MM/YYYY") }}</td>
                    <td class="text-center">
                        <div class="flex justify-start items-center">
                            <button class="btn mr-1 flex" @click="editProductionPlan(plan)">
                                <i class="fa fa-edit me-1"></i>แก้ไข
                            </button>
                            <button class="btn btn-danger flex" @click="deleteProductionPlan(plan.id)">
                                <i class="fa fa-trash me-1"></i>ลบ
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <Modal v-if="showModal" @close="closeModal">
        <div>สินค้า</div>
        <div>
            <select class="form-control" v-model="selectedProductId">
                <option v-for="product in products" :key="product.id" :value="product.id">
                    {{ product.name }}
                </option>
            </select>
        </div>
        <div class="mt-3">จำนวน</div>
        <input type="number" class="form-control" v-model="quantity" />

        <div class="mt-3">หมายเหตุ</div>
        <input type="text" class="form-control" v-model="remark" />

        <button class="btn btn-primary mt-3" @click="saveProductionPlan">
            <i class="fa fa-check me-2"></i>บันทึก
        </button>
    </Modal>
</template>
