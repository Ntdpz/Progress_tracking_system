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
            if (this.value === 100) {
                return 'green';
            } else if (this.value >= 75) {
                return 'blue';
            } else if (this.value >= 50) {
                return 'yellow';
            } else {
                return 'orange';
            }
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