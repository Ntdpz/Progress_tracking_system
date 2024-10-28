<template>
  <v-card class="fixed-width-card">
    <div class="content" @dragover.prevent @drop.prevent="handleDrop">
      <v-file-input chips ref="fileInput" v-model="imageFiles" accept="image/*" multiple label="Upload Images"
        prepend-icon="mdi-camera" @change="uploadImages" class="file-input" outlined
        placeholder="Drag and drop images here or click to select" :style="{ width: '95%' }"></v-file-input>
    </div>

    <!-- แสดงคอลเลกชันรูปภาพ -->
    <v-row v-if="previews.length" class="gallery" justify="center">
      <v-col v-for="(image, index) in previews" :key="image.id" cols="12" sm="6" md="4" class="d-flex justify-center">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-img v-bind="attrs" v-on="on" :src="image.src" aspect-ratio="1" class="gallery-image"
              :alt="'Image ' + (index + 1)" contain @click="openImage(image.src)">
              <template v-slot:default>
                <div class="overlay">
                  <v-btn icon @click.stop="removeImage(index, image.id)" class="delete-button">
                    <v-icon>mdi-close-circle</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-img>
          </template>
          <span>Add by : {{ image.createdByName }}</span>
          <br />
          <span>Upload : {{ image.upload_date }} น.</span>
        </v-tooltip>
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
      default: 0,
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
    this.previews = [];
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
    // Revoke blob URLs when the component is destroyed
    this.previews.forEach((image) => URL.revokeObjectURL(image.blobUrl));
  },
  methods: {
    async uploadImages() {
      this.previews = []; // Clear previews if necessary

      for (const file of this.imageFiles) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64 = event.target.result;
          const blobUrl = URL.createObjectURL(file);

          // Debugging: Check the file object
          console.log("File:", file); // Log the file object

          const image = {
            id: Date.now() + Math.random(), // Ensure unique ID
            src: base64,
            blobUrl: blobUrl, // Store blob URL
            image_type: file.type || "unknown", // Add image_type from the file, default to "unknown"
            image_name: file.name || "Unnamed Image", // Get image name from the file, default to "Unnamed Image"
            createdByName: this.user.name || Date.now() + Math.random(),
            upload_date: this.formatDate(new Date()),
          };
          // Debugging: Check the created image object
          console.log("Image object:", image); // Log the image object

          this.previews.push(image);
        };
        // Check if file is readable
        console.log("Reading file:", file.name); // Log the file name
        reader.readAsDataURL(file);
      }
      // Clear the selected files after uploading
    },

    async submitImages(taskId) {
      // Prepare image data to submit
      const images = this.previews.map((image) => ({
        image_base64: image.src,
        image_name: image.image_name, // Use image_name instead of createdByName
        upload_date: image.upload_date,
        image_type: image.image_type, // Include image_type if needed
      }));

      try {
        const response = await this.$axios.post(`/task_images/createTaskImages`, {
          task_id: taskId,
          created_by: this.user.id,
          images,
        });

        if (response.status === 200) {
          this.imageFiles = [];

          console.log("Images successfully uploaded!");
          // Emit the 'submit' event to notify parent component
          this.$emit('submit', { images, taskId: this.taskId });

          // Optional: clear previews after a successful upload
          this.previews = [];
        } else {
          console.error("Error uploading images:", response.data.message);
        }
      } catch (error) {
        console.error("Error uploading images:", error);
      }
    },

    formatDate(date) {
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    handlePaste(event) {
      const items = event.clipboardData.items;
      const pastedFiles = [];

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        this.imageFiles = pastedFiles;
        this.uploadImages();
      }
    },

    handleDrop(event) {
      const files = event.dataTransfer.files;
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      this.imageFiles = [...this.imageFiles, ...imageFiles];
      this.uploadImages();
    },

    removeImage(index) {
      const removedImage = this.previews.splice(index, 1)[0];
      URL.revokeObjectURL(removedImage.blobUrl); // Clean up blob URL
      this.imageFiles.splice(index, 1); // Update imageFiles if needed
      console.log("Removed image at index:", index);
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
  width: 750px;
  /* กำหนดความกว้างของ v-card เป็น 750px */
  margin: 25px auto;
  /* จัดให้อยู่ตรงกลางในแกน X */
  border: none;
  /* ซ่อนขอบของ v-card */
  box-shadow: none !important;
  /* ลบเงาของ v-card */
}

.content {
  display: flex;
  flex-direction: column;
  /* จัดเรียงเป็นแนวตั้ง */
  gap: 16px;
  /* ระยะห่างระหว่าง p และ v-file-input */
  align-items: center;
  /* จัดให้เนื้อหาอยู่ตรงกลางในแกน X */
}

.file-input {
  width: 600px;
  /* ปรับความกว้างของ v-file-input ตามต้องการ */
  margin: 0 auto;
  /* จัดให้อยู่ตรงกลางในแกน X */
}

.gallery {
  justify-content: center;
  /* ทำให้แกลเลอรี่อยู่ตรงกลาง */
}

.gallery-image {
  width: 100%;
  /* ให้ภาพเต็มความกว้างของ v-col */
  height: auto;
  /* ความสูงอัตโนมัติ */
  position: relative;
  /* ทำให้สามารถจัดวาง overlay ได้ */
}

.overlay {
  position: absolute;
  /* จัดให้ overlay อยู่เหนือ v-img */
  top: 8px;
  /* ระยะห่างจากด้านบน */
  right: 8px;
  /* ระยะห่างจากด้านขวา */
  z-index: 10;
  /* ให้อยู่สูงกว่าภาพ */
}

.delete-button {
  color: white;
  /* เปลี่ยนสีปุ่มให้เป็นสีขาว */
}
</style>
