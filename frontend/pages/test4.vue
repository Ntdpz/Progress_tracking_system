
<template>
  <div>
    <h1>{{ user.id }}</h1>
    <h1>{{ user.user_role }}</h1>
    <h1>สวัสดั DEV THX</h1>
    <v-container>
      <v-autocomplete
        v-model="selectedItem"
        :items="items"
        label="Search and Select"
      ></v-autocomplete>
    </v-container>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      items: ["aaaaa 1", "bbbbb 2", "cccccc 3", "ddddd 4"],
      selectedItem: null,
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      screenId: "",
      screen: "",
      userdata: [],
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.id = res.data[0].id;
          this.userdata = res.data[0];
        });
    },
  },
};
</script>

<style>
</style>