// Funções para manipular localStorage
function carregarPlanos() {
    return JSON.parse(localStorage.getItem("planos")) || [];
  }
  
  function salvarPlanos(planos) {
    localStorage.setItem("planos", JSON.stringify(planos));
  }
  
  // Renderizar todos os planos
  function renderizarPlanos() {
    const container = document.getElementById("lista-planos");
    const planos = carregarPlanos();
    container.innerHTML = "";
  
    if (planos.length === 0) {
      container.innerHTML = "<p class='text-gray-600'>Nenhum plano criado ainda.</p>";
      return;
    }
  
    planos.forEach((plano, index) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded shadow p-4 flex flex-col justify-between";
  
      const exerciciosHtml = plano.exercicios?.map((ex, idx) => `
        <li class="flex justify-between items-center text-sm text-gray-700 my-1">
          ${ex.name}
          <button onclick="removerExercicio(${index}, ${idx})" class="text-red-600 hover:underline text-xs">Remover</button>
        </li>
      `).join("") || "<li class='text-gray-500'>Nenhum exercício adicionado</li>";
  
      card.innerHTML = `
        <h3 class="text-lg font-bold mb-2">${plano.nome}</h3>
        <ul>${exerciciosHtml}</ul>
        <div class="mt-4 flex gap-2">
          <button onclick="editarNomePlano(${index})" class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded">Editar Nome</button>
          <button onclick="removerPlano(${index})" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded">Excluir Plano</button>
        </div>
      `;
  
      container.appendChild(card);
    });
  }
  
  // Criar novo plano
  document.getElementById("form-novo-plano").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome-plano").value.trim();
    if (!nome) return;
  
    let planos = carregarPlanos();
    if (planos.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
      alert("Já existe um plano com esse nome!");
      return;
    }
  
    planos.push({ nome, exercicios: [] });
    salvarPlanos(planos);
    document.getElementById("nome-plano").value = "";
    renderizarPlanos();
  });
  
  // Remover plano
  function removerPlano(index) {
    if (!confirm("Tem certeza que deseja remover este plano?")) return;
    let planos = carregarPlanos();
    planos.splice(index, 1);
    salvarPlanos(planos);
    renderizarPlanos();
  }
  
  // Editar nome do plano
  function editarNomePlano(index) {
    let planos = carregarPlanos();
    const novoNome = prompt("Digite o novo nome do plano:", planos[index].nome);
    if (novoNome) {
      planos[index].nome = novoNome;
      salvarPlanos(planos);
      renderizarPlanos();
    }
  }
  
  // Remover exercício de um plano
  function removerExercicio(planoIndex, exercicioIndex) {
    let planos = carregarPlanos();
    planos[planoIndex].exercicios.splice(exercicioIndex, 1);
    salvarPlanos(planos);
    renderizarPlanos();
  }
  
  // Inicializar
  renderizarPlanos()