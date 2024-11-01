<template>
  <div class="card-wrapper">
    <!-- click -->
    <v-card class="customer-card" @click="$emit('click')" height="">
      <v-img class="white--text" :src="getBase64Image(ImageSrc)" height="200px" width="400px">
        <v-row class="align-center justify-space-between">
          <!-- Left Side: ID Chip -->
          <v-col cols="auto">
            <v-chip class="ma-2" color="blue" text-color="white">
              {{ screenCode }}
            </v-chip>
          </v-col>

          <!-- Right Side: Status and Progress Chips -->
          <v-col cols="auto">
            <!-- Replaced chip with circular progress -->
            <v-progress-circular class="circular-progress" :value="screenProgress || 0"
              :color="getColorClass(screenProgress)" size="60" width="4">
              <strong> {{ Math.round(screenProgress || 0) }}% </strong>
            </v-progress-circular>
          </v-col>
        </v-row>
      </v-img>

      <v-card>
        <v-card-title> {{ screenName }} </v-card-title>

        <!-- Small Circular Progress Indicators Row -->
        <!-- Small Circular Progress Indicators Row -->
        <v-row class="justify-center">
          <v-col cols="auto" class="text-center">
            <v-progress-circular :value="designProgress || 0" color="purple" size="50" width="3">
              <small>{{ Math.round(designProgress || 0) }}%</small>
            </v-progress-circular>
            <div class="mt-1" style="font-size: smaller;">Design</div>
          </v-col>

          <v-col cols="auto" class="text-center">
            <v-progress-circular :value="devProgress || 0" color="blue" size="50" width="3">
              <small>{{ Math.round(devProgress || 0) }}%</small>
            </v-progress-circular>
            <div class="mt-1" style="font-size: smaller;">Dev</div>
          </v-col>

          <v-col cols="auto" class="text-center">
            <v-progress-circular :value="testProgress || 0" color="orange" size="50" width="3">
              <small>{{ Math.round(testProgress || 0) }}%</small>
            </v-progress-circular>
            <div class="mt-1" style="font-size: smaller;">Test</div>
          </v-col>
        </v-row>

        <v-card-subtitle>
          <strong>Plan Manday:</strong> {{ planManDay }} <br />
          <strong>Actual Manday:</strong> {{ actualManDay }} <br />
          <strong>Plan:</strong> {{ screenPlanStartDate || "-" }}
          <strong>to</strong> {{ screenPlanEndDate || "-" }} <br />
          <strong>Actual:</strong>
          {{ screenActualStartDate || "-" }} <strong>to</strong>
          {{ screenActualEndDate || "-" }}<br />
        </v-card-subtitle>


        <v-card-actions>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-if="!isRestrictedPosition" color="primary" icon v-bind="attrs" v-on="on"
                @click.stop="openEditDialog">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-if="!isRestrictedPosition" color="primary" icon v-bind="attrs" v-on="on"
                @click.stop="editScreenUserDialog = true">
                <v-icon>mdi-account-edit</v-icon>
              </v-btn>
            </template>
            <span>Manage User</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-card>


    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="800px">
      <v-card>
        <v-card-title color="black">Edit</v-card-title>
        <v-card-text>
          <v-form ref="editForm" v-model="isValid" lazy-validation>
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="screenCode" label="Screen Code" :disabled="true" outlined />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="screenName" label="Screen Name" outlined />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select v-model="screenLevel" :items="[1, 2, 3, 4, 5]" :label="`Level ${screenLevel}`" outlined />
              </v-col>
              <v-col cols=" 6">
                <v-file-input v-model="imageFile" label="Upload Image" outlined accept=".png, .jpeg" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="confirmDeleteScreen" color="red" outlined>Delete</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="submitEdit">Submit</v-btn>
          <v-btn color="secondary" @click="closeEditDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Edit user dialog -->
    <v-dialog v-model="editScreenUserDialog" max-width="1200px">
      <v-card>
        <!-- Current User Title -->
        <v-card-title color="black">
          Manage users in Screen : {{ screenName }}</v-card-title>
        <v-card-text>
          <!-- Current User Table -->
          <v-data-table :headers="headers" :items="users" class="elevation-1 mt-4 mb-3">
            <!-- User Avatar in the "Image" column -->
            <template v-slot:item.user_pic="{ item }">
              <v-avatar>
                <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
              </v-avatar>
            </template>

            <!-- User Name in the "User Name" column -->
            <template v-slot:item.user_name="{ item }">
              {{ item.user_firstname }} {{ item.user_lastname }}
            </template>

            <!-- User Position in the "User Position" column -->
            <template v-slot:item.user_position="{ item }">
              <div :style="{
                width: '120px',
                backgroundColor: getColor(item.user_position),
                color: 'white',
                paddingTop: '5px',
                paddingBottom: '5px',
                borderRadius: '20px',
                textAlign: 'center',
                display: 'inline-block',
              }">
                {{ item.user_position }}
              </div>
            </template>

            <!-- Action buttons in the "Action" column -->
            <template v-slot:item.action="{ item }">
              <!-- The delete button is always present, but the icon is conditionally displayed -->
              <v-btn icon v-if="!isUserAssignedToTask(item)" @click="deleteUser(item)">
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
        <!-- action -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="openAssignUserDialog">Assign User</v-btn>
          <v-btn color="secondary" @click="editScreenUserDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Assign User Dialog -->
    <v-dialog v-model="assignUserDialog" max-width="800px">
      <v-card>
        <v-card-title color="black">Assign User</v-card-title>
        <v-card-text>
          <!-- Select System Analyst -->
          <v-select v-model="selectedSystemAnalysts" :items="usersNotInScreen.filter(
            (user) => user.user_position === 'System Analyst'
          )
            " label="Select System Analyst" item-text="user_firstname" item-value="id" multiple>
            <!-- Select All Option -->
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllSystemAnalystAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>

            <!-- Selected User Chips -->
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="item" :key="index" class="d-flex align-center" close
                @click:close="removeSystemAnalyst(item)">
                <v-avatar left>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-avatar>
                {{ item.user_firstname }}
              </v-chip>
            </template>

            <!-- User List with Checkboxes -->
            <template v-slot:item="{ item }">
              <v-list-item>
                <v-checkbox v-model="selectedSystemAnalysts" :value="item.id" />
                <v-list-item-avatar>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_firstname }}
                    {{ item.user_lastname }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <!-- Select Developer -->
          <v-select v-model="selectedDevelopers" :items="usersNotInScreen.filter(
            (user) => user.user_position === 'Developer' || user.user_position === 'Report developer'
          )" label="Select Developer" item-text="user_firstname" item-value="id" multiple>
            <!-- Select All Option -->
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllDevelopersAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>

            <!-- Selected User Chips -->
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="item" :key="index" class="d-flex align-center" close @click:close="removeDeveloper(item)">
                <v-avatar left>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-avatar>
                {{ item.user_firstname }}
              </v-chip>
            </template>

            <!-- User List with Checkboxes -->
            <template v-slot:item="{ item }">
              <v-list-item>
                <v-checkbox v-model="selectedDevelopers" :value="item.id" />

                <v-list-item-avatar>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_firstname }}
                    {{ item.user_lastname }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <!-- Select Implementer -->
          <v-select v-model="selectedImplementers" :items="usersNotInScreen.filter(
            (user) => user.user_position === 'Implementer'
          )
            " label="Select Implementer" item-text="user_firstname" item-value="id" multiple>
            <!-- Select All Option -->
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllImplementersAF">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>

            <!-- Selected User Chips -->
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="item" :key="index" class="d-flex align-center" close @click:close="removeImplementer(item)">
                <v-avatar left>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-avatar>
                {{ item.user_firstname }}
              </v-chip>
            </template>

            <!-- User List with Checkboxes -->
            <template v-slot:item="{ item }">
              <v-list-item>
                <v-checkbox v-model="selectedImplementers" :value="item.id" />
                <v-list-item-avatar>
                  <img :src="getBase64UserImage(item.user_pic)" alt="User Avatar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_firstname }}
                    {{ item.user_lastname }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="assignUser">Assign</v-btn>
          <v-btn color="secondary" @click="assignUserDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { faTasks } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2"; // Make sure to import SweetAlert for notifications

export default {
  props: {
    userSystems: {
      type: Array,
      required: false,
      default: () => [],
    },
    screenProjectId: {
      type: Number,
      required: true,
    },
    screenSystemId: {
      type: Number,
      required: true,
    },
    screenCode: {
      type: String,
      required: true,
    },
    screenId: {
      type: Number,
      required: true,
    },
    screenName: {
      type: String,
      required: true,
    },
    screenPlanStartDate: {
      type: String,
      required: false,
    },
    screenPlanEndDate: {
      type: String,
      required: false,
    },
    screenActualStartDate: {
      type: String,
      required: false,
    },
    screenActualEndDate: {
      type: String,
      required: false,
    },
    screenStatus: {
      type: String,
      required: true,
    },
    screenLevel: {
      type: String,
      required: false,
    },
    screenProgress: {
      type: Number,
      required: false,
    },
    ImageSrc: {
      type: String,
      required: false,
    },
    designProgress: {
      type: Number,
      required: false,
    },
    devProgress: {
      type: Number,
      required: false,
    },
    testProgress: {
      type: Number,
      required: false,
    },
    isRestrictedPosition: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      users: [], // Holds the current users assigned to the screen
      usersNotInScreen: [],
      tasks: [],
      editDialog: false,
      assignUserDialog: false,
      editScreenUserDialog: false,
      selectedSystemAnalysts: [], // Selected system analysts
      selectedDevelopers: [], // Selected developers
      selectedImplementers: [], // Selected implementers
      headers: [
        { text: "Image", value: "user_pic", sortable: false },
        { text: "User Name", value: "user_name" },
        { text: "User Position", value: "user_position" },
        { text: "Action", value: "action", sortable: false },
      ],
      isValid: false,
      imageFile: null,
    };
  },
  methods: {
    // Fetch the currently assigned users for the screen
    async fetchScreenUsers() {
      try {
        const response = await this.$axios.get(
          `/user_screens/getOneScreenID/${this.screenId}`
        );
        this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async fetchScreenTasks() {
      try {
        const response = await this.$axios.get(
          `/tasks/searchByScreenId/${this.screenId}`
        );
        this.tasks = response.data;
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    },

    // Check if a user is assigned to any task in the screen
    isUserAssignedToTask(user) {
      const userId = user.user_id || user.id; // Use fallback if necessary
      if (!userId) {
        console.error("User object does not have a user_id or id!");
        return false;
      }
      // Check if any task has the user's ID as task_member_id
      return this.tasks.some((task) => task.task_member_id === userId);
    },
    // Convert Base64 image string to a usable image URL
    getBase64Image(base64String) {
      if (!base64String) {
        // If base64String is null or undefined, return an empty string or a placeholder image
        return "/images/Not determined.jpg";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        // If the base64 string already includes the prefix, return it as is
        return base64String;
      } else {
        // Otherwise, add the prefix and return the modified string
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
    getBase64UserImage(base64String) {
      if (!base64String) {
        // If base64String is null or undefined, return an empty string or a placeholder image
        return "/images/default_user.jpg";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        // If the base64 string already includes the prefix, return it as is
        return base64String;
      } else {
        // Otherwise, add the prefix and return the modified string
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
    // Assign users to the screen
    async assignUser() {
      try {
        const selectedUsers = [
          ...this.selectedSystemAnalysts,
          ...this.selectedDevelopers,
          ...this.selectedImplementers,
        ];

        // Send POST request to assign users
        const response = await this.$axios.post(
          "/user_screens/createUser_screen",
          {
            user_id: selectedUsers,
            screen_id: this.screenId,
            system_id: this.screenSystemId, // Ensure system ID is passed if needed
            project_id: this.screenProjectId, // Ensure project ID is passed if needed
          }
        );
        console.log(response.data.message);

        // Close the dialog and show success message
        this.assignUserDialog = false;

        // Reset selected users
        this.selectedSystemAnalysts = [];
        this.selectedDevelopers = [];
        this.selectedImplementers = [];
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Users assigned successfully",
          confirmButtonColor: "#009933",
        });

        // Fetch the updated users
        await this.fetchScreenUsers();
        await this.fetchUsersNotInScreen();
      } catch (error) {
        console.error("Error assigning users:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to assign users",
          confirmButtonColor: "#009933",
        });
      }
    },

    // Fetch users not in screen
    async fetchUsersNotInScreen() {
      try {
        const response = await this.$axios.get(
          `/user_screens/checkUsersNOTINScreen/${this.screenProjectId}/${this.screenSystemId}/${this.screenId}`
        );
        this.usersNotInScreen = response.data;
      } catch (error) {
        console.error("Error fetching users not in screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch users not in screen",
          confirmButtonColor: "#009933",
        });
      }
    },

    // Delete a user from the screen
    async deleteUser(user) {
      try {
        // Ensure user_id is correctly accessed
        console.log("Deleting user:", user); // Log the user object to verify it
        const response = await this.$axios.delete(
          `/user_screens/deleteUserScreen/${this.screenSystemId}/${this.screenProjectId}/${this.screenId}/${user.id}` // Ensure the correct property name here
        );
        console.log(response.data.message);

        // Fetch the updated users and show success message
        await this.fetchScreenUsers();
        await this.fetchUsersNotInScreen();
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "User deleted successfully",
          confirmButtonColor: "#009933",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete user",
          confirmButtonColor: "#009933",
        });
      }
    },
    calculateMandays(startDate, endDate) {
      if (!startDate || !endDate) return '-'; // Return "-" if dates are not available
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInTime = end - start;
      const mandays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include the start day
      return mandays > 0 ? mandays : '-'; // Check for positive days only
    },
    // Dialog handling methods
    openAssignUserDialog() {
      this.assignUserDialog = true;
    },
    closeAssignUserDialog() {
      this.assignUserDialog = false;
    },
    openEditDialog() {
      this.editDialog = true;
    },
    closeEditDialog() {
      this.editDialog = false;
    },
    //Edit dialog
    confirmDeleteScreen() {
      Swal.fire({
        title: "Are sure you want to delete?",
        text: "If deleted, you won't be able to recover this screen!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#009933",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteScreen();
        }
      });
    },
    deleteScreen() {
      this.$emit("delete", this.screenId);
      this.closeEditDialog();
    },
    convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Read file as Base64
        reader.onload = () => resolve(reader.result); // Base64 result
        reader.onerror = (error) => reject(error);
      });
    },
    async submitEdit() {
      if (!this.$refs.editForm.validate()) {
        return;
      }

      let base64Image = null;

      // If imageFile exists, convert it to Base64
      if (this.imageFile) {
        try {
          base64Image = await this.convertFileToBase64(this.imageFile);
          // Remove the `data:image/jpeg;base64,` prefix if present
          base64Image = base64Image.replace(
            /^data:image\/(jpeg|png);base64,/,
            ""
          );
        } catch (error) {
          console.error("Error converting image to Base64:", error);
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to process the image file.",
            confirmButtonColor: "#009933",
          });
          return;
        }
      }

      // Create the updated screen object
      const updatedScreen = {
        screenId: this.screenId,
        screenCode: this.screenCode,
        screenName: this.screenName,
        screenLevel: this.screenLevel || 0,
        imageFile: base64Image || null, // Base64 string without prefix or null
      };

      // Emit the updatedScreen object to the parent
      this.$emit("submit-edit", updatedScreen);

      // Close the dialog
      this.closeEditDialog();
    },
    // Utility methods for UI
    getColorClass(progress) {
      if (progress >= 75 && progress <= 100) {
        return "#4CAF50"; // สีเขียว
      } else if (progress >= 51 && progress <= 74) {
        return "#03A9F4"; // สีฟ้า
      } else if (progress >= 26 && progress <= 50) {
        return "#FFD700"; // สีเหลืองทอง
      } else if (progress >= 0 && progress <= 25) {
        return "#FC8705"; // สีส้ม
      }
      return "#000000"; // สีดำเป็นค่าเริ่มต้นถ้าค่าผิดพลาด
    },
    truncateName(name, maxLength = 20) {
      if (!name) return "";
      return name.length > maxLength
        ? name.substring(0, maxLength) + "..."
        : name;
    },
    getColorClassText(progress) {
      if (progress === 100) return "green--text";
      if (progress >= 75) return "blue--text";
      if (progress >= 50) return "yellow--text";
      return "orange--text";
    },
    getColor(position) {
      switch (position) {
        case "System Analyst":
          return "#864F80";
        case "Developer":
          return "#374AAB";
        case "Tester":
          return "#359C73";
        default:
          return "grey";
      }
    },
    // Get user names based on position (System Analyst, Developer, etc.)
    getUserNamesByPosition(position) {
      const usersByPosition = this.users
        .filter(
          (user) => user.user_position.toLowerCase() === position.toLowerCase()
        )
        .map((user) => `${user.user_firstname}`)
        .join(", ");
      return usersByPosition;
    },
    // Get use image, based on position (System Analyst, Developer, etc.)
    // Select all system analyst
    selectAllSystemAnalystAF() {
      this.selectedSystemAnalysts = this.usersNotInScreen
        .filter((user) => user.user_position === "System Analyst")
        .map((user) => user.id);
    },
    removeSystemAnalyst(item) {
      this.selectedSystemAnalysts = this.selectedSystemAnalysts.filter(
        (id) => id !== item.id
      );
    },
    // Select all developers
    selectAllDevelopersAF() {
      this.selectedDevelopers = this.usersNotInScreen
        .filter((user) => user.user_position === "Developer" || user.user_position === "Report developer")
        .map((user) => user.id);
    },
    removeDeveloper(item) {
      this.selectedDevelopers = this.selectedDevelopers.filter(
        (id) => id !== item.id
      );
    },

    // Select all implementers
    selectAllImplementersAF() {
      this.selectedImplementers = this.usersNotInScreen
        .filter((user) => user.user_position === "Implementer")
        .map((user) => user.id);
    },
    removeImplementer(item) {
      this.selectedImplementers = this.selectedImplementers.filter(
        (id) => id !== item.id
      );
    },
  },
  mounted() {
    this.fetchScreenUsers(); // Load users when the component is mounted
    this.fetchUsersNotInScreen();
    this.fetchScreenTasks();
  },
  computed: {
    screenLevelLabel() {
      return `Level ${this.screenLevel || "Not Set"}`;
    },
    planManDay() {
      return this.calculateMandays(this.screenPlanStartDate, this.screenPlanEndDate);
    },
    actualManDay() {
      return this.calculateMandays(this.screenActualStartDate, this.screenActualEndDate);
    },
  },
  created() {
    this.fetchScreenUsers();
    this.fetchUsersNotInScreen();
  },
};
</script>


<style scoped>
.card-wrapper {
  position: relative;
  display: inline-block;
  max-width: 320px;
}

.customer-card {
  cursor: pointer;
  width: 100%;
}

.circular-progress {
  background-color: white;
  border-radius: 50%;
  margin-top: 5px;
  margin-right: 5px;
}
</style>