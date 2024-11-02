<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <h1>task_count</h1>
      <v-card-title class="headline"
        >Task Details for {{ user.user_firstname }}
        {{ user.user_lastname }}</v-card-title
      >
      <v-card-text>
        <!-- แสดงรายละเอียดของ user ที่ถูกเลือก -->
        <div>
          <p><strong>user_id:</strong> {{ user.user_id }}</p>
          <p><strong>Position:</strong> {{ user.user_position }}</p>
          <p><strong>Department:</strong> {{ user.user_department }}</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="blue darken-1" text @click="closeDialog">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object,
      required: true, // ทำให้ต้องส่ง prop user เมื่อเรียกใช้งาน
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:dialog", false);
    },
  },
};
</script>
