<template>
    <v-card class="outer">
        <v-card-title>
            {{ taskName }}
            <v-spacer></v-spacer>
            <!-- Edit icon -->
            <v-btn icon @click="openMenu">
                <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
            <!-- Menu -->
            <v-menu v-model="menuOpen" :position-x="menuX" :position-y="menuY">
                <template v-slot:activator="{ on }"></template>
                <v-list>
                    <v-list-item @click="openAssignDialog">
                        <v-list-item-content>Assign</v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="openEditTaskDialog">
                        <v-list-item-content>Edit</v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="openUpdateTaskDialog">
                        <v-list-item-content>Update Progress</v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="deleteTask" class="red-text">
                        <v-list-item-content>Delete</v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card-title>
        <v-card-text>
            <div>
                <v-icon>mdi-tag-outline</v-icon>
                <strong>ID:</strong> {{ taskId }}
            </div>
            <div>
                <v-icon>mdi-account</v-icon>
                <strong>Assignee:</strong> {{ assignee }}
            </div>
            <div>
                <v-icon>mdi-timer-sand</v-icon>
                <strong>Manday: {{ taskManday }} (hours)</strong>
            </div>
        </v-card-text>
        <v-card-actions>
            <v-btn text @click="DeleteTask">
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
                    <strong>Task Detail:</strong> {{ tasksDetail }}
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
            menuOpen: false,
            menuX: 0,
            menuY: 0,
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
        tasksDetail() {
            return this.task.tasks_detail;
        },
        taskManday() {
            return this.task.task_manday;
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
        // open Menu
        openMenu() {
            this.menuOpen = true;
            this.menuX = event.clientX;
            this.menuY = event.clientY;
        },
        openAssignDialog() {
            this.menuOpen = false;
            this.$emit('open-assign-dialog', this.task);
        },
        openEditTaskDialog() {
            this.menuOpen = false;
            this.$emit('edit-task', this.task);
        },
        openUpdateTaskDialog() {
            this.menuOpen = false;
            this.$emit('open-update-task-dialog', this.task);
        },
        deleteTask() {
            this.menuOpen = false;
            this.$emit('delete-task', this.task);
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