import assert from 'node:assert/strict';
const origin='http://127.0.0.1:5173';
const state=await fetch(origin+'/api/teacher-auth');assert.equal(state.status,200);const config=await state.json();assert.equal(typeof config.ready,'boolean');
const bad=await fetch(origin+'/api/teacher-auth',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({action:'login',email:'invalid',password:'short'})});assert.equal(bad.status,400);
const csrf=await fetch(origin+'/api/teacher-auth',{method:'DELETE',headers:{Origin:'https://invalid.example'}});assert.equal(csrf.status,403);
if(!config.ready){const missing=await fetch(origin+'/api/teacher-auth',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({action:'login',email:'probe@example.invalid',password:'verification-only-123'})});assert.equal(missing.status,503);}
const forged=await fetch(origin+'/api/classes',{headers:{Cookie:'mendje_teacher=forged'}});assert.equal(forged.status,401);
console.log('Email API: configuration state, strict validation, cross-origin rejection and forged cookie denial passed. Live email delivery not tested.');
