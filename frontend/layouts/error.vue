<template>
  <v-app dark>
    <v-container fluid class="error-container">
      <v-row justify="center" align="center">
        <v-col cols="12" md="8" class="text-center">
          <v-icon size="100" color="red" class="mb-4">error_outline</v-icon>
          <h1 v-if="error.statusCode === 404">{{ pageNotFound }}</h1>
          <h1 v-else>{{ otherError }}</h1>
          <NuxtLink to="/" class="mt-4 btn-home">
            <v-btn color="primary" large>Go to Home</v-btn>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: "404 Page Not Found",
      otherError: "Something went wrong",
    };
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title,
    };
  },
};
</script>

<style scoped>
.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2c3e50;
  color: white;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.btn-home {
  text-decoration: none;
}

.v-btn {
  text-transform: uppercase;
}
</style>
