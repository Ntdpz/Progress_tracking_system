<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline">{{ dialogTitle }}</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <!-- Task ID input -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="editedTask.task_id" label="Task ID" type="number"
                                readonly></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- Task Name input -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="editedTask.task_name" label="Task Name"></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- Assignee input -->
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="newTasks.task_member" :items="teammemberOptions"
                                label="Teammember"></v-select>
                        </v-col>
                    </v-row>
                    <!-- Estimate Working Hours input -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="editedTask.task_manday" label="Estimate Working Hours" type="number"
                                step="0.1"></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- Task Plan Start input -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="editedTask.task_plan_start" label="Task Plan Start"
                                type="date"></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- Task Plan End input -->
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="editedTask.task_plan_end" label="Task Plan End"
                                type="date"></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- Task Detail input -->
                    <v-row>
                        <v-col cols="12">
                            <v-textarea v-model="editedTask.task_detail" label="Task Detail"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" @click="saveTask">Save</v-btn>
                <v-btn color="secondary" @click="cancelTask">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        value: Boolean,
        editedTask: Object,
    },
    data() {
        return {
            dialog: false, // Define dialog property
            dialogTitle: 'Edit Task',
            teammemberOptions:[],
        };
    },
    watch: {
        value(newValue) {
            this.dialog = newValue;
        },
        dialog(newDialog) {
            this.$emit("input", newDialog);
        },
    },
    methods: {
        // Fetch teammember options
        
        saveTask() {
            this.$emit("update-task", this.editedTask);
            this.dialog = false;
        },
        cancelTask() {
            this.dialog = false;
        },
    },
};
</script>