/* ============================================================
   CODEL SYSTEM - Dados da Aplicação
   Arquivo: js/data.js

   Centraliza todos os dados estáticos e de estado global:
   pontos de coleta (PEVs), motoristas, histórico e configurações.
   ============================================================ */

/* ── Ponto Base (Garagem / Central) ── */
const BASE_LOCATION = { x: 50, y: 50 };

/* ── Estado Global ── */
let collectionHistory = [];
let alertNotifications = [];
let appSettings = {
    autoDispatch:      true,   // Despacho automático ao atingir 70%
    routeOptimization: true,   // Otimização do trajeto pelo algoritmo
};
let currentTheme = 'dark';

/* ── Pontos de Entrega de Vidros (PEVs) ── */
const collectionPoints = [
    { id: 1, name: "PEV Santa Mônica", x: 82, y: 25, fillLevel: 15, curveFactor: 15,  alertSent: false },
    { id: 2, name: "PEV Tibery",       x: 75, y: 70, fillLevel: 45, curveFactor: -10, alertSent: false },
    { id: 3, name: "PEV Luizote",      x: 15, y: 35, fillLevel: 10, curveFactor: 12,  alertSent: false },
    { id: 4, name: "PEV Mansour",      x: 22, y: 78, fillLevel: 65, curveFactor: -8,  alertSent: false },
    { id: 5, name: "PEV Canaã",        x: 52, y: 88, fillLevel: 88, curveFactor: 5,   alertSent: false },
];

/* ── Motoristas ── */
const drivers = [
    {
        id: 1,
        fullName:   "Carlos Eduardo Silva",
        callSign:   "Carlos",
        age:        44,
        email:      "carlos.silva@codel.com",
        employeeId: "USR-CDL-101",
        licensePlate: "ABC-1234",
        phone:      "+55 (34) 99912-1122",
        markerColor: "#22c55e",
        // Estado de simulação
        assignedPointId: -1,
        routeProgress:   0,
        routeDirection:  1,
        hasCollected:    false,
    },
    {
        id: 2,
        fullName:   "João Pedro Santos",
        callSign:   "João",
        age:        31,
        email:      "joao.santos@codel.com",
        employeeId: "USR-CDL-102",
        licensePlate: "DEF-5678",
        phone:      "+55 (34) 98822-4455",
        markerColor: "#4ade80",
        assignedPointId: -1,
        routeProgress:   0,
        routeDirection:  1,
        hasCollected:    false,
    },
    {
        id: 3,
        fullName:   "Ana Paula Mendes",
        callSign:   "Ana",
        age:        29,
        email:      "ana.mendes@codel.com",
        employeeId: "USR-CDL-103",
        licensePlate: "GHI-9012",
        phone:      "+55 (34) 99144-7788",
        markerColor: "#84cc16",
        assignedPointId: -1,
        routeProgress:   0,
        routeDirection:  1,
        hasCollected:    false,
    },
];