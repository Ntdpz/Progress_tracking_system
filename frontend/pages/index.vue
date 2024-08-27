<template>
  <div class="greeting-container">
    <Greeting />
  </div>
</template>

<script>
import Greeting from "../components/project/Greeting.vue";
export default {
  middleware: "auth",
  layout: "admin",
  components: {
    Greeting,
  },
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
    // เช็คตำแหน่งของ user
    if (this.user.user_position === "Developer") {
      // รีไดเรกไปยัง /Progress_Tracking/Dev
      this.$router.push("/Progress_Tracking/Dashbord");
    }
  },
  methods: {},
};
</script>

