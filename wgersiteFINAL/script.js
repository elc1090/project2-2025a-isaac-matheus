const API = window.location.hostname.includes("localhost")
  ? "http://localhost:3000/api"
  : "https://SEU-BACKEND.onrender.com/api"; // ajuste para produção depois!

// Utilitário para buscar dados da API
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    return null;
  }
}

// ---------------------------
// Exercícios
// ---------------------------

async function loadFilters() {
  const [categories, muscles, equipment] = await Promise.all([
    fetchData(`${API}/exercisecategory/`),
    fetchData(`${API}/muscle/`),
    fetchData(`${API}/equipment/`)
  ]);

  populateSelect("category-filter", categories?.results, "name");
  populateSelect("muscle-filter", muscles?.results, "name");
  populateSelect("equipment-filter", equipment?.results, "name");
  carregarListaPlanos();
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

async function loadExercises() {
  const list = document.getElementById("exercise-list");
  if (!list) return;

  list.innerHTML = "Carregando...";

  const category = document.getElementById("category-filter")?.value;
  const muscle = document.getElementById("muscle-filter")?.value;
  const equipment = document.getElementById("equipment-filter")?.value;

  let url = `${API}/exerciseinfo/?language=2&limit=60`;
  const data = await fetchData(url);

  list.innerHTML = "";

  if (!data?.results?.length) {
    list.innerHTML = "Nenhum exercício encontrado.";
    return;
  }

  const planos = JSON.parse(localStorage.getItem("planos")) || [];
  const planoSelecionado = document.getElementById("plan-select")?.value || "";

  for (const e of data.results) {
    const translation = e.translations.find(t => t.language === 2);
    const name = translation?.name || "Sem nome";
    const description = translation?.description?.replace(/<[^>]*>/g, '') || "Sem descrição";

    if (
      (category && e.category?.id != category) ||
      (muscle && !e.muscles.some(m => m.id == muscle)) ||
      (equipment && !e.equipment.some(eq => eq.id == equipment))
    ) continue;

    const images = await fetchData(`${API}/exerciseimage/?exercise=${e.id}`);
    const imgUrl = images?.results[0]?.image || null;

    const card = document.createElement("div");
    card.className = "bg-white shadow-md rounded-lg overflow-hidden flex flex-col";

    card.innerHTML = `
      ${
        imgUrl
          ? `<img src="${imgUrl}" alt="${name}" class="w-full h-40 object-cover">`
          : `<div class="w-full h-40 bg-blue-900 flex items-center justify-center text-white">Imagem indisponível</div>`
      }
      <div class="p-4 flex flex-col justify-between flex-1">
        <h2 class="text-xl font-semibold mb-2">${name}</h2>
        <p class="text-gray-600 text-sm mb-4">${description.slice(0, 80)}...</p>
        ${
          planoSelecionado
            ? `<button onclick="adicionarAoPlano('${planoSelecionado}', '${name.replace(/'/g, "\\'")}', ${e.id})"
                class="mt-auto bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
                Adicionar ao Plano
              </button>`
            : `<p class="text-red-600 text-sm">Selecione um plano para adicionar</p>`
        }
      </div>
    `;
    list.appendChild(card);
  }
}

function carregarListaPlanos() {
  const planos = JSON.parse(localStorage.getItem("planos")) || [];
  const select = document.getElementById("plan-select");
  if (!select) return;
  select.innerHTML = `<option value="">Selecione um plano</option>`;
  planos.forEach(plano => {
    const option = document.createElement("option");
    option.value = plano.nome;
    option.textContent = plano.nome;
    select.appendChild(option);
  });
}

function adicionarAoPlano(nomePlano, nomeExercicio, exercicioId) {
  const planos = JSON.parse(localStorage.getItem("planos")) || [];
  const plano = planos.find(p => p.nome === nomePlano);
  if (!plano) {
    alert("Plano não encontrado!");
    return;
  }

  if (!plano.exercicios) plano.exercicios = [];
  if (plano.exercicios.some(e => e.id === exercicioId)) {
    alert("Este exercício já está no plano!");
    return;
  }

  plano.exercicios.push({ name: nomeExercicio, id: exercicioId });
  localStorage.setItem("planos", JSON.stringify(planos));
  alert(`"${nomeExercicio}" adicionado ao plano "${nomePlano}" com sucesso!`);
}

// ---------------------------
// Inicialização automática
// ---------------------------

if (document.getElementById("exercise-list")) {
  window.onload = () => {
    loadFilters();
    loadExercises();
  };
}