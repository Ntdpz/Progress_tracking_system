<template>
  <div>
    <!-- ตารางสำหรับแสดง Tasks -->
    <v-card-title>
      <v-row no-gutters>
        <v-col>
          <span class="bold-text"> All your tasks in </span>
          <span class="bold-text">
            Project :
            {{ tasks.length > 0 ? tasks[0].project_name_ENG : "No task" }}
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
      :sort-by="['task_plan_start']"
      :sort-desc="[false]"
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
        <v-progress-linear
          :value="item.task_progress"
          height="20"
          :color="getProgressColor(parseInt(item.task_progress))"
        >
          <strong
            >{{
              item.task_progress ? parseInt(item.task_progress) : 0
            }}%</strong
          >
        </v-progress-linear>
      </template>

      <!-- แสดงวันที่เริ่มต้น -->
      <template v-slot:item.task_plan_start="{ item }">
        <div class="cell-content">{{ formatDate(item.task_plan_start) }}</div>
      </template>

      <!-- แสดงวันที่สิ้นสุด -->
      <template v-slot:item.task_plan_end="{ item }">
        <div :class="getTaskEndDateClass(item)">
          {{ formatDate(item.task_plan_end) }}
        </div>
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
            <span>Update Task</span>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>

    <!-- กรณีไม่มี Tasks -->
    <div v-else class="no-tasks-container">
      <p class="no-tasks-message">
        <v-icon class="alert-icon">mdi-alert-circle-outline</v-icon>
        No tasks found for this project.
      </p>
    </div>

    <!-- Dialog -->
    <v-dialog v-model="EditTask_dialog" max-width="60%" class="custom-dialog">
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
import { EventBus } from "@/plugins/event-bus";
export default {
  middleware: "auth",
  layout: "admin",
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
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
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
    EventBus.$on("refresh-data", this.fetchTasks);
  },
  beforeDestroy() {
    EventBus.$off("refresh-data", this.fetchTasks);
  },

  methods: {
    getProgressColor(progress) {
      if (progress >= 75 && progress <= 100) {
        return "#4CAF50";
      } else if (progress >= 51 && progress <= 74) {
        return "#03A9F4";
      } else if (progress >= 26 && progress <= 50) {
        return "#FFD700";
      } else if (progress >= 0 && progress <= 25) {
        return "#FC8705";
      }
      // เมื่อไม่ตรงกับเงื่อนไขใดๆ ให้คืนค่าเริ่มต้น
      return "primary";
    },
    // ฟอร์แมตวันที่
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date)
        .toLocaleDateString("en-GB", options)
        .replace(/\//g, "-");
    },

    // ตรวจสอบว่าล่าช้าหรือไม่ และตั้งค่าคลาสสี
    getTaskEndDateClass(item) {
      const endDate = new Date(item.task_plan_end);
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      return endDate < startOfToday ? "task-late" : "";
    },

    refreshTable() {
      // Logic to refresh the table, e.g., re-fetch data
      this.fetchTasks(); // Replace with actual method to refresh data
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

        // กรอง tasks วันนี้
        const todayTasks = response.data.filter((task) => {
          const startDate = new Date(task.task_plan_start);
          const endDate = new Date(task.task_plan_end);

          return (
            task.task_member_id === this.user.id &&
            startDate <= endOfToday &&
            endDate >= startOfToday &&
            task.is_archived === 0
          );
        });

        // กรอง tasks ที่ล่าช้า
        const lateTasks = response.data.filter((task) => {
          const endDate = new Date(task.task_plan_end);

          return (
            task.task_member_id === this.user.id &&
            endDate < startOfToday && // task ล่าช้าถ้าสิ้นสุดก่อนวันนี้
            task.is_archived === 0 &&
            task.task_progress < 100 // ตรวจสอบว่า task ยังไม่เสร็จสมบูรณ์
          );
        });

        // คำนวณจำนวน tasks ที่เสร็จสมบูรณ์ของวันนี้
        const completedTodayTasks = todayTasks.filter(
          (task) => task.task_progress == 100
        );

        // อัปเดตข้อมูล tasks
        this.tasks = [
          ...todayTasks.map((task) => ({
            ...task,
            task_name: task.task_name || "No Name", // ตรวจสอบและกำหนดค่าเริ่มต้นหาก task_name เป็น null
          })),
          ...lateTasks.map((task) => ({
            ...task,
            task_name: task.task_name || "No Name",
          })),
        ];

        // อัปเดตจำนวน tasks ที่กรองแล้ว
        this.todayTaskCount = todayTasks.length;
        this.completedTodayTaskCount = completedTodayTasks.length;
        this.lateTaskCount = lateTasks.length; // จำนวน tasks ที่ล่าช้า
      } catch (error) {
        // แสดงข้อความข้อผิดพลาดที่กำหนดเอง
        console.error("Error fetching tasks, No task data");
      }
    },

    // ฟังก์ชันที่เรียกใช้เมื่อคลิกไอคอน Edit
    editTask(task) {
      this.selectedTask = task; // เก็บ task ที่ถูกเลือก
      this.EditTask_dialog = true; // เปิด dialog
    },

    // ฟังก์ชันที่เรียกใช้เมื่อคลิกไอคอน Delete
    deleteTask(task) {
      console.log("Deleting task:", task);
      // เพิ่มโค้ดเพื่อทำการลบ task
    },
  },
};
</script>
