<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";

definePageMeta({
  layout: "admin",
});

/**
 * ? Product variable
 */

const showModalAddProduct = ref(false);
const products = ref([]);
const id = ref("");
const name = ref("");
const remark = ref("");
const packaging = ref([]);
const selectedPackagingId = ref("");
const productTypes = ref([]);
const selectedProductTypeId = ref("");

/**
 * ? Product Formular variable
 */
const showModalFormular = ref(false);
const materialId = ref("");
const quantity = ref(0);
const remarkFormular = ref("");
const materials = ref([]);
const formulars = ref([]);
const selectProductname = ref("");
const selectProductId = ref("");
const selectedFormularId = ref("");

/**
 * * Product function
 */

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
      packagingId: selectedPackagingId.value,
      productTypeId: selectedProductTypeId.value,
    };

    if (id.value == "") {
      await axios.post(`${config.apiServer}/product/create`, payload);
    } else {
      await axios.put(`${config.apiServer}/product/update/${id.value}`, payload);
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
    const res = await axios.get(`${config.apiServer}/product/list`);
    products.value = res.data.results;

    if (packaging.value.length === 0) {
      const resPackaging = await axios.get(`${config.apiServer}/packaging/list`);
      packaging.value = resPackaging.data.results;
      selectedPackagingId.value = packaging.value[0].id;
    }

    if (productTypes.value.length === 0) {
      const resProductType = await axios.get(`${config.apiServer}/productType/list`);
      productTypes.value = resProductType.data.results;
      selectedProductTypeId.value = productTypes.value[0].id;
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
      await axios.delete(`${config.apiServer}/product/remove/${id}`);
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

/**
 * * Product Formular function
 */

const closeModalFormular = () => {
  showModalFormular.value = false;
};

const openModalFormular = async (productId) => {
  showModalFormular.value = true;

  selectProductname.value = products.value.find((p) => p.id == productId).name;
  selectProductId.value = productId;

  fetchDataFormular(productId);

  if (materials.value.length > 0) return;

  try {
    await fetchDataMaterial();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

const fetchDataMaterial = async () => {
  try {
    const res = await axios.get(`${config.apiServer}/material/list`);
    materials.value = res.data.results;
    materialId.value = materials.value[0].id;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

const fetchDataFormular = async (productId) => {
  try {
    const url = `${config.apiServer}/productFormular/list/${productId}`;
    const response = await axios.get(url);
    formulars.value = response.data.results;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

const saveFormular = async () => {
  try {
    const payload = {
      productId: selectProductId.value,
      materialId: materialId.value,
      quantity: quantity.value,
      remark: remarkFormular.value,
    };

    if (selectedFormularId.value == "") {
      await axios.post(`${config.apiServer}/productFormular/create`, payload);
    } else {
      await axios.put(
        `${config.apiServer}/productFormular/update/${selectedFormularId.value}`,
        payload
      );
      selectedFormularId.value = "";
    }

    await fetchDataFormular(selectProductId.value);

    quantity.value = 0;
    remarkFormular.value = "";
    materialId.value = materials.value[0].id;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};

const editFormular = (formular) => {
  selectedFormularId.value = formular.id;
  materialId.value = formular.materialId;
  quantity.value = formular.quantity;
  remarkFormular.value = formular.remark;
};

const removeFormular = async (id) => {
  try {
    const button = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      showCancelButton: true,
    });

    if (button.isConfirmed) {
      await axios.delete(`${config.apiServer}/productFormular/remove/${id}`);
      await fetchDataFormular(selectProductId.value);
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

    <table class="table table-bordered mt-3" v-if="products.length > 0">
      <thead>
        <tr>
          <th width="250px" class="text-left">ชื่อสินค้า</th>
          <th class="text-left">บรรจุภัณฑ์</th>
          <th class="text-left">ประเภทสินค้า</th>
          <th width="170px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <div>{{ product.name }}</div>
            <div v-if="product.remark" class="text-sm text-red-500">
              *** {{ product.remark }}
            </div>
          </td>
          <td>{{ product.Packaging?.name }}</td>
          <td>{{ product.ProductType?.name }}</td>
          <td class="text-center">
            <div class="flex justify-start items-center">
              <button class="btn mr-1 flex" @click="openModalFormular(product.id)">
                <i class="fa fa-paperclip"></i> สูตร
              </button>
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

    <div class="mt-3">บรรจุภัณฑ์</div>
    <select class="form-control" v-model="selectedPackagingId">
      <option v-for="pack in packaging" :key="pack.id" :value="pack.id">
        {{ pack.name }}
      </option>
    </select>

    <div class="mt-3">ประเภทสินค้า</div>
    <select class="form-control" v-model="selectedProductTypeId">
      <option v-for="type in productTypes" :key="type.id" :value="type.id">
        {{ type.name }}
      </option>
    </select>

    <button class="btn btn-primary mt-3" @click="save">
      <i class="fa fa-check me-2"></i>บันทึก
    </button>
  </Modal>

  <Modal v-if="showModalFormular" :title="`สูตรสินค้า : ${selectProductname}`" @close="closeModalFormular">
    <div class="mb-3">ส่วนผสม</div>

    <select class="form-control" v-model="materialId">
      <option v-for="material in materials" :key="material.id" :value="material.id">
        {{ material.name }}
      </option>
    </select>
    <div class="mt-3">จำนวน</div>
    <input type="number" class="form-control" v-model="quantity" placeholder="จำนวนที่ใช้" />
    <div class="mt-3">หมายเหตุ</div>
    <input type="text" class="form-control" v-model="remarkFormular" placeholder="หมายเหตุ" />
    <button class="btn btn-primary mt-3" @click="saveFormular">
      <i class="fa fa-solid fa-check me-1"></i> บันทึก
    </button>

    <table class="table mt-3" v-if="formulars.length > 0">
      <thead>
        <tr>
          <th class="text-left">ส่วนผสม</th>
          <th class="text-right">จำนวน</th>
          <th class="text-left">หมายเหตุ</th>
          <th width="110px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="formular in formulars" :key="formular.id">
          <td>{{ formular.Material.name }}</td>
          <td class="text-right">{{ formular.quantity }}</td>
          <td>{{ formular.remark }}</td>
          <td class="text-center">
            <div class="flex">
              <button class="btn btn-primary me-1" @click="editFormular(formular)">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger" @click="removeFormular(formular.id)">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </Modal>
</template>
