<script setup>
import Swal from "sweetalert2";
import axios from "axios";
import config from "~/config";

definePageMeta({
    layout: "admin",
});

const users = ref([]);
const showModal = ref(false);
const id = ref("");
const username = ref("");
const password = ref("");
const name = ref("");
const confirmPassword = ref("");
const level = ref("");
const listLevel = ref(["admin", "user"]);

const fetchData = async () => {
    try {
        const res = await axios.get(`${config.apiServer}/api/user/list`);
        users.value = res.data.results;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const openModal = () => {
    showModal.value = true;
    id.value = "";
    username.value = "";
    password.value = "";
    name.value = "";
    confirmPassword.value = "";
    level.value = "admin";
};

const closeModal = () => {
    showModal.value = false;
};

onMounted(async () => {
    await fetchData();
});

const save = async () => {
    try {
        if (password.value !== confirmPassword.value) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Password and Confirm Password do not match",
            });
            return;
        }

        const payload = {
            username: username.value,
            password: password.value,
            name: name.value,
            level: level.value,
        };

        if (id.value === "") {
            await axios.post(`${config.apiServer}/api/user/create`, payload);
        } else {
            await axios.put(`${config.apiServer}/api/user/updateUser/${id.value}`, payload);
            id.value = "";
        }

        closeModal();
        await fetchData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
};

const editUser = (user) => {
    id.value = user.id;
    username.value = user.username;
    name.value = user.name;
    level.value = user.level;

    console.log(user);
    openModal();
};

const removeUser = async (user) => {
    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete user ${user.username}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
            await axios.delete(`${config.apiServer}/api/user/remove/${user.id}`);
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
    <div class="title">ผู้ใช้งาน</div>
    <div class="p-4">
        <button class="btn mb-3" @click="openModal()">
            <i class="fa fa-plus"></i>
            เพิ่มผู้ใช้งาน
        </button>
        <table class="table mt-3">
            <thead>
                <tr>
                    <th class="text-left">ชื่อผู้ใช้งาน</th>
                    <th class="text-left" width="150px">Username</th>
                    <th class="text-left" width="100px">ระดับสิทธิ์</th>
                    <th width="110px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.level }}</td>
                    <td class="text-center">
                        <div class="flex">
                            <button class="btn btn-sm btn-warning me-2" @click="editUser(user)">
                                <i class="fa fa-solid fa-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" @click="removeUser(user)">
                                <i class="fa fa-solid fa-times"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <Modal v-if="showModal" @close="closeModal" title="เพิ่มผู้ใช้งาน">
        <div>ชื่อ</div>
        <input type="text" v-model="name" class="form-control" />

        <div class="mt-3">Username</div>
        <input type="text" v-model="username" class="form-control" />

        <div class="mt-3">Password</div>
        <input type="password" v-model="password" class="form-control" />

        <div class="mt-3">Confirm Password</div>
        <input type="password" v-model="confirmPassword" class="form-control" />

        <div class="mt-3">ระดับสิทธิ์</div>
        <select v-model="level" class="form-control">
            <option v-for="lvl in listLevel" :key="lvl" :value="lvl">{{ lvl }}</option>
        </select>

        <button class="btn mt-4" @click="save">
            <i class="fa fa-save"></i> บันทึกข้อมูล
        </button>
    </Modal>
</template>
