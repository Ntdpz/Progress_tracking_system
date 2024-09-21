<template>
  <div class="">
    <div>
      <!-- <p>{{ systems }}</p> -->
      <v-select
        v-model="selectedOption"
        :items="
          projects.map((project) => ({
            text: project.project_name_ENG,
            value: project.id,
          }))
        "
        label="โปรดเลือกโครงการที่ต้องการ"
        dense
        outlined
        @change="handleProjectChange"
      ></v-select>
      <div
        v-for="(project, index) in projects"
        :key="project.id"
        v-if="selectedOption === project.id"
      >
        <h1>{{ project.project_name_ENG }} : {{ project.project_id }}</h1>
        <!-- You can customize the content for each option here -->
      </div>
      <div v-for="(system, index) in systems" :key="system.id">
        <h1>{{ system.system_id }} : {{ system.system_nameTH }}</h1>
        <div class="pa-5" v-if="system.pni != 0 || system.pnc != 0">
          <v-row>
            <v-col>
              <v-card class="pa-5 mx-auto" max-width="500">
                <h3>ปัญหาทั้งหมด</h3>
                <h3>PNI {{ system.pni }}</h3>
                <h3>PNC {{ system.pnc }}</h3>
                <Doughnut :data="chartData(system)" /> </v-card
            ></v-col>
            <v-col>
              <v-card>
                <v-data-table
                  :headers="headers"
                  :items="system.amountissues"
                  :items-per-page="5"
                  class="elevation-1"
                ></v-data-table> </v-card
            ></v-col>
          </v-row>
        </div>
        <div class="pa-5" v-else>
          <v-card class="pa-5 mt-4" max-width="500">
            <h3>Not have issues</h3>
          </v-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: "admin",
  name: "DashboardHeader",
  data() {
    return {
      selectedOption: 1,
      options: [
        { text: "Table 1", value: 1 },
        { text: "Table 2", value: 2 },
      ],
      projects: [],
      systems: [],
      amountissues: [],
      PNI: "",
      PNC: "",
      headers: [
        {
          text: "Type",
          align: "start",
          sortable: false,
          value: "issue_type",
        },
        { text: "status", value: "issue_status" },
        { text: "amount", value: "issue_count" },
      ],
    };
  },
  created() {
    this.getProjects();
    // console.log("Selected Project ID:", this.selectedOption);
    this.handleProjectChange();
  },
  computed: {
    chartData() {
      return (system) => {
        return {
          labels: ["PNI", "PNC"],
          datasets: [
            {
              label: "ปัญหาทั้งหมดในระบบ",
              data: [system.pni, system.pnc], // Reference system.pni and system.pnc
              backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
              hoverOffset: 4,
            },
          ],
        };
      };
    },
  },
  methods: {
    async getProjects() {
      await this.$axios.get("/projects/getAll").then((res) => {
        this.projects = res.data;

        // this.selectedOption =
        //   this.projects.length > 0 ? this.projects[0].id : null;
      });
    },
    async handleProjectChange() {
      // console.log("Selected Project ID:", this.selectedOption);
      await this.$axios
        .get("/systems/getAll?project_id=" + this.selectedOption)
        .then((res) => {
          this.systems = res.data;
        });

      const systemIds = this.systems.map((system) => system.id);

      for (const systemId of systemIds) {
        try {
          const sumResponse = await this.$axios.get(
            "/issues/getSum/" + systemId
          );
          // console.log("sumResponse", sumResponse);
          let pnc = ""; // Change const to let
          let pni = ""; // Change const to let
          if (sumResponse.data.length < 2) {
            if (sumResponse.data[0]?.issue_type == "PNI") {
              // console.log("hello PNI", sumResponse.data[0]?.issue_count);
              pnc = 0;
              pni = sumResponse.data[0]?.issue_count;
            } else if (sumResponse.data[0]?.issue_type == "PNC") {
              // console.log("hello PNC");
              pnc = sumResponse.data[0]?.issue_count;
              pni = 0;
            }
          } else {
            pnc = sumResponse.data[0]?.issue_count;
            pni = sumResponse.data[1]?.issue_count;
          }
          // console.log("pnc", pnc);
          // console.log("pni", pni);

          const issueSumResponse = await this.$axios.get(
            "/issues/getIssueSum/" + systemId
          );
          const amountissues = issueSumResponse.data;

          const systemIndex = this.systems.findIndex(
            (system) => system.id === systemId
          );

          if (systemIndex !== -1) {
            // Update the system in this.systems
            this.$set(this.systems, systemIndex, {
              ...this.systems[systemIndex],
              pnc,
              pni,
              amountissues,
            });
          } else {
            // Add a new system to this.systems
            this.systems.push({
              id: systemId,
              pnc,
              pni,
              amountissues,
            });
          }
        } catch (error) {
          console.error(
            "Error fetching data for systemId " + systemId + ":",
            error
          );
        }
      }

      // console.log("final", this.systems);
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}
</style>
