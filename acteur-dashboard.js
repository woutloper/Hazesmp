const error=document.querySelector('#dashboardError');
const updates=document.querySelector('#updates');
const adminLink=document.querySelector('#adminLink');
const isConfigured=window.HAZZE_SUPABASE_URL?.startsWith('https://')&&window.HAZZE_SUPABASE_ANON_KEY?.length>20&&!window.HAZZE_SUPABASE_ANON_KEY.includes('PLAK_HIER');
if(!isConfigured){error.textContent='Het acteurportaal is nog niet gekoppeld aan Supabase.';updates.innerHTML='';}
const client=isConfigured?window.supabase.createClient(window.HAZZE_SUPABASE_URL,window.HAZZE_SUPABASE_ANON_KEY):null;
function escapeHtml(value=''){const element=document.createElement('div');element.textContent=value;return element.innerHTML;}
function formatDate(value){return value?new Intl.DateTimeFormat('nl-NL',{dateStyle:'full',timeStyle:'short'}).format(new Date(value)):'Nog geen tijd ingepland';}
async function loadUpdates(){if(!client)return;const {data:{session}}=await client.auth.getSession();if(!session){location.replace('acteurs.html');return;}const {data,error:queryError}=await client.from('actor_updates').select('title, category, scheduled_at, location, details').eq('is_published',true).order('scheduled_at',{ascending:true,nullsFirst:false});if(queryError){error.textContent='De interne updates konden niet geladen worden. Controleer het Supabase-schema en de toegangsregels.';updates.innerHTML='';return;}updates.innerHTML=data.length?data.map(update=>`<article class="dashboard-item"><span class="label">${escapeHtml(update.category)}</span><h3 style="margin-top:16px">${escapeHtml(update.title)}</h3><p class="muted"><strong>Tijd:</strong> ${escapeHtml(formatDate(update.scheduled_at))}</p>${update.location?`<p class="muted"><strong>Locatie:</strong> ${escapeHtml(update.location)}</p>`:''}${update.details?`<p class="muted">${escapeHtml(update.details)}</p>`:''}</article>`).join(''):'<div class="dashboard-item"><p class="muted">Er zijn nog geen interne updates.</p></div>';}
loadUpdates();
client?.rpc('is_actor_admin').then(({data:isAdmin})=>{if(isAdmin)adminLink.innerHTML='<a class="button primary" href="beheer.html">Open castbeheer</a>';});
document.querySelector('#logout').addEventListener('click',async()=>{if(client)await client.auth.signOut();location.href='acteurs.html';});
