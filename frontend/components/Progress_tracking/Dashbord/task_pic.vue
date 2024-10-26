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
        @change="previewImages"
        class="file-input"
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
        >
          <template v-slot:default>
            <div class="overlay">
              <v-btn icon @click="removeImage(index)" class="delete-button">
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
  props: {
    taskId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      imageFiles: [], // เก็บไฟล์ที่เลือก
      previews: [], // เก็บ URL ของภาพตัวอย่าง
    };
  },
  mounted() {
    window.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },
  methods: {
    previewImages() {
      this.previews = []; // เคลียร์ previews ก่อนเพิ่มใหม่
      for (const file of this.imageFiles) {
        this.previews.push(URL.createObjectURL(file)); // สร้าง URL ชั่วคราวแล้วเพิ่มเข้า previews
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
