<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="items"
      item-key="id"
      class="elevation-1 with-grid-lines table-container"
      :items-per-page="10"
    >
      <template v-slot:top>
        <v-toolbar flat class="my-toolbar">
          <v-toolbar-title class="my-toolbar-title"
            >Responsible Screen</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-btn  @click="openSettings" class="my-toolbar-btn">
           see all
          </v-btn>
        </v-toolbar>
      </template>

      <!-- กำหนด columns ที่ต้องการแสดงในตาราง -->
      <template v-slot:item.screen_id="{ item }">
        <td>{{ item.screen_id }}</td>
      </template>
      <template v-slot:item.screen_name="{ item }">
        <td>{{ item.screen_name }}</td>
      </template>
      <template v-slot:item.screen_status="{ item }">
        <td>{{ item.screen_status }}</td>
      </template>
      <template v-slot:item.screen_level="{ item }">
        <td>{{ item.screen_level }}</td>
      </template>
      <template v-slot:item.screen_manday="{ item }">
        <td>{{ item.screen_manday ? `${item.screen_manday}` : "0" }}</td>
      </template>
      <template v-slot:item.screen_phase="{ item }">
        <td>{{ item.screen_phase }}</td>
      </template>
      <template v-slot:item.screen_progress="{ item }">
        <td>{{ item.screen_progress }}</td>
      </template>
      <template v-slot:item.screen_progress_status_testing="{ item }">
        <td>
          {{
            item.screen_progress_status_testing
              ? `${item.screen_progress_status_testing}%`
              : "0%"
          }}
        </td>
      </template>
      <template v-slot:item.screen_plan_start="{ item }">
        <td>
          {{
            item.screen_plan_start &&
            !isNaN(new Date(item.screen_plan_start).getTime())
              ? new Date(item.screen_plan_start).toLocaleDateString()
              : "Not determined"
          }}
        </td>
      </template>
      <template v-slot:item.screen_plan_end="{ item }">
        <td>
          {{
            item.screen_plan_end &&
            !isNaN(new Date(item.screen_plan_end).getTime())
              ? new Date(item.screen_plan_end).toLocaleDateString()
              : "Not determined"
          }}
        </td>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import "./CSS/Dashbord_ResponsibleScreen.css"; // นำเข้า CSS
export default {
  middleware: "auth", // ใช้ middleware auth เพื่อให้แน่ใจว่าผู้ใช้ได้รับการตรวจสอบสิทธิ์แล้ว
  data() {
    return {
      items: [],

      headers: [
        { text: "Screen ID", value: "screen_id", align: "center" },
        { text: "Screen Name", value: "screen_name", align: "center" },
        { text: "Status", value: "screen_status", align: "center" },
        { text: "Level", value: "screen_level", align: "center" },
        { text: "Manday", value: "screen_manday", align: "center" },
        { text: "Phase", value: "screen_phase", align: "center" },
        { text: "Progress", value: "screen_progress", align: "center" },
        {
          text: "Testing Status",
          value: "screen_progress_status_testing",
          align: "center",
        },
        { text: "Plan Start", value: "screen_plan_start", align: "center" },
        { text: "Plan End", value: "screen_plan_end", align: "center" },
      ],
    };
  },
  async created() {
    await this.GetResponsibleScreen();
  },
  methods: {
    async GetResponsibleScreen() {
      try {
        const userId = this.$auth.user.id; // ดึง user ID จาก $auth.user
        const response = await this.$axios.$get(
          `/dashboard/user-screens/${userId}`
        ); // ใช้ axios เพื่อเรียกข้อมูลจาก API
        this.items = response; // สมมติว่า response เป็นอาร์เรย์ของข้อมูล
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
};
</script>
