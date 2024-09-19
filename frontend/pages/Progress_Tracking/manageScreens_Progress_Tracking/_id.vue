<template>
  <div>
    <Loader v-if="$store.getters.isLoading" />
    <v-card class="dead-section">
      <v-row>
        <!-- System Detail -->
        <v-col cols="12" md="6">
          <v-card-title>
            <!-- User System Icon -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" @click="openUserSystemDialog" color="primary" class="large-icon">
                  mdi-account-multiple
                </v-icon>
              </template>
              <span>User system</span>
            </v-tooltip>
            <v-dialog v-model="userSystemDialog" max-width="800px">
              <user-system :systemData="systemData" :userSystems="userSystems"></user-system>
            </v-dialog>
            <strong>System:</strong> {{ systemData.system_nameEN || "Wait for name" }}
          </v-card-title>
          <v-card-subtitle>
            ระบบ: {{ systemData.system_nameTH || "รอการตั้งชื่อ" }}<br />
            Total Screen: {{ systemData.screen_count || 0 }} screens<br />
            Plan: {{ formatDate(systemData.system_plan_start) || "Not determined" }}
            To {{ formatDate(systemData.system_plan_end) || "Not determined" }}<br />
            Manday: {{
              systemData.system_manday !== null && !isNaN(systemData.system_manday)
                ? Math.round(systemData.system_manday)
                : 0
            }} days<br />
          </v-card-subtitle>
        </v-col>
        <!-- Progress Detail -->
        <v-col cols="12" md="6" class="circular-progress-right">
          <div class="progress">
            <circular-progress style="margin-top: 20px" :value="parseInt(systemData.system_progress)" label="System" />
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Search Section -->
    <div class="search-section">
      <v-row>
        <!-- Search Bar -->
        <v-col cols="12" md="8">
          <v-text-field  label="Search" append-icon="mdi-magnify" @input="searchScreens" outlined
            placeholder="search by name" dense></v-text-field>
        </v-col>
        <!-- Add and History Buttons -->
        <v-col cols="12" md="4">
          <v-row>
            <v-col cols="6">
              <v-btn v-if="!isRestrictedPosition" color="primary" block @click="openAddScreenDialog">Add screen</v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn v-if="!isRestrictedPosition" color="error" block @click="openHistoryDialog">
                <v-icon class="white--text">mdi-history</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>

    <!-- Screen Cards -->
    <div class="screen-cards">
      <v-container fluid>
        <v-row dense>
          <v-col v-for="screen in paginatedScreens" :key="screen.id" class="screen-card-col">
            <ScreenCard :userSystems="userSystems" :screenProjectId="systemData.project_id"
              :screenSystemId="systemData.id" :screenId="screen.id" :screenCode="screen.screen_code"
              :screenName="screen.screen_name" :screenLevel="screen.screen_level" :screenStatus="screen.screen_status"
              :screenProgress="Number(screen.screen_progress)" :screenPlanStartDate="screen.screen_plan_start"
              :screenPlanEndDate="screen.screen_plan_end" :screenActualStartDate="screen.screen_actual_start"
              :screenActualEndDate="screen.screen_actual_end" :ImageSrc="screen.screen_pic"
              :design-progress="screen.screen_progress_status_design" :dev-progress="screen.screen_progress_status_dev"
              :isRestrictedPosition="isRestrictedPosition" @click="navigateToScreen(screen.id)" @update="handleUpdate"
              @delete="handleDeleteScreen" @submit-edit="handleSubmitEdit" />
          </v-col>
        </v-row>
      </v-container>

      <!-- Pagination -->
      <v-pagination v-model="page" :length="totalPages" :total-visible="5" class="pagination"></v-pagination>
    </div>
    <!-- Dialogs -->
    <v-dialog v-model="addScreenDialog" max-width="800px">
      <add-form :users="userSystems" :systemId="systemid" :projectId="systemData.project_id"
        @closeDialog="handleCloseDialog" @reload="reloadPage"></add-form>
    </v-dialog>
    <v-dialog v-model="historyDialog" max-width="800px">
      {{ systemid }}
      <srceenHistory :systemId="systemid" @close-dialog="closeHistoryDialog"></srceenHistory>
    </v-dialog>
  </div>
</template>


<script>
import Swal from "sweetalert2";
import axios from "axios";
import CircularProgress from "~/components/Progress_tracking/systems/circularProgress.vue";
import userSystem from "~/components/Progress_tracking/systems/userSystem.vue";
import ScreenCard from "~/components/Progress_tracking/systems/ScreenCard.vue";
import AddForm from "~/components/Progress_tracking/systems/addForm.vue";
import srceenHistory from "~/components/Progress_tracking/systems/srceenHistory.vue";
import { decodeId, encodeId } from "@/utils/crypto";

