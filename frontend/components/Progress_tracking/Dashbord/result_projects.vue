<template>
  <div>
    <!-- แสดงข้อความต้อนรับ เวลา และจำนวนโปรเจกต์ที่ผู้ใช้มี -->
    <p class="text-01">
      {{ greeting }} , {{ currentDateTime }} , You Currently have
      {{ projects.length }} Projects
    </p>
  </div>

  <!-- {{ currentDateTime }}  -->
</template>

<script>
export default {
  // รับค่า prop ชื่อ userId ที่เป็นประเภท Number และจำเป็นต้องส่งเข้ามา
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      // เก็บข้อมูลโปรเจกต์ของผู้ใช้
      projects: [],
      // เก็บข้อความต้อนรับ (Good Morning, Good Afternoon, Good Evening)
      greeting: "",
      // เก็บเวลาปัจจุบันในรูปแบบที่กำหนดเอง
      currentDateTime: "",
    };
  },
  mounted() {
    // เรียกข้อมูลโปรเจกต์เมื่อ component ถูก mounted
    this.fetchProjects();
    // อัปเดตเวลาปัจจุบันและข้อความต้อนรับ
    this.updateDateTime();
    // ตั้งค่าให้ฟังก์ชัน updateDateTime ทำงานทุก ๆ 1 วินาที (1000 ms)
    setInterval(this.updateDateTime, 1000);
  },
  methods: {
    // ฟังก์ชันสำหรับอัปเดตเวลาปัจจุบันและข้อความต้อนรับ
    updateDateTime() {
      const now = new Date(); // ดึงเวลาปัจจุบัน
      this.greeting = this.getGreeting(now); // เรียกฟังก์ชัน getGreeting เพื่อรับข้อความต้อนรับตามเวลา
      this.currentDateTime = this.formatCustomDateTime(now); // แปลงวันที่และเวลาให้อยู่ในรูปแบบที่กำหนด
    },

    // ฟังก์ชันสำหรับเลือกข้อความต้อนรับตามเวลาของวัน
    getGreeting(date) {
      const hour = date.getHours(); // ดึงค่าชั่วโมงของวัน
      if (hour >= 0 && hour < 12) {
        return "Good Morning"; // ถ้าชั่วโมงอยู่ในช่วง 0-11 แสดงว่าเป็นเช้า
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon"; // ถ้าชั่วโมงอยู่ในช่วง 12-17 แสดงว่าเป็นบ่าย
      } else {
        return "Good Evening"; // ถ้าเป็นช่วงเวลาหลัง 18.00 น.
      }
    },

    // ฟังก์ชันสำหรับแปลงวันที่และเวลาให้อยู่ในรูปแบบที่กำหนดเอง
    formatCustomDateTime(date) {
      // ตัวเลือกสำหรับแปลงวันที่ (ชื่อวัน, วัน, เดือน, ปี)
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };

      // แปลงวัน, เดือน, ปี ให้อยู่ในรูปแบบที่ต้องการ
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const day = date.getDate();
      const monthName = date.toLocaleDateString("en-US", { month: "long" });
      const year = date.getFullYear();

      // ตัวเลือกสำหรับแปลงเวลา (ชั่วโมง, นาที, วินาที)
      const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // ใช้รูปแบบ 24 ชั่วโมง
      };

      // แปลงเวลาให้อยู่ในรูปแบบที่ต้องการ
      const time = date.toLocaleTimeString("en-US", timeOptions);

      // ส่งค่าที่รวมวันที่และเวลาออกไปในรูปแบบที่กำหนด
      return `${dayName} ${day} ${monthName} ${year} At : ${time}`;
    },

    // ฟังก์ชันสำหรับเรียกข้อมูลโปรเจกต์ของผู้ใช้จากเซิร์ฟเวอร์
    async fetchProjects() {
      try {
        // เรียก API เพื่อดึงข้อมูลโปรเจกต์ของผู้ใช้ โดยใช้ userId ที่ได้รับมา
        const response = await this.$axios.$get(
          `/user_projects/get_project_by_userid/${this.userId}`
        );
        this.projects = response; // เก็บข้อมูลโปรเจกต์ที่ดึงมาในตัวแปร projects
      } catch (error) {
        // แสดงข้อผิดพลาดถ้ามีปัญหาในการดึงข้อมูล
        console.error("Error fetching projects:", error);
      }
    },
  },
};
</script>

<style scope>
.text-01 {
  text-align: left; /* จัดข้อความให้อยู่ทางด้านซ้าย */
  margin-left: 20px; /* เพิ่มระยะห่างทางซ้าย 20px */
  margin-top: 10px; /* เพิ่มระยะห่างด้านบน 10px */
}
</style>
