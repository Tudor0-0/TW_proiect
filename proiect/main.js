var b=[["WR","WN","WB","WQ","WK","WB","WN","WR"],["WP","WP","WP","WP","WP","WP","WP","WP"],
["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],
["","","","","","","",""],["BP","BP","BP","BP","BP","BP","BP","BP"],
["BR","BN","BB","BQ","BK","BB","BN","BR"]];
var pts=["WP","WR","WN","WB","WQ","WK","BP","BR","BN","BB","BQ","BK"];
var cols=["a","b","c","d","e","f","g","h"]; var C=["A","B","C","D","E","F","G","H"]
let cur=null, t="W", sqs=[], eng=null, mvs=[], lms=[]

function init() {
  let st = document.getElementById("moveStatus");
  if (!st) {
    st = document.createElement("div");
    st.id = "moveStatus";
    st.title = "Click to resume";
    st.style.cursor = "pointer";
    st.onclick = function() {
      if (t !== "STOP") getL()
    };
    document.body.insertBefore(st, document.getElementById("chessBoard"))
  }

  fetch("https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js").then(r => r.text()).then(txt => {
    var bl = new Blob([txt], { type: 'application/javascript' });
    eng = new Worker(URL.createObjectURL(bl));

    eng.onmessage = function(e) {
      var raw = (typeof e === "string") ? e : e.data;
      var lines = raw.split("\n");

      lines.forEach(d => {
        if (d === "uciok") eng.postMessage("isready");
        else if (d === "readyok") {
          st.innerText = "White";
          getL()
        } else if (d.startsWith("bestmove")) {
          if (d.includes("(none)") || d.includes("bestmove (none)")) {
            gov("Game Over");
            return;
          }
          var bm = d.split(" ")[1];
          if (bm && t === "B") runAi(bm)
        }
        

        if (d.includes(": 1")) {
          var m = d.match(/([a-h][1-8][a-h][1-8][qrbn]?):/);
          if (m && !lms.includes(m[1])) lms.push(m[1])
        }

        if (d.startsWith("Nodes searched")) {
          if (lms.length === 0) {
            if (t === "B") gov("You Won");
            else gov("Engine Won");
            return;
          }
          if (t === "B") {
            eng.postMessage("position startpos moves " + mvs.join(" "));
            eng.postMessage("go depth 10"); 
          }
        }
      });
    };

    eng.postMessage("uci");
    setTimeout(() => {
      eng.postMessage("ucinewgame");
      eng.postMessage("position startpos");
      eng.postMessage("isready")
    }, 500)
  })
}

function getL(){ 
  lms=[]; 
  eng.postMessage("position startpos moves "+mvs.join(" ")); 
  eng.postMessage("go perft 1");
}

function rec(s){
  mvs.push(s); var st=document.getElementById("moveStatus");
  if(t==="B") st.innerText="Thinking..."; 
  else st.innerText="White";
  getL(); 
}

 function gov(w){
   if(t==="STOP") return;
   var bd=document.getElementById("chessBoard");
   var ov=document.createElement("div"); ov.id="gmOv";
   ov.innerText=w+" !!!"; 
   var clr = (w==="You Won") ? "#4CAF50" : "#d32f2f";
   ov.style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3em;color:white;font-weight:bold;background:rgba(0,0,0,0.85);padding:30px 50px;z-index:1000;border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.5);font-family:'Helvetica Neue',Arial,sans-serif;text-align:center;border:3px solid "+clr+";text-transform:uppercase;letter-spacing:2px;pointer-events:none;";
   bd.appendChild(ov); t="STOP"
 }

function runAi(s){
  if(!s || s.length < 4) return;
  var c1=cols.indexOf(s[0]), r1=parseInt(s[1])-1, c2=cols.indexOf(s[2]), r2=parseInt(s[3])-1;
  mv(r1,c1,r2,c2,s)
}

function clk(r,c){
 if(t==="B"||t==="STOP")return; var p=b[r][c];
 if(!cur){ if(!p||p[0]!==t)return; sel(r,c); return }
 var str=cols[cur.c]+(cur.r+1)+cols[c]+(r+1);
 var src=b[cur.r][cur.c];
 if(src&&src[1]==="P"&&(r===7||r===0)) str+="q";
 if(lms.includes(str)){ mv(cur.r,cur.c,r,c,str); unsel(); return }
 unsel(); if(p&&p[0]===t) sel(r,c)
}

    function mv(r1,c1,r2,c2,s){
var p=b[r1][c1], trg=b[r2][c2];
      if(p[1]==="K"&&Math.abs(c1-c2)===2){
        var rc1=(c2>c1)?7:0, rc2=(c2>c1)?5:3;
        var rk=b[r1][rc1]; b[r1][rc1]=""; b[r1][rc2]=rk;
        var d1=sqs[r1][rc1], d2=sqs[r1][rc2];
        pts.forEach(x=>d1.classList.remove(x)); pts.forEach(x=>d2.classList.remove(x));
        d2.classList.add(rk)
      }
 if(p[1]==="P"&&c1!==c2&&trg===""){
   b[r1][c2]=""; var cap=sqs[r1][c2]; pts.forEach(x=>cap.classList.remove(x))
 }
 if(s.length===5) p=p[0]+s[4].toUpperCase();
 b[r1][c1]=""; b[r2][c2]=p;
 var s1=sqs[r1][c1]; pts.forEach(x=>s1.classList.remove(x));
 var s2=sqs[r2][c2]; pts.forEach(x=>s2.classList.remove(x)); s2.classList.add(p);
 t=(t==="W")?"B":"W"; rec(s)
    }

function sel(r,c){ if(cur)unsel(); cur={r:r,c:c}; sqs[r][c].classList.add("selected") }
function unsel(){ if(!cur)return; sqs[cur.r][cur.c].classList.remove("selected"); cur=null }

function mkBd(){
 var el=document.getElementById("chessBoard"); el.innerHTML="";
 for(var r=0;r<8;r++){ sqs[r]=[];
  for(var c=0;c<8;c++){
   var d=document.createElement("div");
   d.classList.add("piece",C[c],"L"+(r+1));
   if(b[r][c]) d.classList.add(b[r][c]);
    d.addEventListener("click",((rr,cc)=>()=>clk(rr,cc))(r,c));
   el.appendChild(d); sqs[r][c]=d
  }
 }
}
document.onkeydown=function(z){
 if(z.key==="r"||z.key==="R")rst()
}
    function rst(){
 t="W"; mvs=[]; cur=null;
 var o=document.getElementById("gmOv"); if(o)o.remove();
 b=[["WR","WN","WB","WQ","WK","WB","WN","WR"],["WP","WP","WP","WP","WP","WP","WP","WP"],
 ["","","","","","","",""],["","","","","","","",""],["","","","","","","",""],
 ["","","","","","","",""],["BP","BP","BP","BP","BP","BP","BP","BP"],
 ["BR","BN","BB","BQ","BK","BB","BN","BR"]];
      mkBd();
   eng.postMessage("ucinewgame"); eng.postMessage("position startpos");
     eng.postMessage("isready");
 var st=document.getElementById("moveStatus"); st.innerText="White"; st.style.color="#4CAF50"; getL()
    }
mkBd(); init();