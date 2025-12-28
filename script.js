document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('cardapio-content');
    const menuContainer = document.querySelector('.menu-container');

    const formatarMoeda = (valor) => {
        if (typeof valor === 'string') return valor;
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const renderizarCardapio = (dados) => {
        // 1. Renderizar Header Info
        if (dados.header_info) {
            let headerDiv = document.querySelector('.header-info-container');
            if (!headerDiv) {
                headerDiv = document.createElement('div');
                headerDiv.className = 'header-info-container';
                const span = document.createElement('span');
                span.textContent = dados.header_info.texto;
                span.classList.add(dados.header_info.estilo || 'azul-destaque');
                headerDiv.appendChild(span);
                menuContainer.insertBefore(headerDiv, contentContainer);
            }
        }

        // 2. Renderizar Footer Fixo
        if (dados.footer_info) {
            let footerDiv = document.querySelector('.footer-fixo');
            if (!footerDiv) {
                footerDiv = document.createElement('footer');
                footerDiv.className = 'footer-fixo';
                const p = document.createElement('p');
                p.className = 'texto-rodape';
                p.textContent = dados.footer_info.texto;
                footerDiv.appendChild(p);
                document.body.appendChild(footerDiv);
            }
        }

        contentContainer.innerHTML = '';
        if (!dados.categorias) return;

        // Container Principal (Colunas Superiores)
        const mainGrid = document.createElement('div');
        mainGrid.className = 'main-grid';
        mainGrid.style.display = 'flex';
        mainGrid.style.flexWrap = 'wrap';
        mainGrid.style.width = '100%';

        const colEsquerda = document.createElement('div');
        colEsquerda.className = 'coluna col-esquerda';

        const colDireita = document.createElement('div');
        colDireita.className = 'coluna col-direita';

        // Container Inferior (Páginas 7-8: Drinks, Vinhos)
        const bottomSection = document.createElement('div');
        bottomSection.className = 'bottom-section';
        // Vamos usar o mesmo esquema de colunas interna ou flex
        const bottomContent = document.createElement('div');
        bottomContent.className = 'bottom-grid'; // CSS definirá grid ou flex

        const mapaColunas = {
            'entradas': 'esquerda',
            'porcoes': 'direita',
            'especiais_tata': 'direita',
            'peroa_tata': 'esquerda',
            'frutos_mar': 'direita',
            'moquecas': 'direita',
            'guarnicoes': 'esquerda',
            'cervejas': 'esquerda',
            'bebidas': 'direita',
            'doses': 'direita',
            // Itens de Baixo (Páginas 7 e 8)
            'drinks': 'bottom',
            'drinks_classicos': 'bottom',
            'vinhos_espumantes': 'bottom'
        };

        // Referência temporária para o container Kids para inserir na ordem certa depois
        let kidsContainerRef = null;

        dados.categorias.forEach((categoria) => {
            const section = document.createElement('section');
            section.className = 'categoria-section';
            section.id = `cat-${categoria.id}`;

            const titulo = document.createElement('h2');
            titulo.className = 'categoria-titulo';
            titulo.textContent = categoria.titulo;
            section.appendChild(titulo);

            if (categoria.descricao_secao) {
                const desc = document.createElement('p');
                desc.className = 'descricao-secao';
                desc.textContent = categoria.descricao_secao;
                section.appendChild(desc);
            }

            if (categoria.tabela) {
                const table = document.createElement('table');
                table.className = 'tabela-precos';
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `<th>PRATO</th>`;
                categoria.tabela.colunas.forEach(col => {
                    headerRow.innerHTML += `<th>${col}</th>`;
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                categoria.tabela.itens.forEach(item => {
                    const row = document.createElement('tr');
                    let tds = `<td class="nome-prato">${item.nome}</td>`;
                    item.precos.forEach(p => {
                        tds += `<td class="preco-col">${formatarMoeda(p)}</td>`;
                    });
                    row.innerHTML = tds;
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                section.appendChild(table);

                if (categoria.extras) {
                    const listaExtras = document.createElement('ul');
                    listaExtras.className = 'itens-lista';
                    listaExtras.style.marginTop = '15px';
                    categoria.extras.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                             <div class="item-linha">
                                <span class="item-nome" style="white-space: normal;">${item.nome}</span>
                                <span class="item-dots"></span>
                                <span class="item-preco">${formatarMoeda(item.preco)}</span>
                            </div>
                        `;
                        listaExtras.appendChild(li);
                    });
                    section.appendChild(listaExtras);
                }
            } else {
                const lista = document.createElement('ul');
                lista.className = 'itens-lista';

                categoria.itens.forEach(item => {
                    const li = document.createElement('li');
                    const preco = item.preco ? formatarMoeda(item.preco) : item.preco_texto;
                    li.innerHTML = `
                        <div class="item-linha">
                            <span class="item-nome">${item.nome}</span>
                            <span class="item-dots"></span>
                            <span class="item-preco">${preco || ''}</span>
                        </div>
                        ${item.descricao ? `<p class="item-descricao">${item.descricao}</p>` : ''}
                    `;
                    lista.appendChild(li);
                });
                section.appendChild(lista);
            }

            if (categoria.imagem_fim) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'imagem-ilustrativa-container';
                const img = document.createElement('img');
                img.src = categoria.imagem_fim;
                img.className = 'imagem-ilustrativa';
                imgContainer.appendChild(img);
                section.appendChild(imgContainer);
            }

            // Distribuição Lógica
            const destino = mapaColunas[categoria.id];

            // Tratamento Especial para Pratos Kids (Armazena ref)
            if (categoria.tipo === 'destaque_kids') {
                const kidsContainer = document.createElement('div');
                kidsContainer.className = 'kids-container';

                const tituloKids = document.createElement('h2');
                tituloKids.className = 'titulo-kids';
                tituloKids.textContent = categoria.titulo;
                kidsContainer.appendChild(tituloKids);

                categoria.itens.forEach(item => {
                    const desc = document.createElement('p');
                    desc.className = 'desc-kids';
                    desc.innerText = item.descricao;
                    kidsContainer.appendChild(desc);

                    const preco = document.createElement('p');
                    preco.className = 'preco-kids';
                    preco.textContent = formatarMoeda(item.preco);
                    kidsContainer.appendChild(preco);
                });

                kidsContainerRef = kidsContainer;
                return; // Não insere ainda
            }

            if (destino === 'bottom') {
                const wrapper = document.createElement('div');
                wrapper.className = 'coluna-bottom';
                wrapper.appendChild(section);
                bottomContent.appendChild(wrapper);
            } else if (destino === 'esquerda') {
                colEsquerda.appendChild(section);
            } else {
                colDireita.appendChild(section);
            }
        });

        // Montagem Final
        mainGrid.appendChild(colEsquerda);
        mainGrid.appendChild(colDireita);
        contentContainer.appendChild(mainGrid);

        // 1. Grid Inferior (Bebidas/Drinks)
        if (bottomContent.children.length > 0) {
            bottomSection.appendChild(bottomContent);
        }

        // 2. Kids (Agora sim, DEPOIS das bebidas)
        if (kidsContainerRef) {
            bottomSection.appendChild(kidsContainerRef);
        }

        // 3. Informações Finais (Por último)
        if (dados.informacoes_finais) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'informacoes-finais-container';

            // Instagram
            if (dados.informacoes_finais.instagram) {
                const insta = document.createElement('p');
                insta.className = 'insta-text';
                insta.innerHTML = `<i class="fab fa-instagram"></i> ${dados.informacoes_finais.instagram}`;
                infoDiv.appendChild(insta);
            }

            const listaAvisos = document.createElement('ul');
            listaAvisos.className = 'lista-avisos-finais';
            dados.informacoes_finais.avisos.forEach(aviso => {
                const li = document.createElement('li');
                li.textContent = aviso;
                listaAvisos.appendChild(li);
            });
            infoDiv.appendChild(listaAvisos);

            bottomSection.appendChild(infoDiv);
        }

        // Adiciona bottomSection se tiver algo
        if (bottomSection.children.length > 0) {
            contentContainer.appendChild(bottomSection);
        }
    };

    fetch('menu.json')
        .then(res => res.json())
        .then(data => renderizarCardapio(data))
        .catch(err => console.error(err));
});
