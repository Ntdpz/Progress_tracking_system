<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="user_projects"
      item-key="id"
      class="styled-table"
      :items-per-page="5"
      align="center"
    >
      <template v-slot:top>
        <v-toolbar flat class="toolbar">
          <v-toolbar-title class="toolbar-title">
            User Projects : {{ project.project_name_ENG }}
          </v-toolbar-title>
        </v-toolbar>
      </template>

      <!-- image -->
      <template v-slot:item.user_pic="{ item }">
        <v-avatar size="36">
          <v-img :src="getBase64Image(item.user_pic)" />
        </v-avatar>
      </template>

      <!-- position -->
      <template v-slot:item.user_position="{ item }">
        <v-chip :color="getColor(item.user_position)" dark>
          {{ item.user_position }}
        </v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    project: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      headers: [
        { text: "Image", value: "user_pic" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position", align: "center" },
        { text: "Department", value: "user_department", align: "center" },
      ],
      user_projects: [],
    };
  },
  async created() {
    try {
      const projectId = this.project.id;
      const response = await this.$axios.$get(
        `/user_projects/getUserProjectsByProjectId/${projectId}`
      );
      this.user_projects = this.sortByPosition(response);
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    getColor(position) {
      switch (position) {
        case "Manager":
          return "#864F80";
        case "Developer":
          return "#374AAB";
        case "Tester":
          return "#359C73";
        default:
          return "grey";
      }
    },
    getBase64Image(base64String) {
      if (!base64String) {
        return "";
      }
      if (base64String.startsWith("data:image/jpeg;base64,")) {
        return base64String;
      } else {
        return `data:image/jpeg;base64,${base64String}`;
      }
    },
    sortByPosition(userProjects) {
      const positionOrder = ["System Analyst", "Developer", "Implementer"];
      return userProjects.sort((a, b) => {
        return (
          positionOrder.indexOf(a.user_position) -
          positionOrder.indexOf(b.user_position)
        );
      });
    },
  },
};
</script>
