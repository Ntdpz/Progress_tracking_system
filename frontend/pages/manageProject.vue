<template>
  <div class="body">
    <v-row class="mb-3">
      <v-text-title
        class="center ml-4 mr-4 mt-3 mb-1"
        style="font-weight: bold; font-size: 20px"
      >
        Project List
      </v-text-title>
      <v-divider
        class="mt-3 mb-1"
        inset
        vertical
        style="background-color: black"
      ></v-divider>
      <div
        style="
          border-radius: 99px;
          border: 2px solid #333;
          height: 32px;
          width: 15%;
          margin-left: 1%;
          margin-top: 0.8%;
        "
      >
        <v-text-field
          placeholder="Search some project"
          prepend-icon="mdi-magnify"
          rounded
          dense
          color="primary"
          style="margin-top: 1px; margin-left: 3%"
        ></v-text-field>
      </div>
    </v-row>
    <v-divider></v-divider>
    <v-row class="mt-4 ml-2 mb-2">
      <h4>Project</h4>
      <p style="color: #b6b5b5; font-size: 16px" class="ml-2">2 Projects</p>
      <v-spacer></v-spacer>
      <h4 class="" style="margin-right: 13%">Code</h4>
      <h4 class="" style="margin-right: 13%">Start</h4>
      <h4 class="" style="margin-right: 13%">End</h4>
      <h4 class="" style="margin-right: 16.5%">Agency</h4>
    </v-row>

    <v-btn
      class="new-btn ma-2 text-left"
      outlined
      color="indigo"
      dark
      block
      @click="openDialog('create')"
    >
      <span
        class="mdi mdi-plus-circle-outline"
        style="font-size: 20px; color: black"
      ></span>
      <h4 style="color: black">Add New Project</h4>
    </v-btn>
    <br />
    <v-expansion-panels
      v-for="(project, index) in projectList"
      :key="index"
      class="mb-5"
      :items="projectList"
    >
    
      <v-expansion-panel>
        <v-expansion-panel-header>
          <v-row no-gutters>
            <v-col>
              <v-row class="mt-1">
                <h4>{{ project.project_name }}</h4>
                <p style="color: #b6b5b5; font-size: 16px; margin-left: 5%">
                  3 Sub System
                </p>
              </v-row>
            </v-col>
            <v-col>
              <v-row class="mt-1 mb-1">
                <h4>{{ project.project_id }}</h4>
                <v-spacer></v-spacer>
                <h4>{{ project.formattedDateStart }}</h4>
                <v-spacer></v-spacer>
                <h4>{{ project.formattedDateEnd }}</h4>
                <v-spacer></v-spacer>
                <h4>{{ project.project_agency }}</h4>
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  icon
                  style="height: 25px"
                  @click="openDialog('edit', projectList[index])"
                >
                  <v-icon class="pa-0" size="25" color="primary">
                    mdi mdi-square-edit-outline
                  </v-icon>
                </v-btn>
                <v-spacer></v-spacer> </v-row
            ></v-col>
          </v-row>
          <v-dialog v-model="dialog" max-width="500px" :retain-focus="false">
            <v-card>
              <v-card-title>
                <v-col cols="12">
                  <v-row>
                    <h5>
                      {{
                        mode === "create" ? "Create Project" : "Edit Project"
                      }}
                    </h5>
                  </v-row>
                </v-col>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="Project ID"
                        placeholder="Project ID"
                        outlined
                        dense
                        v-model="editedItem.project_id"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        label="ตัวย่อ"
                        placeholder="ตัวย่อ"
                        outlined
                        dense
                        v-model="editedItem.project_shortname"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="8" md="8">
                      <v-text-field
                        label="Project Name"
                        placeholder="Project Name"
                        outlined
                        dense
                        v-model="editedItem.project_name"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" class="pb-0">
                      <v-text-field
                        label="Agency"
                        placeholder="Agency"
                        outlined
                        dense
                        v-model="editedItem.project_agency"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" v-show="mode == 'create'">
                      <v-menu
                        ref="menuDateStart"
                        v-model="menuDateStart"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="dateStart"
                            label="Picker in menu"
                            prepend-icon="mdi mdi-calendar-clock-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="dateStart" no-title scrollable>
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="menuDateStart = false"
                            >Cancel</v-btn
                          >
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menuDateStart.save(dateStart)"
                            >OK</v-btn
                          >
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" v-show="mode == 'create'">
                      <v-menu
                        ref="menuDateEnd"
                        v-model="menuDateEnd"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="dateEnd"
                            label="Picker in menu"
                            prepend-icon="mdi mdi-calendar-clock-outline"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="dateEnd" no-title scrollable>
                          <v-spacer></v-spacer>
                          <v-btn
                            text
                            color="primary"
                            @click="menuDateEnd = false"
                            >Cancel</v-btn
                          >
                          <v-btn
                            text
                            color="primary"
                            @click="$refs.menuDateEnd.save(dateEnd)"
                            >OK</v-btn
                          >
                        </v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" v-show="mode == 'edit'">
                      <v-text-field
                        label="Date Start"
                        placeholder="Date Start"
                        outlined
                        dense
                        v-model="editedItem.formattedDateStart"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6" v-show="mode == 'edit'">
                      <v-text-field
                        label="Date End"
                        placeholder="Date End"
                        outlined
                        dense
                        v-model="editedItem.formattedDateEnd"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="error"
                  dark
                  @click="deleteProject()"
                  v-show="mode == 'edit'"
                >
                  <h5>Delete</h5></v-btn
                >
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="dialog = false">
                  <h5>Close</h5></v-btn
                >
                <v-btn color="primary" dark @click="saveProject()">
                  <h5>{{ mode === "create" ? "Create" : "Save" }}</h5>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row justify="center" class="ml-5 mr-5 mt-0">
            <!-- *dialog -->
            <v-dialog
              v-model="dialogSubsystem"
              persistent
              max-width="600px"
              class=""
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="new-btn ma-2 text-left"
                  outlined
                  color="indigo"
                  dark
                  v-bind="attrs"
                  v-on="on"
                  block
                >
                  <span
                    class="mdi mdi-plus-circle-outline"
                    style="font-size: 20px; color: black"
                  ></span>
                  <h4 style="color: black">Add New Sub System</h4>
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <v-col cols="12">
                    <v-row>
                      <h5>Create System</h5>
                    </v-row>
                  </v-col>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field
                          label="System Name (TH)"
                          placeholder="System Name (TH)"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          label="System Name (EN)"
                          placeholder="System Name (EN)"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="8" md="8">
                        <v-text-field
                          label="Short system name"
                          placeholder="Short system name"
                          outlined
                          dense
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-autocomplete
                          label="Autocomplete"
                          :items="[
                            'dev1',
                            'dev2',
                            'dev3',
                            'dev4',
                            'dev5',
                            'dev6',
                          ]"
                          multiple
                          variant="solo"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="dialogSubsystem = false">
                    Close
                  </v-btn>
                  <v-btn color="primary" dark @click="dialogSubsystem = false">
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-row>
          <v-data-table
            :headers="headers"
            :items="system"
            sort-by="calories"
            class="v-data-table elevation-1 mb-2 mt-5"
            v-remove-row-borders
          >
            <template v-slot:top> </template>
            <template v-slot:[`item.name`]="{ item }">
              <v-icon>mdi-format-list-bulleted</v-icon>
              {{ item.system_nameTH }}
            </template>
            <template v-slot:[`item.short_name`]="{ item }">
              <v-icon>mdi-format-list-bulleted</v-icon>
              {{ item.system_shortname }}
            </template>
            <template v-slot:[`item.member`]="{ item }">
              {{ item.system_member }}
            </template>
            <template v-slot:[`item.actions`]>
              <v-btn color="primary" icon :to="`/systemdetail`">
                <v-icon class="mr-2 ml-2" size="20" color="primary">
                  mdi mdi-chevron-right-circle-outline
                </v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import moment from "moment";
