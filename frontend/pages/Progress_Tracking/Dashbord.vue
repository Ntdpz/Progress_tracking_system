<template>
  <div>
    <!-- แสดง Loader เมื่อข้อมูลกำลังถูกโหลด -->
    <Loader v-if="isLoading" />

    <!-- แสดงหัวข้อ Dashboard -->
    <h1 class="centered-heading">Dashboard</h1>

    <!-- ช่องว่างระหว่างส่วนต่าง ๆ ของหน้า -->
    <v-spacer></v-spacer>

    <div>
      <!-- แสดงผล Component result_projects โดยส่งค่า userId ของผู้ใช้ไปเป็น prop -->
      <result_projects :userId="user.id" />

      <!-- ช่องว่างระหว่าง component -->
      <v-spacer></v-spacer>

      <!-- คอนเทนเนอร์แบบ fluid (ยืดหยุ่น) สำหรับการจัดวางส่วนต่าง ๆ -->
      <v-container fluid>
        <v-row>
          <!-- แสดงรายการโปรเจกต์ที่มี tasks (ผ่าน computed property projectsWithTasks) -->
          <v-col
            v-for="project in projectsWithTasks"
            :key="project.id"
            cols="12"
            class="full-width-card"
          >
            <!-- แสดงการ์ดที่มีตาราง tasks ของแต่ละโปรเจกต์ -->
            <v-card class="full-card">
              <task_project_table :projectId="project.id" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import Loader from "../../components/Loader.vue"; // นำเข้า component Loader
import result_projects from "../../components/Progress_tracking/Dashbord/result_projects.vue"; // นำเข้า component result_projects
import task_project_table from "../../components/Progress_tracking/Dashbord/task_project_table.vue"; // นำเข้า component task_project_table
import "./Dashbord.css"; // นำเข้าไฟล์สไตล์ที่เกี่ยวข้อง

export default {
  // กำหนด components ที่จะถูกใช้งานใน template
  components: { Loader, result_projects, task_project_table },

  // ใช้ middleware 'auth' เพื่อให้แน่ใจว่าผู้ใช้ต้องเข้าสู่ระบบก่อนเข้าถึงหน้า
  middleware: "auth",

  // ใช้ layout 'admin' สำหรับหน้า Dashboard นี้
  layout: "admin",

  data() {
    return {
      isLoading: true, // ใช้เพื่อตรวจสอบสถานะการโหลดข้อมูล
      user: this.$auth.user, // ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบจาก auth module
      loggedIn: this.$auth.loggedIn, // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบแล้วหรือไม่
      projects: [], // เก็บข้อมูลโปรเจกต์ทั้งหมดที่ผู้ใช้มี
    };
  },

  computed: {
    // กรองเฉพาะโปรเจกต์ที่มี tasks โดยใช้ computed property
    projectsWithTasks() {
      return this.projects.filter((project) => project.hasTasks !== false);
    },
  },

  // เมื่อ component ถูกสร้างขึ้น จะเรียกใช้ฟังก์ชัน fetchProjects
  created() {
    this.fetchProjects();
  },

  methods: {
    // ฟังก์ชันดึงข้อมูลโปรเจกต์ของผู้ใช้
    async fetchProjects() {
      try {
        // เรียก API เพื่อดึงรายการโปรเจกต์ของผู้ใช้ โดยใช้ userId
        const { data: projectIds } = await this.$axios.get(
          `/user_projects/get_project_by_userid/${this.user.id}`
        );

        // สร้าง promises สำหรับดึงข้อมูลของแต่ละโปรเจกต์โดยใช้ projectId
        const projectsPromises = projectIds.map((id) =>
          this.$axios.get(`/projects/getOne/${id}`)
        );

        // รอการตอบกลับของทุก promises และดึงข้อมูลโปรเจกต์มาเก็บใน projects
        const projectsResponses = await Promise.all(projectsPromises);

        // เก็บข้อมูลโปรเจกต์และตั้งค่า hasTasks เป็น true
        this.projects = projectsResponses.map((response) => ({
          ...response.data,
          hasTasks: true, // กำหนดว่าโปรเจกต์นี้มี tasks โดยเริ่มต้นเป็น true
        }));
      } catch (error) {
        // แสดงข้อผิดพลาดถ้ามีปัญหาในการดึงข้อมูล
        console.error("Error fetching projects:", error);
      } finally {
        // ปิดสถานะการโหลดเมื่อข้อมูลถูกโหลดเสร็จ
        this.isLoading = false;
      }
    },
  },
};
</script>

<style>
.centered-heading {
  color: #374aab; /* กำหนดสีข้อความเป็นสีน้ำเงินเข้ม (#374aab) */
  text-align: center; /* จัดตำแหน่งข้อความให้อยู่ตรงกลางแนวนอน */
}
</style>
