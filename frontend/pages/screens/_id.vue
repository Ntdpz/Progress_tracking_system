<template>
  <div class="screen-details">
    <!-- Location path -->

    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
      </v-col>
    </v-row>

    <!-- Task list -->
    <div class="task-list">
      <!-- ScreenName and Progress -->
      <div class="topper">
        <h3>Task Management: {{ ScreenName }}</h3>
        <v-divider vertical></v-divider>
        <!-- open create task dialog -->
        <v-btn color="primary" @click="openCreateTaskDialog">Add Task</v-btn>
      </div>
      <v-divider></v-divider>

      <!-- Display Task in Card -->
      <v-row>
        <v-col v-for="(task, index) in filteredTasks" :key="index" cols="12" md="6" lg="4">
          <TaskCard :task="task" class="task-card" @edit-task="openEditTaskDialog" @delete-task="deleteTask" />
        </v-col>
      </v-row>

      <!-- Edit task dialog -->
      <EditTaskDialog v-model="dialogEditTaskForm" :edited-task="editedTask" />

      <!-- Create task dialog -->
      <CreateTaskDialog v-model="dialogAddTaskForm" @save-task="handleSaveTask" />
    </div>
  </div>
</template>
<script>
import Swal from "sweetalert2";
import TaskCard from "../../components/TaskComponent/TaskCard.vue";
import EditTaskDialog from "../../components/TaskComponent/EditTaskDialog.vue";
import CreateTaskDialog from "../../components/TaskComponent/CreateTaskDialog.vue";

export default {
  layout: "admin",
  components: {
    TaskCard,
    EditTaskDialog,
    CreateTaskDialog,
  },
  data() {
    return {
      //Dialog
      dialogAddTaskForm: false,
      dialogEditTaskForm: false,
      dialogUpdateTaskForm: false,
      
      // Task
      editedTask: {},
      ScreenName: "",
      tasks: [],
      searchQuery: "",
      //Create new task
      newTasks: {
        // new task properties
        task_id: "",
        task_name: "",
        task_manday: "",
        task_detail: "",
        task_status: "",
        task_member_id: "",
        task_plan_start: "",
        task_plan_end: "",
      },
    };
  },
  computed: {
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        return this.tasks.filter((task) =>
          task.task_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else {
        return [];
      }
    },
  },
  async mounted() {
    this.fetchScreenDetail();
    this.fetchTasks();
  },
  methods: {
    // open edit dialog
    openEditTaskDialog(task) {
      this.dialogEditTaskForm = true;
      this.editedTask = task;
    },
    // handle edit task
    async handleEditTask(taskData) {
      console.log("Received task data:", taskData);
      try {
        const response = await fetch(
          "http://localhost:7777/tasks/updateTasks",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task updated successfully",
          });
          this.dialogEditTaskForm = false;
          this.fetchTasks();
        } else {
          throw new Error("Failed to update task");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        Swal.fire({
          icon: "error",
          title: "Error updating task",
          text: "Please try again",
        });
      }
    },
    async deleteTask(task) {
      console.log("Received task data:", task);
      try {
        const response = await fetch(
          `http://localhost:7777/tasks/deleteHistoryTasks/${task.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task and related data deleted successfully",
          });
          this.fetchTasks();
        } else {
          throw new Error("Failed to delete task and related data");
        }
      } catch (error) {
        console.error("Error deleting task and related data:", error.message); // Log the specific error message
        Swal.fire({
          icon: "error",
          title: "Error deleting task and related data",
          text: "Please try again",
        });
      }
    },

    // Open creat dialog
    openCreateTaskDialog() {
      this.dialogAddTaskForm = true;
    },
    // create task
    async handleSaveTask(taskData) {
      // using taskData received from the dialog
      console.log("Received task data:", taskData);

      const screenId = this.$route.params.id;
      const screenResponse = await fetch(
        `http://localhost:7777/screens/getOne/${screenId}`
      );
      const screenData = await screenResponse.json();
      const screen = screenData[0];

      // Validate and format task plan start date
      let startDate = new Date(taskData.task_plan_start);
      if (isNaN(startDate.getTime())) {
        console.error("Invalid start date:", taskData.task_plan_start);
        // Handle the invalid date case
        return;
      }
      let formattedStartDate = startDate.toISOString().split("T")[0];

      // Validate and format task plan end date
      let endDate = new Date(taskData.task_plan_end);
      if (isNaN(endDate.getTime())) {
        console.error("Invalid end date:", taskData.task_plan_end);
        // Handle the invalid date case
        return;
      }
      let formattedEndDate = endDate.toISOString().split("T")[0];

      const requestData = {
        task_name: taskData.task_name,
        task_id: taskData.task_id,
        task_manday: taskData.task_manday,
        task_detail: taskData.task_detail,
        task_plan_start: formattedStartDate,
        task_plan_end: formattedEndDate,
        screen_id: screenId,
        project_id: screen.projectId,
        system_id: screen.system_id,
      };

      try {
        const response = await fetch(
          "http://localhost:7777/tasks/createTasks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData), // Use requestData instead of this.newTask
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task created successfully",
          });
          this.dialogAddTaskForm = false;
          this.fetchTasks();
        } else {
          throw new Error("Failed to create new task");
        }
      } catch (error) {
        console.error("Error creating new task:", error);
        Swal.fire({
          icon: "error",
          title: "Error creating new task",
          text: "Please try again",
        });
      }
    },

    //Fetch screen detail
    async fetchScreenDetail() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/getOne/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screen");
        }
        const screenData = await response.json();
        console.log("Screen data:", screenData); // Log the received data
        // Assuming screenData is an array with one element
        const screen = screenData[0];
        this.ScreenName = screen.screen_name; // Set the ScreenName
        // You can set other properties here as well
      } catch (error) {
        console.error("Error fetching screen:", error);
        // Handle error fetching Screen
      }
    },

    //fetch task
    async fetchTasks() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/tasks/searchByScreenId/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasks = await response.json();
        console.log("Tasks:", tasks); // Log the received tasks
        this.tasks = tasks; // Set the tasks
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error fetching tasks
      }
    },

    // handle edit task
  },
};
</script>

<style scoped>
.status-filter {
  margin-bottom: 10px;
  max-width: 120px;
}
.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>