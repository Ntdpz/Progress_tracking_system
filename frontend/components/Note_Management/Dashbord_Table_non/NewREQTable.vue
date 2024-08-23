<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-key="id"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>NON New REQ Table</v-toolbar-title>
      </v-toolbar>
    </template>

    <template v-slot:item.id="{ item }">
      <td>{{ item.id }}</td>
    </template>
    <template v-slot:item.user_role="{ item }">
      <td>{{ item.user_role }}</td>
    </template>
    <!-- Add more slots for other columns as needed -->
  </v-data-table>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      headers: [
        { text: "ID", value: "id" },
        { text: "User Role", value: "user_role" },
        // เพิ่ม header อื่นๆ ตามที่ต้องการ
      ],
    };
  },
};
</script>

<style scoped>
/* เพิ่มสไตล์ของ Component ที่นี่ */
</style>
