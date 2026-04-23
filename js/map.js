/* ============================================================
   CODEL SYSTEM - Lógica do Mapa e Simulação
   Arquivo: js/map.js

   Responsável por:
   - Renderizar o mapa SVG (rotas, pontos, caminhões)
   - Executar o loop de simulação em tempo real
   ============================================================ */

/**
 * Inicializa todos os elementos SVG do mapa:
 * rotas tracejadas, pontos PEV, labels e ícones de caminhão.
 */
function initializeMap() {
    const svg = document.getElementById('map-svg');

    /* Desenhar rotas e pontos de coleta */
    collectionPoints.forEach(point => {

        /* Linha tracejada da base até o ponto */
        const routePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        routePath.setAttribute("id", `route-path-${point.id}`);
        routePath.setAttribute("d",
            `M ${BASE_LOCATION.x} ${BASE_LOCATION.y} ` +
            `Q ${(BASE_LOCATION.x + point.x) / 2 + point.curveFactor} ` +
            `${(BASE_LOCATION.y + point.y) / 2 - point.curveFactor} ` +
            `${point.x} ${point.y}`
        );
        routePath.setAttribute("fill", "none");
        routePath.setAttribute("stroke", "rgba(255,255,255,0.05)");
        routePath.setAttribute("stroke-width", "0.3");
        routePath.setAttribute("stroke-dasharray", "1,2");
        svg.appendChild(routePath);

        /* Círculo representando o ponto PEV */
        const pointDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pointDot.setAttribute("id", `point-dot-${point.id}`);
        pointDot.setAttribute("cx", point.x);
        pointDot.setAttribute("cy", point.y);
        pointDot.setAttribute("r", "1.8");
        pointDot.setAttribute("fill", "transparent");
        pointDot.setAttribute("stroke", "rgba(255,255,255,0.2)");
        pointDot.setAttribute("stroke-width", "0.3");
        svg.appendChild(pointDot);

        /* Label com o nome do ponto */
        const pointLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        pointLabel.setAttribute("x", point.x);
        pointLabel.setAttribute("y", point.y - 4);
        pointLabel.setAttribute("text-anchor", "middle");
        pointLabel.setAttribute("font-size", "2");
        pointLabel.setAttribute("fill", "rgba(128,128,128,0.5)");
        pointLabel.setAttribute("class", "map-label italic");
        pointLabel.textContent = point.name;
        svg.appendChild(pointLabel);
    });

    /* Desenhar ícone e label de cada motorista */
    drivers.forEach(driver => {
        const truckGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        truckGroup.setAttribute("id", `truck-marker-${driver.id}`);
        truckGroup.style.opacity = 0;

        /* Ícone do caminhão (path SVG) */
        const truckIcon = document.createElementNS("http://www.w3.org/2000/svg", "path");
        truckIcon.setAttribute("d", "M1,6 L1,15 L17,15 L17,10 L13,10 L13,6 L1,6 Z M17,10 L21,10 L23,12 L23,15 L21,15");
        truckIcon.setAttribute("transform", "translate(-3, -3) scale(0.3)");
        truckIcon.setAttribute("fill", driver.markerColor);
        truckGroup.appendChild(truckIcon);

        /* Nome / callsign do motorista acima do ícone */
        const driverLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        driverLabel.setAttribute("x", "0");
        driverLabel.setAttribute("y", "6");
        driverLabel.setAttribute("text-anchor", "middle");
        driverLabel.setAttribute("font-size", "2.5");
        driverLabel.setAttribute("font-weight", "900");
        driverLabel.setAttribute("fill", driver.markerColor);
        driverLabel.setAttribute("class", "map-label italic");
        driverLabel.textContent = driver.callSign;
        truckGroup.appendChild(driverLabel);

        svg.appendChild(truckGroup);
    });

    /* Marcador da base central (ponto pulsante verde) */
    const baseMarker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    baseMarker.setAttribute("cx", BASE_LOCATION.x);
    baseMarker.setAttribute("cy", BASE_LOCATION.y);
    baseMarker.setAttribute("r", "2.5");
    baseMarker.setAttribute("fill", "#22c55e");
    baseMarker.setAttribute("class", "animate-pulse");
    svg.appendChild(baseMarker);
}

