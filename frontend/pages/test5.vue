
<template>
  <div>
    <h1>user ID :{{ user.id }}</h1>
    <h1>User Role : {{ user.user_role }}</h1>
    <testCOM/>
  </div>
</template>

<script>
import testCOM from "../components/testCOM.vue";
export default {
  middleware: "auth",
  layout: "admin",
  components: {
    testCOM,
  },
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
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