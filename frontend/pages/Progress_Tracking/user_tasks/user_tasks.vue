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
      >
        <v-card class="user-image-padding">
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

    <!-- เรียกใช้ Dialog Component -->
    <task_count :dialog.sync="showDialogtask_count" :user="selectedUser" />
    <task_count_inprogress
      :dialog.sync="showDialogtask_count_inprogress"
      :user="selectedUser"
    />
    <task_count_late
      :dialog.sync="showDialogtask_count_late"
      :user="selectedUser"
    />
    <task_count_complete
      :dialog.sync="showDialogtask_count_complete"
      :user="selectedUser"
    />

    <!-- ส่ง selectedUser -->
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

      selectedUser: {}, // เปลี่ยนจาก null เป็น object ว่าง
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
      this.selectedUser = user; // เก็บข้อมูลผู้ใช้ที่ถูกเลือก
      this.showDialogtask_count = true; // เปิด Dialog
    },

    openDialogtask_count_inprogress(user) {
      this.selectedUser = user; // เก็บข้อมูลผู้ใช้ที่ถูกเลือก
      this.showDialogtask_count_inprogress = true; // เปิด Dialog
    },

    openDialogtask_count_late(user) {
      this.selectedUser = user; // เก็บข้อมูลผู้ใช้ที่ถูกเลือกf
      this.showDialogtask_count_late = true; // เปิด Dialog
    },
    openDialogtask_count_complete(user) {
      this.selectedUser = user; // เก็บข้อมูลผู้ใช้ที่ถูกเลือก
      this.showDialogtask_count_complete = true; // เปิด Dialog
    },
    async getAllUsers() {
      try {
        const response = await this.$axios.get(
          "http://localhost:7777/user_tasks/GetAll" // เปลี่ยน URL ที่นี่
        );
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

/* คลาสใหม่สำหรับ padding */
.user-image-padding {
  padding: 16px; /* ปรับค่าตามต้องการ */
  overflow: hidden; /* ซ่อนพื้นที่ที่เกินกรอบ */
  display: flex; /* แสดงผล flex */
  height: 100%; /* ทำให้เต็มความสูง */
}

.my-card-Details {
  /* background-color:rgb(255, 0, 0); */
}

/* เพิ่มคลาสสำหรับการจัดกลาง */
.user-image-container {
  display: flex;
  justify-content: center; /* จัดแนวกลางในแกน X */
  align-items: center; /* จัดแนวกลางในแกน Y */
  height: 100%; /* ทำให้เต็มความสูง */
}
</style>
