<template>
  <div>
    <v-container>
      <v-file-input
        v-model="imageFile"
        label="Upload Image"
        accept="image/*"
        @change="onFileChange"
      ></v-file-input>

      <v-img
        v-if="imagePreview"
        :src="imagePreview"
        alt="Uploaded Image Preview"
        max-width="300"
      ></v-img>
    </v-container>
  </div>
</template>

<script>
import testCOM from "../components/testCOM.vue";
export default {
  middleware: "auth",
  layout: "admin",
  components: {
    testCOM,
  },
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      imageFile: null,
      imagePreview: null,
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.id = res.data[0].id;
          this.userdata = res.data[0];
        });
    },
    onFileChange() {
      // ตรวจสอบว่ามีไฟล์ถูกเลือกแล้วหรือไม่
      if (this.imageFile) {
        const file = this.imageFile;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // รีเซ็ต imagePreview เมื่อไม่มีไฟล์
        this.imagePreview = null;
      }
    },
  },
};
</script>

<style>
</style>
