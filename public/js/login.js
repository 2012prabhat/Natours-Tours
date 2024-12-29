const hideAlert = ()=>{
  const el = document.querySelector('.alert');
  if(el) el.remove();   
 }
 
  const showAlert = (type,msg)=>{
     hideAlert();
     const markup = `<div class="alert alert--${type}">${msg}</div>`;
     document.querySelector('body').insertAdjacentHTML('afterbegin',markup);
     window.setTimeout(hideAlert,5000);
 }

const login = async (email,password) => 
{
  try{
 const res = await axios({
  method:"POST",
  url:'/api/v1/users/login',
  data:{
      email,
      password
  }
 });

 if(res.data.status === 'success'){
  showAlert('success','Logged in successfully!');
  window.setTimeout(()=>{
      location.assign('/');
  },1500);
 }
console.log(res);
}catch(err){
showAlert('error',err.response.data.message);
}
}

const logout = async ()=>{
  try{
      const res = await axios({
          method:'GET',
          url:'/api/v1/users/logout',
      })
      showAlert('success','Log out Succesfully')
      if(res.data.status == 'success'){
          setTimeout(()=>location.reload(true),2000);
      } 
  }
  catch(err){
      showAlert('error','Error logging out try again!');
  }
}

let logOutBtn = document.querySelector('.nav__el--logout');
if(logOutBtn) logOutBtn.addEventListener('click',logout);

let form = document.querySelector('.form--login')

if(form) form.addEventListener('submit',e=>{
e.preventDefault();
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
login(email,password);
})