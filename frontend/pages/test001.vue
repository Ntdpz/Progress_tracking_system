<template>
  <div>
    <!-- Search Box -->
    <v-text-field
      v-model="search"
      label="Search user"
      append-icon="mdi-magnify"
      single-line
      hide-details
      class="mb-6"
    />

    <!-- User Cards -->
    <v-row>
      <v-col
        v-for="user in filteredUsers"
        :key="user.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card class="my-card mt-4">
          <v-row>
            <!-- User Image -->
            <v-col cols="4" class="d-flex justify-center align-center">
              <v-img
                :src="getBase64Image(user.user_pic)"
                alt="User Image"
                height="100px"
                width="100px"
                class="rounded-circle"
              ></v-img>
            </v-col>

            <!-- User Details -->
            <v-col cols="8">
              <v-card-title>
                {{ user.user_firstname }} {{ user.user_lastname }}
              </v-card-title>
              <v-card-subtitle>
                {{ user.user_position }} - {{ user.user_department }}
              </v-card-subtitle>
              <v-card-text>User ID: {{ user.id }}</v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      users: [], // Stores all users data from the API
      search: "", // For the search input
    };
  },
  created() {
    this.getAllUsers();
  },
  computed: {
    filteredUsers() {
      if (!this.search) return this.users;
      return this.users.filter((user) => {
        const fullName =
          `${user.user_firstname} ${user.user_lastname}`.toLowerCase();
        const userPosition = user.user_position.toLowerCase();
        const userDepartment = user.user_department.toLowerCase();
        const searchTerm = this.search.toLowerCase();

        return (
          fullName.includes(searchTerm) ||
          userPosition.includes(searchTerm) ||
          userDepartment.includes(searchTerm)
        );
      });
    },
  },
  methods: {
    async getAllUsers() {
      try {
        const response = await this.$axios.get(
          "http://localhost:7777/users/getAll"
        );
        this.users = response.data;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    getBase64Image(base64String) {
      if (!base64String) {
        return "/images/default_user.jpg";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        return base64String;
      } else {
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
  },
};
</script>

<style scoped>
.my-card {
  margin-bottom: 16px;
}

.rounded-circle {
  border-radius: 50%;
}
</style>
