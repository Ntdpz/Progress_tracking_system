<template>
  <div>
    <v-data-table :headers="headers" :items="userProjects" item-key="id" class="styled-table" :items-per-page="5"
      align="center">
      <template v-slot:top>
        <v-toolbar flat class="toolbar">
          <v-toolbar-title class="toolbar-title">
            User Screen: {{ screenData.screen_name }}
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
        <div :style="{
          width: '120px',
          backgroundColor: getColor(item.user_position),
          color: 'white',
          borderRadius: '20px',
          textAlign: 'center',
          display: 'inline-block',
          paddingTop: '5px',
          paddingBottom: '5px',
        }">
          {{ item.user_position }}
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  props: {
    screenData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      headers: [
        { text: "Picture", value: "user_pic", align: "center" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position", align: "center" },
        { text: "Department", value: "user_department", align: "center" },
      ],
      userProjects: [], // ใช้ชื่อที่เหมาะสมตามข้อมูลของคุณ
    };
  },
  async created() {
    try {
      const screenId = this.screenData.screenId;
      const response = await this.$axios.$get(
        `/user_screens/getUserScreenByScreenId/${screenId}`
      );
      this.userProjects = this.sortByPosition(response);
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
