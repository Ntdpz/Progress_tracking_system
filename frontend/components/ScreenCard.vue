<template>
    <div class="card-wrapper">
        <div class="card">
            <v-img class="white--text" :height="imageHeight" :src="imageSrc">
                <v-row class="align-center justify-space-between">
                    <!-- Left Side: ID Chip -->
                    <v-col cols="auto">
                        <v-chip class="ma-2" color="blue" text-color="white">
                            ID: {{ screenId }}
                        </v-chip>
                    </v-col>

                    <!-- Right Side: Status and Progress Chips -->
                    <v-col cols="auto">
                        <div class="progress-status">
                            <v-chip class="ma-2" color="white" text-color="black">
                                {{ screenStatus }}
                            </v-chip>
                            <v-chip class="ma-2" color="white" text-color="black">
                                {{ screenProgress }}%
                            </v-chip>
                        </div>
                    </v-col>
                </v-row>
            </v-img>
            <v-card>
                <v-card-title>
                    <strong>{{ screenName }}</strong>
                </v-card-title>
                <v-card-subtitle>
                    <strong>Plan:</strong> {{ screenPlanStartDate }} - {{ screenPlanEndDate }} <br>
                    <strong>Actual:</strong> {{ screenActualStartDate }} - {{ screenActualEndDate }}<br>
                    <strong>Assignee:</strong> {{ screenAssignee }}
                </v-card-subtitle>

                <v-card-actions>
                    <v-btn color="black" outlined @click="showDialog = true">
                        Edit
                    </v-btn>

                    <v-btn color="blue">
                        Claim
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-dialog v-model="showDialog" max-width="800px">
                <v-card>
                    <v-card-title class="justify center">
                        <span class="text-h4">Edit Screen</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field label="Screen id" v-model="screenId" prepend-inner-icon="mdi-lock"
                                        disabled outlined></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Screen Name" v-model="screenName" outlined></v-text-field>
                                </v-col>
                            </v-row>
                            <!-- plan start& plan end -->
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field label="Plan Start Date" v-model="screenPlanStartDate"
                                        outlined></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Plan End Date" v-model="screenPlanEndDate"
                                        outlined></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field label="Screen Status" v-model="screenStatus" outlined></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Screen Designer" v-model="screenDesigner"
                                        outlined></v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="6">
                                    <v-text-field label="Screen Developer" v-model="screenDeveloper"
                                        outlined></v-text-field>
                                </v-col>
                                <v-col cols="6">
                                    <v-text-field label="Screen Tester" v-model="screenTester" outlined></v-text-field>
                                </v-col>
                            </v-row>
                            </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="showDialog = false">
                            Save
                        </v-btn>
                        <v-btn color="blue darken-1" text @click="showDialog = false">
                            Not Save
                        </v-btn>
                        <v-btn color="red darken-1" text @click="showDialog = false">
                            Delete
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>

</template>

<script>
export default {
    data() {
        return {
            showDialog: false
        };
    },
    name: "ScreenCard",
    props: {
        screenId: {
            type: String,
            required: true
        },
        screenStatus: {
            type: String,
            required: true
        },
        screenProgress: {
            type: Number,
            required: true
        },
        screenName: {
            type: String,
            required: true
        },
        screenPlanStartDate: {
            type: String,
            required: true
        },
        screenPlanEndDate: {
            type: String,
            required: true
        },
        screenActualStartDate: {
            type: String,
            required: true
        },
        screenActualEndDate: {
            type: String,
            required: true
        },
        screenAssignee: {
            type: String,
            required: true
        },
        imageSrc: {
            type: String,
            required: true
        },
        imageHeight: {
            type: String,
            default: "300px"
        },
        overlayColor: {
            type: String,
            default: "#036358"
        }
    }
};
</script>

<style scoped>
.card-wrapper {
    position: relative;
    display: inline-block;
}
.progress-status {
    background-color: #374AAB;
    border-radius: 20px;
    margin-top: 5px;
    margin-right: 5px;
}
.customer-red {
    color: red;
}
/* center the text */
.text-h4 {
    text-align: center;
    
}


</style>
