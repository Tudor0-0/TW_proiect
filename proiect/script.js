const c = document.getElementById('mainContainer');
let l1 = document.querySelector('.register-link'), l2 = document.querySelector('.login-link');
const b1 = document.querySelector('.form-box.login');
let b2 = document.querySelector('.form-box.register');

function n(t, type){
    const ec = document.getElementById('errorContainer');
    let m = document.createElement('div');
    m.className = 'msg-alert'; m.innerText = t;
    if(type=='success'){ m.style.borderLeftColor='#5cb85c';m.style.background='#e8f5e9'; }
    ec.appendChild(m); setTimeout(function(){m.remove();}, 3000);
}

l1.addEventListener('click', (e)=>{ e.preventDefault();
    b1.style.display='none'; b2.style.display='block'; c.style.height='750px';
});
l2.addEventListener('click', (e)=>{ e.preventDefault();
b2.style.display = 'none';
    b1.style.display = 'block';
    c.style.height = '500px';
});

document.getElementById('techZone').onclick = () => {
    const x=Math.floor(Math.random()*256), y=Math.floor(Math.random()*256);
    let z=Math.floor(Math.random()*256);
    document.body.style.background='rgb('+x+','+y+','+z+')';
};

const elo=document.getElementById('regElo');
elo.oninput = function(e){ document.getElementById('eloValue').innerText = e.target.value; }

const p = document.getElementById('regPass');
let vb = document.getElementById('password-validation-box');
const r_len = document.getElementById('rule-length'), r_up = document.getElementById('rule-upper');
let r_num = document.getElementById('rule-number'), r_sp = document.getElementById('rule-special');

p.addEventListener('focus', function(){ vb.style.display='block'; });
p.addEventListener('blur', ()=>{ if(p.value=="") vb.style.display='none'; });

p.addEventListener('input', ()=>{
    const v = p.value;
    if(v.length>=8){r_len.classList.remove('invalid');r_len.classList.add('valid');}else{r_len.classList.remove('valid');r_len.classList.add('invalid');}
    if(/[A-Z]/.test(v)){r_up.classList.remove('invalid');r_up.classList.add('valid');}else{r_up.classList.remove('valid');r_up.classList.add('invalid');}
    if(/[0-9]/.test(v)){r_num.classList.remove('invalid');r_num.classList.add('valid');}else{r_num.classList.remove('valid');r_num.classList.add('invalid');}
    if(/[!@#$%^&*(),.?":{}|<>]/.test(v)){r_sp.classList.remove('invalid');r_sp.classList.add('valid');}
    else{r_sp.classList.remove('valid');r_sp.classList.add('invalid');}
});

document.getElementById('registerForm').addEventListener('submit', (e)=>{
    e.preventDefault(); const v = p.value;
    let ok = v.length>=8&&/[A-Z]/.test(v)&&/[0-9]/.test(v)&&/[!@#$%^&*(),.?":{}|<>]/.test(v);

    if(!ok){ n("Please fix the password errors.");
        vb.style.transform="translateX(10px)";
        setTimeout(()=>vb.style.transform="translateX(0)",200); return; }

    const obj = {
        username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value,
        password: v, elo: elo.value,
        gender: document.querySelector('input[name="gender"]:checked').value, joinedAt: new Date().toLocaleDateString()
    };

    fetch('/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj)})
    .then(r=>r.json()).then(d=>{
        if(d.success){ n(d.message,'success');
            setTimeout(function(){ l2.click(); document.getElementById('registerForm').reset(); vb.style.display='none';}, 1500);
        } else { n(d.message); }
    }).catch(e=>n("Server connection failed."));
});

const f2 = document.getElementById('loginForm');
f2.onsubmit = function(e) {
    e.preventDefault();
    let d = { email: document.getElementById('loginEmail').value, password: document.getElementById('loginPass').value };
    fetch('/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
    .then(res=>res.json())
    .then(res=>{
        if(res.success){
            n("Login Successful!","success"); localStorage.setItem("currentUser", JSON.stringify(res.user));
            setTimeout(()=> window.location.href="main.html", 1000);
        } else { n(res.message); }
    }).catch(()=>n("Server connection failed."));
};