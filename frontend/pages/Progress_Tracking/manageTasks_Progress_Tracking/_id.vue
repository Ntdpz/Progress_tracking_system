<template>
  <!-- Show screen detel -->
  <div class="screen-details">
    <v-row style="margin-bottom: 20px" align="center">
      <v-col cols="12" v-if="screenDetails.screenId">
        <v-card>
          <screenDetail :screenDetails="screenDetails" />
        </v-card>
      </v-col>

      <!-- แสดง ข้อมูลผู้ใช้ในระบบ Dialog -->
      <v-dialog v-model="userDialog" max-width="500" @keydown.stop>
        <v-card>
          <v-card-title>USER IN SCREEN</v-card-title>
          <!-- เพิ่มช่องค้นหา User -->
          <v-card-actions>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field v-model="searchUser" label="Search" clearable></v-text-field>
              </v-col>
            </v-row>
          </v-card-actions>
          <v-card-text>
            <v-list>
              <v-list-item v-for="user in paginatedUserList" :key="user.user_id">
                <v-list-item-avatar>
                  <v-img :src="user.user_pic" alt="User Profile"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ user.user_firstname }} {{ user.user_lastname }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{
                    user.user_position
                    }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    user.user_department
                    }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions class="pagination" style="display: flex; justify-content: center; align-items: center">
            <v-spacer></v-spacer>
            <v-pagination v-if="totalPagesUser > 1" v-model="currentPageUser" :length="totalPagesUser"
              @input="paginateUserList"></v-pagination>
            <v-spacer></v-spacer>
            <v-btn color="error" @click="closeUserListDialog">CLOSE</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- Task list -->
    <div class="task-list">
      <!-- ScreenName and Progress -->
      <div class="topper">
        <h3>Task Management</h3>
        <v-divider vertical></v-divider>
      </div>
      <v-row>
        <!-- Search bar -->

        <v-col cols="12" md="10">
          <v-text-field v-model="searchQuery" label="Search" clearable outlined dense>
          </v-text-field>
        </v-col>
        <!-- open add task form -->
        <v-col cols="12" md="2" class="text-mid">
          <v-row>
            <v-col cols="12">
              <v-btn class="rounded-btn" color="primary" @click="handleAddTaskClick" style="width: 100%">
                Add Task
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-divider></v-divider>
    </div>

    <!-- Edit task dialog -->
    <v-dialog v-model="dialogEditTaskForm" max-width="600px">
      <v-card>
        <v-card-title>
          <h2>Edit Task</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogEditTaskForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updateTask">
            <v-row>
              <v-col cols="6">
                <v-text-field v-model="editedTask.task_id" label="Task ID" readonly disabled></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="editedTask.task_name" label="Task Name" required></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-text-field :value="formatDate(editedTask.task_plan_start, 'DD-MM-YYYY')
                      " label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="editedTask.task_plan_start" no-title scrollable></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-text-field :value="formatDate(editedTask.task_plan_end, 'DD-MM-YYYY')
                      " label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"
                      :disabled="!editedTask.task_plan_start"></v-text-field>
                  </template>
                  <v-date-picker v-model="editedTask.task_plan_end" no-title scrollable
                    :min="editedTask.task_plan_start"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-menu v-if="editedTask.task_plan_start && editedTask.task_plan_end" v-model="actualStartMenu"
                  :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-text-field :value="formatDate(editedTask.task_actual_start, 'DD-MM-YYYY')
                      " label="Actual Start" prepend-icon="mdi-calendar" readonly v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="editedTask.task_actual_start" no-title scrollable></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu v-if="editedTask.task_plan_start && editedTask.task_plan_end" v-model="actualEndMenu"
                  :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y>
                  <template v-slot:activator="{ on }">
                    <v-text-field :value="formatDate(editedTask.task_actual_end, 'DD-MM-YYYY')
                      " label="Actual End" prepend-icon="mdi-calendar" readonly v-on="on">
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="editedTask.task_actual_end" no-title scrollable
                    :min="editedTask.task_actual_start"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6">
                <v-text-field v-model="editedTask.task_manday" label="Plan Manday" outlined readonly dense
                  :style="{ opacity: 0.5 }"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="editedTask.task_type" :items="['Design', 'Develop']" label="Type of Task"
                  required outlined dense disabled></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-select v-model="editedTask.task_member_id" :items="userListCreate" item-value="user_id"
                  item-text="user_name" label="Assign To" required>
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-img :src="item.user_pic" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        item.user_name
                        }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col cols="auto">
                <v-btn color="success" type="submit">Save</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn v-if="
                  (editedTask.memberDetails &&
                    editedTask.memberDetails.id === user.id) ||
                  user.user_role === 'Admin'
                " color="error" @click.stop="deleteTask(editedTask)">
                  Delete
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Create task dialog SA -->
    <v-dialog v-model="dialogAddTaskForm" max-width="600px">
      <v-card>
        <v-card-title>
          <h2>Create Task</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogAddTaskForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Create task form -->
          <v-form @submit.prevent="createTask(newTask)">
            <h1></h1>
            <v-row>
              <!-- Task ID -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_id" label="Task ID" :rules="[(v) => !!v || 'Task ID is required']"
                  required append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
              <!-- Task Name -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_name" label="Task Name"
                  :rules="[(v) => !!v || 'Task Name is required']" required
                  append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <!-- Plan Start -->
              <v-col cols="12" md="4">
                <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"
                      :value="formatDate(newTask.task_plan_start)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_start" no-title scrollable
                    max-width="300px"></v-date-picker>
                </v-menu>
              </v-col>
              <!-- Plan End -->
              <v-col cols="12" md="4">
                <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"
                      :min="newTask.task_plan_start" :value="formatDate(newTask.task_plan_end)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_end" no-title scrollable max-width="300px"
                    :min="newTask.task_plan_start"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="newTask.task_manday" label="Plan Manday" outlined readonly
                  :style="{ opacity: 0.5 }"></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <!-- Member ID -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_member_id" :items="userListCreate" item-value="user_id"
                  item-text="user_name" label="Assign To" :disabled="user.user_role === 'User'">
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-img :src="item.user_pic" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        item.user_name
                        }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-select>
              </v-col>

              <!-- Status -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_type" :items="statusOptions" label="Type of Task"
                  :rules="[(v) => !!v || 'Task Type is required']" required></v-select>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col cols="auto">
                <!-- Submit button -->
                <v-btn color="primary" :disabled="!newTask.task_id || !newTask.task_name" type="submit">
                  Create</v-btn>
                <!-- Cancel button -->
                <v-btn color="error" @click="cancel">Cancel</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Create task dialog Dev-->
    <v-dialog v-model="DevdialogAddTaskForm" max-width="600px">
      <v-card>
        <v-card-title>
          <h2>Create Task</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="DevdialogAddTaskForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Create task form -->
          <v-form @submit.prevent="createTask(newTask)">
            <h1></h1>
            <v-row>
              <!-- Task ID -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_id" label="Task ID" :rules="[(v) => !!v || 'Task ID is required']"
                  required append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
              <!-- Task Name -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_name" label="Task Name"
                  :rules="[(v) => !!v || 'Task Name is required']" required
                  append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <!-- Plan Start -->
              <v-col cols="12" md="4">
                <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"
                      :value="formatDate(newTask.task_plan_start)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_start" no-title scrollable
                    max-width="300px"></v-date-picker>
                </v-menu>
              </v-col>
              <!-- Plan End -->
              <v-col cols="12" md="4">
                <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"
                      :min="newTask.task_plan_start" :value="formatDate(newTask.task_plan_end)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_end" no-title scrollable max-width="300px"
                    :min="newTask.task_plan_start"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="newTask.task_manday" label="Plan Manday" outlined readonly
                  :style="{ opacity: 0.5 }"></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <!-- Member ID -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_member_id" :items="userListCreate" item-value="user_id"
                  item-text="user_name" label="Assign To" :disabled="user.user_role === 'User'">
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-img :src="item.user_pic" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        item.user_name
                        }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-select>
              </v-col>

              <!-- Status -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_type" :items="statusOptionsDev" label="Type of Task"
                  :rules="[(v) => !!v || 'Task Type is required']" required></v-select>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col cols="auto">
                <!-- Submit button -->
                <v-btn color="primary" :disabled="!newTask.task_id || !newTask.task_name" type="submit">
                  Create</v-btn>
                <!-- Cancel button -->
                <v-btn color="error" @click="cancel">Cancel</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Create task dialog Imp-->
    <v-dialog v-model="ImpdialogAddTaskForm" max-width="600px">
      <v-card>
        <v-card-title>
          <h2>Create Task</h2>
          <v-spacer></v-spacer>
          <v-btn icon @click="ImpdialogAddTaskForm = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <!-- Create task form -->
          <v-form @submit.prevent="createTask(newTask)">
            <h1></h1>
            <v-row>
              <!-- Task ID -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_id" label="Task ID" :rules="[(v) => !!v || 'Task ID is required']"
                  required append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
              <!-- Task Name -->
              <v-col cols="12" md="6">
                <v-text-field v-model="newTask.task_name" label="Task Name"
                  :rules="[(v) => !!v || 'Task Name is required']" required
                  append-icon="mdi-alert-circle"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <!-- Plan Start -->
              <v-col cols="12" md="4">
                <v-menu v-model="planStartMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan Start" prepend-icon="mdi-calendar" readonly v-on="on"
                      :value="formatDate(newTask.task_plan_start)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_start" no-title scrollable
                    max-width="300px"></v-date-picker>
                </v-menu>
              </v-col>
              <!-- Plan End -->
              <v-col cols="12" md="4">
                <v-menu v-model="planEndMenu" :close-on-content-click="false" :nudge-right="40"
                  transition="scale-transition" offset-y max-width="300px">
                  <template v-slot:activator="{ on }">
                    <v-text-field label="Plan End" prepend-icon="mdi-calendar" readonly v-on="on"
                      :min="newTask.task_plan_start" :value="formatDate(newTask.task_plan_end)"></v-text-field>
                  </template>
                  <v-date-picker v-model="newTask.task_plan_end" no-title scrollable max-width="300px"
                    :min="newTask.task_plan_start"></v-date-picker>
                </v-menu>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field v-model="newTask.task_manday" label="Plan Manday" outlined readonly
                  :style="{ opacity: 0.5 }"></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <!-- Member ID -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_member_id" :items="userListCreate" item-value="user_id"
                  item-text="user_name" label="Assign To" :disabled="user.user_role === 'User'">
                  <template v-slot:item="{ item }">
                    <v-list-item-avatar>
                      <v-img :src="item.user_pic" />
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        item.user_name
                        }}</v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-select>
              </v-col>

              <!-- Status -->
              <v-col cols="12" md="6">
                <v-select v-model="newTask.task_type" :items="statusOptionsImp" label="Type of Task"
                  :rules="[(v) => !!v || 'Task Type is required']" required></v-select>
              </v-col>
            </v-row>

            <v-row justify="center">
              <v-col cols="auto">
                <!-- Submit button -->
                <v-btn color="primary" :disabled="!newTask.task_id || !newTask.task_name" type="submit">
                  Create</v-btn>
                <!-- Cancel button -->
                <v-btn color="error" @click="cancel">Cancel</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-data-table :headers="taskHeaders" :items="filteredTasks" item-key="task_id" class="elevation-1">
      <template v-slot:item="{ item }">
        <tr @click="canShowUpdateIcon(item) && openSaveHistoryDialog(item)">
          <!-- ข้อมูลต่าง ๆ ของ task -->
          <td>{{ item.task_id }}</td>
          <td>{{ item.task_name }}</td>
          <td>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <!-- แสดงรูปผู้ใช้และเชื่อมต่อกับ tooltip -->
                <v-list-item-avatar v-bind="attrs" v-on="on">
                  <v-img :src="getUserPic(item.task_member_id)" alt="User Avatar" />
                </v-list-item-avatar>
              </template>
              <v-card-title class="font-weight" style="font-size: 1rem; text-align: center">
                {{ getUserName(item.task_member_id) }}
              </v-card-title>
            </v-tooltip>
          </td>
          <td>{{ getUserFirstName(item.task_member_id) }}</td>
          <td class="progress-cell">
            <v-progress-linear :color="getProgressColor(parseInt(item.task_progress))" height="20"
              :value="parseInt(item.task_progress)">
              <strong>{{ item.task_progress }}%</strong>
            </v-progress-linear>
          </td>
          <td>{{ formatDate(item.task_plan_start) }}</td>
          <td>{{ formatDate(item.task_plan_end) }}</td>
          <td>{{ item.task_manday ? item.task_manday : "0" }}</td>
          <td>{{ item.task_type }}</td>
          <!-- Actions column -->
          <td @click.stop>
            <!-- Existing buttons -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-if="user.user_role === 'Admin'" v-bind="attrs" v-on="on" icon color="primary" @click.stop="
                  dialogEditTaskForm = true;
                editedTask = item;
                ">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Edit</span>
            </v-tooltip>

            <!-- Tooltip with Update text -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" v-if="
                  (item.memberDetails && item.memberDetails.id === user.id) ||
                  user.user_role === 'Admin'
                " icon color="primary" @click.stop="openSaveHistoryDialog(item)">
                  <v-icon>mdi-update</v-icon>
                </v-btn>
              </template>
              <span>Update</span>
            </v-tooltip>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- save task dialog -->
    <v-dialog v-model="dialogSaveTaskForm" max-width="70%">
      <v-card>
        <v-card-title> </v-card-title>
        <v-card-subtitle>
          <!-- ส่ง selectedTask ไปยัง update_task component -->
          <update_task :task="selectedTask" @close-dialog="dialogSaveTaskForm = false" @task-updated="refreshTable" />
        </v-card-subtitle>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import Breadcrumbs from "~/components/Breadcrumbs.vue";
