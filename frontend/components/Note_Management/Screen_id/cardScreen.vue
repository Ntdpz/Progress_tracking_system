<template>
  <div>
    <v-card class="custom-card">
      <v-row>
        <!-- คอลัมน์ซ้าย -->
        <v-col cols="6" class="left-column">
          <p>รูป Screen</p>
        </v-col>

        <!-- คอลัมน์ขวา -->
        <v-col cols="6" class="right-column">
          <v-row no-gutters>
            <v-col cols="12" class="top-row">
              <h4>ชื่อ Screen</h4>
            </v-col>
            <!-- แถวแรกในคอลัมน์ขวา -->
            <v-col cols="12" class="second-row">
              <p>รายระเอียดของ Screen</p>
            </v-col>

            <!-- แถวที่สองในคอลัมน์ขวา -->
            <v-col cols="12" class="bottom-row">
              <v-row no-gutters>
                <!-- คอลัมน์ซ้ายในแถวที่สอง -->
                <v-col cols="6" class="bottom-left-column">
                  <p>Phase</p>
                </v-col>

                <!-- คอลัมน์ขวาในแถวที่สอง -->
                <v-col cols="6" class="bottom-right-column">
                  <p>Progress</p>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import "./CSS/cardScreen.css";
export default {
  props: {
    screenId: {
      type: String,
      required: true,
    },
  },
};
</script>
