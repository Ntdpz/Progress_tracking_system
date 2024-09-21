<template>
  <nav aria-label="Breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <nuxt-link to="/">Home</nuxt-link>
      </li>
      <li
        class="breadcrumb-item"
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
      >
        <nuxt-link :to="crumb.path">{{ crumb.name }}</nuxt-link>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  computed: {
    breadcrumbs() {
      const breadcrumbs = [];

      // Add home breadcrumb
      breadcrumbs.push({ name: "Home", path: "/" });

      // Add project breadcrumb
      if (this.$route.params.projectId) {
        breadcrumbs.push({
          name: "Project",
          path: `/manageProject/Project(${this.$route.params.projectId})`,
        });
      }

      // Add systems breadcrumb
      if (this.$route.params.systemId) {
        breadcrumbs.push({
          name: "Systems",
          path: `/manageProject/Project(${this.$route.params.projectId})/systems(${this.$route.params.systemId})`,
        });
      }

      // Add screens breadcrumb
      if (this.$route.params.screenId) {
        breadcrumbs.push({
          name: "Screens",
          path: `/manageProject/Project(${this.$route.params.projectId})/systems(${this.$route.params.systemId})/screens(${this.$route.params.screenId})`,
        });
      }

      return breadcrumbs;
    },
  },
};
</script>
