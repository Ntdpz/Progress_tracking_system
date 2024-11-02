<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <h1>task_count</h1>
      <v-card-title class="headline">
        Task Details for {{ user.user_firstname }} {{ user.user_lastname }}
      </v-card-title>
      <v-card-text>
        <div>
          <p><strong>User ID:</strong> {{ user.user_id }}</p>
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
      required: true,
    },
  },
  mounted() {
    window.addEventListener("keydown", this.handleKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      if (event.key === "Escape") {
        this.closeDialog();
      }
    },
    closeDialog() {
      this.$emit("update:dialog", false); // Emit the event to close the dialog
    },
  },
};
</script>
