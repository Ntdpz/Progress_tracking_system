<template>
  <v-card class="d-flex theme-card">
    <v-row class="ma-2">
      <v-col cols="9" class="left-col">
        <!-- 70% -->
        <v-card-title>
          {{ project.project_name_TH }}
        </v-card-title>
        <v-card-subtitle>
          {{ project.project_name_ENG }} <br />
          Project Manday :
          {{ project.project_manday ? project.project_manday : "0" }} days<br />
          Systems Count : {{ project.system_count }} systems<br />
          Project Plan :
          {{
            project.project_plan_start && project.project_plan_end
              ? formatDate(project.project_plan_start) +
                " To " +
                formatDate(project.project_plan_end)
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
              <v-icon left>mdi-account-multiple</v-icon>
              Show Member
            </v-btn>
          </template>
          <span>Show Member in Project</span>
        </v-tooltip>
      </v-col>
      <v-col cols="3" class="progress-container right-col">
        <!-- 30% -->
        <div class="custom-progress">
          <v-progress-circular
            :value="parseInt(project.project_progress) || 0"
            :color="getProgressColor(parseInt(project.project_progress) || 0)"
            :size="100"
            :rotate="360"
            :width="15"
          >
            {{ parseInt(project.project_progress) || 0 }} %
          </v-progress-circular>
          <v-card-subtitle class="subtitle">Project Progress</v-card-subtitle>
        </div>
      </v-col>
    </v-row>

    <v-dialog v-model="showUserDialog" max-width="40%">
      <v-card>
        <userProject :project="project" />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import userProject from "./userProject.vue";
export default {
  components: {
    userProject,
  },
  props: {
    project: {
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

/* Add custom margin class */
.custom-margin {
  margin: 16px; /* Adjust as needed */
}

.subtitle {
  font-size: 1rem;
  font-weight: bold;
  color: #555;
}
</style>
