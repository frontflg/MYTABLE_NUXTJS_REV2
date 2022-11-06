<template>
  <div class="wrap">
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
      ref="itables"
      height="500"
      :headers="headers"
      fixed-header
      :items="lists"
      :search="search"
      item-key="line"
      :items-per-page="10"
      :footer-props="{
        'items-per-page-options':[5, 10, 25, -1],
        'items-per-page-text':'表示件数'
      }"
      dense
      @click:row="rowClick"
    />
  </div>
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
  async fetch () {
    let sql = 'SELECT CASE WHEN C.COLUMN_COMMENT = null OR C.COLUMN_COMMENT = "" '
    sql += ' THEN C.COLUMN_NAME ELSE C.COLUMN_COMMENT END AS text,C.COLUMN_NAME AS value,'
    sql += ' C.CHARACTER_MAXIMUM_LENGTH * 7 AS width,C.DATA_TYPE as datatype,'
    sql += ' C.CHARACTER_MAXIMUM_LENGTH as dataleng,C.IS_NULLABLE as nullabl'
    sql += ' FROM information_schema.COLUMNS C'
    sql += ' WHERE C.TABLE_NAME ="' + this.inTblId + '" ORDER BY C.ORDINAL_POSITION'
    this.headers = await fetch('http://localhost:3000/api?sql=' + sql).then(res => res.json())
    for (const item in this.headers) {
      if (this.headers[item].datatype === 'date') {
        this.headers[item].width = 120
      }
      if (this.headers[item].width < 80) {
        this.headers[item].width = 80
      }
      if (this.headers[item].width > 500) {
        this.headers[item].width = 500
      }
    }
  },
  created () {
    if (typeof window !== 'undefined') {
      this.searchData()
    }
  },
  methods: {
    async searchData () {
      try {
        const sql = 'SELECT * FROM ' + this.inTblId
        const res = await this.$axios.$get('/api?sql=' + sql)
        this.lists = res
        for (const item in this.lists) {
          for (const subItem in this.lists[item]) {
            try {
              const str = this.lists[item][subItem]
              if (str !== null && str.indexOf('T15:00:00.000Z') > 0) {
                const dt = new Date(Date.parse(str))
                this.lists[item][subItem] = this.$dayjs(dt).locale('ja').format('YYYY-MM-DD')
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
    inputCheck () {
      for (let i = 0; i < this.headers.length; i++) {
        const str = this.rowItems[i].value
        const type = this.headers[i].datatype
        if (str) {
          if (type === 'varchar') {
            if (str.length > this.headers[i].dataleng) {
              window.alert(this.rowItems[i].name + 'は、[' + this.headers[i].dataleng + ']文字以内で入力してください。')
              return false
            }
          } else if (['int', 'tinyint'].includes(type)) {
            if (isNaN(str)) {
              window.alert(this.rowItems[i].name + 'が数値ではありません。')
              return false
            }
            // 例えば以下
            // if (str.length > this.headers[i].coltype.replace(/[^0-9]/g,'')) {
            //   window.alert(this.rowItems[i].name + 'が桁数オーバーしています。')
            //   return false
            // }
          } else if (type === 'date') {
            if (!str.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
              window.alert(this.rowItems[i].name + 'が日付形式[yyyy-mm-dd]ではありません。')
              return false
            }
          } else {
            // 以下のアラームが出たらチェックを検討する
            window.alert(i + ' ' + type + 'は、チェック未実装')
          }
        } else if (this.headers[i].nullabl === 'NO') {
          window.alert(this.rowItems[i].name + 'は必須入力項目です。')
          return false
        }
      }
      return true
    },
    async insertData () {
      if (!this.inputCheck()) {
        return
      }
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
      this.searchData()
    },
    async updateData () {
      if (!this.inputCheck()) {
        return
      }
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
      this.searchData()
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
      this.searchData()
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
.wrap {
  animation: fadein 3s forwards;
}
@keyframes fadein {
  0% {opacity: 0}
  100% {opacity: 1}
}
body {
  margin: 0;
}
</style>
