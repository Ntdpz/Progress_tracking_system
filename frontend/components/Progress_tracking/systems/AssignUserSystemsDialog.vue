<template>
  <v-card>
    <v-card-title class="headline">
      Assign User to Systems: {{ systemsDetails.system_nameEN }}
    </v-card-title>
    <v-card-text>
      <!-- Select System Analyst -->
      <v-select
        v-model="selectedSystemAnalysts"
        :items="
          usersNotInProject.filter(
            (user) => user.user_position === 'System Analyst'
          )
        "
        label="Select System Analyst"
        item-text="user_firstname"
        item-value="id"
        multiple
        @click:append="checkSelectAll('System Analyst')"
      >
        <!-- Select All Option -->
        <template v-slot:prepend-item>
          <v-list-item @click="toggleSelectAll('System Analyst')">
            <v-list-item-content>{{
              isAllSelected("System Analyst") ? "Deselect All" : "Select All"
            }}</v-list-item-content>
          </v-list-item>
        </template>
        <!-- Selected User Chips -->
        <template v-slot:selection="{ item, index }">
          <v-chip
            v-if="item"
            :key="index"
            class="d-flex align-center"
            close
            @click:close="removeSystemAnalyst(item)"
          >
            <v-avatar left>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-avatar>
            {{ item.user_firstname }}
          </v-chip>
        </template>
        <!-- User List with Checkboxes -->
        <template v-slot:item="{ item }">
          <v-list-item>
            <v-checkbox v-model="selectedSystemAnalysts" :value="item.id" />
            <v-list-item-avatar>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                >{{ item.user_firstname }}
                {{ item.user_lastname }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <!-- Select Developer -->
      <v-select
        v-model="selectedDevelopers"
        :items="
          usersNotInProject.filter((user) => user.user_position === 'Developer')
        "
        label="Select Developer"
        item-text="user_firstname"
        item-value="id"
        multiple
        @click:append="checkSelectAll('Developer')"
      >
        <!-- Select All Option -->
        <template v-slot:prepend-item>
          <v-list-item @click="toggleSelectAll('Developer')">
            <v-list-item-content>{{
              isAllSelected("Developer") ? "Deselect All" : "Select All"
            }}</v-list-item-content>
          </v-list-item>
        </template>
        <!-- Selected User Chips -->
        <template v-slot:selection="{ item, index }">
          <v-chip
            v-if="item"
            :key="index"
            class="d-flex align-center"
            close
            @click:close="removeDeveloper(item)"
          >
            <v-avatar left>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-avatar>
            {{ item.user_firstname }}
          </v-chip>
        </template>
        <!-- User List with Checkboxes -->
        <template v-slot:item="{ item }">
          <v-list-item>
            <v-checkbox v-model="selectedDevelopers" :value="item.id" />
            <v-list-item-avatar>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                >{{ item.user_firstname }}
                {{ item.user_lastname }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>

      <!-- Select Implementer -->
      <v-select
        v-model="selectedImplementers"
        :items="
          usersNotInProject.filter(
            (user) => user.user_position === 'Implementer'
          )
        "
        label="Select Implementer"
        item-text="user_firstname"
        item-value="id"
        multiple
        @click:append="checkSelectAll('Implementer')"
      >
        <!-- Select All Option -->
        <template v-slot:prepend-item>
          <v-list-item @click="toggleSelectAll('Implementer')">
            <v-list-item-content>{{
              isAllSelected("Implementer") ? "Deselect All" : "Select All"
            }}</v-list-item-content>
          </v-list-item>
        </template>
        <!-- Selected User Chips -->
        <template v-slot:selection="{ item, index }">
          <v-chip
            v-if="item"
            :key="index"
            class="d-flex align-center"
            close
            @click:close="removeImplementer(item)"
          >
            <v-avatar left>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-avatar>
            {{ item.user_firstname }}
          </v-chip>
        </template>
        <!-- User List with Checkboxes -->
        <template v-slot:item="{ item }">
          <v-list-item>
            <v-checkbox v-model="selectedImplementers" :value="item.id" />
            <v-list-item-avatar>
              <img :src="getBase64Image(item.user_pic)" alt="User Avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                >{{ item.user_firstname }}
                {{ item.user_lastname }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-select>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="assignUsersToSystems">Assign Users</v-btn>
      <v-btn color="secondary" @click="closeDialog">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import Swal from "sweetalert2";

export default {
  props: {
    project_id: {
      type: Number,
      required: true,
    },
    systems_id: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      systemsDetails: {},
      usersNotInProject: [],
      selectedSystemAnalysts: [],
      selectedDevelopers: [],
      selectedImplementers: [],
      headers: [
        { text: "Avatar", value: "user_pic", sortable: false },
        { text: "Name", value: "user_name" },
        { text: "Position", value: "user_position" },
        { text: "Action", value: "action", sortable: false },
      ],
    };
  },
  computed: {
    filteredUsersNotInProject() {
      return this.usersNotInProject; // You can add filtering logic here if needed
    },
  },
  methods: {
    toggleSelectAll(position) {
      let selected = [];
      switch (position) {
        case "System Analyst":
          selected =
            this.selectedSystemAnalysts.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "System Analyst"
            ).length
              ? []
              : this.usersNotInProject
                  .filter((user) => user.user_position === "System Analyst")
                  .map((user) => user.id);
          this.selectedSystemAnalysts = selected;
          break;
        case "Developer":
          selected =
            this.selectedDevelopers.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "Developer"
            ).length
              ? []
              : this.usersNotInProject
                  .filter((user) => user.user_position === "Developer")
                  .map((user) => user.id);
          this.selectedDevelopers = selected;
          break;
        case "Implementer":
          selected =
            this.selectedImplementers.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "Implementer"
            ).length
              ? []
              : this.usersNotInProject
                  .filter((user) => user.user_position === "Implementer")
                  .map((user) => user.id);
          this.selectedImplementers = selected;
          break;
      }
    },
    isAllSelected(position) {
      switch (position) {
        case "System Analyst":
          return (
            this.selectedSystemAnalysts.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "System Analyst"
            ).length
          );
        case "Developer":
          return (
            this.selectedDevelopers.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "Developer"
            ).length
          );
        case "Implementer":
          return (
            this.selectedImplementers.length ===
            this.usersNotInProject.filter(
              (user) => user.user_position === "Implementer"
            ).length
          );
      }
      return false;
    },
    checkSelectAll(position) {
      if (this.isAllSelected(position)) {
        // Do not apply Select All logic
        return;
      }
    },
    removeSystemAnalyst(user) {
      this.selectedSystemAnalysts = this.selectedSystemAnalysts.filter(
        (id) => id !== user.id
      );
    },
    removeDeveloper(user) {
      this.selectedDevelopers = this.selectedDevelopers.filter(
        (id) => id !== user.id
      );
    },
    removeImplementer(user) {
      this.selectedImplementers = this.selectedImplementers.filter(
        (id) => id !== user.id
      );
    },
    async fetchSystemsDetails() {
      try {
        const response = await this.$axios.get(
          `/systems/getOne/${this.systems_id}`
        );
        this.systemsDetails = response.data;
      } catch (error) {
        console.error("Error fetching project details:", error);
        await Swal.fire({
          title: "Error!",
          text: "There was an issue fetching project details. Please try again.",
          icon: "error",
        });
      }
    },
    async fetchUsersNotInProject() {
      try {
        const response = await this.$axios.get(
          `/user_systems/checkUsersNotInSystem/${this.systems_id}/${this.project_id}`
        );
        this.usersNotInProject = response.data.map((user) => ({
          ...user,
          user_fullname: `${user.user_firstname} ${user.user_lastname}`,
        }));
      } catch (error) {
        console.error("Error fetching users not in project:", error);
        await Swal.fire({
          title: "Error!",
          text: "There was an issue fetching users. Please try again.",
          icon: "error",
        });
      }
    },
    async assignUsersToSystems() {
      const allSelectedUsers = [
        ...this.selectedSystemAnalysts,
        ...this.selectedDevelopers,
        ...this.selectedImplementers,
      ];

      if (allSelectedUsers.length === 0) {
        await Swal.fire({
          title: "Warning!",
          text: "Please select at least one user to assign.",
          icon: "warning",
        });
        return;
      }

      try {
        // Call API to assign users to project
        await this.$axios.post("/user_systems/createUser_system", {
          user_ids: allSelectedUsers,
          project_id: this.project_id,
          system_id: this.systems_id,
        });
        await Swal.fire({
          title: "Success!",
          text: "Users assigned successfully.",
          icon: "success",
          confirmButtonColor: "#009933",
        });

        // Clear the selected users in all select boxes
        this.selectedSystemAnalysts = [];
        this.selectedDevelopers = [];
        this.selectedImplementers = [];

        this.fetchUsersNotInProject();
        this.$emit("usersAssigned");
        this.closeDialog();
      } catch (error) {
        console.error("Error assigning users to project:", error);
        await Swal.fire({
          title: "Error!",
          text: "There was an issue assigning the users. Please try again.",
          icon: "error",
          confirmButtonColor: "#009933",
        });
      }
    },
    closeDialog() {
      this.$emit("close");
      this.selectedSystemAnalysts = [];
      this.selectedDevelopers = [];
      this.selectedImplementers = [];
    },
    getBase64Image(base64String) {
      if (!base64String) {
        return "";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        return base64String;
      } else {
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
    selectAllUsers() {
      // ตรวจสอบว่ามีการเลือกผู้ใช้ทั้งหมดแล้วหรือยัง
      if (this.selectedUsers.length === this.filteredUsersNotInProject.length) {
        // หากเลือกทั้งหมดแล้ว ให้ยกเลิกการเลือกทั้งหมด
        this.selectedUsers = [];
      } else {
        // หากยังไม่เลือกทั้งหมด ให้เลือกผู้ใช้ทั้งหมด
        this.selectedUsers = this.filteredUsersNotInProject.map(
          (user) => user.id
        );
      }
    },
    removeUser(user) {
      const index = this.selectedUsers.indexOf(user.id);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      }
    },
  },

  watch: {
    project_id(newVal) {
      if (newVal) {
        this.fetchSystemsDetails();
        this.fetchUsersNotInProject();
      }
    },
  },
  mounted() {
    if (this.project_id) {
      this.fetchSystemsDetails();
      this.fetchUsersNotInProject();
    }
  },
};
</script>
