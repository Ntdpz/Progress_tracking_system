<template>
  <!-- Systems Data Table container -->
  <div v-if="project" class="systems-data-table">
    <Loader v-if="$store.getters.isLoading" />
    <v-row style="margin-bottom: 20px" align="center">
      <!-- Card detel Project -->
      <v-card class="mx-auto align-start" width="98%">
        <projectDetail :project="project" />
      </v-card>

      <!-- Dialog แสดง User ในโปรเจค -->
      <v-dialog v-model="showUserDialog" max-width="600">
        <v-card>
          <v-card-title>User Projects</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="searchprojectUser"
              label="Search"
              dense
              hide-details
              solo
              flat
              outlined
              color="primary"
              hint="Search here"
            ></v-text-field>
            <v-list>
              <v-list-item
                v-for="(user, index) in displayedUsersprojectUser"
                :key="index"
              >
                <!-- ตรงนี้คือการเพิ่มเงื่อนไขในการกรองผู้ใช้งาน -->
                <template
                  v-if="
                    user.user_position
                      .toLowerCase()
                      .includes(searchprojectUser.toLowerCase()) ||
                    user.user_firstname
                      .toLowerCase()
                      .includes(searchprojectUser.toLowerCase()) ||
                    user.user_lastname
                      .toLowerCase()
                      .includes(searchprojectUser.toLowerCase()) ||
                    user.user_department
                      .toLowerCase()
                      .includes(searchprojectUser.toLowerCase())
                  "
                >
                  <v-list-item-avatar>
                    <img :src="user.user_pic" alt="User Picture" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ user.user_position }}: {{ user.user_firstname }}
                      {{ user.user_lastname }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{
                      user.user_position
                    }}</v-list-item-subtitle>
                    <v-list-item-subtitle>{{
                      user.user_department
                    }}</v-list-item-subtitle>
                    <!-- เพิ่มข้อมูลเพิ่มเติมตามต้องการ -->
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list>

            <v-pagination
              v-model="currentPageprojectUser"
              :length="numberOfPagesprojectUser"
              @input="changePageprojectUser"
            ></v-pagination>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="showUserDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12" :style="{ 'margin-top': '10px' }">
        <input type="text" v-model="searchQuery" placeholder="Search..." :style="{
          'margin-bottom': '10px',
          width: user.user_role === 'Admin' ? '70%' : '100%', // เพิ่มเงื่อนไขในการกำหนด width
          padding: '5px',
          border: '1px solid #ccc',
          'border-radius': '5px',
          'font-size': '16px',
        }" />

        <v-btn v-if="user.user_role === 'Admin'" color="primary" class="text-none mb-4" @click="goToCreateSystem"
          style="margin-left: 50px; width: 10%; height: 70%">
          ADD SYSTEM
        </v-btn>
        <!-- เพิ่มปุ่ม Show History System -->
        <v-btn
          v-if="user.user_role === 'Admin'"
          color="error"
          class="text-none mb-4"
          @click="goToHistorySystems"
          style="margin-left: 10px; width: 10%; height: 70%"
        >
          <v-icon>mdi-history</v-icon> &nbsp;</v-btn
        >
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-data-table
      :headers="filteredHeaders"
      :items="filteredSystems"
      :sort-by="[{ key: 'system_id', order: 'desc' }]"
    >
      <!-- ส่วนแสดงข้อมูล -->
      <template v-slot:item="{ item }">
        <tr @click="goToSystemsDetail(item.id)">
          <!-- แสดงข้อมูลต่าง ๆ -->

          <td>{{ item.system_nameTH }}</td>
          <td>{{ item.system_nameEN }}</td>
          <td>{{ item.system_shortname }}</td>
          <td>{{ item.screen_count ? item.screen_count : "0" }}</td>

          <td>
            <v-progress-linear
              :color="getProgressColor(parseInt(item.system_progress))"
              height="20"
              :value="parseInt(item.system_progress)"
              :style="{ width: '100%' }"
              striped
            >
              <strong :style="{ color: 'white' }"
                >{{
                  item.system_progress ? parseInt(item.system_progress) : 0
                }}%</strong
              >
            </v-progress-linear>
          </td>
          <td>{{ formatDate(item.system_plan_start) }}</td>
          <td>{{ formatDate(item.system_plan_end) }}</td>

          <td>{{ item.system_manday ? item.system_manday : "0" }}</td>
          <!-- เพิ่มปุ่ม manage user systems -->
          <td v-if="user.user_role === 'Admin'">
            <!-- Dropdown menu for other actions -->
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon size="20" px>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <!-- Manage User Systems action -->
                <v-list-item @click="openManageUserDialog(item)">
                  <v-list-item-icon>
                    <v-icon>mdi-account-edit</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>Assign</v-list-item-content>
                </v-list-item>
                <!-- Edit action -->

                <v-list-item @click="openEditDialog(item)">
                  <v-list-item-icon>
                    <v-icon>mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>Edit</v-list-item-content>
                </v-list-item>
                <!-- Delete action -->
                <v-list-item @click="confirmDeleteSystem(item)">
                  <v-list-item-icon>
                    <v-icon class="red--text">mdi-delete</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content class="red--text"
                    >Delete</v-list-item-content
                  >
                </v-list-item>
                <!-- Systems Detail action -->
              </v-list>
            </v-menu>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Create System Dialog -->
    <v-dialog
      v-model="createSystemDialog"
      max-width="600"
      ref="createSystemDialog"
    >
      <v-card>
        <v-card-title>Create New System</v-card-title>
        <v-card-text>
          <!-- Form to create new system -->
          <v-form @submit.prevent="createSystem">
            <v-text-field
              v-model="newSystem.system_nameTH"
              label="System Name (TH)"
              required
              :rules="[(v) => !!v || 'System Name (TH) is required']"
            ></v-text-field>
            <v-text-field
              v-model="newSystem.system_nameEN"
              label="System Name (EN)"
              required
              :rules="[(v) => !!v || 'System Name (EN) is required']"
            ></v-text-field>
            <v-text-field
              v-model="newSystem.system_shortname"
              label="Short Name"
              required
              :rules="[(v) => !!v || 'Short Name is required']"
            ></v-text-field>
            <!-- Add v-select for selecting users -->
            <v-select
              v-model="selectedCreateSystemAnalysts"
              :items="filteredUsers('System Analyst')"
              label="Select System Analyst"
              item-value="user_id"
              item-text="displayName"
              multiple
              required
              :rules="[
                (v) => !!v || 'At least one System Analyst must be selected',
              ]"
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllSystemAnalysts">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model="selectedCreateDevelopers"
              :items="filteredUsers('Developer')"
              label="Select Developer"
              item-value="user_id"
              item-text="displayName"
              multiple
              required
              :rules="[(v) => !!v || 'At least one Developer must be selected']"
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllDevelopers">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>
            <v-select
              v-model="selectedCreateImplementers"
              :items="filteredUsers('Implementer')"
              label="Select Implementer"
              item-value="user_id"
              item-text="displayName"
              multiple
              required
              :rules="[
                (v) => !!v || 'At least one Implementer must be selected',
              ]"
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllImplementers">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <!-- Buttons to submit -->
            <v-btn color="primary" type="submit">Create</v-btn>
            <v-btn color="error" @click="createSystemDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit System Dialog -->
    <v-dialog v-model="editSystemDialog" max-width="600" ref="editSystemDialog">
      <v-card>
        <v-card-title>Edit System</v-card-title>
        <v-card-text>
          <!-- Form to edit system -->
          <v-form @submit.prevent="updateSystem">
            <v-lable> System Name Thai </v-lable>
            <v-text-field v-model="editedSystem.system_nameTH"></v-text-field>
            <v-lable> System Name English </v-lable>
            <v-text-field v-model="editedSystem.system_nameEN"></v-text-field>
            <v-lable> System Shortname </v-lable>
            <v-text-field
              v-model="editedSystem.system_shortname"
            ></v-text-field>

            <v-btn color="primary" type="submit">Update</v-btn>
            <v-btn color="error" @click="editSystemDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Show deleted systems history -->
    <v-dialog v-model="showHistoryDialog" max-width="800">
      <v-data-table
        v-model:selected="selectedSystems"
        :headers="headersDelete"
        :items="deletedSystems"
        show-select
      >
        <!-- Define headers for the table -->
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Deleted Systems History</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-btn class="mr-3" color="green" @click="restoreSelectedSystems"
              ><v-icon color="white">mdi-restore</v-icon></v-btn
            >
            <v-btn color="error" @click="deleteSelectedHistorySystems">
              <v-icon>mdi-delete</v-icon></v-btn
            >
          </v-toolbar>
        </template>
      </v-data-table>
    </v-dialog>

    <!-- Dialog สำหรับการจัดการผู้ใช้ระบบ -->
    <v-dialog v-model="manageUserDialog" max-width="800px">
      <manageUserInSystems
        :project_id="projectId"
        :systems_id="selectedSystemId"
        @close="manageUserDialog = false"
      />
    </v-dialog>

    <!-- assing Userdialog -->
    <v-dialog v-model="assinguserDalog" max-width="500px">
      <v-card>
        <v-card-title>Assign User</v-card-title>
        <v-card-text>
          <!-- Select System Analyst -->
          <v-select
            v-model="selectedSystemAnalysts"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'System Analyst'
              )
            "
            label="Select System Analyst"
            item-text="displayName"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllSystemAnalystAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <!-- Select Developer -->
          <v-select
            v-model="selectedDevelopers"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'Developer'
              )
            "
            label="Select Developer"
            item-text="displayName"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllDevelopersAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <!-- Select Implementer -->
          <v-select
            v-model="selectedImplementers"
            :items="
              availableUsers.filter(
                (user) => user.user_position === 'Implementer'
              )
            "
            label="Select Implementer"
            item-text="displayName"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllImplementersAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="assignUser">Assign</v-btn>
          <v-btn color="error" @click="assinguserDalog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import Swal from "sweetalert2";