export default {
  head() {
    return {
      title: "ManageScreen",
    };
  },
  components: {
    CircularProgress,
    ScreenCard,
    AddForm,
    srceenHistory,
    userSystem,
  },
  layout: "admin",
  middleware: "auth",
  data() {
    return {
      user: this.$auth.user,
      systemid: null,
      projectId: null,
      system: null,
      allScreens: [],
      screens: [],
      users: [],
      userSystems: [],
      search: "",
      page: 1,
      itemsPerPage: 12,
      totalPages: 0,
      addScreenDialog: false,
      historyDialog: false,
      userSystemDialog: false,
      systemData: "",
    };
  },
  computed: {
    filteredScreens() {
      if (!this.search) {
        console.log("No search active, returning all screens");
        return this.allScreens; // Return all screens if there's no search
      }
      const searchTerm = this.search.toLowerCase();
      return this.allScreens.filter(
        (screen) =>
          (screen.screen_name && screen.screen_name.toLowerCase().includes(searchTerm)) ||
          (screen.screen_code && screen.screen_code.toLowerCase().includes(searchTerm))
      );
    },
    paginatedScreens() {
      console.log("Page:", this.page); // Debugging the current page
      console.log("Total Pages:", this.totalPages); // Debugging total pages
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredScreens.slice(start, end); // Paginate based on filtered or all screens
    },
    isRestrictedPosition() {
      return this.user && (this.user.user_position === "Developer" || this.user.user_position === "Implementer");
    },
  },
  watch: {
    allScreens(newAllScreens) {
      this.page = 1; // Reset page when screens are loaded
      this.totalPages = Math.ceil(newAllScreens.length / this.itemsPerPage);
    },
    filteredScreens(newFilteredScreens) {
      this.page = 1; // Reset page when filtered screens change
      this.totalPages = Math.ceil(newFilteredScreens.length / this.itemsPerPage);
    },
  },
  async asyncData({ params, $axios, error }) {
    const encodedId = params.id;
    const decodedId = decodeId(encodedId);

    if (!decodedId) {
      return error({ statusCode: 400, message: "Invalid Project ID" });
    }

    try {
      const systemResponse = await $axios.$get(`/systems/getOne/${decodedId}`);
      const screensResponse = await $axios.$get(`/screens/getAll`, {
        params: { system_id: decodedId },
      });
      const userSystemsResponse = await $axios.$get(`/user_systems/getAllSystemId/${decodedId}`);

      return {
        systemData: systemResponse,
        screens: screensResponse,
        systemid: decodedId,
        userSystems: userSystemsResponse,
        allScreens: screensResponse,
      };
    } catch (err) {
      return error({ statusCode: 404, message: "Data not found" });
    }
  },
  mounted() {
    this.searchScreens();
    console.log("Mounted user systems:", this.userSystems);
  },
  methods: {
    async refetchScreens() {
      try {
        const screensResponse = await this.$axios.$get(`/screens/getAll`, {
          params: { system_id: this.systemid },
        });
        this.allScreens = screensResponse;
        this.screens = screensResponse;
      } catch (error) {
        console.error("Error fetching screens:", error);
      }
    },
    searchScreens() {
      const searchTerm = this.search.toLowerCase();
      this.screens = this.allScreens.filter(
        (screen) =>
          (screen.screen_name && screen.screen_name.toLowerCase().includes(searchTerm)) ||
          (screen.screen_code && screen.screen_code.toLowerCase().includes(searchTerm))
      );
      this.page = 1;
      this.totalPages = Math.ceil(this.screens.length / this.itemsPerPage);
    },
    formatDate(dateString) {
      if (!dateString) return null;
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options).replace(/\//g, '-');
    },
    openAddScreenDialog() {
      this.addScreenDialog = true;
    },
    openHistoryDialog() {
      this.historyDialog = true;
    },
    openUserSystemDialog() {
      this.userSystemDialog = true;
    },
    closeUserSystemDialog() {
      this.userSystemDialog = false;
    },
    navigateToScreen(screenId) {
      const encodedScreenId = encodeURIComponent(encodeId(screenId));
      this.$router.push(`/Progress_Tracking/manageTasks_Progress_Tracking/${encodedScreenId}`);
    },
    handleUpdate() {
      console.log("update");
    },
    handleCloseDialog() {
      this.addScreenDialog = false;
    },
    closeHistoryDialog() {
      this.historyDialog = false;
      this.$router.go();
    },
    reloadPage() {
      this.refetchScreens();
    },
    getUserNamesByPosition(position) {
      return this.users
        .filter((user) => user.user_position === position)
        .map((user) => `${user.user_firstname} ${user.user_lastname}`)
        .join(", ");
    },
    async handleDeleteScreen(screenId) {
      try {
        await axios.delete(`http://localhost:7777/screens/delete/${screenId}`);
        await this.reloadPage();
      } catch (error) {
        console.error("Failed to delete screen:", error);
      }
    },
    async handleSubmitEdit(updatedScreen) {
      const screenId = updatedScreen.screenId;
      const screenData = {
        screen_code: updatedScreen.screenCode,
        screen_name: updatedScreen.screenName,
        screen_level: updatedScreen.screenLevel,
        screen_pic: updatedScreen.imageFile,
      };

      try {
        const response = await axios.put(
          `http://localhost:7777/screens/updateScreen/${screenId}`,
          screenData
        );

        if (response.status === 200) {
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Screen updated successfully",
            confirmButtonColor: "#009933",
          });
          await this.reloadPage();
        } else {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update the screen",
            confirmButtonColor: "#009933",
          });
        }
      } catch (error) {
        console.error("An error occurred while updating the screen:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred",
          confirmButtonColor: "#009933",
        });
      }
    },
  },
};
</script>

<style scoped>
.circular .custom-card {
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 30px;
  height: auto;
  display: flex;
  align-items: center;
}

.custom-height {
  height: 30px;
}

.custom-shadow {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.search-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.circular-progress-right {
  display: flex;
  justify-content: flex-end;
}

.large-icon {
  font-size: 40px;
}

.screen-card-col {
  flex: 0 0 325px;
  /* Set fixed width for each column */
  margin: 10px;
  /* Adjust spacing between cards */
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>