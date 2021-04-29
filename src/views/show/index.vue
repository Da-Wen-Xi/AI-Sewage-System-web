<template>
  <el-container style="border: 1px solid #eee">
    <el-container>
      <el-aside width="250px" style="padding: 0px">
        <vAside></vAside>
      </el-aside>
      <el-main style="padding: 0px">
<!--        <vIframe></vIframe>-->
        <iframe id="iframe" ref="iframe" src="index_2.html" scrolling="no" style="width: 100%;height: 1000px;"
                frameborder="0"/>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
  import vAside from '../common/aside'
  // import vIframe from '../iframe/iframe'

  export default {
    data() {
      window.equipmentposarray = this.getEquipmentPosArray()
      return {
        siteForm: {},
        table: [],
        equipposarray: window.equipmentposarray
      }
    },
    name: 'vMain',
    components: {
      vAside,
      // vIframe
    },
    created() {
      this.siteGet()
      console.log('获取站点信息')
    },
    watch: {
      refreshPage: function() {
        console.log('跳转index')
        this.siteGet()
        console.log('获取站点信息')
        this.$router.replace({
          path: '/index_skip',
          name: 'index_skip'
        })
        const mapFrame = this.$refs['iframe']
        let data = "abc"
        const iframeWin = mapFrame.contentWindow
        console.log('传递数据abc')
        iframeWin.postMessage(data, '*')
        const obj1 = window.frames['iframe']// 获得对应iframe的window对象
        obj1.wpsData = '设置的数据'
        window.siteInfo = this.table
      }
    },
    computed: {
      refreshPage() {
        return this.$store.state.Treedata.chooseData
      }
    },
    methods: {
      async handler() {
        let TMap = window.T
        // 如果vuex里面存有树节点数据则不需要重新计算节点坐标
        // 这样可以保证每次进入程序后只进行一次节点的计算
        if (this.$store.state.Treedata.treedata.length === 1 && this.$store.state.Treedata.treedata[0].label === '暂无数据') {
          let treeData = await this.getTreeData(this.equipposarray, TMap)
          this.getPermissionSiteTreeByCity(treeData, window.equipmentposarray)
        }

        // 在切换界面时返回记录坐标数据
        let posarray = window.equipmentposarray
        let index = this.$store.state.Treedata.chooseData
        let markArray = []
        //处理地图上的标记点
        console.log('取得的设备列表')
        console.log(posarray)
        for (let k = 0; k < posarray.length; k++) {
          let longitude = posarray[k]['pos']['longitude']
          let latitude = posarray[k]['pos']['latitude']
          let markObj = {
            'latitude': longitude,
            'longitude': latitude,
            'address': ''
          }
          markArray.push(markObj)
        }
        window.markArray = markArray

        for (let j = 0; j < posarray.length; j++) {
          posarray[j]['showflag'] = false
        }
        posarray[index]['showflag'] = true

        this.postMarkAr()
      },
      // 解析全局设备信息中的位置数据
      getEquipmentPosArray() {
        const equipmentobjarray = window.equipmentobjarray
        console.log('length')
        console.log(equipmentobjarray.length)
        let equipmentposarray = []
        for (let i = 0; i < equipmentobjarray.length; i++) {
          let boxUid = equipmentobjarray[i]['boxUid']
          let name = equipmentobjarray[i]['alias']
          let address = equipmentobjarray[i]['box']['address']
          let longitude = equipmentobjarray[i]['box']['longitude'] === 0.0 ? equipmentobjarray[i]['box']['useLongitude'] : equipmentobjarray[i]['box']['longitude']
          let latitude = equipmentobjarray[i]['box']['latitude'] === 0.0 ? equipmentobjarray[i]['box']['useLatitude'] : equipmentobjarray[i]['box']['latitude']
          let net = equipmentobjarray[i]['box']['net']
          let connectionState = equipmentobjarray[i]['box']['connectionState']
          let posobj = {
            'boxUid': boxUid,
            'name': name,
            'address': address,
            'net': net,
            'showflag': false,
            'connectionState': connectionState,
            'pos': {
              'longitude': longitude,
              'latitude': latitude
            }
          }
          equipmentposarray.push(posobj)
        }
        return equipmentposarray
      },

      async getTreeData(posarray, TMap) {
        let treedataarray = []
        for (let i = 0; i < posarray.length; i++) {
          let boxUid = posarray[i]['boxUid']
          let name = posarray[i]['name']
          let net = posarray[i]['net']
          let longitude = posarray[i]['pos']['longitude']
          let latitude = posarray[i]['pos']['latitude']
          let connect = posarray[i]['connectionState']
          let matchaddr = await this.callbackAddrArray(longitude, latitude, TMap)
          console.log('province: ' + matchaddr[0] + 'city: ' + matchaddr[1])
          treedataarray = this.insertMatchAddr(treedataarray, matchaddr, name, net, connect, boxUid)
        }
        // 将站点排序, 连接正常的站点优先排序
        treedataarray = this.sortTree(treedataarray)
        return treedataarray
      },

      insertMatchAddr(treedataarray, matchaddr, name, net, connect, boxUid) {
        let province = matchaddr[0]
        let city = matchaddr[1]
        // 标记是否已经在循环时执行过插入
        let provinceflag = false
        let provinceindex = -1
        let cityflag = false
        let netclass = this.getNetIconClass(net)
        let connectClass = this.getConnectClass(connect)
        // 遍历查找是否存在相同的省
        for (let i = 0; i < treedataarray.length; i++) {
          if (treedataarray[i]['label'] === province) {
            provinceflag = true // 存在同省
            for (let j = 0; j < treedataarray[i]['children'].length; j++) {
              if (treedataarray[i]['children'][j]['label'] === city) {
                treedataarray[i]['children'][j]['children'].push({
                  label: name,
                  netClass: netclass,
                  connectClass: connectClass,
                  boxUid: boxUid
                })
                cityflag = true // 存在同市
              }
            }
            provinceindex = i // 记录同省在地址数据中的下标,创建新市的时候做指向
          }
        }
        // 表示新的省市
        if (!provinceflag && !cityflag) {
          treedataarray.push({
            label: province,
            children: [{
              label: city,
              children: [{ label: name, netClass: netclass, connectClass: connectClass, boxUid: boxUid }]
            }]
          })
        }
        // 表示已经存在省但不存在市
        if (provinceflag && !cityflag) {
          treedataarray[provinceindex]['children'].push({
            label: city,
            children: [{ label: name, netClass: netclass, connectClass: connectClass, boxUid: boxUid }]
          })
        }
        return treedataarray
      },

      async callbackAddrArray(longitude, latitude, TMap) {
        let array = await this.getAddress(longitude, latitude, TMap)
        return array
      },
      getAddress(longitude, latitude, TMap) {
        TMap = window.T
        console.log('天地图解析')
        let geocoder = new TMap.Geocoder()
        let point = new TMap.LngLat(longitude, latitude)
        console.log('longitude: ' + longitude + ' latitude: ' + latitude)
        return new Promise((resolve) => {
          geocoder.getLocation(point, (rs) => {
            //let addcomp = rs.getLocationPoint()
            let addcomp = rs.getAddressComponent()
            console.log('地址详尽信息')
            console.log(addcomp)
            let addr = []
            if (longitude === 0 && latitude === 0) {
              addr[0] = '未标记地区'
              addr[1] = '未标记城市'
            } else {
              addr[0] = addcomp.province
              addr[1] = addcomp.city
            }
            resolve(addr)
          })
        })
      },
      getNetIconClass(id) {
        let classname = ''
        switch (id) {
          case 0:
            classname = 'iconfont icon-Network-Error'
            break
          case 1:
            classname = 'iconfont icon-internet'
            break
          case 2:
            classname = 'iconfont icon-G-Network'
            break
          case 4:
            classname = 'iconfont icon-Wifi-'
            break
          case 5:
            classname = 'iconfont icon-G-Network1'
            break
          default:
            classname = 'iconfont icon-Network-Error'
        }
        return classname
      },
      // 连接图标类
      getConnectClass(connect) {
        let classname = ''
        if (connect === 1) {
          classname = 'el-icon-success'
        } else {
          classname = 'el-icon-warning-outline'
        }
        return classname
      },
      sortTree(tree) {
        for (let i = 0; i < tree.length; i++) {
          for (let j = 0; j < tree[i].children.length; j++) {
            let siteList = tree[i].children[j].children
            siteList.sort((a, b) => {
              if (a.connectClass === 'el-icon-success' && b.connectClass === 'el-icon-warning-outline') {
                return -1
              } else {
                return 1
              }
            })
          }
        }
        return tree
      },
      /**
       * @desc 做城市节点筛选
       */
      getPermissionSiteTreeByCity(originTree, equipArray) {
        let cityArray = this.$store.state.ShiroToken.area.split(';')
        cityArray.pop()
        console.log(originTree)
        console.log(cityArray)
        let ansTree = []
        for (let i = 0; i < originTree.length; i++) {
          for (let j = 0; j < originTree[i]['children'].length; j++) {
            for (let k = 0; k < originTree[i]['children'][j]['children'].length; k++) {
              if (this.checkCityInArray(originTree[i]['children'][j]['children'][k].label, cityArray)) {
                ansTree = this.insertCity(originTree[i]['label'], originTree[i]['children'][j]['label'],
                  originTree[i]['children'][j]['children'][k], ansTree)
              }
            }
          }
        }
        console.log(ansTree)
        // 更新树
        this.$store.dispatch('setTreedata', ansTree)
        // 更新选项节点
        let chooseIndex = 0
        for (let i = 0; i < equipArray.length; i++) {
          if (equipArray[i].name === ansTree[0]['children'][0]['children'][0].label) {
            chooseIndex = i
          }
        }
        this.$store.dispatch('setChooseData', chooseIndex)
      },
      checkCityInArray(city, cityArray) {
        if (cityArray[0] === 'all') {
          return true
        } else {
          for (let i = 0; i < cityArray.length; i++) {
            if (city === cityArray[i]) {
              return true
            }
          }
          return false
        }
      },
      /**
       * @desc 做权限城市的插值 细化到每个站点
       */
      insertCity(province, city, siteInfo, ansTree) {
        // 检查省份是否存在
        let provinceIndex = -1
        let cityIndex = -1
        for (let i = 0; i < ansTree.length; i++) {
          if (province === ansTree[i]['label']) {
            provinceIndex = i
          }
        }
        if (provinceIndex === -1) {
          // 因为是第一次插入 直接插入整条地图路径
          ansTree.push({ label: province, children: [{ label: city, children: [siteInfo] }] })
        } else {
          // 存在已有省份的情况下
          // 检查所在城市是否存在
          for (let i = 0; i < ansTree[provinceIndex]['children'].length; i++) {
            if (city === ansTree[provinceIndex]['children'][i].label) {
              cityIndex = i
            }
          }
          if (cityIndex === -1) {
            // 如果该城市不存在
            ansTree[provinceIndex]['children'].push({ label: city, children: [siteInfo] })
          } else {
            ansTree[provinceIndex]['children'][cityIndex]['children'].push(siteInfo)
          }
        }
        return ansTree
      },

      postMarkAr() {
        let markArray = window.markArray
        console.log('markArray数组')
        console.log(markArray)
        const mapFrame = this.$refs['iframe']
        let data = {}
        data.markArray = markArray
        data.siteInfo = this.table
        if (mapFrame.attachEvent) { // 兼容浏览器判断
          mapFrame.attachEvent('onload', function() {
            const iframeWin = mapFrame.contentWindow
            console.log('传递数据1')
            iframeWin.postMessage(data, '*')
            // data传递的参数   *写成子页面的域名或者是ip
          })
        } else {
          // todo 有缓存的时候加载不了传递数据
          if (markArray.length > 0) {
            const iframeWin = mapFrame.contentWindow
            console.log('传递数据2')
            iframeWin.postMessage(data, '*')
          } else {
            const iframeWin = mapFrame.contentWindow
            console.log('传递数据3')
            iframeWin.postMessage(data, '*')
          }
        }
      },
      /**
       * @desc 获取站点信息
       *
       * */
      siteGet() {
        let index = this.$store.state.Treedata.chooseData
        let boxUid = window.equipmentobjarray[index].boxUid
        console.log(boxUid)
        console.log(this.$store.state.ShiroToken.toke)
        // 2020.06.20 通过远程获取修改信息
        // let site = siteDetail.find(s => s.id === Number(boxUid))
        this.$http.post('http://182.254.148.104:8082/equip/getSiteDetail', {
          siteID: boxUid
        }, {
          headers: {
            'Authorization': this.$store.state.ShiroToken.token
          }
        }).then(res => {
          this.siteForm = res.data
          this.table = this.tableGet(this.siteForm)
          console.log('解析的表单结果', this.table)
        })
      },
      tableGet(site) {
        let ans = []
        ans.push({ name1: '站点名称', value1: site.name, name2: '设备处理量', value2: site.efficiency })
        ans.push({ name1: '站点地址', value1: site.address, name2: '处理工艺', value2: site.process })
        ans.push({ name1: '安装时间', value1: site.date, name2: '出水标准', value2: site.standard })
        ans.push({ name1: '站点经度', value1: site.longitude, name2: '运维人员', value2: site.operator })
        ans.push({ name1: '站点纬度', value1: site.latitude, name2: '联系电话', value2: site.phone })
        ans.push({ name1: '站点类型', value1: site.type, name2: '站点编号', value2: site.id })
        ans.push({ name1: '风机参数', value1: site.fan, name2: '回流泵参数', value2: site.reflux })
        ans.push({ name1: '提升泵参数', value1: site.boost, name2: '罐体参数', value2: site.can })
        return ans
      }
    },
    mounted() {
      this.handler()
    }
  }
</script>

