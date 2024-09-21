<template>
  <!-- Dialog for displaying SystemId -->

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
          <v-toolbar-title>Deleted Screen History </v-toolbar-title>
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
      <v-btn color="error" @click="closeDialog">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Swal from "sweetalert2";
export default {
  props: {
    systemId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      selectedDeletedScreens: [],
      tableHeaders: [
        { text: "Screen Picture", align: "start", value: "screen_pic" },
        { text: "Screen ID", value: "screen_code" },
        { text: "Screen Name", value: "screen_name" },
      ],
      system_Id: null,
      deletedScreens: [],
    };
  },
  mounted() {
    this.fetchDeletedScreensBySystemId();
  },

  methods: {
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
      return base64Data ? "data:image/jpeg;base64," + base64Data : ""; // เพิ่มการตรวจสอบ
    },

    async fetchScreens() {
      try {
        const response = this.$axios.get(
          `/screens/searchBySystemId/${this.systemId}` // Use this.systemId from props
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screens");
        }

        const screens = await response.json();
        this.screens = screens;

        // Use the first screen's id if screens are found
        if (screens.length > 0) {
          this.screenId = screens[0].id;
        }
      } catch (error) {
        console.error("Error fetching screens:", error);
      }
    },

    async fetchDeletedScreens() {
      try {
        const response = this.$axios.get(
          `/screens/searchBySystemId_delete/${this.systemId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted screens");
        }

        const deletedScreens = await response.json();
        console.log(deletedScreens); // Log the result for debugging
        this.deletedScreens = deletedScreens;
      } catch (error) {
        console.error("Error fetching deleted screens:", error);
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
              try {
                const response = await this.$axios.put(
                  `/screens/updateScreen/${screen.id}`,
                  {
                    screen_name: screen.screen_name,
                    screen_code: screen.screen_code,
                    screen_status: screen.screen_status,
                    screen_level: screen.screen_level,
                    screen_pic: screen.screen_pic,
                    project_id: screen.project_id,
                    is_deleted: 0,
                  }
                );

                if (response.status !== 200) {
                  throw new Error("Failed to restore screen");
                }

                return screen.id;
              } catch (error) {
                console.error(
                  `Error restoring screen with id ${screen.id}:`,
                  error
                );
                throw error;
              }
            }
          );

          await Promise.all(restorePromises);

          await Swal.fire({
            title: "Success",
            text: "Selected screens restored successfully.",
            icon: "success",
            confirmButtonColor: "#009933",
          });

          this.$emit("close-dialog");
          this.fetchDeletedScreensBySystemId();
          this.fetchScreens();
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
          confirmButtonColor: "#d33",
          cancelButtonColor: "#009933",
          confirmButtonText: "Yes, delete them!",
        });

        if (confirmResult.isConfirmed) {
          const deletePromises = this.selectedDeletedScreens.map(
            async (screen) => {
              try {
                const response = await this.$axios.delete(
                  `/screens/deleteHistoryScreen/${screen.id}`
                );

                if (response.status !== 200) {
                  throw new Error("Failed to delete screen");
                }

                return screen.id;
              } catch (error) {
                console.error(
                  `Error deleting screen with id ${screen.id}:`,
                  error
                );
                throw error; // Ensure all errors are propagated
              }
            }
          );

          await Promise.all(deletePromises);

          await Swal.fire({
            title: "Success",
            text: "Selected screens deleted successfully.",
            icon: "success",
            confirmButtonColor: "#009933",
          });
          this.$emit("close-dialog");
          this.fetchDeletedScreens();
          this.fetchScreens();
        }
      } catch (error) {
        console.error("Error deleting screens:", error);

        await Swal.fire({
          title: "Error",
          text: "An error occurred during the screens deletion process.",
          icon: "error",
          confirmButtonColor: "#009933",
        });
      }
    },

    async fetchDeletedScreensBySystemId() {
      try {
        const systemId = this.systemId;

        // ใช้ axios กับการดึงข้อมูลที่ไม่ใช้ response.ok และ response.json()
        const response = await this.$axios.$get(
          `/screens/searchBySystemId_delete/${systemId}`
        );

        // กำหนดค่า deletedScreens โดยตรงจากข้อมูลที่ดึงมา
        this.deletedScreens = response;
      } catch (error) {
        console.error("Error fetching deleted screens by system ID:", error);
      }
    },
    async confirmDeleteScreen(screen) {
      try {
        const response = await this.$axios.get(
          `/user_screens/checkUsersINScreen/${this.projectId}/${this.systemId}/${screen.id}`
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
    closeDialog() {
      this.$emit("close-dialog"); // Emit an event to the parent
    },
  },
};
</script>

<style></style>