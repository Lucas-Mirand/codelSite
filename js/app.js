/* ============================================================
   CODEL SYSTEM - Inicialização da Aplicação
   Arquivo: js/app.js

   Ponto de entrada principal:
   - Inicializa o mapa
   - Inicia o loop de simulação
   - Inicia o relógio em tempo real
   ============================================================ */

/**
 * Inicia o relógio digital exibido no cabeçalho.
 * Atualiza a cada segundo.
 */
function startRealtimeClock() {
    const clockElement = document.getElementById('realtime-clock');
    const updateClock  = () => {
        clockElement.textContent = new Date().toLocaleTimeString('pt-BR');
    };
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Ponto de entrada — executado após o carregamento completo do DOM.
 */
window.addEventListener('load', () => {
    initializeMap();         // Renderiza o mapa SVG (js/map.js)
    runSimulationLoop();     // Inicia a simulação em tempo real (js/map.js)
    startRealtimeClock();    // Inicia o relógio no header
});
