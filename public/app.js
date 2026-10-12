const $=id=>document.getElementById(id);
const toast=$('toast');let toastTimer;let accountMode='login';
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),3300)}
async function api(url, options={}) {
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})},credentials:'same-origin'});
  let data={};try{data=await response.json()}catch{}
  if(!response.ok)throw new Error(data.error||'Something went wrong. Please try again.');
  return data;
}
function openAccount(mode){accountMode=mode;$('dialogTitle').textContent=mode==='signup'?'Create your travel account':'Welcome back';$('dialogText').textContent=mode==='signup'?'Create an account to save and manage your trips.':'Log in to view the trips saved to your account.';$('nameLabel').hidden=mode!=='signup';$('accountName').required=mode==='signup';$('dialogSubmit').textContent=mode==='signup'?'Create Account':'Login';$('switchMode').textContent=mode==='signup'?'Already have an account? Login':'New here? Create an account';$('accountDialog').showModal()}
function updateUserUI(user){const loggedIn=!!user;$('loginBtn').hidden=loggedIn;$('signupBtn').hidden=loggedIn;$('logoutBtn').hidden=!loggedIn;$('userBadge').hidden=!loggedIn;if(user)$('userBadge').textContent='Hi, '+user.name;else $('userBadge').textContent='';}
async function checkUser(){try{const data=await api('/api/me');updateUserUI(data.user);return data.user}catch{updateUserUI(null);return null}}
$('loginBtn').addEventListener('click',()=>openAccount('login'));
$('signupBtn').addEventListener('click',()=>openAccount('signup'));
$('switchMode').addEventListener('click',()=>openAccount(accountMode==='login'?'signup':'login'));
$('closeDialog').addEventListener('click',()=>$('accountDialog').close());
$('closeTripDialog').addEventListener('click',()=>$('tripDialog').close());
$('accountForm').addEventListener('submit',async e=>{e.preventDefault();const body={email:$('accountEmail').value,password:$('accountPassword').value};if(accountMode==='signup')body.name=$('accountName').value;const btn=$('dialogSubmit');btn.disabled=true;try{const data=await api('/api/'+(accountMode==='signup'?'register':'login'),{method:'POST',body:JSON.stringify(body)});$('accountDialog').close();$('accountForm').reset();updateUserUI(data.user);showToast(data.message);if(pendingSave){pendingSave=false;openTripDialog()}if($('myTripsSection').hidden===false)await loadTrips()}catch(err){showToast(err.message)}finally{btn.disabled=false}});
$('logoutBtn').addEventListener('click',async()=>{try{await api('/api/logout',{method:'POST'});updateUserUI(null);$('myTripsSection').hidden=true;showToast('You have logged out.')}catch(err){showToast(err.message)}});
let pendingSave=false;
function openTripDialog(destination){$('tripDestination').value=destination||$('destinationInput').value.trim()||$('itineraryTitle').textContent.replace(/ Adventure| Getaway/g,'');$('tripStart').value=$('dateInput').value||'';$('tripTravelers').value=$('travelers').value;$('tripBudget').value='';$('tripNotes').value='';$('tripDialog').showModal()}
$('tripForm').addEventListener('submit',async e=>{e.preventDefault();const body={destination:$('tripDestination').value,startDate:$('tripStart').value,endDate:$('tripEnd').value,travelers:$('tripTravelers').value,budget:$('tripBudget').value,notes:$('tripNotes').value};try{await api('/api/trips',{method:'POST',body:JSON.stringify(body)});$('tripDialog').close();showToast('Trip saved to your account!');await loadTrips()}catch(err){$('tripDialog').close();if(err.message.includes('log in')){pendingSave=true;openAccount('login')}else showToast(err.message)}});
function openSaveTrip(){checkUser().then(user=>{if(user)openTripDialog();else{pendingSave=true;openAccount('login')}})}
$('customizeBtn').addEventListener('click',openSaveTrip);
$('getStarted').addEventListener('click',()=>{ $('home').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('destinationInput').focus(),350)});
$('focusSearch')?.addEventListener('click',()=>{$('home').scrollIntoView({behavior:'smooth'});$('destinationInput').focus()});
$('tripSearch').addEventListener('submit',e=>{e.preventDefault();const query=$('destinationInput').value.trim().toLowerCase(),budget=$('budget').value;let count=0;document.querySelectorAll('.destination-card').forEach(card=>{const name=card.dataset.name.toLowerCase(),price=Number(card.dataset.price);const budgetOk=budget==='any'||(budget==='budget'&&price<10000)||(budget==='mid'&&price>=10000&&price<=25000)||(budget==='premium'&&price>25000);const match=(!query||name.includes(query)||(['beach','sea','island'].includes(query)&&name==='goa'))&&budgetOk;card.hidden=!match;if(match)count++});$('noResults').hidden=count>0;$('itineraryTitle').textContent=($('destinationInput').value.trim()||'Your Trip')+' Adventure';$('itineraryMeta').textContent='5 Days · 4 Nights · '+$('travelers').selectedOptions[0].textContent;document.querySelector('#destinations').scrollIntoView({behavior:'smooth'});showToast(count?'Trip ideas updated. Save a trip to keep it in your account.':'No matching destination found. Try another search.')});
$('viewAll').addEventListener('click',e=>{e.preventDefault();$('destinationInput').value='';$('budget').value='any';document.querySelectorAll('.destination-card').forEach(c=>c.hidden=false);$('noResults').hidden=true});
document.querySelectorAll('.card-action').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.destination;$('destinationInput').value=name;$('itineraryTitle').textContent=name+' Adventure';$('itineraryMeta').textContent='5 Days · 4 Nights · '+$('travelers').selectedOptions[0].textContent;$('itinerary').scrollIntoView({behavior:'smooth'});showToast(name+' selected. Click Save This Trip to save it to your account.')}));
$('viewItinerary').addEventListener('click',e=>{e.preventDefault();showToast('Sample itinerary: arrival, sightseeing, adventure, local visits and departure.')});
$('myTripsBtn').addEventListener('click',async()=>{
```js
async function loadTrips(){
  try {
    const data = await api('/api/trips');
    const box = $('savedTrips');
    box.innerHTML = '';

    if (!data.trips || !data.trips.length) {
      box.innerHTML = '<p>You have not saved any trips yet. Choose a destination and click “Save This Trip”.</p>';
      return;
    }

    data.trips.forEach(trip => {
      const card = document.createElement('article');
      card.className = 'saved-trip';

      const title = document.createElement('h3');
      title.textContent = '📍 ' + trip.destination;

      const details = document.createElement('p');
      details.textContent =
        '📅 Departure: ' + (trip.start_date || 'Not set') +
        ' | Return: ' + (trip.end_date || 'Not set');

      const travelers = document.createElement('p');
      travelers.textContent = '👥 Travelers: ' + (trip.travelers || 1);

      const budget = document.createElement('p');
      budget.textContent =
        '💰 Budget: ₹' +
        Number(trip.budget || 0).toLocaleString('en-IN');

      const notes = document.createElement('p');
      notes.textContent = '📝 Notes: ' + (trip.notes || 'No notes added.');

      const fullDetails = document.createElement('div');
      fullDetails.hidden = true;
      fullDetails.className = 'full-trip-details';

      const itineraryTitle = document.createElement('h4');
      itineraryTitle.textContent = '🗺️ Trip Details & Itinerary';

      const itinerary = document.createElement('p');
      itinerary.style.whiteSpace = 'pre-line';
      itinerary.textContent = trip.notes ||
        'No itinerary has been added to this trip yet.';

      const info = document.createElement('p');
      info.textContent =
        'Destination: ' + trip.destination +
        '\nDeparture: ' + (trip.start_date || 'Not set') +
        '\nReturn: ' + (trip.end_date || 'Not set') +
        '\nTravelers: ' + (trip.travelers || 1) +
        '\nBudget: ₹' + Number(trip.budget || 0).toLocaleString('en-IN');

      fullDetails.append(info, itineraryTitle, itinerary);

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'btn btn-primary';
      viewBtn.textContent = '👁️ View Full Details';

      viewBtn.addEventListener('click', () => {
        fullDetails.hidden = !fullDetails.hidden;
        viewBtn.textContent = fullDetails.hidden
          ? '👁️ View Full Details'
          : 'Hide Details';
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete-trip';
      del.textContent = '🗑️ Delete Trip';

      del.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this trip?')) return;

        try {
          await api('/api/trips/' + trip.id, { method: 'DELETE' });
          showToast('Trip deleted successfully.');
          await loadTrips();
        } catch (err) {
          showToast(err.message);
        }
      });

      card.append(
        title,
        details,
        travelers,
        budget,
        notes,
        viewBtn,
        fullDetails,
        del
      );

      box.appendChild(card);
    });
  } catch (err) {
    showToast(err.message);
  }
}
```

$('menuToggle').addEventListener('click',()=>$('mainNav').classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('mainNav').classList.remove('open')));
$('accountDialog').addEventListener('click',e=>{if(e.target===$('accountDialog'))$('accountDialog').close()});
$('tripDialog').addEventListener('click',e=>{if(e.target===$('tripDialog'))$('tripDialog').close()});
checkUser();

// Manali guide: budget calculator and customizable day-wise itinerary.
const manaliDays = [
  {title:'Arrival & Mall Road',detail:'Reach Manali, check in, rest, explore Mall Road and enjoy a relaxed dinner.'},
  {title:'Old Manali & Hadimba Temple',detail:'Visit Hadimba Devi Temple, walk through Old Manali and explore local cafés.'},
  {title:'Solang Valley',detail:'Spend the day around Solang Valley. Choose activities only after checking weather, local conditions and prices.'},
  {title:'Vashisht & Jogini area',detail:'Visit Vashisht village and temple. Consider the Jogini Waterfall walk if the trail is safe and you have enough daylight.'},
  {title:'Atal Tunnel / Sissu day trip',detail:'Plan a scenic excursion only if the road is open and conditions are suitable; otherwise enjoy local sightseeing.'},
  {title:'Flexible local day',detail:'Keep a flexible day for a nearby attraction, shopping, café time or weather-related changes.'},
  {title:'Breakfast & departure',detail:'Check out, keep time for your onward bus/train/flight connection and begin your return journey.'}
];
function renderManaliItinerary(){
  const days=Number($('itineraryDays').value);const box=$('generatedItinerary');box.innerHTML='';
  const plan=manaliDays.slice(0,days);
  if(days===3){plan[2]={title:'Solang Valley & departure',detail:'Visit Solang Valley only if timing and weather allow, then prepare for your onward journey. For a relaxed trip, move the excursion to Day 2 and keep this day for departure.'}}
  plan.forEach((item,i)=>{const row=document.createElement('article');row.className='day-plan-item';const badge=document.createElement('span');badge.className='day-plan-number';badge.textContent='Day '+(i+1);const body=document.createElement('div');const title=document.createElement('h3');title.textContent=item.title;const detail=document.createElement('p');detail.textContent=item.detail;body.append(title,detail);row.append(badge,body);box.append(row)});
  $('itineraryTitle').textContent='Manali Adventure';$('itineraryMeta').textContent=days+' Days · '+(days-1)+' Nights · '+$('travelers').selectedOptions[0].textContent;
}
function calculateBudget(){
  const people=Math.max(1,Number($('budgetPeople').value)||1);const nights=Math.max(1,Number($('budgetNights').value)||1);const rooms=Math.ceil(people/2);const hotel=rooms*Number($('budgetStay').value)*nights;const transport=people*Number($('budgetTransport').value);const food=people*(nights+1)*Number($('budgetFood').value);const activities=people*Math.max(0,Number($('budgetActivities').value)||0);const total=hotel+transport+food+activities;
  const money=n=> '₹'+Math.round(n).toLocaleString('en-IN');$('budgetTotal').textContent=money(total);$('budgetSummary').textContent=`Estimate for ${people} traveller(s) · ${nights} night(s) · ${rooms} room(s) assumed (2 people per room)`;
  $('budgetBreakdown').innerHTML='';[['Hotel',hotel],['Return transport',transport],['Food',food],['Activities & local travel',activities]].forEach(([label,value])=>{const row=document.createElement('div');row.className='budget-line';const a=document.createElement('span');a.textContent=label;const b=document.createElement('strong');b.textContent=money(value);row.append(a,b);$('budgetBreakdown').append(row)});return {people,nights,total};
}
$('budgetForm')?.addEventListener('submit',e=>{e.preventDefault();calculateBudget();showToast('Budget estimate updated.')});
$('generateItinerary')?.addEventListener('click',()=>{renderManaliItinerary();showToast('Your day-wise Manali plan is ready.')});
async function saveManaliPlan(kind){
  const user=await checkUser();
  if(!user){openAccount('login');showToast('Login first, then click Save this trip again.');return}
  const days=Number($('itineraryDays').value);const budget=calculateBudget();openTripDialog('Manali');$('tripDestination').value='Manali';$('tripBudget').value=String(budget.total);
  if(kind==='itinerary')$('tripNotes').value=manaliDays.slice(0,days).map((d,i)=>`Day ${i+1}: ${d.title} — ${d.detail}`).join('\n');
  else $('tripNotes').value=`Manali budget estimate for ${budget.people} traveller(s), ${budget.nights} night(s). Group estimate: ₹${Math.round(budget.total).toLocaleString('en-IN')}. Please recheck live rates before booking.`;
}
$('saveItinerary')?.addEventListener('click',()=>saveManaliPlan('itinerary'));
$('saveBudgetTrip')?.addEventListener('click',()=>saveManaliPlan('budget'));
renderManaliItinerary();calculateBudget();

// Browser-saved travel checklist
const checklistKey='tripPlannerChecklist_v1';
function loadChecklist(){let saved={};try{saved=JSON.parse(localStorage.getItem(checklistKey)||'{}')}catch{}document.querySelectorAll('[data-check]').forEach(box=>{box.checked=!!saved[box.dataset.check]})}
document.querySelectorAll('[data-check]').forEach(box=>box.addEventListener('change',()=>{let saved={};try{saved=JSON.parse(localStorage.getItem(checklistKey)||'{}')}catch{}saved[box.dataset.check]=box.checked;localStorage.setItem(checklistKey,JSON.stringify(saved))}));
$('resetChecklist')?.addEventListener('click',()=>{localStorage.removeItem(checklistKey);loadChecklist();showToast('Travel checklist reset.')});
loadChecklist();


// Google Maps destination search (no API key required for these public search links).
function updateMapSearch(destination){
  const q=destination.trim(); if(!q) return; const enc=encodeURIComponent(q);
  $('mapFrame').src='https://maps.google.com/maps?q='+enc+'&output=embed';
  $('directionsLink').href='https://www.google.com/maps/dir/?api=1&destination='+enc;
  $('hotelsMapLink').href='https://www.google.com/maps/search/hotels+in+'+enc;
  $('placesMapLink').href='https://www.google.com/maps/search/tourist+places+in+'+enc;
}
$('mapsSearchForm')?.addEventListener('submit',e=>{e.preventDefault();const q=$('mapsDestination').value.trim();updateMapSearch(q);showToast('Map updated for '+q);});
$('destinationInput')?.addEventListener('change',()=>{const q=$('destinationInput').value.trim();if(q){$('mapsDestination').value=q;updateMapSearch(q);}});
document.querySelectorAll('.card-action').forEach(btn=>btn.addEventListener('click',()=>{const field=$('mapsDestination');if(field){field.value=btn.dataset.destination;updateMapSearch(field.value);}}));
