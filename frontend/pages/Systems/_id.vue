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
            <v-btn color="error" @click="goToHistoryScreens" style="margin-left: 10px; width: 10%; height: 70%"
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
              <v-form>
                <v-text-field v-model="newScreen.screen_id" label="Screen ID"></v-text-field>
                <v-text-field v-model="newScreen.screen_name" label="Screen Name"></v-text-field>
                <v-text-field v-model="newScreen.screen_plan_start" label="Plant Start" type="date"></v-text-field>
                <v-text-field v-model="newScreen.screen_plan_end" label="Plant End" type="date"></v-text-field>
                <v-text-field v-model="newScreen.screen_manday" label="Manday" type="float"></v-text-field>
                <v-select v-model="newScreen.screen_level" label="Screen Level" :items="[
      'Very Difficult',
      'Hard',
      'Moderate',
      'Easy',
      'Simple',
    ]"></v-select>

                <!-- File input for photo -->
                <v-file-input :rules="rules" accept="image/png, image/jpeg, image/bmp" label="New Picture"
                  placeholder="Select a picture" prepend-icon="mdi-camera" v-model="newScreen.photo">
                </v-file-input>

                <v-btn type="submit" @click="createScreenDialog = false; createScreen();">Create</v-btn>
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
      'Very Difficult',
      'Hard',
      'Moderate',
      'Easy',
      'Simple',
    ]"></v-select>
                <v-text-field v-model="editScreen.screen_pic" label="Screen Picture" readonly></v-text-field>

                <!-- File input for photo -->
                <v-file-input :rules="rules" accept="image/png, image/jpeg, image/bmp" label="New Picture"
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

        <v-dialog v-model="showHistoryDialog" max-width="800">
          <v-data-table :headers="headers" :items="deletedScreens">
            <!-- Data Rows -->
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.screen_id }}</td>
                <td>{{ item.screen_name }}</td>
                <td>{{ item.screen_task_count }}</td>
                <td>{{ formattedScreensPlanStart(item.screen_plan_start) }}</td>
                <td>{{ formattedScreenPlanEnd(item.screen_plan_end) }}</td>
                <td>{{ item.screen_man_day }}</td>
                <td>{{ item.screen_level }}</td>
                <td class="actions-column">
                  <!-- Define actions for each row -->
                  <v-btn color="primary" @click="restoreScreen(item)">
                    Restore
                  </v-btn>
                  <v-btn color="error" @click="confirmDeleteHistoryScreen(item)">
                    Delete
                  </v-btn>
                </td>
              </tr>
            </template>
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Deleted Screens History</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>
          </v-data-table>
        </v-dialog>

      </template>

      <!-- Data Rows -->
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.screen_id }}</td>
          <td>{{ item.screen_name }}</td>
          <td>{{ item.screen_task_count }}</td>
          <td>{{ formattedScreensPlanStart(item.screen_plan_start) }}</td>
          <td>{{ formattedScreenPlanEnd(item.screen_plan_end) }}</td>
          <td>{{ item.screen_man_day }}</td>
          <td>{{ item.screen_level }}</td>
          <!-- <td>{{ item.screen_progress }}</td> -->
          <td>
            <!-- Actions -->
            <v-icon class="me-2" size="20" px @click="openEditDialog(item)">mdi-pencil-circle</v-icon>
            <v-icon size="20" px @click="confirmDeleteScreen(item)">mdi-delete-empty</v-icon>
            <v-btn @click="goToScreensDetail(item.id)" style="margin-left: 10px">Tasks</v-btn>
            <v-btn @click="openManageUserDialog(item)">Manage User Screen</v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Swal from "sweetalert2";
