<template>
  <div>
    <Loader v-if="isLoading" />
    <Greeting />
    <div>
      <Dashbord_ResponsibleScreen />

      <h3>ปัญหาที่มีคนรับผิดชอบ</h3>
      <Issue_Table />

      <h3>ปัญหาที่ไม่มีคนรับผิดชอบ</h3>
      <Issue_Table_non />
    </div>
  </div>
</template>

<script>
import Greeting from "/components/Greeting.vue";
import Issue_Table from "/components/Note_Management/Dashboard/Issue_Table.vue";
import Issue_Table_non from "/components/Note_Management/Dashboard/Issue_Table_non.vue";
import Dashbord_ResponsibleScreen from "/components/Note_Management/Dashboard/Dashbord_ResponsibleScreen.vue";
import Loader from "/components/Loader.vue";

export default {
  middleware: "auth",
  layout: "admin",
  components: {
    Greeting,
    Issue_Table,
    Issue_Table_non,
    Dashbord_ResponsibleScreen,
    Loader,
  },
  data() {
    return {
      isLoading: true,
      loggedIn: this.$auth.loggedIn,
      //   userdata: [],
    };
  },
  methods: {},
};
</script>
