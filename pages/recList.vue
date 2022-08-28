<template>
  <dev>
    <!-- ダイアログ -->
    <v-dialog
      v-model="dialog"
      max-width="750"
      persistent
    >
      <v-card>
        <v-row no-gutters justify="center">
          <v-card-text>
            <v-data-table
              :headers="rowHeaders"
              :items="rowItems"
              item-key="name"
              disable-pagination
              hide-default-footer
              fixed-header
              height="600"
            >
              <template #[`item.value`]="{ item }">
                <v-text-field
                  v-model="item.value"
                  solo
                  flat
                  hide-details
                />
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="success"
              :disabled="!isIns"
              @click="insertData()"
            >
              登録
            </v-btn>
            &nbsp;&nbsp;
            <v-btn
              class="warning"
              :disabled="isIns"
              @click="updateData()"
            >
              更新
            </v-btn>
            &nbsp;&nbsp;
            <v-btn
              class="error"
              :disabled="isIns"
              @click="deleteData()"
            >
              削除
            </v-btn>
            &nbsp;&nbsp;
            <v-btn
              class="primary"
              @click="dialog = false"
            >
              キャンセル
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-row>
      </v-card>
    </v-dialog>
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
            class="success"
            @click="insClick()"
          >
            新規
          </v-btn>
        </v-card-actions>
      </v-col>
      <v-col>
        <v-card-actions class="justify-end">
          <v-btn
            class="info"
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
      @click:row="rowClick"
    />
  </dev>
</template>

<script>
/* eslint-disable no-console */
export default {
  data () {
    return {
      tblId: this.$route.query.tbl,
      dialog: false,
      isIns: false,
      search: '',
      headers: [],
      lists: [],
      rowHeaders: [
        {
          text: '項目名',
          value: 'name'
        },
        {
          text: '値',
          value: 'value'
        }
      ],
      rowItems: [],
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
        const res = await this.$axios.$get('/api/recList', {
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
        const res = await this.$axios.$get('/api/search', {
          params: {
            tbl: this.inTblId
          }
        })
        this.lists = res
        for (const item in this.lists) {
          for (const subItem in this.lists[item]) {
            try {
              const str = this.lists[item][subItem]
              if (str !== null && str.indexOf('T15:00:00.000Z') > 0) {
                const dt = new Date(Date.parse(str))
                const month = ('0' + (dt.getMonth() + 1)).slice(-2)
                const day = ('0' + dt.getDate()).slice(-2)
                this.lists[item][subItem] = dt.getFullYear() + '-' + month + '-' + day
              }
            } catch (e) { } // 握りつぶす
          }
        }
      } catch (e) {
        console.log(e.errorCode) // eslint-disable-line no-console
        window.alert(e)
      }
    },
    rowClick (row) {
      let i = 0
      this.rowItems.splice(0)
      for (const item in row) {
        const addData = { name: this.headers[i].value, value: row[item] }
        this.rowItems.push(addData)
        i++
      }
      this.dialog = true
      this.isIns = false
    },
    insClick () {
      this.rowItems.splice(0)
      for (let i = 0; i < this.headers.length; i++) {
        const addData = { name: this.headers[i].value, value: '' }
        this.rowItems.push(addData)
      }
      this.dialog = true
      this.isIns = true
    },
    async insertData () {
      const answer = window.confirm('登録してもいいですか？')
      if (answer) {
        try {
          await this.$axios.$post('/update?id=' + this.inTblId, this.rowItems)
          window.alert('登録処理を実行しました。')
        } catch (e) {
          console.log(e.errorCode) // eslint-disable-line no-console
          window.alert(e)
        }
      }
      this.dialog = false
      this.searchDate()
    },
    async updateData () {
      const answer = window.confirm('更新してもいいですか？')
      if (answer) {
        try {
          await this.$axios.$post('/update?id=' + this.inTblId, this.rowItems)
          window.alert('更新処理を実行しました。')
        } catch (e) {
          console.log(e.errorCode) // eslint-disable-line no-console
          window.alert(e)
        }
      }
      this.dialog = false
      this.searchDate()
    },
    async deleteData () {
      const answer = window.confirm('削除してもいいですか？')
      if (answer) {
        try {
          await this.$axios.$post('/delete?id=' + this.inTblId, this.rowItems)
          window.alert('削除を実行しました。')
        } catch (e) {
          console.log(e.errorCode) // eslint-disable-line no-console
          window.alert(e)
        }
      }
      this.dialog = false
      this.searchDate()
    },
    close () {
      console.log('Dialog closed') // eslint-disable-line no-console
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
  background: #E8F5E9;
  border: 1px #BDBDBD solid;
}
.v-data-table tr:nth-child(odd) td {
  background: #F5F5F5;
}
.v-data-table tr:hover td {
  background-color: #FFFF8D;
}
</style>
