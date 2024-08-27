<template>
  <v-container>
    <v-tabs v-model="tab" background-color="primary" dark slider-color="yellow">
      <v-tab>NON MY ISSUE</v-tab>
      <v-tab>NON PNI</v-tab>
      <v-tab>NON PNC</v-tab>
      <v-tab>NON NewREQTable</v-tab>
      <v-tab>NON Editing Completed</v-tab>
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
import AllTable from "/components/Note_Management/Screen_id/Dashbord_Table_non/AllTable.vue";
import PNITable from "/components/Note_Management/Screen_id/Dashbord_Table_non/PNITable.vue";
import PNCTable from "/components/Note_Management/Screen_id/Dashbord_Table_non/PNCTable.vue";
import NewREQTable from "/components/Note_Management/Screen_id/Dashbord_Table_non/NewREQTable.vue";
import EditingCompletedTable from "/components/Note_Management/Screen_id/Dashbord_Table_non/EditingCompletedTable.vue";
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
