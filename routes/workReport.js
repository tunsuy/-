
var xmlDataHandler = require("../public/javascripts/xmlDataHandler.js");
var connectServer = require("../public/javascripts/connectServer.js");

var express = require('express');
var router = express.Router();
var reqServerIP = "";

var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
var modelsAttributesData = xmlDataHandler.getModelsAttributesData();

var dbsecServerInfo = xmlDataHandler.getServerInfo("dbsecAccountInfo");
var dbServerInfo = xmlDataHandler.getServerInfo("dbAccountInfo");

router.get('/', function(req, res, next) {

	// var reqServerIP = req.query.id;
	// if(reqId != undefined && reqServerIP != ""){
		// var cmdData = questionsData[parseInt(reqId)+2].firstChild.data;
    console.log("登录的服务器为："+global.reqServerIP);
    if (global.reqServerIP) {
		res.render('workReport.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: "", content: ""});
	}else{
        res.redirect('/');
    }
	// else{
	// 	res.render('index.ejs', { modelsPropertys: modelsPropertysPropertysData, questions: questionsData, cmd: cmdData, serverIP: "当前没有登录服务器"});
	// }
});

router.post('/', function(req, res, next) {
	reqAccount = req.body['account'];
    global.accountCache = reqAccount;
    reqFormModelFlag = req.body['formModelFlag'];
    
	// var reqServerIP = req.query.id;
	// var modelsPropertysData = xmlDataHandler.getModelsPropertysData();
	// var cmdData = connectServer.connServer(reqServerIP,"get_user_info.py "+reqAccount+"\nexit\n");
    var contentData = "用户的基本信息：\n";
	var contentCmd = "get_user_info "+reqAccount;
    var didStr = "", pidStr = "";

	var Client = require('ssh2').Client;
	var alyConn = new Client();

    if (global.alyFlag == "aly") {
        alyConn.on('ready', function() {
            alyConn.exec(contentCmd, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(err, stream) {
                    
                    alyConn.end();
                    console.log("退出121.42.193.51成功！！！！！！！");

                    alyConn.on('ready', function() {
                        
                        alyConn.exec(contentCmd, function(err, stream) {
                            if (err) throw err;
                            stream.on('close', function(err, stream) {
                                alyConn.end();
                            }).on('data', function(data) {
                                contentData += "\n";
                                contentData += data;
                                res.render('workReport.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                                return;
                            }).stderr.on('data', function(data) {
                                console.log('STDERR: ' + data);
                            });

                        });
                                
                    }).connect({
                        host: dbServerInfo.ip,
                        port: 22,
                        username: dbServerInfo.userName,
                        password: dbServerInfo.passWord
                    });

                }).on('data', function(data) {

                    didStr = (/did=(\d+)/).exec(data);
                    pidStr = (/pid=(\d+)/).exec(data);
                    if (didStr == "" || didStr == null) {
                        contentData += data;
                        res.render('workReport.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    formModelFlag = (reqFormModelFlag == "on")?1:0;
                    
                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    did = didStr[1];
                    console.log("did: "+did);

                    contentData += data;

                    contentCmd = "python workReport.py "+did+" "+formModelFlag;
                    
                }).stderr.on('data', function(data) {
                    console.log('STDERR: ' + data);
                });

            });
        }).connect({
            host: dbsecServerInfo.ip,
            port: 22,
            username: dbsecServerInfo.userName,
            password: dbsecServerInfo.passWord
        });
    }else{
        // conn.on('ready', function() {
        if (global.conn) {
            global.conn.exec(contentCmd, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(err, stream) {
                    if (didStr == "" || didStr == null) {
                        // global.conn.end();
                    }
                    // conn.end();
                }).on('data', function(data) {

                    // for (var index=0; index<modelsPropertysData.length; index++){
                    //  if (modelsPropertysData[index][0].firstChild.data == "消息") {
                    //      allSingleMsgNum = modelsPropertysData[index][1].firstChild.data;
                    //      sendSingleMsgNum = modelsPropertysData[index][2].firstChild.data;
                    //      receiveSingleMsgNum = modelsPropertysData[index][3].firstChild.data;
                    //      sendGroupMsgNum = modelsPropertysData[index][4].firstChild.data;
                    //      // receiveGroupMsgNum = modelsPropertysData[index][5].firstChild.data;
                    //      break;
                    //  };
                    // }

                    didStr = (/did=(\d+)/).exec(data);
                    pidStr = (/pid=(\d+)/).exec(data);
                    if (didStr == "" || didStr == null) {
                        contentData += data;
                        res.render('workReport.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});               
                        return;
                    }

                    formModelFlag = (reqFormModelFlag == "on")?1:0;
                    
                    pid = pidStr[1];
                    console.log("pid: "+pid);
                    did = didStr[1];
                    console.log("did: "+did);

                    contentData += data;

                    contentCmd = "python workReport.py "+did+" "+formModelFlag;
                    global.conn.exec(contentCmd, function(err, stream) {
                        if (err) throw err;
                        stream.on('close', function(err, stream) {
                            // global.conn.end();
                        }).on('data', function(data) {
                            contentData += "\n";
                            contentData += data;
                            res.render('workReport.ejs', { modelsAttributes: modelsAttributesData, modelsPropertys: modelsPropertysData, serverIP: global.reqServerIP, account: reqAccount, content: contentData});
                        }).stderr.on('data', function(data) {
                            console.log('STDERR: ' + data);
                        });

                    });
                    
                }).stderr.on('data', function(data) {
                    console.log('STDERR: ' + data);
                });

            });
        }else{
            res.redirect('/');
        }
        // }).connect({
        //     host: global.reqServerIP,
        //     port: 22,
        //     username: global.reqUserName,
        //     password: global.reqPwd
        // });
    }
    
});



module.exports = router;
