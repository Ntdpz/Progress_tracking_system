<template>
  <v-card class="fixed-width-card">
    <div class="content">
      <v-file-input
        ref="fileInput"
        v-model="imageFiles"
        accept="image/*"
        multiple
        label="Upload Images"
        prepend-icon="mdi-camera"
        @change="uploadImages"
        class="file-input"
        outlined
      ></v-file-input>
    </div>

    <!-- แสดงคอลเลกชันรูปภาพ -->
    <v-row v-if="previews.length" class="gallery" justify="center">
      <v-col
        v-for="(src, index) in previews"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        class="d-flex justify-center"
      >
        <v-img
          :src="src"
          aspect-ratio="1"
          class="gallery-image"
          :alt="'Image ' + (index + 1)"
          contain
          @click="openImage(src)"
        >
          <template v-slot:default>
            <div class="overlay">
              <v-btn
                icon
                @click.stop="removeImage(index)"
                class="delete-button"
              >
                <v-icon>mdi-close-circle</v-icon>
              </v-btn>
            </div>
          </template>
        </v-img>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  middleware: "auth",

  props: {
    taskId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      imageFiles: [],
      previews: [],
    };
  },
  mounted() {
    window.addEventListener("paste", this.handlePaste);
    this.previews = []; // เคลียร์ previews เมื่อคอมโพเนนต์ถูกสร้าง
    this.loadExistingImages(); // โหลดภาพที่มีอยู่เมื่อคอมโพเนนต์ถูกสร้าง
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },
  watch: {
    taskId: "loadExistingImages", // เมื่อ taskId เปลี่ยนให้เรียก loadExistingImages ใหม่
  },
  methods: {
    async loadExistingImages() {
      this.previews = []; // เคลียร์ previews ก่อนโหลดภาพใหม่

      try {
        const response = await this.$axios.get(
          `/task_images/searchByTaskid/${this.taskId}`
        );

        // ตรวจสอบว่ามีรูปภาพใน response หรือไม่
        if (response.data && response.data.length > 0) {
          // เรียงภาพจากเก่าที่สุดก่อน โดยอ้างอิงจาก `created_at`
          this.previews = response.data
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((image) => `${image.image_base64}`);
        }
      } catch (error) {
        console.error("Error loading existing images:", error);
      }
    },
    async uploadImages() {
      const newImages = [];
      const newPreviews = []; // ตัวแปรสำหรับเก็บ previews ของภาพใหม่

      for (const file of this.imageFiles) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target.result;
          const image_name = file.name;
          const image_type = file.type;

          newImages.push({ image_base64: base64, image_name, image_type });
          newPreviews.push(base64); // เพิ่ม base64 ของภาพที่อัปโหลดใหม่

          if (newImages.length === this.imageFiles.length) {
            await this.saveImages(newImages);

            // อัปเดต previews โดยให้รูปจากฐานข้อมูลมาก่อน ตามด้วยภาพใหม่
            this.previews = this.previews.concat(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    },

    async saveImages(images) {
      try {
        await this.$axios.post(`/task_images/createTaskImages`, {
          task_id: this.taskId,
          created_by: this.user.id,
          images,
        });
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    },

    handlePaste(event) {
      const items = event.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          this.imageFiles.push(file); // เพิ่มไฟล์ใหม่ลง imageFiles
          this.previews.push(URL.createObjectURL(file)); // สร้าง URL ของภาพที่วางจากคลิปบอร์ดแล้วเพิ่มเข้า previews
        }
      }
    },

    removeImage(index) {
      this.imageFiles.splice(index, 1); // ลบไฟล์จาก imageFiles
      this.previews.splice(index, 1); // ลบ URL จาก previews
    },

    openImage(src) {
      // สร้างลิงก์แบบ Blob เพื่อทำให้เบราว์เซอร์เปิดในแท็บใหม่ได้
      const blob = this.base64ToBlob(src);
      const blobUrl = URL.createObjectURL(blob);

      // เปิดลิงก์ในแท็บใหม่
      window.open(blobUrl, "_blank");
    },

    base64ToBlob(base64) {
      // แปลง Base64 ให้เป็น binary data
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    },
  },
};
</script>

<style scoped>
.fixed-width-card {
  width: 750px; /* กำหนดความกว้างของ v-card เป็น 750px */
  margin: 25px auto; /* จัดให้อยู่ตรงกลางในแกน X */
  border: none; /* ซ่อนขอบของ v-card */
  box-shadow: none !important; /* ลบเงาของ v-card */
}

.content {
  display: flex;
  flex-direction: column; /* จัดเรียงเป็นแนวตั้ง */
  gap: 16px; /* ระยะห่างระหว่าง p และ v-file-input */
  align-items: center; /* จัดให้เนื้อหาอยู่ตรงกลางในแกน X */
}

.file-input {
  width: 600px; /* ปรับความกว้างของ v-file-input ตามต้องการ */
  margin: 0 auto; /* จัดให้อยู่ตรงกลางในแกน X */
}

.gallery {
  justify-content: center; /* ทำให้แกลเลอรี่อยู่ตรงกลาง */
}

.gallery-image {
  width: 100%; /* ให้ภาพเต็มความกว้างของ v-col */
  height: auto; /* ความสูงอัตโนมัติ */
  position: relative; /* ทำให้สามารถจัดวาง overlay ได้ */
}

.overlay {
  position: absolute; /* จัดให้ overlay อยู่เหนือ v-img */
  top: 8px; /* ระยะห่างจากด้านบน */
  right: 8px; /* ระยะห่างจากด้านขวา */
  z-index: 10; /* ให้อยู่สูงกว่าภาพ */
}

.delete-button {
  color: white; /* เปลี่ยนสีปุ่มให้เป็นสีขาว */
}
</style>