export default {
  name: "SystemDetails",
  layout: "admin",
  data() {
    return {
      selectedUsers: [],
      availableUsers: [],
      assignUserDialog: false,
      assinguserDalog: false,
      selectedProjectId: null,
      users: [],
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
      selectedScreenId: "",
      screensHeaders: ["Actions", "Level", "Name"],
      screenItems: [],
      selectedUser: null,
      userSystems: [],
      user: [],
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
      showHistoryDialog: false,
      deletedScreens: [],
      createScreenDialog: false,
      editScreenDialog: false,
      formattedPlanStart: "",
      formattedPlanEnd: "",
      photo: null,
      newScreen: {
        screen_id: "",
        screen_name: "",
        screen_manday: "",
        screen_type: "",
        screen_level: "",
        screen_pic: "",
        photo: null,
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
      userScreensHeaders: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Task Count", value: "screen_task_count" },
        { text: "Plan Start", value: "screen_plan_start" },
        { text: "Plan End", value: "screen_plan_end" },
        { text: "Manday", value: "screen_manday" },
        // { text: "Screen type", value: "screen_type" },
        { text: "Screen Level", value: "screen_level" },
        // { text: "Image", value: "screen_pic" }, // เปลี่ยนจาก "Progress" เป็น "Picture"
        // { text: "Actions", value: "actions", sortable: false },
      ],
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

      watch: {
        selectedScreenId: "fetchScreenDetails", // Watch for changes in the selected screen ID and fetch details accordingly
      },
    };
  },

  mounted() {
    this.fetchScreens(); // Fetch system details on component mount
    this.fetchSystemNameENG();
  },
  methods: {
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
        const { selectedUsers, selectedScreenId, selectedSystemId, selectedProjectId } = this;
        // เรียก API เพื่อสร้างการเชื่อมต่อระหว่างผู้ใช้และระบบ
        const response = await axios.post(
          `http://localhost:7777/user_screens/createUser_screen`,
          {
            user_id: selectedUsers,
            screen_id: selectedScreenId,
            system_id: selectedSystemId,
            project_id: selectedProjectId,
          }
        );
        console.log(response.data.message); // พิมพ์ข้อความจากการสร้างผู้ใช้ระบบใหม่
        // ปิด Dialog หลังจากที่สร้างผู้ใช้ระบบเรียบร้อย
        this.assinguserDalog = false;
        // สามารถดำเนินการอื่นๆ ตามต้องการ เช่น รีเฟรชรายการผู้ใช้หรืออื่นๆ
      } catch (error) {
        console.error("Error assigning user:", error);
        // จัดการข้อผิดพลาดหากมีปัญหาในการสร้างผู้ใช้ระบบ
      }
    },

    async fetchUsersByScreenAndProject(systemId, projectId, screenId) {
      try {
        const response = await axios.get(
          `http://localhost:7777/user_screens/getUserByScreenAndProject/${screenId}/${systemId}/${projectId}`
        );
        this.users = response.data;
      } catch (error) {
        console.error(error);
      }
    },

    openManageUserDialog(item) {
      this.selectedScreenId = item.screen_id; // เก็บรหัสหน้าจอที่เลือก
      this.selectedSystemId = item.id; // เก็บรหัสระบบที่เลือก
      this.selectedProjectId = item.project_id; // เก็บรหัสโปรเจคที่เลือก
      this.manageUserDialog = true; // เปิด Dialog
      this.fetchUsersBySystemAndProject(item.id, item.project_id, item.screen_id); // เรียกใช้งานฟังก์ชันโหลดข้อมูลผู้ใช้
    },

    async openNestedDialog(screenId, systemId, projectId) {
      try {
        // เรียก API เพื่อรับรายชื่อผู้ใช้ที่สามารถเลือกได้
        const response = await axios.get(
          `http://localhost:7777/user_screens/checkUsersNotInScreen/${projectId}/${systemId}/${screenId}`
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

    async deleteUser(screenId, systemId, projectId, userId) {
      try {
        const response = await axios.delete(
          `http://localhost:7777/user_screens/deleteUserScreen/${systemId}/${screenId}/${projectId}/${userId}`
        );

        // ตรวจสอบว่าคำขอ DELETE สำเร็จหรือไม่
        if (response.status === 200) {
          // ลบผู้ใช้ระบบจากตาราง users ใน Vue
          const index = this.users.findIndex((user) => user.id === userId);
          if (index !== -1) {
            this.users.splice(index, 1);
          }
          // แสดงข้อความเตือนว่าลบผู้ใช้ระบบสำเร็จ
        } else {
          // แสดงข้อความเตือนว่ามีข้อผิดพลาดในการลบผู้ใช้ระบบ
        }
      } catch (error) {
        // แสดงข้อความเตือนว่ามีข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์
        console.error("Error deleting user system:", error);
      }
    },

    async checkUsers() {
      try {
        const systemId = this.$route.params.id;
        await this.fetchUserSystems(systemId); // เรียกใช้ฟังก์ชัน fetchUserProjects เพื่อดึงข้อมูลผู้ใช้

        if (this.userSystems && this.userSystems.length > 0) { // ตรวจสอบว่ามีข้อมูลผู้ใช้หรือไม่
          console.log("มีผู้ใช้ในโปรเจกต์นี้");// มีผู้ใช้ในโปรเจกต์นี้
          this.userSystems.forEach((user) => { // แสดงรายชื่อผู้ใช้ที่มีในโปรเจกต์
            console.log(user.user_id, user.user_firstname); // ประเภทของข้อมูล user_id อาจเป็นอย่างอื่นตามโครงสร้างของข้อมูลที่ได้รับ
          });
        } else {
          console.log("ไม่มีผู้ใช้ในโปรเจกต์นี้"); // ไม่มีผู้ใช้ในโปรเจกต์นี้
        }
      } catch (error) {
        console.error("Error checking users:", error);
      }
    },

    async fetchUserSystems(system_id) {
      try {
        const response = await fetch(
          `http://localhost:7777/user_systems/getOneScreenID/${system_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user systems");
        }
        const data = await response.json();
        this.userSystems = data; // ตั้งค่า userProjects เป็นข้อมูลที่ได้รับมา
      } catch (error) {
        console.error("Error fetching user systems:", error);
      }
    },

    async createScreen() {
      const systemId = this.$route.params.id;

      try { // Fetch system data to get project_id
        const systemResponse = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system data");
        }

        const systemData = await systemResponse.json();
        const projectId = systemData.project_id;

        const base64Image = await this.imageToBase64(this.newScreen.photo); // Convert image to Base64

        // Prepare data to send
        const requestData = {
          screen_id: this.newScreen.screen_id,
          screen_name: this.newScreen.screen_name,
          screen_status: "default_status", // Update with your default status
          screen_level: this.newScreen.screen_level,
          screen_pic: base64Image, // Update with your default pic
          system_id: systemId,
          screen_manday: this.newScreen.screen_manday,
          screen_type: this.newScreen.screen_type,
          screen_progress: 0, // Update with your default progress
          screen_plan_start: this.newScreen.screen_plan_start || null, // Use null if empty
          screen_plan_end: this.newScreen.screen_plan_end || null, // Use null if empty
          project_id: projectId, // Use the fetched project_id
          photo: this.newScreen.photo, // New photo data
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
            showConfirmButton: false, // Set showConfirmButton to false to keep the alert visible
          });
        } else {
          throw new Error("Failed to create screen");
        }
        // ... continue
      } catch (error) {
        console.error("Error creating screen", error);

        // Show error message using SweetAlert2
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create the screen. Please try again.",
          showConfirmButton: false, // Set showConfirmButton to false to keep the alert visible
        });
        // ... continue
      }
    },

    validateForm() {
      return this.$refs.form.validate();
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
          const screenId = item.id;
          console.log("Restoring screen with ID:", screenId);

          const response = await fetch(
            `http://localhost:7777/screens/updateScreen/${screenId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                screenId: item.screen_id,
                screen_name: item.screen_name,
                screen_plan_start: item.screen_plan_start,
                screen_plan_end: item.screen_plan_end,
                screen_manday: item.screen_manday,
                screen_level: item.screen_level,
                screen_pic: item.screen_pic,
                is_deleted: 0,
              }),
            }
          );

          console.log("Response:", response);

          if (!response.ok) {
            const responseData = await response.json();
            throw new Error(
              `Failed to restore screen: ${responseData.message}`
            );
          }

          console.log("Screen restored successfully");

          await Swal.fire(
            "Success",
            "Screen restored successfully.",
            "success"
          );

          this.$emit("restore-screen", item);
        }
      } catch (error) {
        console.error("Error restoring screen:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the screen restoration process.",
          "error"
        );
      }
    },

    async confirmDeleteHistoryScreen(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to delete this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const screenId = item.id; // Assuming item contains the screen ID
          const response = await fetch(
            `http://localhost:7777/screens/deleteHistoryScreens/${screenId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete screen history");
          }

          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Screen history deleted successfully",
          });

          this.fetchDeletedScreens(); // Refresh the deleted screens data
        }
      } catch (error) {
        console.error("Error confirming delete history screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete screen history",
        });
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

    getBase64Image(base64Data) {
      return "data:image/jpeg;base64," + base64Data;
    },

    async fetchSystemNameENG() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/getOne/${screenId}`
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

    async goToHistoryScreens() {
      await this.fetchDeletedScreens();
      this.showHistoryDialog = true;
    },

    async fetchDeletedScreens() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchByScreenId_delete/${screenId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }

        const deletedScreens = await response.json();
        console.log(deletedScreens); // Check the deleted screens received
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screen:", error);
        // Handle error fetching deleted screen
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch deleted screens",
        });
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
          text: "You won't be able to delete this!",
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
    async fetchDeletedScreens() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }
        const deletedScreens = await response.json();
        console.log(deletedScreens); // Check the deleted screens received
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screen:", error);
        // Handle error fetching deleted screen
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch deleted screens",
        });
      }
    },

    async deletedScreens(item) {
      try {
        // Check if item is defined and has the expected structure
        if (item && item.id && item.screen_name && item.screen_id) {
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
            const screenId = item.id;
            const response = await fetch(
              `http://localhost:7777/screens/updateScreen/${screenId}`,
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

            console.log("Screen restored successfully");

            await Swal.fire(
              "Success",
              "Screen restored successfully.",
              "success"
            );

            // Update the deleted screens data after restoration
            this.fetchDeletedScreens();
          }
        } else {
          throw new Error("Invalid item object or missing properties");
        }
      } catch (error) {
        console.error("Error restoring screen:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the screen restoration process.",
          "error"
        );
      }
    },

    async fetchScreens() {
      const screenId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screens");
        }
        const data = await response.json();
        this.screens = data;
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