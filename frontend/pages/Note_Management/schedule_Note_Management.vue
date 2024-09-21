<template>
  <v-container class="mt-0 pt-0">
    <v-row class="fill-height">
      <v-col class="mt-0 pt-0">
        <v-sheet height="64">
          <v-toolbar flat>
            <v-toolbar-title v-if="$refs.calendar">
              {{ $refs.calendar.title }}
            </v-toolbar-title>
            <v-toolbar-title v-else> {{ months }} {{ years }} </v-toolbar-title>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon small> mdi-chevron-left </v-icon>
            </v-btn>
            <v-btn outlined class="" color="grey darken-2" @click="setToday">
              วันนี้
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon small> mdi-chevron-right </v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-chip>
              <v-chip
                @click="ClickDay(), (type = 'day')"
                style="border: none"
                :style="{
                  backgroundColor: colorday ? '#009933' : null,
                  color: colorday ? 'white' : 'black',
                }"
                class="mr-2"
              >
                วัน
              </v-chip>
              <v-chip
                class="mr-2"
                @click="ClickWeek(), (type = 'week')"
                style="border: none"
                :style="{
                  backgroundColor: colorweek ? '#009933' : null,
                  color: colorweek ? 'white' : 'black',
                }"
              >
                สัปดาห์
              </v-chip>
              <v-chip
                class="mr-2"
                @click="ClickMonth(), (type = 'month')"
                style="border: none"
                :style="{
                  backgroundColor: colormonth ? '#009933' : null,
                  color: colormonth ? 'white' : 'black',
                }"
              >
                เดือน
              </v-chip>
            </v-chip>
          </v-toolbar>
        </v-sheet>
        <v-sheet height="77vh">
          <v-calendar
            v-if="user_role == 'Admin'"
            :key="'admin-calendar'"
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRange"
          >
          </v-calendar>
          <v-calendar
            v-else-if="user_position == 'Developer'"
            :key="'developer-calendar'"
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRangeOwner"
          >
          </v-calendar>
          <v-calendar
            v-else-if="user_position == 'Implementer'"
            :key="'implementer-calendar'"
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            @change="updateRangeOwnerQc"
          >
          </v-calendar>
          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card color="grey lighten-4" min-width="350px" flat>
              <v-toolbar :color="selectedEvent.color" dark>
                <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <span v-html="selectedEvent.details"></span>
              </v-card-text>
              <v-card-actions>
                <v-btn color="error" @click="selectedOpen = false">
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: "admin",
  data() {
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const today = new Date();
    const months = today.getMonth() + 1;
    const year = today.getFullYear();
    return {
      user_id: "",
      user_firstname: "",
      user_lastname: "",
      user_status: "",
      user_pic: null,
      user_role: "",
      user_position: "",
      colorday: false,
      colorweek: false,
      colormonth: true,
      color4day: false,
      months: month,
      years: year,
      query: "",
      focus: "",
      type: "month",
      typeToLabel: {
        month: "Month",
        week: "Week",
        day: "Day",
        "4day": "4 Days",
      },
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      colors: [
        "blue",
        "indigo",
        "deep-purple",
        "cyan",
        "green",
        "orange",
        "grey darken-1",
      ],
      names: [
        "Meeting",
        "Holiday",
        "PTO",
        "Travel",
        "Event",
        "Birthday",
        "Conference",
        "Party",
      ],
    };
  },
  created() {
    this.getUser();
    this.checkRole();
  },
  updated() {
    this.checkRole();
  },
  mounted() {
    try {
      this.$refs.calendar.checkChange();
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.user_id = res.data[0].user_id;
          this.user_firstname = res.data[0].user_firstname;
          this.user_lastname = res.data[0].user_lastname;
          this.user_status = res.data[0].user_status;
          this.user_pic = res.data[0].user_pic;
          this.user_role = res.data[0].user_role;
          this.user_position = res.data[0].user_position;
        });
    },
    ClickDay() {
      this.colorday = true;
      this.colorweek = false;
      this.colormonth = false;
      this.color4day = false;
    },
    ClickWeek() {
      this.colorweek = true;
      this.colorday = false;
      this.colormonth = false;
      this.color4day = false;
    },
    ClickMonth() {
      this.colormonth = true;
      this.colorday = false;
      this.colorweek = false;
      this.color4day = false;
    },
    Click4Day() {
      this.color4day = true;
      this.colorday = false;
      this.colorweek = false;
      this.colormonth = false;
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = "";
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        );
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        requestAnimationFrame(() => requestAnimationFrame(() => open()));
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    async updateRange() {
      try {
        const { data } = await this.$axios.get("/issues/getAll", {});

        const events = data.map((issue) => ({
          name: issue.issue_name,
          details: issue.issue_des,
          start: new Date(issue.issue_end),
          end: new Date(issue.issue_end),
          color: "red",
          timed: !issue.allDay,
        }));

        this.events = events;
      } catch (error) {
        console.error(error);
      }
    },
    async updateRangeOwner() {
      try {
        const { data } = await this.$axios.get(
          `/issues/getOneName/${this.$auth.user.id}`,
          {}
        );
        const events = data.map((issue) => ({
          name: issue.issue_name,
          details: issue.issue_des,
          start: new Date(issue.issue_end),
          end: new Date(issue.issue_end),
          color: "red",
          timed: !issue.allDay,
        }));

        this.events = events;
      } catch (error) {
        console.error(error);
      }
    },
    async updateRangeOwnerQc() {
      try {
        const { data } = await this.$axios.get(
          `/issues/getOneNameQc/${this.$auth.user.id}`,
          {}
        );
        const events = data.map((issue) => ({
          name: issue.issue_name,
          details: issue.issue_des,
          start: new Date(issue.issue_end),
          end: new Date(issue.issue_end),
          color: "red",
          timed: !issue.allDay,
        }));

        this.events = events;
      } catch (error) {
        console.error(error);
      }
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    checkRole() {
      if (this.user_role == "Admin") {
        this.updateRange();
        return;
      } else if (
        this.user_position == "Implementer" &&
        this.user_role != "Admin"
      ) {
        this.updateRangeOwnerQc();
        return;
      } else if (
        this.user_position == "Devloper" &&
        this.user_role != "Admin"
      ) {
        this.updateRangeOwner();
        return;
      }
      return;
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}

input[type="text"] {
  border: black;
  font-size: 16px;
  padding-left: 10px;
  outline: black;
}
</style>