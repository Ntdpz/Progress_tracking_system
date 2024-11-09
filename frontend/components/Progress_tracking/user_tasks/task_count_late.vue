<template>
  <v-card>
    <v-card-title class="headline">
      รายละเอียดงานของ {{ user.user_firstname }} {{ user.user_lastname }}
    </v-card-title>
    <v-card-text>
      <div>
        <p><strong>ตำแหน่ง:</strong> {{ user.user_position }}</p>
        <p><strong>แผนก:</strong> {{ user.user_department }}</p>
      </div>

      <v-data-table
        v-if="tasks && tasks.length"
        :headers="tableHeaders"
        :items="tasks"
        item-key="id"
        class="elevation-1"
      >
        <template #top>
          <v-toolbar flat>
            <v-toolbar-title>รายการงาน</v-toolbar-title>
          </v-toolbar>
        </template>

        <template v-slot:item.task_plan="{ item }">
          <span
            >{{ formatDate(item.task_plan_start) }} to
            {{ formatDate(item.task_plan_end) }}</span
          >
        </template>

        <template v-slot:item.task_actual="{ item }">
          <span
            >{{ formatDate(item.task_actual_start) }} to
            {{ formatDate(item.task_actual_end) }}</span
          >
        </template>
      </v-data-table>
    </v-card-text>
    <v-card-actions>
      <v-btn color="blue darken-1" text @click="closeDialog">ปิด</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      tasks: [],
      taskCount: 0,
      tableHeaders: [
        {
          text: "Task Name",
          align: "start",
          key: "task_name",
          value: "task_name",
        },
        {
          text: "Task Detail",
          align: "start",
          key: "task_detail",
          value: "task_detail",
        },
        {
          text: "Plan (Start - End)",
          align: "start",
          key: "task_plan",
          value: "task_plan",
        },
        {
          text: "Manday",
          align: "start",
          key: "task_manday",
          value: "task_manday",
        },
        {
          text: "Actual (Start - End)",
          align: "start",
          key: "task_actual",
          value: "task_actual",
        },
        {
          text: "Actual Manday",
          align: "start",
          key: "task_actual_manday",
          value: "task_actual_manday",
        },
        {
          text: "Progress",
          align: "start",
          key: "task_progress",
          value: "task_progress",
        },
      ],
    };
  },
  watch: {
    user: {
      immediate: true,
      handler(newUser) {
        if (newUser && newUser.user_id) {
          this.fetchTasks(newUser.user_id);
        }
      },
    },
  },
  methods: {
    async fetchTasks(userId) {
      try {
        const response = await this.$axios.get(
          `/user_tasks/tasks_late/${userId}`
        );
        this.tasks = Array.isArray(response.data)
          ? response.data
          : [response.data];
        this.taskCount = this.tasks.length;
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลงาน:", error);
      }
    },

    closeDialog() {
      this.$emit("update:dialog", false); // ส่ง event ไปยัง parent เพื่อปิด v-dialog
    },

    // Function to format date to DD-MM-YYYY
    formatDate(dateString) {
      if (!dateString) return "..."; // Return empty string if date is null or undefined

      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "..."; // Return empty string if invalid date

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    },
  },
};
</script>
