<template>
  <div>
    <Loader v-if="$store.state.isLoading" />

    <h1 class="centered-heading">Dashboard</h1>

    <v-spacer></v-spacer>

    <div>
      <result_projects :userId="user.id" />

      <v-spacer></v-spacer>

      <v-container fluid>
        <v-row>
          <v-col
            v-for="(project, index) in projectsWithTasks"
            :key="project.id"
            cols="12"
            class="full-width-card"
          >
            <v-card class="full-card">
              <v-row>
                <v-tabs
                  v-model="project.tab"
                  color="primary"
                  slider-color="primary"
                  class="tabs"
                >
                  <v-tab class="custom-tab">ToDay</v-tab>
                  <v-tab class="custom-tab">All</v-tab>
                  <v-tab class="custom-tab">Closed Task</v-tab>
                </v-tabs>
              </v-row>
              <v-tabs-items v-model="project.tab">
                <v-tab-item>
                  <v-card class="full-card-tap">
                    <task_project_table :projectId="project.id" />
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card class="full-card-tap">
                    <all_task_user :projectId="project.id" />
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card class="full-card-tap">
                    <archive_task_table :projectId="project.id" />
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script>
import Loader from "@/components/Loader.vue";
import result_projects from "@/components/Progress_tracking/Dashbord/result_projects.vue";
import task_project_table from "@/components/Progress_tracking/Dashbord/task_project_table.vue";
import all_task_user from "@/components/Progress_tracking/Dashbord/all_task_user.vue";
import archive_task_table from "@/components/Progress_tracking/Dashbord/archive_task_table.vue";
import "./Dashbord.css";

export default {
  head() {
    return {
      title: "Dashbord",
    };
  },
  components: {
    Loader,
    result_projects,
    task_project_table,
    all_task_user,
    archive_task_table, // เพิ่ม archive_task_table สำหรับแถบจัดเก็บ
  },
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      projects: [],
    };
  },
  computed: {
    projectsWithTasks() {
      return this.projects.filter((project) => project.hasTasks !== false);
    },
  },
  async created() {
    this.$store.dispatch("setLoading", true);

    try {
      const { data: projectIds } = await this.$axios.get(
        `/user_projects/get_project_by_userid/${this.user.id}`
      );

      const projectsPromises = projectIds.map((id) =>
        this.$axios.get(`/projects/getOne/${id}`)
      );

      const projectsResponses = await Promise.all(projectsPromises);

      // กำหนดค่า default สำหรับ tab
      this.projects = projectsResponses.map((response) => ({
        ...response.data,
        hasTasks: true,
        tab: 0, // ใช้ค่า default ของแท็บสำหรับแต่ละโปรเจกต์
      }));
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      this.$store.dispatch("setLoading", false);
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$store.dispatch("setLoading", true);
    });
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch("setLoading", false);
    next();
  },
};
</script>

<style>
.centered-heading {
  color: #374aab;
  text-align: center;
}

.tabs {
  margin-bottom: 16px;
}
</style>