/**
 * Atualiza a cor dos pontos PEV no mapa conforme o nível de preenchimento.
 * Pontos críticos (>= 70%) ficam vermelhos.
 */
function updateCollectionPointDots() {
    collectionPoints.forEach(point => {
        const dot = document.getElementById(`point-dot-${point.id}`);
        if (!dot) return;

        const isCritical = point.fillLevel >= 70;
        dot.setAttribute("fill",   isCritical ? "#ef4444" : "rgba(128,128,128,0.2)");
        dot.setAttribute("stroke", isCritical ? "#ef4444" : "rgba(128,128,128,0.3)");
    });
}

/**
 * Loop principal da simulação, chamado via requestAnimationFrame.
 * - Incrementa o nível dos PEVs aleatoriamente
 * - Dispara alertas quando necessário
 * - Move os caminhões ao longo das rotas
 */
function runSimulationLoop() {

    /* ── Atualizar nível dos PEVs ── */
    collectionPoints.forEach(point => {
        /* Incremento aleatório e esporádico */
        if (Math.random() > 0.996) {
            point.fillLevel = Math.min(100, point.fillLevel + Math.random() * 5);
        }

        /* Disparar alerta quando atingir 70% */
        if (appSettings.autoDispatch && point.fillLevel >= 70 && !point.alertSent) {
            point.alertSent = true;
            alertNotifications.unshift({
                pointName: point.name,
                fillLevel: Math.round(point.fillLevel),
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            });
            renderNotificationList();
        }

        /* Resetar alerta quando ponto estiver quase vazio */
        if (point.fillLevel < 5) {
            point.alertSent = false;
        }
    });

    /* ── Mover caminhões ── */
    drivers.forEach(driver => {

        /* Buscar um ponto crítico disponível para o motorista sem destino */
        if (driver.assignedPointId === -1) {
            const criticalPoints = collectionPoints.filter(p =>
                p.fillLevel >= 70 &&
                !drivers.some(d => d.assignedPointId === p.id)
            );
            if (criticalPoints.length > 0) {
                driver.assignedPointId = criticalPoints[0].id;
                driver.routeProgress   = 0;
                driver.routeDirection  = 1;
                driver.hasCollected    = false;
            }
        }

        const truckMarker = document.getElementById(`truck-marker-${driver.id}`);

        if (driver.assignedPointId !== -1) {
            const routePath = document.getElementById(`route-path-${driver.assignedPointId}`);
            if (!truckMarker || !routePath) return;

            truckMarker.style.opacity = 1;
            driver.routeProgress += 0.002 * driver.routeDirection;

            /* Chegou ao ponto: registrar coleta e inverter direção */
            if (driver.routeProgress >= 1 && driver.routeDirection === 1) {
                if (!driver.hasCollected) {
                    const targetPoint = collectionPoints.find(p => p.id === driver.assignedPointId);

                    /* Registrar no histórico */
                    collectionHistory.unshift({
                        id:           Date.now(),
                        driverCallSign: driver.callSign,
                        pointName:    targetPoint.name,
                        date:         new Date().toLocaleDateString('pt-BR'),
                        time:         new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    });

                    /* Zerar o nível do ponto coletado */
                    targetPoint.fillLevel = 0;
                    driver.hasCollected   = true;
                    renderCollectionHistoryTable();
                }
                driver.routeDirection = -1;

            /* Voltou à base: liberar motorista */
            } else if (driver.routeProgress <= 0 && driver.routeDirection === -1) {
                driver.assignedPointId = -1;
            }

            /* Posicionar o ícone ao longo da rota */
            const clampedProgress = Math.max(0, Math.min(driver.routeProgress, 1));
            const pathPoint = routePath.getPointAtLength(clampedProgress * routePath.getTotalLength());
            truckMarker.setAttribute("transform", `translate(${pathPoint.x}, ${pathPoint.y})`);

        } else {
            /* Motorista na base: ocultar ícone */
            if (truckMarker) truckMarker.style.opacity = 0;
        }
    });

    updateCollectionPointDots();
    requestAnimationFrame(runSimulationLoop);
}