<template>
  <div>
    <!-- ตารางสำหรับแสดง Tasks -->
    <v-card-title>
      <v-row no-gutters>
        <v-col>
          <span class="bold-text"> All your tasks in </span>
          <span class="bold-text">
            Project : (ชื่อโปรเจค)
            
          </span>

          <!-- {{ projectId }} -->
          <span> Today ({{ today }}) </span>

          <span class="task-count-wrapper">
            <v-card class="task-count-card">
              {{ completedTaskCount }} / {{ filteredTaskCount }}
            </v-card>
          </span>
        </v-col>
      </v-row>
    </v-card-title>

    <v-data-table
      v-if="tasks.length > 0"
      :headers="headers"
      :items="tasks"
      class="project_task_table"
      item-key="task_id"
      @click:row="handleRowClick"
    >
      <!-- กำหนดการแสดงผลในหัวตาราง -->
      <template v-slot:column.header="{ column }">
        <div class="header-cell">{{ column.text }}</div>
      </template>

      <!-- แสดง task_name -->
      <template v-slot:item.task_name="{ item }">
        <div class="cell-content">{{ item.task_name }}</div>
      </template>

      <template v-slot:item.system_nameEN="{ item }">
        <div class="cell-content">{{ item.system_nameEN }}</div>
      </template>

      <template v-slot:item.screen_name="{ item }">
        <div class="cell-content">{{ item.screen_name }}</div>
      </template>

      <template v-slot:item.task_progress="{ item }">
        <div class="cell-content" :style="getProgressColor(item.task_progress)">
          {{ item.task_progress }}%
        </div>
      </template>

      <!-- แสดงวันที่เริ่มต้น -->
      <template v-slot:item.task_plan_start="{ item }">
        <div class="cell-content">{{ formatDate(item.task_plan_start) }}</div>
      </template>

      <!-- แสดงวันที่สิ้นสุด -->
      <template v-slot:item.task_plan_end="{ item }">
        <div class="cell-content">{{ formatDate(item.task_plan_end) }}</div>
      </template>

      <!-- แสดงไอคอนในคอลัมน์ Action -->
      <template v-slot:item.action="{ item }">
        <div class="cell-content">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                @click.stop="editTask(item)"
                color="warning"
              >
                mdi-file-chart
              </v-icon>
            </template>
            <span>แก้ไข Task</span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>

    <!-- กรณีไม่มี Tasks -->
    <div v-else class="no-tasks-container">
      <p class="no-tasks-message">
        <img
          src="../../../static/fetching_tasks,_No_task_data.gif"
          alt="No tasks found"
        />
        No tasks found for this project.
      </p>
    </div>

    <!-- Dialog -->
    <v-dialog
      v-model="EditTask_dialog"
      max-width="1000px"
      class="custom-dialog"
    >
      <v-card>
        <v-card-title> </v-card-title>
        <v-card-subtitle>
          <!-- ส่ง selectedTask ไปยัง update_task component -->
          <update_task
            :task="selectedTask"
            @close-dialog="EditTask_dialog = false"
            @task-updated="refreshTable"
          />
        </v-card-subtitle>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import "./css/task_project_table.css";
import update_task from "./update_task.vue";
export default {
  components: {
    update_task,
  },
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      filteredTaskCount: 0,
      completedTaskCount: 0,
      tasks: [],
      today: this.formatDate(new Date()), // เก็บข้อมูล Tasks ที่ดึงมาจาก API
      EditTask_dialog: false, // ใช้สำหรับควบคุมการแสดงของ v-dialog
      selectedTask: {}, // ใช้สำหรับเก็บ task ที่ถูกเลือก
      headers: [
        { text: "System", value: "system_nameEN" },
        { text: "Screen", value: "screen_name" },
        { text: "Task Name", value: "task_name" },
        { text: "Progress", value: "task_progress" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Action", value: "action" },
      ], // กำหนดส่วนหัวของตาราง
    };
  },

  computed: {
    taskCount() {
      // นับจำนวน tasks ที่มีอยู่ในตาราง
      return this.tasks.length;
    },
  },

  mounted() {
    this.fetchTasks(); // เรียกใช้ method เมื่อ component ถูก mounted
  },

  methods: {
    getProgressColor(progress) {
      if (progress >= 100) {
        return {
          backgroundColor: "#33cc33", // สีพื้นหลังเขียว
          color: "#ffffff", // สีข้อความขาว
          height: "20px", // ความสูงของพื้นหลัง
          width: "100%", // ความกว้างของพื้นหลัง
          display: "flex", // ใช้ Flexbox
          alignItems: "center", // จัดแนวข้อความกลางแนวตั้ง
          justifyContent: "center", // จัดแนวข้อความกลางแนวนอน
        };
      }
      return {
        backgroundColor: "transparent", // ไม่มีสีพื้นหลัง
        color: "#000000", // สีข้อความดำ
        height: "30px", // ความสูงของพื้นหลัง
        width: "100%", // ความกว้างของพื้นหลัง
        display: "flex", // ใช้ Flexbox
        alignItems: "center", // จัดแนวข้อความกลางแนวตั้ง
        justifyContent: "center", // จัดแนวข้อความกลางแนวนอน
      };
    },
    refreshTable() {
      // Logic to refresh the table, e.g., re-fetch data
      this.fetchTasks(); // Replace with actual method to refresh data
    },
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date)
        .toLocaleDateString("en-GB", options)
        .replace(/\//g, "-");
    },

    async fetchTasks() {
      try {
        // เรียก API เพื่อดึง Tasks ตาม projectId
        const response = await this.$axios.get(
          `/tasks/searchByProjectId/${this.projectId}`
        );

        // กรอง tasks ที่อยู่ระหว่างวันที่ task_plan_start และ task_plan_end เทียบกับวันนี้
        const today = new Date();
        const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        ); // ใช้วันที่ถัดไปเพื่อรวมทั้งวัน

        const filteredTasks = response.data.filter((task) => {
          const startDate = new Date(task.task_plan_start);
          const endDate = new Date(task.task_plan_end);

          return startDate <= endOfToday && endDate >= startOfToday;
        });

        // คำนวณจำนวน tasks ที่เสร็จสมบูรณ์
        const completedTasks = filteredTasks.filter(
          (task) => task.task_progress == 100
        );

        // อัปเดตข้อมูล tasks ที่ดึงมา
        this.tasks = filteredTasks.map((task) => ({
          ...task,
          task_name: task.task_name || "No Name", // ตรวจสอบและกำหนดค่าเริ่มต้นหาก task_name เป็น null
        }));

        this.filteredTaskCount = filteredTasks.length; // อัปเดตจำนวน tasks ที่กรองแล้ว
        this.completedTaskCount = completedTasks.length; // อัปเดตจำนวน tasks ที่เสร็จสมบูรณ์
      } catch (error) {
        // แสดงข้อความข้อผิดพลาดที่กำหนดเอง
        console.error("Error fetching tasks, No task data");
      }
    },

    handleRowClick(item) {
      this.$router.push(`/Project/Systems/screens/${item.screen_id}`);
    },

    // ฟังก์ชันที่เรียกใช้เมื่อคลิกไอคอน Edit
    editTask(task) {
      this.selectedTask = task; // เก็บ task ที่ถูกเลือก
      this.EditTask_dialog = true; // เปิด dialog
      console.log("Editing task:", task.task_name);
    },

    // ฟังก์ชันที่เรียกใช้เมื่อคลิกไอคอน Delete
    deleteTask(task) {
      console.log("Deleting task:", task);
      // เพิ่มโค้ดเพื่อทำการลบ task
    },
  },
};
</script>
