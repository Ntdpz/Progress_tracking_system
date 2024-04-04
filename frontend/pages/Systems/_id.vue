<template>
  <div class="screen-details">

    <!--data table -->
    <v-data-table :headers="headers" :items="filteredScreens" :items-per-page="5" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Screen Management - System : {{ systemNameENG }}</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
        </v-toolbar>

        <!-- Search bar -->
        <v-row no-gutters justify-content="flex-end" align-items="flex-end">
          <v-col cols="12" class="text-center">
            <input type="text" v-model="searchQuery" placeholder="Search..." style="
      margin-bottom: 10px;
      width: 70%; 
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
    " />

            <v-btn color="primary" class="text-none mb-4" @click="goToCreateScreen"
              style="margin-left: 50px; width: 10%; height: 70%">
              Create Screen
            </v-btn>
            <v-btn color="error" @click="showSystemIdDialog" style="margin-left: 10px; width: 10%; height: 70%"
              class="text-none mb-4">
              <v-icon>mdi-delete</v-icon> &nbsp;Bin
            </v-btn>
          </v-col>
        </v-row>


        <!-- Create Screen Dialog -->
        <v-dialog v-model="createScreenDialog" max-width="600" ref="createScreenDialog">
          <v-card>
            <v-card-title>Create New Screen</v-card-title>
            <v-card-text>
              <!-- Form to create a new screen -->
              <v-form ref="screenForm" @submit.prevent="createScreen()">
                <v-text-field v-model="newScreen.screen_id" :rules="[(v) => !!v || 'Screen ID is required']" label="Screen ID"></v-text-field>
                <v-text-field v-model="newScreen.screen_name" :rules="[(v) => !!v || 'Screen Name is required']" label="Screen Name"></v-text-field>             

                <!-- File input for photo -->
               <!-- <v-file-input
              accept="image/png, image/jpeg, image/bmp"
              label="Select screen image"
              placeholder="Select screen image"
              prepend-icon="mdi-camera"
              v-model="avatarFile"
            ></v-file-input> -->

                  <!-- New field for selecting users -->
            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('Implementer')"
              label="Select Implementer"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('Developer')"
              label="Select Developer"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

            <v-select
              v-model="newScreen.selectedUsers"
              :items="filteredUsers('System Analyst')"
              label="Select System Analyst"
              item-value="id"
              item-text="userText"
              multiple
            ></v-select>

                <v-btn type="submit">Create</v-btn>
                <v-btn @click="createScreenDialog = false">Cancel</v-btn>
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
                <v-text-field v-model="editScreen.screen_id" label="Screen ID" readonly></v-text-field>
                <v-text-field v-model="editScreen.screen_name" label="Screen Name"></v-text-field>
                <v-select v-model="editScreen.screen_level" label="Screen Level" :items="[
                  'Very Difficult','Hard','Moderate','Easy', 'Simple', ]"></v-select>
                <v-text-field v-model="editScreen.screen_pic" label="Screen Picture" readonly></v-text-field>

                <!-- File input for photo -->
                <v-file-input accept="image/png, image/jpeg, image/bmp" label="New Picture"
                  placeholder="Select a picture" prepend-icon="mdi-camera" v-model="editScreen.photo">
                </v-file-input>

                <!-- Display current photo -->
                <v-img v-if="editScreen.photo" :src="editScreen.photo" height="100" contain></v-img>

                <v-btn type="submit" @click="updateScreen">Update</v-btn>
                <v-btn @click="editScreenDialog = false">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        
      </template>

      <!-- Data Rows -->
      <template v-slot:item="{ screen }">
        <tr>
          <td>{{ item.screen_id }}</td>
          <td>{{ item.screen_name }}</td>
          <td>{{ item.screen_task_count }}</td>
          <td>{{ formattedScreensPlanStart(item.screen_plan_start) }}</td>
          <td>{{ formattedScreenPlanEnd(item.screen_plan_end) }}</td>
          <td>{{ item.screen_man_day }}</td>
          <td>{{ item.screen_level }}</td>
          
          <td>
            <!-- Dropdown menu for other actions -->
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon size="20" px>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <!-- Edit action -->
                <v-list-item @click="getUserScreenManagement(projectId, systemId, screen.id)">
                  <v-list-item-content>Assign</v-list-item-content>
                </v-list-item>
                <v-list-item @click="openEditDialog(screen)">
                  <v-list-item-content>Edit</v-list-item-content>
                </v-list-item>
                <!-- Delete action -->
                <v-list-item @click="confirmDeleteScreen(item)">
                  <v-list-item-content class="red--text">Delete</v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
            <!-- Icon for "Manage User Projects" -->
            <v-btn @click="goToScreensDetail(screen.id)" icon>
              <v-icon>mdi-menu-right</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

           <!-- Dialog for displaying SystemId -->
    <v-dialog v-model="systemIdDialog" max-width="800">
      <v-card>
        <v-card-title>System ID: {{ systemId }}</v-card-title>
        <v-list>
          <v-list-item-group>
            <v-list-item v-for="(screen, index) in deletedScreens" :key="index">
              <v-list-item-content>
                <v-list-item-title>{{ screen.screen_id }}</v-list-item-title>
                <v-list-item-subtitle>{{
                  screen.screen_name
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  screen.screen_plan_end
                }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{
                  screen.screen_level
                }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-avatar>
                <v-img
                  :src="getBase64Image(screen.screen_pic)"
                  height="50"
                  contain
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-action>
                <v-btn icon @click="confirmDeleteScreenHistory(screen.id)">
                  <v-icon color="red darken-2">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="restoreScreen(screen.id)">
                  <v-icon color="green darken-2">mdi-restore</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-card-actions>
          <v-btn color="primary" @click="closeSystemIdDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Screen Managementdialog -->
    <v-dialog v-model="showUserManagementDialog" max-width="600">
      <v-card>
        <v-card-title> User Screen Management </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(user, index) in screenUsers" :key="user.id">
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
              <!-- ปุ่มลบ -->
              <v-list-item-action>
                <v-btn icon @click="deleteUser(user.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showUserManagementDialog = false"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="
              openAssignUserDialog(projectId, systemId, screenId), assignUser
            "
            >Assign User</v-btn
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
          <v-btn color="primary" @click="closeAssignUserDialog">Close</v-btn>
          <v-btn color="primary" @click="assignUsersToScreen"
            >Assign User</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "SystemDetails",
  layout: "admin",
  data() {
    return {
      implementers: [],
      developers: [],
      systemAnalysts: [],
      selectedUsers: [],
      assignProjectId: "",
      assignSystemId: "",
      assignScreenId: "",
      screenId: null,
      dialogVisible: false,
      userOptions: [{ text: "Position: Firstname Lastname", value: "user_id" }],
      showAssignUserDialog: false,
      showUserManagementDialog: false,
      systemUsers: [],
      screenUsers: [],
      projectUsers: [],
      screen: {},
      system: {},
      searchprojectUser: "",
      userText: "",
      systemIdDialog: false,

      selectedSystemId: null,
      screenItems: [],
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
      showHistoryDialog: false,
      deletedScreens: [],
      createScreenDialog: false,
      editScreenDialog: false,
      formattedPlanStart: "",
      formattedPlanEnd: "",
      avatarFile: null,
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
      editScreen: {
        screen_id: "",
        screen_name: "",
        screen_type: "",
        screen_level: "",
        photo: null,
      },
      screens: [],
      searchQuery: "", // Search query for filtering systems
     
      headers: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Task Count", value: "screen_task_count" },
        { text: "Plan Start", value: "screen_plan_start" },
        { text: "Plan End", value: "screen_plan_end" },
        { text: "Manday", value: "screen_manday" },
        // { text: "Screen type", value: "screen_type" },
        { text: "Screen Level", value: "screen_level" },
        { text: "Actions", value: "actions", sortable: false },
      ],

     
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
    this.fetchSystem();
    this.fetchScreens(); // Fetch system details on component mount
    this.fetchSystemNameENG();
    this.fetchSystemUsers(this.systemId, this.projectId);
  },
  methods: {

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

  deleteUser(userId) {
      const { systemId, projectId, screenId } = this; // สมมติว่าคุณมีตัวแปรเหล่านี้ใน Vue instance อยู่แล้ว
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

        // ดำเนินการอื่นๆ หลังจากสำเร็จ

        // ปิด Dialog หลังจากทำงานเสร็จสิ้น
        this.closeAssignUserDialog();
      } catch (error) {
        console.error("Error assigning users to screen:", error);
        // จัดการข้อผิดพลาดที่เกิดขึ้น
      }
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
      console.log(screenId);
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
        console.log(users); // ตรวจสอบข้อมูลผู้ใช้ที่ได้รับมา
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
    filteredUsers(position) {
      return this.systemUsers.filter((user) => user.user_position === position);
    },

    async fetchSystemUsers(systemId, projectId) {
      try {
        // Check if systemId and projectId are not null
        if (systemId === null || projectId === null) {
          throw new Error("System ID or Project ID is null");
        }

        const response = await fetch(
          `http://localhost:7777/user_systems/getUserBySystemAndProject/${systemId}/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch system users");
        }
        const users = await response.json();
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
        this.systemUsers = [];
      }
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
          assignedUsers: this.newScreen.selectedUsers,
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
         
        });
      }
    },

    getBase64Image(base64Data) {
      return "data:image/jpeg;base64," + base64Data;
    },
    
    


    async restoreScreen(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore this screen.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/screens/updateScreen/${item}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                screen_name: item.screen_name,
                screen_id: item.screen_id,
                is_deleted: 0,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to restore screen");
          }

          console.log("Screeb restored successfully");

          await Swal.fire(
            "Success",
            "Screen restored successfully.",
            "success"
          );
        }
        this.fetchDeletedScreens();
        this.fetchScreens();
      } catch (error) {
        console.error("Error restoring screen:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the screen restoration process.",
          "error"
        );
      }
    },

    async confirmDeleteScreenHistory(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/screens/deleteHistoryScreen/${item}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete screen");
          }

          console.log("Screen deleted successfully");

          await Swal.fire("Success", "Screen deleted successfully.", "success");

          // Refresh the deleted screens data
          this.fetchDeletedScreens();
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

    // Function to convert image to Base64
    imageToBase64(imagePath) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imagePath);

        reader.onload = () => {
          const base64String = reader.result.split(",")[1]; // Exclude the data:imasge/<fileType>;base64, prefix
          resolve(base64String);
        };

        reader.onerror = (error) => {
          reject(error);
        };
      });
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
        console.log(systemData); // ตรวจสอบข้อมูลที่ได้รับมา
        this.systemNameENG = systemData.system_nameEN; // ใส่ชื่อ field ที่ต้องการแสดง
      } catch (error) {
        console.error("Error fetching system:", error);
        // Handle error fetching Screen
      }
    },

    async goToScreensDetail(screenId) {
      await this.$router.push({ path: `/screens/${screenId}` });
    },

    async updateScreen() {
      try {
        // Prepare the data to send
        const requestData = {
          screen_id: this.editScreen.screen_id,
          screen_name: this.editScreen.screen_name,
          screen_level: this.editScreen.screen_level,
          screen_pic: "", // Initialize as an empty string to prepare for base64
          photo: this.editScreen.photo, // Edit photo data
        };

        // Check if a new image is selected
        if (this.newScreenPic) {
          // Convert the image to base64
          const base64Image = await this.imageToBase64(this.newScreenPic);
          // Set screen_pic to the base64 of the image
          requestData.screen_pic = base64Image;
        }

        // Make the request to update the screen
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

        // Check if the screen was updated successfully
        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Screen updated successfully",
          });
          this.editScreenDialog = false;
          this.fetchScreens(); // Fetch the updated screen data
        } else {
          throw new Error("Failed to update screen");
        }
      } catch (error) {
        console.error("Error updating screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message, // Display the specific error message
        });
      }
    },

    goToScreensDetails(screen) {
      this.$router.push({
        path: `/Screen/${screen.id}`,
        params: { selectedScreen: screen },
      });
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

    openEditDialog(screen) {
      this.editScreen = { ...screen };
      this.editScreenDialog = true;
    },

    async softDeleteScreen(screen) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
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

          console.log("Screen deleted successfully");

          await Swal.fire("Success", "Screen deleted successfully.", "success");

          this.fetchScreens();
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

    async goToCreateScreen() {  // Open the create system dialog first
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
              photo: this.editScreen.photo, // Edit photo data
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update screen");
        }

        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Screen updated successfully",
        });

        // Assuming you want to refresh the page after successful update
        
      } catch (error) {
        console.error("Error updating screen:", error);

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
        });
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
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to delete this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
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
          // If user confirms deletion, call deleteScreen method

          await this.deleteScreen(screen); // อัพเดทข้อมูลโดยอัตโนมัติหลังจากลบข้อมูล

          this.fetchScreens();
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

    async fetchScreenPhoto(screenId) {
      try {
        const response = await fetch(`http://localhost:7777/screens/getScreenPhoto/${screenId}`);
        const data = await response.json();
        return data.photoUrl; // แปลงให้อยู่ในรูปแบบ URL ของรูปภาพ
      } catch (error) {
        console.error('Error fetching screen photo:', error);
        return null;
      }
    },

  },

  computed: {

    filteredScreens() {
      return this.screens.filter((screen) => {
        const searchText = this.searchQuery.toLowerCase();
        return (
          screen.screen_id.toLowerCase().includes(searchText) ||
          screen.screen_name.toLowerCase().includes(searchText)
        );
      });
    },

    formattedScreensPlanStart() {
      return function (screenPlanStart) {
        if (!screenPlanStart) return ""; // Check if planStart date is defined
        const date = new Date(screenPlanStart); // Create a Date object from planStart
        const day = date.getDate(); // Get the day of the month
        const month = date.getMonth() + 1; // Get the month (0-indexed, hence +1)
        const year = date.getFullYear(); // Get the full year
        // Format the date as "day/month/year"
        return `${day}/${month}/${year}`;
      };
    },

    // Compute the formatted planEnd date
    formattedScreenPlanEnd() {
      return function (screenPlanEnd) {
        if (!screenPlanEnd) return ""; // Check if planStart date is defined
        const date = new Date(screenPlanEnd); // Create a Date object from planStart
        const day = date.getDate(); // Get the day of the month
        const month = date.getMonth() + 1; // Get the month (0-indexed, hence +1)
        const year = date.getFullYear(); // Get the full year
        // Format the date as "day/month/year"
        return `${day}/${month}/${year}`;
      };
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
  },
};
</script>

<style>
.actions-column {
  text-align: left;
}

/* CSS for the table */
.system-details {
  overflow-x: auto;
  /* Add horizontal scrollbar if table overflows */
}

/* Set width for each column */
.screen-details td,
.screen-details th {
  min-width: 120px;
  /* Adjust width as needed */
  max-width: 120px;
  /* Adjust width as needed */
  word-wrap: break-word;
  /* Allow long text to wrap */
}

/* CSS for the image */
.screen-details img {
  width: 50px;
  /* Adjust width of the image */
  height: auto;
  /* Maintain aspect ratio */
  display: block;
  /* Make sure image is displayed as a block element */
  margin: auto;
  /* Center the image horizontally */
}
</style>