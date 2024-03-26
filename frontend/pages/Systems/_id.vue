<template>
  <div class="screen-details">
    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input type="text" v-model="searchQuery" placeholder="Search..." style="
            margin-bottom: 10px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          " />
      </v-col>
    </v-row>

    <!--data table -->
    <v-data-table :headers="userScreenHeaders" :items="filteredScreens" :items-per-page="5" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Screen Management - System : {{ systemNameENG }}</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="goToCreateScreen">New Screen</v-btn>
          <v-btn color="primary" dark @click="goToHistoryScreens" style="margin-left: 10px;">Show History Screen</v-btn>
          <!-- <v-btn color="primary" dark @click="goToHistoryScreen"
            >Show HistoryScreen</v-btn
          > -->
        </v-toolbar>

        <!-- Create Screen Dialog -->
        <v-dialog v-model="createScreenDialog" max-width="600" ref="createScreenDialog">
          <v-card>
            <v-card-title>Create New Screen</v-card-title>
            <v-card-text>
              <!-- Form to create a new screen -->
              <v-form>
                <v-text-field v-model="newScreen.screen_id" label="Screen ID"></v-text-field>
                <v-text-field v-model="newScreen.screen_name" label="Screen Name"></v-text-field>
                <v-select v-model="newScreen.screen_level" label="Screen Level" :items="[
          'Very Difficult',
          'Hard',
          'Moderate',
          'Easy',
          'Simple',
        ]"></v-select>

                <!-- File input for photo -->
                <v-file-input :rules="rules" accept="image/png, image/jpeg, image/bmp" label="Photo"
                  placeholder="Pick an photo" prepend-icon="mdi-camera" v-model="newScreen.photo">
                </v-file-input>

                <v-btn type="submit" @click="
          createScreenDialog = false;
        createScreen();
        ">Create</v-btn>
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

                <!-- File input for photo -->
                <v-file-input :rules="rules" accept="image/png, image/jpeg, image/bmp" label="Photo"
                  placeholder="Pick a photo" prepend-icon="mdi-camera" v-model="editScreen.photo">
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
            <!-- Define headers for the table -->

            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Deleted Screens History</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>

            <!-- Define actions for each row -->
            <template v-slot:item.actions="{ item }">
              <v-btn color="primary" @click="restoreScreen(item)">
                Restore
              </v-btn>
              <v-btn color="error" @click="confirmDeleteHistoryScreen(item)">
                Delete
              </v-btn>
            </template>

          </v-data-table>
        </v-dialog>

      </template>

      <!-- Header Row -->
      <template v-slot:header>
        <thead>
          <tr>
            <th v-for="header in userScreensHeaders" :key="header.value">
              {{ header.text }}
            </th>
          </tr>
        </thead>
      </template>

      <!-- Data Rows -->
      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.screen_id }}</td>
          <td>{{ item.screen_name }}</td>
          <td>{{ item.screen_plan_end }}</td>
          <td>{{ item.screen_level }}</td>
          <td>{{ item.screen_progress }}</td>
          <td>
            <!-- Actions -->
            <v-icon class="me-2" size="20" px @click="openEditDialog(item)">mdi-pencil-circle</v-icon>
            <v-icon size="20" px @click="confirmDeleteScreen(item)">mdi-delete-empty</v-icon>
            <v-btn @click="goToScreensDetail(item.id)" style="margin-left: 10px;">Tasks</v-btn>
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
      dateStartMenu: false,
      dateEndMenu: false,
      systemNameENG: "",
      showHistoryDialog: false,
      deletedScreens: [],
      createScreenDialog: false,
      editScreenDialog: false,
      newScreen: {
        screen_id: "",
        screen_name: "",
        screen_manday: "",
        screen_level: "",
        screen_pic: "",
        screen_plan_start: "",
        screen_plan_end: "",
      },
      editScreen: {
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
        // { text: "Image", value: "screen_pic" }, // เปลี่ยนจาก "Progress" เป็น "Picture"
        // { text: "Actions", value: "actions", sortable: false },
      ],
      headers: [
        { text: "Screen ID", value: "screen_id" },
        { text: "Screen Name", value: "screen_name" },
        { text: "Due date", value: "screen_plan_end" },
        { text: "Screen ", value: "screen_level" },
        { text: "Progress", value: "screen_progress" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      watch: {
        // Watch for changes in the selected screen ID and fetch details accordingly
        selectedScreenId: "fetchScreenDetails",
      },
    };
  },

  mounted() {
    // Fetch system details on component mount
    this.fetchScreens();
    this.fetchSystemNameENG();
  },
  methods: {
    async createScreen() {
      const systemId = this.$route.params.id;

      try {
        // Fetch system data to get project_id
        const systemResponse = await fetch(
          `http://localhost:7777/systems/getOne/${systemId}`
        );
        if (!systemResponse.ok) {
          throw new Error("Failed to fetch system data");
        }

        const systemData = await systemResponse.json();
        const projectId = systemData.project_id;

        // Convert image to Base64
        const base64Image = await this.imageToBase64(this.newScreen.photo);

        // Prepare data to send
        const requestData = {
          screen_id: this.newScreen.screen_id,
          screen_name: this.newScreen.screen_name,
          screen_status: "default_status", // Update with your default status
          screen_level: this.newScreen.screen_level,
          screen_pic: base64Image, // Update with your default pic
          system_id: systemId,
          screen_progress: 0, // Update with your default progress
          screen_plan_start: this.newScreen.screen_plan_start || null, // Use null if empty
          screen_plan_end: this.newScreen.screen_plan_end || null, // Use null if empty
          project_id: projectId, // Use the fetched project_id
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
        // Check if the screen was created successfully
        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "Screen Created!",
            text: "The new screen has been created successfully.",
            timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
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
          timer: 3000, // Set the timer to 3 seconds (3000 milliseconds)
        });
        // ... continue
      }
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
          const response = await fetch(
            `http://localhost:7777/screens/updateScreen/${screenId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                screen_nameTH: item.screen_nameTH,
                screen_nameEN: item.screen_nameEN,
                screen_shortname: item.screen_shortname,
                project_id: item.project_id,
                is_deleted: 0, // Update the is_deleted field to 0 for restoration
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

          // Update the main page with the restored data
          // Assuming you emit an event to handle the restoration in the parent component
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

    async confirmDeleteHistoryScreen() {
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
          const screenId = this.deletedScreen.id; // Assuming deletedScreen is accessible in this component
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

          // Refresh the deleted screens data
          this.fetchDeletedScreens();
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
        // Convert image to Base64
        const base64Image = await this.imageToBase64(this.editScreen.photo);

        // Prepare data to send
        const requestData = {
          screen_id: this.editScreen.screen_id,
          screen_name: this.editScreen.screen_name,
          screen_level: this.editScreen.screen_level,
          screen_pic: base64Image, // Updated photo
        };

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
          this.fetchScreens(); // Assuming fetchScreens() fetches updated screen data
        } else {
          throw new Error("Failed to update screen");
        }
      } catch (error) {
        console.error("Error updating screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update screen",
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
      try {
        // Fetch deleted screens data
        await this.fetchDeletedScreens();

        // Show history dialog to display deleted screens
        this.showHistoryDialog = true;
      } catch (error) {
        console.error("Error fetching deleted screens:", error);
        // Handle error fetching deleted screens
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch deleted screens",
        });
      }
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

    async fetchDeletedScreens() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/searchBySystemId_delete/${screenId}`//ติดแก้ไขที่ตรงนี้ ตรง/searchBySystemIdแก้ไขอะไรยังไม่ได้
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
          `http://localhost:7777/screens/searchBySystemId/${screenId}`//ข้อมูลที่แสดงตรงหน้าจอ ตรง/searchBySystemIdแก้ไขอะไรยังไม่ได้
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
          text: "You won't be able to revert this!",
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
          await this.deleteScreen(screen);
          // อัพเดทข้อมูลโดยอัตโนมัติหลังจากลบข้อมูล
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
      if(this.screens.screen_plan_start) {
        if (!this.screens.screen_plan_start) return ''; // Check if planStart date is defined
        const date = new Date(thisscreens.screen_plan_start); // Create a Date object from planStart
        const day = date.getDate(); // Get the day of the month
        const month = date.getMonth() + 1; // Get the month (0-indexed, hence +1)
        const year = date.getFullYear(); // Get the full year
        // Format the date as "day/month/year"
        return `${day}/${month}/${year}`;
      }
    },
  },
};
</script>

<style>
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