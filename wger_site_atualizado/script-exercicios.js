const API = "https://wger.de/api/v2";

// Função para buscar dados da API
async function fetchData(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.error("Erro ao buscar dados:", e);
    return null;
  }
}

// Carregar filtros (categorias, músculos, equipamentos)
async function loadFilters() {
  const [categories, muscles, equipment] = await Promise.all([
    fetchData(`${API}/exercisecategory/`),
    fetchData(`${API}/muscle/`),
    fetchData(`${API}/equipment/`)
  ]);

  populateSelect("category-filter", categories?.results, "name");
  populateSelect("muscle-filter", muscles?.results, "name");
  populateSelect("equipment-filter", equipment?.results, "name");
}

function populateSelect(id, items, key) {
  const select = document.getElementById(id);
  if (!select || !items) return;
  select.innerHTML = `<option value="">Todos</option>`;
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item[key];
    select.appendChild(option);
  });
}

// Carregar lista de exercícios
async function loadExercises() {
  const list = document.getElementById("exercise-list");
  if (!list) return;
  list.innerHTML = "Carregando...";

  const category = document.getElementById("category-filter")?.value;
  const muscle = document.getElementById("muscle-filter")?.value;
  const equipment = document.getElementById("equipment-filter")?.value;

  const data = await fetchData(`${API}/exerciseinfo/?language=2&limit=60`);
  list.innerHTML = "";

  if (!data?.results?.length) {
    list.innerHTML = "<p class='text-white'>Nenhum exercício encontrado.</p>";
    return;
  }

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  for (const e of data.results) {
    const translation = e.translations.find(t => t.language === 2);
    const name = translation?.name || "Sem nome";
    const description = translation?.description?.replace(/<[^>]*>/g, "") || "Sem descrição";
    const categoryName = e.category?.name || "Sem categoria";

    if (
      (category && e.category?.id != category) ||
      (muscle && !e.muscles.some(m => m.id == muscle)) ||
      (equipment && !e.equipment.some(eq => eq.id == equipment))
    ) continue;

    const images = await fetchData(`${API}/exerciseimage/?exercise=${e.id}`);
    const imgUrl = images?.results[0]?.image || null;

    const isFavorite = favoritos.includes(e.id);

    const card = document.createElement("div");
    card.className = "bg-white rounded shadow overflow-hidden";

    card.innerHTML = `
      ${
        imgUrl
          ? `<img src="${imgUrl}" alt="${name}" class="w-full h-40 object-cover">`
          : `<div class="w-full h-40 bg-blue-900 text-white flex items-center justify-center">Imagem indisponível</div>`
      }
      <div class="p-4">
        <h3 class="font-bold text-lg mb-1">${name}</h3>
        <p class="text-sm text-gray-600 mb-2">${categoryName}</p>
        <p class="text-sm text-gray-700 mb-3">${description.slice(0, 80)}...</p>
        <div class="flex flex-col gap-2">
          <button onclick="toggleFavorito(${e.id})" class="px-3 py-1 text-sm rounded ${isFavorite ? 'bg-yellow-400' : 'bg-gray-300'}">
            ${isFavorite ? '★' : '☆'} Favorito
          </button>
          <button onclick="abrirSelecaoPlano(${e.id}, '${name}')" class="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
            ➕ Adicionar ao Plano
          </button>
        </div>
      </div>
    `;

    list.appendChild(card);
  }
}

// Alternar favoritos
function toggleFavorito(id) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const index = favoritos.indexOf(id);
  if (index >= 0) {
    favoritos.splice(index, 1);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  loadExercises();
}

// Abrir seleção de plano ao adicionar exercício
function abrirSelecaoPlano(idExercicio, nomeExercicio) {
  const planos = JSON.parse(localStorage.getItem("planos")) || [];

  if (planos.length === 0) {
    alert("Nenhum plano criado ainda. Crie um plano primeiro.");
    return;
  }

  const planoSelecionado = prompt(`Escolha o número do plano para adicionar "${nomeExercicio}":\n\n` + 
    planos.map((p, idx) => `${idx + 1}. ${p.nome}`).join("\n"));

  const index = parseInt(planoSelecionado) - 1;

  if (isNaN(index) || index < 0 || index >= planos.length) {
    alert("Plano inválido!");
    return;
  }

  if (!planos[index].exercicios) planos[index].exercicios = [];
  planos[index].exercicios.push({ id: idExercicio, name: nomeExercicio });

  localStorage.setItem("planos", JSON.stringify(planos));
  alert(`"${nomeExercicio}" adicionado ao plano "${planos[index].nome}" com sucesso!`);
}

// Inicializar
window.onload = () => {
  loadFilters();
  loadExercises();
};