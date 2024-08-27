<!-- components/Loader.vue -->
<template>
  <div v-if="isLoading" class="loader">
    <img src="/loading.gif" alt="Loading..." />
  </div>
  <div v-else>
    <!-- เนื้อหาของหน้าเว็บที่โหลดเสร็จแล้ว -->
  </div>
</template>

<script>
export default {
  name: "Loader",
  data() {
    return {
      isLoading: true, // เริ่มต้นเป็น true เพื่อแสดง loader
    };
  },
  async created() {
    try {
      // เริ่มต้นการโหลดข้อมูลหรือการดำเนินการที่ใช้เวลา
      await this.loadData(); // ฟังก์ชันนี้ควรทำให้การโหลดข้อมูลเสร็จสิ้น
      this.isLoading = false; // เปลี่ยนเป็น false เมื่อโหลดเสร็จ
    } catch (error) {
      console.error("Error loading data:", error);
      this.isLoading = false; // เปลี่ยนเป็น false ในกรณีที่เกิดข้อผิดพลาด
    }
  },
  methods: {
    async loadData() {},
  },
};
</script>

<style scoped>
.loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.loader img {
  width: 350px; /* ขนาดของ GIF */
  height: auto; /* ให้สูงขึ้นอัตโนมัติตามอัตราส่วน */
}
</style>
