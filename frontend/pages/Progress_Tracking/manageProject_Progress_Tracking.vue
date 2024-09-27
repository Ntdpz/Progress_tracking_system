<template>
  <!-- Dashboard container -->
  <div
    class="dashboard"
    style="
      background-color: #ffffff;
      padding: 10px 70px;
      border-radius: 0;
      margin-right: 30px;
    "
  >
    <Loader v-if="$store.state.isLoading" />
    <div>
      <!-- <Breadcrumbs /> -->
    </div>
    <!-- Greeting and current date/time -->
    <div>
      <Greeting />
    </div>
    <!-- Search bar -->
    <v-row no-gutters justify-content="flex-end" align-items="flex-end">
      <v-col cols="12">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          :style="searchBarStyle"
        />

        <v-btn v-if="user.user_role === 'Admin'" color="primary" class="text-none mb-4" @click="goToCreateProject"
          style="margin-left: 50px; width: 12%; height: 70%">
          ADD PROJECT
        </v-btn>
        <v-btn
          v-if="user.user_role === 'Admin'"
          color="error"
          @click="goToHistoryProject"
          style="margin-left: 10px; width: 10%; height: 70%"
          class="text-none mb-4"
        >
          <v-icon>mdi-history</v-icon> &nbsp;
        </v-btn>
      </v-col>
    </v-row>

    <!-- Project data table -->
    <v-data-table
      :headers="filteredHeaders"
      :items="filteredProjects"
      :sort-by="[{ key: 'project_id', order: 'desc' }]"
    >
      <template v-slot:item="{ item }">
        <tr @click="viewProjectDetails(item)">
          <td>{{ item.project_name_TH }}</td>
          <td>{{ item.project_name_ENG }}</td>
          <td>
            <v-progress-linear
              :color="getProgressColorProject(parseInt(item.project_progress))"
              height="20"
              :value="parseInt(item.project_progress)"
              :style="{ width: '100%' }"
              striped
            >
              <strong :style="{ color: 'white' }"
                >{{ parseInt(item.project_progress) }}%</strong
              ></v-progress-linear
            >
          </td>

          <td>{{ formatDate(item.project_plan_start) }}</td>
          <td>{{ formatDate(item.project_plan_end) }}</td>

          <td v-if="user.user_role === 'Admin'">
            <!-- Dropdown menu for other actions -->
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon size="20" px>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <!-- Edit action -->
                <v-list-item @click="manageUserProjects(item)">
                  <v-list-item-icon>
                    <v-icon>mdi-account-edit</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>Assign</v-list-item-content>
                </v-list-item>
                <v-list-item @click="openEditDialog(item)">
                  <v-list-item-icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>Edit</v-list-item-content>
                </v-list-item>
                <!-- Delete action -->
                <v-list-item @click="softDeleteProject(item)">
                  <v-list-item-icon>
                    <v-icon class="red--text">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="red--text"
                    >Delete</v-list-item-content
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </template>
    </v-data-table>
    <!-- Create Project Dialog -->
    <v-dialog
      v-model="createProjectDialog"
      max-width="600"
      ref="createProjectDialog"
    >
      <v-card>
        <v-card-title>Create New Project</v-card-title>
        <v-card-text>
          <!-- Form to create new project -->
          <v-form @submit.prevent="createProject">
            <v-text-field
              v-model="newProject.project_name_TH"
              label="Project Name (TH)"
              required
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="newProject.project_name_ENG"
              label="Project Name (EN)"
              required
              :rules="[rules.required]"
            ></v-text-field>

            <!-- New fields for SA, DEV, IMP selection -->
            <v-select
              v-model="selectedSA"
              :items="formatTeamMembers(teamMembersSA)"
              label="Select System Analyst"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllSA">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model="selectedDEV"
              :items="formatTeamMembers(teamMembersDEV)"
              label="Select Developer"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllDEV">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model="selectedIMP"
              :items="formatTeamMembers(teamMembersIMP)"
              label="Select Implementer"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllIMP">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <!-- Button to submit -->
            <v-btn color="primary" type="submit">Create</v-btn>
            <v-btn color="error" @click="createProjectDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Project Dialog -->
    <v-dialog
      v-model="editProjectDialog"
      max-width="600"
      ref="editProjectDialog"
    >
      <v-card>
        <v-card-title>Edit Project</v-card-title>
        <v-card-text>
          <!-- Form to edit system -->
          <v-form @submit.prevent="updateProject">
            <v-text-field
              v-model="editProject.project_name_TH"
              label="Project Name (TH)"
            ></v-text-field>
            <v-text-field
              v-model="editProject.project_name_ENG"
              label="Project Name (EN)"
            ></v-text-field>
            <!-- Add more fields as needed -->
            <!-- You can also add selection fields for system analyst and member -->
            <!-- Add buttons to submit and cancel -->
            <v-btn color="primary" type="submit">Update</v-btn>
            <v-btn color="error" @click="editProjectDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Manage project users dialog -->
    <v-dialog v-model="dialogUserProjects" max-width="1200px">
      <manageUserInProject
        :project_id="project_id"
        @close="dialogUserProjects = false"
      />
    </v-dialog>
  </div>
