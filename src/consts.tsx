const HubHost = window.__RUNTIME_CONFIG__.REACT_APP_HUB_HOST.trim() ? window.__RUNTIME_CONFIG__.REACT_APP_HUB_HOST.trim() : window.location.hostname;
const HubPort = window.__RUNTIME_CONFIG__.REACT_APP_HUB_PORT.trim() ? window.__RUNTIME_CONFIG__.REACT_APP_HUB_PORT.trim() : "8898";
const HubBaseUrl = `http://${HubHost}:${HubPort}`
const HubWsUrl = `ws://${HubHost}:${HubPort}/ws`
const HubScriptLogsWsUrl = `ws://${HubHost}:${HubPort}/scripts/logs`

export { HubHost, HubPort, HubBaseUrl, HubWsUrl, HubScriptLogsWsUrl }
