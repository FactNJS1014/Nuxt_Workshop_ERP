<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";

definePageMeta({
  layout: "admin",
});

const showModalAddProduct = ref(false);
const products = ref([]);
const id = ref("");
const name = ref("");
const remark = ref("");

const addProduct = () => {
  showModalAddProduct.value = true;
  id.value = "";
  name.value = "";
  remark.value = "";
};

const closeModalAddProduct = () => {
  showModalAddProduct.value = false;
};

const save = async () => {
  try {
    const payload = {
      name: name.value,
      remark: remark.value,
    };

    if (id.value == "") {
      await axios.post(`${config.apiServer}/api/product/create`, payload);
    } else {
      await axios.put(`${config.apiServer}/api/product/update/${id.value}`, payload);
      id.value = "";
    }

    await fetchData();
    closeModalAddProduct();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

const fetchData = async () => {
  try {
    const res = await axios.get(`${config.apiServer}/api/product/list`);
    products.value = res.data.results;
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

const edit = (product) => {
  id.value = product.id;
  name.value = product.name;
  remark.value = product.remark;

  showModalAddProduct.value = true;
};

const remove = async (id) => {
  try {
    const button = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      await axios.delete(`${config.apiServer}/api/product/remove/${id}`);
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
</script>

<template>
  <div class="title">สินค้า</div>
  <div class="p-4">
    <button class="btn btn-primary" @click="showModalAddProduct = true">
      <i class="fa fa-plus"></i>
      เพิ่มสินค้า
    </button>

    <table class="table table-bordered mt-3">
      <thead>
        <tr>
          <th width="250px" class="text-left">ชื่อสินค้า</th>
          <th class="text-left">หมายเหตุ</th>
          <th width="110px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.remark }}</td>
          <td class="text-center">
            <div class="flex justify-start items-center">
              <button class="btn btn-primary me-1" @click="edit(product)">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger" @click="remove(product.id)">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Modal v-if="showModalAddProduct" title="เพิ่มสินค้า" @close="closeModalAddProduct">
    <div>ชื่อสินค้า</div>
    <input type="text" class="form-control" v-model="name" />

    <div class="mt-3">หมายเหตุ</div>
    <input type="text" class="form-control" v-model="remark" />

    <button class="btn btn-primary mt-3" @click="save">
      <i class="fa fa-check me-2"></i>บันทึก
    </button>
  </Modal>
</template>
