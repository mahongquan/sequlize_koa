var vsprintf = require("sprintf-js").vsprintf
// var a=sprintf("%2$s %3$s a %1$s", "cracker", "Polly", "wants")
// console.log(a);
// var a=vsprintf("The first 4 letters of the english alphabet are: %s, %s, %s and %s", ["a", "b", "c", "d"])
// console.log(a);
function myStdev(a){
    var t=0;
    for(var i in a){
       t+=a[i]
    }
    var av=t/a.length;
    var t1=0;
    for( var i in a){
        t1+=(a[i]-av)*(a[i]-av);
    }
    var sq=Math.sqrt(t1/(a.length-1));
    return sq
}
function getRound(stdconc){//几位小数
    var a;
    if(typeof stdconc === "string"){
        a=stdconc;
    }
    else{
        a=""+stdconc;
    }
    at=a.indexOf(".");
    return a.length-1-at;
}
function geteleRsd(ele,stdconc){
    var stdconc=parseFloat(stdconc)
    var ele=""+ele;
    if(ele=="C"){
        if(stdconc>1){
            return 0.005
        }
        else{
            return 0.01
        }
    }
    if(ele=="S") return 0.02;
    if(ele=="O"){
        if(stdconc>0.01)
            return 0.01
        else//0.0018
            return 0.03
    }
    if(ele=="H")
        return 0.02;
    else
        return 0.01;
}
function myround(data,roundws){
    var bl=Math.pow(10,roundws);
    var data1=data*bl;
    data1=Math.round(data1);
    data1=data1/bl;
    return data1;
}
function genOneR(ele,stdconc){
    var roundws=getRound(stdconc)
    var rsd=geteleRsd(ele,stdconc)//0.005
    //console.log("rsd="+rsd);
    var stdconc=parseFloat(stdconc)
    var sd=stdconc*rsd
    //console.log("sd="+sd);
    var ok=false
    var num=0
    while(!ok){
        var data=stdconc-2*sd+Math.random()*4*sd;
        //console.log(data);
        test=myround(data,roundws);
        err=(test-stdconc)/stdconc;
        //print(test,sd,rsd,err)
        if(Math.abs(err)<0.00001)
            ok=false
        else
            ok=true
        num+=1;
        if(num==5){
            console.log(">4 times break");
            break;
        }
    }
    fmt="%0."+roundws+"f"
    test_str=vsprintf(fmt, [test])
    //test_str=fmt % test
    err_str=vsprintf("%0.2f" ,[err*100])
    return [test_str,err_str]
}
// def genOne(ele,stdconc):
//     print(stdconc)
//     roundws=getRound(stdconc)
//     rsd=geteleRsd(ele,stdconc)#0.005
//     stdconc=float(stdconc)
//     sd=stdconc*rsd
//     ok=False
//     loop=0
//     while not ok:
//         test=round(stdconc-2*sd+random.random()*4*sd,roundws)
//         err=test-stdconc
//         print(test,stdconc,sd)
//         if abs(err)<0.0000001:
//             ok=False
//         else:
//             ok=True
//         loop+=1
//         if loop==10:
//             break
//     fmt="%0."+str(roundws)+"f"
//     print(fmt)
//     test_str=fmt % test
//     err_str=fmt % err
//     return (test_str,err_str)
// def genjmd(stdconc,rsd):
//     roundws=getRound(stdconc)
//     stdconc=float(stdconc)
//     sd=stdconc*rsd
//     rs=[]
//     rv=[]
//     fmt="%0."+str(roundws)+"f"
//     for i in range(7):
//         test=round(stdconc-2*sd+random.random()*4*sd,roundws)
//         test_str=fmt % test
//         rs.append(test_str)
//         rv.append(float(test_str))
//     print(rv)
//     ave=numpy.average(rv)
//     sd=myStdev(rv)
//     ave_str=fmt % ave
//     rsd1=sd/ave*100
//     rsd_str="%0.2f" % rsd1
//     return (rs,ave_str,rsd_str)
// def genTest(eles,stds):
//     tests=[]
//     errs=[]
//     for i in range(len(stds)):
//         (test,err)=genOne(eles[i],stds[i])
//         tests.append(test)
//         errs.append(err)
//     return (tests,errs)
// def genTestR(eles,stds):
//     tests=[]
//     errs=[]
//     for i in range(len(stds)):
//         (test,err)=genOneR(eles[i],stds[i])
//         tests.append(test)
//         errs.append(err)
//     return (tests,errs)
console.log(myStdev([1,2]))
console.log(getRound("312.455"))
console.log(geteleRsd("C",3.36))
console.log(genOneR("C",3.36))