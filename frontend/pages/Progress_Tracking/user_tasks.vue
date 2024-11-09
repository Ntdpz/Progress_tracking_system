<template>
  <div>
    <!-- Search Box -->
    <v-text-field
      v-model="search"
      label="Search user"
      append-icon="mdi-magnify"
      single-line
      hide-details
      class="mb-6"
    />

    <!-- User Cards -->
    <v-row>
      <v-col
        v-for="user in filteredUsers"
        :key="user.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="user-image-padding" max-width="400">
          <!-- Set max-width for card -->
          <v-row>
            <!-- User Image -->
            <v-col cols="4" class="user-image-padding">
              <div class="user-image-container">
                <v-img
                  :src="getBase64Image(user.user_pic)"
                  alt="User Image"
                  height="100px"
                  width="100px"
                  class="rounded-circle"
                ></v-img>
              </div>
            </v-col>

            <!-- User Details -->
            <v-col cols="8" class="my-card-Details">
              <v-card-title>
                {{ user.user_firstname }} {{ user.user_lastname }}
              </v-card-title>
              <v-card-subtitle>
                {{ user.user_position }} - {{ user.user_department }}
              </v-card-subtitle>
              <v-card-text>
                <div>
                  <v-chip
                    class="ma-2"
                    color="blue lighten-3"
                    text-color="blue darken-2"
                    outlined
                    @click="openDialogtask_count(user)"
                  >
                    <v-icon left small>mdi-clipboard-text-outline</v-icon>
                    Task Count: {{ user.task_count }}
                  </v-chip>

                  <v-chip
                    class="ma-2"
                    color="amber lighten-3"
                    text-color="amber darken-2"
                    outlined
                    @click="openDialogtask_count_inprogress(user)"
                  >
                    <v-icon left small>mdi-progress-clock</v-icon>
                    In Progress: {{ user.task_count_inprogress }}
                  </v-chip>

                  <v-chip
                    class="ma-2"
                    color="red lighten-3"
                    text-color="red darken-2"
                    outlined
                    @click="openDialogtask_count_late(user)"
                  >
                    <v-icon left small>mdi-alert-circle-outline</v-icon>
                    Late: {{ user.task_count_late }}
                  </v-chip>

                  <v-chip
                    class="ma-2"
                    color="green lighten-3"
                    text-color="green darken-2"
                    outlined
                    @click="openDialogtask_count_complete(user)"
                  >
                    <v-icon left small>mdi-check-circle-outline</v-icon>
                    Complete: {{ user.task_count_complete }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Components -->

    <v-dialog v-model="showDialogtask_count_inprogress" max-width="950">
      <task_count_inprogress :user="selectedUser" />
    </v-dialog>

    <v-dialog v-model="showDialogtask_count_late" max-width="950">
      <task_count_late :user="selectedUser" />
    </v-dialog>

    <v-dialog v-model="showDialogtask_count_complete" max-width="950">
      <task_count_complete :user="selectedUser" />
    </v-dialog>

    <v-dialog v-model="showDialogtask_count" max-width="950">
      <task_count :user="selectedUser" :dialog.sync="showDialogtask_count" />
    </v-dialog>
  </div>
</template>

<script>
import task_count from "@/components/Progress_tracking/user_tasks/task_count.vue";
import task_count_inprogress from "@/components/Progress_tracking/user_tasks/task_count_inprogress.vue";
import task_count_late from "@/components/Progress_tracking/user_tasks/task_count_late.vue";
import task_count_complete from "@/components/Progress_tracking/user_tasks/task_count_complete.vue";

export default {
  middleware: "auth",
  layout: "admin",
  components: {
    task_count,
    task_count_inprogress,
    task_count_complete,
    task_count_late,
  },
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      users: [],
      search: "",
      showDialogtask_count: false,
      showDialogtask_count_inprogress: false,
      showDialogtask_count_late: false,
      showDialogtask_count_complete: false,
      selectedUser: {},
    };
  },
  created() {
    this.getAllUsers();
  },
  computed: {
    filteredUsers() {
      if (!this.search) return this.users;
      return this.users.filter((user) => {
        const fullName =
          `${user.user_firstname} ${user.user_lastname}`.toLowerCase();
        const userPosition = user.user_position.toLowerCase();
        const userDepartment = user.user_department.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          fullName.includes(searchTerm) ||
          userPosition.includes(searchTerm) ||
          userDepartment.includes(searchTerm)
        );
      });
    },
  },
  methods: {
    openDialogtask_count(user) {
      this.selectedUser = user; // ตั้งค่าผู้ใช้ที่เลือก
      this.showDialogtask_count = true; // เปิด dialog
    },
    openDialogtask_count_inprogress(user) {
      this.selectedUser = user;
      this.showDialogtask_count_inprogress = true;
    },
    openDialogtask_count_late(user) {
      this.selectedUser = user;
      this.showDialogtask_count_late = true;
    },
    openDialogtask_count_complete(user) {
      this.selectedUser = user;
      this.showDialogtask_count_complete = true;
    },
    async getAllUsers() {
      try {
        const response = await this.$axios.get("/user_tasks/GetAll");
        this.users = response.data.task_members;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    getBase64Image(base64String) {
      if (!base64String) {
        return "/images/default_user.jpg";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        return base64String;
      } else {
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
  },
};
</script>

<style scoped>
.my-card {
  margin-bottom: 16px;
}

.rounded-circle {
  border-radius: 50%;
}

/* Padding for user images */
.user-image-padding {
  padding: 16px;
  overflow: hidden;
  display: flex;
  height: 100%;
}

/* Custom styles for card details */
.my-card-Details {
  /* Custom styles can go here */
}

/* Centering the user image container */
.user-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