</template>

<script>
import Greeting from "~/components/Greeting.vue";
import Swal from "sweetalert2";
import axios from "axios";
import { encodeId, decodeId } from "~/utils/crypto";
import Loader from "~/components/Loader.vue";
import manageUserInProject from "@/components/Progress_tracking/Project/manageUserInProject.vue";

export default {
  head() {
    return {
      title: "ManageProject",
    };
  },
  components: {
    // Breadcrumbs,
    Greeting,
    Loader,
    manageUserInProject,
  },
  middleware: "auth",
  name: "ProjectManagement",
  layout: "admin",
  data() {
    return {
      project: null,
      selectedSystemAnalysts: [],
      selectedDevelopers: [],
      selectedImplementers: [],
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,

      rules: {
        required: (value) => !!value || "Please fill this field.",
      },
      page: 0,
      currentPage: 1,
      itemsPerPage: 5,
      selectedUsersAF: [],
      project_id: null,
      displayText: "",
      dialogAssignUser: false,
      selectedUsers: [],
      availableUsers: [],
      search: "", // Add this line
      dialogUserProjects: false, // ตัวแปรสำหรับเปิด/ปิด Dialog
      search: "",
      userProjectsHeaders: [
        { text: "ID", value: "id" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position" },
        { text: "Picture", value: "user_pic" }, // เพิ่มหัวข้อ Picture ลงใน userProjectsHeaders
      ],
      userProjects: [], // เก็บข้อมูลที่ได้รับจาก API ในตัวแปรนี้
      teamMembersSA: [],
      teamMembersDEV: [],
      teamMembersIMP: [],
      newProject: {
        project_id: "",
        project_name_TH: "",
        project_name_ENG: "",
      },
      // Define variables to store selected team members
      selectedSA: [],
      selectedDEV: [],
      selectedIMP: [],
      // Sample team members data
      teamMembers: ["SA1", "SA2", "DEV1", "DEV2", "IMP1", "IMP2"],
      detailsDialog: false,
      createProjectDialog: false,
      editProjectDialog: false,
      selectedProject: null,
      greeting: "",
      currentDateTime: "",
      editDialog: false,
      editedProject: { project_name_TH: "", project_name_ENG: "" },
      projects: [],
      searchQuery: "",
      editProject: {
        project_id: "",
        project_name_TH: "",
        project_name_ENG: "",
      },
      headers: [
        { text: "Project Name", value: "project_name_ENG" },
        { text: "Thai Name ", value: "project_name_TH" },
        { text: "Progress (%)", value: "project_progress" },
        { text: "Planned Start", value: "project_plan_start" },
        { text: "Planned End", value: "project_plan_end" },
        { text: "Action", value: "actions", sortable: false },
      ],
      defaultProject: {
        project_name_TH: "",
        project_name_ENG: "",
      },
    };
  },
  created() {
    this.$store.dispatch("setLoading", true);
  },
  methods: {
    async fetchAllScreens() {
      try {
        const response = await this.$axios.get("/screens/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching screens:", error);
        throw error;
      }
    },
    async fetchAllSystems() {
      try {
        const response = await this.$axios.get("/systems/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
        throw error;
      }
    },
    async fetchAllProjects() {
      try {
        const response = await this.$axios.get("/projects/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
    },
    formatDate(dateString) {
      if (!dateString) {
        return "Not determined";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Not determined";
      }
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-GB", options);
    },

    updateDisplayedUserProjects() {
      // อัปเดตหน้าที่แสดงข้อมูลผู้ใช้เมื่อเปลี่ยนหน้า
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedUserProjects = this.filteredUserProjects.slice(
        startIndex,
        endIndex
      );
    },
    setPage(pageNumber) {
      this.currentPage = pageNumber;
    },
    async manageUserProjects(item) {
      try {
        const project_id = item.id; // ดึง id ของ project จาก item ที่รับเข้ามา
        // ตรวจสอบว่า project_id มีค่าที่ถูกต้องหรือไม่
        if (!project_id) {
          console.error(
            "Error fetching user projects: project_id is undefined"
          );
          return;
        }
        this.fetchAvailableUsers(project_id);

        const response = await this.$axios.get(
          `/user_projects/getUserProjectsByProjectId/${project_id}`
        );
        // ตรวจสอบว่าการตอบกลับเป็น OK หรือไม่
        if (response.status !== 200) {
          throw new Error("Failed to fetch user projects");
        }
        const data = response.data;
        // นำข้อมูลที่ได้รับมาเก็บไว้ในตัวแปรของคุณเพื่อนำไปแสดงใน <v-dialog>
        this.userProjects = data;
        // เปิด <v-dialog> เพื่อแสดงข้อมูลที่ได้รับมา
        this.dialogUserProjects = true;
      } catch (error) {
        console.error("Error fetching user projects:", error);
      }
    },
    async deleteUser(project_id, item) {
      try {
        if (!project_id) {
          await Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "Project ID is undefined",
            confirmButtonColor: "#009933",
          });
          console.error("Error deleting user: project_id is undefined");
          return;
        }

        // แสดงกล่องข้อความยืนยันก่อนทำการลบผู้ใช้
        const confirmResult = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "Are you sure you want to delete this user?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          confirmButtonColor: "#009933",
        });

        if (confirmResult.isConfirmed) {
          // ทำการลบผู้ใช้เมื่อผู้ใช้ยืนยันการลบ
          const response = await this.$axios.delete(
            `/user_projects/deleteUserProjectById/${project_id}/${item.user_id}`
          );

          if (response.status === 200) {
            // Handle success
            await Swal.fire({
              icon: "success",
              title: "Success",
              text: response.data.message,
              confirmButtonColor: "#009933",
            });
            console.log(response.data.message);
            // อัปเดตตารางผู้ใช้หลังจากลบผู้ใช้เสร็จสิ้น
            await this.manageUserProjects({ id: project_id }); // เรียกใช้ฟังก์ชัน manageUserProjects เพื่ออัพเดทตารางผู้ใช้
            await this.fetchAvailableUsers(project_id);
          } else {
            // Handle error
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete user",
              confirmButtonColor: "#009933",
            });
            console.error("Failed to delete user:", response.status);
          }
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error deleting user",
          confirmButtonColor: "#009933",
        });
        console.error("Error deleting user:", error);
      }
    },
    fetchAvailableUsers(project_id) {
      this.$axios
        .get(`/user_projects/getUsersNotInProject/${project_id}`)
        .then((response) => {
          this.availableUsers = response.data.map((user) => ({
            id: user.id,
            user_firstname: user.user_firstname,
            user_lastname: user.user_lastname,
            user_position: user.user_position,
            displayText: `${user.user_position}: ${user.user_firstname} ${user.user_lastname}`,
          }));
          // หลังจากกำหนดค่า availableUsers ให้กำหนดค่า project_id ด้วย
          this.project_id = project_id;
        })
        .catch((error) => {
          console.error("Error fetching available users:", error);
        });
    },
    selectAllSystemAnalysts() {
      if (this.selectedSystemAnalysts.length === this.systemAnalysts.length) {
        this.selectedSystemAnalysts = [];
      } else {
        this.selectedSystemAnalysts = this.systemAnalysts.map(
          (item) => item.id
        );
      }
    },
    // Select All สำหรับ Developers
    selectAllDevelopers() {
      if (this.selectedDevelopers.length === this.developers.length) {
        this.selectedDevelopers = [];
      } else {
        this.selectedDevelopers = this.developers.map((item) => item.id);
      }
    },
    selectAllImplementers() {
      if (this.selectedImplementers.length === this.implementers.length) {
        this.selectedImplementers = [];
      } else {
        this.selectedImplementers = this.implementers.map((item) => item.id);
      }
    },
    async assignUserAF() {
      const user_ids = [
        ...this.selectedSystemAnalysts,
        ...this.selectedDevelopers,
        ...this.selectedImplementers,
      ];
      const project_id = this.project_id; // ใส่ ID ของโปรเจคที่ต้องการสร้าง user_projects

      try {
        const response = await this.$axios.post(
          "/user_projects/createUser_project",
          {
            user_ids,
            project_id,
          }
        );
        // สำเร็จ: แสดง SweetAlert2 แจ้งเตือน
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Users assigned successfully!",
          confirmButtonColor: "#009933",
        });
        // เรียกใช้ฟังก์ชัน manageUserProjects เพื่ออัปเดตตารางผู้ใช้
        await this.manageUserProjects({ id: project_id });
        // ดึงข้อมูลผู้ใช้ที่พร้อมใช้งานสำหรับโปรเจคนั้นๆ
        await this.fetchAvailableUsers(project_id);
        // ปิด Dialog หลังจากกำหนดผู้ใช้เสร็จสิ้น
        this.dialogAssignUser = false;
      } catch (error) {
        // ข้อผิดพลาด: แสดง SweetAlert2 แจ้งเตือน
        await Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Error creating user_projects: " + error.message,
        });
        console.error("Error creating user_projects:", error);
      }
    },
    closeNestedDialog() {
      this.dialogAssignUser = false;
    },
    openNestedDialog() {
      this.dialogAssignUser = true;
    },
    assignUser() {
      // ตรวจสอบว่ามีผู้ใช้ที่ถูกเลือกหรือไม่
      if (this.selectedUsers.length === 0) {
        console.error("No users selected to assign.");
        return;
      }

      // ส่งข้อมูลผู้ใช้ที่ถูกเลือกไปยัง API
      const project_id = this.selectedProject.id;
      const user_ids = this.selectedUsers.map((user) => user.id);

      this.$axios
        .post("/user_projects/createUser_project", {
          project_id: project_id,
          user_ids: user_ids,
        })
        .then((response) => {
          console.log("Users assigned successfully:", response.data);
          // ปิด Dialog หลังจากกำหนดผู้ใช้เสร็จสิ้น
          this.dialogAssignUser = false;
        })
        .catch((error) => {
          console.error("Error assigning users:", error);
        });
    },
    getBase64Image(base64) {
      return base64;
    },

    async fetchTeamMembers() {
      try {
        const responseSA = await this.$axios.get("/users/getUserByPosition", {
          params: { user_position: "System Analyst" },
        });
        const responseDEV = await this.$axios.get("/users/getUserByPosition", {
          params: { user_position: "Developer" },
        });
        const responseIMP = await this.$axios.get("/users/getUserByPosition", {
          params: { user_position: "Implementer" },
        });

        // Assign to data properties with user_id included
        this.teamMembersSA = responseSA.data.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
        this.teamMembersDEV = responseDEV.data.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
        this.teamMembersIMP = responseIMP.data.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    },
    selectAllSA() {
      if (this.selectedSA.length === this.teamMembersSA.length) {
        this.selectedSA = [];
      } else {
        this.selectedSA = [...this.teamMembersSA];
      }
    },
    selectAllDEV() {
      if (this.selectedDEV.length === this.teamMembersDEV.length) {
        this.selectedDEV = [];
      } else {
        this.selectedDEV = [...this.teamMembersDEV];
      }
    },
    selectAllIMP() {
      if (this.selectedIMP.length === this.teamMembersIMP.length) {
        this.selectedIMP = [];
      } else {
        this.selectedIMP = [...this.teamMembersIMP];
      }
    },

    formatTeamMembers(teamMembers) {
      return teamMembers.map((member) => ({
        text: `${member.user_firstname} ${member.user_lastname}`,
        value: member,
      }));
    },
    async createProject() {
      if (
        !this.newProject.project_name_TH ||
        !this.newProject.project_name_ENG
      ) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in all required fields.",
          confirmButtonColor: "#009933",
        });
        return;
      }

      try {
        let requestBody = {
          project_name_TH: this.newProject.project_name_TH,
          project_name_ENG: this.newProject.project_name_ENG,
        };

        // Check if any team members are selected
        if (this.selectedSA.length > 0) {
          requestBody.selectedSA = this.selectedSA.map(
            (member) => member.user_id
          );
        }

        if (this.selectedDEV.length > 0) {
          requestBody.selectedDEV = this.selectedDEV.map(
            (member) => member.user_id
          );
        }

        if (this.selectedIMP.length > 0) {
          requestBody.selectedIMP = this.selectedIMP.map(
            (member) => member.user_id
          );
        }

        const response = await this.$axios.post(
          "/projects/createProject",
          requestBody
        );
        const data = response.data;

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "New Project created successfully",
          confirmButtonColor: "#009933",
        });

        this.createProjectDialog = false;
        this.fetchProjects();
      } catch (error) {
        console.error("Error creating Project:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to create Project",
          confirmButtonColor: "#009933",
        });
      }
    },
    async fetchProjects() {
      let url;
      if (this.$auth.user.user_role === "Admin") {
        url = "/projects/getAll";
      } else {
        url = `/user_projects/getProjectByUser_id/${this.$auth.user.id}`;
      }

      try {
        const response = await this.$axios.get(url);
        const data = response.data;

        if (Array.isArray(data)) {
          this.projects = data;
        } else {
          this.projects = [data];
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    async updateProject() {
      try {
        const response = await this.$axios.put(
          `/projects/updateProject/${this.editProject.id}`,
          this.editProject
        );

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Project updated successfully",
          confirmButtonColor: "#009933",
        });

        this.editProjectDialog = false;
        this.fetchProjects();
      } catch (error) {
        console.error("Error updating project:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update project",
          confirmButtonColor: "#009933",
        });
      }
    },
    viewProjectDetails(project) {
      const encodedId = encodeURIComponent(encodeId(project.id));
      this.$router.push({
        path: `/Progress_Tracking/ManageSystems_Progress_Tracking/${encodedId}`,
        params: { selectedProject: project },
      });
    },
    goToHistoryProject() {
      this.$router.push("/Progress_Tracking/HistoryProject");
    },
    openEditDialog(project) {
      this.editProject = { ...project };
      this.editProjectDialog = true;
    },
    async softDeleteProject(project) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await this.$axios.delete(
            `/projects/delete/${project.id}`
          );

          if (response.status !== 200) {
            throw new Error(`Failed to delete project: ${response.statusText}`);
          }

          console.log("Project deleted successfully");

          await Swal.fire({
            title: "Success",
            text: "Project deleted successfully.",
            icon: "success",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK
          });

          this.fetchProjects(); // อัพเดทลิสต์โปรเจคใหม่หลังจากการลบสำเร็จ
        }
      } catch (error) {
        console.error("Error deleting project:", error);

        await Swal.fire({
          title: "Error",
          text: `An error occurred during the project deletion process: ${error.message}`,
          icon: "error",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK
        });
      }
    },
    async goToCreateProject() {
      this.createProjectDialog = true;
    },
    updateDateTime() {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      };

      this.currentDateTime = now.toLocaleDateString("en-US", options);
    },
  },
  computed: {
    getProgressColorProject() {
      return function (progress) {
        if (progress >= 75) {
          return "#4CAF50"; // สีเขียวเข้ม
        } else if (progress >= 51) {
          return "#03A9F4"; // สีฟ้าอ่อน
        } else if (progress >= 26) {
          return "#FFD700"; // สีทอง
        } else {
          return "#FC8705"; // สีส้ม
        }
      };
    },
    searchBarStyle() {
      if (this.user.user_role === "Admin") {
        // ถ้าผู้ใช้เป็น Admin ให้ความกว้างเต็มหน้าจอ
        return {
          marginBottom: "10px",
          width: "70%", // กำหนดความกว้างเต็มหน้าจอ
          height: "70%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          fontSize: "16px",
        };
      } else {
        // ถ้าผู้ใช้ไม่ใช่ Admin ให้ความกว้างเป็น 70%
        return {
          marginBottom: "10px",
          width: "100%", // ความกว้าง 70%
          height: "70%",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          fontSize: "16px",
        };
      }
    },
    filteredHeaders() {
      if (this.user.user_role === "Admin") {
        // If user role is Admin, include Action column
        return this.headers;
      } else {
        // If user role is not Admin, exclude Action column
        return this.headers.filter((header) => header.value !== "actions");
      }
    },
    totalPages() {
      return Math.ceil(this.filteredUserProjects.length / this.itemsPerPage);
    },
    displayedUserProjects() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredUserProjects.slice(startIndex, endIndex);
    },
    developers() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "Developer"
      return this.availableUsers.filter(
        (user) => user.user_position === "Developer"
      );
    },
    implementers() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "Implementer"
      return this.availableUsers.filter(
        (user) => user.user_position === "Implementer"
      );
    },
    systemAnalysts() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "System Analyst"
      return this.availableUsers.filter(
        (user) => user.user_position === "System Analyst"
      );
    },
    filteredUserProjects() {
      return this.userProjects.filter((item) => {
        return (
          item.id
            .toString()
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_firstname
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_lastname
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_position.toLowerCase().includes(this.search.toLowerCase())
        );
      });
    },
    filteredProjects() {
      return this.projects
        .map((project) => ({
          ...project,
          project_progress: Math.round(project.project_progress || 0),
          project_plan_start: project.project_plan_start || "Not determined",
          project_plan_end: project.project_plan_end || "Not determined",
        }))
        .filter((project) => {
          const searchText = this.searchQuery.toLowerCase();
          return (
            (project.project_id &&
              project.project_id.toLowerCase().includes(searchText)) ||
            (project.project_name_ENG &&
              project.project_name_ENG.toLowerCase().includes(searchText)) ||
            (project.project_name_TH &&
              project.project_name_TH.toLowerCase().includes(searchText))
          );
        });
    },
  },

  mounted() {
    this.fetchAllScreens()
      .then(() => this.fetchAllSystems())
      .then(() => this.fetchAllProjects())
      .then(() => {
        // ตรวจสอบว่ามี project_id ก่อนที่จะเรียกใช้ fetchAvailableUsers
        if (this.project_id) {
          this.fetchAvailableUsers(this.project_id);
        }
        this.fetchTeamMembers();
        this.updateDateTime();
        this.fetchProjects();
        setInterval(this.updateDateTime, 1000);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  },
  beforeRouteEnter(to, from, next) {
    // แสดง Loader ก่อนเข้าหน้าใหม่
    next((vm) => {
      vm.$store.dispatch("setLoading", true);
    });
  },
  beforeRouteLeave(to, from, next) {
    // ซ่อน Loader ก่อนออกจากหน้า
    this.$store.dispatch("setLoading", false);
    next();
  },
};
</script>


<style scoped>
.text-01 {
  color: black !important;
}

.project-manager {
  color: #3f51b5;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.project-code {
  text-transform: uppercase;
  font-weight: bold;
  color: #6c757d;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.tracking-work-card {
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(255, 253, 253, 0.1);
  transition: transform 0.3s ease-in-out;
  background-color: #9747ff;
}

.tracking-work-card:hover {
  transform: translateY(-5px);
}

.tracking-work-card h2 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.work-item p {
  margin-bottom: 5px;
}

.work-item p:last-child {
  margin-bottom: 0;
}

.v-card-actions {
  padding: 10px;
  justify-content: space-between;
}

.project-button {
  color: #9747ff !important;
  background-color: #ffffff !important;
  font-weight: bold;
}

.project-title {
  display: flex;
  flex-direction: column;
}

.project-title h2 {
  margin-bottom: 5px;
  /* ปรับขนาดของระยะห่างระหว่างข้อมูล */
}

.router-link-underline {
  text-decoration: none;
  /* นำเส้นใต้ออก */
}

.router-link-underline:hover {
  text-decoration: underline;
  /* นำเส้นใต้กลับมาเมื่อเมาส์ไปวางทับ */
}
</style>