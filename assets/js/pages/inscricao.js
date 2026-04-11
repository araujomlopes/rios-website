// IDs dos campos
const fields = [
  "nome","apelido","endereco","email",
  "bi","telefone","altura","pe","posicao","clube","numeroCamisa"
];


const checkboxes = Array.from(document.querySelectorAll('.checkbox input'));
const inputs = fields.map(id => document.getElementById(id)).filter(i => i);
const btn = document.getElementById('btnInscrever');
const messageDiv = document.getElementById('messageDiv');

btn.disabled = true;
btn.style.opacity = "0.5";
btn.style.cursor = "not-allowed";

const webAppURL = "https://script.google.com/macros/s/AKfycbwPOCnSjwSPaPdXtdkv_sOELJ4Vj8AStgJUClLCJCrW6sPL3XTvLPp4zfjFu8a4wgs5tQ/exec";

// Criar span de erro embaixo de cada input
inputs.forEach(input => {
  if(!input.parentNode.querySelector('.error')){
    const error = document.createElement('div');
    error.className = 'error';
    error.style.fontSize = "11px";
    error.style.marginTop = "2px";
    error.style.color = "red";
    input.parentNode.appendChild(error);
  }
});

// Função de validação individual
function validarCampo(input) {
  const id = input.id;
  const value = input.value.trim();
  const error = input.parentNode.querySelector('.error');
  let valido = true;

  switch(id) {
    case 'nome':
      if(!value){ 
        error.textContent="Por favor, insira o nome"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-zÀ-ÿ\s]+$/.test(value)){ 
        error.textContent="Por favor, insira o nome corretamente"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    case 'apelido':
      if(!value){ 
        error.textContent="Por favor, insira o apelido"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-zÀ-ÿ\s]+$/.test(value)){ 
        error.textContent="Por favor, insira o apelido corretamente"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    case 'endereco':
      if(!value){ 
        error.textContent="Por favor, insira o endereco"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    

    case 'email':
      if(!value){ 
        error.textContent="Por favor, insira o email"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\S+@\S+\.\S+$/.test(value)){ 
        error.textContent="Por favor, insira um email válido"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false;
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    

    case 'bi':
      if(!value){ 
        error.textContent="Por favor, insira o código"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^[A-Za-z0-9]+$/.test(value)){ 
        error.textContent="Código inválido";
 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    case 'telefone':
      if(!value){ 
        error.textContent="Por favor, insira o numero de telefone"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\d+$/.test(value)){ 
        error.textContent="Por favor, insira corretamente o número de telefone"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    case 'altura':
      if(!value){ 
        error.textContent="Por favor, insira a altura"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else if(!/^\d\.\d{2}$/.test(value)){ 
        error.textContent="Por favor, insira a altura usando duas casas decimais, ex.: m.dd"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
      break;

    default:
      if(!value){ 
        error.textContent="Campo obrigatório"; 
        input.parentNode.querySelector('label').style.color="#e00000"; 
        valido=false; 
      } else { 
        error.textContent=""; 
        input.parentNode.querySelector('label').style.color="var(--text-topbar)"; 
      }
  }

  return valido;
}

function validarTudo() {
  let tudoValido = true;
  inputs.forEach(input => { if(!validarCampo(input)) tudoValido=false; });
  if(!checkboxes.every(c=>c.checked)) tudoValido=false;

  btn.disabled = !tudoValido;
  btn.style.opacity = tudoValido ? "1" : "0.5";
  btn.style.cursor = tudoValido ? "pointer" : "not-allowed";
}

inputs.forEach(input => input.addEventListener('blur', validarTudo));
checkboxes.forEach(c => c.addEventListener('change', validarTudo));

// SUBMISSÃO
btn.addEventListener('click', async e=>{
  e.preventDefault();
  validarTudo();
  if(btn.disabled) return;

  messageDiv.textContent="Enviando...";
  messageDiv.style.color="var(--text)";

  try{
    const res = await fetch(webAppURL,{
      method:"POST",
      body:JSON.stringify(
        Object.fromEntries(fields.map(id=>[id,document.getElementById(id)?.value.trim() || '']))
      )
    });
    const r = await res.json();

    if(r.status==="ok"){
      const email = document.getElementById("email").value.trim();
      window.location.href = "inscricao-verificacao.html?email=" + encodeURIComponent(email);
    } else {
      messageDiv.textContent=r.mensagem;
      messageDiv.style.color="red";
    }
  } catch{
    messageDiv.textContent="Erro de comunicação com o servidor.";
    messageDiv.style.color="red";
  }
});
