<template>
  <v-app dark>
    <!-- Navigation drawer -->
    <v-navigation-drawer persistent app>
      <!-- Logo -->
      <v-list-item class="pt-1 pb-5">
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            <v-layout align-center justify-center>
              <!-- Main logo -->
              <nuxt-link to="/">
                <v-img
                  lazy-src="/mainlogo.png"
                  max-height="150"
                  max-width="100"
                  src="/mainlogo.png"
                ></v-img>
              </nuxt-link>
            </v-layout>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- Home button -->
      <v-list class="pt-0" dense rounded>
        <v-list-item @click="navigateTo('/')">
          <v-list-item-action>
            <v-icon color="black">mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Project button -->
      <v-list class="pt-0" dense rounded>
        <v-list-item
          @click="
            navigateTo('/Progress_Tracking/ManageProject_Progress_Tracking')
          "
        >
          <v-list-item-action>
            <v-icon color="black">mdi-puzzle</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Project</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- ManageUsers button -->
      <v-list class="pt-0" dense rounded>
        <v-list-item
          v-if="user_role == 'Admin'"
          @click="navigateTo('/ManageUser')"
        >
          <v-list-item-action>
            <v-icon color="black">mdi-account</v-icon>
            <!-- ใส่ไอคอนที่ต้องการ -->
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title color="red">ManageUsers</v-list-item-title>
            <!-- ข้อความที่ต้องการ -->
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Admin menu items -->
      <v-list class="pa-0" v-show="user_role == 'SuperAdmin'" dense rounded>
        <!-- ติดตามงาน Menu -->
        <v-list-group
          v-model="reportActiveworktracking"
          :prepend-icon="'mdi-pencil'"
          no-action
          class="pl-2"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>TrackProgress</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            @click="navigateTo('/Progress_Tracking/Dashbord_Progress_Tracking')"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-table-edit</v-icon>
                Dashbord
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            @click="
              navigateTo('/Progress_Tracking/ManageProject_Progress_Tracking')
            "
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-puzzle</v-icon>
                Project
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <!-- รายงานปัญหา Menu -->
        <v-list-group
          v-model="reportIssueGroupActive"
          :prepend-icon="'mdi-alert-circle'"
          no-action
          class="pl-2"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>ReportIssue</v-list-item-title>
            </v-list-item-content>
          </template>

          <!-- <v-list-item @click="navigateTo('/custom/reportList')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2"
                  >mdi-format-list-bulleted</v-icon
                >
                แสดงรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item> -->
          <!-- 
          <v-list-item @click="navigateTo('/custom/reportCreate')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
                แจ้งรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item> -->

          <v-list-item
            @click="navigateTo('/Note_Management/Dashboard_Note_Management')"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-table</v-icon>
                Dashbord
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            @click="navigateTo('/Note_Management/Schedule_Note_Management')"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-calendar-month</v-icon>
                ตารางงาน
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- <v-list-item
            @click="navigateTo('/Note_Management/dashboard_Note_Management')"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-view-dashboard</v-icon>
                แดชบอร์ดรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item> -->
        </v-list-group>

        <!-- รายงานปัญหาเก่า -->
        <v-list-group
          v-for="(project, index) in project_issues"
          :key="index"
          :prepend-icon="project.action"
          no-action
          class="pl-2"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Report project list</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in project.projectList"
            :key="child.id"
            :to="`/Note_Management/issueList/${child?.id}`"
          >
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2"
                  >mdi-format-list-bulleted</v-icon
                >
                {{ child.project_name_ENG }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <!-- ManageUsers button -->
        <v-list class="pt-0" dense rounded>
          <v-list-item @click="navigateTo('/ManageUser')">
            <v-list-item-action>
              <v-icon color="black">mdi-account</v-icon>
              <!-- ใส่ไอคอนที่ต้องการ -->
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title color="red">ManageUsers</v-list-item-title>
              <!-- ข้อความที่ต้องการ -->
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-list>
      <!-- Logout button -->
      <v-list class="pt-0" dense rounded>
        <v-list-item @click="handleLogout()">
          <v-list-item-action>
            <v-icon color="red">mdi-logout</v-icon>
            <!-- ใส่ไอคอนที่ต้องการ -->
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title color="red">Log out</v-list-item-title>
            <!-- ข้อความที่ต้องการ -->
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- User information -->
      <template v-slot:append>
        <div class="pa-5">
          <v-card elevation="0">
            <v-row align="center">
              <v-col cols="2">
                <!-- User avatar -->
                <v-avatar size="40">
                  <img :src="user_pic" alt="User Avatar" />
                </v-avatar>
              </v-col>
              <v-col cols="8">
                <v-col>
                  <v-row>
                    <p class="ml-2 mb-0" style="font-size: 15px">
                      {{ user?.user_firstname }}
                    </p>
                  </v-row>
                  <v-row>
                    <p class="ml-2 mb-0" style="font-size: 15px">
                      {{ user?.user_role }}
                    </p>
                  </v-row>
                </v-col>
              </v-col>
              <v-col cols="2" class="pa-0">
                <!-- Edit Profile button with tooltip -->
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon to="/Profile" v-bind="attrs" v-on="on">
                      <v-icon small color="primary">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Edit Account</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App bar -->
    <v-app-bar
      :clipped-left="clipped"
      app
      style="height: 49px"
      class="app-bar"
      color="blacl"
      elevation="1"
      outlined
    >
      <!-- Back button -->
      <v-btn icon class="mb-3" color="primary" @click="goBack">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <!-- Forward button -->
      <v-btn icon class="mb-3" color="primary" @click="goForward">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>

      <!-- App title -->
      <v-toolbar-title class="app-title mb-3">
        <h4>Progress Tracking</h4>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Logout button -->
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  middleware: "auth",
  data() {
    return {
      user: this.$auth.user,
      reportActiveworktracking: false,
      reportIssueGroupActive: false,

      project_name_ENG: "",
      // Auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      clipped: false,

      user_role: "",
      user_position: "",
      ownProject: [],
      projectIds: [],

      logout: [
        {
          icon: "mdi-logout",
          title: "ออกจากระบบ",
        },
      ],

      project_issues: [
        {
          action: "mdi-alert-circle",
          active: false,
          title: "รายงานปัญหา",
        },
      ],

      menuOption: [],
      right: true,
      rightDrawer: false,
      title: "Note Management",
      user_pic: "",
    };
  },
  async mounted() {
    this.$store.dispatch("setDrawer", true);

    await this.$axios.get("/projects/getAll").then((res) => {
      res.data.forEach((project) => {
        project.active = false; // Initialize active property to false
      });
      this.project_issues[0].projectList = res.data;
    });
    await this.getUser();
    await this.getOwnProject();
  },
  async beforeDestroy() {
    this.$store.dispatch("setDrawer", false);
  },
  async created() {
    await this.getUser();
    await this.getOwnProject();
  },
  computed: {},
  methods: {
    goBack() {
      this.$router.back();
    },
    goForward() {
      this.$router.forward();
    },
    navigateTo(path) {
      window.location.href = path;
    },
    goBack() {
      this.$router.back();
    },
    // Function to go forward
    goForward() {
      this.$router.forward();
    },
    async getOwnProject() {
      await this.$axios
        .get("/user_projects/getOneUserID/" + this.$auth.user.id)
        .then((res) => {
          this.ownProject = res.data;
          this.projectIds = this.ownProject.map(
            (project) => project.project_id
          );
          const requests = this.projectIds.map((projectId) => {
            return this.$axios.get("/projects/getOne/" + projectId);
          });
          Promise.all(requests).then((responses) => {
            this.projectDetails.projectList = responses.map((res) => res.data);
          });
        });
    },
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.user_role = res.data[0]?.user_role;

          // ตรวจสอบค่า user_pic หากไม่มีค่าให้ใช้ default
          this.user_pic = res.data[0]?.user_pic || "/images/default_user.jpg";

          this.user_position = res.data[0]?.user_position;
        });
    },

    async handleLogout() {
      await this.$auth.logout();
      this.$router.push("/Login");
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}

.v-list-group >>> i {
  color: black;
}
.app-title {
  margin: left;
}
</style>
