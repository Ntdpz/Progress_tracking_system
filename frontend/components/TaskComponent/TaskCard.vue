<template>
    <v-card class="outer">
        <v-card-title>
            {{ taskName }}
            <v-spacer></v-spacer>
            <!-- Edit icon -->
            <v-btn icon @click="openEditTaskDialog">
                <v-icon>mdi-pencil</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-text>
            <div>
                <v-icon>mdi-tag-outline</v-icon>
                <strong>ID:</strong> {{ taskId }}
            </div>
            <div>
                <v-icon>mdi-account</v-icon>
                <strong>Assignee:</strong> {{ teammemberName }}
            </div>
            <div>
                <v-icon>mdi-timer-sand</v-icon>
                <strong>Manday: {{ taskManday }} (hours)</strong>
            </div>
        </v-card-text>
        <v-card-actions>
            <v-btn text color="red" @click="DeleteTask">
                Delete
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn class="ma-2" icon @click="show = !show">
                <v-icon v-if="!show">mdi-chevron-down</v-icon>
                <v-icon v-else>mdi-chevron-up</v-icon>
            </v-btn>
        </v-card-actions>
        <v-expand-transition>
            <v-card-text v-show="show" class="v-card__text--visible">
                <div>
                    <strong>Plan Start:</strong> {{ formattedTaskPlanStart }}
                </div>
                <div>
                    <strong>Plan End:</strong> {{ formattedTaskPlanEnd }}
                </div>
                <div>
                    <strong>Task Detail:</strong> {{ taskDetail }}
                </div>
            </v-card-text>
        </v-expand-transition>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            show: false,
            formattedPlanStart: '',
            formattedPlanEnd: '',
        };
    },
    props: {
        task: {
            type: Object,
            required: true,
        },
    },
    computed: {
        taskId() {
            return this.task.task_id;
        },
        taskName() {
            return this.task.task_name;
        },
        taskDetail() {
            return this.task.task_detail;
        },
        taskManday() {
            return this.task.task_manday;
        },
        teammemberName() {
            return this.task.task_member;
        },
        // Compute the formatted planStart date
        formattedTaskPlanStart() {
            if (!this.task.task_plan_start) return ''; // Check if planStart date is defined
            const date = new Date(this.task.task_plan_start); // Create a Date object from planStart
            const day = date.getDate(); // Get the day of the month
            const month = date.getMonth() + 1; // Get the month (0-indexed, hence +1)
            const year = date.getFullYear(); // Get the full year
            // Format the date as "day/month/year"
            return `${day}/${month}/${year}`;
        },
        // Compute the formatted planEnd date
        formattedTaskPlanEnd() {
            if (!this.task.task_plan_end) return ''; // Check if planEnd date is defined
            const date = new Date(this.task.task_plan_end); // Create a Date object from planEnd
            const day = date.getDate(); // Get the day of the month
            const month = date.getMonth() + 1; // Get the month (0-indexed, hence +1)
            const year = date.getFullYear(); // Get the full year
            // Format the date as "day/month/year"
            return `${day}/${month}/${year}`;
        },
    },
    methods: {
        // open Update task progress dialog
        openUpdateTaskDialog() {
            this.$emit('open-update-task-dialog', this.task); // Emit the 'open-update-task-dialog' event with the task as payload
        },
        // open Edit task dialog
        openEditTaskDialog() {
            this.$emit('edit-task', this.task); // Emit the 'edit-task' event with the task as payload
        },
        // Delete task
        DeleteTask() {
            this.$emit('delete-task', this.task); // Emit the 'delete-task' event with the task as payload
        },

    },
};
</script>

<style scoped>
.outer {
    padding: 10px;
    border: 1px solid #e0e0e0;
}

.v-card__text--visible {
    opacity: 1;
    max-height: 1000px;
    /* Adjust as needed */
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.v-card__text--hidden {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
</style>