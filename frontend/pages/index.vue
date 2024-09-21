<template>
  <div>
    <Loader v-if="$store.getters.isLoading" />

    <Greeting />
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import Greeting from "~/components/Greeting.vue";
export default {
  middleware: "auth",
  layout: "admin",
  components: {
    Greeting,
    Loader,
  },
  watch: {
    "$route.path": function (newPath) {
      this.$store.commit("SET_ROUTE_PATH", newPath);
    },
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
    // เริ่มต้นการโหลดข้อมูลและแสดง Loader
    this.$store.dispatch("setLoading", true);
    // เช็คตำแหน่งของ user
    if (this.user.user_role === "Admin") {
      // รีไดเรกไปยัง /Progress_Tracking/Dev
      this.$router.push("/");
    } else if (this.user.user_position === "Developer") {
      // รีไดเรกไปยัง /Progress_Tracking/Dev
      this.$router.push("/Progress_Tracking/Dashbord_Progress_Tracking");
    } else if (this.user.user_position === "Implementer") {
      this.$router.push("/Note_Management/dashboard");
    }
  },
  methods: {},
};
</script>

