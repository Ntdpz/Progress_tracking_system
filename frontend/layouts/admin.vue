<template>
  <v-app dark>
    <!-- Navigation drawer -->
    <v-navigation-drawer v-model="drawer" :clipped="clipped" app>
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

      <!-- Main menu items -->
      <v-list class="pb-0" dense rounded>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
          color="primary"
        >
          <v-list-item-action>
            <v-icon color="black">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Admin menu items -->
      <v-list class="pa-0" v-show="user_role == 'Admin'" dense rounded>
        <v-list-group
          v-for="(project, index) in items3"
          :key="index"
          v-model="project.active"
          :prepend-icon="project.action"
          no-action
          class="pl-2"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>รายงานปัญหาเก่า</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in project.projectList"
            :key="child.id"
            :to="`/issueList/${child?.id}`"
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

        <!-- Report Issue Menu -->
        <v-list-group :prepend-icon="'mdi-alert-circle'" no-action class="pl-2">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>รายงานปัญหา</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item @click="navigateTo('/custom/reportList')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2"
                  >mdi-format-list-bulleted</v-icon
                >
                แสดงรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="navigateTo('/custom/reportCreate')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
                แจ้งรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="navigateTo('/Note_Management/dashboard')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-table</v-icon>
                Dashbord
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>

      <!-- User menu items -->
      <v-list class="pt-0 pb-0" v-show="user_role == 'User'" dense rounded>
        <v-list-group
          v-for="(project, index) in projectDetails"
          :key="index"
          v-model="project.active"
          :prepend-icon="project.action"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{ project.title }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            v-for="child in projectDetails.projectList"
            :key="child.title"
            :to="`/issueList/${child[0]?.id}`"
          >
            <v-list-item-content>
              <v-list-item-title
                ><v-icon color="primary" class="mr-2"
                  >mdi mdi-format-list-bulleted</v-icon
                >{{ child?.project_name_ENG }}</v-list-item-title
              >
            </v-list-item-content>
          </v-list-item>
        </v-list-group>

        <!-- Report Issue Menu -->
        <v-list-group :prepend-icon="'mdi-alert-circle'" no-action>
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>รายงานปัญหา</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item @click="navigateTo('/custom/reportList')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2"
                  >mdi-format-list-bulleted</v-icon
                >
                แสดงรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="navigateTo('/custom/reportCreate')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
                แจ้งรายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="navigateTo('/custom/reportCreate')">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon color="primary" class="mr-2">mdi-pencil</v-icon>
                Dashbord รายงานปัญหา
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list>

      <!-- Additional menu items -->
      <v-list class="pt-0" dense rounded>
        <v-list-item
          v-for="(item, i) in filteredItems"
          :key="i"
          :to="item.to"
          router
          color="primary"
          exact
        >
          <v-list-item-action>
            <v-icon color="black">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Logout button -->
      <v-list class="pt-0" dense rounded>
        <v-list-item
          v-for="(item, i) in logout"
          :key="i"
          router
          exact
          color="error"
          @click="handleLogout()"
        >
          <v-list-item-action>
            <v-icon color="error">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
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
                <!-- Edit profile button -->
                <v-btn icon to="/profile"
                  ><v-icon small color="primary">mdi-pencil</v-icon></v-btn
                >
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
      color="white"
      elevation="1"
      outlined
    >
      <!-- Navigation drawer toggle button -->
      <v-app-bar-nav-icon
        color="primary"
        @click.stop="drawer = !drawer"
        class="mb-3"
      />

      <!-- App title -->
      <v-toolbar-title class="mb-3">
        <h4>Progress Tracking</h4>
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Back button -->
      <v-btn icon class="mb-3" color="primary" @click="goBack">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>

      <!-- Forward button -->
      <v-btn icon class="mb-3" color="primary" @click="goForward">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>

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
      project_name_ENG: "",
      // Auth
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      clipped: false,
      drawer: false,
      user_role: "",
      ownProject: [],
      projectIds: [],
      projectDetails: [
        // Existing items
        {
          action: "mdi-alert-circle",
          active: false,
          title: "รายงานปัญหา",
          projectList: [
            {
              id: 1,
              project_name_ENG: "แสดงรายงานปัญหา",
              path: "/custom/reportList",
            },
            {
              id: 2,
              project_name_ENG: "แจ้งรายงานปัญหา",
              path: "/custom/reportCreate",
            },
          ],
        },
      ],
      items: [
        {
          icon: "mdi-home",
          title: "หน้าหลัก",
          to: "/",
        },
      ],
      logout: [
        {
          icon: "mdi-logout",
          title: "ออกจากระบบ",
        },
      ],
      items3: [
        // Existing items
        {
          action: "mdi-alert-circle",
          active: false,
          title: "รายงานปัญหา",
          projectList: [
            {
              id: 1,
              project_name_ENG: "แสดงรายงานปัญหา",
              path: "/custom/reportList",
            },
            {
              id: 2,
              project_name_ENG: "แจ้งรายงานปัญหา",
              path: "/custom/reportCreate",
            },
          ],
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
    await this.$axios.get("/projects/getAll").then((res) => {
      res.data.forEach((project) => {
        project.active = false; // Initialize active property to false
      });
      this.items3[0].projectList = res.data;
    });
    await this.getUser();
    await this.getOwnProject();
  },
  async created() {
    await this.getUser();
    await this.getOwnProject();
  },
  computed: {
    filteredItems() {
      if (this.user_role === "Admin") {
        const items = this.menuOption.filter(
          (item) =>
            item.title !== "Manage User" &&
            item.title !== "Manage Project" &&
            item.title !== "Dashboard"
        );
        items.splice(0, 0, {
          icon: "mdi-view-dashboard",
          title: "แดชบอร์ดรายงานปัญหา",
          to: "/dashboard",
        });
        items.splice(0, 0, {
          icon: "mdi-account",
          title: "จัดการผู้ใช้งานระบบ",
          to: "/manageUser",
        });
        items.splice(0, 0, {
          icon: "mdi-border-all",
          title: "จัดการโครงการ",
          to: "/manageProject",
        });
        items.splice(0, 0, {
          icon: "mdi-table",
          title: "แดชบอร์ดติดตามความคืบหน้า",
          to: "/Dashbord_Project",
        });
        items.splice(0, 0, {
          icon: "mdi-calendar-month",
          title: "ตารางงาน",
          to: "/schedule",
        });
        return items;
      } else if (this.user_role === "User") {
        const items = this.menuOption.filter(
          (item) =>
            item.title !== "Manage User" &&
            item.title !== "Manage Project" &&
            item.title !== "Dashboard"
        );
        items.splice(0, 0, {
          icon: "mdi-calendar-month",
          title: "ตารางงาน",
          to: "/schedule",
        });
        items.splice(0, 0, {
          icon: "mdi-border-all",
          title: "จัดการโครงการ",
          to: "/manageProject",
        });
        items.splice(0, 0, {
          icon: "mdi-border-all",
          title: "จัดการงาน",
          to: "/task_management",
        });

        return items;
      } else {
        return this.menuOption;
      }
    },
  },
  methods: {
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
          this.user_pic = res.data[0]?.user_pic;
        });
    },
    async handleLogout() {
      await this.$auth.logout();
      this.$router.push("/login");
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
</style>
