<template>
  <v-container>
    <v-tabs v-model="tab" background-color="primary" dark slider-color="yellow">
      <v-tab>MY ISSUE</v-tab>
      <v-tab>PNI</v-tab>
      <v-tab>PNC</v-tab>
      <v-tab>NewREQTable</v-tab>
      <v-tab>Editing Completed</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <AllTable :items="AllTable" />
      </v-tab-item>

      <v-tab-item>
        <PNITable :items="PNITable" />
      </v-tab-item>

      <v-tab-item>
        <PNCTable :items="PNCTable" />
      </v-tab-item>

      <v-tab-item>
        <NewREQTable :items="NewREQTable" />
      </v-tab-item>

      <v-tab-item>
        <EditingCompletedTable :items="EditingCompletedTable" />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
import AllTable from "/components/Note_Management/Dashboard/Dashbord_Table/AllTable.vue";
import PNITable from "/components/Note_Management/Dashboard/Dashbord_Table/PNITable.vue";
import PNCTable from "/components/Note_Management/Dashboard/Dashbord_Table/PNCTable.vue";
import NewREQTable from "/components/Note_Management/Dashboard/Dashbord_Table/NewREQTable.vue";
import EditingCompletedTable from "/components/Note_Management/Dashboard/Dashbord_Table/EditingCompletedTable.vue";
export default {
  components: {
    AllTable,
    PNITable,
    PNCTable,
    NewREQTable,
    EditingCompletedTable,
  },
  data() {
    return {
      tab: 0, // ค่าเริ่มต้นของ tab
      AllTable: [], // ข้อมูลสำหรับ Admin
      PNITable: [], // ข้อมูลสำหรับ User
      PNCTable: [],
      NewREQTable: [],
      EditingCompletedTable: [],
    };
  },
  created() {},
  methods: {},
};
</script>

<style scoped>
/* เพิ่มสไตล์ของเพจที่นี่ */
</style>
