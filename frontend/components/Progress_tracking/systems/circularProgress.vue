<template>
    <v-col cols="12" md="4" class="text-center">
        <div class="progress-section">
            <v-progress-circular :rotate="360" :size="100" :width="15" :value="value || 0" :color="computedColor">
                {{ value || 0 }}%
            </v-progress-circular>
            <p>{{ label }}</p>
        </div>
    </v-col>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            required: true,
        },
        label: {
            type: String,
            required: true
        }
    },
    computed: {
        computedColor() {
            if (this.value
             >= 75 && this.value
             <= 100) {
                return "#4CAF50"; // สีเขียว
            } else if (this.value
             >= 51 && this.value
             <= 74) {
                return "#03A9F4"; // สีฟ้า
            } else if (this.value
             >= 26 && this.value
             <= 50) {
                return "#FFD700"; // สีเหลืองทอง
            } else if (this.value
             >= 0 && this.value
             <= 25) {
                return "#FC8705"; // สีส้ม
            }
            return "#000000"; // สีดำเป็นค่าเริ่มต้นถ้าค่าผิดพลาด
        }
    }
}
</script>

<style scoped>
.progress-section {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>