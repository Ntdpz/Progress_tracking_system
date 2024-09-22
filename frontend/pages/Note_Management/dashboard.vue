<template>
  <div class="content mx-auto">
    <v-container fluid class="mt-1 pl-16" height="100%">
      <v-card class="pa-2" tile outlined style="border: none; height: 100%">
        <v-row class="mb-0">
          <v-col col="6" sm="6" md="6" lg="6" class="pb-0">
            <!-- <v-text class="font-weight-bold" style="font-size: 24px"
              >โครงการของคุณ {{ user.user_position }}</v-text
            > -->
            <h2 class="pa-0 ma-0">Welcome , {{ user.user_position }}</h2>
          </v-col>
          <v-col col="6" sm="6" md="6" lg="6" class="pb-0">
            <v-text-field
              v-model="searchText"
              placeholder="Search"
              filled
              rounded
              outlinde
              prepend-inner-icon="mdi-magnify"
              dense
              style="width: 60%"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-simple-table fixed-header height="300px">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">ชื่อ</th>
                <th class="text-left">ความสำคัญ</th>
                <th class="text-left">ประเภท</th>
                <th class="text-left">สถานะ</th>
                <th class="text-left">วันกำหนดส่ง</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in issues" :key="item.issue_name">
                <td>{{ item.issue_name }}</td>
                <td>{{ item.issue_priority }}</td>
                <td>{{ item.issue_type }}</td>
                <td>{{ item.issue_status_developer }}</td>
                <td>{{ item.dateEnd }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </v-container>
  </div>
</template>
<script>
import Searchbar from "@/components/Searchbar.vue";
import moment from "moment";
export default {
  components: { Searchbar },
  layout: "admin",
  middleware: "auth",
  data() {
    return {
      //auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      dialog: false,
      dialog_newproject: false,
      query: "",
      ownProject: [],
      projectIds: [],
      projectDetails: [],
      searchText: "",
      //test
      projects: [],
      issues: [],
    };
  },
  created() {
    this.getOwnProject();
    this.getProject();
    this.getOwnIssue();
  },

  methods: {
    async getOwnProject() {
      await this.$axios
        .get("/user_projects/getOneUserID/" + this.$auth.user.id)
        .then((res) => {
          this.ownProject = res.data;

          // Extract the project IDs from the userProjects array
          this.projectIds = this.ownProject.map(
            (project) => project.project_id
          );

          // Fetch project details for each project ID
          const requests = this.projectIds.map((projectId) => {
            return this.$axios.get("/projects/getOne/" + projectId);
          });
          Promise.all(requests).then((responses) => {
            this.projectDetails = responses.map((res) => res.data);
          });
        });
    },
    async getOwnIssue() {
      if (this.$auth.user.user_position == "Developer") {
        await this.$axios
          .get("/issues/getOwnIssue/" + this.$auth.user.id)
          .then((res) => {
            this.issues = res.data;
            console.log("log", this.issues);

            // Loop through each issue and add the dateEnd property
            this.issues = this.issues.map((issue) => {
              const dateEnd = moment(issue.issue_end)
                .add(543, "years")
                .format("DD-MM-YYYY");
              return {
                ...issue,
                dateEnd: dateEnd,
              };
            });
            console.log("log2", this.issues);
          });
      } else if (this.$auth.user.user_position == "Implementer") {
        await this.$axios
          .get("/issues/getOwnIssueQC/" + this.$auth.user.id)
          .then((res) => {
            this.issues = res.data;
            console.log("log", this.issues);

            // Loop through each issue and add the dateEnd property
            this.issues = this.issues.map((issue) => {
              const dateEnd = moment(issue.issue_end)
                .add(543, "years")
                .format("DD-MM-YYYY");
              return {
                ...issue,
                dateEnd: dateEnd,
              };
            });
            console.log("log2", this.issues);
          });
      }
    },
    async getProject() {
      await this.$axios.get("/projects/getAll").then((res) => {
        this.projects = res.data;
      });
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

input[type="text"] {
  font-size: 16px;
  padding-left: 10px;
  outline: black;
}

@media (max-width: 599px) {
  .mx-4 {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>