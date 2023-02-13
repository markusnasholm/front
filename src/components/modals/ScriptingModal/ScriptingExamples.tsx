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

const SCRIPT_WEBHOOK = `// Call a Webhook For Each Health Check

function capturedItem(data) {
  console.log(data.request.path);
  if (data.request.path === "/health")
    webhook("POST", WEBHOOK_URL, data);
}
`;

const SCRIPT_SLACK = `// Report To a Slack Channel If Response Status Code is 500

function capturedItem(data) {
  if (data.response.status === 500)
    slack(SLACK_AUTH_TOKEN, SLACK_CHANNEL_ID, "Server-side Error", JSON.stringify(data), "#ff0000");
}
`;

const SCRIPT_PACKET_AND_BYTE_COUNTER = `// Packet and Byte Counter

var packetCount = 0;
var totalBytes = 0;

function capturedItem(data) {
  console.log("Captured packet count:", packetCount)
  console.log("Total bytes processed:", totalBytes)
}

function capturedPacket(info) {
  packetCount++
  totalBytes += info.length
}
`;

const SCRIPT_MONITORING_PASS_HTTP = `// Monitoring: Pass HTTP Traffic, Fail Anything Else

function queriedItem(data) {
  if (data.protocol.name == "http")
    return pass(data)
  else
    return fail(data)
}
`;

const SCRIPT_PRINT_CONSTS = `// Print Constants

console.log(CONSTS);
`

const SCRIPT_INFLUXDB = `// InfluxDB: Write a Point per Item

function capturedItem(data) {
  influxdb(
    INFLUXDB_URL,
    INFLUXDB_TOKEN,
    INFLUXDB_MEASUREMENT,
    INFLUXDB_ORGANIZATION,
    INFLUXDB_BUCKET,
    data
  );
}
`

const SCRIPT_S3 = `// Upload PCAP file to an AWS S3 Bucket If Response Status Code is 500

function capturedItem(data) {
  if (data.response.status === 500) {
    // Upload PCAP file
    s3(
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      S3_BUCKET,
      data.stream
    );

    // Upload name resolution history
    s3JSON(
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      S3_BUCKET,
      nameResolutionHistory(),
      "name_resolution_history_" + Date.now()
    );
  }
}
`;

const EXAMPLE_SCRIPTS = [
  SCRIPT_EMPTY,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_PRINT_CONSTS,
  SCRIPT_INFLUXDB,
  SCRIPT_S3,
]

const EXAMPLE_SCRIPT_TITLES = [
  "Empty",
  "Report To a Slack Channel If Response Status Code is 500",
  "Call a Webhook For Each Health Check",
  "Packet and Byte Counter",
  "Monitoring: Pass HTTP Traffic, Fail Anything Else",
  "Print Constants",
  "InfluxDB: Write a Point per Item",
  "Upload PCAP file to an AWS S3 Bucket If Response Status Code is 500",
]

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = SCRIPT_EMPTY

export {
  SCRIPT_EMPTY,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_INFLUXDB,
  SCRIPT_S3,
  EXAMPLE_SCRIPTS,
  EXAMPLE_SCRIPT_TITLES,
  DEFAULT_TITLE,
  DEFAULT_SCRIPT,
}
