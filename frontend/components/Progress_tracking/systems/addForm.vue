<template>
    <div class="card-container">
        <v-card>
            <v-card-title>
                Add Screen
            </v-card-title>
            <v-card-text>
                <v-form ref="form" @submit.prevent="submitForm">
                    <!-- Line 1: Screen Code & Screen Name -->
                    <v-row>
                        <v-col cols="6">
                            <v-text-field v-model="screenCode" :rules="[v => !!v || 'Screen ID is required']" required>
                                <template v-slot:label>
                                    <span class="label-text">Screen Code <span class="required-asterisk">*</span></span>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="screenName" :rules="[v => !!v || 'Screen Name is required']"
                                required>
                                <template v-slot:label>
                                    <span class="label-text">Screen Name <span class="required-asterisk">*</span></span>
                                </template>
                            </v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Line 2: Difficulty Level & Screen Status -->
                    <v-row>
                        <v-col cols="6">
                            <v-select label="Difficulty Level" v-model="screenLevel"
                                :items="[1, 2, 3, 4, 5]"></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select label="Screen Status" v-model="screenStatus"
                                :items="['Not started', 'Design', 'Dev', 'Test']"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Line 3: Screen SA & Screen Dev -->
                    <v-row>
                        <v-col cols="6">
                            <v-select label="Screen SA" v-model="selectedSA"
                                :items="filterUsersByPosition('System Analyst')" item-text="name" item-value="id"
                                multiple chips></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-select label="Screen Dev" v-model="selectedDev"
                                :items="filterUsersByPosition('Developer')" item-text="name" item-value="id" multiple
                                chips></v-select>
                        </v-col>
                    </v-row>

                    <!-- Line 4: Screen Imp & File Input for Image -->
                    <v-row>
                        <v-col cols="6">
                            <v-select label="Screen Imp" v-model="selectedImp"
                                :items="filterUsersByPosition('Implementer')" item-text="name" item-value="id" multiple
                                chips></v-select>
                        </v-col>
                        <v-col cols="6">
                            <v-file-input label="Upload Image" v-model="imageFile" accept="image/*"
                                @change="convertImageToBase64"></v-file-input>
                        </v-col>
                    </v-row>

                    <v-card-actions class="button">
                        <v-btn type="submit" color="primary">Create</v-btn>
                        <v-btn color="#d33" class="white--text" @click="cancelForm">Cancel</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    props: {
        users: {
            type: Array,
            required: true,
        },
        projectId: {
            type: Number,
            required: true,
        },
        systemId: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            screenCode: '',
            screenName: '',
            screenLevel: '0',
            screenStatus: 'Not started',
            selectedSA: [],
            selectedDev: [],
            selectedImp: [],
            imageFile: null,
            imageBase64: '',
        };
    },
    computed: {
        isFormValid() {
            // Check if Screen ID and Screen Name are not empty
            return this.screenCode.trim() !== '' && this.screenName.trim() !== '';
        }
    },
    methods: {
        filterUsersByPosition(position) {
            return this.users
                .filter(user => user.user_position === position)
                .map(user => ({
                    id: user.id,
                    name: `${user.user_firstname} ${user.user_lastname}` // Display name
                }));
        },
        convertImageToBase64() {
            const file = this.imageFile;
            const reader = new FileReader();
            reader.onloadend = () => {
                // Remove the data URL prefix
                const base64String = reader.result.split(',')[1];
                this.imageBase64 = base64String;
            };
            if (file) {
                reader.readAsDataURL(file);
            }
        },
        async submitForm() {
            try {
                const valid = await this.$refs.form.validate();
                if (!valid) return;

                const requestData = {
                    screen_code: this.screenCode,
                    screen_name: this.screenName,
                    screen_status: this.screenStatus,
                    screen_level: this.screenLevel,
                    system_id: this.systemId,
                    screen_progress: 0,
                    screen_plan_start: this.screenPlanStart || null,
                    screen_plan_end: this.screenPlanEnd || null,
                    project_id: this.projectId,
                    screen_pic: this.imageBase64,
                    assignedUsers: [
                        ...this.selectedSA,
                        ...this.selectedDev,
                        ...this.selectedImp
                    ]
                };

                const response = await axios.post('http://localhost:7777/screens/createScreen', requestData);

                if (response.status === 200) {
                    await Swal.fire({
                        icon: 'success',
                        confirmButtonColor: '#009933',
                        title: 'Screen Created!',
                        text: 'The new screen has been created successfully.',
                        timer: 1500,
                    });
                    this.$emit('closeDialog'); // Emit event to close dialog
                    this.resetForm(); // Reset form
                    //reload the page
                    this.$emit('reload');
                } else {
                    throw new Error('Failed to create screen');
                }
            } catch (error) {
                console.error('Error creating screen:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Failed to create the screen. Please try again.',
                    timer: 3000,
                });
            }
        },
        cancelForm() {
            this.$emit('closeDialog');
            this.resetForm();
        },
        resetForm() {
            this.screenCode = '';
            this.screenName = '';
            this.screenLevel = '0';
            this.screenStatus = 'Not started';
            this.selectedSA = [];
            this.selectedDev = [];
            this.selectedImp = [];
            this.imageFile = null;
            this.imageBase64 = '';
        },
    },
};
</script>

<style scoped>
.card-container {
    justify-content: center;
    align-items: center;
}

.required-label {
    font-weight: bold;
}
.button {
    justify-content: center;
}

.required-asterisk {
    color: red;
    font-weight: bold;
}
</style>