<script setup></script>

<template>
    <div class="flex">
        <div class="sidebar fixed top-0 left-0 h-full w-64 z-10">
            <Sidebar />
        </div>
        <div class="p-4 w-full bg-gradient-to-b from-gray-400 to-gray-100 ml-64">
            <div class="bg-white rounded-xl shadow-lg shadow-gray-500">
                <slot />
            </div>
        </div>
    </div>
</template>
