<template>
  <div>
    <div>
      <v-row style="margin-bottom: 20px" align="center">
        <!-- Card detel Systems -->
        <v-card class="mx-auto align-start" width="95%" hover>
          <v-card-item @click="showDetails = !showDetails">
            <v-card-title>
              System name : {{ system.system_nameEN }}
              <v-spacer></v-spacer>
              <v-icon @click.stop="showUserDialog = true">
                mdi-account-multiple</v-icon
              >
            </v-card-title>

            <v-card-subtitle>
              Systems Progress
              <v-progress-linear
                :color="getProgressColor(parseInt(system.system_progress))"
                height="50"
                :value="parseInt(system.system_progress)"
                striped
              >
                <strong :style="{ color: '#5E5E5E', fontSize: '20px' }"
                  >{{ Math.floor(system_progress) || 0 }}%</strong
                ></v-progress-linear
              >
            </v-card-subtitle>
          </v-card-item>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>System Manday: {{ system.system_manday || 0 }}</p>
                <p>Screen Count: {{ system.screen_count || 0 }}</p>
                <p>
                  System Plan Start:
                  {{
                    system.system_plan_start
                      ? formatDate(system.system_plan_start)
                      : "Not determined"
                  }}
                </p>
                <p>
                  System Plan End:
                  {{
                    system.system_plan_end
                      ? formatDate(system.system_plan_end)
                      : "Not determined"
                  }}
                </p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
        <!-- แสดงรายชื่อ Usser Dialog -->
        <v-dialog v-model="showUserDialog" max-width="600">
          <v-card>
            <v-card-title>User Systems</v-card-title>
            <!-- เพิ่มช่องค้นหา -->
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
            </v-card-text>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(user, index) in filteredsearchprojectUser"
                  :key="index"
                >
                  <v-list-item-avatar>
                    <img :src="user.user_pic" alt="User Picture" />
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ user.user_position }}: {{ user.user_firstname }}
                      {{ user.user_lastname }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      >ตำแหน่ง: {{ user.user_position }}</v-list-item-subtitle
                    >
                    <v-list-item-subtitle
                      >แผนก: {{ user.user_department }}</v-list-item-subtitle
                    >
                    <!-- เพิ่มข้อมูลเพิ่มเติมตามต้องการ -->
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-pagination
                v-model="paginationPageUserSystems"
                :length="totalPagesUserSystems"
                @input="changePageUserSystems"
                color="primary"
              ></v-pagination>
            </v-card-text>
            <!-- เพิ่ม pagination -->
            <v-card-actions>
              <v-btn color="error" @click="showUserDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </div>

    <!-- แสดงรายระเอียดScreen -->
    <div>
      <!-- Search bar -->
      <v-row no-gutters>
        <v-col cols="12">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search..."
            :style="{
              'margin-bottom': '10px',
              width: '70%', // เพิ่มเงื่อนไขในการกำหนด width
              padding: '10px',
              border: '1px solid #ccc',
              'border-radius': '5px',
              'font-size': '16px',
            }"
          />

          <v-btn
            color="primary"
            class="text-none mb-4 mr-2"
            @click="goToCreateScreen"
            style="margin-left: 50px; width: 10%; height: 40px"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            color="error"
            class="text-none mb-4"
            @click="showSystemIdDialog"
            style="width: 10%; height: 40px"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-container>
        <v-tabs v-model="selectedTab">
          <v-tab v-for="(tab, index) in tabs" :key="index">{{ tab }}</v-tab>
          <v-tab-item v-for="(tab, index) in tabs" :key="index">
            <v-container>
              <v-row class="full-width">
                <v-col
                  cols="12"
                  md="6"
                  lg="4"
                  v-for="(screen, index) in filteredScreensByStatus(tab)"
                  :key="index"
                >
                  <v-card
                    class="mx-auto full-width"
                    max-width="400"
                    @click="goToScreensDetail(screen.id)"
                  >
                    <v-img
                      class="align-end text-white"
                      height="200"
                      :src="getBase64Image(screen.screen_pic)"
                      cover
                    >
                      <v-card-title class="card-title">
                        <div>
                          {{ screen.screen_name }}
                        </div>
                      </v-card-title>
                    </v-img>

                    <v-card-subtitle class="pt-4" style="width: 100%">
                      <span
                        style="
                          font-weight: bold;
                          display: flex;
                          align-items: center;
                        "
                      >
                        Progress :
                        <div
                          style="
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            flex-grow: 1;
                          "
                        >
                          <v-progress-linear
                            :color="
                              getProgressColor(parseInt(screen.screen_progress))
                            "
                            height="15"
                            :value="parseInt(screen.screen_progress)"
                            :style="{ width: '95%' }"
                            striped
                          >
                            <strong :style="{ color: 'white' }">
                              {{
                                screen.screen_progress
                                  ? parseInt(screen.screen_progress) + "%"
                                  : "0%"
                              }}
                            </strong>
                          </v-progress-linear>
                        </div>
                      </span>
                    </v-card-subtitle>

                    <v-card-text>
                      <div><b>Manday:</b> {{ screen.screen_manday }} Days</div>

                      <div><b>Task Count:</b> {{ screen.task_count || 0 }}</div>
                      <p>Status: {{ screen.screen_status }}</p>
                      <div v-if="screen.screen_plan_start">
                        <b>Planned Start:</b>
                        {{ formatDate(screen.screen_plan_start) }}
                      </div>
                      <div v-else>
                        <b>Planned Start:</b>
                        No determine
                      </div>

                      <div v-if="screen.screen_plan_end">
                        <b>Planned End:</b>
                        {{ formatDate(screen.screen_plan_end) }}
                      </div>
                      <div v-else>
                        <b>Planned End:</b>
                        No determine
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-btn
                        color="primary"
                        class="small"
                        @click.stop="openEditDialog(screen)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>

                      <v-btn
                        color="primary"
                        class="small"
                        @click.stop="
                          getUserScreenManagement(
                            projectId,
                            systemId,
                            screen.id
                          )
                        "
                      >
                        <v-icon>mdi-account-multiple</v-icon>
                      </v-btn>

                      <v-btn
                        color="error"
                        class="small"
                        @click.stop="confirmDeleteScreen(screen)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>

                      <v-btn
                        color="primary"
                        class="small"
                        @click.stop="goToReportDetail(screen.id)"
                      >
                        <v-icon>mdi-information-outline</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-container>

      <!-- เพิ่ม Pagination ที่นี่ -->
      <v-pagination
        v-model="currentPage"
        :length="Math.ceil(filteredScreens.length / perPage)"
        @input="onPageChange"
      ></v-pagination>
    </div>

    <!-- Create Screen Dialog -->
    <v-dialog
      v-model="createScreenDialog"
      max-width="600"
      ref="createScreenDialog"
    >
      <v-card>
        <v-card-title>Create New Screen</v-card-title>
        <v-card-text>
          <v-form ref="screenForm" @submit.prevent="createScreen()">
            <!-- Existing fields -->
            <v-text-field
              v-model="newScreen.screen_id"
              :rules="[(v) => !!v || 'Screen ID is required']"
              label="Screen ID"
            ></v-text-field>
            <v-text-field
              v-model="newScreen.screen_name"
              :rules="[(v) => !!v || 'Screen Name is required']"
              label="Screen Name"
            ></v-text-field>

            <v-select
              v-model="newScreen.screen_level"
              label="Screen Level"
              :items="['Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>
            <v-file-input
              accept="image/png, image/jpeg, image/bmp"
              label="Select screen image"
              placeholder="Select screen image"
              prepend-icon="mdi-camera"
              v-model="avatarFile"
            ></v-file-input>

            <v-select
              v-model="newScreen.screen_status"
              label="Screen Status"
              :items="['Not started yet', 'design', 'develop', 'finish']"
            ></v-select>

            <v-select
              v-model="selectedSystemAnalysts"
              :items="filteredUsers('System Analyst')"
              label="Select System Analyst"
              item-value="id"
              item-text="userText"
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
              v-model="selectedDevelopers"
              :items="filteredUsers('Developer')"
              label="Select Developer"
              item-value="id"
              item-text="userText"
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
              v-model="selectedImplementers"
              :items="filteredUsers('Implementer')"
              label="Select Implementer"
              item-value="id"
              item-text="userText"
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

            <!-- Buttons -->
            <v-btn color="primary" type="submit">Create</v-btn>

            <v-btn color="error" @click="createScreenDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Screen Dialog -->
    <v-dialog v-model="editScreenDialog" max-width="600" ref="editScreenDialog">
      <v-card>
        <v-card-title>Edit Screen</v-card-title>
        <v-card-text>
          <!-- Form to edit screen -->
          <v-form @submit.prevent="updateScreen">
            <v-text-field
              v-model="editScreen.screen_id"
              label="Screen ID"
              readonly
              disabled
            ></v-text-field>
            <v-text-field
              v-model="editScreen.screen_name"
              label="Screen Name"
            ></v-text-field>
            <v-select
              v-model="editScreen.screen_level"
              label="Screen Level"
              :items="['Hard', 'Moderate', 'Easy', 'Simple']"
            ></v-select>
            <v-select
              v-model="editScreen.screen_status"
              label="Screen Status"
              :items="['Not started yet', 'design', 'develop', 'finish']"
            ></v-select>
            <!-- Input for selecting image file -->
            <v-file-input
              label="Select screen image"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Select screen image"
              prepend-icon="mdi-camera"
              v-model="editScreen.screen_pic"
              @change="onFileChange"
            ></v-file-input>

            <!-- Add more fields as needed -->
            <v-btn color="primary" type="submit">Update</v-btn>
            <v-btn color="error" @click="editScreenDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog for displaying SystemId -->
    <v-dialog v-model="systemIdDialog" max-width="800">
      <v-card>
        <v-data-table
          v-model="selectedDeletedScreens"
          :headers="tableHeaders"
          :items="deletedScreens"
          item-key="id"
          show-select
        >
          <!-- Define headers for the table -->
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Deleted Screen History</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-btn class="mr-3" color="green" @click="restoreSelectedScreen"
                ><v-icon color="white">mdi-restore</v-icon></v-btn
              >
              <v-btn color="error" @click="deleteSelectedHistoryScreen">
                <v-icon>mdi-delete</v-icon></v-btn
              >
            </v-toolbar>
          </template>

          <template v-slot:item.screen_pic="{ item }">
            <v-img
              :src="getBase64Image(item.screen_pic)"
              max-width="50px"
              max-height="50px"
              contain
            ></v-img>
          </template>
        </v-data-table>

        <v-card-actions>
          <v-btn color="error" @click="closeSystemIdDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Screen Managementdialog -->
    <v-dialog v-model="showUserManagementDialog" max-width="600">
      <v-card>
        <v-card-title> Manage User Screens </v-card-title>
        <v-card-text>
          <!-- Search field -->
          <v-text-field
            v-model="searchUser"
            label="Search"
            dense
            hide-details
            solo
            flat
            outlined
            color="primary"
          ></v-text-field>

          <v-list>
            <v-list-item
              v-for="(user, index) in paginatedScreenUsers"
              :key="user.id"
            >
              <v-list-item-avatar>
                <v-img :src="user.user_pic" width="40" height="40"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{ user.user_firstname }} {{ user.user_lastname }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ user.user_position }} - {{ user.user_department }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <!-- Delete button -->
              <v-list-item-action>
                <v-btn color="error" icon @click="deleteUser(user.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <!-- Pagination -->
          <v-pagination
            v-model="paginationPageUserScreen"
            :length="totalPagesUserScreen"
            @input="changePageUserScreen"
          ></v-pagination>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="this.$auth.user.user_role === 'Admin'"
            color="primary"
            @click="
              openAssignUserDialog(projectId, systemId, screenId), assignUser
            "
          >
            Assign User
          </v-btn>

          <v-btn
            v-if="!isUserInScreen()"
            color="primary"
            @click="assignCurrentUserToScreen"
          >
            Take Screen
          </v-btn>

          <v-btn color="error" @click="showUserManagementDialog = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Assign Userdialog -->
    <v-dialog v-model="dialogVisible" max-width="400">
      <v-card>
        <v-card-title>Assign User</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedUsers"
            :items="implementers"
            label="Select Implementers"
            multiple
          ></v-select>
          <v-select
            v-model="selectedUsers"
            :items="developers"
            label="Select Developers"
            multiple
          ></v-select>
          <v-select
            v-model="selectedUsers"
            :items="systemAnalysts"
            label="Select System Analysts"
            multiple
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="assignUsersToScreen"
            >Assign User</v-btn
          >
          <v-btn color="error" @click="closeAssignUserDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  middleware: "auth",
  name: "SystemDetails",
  layout: "admin",
  data() {
    return {
      system_progress: this.system?.system_progress || 0,
      userHasAccess: false,
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      selectedTab: "All",
      tabs: ["All", "Not started yet", "design", "develop", "finish"],
      tableHeaders: [
        { text: "Screen Picture", align: "start", value: "screen_pic" },
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
      ],

      selectedDeletedScreens: [],
      itemsPerPageUserScreen: 5,
      paginationPageUserScreen: 1,

      searchUser: "",
      selectedSystemAnalysts: [],
      selectedDevelopers: [],
      selectedImplementers: [],
      implementers: [],
      developers: [],
      systemAnalysts: [],
      selectedUsers: [],
      dialogVisible: false,
      assignProjectId: "",
      assignSystemId: "",
      assignScreenId: "",
      screenId: null,
      screen: {},
      showAssignUserDialog: false,
      showUserManagementDialog: false,
      screenUsers: [],
      deletedScreensHeaders: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due Date", value: "screen_plan_end" },
        { text: "Screen Level", value: "screen_level" },
        // Add more headers as needed
      ],
      systemIdDialog: false,
      userText: "",
      selectedSystemId: null,
      avatarFile: null,
      userOptions: [{ text: "Position: Firstname Lastname", value: "user_id" }],
      perPage: 12,
      currentPage: 1,
      itemsPerPage: 12,
      projectUsers: [],
      showUserDialog: false,
      searchprojectUser: "",
      systemUsers: [],
      paginationPageUserSystems: 1,
      itemsPerPageUserSystems: 5, // จำนวนรายการผู้ใช้ต่อหน้า
      system: {},
      showDetails: false,
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
      deletedScreens: [],
      createScreenDialog: false,
      editScreenDialog: false,
      newScreen: {
        screen_id: "",
        screen_name: "",
        screen_manday: "",
        screen_level: "Simple",
        screen_status: "Not started yet",
        screen_pic: "",
        screen_plan_start: "",
        screen_plan_end: "",
      },
      editedScreen: {
        screen_id: "",
        screen_name: "",
        screen_level: "",
      },
      screens: [],
      searchQuery: "", // Search query for filtering systems
      userScreensHeaders: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due date", value: "screen_plan_end" },
        { text: "Screen Level", value: "screen_level" },
        { text: "Image", value: "screen_pic" }, // เปลี่ยนจาก "Progress" เป็น "Picture"
        { text: "Actions", value: "actions", sortable: false },
      ],
      headers: [],
    };
  },

  props: {
    systemId: {
      type: Number,
      default: null,
    },
    projectId: {
      type: Number,
      default: null,
    },
  },

  mounted() {
    this.fetchAllScreens()
      .then(() => this.fetchAllSystems())
      .then(() => this.fetchAllProjects())
      .then(() => this.fetchSystem())
      .then(() => this.fetchScreens())
      .then(() => this.fetchSystemNameENG())
      .then(() => {
        this.fetchSystemUsers(this.systemId, this.projectId);
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  },
  created() {
    this.fetchSystemUsers(this.systemId, this.projectId);
  },

  methods: {
    isUserInScreen() {
      // ตรวจสอบว่าผู้ใช้ปัจจุบันอยู่ในหน้าจอหรือไม่
      return this.screenUsers.some((user) => user.id === this.$auth.user.id);
    },

    getProgressColor(progress) {
      if (progress >= 61 && progress <= 100) {
        return "green";
      } else if (progress >= 40 && progress <= 60) {
        return "#FC8705";
      } else if (progress >= 0 && progress <= 39) {
        return "red";
      }
      // เมื่อไม่ตรงกับเงื่อนไขใดๆ ให้คืนค่าเริ่มต้น
      return "primary";
    },
    async fetchAllScreens() {
      try {
        const response = await axios.get(
          "http://localhost:7777/screens/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching screens:", error);
        throw error;
      }
    },
    async fetchAllSystems() {
      try {
        const response = await axios.get(
          "http://localhost:7777/systems/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
        throw error;
      }
    },
    async fetchAllProjects() {
      try {
        const response = await axios.get(
          "http://localhost:7777/projects/getAll"
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
    },
    filteredScreensByStatus(status) {
      if (status === "All") {
        return this.filteredScreens;
      } else {
        return this.filteredScreens.filter(
          (screen) => screen.screen_status === status
        );
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const formattedDate = `${day.toString().padStart(2, "0")}/${month
        .toString()
        .padStart(2, "0")}/${year}`;
      return formattedDate;
    },
    filteredScreenUsers() {
      // กรองผู้ใช้โดยใช้คำค้นหา
      return this.screenUsers.filter(
        (user) =>
          user.user_firstname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_lastname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_position
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_department
            .toLowerCase()
            .includes(this.searchUser.toLowerCase())
      );
    },
    changePageUserScreen(page) {
      this.paginationPageUserScreen = page;
    },
    filteredUsers(position) {
      return this.filteredUserList(position);
    }, // ฟังก์ชันที่ใช้ในการเลือกผู้ใช้ทั้งหมดในตำแหน่งนั้นๆ

    selectAllDevelopers() {
      this.selectedDevelopers = this.filteredUsers("Developer").map(
        (user) => user.id
      );
    },
    selectAllImplementers() {
      this.selectedImplementers = this.filteredUsers("Implementer").map(
        (user) => user.id
      );
    },
    selectAllSystemAnalysts() {
      const users = this.filteredUsers("System Analyst");
      this.selectedSystemAnalysts = users.map((user) => user.id);
    },

    async createScreen() {
      const systemId = this.$route.params.id;

      try {
        // Validate form fields
        const valid = await this.$refs.screenForm.validate();
        if (!valid) {
          // If form is not valid, return early
          return;
        }

        // Check if an avatar file is selected
        let base64Image = null;
        if (this.avatarFile) {
          base64Image = await this.imageToBase64(this.avatarFile);
        }

        // Fetch system data to get project_id
        const systemResponse = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system data");
        }

        const systemData = await systemResponse.json();
        const projectId = systemData.project_id;

        // Prepare data to send
        const requestData = {
          screen_id: this.newScreen.screen_id,
          screen_name: this.newScreen.screen_name,
          screen_status: this.newScreen.screen_status,
          screen_level: this.newScreen.screen_level,
          screen_pic: base64Image,
          system_id: systemId,
          screen_progress: 0,
          screen_plan_start: this.newScreen.screen_plan_start || null,
          screen_plan_end: this.newScreen.screen_plan_end || null,
          project_id: projectId,
          assignedUsers: [
            // Use selected users for each position
            ...this.selectedSystemAnalysts,
            ...this.selectedDevelopers,
            ...this.selectedImplementers,
          ],
        };

        // Make the request to create a new screen
        const response = await fetch(
          `http://localhost:7777/screens/createScreen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        // Check if the screen was created successfully
        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Screen Created!",
            text: "The new screen has been created successfully.",
            timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
          });

          // Reset the form
          this.$refs.screenForm.reset();
        } else {
          throw new Error("Failed to create screen");
        }
        this.fetchScreens();
        this.fetchSystemNameENG();
        this.fetchSystem();
      } catch (error) {
        console.error("Error creating screen", error);

        // Show error message using SweetAlert2
        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error.message || "Failed to create the screen. Please try again.",
          timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
        });
      }
    },

    changePageUserSystems(page) {
      this.paginationPageUserSystems = page;
    },

    deleteUser(userId) {
      const { systemId, projectId, screenId } = this; // สมมติว่าคุณมีตัวแปรเหล่านี้ใน Vue instance อยู่แล้ว
      // เรียกใช้ SweetAlert2 เพื่อแสดงกล่องข้อความแจ้งเตือน
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#009933",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // หากผู้ใช้กดปุ่ม "ใช่, ลบ!" ให้ทำการลบผู้ใช้
          try {
            fetch(
              `http://localhost:7777/user_screens/deleteUserScreen/${systemId}/${projectId}/${screenId}/${userId}`,
              {
                method: "DELETE",
              }
            )
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to delete user");
                }
                // ลบผู้ใช้ออกจากอาร์เรย์ screenUsers
                this.screenUsers = this.screenUsers.filter(
                  (user) => user.id !== userId
                );
                console.log("User deleted successfully.");
              })
              .catch((error) => {
                console.error("Error deleting user:", error);
                // จัดการข้อผิดพลาดการลบผู้ใช้
              });
          } catch (error) {
            console.error("Error deleting user:", error);
            // จัดการข้อผิดพลาดการลบผู้ใช้
          }
        }
      });
    },
    async assignCurrentUserToScreen() {
      const { projectId, systemId, screenId } = this;

      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/takeScreen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: this.$auth.user.id, // ใช้ ID ของผู้ใช้ที่เข้าสู่ระบบ
              screen_id: screenId,
              system_id: systemId,
              project_id: projectId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to take screen");
        }

        // แสดง SweetAlert2 เมื่อทำการกำหนดหน้าจอสำเร็จ
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen taken successfully!",
          confirmButtonColor: "#009933",
        });
        // Refresh ตารางผู้ใช้หลังจาก Assign User เสร็จสิ้น
        await this.getUserScreenManagement(projectId, systemId, screenId);

        // รีเซ็ตฟอร์มหลังจากกำหนดหน้าจอเสร็จสิ้น
        this.resetForm();
      } catch (error) {
        console.error("Error assigning current user to screen:", error);
        // จัดการข้อผิดพลาดที่เกิดขึ้น
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to take screen",
        });
      }
    },

    async assignUsersToScreen() {
      const { assignProjectId, assignSystemId, assignScreenId, selectedUsers } =
        this;

      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/createUser_screen`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: selectedUsers,
              screen_id: assignScreenId,
              system_id: assignSystemId,
              project_id: assignProjectId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to assign users to screen");
        }

        // ปิด Dialog หลังจากทำงานเสร็จสิ้น
        this.closeAssignUserDialog();

        // แสดง SweetAlert2 หลังจากการทำงานเสร็จสิ้น
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Users assigned to screen successfully!",
          confirmButtonColor: "#009933",
        });

        // Refresh ตารางผู้ใช้หลังจาก Assign User เสร็จสิ้น
        await this.getUserScreenManagement(
          assignProjectId,
          assignSystemId,
          assignScreenId
        );

        // รีเซ็ตฟอร์มหลังจากทำการ Assign User เสร็จสิ้น
        this.resetForm();
      } catch (error) {
        console.error("Error assigning users to screen:", error);
        // จัดการข้อผิดพลาดที่เกิดขึ้น
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to assign users to screen",
        });
      }
    },
    resetForm() {
      // รีเซ็ตค่าที่ถูกเลือกหรือป้อนเข้ามาในฟอร์มกลับไปยังค่าเริ่มต้น
      this.assignProjectId = ""; // รีเซ็ต projectId
      this.assignSystemId = ""; // รีเซ็ต systemId
      this.assignScreenId = ""; // รีเซ็ต screenId
      this.selectedUsers = []; // รีเซ็ต selectedUsers
    },

    openAssignUserDialog(projectId, systemId, screenId) {
      // เรียกใช้งาน assignUser ที่นี่หลังจากกำหนดค่า projectId, systemId, screenId
      this.assignProjectId = projectId;
      this.assignSystemId = systemId;
      this.assignScreenId = screenId;
      this.fetchUsersNOTINScreen(); // เรียกใช้งาน assignUser ที่นี่
      this.dialogVisible = true;
    },

    closeAssignUserDialog() {
      this.dialogVisible = false;
    },

    async fetchUsersNOTINScreen() {
      const projectId = this.assignProjectId;
      const systemId = this.assignSystemId;
      const screenId = this.assignScreenId;

      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersNOTINScreen/${projectId}/${systemId}/${screenId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users data");
        }

        const users = await response.json();

        // สร้าง options สำหรับ v-select แยกตามตำแหน่งผู้ใช้
        this.implementers = users
          .filter((user) => user.user_position === "Implementer")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));

        this.developers = users
          .filter((user) => user.user_position === "Developer")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));

        this.systemAnalysts = users
          .filter((user) => user.user_position === "System Analyst")
          .map((user) => ({
            text: `${user.user_firstname} ${user.user_lastname}`,
            value: user.id,
          }));
      } catch (error) {
        console.error("Error fetching users data:", error);
        // จัดการข้อผิดพลาดการดึงข้อมูลผู้ใช้
      }
    },

    async getUserScreenManagement(projectId, systemId, screenId) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${projectId}/${systemId}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();

        this.screenUsers = users; // เซ็ตค่าข้อมูลผู้ใช้ที่ดึงมาให้กับตัวแปร screenUsers
        this.showUserManagementDialog = true; // เปิด Dialog เมื่อข้อมูลถูกดึงมาสำเร็จ
        // ไม่เรียกใช้ this.assignUser(projectId, systemId, screenId);
        this.projectId = projectId; // ส่ง projectId ไปยังตัวแปรของคอมโพเนนต์
        this.systemId = systemId; // ส่ง systemId ไปยังตัวแปรของคอมโพเนนต์
        this.screenId = screenId; // ส่ง screenId ไปยังตัวแปรของคอมโพเนนต์
      } catch (error) {
        console.error("Error fetching user screen management data:", error);
        // Handle error fetching user screen management data
      }
    },

    async fetchDeletedScreensBySystemId() {
      try {
        const systemId = this.systemId; // Get the systemId from the props
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens by system ID");
        }
        const deletedScreens = await response.json();
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screens by system ID:", error);
      }
    },

    async showSystemIdDialog() {
      this.systemIdDialog = true;
      await this.fetchDeletedScreensBySystemId(); // Fetch deleted screens when opening the dialog
    },

    closeSystemIdDialog() {
      this.systemIdDialog = false;
    },

    async imageToBase64(imageFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Skip metadata and extract base64 data
          resolve(base64String);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(imageFile); // Read file as base64
      });
    },

    getBase64Image(base64Data) {
      return "data:image/jpeg;base64," + base64Data;
    },

    onPageChange(newPage) {
      this.currentPage = newPage;
    },

    async fetchSystemUsers(systemId, projectId) {
      try {
        // เรียกข้อมูลผู้ใช้จาก API โดยใช้ systemId และ projectId
        const response = await fetch(
          `http://localhost:7777/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system users");
        }
        const users = await response.json();
        // แปลงข้อมูลผู้ใช้เป็นรูปแบบที่ต้องการและกำหนดให้กับตัวแปร systemUsers
        this.systemUsers = users.map((user) => ({
          user_pic: user.user_pic,
          user_position: user.user_position,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname,
          user_department: user.user_department,
          id: user.id,
          userText: `${user.user_position}: ${user.user_firstname} ${user.user_lastname}`,
        }));
      } catch (error) {
        console.error("Error fetching system users:", error);
        // กรณีเกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ กำหนดให้ systemUsers เป็น array ว่าง
        this.systemUsers = [];
      }
    },

    async fetchSystem() {
      const systemId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system data");
        }
        const systemData = await response.json();
        this.system = systemData;
        this.projectId = systemData.project_id;
        this.systemId = systemData.id;

        if (this.systemId !== null && this.projectId !== null) {
          const userOptions = await this.fetchSystemUsers(
            this.systemId,
            this.projectId
          );
          this.userOptions = userOptions;
        }
      } catch (error) {
        console.error("Error fetching system data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch system data. Please try again.",
          timer: 3000,
        });
      }
    },

    async fetchSystemNameENG() {
      try {
        const systemId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system");
        }
        const systemData = await response.json();

        this.systemNameENG = systemData.system_nameEN; // ใส่ชื่อ field ที่ต้องการแสดง

        console.log(systemData.system_plan_start);
      } catch (error) {
        console.error("Error fetching system:", error);
        // Handle error fetching Screen
      }
    },

    async goToScreensDetail(screenId) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();

        if (
          users.some((user) => user.id === this.$auth.user.id) ||
          this.$auth.user.user_role === "Admin"
        ) {
          // ตรวจสอบว่า this.$auth.user.id อยู่ใน users หรือเป็น "Admin" หรือไม่
          // ถ้าใช่ให้ทำการเปลี่ยนหน้าไปยังรายละเอียดของหน้าจอ
          await this.$router.push({
            path: `/Project/Systems/screens/${screenId}`,
          });
        } else {
          console.log("User does not have access to this screen");
          // หากไม่มีสิทธิ์เข้าถึงหน้าจอ สามารถเพิ่มการจัดการตามความเหมาะสมที่นี่
        }
      } catch (error) {
        console.error("Error fetching user screen management data:", error);
        // Handle error fetching user screen management data
      }
    },

    async goToReportDetail(screenId) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();

        if (
          users.some((user) => user.id === this.$auth.user.id) ||
          this.$auth.user.user_role === "Admin"
        ) {
          // ตรวจสอบว่า this.$auth.user.id อยู่ใน users หรือเป็น "Admin" หรือไม่
          // ถ้าใช่ให้ทำการเปลี่ยนหน้าไปยังรายละเอียดของหน้าจอ
          await this.$router.push({
            path: `/Project/Systems/Report/${screenId}`,
          });
        } else {
          console.log("User does not have access to this screen");
          // หากไม่มีสิทธิ์เข้าถึงหน้าจอ สามารถเพิ่มการจัดการตามความเหมาะสมที่นี่
        }
      } catch (error) {
        console.error("Error fetching user screen management data:", error);
        // Handle error fetching user screen management data
      }
    },

    async updateScreen() {
      try {
        const requestData = { ...this.editScreen };
        if (this.editScreen.screen_pic instanceof File) {
          // Check if screen_pic is a file
          const file = this.editScreen.screen_pic;
          const base64Image = await this.convertFileToBase64(file);
          requestData.screen_pic = base64Image;
        }

        const response = await fetch(
          `http://localhost:7777/screens/updateScreen/${this.editScreen.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update screen");
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen updated successfully",
          confirmButtonColor: "#009933",
        });

        this.editScreenDialog = false;
        this.fetchScreens();
      } catch (error) {
        console.error("Error updating screen:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
        });
      }
    },
    async onFileChange(file) {
      try {
        if (file && file instanceof File) {
          // Store the selected file in editScreen
          this.editScreen.screen_pic = file;
          // Preview the selected image
          this.previewImage(file);
        }
      } catch (error) {
        console.error("Error processing file:", error);
      }
    },
    async convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });
    },

    async imageToBase64Edit(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },

    async openEditDialog(screen) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${screen.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();
        if (
          users.some((user) => user.id === this.$auth.user.id) ||
          this.$auth.user.user_role === "Admin"
        ) {
          // ตรวจสอบว่า this.$auth.user.id อยู่ใน users หรือไม่
          // ถ้าใช่ให้เปิดไดอะล็อกแก้ไขหน้าจอ
          this.editScreen = { ...screen }; // เซ็ตค่าหน้าจอที่จะแก้ไข
          this.editScreenDialog = true; // เปิดไดอะล็อกแก้ไขหน้าจอ
          this.userHasAccess = true; // กำหนดว่าผู้ใช้มีสิทธิ์ในการแก้ไขหน้าจอ
        } else {
          // หากไม่มีสิทธิ์แก้ไขหน้าจอ แจ้งเตือนผู้ใช้
          await Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You do not have permission to edit this screen",
            confirmButtonColor: "#009933",
          });
          this.userHasAccess = false; // กำหนดว่าผู้ใช้ไม่มีสิทธิ์ในการแก้ไขหน้าจอ
        }
      } catch (error) {
        console.error("Error fetching user screen management data:", error);
        // Handle error fetching user screen management data
      }
    },

    async softDeleteScreen(screen) {
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
          const response = await fetch(
            `http://localhost:7777/screens/delete/${screen.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete screen");
          }

          await Swal.fire({
            title: "Success",
            text: "Screen deleted successfully.",
            icon: "success",
            confirmButtonColor: "#009933",
          });

          this.fetchScreens();
          this.fetchSystemNameENG();
          this.fetchSystem();
        }
      } catch (error) {
        console.error("Error deleting screen:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the screen deletion process.",
          "error"
        );
      }
    },

    async goToCreateScreen() {
      // Open the create system dialog first
      this.createScreenDialog = true;
    },

    async saveEditedScreen() {
      try {
        const response = await fetch(
          `http://localhost:7777/screens/updateScreen/${this.editedScreen.screen_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              screen_id: this.editedScreen.screen_id,
              screen_name: this.editedScreen.screen_name,
              screen_level: this.editedScreen.screen_level,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update screen");
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "screen updated successfully",
        });

        this.$router.go();
      } catch (error) {
        console.error("Error updating screen:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
        });
      }
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

      this.greeting = this.getGreeting(now);
      this.currentDateTime = now.toLocaleDateString("en-US", options);
    },

    getGreeting(date) {
      const hour = date.getHours();

      if (hour >= 0 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    },

    async confirmDeleteScreenHistory(item) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${item}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();
        if (
          users.some((user) => user.id === this.$auth.user.id) ||
          this.$auth.user.user_role === "Admin"
        ) {
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
            const deleteResponse = await fetch(
              `http://localhost:7777/screens/deleteHistoryScreen/${item}`,
              {
                method: "DELETE",
              }
            );

            if (!deleteResponse.ok) {
              throw new Error("Failed to delete screen");
            }

            await Swal.fire({
              title: "Success",
              text: "Screen deleted successfully.",
              icon: "success",
              confirmButtonColor: "#009933",
            });

            // Refresh the deleted screens data
            this.fetchDeletedScreens();
          }
        } else {
          console.log("User does not have access to delete this screen");
          // หากไม่มีสิทธิ์ลบหน้าจอ แจ้งเตือนผู้ใช้
          await Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You do not have permission to delete this screen",
          });
        }
      } catch (error) {
        console.error("Error deleting screen:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred during the screen deletion process.",
        });
      }
    },

    async restoreSelectedScreen() {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore the selected screens.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore them!",
        });

        if (confirmResult.isConfirmed) {
          const restorePromises = this.selectedDeletedScreens.map(
            async (screen) => {
              const response = await fetch(
                `http://localhost:7777/screens/updateScreen/${screen.id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    screen_name: screen.screen_name,
                    screen_id: screen.screen_id,
                    is_deleted: 0,
                  }),
                }
              );

              if (!response.ok) {
                throw new Error("Failed to restore screen");
              }

              console.log("Screen restored successfully");
              return screen.id;
            }
          );

          await Promise.all(restorePromises);

          await Swal.fire({
            title: "Success",
            text: "Selected screens restored successfully.",
            icon: "success",
            confirmButtonColor: "#009933",
          });

          this.fetchDeletedScreens();
          this.fetchScreens();
          this.fetchSystemNameENG();
          this.fetchSystem();
        }
      } catch (error) {
        console.error("Error restoring screens:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the screens restoration process.",
          "error"
        );
      }
    },
    async deleteSelectedHistoryScreen() {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete them!",
        });

        if (confirmResult.isConfirmed) {
          const deletePromises = this.selectedDeletedScreens.map(
            async (screen) => {
              const response = await fetch(
                `http://localhost:7777/screens/deleteHistoryScreen/${screen.id}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error("Failed to delete screen");
              }

              return screen.id;
            }
          );

          await Promise.all(deletePromises);

          await Swal.fire(
            "Success",
            "Selected screens deleted successfully.",
            "success"
          );

          this.fetchDeletedScreens();
        }
      } catch (error) {
        console.error("Error deleting screens:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the screens deletion process.",
          "error"
        );
      }
    },

    async fetchDeletedScreens() {
      try {
        const systemId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }
        const deletedScreens = await response.json();
        console.log(deletedScreens); // ตรวจสอบ deleted Screens ที่ได้รับมา
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screen:", error);
        // Handle error fetching deleted screen
      }
    },

    async fetchScreens() {
      const systemId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId/${systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screens");
        }

        const screens = await response.json();
        this.screens = screens;
        // ใช้ค่า id ของหน้าจอที่กำลังวน loop มาเพื่อกำหนดค่าให้กับ screenId
        if (screens.length > 0) {
          this.screenId = screens[0].id; // เลือกหน้าจอแรกในรายการเป็นตัวอย่าง
        }
      } catch (error) {
        console.error("Error fetching screens:", error);
      }
    },

    async editScreen(screen) {
      // Set the edited system to the selected system
      this.editedScreen = { ...screen };
      // Open the edit system dialog
      this.editScreenDialog = true;
    },
    async confirmDeleteScreen(screen) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${screen.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user screen management data");
        }
        const users = await response.json();
        if (
          users.some((user) => user.id === this.$auth.user.id) ||
          this.$auth.user.user_role === "Admin"
        ) {
          // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการแก้ไขหน้าจอหรือไม่
          const confirmResult = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#009933",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            showClass: {
              popup: "animate__animated animate__fadeInDown", // กำหนด animation เมื่อแสดง SweetAlert
            },
            hideClass: {
              popup: "animate__animated animate__fadeOutUp", // กำหนด animation เมื่อซ่อน SweetAlert
            },
          });
          if (confirmResult.isConfirmed) {
            // ถ้าผู้ใช้ยืนยันการลบ ให้เรียกเมธอด deleteScreen
            await this.deleteScreen(screen);
            // อัพเดทข้อมูลโดยอัตโนมัติหลังจากลบข้อมูล
          }
          this.fetchScreens();
          this.fetchSystemNameENG();
          this.fetchSystem();
        } else {
          // หากผู้ใช้ไม่มีสิทธิ์ในการแก้ไขหน้าจอ แจ้งเตือนผู้ใช้
          await Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You do not have permission to delete this screen",
          });
        }
      } catch (error) {
        console.error("Error confirming delete screen:", error);
      }
    },

    async deleteScreen(screen) {
      const screenId = screen.id;
      try {
        // Send a DELETE request to the API to delete the screen
        const response = await fetch(
          `http://localhost:7777/screens/delete/${screenId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete screen");
        }
        // If deletion is successful, show success message and update screen data
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen deleted successfully",
          confirmButtonColor: "#009933",
        });
        this.fetchDeletedScreens(); // Refresh the deleted screens data
      } catch (error) {
        console.error("Error deleting screen:", error);
        // If an error occurs during deletion, show error message
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete screen",
        });
      }
    },
  },
  computed: {
    paginatedScreenUsers() {
      const start =
        (this.paginationPageUserScreen - 1) * this.itemsPerPageUserScreen;
      const end = start + this.itemsPerPageUserScreen;
      return this.filteredScreenUsers().slice(start, end);
    },
    totalPagesUserScreen() {
      return Math.ceil(
        this.filteredScreenUsers().length / this.itemsPerPageUserScreen
      );
    },

    filteredUserList() {
      return (position) =>
        this.systemUsers.filter((user) => user.user_position === position);
    },
    filteredsearchprojectUser() {
      const startIndex =
        (this.paginationPageUserSystems - 1) * this.itemsPerPageUserSystems;
      const endIndex = startIndex + this.itemsPerPageUserSystems;
      return this.systemUsers
        .filter((user) => {
          return (
            user.user_firstname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_lastname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_position
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_department
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase())
          );
        })
        .slice(startIndex, endIndex);
    },
    totalPagesUserSystems() {
      return Math.ceil(
        this.systemUsers.filter((user) => {
          return (
            user.user_firstname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_lastname
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_position
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase()) ||
            user.user_department
              .toLowerCase()
              .includes(this.searchprojectUser.toLowerCase())
          );
        }).length / this.itemsPerPageUserSystems
      );
    },
    paginatedScreens() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredScreens.slice(startIndex, endIndex);
    },
    filteredScreens() {
      return this.screens.filter((screen) => {
        const searchText = this.searchQuery.toLowerCase();
        return (
          screen.screen_id.toLowerCase().includes(searchText) ||
          screen.screen_name.toLowerCase().includes(searchText)
        );
      });
    },
  },
};
</script>

<style scoped>
.full-width {
  display: flex;
  flex-wrap: wrap;
}
.custom-btn {
  width: 100%;
  height: 50%;
}

.card-title {
  padding: 1.4px;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: grid; /* เปลี่ยนเป็น grid layout */
  place-items: center; /* ให้อยู่ตรงกลางทั้งแนวนอนและแนวตั้ง */
}

.title-text {
  width: 100%; /* กำหนดความกว้างของตัวหนังสือให้เท่ากับความกว้างของพื้นที่ในการแสดงรูปภาพ */
  text-align: center; /* จัดตำแหน่งตัวหนังสือให้อยู่กลาง */
}
.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>