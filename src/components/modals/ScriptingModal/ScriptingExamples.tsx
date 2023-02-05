const SCRIPT_EMPTY = `function capturedItem(data) {
  // Your code goes here
}

function capturedPacket(info) {
  // Your code goes here
}

function queriedItem(data) {
  // Your code goes here
}
`;

const SCRIPT_WEBHOOK = `// Webhook Example

function capturedItem(data) {
  console.log(data.Request.path);
  if (data.Request.path === "/health") {
    webhook("POST", "https://webhook.site/c06e80f5-778c-41f5-abd1-c5528db44584", data);
  }
}

function capturedPacket(info) {
  // Your code goes here
}

function queriedItem(data) {
  // Your code goes here
}
`;

const SCRIPT_PACKET_AND_BYTE_COUNTER = `// Packet and Byte Counter Example

var packetCount = 0;
var totalBytes = 0;

function capturedItem(data) {
  console.log("Captured packet count:", packetCount)
  console.log("Total bytes processed:", totalBytes)
}

function capturedPacket(info) {
  packetCount++
  totalBytes += info.Length
}

function queriedItem(data) {
  // Your code goes here
}
`;

const SCRIPT_MONITORING_PASS_HTTP = `// Monitoring: Pass HTTP Traffic, Fail Anything Else Example

var packetCount = 0;
var totalBytes = 0;

function capturedItem(data) {
  // Your code goes here
}

function capturedPacket(info) {
  // Your code goes here
}

function queriedItem(data) {
  if (data.Protocol.Name == "http")
    return pass(data)
  else
    return fail(data)
}
`;

const EXAMPLE_SCRIPTS = [
  SCRIPT_EMPTY,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
]

const EXAMPLE_SCRIPT_TITLES = [
  "Empty",
  "Webhook",
  "Packet and Byte Counter",
  "Monitoring: Pass HTTP Traffic, Fail Anything Else",
]

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = SCRIPT_EMPTY

export {
  SCRIPT_EMPTY,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
  EXAMPLE_SCRIPTS,
  EXAMPLE_SCRIPT_TITLES,
  DEFAULT_TITLE,
  DEFAULT_SCRIPT,
}
