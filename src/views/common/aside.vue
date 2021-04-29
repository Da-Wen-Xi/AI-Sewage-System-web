<template>
  <div class="aside">
    <el-tree :data="equiptreedata" :props="defaultProps" @node-click="handleNodeClick"
             :default-expand-all="true" :indent="0" class="tree">
      <span class="custom-tree-node" slot-scope="{node, data}">
        <span class="node">
          <i :class="data.connectClass"/>
          {{node.label}}
        </span>
        <i :class="data.netClass"/>
      </span>
    </el-tree>
  </div>
</template>

<script>
  export default {
    name: 'vAside',
    data () {
      return {
        // 处理地图树形数据,分割出省市信息-迁移到地图初始化后返回对象初始化
        // equiptreedata: ,
        defaultProps: {
          children: 'children',
          label: 'label'
        }
      }
    },
    methods: {
      // 树形节点点击事件
      handleNodeClick (data) {
        console.log(data)
        if (data['children'] === undefined) {
          let posarray = window.equipmentposarray
          console.log('跳转')
          for (let i = 0; i < posarray.length; i++) {
            if (posarray[i].name === data['label']) {
              console.log('setChooseData',i)
              this.$store.dispatch('setChooseData', i)
              console.log('data: ' + this.$store.state.Treedata.chooseData)
              let longitude = posarray[i]['pos']['longitude']
              let latitude = posarray[i]['pos']['latitude']
            //  let point = new window.BMap.Point(longitude, latitude)
              // 重新定位地图位置
            //  window.map.panTo(point)
              // 关闭以前打开的地图窗口并开启新的地图窗口
              // for (let j = 0; j < posarray.length; j++) {
              //   posarray[j]['showflag'] = false
              // }
            //  posarray[i]['showflag'] = true
            }
          }
        }
      }
    },
    computed: {
      // 处理地图树形数据,分割出省市信息-迁移到地图初始化后返回对象初始化
      equiptreedata () {
        console.log(this.$store.state.Treedata.treedata)
        return this.$store.state.Treedata.treedata
      }
    }
  }
</script>

<style>
  @import "../../css/iconfont.css";
  .aside {
    padding-left: 0px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 20px;
  }
  .tree{
    background-image:url('../../../public/img/bg.jpg');
  }
  .node{
    color: #0efcff;
  }
</style>
