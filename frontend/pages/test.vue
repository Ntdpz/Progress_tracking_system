<template>
  <div>
    <div>
      <v-breadcrumbs>
        <v-breadcrumbs-item v-for="(item, i) in items" :key="i" :disabled="i === items.length - 1"
          @click="() => (i < items.length - 1 && (active = i))">
          {{ item.text }}
        </v-breadcrumbs-item>
      </v-breadcrumbs>
    </div>
    <!-- Progress bar row -->
    <div class="head-section">
      <v-row>
        <!-- System Information Section -->
        <v-col cols="12" md="6">
          <v-card-title>
            <strong>{{ systemName }}</strong>
          </v-card-title>
          <v-card-subtitle>{{ systemId }}</v-card-subtitle>
          <v-card-text>
            system completeness: {{ value3 }}%
          </v-card-text>
        </v-col>

        <!-- Progress Section -->
        <v-col cols="12" md="6">
          <div class="progress">
            <v-row no-gutters>
              <!-- Progress Design -->
              <v-col cols="3" class="text-center">
                <div class="progress-section">
                  <v-progress-circular :rotate="360" :size="100" :width="15" :value="value" :color="progressColor">
                    {{ value }}
                  </v-progress-circular>
                  <h5> Design </h5>
                </div>
              </v-col>
              <!-- spacer -->
              <v-col cols="1.5"></v-col>
              <!-- Progress Dev -->
              <v-col cols="3" class="text-center">
                <div class="progress-section">
                  <v-progress-circular :rotate="360" :size="100" :width="15" :value="value2" :color="progressColor2">
                    {{ value2 }}
                  </v-progress-circular>
                  <h5> Dev </h5>
                </div>
              </v-col>
              <!-- spacer -->
              <v-col cols="1.5"></v-col>
              <!-- Progress Total -->
              <v-col cols="3" class="text-center">
                <div class="progress-section">
                  <v-progress-circular :rotate="360" :size="100" :width="15" :value="value3" :color="progressColor3">
                    {{ value3 }}
                  </v-progress-circular>
                  <h5> Total </h5>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </div>
    <!-- search section -->
    <div>
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="18" sm="8">
              <v-text-field prepend-inner-icon="mdi-magnify" v-model=" screenName" label="Search for screen"
                outlined></v-text-field>
            </v-col>
            <!-- Add screen button -->
            <v-col cols="6" sm="4" class="d-flex justify-center">
              <v-btn color="blue" @click="addScreen">
                Add Screen
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </div>

    <!-- Card section -->
    <div>
      <v-row class="no-gutters justify-center">
        <v-col cols="12" md="6" lg="3" class="d-flex justify-center" v-for="(card, index) in cards" :key="index">
          <ScreenCard :style="{ maxWidth: '340px', maxHeight: '500px' }" :screenId="card.screenId"
            :screenStatus="card.screenStatus" :screenProgress="card.screenProgress" :screenName="card.screenName"
            :screenPlanStartDate="card.screenPlanStartDate" :screenPlanEndDate="card.screenPlanEndDate"
            :screenActualStartDate="card.screenActualStartDate" :screenActualEndDate="card.screenActualEndDate"
            :screenAssignee="card.screenAssignee" :imageSrc="card.imageSrc" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>


export default {
  data() {
    return {
      //auth: this.$auth,
      
      value: 30,
      value2: 96,
      systemName: 'System Name',
      systemId: 'systemid123',
      search: '',
      screenId: '1234',
      screenName: 'Screen Name',
      screenStatus: 'Dev',
      overlay: false,
      items: [
        { text: 'Project', disabled: false },
        { text: 'System', disabled: false }
      ],
      cards: [
        {
          screenId: '001',
          screenStatus: 'In Progress',
          screenProgress: 70,
          screenName: 'Dashboard Redesign',
          screenPlanStartDate: '2023-08-01',
          screenPlanEndDate: '2023-08-31',
          screenActualStartDate: '2023-08-02',
          screenActualEndDate: '2023-08-30',
          screenAssignee: 'John Doe',
          imageSrc: 'https://cdn.vuetifyjs.com/images/cards/docks.jpg',
        },
        {
          screenId: '002',
          screenStatus: 'Completed',
          screenProgress: 100,
          screenName: 'User Management',
          screenPlanStartDate: '2023-07-01',
          screenPlanEndDate: '2023-07-31',
          screenActualStartDate: '2023-07-01',
          screenActualEndDate: '2023-07-30',
          screenAssignee: 'Jane Doe',
          imageSrc: 'https://cdn.vuetifyjs.com/images/cards/house.jpg',
        },
        {
          screenId: '003',
          screenStatus: 'Pending',
          screenProgress: 0,
          screenName: 'Analytics Integration',
          screenPlanStartDate: '2023-09-01',
          screenPlanEndDate: '2023-09-30',
          screenActualStartDate: '2023-09-01',
          screenActualEndDate: '2023-09-15',
          screenAssignee: 'Alice Smith',
          imageSrc: 'https://cdn.vuetifyjs.com/images/cards/road.jpg',
        },
        {
          screenId: '004',
          screenStatus: 'In Review',
          screenProgress: 85,
          screenName: 'API Development',
          screenPlanStartDate: '2023-06-01',
          screenPlanEndDate: '2023-06-30',
          screenActualStartDate: '2023-06-01',
          screenActualEndDate: '2023-06-25',
          screenAssignee: 'Bob Brown',
          imageSrc: 'https://cdn.vuetifyjs.com/images/cards/mountain.jpg',
        },
      ],
    };
  },
  methods: {
    // fetch system data from API
    fetchSystemData() {
      // fetch system data from API
    },
    // Add screen
    addScreen() {
      // Add screen
    },
  },
  computed: {
    // Progress value
    value3() {
      return (this.value + this.value2) / 2;
    },
    // Progress color
    progressColor() {
      if (this.value <= 50) {
        return 'red';
      } else if (this.value > 50 && this.value <= 75) {
        return 'orange';
      } else if (this.value > 75 && this.value <= 95) {
        return 'blue';
      } else if (this.value > 95) {
        return 'green';
      }
    },
    progressColor2() {
      if (this.value2 <= 50) {
        return 'red';
      } else if (this.value2 > 50 && this.value2 <= 75) {
        return 'orange';
      } else if (this.value2 > 75 && this.value2 <= 95) {
        return 'blue';
      } else if (this.value2 > 95) {
        return 'green';
      }
    },
    progressColor3() {
      if (this.value3 <= 50) {
        return 'red';
      } else if (this.value3 > 50 && this.value3 <= 75) {
        return 'orange';
      } else if (this.value3 > 75 && this.value3 <= 95) {
        return 'blue';
      } else if (this.value3 > 95) {
        return 'green';
      }
    },
  },
};
</script>

<style scoped>
/* Your styles here */
.head-section {
  padding: 10px;
  margin: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
}
.progress-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress {
  display: flex;
  justify-content: space-around;
  margin: 10px;
}
/* center card inside */
.card-section{
  display: flex;
  justify-content: center;

}


</style>
