const normalize=(s)=>s.toLowerCase().replace(/[+#.\-_\s]/g,'').trim();
const lev=(s1,s2)=>{const m=[];for(let i=0;i<=s2.length;i++)m[i]=[i];for(let j=0;j<=s1.length;j++)m[0][j]=j;for(let i=1;i<=s2.length;i++){for(let j=1;j<=s1.length;j++){m[i][j]=s2.charAt(i-1)===s1.charAt(j-1)?m[i-1][j-1]:Math.min(m[i-1][j-1]+1,m[i][j-1]+1,m[i-1][j]+1)}}return m[s2.length][s1.length]};
const fuzzyMatch=(a,b)=>{const n1=normalize(a),n2=normalize(b);if(n1===n2)return{match:true,score:10};if(n1.includes(n2)||n2.includes(n1))return{match:true,score:7};if(n1.length>=3&&n2.length>=3&&n1.substring(0,3)===n2.substring(0,3))return{match:true,score:5};const d=lev(n1,n2),L=Math.max(n1.length,n2.length),sim=1-d/L;if(sim>=0.7)return{match:true,score:Math.floor(sim*5)};return{match:false,score:0}};

// deterministic pseudo-random so every run is identical
let seed=42; const rnd=(n)=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed%n;};
const POOL=['Mathematics','Calculus','Linear Algebra','Statistics','Physics','Chemistry','Biology','Data Structures','Algorithms','Operating Systems','Computer Networks','Database Systems','Machine Learning','Artificial Intelligence','Software Engineering','Web Development','Economics','Accounting','Finance','Marketing','Sociology','Psychology','French','History'];
const STATUS=['Ready To Teach','Ready To Learn','Later'];
function makeUsers(n){seed=42;const u=[];for(let i=0;i<n;i++){const subs=[];for(let j=0;j<3;j++)subs.push(POOL[rnd(POOL.length)]);u.push({_id:'u'+i,subjects:subs,status:STATUS[rnd(3)],isOnline:rnd(10)<2});}return u;}
function score(me,all){let t=[];if(me.status==='Ready To Learn')t.push('Ready To Teach');else if(me.status==='Ready To Teach')t.push('Ready To Learn');const out=[];
for(const o of all){if(o._id===me._id)continue;let s=0;let m=0;if(t.length&&t.includes(o.status))s+=20;
for(const ms of me.subjects){for(const os of o.subjects){const r=fuzzyMatch(ms,os);if(r.match){s+=r.score;m++;break;}}}
if(o.isOnline)s+=3;if(m>1)s+=m*2;if(s>0)out.push({id:o._id,s});}
out.sort((a,b)=>b.s-a.s);return out.slice(0,15);}

// warm up the JIT
{const w=makeUsers(2000);for(let i=0;i<20;i++)score(w[0],w);}

console.log('Users   | Mean (ms) | Median (ms) | ms per 1000 users');
console.log('--------|-----------|-------------|------------------');
for(const n of [100,250,500,1000,2000,4000,8000,16000]){
  const users=makeUsers(n); const me={_id:'ME',subjects:['Calculus','Data Structures','Physics'],status:'Ready To Learn',isOnline:true};
  const runs=[];
  for(let r=0;r<25;r++){const t0=process.hrtime.bigint();score(me,users);const t1=process.hrtime.bigint();runs.push(Number(t1-t0)/1e6);}
  runs.sort((a,b)=>a-b);
  const mean=runs.reduce((x,y)=>x+y,0)/runs.length;
  const med=runs[Math.floor(runs.length/2)];
  console.log(`${String(n).padEnd(7)} | ${mean.toFixed(2).padStart(9)} | ${med.toFixed(2).padStart(11)} | ${(mean/n*1000).toFixed(2).padStart(17)}`);
}
