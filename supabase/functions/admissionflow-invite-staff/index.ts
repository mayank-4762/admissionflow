import { createClient } from 'npm:@supabase/supabase-js@2'
const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS' }
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,'Content-Type':'application/json'}})}
Deno.serve(async req=>{
 if(req.method==='OPTIONS') return new Response('ok',{headers:cors}); if(req.method!=='POST') return json({error:'Method not allowed'},405)
 const auth=req.headers.get('Authorization'); if(!auth) return json({error:'Authorization required'},401)
 const url=Deno.env.get('SUPABASE_URL')??''; const publishableKeysRaw=Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'); const anon=Deno.env.get('SUPABASE_ANON_KEY')??''; let publishable=anon
 if(publishableKeysRaw){try{publishable=JSON.parse(publishableKeysRaw).default??anon}catch{}}
 const userClient=createClient(url,publishable,{global:{headers:{Authorization:auth}}}); const {data:{user},error:userError}=await userClient.auth.getUser(); if(userError||!user) return json({error:'Invalid session'},401)
 const secretKeysRaw=Deno.env.get('SUPABASE_SECRET_KEYS'); const legacy=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); let secret=legacy??''; if(secretKeysRaw){try{secret=JSON.parse(secretKeysRaw).default??secret}catch{}}
 if(!secret) return json({error:'Server is missing Supabase secret key'},500)
 const admin=createClient(url,secret); const {data:owners,error:oe}=await admin.from('staff').select('institute_id,role').eq('user_id',user.id).limit(1); if(oe||!owners?.length||owners[0].role!=='owner') return json({error:'Owner permission required'},403)
 const body=await req.json().catch(()=>({})); const email=String(body.email??'').trim().toLowerCase(); if(!/^\S+@\S+\.\S+$/.test(email)) return json({error:'Valid email required'},400)
 const {data:inv,error:ie}=await admin.auth.admin.inviteUserByEmail(email); if(ie) return json({error:ie.message},400); const uid=inv.user?.id; if(!uid) return json({error:'Invite created but no user id returned'},500)
 const {error:se}=await admin.from('staff').upsert({user_id:uid,institute_id:owners[0].institute_id,role:'counsellor'},{onConflict:'user_id'}); if(se) return json({error:se.message},500)
 return json({ok:true,email,role:'counsellor',message:'Counsellor invited and linked to this institute.'})
})
