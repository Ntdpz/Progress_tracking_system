<template>
  <div>
    <Loader v-if="isLoading" />
    <cardScreen :screenId="screenId" />

    <v-container>
      <v-row class="my-4" align="center">
        <!-- คอลัมน์ซ้ายสำหรับช่องค้นหา -->
        <v-col class="search-field" cols="12" md="8">
          <v-text-field
            v-model="searchQuery"
            label="ค้นหา"
            outlined
            dense
            prepend-icon="mdi-magnify"
            class="search-input"
          />
        </v-col>

        <!-- คอลัมน์ขวาสำหรับปุ่ม Add -->
        <v-col class="add-button" cols="12" md="4">
          <v-btn class="addButton">
            <v-icon>mdi-plus</v-icon>
            Add
          </v-btn>
        </v-col>
      </v-row>

      <h3>ปัญหาที่มีคนรับผิดชอบ</h3>
      <Issue_Table />

      <h3>ปัญหาที่ไม่มีคนรับผิดชอบ</h3>
      <Issue_Table_non />
    </v-container>
  </div>
</template>

<script>
import Loader from "../../../components/Loader.vue";
import cardScreen from "../../../components/Note_Management/Screen_id/cardScreen.vue";
import Issue_Table_non from "../../../components/Note_Management/Screen_id/Issue_Table_non.vue";
import Issue_Table from "../../../components/Note_Management/Screen_id/Issue_Table.vue";
import "./_id.css";

export default {
  middleware: "auth",
  layout: "admin",
  components: {
    Loader,
    cardScreen,
    Issue_Table_non,
    Issue_Table,
  },
  data() {
    return {
      isLoading: true,
      screenId: this.$route.params.id,
      searchQuery: "",
    };
  },
  watch: {
    "$route.params.id"(newId) {
      this.screenId = newId;
    },
  },
};
</script>

