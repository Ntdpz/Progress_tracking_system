<template>
  <v-card>
    <!-- กรณีมี tasks -->
    <v-data-table
      v-if="historyTasks.length > 0"
      :headers="headers"
      :items="historyTasks"
      item-key="id"
      class="custom-table"
    >
      <template v-slot:top>
        <v-toolbar flat class="toolbar-centered">
          <v-toolbar-title class="toolbar-title" >History</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:item.update_date="{ item }">
        {{ formatDate(item.update_date) }}
      </template>
      <template v-slot:item.task_plan_start="{ item }">
        {{ formatDate(item.task_plan_start) }}
      </template>
      <template v-slot:item.task_plan_end="{ item }">
        {{ formatDate(item.task_plan_end) }}
      </template>
      <template v-slot:item.task_actual_start="{ item }">
        {{ formatDate(item.task_actual_start) }}
      </template>
      <template v-slot:item.task_actual_end="{ item }">
        {{ formatDate(item.task_actual_end) }}
      </template>
      <template v-slot:item.task_progress="{ item }">
        <div class="progress-cell">{{ item.task_progress }}%</div>
      </template>
    </v-data-table>

    <!-- กรณีไม่มี history tasks -->
    <div v-else class="no-tasks-container">
      <p class="no-tasks-message">
        <img
          src="../../../static/fetching_tasks,_No_task_data.gif"
          alt="No tasks found"
        />
        No tasks History
      </p>
    </div>
  </v-card>
</template>

<script>
import "./css/history_task_table.css";
export default {
  props: {
    taskId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      historyTasks: [],
      headers: [
        { text: "Date", value: "update_date" },
        { text: "Progress", value: "task_progress" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Actual Start", value: "task_actual_start" },
        { text: "Actual End", value: "task_actual_end" },
        { text: "Remark", value: "task_detail" },
      ],
    };
  },

  watch: {
    taskId: "fetchHistoryTasks",
  },

  async mounted() {
    await this.fetchHistoryTasks();
  },

  methods: {
    async fetchHistoryTasks() {
      try {
        const response = await this.$axios.$get(
          `/tasks/history_tasks/${this.taskId}`
        );
        this.historyTasks = response;
      } catch (error) {
        console.error("Error fetching history tasks:", error);
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
};
</script>

<style scoped>
</style>