import axios from "axios";
import { encodeId, decodeId } from "@/utils/crypto";
import projectDetail from "@/components/Progress_tracking/Project/projectDetail.vue";
import manageUserInSystems from "@/components/Progress_tracking/systems/manageUserInSystems.vue";
export default {
  head() {
    return {
      title: "ManageSystems",
    };
  },
  async asyncData({ params, $axios, error }) {
    const encodedId = params.id;
    const decodedId = decodeId(encodedId);

    if (!decodedId) {
      return error({ statusCode: 400, message: "Invalid Project ID" });
    }

    try {
      // ดึงข้อมูลโปรเจกต์จาก API โดยใช้ decodedId
      const project = await $axios.$get(
        `/systems/searchByProjectId/${decodedId}`
      );
      return { project, projectId: decodedId };
    } catch (err) {
      return error({ statusCode: 404, message: "Project not found" });
    }
  },

  middleware: "auth",
  name: "SystemsDataTable",
  layout: "admin",
  components: {
    Loader,
    projectDetail,
    manageUserInSystems,
  },
  data() {
    return {
      projectId: null,
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      selectedCreateSystemAnalysts: [],
      selectedCreateDevelopers: [],
      selectedCreateImplementers: [],
      searchUser: "",
      assinguserDalog: false,
      selectedSystemAnalysts: [],
      selectedDevelopers: [],
      selectedImplementers: [],
      selectedSystems: [],
      selectedUsers: [],
      availableUsers: [],
      assignUserDialog: false,

      selectedProjectId: null,
      users: [],
      currentPage: 1,
      perPage: 5,
      system_id: "",
      userSystemsHeaders: [
        { text: "ID", value: "id" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position" },
        { text: "Picture", value: "user_pic" },
      ],
      search: "",
      manageUserDialog: false,
      selectedSystemId: "",
      selectedUser: null,
      showUserDialog: false,

      dropdown: false,
      projectUsers: [],
      searchprojectUser: "",
      currentPageprojectUser: 1,
      perPageprojectUser: 5,
      showDetails: false,
      project: "",
      projectNameENG: "",
      showHistoryDialog: false,
      deletedSystems: [],
      createSystemDialog: false,
      editSystemDialog: false,
      newSystem: {
        id: "",

        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      editedSystem: {
        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      systems: [],
      searchQuery: "",
      headers: [
        { text: "System Name (TH)", value: "system_nameTH" },
        { text: "System Name (EN)", value: "system_nameEN" },
        { text: "Short Name", value: "system_shortname" },
        { text: "Screen Count", value: "screen_count" },
        { text: "System Progress (%)", value: "system_progress" },
        { text: "Planned Start", value: "system_plan_start" },
        { text: "Planned End", value: "system_plan_end" },
        { text: "Manday", value: "system_manday" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      headersDelete: [
        { text: "System Name (TH)", value: "system_nameTH" },
        { text: "System Name (EN)", value: "system_nameEN" },
        { text: "Short Name", value: "system_shortname" },
        // { text: "Actions", value: "actions", sortable: false },
      ],
    };
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
    selectAllSystemAnalystAF() {
      this.selectedSystemAnalysts = this.availableUsers
        .filter((user) => user.user_position === "System Analyst")
        .map((user) => user.id);
    },
    // ฟังก์ชันเลือกทุก Developer
    selectAllDevelopersAF() {
      this.selectedDevelopers = this.availableUsers
        .filter((user) => user.user_position === "Developer")
        .map((user) => user.id);
    },
    // ฟังก์ชันเลือกทุก Implementer
    selectAllImplementersAF() {
      this.selectedImplementers = this.availableUsers
        .filter((user) => user.user_position === "Implementer")
        .map((user) => user.id);
    },
    changePageprojectUser(page) {
      this.currentPageprojectUser = page;
    },
    changePage(page) {
      this.currentPage = page;
    },
    selectAllImplementers() {
      const implementers = this.filteredUsers("Implementer").map(
        (user) => user.user_id
      );
      if (this.selectedCreateImplementers.length === implementers.length) {
        this.selectedCreateImplementers = [];
      } else {
        this.selectedCreateImplementers = implementers;
      }
    },
    selectAllDevelopers() {
      const developers = this.filteredUsers("Developer").map(
        (user) => user.user_id
      );
      if (this.selectedCreateDevelopers.length === developers.length) {
        this.selectedCreateDevelopers = [];
      } else {
        this.selectedCreateDevelopers = developers;
      }
    },
    selectAllSystemAnalysts() {
      const systemAnalysts = this.filteredUsers("System Analyst").map(
        (user) => user.user_id
      );
      if (this.selectedCreateSystemAnalysts.length === systemAnalysts.length) {
        this.selectedCreateSystemAnalysts = [];
      } else {
        this.selectedCreateSystemAnalysts = systemAnalysts;
      }
    },
    filteredUsers(position) {
      return this.projectUsers
        .filter((user) => user.user_position === position)
        .map((user) => ({
          ...user,
          displayName: `${user.user_firstname} ${user.user_lastname}`,
        }));
    },
    async assignUser() {
      try {
        const {
          selectedSystemAnalysts,
          selectedDevelopers,
          selectedImplementers,
          selectedSystemId,
          selectedProjectId,
        } = this;
        const selectedUsers = [
          ...selectedSystemAnalysts,
          ...selectedDevelopers,
          ...selectedImplementers,
        ];
        const response = await this.$axios.post(
          `/user_systems/createUser_system`,
          {
            user_id: selectedUsers,
            system_id: selectedSystemId,
            project_id: selectedProjectId,
          }
        );

        this.assignUserDialog = false;

        // Show success message using SweetAlert2
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "User assigned successfully",
          confirmButtonColor: "#009933",
        });

        // เรียกใช้งานเมธอดเพื่ออัปเดตรายการผู้ใช้
        await this.fetchUsersBySystemAndProject(
          selectedSystemId,
          selectedProjectId
        );

        // เปิด Dialog ที่ให้ผู้ใช้เลือกผู้ใช้เพิ่มเติมหรือทำการกำหนดผู้ใช้ใหม่
        await this.openNestedDialog(selectedSystemId, selectedProjectId);

        // Reset selectedUsers
        this.selectedSystemAnalysts = [];
        this.selectedDevelopers = [];
        this.selectedImplementers = [];
      } catch (error) {
        console.error("Error assigning user:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to assign user",
          confirmButtonColor: "#009933",
        });
      }
    },
    async fetchUsersBySystemAndProject(systemId, projectId) {
      try {
        const response = await this.$axios.get(
          `/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        this.users = response.data;
      } catch (error) {
        console.error(error);
      }
    },
    openManageUserDialog(item) {
      this.selectedSystemId = item.id; // เก็บรหัสระบบที่เลือก
      this.selectedProjectId = item.project_id; // เก็บรหัสโปรเจคที่เลือก
      this.manageUserDialog = true; // เปิด Dialog
      this.fetchUsersBySystemAndProject(item.id, item.project_id); // เรียกใช้งานฟังก์ชันโหลดข้อมูลผู้ใช้
    },

    async openNestedDialog(systemId, projectId) {
      try {
        // เรียก API เพื่อรับรายชื่อผู้ใช้ที่สามารถเลือกได้
        const response = await this.$axios.get(
          `/user_systems/checkUsersNotInSystem/${projectId}/${systemId}`
        );

        // เพิ่มข้อมูล user_position เข้าไปในชุดข้อมูล
        const usersWithDisplayName = response.data.map((user) => ({
          ...user,
          displayName: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
        }));

        // กำหนดข้อมูลผู้ใช้ใหม่ตามตำแหน่ง
        this.availableUsers = usersWithDisplayName;

        // เปิด Dialog
        this.assinguserDalog = true;
      } catch (error) {
        console.error(error);
      }
    },
    async deleteUser(systemId, projectId, userId) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to delete this user from the system.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933", // ปรับสีปุ่ม Yes เป็นสีเขียว
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await this.$axios.delete(
            `/user_systems/deleteUserSystem/${systemId}/${projectId}/${userId}`
          );

          if (response.status === 200) {
            const index = this.users.findIndex((user) => user.id === userId);
            if (index !== -1) {
              this.users.splice(index, 1);
            }
            await Swal.fire({
              title: "Deleted!",
              text: "The user has been deleted from the system.",
              icon: "success",
              confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
            });
          } else {
            await Swal.fire({
              title: "Error!",
              text: "Failed to delete the user from the system.",
              icon: "error",
              confirmButtonColor: "#009933", // ปรับสีปุ่ม OK ในกรณีเกิดข้อผิดพลาด
            });
          }
        }
      } catch (error) {
        console.error("Error deleting user system:", error);
        await Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting the user from the system.",
          icon: "error",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อเกิดข้อผิดพลาด
        });
      }
    },
    goToCreateSystem() {
      // Open the create system dialog first
      this.createSystemDialog = true;
    },
    toggleDropdown() {
      this.dropdown = !this.dropdown;
    },
    async fetchProjectUsers() {
      const projectId = this.projectId;
      if (!projectId) {
        console.error("Project ID is null");
        return;
      }
      try {
        const response = await this.$axios.get(
          `/user_projects/getUserProjectsByProjectId/${projectId}`
        );
        this.projectUsers = response.data.map((user) => ({
          ...user,
          displayName: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
        }));
      } catch (error) {
        console.error(error);
      }
    },
    async goToSystemsDetail(systemId) {
      // เข้ารหัส systemId ก่อนการนำทาง
      const encodedId = encodeURIComponent(encodeId(systemId));

      // นำทางไปยังหน้า Systems/_id.vue ด้วย encodedId
      await this.$router.push({
        path: `/Progress_Tracking/manageScreens_Progress_Tracking/${encodedId}`,
      });
    },
    async fetchProjectNameENG() {
      try {
        const projectId = this.projectId;
        if (!projectId) {
          console.error("Project ID is null");
          return;
        }
        const response = await this.$axios.get(`/projects/getOne/${projectId}`);
        this.project = response.data;
        this.projectNameENG = response.data.project_name_ENG;
      } catch (error) {
        console.error("Error fetching project:", error);
        // Handle error fetching project
      }
    },
    async restoreSelectedSystems() {
      try {
        // ตรวจสอบว่ามีการเลือก systems หรือไม่
        if (this.selectedSystems.length === 0) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No systems selected to restore.",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อเกิดข้อผิดพลาด
          });
          return;
        }

        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore the selected systems.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933", // ปรับสีปุ่ม Yes เป็นสีเขียว
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore them!",
        });

        if (confirmResult.isConfirmed) {
          // วนลูปผ่านระบบที่เลือกและกู้คืนแต่ละระบบ
          for (const system of this.selectedSystems) {
            const systemId = system.id;
            const response = await this.$axios.put(
              `/systems/updateSystem/${systemId}`,
              {
                system_nameTH: system.system_nameTH,
                system_nameEN: system.system_nameEN,
                system_shortname: system.system_shortname,
                project_id: system.project_id,
                is_deleted: 0,
              }
            );

            if (response.status !== 200) {
              throw new Error("Failed to restore systems");
            }
          }

          console.log("Selected systems restored successfully");

          await Swal.fire({
            title: "Success",
            text: "Selected systems restored successfully.",
            icon: "success",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อสำเร็จ
          });

          // โหลดข้อมูลใหม่หลังจากกู้คืนระบบ
          this.fetchDeletedSystems();
          this.fetchSystems();
          this.fetchProjectNameENG();
        }
      } catch (error) {
        console.error("Error restoring selected systems:", error);
        await Swal.fire({
          title: "Error",
          text: "An error occurred during the systems restoration process.",
          icon: "error",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อเกิดข้อผิดพลาด
        });
      }
    },
    async deleteSelectedHistorySystems() {
      try {
        // ตรวจสอบว่ามีการเลือก systems หรือไม่
        if (this.selectedSystems.length === 0) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "No systems selected to delete.",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
          });
          return;
        }

        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33", // ปรับสีปุ่ม Yes เป็นสีแดง
          cancelButtonColor: "#009933",
          confirmButtonText: "Yes, delete them!",
        });

        if (confirmResult.isConfirmed) {
          // วนลูปผ่านระบบที่เลือกและลบแต่ละระบบ
          for (const system of this.selectedSystems) {
            const systemId = system.id; // รับ ID ของระบบที่ต้องการลบ
            const response = await this.$axios.delete(
              `/systems/deleteHistorySystems/${systemId}`
            );

            if (response.status !== 200) {
              throw new Error("Failed to delete systems");
            }
          }

          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Selected systems and related data deleted successfully",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
          });

          // โหลดข้อมูลระบบที่ถูกลบใหม่หลังจากการลบ
          this.fetchDeletedSystems();
        }
      } catch (error) {
        console.error("Error deleting selected history systems:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete selected history systems",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อเกิดข้อผิดพลาด
        });
      }
    },
    async goToHistorySystems() {
      await this.fetchDeletedSystems();
      this.showHistoryDialog = true;
    },
    async fetchDeletedSystems() {
      try {
        const projectId = this.projectId;
        const response = await this.$axios.get(
          `/systems/searchByProjectId_delete/${projectId}`
        );

        this.deletedSystems = response.data;
      } catch (error) {
        console.error("Error fetching deleted systems:", error);
        // Handle error fetching deleted systems
      }
    },
    async createSystem() {
      console.log(
        "Selected System Analysts:",
        this.selectedCreateSystemAnalysts
      );
      console.log("Selected Developers:", this.selectedCreateDevelopers);
      console.log("Selected Implementers:", this.selectedCreateImplementers);

      const projectId = this.projectId;
      if (!projectId) {
        console.error("Project ID is null");
        return;
      }
      const { system_nameTH, system_nameEN, system_shortname } = this.newSystem;

      // ตรวจสอบว่ามีฟิลด์ที่จำเป็นว่างหรือไม่
      if (!system_nameTH || !system_nameEN || !system_shortname) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in all required fields",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
        });
        return; // หยุดการทำงานถ้ามีฟิลด์ที่จำเป็นว่าง
      }

      try {
        const response = await this.$axios.post(`/systems/createSystem`, {
          project_id: projectId,
          system_nameTH,
          system_nameEN,
          system_shortname,
          selectedUser: [
            // แม็ปผู้ใช้ที่เลือกไว้ไปยัง user_id
            ...this.selectedCreateSystemAnalysts,
            ...this.selectedCreateDevelopers,
            ...this.selectedCreateImplementers,
          ],
        });

        // แสดงข้อความสำเร็จ
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "New system created successfully",
          showConfirmButton: true,
          allowOutsideClick: false,
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
        });

        // ล้างฟอร์ม
        this.newSystem = {
          system_nameTH: "",
          system_nameEN: "",
          system_shortname: "",
        };
        this.selectedCreateSystemAnalysts = [];
        this.selectedCreateDevelopers = [];
        this.selectedCreateImplementers = [];

        // ดึงรายการระบบใหม่เพื่ออัปเดตลิสต์
        this.fetchSystems();

        this.createSystemDialog = false;
      } catch (error) {
        console.error("Error creating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create system",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวในกรณีเกิดข้อผิดพลาด
        });
      }
    },
    async updateSystem() {
      try {
        const response = await this.$axios.put(
          `/systems/updateSystem/${this.editedSystem.id}`,
          this.editedSystem,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System updated successfully",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียว
          });

          this.editSystemDialog = false;
          this.fetchSystems(); // อัปเดตรายการระบบ
        } else {
          throw new Error("Failed to update system");
        }
      } catch (error) {
        console.error("Error updating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update system",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวในกรณีเกิดข้อผิดพลาด
        });
      }
    },
    async confirmDeleteSystem(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933", // ปรับสีปุ่ม Yes เป็นสีเขียว
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await this.$axios.delete(
            `/systems/delete/${item.id}`
          );

          if (response.status !== 200) {
            throw new Error("Failed to delete system");
          }

          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System deleted successfully",
            confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวเมื่อสำเร็จ
          });

          this.fetchSystems();
          this.fetchProjectNameENG();
        }
      } catch (error) {
        console.error("Error confirming delete system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete system",
          confirmButtonColor: "#009933", // ปรับสีปุ่ม OK เป็นสีเขียวในกรณีเกิดข้อผิดพลาด
        });
      }
    },
    async openEditDialog(item) {
      this.editedSystem = { ...item };
      this.editSystemDialog = true;
    },
    async fetchSystems() {
      try {
        const projectId = this.projectId;
        if (!projectId) {
          console.error("Project ID is null");
          return;
        }
        let url = "";

        // Check if the user role is Admin
        if (this.$auth.user.user_role === "Admin") {
          url = `/systems/searchByProjectId/${projectId}`;
        } else {
          // If not Admin, use the URL for non-admin users
          url = `/user_systems/getSystemsByUser_id/${projectId}/${this.$auth.user.id}`;
        }

        const response = await this.$axios.get(url);
        this.systems = response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
        // Handle error fetching systems
      }
    },
    filterSystems() {
      const query = this.searchQuery.toLowerCase();
      return this.systems.filter(
        (system) =>
          system.system_nameTH.toLowerCase().includes(query) ||
          system.system_nameEN.toLowerCase().includes(query) ||
          system.system_shortname.toLowerCase().includes(query)
      );
    },
  },
  computed: {
    filteredHeaders() {
      if (this.user.user_role === "Admin") {
        // If user role is Admin, include Action column
        return this.headers;
      } else {
        // If user role is not Admin, exclude Action column
        return this.headers.filter((header) => header.value !== "actions");
      }
    },
    filteredUsersList() {
      return this.displayedUsers.filter((user) => {
        const fullName =
          `${user.user_firstname} ${user.user_lastname}`.toLowerCase();
        return fullName.includes(this.searchUser.toLowerCase());
      });
    },
    numberOfPagesprojectUser() {
      // เปลี่ยนชื่อ computed numberOfPages เพื่อไม่ให้ซ้ำกับชื่ออื่น
      return Math.ceil(this.projectUsers.length / this.perPageprojectUser);
    },
    displayedUsersprojectUser() {
      // เปลี่ยนชื่อ computed displayedUsers เพื่อไม่ให้ซ้ำกับชื่ออื่น
      const start = (this.currentPageprojectUser - 1) * this.perPageprojectUser;
      const end = start + this.perPageprojectUser;
      return this.projectUsers.slice(start, end);
    },
    numberOfPages() {
      return Math.ceil(this.users.length / this.perPage);
    },
    displayedUsers() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      return this.users.slice(start, end);
    },
    filteredSystems() {
      return this.filterSystems();
    },
  },
  watch: {
    $route(to, from) {
      this.fetchProjectNameENG();
      this.fetchProjectUsers();
      this.fetchSystems();
    },
  },
  created() {
    this.fetchProjectNameENG();
    this.fetchProjectUsers();
    this.fetchSystems();
    this.$store.dispatch("setLoading", true);
  },

  mounted() {
    this.fetchAllScreens()
      .then(() => this.fetchAllSystems())
      .then(() => this.fetchAllProjects())
      .then(() => this.fetchSystems())
      .then(() => this.fetchProjectNameENG())

      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  },
};
</script>


<style scoped>
.v-data-table > .v-data-footer {
  padding-top: 0;
}

.systems-data-table .v-progress-linear__background {
  background-color: rgba(0, 0, 0, 0.1);
}

.custom-btn {
  width: 100%;
  height: 50%;
}
</style>