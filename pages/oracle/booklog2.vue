<template>
  <div>
    <!-- ダイアログ：ISBN13入力 -->
    <v-dialog
      v-model="dialog"
      max-width="400"
      persistent
    >
      <v-card>
        <v-row no-gutters justify="center">
          <v-card-title>
            ISBN13入力
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="inIsbn13"
              label="ISBN13："
              maxlength="13"
              class="mx-5"
              clearable
            />
            を登録しますか？
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              class="primary"
              @click="insertData()"
            >
              ＯＫ
            </v-btn>
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
      <v-col cols="2">
        <v-card-title>
          BOOKLOG
        </v-card-title>
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="inPageNo"
          label="PAGE："
          type="number"
          background-color="white"
          clearable
          solo
          dense
          maxlength="2"
        />
      </v-col>
      <v-col cols="3">
        <v-btn
          class="accent"
          @click="searchData()"
        >
          検索
        </v-btn>
        <v-btn
          class="light-blue lighten-2"
          @click="prevPage()"
        >
          PREV
        </v-btn>
        <v-btn
          class="orange darken-4"
          @click="nextPage()"
        >
          NEXT
        </v-btn>
      </v-col>
      <v-col cols="3" />
      <v-col>
        <v-card-actions>
          <v-btn
            class="success"
            @click="dialogOpen()"
          >
            登録
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
    <v-row dense class="toc-view" width="100%" max-height="290">
      <v-col
        v-for="(item, i) in lists"
        :key="i"
        cols="12"
        lg="2"
      >
        <v-card
          color="grey lighten-4"
          max-width="100%"
          height="90%"
        >
          <v-card-actions class="mb-5">
            <a @click="updateData(i)">
              <!-- v-img :src="`https://images-na.ssl-images-amazon.com/images/I/${item.CoverImg}`" max-width="175" / -->
              <!-- v-img :src="`https://cover.openbd.jp//${item.ISBN13}.jpg`" max-width="175" / -->
              <v-img :src="`https://images-fe.ssl-images-amazon.com/images/P/${item.ISBN10}.09.LZZZZZZZ`" max-width="160" />
            </a>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
/* eslint-disable no-console */
export default {
  name: 'BooklogList',
  data () {
    return {
      dialog: false,
      inPageNo: 1,
      inIsbn13: '',
      selRow: 0,
      lists: [],
      imgUrl: ''
    }
  },
  created () {
    this.inPageNo = this.$store.state.pageNo.pageNo
    if (isNaN(this.inPageNo)) {
      console.log('pageNo isNaN') // eslint-disable-line no-console
      this.inPageNo = 1
    }
    if (typeof window !== 'undefined') {
      this.searchData()
    }
  },
  methods: {
    async searchData () {
      try {
        if (this.inPageNo < 1 || isNaN(this.inPageNo)) {
          this.inPageNo = 1
          this.$store.dispatch('pageNo/setPageNo', this.inPageNo)
        }
        const stNo = this.inPageNo * 12 - 11
        const sql = 'select * from booklog order by GetDate desc limit ' + stNo + ', 12'
        const res = await this.$axios.$get('http://localhost:3000/api?sql=' + sql)
        this.lists = res[0]
      } catch (e) {
        console.log(e.errorCode) // eslint-disable-line no-console
        window.alert(e)
      }
    },
    prevPage () {
      if (this.inPageNo === 1) {
        return
      }
      this.inPageNo = this.inPageNo - 1
      this.$store.dispatch('pageNo/setPageNo', this.inPageNo)
      this.searchData()
    },
    nextPage () {
      if (this.lists.length < 12) {
        return
      }
      this.inPageNo = this.inPageNo + 1
      this.$store.dispatch('pageNo/setPageNo', this.inPageNo)
      this.searchData()
    },
    dialogOpen () {
      this.inIsbn13 = ''
      this.dialog = true
    },
    insertData () {
      this.insertBook()
      window.location.href = 'http://localhost:3000/book?id=' + this.inIsbn13
    },
    async insertBook () {
      if (!this.inIsbn13) {
        window.alert('ISBN13が未設定です！' + this.inIsbn13)
        return 400
      }
      this.dialog = false
      try {
        const sql = 'insert into booklog (ISBN13,BookName) values ("' + this.inIsbn13 + '","書名")'
        const res = await this.$axios.$get('/api?sql=' + sql)
        return res
      } catch (e) {
        console.log(e.errorCode) // eslint-disable-line no-console
        window.alert(e)
        return e
      }
    },
    updateData (itemno) {
      // alert((itemno) + '個目の画像のISBN13: ' + this.lists[itemno].ISBN13)
      this.$store.dispatch('pageNo/setPageNo', this.inPageNo)
      this.$router.push('/book?id=' + this.lists[itemno].ISBN13)
    }
  }
}
</script>

<style lang="scss">
.toc-view {
  background-color: #e6f2ff;
  border-radius: 13px;
  padding: 1rem;
  margin-left: 1rem;
  position: sticky;
  top: 1rem;
  max-height: 75vh;
  overflow: scroll;
}
</style>
