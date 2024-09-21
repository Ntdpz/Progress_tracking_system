<!-- components/Loader.vue -->
<template>
  <div v-if="isLoading" class="loadingio-spinner-ellipsis-nq4q5u6dq7r">
    <div class="ldio-x2uulkbinbj">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
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
@keyframes ldio-x2uulkbinbj {
  0% { transform: translate(12px, 80px) scale(0); }
  25% { transform: translate(12px, 80px) scale(0); }
  50% { transform: translate(12px, 80px) scale(1); }
  75% { transform: translate(80px, 80px) scale(1); }
  100% { transform: translate(148px, 80px) scale(1); }
}
@keyframes ldio-x2uulkbinbj-r {
  0% { transform: translate(148px, 80px) scale(1); }
  100% { transform: translate(148px, 80px) scale(0); }
}
@keyframes ldio-x2uulkbinbj-c {
  0% { background: #003366 }
  25% { background: #009933 }
  50% { background: #333333 }
  75% { background: #ffd700 }
  100% { background: #003366 }
}
.loadingio-spinner-ellipsis-nq4q5u6dq7r {
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
.ldio-x2uulkbinbj {
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateZ(0) scale(1);
  backface-visibility: hidden;
  transform-origin: 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ldio-x2uulkbinbj div {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transform: translate(80px, 80px) scale(1);
  background: #003366;
  animation: ldio-x2uulkbinbj 1s infinite cubic-bezier(0, 0.5, 0.5, 1);
}
.ldio-x2uulkbinbj div:nth-child(1) {
  background: #ffd700;
  transform: translate(148px, 80px) scale(1);
  animation: ldio-x2uulkbinbj-r 0.25s infinite cubic-bezier(0, 0.5, 0.5, 1), ldio-x2uulkbinbj-c 1s infinite step-start;
}
.ldio-x2uulkbinbj div:nth-child(2) {
  animation-delay: -0.25s;
  background: #003366;
}
.ldio-x2uulkbinbj div:nth-child(3) {
  animation-delay: -0.5s;
  background: #ffd700;
}
.ldio-x2uulkbinbj div:nth-child(4) {
  animation-delay: -0.75s;
  background: #333333;
}
.ldio-x2uulkbinbj div:nth-child(5) {
  animation-delay: -1s;
  background: #009933;
}
</style>
