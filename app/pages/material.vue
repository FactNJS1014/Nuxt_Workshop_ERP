<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";
import Modal from "~/components/modal.vue";
definePageMeta({
  layout: "admin",
});
const showModal = ref(false);

//material
const materials = ref([]);
const id = ref("");
const name = ref("");
const unit = ref("");
const price = ref(0);
const remark = ref("");

//stock material
const showModalStockMaterial = ref(false);
const stockMaterialMaterialId = ref("");
const listMaterials = ref([]);
const stockMasterialQuantity = ref(0);
const stockMaterialPrice = ref(0);
const stockMaterialRemark = ref("");
const stockMaterialId = ref("");

const openModalStockMaterial = async () => {
  showModalStockMaterial.value = true;

  try {
    const res = await axios.get(`${config.apiServer}/api/material/list`);
    listMaterials.value = res.data.results;
    stockMaterialId.value = materials.value[0].id;
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message,
    });
  }
};

const closeModalStockMaterial = () => {
  showModalStockMaterial.value = false;
  stockMaterialMaterialId.value = "";
  stockMasterialQuantity.value = 0;
  stockMaterialPrice.value = 0;
  stockMaterialRemark.value = "";
};

const closeModal = () => {
  showModal.value = false;
  name.value = "";
  unit.value = "";
  price.value = 0;
  remark.value = "";
};

const edit = (material) => {
  id.value = material.id;
  name.value = material.name;
  unit.value = material.unit;
  price.value = material.price;
  remark.value = material.remark;

  showModal.value = true;
};

const save = async () => {
  try {
    const payload = {
      name: name.value,
      unit: unit.value,
      price: price.value,
      remark: remark.value,
    };
    if (id.value === "") {
      await axios.post(`${config.apiServer}/api/material/create`, payload);
    } else {
      await axios.put(`${config.apiServer}/api/material/update/${id.value}`, payload);
      id.value = "";
    }
    await fetchData();
    closeModal();
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message,
    });
  }
};

const saveStockMaterial = async () => {
  try {
    const payload = {
      material_id: stockMaterialMaterialId.value,
      quantity: stockMasterialQuantity.value,
      price: stockMaterialPrice.value,
      remark: stockMaterialRemark.value,
    };
    await axios.post(`${config.apiServer}/api/stockMaterial/create`, payload);
    closeModalStockMaterial();
    fetchData();
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message,
    });
  }
};

const selectStockMaterial = () => {
  const material = listMaterials.value.find((m) => m.id == stockMaterialMaterialId.value);
  stockMaterialPrice.value = material.price;
  stockMaterialId.value = material.id;
};

const remove = async (id) => {
  try {
    const button = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบวัสดุ, ส่วนผสมนี้หรือไม่?",
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (button.isConfirmed) {
      await axios.delete(`${config.apiServer}/api/material/remove/${id}`);
      await fetchData();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

onMounted(async () => {
  await fetchData();
});

const fetchData = async () => {
  try {
    const res = await axios.get(`${config.apiServer}/api/material/list`);
    for (const material of res.data.results) {
      material.balance = 0;

      for (const stockMaterial of material.StockMaterial) {
        material.balance += stockMaterial.quantity;
      }
    }

    materials.value = res.data.results;
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message,
    });
  }
};
</script>

<template>
  <div class="title">วัสดุ ,ส่วนผสม</div>
  <div class="p-4">
    <button class="btn me-1" @click="showModal = true">
      <i class="fa fa-plus mr-1"></i>
      เพิ่มวัสดุ, ส่วนผสม
    </button>
    <button class="btn me-1" @click="openModalStockMaterial">
      <i class="fa fa-arrow-circle-down mr-1"></i>
      รับเข้าสต๊อก
    </button>
    <button class="btn me-1">
      <i class="fa fa-history mr-1"></i>
      ประวัติการรับเข้าสต๊อก
    </button>

    <table class="table mt-3" spaceing="1">
      <thead>
        <tr>
          <th width="200px" class="text-left">ชื่อ</th>
          <th width="200px" class="text-left">หมายเหตุ</th>
          <th width="100px" class="text-right">คงเหลือ</th>
          <th width="100px" class="text-left">หน่วย</th>
          <th width="100px" class="text-right">ราคา</th>
          <th width="150px" class="text-left">วันที่รับเข้าล่าสุด</th>
          <th width="110px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="material in materials" :key="material.id">
          <td>{{ material.name }}</td>
          <td>{{ material.remark }}</td>
          <td class="text-right">{{ material.balance }}</td>
          <td>{{ material.unit }}</td>
          <td class="text-right">{{ material.price.toLocaleString("th-TH") }}</td>
          <td>17/09/2025 15:35</td>
          <td class="text-center">
            <div class="flex justify-start items-center">
              <button class="btn btn-primary me-1" @click="edit(material)">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger" @click="remove(material.id)">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <Modal v-if="showModal" title="เพิ่มวัสดุ, ส่วนผสม" @close="closeModal">
    <div>ชื่อ</div>
    <input type="text" class="form-control" v-model="name" />

    <div class="mt-3">หน่วยเรียก</div>
    <input type="text" class="form-control" v-model="unit" />

    <div class="mt-3">ราคา</div>
    <input type="number" class="form-control" v-model="price" />

    <div class="mt-3">หมายเหตุ</div>
    <input type="text" class="form-control" v-model="remark" />

    <button class="btn btn-primary mt-3" @click="save">
      <i class="fa fa-save mr-1"></i>
      บันทึก
    </button>
  </Modal>

  <Modal
    v-if="showModalStockMaterial"
    title="รับเข้าสต๊อก"
    @close="closeModalStockMaterial"
  >
    <div>วัสดุ ,ส่วนผสม</div>
    <select
      class="form-control"
      v-model="stockMaterialMaterialId"
      @change="selectStockMaterial"
    >
      <option v-for="material in materials" :key="material.id" :value="material.id">
        {{ material.name }}
      </option>
    </select>

    <div class="mt-3">จำนวน</div>
    <input type="number" class="form-control" v-model="stockMasterialQuantity" />

    <div class="mt-3">ราคา</div>
    <input type="number" class="form-control" v-model="stockMaterialPrice" />

    <div class="mt-3">หมายเหตุ</div>
    <input type="text" class="form-control" v-model="stockMaterialRemark" />

    <button class="btn btn-primary mt-3" @click="saveStockMaterial">
      <i class="fa fa-check mr-1"></i>
      บันทึก
    </button>
  </Modal>
</template>
