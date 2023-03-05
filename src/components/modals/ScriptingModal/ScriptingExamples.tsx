const SCRIPT_EMPTY = `// Define your global variables here
// var example = 0;

function onItemCaptured(data) {
  // Your code goes here
}

function onPacketCaptured(info) {
  // Your code goes here
}

function onItemQueried(data) {
  // Your code goes here
}

// Schedule your jobs here
// jobs.schedule("example-job", "*/5 * * * * *", exampleJob)
`;

const SCRIPT_WEBHOOK = `// Call a Webhook For Each Health Check

function onItemCaptured(data) {
  console.log(data.request.path);
  if (data.request.path === "/health")
    vendor.webhook("POST", env.WEBHOOK_URL, data);
}
`;

const SCRIPT_SLACK = `// Report To a Slack Channel If Response Status Code is 500

function onItemCaptured(data) {
  if (data.response.status === 500)
    vendor.slack(
      env.SLACK_WEBHOOK,
      "Server-side Error",
      JSON.stringify(data),
      "#ff0000"
    );
}
`;

const SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN = `// Log Total Captured Packet and KB Every Minute

var packetCount = 0;
var totalKB = 0;

function onPacketCaptured(info) {
  packetCount++;
  totalKB += info.length / 1000;
}

function logPacketCountTotalBytes() {
  console.log("Captured packet count per minute:", packetCount);
  packetCount = 0;
  console.log("Total KB captured per minute:", totalKB);
  totalKB = 0;
}

jobs.schedule("log-packet-count-total-bytes", "0 */1 * * * *", logPacketCountTotalBytes);
`;

const SCRIPT_MONITORING_PASS_HTTP = `// Monitoring: Pass HTTP Traffic, Fail Anything Else

function onItemQueried(data) {
  if (data.protocol.name == "http")
    return test.pass(data)
  else
    return test.fail(data)
}
`;

const SCRIPT_PRINT_ENV = `// Print Environment Variables

console.log(JSON.stringify(env));
`

const SCRIPT_INFLUXDB = `// Aggregate the HTTP Status Sodes and Push Them to InfluxDB Every Minute

var statusCodes = {};

function onItemCaptured(data) {
  if (data.protocol.name !== "http") return;

  if (statusCodes.hasOwnProperty(data.response.status)) {
    statusCodes[data.response.status]++;
  } else {
    statusCodes[data.response.status] = 1;
  }
}

function pushStatusCodesToInfluxDB() {
  console.log("Status Codes:", JSON.stringify(statusCodes))

  vendor.influxdb(
    env.INFLUXDB_URL,
    env.INFLUXDB_TOKEN,
    "Status Codes",
    env.INFLUXDB_ORGANIZATION,
    env.INFLUXDB_BUCKET,
    statusCodes
  );

  statusCodes = {};
}

jobs.schedule("push-status-codes-to-influxdb", "0 */1 * * * *", pushStatusCodesToInfluxDB);
`

const SCRIPT_S3 = `// Upload PCAP File of a Stream to an AWS S3 Bucket If Response Status Code is 500

function onItemCaptured(data) {
  if (data.response.status === 500) {
    // Get PCAP file path of the TCP/UDP stream
    var pcapPath = pcap.path(data.stream);

    // Dump the name resolution history into a file
    var nameResolutionHistory = pcap.nameResolutionHistory();
    var nameResolutionHistoryPath = "name_resolution_history.json";
    file.write(
      nameResolutionHistoryPath,
      JSON.stringify(nameResolutionHistory)
    );

    // Upload PCAP file to S3 bucket
    vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      pcapPath
    );
    console.log("Uploaded PCAP to S3:", pcapPath);

    // Upload name resolution history to S3 bucket
    vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      nameResolutionHistoryPath
    );
    console.log("Uploaded name resolution history to S3:", nameResolutionHistoryPath);

    // Clean up the temporary files
    file.delete(nameResolutionHistoryPath);
  }
}
`;

const SCRIPT_S3_SNAPSHOT = `// Upload a PCAP Snapshot to an AWS S3 Bucket If Response Status Code is 500

function onItemCaptured(data) {
  if (data.response.status === 500) {
    // Create a temporary directory
    var dir = file.mkdirTemp("snapshot");

    // Create the PCAP snapshot in temp directory
    pcap.snapshot(dir);

    // Dump the name resolution history into a file
    var nameResolutionHistory = pcap.nameResolutionHistory();
    file.write(
      dir + "/name_resolution_history.json",
      JSON.stringify(nameResolutionHistory)
    );

    // Create an archive from the directory
    var tarFile = file.tar(dir)

    // Upload TAR file to S3 bucket
    vendor.s3.put(
      env.AWS_REGION,
      env.AWS_ACCESS_KEY_ID,
      env.AWS_SECRET_ACCESS_KEY,
      env.S3_BUCKET,
      tarFile
    );
    console.log("Uploaded PCAP snapshot to S3:", tarFile);

    /*
    The TAR file kubeshark_<TIMESTAMP>.tar.gz can now be downloaded from the Amazon S3 bucket.
    Use \`kubeshark tap --pcap <TAR_FILE_PATH>\` command to capture from the PCAP snapshot (.tar.gz file)
    */

    // Clean up the temporary files and directories
    file.delete(dir);
    file.delete(tarFile);
  }
}
`;

const EXAMPLE_SCRIPTS = [
  SCRIPT_EMPTY,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_PRINT_ENV,
  SCRIPT_INFLUXDB,
  SCRIPT_S3,
  SCRIPT_S3_SNAPSHOT,
]

const EXAMPLE_SCRIPT_TITLES = [
  "Empty",
  "Report To a Slack Channel If Response Status Code is 500",
  "Call a Webhook For Each Health Check",
  "Log Total Captured Packet and KB Every Minute",
  "Monitoring: Pass HTTP Traffic, Fail Anything Else",
  "Print Environment Variables",
  "Aggregate the HTTP Status Sodes and Push Them to InfluxDB Every Minute",
  "Upload PCAP File of a Stream to an AWS S3 Bucket If Response Status Code is 500",
  "Upload a PCAP Snapshot to an AWS S3 Bucket If Response Status Code is 500",
]

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = SCRIPT_EMPTY

export {
  SCRIPT_EMPTY,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_LOG_TOTAL_CAPTURED_PACKET_KB_PER_MIN,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_INFLUXDB,
  SCRIPT_S3,
  SCRIPT_S3_SNAPSHOT,
  EXAMPLE_SCRIPTS,
  EXAMPLE_SCRIPT_TITLES,
  DEFAULT_TITLE,
  DEFAULT_SCRIPT,
}
