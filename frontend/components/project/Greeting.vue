<template>
  <div>
    <v-row no-gutters class="mt-4 ">
      <v-col class="text-center" style="margin-right: 16px">
        <h1 >{{ greeting }}</h1>
        <h1>
          {{ this.$auth.user.user_position }} :
          {{ this.$auth.user.user_firstname }}
        </h1>
        <p>{{ currentDateTime }}</p>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  data() {
    return {
      greeting: "",
      currentDateTime: "",
    };
  },
  methods: {
    updateDateTime() {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      };

      this.greeting = this.getGreeting(now);
      this.currentDateTime = now.toLocaleDateString("en-US", options);
    },
    getGreeting(date) {
      const hour = date.getHours();

      if (hour >= 0 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    },
    formatDate(dateString) {
      if (!dateString) {
        return "Not determined";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Not determined";
      }
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-GB", options);
    },
  },
  mounted() {
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);
  },
};
</script>

<style>
.text-center {
  text-align: center;
}
</style>
