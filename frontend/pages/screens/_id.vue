<template>
  <div class="screen-details">
    <!-- Location path -->

    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input type="text" v-model="searchQuery" placeholder="Search..." style="
            margin-bottom: 10px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          " />
      </v-col>
    </v-row>
    <div class="task-list">
      <!-- ScreenName and Progress -->
      <div class="topper">
        <v-row>
          <v-col cols="4" md="2">
            <h3>Screen Name: {{ ScreenName }}</h3>
            <!-- <p>Complete Task 3/5</p>
            <v-progress-linear height="10" color="blue" background-color="grey" :value="60"></v-progress-linear> -->
          </v-col>
          <v-col cols="8" md="10" class="text-right">
            <v-btn color="primary" @click="openCreateTaskDialog">Add Task</v-btn>
          </v-col>
        </v-row>
      </div>
      <v-divider></v-divider>
      <!-- Display Task in Card -->
      <v-row>
        <v-col v-for="(task, index) in filteredTasks" :key="index" cols="12" md="6" lg="4">
          <TaskCard :task="task" class="task-card" @edit-task="openEditTaskDialog" @delete-task="confirmDeleteTask">
          </TaskCard>
        </v-col>
      </v-row>
      <!-- Edit task dialog -->
      <div>
        <EditTaskDialog v-model="dialogEditTaskForm" :edited-task="editedTask">
        </EditTaskDialog>
        <!-- Create task dialog -->
        <CreateTaskDialog v-model="dialogAddTaskForm" @save-task="handleSaveTask"></CreateTaskDialog>
      </div>
      <!-- Confirmation dialog -->
      <v-dialog v-model="dialogConfirmDelete" max-width="400px">
        <v-card>
          <v-card-title class="headline">Confirm Delete</v-card-title>
          <v-card-text>
            Are you sure you want to delete this task?
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="deleteTaskConfirmed">Delete</v-btn>
            <v-btn color="primary" @click="dialogConfirmDelete = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
      dialogConfirmDelete: false, // Added confirmation dialog state

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
        task_plan_start: "",
        task_plan_end: "",
      },
      taskToDelete: null, // Added taskToDelete data property
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
    try {
      await this.fetchScreenDetail();
      await this.fetchTasks();
    } catch (error) {
      console.error("Error fetching screen details and tasks:", error);
      // Handle the error (e.g., display a message to the user)
    }
  },
  methods: {
    // Fetch screen details
    async fetchScreenDetail() {
      try {
        const screenId = this.$route.params.id;
        if (!screenId) {
          throw new Error("Screen ID is null or undefined");
        }
        const response = await fetch(`http://localhost:7777/screens/getOne/${screenId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch screen details");
        }

        const screenData = await response.json();
        console.log("Screen data:", screenData); // Log the received screen data
        this.ScreenName = screenData[0].screen_name; // Set the screen name
      } catch (error) {
        console.error("Error fetching screen details:", error);
        // Handle error fetching screen details
        throw error; // Propagate the error to the caller
      }
    },
    // open edit dialog
    openEditTaskDialog(task) {
      this.dialogEditTaskForm = true;
      this.editedTask = task;
    },
    // open create dialog
    openCreateTaskDialog() {
      this.dialogAddTaskForm = true;
    },
    // create task

     async handleSaveTask(taskData) {
      // using taskData received from the dialog
      console.log("Received task data:", taskData);

      const screenId = this.$route.params.id;
      console.log("Screen ID:", screenId); // Log the screenId value

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
        person_in_charge: taskData.person_in_charge,
        task_detail: taskData.task_detail,
        task_plan_start: formattedStartDate,
        task_plan_end: formattedEndDate,
        screen_id: screenId,
        system_id: screen.system_id,
        project_id: screen.project_id,
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
    // delete task confirmation dialog
    confirmDeleteTask(task) {
      this.taskToDelete = task;
      this.dialogConfirmDelete = true;
    },
    // delete task
    async deleteTaskConfirmed() {
      if (!this.taskToDelete) return;

      try {
        const response = await fetch(
          `http://localhost:7777/tasks/deleteHistoryTasks/${this.taskToDelete.id}`,
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
      } finally {
        this.dialogConfirmDelete = false;
        this.taskToDelete = null;
      }
    },
    // Fetch tasks
    async fetchTasks() {
      try {
        const screenId = this.$route.params.id;
        if (!screenId) {
          throw new Error("Screen ID is null or undefined");
        }

        const response = await fetch(`http://localhost:7777/tasks/searchByScreenId/${screenId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const tasks = await response.json();
        console.log("Tasks:", tasks); // Log the received tasks
        this.tasks = tasks; // Set the tasks
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error fetching tasks
        throw error; // Propagate the error to the caller
      }
    },
  },
};
</script>

<style scoped>
.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
