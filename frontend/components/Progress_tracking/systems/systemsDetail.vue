<!-- projectDetail.vue -->
<template>
  <v-card>
    <v-row style="height: 220px">
      <v-col>
        <v-card-title>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                @click.stop="showUserDialog = true"
                color="#009933"
                size="45px"
              >
                mdi-account-multiple
              </v-icon>
            </template>
            <span>Show User In Project</span>
          </v-tooltip>

          System name Thai : {{ systemData.system_nameTH }}
        </v-card-title>
        <v-card-subtitle>
          System Name Eng : {{ systemData.system_nameEN }} <br />
          System Shortname : {{ systemData.system_shortname }} <br />
          System Manday :
          {{ systemData.system_manday ? systemData.system_manday : "0" }}
          days<br />
          Screen Count : {{ systemData.screen_count }} screens<br />
          Project Plan :
          {{
            systemData.system_plan_start && systemData.system_plan_end
              ? formatDate(systemData.system_plan_start) +
                " To " +
                formatDate(systemData.system_plan_end)
              : "Not determined"
          }}
        </v-card-subtitle>
      </v-col>
      <v-col class="progress-container">
        <div class="custom-progress">
          <v-progress-circular
            :value="parseInt(systemData.system_progress) || 0"
            :color="getProgressColor(parseInt(systemData.system_progress) || 0)"
            :size="100"
            :rotate="360"
            :width="15"
          >
            {{ parseInt(systemData.system_progress) || 0 }} %
          </v-progress-circular>
          <v-card-subtitle>System Progress</v-card-subtitle>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="showUserDialog" max-width="40%">
      <v-card>
        <userSystems :systemData="systemData" />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import userSystems from "./userSystem.vue";
export default {
  components: {
    userSystems,
  },
  props: {
    systemData: {
      type: Object, // เปลี่ยนเป็น Object
      required: true,
    },
  },
  data() {
    return {
      showUserDialog: false,
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "Not determined";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    getProgressColor(progress) {
      if (progress >= 75 && progress <= 100) {
        return "#4CAF50"; // สีเขียว
      } else if (progress >= 51 && progress <= 74) {
        return "#03A9F4"; // สีฟ้า
      } else if (progress >= 26 && progress <= 50) {
        return "#FFD700"; // สีเหลืองทอง
      } else if (progress >= 0 && progress <= 25) {
        return "#FC8705"; // สีส้ม
      }
      return "#000000"; // สีดำเป็นค่าเริ่มต้นถ้าค่าผิดพลาด
    },
  },
};
</script>

<style scope>
.progress-container {
  display: flex;
  align-items: center; /* จัดตำแหน่งแนวตั้งตรงกลาง */
  justify-content: flex-end; /* จัดแนวนอนชิดขวา */
}

.custom-progress {
  display: flex;
  flex-direction: column; /* ให้เนื้อหาภายในจัดแนวในแนวตั้ง */
  align-items: center; /* จัดแนวให้อยู่ตรงกลางในแนวตั้ง */

  margin: 20px; /* เพิ่มระยะห่างรอบๆ ขอบของ div */
  padding: 10px; /* เพิ่มระยะห่างภายใน div */
}
</style>