<template>
  <v-card>
    <v-card>
      <!-- Current User Title -->
      <v-card-title color="black">
        Manage users in Project : {{ projectDetails.project_name_ENG }}
      </v-card-title>
      <v-card-text>
        <!-- Current User Table -->
        <v-data-table
          :headers="headers"
          :items="sortedUsers"
          class="elevation-1 mt-4 mb-3"
          :items-per-page="5"
        >
          <!-- User Avatar in the "Image" column -->
          <template v-slot:item.user_pic="{ item }">
            <v-avatar>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-avatar>
          </template>

          <!-- User Name in the "User Name" column -->
          <template v-slot:item.user_name="{ item }">
            {{ item.user_firstname }} {{ item.user_lastname }}
          </template>

          <!-- User Position in the "User Position" column -->
          <template v-slot:item.user_position="{ item }">
            <v-chip
              :style="{
                width: '120px',
                display: 'flex',
                justifyContent: 'center',
              }"
              :color="getColor(item.user_position)"
              dark
            >
              {{ item.user_position }}
            </v-chip>
          </template>

          <!-- Action buttons in the "Action" column -->
          <template v-slot:item.action="{ item }">
            <v-btn icon @click="deleteUser(item)">
              <v-icon color="red">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="openAssignUserDialog">Assign User</v-btn>
        <v-btn color="secondary" @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Assign User Dialog -->
    <v-dialog v-model="assignUserDialog" max-width="600px">
      <AssignUserProjectDialog
        ref="assignUserDialogRef"
        :project_id="project_id"
        @usersAssigned="fetchUsers"
        @close="assignUserDialog = false"
      />
    </v-dialog>
  </v-card>
</template>

<script>
import Swal from "sweetalert2";
import AssignUserProjectDialog from "@/components/Progress_tracking/Project/AssignUserProjectDialog.vue";
export default {
  components: {
    AssignUserProjectDialog,
  },
  props: {
    project_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      projectDetails: {},
      users: [],
      assignUserDialog: false,
      headers: [
        { text: "Image", value: "user_pic", align: "start", sortable: false },
        {
          text: "User Name",
          value: "user_name",
          align: "start",
          sortable: false,
        },
        { text: "User Position", value: "user_position", align: "start" },
        { text: "Action", value: "action", sortable: false },
      ],
      positionOrder: ["System Analyst", "Developer", "Implementer"],
    };
  },
  methods: {
    sortUsers(users) {
      return users.slice().sort((a, b) => {
        const posA = this.positionOrder.indexOf(a.user_position);
        const posB = this.positionOrder.indexOf(b.user_position);
        return posA - posB;
      });
    },
    closeDialog() {
      this.$emit("close");
    },
    // เรียกใช้ API และเก็บข้อมูลผู้ใช้ใน users
    async fetchUsers() {
      try {
        const response = await this.$axios.get(
          `user_projects/getUserProjectsByProjectId/${this.project_id}`
        );
        this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async fetchProjectDetails() {
      try {
        const response = await this.$axios.get(
          `/projects/getOne/${this.project_id}`
        );
        this.projectDetails = response.data;
      } catch (error) {
        console.error("Error fetching project details:", error);
        await Swal.fire({
          title: "Error!",
          text: "There was an issue fetching project details. Please try again.",
          icon: "error",
        });
      }
    },
    getBase64Image(base64String) {
      if (!base64String) {
        return "";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        return base64String;
      } else {
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
    getColor(position) {
      switch (position) {
        case "System Analyst":
          return "#864F80"; // สีสำหรับตำแหน่ง System Analyst
        case "Developer":
          return "#374AAB"; // สีสำหรับตำแหน่ง Developer
        case "Tester":
          return "#359C73"; // สีสำหรับตำแหน่ง Tester
        default:
          return "grey"; // สีสำหรับตำแหน่งที่ไม่ระบุ
      }
    },
    async deleteUser(item) {
      // แสดง SweetAlert2 เพื่อยืนยันการลบ
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you really want to remove ${item.user_firstname} ${item.user_lastname} from this project?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#009933",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      // ถ้าผู้ใช้ยืนยันการลบ
      if (result.isConfirmed) {
        try {
          // เรียก API เพื่อลบผู้ใช้
          const response = await this.$axios.delete(
            `/user_projects/deleteUserProjectById/${this.project_id}/${item.user_id}`
          );

          if (response.status === 200) {
            // แสดงข้อความสำเร็จ
            await Swal.fire({
              title: "Deleted!",
              text: "The user has been removed from the project.",
              icon: "success",
              confirmButtonColor: "#009933",
            });

            // อัปเดตข้อมูลผู้ใช้ใหม่
            this.fetchUsers();

            if (this.$refs.assignUserDialogRef) {
              this.$refs.assignUserDialogRef.fetchUsersNotInProject();
            }
          }
        } catch (error) {
          // แสดงข้อความผิดพลาดถ้ามีปัญหาในการลบ
          await Swal.fire({
            title: "Error!",
            text: "There was an issue removing the user. Please try again.",
            icon: "error",
          });
          console.error("Error deleting user:", error);
        }
      }
    },
    openAssignUserDialog() {
      this.assignUserDialog = true; // เปิด Dialog
    },
  },
  watch: {
    project_id(newVal) {
      if (newVal) {
        this.fetchProjectDetails(); // เรียก fetchProjectDetails เมื่อ project_id เปลี่ยนแปลง
        this.fetchUsers(); // หรือถ้าต้องการเรียก fetchUsers ด้วย
      }
    },
  },
  mounted() {
    if (this.project_id) {
      this.fetchProjectDetails();
      this.fetchUsers();
    }
  },
  computed: {
    sortedUsers() {
      return this.sortUsers(this.users);
    },
  },
};
</script>
