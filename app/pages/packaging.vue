<script setup>
import config from "~/config";
import axios from "axios";
import Swal from "sweetalert2";

definePageMeta({
  layout: "admin",
});

const showModalAddPackaging = ref(false);
const id = ref("");
const name = ref("");
const remark = ref("");
const packaging = ref([]);

const closeModalAddPackaging = () => {
  showModalAddPackaging.value = false;
};

const save = async () => {
  try {
    const payload = {
      name: name.value,
      remark: remark.value,
    };

    if (id.value == "") {
      await axios.post(`${config.apiServer}/api/packaging/create`, payload);
    } else {
      await axios.put(`${config.apiServer}/api/packaging/update/${id.value}`, payload);
    }

    closeModalAddPackaging();
    fetchData();
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
    const response = await axios.get(`${config.apiServer}/api/packaging/list`);
    packaging.value = response.data.results;
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  }
};
const remove = async (id) => {
  try {
    const button = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบบรรจุภัณฑ์นี้หรือไม่?",
      showCancelButton: true,
      showConfirmButton: true,
    });

    if (button.isConfirmed) {
      await axios.delete(`${config.apiServer}/api/packaging/remove/${id}`);
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

const edit = (packaging) => {
  id.value = packaging.id;
  name.value = packaging.name;
  remark.value = packaging.remark;

  showModalAddPackaging.value = true;
};
</script>

<template>
  <div class="title">บรรจุภัณฑ์</div>
  <div class="p-4">
    <button class="btn btn-primary" @click="showModalAddPackaging = true">
      <i class="fa fa-plus"></i>
      เพิ่มบรรจุภัณฑ์
    </button>

    <table class="table table-bordered mt-3">
      <thead>
        <tr>
          <th width="200" class="text-left">ชื่อบรรจุภัณฑ์</th>
          <th class="text-left">หมายเหตุ</th>
          <th width="110"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in packaging" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.remark }}</td>
          <td class="text-center">
            <div class="flex justify-start items-center">
              <button class="btn btn-primary me-1" @click="edit(item)">
                <i class="fa fa-pencil"></i>
              </button>
              <button class="btn btn-danger" @click="remove(item.id)">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Modal v-if="showModalAddPackaging" title="เพิ่มบรรจุภัณฑ์" @close="closeModalAddPackaging">
    <div>ชื่อ</div>
    <input type="text" class="form-control" v-model="name" />

    <div class="mt-3">หมายเหตุ</div>
    <input type="text" class="form-control" v-model="remark" />

    <button class="btn btn-primary mt-3" @click="save">
      <i class="fa fa-check me-2"></i>บันทึก
    </button>
  </Modal>
</template>
