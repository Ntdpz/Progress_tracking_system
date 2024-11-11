<template>
  <div>
    <h1 class="centered-heading">User Tasks</h1>
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
        <v-card>
          <!-- แถวที่ 1 -->
          <v-card-text>
            <v-row>
              <!-- คอลัมน์ซ้าย: รูปภาพ -->
              <v-col cols="4" class="d-flex justify-center align-center">
                <div class="user-image-container">
                  <v-img
                    :src="getBase64Image(user.user_pic)"
                    alt="User Image"
                    class="rounded-circle"
                    height="100px"
                    width="100px"
                  ></v-img>
                </div>
              </v-col>

              <!-- คอลัมน์ขวา: ชื่อ, ตำแหน่ง และแผนก -->
              <v-col cols="8">
                <v-card-title>
                  {{ user.user_firstname }} {{ user.user_lastname }}
                </v-card-title>
                <v-card-subtitle>
                  {{ user.user_position }} - {{ user.user_department }}
                </v-card-subtitle>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- แถวที่ 3 -->
          <v-card-text>
            <span
              style="text-decoration: underline; text-align: center"
              class="d-flex justify-center align-center"
            >
              Task Status
            </span>
            <v-row>
              <!-- คอลัมน์ซ้าย -->
              <v-col cols="6">
                <v-chip
                  class="ma-2 full-width-chip"
                  color="blue lighten-3"
                  text-color="blue darken-2"
                  outlined
                  @click="openDialogtask_count(user)"
                >
                  <v-icon left small>mdi-clipboard-text-outline</v-icon>
                  Total: {{ user.task_count }}
                </v-chip>

                <v-chip
                  class="ma-2 full-width-chip"
                  color="red lighten-3"
                  text-color="red darken-2"
                  outlined
                  @click="openDialogtask_count_late(user)"
                >
                  <v-icon left small>mdi-alert-circle-outline</v-icon>
                  Late: {{ user.task_count_late }}
                </v-chip>
              </v-col>

              <!-- คอลัมน์ขวา -->
              <v-col cols="6">
                <v-chip
                  class="ma-2 full-width-chip"
                  color="amber lighten-3"
                  text-color="amber darken-2"
                  outlined
                  @click="openDialogtask_count_inprogress(user)"
                >
                  <v-icon left small>mdi-progress-clock</v-icon>
                  In Progress: {{ user.task_count_inprogress }}
                </v-chip>

                <v-chip
                  class="ma-2 full-width-chip"
                  color="green lighten-3"
                  text-color="green darken-2"
                  outlined
                  @click="openDialogtask_count_complete(user)"
                >
                  <v-icon left small>mdi-check-circle-outline</v-icon>
                  Complete: {{ user.task_count_complete }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
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
/* กำหนดให้ V-chip ใช้ความกว้างเต็มที่ */
.full-width-chip {
  width: 100%;
  overflow: hidden; /* ซ่อนข้อความที่เกินออกมา */
  text-overflow: ellipsis; /* ใช้ ... แทนข้อความที่เกิน */
  white-space: nowrap; /* ป้องกันไม่ให้ข้อความขยายออกไปหลายบรรทัด */
}

/* ปรับแต่งหัวข้อให้จัดกลาง */
.centered-heading {
  text-align: center;
  margin: 0;
  color: #009933 !important;
  font-size: 2rem; /* ขนาดหัวข้อให้เหมาะสม */
}

/* ปรับขนาดสำหรับหน้าจอที่มีขนาดกว้างกว่า 1200px */
@media screen and (max-width: 1200px) {
  .centered-heading {
    font-size: 1.5rem; /* ปรับขนาดหัวข้อให้เล็กลงเล็กน้อย */
  }

  .full-width-chip {
    font-size: 0.875rem; /* ลดขนาดข้อความใน v-chip */
  }
}

/* สำหรับหน้าจอขนาดกลาง เช่น tablet */
@media screen and (max-width: 768px) {
  .centered-heading {
    font-size: 1.2rem; /* ปรับขนาดหัวข้อให้เล็กลง */
  }

  .full-width-chip {
    font-size: 0.75rem; /* ลดขนาดข้อความใน v-chip */
  }
}

/* สำหรับหน้าจอขนาดเล็ก เช่น มือถือ */
@media screen and (max-width: 480px) {
  .centered-heading {
    font-size: 1rem; /* ปรับขนาดหัวข้อให้เล็กลง */
  }

  .full-width-chip {
    font-size: 0.7rem; /* ลดขนาดข้อความใน v-chip */
  }
}

/* กำหนดให้ v-card ขยายเต็มความสูง */
.v-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* กำหนดให้ข้อความใน v-card ขยายเต็มพื้นที่ */
.v-card-text {
  flex-grow: 1; /* ทำให้เนื้อหาภายในขยายตามความสูงของ v-card */
}
</style>
