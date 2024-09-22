<template>
  <div>
    <v-card class="d-flex">
      <v-row style="height: 220px">
        <v-col>
          <v-card-title>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" @click.stop="showUserDialog = true" color="#009933" size="45px">
                  mdi-account-multiple
                </v-icon>
              </template>
              <span>Show User In Screen</span>
            </v-tooltip>

            Screen Name : {{ screenDetails.screen_name }}
          </v-card-title>
          <v-card-subtitle>
            Screen Manday :
            {{ screenDetails.screen_manday ? screenDetails.screen_manday : "0" }}
            days<br />
            Tasks Count : {{ screenDetails.task_count }} tasks<br />
            Screen Plan :
            {{
            screenDetails.screen_plan_start && screenDetails.screen_plan_end
            ? formatDate(screenDetails.screen_plan_start) +
            " To " +
            formatDate(screenDetails.screen_plan_end)
            : "Not determined"
            }}
          </v-card-subtitle>
        </v-col>
        <v-col class="progress-container">
          <div>
            <v-row>
              <div class="custom-progress">
                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="360" :size="100" :width="15" :value="parseInt(screenDetails.screen_progress_status_design) || 0
                    " color="purple">
                    {{ parseInt(screenDetails.screen_progress_status_design) || 0 }}%
                  </v-progress-circular>
                  <v-card-subtitle class="subtitle">Design</v-card-subtitle>
                </v-col>
              </div>

              <div class="custom-progress">
                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="-90" :size="100" :width="15" :value="parseInt(screenDetails.screen_progress_status_dev) || 0
                    " color="blue">
                    {{ parseInt(screenDetails.screen_progress_status_dev) || 0 }}%
                  </v-progress-circular>
                  <v-card-subtitle class="subtitle">Develop</v-card-subtitle>
                </v-col>
              </div>

              <div class="custom-progress">
                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="-90" :size="100" :width="15" :value="parseInt(screenDetails.screen_progress_status_testing) || 0
                    " color="orange">
                    {{ parseInt(screenDetails.screen_progress_status_testing) || 0 }}%
                  </v-progress-circular>
                  <v-card-subtitle class="subtitle">Test</v-card-subtitle>
                </v-col>
              </div>

              <div class="custom-progress">
                <v-col cols="auto" class="progress-item">
                  <v-progress-circular class="my-progress" :rotate="90" :size="100" :width="15"
                    :value="parseInt(screenDetails.screen_progress) || 0" :color="getProgressColor(parseInt(screenDetails.screen_progress) || 0)
                      ">
                    {{ parseInt(screenDetails.screen_progress) || 0 }}%
                  </v-progress-circular>
                  <v-card-subtitle class="subtitle">Total</v-card-subtitle>
                </v-col>
              </div>
            </v-row>
          </div>
        </v-col>

      </v-row>

      <v-dialog v-model="showUserDialog" max-width="40%">
        <v-card>
          <userScreen :screenData="screenDetails" />
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>

<script>
import userScreen from "./userScreen.vue";
export default {
  components: {
    userScreen,
  },
  props: {
    screenDetails: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
    
      showUserDialog: false,
    };
  },
  mounted() {
    
  },
  methods: {
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
    formatDate(dateString) {
      if (!dateString) return "Not determined";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
};
</script>

<style scoped>
.progress-container {
  display: flex;
  align-items: center;
  /* จัดตำแหน่งแนวตั้งตรงกลาง */
  justify-content: flex-end;
  /* จัดแนวนอนชิดขวา */
}

.custom-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
  padding: 10px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.subtitle {
  /* เพิ่มระยะห่างระหว่าง progress กับ subtitle */
  font-size: 1rem;
  text-align: center;
}
</style>