export default {
  layout: "admin",
  directives: {
    "remove-row-borders": {
      inserted(el) {
        const trs = el.querySelectorAll("td");
        trs.forEach((tr) => {
          tr.style.borderBottom = "none";
        });
      },
    },
  },
  data() {
    return {
      dateStart: new Date().toISOString().substr(0, 10),
      dateEnd: new Date().toISOString().substr(0, 10),
      menuDateStart: false,
      menuDateStartEdit: false,
      dateStartEdit: new Date().toISOString().substr(0, 10),
      menuDateEnd: false,
      dialog: false,
      mode: "create",
      dialogSubsystem: false,
      headers: [
        {
          text: "Name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Short system name", value: "short_name", sortable: false },
        { text: "Member", value: "member" },
        { text: "Actions", value: "actions", sortable: false },
        // { text: "Actions", value: "actions", sortable: false },
      ],
      system: [],
      projectList: [],
      member_select: ["Dev1"],
      member: "",
      editedIndex: -1,
      editedItem: {
        project_shortname: "",
        project_name: "",
        project_id: "",
        project_agency: "",
        project_start: "",
        project_end: "",
      },
    };
  },
  created() {
    // this.initialize();
    this.getProject();
    this.getSystem();
  },
  methods: {
    initialize() {
      this.system = [
        // {
        //   name: "sub system",
        //   short_name: "Issue name",
        //   member: "Dev",
        // },
        // {
        //   name: "sub system",
        //   short_name: "Issue name",
        //   member: "Dev",
        // },
        // {
        //   name: "sub system",
        //   short_name: "Issue name",
        //   member: "Dev",
        // },
        // {
        //   name: "sub system",
        //   short_name: "Issue name",
        //   member: "Dev",
        // },
        // {
        //   name: "sub system",
        //   short_name: "Issue name",
        //   member: "Dev",
        // },
      ];
    },
    async getProject() {
      await this.$axios.get("/projects/getAll").then((res) => {
        this.projectList = res.data;
        console.log(this.projectList);
        this.projectList.forEach((project) => {
          const date = moment(
            project.project_start,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          project.formattedDateStart = date.format("YYYY-MM-DD");
          // console.log(project.formattedDateStart);
          const dateEnd = moment(
            project.project_end,
            "YYYY-MM-DDTHH:mm:ss.SSSZ"
          );
          project.formattedDateEnd = dateEnd.format("YYYY-MM-DD");
          // console.log(project.formattedDateEnd);
        });
      });
    },
    async saveProject() {
      console.log(this.mode);
      console.log(this.editedItem.id);
      if (this.mode == "edit") {
        this.editedItem.project_start = this.editedItem.formattedDateStart;
        this.editedItem.project_end = this.editedItem.formattedDateEnd;
        try {
          await this.$axios.put(
            `/projects/updateProject/${this.editedItem.id}`,
            this.editedItem
          );
          console.log("put success");
          window.location.reload();

          const promise = new Promise((resolve, reject) => {
            resolve();
            this.dialog = false;
          });
          promise.then(() => {
            setTimeout(() => {
              alert("success");
            }, 2000);
          });
        } catch (error) {
          console.error(error);
          alert("Error submitting form");
        }
      } else if (this.mode === "create") {
        this.editedItem.project_start = this.dateStart;
        this.editedItem.project_end = this.dateEnd;
        try {
          await this.$axios.post("/projects/createProject", this.editedItem);
          console.log("post success");
          window.location.reload();
          const promise = new Promise((resolve, reject) => {
            resolve();
            this.dialog = false;
            this.editedItem.project_shortname == "";
            this.editedItem.project_name == "";
            this.editedItem.project_id == "";
            this.editedItem.project_agency == "";
            this.editedItem.project_start == "";
            this.editedItem.project_end == "";
          });
          promise.then(() => {
            setTimeout(() => {
              alert("success");
            }, 2000);
          });
        } catch (error) {
          console.error(error);
          alert("Error submitting form");
        }
      }
    },
    async deleteProject() {
      try {
        await this.$axios.delete(`/projects/delete/${this.editedItem.id}`);
        console.log("delete success");
        window.location.reload();

        const promise = new Promise((resolve, reject) => {
          resolve();
          this.dialog = false;
        });
        promise.then(() => {
          setTimeout(() => {
            alert("delete success");
          }, 2000);
        });
      } catch (error) {
        console.error(error);
        alert("Error delete form");
      }
    },
    openDialog(mode, projectList) {
      this.mode = mode;
      this.dialog = true;
      if (mode === "edit") {
        this.editedIndex = this.projectList.indexOf(projectList);
        this.editedItem = Object.assign({}, projectList);
        this.dialog = true;
        console.log(mode, projectList);
      } else if (mode === "create") {
        this.dialog = true;
        console.log(mode);
        if (this.$refs.form) {
          this.$refs.form.reset();
        }
      }
    },
    async getSystem() {
      await this.$axios.get("/systems/getAll").then((res) => {
        this.system = res.data;
        console.log(this.system);
      });
    },
  },
};
</script>

<style scoped>
* {
  font-family: "Lato", sans-serif;
}
.new-btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border: 2px dotted #333;
  padding: 8px 16px;
}
</style>