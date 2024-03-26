<template>
    <v-dialog v-model="dialog" max-width="500px">
        <v-card>
            <v-card-title>
                <span class="headline">Create Task</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="newTasks.task_id" label="Task ID" type="number"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="newTasks.task_name" label="Task Name"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-select v-model="newTasks.assignee" :items="assigneeOptions" label="Assignee"></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="newTasks.task_manday" label="Estimate Working Hours" type="number"
                                step="0.1"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="newTasks.task_plan_start" label="Task Plan Start"
                                type="date"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="newTasks.task_plan_end" label="Task Plan End"
                                type="date"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-textarea v-model="newTasks.task_detail" label="Task Detail"></v-textarea>
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
    },

    data() {
        return {
            dialog: false,
            assigneeOptions: ["John Doe", "Jane Smith", "Tom Brown", "Alice Green"],
            newTasks: {
                
                task_id: "",
                task_name: "",
                task_detail: "",
                task_manday: "", // Initialize as float
                task_status: "",
                task_plan_start: "",
                task_plan_end: "",
            },
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
        saveTask() {
            if (!this.newTasks.task_plan_start || !this.newTasks.task_plan_end) {
                console.error('Plan start or end date is not set.');
                return;
            }

            this.$emit("save-task", this.newTasks);
            this.dialog = false;
        },
        cancelTask() {
            this.dialog = false;
        },
    },
};
</script>
