<template>
  <!-- Systems Data Table container -->
  <div class="systems-data-table">
    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          style="
            margin-bottom: 10px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          "
        />
      </v-col>
    </v-row>
    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredSystems"
      :items-per-page="5"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title
            >Systems Management - Project :
            {{ projectNameENG }}</v-toolbar-title
          >
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="goToCreateSystem"
            >New System</v-btn
          >
          <v-btn color="primary" dark @click="goToHistorySystems"
            >Show HistorySystem</v-btn
          >
        </v-toolbar>

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
                  v-model="newSystem.system_id"
                  label="System ID"
                ></v-text-field>
                <v-text-field
                  v-model="newSystem.system_nameTH"
                  label="System Name (TH)"
                ></v-text-field>
                <v-text-field
                  v-model="newSystem.system_nameEN"
                  label="System Name (EN)"
                ></v-text-field>
                <v-text-field
                  v-model="newSystem.system_shortname"
                  label="Short Name"
                ></v-text-field>

                <v-btn type="submit">Create</v-btn>
                <v-btn @click="createSystemDialog = false">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Edit System Dialog -->
        <v-dialog
          v-model="editSystemDialog"
          max-width="600"
          ref="editSystemDialog"
        >
          <v-card>
            <v-card-title>Edit System</v-card-title>
            <v-card-text>
              <!-- Form to edit system -->
              <v-form @submit.prevent="updateSystem">
                <v-text-field
                  v-model="editedSystem.system_id"
                  label="System ID"
                  readonly
                ></v-text-field>
                <v-text-field
                  v-model="editedSystem.system_nameTH"
                  label="System Name (TH)"
                ></v-text-field>
                <v-text-field
                  v-model="editedSystem.system_nameEN"
                  label="System Name (EN)"
                ></v-text-field>
                <v-text-field
                  v-model="editedSystem.system_shortname"
                  label="Short Name"
                ></v-text-field>
                <!-- Add more fields as needed -->
                <!-- You can also add selection fields for system analyst and member -->
                <!-- Add buttons to submit and cancel -->
                <v-btn type="submit">Update</v-btn>
                <v-btn @click="editSystemDialog = false">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>

        <!-- Show deleted systems history -->
        <v-dialog v-model="showHistoryDialog" max-width="800">
          <v-data-table :headers="headers" :items="deletedSystems">
            <!-- Define headers for the table -->
            <template v-slot:top>
              <v-toolbar flat>
                <v-toolbar-title>Deleted Systems History</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>

            <!-- Define actions for each row -->
            <template v-slot:item.actions="{ item }">
              <v-btn color="primary" @click="restoreSystem(item)">
                Restore
              </v-btn>
              <v-btn color="error" @click="confirmDeleteHistorySystem(item)">
                Delete
              </v-btn>
            </template>

            <!-- Define template when no data is available -->
            <!-- <template v-slot:no-data>
              <v-btn color="primary" @click="initialize">Reset</v-btn>
            </template> -->
          </v-data-table>
        </v-dialog>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon class="me-2" size="20" px @click="openEditDialog(item)"
          >mdi-pencil-circle</v-icon
        >
        <v-icon size="20" px @click="confirmDeleteSystem(item)"
          >mdi-delete-empty</v-icon
        >
        <v-btn @click="goToSystemsDetail(item.id)">Systems Detail</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "SystemsDataTable",
  layout: "admin",
  data() {
    return {
      projectNameENG: "",
      showHistoryDialog: false,
      deletedSystems: [],
      createSystemDialog: false,
      editSystemDialog: false,
      newSystem: {
        system_id: "",
        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      editedSystem: {
        system_id: "",
        system_nameTH: "",
        system_nameEN: "",
        system_shortname: "",
      },
      systems: [],
      searchQuery: "",
      headers: [
        { text: "System ID", value: "system_id" },
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
    };
  },
  methods: {
    async goToSystemsDetail(systemId) {
      // Navigate to the Systems/_id.vue page with the systemId parameter
      await this.$router.push({ path: `/systems/${systemId}` });
    },
    async fetchProjectNameENG() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/projects/getOne/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const projectData = await response.json();
        console.log(projectData); // ตรวจสอบข้อมูลที่ได้รับมา
        this.projectNameENG = projectData.project_name_ENG; // ใส่ชื่อ field ที่ต้องการแสดง
      } catch (error) {
        console.error("Error fetching project:", error);
        // Handle error fetching project
      }
    },
    async restoreSystem(item) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You are about to restore this system.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, restore it!",
        });

        if (confirmResult.isConfirmed) {
          const systemId = item.id;
          const response = await fetch(
            `http://localhost:7777/systems/updateSystem/${systemId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                system_nameTH: item.system_nameTH,
                system_nameEN: item.system_nameEN,
                system_shortname: item.system_shortname,
                project_id: item.project_id,
                is_deleted: 0,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to restore system");
          }

          console.log("System restored successfully");

          await Swal.fire(
            "Success",
            "System restored successfully.",
            "success"
          );

          // เพิ่มบรรทัดนี้เพื่ออัพเดทตารางอัตโนมัติ
          this.fetchDeletedSystems();
        }
      } catch (error) {
        console.error("Error restoring system:", error);
        await Swal.fire(
          "Error",
          "An error occurred during the system restoration process.",
          "error"
        );
      }
    },

    async mounted() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/projects/getOne/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const projectData = await response.json();
        console.log(projectData); // ตรวจสอบข้อมูลที่ได้รับมา
        this.projectNameENG = projectData.project_name_ENG; // ใส่ชื่อ field ที่ต้องการแสดง
      } catch (error) {
        console.error("Error fetching project:", error);
        // Handle error fetching project
      }
    },

    async confirmDeleteHistorySystem(item) {
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
          const systemId = item.id; // Get the ID of the system to delete
          const response = await fetch(
            `http://localhost:7777/systems/deleteHistorySystems/${systemId}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) {
            throw new Error("Failed to delete system");
          }
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "System and related data deleted successfully",
          });
          this.fetchDeletedSystems(); // Refresh the deleted systems data
        }
      } catch (error) {
        console.error("Error confirming delete history system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete history system",
        });
      }
    },
    async goToHistorySystems() {
      await this.fetchDeletedSystems();
      this.showHistoryDialog = true;
    },
    async fetchDeletedSystems() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/systems/searchByProjectId_delete/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deleted systems");
        }
        const deletedSystems = await response.json();
        console.log(deletedSystems); // ตรวจสอบ deleted systems ที่ได้รับมา
        this.deletedSystems = deletedSystems;
      } catch (error) {
        console.error("Error fetching deleted systems:", error);
        // Handle error fetching deleted systems
      }
    },
    async createSystem() {
      const projectId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/systems/createSystem`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              project_id: projectId,
              ...this.newSystem,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to create system");
        }
        // Clear the newSystem object
        this.newSystem = {
          system_id: "",
          system_nameTH: "",
          system_nameEN: "",
          system_shortname: "",
        };
        const confirmResult = await Swal.fire({
          icon: "success",
          title: "Success",
          text: "New system created successfully",
          showConfirmButton: true, // แสดงปุ่ม "OK"
          allowOutsideClick: false, // ปิดการคลิกภายนอกเพื่อป้องกันการปิดโดยไม่ได้เช็ค
        });
        if (confirmResult.isConfirmed) {
          // อัพเดทข้อมูลโดยอัตโนมัติหลังจากสร้างข้อมูลใหม่สำเร็จ
          this.fetchSystems();
        }
      } catch (error) {
        console.error("Error creating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create system",
        });
      }
    },

    async updateSystem() {
      try {
        const response = await fetch(
          `http://localhost:7777/systems/updateSystem/${this.editedSystem.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editedSystem),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update system");
        }
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "System updated successfully",
        });
        this.editSystemDialog = false;
        this.fetchSystems();
      } catch (error) {
        console.error("Error updating system:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update system",
        });
      }
    },

    async fetchSystems() {
      const projectId = this.$route.params.id;
      try {
        const response = await fetch(
          `http://localhost:7777/systems/getAll/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch systems");
        }
        const data = await response.json();
        this.systems = data;
      } catch (error) {
        console.error("Error fetching systems:", error);
      }
    },
    async goToCreateSystem() {
      // Open the create system dialog first
      this.createSystemDialog = true;
    },
    openEditDialog(system) {
      this.editedSystem = { ...system };
      this.editSystemDialog = true;
    },
    async editSystem(system) {
      // Set the edited system to the selected system
      this.editedSystem = { ...system };
      // Open the edit system dialog
      this.editSystemDialog = true;
    },
    async confirmDeleteSystem(system) {
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
          // If user confirms deletion, call deleteSystem method
          await this.deleteSystem(system);
          // อัพเดทข้อมูลโดยอัตโนมัติหลังจากลบข้อมูล
          this.fetchSystems();
        }
      } catch (error) {
        console.error("Error confirming delete system:", error);
      }
    },

    async deleteSystem(system) {
      const systemId = system.id;
      try {
        // Send a DELETE request to the API to delete the system
        const response = await fetch(
          `http://localhost:7777/systems/delete/${systemId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete system");
        }
        // If deletion is successful, show success message and update systems data
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "System deleted successfully",
        });
        this.fetchDeletedSystems(); // Refresh the deleted systems data
      } catch (error) {
        console.error("Error deleting system:", error);
        // If an error occurs during deletion, show error message
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete system",
        });
      }
    },
  },
  computed: {
    filteredSystems() {
      return this.systems.filter((system) => {
        const searchText = this.searchQuery.toLowerCase();
        return (
          system.system_id.toLowerCase().includes(searchText) ||
          system.system_nameTH.toLowerCase().includes(searchText) ||
          system.system_nameEN.toLowerCase().includes(searchText) ||
          system.system_shortname.toLowerCase().includes(searchText)
        );
      });
    },
  },

  mounted() {
    this.fetchSystems();
    this.fetchProjectNameENG();
  },
};
</script>

<style scoped>
/* Add your scoped styles here */
</style>