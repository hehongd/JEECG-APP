

    /*scanHelper.js*/  
    /** 
     扫描 
     **/ 
     import permision from "./permission.js"
     import tip from './tip.js'  
       
     export default {  
         main:null,  
         receiver:null,  
         fiter:null,  
         _codeQueryTag:false,  
         isStartScan:fase,  
         initDefaultScan(evt)  
         {  
             this.initScan('android.intent.ACTION_DECODE_DATA','barcode_string',evt)  
         },  
         initScan(acation,stringExtra,evt) {  
             let _this =this;  
             /*#ifdef APP-PLUS*/  
             this.main = plus.android.runtimeMainActivity();//获取activity  
             /*var context = plus.android.importClass('android.content.Context');*/  
             var IntentFilter = plus.android.importClass('android.content.IntentFilter');  
             /* var Intent = plus.android.importClass('android.content.Intent')*/  
             this.filter = new IntentFilter();  
             this.filter.addAction(action);  
             this.receiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver',{  
                 onReceive : function(context,intent) {  
                     plus.android.importClass(intent);  
                     /*这个se4500很坑，不同的手机火pda,这个值就不一样，要具体去查硬件api*/  
                     let code = intent.getStringExtra(stringExtra);  
                     /*调用本页面某方法*/  
                     _this.queryCode(code);  
                     if(evt)  
                     {  
                         evt(code)  
                     }  
                 }});  
                 /*#endif*/  
         },  
         startScan() {  
             /*#ifdef APP-PLUS*/  
             if(!isStartScan)  
                this.main.registerReceiver(this.receiver,this.filter);  
            isStartScan=true  
            /*#endif*/  
         },  
         stopScan() {  
             /*#ifdef APP-PLUS*/  
             this.main.unregisterReceiver(this.receiver);  
             isStartScan = false  
             /*#endif*/  
         },  
         queryCode:function(code) {  
             //防重复  
             if(_codeQueryTag) return false;  
             _codeQueryTag = true;  
             setTimeout(function(code){  
                 _codeQueryTag = false;  
             },150);  
             //到这里扫描成功了，可以调用自己的业务逻辑，code就是扫描的结果  
         },  
         scanByCamera(evt) {  
             //#ifdef APP-PLUS  
             //let status = this.checkPermission();  
             let operate = permision.isIOS ? permision.requestIOS('camera') :   
             permision.requestAndroid('android.permission.CAMERA');  
             operate.then(status =>  
             {  
                console.log(status)  
                if(status === null || status ==1) {  
                    status = 1;  
                }else {  
                    uni.showModal({  
                        content:"需要相机权限",  
                        confirmText:"设置",  
                        success:function(res){  
                            if(res.confirm) {  
                                permision.gotoAppSetting();  
                            }  
                        }  
                    })  
                }  
                if(status !== 1){  
                    return;  
                }  
                uni.scanCode({  
                    success:(res) => {  
                        if(evt)  
                        evt(res.result)  
                    },  
                    fail:(err) => {  
                        //需要注意的是小程序扫码不需要申请相机权限  
                    }  
                });  
             })  
             //#endif  
               
             //#ifdef H5  
             uni.showToast({  
                title:"暂不支持摄像头扫描"  
             })  
             //#endif  
         },  
         //#ifdef APP-APP-PLUS  
         checkPermission(code) {  
             let status = permision.isIOS ? permision.requestIOS('camera'):  
             permision.requestAndroid('andriod.perission.CAMERA');  
               
             if(status === null || status ===1) {  
                 status =1;  
             }else {  
                 uni.showModal({  
                    content:"需要相机权限",  
                    confirmText:"设置",  
                    success: function(res) {  
                        if(res.confirm) {  
                            permision.gotoAppSetting();  
                        }  
                    }  
                 })  
             }  
             return status;  
         },  
         //#endif  
         GetCodeFromScanText(strCode,strKey) {  
             if(!strCode)  
             {  
                 return strCode  
             }  
             strCode = strCode.trim()  
             let temp = strCode.split('|');
             if(!strCode.startsWith('{') && (temp.length == 7 || temp.length == 6)){
                 tip.alert('请重新打印标签')
                 return null
             }
             if(strCode.startsWith('{'))  
             {  
                 try{  
                     let scanData = this.GetModelFromScanText(strCode);  
                     if(scanData)  
                     {  
                         return scanData[strKey]  
                     }  
                     else  
                     {  
                         return ''  
                     }  
                 }catch(e){  
                     return ''  
                 }  
             }  
             return strCode  
         },  
         GetModelFromScanText(strCode){  
             if(!strCode)  
             {  
                return null  
             }  
             strCode = strCode.trim()
             let temp = strCode.split('|');
             if(!strCode.startsWith('{') && (temp.length == 7 || temp.length == 6)){
                 tip.alert('请重新打印标签')
                 return null
             }  
             if(strCode.startsWith('{'))  
             {  
                 let scanData = null  
                 try{  
                     scanData = JSON.parse(strCode)  
                     if(scanData.MCode)  
                     {  
                        if(!scanData.PVDate){
                            scanData.PVDate = ""
                        }
                        if(scanData.SCode && scanData.SCode.length == 8 && 
                            scanData.SCode.charAt(0)>=0 && scanData.SCode.charAt(0)<=9){
                                scanData.SCode = '00' + scanData.SCode
                            }
                         return scanData  
                     }  
                     else  
                     {  
                         return null  
                     }  
                 }catch(e){  
                     return null  
                 }  
             }  
             return null  
         },  
         GetCargoScanTestData(mCode)  
         {  
             return {  
                 MCode:mCode,//物料编码  
                 MDes:mCode,//物料描述  
                 SCode:'111111',//供应商编码  
                 SLot:'232323',//供应商批次  
                 Serial_NO:Math.random().toString(),//序列号  
                 PDate:'2021-12-12',//生产日期  
                 PVDate:'2021-12-12',//有效日期  
                 Qty:1, //数量  
                 SC:'30摄氏度以下存储',//存储条件  
                 DCode:'SHD-202010-0001' //送货单号  
             }  
         }  
     }  