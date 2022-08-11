<template>
  <dev>
    <v-row>
      <v-col>
        <v-card-title>
          {{ tblId }}
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
        </v-card-title>
      </v-col>
      <v-col>
        <v-card-actions>
          <VueJsonToCsv
            :json-data="lists"
            :csv-title="csvFile"
          >
            <v-btn
              class="primary"
            >
              CSV
            </v-btn>
          </VueJsonToCsv>
            &nbsp;&nbsp;
          <v-btn
            class="primary"
            @click="home()"
          >
            戻る
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="lists"
      :search="search"
      item-key="line"
    />
  </dev>
</template>

<script>
/* eslint-disable no-console */
export default {
  data () {
    return {
      tblId: this.$route.query.tbl,
      search: '',
      headers: [],
      lists: [],
      json_meta: [
        [{
          key: 'charset',
          value: 'utf-8'
        }]
      ],
      inTblId: this.$route.query.tbl,
      csvFile: this.$route.query.tbl + '_' + new Date().toISOString().substr(0, 10)
    }
  },
  created () {
    this.searchDate()
  },
  methods: {
    async searchDate () {
      if (!this.inTblId) {
        window.alert('検索キーが未設定です！')
        return
      }
      try {
        const res = await this.$axios.$get('http://localhost:5000/recList', {
          params: {
            tbl: this.inTblId
          }
        })
        this.headers = res
      } catch (e) {
        console.log(e.errorCode) // eslint-disable-line no-console
        window.alert(e)
      }
      try {
        const res = await this.$axios.$get('http://localhost:5000/search', {
          params: {
            tbl: this.inTblId
          }
        })
        const str = JSON.stringify(res)
        const replaced = str.replace(/T15:00:00.000Z/g, '')
        this.lists = JSON.parse(replaced)
      } catch (e) {
        console.log(e.errorCode) // eslint-disable-line no-console
        window.alert(e)
      }
    },
    home () {
      this.$router.push('/tableList')
    }
  }
}
</script>

<style lang="scss">
.v-data-table th {
  background: #8C9EFF;
}
.v-data-table td {
  background: #e0e0e0;
  border: 1px #c0c0c0 solid;
}
.v-data-table tr:nth-child(odd) td {
  background: #f5f5f5;
}
.v-data-table tr:hover td {
  background-color: #fcffa4;
}
</style>
