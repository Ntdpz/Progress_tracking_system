
<template>
  <div>

    <v-row>
      <h3>รายงานปัญหา หน้าจอ |</h3>
    </v-row>

    <v-row> </v-row>
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