import Loader from "@/components/Loader.vue";
import { decodeId } from "~/utils/crypto";
import update_task from "@/components/Progress_tracking/Dashbord/update_task.vue";
import screenDetail from "@/components/Progress_tracking/Screen/screenDetail.vue";

export default {
  head() {
    return {
      title: "ManageTask",
    };
  },
  middleware: "auth",
  layout: "admin",
  layout: "admin",
  components: {
    Breadcrumbs,
    update_task,
    Loader,
    screenDetail,
  },
  async asyncData({ params, $axios, error }) {
    const encodedId = params.id;
    const decodedId = decodeId(encodedId);

    if (!decodedId) {
      return error({ statusCode: 400, message: "Invalid Screen ID" });
    }

    try {
      const screen = await $axios.$get(`/tasks/searchByScreenId/${decodedId}`);
      return { screen, screenid: decodedId };
    } catch (err) {
      return error({ statusCode: 404, message: "Screen not found" });
    }
  },
  data() {
    return {
      screenDetails: {
        screenId: null,
        system_id: null,
        project_id: null,
        screen_name: null,
        screen_level: null,
        screen_manday: null,
        screen_pic: null,
        screen_progress: null,
        screen_progress_status_design: null,
        screen_progress_status_dev: null,
        screen_progress_status_testing: null,
        task_count: null,
        screen_plan_start: null,
        screen_plan_end: null,
      },
      selectedTask: {},
      taskId: "",
      task_id: "",
      screen: null,
      screenid: null,
      loggedIn: this.$auth.loggedIn,
      user: this.$auth.user,
      dialogSaveTaskForm: false, // Dialog status
      taskHeaders: [
        { text: "Task ID", value: "task_id" },
        { text: "Task Name", value: "task_name" },
        { text: "Task User", value: "user_id" },
        { text: "Position", value: "task_member_id" },
        { text: "Progress", value: "task_progress" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Manday", value: "task_manday" },
        { text: "Task Type", value: "task_type" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      taskTypeOrder: ["Document", "Design", "Develop", "Testing", "Maintenance"], // กำหนดลำดับของ task types
      userProjects: [],
      historyTaskData: {
        task_name: "",
        task_detail: "",
        task_type: "",
        task_progress: "",
        task_plan_start: "",
        task_plan_end: "",
        task_manday: "",
        task_actual_start: "",
        task_actual_end: "",
        actual_manday: "",
        selectedTasks: [],
        screen_id: null, // กำหนดค่าเริ่มต้นเป็น null หรือ integer ที่ถูกต้อง
        project_id: null, // กำหนดค่าเริ่มต้นเป็น null หรือ integer ที่ถูกต้อง
        system_id: null, // กำหนดค่าเริ่มต้นเป็น null หรือ integer ที่ถูกต้อง
        task_member_id: null, // กำหนดค่าเริ่มต้นเป็น null หรือ integer ที่ถูกต้อง
        taskid: "",
        task_id: "",
      },

      value: 0, // กำหนดค่าเริ่มต้นสำหรับ value
      interval: null, // สำหรับเก็บค่า interval

      dialogTaskDetails: {}, // ถ้าต้องการเก็บข้อมูล Task Details ให้ใช้ตัวแปรนี้
      historyTasks: [], // เก็บข้อมูล history tasks ที่ได้จาก API
      historyHeaders: [
        { text: "Update date", value: "update_date" },
        { text: "User update", value: "user_update" },
        // { text: "Task type", value: "task_type" },
        { text: "Progress", value: "task_progress" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Actual Start", value: "task_actual_start" },
        { text: "Actual End", value: "task_actual_end" },
        { text: "Task Detail", value: "task_detail" },
      ],
      dialog: false,
      dialogTaskDetails: {},
      currentPageUser: 1,
      itemsPerPage: 3,
      filteredUsers: [],
      searchUser: "",
      rules: {
        required: (value) => !!value || "Field is required",
        maxManday: (value) =>
          (value && value <= 10) || "Manday must not exceed 10",
      },
      selectedStatus: "start",
      planStartMenu: false,
      planEndMenu: false,
      actualStartMenu: false,
      actualEndMenu: false,
      editedTask: {
        task_name: "",
        task_detail: "",
        // task_status: "",
        task_type: "",
        task_manday: "",
        task_progress: "",
        task_plan_start: "",
        task_plan_end: "",
        task_actual_start: "",
        task_actual_end: "",
        task_member_id: "",
      },
      tasks: [],
      currentPage: 1,
      perPage: 12,
      statusOptions: ["Document", "Design", "Develop", "Testing", "Maintenance"],
      statusOptionsDev: ["Develop", "Maintenance"],
      statusOptionsImp: ["Document", "Testing"],
      showImageDialog: false,
      showHistoryDialog: false,
      screen_plan_start: "",
      screen_plan_end: "",
      screen_progress: "",
      screen_progress_status_design: 0,
      screen_progress_status_dev: 0,
      screen_progress_status_testing: 0,
      screen_manday: "",
      screen_level: "",
      screen_pic: "",
      screenType: "",
      task_count: "",
      screen_name: "",
      userDialog: false,
      userList: [],
      userListCreate: [],

      screenId: "",
      system_id: "",
      project_id: "",
      deletedTasks: [],

      showDetails: false,
      // Dialogs
      dialogEditTaskForm: false,
      dialogAddTaskForm: false,
      DevdialogAddTaskForm: false,
      ImpdialogAddTaskForm: false,
      show: false,
      searchQuery: "",
      headersDelete: [
        // Data Deleted Tasks History
        { text: "Task ID", value: "task_id" },
        { text: "Task Detail", value: "task_detail" },
        { text: "Task Type", value: "task_type" },
        { text: "Plan Start", value: "task_plan_start" },
        { text: "Plan End", value: "task_plan_end" },
        { text: "Actual Start", value: "task_actual_start" },
        { text: "Actual End", value: "task_actual_end" },
        // { text: "Actions", value: "actions", sortable: false },
      ],
      //Edited Task data

      //Task data
      tasks: [],
      //New Task data
      newTask: {
        task_id: "",
        task_name: "",
        task_type: "Design",
        person_in_charge: "",
        task_plan_start: null,
        task_plan_end: null,
        task_manday: 0,
        task_detail: "",
        task_member_id: null,
      },
      isEditableManday: true,
      taskIDRules: [
        (v) => !!v || "Task ID is required",
        (v) =>
          (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
          "Invalid characters. Only English letters, numbers, and symbols are allowed",
      ],
      taskNameRules: [
        (v) => !!v || "Task Name is required",
        (v) =>
          (v && v.length <= 50) ||
          "Task Name must be less than or equal to 50 characters",
      ],
      value: 0, // ค่าที่จะอัปเดตทุก ๆ 1 วินาที
      hoveredUser: null,
    };
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.value >= 100) {
        this.value = 0;
      } else {
        this.value += 10;
      }
    }, 1000);
  },
  beforeDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  },

  computed: {
    getProgressColorTask() {
      return function (progress) {
        if (progress >= 61) {
          return "green"; // สีเขียว
        } else if (progress >= 40) {
          return "#FC8705"; // สีเหลือง
        } else {
          return "red"; // สีแดง
        }
      };
    },
    numberOfPages() {
      return Math.ceil(this.filteredTasks.length / this.perPage);
    },
    paginatedTasks() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.filteredTasks.slice(startIndex, endIndex);
    },
    paginatedUserList() {
      const start = (this.currentPageUser - 1) * this.itemsPerPage;
      const end = this.currentPageUser * this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
    totalPagesUser() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },

    calculatedManday() {
      // Check if both task_plan_start and task_plan_end are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        const start = new Date(this.newTask.task_plan_start);
        const end = new Date(this.newTask.task_plan_end);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays;
      } else {
        // If task_plan_end is not selected, return null
        return null;
      }
    },
    filteredTasksByStatus() {
      return (status) => {
        if (this.tasks && Array.isArray(this.tasks)) {
          return this.tasks.filter(
            (task) => task.task_status.toLowerCase() === status.toLowerCase()
          );
        } else {
          return [];
        }
      };
    },

    // คำนวณจำนวนหน้าทั้งหมด
    totalPages() {
      return Math.ceil(this.tasks.length / this.pageSize);
    },
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        // ทำการกรองข้อมูลตาม searchQuery
        let filtered = this.tasks.filter((task) => {
          if (task.task_name && task.task_id) {
            const searchText =
              `${task.task_name} ${task.task_id}`.toLowerCase();
            return searchText.includes(this.searchQuery.toLowerCase());
          } else {
            return false;
          }
        });

        // เรียงลำดับข้อมูลที่กรองแล้วตามเงื่อนไขที่กำหนด
        filtered.sort((a, b) => {

          // เรียกใช้ฟังก์ชัน sortByPosition ก่อน เพื่อตรวจสอบตำแหน่งงาน
          const positionOrder = this.sortByPosition(a.task_member_position, b.task_member_position);
          if (positionOrder !== 0) {
            return positionOrder;
          }

          // ถ้าหาก task_type เหมือนกัน ให้จัดเรียงตาม task_progress จากน้อยไปมาก
          const progressA = parseInt(a.task_progress);
          const progressB = parseInt(b.task_progress);
          if (progressA !== progressB) {
            return progressA - progressB;
          }

          // ถ้าหาก task_progress เหมือนกัน ให้จัดเรียงตาม task_type โดยใช้ลำดับที่กำหนดไว้ใน taskTypeOrder
          const typeOrderA = this.taskTypeOrder.indexOf(a.task_type);
          const typeOrderB = this.taskTypeOrder.indexOf(b.task_type);
          return typeOrderA - typeOrderB;
        });

        return filtered;
      } else {
        return [];
      }
    },
  },

  mounted() {
    this.fetchAllScreens()
      .then(() => this.fetchAllSystems())
      .then(() => this.fetchAllProjects())
      .then(() => this.fetchScreenDetail())
      .then(() => this.fetchUserList())
      .then(() => this.fetchTasks())

      .catch((error) => {
        console.error("Error:", error);
        // Handle error here
      });
  },

  created() {
    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
    this.getTasksToday();
    this.newTask.task_member_id = this.user.id;
  },
  watch: {
    "historyTaskData.task_actual_start": "calculateActualManday",
    "historyTaskData.task_actual_end": "calculateActualManday",

    "historyTaskData.task_plan_start": function (newVal, oldVal) {
      this.calculateMandaySAVE();
    },
    "historyTaskData.task_plan_end": function (newVal, oldVal) {
      this.calculateMandaySAVE();
    },
    "newTask.task_plan_start": "calculateMandays",
    "newTask.task_plan_end": "calculateMandays",
    "editedTask.task_plan_start": function (newValue, oldValue) {
      if (this.editedTask.task_plan_start && this.editedTask.task_plan_end) {
        this.calculateMandayEdit();
      }
    },
    "editedTask.task_plan_end": function (newValue, oldValue) {
      if (this.editedTask.task_plan_start && this.editedTask.task_plan_end) {
        this.calculateMandayEdit();
      }
    },

    filteredTasks: {
      handler() {
        // เรียกใช้ฟังก์ชันเมื่อมีการเปลี่ยนแปลงใน Task ของคุณ

        this.getTasksToday();
      },
      deep: true,
    },
    // Watcher to update task_manday when task_plan_start or task_plan_end changes
  },
  methods: {
    handleAddTaskClick() {
      if (this.user.user_position === "Developer") {
        this.DevdialogAddTaskForm = true;
      } else if (this.user.user_position === "Implementer") {
        this.ImpdialogAddTaskForm = true;
      } else {
        this.dialogAddTaskForm = true; // ค่าเริ่มต้นหรือสำหรับตำแหน่งอื่นๆ
      }
    },
    
    canShowUpdateIcon(item) {
      return (item.memberDetails && item.memberDetails.id === this.user.id) || this.user.user_role === 'Admin';
    },

    sortByPosition(positionA, positionB) {
      const positionOrder = ["System Analyst", "Developer", "Implementer"];
      return positionOrder.indexOf(positionA) - positionOrder.indexOf(positionB);
    },

    refreshTable() {
      // Logic to refresh the table, e.g., re-fetch data
      this.fetchTasks(); // Replace with actual method to refresh data
    },
    getUserPic(userId) {
      // หา user object โดยใช้ userId และคืนค่าภาพผู้ใช้
      const user = this.userList.find((user) => user.user_id === userId);
      return user ? user.user_pic : "";
    },
    getUserName(userId) {
      // หา user object โดยใช้ userId และคืนค่าชื่อผู้ใช้
      const user = this.userList.find((user) => user.user_id === userId);
      return user ? user.user_name : "Unknown";
    },
    getUserFirstName(userId) {
      const user = this.userList.find((u) => u.user_id === userId);
      return user ? user.user_name.split(" : ")[0] : "Unknown";
    },

    calculateMandays() {
      // Check if both start and end dates are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        const startDate = new Date(this.newTask.task_plan_start);
        const endDate = new Date(this.newTask.task_plan_end);

        // Calculate business days
        this.newTask.task_manday = this.countBusinessDays(startDate, endDate);
      } else {
        // If either start or end date is not selected, reset manday field
        this.newTask.task_manday = null;
      }
    },

    countBusinessDays(startDate, endDate) {
      let count = 0;
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return count;
    },
    calculateActualManday() {
      const start = this.historyTaskData.task_actual_start;
      const end = this.historyTaskData.task_actual_end;

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Calculate difference in time (milliseconds)
        const diffTime = Math.abs(endDate - startDate);

        // Calculate difference in days (1 day = 1000 * 60 * 60 * 24 milliseconds)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include the start day

        // Assign the calculated days to actual_manday
        this.historyTaskData.actual_manday = diffDays;
      }
    },

    async takeTask(task) {
      try {
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ที่เข้าสู่ระบบหรือไม่
        if (!this.$auth.user || !this.$auth.user.id) {
          throw new Error("User is not authenticated.");
        }

        // แสดง confirm dialog เพื่อยืนยันการ Take งาน
        const confirmResult = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "Do you want to take this task?",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, take it!",
          cancelButtonText: "Cancel",
        });

        // ถ้าผู้ใช้กดปุ่มยืนยัน
        if (confirmResult.isConfirmed) {
          // อัปเดต task_member_id ด้วย ID ของผู้ใช้ที่เข้าสู่ระบบ
          const response = await this.$axios.$put(
            `/tasks/updateTasks/${task.id}`,
            {
              ...task,
              task_member_id: this.$auth.user.id, // อัปเดต task_member_id ด้วย ID ของผู้ใช้ที่เข้าสู่ระบบ
            }
          );

          // ตรวจสอบว่าการตอบกลับสำเร็จหรือไม่
          if (response) {
            Swal.fire({
              icon: "success",
              title: "Task assigned successfully",
              confirmButtonColor: "#009933",
            });
            // อัปเดตรายการงาน
            this.fetchTasks();
          } else {
            throw new Error("Failed to assign task");
          }
        }
      } catch (error) {
        console.error("Error assigning task:", error);
        Swal.fire({
          icon: "error",
          title: "Error assigning task",
          text: error.message || "Please try again",
        });
      }
    },
    getProgressColor(progress) {
      if (progress >= 75 && progress <= 100) {
        return "#4CAF50";
      } else if (progress >= 51 && progress <= 74) {
        return "#03A9F4";
      } else if (progress >= 26 && progress <= 50) {
        return "#FFD700";
      } else if (progress >= 0 && progress <= 25) {
        return "#FC8705";
      }
      // เมื่อไม่ตรงกับเงื่อนไขใดๆ ให้คืนค่าเริ่มต้น
      return "primary";
    },
    async fetchAllScreens() {
      try {
        // ใช้ this.$axios แทน axios และลบ base URL ออก
        const response = await this.$axios.get("/screens/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching screens:", error);
        throw error;
      }
    },
    async fetchAllSystems() {
      try {
        // ใช้ this.$axios แทน axios และลบ base URL ออก
        const response = await this.$axios.get("/systems/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching systems:", error);
        throw error;
      }
    },
    async fetchAllProjects() {
      try {
        // ใช้ this.$axios แทน axios และลบ base URL ออก
        const response = await this.$axios.get("/projects/getAll");
        return response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
    },
    formatDateHistory(historyTasks) {
      return historyTasks.map((task) => {
        // สร้างวัตถุใหม่ที่มีข้อมูลจาก task และแปลงรูปแบบวันที่
        return {
          ...task,
          // สมมติว่าวันที่อยู่ในคีย์ "date"
          date: new Date(task.date).toLocaleDateString("en-GB"), // ใช้ 'th-TH' หากต้องการให้เป็นภาษาไทย
        };
      });
    },

    async openSaveHistoryDialog(task) {
      // Set task data for the form
      this.historyTaskData = {
        task_name: task.task_name,
        task_detail: task.task_detail,
        task_status: task.task_status,
        task_type: task.task_type,
        task_progress: task.task_progress,
        task_plan_start: task.task_plan_start,
        task_plan_end: task.task_plan_end,
        task_manday: task.task_manday,
        task_actual_start: task.task_actual_start,
        task_actual_end: task.task_actual_end,
        taskid: task.id,
        task_id: task.task_id,
        // Set other fields as per your API
      };
      // Set the task ID for the API endpoint
      this.taskId = task.id; // Assign task ID to a component data property

      // กำหนดค่า task_Id จาก task.id ก่อนเรียก API
      const task_Id = task.id;

      // Fetch history tasks from the API
      try {
        const response = await this.$axios.get(
          `/tasks/history_tasks/${task_Id}`
        );
        this.historyTasks = response.data;

        // เพิ่มส่วนนี้เพื่อดึงรายละเอียดของผู้ใช้และแทนที่ id ด้วยข้อมูลผู้ใช้
        for (let i = 0; i < this.historyTasks.length; i++) {
          const userId = this.historyTasks[i].user_update;
          const userDetails = await this.fetchMemberDetails(userId);
          if (userDetails) {
            const fullName =
              userDetails.user_firstname + " " + userDetails.user_lastname;
            this.historyTasks[i].user_update = fullName;
          }
        }
      } catch (error) {
        console.error("Error fetching history tasks:", error);
      }

      // Open the save task dialog
      this.dialogSaveTaskForm = true;
      this.selectedTask = task;
    },
    formatDateSAVE(date) {
      // แปลงข้อความวันที่เป็นอ็อบเจ็ค Date
      const d = new Date(date);

      // ดึงค่าปี เดือน และวัน
      const year = d.getFullYear();
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();

      // เติมเต็มเดือน และวันที่มีหลักเดียวด้วยเลขศูนย์ด้านหน้า
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      // ส่งค่าวันที่ในรูปแบบ 'YYYY-MM-DD'
      return `${year}-${month}-${day}`;
    },

    calculateMandaySAVE() {
      // คำนวณจำนวนวันระหว่าง task_plan_start และ task_plan_end
      const start = new Date(this.historyTaskData.task_plan_start);
      const end = new Date(this.historyTaskData.task_plan_end);

      // ลบเวลาออกจากวันที่
      const startNoTime = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const endNoTime = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      // หาความแตกต่างของวันแบบไม่คำนึงถึงเวลา
      const differenceInTime = endNoTime.getTime() - startNoTime.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)); // ใช้ Math.ceil() เพื่อปัดขึ้น

      // ตรวจสอบว่าไม่สามารถใส่ค่าลบหรือค่าเป็น NaN ได้
      if (isNaN(differenceInDays) || differenceInDays < 0) {
        this.historyTaskData.task_manday = "";
      } else {
        this.historyTaskData.task_manday = differenceInDays + 1; // เพิ่ม 1 เพื่อให้นับวันเริ่มต้นด้วย
      }
    },

    async saveHistory() {
      try {
        // ตรวจสอบค่า manday ที่ได้จากฟังก์ชัน calculateMandaySAVE()
        const manday = parseFloat(this.historyTaskData.task_manday);
        console.log(manday);
        const start = new Date(this.historyTaskData.task_plan_start);
        const end = new Date(this.historyTaskData.task_plan_end);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24) + 1;
        if (manday < 0 || manday > differenceInDays || isNaN(manday)) {
          // แสดง SweetAlert แจ้งเตือนเมื่อค่าไม่ถูกต้อง
          await Swal.fire({
            icon: "error",
            title: "Error",
            text:
              "Invalid manday value. Please enter a value between 0 and " +
              differenceInDays,
            confirmButtonColor: "#009933",
          });
          return; // ออกจากฟังก์ชันหลังจากแสดงข้อความแจ้งเตือน
        }

        // ตรวจสอบค่า task_manday และค่าอื่นๆ และบันทึกข้อมูล

        // ตรวจสอบว่าค่าวันที่ว่างเปล่าหรือไม่และกำหนดให้เป็น null
        if (this.historyTaskData.task_plan_start) {
          this.historyTaskData.task_plan_start = this.formatDateSAVE(
            this.historyTaskData.task_plan_start
          );
        } else {
          this.historyTaskData.task_plan_start = null;
        }
        if (this.historyTaskData.task_plan_end) {
          this.historyTaskData.task_plan_end = this.formatDateSAVE(
            this.historyTaskData.task_plan_end
          );
        } else {
          this.historyTaskData.task_plan_end = null;
        }
        if (this.historyTaskData.task_actual_start) {
          this.historyTaskData.task_actual_start = this.formatDateSAVE(
            this.historyTaskData.task_actual_start
          );
        } else {
          this.historyTaskData.task_actual_start = null;
        }
        if (this.historyTaskData.task_actual_end) {
          this.historyTaskData.task_actual_end = this.formatDateSAVE(
            this.historyTaskData.task_actual_end
          );
          // ตรวจสอบว่า screen_id ไม่ใช่ค่าว่างเปล่าและกำหนดค่าตั้งต้น
          if (
            this.historyTaskData.screen_id === null ||
            this.historyTaskData.screen_id === undefined
          ) {
            this.historyTaskData.screen_id = ""; // หรือกำหนดเป็นค่า default ที่เหมาะสม
          }

          // ตรวจสอบว่า project_id ไม่ใช่ค่าว่างเปล่าและกำหนดค่าตั้งต้น
          if (
            this.historyTaskData.project_id === null ||
            this.historyTaskData.project_id === undefined
          ) {
            this.historyTaskData.project_id = ""; // หรือกำหนดเป็นค่า default ที่เหมาะสม
          }

          // ตรวจสอบว่า system_id ไม่ใช่ค่าว่างเปล่าและกำหนดค่าตั้งต้น
          if (
            this.historyTaskData.system_id === null ||
            this.historyTaskData.system_id === undefined
          ) {
            this.historyTaskData.system_id = ""; // หรือกำหนดเป็นค่า default ที่เหมาะสม
          }
        } else {
          this.historyTaskData.task_actual_end = null;
        }

        // กำหนดค่า user_update
        this.historyTaskData.user_update = this.user.id;

        // เรียกใช้ API เพื่อบันทึกข้อมูลประวัติโดยใช้ task ID ที่กำหนด
        const response = await this.$axios.put(
          `/tasks/save_history_tasks/${this.taskId}`,
          this.historyTaskData
        );

        // จัดการการกระทำหลังจากบันทึกสำเร็จ
        console.log(response.data);
        // แสดงแจ้งเตือนเรื่องความสำเร็จ
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "History task has been saved successfully!",
          confirmButtonColor: "#009933",
        });
        // ปิด dialog หลังจากบันทึกสำเร็จ
        this.dialogSaveTaskForm = false;
        this.fetchTasks();
        this.fetchScreenDetail();
      } catch (error) {
        console.error("Error saving history task and updating task:", error);
        // แสดงแจ้งเตือนเรื่องข้อผิดพลาด
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while saving history task and updating task.",
          confirmButtonColor: "#009933",
        });
      }
    },

    cancelSaveHistory() {
      // Cancel save and close the dialog
      this.dialogSaveTaskForm = false;
    },

    async openDialog(taskId) {
      this.dialog = true;
      this.dialogTaskDetails = taskId;

      const task_Id = taskId.id;

      try {
        // ใช้ this.$axios แทน fetch และลบ base URL ออก
        const response = await this.$axios.get(
          `/tasks/history_tasks/${task_Id}`
        );
        this.historyTasks = response.data;

        // เพิ่มส่วนนี้เพื่อดึงรายละเอียดของผู้ใช้และแทนที่ id ด้วยข้อมูลผู้ใช้
        for (let i = 0; i < this.historyTasks.length; i++) {
          const userId = this.historyTasks[i].user_update;
          const userDetails = await this.fetchMemberDetails(userId);
          if (userDetails) {
            const fullName =
              userDetails.user_firstname + " " + userDetails.user_lastname;
            this.historyTasks[i].user_update = fullName;
          }
        }
      } catch (error) {
        console.error("Error fetching history tasks:", error);
      }
    },
    sortTasks(criteria) {
      // Clone the tasks array to avoid mutating the original array
      let sortedTasks = [...this.tasks];

      // Sort the tasks based on the selected criteria
      switch (criteria) {
        case "task_name":
          sortedTasks.sort((a, b) => (a.task_name > b.task_name ? 1 : -1));
          break;
        case "-task_name":
          sortedTasks.sort((a, b) => (a.task_name < b.task_name ? 1 : -1));
          break;
        case "task_progress":
          sortedTasks.sort((a, b) => a.task_progress - b.task_progress);
          break;
        case "-task_progress":
          sortedTasks.sort((a, b) => b.task_progress - a.task_progress);
          break;
        case "task_plan_start":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_start) - new Date(b.task_plan_start)
          );
          break;
        case "task_plan_start_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_start) - new Date(a.task_plan_start)
          );
          break;
        case "task_plan_end":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_end) - new Date(b.task_plan_end)
          );
          break;
        case "task_plan_end_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_end) - new Date(a.task_plan_end)
          );
          break;
        default:
          // Do nothing if the criteria doesn't match any case
          break;
      }

      // Update the tasks with the sorted array
      this.tasks = sortedTasks;
    },

    changePage(page) {
      this.currentPage = page;
    },
    getTasksToday() {
      const currentDate = new Date(); // วันที่ปัจจุบัน
      currentDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
      this.tasksToday = this.filteredTasks.filter((task) => {
        const startDate = new Date(task.task_plan_start);
        const endDate = new Date(task.task_plan_end);
        startDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        endDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        // ตรวจสอบว่าเวลาของ Task อยู่ในช่วงเวลาปัจจุบันหรือไม่
        return (
          startDate.getTime() <= currentDate.getTime() &&
          endDate.getTime() >= currentDate.getTime()
        );
      });
    },

    paginateUserList(page) {
      this.currentPageUser = page;
    },
    closeUserListDialog() {
      this.userDialog = false;
    },
    onlyEnglishNumericSymbolRule(v) {
      return (
        (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
        "Invalid characters. Only English letters, numbers, and symbols are allowed"
      );
    },

    async deleteTask(task) {
      try {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#009933",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
          // ใช้ this.$axios แทน fetch และลบ base URL ออก
          const response = await this.$axios.$delete(
            `/tasks/deleteHistoryTasks/${task.id}`
          );

          // ตรวจสอบผลลัพธ์
          if (response) {
            // ลบงานเรียบร้อย
            Swal.fire({
              icon: "success",
              title: "Task deleted successfully",
              confirmButtonColor: "#009933",
            });
            // รีเฟรชรายการงานหลังจากลบเสร็จ
            await this.fetchTasks();
            await this.fetchScreenDetail();
            // ปิด dialog หลังจากลบเสร็จ
            this.dialogEditTaskForm = false;
          } else {
            // แจ้งเตือนเมื่อเกิดข้อผิดพลาดในการลบงาน
            throw new Error("Failed to delete task");
          }
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        Swal.fire({
          icon: "error",
          title: "Error deleting task",
          text: "Please try again",
        });
      }
    },
    async fetchMemberDetails(memberId) {
      try {
        // ใช้ this.$axios แทน fetch และลบ base URL ออก
        const response = await this.$axios.get(`/users/getOne/${memberId}`);
        return response.data[0]; // สมมติว่า API จะส่งข้อมูลผู้ใช้กลับมาเป็นอาเรย์ โดยมีข้อมูลผู้ใช้เพียงรายการเดียว
      } catch (error) {
        console.error("Error fetching member details:", error);
        return null;
      }
    },
    formatDatehistory(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },

    formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },

    paginate(page) {
      this.currentPage = page;
    },
    closeImageDialog() {
      this.showImageDialog = false;
    },
    async fetchScreenDetail() {
      try {
        const screenId = this.screenid;
        // ใช้ this.$axios แทน fetch และลบ base URL ออก
        const response = await this.$axios.get(`/screens/getOne/${screenId}`);

        if (!response.data || response.data.length === 0) {
          throw new Error("No screen data found");
        }

        const screen = response.data[0];

        // เก็บข้อมูลทั้งหมดใน object ชื่อ screenDetails
        this.screenDetails = {
          screenId: screen.id,
          system_id: screen.system_id,
          project_id: screen.project_id,
          screen_name: screen.screen_name,
          screen_level: screen.screen_level,
          screen_manday: screen.screen_manday,
          screen_pic: await this.convertBase64ToURL(screen.screen_pic),
          screen_progress: screen.screen_progress,
          screen_progress_status_design: screen.screen_progress_status_design,
          screen_progress_status_dev: screen.screen_progress_status_dev,
          screen_progress_status_testing: screen.screen_progress_status_testing,
          task_count: screen.task_count,
          screen_plan_start: screen.screen_plan_start,
          screen_plan_end: screen.screen_plan_end,
        };
      } catch (error) {
        console.error("Error fetching screen:", error);
      }
    },
    async convertBase64ToURL(base64String) {
      try {
        const response = await fetch(`data:image/jpeg;base64,${base64String}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error converting Base64 to URL:", error);
        return ""; // Return empty string if conversion fails
      }
    },
    async fetchUserList() {
      try {
        await this.fetchScreenDetail(); // Fetch screen details
        const { screenDetails } = this;

        // Check if screenId exists
        if (!screenDetails.screenId) {
          throw new Error("screenId is undefined");
        }

        // Fetch data from API
        const response = await this.$axios.get(
          `/user_screens/checkUsersINScreen/${screenDetails.project_id}/${screenDetails.system_id}/${screenDetails.screenId}`
        );

        const userList = response.data;

        // Set userList and filteredUsers
        this.userList = userList.map((user) => ({
          user_id: user.id,
          user_name: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
          user_pic: user.user_pic,
        }));
        this.filteredUsers = userList;

        // Check user role and update userListCreate accordingly
        if (this.user.user_role === "User") {
          // Only show the current user if the role is "User"
          this.userListCreate = userList
            .filter((user) => user.id === this.user.id)
            .map((user) => ({
              user_id: user.id,
              user_name: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
              user_pic: user.user_pic,
            }));
        } else {
          // Show all users if the role is not "User"
          this.userListCreate = userList.map((user) => ({
            user_id: user.id,
            user_name: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
            user_pic: user.user_pic,
          }));
        }
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    },
    openUserListDialog() {
      this.fetchUserList();
      this.userDialog = true;
    },

    closeUserListDialog() {
      this.userDialog = false; // ปิด Dialog
    },
    toggleDetails(task) {
      task.showDetails = !task.showDetails; // เปลี่ยนสถานะ showDetails เมื่อปุ่มถูกคลิก
    },
    //Fetch screen detail

    //Cancel create task
    cancel() {
      this.dialogAddTaskForm = false;
      this.DevdialogAddTaskForm = false;
      this.ImpdialogAddTaskForm = false;
    },
    //fetch task
    async fetchTasks() {
      try {
        const screenId = this.screenid;
        // ใช้ this.$axios แทน fetch และลบ base URL ออก
        const response = await this.$axios.get(
          `/tasks/searchByScreenId/${screenId}`
        );
        const tasks = response.data;

        // แก้ไขโค้ดเพิ่มเติมในการกำหนดค่า showDetails เข้าไปในข้อมูลของแต่ละ task
        this.tasks = await Promise.all(
          tasks.map(async (task) => {
            // เรียกใช้ fetchMemberDetails เพื่อดึงข้อมูลของสมาชิกที่เกี่ยวข้องกับแต่ละงาน
            const memberDetails = await this.fetchMemberDetails(
              task.task_member_id
            );
            // เพิ่มข้อมูลผู้ใช้ใน memberDetails ของแต่ละงาน
            return {
              ...task,
              showDetails: false,
              memberDetails: memberDetails, // เก็บข้อมูลผู้ใช้ใน memberDetails
            };
          })
        );
        await this.fetchScreenDetail(); // ตรวจสอบให้แน่ใจว่า fetchScreenDetail() ทำงานกับ await
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error fetching tasks
      }
    },
    // Open add task form
    openAddTaskForm() {
      this.$router.push({
        name: "task-add",
        params: { id: this.screenid },
      });
    },
    // Create new task
    async createTask() {
      try {
        const {
          task_id,
          task_name,
          task_detail = "",
          task_type = "",
          task_plan_start = "",
          task_plan_end = "",
          task_member_id,
          task_manday = "",
        } = this.newTask;

        // ตรวจสอบว่ามี task_id และ task_name หรือไม่
        if (!task_id || !task_name) {
          throw new Error("Task ID, Task Name, Task Type are required.");
        }

        // ส่งข้อมูลไปยัง backend เพื่อสร้าง task ใหม่
        const response = await this.$axios.post("/tasks/createTasks", {
          task_id,
          task_name,
          task_detail,
          task_type,
          screen_id: this.screenDetails.screenId, // ควรแน่ใจว่า this.screenId ถูกกำหนดค่าแล้ว
          project_id: this.screenDetails.project_id, // ควรแน่ใจว่า this.project_id ถูกกำหนดค่าแล้ว
          system_id: this.screenDetails.system_id, // ควรแน่ใจว่า this.system_id ถูกกำหนดค่าแล้ว
          task_plan_start,
          task_plan_end,
          task_member_id,
          task_manday,
        });

        // ตรวจสอบว่าคำสั่ง HTTP สำเร็จหรือไม่
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Task created successfully",
            confirmButtonColor: "#009933",
          });
          this.dialogAddTaskForm = false; // ปิดฟอร์มการสร้าง task ใหม่
          this.DevdialogAddTaskForm = false;
          this.ImpdialogAddTaskForm = false;
          await this.fetchTasks(); // โหลดรายการ tasks ใหม่
          await this.fetchScreenDetail(); // โหลดข้อมูล screen ใหม่

          // Reset form after creating the task
          this.newTask = {
            task_id: "",
            task_name: "",
            task_detail: "",
            task_type: "",
            task_plan_start: "",
            task_plan_end: "",
            task_member_id: "",
            task_manday: "",
          };
        } else {
          throw new Error("Failed to create new task");
        }
      } catch (error) {
        console.error("Error creating new task:", error);
        Swal.fire({
          icon: "error",
          title: "Error creating new task",
          text: "Please try again",
          confirmButtonColor: "#009933",
        });
      }
    },
    async goToHistoryTasks() {
      await this.fetchDeletedTasks();
      this.showHistoryDialog = true;
    },

    formatDisplayDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },
    // Update task
    async updateTask() {
      try {
        const taskData = { ...this.editedTask }; // Clone the editedTask object
        taskData.task_plan_start = this.formatAPIDate(
          this.editedTask.task_plan_start
        );
        taskData.task_plan_end = this.formatAPIDate(
          this.editedTask.task_plan_end
        );
        taskData.task_actual_start = this.formatAPIDate(
          this.editedTask.task_actual_start
        );
        taskData.task_actual_end = this.formatAPIDate(
          this.editedTask.task_actual_end
        );

        // เพิ่มเงื่อนไขเพื่อตรวจสอบ task_manday ให้ไม่มากกว่าจำนวนวันที่คำนวณและไม่เป็นค่าลบ
        if (parseFloat(taskData.task_manday) < 0) {
          // เปลี่ยนจาก taskData.task_manday < 0 เป็น parseFloat(taskData.task_manday) < 0
          throw new Error("Task manday must be greater than or equal to 0");
        }

        // คำนวณ Manday โดยใช้วันที่ที่กำหนดและวันที่สิ้นสุดของงาน
        const start = new Date(taskData.task_plan_start);
        const end = new Date(taskData.task_plan_end);

        // เช็คว่าวันที่เริ่มและสิ้นสุดเหมือนกัน
        const manday = parseFloat(taskData.task_manday); // เปลี่ยนจาก parseInt(taskData.task_manday) เป็น parseFloat(taskData.task_manday)

        // ตรวจสอบว่า Manday มีค่ามากกว่าหรือเท่ากับ 0
        if (manday < 0) {
          throw new Error("Manday must be greater than or equal to 0");
        }

        // ตรวจสอบว่า task_manday มีค่าน้อยกว่าหรือเท่ากับ Manday ที่คำนวณได้
        if (manday > manday + 1) {
          throw new Error(`Task manday must be between 0 and ${manday + 1}`);
        }

        taskData.task_manday = manday;

        const response = await this.$axios.put(
          `/tasks/updateTasks/${taskData.id}`,
          taskData
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Task updated successfully",
            confirmButtonColor: "#009933",
          });
          this.dialogEditTaskForm = false;
          await this.fetchTasks();
        } else {
          throw new Error("Failed to update task");
        }
        await this.fetchScreenDetail();
      } catch (error) {
        console.error("Error updating task:", error);
        Swal.fire({
          icon: "error",
          title: "Error updating task",
          text: error.message || "Please try again",
        });
      }
    },
    calculateMandayEdit() {
      const start = new Date(this.editedTask.task_plan_start);
      const end = new Date(this.editedTask.task_plan_end);
      if (start > end) {
        // Handle error when start date is after end date
        return;
      }
      const manday = Math.round((end - start) / (1000 * 60 * 60 * 24) + 1);
      this.editedTask.task_manday = manday;
    },

    formatAPIDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    cancelEdit() {
      this.dialogEditTaskForm = false;
    },
  },
};
</script>

<style scoped>
.tooltip-content {
  max-width: 600px;
  color: white;
  /* สีข้อความเป็นสีดำ */
  border: none;
  /* ลบกรอบออก */
  border-radius: 4px;
  /* มุมกรอบมน */
  box-shadow: none;
  /* ลบเงาออก */
  padding: 16px;
  /* เพิ่ม padding เพื่อจัดระเบียบเนื้อหา */
}

.progress-row {
  margin-top: 20px;
  /* ปรับขนาดตามที่ต้องการ */
}

.my-progress {
  margin: 0 1rem;
  /* เพิ่มระยะห่างด้านซ้ายและขวา */
}

.progress-item {
  text-align: center;
}

.progress-label {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.task-card {
  margin-bottom: 10px;
}

.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.dialog-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 3px solid #0000002d;
}

.custom-expansion-panels {
  border: 1px solid #ccc;
  /* ใส่ขอบ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* เพิ่มเงา */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.text-right {
  text-align: right;
}

.user-picture {
  width: 50px;
  /* ปรับขนาดความกว้าง */
  height: 50px;
  /* ปรับขนาดความสูง */
  /* border-radius: 5%; ทำให้มันเป็นวงกลม */
}

.table-with-border {
  border: 1px solid #ccc;
  border-collapse: collapse;
}

.table-with-border th,
.table-with-border td {
  border: 1px solid #ccc;
  padding: 8px;
  /* ปรับค่าตามที่ต้องการ */
}

.clamp-text {
  font-size: 16px;
  line-height: 1.5em;
  height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  /* จำนวนบรรทัดที่ต้องการให้แสดง */
  -webkit-box-orient: vertical;
}

.rounded-btn {
  width: 40px;
  /* กำหนดขนาดของปุ่ม */
  height: 40px;
  /* กำหนดขนาดของปุ่ม */
  min-width: 40px;
  /* กำหนดขนาดของปุ่ม */
  min-height: 40px;
  /* กำหนดขนาดของปุ่ม */
  padding: 0;
  /* ลบ Padding เพื่อป้องกันการขยับของปุ่ม */
}
</style>