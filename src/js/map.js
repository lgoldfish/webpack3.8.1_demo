import config from "./config"
import {Control,AddLight,zoomLimit}  from "./mapView"
let currentFloorId , floorsData , mapView , camera , dynamicNaviManager ,naviMng
let dataSource = new NGR.data.DataSource({
    appKey:config.appKey,
    server:"https://api.ipalmap.com"
})
dataSource.requestMaps().then((maps)=>{
    dataSource.requestPOIChildren(maps.list[0].poi)
    .then((floors)=>{
       const floorId = floors[1].id
       floorsData = floors
       currentFloorId = floorId
       dataSource.requestPlanarGraph(floorId)
       .then((layerInfo)=>{
           console.log('layerxxxx ')
            NGR.fetch("/static/json/template.json", {})
            .then((res)=>{
                return res.json()
            })
            .then((style)=>{
                let engine = new NGR.engine.ThreeEngine()
                mapView = new NGR.view.MapView("map",{
                    initSkewAngle:0
                })
                let styleGenerator = new NGR.style.JSONStyleGenerator(style)
                mapView.styleGenerator = styleGenerator;
                camera = new NGR.camera.ThreeCamera(45,window.innerWidth / window.innerHeight,1,80000)
                naviMng = new NGR.navi.NavigateManager(dataSource)
                dynamicNaviManager = new NGR.navi.DynamicNavigation(mapView, naviMng,{needAudio: false,autoplay:false,endThreshold:false}, {autoMove: false})
                camera.camera.position.set(0,0,100);
                mapView.activeCamera = camera;   
                engine.initMapView(mapView,{
                    clearImage:"/static/image/bg/bg_point.png"
                })
                mapView.drawPlanarGraphExt(layerInfo, {gradually: true}, function() {
                    console.log("地图加载完成")
                  });
                mapView.start()
                new AddLight(mapView,styleGenerator).addLight()
                zoomLimit(mapView)
                new Control(mapView).compassControl()
            })
            .catch((e)=>{
                console.error(e,e.stach)
            })
       })
       .catch((e)=>{
           return console.error(e,e.stack)
       })

    })
})
.catch((e)=>{
    return console.error(e,e.stack)
})
