<template>
  <div>
    <v-card class="d-flex theme-card">
      <v-row class="ma-2">
        <v-col>
          <v-card-title>
            {{ screenDetails.screen_name }}
          </v-card-title>
          <v-card-subtitle>
            Screen Plan Manday :
            {{ screenDetails.screen_manday || "0" }} days<br />
            Screen Actual Manday :
            {{ screenDetails.screen_actual_manday || "0" }} days<br />
            Tasks Count : {{ screenDetails.task_count }} tasks<br />
            Screen Plan :
            {{
              screenDetails.screen_plan_start && screenDetails.screen_plan_end
                ? formatDate(screenDetails.screen_plan_start) +
                  " To " +
                  formatDate(screenDetails.screen_plan_end)
                : "Not determined"
            }}<br />
            Screen Actual :
            {{
              screenDetails.screen_actual_start &&
              screenDetails.screen_actual_end
                ? formatDate(screenDetails.screen_actual_start) +
                  " To " +
                  formatDate(screenDetails.screen_actual_end)
                : "Not determined"
            }}
          </v-card-subtitle>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                @click.stop="showUserDialog = true"
                color="#009933"
                dark
                elevation="2"
                rounded
                class="d-flex align-center"
              >
                <v-icon left class="icon-style">mdi-account-multiple</v-icon>
                Show Member
              </v-btn>
            </template>
            <span>Show Member in Screen</span>
          </v-tooltip>
        </v-col>
        <v-col class="progress-container">
          <v-row>
            <v-col cols="3" class="progress-item">
              <v-progress-circular
                :rotate="360"
                :size="80"
                :width="10"
                :value="
                  parseInt(screenDetails.screen_progress_status_design) || 0
                "
                color="purple"
              >
                {{
                  parseInt(screenDetails.screen_progress_status_design) || 0
                }}%
              </v-progress-circular>
              <v-card-subtitle class="subtitle">Design</v-card-subtitle>
            </v-col>

            <v-col cols="3" class="progress-item">
              <v-progress-circular
                :rotate="-90"
                :size="80"
                :width="10"
                :value="parseInt(screenDetails.screen_progress_status_dev) || 0"
                color="blue"
              >
                {{ parseInt(screenDetails.screen_progress_status_dev) || 0 }}%
              </v-progress-circular>
              <v-card-subtitle class="subtitle">Develop</v-card-subtitle>
            </v-col>

            <v-col cols="3" class="progress-item">
              <v-progress-circular
                :rotate="-90"
                :size="80"
                :width="10"
                :value="
                  parseInt(screenDetails.screen_progress_status_testing) || 0
                "
                color="orange"
              >
                {{
                  parseInt(screenDetails.screen_progress_status_testing) || 0
                }}%
              </v-progress-circular>
              <v-card-subtitle class="subtitle">Test</v-card-subtitle>
            </v-col>

            <v-col cols="3" class="progress-item">
              <v-progress-circular
                :rotate="90"
                :size="80"
                :width="10"
                :value="parseInt(screenDetails.screen_progress) || 0"
                :color="
                  getProgressColor(parseInt(screenDetails.screen_progress) || 0)
                "
              >
                {{ parseInt(screenDetails.screen_progress) || 0 }}%
              </v-progress-circular>
              <v-card-subtitle class="subtitle">Total</v-card-subtitle>
            </v-col>
          </v-row>
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
  methods: {
    getProgressColor(progress) {
      if (progress >= 75 && progress <= 100) {
        return "#4CAF50"; // green
      } else if (progress >= 51 && progress <= 74) {
        return "#03A9F4"; // blue
      } else if (progress >= 26 && progress <= 50) {
        return "#FFD700"; // gold
      } else if (progress >= 0 && progress <= 25) {
        return "#FC8705"; // orange
      }
      return "#000000"; // default black
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
.theme-card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}
.progress-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.progress-item {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.subtitle {
  font-size: 1rem;
  font-weight: bold;
  color: #555;
}
.v-btn {
  transition: background-color 0.3s;
}
.v-btn:hover {
  background-color: #007a33;
}
.icon-style {
  font-size: 24px;
  color: #fff;
}
@media (max-width: 600px) {
  .progress-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>
